// The workroom in a real browser against local docker (make music-e2e): the owner
// signs in to the studio through the captured mail, and to the admin hub
// separately, as a named admin does; publish a draft with an API key made on the hub,
// open the piece, play, move the playhead, switch views, open a glossary card,
// and never trip the content security policy; then a sound effect from another
// project: two projects on the list, a seconds axis, no sheet music; then the
// theme switch, the guide, and every screen at phone and desktop width in both
// themes; then answering with the TEST keyring uploaded and unlocked: pin a
// typed note, pick it up with the owner's tool, read and delete it on a second
// device; a composer that asks for the unlock first; hum (and find a recording
// kept, not lost, when the mode changes mid-recording), react, draw the energy,
// and a note made offline that waits and then goes; then a draft sent as its
// score alone, whose sound the page builds from the shared sample library, plays
// and downloads as a WAV that loops without a click. With MUSIC_E2E_LISTEN=<dir>,
// it also builds the Crete title theme's score-only draft and saves the WAV and
// the build's timing there, for the listening check against the container render.
import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { draftBundle, signInAt } from './music-mail.ts';

const SITE = join(import.meta.dirname, '..', '..');
const FIXTURE_DRAFTS = {
  draft: { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft'), piece: 'test-piece' },
  'draft-sound': { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-sound'), piece: 'cannon-fire' },
  'draft-score': { dir: join(SITE, 'games', 'workroom', 'test', 'fixtures', 'draft-score'), piece: 'built-piece' },
} as const;

// The tests share one browser worker and one sign-in to each realm: a sign-in link is limited to three an hour per
// address in each, so a run asks the studio for three (this shared session, and the second device's two) and the admin
// hub for one.
test.describe.configure({ mode: 'serial' });

/** Signs the owner in to their studio at music/login.php. */
export async function signIn(page: Page, base: string): Promise<void> {
  await signInAt(page, base, 'music', 'wgrim@siue.edu');
}

/** Signs the owner in to the admin hub, a separate sign-in from the studio's. */
export async function adminSignIn(page: Page, base: string): Promise<void> {
  await signInAt(page, base, 'admin', 'wgrim@siue.edu');
}

/** An admin API key made on the hub's Keys page; a browser with no admin session signs in to admin/ first. */
export async function createKey(page: Page, base: string, label: string, scopes: string[]): Promise<string> {
  await page.goto(`${base}admin/keys.php`);
  if (/\/admin\/login\.php/.test(page.url())) {
    await adminSignIn(page, base);
    await page.goto(`${base}admin/keys.php`);
  }
  await page.getByLabel('Label').fill(label);
  for (const s of scopes) await page.getByLabel(s).check();
  await page.getByRole('button', { name: 'Create key' }).click();
  return (await page.locator('code.secret').textContent())!.trim();
}

type Session = Awaited<ReturnType<BrowserContext['storageState']>>;
let session: Session | undefined;

const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;

/** A fresh browser context signed in as the owner, to the studio and to the admin hub. The first call signs in to both and keeps the sessions; later calls reuse them. Unless guideSeen is false, every view's guide counts as seen, so none opens over the page. */
export async function signedInPage(browser: Browser, base: string, opts: { guideSeen?: boolean } = {}): Promise<{ context: BrowserContext; page: Page }> {
  if (!session) {
    const first = await browser.newContext();
    const page = await first.newPage();
    await signIn(page, base);
    await adminSignIn(page, base);
    session = await first.storageState();
    await first.close();
  }
  const context = await browser.newContext({ storageState: session });
  if (opts.guideSeen ?? true) {
    await context.addInitScript((tabs: readonly string[]) => { for (const t of tabs) { localStorage.setItem(`workroom-guide-${t}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${t}`, 'seen'); } }, GUIDE_VIEWS);
  }
  return { context, page: await context.newPage() };
}

export async function publishFixtureDraft(request: APIRequestContext, base: string, key: string, fixture: keyof typeof FIXTURE_DRAFTS = 'draft'): Promise<void> {
  const { dir, piece } = FIXTURE_DRAFTS[fixture];
  await publishDraft(request, base, key, dir, piece, 1);
}

/** Publishes the draft files found in `dir`: a music draft carries score.musicxml, a sound draft does not, and a score-only draft has no audio or spectrogram. */
async function publishDraft(request: APIRequestContext, base: string, key: string, dir: string, piece: string, version: number): Promise<void> {
  const files = Object.fromEntries(['score.json', 'score.musicxml', 'audio.webm', 'spectrogram.png'].filter(name => existsSync(join(dir, name))).map(name => [name, readFileSync(join(dir, name))]));
  const res = await request.post(`${base}music/api/drafts.php?piece=${piece}&version=${version}`, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/octet-stream' },
    data: draftBundle(files),
  });
  expect([201, 409]).toContain(res.status());
}

const FIXTURES = join(SITE, 'games', 'workroom', 'test', 'fixtures');
const TOOLS = join(SITE, 'music', 'tools');
const testKey = JSON.parse(readFileSync(join(FIXTURES, 'test-key.json'), 'utf8')) as { fingerprint: string; pkcs8: string; passphrase: string; keyring: object; other: { fingerprint: string } };
/** The answer bar's reason for the unlock (UNLOCK_FIRST in games/workroom/src/notes-session.ts). */
const UNLOCK_FIRST = 'Unlock your notes first: each note is sealed to your notes key, and the passphrase unlocks it.';

/** Uploads the TEST keyring with its fingerprints, as make music-setup uploads the owner's: the server then accepts notes sealed to the test key, and the page seals to it once the TEST passphrase unlocks the keyring. */
async function uploadTestKeyring(request: APIRequestContext, base: string, key: string): Promise<void> {
  const up = await request.post(`${base}music/api/keyring.php`, {
    headers: { Authorization: `Bearer ${key}` },
    data: { keyring: testKey.keyring, current: testKey.fingerprint, previous: [testKey.other.fingerprint] },
  });
  expect(up.status()).toBe(201);
}

/**
 * Claude's side: the owner's tool (`siue-music pickup`) against this docker stack, from a fresh config folder. Its
 * cache holds the TEST key and the pickup API key; 1Password is the tool's own stand-in (music/tools/tests/fake_op.py)
 * holding the TEST key's item, so the run never reaches the owner's 1Password or cache. The caller removes `home`.
 */
function pickup(base: string, pickupKey: string): { run: SpawnSyncReturns<string>; home: string } {
  const home = mkdtempSync(join(tmpdir(), 'siue-music-e2e-'));
  writeFileSync(join(home, 'music.json'), JSON.stringify({ v: 1, keys: { [testKey.fingerprint]: testKey.pkcs8 }, api: { 'music-pickup': pickupKey }, current: testKey.fingerprint, previous: [] }), { mode: 0o600 });
  writeFileSync(join(home, 'op.json'), JSON.stringify({ items: [{
    id: 'testkey', vault: 'SIUE', title: `SIUE music notes key ${testKey.fingerprint.slice(0, 16)}`, category: 'PASSWORD', tags: ['siue-music-key'], urls: [],
    fields: [
      { id: 'password', type: 'CONCEALED', purpose: 'PASSWORD', label: 'password', value: testKey.passphrase },
      { id: 'private_key', type: 'CONCEALED', label: 'private_key', value: testKey.pkcs8 },
      { id: 'fingerprint', type: 'STRING', label: 'fingerprint', value: testKey.fingerprint },
    ],
  }] }), { mode: 0o600 });
  const python = process.env.MUSIC_PY ?? 'python3';
  // spawnSync blocks the event loop, so Playwright's own timeout cannot end a stuck pickup: this one does.
  const run = spawnSync(python, [join(TOOLS, 'siue-music'), 'pickup'], {
    encoding: 'utf8',
    timeout: 180_000,
    env: {
      ...process.env,
      SIUE_CONFIG_DIR: home, SIUE_MUSIC_NOTES_DIR: join(home, 'notes'), SIUE_MUSIC_BASE: `${base}music/`,
      OP_VAULT: 'SIUE', SIUE_OP: `'${python}' '${join(TOOLS, 'tests', 'fake_op.py')}'`, FAKE_OP_STORE: join(home, 'op.json'), FAKE_OP_LOG: join(home, 'op.log'),
    },
  });
  return { run, home };
}

/** On a phone the notes panel is the bottom sheet: open it. The page renders after the load, so first wait for the closed sheet's handle or the open panel's passphrase field. */
async function openNotes(page: Page): Promise<void> {
  const handle = page.locator('[data-sheet] > button[aria-expanded="false"]');
  await expect(handle.or(page.getByLabel('Passphrase')).filter({ visible: true }).first()).toBeVisible();
  if (await handle.isVisible()) await handle.click();
}

/** Notes are listed, and notes can be sealed, only after an unlock; this browser remembers it for the same sign-in and keyring. */
async function unlock(page: Page, passphrase: string): Promise<void> {
  await openNotes(page);
  await page.getByLabel('Passphrase').fill(passphrase);
  await page.getByRole('button', { name: 'Unlock notes' }).click();
}

/** A page view this browser restored the unlock on: no passphrase asked, the notes listed (on a phone, in the opened sheet). */
async function restored(page: Page): Promise<void> {
  const handle = page.locator('[data-sheet] > button[aria-expanded="false"]');
  await expect(handle.or(page.locator('[data-history]')).filter({ visible: true }).first()).toBeVisible();
  if (await handle.isVisible()) await handle.click();
  await expect(page.locator('[data-history]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unlock notes' })).toHaveCount(0);
}

