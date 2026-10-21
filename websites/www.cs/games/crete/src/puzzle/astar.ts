/* The Island of Crete: A* over packed situations, the search behind solver.ts. Nodes live in a NodeStore
 * (store.ts) as packed words (pack.ts); the open list is a binary heap of node ids ordered by f = g + h, then the
 * lower h, then more hearts left (of equally short lines, one that spends no needless catch), then the earlier
 * node. h is the consistent estimate of heuristic.ts, so the first win expanded is a shortest line. A situation
 * whose estimate is infinite is stored but never expanded. An optional prune (prune.ts) drops a situation before
 * it is stored; the State it is shown has `moves` set to the situation's moves from the start. A store that fails
 * (StoreError: its file cannot be written or read) ends the search capped, with the failure as its reason. DOM-free. */
import { DIRS } from './tiles.ts';
import type { Tool } from './tiles.ts';
import type { State } from './state.ts';
import { step } from './step.ts';
import type { Action } from './step.ts';
import { layoutOf, pack, unpack } from './pack.ts';
import { estimateOf } from './heuristic.ts';
import { memoryStore, StoreError } from './store.ts';
import type { NodeStore } from './store.ts';
import type { Prune } from './prune.ts';
import type { Refuse, SolveResult } from './solver.ts';

export interface SearchOptions {
  /** Stored nodes at most; reaching it ends the search `capped`. */
  cap: number;
  /** A turn that it names is a dead end. */
  refuse: Refuse | null;
  onProgress?: (p: Progress) => void;
  /** Expansions between progress reports. */
  progressEvery?: number;
  store?: NodeStore;
  /** A situation it names is dropped before it is stored. */
  prune?: Prune | null;
}

export interface Progress { expanded: number; stored: number; bestF: number; startH: number }

/** Actions as small ints, as the reference solver (test/reference-solver.ts) codes them: 0-3 a move (DIRS order), 4 a wait, 5-7 a tool. */
export const TOOL_LIST: readonly Tool[] = ['mirror', 'cake', 'cow'];
export const WAIT_CODE = DIRS.length;
export const ACTIONS: readonly Action[] = [
  ...DIRS.map((dir): Action => ({ kind: 'move', dir })),
  { kind: 'wait' },
  ...TOOL_LIST.map((tool): Action => ({ kind: 'tool', tool })),
];
/** The order a node's actions are tried: the wait, the moves, then each tool held. */
export const ORDER: readonly number[] = [WAIT_CODE, ...DIRS.map((_, i) => i), ...TOOL_LIST.map((_, i) => WAIT_CODE + 1 + i)];

function lineTo(store: NodeStore, id: number): Action[] {
  const line: Action[] = [];
  for (let i = id; store.parent(i) >= 0; i = store.parent(i)) line.push(ACTIONS[store.action(i)]!);
  return line.reverse();
}

export function astar(start: State, opts: SearchOptions): SolveResult {
  return finish(searching(start, opts), opts.onProgress);
}

/** The search in batches: every `progressEvery` expansions it yields its progress, and its return value is the
 *  answer. Between batches nothing runs, so a caller may pause it there and go on later. */
export function* searching(start: State, opts: SearchOptions): Generator<Progress, SolveResult, void> {
  if (start.outcome === 'won') return { solved: true, line: [], explored: 0 };
  const store = opts.store ?? memoryStore(layoutOf(start.level).words);
  const failed = (e: unknown): SolveResult => {
    if (e instanceof StoreError) return { solved: false, explored: store.size, capped: true, reason: e.message };
    throw e;
  };
  let run: Batch;
  try { run = begin(start, opts, store); } catch (e) { return failed(e); }
  for (;;) {
    let r: SolveResult | Progress;
    try { r = run(); } catch (e) { return failed(e); }
    if ('explored' in r) return r;
    yield r;
  }
}

/** Runs a batched search to its end, handing each batch's progress to `onProgress`. */
export function finish<T>(batches: Generator<Progress, T, void>, onProgress?: (p: Progress) => void): T {
  for (;;) {
    const n = batches.next();
    if (n.done) return n.value;
    onProgress?.(n.value);
  }
}

/** One batch: the answer, or the progress when the batch ends first. */
type Batch = () => SolveResult | Progress;

