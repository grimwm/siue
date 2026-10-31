// A student's notes key in a real browser against local docker (make music-e2e):
// changes the passphrase on Your studio, then the old one no longer unlocks the
// notes and the new one does; Forgot your passphrase mails a link whose page a
// GET (a mail scanner) never acts on, and its button deletes the notes and the
// key while the piece stays, back to Make your notes key; Start over mails a
// link the same way, and its button empties the studio and ends the AI key.
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { draftBundle, mailFiles, mailedToken, signInAt } from './music-mail.ts';

const SITE = join(import.meta.dirname, '..', '..');
const SCORE = readFileSync(join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-score', 'score.json'));
const STUDENT = 'student2@siue.edu';
const FIRST = 'the first long passphrase';
const SECOND = 'a second long passphrase';
const NOTE = 'keep this note safe';
const PIECE = 'Built piece: the Labyrinth from its score';
const EMPTY = 'No drafts have been published yet.';
const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;

test.describe.configure({ mode: 'serial' });

/** Presses a Your studio button that mails a confirmation link; the token of the link it mailed. */
async function mailFromStudio(page: Page, base: string, button: string): Promise<string> {
  const known = new Set(mailFiles());
  await page.goto(`${base}music/studio.php`);
  await page.getByRole('button', { name: button }).click();
  await expect(page.getByRole('status')).toContainText(`We emailed a link to ${STUDENT}.`);
  return mailedToken(known, 'music', 'confirm.php');
}

test('change the passphrase, forget it, and start over, each as the person sees it', async ({ browser, request, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext();
  await context.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });

    // A studio with a notes key, one note and one piece.
    await signInAt(page, base, 'music', STUDENT);
    const makeKey = page.locator('[data-make-key]');
    await makeKey.getByLabel('Passphrase', { exact: true }).fill(FIRST);
    await makeKey.getByLabel('The same passphrase again').fill(FIRST);
    await makeKey.getByRole('button', { name: 'Make my notes key' }).click();
    await expect(makeKey).toHaveCount(0, { timeout: 60_000 });
    await page.getByLabel('A general note, on no piece in particular').fill(NOTE);
    await page.getByRole('button', { name: 'Send note' }).click();
    await expect(page.locator('[data-general-status]')).toHaveText('Sent. It is waiting for pickup.');

    await page.goto(`${base}music/studio.php`);
    await page.getByLabel('Label').fill('my assistant');
    for (const words of ['read notes', 'publish drafts']) await page.getByLabel(words).check();
    await page.getByRole('button', { name: 'Make key' }).click();
    const key = (await page.locator('code.secret').textContent())!.trim();
    const publish = (): Promise<{ status(): number }> => request.post(`${base}music/api/drafts.php?piece=built-piece&version=1`, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/octet-stream' },
      data: draftBundle({ 'score.json': SCORE }),
    });
    expect((await publish()).status()).toBe(201);

    // Change passphrase: a wrong current one changes nothing; the right one re-locks the same key.
    await page.goto(`${base}music/studio.php`);
    const change = page.locator('[data-change-passphrase]');
    await expect(change.getByRole('heading', { name: 'Change your passphrase' })).toBeVisible();
    await change.getByLabel('Current passphrase').fill('not my passphrase at all');
    await change.getByLabel('New passphrase', { exact: true }).fill(SECOND);
    await change.getByLabel('The new passphrase again').fill(SECOND);
    await change.getByRole('button', { name: 'Change passphrase' }).click();
    await expect(change.getByRole('alert')).toHaveText('That is not your current passphrase. Nothing was changed.', { timeout: 60_000 });
    await change.getByLabel('Current passphrase').fill(FIRST);
    await change.getByLabel('New passphrase', { exact: true }).fill(SECOND);
    await change.getByLabel('The new passphrase again').fill(SECOND);
    await change.getByRole('button', { name: 'Change passphrase' }).click();
    await expect(page).toHaveURL(/music\/studio\.php\?changed=passphrase$/, { timeout: 60_000 });
    await expect(page.getByRole('status')).toHaveText('Your passphrase is changed. Unlock your notes with the new one.');

    // The remembered unlock is gone with the old envelope: the old passphrase fails, the new one opens the same note.
    await page.goto(`${base}music/`);
    const unlock = page.locator('[data-unlock]');
    await unlock.getByLabel('Passphrase').fill(FIRST);
    await unlock.getByRole('button', { name: 'Unlock notes' }).click();
    await expect(page.getByText('That passphrase did not unlock the key.')).toBeVisible({ timeout: 60_000 });
    await unlock.getByLabel('Passphrase').fill(SECOND);
    await unlock.getByRole('button', { name: 'Unlock notes' }).click();
    await expect(page.locator('[data-note]', { hasText: NOTE })).toBeVisible({ timeout: 60_000 });

    // Forgot your passphrase: a mailed link. Fetching it (as a mail scanner does) deletes nothing.
    const forgot = await mailFromStudio(page, base, 'Email me a link to delete my notes');
    const link = `${base}music/confirm.php?token=${forgot}`;
    const scanned = await request.get(link);
    expect(scanned.status()).toBe(200);
    expect(await scanned.text()).toContain('Delete your notes and notes key?');
    await page.goto(`${base}music/`);
    await expect(page.locator('.waiting-total')).toHaveText('1 notes waiting for pickup');
    await expect(page.getByRole('link', { name: PIECE })).toBeVisible();

    // Its page says what goes and what stays, and its one button deletes only the notes and the key.
    await page.goto(link);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Delete your notes and notes key?');
    await expect(page.locator('.confirm-gone li')).toHaveText(['Every note in your studio: 1 note', 'Your notes key']);
    await expect(page.getByText('Your pieces (1 piece, 1 draft) and your AI keys (1 AI key) stay.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button')).toHaveCount(1);
    await page.getByRole('button', { name: 'Delete my notes and notes key' }).click();
    await expect(page.getByRole('status')).toContainText('Your notes and your notes key are deleted.');
    await page.getByRole('link', { name: 'Make a new notes key' }).click();
    await expect(page.getByRole('link', { name: PIECE })).toBeVisible();
    await expect(page.locator('.waiting-total')).toHaveText('0 notes waiting for pickup');
    await expect(page.locator('[data-make-key]').getByText(/^Make your notes key\./)).toBeVisible();
    // The link worked once.
    await page.goto(link);
    await expect(page.getByRole('alert')).toHaveText('This link has expired or was already used. Ask for a new one on Your studio.');

    // Start over: a mailed link again, a GET that deletes nothing, then the button.
    const startOver = await mailFromStudio(page, base, 'Email me a link to start over');
    const again = `${base}music/confirm.php?token=${startOver}`;
    expect((await request.get(again)).status()).toBe(200);
    await page.goto(`${base}music/`);
    await expect(page.getByRole('link', { name: PIECE })).toBeVisible();
    await page.goto(again);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Start over?');
    await expect(page.locator('.confirm-gone li')).toHaveText(['Every piece and draft: 1 piece, 1 draft', 'Every note: 0 notes', 'Your notes key', 'Your AI keys: 1 AI key']);
    await expect(page.getByRole('button')).toHaveCount(1);
    await page.getByRole('button', { name: 'Delete everything in my studio' }).click();
    await expect(page.getByRole('status')).toContainText('Your studio is empty.');
    await page.getByRole('link', { name: 'Open your studio' }).click();
    await expect(page.getByText(EMPTY)).toBeVisible();
    expect((await publish()).status()).toBe(401);
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});
