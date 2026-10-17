// The workroom in a real browser against local docker (make music-e2e): sign in
// through the captured mail, publish a draft with an API key made on the hub,
// open the piece, play, move the playhead, switch views, open a glossary card,
// and never trip the content security policy; then a sound effect from another
// project: two projects on the list, a seconds axis, no sheet music.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = join(import.meta.dirname, '..', '..');
const FIXTURE_DRAFTS = {
  draft: { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft'), piece: 'test-piece' },
  'draft-sound': { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-sound'), piece: 'cannon-fire' },
} as const;

// The tests share one browser worker and one sign-in: the admin sign-in link is limited to three a hour per address,
// so a run makes two link requests at most (this shared session, and the second device in the second test).
test.describe.configure({ mode: 'serial' });

// The admin mail is captured inside the PHP container (compose.admin-local.yaml), as in tests/admin-smoke.sh.
function inPhp(command: string): string {
  const compose = (process.env.MUSIC_E2E_COMPOSE ?? '').split(' ').filter(Boolean);
  const run = spawnSync('docker', ['compose', ...compose, '-p', process.env.MUSIC_E2E_PROJECT!, 'exec', '-T', 'www-cs-php', 'sh', '-c', command], { encoding: 'utf8', cwd: SITE });
  if (run.error || run.signal) throw new Error(`docker compose exec failed: ${run.error?.message ?? run.signal}`);
  return run.stdout;
}
const mailFiles = (): string[] => inPhp(`ls ${process.env.MUSIC_E2E_MAIL_DIR}/*.eml 2>/dev/null`).split('\n').filter(Boolean);

export async function signIn(page: Page, base: string): Promise<void> {
  const known = new Set(mailFiles());
  await page.goto(`${base}admin/login.php`);
  await page.getByLabel('Email').fill('wgrim@siue.edu');
  await page.getByRole('button', { name: 'Email me a link' }).click();
  let token = '';
  await expect.poll(() => {
    const fresh = mailFiles().filter(f => !known.has(f));
    for (const f of fresh) {
      // The mail is quoted-printable: undo its soft line breaks and =XX escapes before reading the link.
      const text = inPhp(`cat ${f}`).replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
      const m = text.match(/verify\.php\?token=([0-9a-f]{64})/);
      if (m) { token = m[1]!; break; }
    }
    return token;
  }, { timeout: 20_000 }).not.toBe('');
  await page.goto(`${base}admin/verify.php?token=${token}`); // the mailed link names http://localhost/ with no port
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/admin\/(index\.php)?$/);
}

export async function createKey(page: Page, base: string, label: string, scopes: string[]): Promise<string> {
  await page.goto(`${base}admin/keys.php`);
  await page.getByLabel('Label').fill(label);
  for (const s of scopes) await page.getByLabel(s).check();
  await page.getByRole('button', { name: 'Create key' }).click();
  return (await page.locator('code.secret').textContent())!.trim();
}

type Session = Awaited<ReturnType<BrowserContext['storageState']>>;
let session: Session | undefined;

/** A fresh browser context signed in as the owner. The first call signs in and keeps the session; later calls reuse it. */
export async function signedInPage(browser: Browser, base: string): Promise<{ context: BrowserContext; page: Page }> {
  if (!session) {
    const first = await browser.newContext();
    await signIn(await first.newPage(), base);
    session = await first.storageState();
    await first.close();
  }
  const context = await browser.newContext({ storageState: session });
  return { context, page: await context.newPage() };
}

/** The SIUED1 bundle (Formats): "SIUED1", a file count, then per file a name length, the name, a uint32 size and the bytes. */
function draftBundle(files: Record<string, Buffer>): Buffer {
  const parts: Buffer[] = [Buffer.from('SIUED1'), Buffer.from([Object.keys(files).length])];
  for (const [name, bytes] of Object.entries(files)) {
    const size = Buffer.alloc(4);
    size.writeUInt32BE(bytes.length);
    parts.push(Buffer.from([name.length]), Buffer.from(name), size, bytes);
  }
  return Buffer.concat(parts);
}

export async function publishFixtureDraft(request: APIRequestContext, base: string, key: string, fixture: keyof typeof FIXTURE_DRAFTS = 'draft'): Promise<void> {
  const { dir, piece } = FIXTURE_DRAFTS[fixture];
  // A music draft carries score.musicxml; a sound draft does not.
  const files = Object.fromEntries(['score.json', 'score.musicxml', 'audio.webm', 'spectrogram.png'].filter(name => existsSync(join(dir, name))).map(name => [name, readFileSync(join(dir, name))]));
  const res = await request.post(`${base}music/api/drafts.php?piece=${piece}&version=1`, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/octet-stream' },
    data: draftBundle(files),
  });
  expect([201, 409]).toContain(res.status());
}

test('open a piece, play, seek, switch views, read a term, no CSP violations', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  const violations: string[] = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
  await publishFixtureDraft(request, base, await createKey(page, base, 'e2e publish', ['drafts:publish']));

  await page.goto(`${base}music/`);
  await page.getByRole('link', { name: /Test piece: the Labyrinth wakes/ }).click();
  await expect(page.locator('[data-section="stirs"]')).toBeVisible();
  await expect(page.locator('[data-motif="ariadne"]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Test piece: the Labyrinth wakes');
  await expect(page.getByRole('link', { name: 'All pieces' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'strings instruments' })).toBeVisible();

  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.2);
  await page.getByRole('button', { name: 'Pause' }).click();

  const tl = page.locator('[data-timeline]');
  const box = (await tl.boundingBox())!;
  await tl.click({ position: { x: box.width * 0.75, y: 120 } });
  await expect.poll(() => page.locator('audio').evaluate(a => Math.round((a as HTMLAudioElement).currentTime))).toBe(12);

  await page.getByRole('button', { name: 'ostinato' }).first().click();
  await expect(page.getByText('A short pattern repeated over and over underneath the music.')).toBeVisible();
  await page.getByRole('button', { name: 'Hear it' }).click();

  for (const tab of ['Piano roll', 'Sound picture', 'Sheet music', 'Story']) await page.getByRole('button', { name: tab }).click();
  await page.getByRole('button', { name: 'Sheet music' }).click();
  await expect(page.locator('#sheet svg')).toBeVisible({ timeout: 15_000 });

  // The timeline belongs to the Story view alone.
  await page.getByRole('button', { name: 'Story' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-timeline]')).toBeVisible();
  expect(violations).toEqual([]);
  await context.close();
});

test('a sound effect from another project: grouped list, seconds on the axis, no sheet music', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  const violations: string[] = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
  const key = await createKey(page, base, 'e2e publish sound', ['drafts:publish']);
  await publishFixtureDraft(request, base, key); // Crete, music
  await publishFixtureDraft(request, base, key, 'draft-sound'); // Tankity, sound: published last, so its project is listed first

  await page.goto(`${base}music/`);
  await expect(page.locator('h2.project')).toHaveText(['Tankity', 'Crete']);
  await page.getByRole('link', { name: 'Cannon fire' }).click();
  await expect(page.locator('[data-lane="boom"]')).toBeVisible();
  await expect(page.locator('[data-lane="air"]')).toBeVisible();
  await expect(page.locator('[data-section="blast"]')).toBeVisible();
  await expect(page.locator('[data-tick]').nth(1)).toHaveText('50 ms');
  await expect(page.getByRole('button', { name: 'Sheet music' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Piano roll' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sound picture' }).click();
  await expect(page.locator('img[data-spectrogram]')).toBeVisible();
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.05);
  expect(violations).toEqual([]);
  await context.close();
});