function begin(start: State, opts: SearchOptions, store: NodeStore): Batch {
  const { cap, refuse } = opts;
  const prune = opts.prune ?? null;
  const every = Math.max(1, opts.progressEvery ?? 65_536);
  const level = start.level;
  const layout = layoutOf(level);
  const estimate = estimateOf(level);
  const buf = new Uint32Array(layout.words);

  // Per node: f and h (h -1 when infinite: never expanded), its heap position (-1 when not in the heap), a win, and
  // the hearts left.
  let room = 1024;
  let fs = new Int32Array(room);
  let hs = new Int32Array(room);
  let pos = new Int32Array(room);
  let wins = new Uint8Array(room);
  let hearts = new Uint16Array(room);
  let heap = new Int32Array(room);
  let count = 0;

  const ensure = (id: number) => {
    if (id < room) return;
    while (room <= id) room *= 2;
    const f = new Int32Array(room); f.set(fs); fs = f;
    const h = new Int32Array(room); h.set(hs); hs = h;
    const p = new Int32Array(room); p.set(pos); pos = p;
    const w = new Uint8Array(room); w.set(wins); wins = w;
    const l = new Uint16Array(room); l.set(hearts); hearts = l;
  };
  const before = (a: number, b: number) => fs[a]! < fs[b]! || (fs[a] === fs[b] && (hs[a]! < hs[b]!
    || (hs[a] === hs[b] && (hearts[a]! > hearts[b]! || (hearts[a] === hearts[b] && a < b)))));
  const up = (i: number) => {
    const id = heap[i]!;
    while (i > 0) {
      const j = (i - 1) >> 1;
      const p = heap[j]!;
      if (!before(id, p)) break;
      heap[i] = p; pos[p] = i; i = j;
    }
    heap[i] = id; pos[id] = i;
  };
  const push = (id: number) => {
    if (count === heap.length) { const h = new Int32Array(heap.length * 2); h.set(heap); heap = h; }
    heap[count] = id;
    up(count++);
  };
  const pop = (): number => {
    const top = heap[0]!;
    pos[top] = -1;
    const last = heap[--count]!;
    if (count > 0) {
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= count) break;
        const r = l + 1;
        const c = r < count && before(heap[r]!, heap[l]!) ? r : l;
        if (!before(heap[c]!, last)) break;
        heap[i] = heap[c]!; pos[heap[i]!] = i; i = c;
      }
      heap[i] = last; pos[last] = i;
    }
    return top;
  };

  const startH = estimate(start);
  pack(start, layout, buf, 0);
  if (prune && prune({ ...start, moves: 0 }, buf, 0)) return () => ({ solved: false, explored: 0, capped: false });
  const root = store.add(buf, 0, -1, 0, 0);
  if (store.size >= cap) return () => ({ solved: false, explored: store.size, capped: true });
  ensure(root);
  hs[root] = Number.isFinite(startH) ? startH : -1;
  fs[root] = hs[root]!;
  pos[root] = -1;
  hearts[root] = start.hearts;
  if (hs[root]! >= 0) push(root);

  let expanded = 0;
  return () => {
    // A batch ends at the top of the loop once a progress point has passed, so the node reported is expanded first.
    let paused: Progress | null = null;
    while (count > 0) {
      if (paused) return paused;
      const id = pop();
      if (wins[id]) return { solved: true, line: lineTo(store, id), explored: store.size };
      const f = fs[id]!;
      const g = f - hs[id]!;
      if (++expanded % every === 0) paused = { expanded, stored: store.size, bestF: f, startH };
      store.words(id, buf, 0);
      const s = unpack(buf, 0, layout, level, g);
      for (const c of ORDER) {
        if (c > WAIT_CODE && s.tools[TOOL_LIST[c - WAIT_CODE - 1]!] <= 0) continue;
        const r = step(s, ACTIONS[c]!);
        const n = r.state;
        if (n === s || n.outcome === 'lost' || (refuse && refuse(r.events, s))) continue;
        pack(n, layout, buf, 0);
        if (prune && prune(n, buf, 0)) continue;
        const size = store.size;
        const nid = store.add(buf, 0, id, c, g + 1);
        if (nid < 0) continue;
        const won = n.outcome === 'won';
        if (store.size > size) {
          ensure(nid);
          const h = won ? 0 : estimate(n);
          hs[nid] = Number.isFinite(h) ? h : -1;
          pos[nid] = -1;
          wins[nid] = won ? 1 : 0;
          hearts[nid] = n.hearts;
        }
        // A win at f: nothing open is shorter (f never exceeds the shortest line), so it is a shortest line.
        if (won && g + 1 === f) return { solved: true, line: lineTo(store, nid), explored: store.size };
        if (store.size >= cap) return { solved: false, explored: store.size, capped: true };
        if (hs[nid]! < 0) continue;
        fs[nid] = g + 1 + hs[nid]!;
        if (pos[nid]! >= 0) up(pos[nid]!);
        else push(nid);
      }
    }
    return { solved: false, explored: store.size, capped: false };
  };
}
