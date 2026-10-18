// The workroom in a real browser against local docker (make music-e2e): sign in
// through the captured mail, publish a draft with an API key made on the hub,
// open the piece, play, move the playhead, switch views, open a glossary card,
// and never trip the content security policy; then a sound effect from another
// project: two projects on the list, a seconds axis, no sheet music; then the
// theme switch, the guide, and every screen at phone and desktop width in both
// themes.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
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
  if (run.status !== 0) throw new Error(`docker compose exec exited ${run.status}: ${run.stderr}`);
  return run.stdout;
}
// An empty mail directory is the expected start: the glob matches nothing and the listing ends in `true`.
const mailFiles = (): string[] => inPhp(`ls ${process.env.MUSIC_E2E_MAIL_DIR}/*.eml 2>/dev/null || true`).split('\n').filter(Boolean);

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

const VIEW_TABS = ['story', 'roll', 'sound', 'sheet'] as const;

/** A fresh browser context signed in as the owner. The first call signs in and keeps the session; later calls reuse it. Unless guideSeen is false, every view's guide counts as seen, so none opens over the page. */
export async function signedInPage(browser: Browser, base: string, opts: { guideSeen?: boolean } = {}): Promise<{ context: BrowserContext; page: Page }> {
  if (!session) {
    const first = await browser.newContext();
    await signIn(await first.newPage(), base);
    session = await first.storageState();
    await first.close();
  }
  const context = await browser.newContext({ storageState: session });
  if (opts.guideSeen ?? true) {
    await context.addInitScript((tabs: readonly string[]) => { for (const t of tabs) { localStorage.setItem(`workroom-guide-${t}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${t}`, 'seen'); } }, VIEW_TABS);
  }
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
  try {
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

    for (const tab of ['Piano roll', 'Sound picture', 'Sheet music', 'Story']) await page.getByRole('tab', { name: tab }).click();
    await page.getByRole('tab', { name: 'Sheet music' }).click();
    await expect(page.locator('#sheet svg')).toBeVisible({ timeout: 15_000 });

    // The timeline belongs to the Story view alone.
    await page.getByRole('tab', { name: 'Story' }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('[data-timeline]')).toBeVisible();
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});

test('a sound effect from another project: grouped list, seconds on the axis, no sheet music', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
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
    await expect(page.getByRole('tab', { name: 'Sheet music' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Piano roll' })).toHaveCount(0);
    await page.getByRole('tab', { name: 'Sound picture' }).click();
    await expect(page.locator('img[data-spectrogram]')).toBeVisible();
    await page.getByRole('button', { name: 'Play' }).click();
    await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.05);
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});

test('the theme switch restyles the page without a reload, is remembered, and the fonts load', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e theme', ['drafts:publish']));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await expect(page.locator('[data-timeline]')).toBeVisible();
    const html = page.locator('html');
    const ground = (): Promise<string> => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await expect(html).toHaveAttribute('data-theme', 'dark');
    expect(await ground()).toBe('rgb(18, 21, 25)');
    await page.evaluate(() => { document.body.dataset.stayed = 'yes'; });
    const themes = page.getByRole('group', { name: 'Theme' });
    await themes.getByRole('button', { name: 'Light' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await ground()).toBe('rgb(238, 240, 243)');
    expect(await page.evaluate(() => document.body.dataset.stayed)).toBe('yes');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await themes.getByRole('button', { name: 'System' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html).toHaveAttribute('data-theme', 'light');
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, ''));
    });
    for (const family of ['Barlow', 'Barlow Condensed', 'IBM Plex Mono']) expect(loaded).toContain(family);
  } finally {
    await context.close();
  }
});

