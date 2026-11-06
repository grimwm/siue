// The page held still while a run is live (src/scroll-lock.ts): the root and a
// theme's scrolling wrapper are held and released exactly, the guards refuse
// the wheel, touch drags and scroll keys outside the game's panels, and what
// still moves the page is put back. Fake elements, so nothing needs a browser.
import { createScrollLock, isScrollKey } from '../src/scroll-lock.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

class FakeStyle {
  props = new Map<string, { v: string; p: string }>();
  getPropertyValue(k: string): string { return this.props.get(k)?.v ?? ''; }
  getPropertyPriority(k: string): string { return this.props.get(k)?.p ?? ''; }
  setProperty(k: string, v: string, p = ''): void { this.props.set(k, { v, p }); }
  removeProperty(k: string): void { this.props.delete(k); }
}

class FakeEl {
  style = new FakeStyle();
  classes = new Set<string>();
  classList = { add: (c: string) => this.classes.add(c), remove: (c: string) => this.classes.delete(c) };
  children: FakeEl[] = [];
  parent: FakeEl | null = null;
  scrollTop = 0;
  scrollLeft = 0;
  scrollHeight = 100;
  clientHeight = 100;
  clientWidth = 1000;
  overflowY = 'visible';
  paddingRight = '0px';
  tag: string;
  cls: string[];
  constructor(tag: string, cls: string[] = []) { this.tag = tag; this.cls = cls; }
  add(c: FakeEl): FakeEl { c.parent = this; this.children.push(c); return c; }
  /** Class selectors and tag names, comma-separated: all the lock asks. */
  matches(sel: string): boolean {
    return sel.split(',').map((s) => s.trim()).some((s) => (s.startsWith('.') ? this.cls.includes(s.slice(1)) : s === this.tag));
  }
  closest(sel: string): FakeEl | null {
    for (let e: FakeEl | null = this; e; e = e.parent) if (e.matches(sel)) return e;
    return null;
  }
}

type Listener = (e: Record<string, unknown>) => void;

class Target {
  on = new Map<string, Listener[]>();
  opts = new Map<string, unknown>();
  addEventListener(type: string, fn: Listener, opts?: unknown): void {
    this.on.set(type, [...(this.on.get(type) ?? []), fn]);
    this.opts.set(type, opts);
  }
  fire(type: string, e: Record<string, unknown>): void { for (const fn of this.on.get(type) ?? []) fn(e); }
}

function setup(o: { bar?: number; gutterStable?: boolean } = {}) {
  const html = new FakeEl('html');
  html.clientWidth = 1000 - (o.bar ?? 0);
  const body = html.add(new FakeEl('body'));
  const page = body.add(new FakeEl('div', ['wp-site-blocks']));
  const help = body.add(new FakeEl('div', ['cylon-help-panel']));
  help.overflowY = 'auto';
  help.scrollHeight = 900;
  const nav = body.add(new FakeEl('header', ['site-nav']));
  const doc = Object.assign(new Target(), { documentElement: html, body });
  const scrolls: { top: number; left: number; behavior: string }[] = [];
  const win = Object.assign(new Target(), {
    innerWidth: 1000,
    scrollX: 0,
    scrollY: 0,
    getComputedStyle: (el: FakeEl) => ({ overflowY: el.overflowY, paddingRight: el.paddingRight }),
    scrollTo(a: { top: number; left: number; behavior: string }) { scrolls.push(a); win.scrollX = a.left; win.scrollY = a.top; },
  });
  let live = false;
  const lock = createScrollLock({
    doc: doc as unknown as Document,
    win: win as unknown as Window,
    gutterStable: o.gutterStable ?? true,
    panels: '.cylon-help-panel, .cylon-gameover, .cylon-settings-panel',
    touchFree: '.site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel',
    live: () => live,
  });
  lock.bind();
  return { html, body, page, help, nav, doc, win, scrolls, lock, setLive: (on: boolean) => { live = on; } };
}

function event(target: unknown, more: Record<string, unknown> = {}) {
  const e = { target, defaultPrevented: false, ...more, preventDefault() { e.defaultPrevented = true; } };
  return e;
}

