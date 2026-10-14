// The input module without a browser. src/input.ts takes plain event objects, so
// the key table, the command routing, the held keys and the arm movement run here
// against the shipped game.json and a fake clock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FALLBACK_KEYS, buildKeymap, lookupKey, keycap, createInput, stepArm, Held, ARM_RATE, touchOnly, gridCommand,
} from '../src/input.ts';
import type { ArmStep, HoldButton, KeyContext, KeyDefs, KeyLike } from '../src/input.ts';

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

const GAME: { keys: KeyDefs } = JSON.parse(fs.readFileSync(new URL('../game.json', import.meta.url), 'utf8'));
const map = buildKeymap(GAME.keys);

// ---- tokens: code first, then key (either case), modifiers win while held ----
await test('lookup-by-code', () => { assert.ok(lookupKey(map, 'aim', { code: 'ArrowUp', key: 'Up' }) === 'powerUp'); });
await test('lookup-by-key-when-code-unmapped', () => { assert.ok(lookupKey(map, 'aim', { code: 'Quote', key: 'Up' }) === 'powerUp'); });
await test('lookup-key-is-case-folded', () => { assert.ok(lookupKey(map, 'global', { code: '', key: 'M' }) === 'music'); });
await test('lookup-unknown-is-null', () => { assert.ok(lookupKey(map, 'aim', { code: 'KeyZ', key: 'z' }) === null); });
await test('lookup-unknown-context-is-null', () => { assert.ok(lookupKey(map, 'nowhere', { code: 'KeyW', key: 'w' }) === null); });
await test('lookup-shift-token', () => { assert.ok(lookupKey(map, 'scroll', { code: 'KeyJ', key: 'J', shiftKey: true }) === 'halfDown'); });
await test('lookup-plain-j-is-a-line', () => { assert.ok(lookupKey(map, 'scroll', { code: 'KeyJ', key: 'j' }) === 'lineDown'); });
await test('lookup-shift-falls-back-to-plain', () => { assert.ok(lookupKey(map, 'aim', { code: 'ArrowUp', key: 'ArrowUp', shiftKey: true }) === 'powerUp'); });
// Ctrl+ tokens: a table that binds one wins only while Control is held.
const chord = buildKeymap({ aim: {}, shop: {}, scroll: {}, global: { page: ['Ctrl+KeyU'], plain: ['u'] } });
await test('lookup-ctrl-token', () => { assert.ok(lookupKey(chord, 'global', { code: 'KeyU', key: 'u', ctrlKey: true }) === 'page'); });
await test('lookup-ctrl-token-needs-ctrl', () => { assert.ok(lookupKey(chord, 'global', { code: 'KeyU', key: 'u' }) === 'plain'); });
await test('keycap-chords', () => { assert.ok(keycap('Ctrl+KeyU') === 'Ctrl+U' && keycap('Shift+KeyJ') === 'Shift+J', keycap('Shift+KeyJ')); });
await test('keycap-glyphs', () => { assert.ok(keycap('ArrowLeft') === '←' && keycap('q') === 'Q' && keycap('PageDown') === 'PgDn' && keycap(' ') === 'Space'); });

// Browsers reserve Ctrl+U (view source) and Ctrl+D (bookmark): no shipped binding uses them.
const tokens = Object.values(GAME.keys).flatMap(c => Object.values(c).flat());
await test('no-browser-reserved-chords', () => { assert.ok(!tokens.some(t => /^Ctrl\+(KeyU|KeyD|u|d)$/i.test(t)), tokens.filter(t => /^Ctrl\+/.test(t)).join()); });
// The frozen fallback is the same table game.yaml ships.
const sorted = (o: object): string => JSON.stringify(Object.fromEntries(Object.entries(o).sort(([x], [y]) => x < y ? -1 : 1)
  .map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? JSON.parse(sorted(v)) : v])));
await test('fallback-matches-game-json', () => { assert.ok(sorted(FALLBACK_KEYS) === sorted(GAME.keys)); });

// ---- touch detection: coarse pointer and no fine one ----
const mq = (coarse: boolean, fine: boolean) => (q: string) => ({ matches: q === '(pointer: coarse)' ? coarse : fine });
await test('touch-phone', () => { assert.ok(touchOnly(mq(true, false)) === true); });
await test('touch-laptop-with-touchscreen-is-not', () => { assert.ok(touchOnly(mq(true, true)) === false); });
await test('touch-desktop', () => { assert.ok(touchOnly(mq(false, true)) === false); });
await test('touch-no-matchmedia', () => { assert.ok(touchOnly(undefined) === false); });

