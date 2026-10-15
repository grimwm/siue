// Tests for the Preact overlays in src/ui: each is rendered with sample props into
// the Node DOM stub (games/_kit/test/dom-stub.ts) and its key DOM asserted: the ids and
// classes game.css and the browser specs rely on, the title bar's cells, the
// shop's rows, and that every click reaches the callback the game passed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import fs from 'node:fs';
import path from 'node:path';
import { asElement, byId, click as clickEl, elementOf, els, fire as fireEl, installDocument, makeEl, maybeById, submit, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement, StubNode } from '../../_kit/test/dom-stub.ts';
import type { Gear, Weapon } from '../src/sim.ts';
import type { KeyHintFn } from '../src/ui/chrome.tsx';
import type { ShopEntry, ShopIcon, ShopProps } from '../src/ui/shop.tsx';
import type { LobbyMap, LobbyProps, LobbySeat } from '../src/ui/lobby.tsx';
import type { GunsProps, GunTile } from '../src/ui/guns.tsx';
import type { LogLine, LogProps } from '../src/ui/log.tsx';
import type { TutorialProps } from '../src/ui/tutorial.tsx';
import type { LeaveProps } from '../src/ui/leave.tsx';
import type { LiveRow } from '../src/games.ts';
import type { GamesView } from '../src/ui/games.tsx';

installDocument();

const UI = ['shop', 'lobby', 'guns', 'log', 'tutorial', 'leave'];
const ui = await importTsx<{
  shop: typeof import('../src/ui/shop.tsx');
  lobby: typeof import('../src/ui/lobby.tsx');
  guns: typeof import('../src/ui/guns.tsx');
  log: typeof import('../src/ui/log.tsx');
  tutorial: typeof import('../src/ui/tutorial.tsx');
  leave: typeof import('../src/ui/leave.tsx');
}>(import.meta.dirname, Object.fromEntries(UI.map(n => [n, `../src/ui/${n}.tsx`])));
// The overlays render into a DOM Element; the stub stands in for one.
const renderShop = (root: StubElement, props: ShopProps) => ui.shop.renderShop(asElement(root), props);
const renderLobby = (root: StubElement, props: LobbyProps) => ui.lobby.renderLobby(asElement(root), props);
const renderGuns = (root: StubElement, props: GunsProps) => ui.guns.renderGuns(asElement(root), props);
const renderLog = (root: StubElement, props: LogProps) => ui.log.renderLog(asElement(root), props);
const renderTutorial = (root: StubElement, props: TutorialProps) => ui.tutorial.renderTutorial(asElement(root), props);
const renderLeave = (root: StubElement, props: LeaveProps) => ui.leave.renderLeave(asElement(root), props);

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
// walk, byId and maybeById are the stub's (games/_kit/test/dom-stub.ts): elements only, which is all a
// class or id can match. byId fails, naming the id, when it is missing; maybeById is for the absent ones.
// The helpers take a node that may be missing and fail, as reading it would, when it is.
const node = (el: StubNode | undefined): StubNode => { assert.ok(el, 'no such node'); return el; };
const hasClass = (el: StubNode | undefined, name: string) => { const n = node(el); return String((n.nodeType === 1 ? n.className : '') || '').split(' ').includes(name); };
const byClass = (el: StubNode | undefined, name: string) => walk(elementOf(el)).filter(n => hasClass(n, name));
/** Child i of a node the case knows is an element, which is an element too. */
const kid = (el: StubNode | undefined, i: number): StubElement => elementOf(elementOf(el).children[i]);
/** A shop row's Preview/Buy row: the text column's fourth child, under the description. */
const actsOf = (li: StubNode | undefined) => kid(kid(li, 1), 3);
const text = (el: StubNode | undefined) => node(el).textContent;
const click = (el: StubNode | undefined) => clickEl(elementOf(el));
const fire = (el: StubNode | undefined, type: string) => fireEl(elementOf(el), type);

// The keys a game.json with the default bindings shows.
const KEYS: Record<string, string> = {
  'global:back': 'Q', 'scroll:lineDown': 'J', 'scroll:lineUp': 'K', 'scroll:pageUp': 'PgUp',
  'scroll:pageDown': 'PgDn', 'scroll:halfUp': 'Shift+K', 'scroll:halfDown': 'Shift+J',
  'shop:selUp': '▲', 'shop:selDown': '▼', 'shop:qtyDown': '◀', 'shop:qtyUp': '▶',
  'shop:buy': 'B', 'shop:preview': 'V', 'global:fire': 'Ctrl',
  'shop:buy:1': 'Enter', 'aim:barrelLeft': '◀', 'aim:barrelRight': '▶',
  'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:random': 'T',
  'global:rooms': 'O', 'global:tutorial': 'U', 'global:report': 'R', 'shop:next': 'N', 'global:gunStock': 'I',
};
const keyHint: KeyHintFn = (ctx, action, idx) => (idx ? KEYS[`${ctx}:${action}:${idx}`] : undefined) ?? KEYS[`${ctx}:${action}`] ?? '';

