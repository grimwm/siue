// games/tankity/test/scores-ui.test.mjs
// The scores overlay (src/ui/scores.tsx): one difficulty's board with the
// player's own runs marked, a switcher to the others, and no form. Also the
// filing that feeds it (src/scores.ts): a failure always has words.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { click, document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { scores, logic } = await importTsx(import.meta.dirname, { scores: '../src/ui/scores.tsx', logic: '../src/scores.ts' });
const walk = (el, out = []) => { for (const c of el.children || []) { if (c.nodeType === 1) { out.push(c); walk(c, out); } } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);
const props = over => ({ keyHint: () => '', onClose() {}, onLevel() {}, level: 'normal', note: 'The all-time board on Normal.',
  rows: [{ text: '#1 WGR · 9,000 pts · 4 rounds won', mine: false }, { text: '#2 ABC · 8,000 pts · 3 rounds won', mine: true }], ...over });

test('the board lists every row, marks the player\'s own, and has no form', () => {
  const section = makeEl('report-overlay');
  scores.renderScores(section, props({}));
  assert.equal(byId(section, 'score-form'), undefined);
  const items = walk(byId(section, 'scores')).filter(n => n.localName === 'li');
  assert.equal(items.length, 2);
  assert.ok(!hasClass(items[0], 'mine'));
  assert.ok(hasClass(items[1], 'mine'));
  assert.match(items[1].textContent, /\(yours\)$/);
});

test('the switcher shows the board on screen and asks for another', () => {
  const asked = [];
  const section = makeEl('report-overlay');
  scores.renderScores(section, props({ level: 'hard', onLevel: lv => asked.push(lv) }));
  assert.equal(byId(section, 'scores-level-hard').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(section, 'scores-level-easy').getAttribute('aria-pressed'), 'false');
  assert.equal(byId(section, 'scores-level-normal').textContent, 'Normal');
  click(byId(section, 'scores-level-easy'));
  click(byId(section, 'scores-level-hard'));
  assert.deepEqual(asked, ['easy'], 'the board already shown is not asked for again');
});

function filing(reply) {
  globalThis.fetch = async () => { if (reply instanceof Error) throw reply; return reply; };
  globalThis.localStorage = undefined;
  const lines = [];
  const s = logic.createScores({ $: () => null, keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => 'WGR', difficulty: () => 'normal' });
  const run = { initials: 'WGR', score: 4200, banked: 3, seed: 's', difficulty: 'normal' };
  return s.fileSolo(run, l => lines.push(l)).then(() => lines);
}
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('a filed run says where it placed', async () => {
  const lines = await filing(reply(200, { ok: true, place: 3 }));
  assert.deepEqual(lines, ['Filed · #3 all-time on Normal']);
});

test('every failed filing gives a visible line with its reason, never an empty one', async () => {
  for (const [r, re] of [
    [new TypeError('fetch failed'), /out of reach/],
    [reply(429, { error: 'too many reports; try later' }), /too many reports.*try again later/],
    [reply(403, { error: 'cross-site request refused' }), /refused/],
    [reply(415, { error: 'send application/json' }), /format/],
    [reply(503, { error: 'store unavailable' }), /problem \(store unavailable\)/],
    [reply(500, null), /problem/],
  ]) {
    const lines = await filing(r);
    assert.equal(lines.length, 1);
    assert.match(lines[0], /^Couldn't file your score: /);
    assert.match(lines[0], re);
  }
});
