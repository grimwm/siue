// What the editor's tests share: a fake solver whose searches answer on demand, the page's window and storage in the
// DOM stub, the canned report and answer, and an editor on a stub root.
import { readFileSync } from 'node:fs';
import { makeEl } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { Atlas } from '../src/board-plan.ts';
import { CancelledError } from '../src/solver-client.ts';
import type { SolverJob } from '../src/solver-client.ts';
import type { Answer, Report } from '../src/solver-host.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Action } from '../src/puzzle/step.ts';
import type { Editor, EditorDeps } from '../src/editor/editor.ts';

export const REPORT: Report = { expanded: 10, stored: 1234, bestF: 40, startH: 30, storage: 'disk' };
export const ANSWER: Difficulty = {
  solved: true, shortest: 54, explored: 24086, withoutMinotaur: 32, minotaurDelta: 22, greedyWins: false, catchFree: 54,
  catches: 0, label: 'chase', naiveWins: false, line: 'rrdd',
};

/** One search the fake solver was asked for. `calls` are the stop, resume and cancel it was sent. */
export interface FakeSearch {
  job: SolverJob;
  text: string;
  calls: string[];
  answer(a: Answer): void;
  fail(message: string): void;
  report(r: Report): void;
}

/** A solver whose searches wait for the test. Like the real client, `cancel()` rejects `result` with CancelledError. */
export function fakeSearches(): { start: (text: string) => SolverJob; searches: FakeSearch[] } {
  const searches: FakeSearch[] = [];
  return {
    searches,
    start(text) {
      const calls: string[] = [];
      const cbs: ((r: Report) => void)[] = [];
      let resolve!: (a: Answer) => void, reject!: (e: Error) => void;
      const result = new Promise<Answer>((res, rej) => { resolve = res; reject = rej; });
      result.catch(() => {});
      const job: SolverJob = {
        progress: cb => { cbs.push(cb); },
        stop: () => { calls.push('stop'); },
        resume: () => { calls.push('resume'); },
        cancel: () => { calls.push('cancel'); reject(new CancelledError()); },
        result,
      };
      searches.push({ job, text, calls, answer: resolve, fail: m => reject(new Error(m)), report: r => { for (const cb of cbs) cb(r); } });
      return job;
    },
  };
}

/** The window the editor reads: the pixel ratio and local storage, kept in `stored`. */
export function installEditorWindow(stored: Map<string, string>): void {
  (globalThis as { window?: unknown }).window = {
    devicePixelRatio: 1,
    localStorage: { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => { stored.set(k, v); }, removeItem: (k: string) => { stored.delete(k); } },
    addEventListener() {},
    setTimeout: () => 0,
    clearTimeout() {},
  };
  (globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });
}

export const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

interface EditorOpts {
  owner?: boolean;
  pageUrl?: string;
}
export interface MadeEditor {
  root: StubElement;
  canvas: StubElement;
  /** Each Try it the editor handed over. */
  tries: { level: Level; text: string; line: Action[] | null }[];
  searches: FakeSearch[];
  /** How many times the editor said it changed. */
  changes: () => number;
  editor: Editor;
}

/** An editor on a stub root with a fake solver. `roots` collects the root, for the test's cleanup. */
export function makeEditor(
  createEditor: (deps: EditorDeps) => Editor, stored: Map<string, string>, roots: StubElement[], opts: EditorOpts = {},
): MadeEditor {
  if (opts.owner) stored.set('crete-owner', 'on');
  const root = makeEl('editor-root');
  roots.push(root);
  const holder = makeEl('editor-board');
  const canvas = makeEl('editor-stage');
  holder.appendChild(canvas);
  root.appendChild(holder);
  const tries: MadeEditor['tries'] = [];
  let changes = 0;
  const { start, searches } = fakeSearches();
  const editor = createEditor({
    root: root as unknown as HTMLElement, atlas, image: makeEl('img') as unknown as HTMLImageElement,
    tryIt: (level, text, line) => { tries.push({ level, text, line }); }, changed: () => { changes++; },
    ...(opts.pageUrl ? { pageUrl: () => opts.pageUrl! } : {}), start,
  });
  return { root, canvas, tries, searches, changes: () => changes, editor };
}
