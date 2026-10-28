// The editor's Share: the link's checks in their order, a link that opens again, the trials.ts entry with its escapes,
// Share running Check first when the level changed, the initials remembered, the Copy fallback, and the owner's fields
// only with the flag on.
import { test, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, fire, installDocument, makeEl, maybeById, renderTarget } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Answer, Report } from '../src/solver-host.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { TRIALS } from '../src/puzzle/trials.ts';
import { lineText } from '../src/puzzle/cache.ts';
import { MAX_LINE, decodeLink } from '../src/share/link.ts';
import { openLink } from '../src/share/open.ts';
import { fromLevel, newDraft, toText } from '../src/editor/model.ts';
import type { Draft } from '../src/editor/model.ts';

installDocument();
const stored = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  devicePixelRatio: 1,
  localStorage: { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => { stored.set(k, v); }, removeItem: (k: string) => { stored.delete(k); } },
  addEventListener() {},
  setTimeout: () => 0,
  clearTimeout() {},
};
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });
const ed = await importTsx<{
  panel: typeof import('../src/editor/share-panel.tsx');
  editor: typeof import('../src/editor/editor.ts');
}>(import.meta.dirname, { panel: '../src/editor/share-panel.tsx', editor: '../src/editor/editor.ts' });
const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

const roots: StubElement[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) preactRender(null, renderTarget(root));
  stored.clear();
  delete (globalThis.navigator as { clipboard?: unknown }).clipboard;
});
const settle = () => new Promise<void>(r => setImmediate(r));
/** Waits for `done` (the link is made on the platform's own compression streams, which take real time under load). */
const later = async (done: () => boolean) => {
  const end = Date.now() + 10_000;
  for (let i = 0; i < 20 || (!done() && Date.now() < end); i++) await (i < 20 ? settle() : new Promise<void>(r => setTimeout(r, 5)));
};

/** Trial 9 as a draft with no title, intro or pages: the level a share link carries. */
const L9 = parse(TRIALS[8]!.text);
const base = fromLevel(L9);
const DRAFT: Draft = { ...base, id: '', title: '', intro: '' };
const TEXT = toText(DRAFT, true);
const D: Difficulty = measure(parse(TEXT));
const BASE = 'https://example.test/play/crete/';

test('share refuses until the level is shareable, giving the problems', async () => {
  // Level 9 is a chase level, so it is held to the chase bar (30 moves, 6000 situations); a solo level to 40 and 12000.
  const easy: Difficulty = { ...D, shortest: 10, explored: 50, naiveWins: true };
  assert.equal(D.label, 'chase');
  const r = await ed.panel.shareLink(BASE, TEXT, easy, 'WGR', null);
  assert.deepEqual(r, {
    ok: false,
    message: 'Not shareable yet: the plain walk to the exit wins; the quickest win is 10 moves, the bar is 30; the solver searched 50 situations, the bar is 6000.',
  });
  const solo = await ed.panel.shareLink(BASE, TEXT, { ...easy, label: 'solo' }, 'WGR', null);
  assert.deepEqual(solo, {
    ok: false,
    message: 'Not shareable yet: the plain walk to the exit wins; the quickest win is 10 moves, the bar is 40; the solver searched 50 situations, the bar is 12000.',
  });
  const stopped = await ed.panel.shareLink(BASE, TEXT, { ...D, solved: false, shortest: 'unknown' }, 'WGR', null);
  assert.equal(stopped.ok, false);
  assert.match((stopped as { message: string }).message, /not proved winnable/);
});

test('share refuses blocked or malformed initials', async () => {
  for (const bad of ['', 'AB', 'ABCD', 'A1C', 'ASS']) {
    assert.deepEqual(await ed.panel.shareLink(BASE, TEXT, D, bad, null), { ok: false, message: 'Pick three letters that are not a word on the blocked list.' }, bad);
  }
});

