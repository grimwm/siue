/* The Island of Crete: Endless's worker side, as a message handler. It runs one part of a level's search
 * (src/endless/generate.ts's makePart) and posts its progress, at most every PROGRESS_MS, then what the part came
 * to; or it answers a level from the bank. A part runs straight through, so the page cancels one by ending its
 * worker (src/endless/client.ts); worker.ts wires it to the Worker and the tests run it in-process. DOM-free. */
import { bankFor, makePart } from './generate.ts';
import type { BankLevel, Made, Part, Progress, Request } from './generate.ts';
import type { Known } from './gate.ts';

export type ToEndless =
  | { type: 'part'; id: number; request: Request; part: number }
  | { type: 'bank'; id: number; request: Request; tries: number; spent: number };
export type FromEndless =
  | { type: 'progress'; id: number; progress: Progress }
  | { type: 'part'; id: number; part: number; result: Part }
  | { type: 'made'; id: number; made: Made }
  | { type: 'failed'; id: number; message: string };

export interface EndlessHostDeps {
  post(m: FromEndless): void;
  bank: readonly BankLevel[];
  /** The campaign's layouts, worked out on the first request. */
  known(): Known;
  /** Milliseconds, for spacing the progress posts. */
  now(): number;
}

export const PROGRESS_MS = 150;

export function createEndlessHost(deps: EndlessHostDeps): { receive(m: ToEndless): void } {
  let known: Known | null = null;
  return {
    receive(m) {
      try {
        if (m.type === 'bank') { deps.post({ type: 'made', id: m.id, made: bankFor(m.request, deps.bank, m.tries, m.spent) }); return; }
        if (m.type !== 'part') return;
        known ??= deps.known();
        let last = -Infinity;
        const result = makePart(m.request, m.part, known, {
          progress: (p) => {
            const t = deps.now();
            if (t - last < PROGRESS_MS) return;
            last = t;
            deps.post({ type: 'progress', id: m.id, progress: p });
          },
        });
        deps.post({ type: 'part', id: m.id, part: m.part, result });
      } catch (e) {
        deps.post({ type: 'failed', id: m.id, message: e instanceof Error ? e.message : String(e) });
      }
    },
  };
}