test('a remembered theme is on the page before it first paints', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e flash', ['drafts:publish']));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Light' }).click();
    // Recorded by the page itself at the earliest moments a script can see: the parser reaching the body, DOMContentLoaded, the first frame.
    await page.addInitScript(() => {
      const seen: Record<string, string | null> = {};
      const w = window as unknown as { __themeSeen: typeof seen };
      w.__themeSeen = seen;
      const mark = (k: string): void => { seen[k] = document.documentElement.getAttribute('data-theme'); };
      document.addEventListener('DOMContentLoaded', () => mark('dcl'));
      requestAnimationFrame(() => mark('frame'));
      new MutationObserver((_m, o) => { if (document.body) { mark('body'); o.disconnect(); } }).observe(document, { childList: true, subtree: true });
    });
    await page.reload();
    await expect(page.locator('[data-timeline]')).toBeVisible();
    const seen = await page.evaluate(() => (window as unknown as { __themeSeen: Record<string, string | null> }).__themeSeen);
    expect(seen).toEqual({ body: 'light', dcl: 'light', frame: 'light' });
  } finally {
    await context.close();
  }
});

test('the guide opens on a first visit, walks every part, plays, ignores Escape and gives focus back', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base, { guideSeen: false });
  try {
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e guide', ['drafts:publish']));
    await page.goto(`${base}music/piece.php?id=test-piece`);
    const card = page.locator('[data-guide-card]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Part 1 of 7');
    await card.getByRole('button', { name: 'Hear it' }).click();
    await expect.poll(() => page.locator('audio').evaluate(a => ((a as HTMLAudioElement).paused ? -1 : (a as HTMLAudioElement).currentTime))).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(card).toBeVisible();
    for (let n = 2; n <= 7; n++) {
      await card.getByRole('button', { name: 'Next' }).click();
      await expect(card).toContainText(`Part ${n} of 7`);
    }
    await expect(card.getByRole('button', { name: 'Next' })).toBeDisabled();
    await card.getByRole('button', { name: 'Close' }).click();
    await expect(card).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'How to read this' })).toBeFocused();
    await page.reload();
    await expect(page.locator('[data-timeline]')).toBeVisible();
    await expect(card).toHaveCount(0);
    await page.getByRole('tab', { name: 'Piano roll' }).click();
    await expect(card).toContainText('Part 1 of 5');
  } finally {
    await context.close();
  }
});