test('share refuses a line over MAX_LINE', async () => {
  const long: Difficulty = { ...D, line: 'r'.repeat(MAX_LINE + 1) };
  assert.deepEqual(await ed.panel.shareLink(BASE, TEXT, long, 'WGR', null), { ok: false, message: "This level's quickest win is too long to share." });
});

test('share refuses a line that does not win, or cannot be read', async () => {
  const lost = await ed.panel.shareLink(BASE, TEXT, { ...D, line: 'rrrr' }, 'WGR', null);
  assert.deepEqual(lost, { ok: false, message: "The solver's line could not be read." });
  const junk = await ed.panel.shareLink(BASE, TEXT, { ...D, line: '!' }, 'WGR', null);
  assert.deepEqual(junk, { ok: false, message: "The solver's line could not be read." });
});

test('share refuses a fragment over ENCODED_MAX', async () => {
  // shareLink does not parse the text, so large incompressible text makes the fragment too long.
  let seed = 7;
  const next = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed >>> 24; };
  const noise = Array.from({ length: 30_000 }, () => String.fromCharCode(33 + (next() % 90))).join('');
  const r = await ed.panel.shareLink(BASE, noise, D, 'WGR', null);
  assert.deepEqual(r, { ok: false, message: 'This level is too large to share as a link.' });
});

test('share builds a link that openLink opens', async () => {
  const r = await ed.panel.shareLink(BASE, TEXT, D, 'wgr', 54);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.ok(r.url.startsWith(`${BASE}#L1.`));
  assert.match(r.name, /^Level [A-HJ-NP-Z2-9]{4} by WGR$/);
  const opened = await openLink(r.url.slice(r.url.indexOf('#') + 1));
  assert.ok(opened.ok);
  if (!opened.ok) return;
  assert.equal(opened.shared.text, TEXT);
  assert.equal(opened.shared.initials, 'WGR');
  assert.equal(opened.shared.best, 54);
  assert.equal(opened.name, r.name);
  assert.equal(lineText(opened.shared.line), D.line);
  const nobest = await ed.panel.shareLink(BASE, TEXT, D, 'WGR', null);
  assert.ok(nobest.ok);
  const back = await decodeLink((nobest as { url: string }).url.split('#')[1]!);
  assert.ok(back.ok && back.shared.best === null);
});

test('trialsEntry escapes backslashes, backticks and ${', () => {
  const d: Draft = { ...newDraft(3, 3), id: 'trial-x', title: 'a `b` ${c} \\d', intro: 'e' };
  const entry = ed.panel.trialsEntry(d);
  assert.ok(entry.startsWith("{ id: 'trial-x', text: `title: a \\`b\\` \\${c} \\\\d\nintro: e\n"), entry);
  assert.ok(entry.endsWith('` },'));
  // What a template literal makes of the entry is the campaign text again.
  const back = new Function(`return ${entry.replace(/^\{/, '({').replace(/,$/, ')')}`)() as { id: string; text: string };
  assert.equal(back.id, 'trial-x');
  assert.equal(back.text, toText(d, false));
  assert.equal(ed.panel.trialsEntry({ ...d, id: '  ' }).startsWith("{ id: 'trial-new', "), true);
});

/* ---------- the editor's wiring ---------- */
interface Fake { text: string; calls: string[]; answer(a: Answer): void; report(r: Report): void }
function make(opts: { owner?: boolean; pageUrl?: string } = {}) {
  if (opts.owner) stored.set('crete-owner', 'on');
  const root = makeEl('editor-root');
  roots.push(root);
  const holder = makeEl('editor-board');
  const canvas = makeEl('editor-stage');
  holder.appendChild(canvas);
  root.appendChild(holder);
  const searches: Fake[] = [];
  const editor = ed.editor.createEditor({
    root: root as unknown as HTMLElement, atlas, image: makeEl('img') as unknown as HTMLImageElement,
    tryIt: () => {}, changed: () => {}, pageUrl: () => opts.pageUrl ?? BASE,
    start: (text) => {
      const calls: string[] = [];
      let resolve!: (a: Answer) => void;
      const result = new Promise<Answer>(res => { resolve = res; });
      searches.push({ text, calls, answer: resolve, report: () => {} });
      return { progress: () => {}, stop: () => {}, resume: () => {}, cancel: () => { calls.push('cancel'); }, result };
    },
  });
  return { root, canvas, searches, editor };
}
const typeInitials = (root: StubElement, v: string) => {
  const box = byId(root, 'share-initials');
  box.value = v;
  fire(box, 'input', {});
};

