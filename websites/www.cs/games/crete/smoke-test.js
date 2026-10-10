// What game.js may and may not reach. Run here: `node smoke-test.js`.
// Static checks on the shipped files (no browser): the entry module imports
// every compiled module with a `?v=`, the compiled modules import nothing, the
// page loads the entry as a module, and the game names nothing the site's own
// scripts define.
import fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;
const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
const src = read('game.js');
const html = read('index.html');

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

// Versions: each import of a js/ module carries a ?v=, and every module is imported once.
const jsFiles = fs.readdirSync(path.join(__dirname, 'js')).filter(f => f.endsWith('.js'));
const imported = [...src.matchAll(/from '\.\/js\/([\w-]+\.js)\?v=([0-9a-f]+)'/g)].map(m => m[1]);
check('modules-imported-with-a-version', imported.length > 0
  && (src.match(/from '\.\/js\/[^']*'/g) || []).length === imported.length, String(imported));
check('every-js-module-imported-once', jsFiles.every(f => imported.filter(i => i === f).length === 1), `${jsFiles} vs ${imported}`);
// The one version lives on game.js's imports. A js/ module that imported another
// would name it without that ?v=, and the browser would load a second copy.
check('js-modules-import-nothing', jsFiles.every(f => !/^\s*(import|export)\b[^;]*\bfrom\s*['"]/m.test(read('js', f))), '');
check('every-compiled-module-has-a-source', jsFiles.every(f => fs.existsSync(path.join(__dirname, 'src', f.replace(/\.js$/, '.ts')))), '');

// The page loads the entry as a module, with versions on it and the stylesheet.
check('page-loads-game-as-a-module', /<script type="module" src="game\.js\?v=[0-9a-f]+"><\/script>/.test(html), '');
check('page-versions-the-stylesheet', /href="game\.css\?v=[0-9a-f]+"/.test(html), '');

// The engine is the DOM-free part: it never names the page.
const engine = read('js', 'engine.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
check('engine-never-names-the-page', !/\b(document|window|navigator|localStorage|AudioContext)\b/.test(engine), '');

// The entry hands the test hook what the browser specs drive.
check('test-hook-is-exposed', /window\.__mazeTest = \{/.test(src), '');

// Games do not know the site: nothing the site's scripts define may appear in
// the game. Skipped when the game is copied out of the site.
const siteMain = path.join(__dirname, '..', '..', 'main.js');
if (fs.existsSync(siteMain)) {
  const main = fs.readFileSync(siteMain, 'utf8');
  const names = [...main.matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  check('site-script-has-functions-to-look-for', names.length > 5, String(names));
  const code = [src, ...jsFiles.map(f => read('js', f))].join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const reached = names.filter(n => new RegExp(`\\b${n}\\b`).test(code));
  check('reaches-no-site-function', reached.length === 0, reached.join(', '));
}

console.log(failed ? `SMOKE-FAIL ${failed}` : 'SMOKE-OK');
process.exit(failed ? 1 : 0);
