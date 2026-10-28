// A shared link on the game page: the card it opens (name, rating, best), a bad link's message, Play before the rating
// is in (the thread follows the link's line), Edit a copy, Q, another link or the page going away cancelling the
// rating, and the rating taking turns with the editor's Check in the one worker.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fireDocument, installDocument, makeEl, maybeById } from '../../_kit/test/dom-stub.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createOutside } from '../src/outside.ts';
import { createFoundPages } from '../src/pages.ts';
import type { Progress } from '../src/progress.ts';
import type { Board } from '../src/board.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createRater } from '../src/share/rating.ts';
import { createVisit } from '../src/share/visit.ts';
import { LINK_MESSAGES, encodeLink } from '../src/share/link.ts';
import { levelCode, sharedName } from '../src/share/name.ts';
import { fromLevel, toText } from '../src/editor/model.ts';
import { parse } from '../src/puzzle/level.ts';
import { TRIALS } from '../src/puzzle/trials.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { ANSWER, atlas, fakeSearches, installEditorWindow } from './editor-fakes.ts';

installDocument();
const stored = new Map<string, string>();
installEditorWindow(stored);
const mods = await importTsx<{
  page: typeof import('../src/ui.ts');
  card: typeof import('../src/ui/shared.tsx');
  editor: typeof import('../src/editor/editor.ts');
}>(import.meta.dirname, { page: '../src/ui.ts', card: '../src/ui/shared.tsx', editor: '../src/editor/editor.ts' });

const settle = () => new Promise<void>(r => setImmediate(r));

/** Trial `n` with no title, intro or pages, as a link carries it, and its link. */
async function linkOf(n: number, best: number | null) {
  const text = toText({ ...fromLevel(parse(TRIALS[n]!.text)), id: '', title: '', intro: '' }, true);
  const r = solve(initial(parse(text)));
  assert.ok(r.solved);
  const fragment = await encodeLink({ text, line: r.line, initials: 'ABC', best: best === null ? null : r.line.length + best });
  return { text, line: r.line, fragment, name: sharedName(await levelCode(text), 'ABC') };
}
const ONE = await linkOf(0, 2);
const TWO = await linkOf(1, null);

/* The page as main.ts wires it: the game, the slot for an outside level, the rating in a fake worker, the visit and
   the editor, whose Check goes through the rating's turns. */
const progress: Progress = { get: () => ({ cleared: false, assisted: false, best: null }), record: () => ({ cleared: true, assisted: false, best: 1 }) };
const found = createFoundPages(null);
const m = manualClock();
const fake = fakeSearches();
let solves = 0;
const outside = createOutside(CAMPAIGN_LEVELS, {
  open: i => game.open(i),
  settle: () => game.settle(),
  closeLayers: () => ui.closeLayers(),
  showEditor: () => ui.showEditor(),
  bestWon: (text, moves) => editor.tryWon(text, moves),
});
const ui = mods.page.createUi({ atlas, board: { size() {}, paint() {} } as unknown as Board, progress, pages: found, levels: outside.levels });
const game: Game = createGame({
  sfx() {}, say: ui.say, progress, pages: found, levels: outside.levels, timers: m.timers, clock: m.clock,
  reducedMotion: () => true, changed: () => ui.render(game),
  solve: ((...a: Parameters<typeof solve>) => { solves++; return solve(...a); }) as typeof solve,
});
const rater = createRater(fake.start, () => ui.refresh());
const editorRoot = makeEl('editor-root');
const holder = makeEl('editor-board');
holder.appendChild(makeEl('editor-stage'));
editorRoot.appendChild(holder);
const editor = mods.editor.createEditor({
  root: editorRoot as unknown as HTMLElement, atlas, image: makeEl('img') as unknown as HTMLImageElement,
  tryIt() {}, changed() {}, start: rater.check,
});
const visit = createVisit({
  rater,
  play: (level, about, line) => outside.play(level, about, line),
  edit: draft => ui.showEditor(draft),
  show: () => ui.showShared(),
  refuse: message => ui.refuseLink(message),
});
ui.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play() {}, editor, shared: visit });

