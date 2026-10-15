// websites/www.cs/games/_kit/test/install.test.ts
// Install and Share on every platform: Chromium's held-back prompt, iOS's
// steps, a browser that cannot install, an installed app, ?install, and the
// three ways a link is shared.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DeferredPrompt, InstallEnv, InstallSetup, InstallView, Platform } from '../install.ts';
import { createInstall, asksInstall, withInstall, COPIED_MS, IOS_STEPS, PROMPT_STASH, detectPlatform, createShare, browserInstallEnv } from '../install.ts';
import { runInNewContext } from 'node:vm';
import { manualClock } from './clock.ts';

// A site page (/play/crete/) and the game's own page (games/crete/).
const PLAY: InstallSetup = {
  title: 'The Island of Crete', shareUrl: 'https://site.test/play/crete/',
  installPage: 'https://site.test/games/crete/', promptsHere: true, asked: false,
};
const GAME = { ...PLAY, installPage: null };

interface SetupOptions {
  platform?: Platform;
  installed?: boolean;
  framed?: boolean;
  share?: InstallEnv['share'];
  copy?: InstallEnv['copy'];
  early?: DeferredPrompt | null;
}

function setup({ platform = 'chromium', installed = false, framed = false, share = null, copy = null, early = null }: SetupOptions = {}, how: InstallSetup = PLAY) {
  const clock = manualClock();
  const went: Array<[string, boolean]> = [];
  const views: InstallView[] = [];
  let offer: (p: DeferredPrompt) => void = () => {};
  let installedNow = () => {};
  const env: InstallEnv = {
    onPrompt: cb => { offer = cb; if (early) cb(early); },
    onInstalled: cb => { installedNow = cb; },
    installed: () => installed,
    platform: () => platform,
    framed: () => framed,
    share,
    copy,
    navigate: (url, replace) => went.push([url, replace]),
    timers: clock.timers,
  };
  const install = createInstall(env, how, v => views.push(v));
  return { install, went, views, clock, offer: (p: DeferredPrompt) => offer(p), installedNow: () => installedNow() };
}
const fakePrompt = () => {
  const p = { shown: 0, prompt: async () => { p.shown++; } };
  return p;
};

test('Chromium: Install stays hidden until the browser offers to install, then shows', () => {
  const t = setup();
  assert.equal(t.install.view().install, false);
  t.offer(fakePrompt());
  assert.equal(t.install.view().install, true);
  const redrawn = t.views.at(-1);
  assert.ok(redrawn);
  assert.equal(redrawn.install, true, 'the bar is redrawn');
});

test('a prompt held back before the bar mounted shows Install', () => {
  assert.equal(setup({ early: fakePrompt() }).install.view().install, true);
});

test('a click prompts once; the spent prompt takes the button with it', async () => {
  const t = setup();
  const p = fakePrompt();
  t.offer(p);
  await t.install.pressInstall();
  assert.equal(p.shown, 1);
  assert.equal(t.install.view().install, false);
  await t.install.pressInstall();
  assert.equal(p.shown, 1);
});

test('a prompt that throws leaves no button and no error', async () => {
  const t = setup();
  t.offer({ prompt: async () => { throw new Error('already shown'); } });
  await t.install.pressInstall();
  assert.equal(t.install.view().install, false);
});

test('appinstalled hides Install for good', () => {
  const t = setup();
  t.offer(fakePrompt());
  t.installedNow();
  assert.equal(t.install.view().install, false);
  t.offer(fakePrompt());
  assert.equal(t.install.view().install, false);
});

test('the installed app never shows Install or the steps, on any platform', () => {
  for (const platform of ['chromium', 'ios', 'other'] satisfies Platform[]) {
    const t = setup({ platform, installed: true }, { ...GAME, asked: true });
    t.offer(fakePrompt());
    assert.deepEqual([t.install.view().install, t.install.view().steps, t.went], [false, false, []], platform);
  }
});

test('a browser that cannot install shows no Install button', () => {
  const t = setup({ platform: 'other' });
  assert.equal(t.install.view().install, false);
  const away = setup({ platform: 'other' }, { ...PLAY, promptsHere: false, asked: true });
  assert.equal(away.install.view().install, false);
  assert.deepEqual(away.went, []);
});

test('iOS on the game page: Install opens the Add to Home Screen steps, which close', async () => {
  const t = setup({ platform: 'ios' }, GAME);
  assert.deepEqual([t.install.view().install, t.install.view().steps], [true, false]);
  await t.install.pressInstall();
  assert.equal(t.install.view().steps, true);
  t.install.closeSteps();
  assert.equal(t.install.view().steps, false);
  assert.equal(IOS_STEPS, 'Tap Share, then Add to Home Screen');
});