test('share runs Check first when the level changed, then shows the link, name and Copy', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'wgr');
  assert.equal(byId(e.root, 'share-initials').value, 'WGR', 'uppercase as typed');
  click(byId(e.root, 'share-run'));
  assert.equal(e.searches.length, 1);
  assert.equal(e.searches[0]!.text, TEXT);
  assert.equal(byId(e.root, 'share-run').disabled, true, 'busy while the check runs');
  assert.ok(byId(e.root, 'check-progress'), 'the check panel shows the progress');
  assert.equal(maybeById(e.root, 'share-link'), undefined);
  e.searches[0]!.answer(D);
  await later(() => maybeById(e.root, 'share-link') !== undefined);
  const link = byId(e.root, 'share-link');
  assert.ok(link.value.startsWith(`${BASE}#L1.`));
  assert.match(byId(e.root, 'share-name').textContent, /^Level [A-Z0-9]{4} by WGR$/);
  assert.equal(byId(e.root, 'share-run').disabled, false);
  assert.equal(stored.get('crete-initials'), 'WGR');
  // A second Share of the same level reuses the answer.
  click(byId(e.root, 'share-run'));
  await later(() => maybeById(e.root, 'share-link') !== undefined && !byId(e.root, 'share-run').disabled);
  assert.equal(e.searches.length, 1);
  // The link goes with the level: an edit takes it away.
  click(byId(e.root, 'brush-wall'));
  const d = e.editor.draft;
  const spot = d.cells.findIndex(c => c === '.');
  assert.ok(spot >= 0);
  const rise = (10 * atlas.rise) / atlas.cell;
  e.canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: d.cols * 10, height: d.rows * 10 + rise }) as never;
  const at = { clientX: (spot % d.cols) * 10 + 5, clientY: rise + Math.floor(spot / d.cols) * 10 + 5, pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true };
  fire(e.canvas, 'pointerdown', at);
  fire(e.canvas, 'pointerup', at);
  assert.notEqual(toText(e.editor.draft, true), TEXT, 'the edit changed the level');
  assert.equal(maybeById(e.root, 'share-link'), undefined);
});

test('Stop during a Share ends the Share with a message; Share again carries the search on', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'WGR');
  click(byId(e.root, 'share-run'));
  assert.equal(byId(e.root, 'share-run').disabled, true);
  click(byId(e.root, 'check-stop'));
  assert.equal(byId(e.root, 'share-run').disabled, false, 'the button is back');
  assert.equal(byId(e.root, 'share-message').textContent, 'The search stopped before it finished; press Share again to keep going.');
  click(byId(e.root, 'share-run'));
  assert.equal(e.searches.length, 1, 'the paused search is carried on');
  assert.equal(maybeById(e.root, 'share-message'), undefined);
  assert.equal(byId(e.root, 'share-run').disabled, true);
  e.searches[0]!.answer(D);
  await later(() => maybeById(e.root, 'share-link') !== undefined);
});

test('Share while a Check of the same text is running reuses that search', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'WGR');
  click(byId(e.root, 'check-run'));
  assert.equal(e.searches.length, 1);
  click(byId(e.root, 'share-run'));
  assert.equal(e.searches.length, 1);
  e.searches[0]!.answer(D);
  await later(() => maybeById(e.root, 'share-link') !== undefined);
});