// ---- shop ----
/** game.json, as far as the shelf reads it. */
interface GameJson { arsenal: { ammo: Weapon[]; gear: Gear[] } }
const GAME: GameJson = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
// The shop groups each category under one heading, in first-appearance order (src/sim.ts buildArsenal).
const byCat = <T extends { cat?: string }>(rows: T[]) => { const cats = [...new Set(rows.map(r => r.cat))]; return cats.flatMap(c => rows.filter(r => r.cat === c)); };
const ammo = byCat(GAME.arsenal.ammo.filter(a => a.pack > 0));
const gear = GAME.arsenal.gear;
/** Shop rows that are not headings: the free Shell, every priced ammo pack and every trick. */
const ITEMS = 1 + ammo.length + gear.length;
/** The shelf the way main.ts lays it out: a heading per category, the free Shell under Shells. */
/** A shelf item: an ammo pack or a trick, as main.ts lists them (a row may carry a label in place of a name). */
type ShelfItem = { label?: string } & ((Weapon & { kind: 'ammo'; w: string }) | (Gear & { kind: 'gear'; g: string }));
function shelf({ sel = 0, qty = 1, cash = 600, round = 1 } = {}): ShopEntry[] { // sel -1 is the free Shell row
  const entries: ShopEntry[] = [];
  let lastCat: string | undefined = '';
  const items: ShelfItem[] = [...ammo.map(a => ({ ...a, kind: 'ammo' as const, w: a.key })), ...gear.map(g => ({ ...g, kind: 'gear' as const, g: g.key }))];
  items.forEach((it, index) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      entries.push({ kind: 'cat', name: String(it.cat) });
      if (it.kind === 'ammo' && !entries.some(e => e.kind === 'free')) {
        entries.push({ kind: 'free', weapon: 'shell', selected: sel === -1, name: 'Shell', vals: '∞ (free)', sub: 'A plain shell.', sub2: 'Always loaded, never runs out.', icon: { kind: 'ammo', w: 'shell' } });
      }
    }
    const locked = (it.minRound || 0) > round;
    entries.push({
      kind: 'item', index, name: it.name ?? it.label, vals: `($${it.price})${qty > 1 ? ` ×${qty} = $${it.price * qty}` : ''}`,
      sub: `${it.key} line one`, sub2: locked ? `Unlocks in round ${it.minRound}.` : 'Pack of 1.',
      icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w } : { kind: 'gear', g: it.g },
      selected: index === sel, locked, disabled: locked || cash < it.price * qty, qty,
      weapon: it.kind === 'ammo' ? it.w : undefined,
    });
  });
  return entries;
}
interface ShopCalls { buy: number[]; preview: string[]; next: number; leave: number; icons: [string, ShopIcon][] }
function shopProps(over: Partial<ShopProps> = {}) {
  const calls: ShopCalls = { buy: [], preview: [], next: 0, leave: 0, icons: [] };
  const props: ShopProps = {
    keyHint, title: 'Field shop', cash: 'War chest: $600', entries: shelf(), board: null,
    next: { label: 'Start round 2', keyAt: 'shop:next' }, readyLine: null, inRoom: false,
    drawIcon: (canvas, icon) => { calls.icons.push([canvas.className, icon]); },
    arsenalRev: 1,
    onBuy: i => calls.buy.push(i), onPreview: w => calls.preview.push(w), onNext: () => { calls.next++; }, onLeave: () => { calls.leave++; },
    ...over,
  };
  return { props, calls };
}
{
  const veil = makeEl('shop-veil');
  const { props, calls } = shopProps();
  renderShop(veil, props);
  const card = kid(veil, 0);
  await test('shop-card', () => { assert.ok(veil.children.length === 1 && hasClass(card, 'card') && card.getAttribute('role') === 'dialog'
    && card.getAttribute('aria-modal') === 'true' && card.getAttribute('aria-labelledby') === 'shop-title'); });
  const head = kid(card, 0);
  await test('shop-head', () => { assert.ok(text(nth(byClass(head, 'kicker'), 0)) === 'Between rounds' && text(byId(head, 'shop-title')) === 'Field shop'
    && !maybeById(head, 'help-close') && byClass(head, 'ov-x').length === 0, 'no × on the shop'); });
  const nav = byId(head, 'nav-shop');
  await test('shop-nav', () => { assert.ok(hasClass(nav, 'nav-hint') && nav.getAttribute('data-scroll-only') === undefined
    && text(nav) === '▲▼ or JK move◀▶ packsB buy · V previewPgUp/PgDn pageShift+K/Shift+J half page', text(nav)); });
  await test('shop-cash', () => { assert.ok(text(byId(card, 'shop-cash')) === 'War chest: $600' && hasClass(byId(card, 'shop-cash'), 'runstats')); });
  const list = byId(card, 'shop-list');
  await test('shop-list', () => { assert.ok(list.localName === 'ul' && hasClass(list, 'scores')); });
  const rows = list.children.filter(li => !hasClass(li, 'shop-cat'));
  await test('shop-all-items', () => { assert.ok(rows.length === ITEMS, String(rows.length)); });
  await test('shop-categories', () => { assert.ok(list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|') === 'Shells|Rollers|Beams|Tracers|Earth|Fire|Hull and fuel|Tricks', list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|')); });
  const free = elementOf(list.children.find(li => hasClass(li, 'shop-free')));
  await test('shop-shell-row-heads-the-shells', () => { assert.ok(list.children.indexOf(free) === 1 && text(nth(byClass(free, 'shop-name'), 0)) === 'Shell ∞ (free)'
    && free.children.length === 2, text(nth(byClass(free, 'shop-name'), 0))); });
  await test('shop-free-row-has-preview-only', () => { assert.ok(nth(byClass(free, 'acts'), 0).children.map(text).join() === 'Preview V'); });
  const items = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'));
  const first = elementOf(items[0]);
  await test('shop-row-shape', () => { assert.ok(first.children.length === 2 && kid(first, 0).localName === 'canvas' && kid(first, 0).className === 'shop-icon'
    && kid(first, 0).getAttribute('aria-hidden') === 'true' && hasClass(kid(first, 1), 'shop-item')
    && hasClass(actsOf(first), 'acts')); });
  const [name, sub, sub2] = kid(first, 1).children;
  await test('shop-row-lines', () => { assert.ok(hasClass(name, 'shop-name') && hasClass(sub, 'shop-sub') && hasClass(sub2, 'shop-sub')); });
  await test('shop-row-name-numbers-in-own-colour', () => { assert.ok(text(name) === `1. ${nth(GAME.arsenal.ammo.filter(a => a.pack > 0), 0).name} ($${nth(ammo, 0).price})`
    && byClass(name, 'shop-vals').map(text).join() === `($${nth(ammo, 0).price})`, text(name)); });
  await test('shop-selection', () => { assert.ok(first.className === 'sel' && items.filter(li => hasClass(li, 'sel')).length === 1
    && items.slice(1).every(li => elementOf(li).className === ''), items.map(li => elementOf(li).className).join()); });
  const acts = actsOf(first).children;
  await test('shop-buy-and-preview-buttons', () => { assert.ok(acts.length === 2 && text(acts[0]) === 'Preview V' && text(acts[1]) === 'Buy B'
    && acts.every(b => elementOf(b).localName === 'button' && elementOf(b).getAttribute('type') === 'button') && hasClass(kid(acts[0], 1), 'key')
    && kid(acts[0], 1).getAttribute('data-keyhint') === 'shop:preview'
    && kid(acts[0], 1).localName === 'kbd' && kid(acts[0], 1).getAttribute('aria-hidden') === 'true', acts.map(text).join('|')); });
  const gearRow = items[items.length - 1];
  await test('shop-gear-row-has-no-preview', () => { assert.ok(actsOf(gearRow).children.length === 1 && /^Buy /.test(text(kid(actsOf(gearRow), 0)))); });
  const locked = items.find(li => /^\d+\. NUKE/.test(text(nth(byClass(li, 'shop-name'), 0))));
  const lockedBtn = kid(actsOf(locked), 1);
  await test('shop-locked-row', () => { assert.ok(text(lockedBtn) === 'Locked' && lockedBtn.disabled === true && /Unlocks in round 4/.test(text(kid(kid(locked, 1), 2))), text(lockedBtn)); });
  await test('shop-icons-drawn-once-per-row', () => { assert.ok(calls.icons.length === ITEMS && calls.icons.every(([cls]) => cls === 'shop-icon')
    && calls.icons.filter(([, i]) => i.kind === 'gear').length === gear.length, String(calls.icons.length)); });
  // Icons are painted when a row first appears and when the arsenal changes, not on every redraw.
  const painted = calls.icons.length;
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }) });
  await test('shop-redraw-does-not-repaint-icons', () => { assert.ok(calls.icons.length === painted, String(calls.icons.length)); });
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }), arsenalRev: 2 });
  await test('shop-new-arsenal-repaints-icons', () => { assert.ok(calls.icons.length === painted + ITEMS, String(calls.icons.length - painted)); });
  renderShop(veil, { ...props, entries: shelf() });
  // Buttons report to the game.
  click(acts[1]);
  click(acts[0]);
  click(kid(actsOf(free), 0));
  click(kid(actsOf(gearRow), 0));
  await test('shop-clicks-reach-the-game', () => { assert.ok(calls.buy.join() === `0,${ammo.length + gear.length - 1}` && calls.preview.join() === `${nth(ammo, 0).key},shell`, `${calls.buy}|${calls.preview}`); });
  // A Buy click drops the button's focus, so Enter later buys the selected row and not the one last clicked.
  await test('shop-buy-click-drops-focus', () => { assert.ok((() => {
    let blurred = 0;
    const btn = kid(actsOf(free), 0);
    const real = btn.blur; btn.blur = () => { blurred++; };
    click(btn);
    btn.blur = real;
    return blurred === 1;
  })()); });
  // Start button: a plain label outside a room, and no ready line or Leave button.
  const next = byId(card, 'shop-next');
  const readyLine = byId(card, 'shop-ready');
  const leave = byId(card, 'shop-leave');
  await test('shop-start-button-solo', () => { assert.ok(text(next) === 'Start round 2 N' && hasClass(next, 'btn-primary') && next.getAttribute('aria-pressed') === undefined
    && readyLine.hidden === true && leave.hidden === true && hasClass(leave, 'btn-leave')); });
  click(next);
  click(leave);
  await test('shop-start-and-leave-reach-the-game', () => { assert.ok(calls.next === 1 && calls.leave === 1); });

  // A room: the Ready toggle reads Ready / Ready ✓ with aria-pressed, a line counts who is ready.
  renderShop(veil, shopProps({ next: { label: 'Ready', keyAt: 'shop:next', pressed: false }, readyLine: '0/2 ready · shop closes in 1:30 · ABC  DEF', inRoom: true }).props);
  await test('shop-ready-toggle-idle', () => { assert.ok(text(next) === 'Ready N' && next.getAttribute('aria-pressed') === 'false'
    && readyLine.hidden === false && text(readyLine) === '0/2 ready · shop closes in 1:30 · ABC  DEF' && leave.hidden === false, `${text(next)}|${next.getAttribute('aria-pressed')}|${readyLine.hidden}`); });
  renderShop(veil, shopProps({ next: { label: 'Ready ✓', keyAt: 'shop:next', pressed: true }, readyLine: '1/2 ready · ABC ✓  DEF', inRoom: true }).props);
  await test('shop-ready-toggle-pressed', () => { assert.ok(text(next) === 'Ready ✓ N' && next.getAttribute('aria-pressed') === 'true' && text(readyLine) === '1/2 ready · ABC ✓  DEF'); });
  await test('shop-redraw-keeps-nodes', () => { assert.ok(kid(veil, 0) === card && byId(card, 'shop-next') === next && byId(card, 'shop-list') === list
    && list.children.filter(li => !hasClass(li, 'shop-cat')).length === ITEMS && list.children.filter(li => !hasClass(li, 'shop-cat'))[2] === rows[2]); });
  // Back to solo: the toggle's aria-pressed goes away with it.
  renderShop(veil, shopProps().props);
  await test('shop-solo-again-drops-aria-pressed', () => { assert.ok(next.getAttribute('aria-pressed') === undefined && readyLine.hidden === true && leave.hidden === true); });

  // Pack counts: the bulk total shows after the price in the numbers' colour, and the button names the packs.
  renderShop(veil, shopProps({ entries: shelf({ qty: 3, sel: 2 }) }).props);
  const bulk = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[2];
  await test('shop-bulk-row', () => { assert.ok(/×3 = \$/.test(text(nth(byClass(bulk, 'shop-vals'), 0))) && /^Buy ×3 B$/.test(text(nth(actsOf(bulk).children, actsOf(bulk).children.length - 1))), text(kid(kid(bulk, 1), 0)) + '|' + text(actsOf(bulk))); });
  await test('shop-cant-afford-disables-buy', () => { assert.ok((() => {
    renderShop(veil, shopProps({ entries: shelf({ cash: 50 }) }).props);
    const row = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[0];
    const btn = actsOf(row).children[actsOf(row).children.length - 1];
    return elementOf(btn).disabled === true;
  })()); });
  // The title changes with the round; the pre-match shop says so.
  renderShop(veil, shopProps({ title: 'Pre-match shop' }).props);
  await test('shop-title-follows-the-round', () => { assert.ok(text(byId(card, 'shop-title')) === 'Pre-match shop'); });
  // The highlighted row stays in view: scrolled to when the selection moves, left alone otherwise.
  // A draw into the hidden veil cannot scroll (nothing is laid out), so the
  // first draw once it shows still brings the row in: the pre-match shop
  // opened with Buckshot selected but scrolled out of sight on short screens.
  // The stub lays shop rows out 100 tall in a 300 tall list; a row is in view
  // when the list's scrollTop frames it.
  // Number(): the stub's offsetHeight and clientHeight may be missing, which fails the frame as before.
  const inView = (list: StubElement, li: StubNode | undefined) => { const row = elementOf(li); const top = row.offsetTop; return top >= list.scrollTop && top + Number(row.offsetHeight) <= list.scrollTop + Number(list.clientHeight); };
  const selIn = (list: StubElement) => list.children.find(li => hasClass(li, 'sel'));
  const fresh = makeEl('fresh-veil');
  fresh.hidden = true;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3 }) }).props);
  await test('shop-hidden-draw-does-not-scroll', () => { assert.ok(byId(fresh, 'shop-list').scrollTop === 0); });
  fresh.hidden = false;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3 }) }).props);
  await test('shop-first-draw-scrolls-to-selection', () => { assert.ok(byId(fresh, 'shop-list').scrollTop > 0 && inView(byId(fresh, 'shop-list'), selIn(byId(fresh, 'shop-list')))); });
  const keptTop = byId(fresh, 'shop-list').scrollTop;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3, qty: 2 }) }).props);
  await test('shop-redraw-same-selection-leaves-scroll', () => { assert.ok(byId(fresh, 'shop-list').scrollTop === keptTop); });
  renderShop(fresh, shopProps({ entries: shelf({ sel: 4 }) }).props);
  await test('shop-moved-selection-scrolls', () => { assert.ok(inView(byId(fresh, 'shop-list'), selIn(byId(fresh, 'shop-list')))
    && byId(fresh, 'shop-list').children.filter(li => hasClass(li, 'sel')).length === 1); });
  // The free Shell row takes the highlight like any other row.
  renderShop(fresh, shopProps({ entries: shelf({ sel: -1 }) }).props);
  const freeLi = byId(fresh, 'shop-list').children.find(li => hasClass(li, 'shop-free'));
  await test('shop-shell-row-selectable', () => { assert.ok(hasClass(freeLi, 'sel') && inView(byId(fresh, 'shop-list'), freeLi)
    && byId(fresh, 'shop-list').children.filter(li => hasClass(li, 'sel')).length === 1); });
  // A resize (the phone turning, a window drag) brings the highlighted row back
  // only when it was in view; a list scrolled away from it by hand stays put.
  const onResize: (() => void)[] = [];
  Reflect.set(globalThis, 'window', { addEventListener: (t: string, f: () => void) => { if (t === 'resize') onResize.push(f); }, removeEventListener() {} });
  const turned = makeEl('turned-veil');
  turned.hidden = false;
  renderShop(turned, shopProps({ entries: shelf({ sel: 4 }) }).props);
  Reflect.deleteProperty(globalThis, 'window');
  const tl = byId(turned, 'shop-list');
  tl.scrollTop = 0;
  fire(tl, 'scroll');
  for (const f of onResize) f();
  await test('shop-resize-keeps-a-hand-scroll', () => { assert.ok(onResize.length === 1 && tl.scrollTop === 0); });
  tl.scrollTop = elementOf(selIn(tl)).offsetTop;
  fire(tl, 'scroll');
  tl.scrollTop = 0; // the layout moved under the row, no scroll of the player's
  for (const f of onResize) f();
  await test('shop-resize-keeps-the-row-in-view', () => { assert.ok(inView(tl, selIn(tl))); });
  await test('shop-registers-ids-for-the-page', () => { assert.ok(els['shop-next'] !== undefined && els['shop-list'] !== undefined); });
}