test('iOS on a site page: Install opens the game page asking to install, so iOS saves the game', async () => {
  const t = setup({ platform: 'ios' });
  await t.install.pressInstall();
  assert.deepEqual(t.went, [['https://site.test/games/crete/?install', false]]);
  assert.equal(t.install.view().steps, false);
});

test('?install highlights Install once it shows, and never prompts by itself', () => {
  const t = setup({}, { ...PLAY, asked: true });
  assert.equal(t.install.view().highlight, false, 'nothing to highlight yet');
  const p = fakePrompt();
  t.offer(p);
  assert.deepEqual([t.install.view().install, t.install.view().highlight, p.shown, t.went], [true, true, 0, []]);
});

test('?install on iOS opens the steps on the game page, and goes to the game page from a site page', () => {
  assert.equal(setup({ platform: 'ios' }, { ...GAME, asked: true }).install.view().steps, true);
  const fromSite = setup({ platform: 'ios' }, { ...PLAY, asked: true });
  assert.deepEqual(fromSite.went, [['https://site.test/games/crete/?install', true]]);
});

test('Chromium on a page it does not prompt on: Install shows at once and opens the game page', async () => {
  const t = setup({}, { ...PLAY, promptsHere: false, asked: true });
  assert.deepEqual([t.install.view().install, t.install.view().highlight], [true, true]);
  await t.install.pressInstall();
  assert.deepEqual(t.went, [['https://site.test/games/crete/?install', false]]);
});

test('inside the site page\'s frame the bar is off: no Install, no steps, no share', async () => {
  const shared: Array<{ title: string; url: string }> = [];
  const t = setup({ framed: true, platform: 'ios', share: async d => { shared.push(d); } }, { ...GAME, asked: true });
  t.offer(fakePrompt());
  await t.install.pressShare();
  const v = t.install.view();
  assert.deepEqual([v.off, v.install, v.steps, shared], [true, false, false, []]);
});

test('Share hands the title and the site page to the share sheet', async () => {
  const shared: Array<{ title: string; url: string }> = [];
  const t = setup({ share: async d => { shared.push(d); }, copy: async () => { throw new Error('unused'); } });
  await t.install.pressShare();
  assert.deepEqual(shared, [{ title: 'The Island of Crete', url: 'https://site.test/play/crete/' }]);
  assert.equal(t.install.view().share, 'idle');
});

test('a cancelled share sheet is silent: no copy, no message, no redraw', async () => {
  const copied: string[] = [];
  const t = setup({
    share: async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); },
    copy: async u => { copied.push(u); },
  });
  await t.install.pressShare();
  assert.deepEqual([copied, t.install.view().share, t.views.length], [[], 'idle', 0]);
});

test('without Web Share the address is copied and "Link copied" shows, then clears', async () => {
  const copied: string[] = [];
  const t = setup({ copy: async u => { copied.push(u); } });
  await t.install.pressShare();
  assert.deepEqual(copied, ['https://site.test/play/crete/']);
  assert.equal(t.install.view().share, 'copied');
  t.clock.advance(COPIED_MS - 1);
  assert.equal(t.install.view().share, 'copied');
  t.clock.advance(1);
  assert.equal(t.install.view().share, 'idle');
});

test('a share sheet that refuses falls back to copying', async () => {
  const copied: string[] = [];
  const t = setup({
    share: async () => { throw Object.assign(new Error('no gesture'), { name: 'NotAllowedError' }); },
    copy: async u => { copied.push(u); },
  });
  await t.install.pressShare();
  assert.deepEqual([copied.length, t.install.view().share], [1, 'copied']);
});

test('a blocked or missing clipboard shows the address in a field, until it is closed', async () => {
  const t = setup({ copy: async () => { throw new Error('denied'); } });
  await t.install.pressShare();
  assert.equal(t.install.view().share, 'field');
  t.install.closeShare();
  assert.equal(t.install.view().share, 'idle');
  const none = setup();
  await none.install.pressShare();
  assert.equal(none.install.view().share, 'field');
});

test('?install is read in any form, and added to a page keeping its query and hash', () => {
  for (const s of ['?install', '?install=1', '?game=cylon&install']) assert.equal(asksInstall(s), true, s);
  for (const s of ['', '?installs', '?game=cylon']) assert.equal(asksInstall(s), false, s);
  assert.equal(withInstall('https://site.test/games/crete/'), 'https://site.test/games/crete/?install');
  assert.equal(withInstall('https://site.test/index.html?game=cylon#top'), 'https://site.test/index.html?game=cylon&install#top');
});

test('the page\'s first script parks an early prompt where the bar looks for it', () => {
  const php = readFileSync(join(import.meta.dirname, '..', 'php', 'install-core.php'), 'utf8');
  assert.match(php, new RegExp(`window\\.${PROMPT_STASH} = e;`));
});

