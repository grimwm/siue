// What cylon.js may and may not reach. Run here: `node smoke-test.js`.
// Static checks on the shipped files (no browser): the entry module imports
// every compiled module with a `?v=`, the compiled modules import nothing, and
// the game names nothing the site's own scripts define.
import fs from 'node:fs';
import path from 'node:path';

const __dirname = import.meta.dirname;
const read = (...p) => fs.readFileSync(path.join(__dirname, ...p), 'utf8');
const src = read('cylon.js');

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
check('mount-fetch-carries-a-version', /new URL\('mount\.html\?v=[0-9a-f]+', import\.meta\.url\)/.test(src), '');
// The one version lives on cylon.js's imports. A js/ module that imported another
// would name it without that ?v=, and the browser would load a second copy.
check('js-modules-import-nothing', jsFiles.every(f => !/^\s*(import|export)\b[^;]*\bfrom\s*['"]/m.test(read('js', f))), '');
check('every-compiled-module-has-a-source', jsFiles.every(f => fs.existsSync(path.join(__dirname, 'src', f.replace(/\.js$/, '.ts')))), '');

// Self-contained: it finds its own files from its own URL, and takes what it
// needs from the page as options.
check('exports-the-entry-point', /^export async function initializeCylonEffects\(options = \{\}\)/m.test(src), '');
check('finds-its-files-by-its-own-url', !/data-cylon-base|data-cylon-api|cylonAsset/.test(src) && src.includes('import.meta.url'), '');
check('takes-the-theme-hook-as-an-option', /options\.onTheme/.test(src), '');

// Games do not know the site: nothing the site's scripts define may appear in
// the game. Skipped when the game is copied out of the site.
const siteMain = path.join(__dirname, '..', '..', 'main.js');
if (fs.existsSync(siteMain)) {
  const names = [...fs.readFileSync(siteMain, 'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  check('site-script-has-functions-to-look-for', names.length > 5, String(names));
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const reached = names.filter(n => new RegExp(`\\b${n}\\b`).test(code));
  check('reaches-no-site-function', reached.length === 0, reached.join(', '));
  const constants = [...fs.readFileSync(siteMain, 'utf8').matchAll(/^(?:const|let|var) (\w+)\s*=/gm)].map(m => m[1]);
  const reachedConst = constants.filter(n => new RegExp(`\\b${n}\\b`).test(code));
  check('reaches-no-site-variable', reachedConst.length === 0, reachedConst.join(', '));
}

console.log(failed ? `SMOKE-FAIL ${failed}` : 'SMOKE-OK');
process.exit(failed ? 1 : 0);