test('share with bad initials says so and runs no search', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'AB');
  click(byId(e.root, 'share-run'));
  assert.equal(byId(e.root, 'share-message').textContent, 'Pick three letters that are not a word on the blocked list.');
  assert.equal(e.searches.length, 0);
  assert.equal(stored.get('crete-initials'), undefined, 'only a valid value is saved');
});

test('the initials are remembered', () => {
  stored.set('crete-initials', 'ABC');
  const e = make();
  e.editor.open(DRAFT);
  assert.equal(byId(e.root, 'share-initials').value, 'ABC');
});

test('an unshareable answer shows its problems and no link', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'WGR');
  click(byId(e.root, 'share-run'));
  e.searches[0]!.answer({ ...D, shortest: 10, explored: 50 });
  await later(() => maybeById(e.root, 'share-message') !== undefined);
  assert.match(byId(e.root, 'share-message').textContent, /^Not shareable yet: /);
  assert.equal(maybeById(e.root, 'share-link'), undefined);
});

test('Copy writes the link to the clipboard; without it, the field is selected and the hand-copy line shows', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'WGR');
  click(byId(e.root, 'share-run'));
  e.searches[0]!.answer(D);
  await later(() => maybeById(e.root, 'share-link') !== undefined);
  // The stub has no select(); a browser's input does.
  let selected = 0;
  (byId(e.root, 'share-link') as unknown as { select(): void }).select = () => { selected++; };
  click(byId(e.root, 'share-copy'));
  await later(() => maybeById(e.root, 'share-copied') !== undefined);
  assert.equal(selected, 1, 'the field is selected');
  assert.equal(byId(e.root, 'share-copied').textContent, 'Press Ctrl+C to copy.');
  const written: string[] = [];
  Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => { written.push(t); } } });
  click(byId(e.root, 'share-copy'));
  await later(() => written.length > 0);
  assert.deepEqual(written, [byId(e.root, 'share-link').value]);
  assert.equal(byId(e.root, 'share-copied').textContent, 'Copied.');
});

test('the narrow strip has its own Share, which opens the drawer', async () => {
  const e = make();
  e.editor.open(DRAFT);
  typeInitials(e.root, 'WGR');
  click(byId(e.root, 'check-strip-share'));
  assert.equal(e.searches.length, 1);
  assert.ok(byId(e.root, 'editor-side').className.includes('open'));
  assert.equal(byId(e.root, 'check-strip-share').disabled, true);
});

test('the owner fields only with crete-owner on', () => {
  const plain = make();
  plain.editor.open(DRAFT);
  for (const id of ['owner-id', 'owner-title', 'owner-intro', 'owner-export']) assert.equal(maybeById(plain.root, id), undefined, id);
});

test('the owner edits id, title and intro as undoable edits and copies the entry', async () => {
  const e = make({ owner: true });
  e.editor.open(DRAFT);
  const set = (id: string, v: string) => { const b = byId(e.root, id); b.value = v; fire(b, 'change', {}); };
  set('owner-id', 'trial-11');
  set('owner-title', 'The Test');
  set('owner-intro', 'Go.');
  assert.deepEqual([e.editor.draft.id, e.editor.draft.title, e.editor.draft.intro], ['trial-11', 'The Test', 'Go.']);
  assert.equal(toText(e.editor.draft, true), TEXT, 'the share text does not change');
  const written: string[] = [];
  Object.defineProperty(globalThis.navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => { written.push(t); } } });
  click(byId(e.root, 'owner-export'));
  await later(() => written.length > 0);
  assert.equal(written.length, 1);
  assert.ok(written[0]!.startsWith("{ id: 'trial-11', text: `title: The Test\nintro: Go.\n"));
  assert.equal(maybeById(e.root, 'owner-id')?.id, 'owner-id');
  const ids = [...e.root.querySelectorAll('[id]')].map(n => n.id);
  assert.equal(new Set(ids).size, ids.length, 'no id twice');
});
