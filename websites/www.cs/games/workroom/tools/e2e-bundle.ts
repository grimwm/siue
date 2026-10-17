// Builds the workroom page with the test key built in, for the local browser
// check only (make music-e2e): every import of public-key.ts resolves to the
// test fixture. The shipped dist/ is never built this way.
// Usage, from websites/www.cs/games: node workroom/tools/e2e-bundle.ts <out.js>
import * as esbuild from 'esbuild';
import { join } from 'node:path';

const out = process.argv[2];
if (!out) {
  console.error('usage: node workroom/tools/e2e-bundle.ts <out.js>');
  process.exit(1);
}
const root = join(import.meta.dirname, '..');
const fixture = join(root, 'test', 'fixtures', 'public-key.ts');
await esbuild.build({
  absWorkingDir: root, entryPoints: ['src/main.ts'], outfile: out, bundle: true, format: 'esm',
  platform: 'browser', target: 'es2022', jsx: 'automatic', jsxImportSource: 'preact', logLevel: 'warning',
  plugins: [{ name: 'test-key', setup(b) { b.onResolve({ filter: /\/public-key\.ts$/ }, () => ({ path: fixture })); } }],
});
