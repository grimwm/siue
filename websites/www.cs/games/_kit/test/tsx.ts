// Loads .tsx modules into a node:test file. Node strips types but cannot run
// JSX, so esbuild bundles them once, leaving preact external so the test and
// the components share Node's one copy (hooks and contexts break across two).
import * as esbuild from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** `modules` maps a name to a path relative to `fromDir`; the result holds each module's exports under its name. */
export async function importTsx(fromDir: string, modules: Record<string, string>): Promise<Record<string, Record<string, unknown>>> {
  // Inside the caller's folder, so the bundle's bare `preact` resolves to games/node_modules.
  const tmp = mkdtempSync(join(fromDir, '.tmp-'));
  process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));
  const out = join(tmp, 'bundle.mjs');
  await esbuild.build({
    stdin: {
      contents: Object.entries(modules).map(([name, path]) => `export * as ${name} from ${JSON.stringify(path)};`).join('\n'),
      resolveDir: fromDir,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    external: ['preact', 'preact/*'],
    jsx: 'automatic',
    jsxImportSource: 'preact',
    outfile: out,
    logLevel: 'silent',
  });
  return (await import(pathToFileURL(out).href)) as Record<string, Record<string, unknown>>;
}