// ---- lobby ----
const MAPS: LobbyMap[] = [
  { id: '', name: 'Random hills' },
  { id: 'canyon', name: 'Canyon 3', profile: [0.1, 0.5, 0.9] },
  { id: 'twin', name: 'Twin Hills', profile: [0.9, 0.2, 0.9] },
];
const SEATS: LobbySeat[] = [
  { human: true, name: 'abc', mode: 'human' }, { human: false, name: 'REAPER', mode: 'ai' },
  { human: false, name: 'WRAITH', mode: 'open' }, { human: true, name: 'def', mode: 'human' },
];
interface LobbyCalls {
  close: number; pick: string[]; host: string[]; join: [string, string][]; seat: [number, string][];
  copy: number; start: number; leave: number; icons: (number[] | null)[]; initials: string[];
}
/** The lobby's props as these cases give them: no drones line, and the turn time only in the cases about it. */
type LobbyCase = Omit<LobbyProps, 'drones' | 'turnSecs' | 'onTurnForm' | 'onTurnRoom'> & Partial<LobbyProps>;
function lobbyProps(over: Partial<LobbyProps> = {}) {
  const calls: LobbyCalls = { close: 0, pick: [], host: [], join: [], seat: [], copy: 0, start: 0, leave: 0, icons: [], initials: [] };
  const given: LobbyCase = {
    keyHint, onClose: () => { calls.close++; }, online: true, count: '3 / 10 rooms occupied', status: '', inRoom: false,
    maps: MAPS, mapId: '', drawMapIcon: (cv, profile) => { calls.icons.push(profile); }, mapsRev: 1, prefillCode: '',
    onPickMap: id => calls.pick.push(id), initials: 'ZED', initialsRev: 0, initialsProblem: '', onInitials: w => calls.initials.push(w),
    onHost: l => calls.host.push(l), onJoin: (c, l) => calls.join.push([c, l]),
    code: '', link: '', hills: 'Hills: Random hills', seats: [], mySeat: 0, isHost: false, seatsHint: '',
    onSeatMode: (i, m) => calls.seat.push([i, m]), onCopy: () => { calls.copy++; }, onStart: () => { calls.start++; }, onLeave: () => { calls.leave++; },
    ...over,
  };
  const props = given as LobbyProps;
  return { props, calls };
}
const attr = (el: StubNode | undefined, k: string) => elementOf(el).getAttribute(k);
const listeners = (el: StubNode | undefined, type: string) => { const e = elementOf(el); return ((e._l || {})[type] || []).length; };
{
  const veil = makeEl('lobby-veil');
  veil.hidden = false;
  const { props, calls } = lobbyProps({ status: 'Knocking…' });
  renderLobby(veil, props);
  const card = kid(veil, 0);
  await test('lobby-card', () => { assert.ok(veil.children.length === 1 && hasClass(card, 'card') && attr(card, 'role') === 'dialog'
    && attr(card, 'aria-modal') === 'true' && attr(card, 'aria-labelledby') === 'lobby-title'); });
  const head = kid(card, 0);
  await test('lobby-head', () => { assert.ok(text(nth(byClass(head, 'kicker'), 0)) === 'Squad up, no chatter' && text(byId(head, 'lobby-title')) === 'Game rooms'); });
  const x = byId(head, 'lobby-close');
  await test('lobby-close-button', () => { assert.ok(hasClass(x, 'ov-x') && attr(x, 'title') === 'Close (Q)' && text(nth(byClass(x, 'key'), 0)) === 'Q'); });
  const nav = byId(head, 'nav-lobby');
  await test('lobby-nav', () => { assert.ok(attr(nav, 'data-scroll-only') === '' && text(nav) === 'J/K linePgUp/PgDn pageShift+K/Shift+J half page', text(nav)); });
  click(x);
  await test('lobby-close-calls-back', () => { assert.ok(calls.close === 1); });
  // Out of a room: the intro, the forms and the hills; the room part is hidden.
  const intro = byId(card, 'lobby-intro'), rows = byId(card, 'lobby-rows'), room = byId(card, 'lobby-room');
  await test('lobby-out-of-room', () => { assert.ok(intro.hidden === false && rows.hidden === false && room.hidden === true
    && hasClass(intro, 'hint') && hasClass(rows, 'lobby-rows'), `${intro.hidden}|${rows.hidden}|${room.hidden}`); });
  await test('lobby-status-and-count', () => { assert.ok(text(byId(card, 'lobby-status')) === 'Knocking…' && attr(byId(card, 'lobby-status'), 'aria-live') === 'polite'
    && text(byId(card, 'lobby-count')) === '3 / 10 rooms occupied' && attr(byId(card, 'lobby-count'), 'aria-live') === 'polite'); });
  const dot = byId(card, 'net-dot');
  await test('lobby-dot', () => { assert.ok(dot.className === 'dot on' && attr(dot, 'title') === 'room server: connected'); });
  renderLobby(veil, { ...props, online: false });
  await test('lobby-dot-off', () => { assert.ok(dot.className === 'dot off' && attr(dot, 'title') === 'room server: not connected'); });
  renderLobby(veil, props);
  // The hills: Random plus a silhouette per named map, one pressed.
  const picker = byId(card, 'lobby-map-picker');
  const tiles = picker.children;
  await test('lobby-map-tiles', () => { assert.ok(hasClass(picker, 'map-picker') && attr(picker, 'role') === 'group' && tiles.length === 3
    && tiles.map(t => attr(t, 'data-map')).join('|') === '|canyon|twin' && tiles.map(t => attr(t, 'title')).join('|') === 'Random hills|Canyon 3|Twin Hills'
    && tiles.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'map-choice') && attr(t, 'type') === 'button')); });
  await test('lobby-map-tile-shape', () => { assert.ok(tiles.every(t => t.children.length === 2 && kid(t, 0).localName === 'canvas' && hasClass(kid(t, 0), 'map-icon')
    && attr(kid(t, 0), 'aria-hidden') === 'true') && text(kid(tiles[1], 1)) === 'Canyon 3'); });
  await test('lobby-map-pressed', () => { assert.ok(tiles.map(t => attr(t, 'aria-pressed')).join() === 'true,false,false', tiles.map(t => attr(t, 'aria-pressed')).join()); });
  await test('lobby-map-hidden-value', () => { assert.ok(attr(byId(card, 'lobby-map'), 'type') === 'hidden' && byId(card, 'lobby-map').value === ''); });
  await test('lobby-map-icons-drawn-once', () => { const canyon = calls.icons[1]; assert.ok(canyon, 'no second icon'); assert.ok(calls.icons.length === 3 && calls.icons[0] === null && canyon.join() === '0.1,0.5,0.9', String(calls.icons.length)); });
  renderLobby(veil, { ...props, mapId: 'canyon' });
  await test('lobby-map-pick-redraws-pressed', () => { assert.ok(picker.children.map(t => attr(t, 'aria-pressed')).join() === 'false,true,false', picker.children.map(t => attr(t, 'aria-pressed')).join()); });
  await test('lobby-map-redraw-does-not-repaint', () => { assert.ok(calls.icons.length === 3); });
  renderLobby(veil, { ...props, mapId: 'canyon', mapsRev: 2 });
  await test('lobby-map-new-maps-repaint', () => { assert.ok(calls.icons.length === 6, String(calls.icons.length)); });
  await test('lobby-map-hidden-value-follows-pick', () => { assert.ok(byId(card, 'lobby-map').value === 'canyon'); });
  click(kid(picker, 2));
  await test('lobby-map-click-reports-id', () => { assert.ok(calls.pick.join() === 'twin'); });
  // One set of initials boxes above both forms, the saved set in them; hosting
  // and joining hand over what the boxes hold.
  const initialBoxes = () => [1, 2, 3].map(n => byId(card, `lobby-initial-${n}`));
  await test('lobby-initials-boxes', () => { assert.ok(initialBoxes().every(b => b && hasClass(b, 'initial')) && initialBoxes().map(b => b.value).join('') === 'ZED'
    && !maybeById(card, 'host-initials') && !maybeById(card, 'join-initials') && attr(byId(card, 'join-code'), 'maxLength') === '4'); });
  await test('lobby-initials-before-forms', () => { assert.ok(card.children.indexOf(byId(card, 'lobby-initials')) < card.children.indexOf(rows)); });
  await test('lobby-intro-initials-set-here', () => { assert.ok(/set here or on the title card/.test(text(intro)), text(intro)); });
  const hostForm = byId(card, 'host-form');
  submit(hostForm);
  await test('lobby-host-submit', () => { assert.ok(JSON.stringify(calls.host) === '["ZED"]' && hasClass(byId(card, 'host-go'), 'btn-primary') && text(byId(card, 'host-go')) === 'Host a room', JSON.stringify(calls.host)); });
  byId(card, 'join-code').value = 'tst1';
  submit(byId(card, 'join-form'));
  await test('lobby-join-submit', () => { assert.ok(JSON.stringify(calls.join) === '[["tst1","ZED"]]', JSON.stringify(calls.join)); });
  nth(initialBoxes(), 0).value = 'q';
  fire(initialBoxes()[0], 'input');
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  submit(hostForm);
  await test('lobby-host-hands-over-half-typed', () => { assert.ok(calls.host[1] === 'Q  ', JSON.stringify(calls.host)); });
  nth(initialBoxes(), 1).value = 'x'; fire(initialBoxes()[1], 'input');
  nth(initialBoxes(), 2).value = 'y'; fire(initialBoxes()[2], 'input');
  await test('lobby-initials-report-a-full-set', () => { assert.ok(JSON.stringify(calls.initials) === '["QXY"]', JSON.stringify(calls.initials)); });
  renderLobby(veil, { ...props, initialsProblem: 'Those initials are not allowed. Pick others.' });
  await test('lobby-initials-note', () => { assert.ok(text(byId(card, 'lobby-initials-note')) === 'Those initials are not allowed. Pick others.'
    && attr(byId(card, 'lobby-initials-note'), 'role') === 'status'); });
  renderLobby(veil, { ...props, initialsRev: 1 });
  await test('lobby-initials-rev-puts-saved-back', () => { assert.ok(initialBoxes().map(b => b.value).join('') === 'ZED'); });
  // The typed code survives every redraw; an invite's code fills the code box once.
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  await test('lobby-redraw-keeps-typing', () => { assert.ok(byId(card, 'join-code').value === 'tst1'); });
  renderLobby(veil, { ...props, prefillCode: 'ZZ99' });
  await test('lobby-invite-code-prefills', () => { assert.ok(byId(card, 'join-code').value === 'ZZ99'); });
  byId(card, 'join-code').value = 'AAAA';
  renderLobby(veil, { ...props, prefillCode: 'ZZ99', status: 'x' });
  await test('lobby-invite-code-fills-once', () => { assert.ok(byId(card, 'join-code').value === 'AAAA'); });
  // The veil scrolls: a redraw puts it back where the player left it.
  veil.scrollTop = 150;
  fire(veil, 'scroll');
  veil.scrollTop = 0; // the browser's scroll anchoring moved it
  renderLobby(veil, { ...props, status: 'Hang tight.' });
  await test('lobby-redraw-keeps-scroll', () => { assert.ok(veil.scrollTop === 150, String(veil.scrollTop)); });
  veil.hidden = true;
  renderLobby(veil, props);
  veil.hidden = false;
  veil.scrollTop = 0; // a reopened veil starts at the top
  renderLobby(veil, props);
  await test('lobby-reopened-starts-at-top', () => { assert.ok(veil.scrollTop === 0, String(veil.scrollTop)); });

  // In a room: the forms go, the code, link, hills and seats show.
  const inRoom = { inRoom: true, code: 'TST1', link: 'http://x/play/?code=TST1', hills: 'Hills: Canyon 3', seats: SEATS, mySeat: 0, isHost: true, seatsHint: 'Tap a seat nobody holds.' };
  renderLobby(veil, { ...props, ...inRoom });
  await test('lobby-in-room', () => { assert.ok(intro.hidden === true && rows.hidden === true && room.hidden === false && byId(card, 'lobby-initials').hidden === true); });
  await test('lobby-room-code-and-link', () => { assert.ok(text(byId(card, 'lobby-code')) === 'TST1' && hasClass(byId(card, 'lobby-code'), 'room-code')
    && byId(card, 'join-link').value === 'http://x/play/?code=TST1' && attr(byId(card, 'join-link'), 'aria-label') === 'Invite link'
    && text(byId(card, 'lobby-hills')) === 'Hills: Canyon 3' && text(byId(card, 'seats-hint')) === 'Tap a seat nobody holds.'); });
  renderLobby(veil, { ...props, ...inRoom, code: '' });
  await test('lobby-no-code-yet', () => { assert.ok(text(byId(card, 'lobby-code')) === '····'); });
  renderLobby(veil, { ...props, ...inRoom });
  const seats = byId(card, 'lobby-seats').children;
  await test('lobby-seat-tiles', () => { assert.ok(seats.length === 4 && seats.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'seat-tile'))
    && seats.map(t => attr(t, 'data-mode')).join() === 'human,ai,open,human' && seats.map(t => attr(t, 'data-seat')).join() === '0,1,2,3'); });
  await test('lobby-seat-labels', () => { assert.ok(seats.map(t => text(nth(byClass(t, 'seat-name'), 0))).join('|') === 'ABC|AI|Open|DEF'
    && seats.map(t => text(nth(byClass(t, 'seat-cap'), 0))).join('|') === 'You · host|Tap for Open|Tap for AI|Player', seats.map(t => text(nth(byClass(t, 'seat-name'), 0)) + '/' + text(nth(byClass(t, 'seat-cap'), 0))).join('|')); });
  await test('lobby-seat-classes-and-titles', () => { assert.ok(hasClass(seats[2], 'seat-open') && !hasClass(seats[1], 'seat-open')
    && hasClass(seats[0], 'seat-fixed') && !hasClass(seats[1], 'seat-fixed') && hasClass(seats[3], 'seat-fixed')
    && seats.map(t => attr(t, 'title')).join('|') === 'Seat 1|Drone battery seat|Open seat: no tank|Seat 4'); });
  await test('lobby-host-flips-only-empty-seats', () => { assert.ok(seats.map(t => attr(t, 'aria-disabled')).join() === 'true,,,true'
    && seats.map(t => listeners(t, 'click')).join() === '0,1,1,0', seats.map(t => attr(t, 'aria-disabled')).join()); });
  click(seats[1]); click(seats[2]); click(seats[0]);
  await test('lobby-seat-click-asks-for-the-other-mode', () => { assert.ok(JSON.stringify(calls.seat) === '[[1,"open"],[2,"ai"]]', JSON.stringify(calls.seat)); });
  const start = byId(card, 'lobby-start');
  await test('lobby-host-sees-start', () => { assert.ok(!start.style.display && hasClass(start, 'btn-primary') && text(start) === 'Start match'); });
  click(start); click(byId(card, 'lobby-leave')); click(byId(card, 'copy-link'));
  await test('lobby-room-buttons-report', () => { assert.ok(calls.start === 1 && calls.leave === 1 && calls.copy === 1 && text(byId(card, 'copy-link')) === 'Copy invite'); });
  // A guest sees the same seats, read-only, and no Start.
  renderLobby(veil, { ...props, ...inRoom, isHost: false, mySeat: 3, seatsHint: 'The host decides.' });
  await test('lobby-guest-seats-read-only', () => { assert.ok(seats.map(t => attr(t, 'aria-disabled')).join() === 'true,true,true,true'
    && seats.map(t => listeners(t, 'click')).join() === '0,0,0,0' && seats.every(t => hasClass(t, 'seat-fixed')), seats.map(t => listeners(t, 'click')).join()); });
  await test('lobby-guest-caps', () => { assert.ok(seats.map(t => text(nth(byClass(t, 'seat-cap'), 0))).join('|') === 'Player · host|Drone|Nobody|You'); });
  await test('lobby-guest-has-no-start', () => { assert.ok(start.style.display === 'none'); });
  renderLobby(veil, { ...props, ...inRoom });
  await test('lobby-host-again-sees-start', () => { assert.ok(!start.style.display && seats.map(t => listeners(t, 'click')).join() === '0,1,1,0'); });
  // Back out of the room: the forms return.
  renderLobby(veil, props);
  await test('lobby-back-out', () => { assert.ok(rows.hidden === false && intro.hidden === false && room.hidden === true && byId(card, 'lobby-initials').hidden === false); });
  await test('lobby-redraw-keeps-nodes', () => { assert.ok(kid(veil, 0) === card && byId(card, 'host-form') === hostForm); });
}

