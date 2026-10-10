// The input module without a browser. Run here: `node input-test.js`.
// js/input.js (compiled from src/input.ts) takes plain event objects, so the
// key table, the command routing, the held keys and the arm movement run here
// against the shipped game.json and a fake clock.
import fs from 'node:fs';
import {
  FALLBACK_KEYS, buildKeymap, lookupKey, keycap, createInput, stepArm, Held, ARM_RATE, touchOnly, gridCommand,
} from './js/input.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
const near = (a, b) => Math.abs(a - b) < 1e-9;

const GAME = JSON.parse(fs.readFileSync(new URL('./game.json', import.meta.url)));
const map = buildKeymap(GAME.keys);

// ---- tokens: code first, then key (either case), modifiers win while held ----
check('lookup-by-code', lookupKey(map, 'aim', { code: 'KeyW', key: 'w' }) === 'powerUp');
check('lookup-by-key-when-code-unmapped', lookupKey(map, 'aim', { code: 'Quote', key: 'a' }) === 'driveLeft');
check('lookup-key-is-case-folded', lookupKey(map, 'global', { code: '', key: 'M' }) === 'music');
check('lookup-unknown-is-null', lookupKey(map, 'aim', { code: 'KeyZ', key: 'z' }) === null);
check('lookup-unknown-context-is-null', lookupKey(map, 'nowhere', { code: 'KeyW', key: 'w' }) === null);
check('lookup-shift-token', lookupKey(map, 'scroll', { code: 'KeyJ', key: 'J', shiftKey: true }) === 'halfDown');
check('lookup-plain-j-is-a-line', lookupKey(map, 'scroll', { code: 'KeyJ', key: 'j' }) === 'lineDown');
check('lookup-shift-falls-back-to-plain', lookupKey(map, 'aim', { code: 'KeyW', key: 'W', shiftKey: true }) === 'powerUp');
// Ctrl+ tokens: a table that binds one wins only while Control is held.
const chord = buildKeymap({ aim: {}, shop: {}, scroll: {}, global: { page: ['Ctrl+KeyU'], plain: ['u'] } });
check('lookup-ctrl-token', lookupKey(chord, 'global', { code: 'KeyU', key: 'u', ctrlKey: true }) === 'page');
check('lookup-ctrl-token-needs-ctrl', lookupKey(chord, 'global', { code: 'KeyU', key: 'u' }) === 'plain');
check('keycap-chords', keycap('Ctrl+KeyU') === 'Ctrl+U' && keycap('Shift+KeyJ') === 'Shift+J', keycap('Shift+KeyJ'));
check('keycap-glyphs', keycap('ArrowLeft') === '◀' && keycap('Escape') === 'ESC' && keycap('PageDown') === 'PgDn' && keycap(' ') === 'Space');

// Browsers reserve Ctrl+U (view source) and Ctrl+D (bookmark): no shipped binding uses them.
const tokens = Object.values(GAME.keys).flatMap(c => Object.values(c).flat());
check('no-browser-reserved-chords', !tokens.some(t => /^Ctrl\+(KeyU|KeyD|u|d)$/i.test(t)), tokens.filter(t => /^Ctrl\+/.test(t)).join());
// The frozen fallback is the same table game.yaml ships.
const sorted = o => JSON.stringify(Object.fromEntries(Object.entries(o).sort(([x], [y]) => x < y ? -1 : 1)
  .map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? JSON.parse(sorted(v)) : v])));
check('fallback-matches-game-json', sorted(FALLBACK_KEYS) === sorted(GAME.keys));

// ---- touch detection: coarse pointer and no fine one ----
const mq = (coarse, fine) => q => ({ matches: q === '(pointer: coarse)' ? coarse : fine });
check('touch-phone', touchOnly(mq(true, false)) === true);
check('touch-laptop-with-touchscreen-is-not', touchOnly(mq(true, true)) === false);
check('touch-desktop', touchOnly(mq(false, true)) === false);
check('touch-no-matchmedia', touchOnly(undefined) === false);

// ---- command routing ----
const ev = (o = {}) => {
  const e = { key: '', code: '', repeat: false, prevented: 0, preventDefault() { e.prevented++; }, ...o };
  return e;
};
function rig(extraCtx = {}) {
  const input = createInput({ touch: false });
  input.setKeys(GAME.keys);
  const calls = [];
  return { input, calls, log: name => () => { calls.push(name); } };
}