// ---- command routing ----
/** A key event that counts its preventDefault calls. */
type Ev = KeyLike & { prevented: number };
const ev = (o: Omit<KeyLike, 'preventDefault'> = {}): Ev => {
  const e: Ev = { key: '', code: '', repeat: false, prevented: 0, preventDefault() { e.prevented++; }, ...o };
  return e;
};
function rig(extraCtx = {}) {
  const input = createInput({ touch: false });
  input.setKeys(GAME.keys);
  const calls: string[] = [];
  return { input, calls, log: (name: string) => () => { calls.push(name); } };
}

{
  // Aim keys are held, always swallow the default (arrows must not scroll the page), and wake audio.
  const r = rig();
  let holds = 0;
  r.input.register({}, { onHold: () => { holds++; } });
  const down = ev({ key: 'ArrowUp', code: 'ArrowUp' });
  r.input.keydown(down);
  await test('aim-key-holds-and-prevents-default', () => { assert.ok(r.input.held.has('powerUp') && down.prevented === 1 && holds === 1); });
  r.input.keydown(ev({ key: 'ArrowUp', code: 'ArrowUp', repeat: true }));
  await test('aim-key-repeat-stays-held', () => { assert.ok(r.input.held.has('powerUp')); });
  r.input.keyup(ev({ key: 'ArrowUp', code: 'ArrowUp' }));
  await test('aim-key-up-releases', () => { assert.ok(!r.input.held.has('powerUp')); });
  r.input.keydown(ev({ key: 'ArrowDown', code: 'ArrowDown' }));
  // One listener type for both overloads: keydown/keyup pass an event, blur passes none.
  type Listener = (...e: KeyLike[]) => void;
  const blur: Listener[] = [];
  r.input.bind({ addEventListener: (type: string, fn: Listener) => { if (type === 'blur') blur.push(fn); } });
  const onBlur = blur[0];
  assert.ok(onBlur, 'bind listens for blur');
  onBlur();
  await test('window-blur-drops-held-keys', () => { assert.ok(!r.input.held.has('powerDown')); });
}
{
  // Typing in a box is typing, not playing.
  const r = rig();
  r.input.register({ music: r.log('music') });
  const e = ev({ key: 'm', code: 'KeyM', target: { tagName: 'INPUT' } });
  r.input.keydown(e);
  r.input.keydown(ev({ key: 'ArrowUp', code: 'ArrowUp', target: { tagName: 'TEXTAREA' } }));
  await test('typing-in-a-box-keeps-every-key', () => { assert.ok(r.calls.length === 0 && e.prevented === 0 && !r.input.held.has('powerUp')); });
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
  await test('fire-once-per-press', () => { assert.ok(r.calls.join() === 'fire' && a.prevented === 1 && rep.prevented === 1, r.calls.join()); });
}
{
  // Plain global keys do not repeat and do not suppress the default.
  const r = rig();
  r.input.register({ music: r.log('music'), guns: r.log('guns') });
  const a = ev({ key: 'm', code: 'KeyM' });
  r.input.keydown(a);
  r.input.keydown(ev({ key: 'm', code: 'KeyM', repeat: true }));
  r.input.keydown(ev({ key: 'g', code: 'KeyG' }));
  await test('global-key-runs-once-and-leaves-the-default', () => { assert.ok(r.calls.join() === 'music,guns' && a.prevented === 0, r.calls.join()); });
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
  await test('shop-commands-only-while-the-shop-is-live', () => { assert.ok(r.calls.join() === 'select,selDown' && j.prevented === 1 && down.prevented === 1
    && r.input.held.has('powerDown'), r.calls.join()); });
  const rep = ev({ key: 'ArrowDown', code: 'ArrowDown', repeat: true });
  shop = true;
  r.input.keydown(rep);
  await test('shop-keys-ignore-auto-repeat', () => { assert.ok(r.calls.join() === 'select,selDown' && rep.prevented === 1); });
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
  await test('declined-key-falls-through-quiet-key-stops', () => { assert.ok(one.prevented === 0 && v.prevented === 0 && r.calls.length === 0, r.calls.join()); });
}
{
  // Q: the shop's close wins in the shop, else the global back (which always suppresses the default).
  const r = rig();
  let live = true;
  r.input.register({
    close: r.log('close'),
    back: r.log('back'),
  }, { shopLive: () => live });
  // close returns nothing here, so it declines and the global back runs.
  const a = ev({ key: 'q', code: 'KeyQ' });
  r.input.keydown(a);
  await test('q-falls-to-global-when-close-declines', () => { assert.ok(r.calls.join() === 'close,back' && a.prevented === 1, r.calls.join()); });
  live = false;
  r.calls.length = 0;
  r.input.keydown(ev({ key: 'Q', code: 'KeyQ', shiftKey: true }));
  await test('q-outside-the-shop', () => { assert.ok(r.calls.join() === 'back', r.calls.join()); });
  // Esc does nothing, in the shop or out of it, and leaves the browser's default alone.
  for (const shop of [true, false]) {
    live = shop;
    r.calls.length = 0;
    const esc = ev({ key: 'Escape', code: 'Escape' });
    r.input.keydown(esc);
    await test(`escape-does-nothing-${shop ? 'in' : 'out of'}-the-shop`, () => { assert.ok(r.calls.length === 0 && esc.prevented === 0, r.calls.join()); });
  }
}
{
  // Only plain Q is back: Ctrl+Q, Alt+Q and Cmd+Q (which quits the browser) are the browser's.
  const r = rig();
  r.input.register({ close: r.log('close'), back: r.log('back') }, { shopLive: () => true });
  for (const mod of ['ctrlKey', 'altKey', 'metaKey'] as const) {
    const q = ev({ key: 'q', code: 'KeyQ', [mod]: true });
    r.input.keydown(q);
    await test(`modified-q-is-not-back-${mod}`, () => { assert.ok(r.calls.length === 0 && q.prevented === 0, r.calls.join()); });
  }
}
{
  // Holding Q does not flicker the menu: an auto-repeat is not another back.
  const r = rig();
  let live = false;
  let asked = false;
  r.input.register({ close: r.log('close'), back: r.log('back') },
    { shopLive: p => live && !p.repeat, modalOpen: () => asked, modalBack: () => r.calls.push('stay') });
  r.input.keydown(ev({ key: 'q', code: 'KeyQ' }));
  const rep = ev({ key: 'q', code: 'KeyQ', repeat: true });
  r.input.keydown(rep);
  await test('held-q-goes-back-once', () => { assert.ok(r.calls.join() === 'back', r.calls.join()); });
  live = true;
  r.calls.length = 0;
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', repeat: true }));
  await test('held-q-in-the-shop-does-not-fall-through', () => { assert.ok(r.calls.length === 0, r.calls.join()); });
  asked = true;
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', repeat: true }));
  await test('held-q-does-not-answer-a-question-again', () => { assert.ok(r.calls.length === 0, r.calls.join()); });
}
{
  // Q goes back from a read-only field (the invite link); an editable box keeps it.
  const r = rig();
  r.input.register({ back: r.log('back') });
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', target: { tagName: 'INPUT', readOnly: true } }));
  await test('q-goes-back-from-a-read-only-field', () => { assert.ok(r.calls.join() === 'back', r.calls.join()); });
  r.calls.length = 0;
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', target: { tagName: 'INPUT' } }));
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', target: { tagName: 'TEXTAREA', readOnly: false } }));
  await test('an-editable-box-keeps-q', () => { assert.ok(r.calls.length === 0, r.calls.join()); });
  r.input.keydown(ev({ key: 'm', code: 'KeyM', target: { tagName: 'INPUT', readOnly: true } }));
  await test('a-read-only-field-keeps-the-other-keys', () => { assert.ok(r.calls.length === 0, r.calls.join()); });
}
{
  // A slider (the turn time) types nothing: Q goes back from it, and its arrows stay its own.
  const r = rig();
  r.input.register({ back: r.log('back') });
  r.input.keydown(ev({ key: 'q', code: 'KeyQ', target: { tagName: 'INPUT', type: 'range' } }));
  await test('q-goes-back-from-a-slider', () => { assert.ok(r.calls.join() === 'back', r.calls.join()); });
  r.calls.length = 0;
  r.input.keydown(ev({ key: 'ArrowLeft', code: 'ArrowLeft', target: { tagName: 'INPUT', type: 'range' } }));
  await test('a-slider-keeps-its-arrows', () => { assert.ok(r.calls.length === 0 && !r.input.held.has('barrelLeft'), r.calls.join()); });
}
{
  // The gun grid's fixed keys.
  await test('grid-keys', () => { assert.ok(gridCommand('ArrowLeft') === 'gridLeft' && gridCommand('Enter') === 'confirm'
    && gridCommand(' ') === 'confirm' && gridCommand('7') === 'digit' && gridCommand('0') === null && gridCommand('a') === null); });
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
  await test('grid-commands-take-arrows-while-open', () => { assert.ok(r.calls.join() === 'right,digit3' && a.prevented === 1 && r.input.held.has('barrelRight'), r.calls.join()); });
}
{
  // A question holds every key but Q, which answers it; Esc does nothing to it.
  const r = rig();
  let asked = true;
  r.input.register({ music: r.log('music'), fire: r.log('fire'), back: r.log('back') },
    { modalOpen: () => asked, modalBack: () => { r.calls.push('stay'); asked = false; } });
  r.input.keydown(ev({ key: 'm', code: 'KeyM' }));
  r.input.keydown(ev({ key: 'ArrowLeft', code: 'ArrowLeft' }));
  const esc = ev({ key: 'Escape', code: 'Escape' });
  r.input.keydown(esc);
  await test('modal-ignores-escape', () => { assert.ok(r.calls.length === 0 && esc.prevented === 0 && asked, r.calls.join()); });
  const q = ev({ key: 'q', code: 'KeyQ' });
  r.input.keydown(q);
  await test('modal-holds-all-keys-but-q', () => { assert.ok(r.calls.join() === 'stay' && q.prevented === 1 && !r.input.held.has('barrelLeft'), r.calls.join()); });
}
{
  // A new table replaces the keys; one missing a context is refused.
  const r = rig();
  const keys: Record<KeyContext, Record<string, string[]>> = JSON.parse(JSON.stringify(GAME.keys));
  keys.global.music = ['x'];
  await test('set-keys-accepts-a-full-table', () => { assert.ok(r.input.setKeys(keys) === true); });
  r.input.register({ music: r.log('music') });
  r.input.keydown(ev({ key: 'm', code: 'KeyM' }));
  r.input.keydown(ev({ key: 'x', code: 'KeyX' }));
  await test('rebinding-moves-the-key', () => { assert.ok(r.calls.join() === 'music' && r.input.hint('global', 'music') === 'X', r.calls.join()); });
  await test('set-keys-refuses-a-partial-table', () => { assert.ok(r.input.setKeys({ aim: {} }) === false && r.input.hint('global', 'music') === 'X'); });
  await test('hint-nth-token', () => { assert.ok(r.input.hint('global', 'fire', 0) === 'Space' && r.input.hint('global', 'fire', 2) === 'Ctrl' && r.input.hint('global', 'nope') === ''); });
}
{
  // Touch screens bind no keys, but still drop held buttons on blur.
  const input = createInput({ touch: true });
  const types: string[] = [];
  input.bind({ addEventListener: (type: string) => types.push(type) });
  await test('touch-binds-no-keys', () => { assert.ok(types.join() === 'blur', types.join()); });
}
{
  // Hold buttons: down holds (and wakes audio), up and leave release.
  const input = createInput({ touch: false });
  let holds = 0;
  input.register({}, { onHold: () => { holds++; } });
  /** The button's listeners, by event type. */
  const on: {
    pointerdown?: (ev: { preventDefault(): void }) => void;
    pointerup?: () => void;
    pointerleave?: () => void;
    click?: (ev: { currentTarget: { blur?(): void } | null }) => void;
  } = {};
  type Listener = NonNullable<(typeof on)[keyof typeof on]>;
  let blurred = 0;
  const button: HoldButton = { addEventListener: (type: keyof typeof on, fn: Listener) => { Object.assign(on, { [type]: fn }); } };
  input.bindHold(button, 'driveLeft');
  const { pointerdown, pointerup, pointerleave, click } = on;
  assert.ok(pointerdown && pointerup && pointerleave && click, 'bindHold listens for all four');
  let pd = 0;
  pointerdown({ preventDefault: () => { pd++; } });
  await test('hold-button-down', () => { assert.ok(input.held.has('driveLeft') && pd === 1 && holds === 1); });
  pointerleave();
  await test('hold-button-leave-releases', () => { assert.ok(!input.held.has('driveLeft')); });
  pointerdown({ preventDefault() {} });
  pointerup();
  await test('hold-button-up-releases', () => { assert.ok(!input.held.has('driveLeft')); });
  click({ currentTarget: { blur: () => { blurred++; } } });
  await test('hold-button-click-blurs', () => { assert.ok(blurred === 1); });
}