test('the scroll keys are the paging, Home and End, Space and the arrows, without Ctrl, Cmd or Alt', () => {
  for (const key of [' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
    assert.equal(isScrollKey({ key }), true, key);
  }
  assert.equal(isScrollKey({ key: 'Escape' }), false);
  assert.equal(isScrollKey({ key: 'r' }), false);
  assert.equal(isScrollKey({ key: 'ArrowLeft', altKey: true }), false);
  assert.equal(isScrollKey({ key: 'End', metaKey: true }), false);
  assert.equal(isScrollKey({ key: 'Home', ctrlKey: true }), false);
});

test('held, the root and a scrolling wrapper are locked with the scrollbar kept; released, every change comes off', () => {
  const s = setup({ bar: 15 });
  s.html.style.setProperty('scrollbar-gutter', 'auto');
  s.page.overflowY = 'auto';
  s.page.scrollHeight = 5000;
  s.page.scrollTop = 120;
  s.lock.hold();
  assert.equal(s.lock.held(), true);
  assert.ok(s.html.classes.has('cylon-scroll-held'));
  assert.ok(s.page.classes.has('cylon-scroll-held'));
  assert.ok(!s.help.classes.has('cylon-scroll-held'), 'the game\'s own panels keep scrolling');
  assert.deepEqual(s.html.style.props.get('scrollbar-gutter'), { v: 'stable', p: 'important' });
  s.lock.release();
  assert.equal(s.lock.held(), false);
  assert.ok(!s.html.classes.has('cylon-scroll-held'));
  assert.ok(!s.page.classes.has('cylon-scroll-held'));
  assert.deepEqual(s.html.style.props.get('scrollbar-gutter'), { v: 'auto', p: '' });
});

test('without scrollbar-gutter the body is padded by the scrollbar, and an overlay scrollbar changes nothing', () => {
  const s = setup({ bar: 17, gutterStable: false });
  s.body.paddingRight = '8px';
  s.lock.hold();
  assert.deepEqual(s.body.style.props.get('padding-right'), { v: '25px', p: 'important' });
  s.lock.release();
  assert.equal(s.body.style.props.has('padding-right'), false);
  const phone = setup({ bar: 0 });
  phone.lock.hold();
  assert.equal(phone.html.style.props.size, 0);
  assert.equal(phone.body.style.props.size, 0);
});

test('while live the wheel, touch drags and scroll keys are refused outside the panels', () => {
  const s = setup();
  s.lock.hold();
  s.setLive(true);
  assert.deepEqual(s.doc.opts.get('wheel'), { passive: false });
  assert.deepEqual(s.doc.opts.get('touchmove'), { passive: false });
  const fire = (on: Target, type: string, target: unknown, more?: Record<string, unknown>) => {
    const e = event(target, more);
    on.fire(type, e);
    return e.defaultPrevented;
  };
  assert.equal(fire(s.doc, 'wheel', s.page), true);
  assert.equal(fire(s.doc, 'wheel', s.help), false);
  assert.equal(fire(s.doc, 'touchmove', s.page), true);
  assert.equal(fire(s.doc, 'touchmove', s.nav), false);
  assert.equal(fire(s.win, 'keydown', s.body, { key: 'PageDown' }), true);
  assert.equal(fire(s.win, 'keydown', s.body, { key: ' ' }), true);
  assert.equal(fire(s.win, 'keydown', s.help, { key: 'ArrowDown' }), false, 'a panel scrolls by keys');
  assert.equal(fire(s.win, 'keydown', s.body, { key: 'Escape' }), false, 'Esc is never the lock\'s');
  assert.equal(fire(s.win, 'keydown', s.body, { key: 'End', ctrlKey: true }), false);
  const button = s.nav.add(new FakeEl('button'));
  assert.equal(fire(s.win, 'keydown', button, { key: ' ' }), false, 'Space presses a focused button');
  assert.equal(fire(s.win, 'keydown', button, { key: 'PageDown' }), true);
  const field = s.body.add(Object.assign(new FakeEl('input'), { tagName: 'INPUT', type: 'text' }));
  assert.equal(fire(s.win, 'keydown', field, { key: 'ArrowLeft' }), false);
  s.setLive(false);
  assert.equal(fire(s.doc, 'wheel', s.page), false);
  assert.equal(fire(s.win, 'keydown', s.body, { key: 'PageDown' }), false);
});

test('what still moves a held page is put back; the game\'s own move to the top is let through', () => {
  const s = setup();
  s.win.scrollY = 640;
  s.page.overflowY = 'auto';
  s.page.scrollHeight = 5000;
  s.page.scrollTop = 30;
  s.lock.hold();
  s.lock.moveTo(0, true);
  assert.deepEqual(s.scrolls.at(-1), { top: 0, left: 0, behavior: 'smooth' });
  s.win.scrollY = 300;
  s.doc.fire('scroll', event(s.doc));
  assert.equal(s.scrolls.length, 1, 'mid-move, nothing is corrected');
  s.win.fire('scrollend', event(s.win));
  s.win.scrollY = 0;
  // A focus or a theme's script scrolls the page: it goes back to where it is held.
  s.win.scrollY = 1483;
  s.doc.fire('scroll', event(s.doc));
  assert.deepEqual(s.scrolls.at(-1), { top: 0, left: 0, behavior: 'instant' });
  s.page.scrollTop = 900;
  s.doc.fire('scroll', event(s.page));
  assert.equal(s.page.scrollTop, 30);
  // A panel's own scroll is its own.
  s.help.scrollTop = 200;
  s.doc.fire('scroll', event(s.help));
  assert.equal(s.help.scrollTop, 200);
  // Released, the page scrolls freely.
  s.lock.release();
  const n = s.scrolls.length;
  s.win.scrollY = 800;
  s.doc.fire('scroll', event(s.doc));
  assert.equal(s.scrolls.length, n);
});