/** Forgets the unlock this browser remembers, so the next page view starts locked. A delete the page's own open connection blocks finishes once that closes. */
async function forgetUnlock(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve, reject) => { const r = indexedDB.deleteDatabase('siue-music-keys'); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); }));
}

/** The pin composer's textbox, by its role and name: the panel that lists the notes has another name. */
const noteBox = (page: Page) => page.getByRole('textbox', { name: 'Your note', exact: true });

/** Pinning keeps the timeline on screen: Pin a note scrolls the Story view into view, and the picked span and the composer are both on screen, neither over the other (the composer is docked at the bottom of a phone, under the span; from 1024 px it is in the page's flow, above the stage). */
async function pinSpan(page: Page, x0: number, x1: number): Promise<void> {
  await page.getByRole('button', { name: 'Pin a note' }).click();
  await expect(page.locator('[data-timeline]')).toBeInViewport();
  await dragAcross(page, '[data-timeline]', x0, x1, 120);
  await expect(page.locator('[data-selection]')).toBeVisible();
  const viewport = page.viewportSize()!;
  const selection = (await page.locator('[data-selection]').boundingBox())!;
  const composer = (await page.locator('[data-pin-composer]').boundingBox())!;
  for (const box of [selection, composer]) {
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  }
  expect(selection.y + selection.height <= composer.y + 1 || composer.y + composer.height <= selection.y + 1, 'the composer covers the picked span').toBe(true);
}

