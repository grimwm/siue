// The Island of Crete's two looks show a level at the same size and in the same place: at the opening view (75°,
// north up, the whole level), the corner squares stand where they stood in the other look, on a desktop and on a
// phone (src/modern/camera.ts wholeZoom, src/sheet.ts wholeFrame).
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, and the Modern look, so the specs start on the 3D board. */
const setUp = (): void => {
  localStorage.setItem('crete-met', '["*"]');
  localStorage.setItem('crete-look', 'modern');
};

interface Spot { x: number; y: number }
interface Hooked {
  __creteTest: {
    levelById(id: string): unknown;
    playLevel(level: unknown): void;
    modern: { active: boolean; frames(): number; at(c: number, r: number): Spot | null };
    classic: { at(c: number, r: number): Spot | null };
    game: { run: { now: { level: { cols: number; rows: number } } } };
  };
}

/** The level's four corner squares' centres in the look `look`, near row first. */
const corners = (page: Page, look: 'modern' | 'classic') => page.evaluate(look => {
  const t = (window as unknown as Hooked).__creteTest;
  const { cols, rows } = t.game.run.now.level;
  const at = (c: number, r: number) => t[look].at(c, r);
  return [at(0, rows - 1), at(cols - 1, rows - 1), at(0, 0), at(cols - 1, 0)];
}, look);

/** The box round the four corner squares: its centre, width and height. */
function box(spots: (Spot | null)[]): { cx: number; cy: number; w: number; h: number } {
  const s = spots.map(p => p!);
  const xs = s.map(p => p.x), ys = s.map(p => p.y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  return { cx: (left + right) / 2, cy: (top + bottom) / 2, w: right - left, h: bottom - top };
}

async function open(page: Page, id: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(setUp);
  await page.goto('games/crete/');
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(id => { const t = (window as unknown as Hooked).__creteTest; t.playLevel(t.levelById(id)); }, id);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForFunction(() => {
    const m = (window as unknown as Hooked).__creteTest.modern;
    return m.active && m.frames() > 3 && m.at(0, 0) !== null;
  }, null, { timeout: 60_000 });
  return errors;
}

/** The corners once two reads a frame apart agree: the camera has settled. */
async function settled(page: Page, look: 'modern' | 'classic'): Promise<(Spot | null)[]> {
  let last = '';
  let now: (Spot | null)[] = [];
  await expect.poll(async () => {
    now = await corners(page, look);
    const key = JSON.stringify(now.map(p => p && [Math.round(p.x), Math.round(p.y)]));
    const same = key === last && !key.includes('null');
    last = key;
    return same;
  }, { message: `the ${look} board settles` }).toBe(true);
  return now;
}

for (const [label, size] of [['desktop', { width: 1280, height: 720 }], ['phone', { width: 390, height: 844 }]] as const) {
  test.describe(label, () => {
    test.use({ viewport: size });
    for (const id of ['ch2-6', 'trial-10']) {
      test(`${id} shows at the same size and place in both looks`, async ({ page }) => {
        const errors = await open(page, id);
        const modern = box(await settled(page, 'modern'));
        await page.keyboard.press('b');
        await page.waitForSelector('#stage[data-cell]');
        const classic = box(await settled(page, 'classic'));
        // The classic sheet's gentle lens draws the near row a little wider than the far one; the modern lens draws
        // both alike. So the boxes match within a few percent, not exactly.
        expect(Math.abs(classic.w / modern.w - 1), `width: modern ${modern.w.toFixed(0)} px, classic ${classic.w.toFixed(0)} px`).toBeLessThan(0.06);
        expect(Math.abs(classic.h / modern.h - 1), `height: modern ${modern.h.toFixed(0)} px, classic ${classic.h.toFixed(0)} px`).toBeLessThan(0.08);
        expect(Math.abs(classic.cx - modern.cx), 'centred alike across').toBeLessThan(modern.w * 0.04);
        expect(Math.abs(classic.cy - modern.cy), 'centred alike down').toBeLessThan(modern.h * 0.06);
        expect(errors).toEqual([]);
      });
    }
  });
}