// The turn time: a slider in the host form; in a room the host's slider, everyone else's label.
{
  const veil = makeEl('lobby-veil');
  const turns: { form: number[]; room: number[] } = { form: [], room: [] };
  const base: Pick<LobbyProps, 'turnSecs' | 'onTurnForm' | 'onTurnRoom'> = { turnSecs: 600, onTurnForm: s => turns.form.push(s), onTurnRoom: s => turns.room.push(s) };
  renderLobby(veil, lobbyProps(base).props);
  const form = byId(veil, 'host-form');
  const range = byId(form, 'lobby-turn');
  await test('lobby-turn-in-host-form', () => { assert.ok(!!range && attr(range, 'type') === 'range' && !!maybeById(form, 'host-go')); });
  range.value = '0';
  fire(range, 'input');
  await test('lobby-turn-reports', () => { assert.ok(turns.form.join() === '60', turns.form.join()); });
  await test('lobby-intro-turn-copy', () => { assert.ok(/from one minute to a week/.test(text(byId(veil, 'lobby-intro'))) && !/crew fires/.test(text(byId(veil, 'lobby-intro')))); });

  const hostRoom = makeEl('lobby-veil');
  renderLobby(hostRoom, lobbyProps({ ...base, inRoom: true, isHost: true, code: 'AB3D', seats: SEATS }).props);
  const roomRange = byId(hostRoom, 'room-turn');
  await test('lobby-room-turn-host', () => { assert.ok(!!roomRange && !maybeById(hostRoom, 'room-turn-label')); });
  roomRange.value = '5';
  fire(roomRange, 'input');
  await test('lobby-room-turn-reports', () => { assert.ok(turns.room.join() === '86400', turns.room.join()); });
  await test('lobby-room-close-rule', () => { assert.ok(/single connection/.test(text(byId(hostRoom, 'turn-hint'))), text(byId(hostRoom, 'turn-hint'))); });

  const guestRoom = makeEl('lobby-veil');
  renderLobby(guestRoom, lobbyProps({ ...base, inRoom: true, isHost: false, code: 'AB3D', seats: SEATS, mySeat: 3 }).props);
  await test('lobby-room-turn-guest', () => { assert.ok(!maybeById(guestRoom, 'room-turn') && text(byId(guestRoom, 'room-turn-label')) === 'Turn time: 10 min'); });
}