/** Drags across a drawing from (x0, y) to (x1, y), as fractions of its width and pixels from its top. */
async function dragAcross(page: Page, selector: string, x0: number, x1: number, y0: number, y1 = y0): Promise<void> {
  const box = (await page.locator(selector).boundingBox())!;
  await page.mouse.move(box.x + box.width * x0, box.y + y0);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * x1, box.y + y1, { steps: 10 });
  await page.mouse.up();
}

/** On a page view that starts locked: unlock, then on a phone close the bottom sheet again so the answer bar is in reach. */
async function unlockThenClose(page: Page): Promise<void> {
  await unlock(page, testKey.passphrase);
  await expect(page.locator('[data-history]')).toBeVisible();
  const open = page.locator('[data-sheet] > button[aria-expanded="true"]');
  if (await open.isVisible()) await open.click();
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

    // The reading lesson sits beside the music and lights the bar each step talks about.
    await page.getByRole('button', { name: 'Learn to read sheet music' }).click();
    const lesson = page.getByRole('region', { name: 'Learn to read sheet music' });
    await expect(lesson).toContainText('Step 1 of 6');
    await expect(lesson).toContainText('The first note here, in bar 1, is D2');
    await expect(page.locator('#sheet [data-sheet-bar="1"]')).toBeVisible();
    await lesson.getByRole('button', { name: 'Hear it' }).click();
    await lesson.getByRole('button', { name: 'Next' }).click();
    await expect(lesson).toContainText('Step 2 of 6');
    await lesson.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('#sheet [data-sheet-bar]')).toHaveCount(0);

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