const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const rootOf = (id: string) => document.getElementById(`${id.split('-')[0]}-root`)!;
const el = (id: string) => maybeById(rootOf(id), id);
const text = (id: string) => byId(rootOf(id), id).textContent;

afterEach(() => {
  visit.leave();
  ui.showTitle(false);
  solves = 0;
});

test('a bad link shows its message in the toast and on the title card, never a board', async () => {
  for (const [fragment, error] of [['L1.not*base64', 'damaged'], ['L2.abc', 'newer'], ['edit-me', 'not-a-link']] as const) {
    await visit.open(fragment);
    assert.equal(ui.top(), 'title', fragment);
    assert.equal(document.getElementById('toast').textContent, LINK_MESSAGES[error]);
    assert.equal(text('title-note'), LINK_MESSAGES[error]);
  }
  assert.equal(game.run, null, 'no level was opened');
  assert.equal(fake.searches.length, 0, 'no rating was started');
  ui.showTitle(false);
  assert.equal(el('title-note'), undefined, 'the title card shown again some other way has no message');
});

test('a link opens its card: the generated name, rating… and the best to beat', async () => {
  await visit.open(ONE.fragment);
  assert.equal(ui.top(), 'shared');
  assert.equal(text('shared-title'), ONE.name);
  assert.equal(text('shared-rating'), 'rating…');
  assert.equal(text('shared-best'), `beat ${ONE.line.length + 2}`);
  assert.equal(fake.searches.at(-1)!.text, ONE.text, 'the rating searches the link\'s level text');
  await visit.open(TWO.fragment);
  assert.equal(el('shared-best'), undefined, 'a link with no best names none');
});

test('play starts before the rating finishes', async () => {
  await visit.open(ONE.fragment);
  const rating = fake.searches.at(-1)!;
  click(byId(rootOf('shared-play'), 'shared-play'));
  assert.equal(game.trial, outside.at);
  assert.deepEqual(outside.levels.outside!(outside.at), { kind: 'shared', name: ONE.name, best: ONE.line.length + 2 });
  assert.equal(ui.top(), 'start');
  key('Enter');
  game.hint();
  assert.equal(game.run!.now.moves, 1);
  assert.deepEqual(game.run!.now.player, step(initial(parse(ONE.text)), ONE.line[0]!).state.player, 'the hint is the link\'s first move');
  assert.equal(solves, 0, 'the thread follows the link\'s line without solving');
  assert.deepEqual(rating.calls, [], 'the rating search runs on during play');
});

test('the card shows the rating the next time it opens, from the menu during play', async () => {
  await visit.open(ONE.fragment);
  click(byId(rootOf('shared-play'), 'shared-play'));
  fake.searches.at(-1)!.answer(ANSWER);
  await settle();
  key('Enter');
  click(byId(document.getElementById('status-root'), 'btn-menu'));
  click(byId(rootOf('menu-shared'), 'menu-shared'));
  assert.equal(ui.top(), 'shared');
  assert.equal(text('shared-rating'), 'Chase · quickest win 54 moves · 24,086 situations');
});

test('the menu offers the shared card only during a shared level', async () => {
  game.open(0);
  key('Enter');
  click(byId(document.getElementById('status-root'), 'btn-menu'));
  assert.equal(el('menu-shared'), undefined);
});

test('Q on the shared card goes to the title card', async () => {
  await visit.open(ONE.fragment);
  const ev = key('q');
  assert.equal(ev.prevented, true);
  assert.equal(ui.top(), 'title');
  assert.equal(el('title-note'), undefined);
});

