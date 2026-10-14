// A node:test reporter for census.ts: one JSON line per run, holding the leaf
// tests that completed, their names, and every failure. A leaf is a test no
// deeper test completed inside; suites (describe) are never leaves.
import type { TestEvent } from 'node:test/reporters';

export interface CensusRun {
  leaves: number;
  names: string[];
  /** Names of the leaves that were skipped; omitted when none were. */
  skipped?: string[];
  failures: { name: string; error: string }[];
  /** Set when the file itself failed (did not load, or its process died), not one of its tests. */
  loadError?: string;
}

export default async function* censusReporter(source: AsyncIterable<TestEvent>): AsyncGenerator<string> {
  const run: CensusRun = { leaves: 0, names: [], failures: [] };
  // childDone[n]: a test at nesting n+1 completed since the last test at nesting n did.
  const childDone: boolean[] = [];
  const stderr: string[] = [];
  for await (const event of source) {
    if (event.type === 'test:stderr') stderr.push(event.data.message);
    if (event.type !== 'test:pass' && event.type !== 'test:fail') continue;
    const { name, nesting, details } = event.data;
    const leaf = !childDone[nesting];
    childDone[nesting] = false;
    if (nesting > 0) childDone[nesting - 1] = true;
    if (event.type === 'test:fail') {
      const error = event.data.details.error;
      // The runner's own failure for a file whose process exited badly carries the exit code; a test's failure never does.
      if ('exitCode' in error || 'signal' in error) {
        run.loadError = `${error.message}\n${stderr.join('')}`.trim();
      } else {
        run.failures.push({ name, error: error.message });
      }
      continue;
    }
    if (details.type === 'suite' || !leaf) continue;
    run.leaves++;
    run.names.push(name);
    if (event.data.skip !== undefined && event.data.skip !== false) (run.skipped ??= []).push(name);
  }
  run.names.sort();
  run.skipped?.sort();
  yield `${JSON.stringify(run)}\n`;
}