test('pin a note, pick it up with the tool, read and delete it on a second device', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const publish = await createKey(page, base, 'e2e answer publish', ['drafts:publish', 'keys:publish']);
    const pickupKey = await createKey(page, base, 'e2e answer pickup', ['notes:pickup']);
    await publishFixtureDraft(request, base, publish);
    await uploadTestKeyring(request, base, publish);

    // Pinned at phone size, where the composer is docked over the bottom of the screen.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await unlock(page, testKey.passphrase);
    await expect(page.locator('[data-history]')).toBeVisible();
    await pinSpan(page, 0.5 + 0.005, 0.85);
    await expect(page.locator('[data-pin-span]')).toHaveText(/^For Bars 5–7 · .* · Horns$/);
    await noteBox(page).fill('louder and slower right here');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Sent. It is waiting for pickup.');
    const mine = page.locator('[data-note]', { hasText: 'louder and slower right here' });
    await expect(mine.locator('[data-state]')).toHaveText('Waiting');
    await expect(page.locator('[data-note-mark]').first()).toBeVisible();

    // The pieces list counts per piece once unlocked: this browser remembers the unlock, so no passphrase is asked.
    await page.goto(`${base}music/`);
    await restored(page);
    await expect(page.locator('a[data-waiting="test-piece"] + .waiting-count')).toHaveText('1 waiting');

    // Claude's side: the owner's tool picks it up from this docker stack.
    const { run, home } = pickup(base, pickupKey);
    try {
      expect(run.status, run.stderr).toBe(0);
      expect(run.stdout).toMatch(/Picked up 1 note into/);
      const [folder] = readdirSync(join(home, 'notes'));
      expect(JSON.parse(readFileSync(join(home, 'notes', folder!, 'note.json'), 'utf8')).body.text).toBe('louder and slower right here');
    } finally {
      rmSync(home, { recursive: true, force: true });
    }

    await page.goto(`${base}music/piece.php?id=test-piece`);
    await restored(page);
    await expect(mine.locator('[data-state]')).toHaveText('Picked up');

    // A second device: a phone signs in, unlocks with the passphrase, reads, deletes. Only the unlocked keys are stored, as
    // non-extractable keys tied to the sign-in: a reload restores them, and a sign-out and a new sign-in forget them.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 } });
    try {
      await phone.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
      const p2 = await phone.newPage();
      await signIn(p2, base);
      await p2.goto(`${base}music/piece.php?id=test-piece`);
      await unlock(p2, 'not it');
      await expect(p2.getByText('That passphrase did not unlock the key.')).toBeVisible();
      await p2.getByLabel('Passphrase').fill(testKey.passphrase);
      await p2.getByRole('button', { name: 'Unlock notes' }).click();
      await expect(p2.getByText('louder and slower right here')).toBeVisible();
      const stored = await p2.evaluate(async () => {
        const stores: string[] = [];
        for (const info of await indexedDB.databases()) {
          if (!info.name) continue;
          const db = await new Promise<IDBDatabase>((resolve, reject) => { const r = indexedDB.open(info.name!); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
          stores.push(...Array.from(db.objectStoreNames).map(s => `${info.name}/${s}`));
          db.close();
        }
        const local = Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)]));
        return { local, session: Object.keys(sessionStorage), stores, cookies: document.cookie, caches: typeof caches === 'undefined' ? [] : await caches.keys() };
      });
      expect(Object.keys(stored.local).filter(k => !/^workroom-(guide-|theme$)/.test(k))).toEqual([]);
      expect(stored.session).toEqual([]);
      expect(stored.stores.filter(s => s !== 'siue-music/outbox' && s !== 'siue-music-keys/unlocked')).toEqual([]);
      expect(stored.cookies).toBe('');
      expect(stored.caches).toEqual([]);
      expect(JSON.stringify(stored)).not.toContain(testKey.passphrase);
      const remembered = await p2.evaluate(() => new Promise<{ fields: string[]; keys: boolean[] }>((resolve, reject) => {
        const r = indexedDB.open('siue-music-keys');
        r.onerror = () => reject(r.error);
        r.onsuccess = () => {
          const q = r.result.transaction('unlocked').objectStore('unlocked').getAll();
          q.onerror = () => reject(q.error);
          q.onsuccess = () => {
            r.result.close();
            const row = q.result[0] as Record<string, unknown>;
            resolve({ fields: Object.keys(row).sort(), keys: [...(row['ring'] as Map<string, CryptoKey>).values()].map(k => k instanceof CryptoKey && !k.extractable) });
          };
        };
      }));
      expect(remembered.fields).toEqual(['ai', 'current', 'id', 'keyring', 'ring', 'session']);
      expect(remembered.keys.length).toBeGreaterThan(0);
      expect(remembered.keys.every(Boolean), 'every remembered key is non-extractable').toBe(true);
      await p2.reload();
      await restored(p2);
      await expect(p2.getByText('louder and slower right here')).toBeVisible();

      // Sign out, sign in again: the remembered unlock is forgotten and the passphrase is asked.
      await p2.goto(`${base}music/studio.php`);
      await p2.getByRole('button', { name: 'Sign out', exact: true }).click();
      await signIn(p2, base);
      await p2.goto(`${base}music/piece.php?id=test-piece`);
      await openNotes(p2);
      await expect(p2.getByRole('button', { name: 'Unlock notes' })).toBeVisible();
      await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
      await unlock(p2, testKey.passphrase);
      await p2.locator('[data-note]', { hasText: 'louder and slower right here' }).getByRole('button', { name: /^Delete note from/ }).click();
      // Delete asks first, in words.
      await p2.getByRole('group', { name: /^Delete note from/ }).getByRole('button', { name: 'Delete it' }).click();
      await expect(p2.getByText('louder and slower right here')).toHaveCount(0);
    } finally {
      await phone.close();
    }
  } finally {
    await context.close();
  }
});

