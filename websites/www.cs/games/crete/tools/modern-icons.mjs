// Renders the Dictionary's Modern icons: opens icons-test.html (dist/icons-test.js, built from src/icons-page.ts) in
// headless Chrome, which draws each entry's Modern model into one sheet, and saves it as
// fx/sprites/modern-icons.webp with its map, fx/sprites/modern-icons.json. Run after a Modern model changes:
//   node ../_kit/build/build.mjs crete && node tools/modern-icons.mjs
// Playwright comes from the browser specs' folder (tests/e2e: npm ci there first).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const game = join(here, '..');
const require = createRequire(join(game, '../../tests/e2e/package.json'));
const { chromium } = require('playwright');

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(join(game, 'icons-test.html')).href);
  await page.waitForFunction(() => !!window.__icons, null, { timeout: 120_000 });
  if (errors.length) throw new Error(errors.join('\n'));
  const { sheet, webp } = await page.evaluate(() => window.__icons);
  writeFileSync(join(game, 'fx/sprites/modern-icons.webp'), Buffer.from(webp.split(',')[1], 'base64'));
  writeFileSync(join(game, 'fx/sprites/modern-icons.json'), JSON.stringify(sheet, null, 2) + '\n');
  console.log(`modern-icons: ${Object.keys(sheet.icons).length} icons, ${sheet.width}x${sheet.height}`);
} finally {
  await browser.close();
}
