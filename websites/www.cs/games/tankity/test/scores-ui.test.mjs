// games/tankity/test/scores-ui.test.mjs
// The scores overlay (src/ui/scores.tsx): one difficulty's board with the
// player's own runs marked, a switcher to the others, and no form. Also the
// filing that feeds it (src/scores.ts): every outcome has words, and one timer retries.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { click, document, makeEl } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const realFetch = globalThis.fetch, realWindow = globalThis.window;
afterEach(() => { globalThis.fetch = realFetch; globalThis.window = realWindow; });
const { scores, logic, file } = await importTsx(import.meta.dirname, { scores: '../src/ui/scores.tsx', logic: '../src/scores.ts', file: '../src/solo-file.ts' });
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
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

/** Timers the test fires by hand: `live` is every armed, uncleared timer. */
function fakeTimers() {
  const live = new Map();
  let next = 1;
  return {
    live,
    setTimeout(fn, ms) { const id = next++; live.set(id, { fn, ms }); return id; },
    clearTimeout(id) { live.delete(id); },
    fire() { const [[id, t]] = live; live.delete(id); t.fn(); },
  };
}
/** A filer stand-in: flush() answers `outcomes`, nextTry() answers `next`; every call is noted. */
function fakeFiler({ outcomes = [], next = null, begin = true, stored = true, abandoned = [] } = {}) {
  const calls = [];
  const f = {
    calls, outcomes, next,
    begin: (...a) => { calls.push(['begin', ...a]); return begin; },
    round: (...a) => calls.push(['round', ...a]),
    finish: (...a) => calls.push(['finish', ...a]),
    drop: id => { calls.push(['drop', id]); return true; },
    abandoned: () => abandoned,
    flush: async () => { calls.push(['flush']); return f.outcomes; },
    nextTry: () => f.next,
    wake: () => calls.push(['wake']),
    stored: () => stored,
    ends: new Map(), held: new Set(),
    outcome: id => f.ends.get(id) ?? null,
    holds: id => f.held.has(id),
  };
  return f;
}
function scoresWith(filer, { said = [], timers = fakeTimers(), board = [] } = {}) {
  globalThis.fetch = async () => reply(200, { scores: board });
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say: (t, tone) => said.push([t, tone]), toggleOverlay() {},
    initials: () => 'WGR', difficulty: () => 'normal', filer, timers });
  return { s, said, timers };
}
const tick = () => new Promise(r => setTimeout(r, 0));

test('every outcome the filer answers has a line for the end card, never an empty one', () => {
  const { lineFor } = logic;
  assert.equal(lineFor({ id: 'a', kind: 'filed', score: 4200, rank: 3, difficulty: 'normal' }), 'Filed · #3 all-time on Normal');
  assert.match(lineFor({ id: 'a', kind: 'filed', score: 4200, rank: null, difficulty: 'hard' }), /^Filed · 4,200 pts, outside the best \d+ on Hard$/);
  assert.equal(lineFor({ id: 'a', kind: 'refused', why: 'the server played that round differently' }), 'Not filed: the server played that round differently.');
  assert.match(lineFor({ id: 'a', kind: 'sent' }), /^Sent: .*Check Scores\.$/);
  assert.match(lineFor({ id: 'a', kind: 'waiting' }), /^Saved in this browser; it files itself when the score server answers\.$/);
  assert.match(lineFor({ id: 'a', kind: 'waiting' }, false), /lost if you close this page/, 'without storage the line says the run lasts as long as the page');
});

test('a finished run files through the filer, and the end card gets the line for its own id', async () => {
  const filer = fakeFiler({ outcomes: [{ id: 'old', kind: 'filed', score: 9, rank: 1, difficulty: 'easy' }, { id: 'run', kind: 'filed', score: 4200, rank: 3, difficulty: 'normal' }] });
  const { s, said } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.deepEqual(filer.calls.slice(0, 2), [['finish', 'run', 'WGR'], ['flush']], 'finish, then flush');
  assert.deepEqual(lines, ['Filed · #3 all-time on Normal']);
  assert.ok(said.some(([t]) => t === 'An earlier run: Filed · #1 · 9 pts on Easy'), 'an earlier page\'s run is told in the radio log, not on this card');
});