test('a composer asks for the unlock first; hum, react and draw the energy; a note made offline waits on this device and goes when the connection is back', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const publish = await createKey(page, base, 'e2e answer more', ['drafts:publish', 'keys:publish']);
    await publishFixtureDraft(request, base, publish);
    await uploadTestKeyring(request, base, publish);
    await page.goto(`${base}music/piece.php?id=test-piece`);

    // Before an unlock nothing can be sealed: React opens the notes panel at the unlock form with the reason, and the reactions after the unlock.
    await page.getByRole('button', { name: 'React' }).click();
    await expect(page.locator('[data-unlock-reason]')).toHaveText(UNLOCK_FIRST);
    await expect(page.locator('[data-react-bar]')).toHaveCount(0);
    await page.getByLabel('Passphrase').fill(testKey.passphrase);
    await page.getByRole('button', { name: 'Unlock notes' }).click();
    await expect(page.locator('[data-react-bar]')).toBeVisible();
    await expect(page.locator('[data-unlock-reason]')).toHaveCount(0);
    await expect(page.locator('[data-history]')).toBeVisible();
    await page.getByRole('button', { name: 'React' }).click();
    await expect(page.locator('[data-react-bar]')).toHaveCount(0);

    await page.getByRole('button', { name: 'Hum it' }).click();
    await expect(page.getByRole('button', { name: 'Stop (0:01 of 1:00)' })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /^Stop \(/ }).click();
    const hum = page.locator('[data-note]', { hasText: 'Humming' });
    await expect(hum).toHaveCount(1);
    await expect(hum.locator('audio[data-note-audio]')).toHaveAttribute('src', /^blob:/);

    // Switching to another mode while humming stops the microphone and keeps the recording to send or discard.
    await page.getByRole('button', { name: 'Hum it' }).click();
    await expect(page.getByRole('button', { name: /^Stop \(/ })).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'React' }).click();
    await expect(page.locator('[data-held-recording]')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Stop \(/ })).toHaveCount(0);
    await page.getByRole('button', { name: 'Discard recording' }).click();
    await expect(page.locator('[data-held-recording]')).toHaveCount(0);
    await expect(hum).toHaveCount(1);

    // A reaction is one tap, and the bar stays open for the next.
    await expect(page.locator('[data-react-bar]')).toContainText('React to: The Labyrinth stirs');
    await page.getByRole('button', { name: 'Love it' }).click();
    await expect(page.locator('[data-note]', { hasText: 'Reaction: Love it' })).toHaveCount(1);
    await expect(page.locator('[data-react-bar]')).toBeVisible();

    await page.getByRole('button', { name: 'Draw the energy' }).click();
    await expect(page.locator('[data-energy-editor]')).toBeVisible();
    await expect(page.locator('[data-legend]')).toHaveText('dashed = the energy now · green = your shape · higher = more intense');
    await dragAcross(page, '[data-energy-editor]', 0.2, 0.8, 140, 20);
    await page.getByRole('button', { name: 'Send this shape' }).click();
    await expect(page.locator('[data-note]', { hasText: 'Energy shape' })).toHaveCount(1);
    await expect(page.locator('[data-timeline]')).toBeVisible();

    await context.setOffline(true);
    await page.getByRole('button', { name: 'Pin a note' }).click();
    await expect(page.locator('[data-timeline]')).toBeInViewport();
    const box = (await page.locator('[data-timeline]').boundingBox())!;
    await page.locator('[data-timeline]').click({ position: { x: box.width * 0.25, y: 90 } });
    await expect(page.locator('[data-pin-span]')).toHaveText(/^For Bar \d+ · /);
    await noteBox(page).fill('made with no connection');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('No connection');
    await expect(page.locator('[data-kept-note]')).toHaveCount(1);
    // The outbox holds the sealed note only: exactly key, bundle, made and reason, and the typed words are nowhere in the bytes.
    const waiting = await page.evaluate(words => new Promise<{ keys: string[]; plain: boolean }[]>((resolve, reject) => {
      const r = indexedDB.open('siue-music');
      r.onsuccess = () => {
        const q = r.result.transaction('outbox').objectStore('outbox').getAll();
        q.onsuccess = () => {
          const needle = new TextEncoder().encode(words);
          const has = (b: Uint8Array): boolean => { for (let i = 0; i + needle.length <= b.length; i++) if (needle.every((x, j) => b[i + j] === x)) return true; return false; };
          resolve((q.result as Record<string, unknown>[]).map(rec => ({ keys: Object.keys(rec).sort(), plain: has(rec.bundle as Uint8Array) })));
        };
        q.onerror = () => reject(q.error);
      };
      r.onerror = () => reject(r.error);
    }), 'made with no connection');
    expect(waiting).toEqual([{ keys: ['bundle', 'key', 'made', 'reason'], plain: false }]);
    await context.setOffline(false);
    await expect(page.locator('[data-kept-note]')).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('[data-note]', { hasText: 'made with no connection' })).toHaveCount(1);
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
  { name: 'notes-locked', path: 'music/piece.php?id=test-piece', ready: async p => { await openNotes(p); await expect(p.getByRole('button', { name: 'Unlock notes' })).toBeVisible(); } },
  { name: 'unlock-first', path: 'music/piece.php?id=test-piece', ready: async p => { await p.getByRole('button', { name: 'Pin a note' }).click(); await expect(p.locator('[data-unlock-reason]')).toBeVisible(); } },
  { name: 'notes', path: 'music/piece.php?id=test-piece', ready: async p => { await unlock(p, testKey.passphrase); await expect(p.locator('[data-history]')).toBeVisible(); } },
  { name: 'pin', path: 'music/piece.php?id=test-piece', ready: async p => {
    await unlockThenClose(p);
    await expect(p.locator('[data-timeline]')).toBeVisible();
    await pinSpan(p, 0.5, 0.85);
    await noteBox(p).fill('More horns here, and hold the last chord longer.');
  } },
  { name: 'react', path: 'music/piece.php?id=test-piece', ready: async p => { await unlockThenClose(p); await p.getByRole('button', { name: 'React' }).click(); await expect(p.locator('[data-react-bar]')).toBeVisible(); } },
  { name: 'energy', path: 'music/piece.php?id=test-piece', ready: async p => {
    await unlockThenClose(p);
    await p.getByRole('button', { name: 'Draw the energy' }).click();
    // On a phone the drawing starts below the fold, under the notes handle: scroll it up, as a person would.
    await p.locator('[data-energy-editor]').evaluate(el => el.scrollIntoView({ block: 'center' }));
    await dragAcross(p, '[data-energy-editor]', 0.3, 0.7, 140, 30);
    await expect(p.locator('[data-energy-drawn]')).toBeVisible();
  } },
  { name: 'energy-guide', path: 'music/piece.php?id=test-piece', ready: async p => {
    await unlockThenClose(p);
    await p.getByRole('button', { name: 'Draw the energy' }).click();
    await p.getByRole('button', { name: 'How to read this' }).click();
    await expect(p.locator('[data-guide-card]')).toContainText('Part 1 of 4');
  } },
  { name: 'hum-recording', path: 'music/piece.php?id=test-piece', ready: async p => { await unlockThenClose(p); await p.getByRole('button', { name: 'Hum it' }).click(); await expect(p.getByRole('button', { name: /^Stop \(/ })).toBeVisible(); } },
  { name: 'pieces-unlocked', path: 'music/', ready: async p => { await unlock(p, testKey.passphrase); await expect(p.locator('[data-pieces-notes]')).toContainText('Each piece shows'); } },
  { name: 'sound-react', path: 'music/piece.php?id=cannon-fire', ready: async p => { await unlockThenClose(p); await p.getByRole('button', { name: 'React' }).click(); await expect(p.locator('[data-react-bar]')).toBeVisible(); } },
  { name: 'sound-story', path: 'music/piece.php?id=cannon-fire', ready: p => expect(p.locator('[data-lane="boom"]')).toBeVisible() },
  { name: 'sound-sound-picture', path: 'music/piece.php?id=cannon-fire', ready: tab('Sound picture', p => expect(p.locator('img[data-spectrogram]')).toBeVisible()) },
  { name: 'missing-piece', path: 'music/piece.php?id=no-such-piece', ready: p => expect(p.locator('.error')).toBeVisible() },
  { name: 'bad-request', path: 'music/piece.php?id=%3Cscript%3E', ready: p => expect(p.locator('.error')).toBeVisible() },
];

