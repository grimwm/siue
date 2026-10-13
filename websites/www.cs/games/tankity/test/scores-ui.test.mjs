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

const memory = seed => { const m = new Map(Object.entries(seed || {})); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), map: m }; };
const kept = store => JSON.parse(store.map.get('tankity-local') || '[]');
function filing(reply, store = memory()) {
  globalThis.fetch = async () => { if (reply instanceof Error) throw reply; return reply; };
  globalThis.window = { localStorage: store };
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

test('a copy stays in this browser only when the server surely did not file the run', async () => {
  const filed = memory();
  await filing(reply(200, { ok: true, place: 3 }), filed);
  assert.equal(kept(filed).length, 0, 'filed: no local copy');
  for (const r of [new TypeError('fetch failed'), reply(429, { error: 'x' }), reply(503, { error: 'x' }), reply(403, { error: 'x' })]) {
    const store = memory();
    await filing(r, store);
    assert.equal(kept(store).length, 1, 'not filed: one local copy');
    assert.equal(kept(store)[0].difficulty, 'normal');
  }
  const unreadable = memory();
  const lines = await filing(reply(200, null), unreadable);
  assert.equal(kept(unreadable).length, 0, 'a 200 with an unreadable body may have filed: no copy');
  assert.match(lines[0], /may be filed/);
});

function board(initials) {
  const rows = { easy: [{ name: 'EEE', best: 1, banked: 1, place: 1 }], hard: [{ name: 'HHH', best: 2, banked: 2, place: 1 }, { name: 'AAA', best: 1, banked: 1, place: 2 }] };
  const gate = {};
  globalThis.fetch = async url => {
    const level = String(url).match(/difficulty=(\w+)/)[1];
    await new Promise(r => { gate[level] = r; });
    return { ok: true, status: 200, json: async () => ({ scores: rows[level] }) };
  };
  globalThis.window = { localStorage: memory({ 'tankity-local': JSON.stringify([
    { name: 'OLD', score: 5, banked: 1, won: false, seed: 'a' },
    { name: 'HRD', score: 9, banked: 2, won: false, seed: 'b', difficulty: 'hard' },
  ]) }) };
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => initials, difficulty: () => 'normal' });
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

test('a filing refreshes the board being looked at, not the Menu\'s difficulty', async () => {
  const { s, gate } = board('WGR');
  const looking = s.loadScores('hard');
  gate.hard(); await looking;
  globalThis.fetch = async url => ({ ok: true, status: 200, json: async () => (String(url).includes('scores.php?') ? { scores: [{ name: 'HHH', best: 2, banked: 2, place: 1 }] } : { ok: true, place: 1 }) });
  await s.fileSolo({ initials: 'WGR', score: 10, banked: 1, seed: 's', difficulty: 'normal' }, () => {});
  await new Promise(r => setTimeout(r, 0));
  assert.equal(s.SCORES.level, 'hard');
});

test('the offline list follows the switcher', async () => {
  const { s } = board('WGR');
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  await s.loadScores('hard');
  assert.deepEqual(s.SCORES.rows.map(r => r.text.split(' ')[1]), ['HRD']);
  await s.loadScores('normal');
  assert.deepEqual(s.SCORES.rows.map(r => r.text.split(' ')[1]), ['OLD'], 'a row with no difficulty is a Normal run');
});

test('a player whose initials are AAA is not shown the blocklist stand-in rows as theirs', async () => {
  for (const [who, marked] of [['AAA', []], ['HHH', [true, false]]]) {
    const { s, gate } = board(who);
    const p = s.loadScores('hard');
    gate.hard(); await p;
    assert.deepEqual(s.SCORES.rows.map(r => r.mine), who === 'AAA' ? [false, false] : marked);
  }
});
