// The Crete level editor in a browser: building a level and trying it, sharing it as a link and winning it on a phone,
// a damaged link, and the addresses and keys around them. Any change to the editor must keep this green.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const KEY: Record<string, string> = { mirror: 'z', cake: 'x', cow: 'c', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', wait: '.' };

interface Act { kind: string; dir?: string; tool?: string }
interface CreteTest {
  game: { run: { now: { outcome: string } } };
  TRIALS: { text: string }[];
  solve(s: unknown): { solved: boolean; line: Act[] };
  editor: { draft: { rows: number; cols: number; cells: string[] }; load(text: string): void };
}
declare global {
  interface Window { __creteTest: CreteTest }
}

const draftOf = (page: Page) => page.evaluate(() => JSON.stringify(window.__creteTest.editor.draft));

/** The game's own winning line for the level in play, pressed through the page's keys. */
async function winWithKeys(page: Page): Promise<void> {
  const steps = await page.evaluate(() => {
    const t = window.__creteTest;
    const r = t.solve(t.game.run.now);
    return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind === 'tool' ? a.tool! : a.kind)) : [];
  });
  expect(steps.length).toBeGreaterThan(0);
  for (const s of steps) await page.keyboard.press(KEY[s]!);
  expect(await page.evaluate(() => window.__creteTest.game.run.now.outcome)).toBe('won');
}

/** Paints one cell with the selected brush, as a click on the editor's board does (cells are square, the board's
 *  extra height is the rise above the first row). */
async function paint(page: Page, r: number, c: number): Promise<void> {
  const box = (await page.locator('#editor-stage').boundingBox())!;
  const { rows, cols } = await page.evaluate(() => window.__creteTest.editor.draft);
  const cell = box.width / cols;
  await page.mouse.click(box.x + (c + 0.5) * cell, box.y + box.height - (rows - r - 0.5) * cell);
}

/** Trial 9 with no title, intro or page, as a link carries a level. */
const bareTrial9 = (page: Page) => page.evaluate(() => {
  const [head, grid] = window.__creteTest.TRIALS[8]!.text.split('\n\n');
  const lines = head!.split('\n').filter(l => !/^(title|intro|pages):/.test(l));
  return `title: \nintro: \n${lines.join('\n')}${lines.length ? '\n' : ''}\n${grid!.replace(/p/g, '.')}`;
});

test('builds a small level and tries it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${PAGE}#edit`);
  await expect(page.locator('#editor-root')).toBeVisible();
  await page.locator('#brush-wall').click();
  await paint(page, 3, 3);
  await paint(page, 3, 4);
  await paint(page, 4, 3);
  const painted = await page.evaluate(() => window.__creteTest.editor.draft.cells.filter(ch => ch === '#').length);
  expect(painted, 'three cells were painted').toBeGreaterThanOrEqual(3);
  const before = await draftOf(page);

  await page.locator('#editor-try').click();
  await expect(page.locator('#editor-root')).toBeHidden();
  await expect(page.locator('#start-veil'), 'a try opens on the start card').toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#start-veil')).toBeHidden();
  await winWithKeys(page);
  await expect(page.locator('#end-veil')).toBeVisible();

  await page.locator('#end-editor').click();
  await expect(page.locator('#editor-root')).toBeVisible();
  expect(await draftOf(page), 'the draft is unchanged').toBe(before);
  expect(errors).toEqual([]);
});

test('Q from #edit clears the address and shows the title card', async ({ page }) => {
  await page.goto(`${PAGE}#edit`);
  await expect(page.locator('#editor-root')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#editor-root')).toBeHidden();
  expect(new URL(page.url()).hash).toBe('');
});

test('shares a level and wins it on a phone', async ({ page, browser }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  // The editor has not been opened yet: loading a level leaves no empty draft beneath it.
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  const level = await bareTrial9(page);
  await page.evaluate(t => window.__creteTest.editor.load(t), level);
  await expect(page.locator('#editor-root')).toBeVisible();
  expect(await page.evaluate(() => window.__creteTest.editor.draft.rows)).toBe(11);
  await page.keyboard.press('u');
  expect(await page.evaluate(() => window.__creteTest.editor.draft.rows), 'no empty draft beneath the loaded level').toBe(11);

  await page.locator('#share-initials').fill('WGR');
  await page.locator('#share-run').click();
  await expect(page.locator('#share-link')).toBeVisible({ timeout: 180_000 });
  const link = await page.locator('#share-link').inputValue();
  expect(link).toMatch(/#L1\./);

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  try {
    const p = await phone.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto(link);
    await expect(p.locator('#shared-veil')).toBeVisible();
    await expect(p.locator('#shared-title')).toHaveText(/^Level [A-Z2-9]{4} by WGR$/);
    await p.locator('#shared-play').click();
    await expect(p.locator('#start-veil')).toBeVisible();
    await p.keyboard.press('Enter');
    await expect(p.locator('#start-veil')).toBeHidden();
    await winWithKeys(p);
    await expect(p.locator('#end-veil')).toBeVisible();
    await expect(p.locator('#end-title')).not.toHaveText('');
    // The author never won this level in Try it, so the link carries no best to beat.
    await expect(p.locator('#end-text')).toHaveText('You found the way on your own.');
  } finally {
    await phone.close();
  }
  expect(errors).toEqual([]);
});

test('a damaged link shows a message, never a board', async ({ page }) => {
  await page.goto(`${PAGE}#L1.not*base64`);
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#title-note')).toHaveText(/damaged/i);
  await expect(page.locator('#shared-veil')).toBeHidden();
  await expect(page.locator('#start-veil')).toBeHidden();
});

test('a link opened in a page shows the card; Edit a copy then U brings back the earlier draft; Back goes to the title card', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto(`${PAGE}#edit`);
  await expect(page.locator('#editor-root')).toBeVisible();
  const level = await bareTrial9(page);
  await page.evaluate(t => window.__creteTest.editor.load(t), level);
  await page.locator('#share-initials').fill('WGR');
  await page.locator('#share-run').click();
  await expect(page.locator('#share-link')).toBeVisible({ timeout: 180_000 });
  const link = await page.locator('#share-link').inputValue();
  const earlier = await draftOf(page);

  // The same page follows a link put in its address.
  await page.evaluate(l => { window.location.hash = l.slice(l.indexOf('#') + 1); }, link);
  await expect(page.locator('#shared-veil')).toBeVisible();
  await expect(page.locator('#shared-title')).toHaveText(/^Level [A-Z2-9]{4} by WGR$/);

  // Edit a copy is one undo step on this draft: U brings the earlier one back.
  await page.locator('#shared-edit').click();
  await expect(page.locator('#editor-root')).toBeVisible();
  expect(new URL(page.url()).hash).toBe('#edit');
  await page.keyboard.press('u');
  expect(await draftOf(page)).toBe(earlier);

  // The browser's Back from a link's card, to the address with no fragment, is the title card.
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.goto(link);
  await expect(page.locator('#shared-veil')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#shared-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
});