{
  // Aim keys are held, always swallow the default (arrows must not scroll the page), and wake audio.
  const r = rig();
  let holds = 0;
  r.input.register({}, { onHold: () => { holds++; } });
  const down = ev({ key: 'ArrowUp', code: 'ArrowUp' });
  r.input.keydown(down);
  check('aim-key-holds-and-prevents-default', r.input.held.has('powerUp') && down.prevented === 1 && holds === 1);
  r.input.keydown(ev({ key: 'ArrowUp', code: 'ArrowUp', repeat: true }));
  check('aim-key-repeat-stays-held', r.input.held.has('powerUp'));
  r.input.keyup(ev({ key: 'ArrowUp', code: 'ArrowUp' }));
  check('aim-key-up-releases', !r.input.held.has('powerUp'));
  r.input.keydown(ev({ key: 'ArrowDown', code: 'ArrowDown' }));
  const blur = [];
  r.input.bind({ addEventListener: (type, fn) => { if (type === 'blur') blur.push(fn); } });
  blur[0]();
  check('window-blur-drops-held-keys', !r.input.held.has('powerDown'));
}
{
  // Typing in a box is typing, not playing.
  const r = rig();
  r.input.register({ music: r.log('music') });
  const e = ev({ key: 'm', code: 'KeyM', target: { tagName: 'INPUT' } });
  r.input.keydown(e);
  r.input.keydown(ev({ key: 'ArrowUp', code: 'ArrowUp', target: { tagName: 'TEXTAREA' } }));
  check('typing-in-a-box-keeps-every-key', r.calls.length === 0 && e.prevented === 0 && !r.input.held.has('powerUp'));
}
{
  // Fire: default suppressed always, the command once per press (no auto-repeat).
  const r = rig();
  r.input.register({ fire: r.log('fire') });
  const a = ev({ key: ' ', code: 'Space' });
  r.input.keydown(a);
  r.input.keydown(ev({ key: ' ', code: 'Space', repeat: true }));
  const rep = ev({ key: ' ', code: 'Space', repeat: true });
  r.input.keydown(rep);
  check('fire-once-per-press', r.calls.join() === 'fire' && a.prevented === 1 && rep.prevented === 1, r.calls.join());
}
{
  // Plain global keys do not repeat and do not suppress the default.
  const r = rig();
  r.input.register({ music: r.log('music'), guns: r.log('guns') });
  const a = ev({ key: 'm', code: 'KeyM' });
  r.input.keydown(a);
  r.input.keydown(ev({ key: 'm', code: 'KeyM', repeat: true }));
  r.input.keydown(ev({ key: 'g', code: 'KeyG' }));
  check('global-key-runs-once-and-leaves-the-default', r.calls.join() === 'music,guns' && a.prevented === 0, r.calls.join());
}
{
  // A declining handler lets the key fall through: j in the shop selects, otherwise it scrolls.
  const r = rig();
  let shop = true;
  r.input.register({
    lineDown: () => { r.calls.push(shop ? 'select' : 'scroll'); return true; },
    selDown: () => { r.calls.push('selDown'); return true; },
  }, { shopLive: p => shop && !p.repeat });
  const j = ev({ key: 'j', code: 'KeyJ' });
  r.input.keydown(j);
  const down = ev({ key: 'ArrowDown', code: 'ArrowDown' });
  r.input.keydown(down);
  shop = false;
  r.input.keydown(ev({ key: 'ArrowDown', code: 'ArrowDown' }));
  check('shop-commands-only-while-the-shop-is-live', r.calls.join() === 'select,selDown' && j.prevented === 1 && down.prevented === 1
    && r.input.held.has('powerDown'), r.calls.join());
  const rep = ev({ key: 'ArrowDown', code: 'ArrowDown', repeat: true });
  shop = true;
  r.input.keydown(rep);
  check('shop-keys-ignore-auto-repeat', r.calls.join() === 'select,selDown' && rep.prevented === 1);
}
{
  // A handler returning nothing declines (no preventDefault, falls through); 'quiet' stops the key without it.
  const r = rig();
  r.input.register({
    buyRow: () => undefined,
    preview: () => 'quiet',
    battlePreview: r.log('battlePreview'),
  }, { shopLive: () => true });
  const one = ev({ key: '1', code: 'Digit1' });
  r.input.keydown(one);
  const v = ev({ key: 'v', code: 'KeyV' });
  r.input.keydown(v);
  check('declined-key-falls-through-quiet-key-stops', one.prevented === 0 && v.prevented === 0 && r.calls.length === 0, r.calls.join());
}
{
  // ESC: the shop's close wins in the shop, else the global escape (which always suppresses the default).
  const r = rig();
  let live = true;
  r.input.register({
    close: r.log('close'),
    escape: r.log('escape'),
  }, { shopLive: () => live });
  // close returns nothing here, so it declines and the global escape runs.
  const a = ev({ key: 'Escape', code: 'Escape' });
  r.input.keydown(a);
  check('escape-falls-to-global-when-close-declines', r.calls.join() === 'close,escape' && a.prevented === 1, r.calls.join());
  live = false;
  r.calls.length = 0;
  r.input.keydown(ev({ key: 'Escape', code: 'Escape' }));
  check('escape-outside-the-shop', r.calls.join() === 'escape');
}
{
  // The gun grid's fixed keys.
  check('grid-keys', gridCommand('ArrowLeft') === 'gridLeft' && gridCommand('Enter') === 'confirm'
    && gridCommand(' ') === 'confirm' && gridCommand('7') === 'digit' && gridCommand('0') === null && gridCommand('a') === null);
  const r = rig();
  let open = true;
  r.input.register({
    gridRight: () => { if (!open) return; r.calls.push('right'); return true; },
    digit: p => { if (!open) return; r.calls.push('digit' + p.key); return true; },
  });
  const a = ev({ key: 'ArrowRight', code: 'ArrowRight' });
  r.input.keydown(a);
  r.input.keydown(ev({ key: '3', code: 'Digit3' }));
  open = false;
  r.input.keydown(ev({ key: 'ArrowRight', code: 'ArrowRight' }));
  check('grid-commands-take-arrows-while-open', r.calls.join() === 'right,digit3' && a.prevented === 1 && r.input.held.has('barrelRight'), r.calls.join());
}
{
  // A question holds every key but ESC, which answers it.
  const r = rig();
  let asked = true;
  r.input.register({ music: r.log('music'), fire: r.log('fire'), escape: r.log('escape') },
    { modalOpen: () => asked, modalEscape: () => { r.calls.push('stay'); asked = false; } });
  r.input.keydown(ev({ key: 'm', code: 'KeyM' }));
  r.input.keydown(ev({ key: 'ArrowLeft', code: 'ArrowLeft' }));
  const esc = ev({ key: 'Escape', code: 'Escape' });
  r.input.keydown(esc);
  check('modal-holds-all-keys-but-escape', r.calls.join() === 'stay' && esc.prevented === 1 && !r.input.held.has('barrelLeft'), r.calls.join());
}
{
  // A new table replaces the keys; one missing a context is refused.
  const r = rig();
  const keys = JSON.parse(JSON.stringify(GAME.keys));
  keys.global.music = ['x'];
  check('set-keys-accepts-a-full-table', r.input.setKeys(keys) === true);
  r.input.register({ music: r.log('music') });
  r.input.keydown(ev({ key: 'm', code: 'KeyM' }));
  r.input.keydown(ev({ key: 'x', code: 'KeyX' }));
  check('rebinding-moves-the-key', r.calls.join() === 'music' && r.input.hint('global', 'music') === 'X', r.calls.join());
  check('set-keys-refuses-a-partial-table', r.input.setKeys({ aim: {} }) === false && r.input.hint('global', 'music') === 'X');
  check('hint-nth-token', r.input.hint('global', 'fire', 0) === 'Ctrl' && r.input.hint('global', 'fire', 4) === 'Space' && r.input.hint('global', 'nope') === '');
}
{
  // Touch screens bind no keys, but still drop held buttons on blur.
  const input = createInput({ touch: true });
  const types = [];
  input.bind({ addEventListener: type => types.push(type) });
  check('touch-binds-no-keys', types.join() === 'blur', types.join());
}
{
  // Hold buttons: down holds (and wakes audio), up and leave release.
  const input = createInput({ touch: false });
  let holds = 0;
  input.register({}, { onHold: () => { holds++; } });
  const on = {};
  let blurred = 0;
  input.bindHold({ addEventListener: (type, fn) => { on[type] = fn; } }, 'driveLeft');
  let pd = 0;
  on.pointerdown({ preventDefault: () => { pd++; } });
  check('hold-button-down', input.held.has('driveLeft') && pd === 1 && holds === 1);
  on.pointerleave();
  check('hold-button-leave-releases', !input.held.has('driveLeft'));
  on.pointerdown({ preventDefault() {} });
  on.pointerup();
  check('hold-button-up-releases', !input.held.has('driveLeft'));
  on.click({ currentTarget: { blur: () => { blurred++; } } });
  check('hold-button-click-blurs', blurred === 1);
}

