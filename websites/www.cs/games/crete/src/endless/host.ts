/* The Island of Crete: Endless's worker side, as a message handler. It takes a request for a run's level, runs the
 * generator (src/endless/generate.ts) and posts its progress, at most every PROGRESS_MS, then the level. The
 * generator runs straight through, so the page cancels a search by ending the worker (src/endless/client.ts);
 * worker.ts wires it to the Worker and the tests run it in-process. DOM-free. */
import { generate } from './generate.ts';
import type { BankLevel, Made, Progress, Request } from './generate.ts';
import type { Known } from './gate.ts';

export type ToEndless = { type: 'make'; id: number; request: Request };
export type FromEndless =
  | { type: 'progress'; id: number; progress: Progress }
  | { type: 'made'; id: number; made: Made }
  | { type: 'failed'; id: number; message: string };

export interface EndlessHostDeps {
  post(m: FromEndless): void;
  bank: readonly BankLevel[];
  /** The campaign's layouts, worked out on the first request. */
  known(): Known;
  /** Milliseconds, for spacing the progress posts. */
  now(): number;
  /** The generator's budget; its own by default. */
  budget?: number;
}

export const PROGRESS_MS = 150;

export function createEndlessHost(deps: EndlessHostDeps): { receive(m: ToEndless): void } {
  let known: Known | null = null;
  return {
    receive(m) {
      if (m.type !== 'make') return;
      try {
        known ??= deps.known();
        let last = -Infinity;
        const made = generate(m.request, deps.bank, known, {
          ...(deps.budget !== undefined ? { budget: deps.budget } : {}),
          progress: (p) => {
            const t = deps.now();
            if (t - last < PROGRESS_MS) return;
            last = t;
            deps.post({ type: 'progress', id: m.id, progress: p });
          },
        });
        deps.post({ type: 'made', id: m.id, made });
      } catch (e) {
        deps.post({ type: 'failed', id: m.id, message: e instanceof Error ? e.message : String(e) });
      }
    },
  };
}