test('the guide at phone width: the card clears the lit part and stays on screen, Tab stays in the card, stepping keeps the piece playing', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const key = await createKey(page, base, 'e2e guide geometry', ['drafts:publish']);
    await publishFixtureDraft(request, base, key);
    await publishFixtureDraft(request, base, key, 'draft-sound');
    await page.setViewportSize({ width: 390, height: 844 });
    const card = page.locator('[data-guide-card]');
    const problems: string[] = [];
    const geometry = (): Promise<{ card: Box; spot: Box | null; view: { w: number; h: number } }> => page.evaluate(() => {
      const box = (el: Element): Box => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      const spot = document.querySelector('[data-guide-spot]');
      return { card: box(document.querySelector('[data-guide-card]')!), spot: spot ? box(spot) : null, view: { w: window.innerWidth, h: window.innerHeight } };
    });
    for (const id of ['test-piece', 'cannon-fire']) {
      await page.goto(`${base}music/piece.php?id=${id}`);
      await expect(page.getByRole('tab').first()).toBeVisible();
      const names = (await page.getByRole('tab').allTextContents()).map(n => n.trim());
      expect(names.length).toBeGreaterThan(1);
      for (const name of names) {
        await page.getByRole('tab', { name, exact: true }).click();
        await page.getByRole('button', { name: 'How to read this' }).click();
        await expect(card).toBeVisible();
        const total = Number(/of (\d+)/.exec((await card.textContent()) ?? '')![1]);
        for (let n = 1; n <= total; n++) {
          await expect(card).toContainText(`Part ${n} of ${total}`);
          const g = await geometry();
          const where = `${id} / ${name} / part ${n}`;
          if (g.card.left < 0 || g.card.top < 0 || g.card.right > g.view.w + 0.5 || g.card.bottom > g.view.h + 0.5) problems.push(`${where}: card outside the screen ${JSON.stringify(g.card)}`);
          if (g.spot) {
            // The documented exception: a lit part so tall that neither side of it has room for a card.
            const room = Math.max(g.spot.top, g.view.h - g.spot.bottom) - 24;
            const overlap = g.card.left < g.spot.right && g.card.right > g.spot.left && g.card.top < g.spot.bottom - 0.5 && g.card.bottom > g.spot.top + 0.5;
            if (overlap && room >= 120) problems.push(`${where}: card ${JSON.stringify(g.card)} overlaps the spot ${JSON.stringify(g.spot)}`);
          }
          if (n < total) await card.getByRole('button', { name: 'Next' }).click();
        }
        await expect(card.getByRole('button', { name: 'Next' })).toBeDisabled();
        const inCard = (): Promise<boolean> => page.evaluate(() => document.querySelector('[data-guide-card]')!.contains(document.activeElement));
        expect(await inCard(), `${id} / ${name}: focus left the card after the last part`).toBe(true);
        await card.getByRole('button', { name: 'Close' }).focus();
        await page.keyboard.press('Tab');
        expect(await inCard(), `${id} / ${name}: Tab from the last control left the card`).toBe(true);
        await expect(card.getByRole('button', { name: 'Hear it' })).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(card.getByRole('button', { name: 'Close' })).toBeFocused();
        await card.getByRole('button', { name: 'Close' }).click();
        await expect(card).toHaveCount(0);
      }
    }
    expect(problems).toEqual([]);

    // Started with Play, the piece keeps playing while the guide is stepped through.
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await expect(page.locator('[data-timeline]')).toBeVisible();
    await page.getByRole('button', { name: 'Play' }).click();
    const audio = page.locator('audio');
    await expect.poll(() => audio.evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.2);
    await page.getByRole('button', { name: 'How to read this' }).click();
    await expect(card).toBeVisible();
    for (let n = 2; n <= 4; n++) {
      await card.getByRole('button', { name: 'Next' }).click();
      await expect(card).toContainText(`Part ${n} of`);
    }
    await card.getByRole('button', { name: 'Back' }).click();
    const before = await audio.evaluate(a => (a as HTMLAudioElement).currentTime);
    await expect.poll(() => audio.evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(before + 0.3);
    expect(await audio.evaluate(a => (a as HTMLAudioElement).paused)).toBe(false);
    await card.getByRole('button', { name: 'Close' }).click();
    expect(await audio.evaluate(a => (a as HTMLAudioElement).paused)).toBe(false);
  } finally {
    await context.close();
  }
});
test('on a phone every time view opens with the whole piece on screen', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const key = await createKey(page, base, 'e2e phone fit', ['drafts:publish']);
    await publishFixtureDraft(request, base, key);
    await publishFixtureDraft(request, base, key, 'draft-sound');
    await page.setViewportSize({ width: 390, height: 844 });
    const stageRight = (): Promise<number> => page.locator('[data-guide="view"]').evaluate(el => el.getBoundingClientRect().right);
    const reach = (sel: string): Promise<number> => page.locator(sel).last().evaluate(el => el.getBoundingClientRect().right);
    for (const [id, last] of [['test-piece', '[data-section="thread"]'], ['cannon-fire', '[data-section="echo"]']] as const) {
      await page.goto(`${base}music/piece.php?id=${id}`);
      await expect(page.locator('[data-timeline]')).toBeVisible();
      const right = await stageRight();
      await expect.poll(async () => Math.abs((await reach(last)) - right), { message: `${id} story: the last section ends at the right edge` }).toBeLessThan(3);
      await expect.poll(() => reach('[data-tick]')).toBeLessThanOrEqual(right + 1);
      await page.getByRole('tab', { name: 'Sound picture' }).click();
      await expect(page.locator('img[data-spectrogram]')).toBeVisible();
      await expect.poll(async () => Math.abs((await reach('img[data-spectrogram]')) - right), { message: `${id} sound picture fills the stage` }).toBeLessThan(3);
    }
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await page.getByRole('tab', { name: 'Piano roll' }).click();
    await expect(page.locator('[data-roll]')).toBeVisible();
    const right = await stageRight();
    const notesEnd = await page.locator('[data-note]').evaluateAll(els => Math.max(...els.map(e => e.getBoundingClientRect().right)));
    expect(notesEnd).toBeLessThanOrEqual(right + 1);
    expect(notesEnd).toBeGreaterThan(right * 0.9);
  } finally {
    await context.close();
  }
});

