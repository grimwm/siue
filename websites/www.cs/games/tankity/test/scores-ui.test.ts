// games/tankity/test/scores-ui.test.ts
// The scores overlay (src/ui/scores.tsx): per difficulty, the online board with
// the player's own runs marked and this browser's board with the run just saved
// marked, a switcher between difficulties, and no form; and the reads behind it
// (src/scores.ts).
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { click, installDocument, makeEl, asElement, byId, maybeById, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import type { ScoresProps } from '../src/ui/scores.tsx';
import type { LocalRow } from '../src/local-board.ts';
import type { Difficulty } from '../src/sim.ts';
import { nth } from '../../_kit/test/nth.ts';

installDocument();
const realFetch = globalThis.fetch, realWindow = globalThis.window;
afterEach(() => { globalThis.fetch = realFetch; globalThis.window = realWindow; });
const { scores, logic, local } = await importTsx<{
  scores: typeof import('../src/ui/scores.tsx');
  logic: typeof import('../src/scores.ts');
  local: typeof import('../src/local-board.ts');
}>(import.meta.dirname, { scores: '../src/ui/scores.tsx', logic: '../src/scores.ts', local: '../src/local-board.ts' });

const render = (root: StubElement, p: ScoresProps) => scores.renderScores(asElement(root), p);
/** The section as the `$` lookup answers it. */
const asHtml = (el: StubElement) => asElement(el) as HTMLElement;
const hasClass = (el: StubElement, name: string) => String(el.className || '').split(' ').includes(name);
/** What fetch answers: the body as JSON. The stand-in is not a Response, only what src/scores.ts reads of one. */
type Answer = { ok: boolean; status: number; json: () => Promise<unknown> };
// as unknown as: the fakes below answer `{ ok, status, json }`, the part of a Response scores.ts reads.
const stubFetch = (fn: (url: string) => Promise<Answer>) => { globalThis.fetch = fn as unknown as typeof fetch; };
const stubWindow = (localStorage: StorageLike) => { globalThis.window = { localStorage } as unknown as typeof globalThis.window; };
const props = (over: Partial<ScoresProps>): ScoresProps => ({ keyHint: () => '', onClose() {}, onLevel() {}, level: 'normal', note: 'The all-time board on Normal.',
  rows: [{ text: '#1 WGR · 9,000 pts · 4 rounds won', mine: false }, { text: '#2 ABC · 8,000 pts · 3 rounds won', mine: true }], local: [], ...over });

test('the board lists every row, marks the player\'s own, and has no form', () => {
  const section = makeEl('report-overlay');
  render(section, props({}));
  assert.equal(maybeById(section, 'score-form'), undefined);
  const items = walk(byId(section, 'scores')).filter(n => n.localName === 'li');
  assert.equal(items.length, 2);
  assert.ok(!hasClass(nth(items, 0), 'mine'));
  assert.ok(hasClass(nth(items, 1), 'mine'));
  assert.match(nth(items, 1).textContent, /\(yours\)$/);
});

test('the switcher shows the board on screen and asks for another', () => {
  const asked: string[] = [];
  const section = makeEl('report-overlay');
  render(section, props({ level: 'hard', onLevel: lv => { asked.push(lv); } }));
  assert.equal(byId(section, 'scores-level-hard').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(section, 'scores-level-easy').getAttribute('aria-pressed'), 'false');
  assert.equal(byId(section, 'scores-level-normal').textContent, 'Normal');
  click(byId(section, 'scores-level-easy'));
  click(byId(section, 'scores-level-hard'));
  assert.deepEqual(asked, ['easy'], 'the board already shown is not asked for again');
});


/** Lets the reply for a board through; it fails when that board was never asked for. */
function release(gate: Record<string, () => void>, level: string): void {
  const open = gate[level];
  assert.ok(open, `${level} was not asked for`);
  open();
}

function board(initials: string) {
  const rows: Record<string, Array<{ name: string; best: number; banked: number; place: number }>> = { easy: [{ name: 'EEE', best: 1, banked: 1, place: 1 }],
    hard: [{ name: 'HHH', best: 2, banked: 2, place: 1 }, { name: 'AAA', best: 1, banked: 1, place: 2 }, { name: 'AAA', best: 1, banked: 1, place: 3 }] };
  const gate: Record<string, () => void> = {};
  stubFetch(async url => {
    const level = nth(String(url).match(/difficulty=(\w+)/) ?? [], 1);
    await new Promise<void>(r => { gate[level] = r; });
    return { ok: true, status: 200, json: async () => ({ scores: rows[level] }) };
  });
  const s = logic.createScores({ $: () => asHtml(makeEl('report-overlay')), keyHint: () => '', toggleOverlay() {}, initials: () => initials, difficulty: () => 'normal', storage: memoryStorage(), onStorage() {} });
  return { s, gate };
}

test('a slower reply for a board the player has left does not replace the board on screen', async () => {
  const { s, gate } = board('WGR');
  const easy = s.loadScores('easy');
  const hard = s.loadScores('hard');
  release(gate, 'hard'); await hard;
  release(gate, 'easy'); await easy;
  assert.equal(s.SCORES.level, 'hard');
  assert.match(nth(s.SCORES.rows ?? [], 0).text, /HHH/);
});


test('with the online board out of reach its list is empty, never "nobody filed", and the note says so', async () => {
  const { s } = board('WGR');
  stubFetch(async () => { throw new TypeError('offline'); });
  await s.loadScores('hard');
  assert.equal(s.SCORES.rows, null);
  assert.equal(s.SCORES.note, 'The online board is out of reach right now.');
});


test('opening Scores starts on the current difficulty and reads the board again', async () => {
  const asked: string[] = [];
  stubWindow(memoryStorage());
  stubFetch(async url => { asked.push(String(url)); return { ok: true, status: 200, json: async () => ({ scores: [] }) }; });
  let now: Difficulty = 'normal';
  const s = logic.createScores({ $: () => asHtml(makeEl('report-overlay')), keyHint: () => '', toggleOverlay() {}, initials: () => 'WGR', difficulty: () => now, storage: memoryStorage(), onStorage() {} });
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
  stubWindow(memoryStorage());
  let release: (() => void) | undefined;
  const first = { ok: true, status: 200, json: async () => ({ scores: [{ name: 'AAA', best: 5, banked: 1, place: 1 }] }) };
  stubFetch(async () => first);
  const s = logic.createScores({ $: () => asHtml(makeEl('report-overlay')), keyHint: () => '', toggleOverlay() {}, initials: () => 'WGR', difficulty: () => 'normal', storage: memoryStorage(), onStorage() {} });
  await s.loadScores('normal');
  stubFetch(() => new Promise(r => { release = () => r(first); }));
  s.openScores();
  assert.ok(s.SCORES.rows, 'rows are up');
  assert.equal(s.SCORES.rows.length, 1, 'the last board stays up');
  assert.equal(s.SCORES.note, 'Loading…');
  assert.ok(release, 'the reread is waiting');
  release(); await new Promise(r => setTimeout(r, 0));
  assert.match(s.SCORES.note, /two or more players on Normal/);
});

const items = (section: StubElement, id: string) => walk(byId(section, id)).filter(n => n.localName === 'li');

test('this browser\'s list draws under the online one: rows, the run just saved, empty, and blocked', () => {
  const section = makeEl('report-overlay');
  render(section, props({ local: [{ text: '#1 WGR · 500 pts · 1 rounds won · solo', mine: false }, { text: '#2 WGR · 400 pts · 0 rounds won · room', mine: true }] }));
  assert.match(byId(section, 'scores-online-h').textContent, /Online · Room Matches with 2\+ Players/);
  assert.equal(byId(section, 'scores-local-h').textContent, 'This Browser');
  const li = items(section, 'scores-local');
  assert.equal(li.length, 2);
  assert.ok(hasClass(nth(li, 1), 'mine') && !hasClass(nth(li, 0), 'mine'));
  assert.match(nth(li, 1).textContent, /room \(just saved\)$/);
  render(section, props({ level: 'hard', local: [] }));
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, 'No runs saved in this browser on Hard yet.');
  render(section, props({ local: null }));
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, "This browser can't keep scores (storage is blocked).");
});

