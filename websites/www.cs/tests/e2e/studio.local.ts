// A student's studio in a real browser against local docker (make music-e2e):
// an address the studio configuration does not name signs in through the
// captured mail to an empty studio, makes a notes key on the page and pins a
// typed note; makes an AI key on Your studio, seen once; publishes a score-only
// draft with it, whose sound the page builds; deletes the draft on the page.
// The studio's sign-in never reaches the admin hub. Changing the passphrase,
// Forgot your passphrase and Start over are studio-keys.local.ts's.
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { draftBundle, signInAt } from './music-mail.ts';

const SITE = join(import.meta.dirname, '..', '..');
const SCORE = readFileSync(join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-score', 'score.json'));
const STUDENT = 'student1@siue.edu';
const PASSPHRASE = 'a long student passphrase';
const NOTE = 'the horns could come in later';
const EMPTY = 'No drafts have been published yet.';
const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;

test.describe.configure({ mode: 'serial' });

test("a student's studio from first sign-in to a deleted draft", async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext();
  // Every view's guide counts as seen, so none opens over the page (workroom.local.ts walks the guide).
  await context.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });

    // The first sign-in makes the account: an empty studio, and the page asks for a notes key before anything else.
    await signInAt(page, base, 'music', STUDENT);
    await expect(page.getByText(EMPTY)).toBeVisible();
    const makeKey = page.locator('[data-make-key]');
    await expect(makeKey.getByText(/^Make your notes key\./)).toBeVisible();
    await makeKey.getByLabel('Passphrase', { exact: true }).fill(PASSPHRASE);
    await makeKey.getByLabel('The same passphrase again').fill(PASSPHRASE);
    await makeKey.getByRole('button', { name: 'Make my notes key' }).click();
    await expect(makeKey).toHaveCount(0, { timeout: 60_000 });

    // Made, uploaded and unlocked at once: a typed general note is sealed and waits for pickup.
    await page.getByLabel('A general note, on no piece in particular').fill(NOTE);
    await page.getByRole('button', { name: 'Send note' }).click();
    await expect(page.locator('[data-general-status]')).toHaveText('Sent. It is waiting for pickup.');
    await expect(page.locator('[data-note]', { hasText: NOTE }).locator('[data-state]')).toHaveText('Waiting');
    await page.reload();
    await expect(page.locator('.waiting-total')).toHaveText('1 notes waiting for pickup');

    // Your studio: an AI key with every permission a studio key can have, shown once.
    await page.goto(`${base}music/studio.php`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your studio');
    await expect(page.locator('address')).toHaveText(STUDENT);
    await expect(page.locator('.usage')).toHaveText(/ of 5 MB used$/);
    await page.getByLabel('Label').fill('my assistant');
    for (const words of ['read notes', 'publish drafts', 'delete drafts']) await page.getByLabel(words).check();
    await page.getByRole('button', { name: 'Make key' }).click();
    const key = (await page.locator('code.secret').textContent())!.trim();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    await page.goto(`${base}music/studio.php`);
    await expect(page.locator('code.secret')).toHaveCount(0);
    await expect(page.locator('.studio-keys li strong')).toHaveText(['my assistant']);
    await expect(page.locator('.studio-keys')).toContainText('Permissions: read notes, publish drafts, delete drafts');
    expect(await page.content()).not.toContain(key);

    // The AI publishes a draft that is its score alone, the only kind a studio stores.
    const publish = (): Promise<{ status(): number }> => request.post(`${base}music/api/drafts.php?piece=built-piece&version=1`, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/octet-stream' },
      data: draftBundle({ 'score.json': SCORE }),
    });
    expect((await publish()).status()).toBe(201);
    await page.goto(`${base}music/`);
    await page.getByRole('link', { name: 'Built piece: the Labyrinth from its score' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Built piece: the Labyrinth from its score');
    // There is no audio file: the page builds the sound from the shared sample library, then plays it.
    await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/, { timeout: 60_000 });
    await expect(page.getByText('The sound could not be built')).toHaveCount(0);
    await page.getByRole('button', { name: 'Play' }).click();
    await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.2);
    await page.getByRole('button', { name: 'Pause' }).click();

    // Deleting the piece's only draft asks first, then goes back to the pieces list, empty again.
    page.once('dialog', d => void d.accept());
    await page.getByRole('button', { name: 'Delete this draft' }).click();
    await expect(page).toHaveURL(/music\/(index\.php)?$/);
    await expect(page.getByText(EMPTY)).toBeVisible();

    // A studio session is not an admin session: the hub sends this browser to its own sign-in.
    await page.goto(`${base}admin/`);
    await expect(page).toHaveURL(/admin\/login\.php/);
    await expect(page.getByRole('button', { name: 'Email me a link' })).toBeVisible();
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});
