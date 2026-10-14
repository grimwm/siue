// games/tankity/test/scores-ui.test.mjs
// The scores overlay (src/ui/scores.tsx): one difficulty's board with the
// player's own runs marked, a switcher to the others, and no form; and the
// board reads behind it (src/scores.ts).
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { click, document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const realFetch = globalThis.fetch, realWindow = globalThis.window;
afterEach(() => { globalThis.fetch = realFetch; globalThis.window = realWindow; });
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

const memory = seed => { const m = new Map(Object.entries(seed || {})); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), map: m }; };

function board(initials) {
  const rows = { easy: [{ name: 'EEE', best: 1, banked: 1, place: 1 }],
    hard: [{ name: 'HHH', best: 2, banked: 2, place: 1 }, { name: 'AAA', best: 1, banked: 1, place: 2 }, { name: 'AAA', best: 1, banked: 1, place: 3 }] };
  const gate = {};
  globalThis.fetch = async url => {
    const level = String(url).match(/difficulty=(\w+)/)[1];
    await new Promise(r => { gate[level] = r; });
    return { ok: true, status: 200, json: async () => ({ scores: rows[level] }) };
  };
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', toggleOverlay() {}, initials: () => initials, difficulty: () => 'normal', });
  return { s, gate };
}

test('a slower reply for a board the player has left does not replace the board on screen', async () => {
  const { s, gate } = board('WGR');
  const easy = s.loadScores('easy');
  const hard = s.loadScores('hard');
  gate.hard(); await hard;
  gate.easy(); await easy;
  assert.equal(s.SCORES.level, 'hard');
  assert.match(s.SCORES.rows[0].text, /HHH/);
});


test('with the score server out of reach the board is empty and says so', async () => {
  const { s } = board('WGR');
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  await s.loadScores('hard');
  assert.deepEqual(s.SCORES.rows, []);
  assert.equal(s.SCORES.note, 'The score server is out of reach right now.');
});


test('opening Scores starts on the current difficulty and reads the board again', async () => {
  const asked = [];
  globalThis.window = { localStorage: memory() };
  globalThis.fetch = async url => { asked.push(String(url)); return { ok: true, status: 200, json: async () => ({ scores: [] }) }; };
  let now = 'normal';
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', toggleOverlay() {}, initials: () => 'WGR', difficulty: () => now, });
  s.openScores();
  await new Promise(r => setTimeout(r, 0));
  assert.deepEqual(asked, ['scores.php?difficulty=normal']);
  await s.loadScores('easy'); // the player browses another board
  now = 'hard';               // changes the Difficulty in the menu
  s.openScores();
  assert.equal(s.SCORES.level, 'hard');
  assert.equal(s.SCORES.rows, null, 'no other board\'s rows under the pressed button');
  assert.equal(s.SCORES.note, 'Loading…');
  await new Promise(r => setTimeout(r, 0));
  assert.equal(asked[asked.length - 1], 'scores.php?difficulty=hard');
  assert.equal(asked.length, 3, 'every open reads the board again');
});

test('reopening Scores shows the last board read, not a blank list, until the fresh one returns', async () => {
  globalThis.window = { localStorage: memory() };
  let release;
  const first = { ok: true, status: 200, json: async () => ({ scores: [{ name: 'AAA', best: 5, banked: 1, place: 1 }] }) };
  globalThis.fetch = async () => first;
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', toggleOverlay() {}, initials: () => 'WGR', difficulty: () => 'normal', });
  await s.loadScores('normal');
  globalThis.fetch = () => new Promise(r => { release = () => r(first); });
  s.openScores();
  assert.equal(s.SCORES.rows.length, 1, 'the last board stays up');
  assert.equal(s.SCORES.note, 'Loading…');
  release(); await new Promise(r => setTimeout(r, 0));
  assert.match(s.SCORES.note, /all-time board/);
});