test('platform: iPhone and iPad (also as a Mac with a touch screen) are iOS; Chromium brands are Chromium; the rest cannot install', () => {
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
  const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
  assert.equal(detectPlatform(IPHONE, 'iPhone', 5), 'ios');
  assert.equal(detectPlatform(MAC, 'MacIntel', 5), 'ios', 'iPadOS says it is a Mac');
  assert.equal(detectPlatform(MAC, 'MacIntel', 0), 'other', 'a desktop Safari');
  assert.equal(detectPlatform(MAC, 'MacIntel', 0, [{ brand: 'Not A Brand' }, { brand: 'Chromium' }, { brand: 'Google Chrome' }]), 'chromium');
  assert.equal(detectPlatform('Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/130.0', 'Linux x86_64', 0), 'other');
});

test('a prompt that fires before the bar loads is held back by the page\'s first script, and the bar picks it up', () => {
  const php = readFileSync(join(import.meta.dirname, '..', 'php', 'install-core.php'), 'utf8');
  const stash = php.match(/const INSTALL_PROMPT_STASH = "<script>(.*?)<\/script>";/);
  assert.ok(stash);
  const script = stash[1];
  assert.ok(script !== undefined);
  const handlers: Array<[string, (e: unknown) => void]> = [];
  const fakeWindow: { addEventListener(type: string, fn: (e: unknown) => void): void; [PROMPT_STASH]?: unknown } = { addEventListener: (type, fn) => { handlers.push([type, fn]); } };
  runInNewContext(script, { window: fakeWindow });
  assert.deepEqual(handlers.map(h => h[0]), ['beforeinstallprompt']);
  let prevented = 0;
  const early = { preventDefault: () => { prevented++; }, prompt: async () => {} };
  const [beforeInstall] = handlers;
  assert.ok(beforeInstall);
  beforeInstall[1](early);
  assert.equal(prevented, 1, 'the browser is told to hold the prompt back');
  assert.equal(fakeWindow[PROMPT_STASH], early);

  // The deferred bar script comes later: it finds the parked event.
  Reflect.set(globalThis, 'window', fakeWindow);
  const realNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: '', platform: '', maxTouchPoints: 0 }, configurable: true, writable: true });
  try {
    const got: DeferredPrompt[] = [];
    browserInstallEnv().onPrompt(p => got.push(p));
    assert.deepEqual(got, [early]);
    assert.equal(fakeWindow[PROMPT_STASH], null, 'the parked prompt is taken once');
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
    if (realNavigator) Object.defineProperty(globalThis, 'navigator', realNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

test('createShare, on its own: Web Share with the title and address, then copy, then the field', async () => {
  const clock = manualClock();
  const shared: Array<{ title: string; url: string }> = [];
  const copied: string[] = [];
  let changes = 0;
  const how = { title: 'Operation Tankity', shareUrl: 'https://site.test/play/tankity/' };
  const viaSheet = createShare({ share: async d => { shared.push(d); }, copy: null, timers: clock.timers }, how, () => { changes++; });
  await viaSheet.press();
  assert.deepEqual([shared, viaSheet.state(), changes], [[{ title: 'Operation Tankity', url: 'https://site.test/play/tankity/' }], 'idle', 0]);
  const viaCopy = createShare({ share: null, copy: async t => { copied.push(t); }, timers: clock.timers }, how, () => { changes++; });
  await viaCopy.press();
  assert.deepEqual([copied, viaCopy.state()], [['https://site.test/play/tankity/'], 'copied']);
  clock.advance(COPIED_MS);
  assert.equal(viaCopy.state(), 'idle');
  const byHand = createShare({ share: null, copy: null, timers: clock.timers }, how, () => { changes++; });
  await byHand.press();
  assert.equal(byHand.state(), 'field');
  byHand.close();
  assert.equal(byHand.state(), 'idle');
});

test('createShare: a copy that fails after a newer press succeeded, or after Close, changes nothing', async () => {
  const clock = manualClock();
  const how = { title: 'Operation Tankity', shareUrl: 'https://site.test/play/tankity/' };
  const writes: Array<{ ok: () => void; fail: () => void }> = [];
  const copy = () => new Promise<void>((ok, fail) => { writes.push({ ok, fail: () => fail(new Error('blocked')) }); });
  const s = createShare({ share: null, copy, timers: clock.timers }, how, () => {});
  const first = s.press();
  const second = s.press();
  writes[1]?.ok();
  await second;
  assert.equal(s.state(), 'copied');
  writes[0]?.fail();
  await first;
  assert.equal(s.state(), 'copied', 'the older press does not turn "Link copied" into the field');
  const third = s.press();
  s.close();
  writes[2]?.fail();
  await third;
  assert.equal(s.state(), 'idle', 'a press closed before it answered stays closed');
});