// ---- held keys and the arm, on a fake clock ----
{
  const held = new Held();
  const arm = { angle: 62, power: 55 };
  await test('held-axis', () => { assert.ok(held.axis('driveLeft', 'driveRight') === 0); });
  held.press('driveRight');
  await test('held-axis-positive', () => { assert.ok(held.axis('driveLeft', 'driveRight') === 1); });
  held.press('driveLeft');
  await test('held-axis-cancels', () => { assert.ok(held.axis('driveLeft', 'driveRight') === 0); });
  held.clear();

  await test('arm-idle-moves-nothing', () => { assert.ok((() => { const s = stepArm(held, 1 / 60, arm, 1); return s.angle === 62 && s.power === 55 && s.idle && !s.adjusting; })()); });

  // Holding the barrel key for one second of 60 Hz frames swings it ARM_RATE degrees.
  held.press('barrelLeft');
  let a = { angle: 62, power: 55 };
  let t = 0;
  let last: ArmStep | undefined;
  while (t < 1 - 1e-9) { last = stepArm(held, 1 / 60, a, 1); a = last; t += 1 / 60; }
  await test('arm-barrel-rate', () => { assert.ok(last); assert.ok(near(a.angle, 62 + ARM_RATE.barrelDegrees) && last.adjusting && !last.idle, String(a.angle)); });
  await test('arm-barrel-rate-is-42-deg-per-s', () => { assert.ok(ARM_RATE.barrelDegrees === 42 && ARM_RATE.power === 45); });

  // The rate does not depend on the frame rate: 30 Hz and 144 Hz cover the same angle.
  const run = (hz: number) => {
    let x = { angle: 62, power: 55 };
    for (let i = 0; i < hz / 2; i++) x = stepArm(held, 1 / hz, x, 1);
    return x.angle;
  };
  await test('arm-rate-independent-of-frame-rate', () => { assert.ok(near(run(30), run(144)), `${run(30)} vs ${run(144)}`); });

  // Facing flips the barrel's direction; opposed keys cancel; the ends clamp.
  const left = stepArm(held, 0.5, { angle: 62, power: 55 }, -1);
  await test('arm-facing-flips-the-swing', () => { assert.ok(near(left.angle, 62 - 21), String(left.angle)); });
  held.press('barrelRight');
  const both = stepArm(held, 0.5, { angle: 62, power: 55 }, 1);
  await test('arm-opposed-barrel-keys-cancel', () => { assert.ok(both.angle === 62 && !both.adjusting && !both.idle); });
  held.clear();
  held.press('barrelLeft');
  await test('arm-angle-clamps', () => { assert.ok(stepArm(held, 10, { angle: 62, power: 55 }, 1).angle === 170); });
  // A loaded beam's limits let the barrel dip past level on both sides; a
  // barrel outside the loaded gun's limits (a gun switch) comes back inside them.
  await test('arm-dips-with-beam-limits', () => { assert.ok(stepArm(held, 10, { angle: 62, power: 55 }, 1, 720, { min: -20, max: 200 }).angle === 200); });
  held.clear();
  held.press('barrelRight');
  await test('arm-dips-below-level', () => { assert.ok(stepArm(held, 10, { angle: 62, power: 55 }, 1, 720, { min: -20, max: 200 }).angle === -20); });
  held.clear();
  const back = stepArm(held, 1 / 60, { angle: -20, power: 55 }, 1);
  await test('arm-reclamps-to-the-gun-limits', () => { assert.ok(back.angle === 10 && back.clamped && !back.adjusting, JSON.stringify(back)); });
  await test('arm-inside-limits-is-not-clamped', () => { assert.ok(!stepArm(held, 1 / 60, { angle: 62, power: 55 }, 1).clamped); });
  held.press('barrelLeft');
  held.clear();
  held.press('powerUp');
  const up = stepArm(held, 1, { angle: 62, power: 55 }, 1);
  await test('arm-power-up-rate', () => { assert.ok(near(up.power, 100) && stepArm(held, 1, { angle: 62, power: 70 }, 1).power === 100); });
  held.clear();
  held.press('powerDown');
  await test('arm-power-down-rate-and-floor', () => { assert.ok(near(stepArm(held, 0.5, { angle: 62, power: 55 }, 1).power, 55 - 22.5)
    && stepArm(held, 5, { angle: 62, power: 55 }, 1).power === 10); });
  await test('arm-reports-input-even-at-the-limit', () => { assert.ok(stepArm(held, 1, { angle: 62, power: 10 }, 1).adjusting); });
  held.clear();
  held.press('driveLeft');
  await test('drive-keys-do-not-move-the-arm', () => { assert.ok((() => { const s = stepArm(held, 1, { angle: 62, power: 55 }, 1); return s.angle === 62 && s.power === 55 && s.idle; })()); });
}