interface Box { left: number; top: number; right: number; bottom: number }

const SHOTS = process.env.MUSIC_E2E_SHOTS ?? '';
interface Screen { name: string; path: string; ready(page: Page): Promise<void> }
const tab = (name: string, then: (p: Page) => Promise<void>) => async (p: Page) => { await p.getByRole('tab', { name }).click(); await then(p); };
const SCREENS: Screen[] = [
  { name: 'pieces', path: 'music/', ready: p => expect(p.locator('li.piece').first()).toBeVisible() },
  { name: 'story', path: 'music/piece.php?id=test-piece', ready: p => expect(p.locator('[data-timeline]')).toBeVisible() },
  { name: 'piano-roll', path: 'music/piece.php?id=test-piece', ready: tab('Piano roll', p => expect(p.locator('[data-roll]')).toBeVisible()) },
  { name: 'sound-picture', path: 'music/piece.php?id=test-piece', ready: tab('Sound picture', p => expect(p.locator('img[data-spectrogram]')).toBeVisible()) },
  { name: 'sheet-music', path: 'music/piece.php?id=test-piece', ready: tab('Sheet music', p => expect(p.locator('#sheet svg')).toBeVisible({ timeout: 15_000 })) },
  { name: 'word-card', path: 'music/piece.php?id=test-piece', ready: async p => {
    await expect(p.locator('[data-timeline]')).toBeVisible();
    const handle = p.locator('[data-sheet] > button[aria-expanded]');
    if (await handle.isVisible()) await handle.click();
    await p.locator('[data-sheet] button[data-term="ostinato"]').first().click();
    await expect(p.locator('[data-card]')).toBeVisible();
  } },
  { name: 'guide', path: 'music/piece.php?id=test-piece', ready: async p => {
    await p.getByRole('button', { name: 'How to read this' }).click();
    await expect(p.locator('[data-guide-card]')).toBeVisible();
  } },
  { name: 'sound-story', path: 'music/piece.php?id=cannon-fire', ready: p => expect(p.locator('[data-lane="boom"]')).toBeVisible() },
  { name: 'sound-sound-picture', path: 'music/piece.php?id=cannon-fire', ready: tab('Sound picture', p => expect(p.locator('img[data-spectrogram]')).toBeVisible()) },
  { name: 'missing-piece', path: 'music/piece.php?id=no-such-piece', ready: p => expect(p.locator('.error')).toBeVisible() },
  { name: 'bad-request', path: 'music/piece.php?id=%3Cscript%3E', ready: p => expect(p.locator('.error')).toBeVisible() },
];

test('every screen at 390 and 1280 px, dark and light: no sideways scroll, 44 px targets, no CSP errors', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
    const key = await createKey(page, base, 'e2e screens', ['drafts:publish']);
    await publishFixtureDraft(request, base, key);
    await publishFixtureDraft(request, base, key, 'draft-sound');
    if (SHOTS) mkdirSync(SHOTS, { recursive: true });
    for (const theme of ['dark', 'light'] as const) {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
        for (const s of SCREENS) {
          await page.goto(`${base}music/`);
          await page.evaluate(t => localStorage.setItem('workroom-theme', t), theme);
          await page.goto(`${base}${s.path}`);
          await s.ready(page);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          const sideways = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(sideways, `${s.name} at ${width} px scrolls sideways`).toBeLessThanOrEqual(0);
          const small = await page.evaluate(() => [...document.querySelectorAll('button, a, select, [role="tab"]')]
            .filter(el => !el.closest('svg'))
            .map(el => ({ el, r: el.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44))
            .map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`));
          expect(small, `${s.name} at ${width} px, ${theme}: tap targets under 44 px`).toEqual([]);
          if (SHOTS) await page.screenshot({ path: join(SHOTS, `${s.name}-${width}-${theme}.png`), fullPage: true });
        }
      }
    }
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});