/** createScores on one fixed section, with the online board answering `online` (or throwing when null). */
function overlay({ storage = memoryStorage(), online = [], level = 'normal' }: { storage?: StorageLike & { data?: Map<string, string> }; online?: unknown[] | null; level?: Difficulty } = {}) {
  const section = makeEl('report-overlay');
  const listeners: Array<(key: string | null) => void> = [];
  stubFetch(async () => { if (online === null) throw new TypeError('offline'); return { ok: true, status: 200, json: async () => ({ scores: online }) }; });
  const s = logic.createScores({ $: () => asHtml(section), keyHint: () => '', toggleOverlay() {}, initials: () => 'WGR', difficulty: () => level,
    storage, onStorage: fn => listeners.push(fn) });
  return { s, section, storage, fire: (key: string | null) => listeners.forEach(fn => fn(key)) };
}
const runRow = (score: number, ref: string, o: Partial<LocalRow> = {}): LocalRow => ({ initials: 'WGR', score, rounds: 2, seed: 'x', at: '2026-10-13T00:00:00.000Z', kind: 'solo', ref, ...o });

test('with the online board out of reach, this browser\'s runs still show', async () => {
  const storage = memoryStorage();
  local.localBoard(storage).add('normal', runRow(700, 'a'));
  const { s, section } = overlay({ storage, online: null });
  await s.loadScores('normal');
  assert.equal(byId(section, 'scores-note').textContent, 'The online board is out of reach right now.');
  assert.deepEqual(items(section, 'scores').length, 0);
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, '#1 WGR · 700 pts · 2 rounds won · solo');
});