test('a run still waiting at game over gets its line again when a later flush files it', async () => {
  const filer = fakeFiler({ outcomes: [{ id: 'run', kind: 'waiting' }], next: 2000 });
  const { s, timers } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.match(lines[0], /^Saved in this browser/);
  filer.outcomes = [{ id: 'run', kind: 'filed', score: 4200, rank: 3, difficulty: 'normal' }];
  filer.next = null;
  timers.fire();
  await tick();
  assert.deepEqual(lines.slice(1), ['Filed · #3 all-time on Normal']);
});

test('one retry timer: re-armed from nextTry() after every flush, never stacked, none when nothing is due', async () => {
  const filer = fakeFiler({ next: 4000 });
  const { s, timers } = scoresWith(filer);
  await s.flushPending();
  await s.flushPending();
  s.soloRound('run', { n: 1 });
  await tick();
  assert.equal(timers.live.size, 1, 'one timer, however many flushes');
  assert.equal([...timers.live.values()][0].ms, 4000);
  filer.next = 0;
  await s.flushPending();
  assert.ok([...timers.live.values()][0].ms >= 1000, 'a run due now is tried again after a pause, not in a tight loop');
  filer.next = null;
  timers.fire();
  await tick();
  assert.equal(timers.live.size, 0, 'nothing due: no timer');
  const flushes = filer.calls.filter(c => c[0] === 'flush').length;
  assert.equal(flushes, 5);
});

test('waking (back online, the page shown again) asks the filer to end an offline wait and re-arms the one timer', async () => {
  const filer = fakeFiler({ next: 60000 });
  const { s, timers } = scoresWith(filer);
  await s.flushPending();
  filer.next = 0;
  s.wake();
  assert.deepEqual(filer.calls.at(-1), ['wake']);
  assert.equal(timers.live.size, 1);
  assert.ok([...timers.live.values()][0].ms <= 1000);
});

test('the page load drops runs an earlier page left unfinished, then sends what waits', async () => {
  const filer = fakeFiler({ abandoned: ['left1', 'left2'], outcomes: [{ id: 'old', kind: 'refused', why: 'the server played a round differently' }] });
  const { s, said } = scoresWith(filer);
  await s.boot();
  assert.deepEqual(filer.calls.map(c => c[0] + (c[1] ? ':' + c[1] : '')), ['drop:left1', 'drop:left2', 'flush']);
  assert.ok(said.some(([t]) => t === 'An earlier run: Not filed: the server played a round differently.'));
});

test('a refusal while the match is still played is told at once, and the end card says it without filing', async () => {
  const filer = fakeFiler({ outcomes: [{ id: 'run', kind: 'refused', why: 'the server played that round differently' }] });
  const { s, said } = scoresWith(filer);
  s.soloBegin('run', 'seed', 'normal', 1200);
  s.soloRound('run', { n: 1 });
  await tick();
  assert.deepEqual(said.at(-1), ['This match can no longer be filed: the server played that round differently.', 'info']);
  filer.outcomes = [];
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.deepEqual(lines, ['Not filed: the server played that round differently.']);
  assert.ok(!filer.calls.some(c => c[0] === 'finish'));
});

test('a run that finished while a pass was under way is asked for again, so the card never sits on Filing', async () => {
  const filer = fakeFiler({ outcomes: [] });
  let passes = 0;
  filer.flush = async () => (++passes === 1 ? [] : [{ id: 'run', kind: 'waiting' }]);
  const { s } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.equal(passes, 2);
  assert.match(lines[0], /^Saved in this browser/);
});