test('every screen at 390 and 1280 px, dark and light: no sideways scroll, 44 px targets, no CSP errors', async ({ browser, request, baseURL }) => {
  test.setTimeout(600_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
    const key = await createKey(page, base, 'e2e screens', ['drafts:publish', 'keys:publish']);
    await publishFixtureDraft(request, base, key);
    await publishFixtureDraft(request, base, key, 'draft-sound');
    await uploadTestKeyring(request, base, key);
    if (SHOTS) mkdirSync(SHOTS, { recursive: true });
    for (const theme of ['dark', 'light'] as const) {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
        for (const s of SCREENS) {
          await page.goto(`${base}music/`);
          await page.evaluate(t => localStorage.setItem('workroom-theme', t), theme);
          await forgetUnlock(page); // every screen starts locked, as on a first visit
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

/** A 16-bit PCM WAV as the page writes it (render/master.ts wav): its rate, and its first channel scaled to [-1, 1]. */
function readWav(bytes: Buffer): { rate: number; channels: number; frames: number; left: Float64Array } {
  expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
  expect(bytes.readUInt16LE(34)).toBe(16);
  const channels = bytes.readUInt16LE(22);
  const rate = bytes.readUInt32LE(24);
  const frames = bytes.readUInt32LE(40) / (channels * 2);
  const left = Float64Array.from({ length: frames }, (_, i) => bytes.readInt16LE(44 + i * channels * 2) / 32767);
  return { rate, channels, frames, left };
}

/** The built sound's WAV, saved through the page's "Audio (WAV)" link. */
async function downloadWav(page: Page, name: string): Promise<Buffer> {
  const saved = page.waitForEvent('download');
  await page.getByRole('link', { name: `Download audio (wav), ${name}` }).click();
  const download = await saved;
  expect(download.suggestedFilename()).toBe(name);
  return readFileSync((await download.path())!);
}

test('a score-only draft: the page builds its sound from the library, plays it, draws it and downloads a WAV that loops cleanly', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  // The library is public (CC0): it answers without a session, while the composing sources stay closed.
  const index = await request.get(`${base}music/library/library.json`);
  expect(index.status()).toBe(200);
  const lib = await index.json() as { instruments: Record<string, { files: { file: string }[] }> };
  const flac = await request.get(`${base}music/library/${lib.instruments.horn!.files[0]!.file}`);
  expect(flac.status()).toBe(200);
  expect(flac.headers()['content-type']).toBe('audio/flac');
  expect((await flac.body()).subarray(0, 4).toString()).toBe('fLaC');
  expect((await request.get(`${base}music/compose/README.md`)).status()).toBe(403);
  expect((await request.get(`${base}music/compose/`)).status()).toBe(403);

  const { context, page } = await signedInPage(browser, base);
  try {
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e score only', ['drafts:publish']), 'draft-score');
    // The library's index is held back a moment, so the build is on screen long enough to see.
    await page.route('**/music/library/library.json', async route => { await new Promise(r => setTimeout(r, 1500)); await route.continue(); });

    await page.goto(`${base}music/piece.php?id=built-piece`);
    await expect(page.getByText('Building the sound…')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled();
    await expect(page.getByText('Building the sound…')).toBeHidden({ timeout: 60_000 });
    await expect(page.getByText('The sound could not be built')).toHaveCount(0);
    await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/);

    await page.getByRole('button', { name: 'Play' }).click();
    await expect.poll(() => page.locator('audio').evaluate(a => (a as HTMLAudioElement).currentTime)).toBeGreaterThan(0.2);
    await page.getByRole('button', { name: 'Pause' }).click();

    await page.getByRole('tab', { name: 'Sound picture' }).click();
    await expect(page.locator('canvas[data-spectrogram]')).toBeVisible();

    const wav = readWav(await downloadWav(page, 'built-piece-v1.wav'));
    expect(wav.rate).toBe(48000);
    expect(wav.channels).toBe(2);
    expect(Math.abs(wav.frames / wav.rate - 16)).toBeLessThanOrEqual(0.02);
    // The loop point: the step from the last sample to the first is no bigger than twice the largest step beside it
    // (the container render's own test, music/compose/tests/test_render.py).
    const near = Math.round(0.01 * wav.rate);
    const around = [...wav.left.subarray(wav.frames - near), ...wav.left.subarray(0, near)];
    const steps = around.slice(1).map((v, i) => Math.abs(v - around[i]!));
    const seam = steps[near - 1]!;
    expect(seam).toBeLessThanOrEqual(2 * Math.max(...steps.filter((_, i) => i !== near - 1)));
    expect(wav.left.reduce((m, v) => Math.max(m, Math.abs(v)), 0)).toBeGreaterThan(0.1);
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});

const LISTEN = process.env.MUSIC_E2E_LISTEN ?? '';

test('the listening check: the Crete title theme built from its score, saved with how long the build took', async ({ browser, request, baseURL }) => {
  test.skip(!LISTEN, 'set MUSIC_E2E_LISTEN=<folder> to build the theme (render music/pieces/crete-title/v4 first)');
  test.setTimeout(900_000);
  const base = baseURL!;
  const dir = join(SITE, 'music', 'pieces', 'crete-title', 'v4');
  const score = JSON.parse(readFileSync(join(dir, 'score.json'), 'utf8')) as { duration: number; audio: unknown[] };
  expect(score.audio).toEqual([]);
  const { context, page } = await signedInPage(browser, base);
  try {
    await publishDraft(request, base, await createKey(page, base, 'e2e listen', ['drafts:publish']), dir, 'crete-title', 4);
    await page.goto(`${base}music/piece.php?id=crete-title`);
    await expect(page.getByText('Building the sound…')).toBeVisible();
    const started = Date.now();
    await expect(page.getByText('Building the sound…')).toBeHidden({ timeout: 840_000 });
    const seconds = (Date.now() - started) / 1000;
    // What the build fetched from the library: its index and the samples the score plays.
    const library = await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(e => e.name.includes('/music/library/'))
      .map(e => (e as PerformanceResourceTiming).encodedBodySize));
    const libraryBytes = library.reduce((sum, bytes) => sum + bytes, 0);
    await expect(page.getByText('The sound could not be built')).toHaveCount(0);
    const bytes = await downloadWav(page, 'crete-title-v4.wav');
    const wav = readWav(bytes);
    expect(Math.abs(wav.frames / wav.rate - score.duration)).toBeLessThanOrEqual(0.02);
    mkdirSync(LISTEN, { recursive: true });
    writeFileSync(join(LISTEN, 'crete-title-v4.wav'), bytes);
    writeFileSync(join(LISTEN, 'build.json'), JSON.stringify({ seconds, libraryBytes, libraryFiles: library.length, duration: score.duration }, null, 1) + '\n');
  } finally {
    await context.close();
  }
});