test('another link, a bad link or the page going away cancels the rating', async () => {
  await visit.open(ONE.fragment);
  const first = fake.searches.at(-1)!;
  await visit.open(TWO.fragment);
  assert.deepEqual(first.calls, ['cancel']);
  const second = fake.searches.at(-1)!;
  assert.equal(second.text, TWO.text);
  await visit.open('L1.not*base64');
  assert.deepEqual(second.calls, ['cancel']);
  await visit.open(ONE.fragment);
  const third = fake.searches.at(-1)!;
  visit.leave();
  assert.deepEqual(third.calls, ['cancel']);
});

test('Edit a copy opens the editor on the level, with no initials or best carried over', async () => {
  await visit.open(ONE.fragment);
  click(byId(rootOf('shared-edit'), 'shared-edit'));
  assert.equal(ui.top(), 'editor');
  assert.deepEqual(editor.draft, fromLevel(parse(ONE.text)));
  assert.equal(editor.bestFor(ONE.text), null);
  assert.equal(byId(editorRoot, 'share-initials').value, '');
  assert.equal(stored.get('crete-initials'), undefined);
});

/* ---------- the rating and the editor's Check, one search at a time in the one worker ---------- */

test('a rating waits for the editor\'s Check, stopped or not, and never cancels it', async () => {
  const f = fakeSearches();
  const r = createRater(f.start, () => {});
  const check = r.check('CHECK');
  check.stop();
  r.rate('LINK');
  assert.equal(f.searches.length, 1, 'no rating starts while the Check holds the worker');
  assert.deepEqual(r.state, { kind: 'waiting', text: 'LINK' });
  f.searches[0]!.answer(ANSWER);
  await settle();
  assert.deepEqual(f.searches[0]!.calls, ['stop'], 'the Check was never cancelled');
  assert.equal(f.searches.length, 2);
  assert.equal(f.searches[1]!.text, 'LINK');
  assert.deepEqual(r.state, { kind: 'running', text: 'LINK' });
  f.searches[1]!.answer(ANSWER);
  await settle();
  assert.deepEqual(r.state, { kind: 'done', text: 'LINK', d: ANSWER });
});

test('a Check takes the worker from a rating, which starts again once the Check ends', async () => {
  const f = fakeSearches();
  const r = createRater(f.start, () => {});
  r.rate('LINK');
  const check = r.check('CHECK');
  assert.deepEqual(f.searches[0]!.calls, ['cancel'], 'the rating gives the worker up');
  assert.equal(f.searches[1]!.text, 'CHECK');
  assert.deepEqual(r.state, { kind: 'waiting', text: 'LINK' });
  check.cancel();
  await settle();
  assert.equal(f.searches.length, 3);
  assert.equal(f.searches[2]!.text, 'LINK');
  f.searches[2]!.fail('the solver worker failed to run');
  await settle();
  assert.deepEqual(r.state, { kind: 'failed', text: 'LINK', message: 'the solver worker failed to run' });
});

test('rating the same text again keeps its search; cancel ends it', async () => {
  const f = fakeSearches();
  const r = createRater(f.start, () => {});
  r.rate('LINK');
  r.rate('LINK');
  assert.equal(f.searches.length, 1);
  r.cancel();
  assert.deepEqual(f.searches[0]!.calls, ['cancel']);
  assert.deepEqual(r.state, { kind: 'none' });
  const check = r.check('CHECK');
  f.searches[1]!.answer(ANSWER);
  await check.result;
  await settle();
  assert.equal(f.searches.length, 2, 'a cancelled rating does not start again after a Check');
});

test('ratingText words the label, the quickest win and the situations searched', () => {
  assert.equal(mods.card.ratingText(ANSWER), 'Chase · quickest win 54 moves · 24,086 situations');
  const solo: Difficulty = { ...ANSWER, label: 'solo', shortest: 41, explored: 12161 };
  assert.equal(mods.card.ratingText(solo), 'Solo · quickest win 41 moves · 12,161 situations');
  const capped: Difficulty = { ...ANSWER, label: 'unknown', shortest: 'unknown', explored: 1 };
  assert.equal(mods.card.ratingText(capped), 'Chase or solo not known · quickest win not known · 1 situation');
});