// Your games in the lobby when not in a room; the Turn alerts button in one.
{
  const row: LiveRow = { code: 'AB3D', gone: false, seat: 1, phase: 'lobby', round: 0, turnSecs: 120, turn: null, yourTurn: false, turnKey: null,
    turnLeft: null, shopLeft: null, players: ['ABC', 'ZED'], hostSeat: 0, turnName: null, expiresAt: 2e9, closesIn: 600 };
  let opened = '', alerted = 0;
  const g: GamesView = { rows: [row], alerts: 'off', age: 0, onOpen: c => { opened = c; }, onAlerts: () => { alerted++; } };
  const out = makeEl('lobby-veil');
  renderLobby(out, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: g }).props);
  const list = byId(out, 'lobby-games');
  await test('lobby-your-games-out-of-room', () => { assert.ok(!!list && /AB3D/.test(text(list))); });
  click(walk(list).find(n => n.localName === 'button' && /Open/.test(text(n))));
  await test('lobby-your-games-open', () => { assert.ok(opened === 'AB3D'); });
  const none = makeEl('lobby-veil');
  renderLobby(none, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: { ...g, rows: [] } }).props);
  await test('lobby-your-games-hidden-when-empty', () => { assert.ok(!maybeById(none, 'lobby-games')); });
  const inRoom = makeEl('lobby-veil');
  renderLobby(inRoom, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: g, inRoom: true, seats: SEATS }).props);
  const btn = byId(inRoom, 'room-alerts');
  await test('lobby-room-alerts-button', () => { assert.ok(!!btn && text(btn) === 'Turn alerts: off' && !maybeById(inRoom, 'lobby-games')); });
  click(btn);
  await test('lobby-room-alerts-click', () => { assert.ok(alerted === 1); });
}