test('a match the full queue cannot hold is told at the deal, with the queue\'s real size', () => {
  const { PENDING_MAX } = file;
  const full = scoresWith(fakeFiler({ begin: false }));
  assert.equal(full.s.soloBegin('run', 'seed', 'normal', 1200), false);
  assert.deepEqual(full.said.at(-1), [`This match won't be filed: ${PENDING_MAX} finished runs are still waiting to reach the score server.`, 'info']);
  const room = scoresWith(fakeFiler());
  assert.equal(room.s.soloBegin('run', 'seed', 'hard', 1200), true);
  assert.deepEqual(room.said, []);
});

test('the real filer end to end: each round goes as it ends and the run files at game over', async () => {
  const sent = [];
  const fetch = async (url, init = {}) => {
    const body = init.body ? JSON.parse(init.body) : null;
    if (!body) return reply(200, { scores: [], csrf: 'tok' });
    sent.push(body.op + (body.n ? body.n : ''));
    if (body.op === 'start') return reply(200, { ok: true, run: 'r'.repeat(32) });
    if (body.op === 'round') return reply(200, { ok: true });
    return reply(200, { ok: true, score: 100, roundsWon: 0, rank: 2, difficulty: 'hard' });
  };
  const filer = file.createFiler({ fetch, storage: memory(), locks: null });
  const { s } = scoresWith(filer);
  const claim = end => ({ end, score: 100, cash: 0, lives: 0, roundsWon: 0 });
  assert.equal(s.soloBegin('run', 'seed-1', 'hard', 1200), true);
  s.soloRound('run', { n: 1, buys: [], shots: [], claim: claim('tankLost') });
  await tick(); await tick();
  assert.deepEqual(sent, ['start', 'round1']);
  s.soloRound('run', { n: 2, buys: [], shots: [], claim: claim('matchLost') });
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.deepEqual(sent, ['start', 'round1', 'round2', 'file']);
  assert.deepEqual(lines, ['Filed · #2 all-time on Hard']);
});

function board(initials) {
  const rows = { easy: [{ name: 'EEE', best: 1, banked: 1, place: 1, standin: false }],
    hard: [{ name: 'HHH', best: 2, banked: 2, place: 1, standin: false }, { name: 'AAA', best: 1, banked: 1, place: 2, standin: true }, { name: 'AAA', best: 1, banked: 1, place: 3, standin: false }] };
  const gate = {};
  globalThis.fetch = async url => {
    const level = String(url).match(/difficulty=(\w+)/)[1];
    await new Promise(r => { gate[level] = r; });
    return { ok: true, status: 200, json: async () => ({ scores: rows[level] }) };
  };
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => initials, difficulty: () => 'normal',
    filer: fakeFiler(), timers: fakeTimers() });
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
  const asked = [];
  globalThis.fetch = async url => { asked.push(String(url)); return reply(200, { scores: [{ name: 'HHH', best: 2, banked: 2, place: 1, standin: false }] }); };
  const filer = fakeFiler({ outcomes: [{ id: 'run', kind: 'filed', score: 10, rank: 1, difficulty: 'normal' }] });
  const t = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => 'WGR', difficulty: () => 'normal', filer, timers: fakeTimers() });
  await t.loadScores('hard');
  asked.length = 0;
  await t.soloFinish('run', 'WGR', () => {});
  await tick();
  assert.equal(t.SCORES.level, 'hard');
  assert.deepEqual(asked, ['scores.php?difficulty=hard']);
});

test('with the score server out of reach the board is empty and says so', async () => {
  const { s } = board('WGR');
  globalThis.fetch = async () => { throw new TypeError('offline'); };
  await s.loadScores('hard');
  assert.deepEqual(s.SCORES.rows, []);
  assert.equal(s.SCORES.note, 'The score server is out of reach right now.');
});

test('the server\'s stand-in flag, not the initials, decides which rows are not the player\'s', async () => {
  for (const [who, marked] of [['AAA', [false, false, true]], ['HHH', [true, false, false]]]) {
    const { s, gate } = board(who);
    const p = s.loadScores('hard');
    gate.hard(); await p;
    assert.deepEqual(s.SCORES.rows.map(r => r.mine), marked);
  }
});