test('the switcher changes both lists to the picked difficulty', async () => {
  const storage = memoryStorage();
  local.localBoard(storage).add('normal', runRow(700, 'n'));
  local.localBoard(storage).add('hard', runRow(300, 'h', { kind: 'room' }));
  const { s, section } = overlay({ storage, online: [{ name: 'WGR', best: 9, banked: 1, place: 1 }] });
  await s.loadScores('normal');
  assert.match(nth(items(section, 'scores-local'), 0).textContent, /700 pts/);
  assert.ok(hasClass(nth(items(section, 'scores'), 0), 'mine'), 'the player\'s online row is marked');
  await s.loadScores('hard');
  assert.equal(byId(section, 'scores-level-hard').getAttribute('aria-pressed'), 'true');
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, '#1 WGR · 300 pts · 2 rounds won · room');
  await s.loadScores('easy');
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, 'No runs saved in this browser on Easy yet.');
});

test('a saved run is placed, marked as just saved, and drawn', async () => {
  const { s, section } = overlay();
  await s.loadScores('normal');
  assert.deepEqual(s.saveLocal('normal', runRow(100, 'one')), { place: 1, kept: true });
  assert.deepEqual(s.saveLocal('normal', runRow(900, 'two')), { place: 1, kept: true });
  const li = items(section, 'scores-local');
  assert.equal(li.length, 2);
  assert.ok(hasClass(nth(li, 0), 'mine') && !hasClass(nth(li, 1), 'mine'), 'only the latest save is marked');
});

test('blocked storage: a save says so, and the list says why it is empty', async () => {
  const { s, section } = overlay({ storage: throwingStorage() });
  assert.deepEqual(s.saveLocal('normal', runRow(100, 'one')), { place: null, kept: false });
  await s.loadScores('normal');
  assert.equal(nth(items(section, 'scores-local'), 0).textContent, "This browser can't keep scores (storage is blocked).");
});

test('another tab\'s save redraws the open list; main\'s old rows move over at load and when a stale tab writes them', async () => {
  const storage = memoryStorage({ [local.LEGACY_KEY]: JSON.stringify([{ name: 'ABC', score: 50, banked: 1, won: false, seed: 'old' }]) });
  const { s, section, fire } = overlay({ storage });
  await s.loadScores('normal');
  assert.match(nth(items(section, 'scores-local'), 0).textContent, /^#1 ABC · 50 pts/, 'migrated at load');
  assert.equal(storage.data.has(local.LEGACY_KEY), false);
  local.localBoard(storage).add('normal', runRow(800, 'other-tab'));
  fire(local.LOCAL_KEY);
  assert.match(nth(items(section, 'scores-local'), 0).textContent, /^#1 WGR · 800 pts/);
  storage.setItem(local.LEGACY_KEY, JSON.stringify([{ name: 'DEF', score: 900, banked: 3, won: false, seed: 'stale', difficulty: 'normal' }]));
  fire(local.LEGACY_KEY);
  assert.match(nth(items(section, 'scores-local'), 0).textContent, /^#1 DEF · 900 pts/);
  assert.equal(storage.data.has(local.LEGACY_KEY), false);
});