// ---- weapon picker ----
function gunTiles(n = 10, loaded = 0) {
  return Array.from({ length: n }, (_, i) => ({ key: i === 0 ? 'shell' : `gun${i}`, name: i === 0 ? 'Shell' : `Gun ${i}`, title: `note ${i}`, count: i === 0 ? '∞' : `×${i}`, loaded: i === loaded, empty: false }));
}
{
  const section = makeEl('gun-overlay');
  section.hidden = false;
  const calls: { close: number; pick: string[]; icons: string[]; toggle: number } = { close: 0, pick: [], icons: [], toggle: 0 };
  const gp = (over: Partial<GunsProps> = {}): GunsProps => ({
    keyHint, onClose: () => { calls.close++; }, tiles: gunTiles(), cursor: 0, drawIcon: (cv, w) => { calls.icons.push(w); }, arsenalRev: 1,
    inStockOnly: false, onToggleStock: () => { calls.toggle++; },
    onPick: w => calls.pick.push(w), ...over,
  });
  delete globalThis.__scrolledTo;
  renderGuns(section, gp());
  const head = kid(section, 0), grid = kid(section, 1);
  await test('guns-head-and-grid', () => { assert.ok(hasClass(head, 'ov-head') && text(byId(head, 'gun-h')) === 'Weapons' && byId(head, 'gun-close') && grid.id === 'gun-grid'
    && hasClass(grid, 'gun-grid') && attr(grid, 'role') === 'group' && attr(grid, 'aria-label') === 'All weapons'); });
  const nav = byId(head, 'nav-gun');
  await test('guns-nav', () => { assert.ok(hasClass(nav, 'nav-hint') && attr(nav, 'data-scroll-only') === undefined && text(nav) === '◀▶▲▼ or JK moveEnter loads1-9 load that tile', text(nav)); });
  click(byId(head, 'gun-close'));
  await test('guns-close-calls-back', () => { assert.ok(calls.close === 1); });
  const tiles = grid.children;
  await test('guns-tiles', () => { assert.ok(tiles.length === 10 && tiles.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'gun-choice') && attr(t, 'type') === 'button')
    && tiles.map(t => attr(t, 'title')).slice(0, 2).join('|') === 'note 0|note 1'); });
  await test('guns-tile-text-and-numbers', () => { assert.ok(text(kid(tiles[0], 1)) === '1. Shell' && text(kid(tiles[8], 1)) === '9. Gun 8' && text(kid(tiles[9], 1)) === 'Gun 9'
    && text(kid(tiles[0], 2)) === '∞' && text(kid(tiles[3], 2)) === '×3' && hasClass(kid(tiles[3], 2), 'gun-count'), tiles.map(t => text(kid(t, 1))).join('|')); });
  await test('guns-loaded-gun-is-pressed', () => { assert.ok(tiles.map(t => attr(t, 'aria-pressed')).join() === 'true,false,false,false,false,false,false,false,false,false'); });
  await test('guns-cursor-class', () => { assert.ok(tiles.filter(t => hasClass(t, 'cursor')).length === 1 && hasClass(tiles[0], 'cursor')); });
  await test('guns-icons-drawn-once-per-tile', () => { assert.ok(calls.icons.length === 10 && tiles.every(t => kid(t, 0).localName === 'canvas' && attr(kid(t, 0), 'aria-hidden') === 'true')); });
  click(tiles[4]);
  await test('guns-click-reports-weapon', () => { assert.ok(calls.pick.join() === 'gun4'); });
  await test('guns-first-draw-scrolls-cursor-into-view', () => { assert.ok(globalThis.__scrolledTo && hasClass(globalThis.__scrolledTo, 'cursor')); });
  // The cursor moves: the tile scrolls into view. A redraw that leaves it: no scroll.
  delete globalThis.__scrolledTo;
  renderGuns(section, gp({ cursor: 5 }));
  await test('guns-cursor-moves', () => { assert.ok(tiles.filter(t => hasClass(t, 'cursor')).length === 1 && hasClass(tiles[5], 'cursor') && hasClass(globalThis.__scrolledTo ?? makeEl(''), 'cursor')); });
  delete globalThis.__scrolledTo;
  renderGuns(section, gp({ cursor: 5, tiles: gunTiles(10, 2) }));
  await test('guns-redraw-same-cursor-leaves-scroll', () => { assert.ok(globalThis.__scrolledTo === undefined && attr(tiles[2], 'aria-pressed') === 'true' && attr(tiles[0], 'aria-pressed') === 'false'); });
  section.scrollTop = 70;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderGuns(section, gp({ cursor: 5, tiles: gunTiles(10, 3) }));
  await test('guns-redraw-keeps-scroll', () => { assert.ok(section.scrollTop === 70, String(section.scrollTop)); });
  // A smaller rack drops tiles and keeps the rest of the nodes.
  renderGuns(section, gp({ cursor: 1, tiles: gunTiles(4) }));
  await test('guns-smaller-rack', () => { assert.ok(grid.children.length === 4 && kid(grid, 1) === tiles[1] && calls.icons.length === 10); });
  renderGuns(section, gp({ cursor: 1, tiles: gunTiles(4), arsenalRev: 2 }));
  await test('guns-new-arsenal-repaints', () => { assert.ok(calls.icons.length === 14, String(calls.icons.length)); });
}