test('opening Scores starts on the current difficulty and reads the board again', async () => {
  const asked = [];
  globalThis.window = { localStorage: memory() };
  globalThis.fetch = async url => { asked.push(String(url)); return { ok: true, status: 200, json: async () => ({ scores: [] }) }; };
  let now = 'normal';
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => 'WGR', difficulty: () => now,
    filer: fakeFiler(), timers: fakeTimers() });
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
  const s = logic.createScores({ $: () => makeEl('report-overlay'), keyHint: () => '', say() {}, toggleOverlay() {}, initials: () => 'WGR', difficulty: () => 'normal',
    filer: fakeFiler(), timers: fakeTimers() });
  await s.loadScores('normal');
  globalThis.fetch = () => new Promise(r => { release = () => r(first); });
  s.openScores();
  assert.equal(s.SCORES.rows.length, 1, 'the last board stays up');
  assert.equal(s.SCORES.note, 'Loading…');
  release(); await new Promise(r => setTimeout(r, 0));
  assert.match(s.SCORES.note, /all-time board/);
});

test('M1: a run another tab filed shows its filed line on this tab\'s card, never as an earlier run', async () => {
  const filer = fakeFiler({ outcomes: [{ id: 'run', kind: 'waiting' }], next: 3000 });
  const { s, said, timers } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.match(lines[0], /^Saved in this browser/);
  // Another tab filed it: this tab's pass finds nothing to send, and the shared queue has the outcome.
  filer.outcomes = [];
  filer.ends.set('run', { id: 'run', kind: 'filed', score: 4200, rank: 3, difficulty: 'normal' });
  timers.fire();
  await tick();
  assert.deepEqual(lines.slice(1), ['Filed · #3 all-time on Normal']);
  assert.ok(!said.some(([t]) => /earlier run/.test(t)));
});

test('M1: a run filed by another tab before this one asked still gets its own line at game over', async () => {
  const filer = fakeFiler({ outcomes: [] });
  filer.ends.set('run', { id: 'run', kind: 'filed', score: 4200, rank: 3, difficulty: 'normal' });
  const { s } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.deepEqual(lines, ['Filed · #3 all-time on Normal']);
});

test('M2: a pass that throws, or a run still held, leaves the waiting line, never "no longer holds"', async () => {
  for (const [why, setup] of [
    ['a pass threw', f => { f.flush = async () => { throw new Error('SecurityError'); }; }],
    ['still held', f => { f.held.add('run'); }],
  ]) {
    const filer = fakeFiler({ outcomes: [] });
    setup(filer);
    const { s } = scoresWith(filer);
    const lines = [];
    await s.soloFinish('run', 'WGR', l => lines.push(l));
    assert.equal(lines.length, 1, why);
    assert.match(lines[0], /^Saved in this browser/, why);
  }
  const gone = fakeFiler({ outcomes: [] });
  const lines = [];
  await scoresWith(gone).s.soloFinish('run', 'WGR', l => lines.push(l));
  assert.deepEqual(lines, ['Not filed: this browser no longer holds the run.']);
});

test('M6: the retry timer is never armed past the longest pause', async () => {
  const filer = fakeFiler({ next: 40 * 24 * 3600 * 1000 });
  const { s, timers } = scoresWith(filer);
  await s.flushPending();
  assert.equal([...timers.live.values()][0].ms, file.BACKOFF_LONGEST);
});

test('I1: a forgotten run (its card is gone) reports later in the radio log as an earlier run', async () => {
  const filer = fakeFiler({ outcomes: [{ id: 'one', kind: 'waiting' }] });
  const { s, said } = scoresWith(filer);
  const lines = [];
  await s.soloFinish('one', 'WGR', l => lines.push(l));
  s.soloForget('one');
  filer.outcomes = [{ id: 'one', kind: 'filed', score: 8000, rank: 4, difficulty: 'hard' }];
  await s.flushPending();
  assert.equal(lines.length, 1);
  assert.ok(said.some(([t]) => t === 'An earlier run: Filed · #4 · 8,000 pts on Hard'));
});
