// Crete's solver in its Web Worker: level 10 is solved off the page, with its pinned shortest line, progress on the
// way and the nodes' file on disk (the origin private file system), while the page keeps drawing frames. The same
// level again answers from the result cache, with no progress.
import { test, expect } from '@playwright/test';

const PAGE = 'games/crete/';
const LEVEL_10_SHORTEST = 76;

interface Report { expanded: number; stored: number; storage: string }
interface CreteTest {
  TRIALS: { id: string; text: string }[];
  solveInWorker(text: string): Promise<{ result: { solved: boolean; line?: unknown[] }; progress: Report[] }>;
}

test('level 10 is solved in the worker, with progress, while the page keeps drawing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(PAGE);
  await page.waitForFunction(() => 'solveInWorker' in ((window as unknown as { __creteTest?: object }).__creteTest ?? {}));

  const run = () => page.evaluate(async () => {
    const t = (window as unknown as { __creteTest: CreteTest }).__creteTest;
    let frames = 0;
    let running = true;
    const count = () => { if (!running) return; frames++; requestAnimationFrame(count); };
    requestAnimationFrame(count);
    const t0 = performance.now();
    const { result, progress } = await t.solveInWorker(t.TRIALS[9]!.text);
    running = false;
    return {
      solved: result.solved,
      length: result.line?.length ?? -1,
      reports: progress.length,
      storages: [...new Set(progress.map(p => p.storage))],
      frames,
      ms: performance.now() - t0,
    };
  });

  const first = await run();
  expect(first.solved).toBe(true);
  expect(first.length, 'the pinned shortest line').toBe(LEVEL_10_SHORTEST);
  expect(first.reports, 'progress arrives during the search').toBeGreaterThan(0);
  expect(first.storages, 'the nodes go to the origin private file system').toEqual(['disk']);
  expect(first.frames, `frames drawn during the ${Math.round(first.ms)} ms search`).toBeGreaterThanOrEqual(3);

  const again = await run();
  expect(again.length).toBe(LEVEL_10_SHORTEST);
  expect(again.reports, 'the second run answers from the result cache').toBe(0);
  expect(errors).toEqual([]);
});