// The weapon picker's toggle and its empty tiles.
{
  const section = makeEl('gun-overlay-2');
  section.hidden = false;
  const calls: { pick: string[]; toggle: number } = { pick: [], toggle: 0 };
  const gp = (over: Partial<GunsProps> = {}): GunsProps => ({
    keyHint, onClose: () => {}, tiles: gunTiles(), cursor: 0, drawIcon: () => {}, arsenalRev: 1,
    inStockOnly: false, onToggleStock: () => { calls.toggle++; }, onPick: w => calls.pick.push(w), ...over,
  });
  renderGuns(section, gp());
  const head = kid(section, 0), grid = kid(section, 1);
  const tools = walk(head).find(n => hasClass(n, 'ov-tools'));
  // Every gun, or only those in stock, with its key chip.
  const stock = byId(elementOf(tools), 'gun-stock');
  await test('guns-stock-toggle', () => { assert.ok(hasClass(head, 'has-tools') && !!tools && stock.localName === 'button' && attr(stock, 'type') === 'button'
    && text(stock) === 'Show: All I' && attr(stock.children[stock.children.length - 1], 'data-keyhint') === 'global:gunStock', text(stock)); });
  click(stock);
  await test('guns-stock-toggle-reports', () => { assert.ok(calls.toggle === 1); });
  renderGuns(section, gp({ inStockOnly: true }));
  await test('guns-stock-toggle-in-stock', () => { assert.ok(text(stock) === 'Show: In stock I' && attr(grid, 'aria-label') === 'Weapons in stock', text(stock)); });
  // None in stock: greyed (aria-disabled) but still a button, and a click still reports (the game says why not).
  renderGuns(section, gp({ tiles: gunTiles().map((t, i) => (i === 2 ? { ...t, count: '×0', empty: true } : t)) }));
  const emptyTile = kid(grid, 2);
  await test('guns-empty-tile', () => { assert.ok(attr(emptyTile, 'aria-disabled') === 'true' && emptyTile.disabled !== true && attr(kid(grid, 1), 'aria-disabled') === undefined
    && /None in stock/.test(String(attr(emptyTile, 'title'))), attr(emptyTile, 'aria-disabled')); });
  click(emptyTile);
  await test('guns-empty-tile-click-reports', () => { assert.ok(calls.pick.join() === 'gun2'); });
}

