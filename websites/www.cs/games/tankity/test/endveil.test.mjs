// games/tankity/test/endveil.test.mjs
// The end card (src/ui/endveil.tsx): no callsign form, the filed line, the
// scoreboard at its head, and the buttons each kind of ending offers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { endveil } = await importTsx(import.meta.dirname, { endveil: '../src/ui/endveil.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);

function draw(over = {}) {
  const veil = makeEl('end-veil');
  const calls = [];
  endveil.renderEndVeil(veil, {
    keyHint: () => 'N', kicker: 'Match lost', title: 'Tank down', text: 'The tank is scrap.', score: 'Score 4,450 · seed s',
    board: null, filed: 'Filed · #12 all-time', buttons: 'solo',
    onAgain: () => calls.push('again'), onLeave: () => calls.push('leave'), onWatch: () => calls.push('watch'), ...over,
  });
  return { veil, calls };
}

test('no callsign form; the filed line shows, and hides when nothing was filed', () => {
  const { veil } = draw();
  assert.equal(byId(veil, 'end-score-form'), undefined);
  assert.equal(byId(veil, 'end-name'), undefined);
  assert.equal(byId(veil, 'end-filed').textContent, 'Filed · #12 all-time');
  assert.equal(byId(veil, 'end-filed').hidden, false);
  assert.equal(byId(draw({ filed: null }).veil, 'end-filed').hidden, true);
});

test('a solo run: Continue, back to the title card, and nothing else', () => {
  const { veil, calls } = draw();
  assert.equal(byId(veil, 'again').textContent, 'Continue');
  assert.equal(byId(veil, 'end-leave'), undefined);
  assert.equal(byId(veil, 'end-watch'), undefined);
  click(byId(veil, 'again'));
  assert.deepEqual(calls, ['again']);
});

test('a finished room match: Play again (same room) and Leave room', () => {
  const { veil, calls } = draw({ buttons: 'over' });
  assert.equal(byId(veil, 'again').textContent, 'Play again (same room)');
  assert.equal(byId(veil, 'end-leave').textContent, 'Leave room');
  click(byId(veil, 'end-leave'));
  assert.deepEqual(calls, ['leave']);
});

test('out of lives: Watch the finish and Leave room; from the menu: Back to the battle', () => {
  const out = draw({ buttons: 'out' });
  assert.equal(byId(out.veil, 'end-watch').textContent, 'Watch the finish');
  assert.equal(byId(out.veil, 'again'), undefined);
  assert.ok(byId(out.veil, 'end-leave'));
  click(byId(out.veil, 'end-watch'));
  assert.deepEqual(out.calls, ['watch']);
  assert.equal(byId(draw({ buttons: 'peek' }).veil, 'end-watch').textContent, 'Back to the battle');
});

test('the scoreboard heads the card', () => {
  const board = { kind: 'solo', caption: '', title: '', rows: [{ round: 1, won: true, points: 10, kills: 1, cash: 5, lives: 3 }], total: { points: 10, kills: 1 } };
  assert.ok(walk(draw({ board }).veil).some(n => n.localName === 'table'));
});

test('the primary button takes focus when the game asks', () => {
  const { veil } = draw({ buttons: 'over' });
  let focused = null;
  const primary = walk(veil).find(n => /btn-primary/.test(n.className || n.getAttribute?.('class') || ''));
  assert.ok(primary, 'a primary button');
  primary.focus = () => { focused = primary.id; };
  endveil.focusEndVeil(veil);
  assert.equal(focused, 'again');
});