// ---- held keys and the arm, on a fake clock ----
{
  const held = new Held();
  const arm = { angle: 62, power: 55 };
  check('held-axis', held.axis('driveLeft', 'driveRight') === 0);
  held.press('driveRight');
  check('held-axis-positive', held.axis('driveLeft', 'driveRight') === 1);
  held.press('driveLeft');
  check('held-axis-cancels', held.axis('driveLeft', 'driveRight') === 0);
  held.clear();

  check('arm-idle-moves-nothing', (() => { const s = stepArm(held, 1 / 60, arm, 1); return s.angle === 62 && s.power === 55 && s.idle && !s.adjusting; })());

  // Holding the barrel key for one second of 60 Hz frames swings it ARM_RATE degrees.
  held.press('barrelLeft');
  let a = { angle: 62, power: 55 };
  let t = 0;
  let last;
  while (t < 1 - 1e-9) { last = stepArm(held, 1 / 60, a, 1); a = last; t += 1 / 60; }
  check('arm-barrel-rate', near(a.angle, 62 + ARM_RATE.barrelDegrees) && last.adjusting && !last.idle, String(a.angle));
  check('arm-barrel-rate-is-42-deg-per-s', ARM_RATE.barrelDegrees === 42 && ARM_RATE.power === 45);

  // The rate does not depend on the frame rate: 30 Hz and 144 Hz cover the same angle.
  const run = hz => {
    let x = { angle: 62, power: 55 };
    for (let i = 0; i < hz / 2; i++) x = stepArm(held, 1 / hz, x, 1);
    return x.angle;
  };
  check('arm-rate-independent-of-frame-rate', near(run(30), run(144)), `${run(30)} vs ${run(144)}`);

  // Facing flips the barrel's direction; opposed keys cancel; the ends clamp.
  const left = stepArm(held, 0.5, { angle: 62, power: 55 }, -1);
  check('arm-facing-flips-the-swing', near(left.angle, 62 - 21), String(left.angle));
  held.press('barrelRight');
  const both = stepArm(held, 0.5, { angle: 62, power: 55 }, 1);
  check('arm-opposed-barrel-keys-cancel', both.angle === 62 && !both.adjusting && !both.idle);
  held.clear();
  held.press('barrelLeft');
  check('arm-angle-clamps', stepArm(held, 10, { angle: 62, power: 55 }, 1).angle === 170);
  held.clear();
  held.press('powerUp');
  const up = stepArm(held, 1, { angle: 62, power: 55 }, 1);
  check('arm-power-up-rate', near(up.power, 100) && stepArm(held, 1, { angle: 62, power: 70 }, 1).power === 100);
  held.clear();
  held.press('powerDown');
  check('arm-power-down-rate-and-floor', near(stepArm(held, 0.5, { angle: 62, power: 55 }, 1).power, 55 - 22.5)
    && stepArm(held, 5, { angle: 62, power: 55 }, 1).power === 10);
  check('arm-reports-input-even-at-the-limit', stepArm(held, 1, { angle: 62, power: 10 }, 1).adjusting);
  held.clear();
  held.press('driveLeft');
  check('drive-keys-do-not-move-the-arm', (() => { const s = stepArm(held, 1, { angle: 62, power: 55 }, 1); return s.angle === 62 && s.power === 55 && s.idle; })());
}

if (failed) { console.log('INPUT-FAILED'); process.exit(1); }
console.log('INPUT-OK');