// ---- leave question ----
{
  const veil = makeEl('leave-veil');
  veil.hidden = false;
  const calls = { stay: 0, leave: 0 };
  renderLeave(veil, { keyHint, title: 'Leave this room?', text: 'The battery takes your seat.', onStay: () => { calls.stay++; }, onLeave: () => { calls.leave++; } });
  const card = kid(veil, 0);
  await test('leave-card', () => { assert.ok(hasClass(card, 'card') && card.getAttribute('role') === 'alertdialog' && attr(card, 'aria-modal') === 'true'
    && attr(card, 'aria-labelledby') === 'leave-title' && attr(card, 'aria-describedby') === 'leave-text'); });
  await test('leave-head-and-text', () => { assert.ok(hasClass(kid(card, 0), 'ov-head') && text(byId(card, 'leave-title')) === 'Leave this room?'
    && text(byId(card, 'leave-text')) === 'The battery takes your seat.'); });
  const stay = byId(card, 'leave-stay');
  const go = byId(card, 'leave-go');
  await test('leave-buttons', () => { assert.ok(hasClass(stay, 'btn-primary') && hasClass(go, 'btn-leave') && text(go) === 'Leave room'
    && text(stay) === 'Stay in the match Q' && byClass(stay, 'key').length === 1, text(stay)); });
  click(stay);
  await test('leave-stay-calls-back', () => { assert.ok(calls.stay === 1 && calls.leave === 0); });
  click(go);
  await test('leave-go-calls-back', () => { assert.ok(calls.leave === 1 && calls.stay === 1); });
  await test('leave-no-step-out-without-a-handler', () => { assert.ok(!maybeById(card, 'leave-step')); });
}
// Step out keeps the seat: the veil offers it when the game passes onStepOut.
{
  const veil = makeEl('leave-veil');
  veil.hidden = false;
  const calls = { stay: 0, leave: 0, step: 0 };
  renderLeave(veil, {
    keyHint, title: 'Leave this room?', text: 'Step out keeps your seat; Your games brings you back.',
    onStay: () => { calls.stay++; }, onLeave: () => { calls.leave++; }, onStepOut: () => { calls.step++; },
  });
  const card = kid(veil, 0);
  const step = byId(card, 'leave-step');
  await test('leave-step-out-button', () => { assert.ok(!!step && text(step) === 'Step out' && /seat/.test(text(byId(card, 'leave-text')))); });
  click(step);
  await test('leave-step-out-calls-back', () => { assert.ok(calls.step === 1 && calls.leave === 0 && calls.stay === 0); });
}

// ---- radio log ----
{
  const section = makeEl('log-overlay');
  section.hidden = false;
  section.scrollHeight = 500;
  let closed = 0;
  const line = (id: number, tone?: string): LogLine => ({ id, text: `line ${id}`, tone });
  const lp = (lines: LogLine[]): LogProps => ({ keyHint, onClose: () => { closed++; }, lines });
  renderLog(section, lp([line(1), line(2, 'info'), line(3, 'good'), line(4, 'bad')]));
  const head = kid(section, 0), ol = kid(section, 1);
  await test('log-shape', () => { assert.ok(hasClass(head, 'ov-head') && text(byId(head, 'log-h')) === 'Radio log' && byId(head, 'log-close') && attr(byId(head, 'nav-log'), 'data-scroll-only') === ''
    && ol.id === 'log' && ol.localName === 'ol' && hasClass(ol, 'log') && hasClass(ol, 'log-transparent') && attr(ol, 'aria-live') === 'polite'); });
  click(byId(head, 'log-close'));
  await test('log-close-calls-back', () => { assert.ok(closed === 1); });
  await test('log-lines', () => { assert.ok(ol.children.length === 4 && ol.children.map(li => elementOf(li).className).join() === ',info,good,bad' && text(kid(ol, 2)) === 'line 3'); });
  await test('log-follows-the-newest-line', () => { assert.ok(section.scrollTop === 500, String(section.scrollTop)); });
  // A reader who scrolled up stays put while nothing new arrives.
  section.scrollTop = 120;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderLog(section, lp([line(1), line(2, 'info'), line(3, 'good'), line(4, 'bad')]));
  await test('log-redraw-keeps-the-readers-place', () => { assert.ok(section.scrollTop === 120, String(section.scrollTop)); });
  // A new line, and the oldest trimmed: the rest keep their rows and the panel follows.
  const kept = kid(ol, 2);
  renderLog(section, lp([line(2, 'info'), line(3, 'good'), line(4, 'bad'), line(5)]));
  await test('log-trim-keeps-rows', () => { assert.ok(ol.children.length === 4 && kid(ol, 1) === kept && text(kid(ol, 3)) === 'line 5' && text(kid(ol, 0)) === 'line 2'); });
  await test('log-new-line-scrolls-to-bottom', () => { assert.ok(section.scrollTop === 500, String(section.scrollTop)); });
}

// ---- tutorial coach marks ----
{
  const section = makeEl('tutorial-overlay');
  let skipped = 0, nexted = 0;
  const step = { id: 'barrel', count: '6 of 11', text: 'Hold ◀ or ▶ to swing the barrel.', keys: 'Keys: {aim:barrelLeft} {aim:barrelRight}', target: ['[data-aim="left"]'], last: false };
  const tp = (over: Partial<TutorialProps> = {}): TutorialProps => ({ keyHint, step, waiting: false, skipKey: 'global:back', onSkip: () => { skipped++; }, onNext: () => { nexted++; }, ...over });
  renderTutorial(section, tp({ step: null }));
  await test('tutorial-idle-draws-nothing', () => { assert.ok(section.children.length === 0); });
  renderTutorial(section, tp());
  const bubble = walk(section).find(n => hasClass(n, 'coach-bubble'));
  // (Its tabIndex of -1, so focus can land on it, the browser specs check.)
  await test('tutorial-bubble-shape', () => {
    assert.ok(bubble && attr(bubble, 'role') === 'dialog'
      && attr(bubble, 'aria-describedby') === 'tutorial-text' && attr(bubble, 'aria-labelledby') === 'tutorial-count');
  });
  await test('tutorial-text-is-announced', () => { assert.ok(text(byId(section, 'tutorial-text')) === step.text && attr(byId(section, 'tutorial-text'), 'aria-live') === 'polite'); });
  await test('tutorial-count', () => { assert.ok(/Tutorial · 6 of 11$/.test(text(byId(section, 'tutorial-count')))); });
  await test('tutorial-keys-line-names-live-keys', () => {
    const caps = walk(byId(section, 'tutorial-keys')).filter(n => attr(n, 'data-keyhint'));
    assert.ok(caps.map(c => attr(c, 'data-keyhint')).join() === 'aim:barrelLeft,aim:barrelRight' && text(byId(section, 'tutorial-keys')) === 'Keys: ◀ ▶');
  });
  // The stub page has no target on screen: the bubble waits, hidden, with no spotlight.
  await test('tutorial-waits-without-a-target', () => { assert.ok(bubble && attr(bubble, 'data-waiting') === '' && !walk(section).some(n => hasClass(n, 'coach-spot'))); });
  await test('tutorial-skip-label-has-the-q-chip', () => { assert.ok(text(byId(section, 'tutorial-skip')) === 'Skip Q' && byClass(byId(section, 'tutorial-skip'), 'key').length === 1); });
  await test('tutorial-next-label', () => { assert.ok(text(byId(section, 'tutorial-next')) === 'Next' && hasClass(byId(section, 'tutorial-next'), 'btn-primary')); });
  click(byId(section, 'tutorial-next'));
  click(byId(section, 'tutorial-skip'));
  await test('tutorial-buttons-call-back', () => { assert.ok(nexted === 1 && skipped === 1); });
  renderTutorial(section, tp({ skipKey: undefined, step: { ...step, keys: null, id: 'wind', last: true } }));
  await test('tutorial-touch-names-no-key', () => { assert.ok(text(byId(section, 'tutorial-skip')) === 'Skip' && maybeById(section, 'tutorial-keys') === undefined); });
  await test('tutorial-last-step-says-done', () => { assert.ok(text(byId(section, 'tutorial-next')) === 'Done'); });
}
