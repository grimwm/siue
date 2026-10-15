/* Operation Tankity: the room puzzle's bench, for tools/pow-bench.html.
 *
 * Solves `runs` fresh puzzles at `bits` with the game's own solver
 * (src/pow.ts) on this browser's WebCrypto, one after another, and answers
 * the times in milliseconds with their mean and 95th percentile, plus the
 * longest the page's thread was held up meanwhile (a 10 ms timer's worst
 * lateness): what tests/e2e/tankity-pow.spec.ts reads to set the
 * difficulty (README "Room slots"). Never shipped: deploy.sh skips it. */
import { POW_IN_FLIGHT, solvePow } from './pow.ts';
import type { Subtle } from './pow.ts';

export interface BenchResult { bits: number; runs: number; times: number[]; mean: number; p95: number; maxLagMs: number }

export async function bench(bits: number, runs = 20, inFlight = POW_IN_FLIGHT): Promise<BenchResult> {
  const subtle = crypto.subtle as unknown as Subtle;
  const times: number[] = [];
  let maxLag = 0;
  let last = performance.now();
  const timer = setInterval(() => {
    const now = performance.now();
    maxLag = Math.max(maxLag, now - last - 10);
    last = now;
  }, 10);
  try {
    for (let i = 0; i < runs; i++) {
      const rand = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
      const challenge = `v1.${Math.floor(Date.now() / 1000)}.j.${bits}.${rand}.bench`;
      const t0 = performance.now();
      await solvePow({ challenge, bits, count: 4, iter: 100 }, subtle, { inFlight });
      times.push(performance.now() - t0);
    }
  } finally {
    clearInterval(timer);
  }
  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1)]!;
  return { bits, runs, times, mean, p95, maxLagMs: maxLag };
}
