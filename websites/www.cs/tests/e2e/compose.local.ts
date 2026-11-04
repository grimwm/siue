// The composer in a real browser against local docker (make music-e2e E2E_ARGS=compose.local.ts). A student starts a
// New Piece, adds a Cello from Add Instrument (the track opens), and in its Record drawer plays notes in live (a held
// key sets the length; two keys together are a chord) and steps a chord, a rest and Back One; adds and drags a note on
// the piano roll, picks one and deletes it from the action bar with Undo and Redo, puts a note below a Violin's range
// (red) and moves it into range, saves draft 1, hears it on the piece page, and saves draft 2 from Compose with every
// track closed on opening. Then the Sheet view shows a track as sheet music, the Piece Menu imports a MuseScore file
// (preview, Add As New Parts, Undo) and exports MIDI and MusicXML, and the piece page engraves the saved draft. On a
// phone, holding an on-screen key in the Record drawer never moves the page. Then, with a fake Web MIDI keyboard and a
// fake microphone: Your Keyboard (asked for only when turned on, velocity, the sustain pedal, the GM program sent), drum
// pads (refused by a melody track, recorded by a Drum Kit), Hum (the demo, the microphone, Replace The Track with Undo)
// and Play Along; and on a phone a note held by the pedal never moves the page. Then the Mix view's Speed And Loudness:
// the piece's speed, a gradual speed change, a track at its own BPM, a loudness line, and Hum's Exact Pitch bends, saved
// as a schema 2 draft; on a phone the Mix view has no sideways scroll and a held key still never moves the page. Then
// the Mix view's Sound: a track's settings, Voice Effects (a Vocoder on another track, Auto-Tune) tried on the fake
// microphone and let go, the Room and the limiter, the track header's Mute with Undo, heard with Play and saved as score
// settings. Then Vocal Tracks with a fake singer, added from the Piece Menu: Record A Vocal (the microphone asked for
// only then), the take Only On This Device and kept through a reload, Save To Studio showing both sizes, saved as
// Perfect, heard, converted to Good To The Ear, a second take saved as Good To The Ear, Export With Vocals, and Your
// studio's count; and, with the vocal track added from the Add Instrument popover, Save To Studio refusing takes that
// need more room than the studio has. Then DJ & Effects: effects placed on the timeline from the palette by tap and by
// drag, a Riser on the Effects lane whose Hear From Here plays on its first press however slow the build, a clip moved,
// lengthened, stepped Longer, given a setting and removed with Undo, one placed from the keys and moved Earlier, a
// Crossfade on a track with the other track set to Fades In; DJ Mode in the Mix view played with held keys and a held
// pad, the platter and the XY Pad under Record To Timeline, landing as clips Undo takes back in one step; saved as
// fx_clips; and on a phone a held pad never moves the page. Last, the redesign's own: the Add Instrument popover's and
// the Effects palette's Hear, Expand All and Collapse All, Type Notes putting a chord in at one step, the chord helper,
// a box select transposed from the action bar, Mute All and Unmute All with their status lines, a track moved by its
// grip, regions split (S), duplicated, dragged onto another track and looped, saved as schema 2 lanes[].regions and
// reopened, sections added and duplicated, the playhead and readout moving while Play runs without the composer
// redrawing, and no sideways page scroll at 390px with every track open. SHOTS_DIR keeps screenshots.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { signInAt } from './music-mail.ts';

const STUDENT = 'composer1@siue.edu';
// More students: sign-in links are limited to three an hour for each address.
const STUDENT2 = 'composer2@siue.edu';
const STUDENT3 = 'composer3@siue.edu';
const STUDENT4 = 'composer4@siue.edu';
const STUDENT5 = 'composer5@siue.edu';
const STUDENT6 = 'composer6@siue.edu';
const STUDENT7 = 'composer7@siue.edu';
const QUARTET = join(import.meta.dirname, '..', '..', 'games', 'workroom', 'test', 'fixtures', 'import', 'musescore-quartet.musicxml');
const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;
const shots = process.env.SHOTS_DIR;
const shot = async (page: Page, name: string): Promise<void> => {
  if (!shots) return;
  mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};
const hold = async (page: Page, keys: string[], ms: number): Promise<void> => {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
};
/** A track's notes on its open piano roll, and a drum track's hits on its step sequencer. */
const notesOf = (page: Page, part: string): Locator => page.locator(`[data-grid="${part}"] [data-note-id]`);
const hitsOf = (page: Page, part: string): Locator => page.locator(`[data-grid="${part}"] [data-hit]`);
const status = (page: Page): Locator => page.locator('[data-status]');
const undo = (page: Page) => page.locator('[data-transport] [data-undo]').click();
const redo = (page: Page) => page.locator('[data-transport] [data-redo]').click();
const view = (page: Page, v: 'compose' | 'mix' | 'sheet') => page.locator(`[data-transport] [data-view="${v}"]`).click();
const save = (page: Page) => page.locator('[data-transport] [data-save]').click();
const play = (page: Page): Locator => page.locator('[data-transport] [data-play]');
/** The track ids, top to bottom. */
const trackIds = (page: Page): Promise<string[]> => page.locator('[data-track-head]').evaluateAll(els => els.map(e => e.getAttribute('data-track-head')!));
/** Pixels per beat on the timeline's shared scale. */
const ppb = async (page: Page): Promise<number> => Number.parseFloat(await page.locator('[data-timeline]').evaluate(e => (e as HTMLElement).style.getPropertyValue('--beatw')));
/** The effect clips on the timeline: each is drawn once on the Effects lane or on every track it changes. */
const clipCount = (page: Page): Promise<number> => page.locator('[data-timeline] [data-fx]').evaluateAll(els => new Set(els.map(e => e.getAttribute('data-fx'))).size);
/** Every view's guide counts as seen, so none opens over the piece page (workroom.local.ts walks the guide). */
const guidesSeen = (views: readonly string[]): void => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } };
const watchErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
  return errors;
};

/** Starts a New Piece called `title`. */
async function newPiece(page: Page, base: string, title: string): Promise<void> {
  await page.goto(`${base}music/compose.php`);
  await page.getByLabel('Title').fill(title);
  await page.getByRole('button', { name: 'Start Composing' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}
/** Add Instrument, a family when it is not Strings, and the instrument: its track is added and opens. */
async function addInstrument(page: Page, id: string, family?: string): Promise<void> {
  await page.locator('[data-add-instrument]').first().click();
  const pop = page.locator('[data-pop="add"]');
  if (family) await pop.getByRole('button', { name: family, exact: true }).click();
  await pop.locator(`[data-instrument="${id}"]`).click();
  await expect(pop).toHaveCount(0);
}
/** Opens (or closes) a track's Record drawer from its toolbar. */
const recordDrawer = (page: Page, part: string) => page.locator(`[data-tools="${part}"] [data-record]`).click();
/** Opens the Piece Menu and picks an item. */
async function pieceMenu(page: Page, item: string): Promise<void> {
  await page.locator('[data-transport] [data-piece-menu]').click();
  await page.locator('[data-pop="more"]').getByRole('button', { name: item }).click();
}
/** Clicks an open track's piano roll at `beat` on the row of `pitch`. */
async function tapRoll(page: Page, part: string, beat: number, pitch: number): Promise<void> {
  const key = page.locator(`[data-keys="${part}"] [data-key="${pitch}"]`);
  await key.scrollIntoViewIfNeeded();
  const grid = (await page.locator(`[data-grid="${part}"]`).boundingBox())!;
  const row = (await key.boundingBox())!;
  await page.mouse.click(grid.x + beat * (await ppb(page)) + 5, row.y + row.height / 2);
}
const scoreOf = <T>(page: Page, piece: string, v: number): Promise<T> =>
  page.evaluate(async ([p, n]) => (await fetch(`draft.php?piece=${p}&v=${n}&file=score.json`)).json(), [piece, v] as const) as Promise<T>;

test.describe.configure({ mode: 'serial' });

test('a student composes a piece, saves two drafts and hears it', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(guidesSeen, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT);

    await page.getByRole('link', { name: 'New Piece' }).click();
    await expect(page).toHaveURL(/music\/compose\.php$/);
    await page.getByLabel('Title').fill('My First Tune');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await expect(page.getByRole('heading', { name: 'My First Tune' })).toBeVisible();
    await expect(page.locator('[data-draft-line]')).toHaveText(/^New Piece · not saved yet · 92 BPM · 4\/4$/);
    await expect(page.locator('[data-empty-song]')).toBeVisible();
    await addInstrument(page, 'cello');
    await expect(page.locator('[data-editor-title]')).toHaveText('Cello· Piano Roll');
    await expect(page.locator('[data-grid="cello"]')).toBeVisible();
    await recordDrawer(page, 'cello');
    const drawer = page.locator('[data-record-drawer="cello"]');
    await expect(drawer.locator('[data-keys-from]')).toHaveText('C3–C5');
    await shot(page, 'desktop-new-track');

    // Play Live: A held about a beat at 92 BPM, then C and E together.
    const live = drawer.locator('[data-live-state]');
    await expect(drawer.getByRole('tab', { name: 'Play Live' })).toHaveAttribute('aria-selected', 'true');
    await expect(live).toHaveText('Press a key to start recording at bar 1.');
    await hold(page, ['KeyA'], 600);
    await expect(live).toContainText('● Recording');
    await page.waitForTimeout(300);
    await hold(page, ['KeyA', 'KeyD'], 700);
    // A key held while the keyboard moves an octave still stops the note it started.
    await page.keyboard.down('KeyA');
    await page.keyboard.press('KeyX');
    await page.keyboard.up('KeyA');
    await expect(live).toHaveText('● Recording · waiting for a bar of quiet');
    await page.keyboard.press('KeyZ');
    await drawer.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(status(page)).toHaveText('Recorded 4 notes. Undo takes them back.');
    const cello = notesOf(page, 'cello');
    await expect(cello).toHaveCount(4);
    const beat = await ppb(page);
    const lefts = await cello.evaluateAll(els => els.map(e => (e as HTMLElement).style.left));
    expect(lefts[0]).toBe('0px');
    expect(lefts[1]).toBe(lefts[2]);
    // A held length, snapped to the eighth: about a beat (the first key also waits for the track's sound to start).
    const held = (Number.parseFloat(await cello.first().evaluate(e => (e as HTMLElement).style.width)) + 1) / beat;
    expect(Number.isInteger(held * 2), `${held} beats is snapped to an eighth`).toBe(true);
    expect(held).toBeGreaterThanOrEqual(1);
    expect(held).toBeLessThanOrEqual(1.5);

    // Step: a C major chord in one step, a rest, an F, then Back One takes the F back.
    await drawer.getByRole('tab', { name: 'Step' }).click();
    await drawer.locator('[data-length="quarter"]').click();
    await hold(page, ['KeyA', 'KeyD', 'KeyG'], 100);
    await expect(cello).toHaveCount(7);
    await drawer.getByRole('button', { name: '+ Rest' }).click();
    await hold(page, ['KeyF'], 100);
    await expect(cello).toHaveCount(8);
    await drawer.getByRole('button', { name: '‹ Back One' }).click();
    await expect(cello).toHaveCount(7);
    await expect(live).toContainText('Next note at bar');
    await drawer.getByRole('button', { name: 'Close Record' }).click();
    await expect(page.locator('[data-record-drawer]')).toHaveCount(0);

    // The piano roll: tap an empty square near the end of bar 2 to add a note, then drag it one row up.
    const ids = async () => cello.evaluateAll(els => els.map(e => e.getAttribute('data-note-id')!));
    const before = await ids();
    await tapRoll(page, 'cello', 7, 55);
    await expect(cello).toHaveCount(before.length + 1);
    const id = (await ids()).find(x => !before.includes(x))!;
    const added = page.locator(`[data-grid="cello"] [data-note-id="${id}"]`);
    await expect(added).toHaveAttribute('data-note', 'G3');
    await added.evaluate(e => e.scrollIntoView({ block: 'center' }));
    const nb = (await added.boundingBox())!;
    await page.mouse.move(nb.x + 6, nb.y + nb.height / 2);
    await page.mouse.down();
    await page.mouse.move(nb.x + 6, nb.y + nb.height / 2 - (nb.height + 2), { steps: 4 });
    await page.mouse.up();
    await expect(added).toHaveAttribute('data-note', 'G#3');

    // A tap picks a note; the action bar deletes it; Undo brings it back, Redo takes it away, Ctrl+Z brings it back.
    const count = await cello.count();
    const first = cello.first();
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    const bar = page.locator('[data-actbar]');
    await expect(bar).toContainText('1 Note');
    await bar.getByRole('button', { name: 'Delete' }).click();
    await expect(cello).toHaveCount(count - 1);
    await expect(bar).toHaveCount(0);
    await undo(page);
    await expect(cello).toHaveCount(count);
    await redo(page);
    await expect(cello).toHaveCount(count - 1);
    await page.keyboard.press('Control+z');
    await expect(cello).toHaveCount(count);
    await shot(page, 'desktop-cello');

    // A Violin with a C2: red, kept, until Move Them Into Range; Undo puts it back.
    await addInstrument(page, 'violin');
    await expect(page.locator('[data-editor-title]')).toHaveText(['Cello· Piano Roll', 'Violin· Piano Roll']);
    await recordDrawer(page, 'violin');
    const vdrawer = page.locator('[data-record-drawer="violin"]');
    await vdrawer.getByRole('tab', { name: 'Step' }).click();
    await page.keyboard.press('KeyZ');
    await page.keyboard.press('KeyZ');
    await expect(vdrawer.locator('[data-keys-from]')).toHaveText('C2–C4');
    await hold(page, ['KeyA'], 80);
    await vdrawer.getByRole('button', { name: 'Close Record' }).click();
    const violin = notesOf(page, 'violin');
    await expect(violin.and(page.locator('[data-range="out"]'))).toHaveCount(1);
    const tools = page.locator('[data-tools="violin"]');
    await expect(tools.locator('[data-out-of-range]')).toHaveText("1 note is out of this instrument's range (red).");
    await tools.getByRole('button', { name: 'Move Them Into Range' }).click();
    await expect(violin.and(page.locator('[data-range="out"]'))).toHaveCount(0);
    await expect(violin).toHaveAttribute('data-note', 'C4');
    await undo(page);
    await expect(violin.and(page.locator('[data-range="out"]'))).toHaveCount(1);
    await redo(page);
    await expect(tools.locator('[data-out-of-range]')).toHaveCount(0);
    await shot(page, 'desktop-violin');

    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    await expect(page).toHaveURL(/compose\.php\?id=my-first-tune$/);

    // The piece page builds the saved draft's sound from its score.
    await page.goto(`${base}music/piece.php?id=my-first-tune`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My First Tune');
    await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/, { timeout: 60_000 });
    await page.getByRole('link', { name: 'Compose' }).click();
    await expect(page.locator('[data-draft-line]')).toHaveText(/^Draft 1 · 92 BPM/);
    // Every track starts closed: its picture of notes, no piano roll until it is opened.
    expect(await trackIds(page)).toEqual(['cello', 'violin']);
    await expect(page.locator('[data-grid]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Expand Cello' }).click();
    const reopened = await cello.count();
    const low = Number(await page.locator('[data-keys="cello"] [data-key]').last().getAttribute('data-key'));
    await tapRoll(page, 'cello', 12, low + 4);
    await expect(cello).toHaveCount(reopened + 1);
    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 2.');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('sheet music, import and export, and the piece page\'s engraved sheet', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await context.addInitScript(guidesSeen, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT);
    await page.goto(`${base}music/compose.php?id=my-first-tune`);
    await expect(page.locator('[data-track-head]')).toHaveCount(2);

    // The Sheet view: the chosen track engraved, and no piano roll.
    await view(page, 'sheet');
    await expect(page.locator('[data-part]')).toHaveCount(2);
    await page.locator('[data-part="cello"]').click();
    await expect(page.locator('[data-part="cello"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-part-sheet] svg').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-grid]')).toHaveCount(0);
    await shot(page, 'desktop-sheet');

    // Import Music File from the Piece Menu: the preview, Add As New Parts, Undo and Redo.
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), pieceMenu(page, 'Import Music File')]);
    await chooser.setFiles(QUARTET);
    await expect(page.locator('[data-import-preview]')).toBeVisible();
    await expect(page.locator('[data-import-part]')).toHaveCount(4);
    await expect(page.locator('[data-import-preview]')).toContainText('From MuseScore 4.4.2 (MusicXML)');
    await expect(page.locator('[data-import-lost]')).toContainText('Lyrics (3 words)');
    await expect(page.getByLabel('Instrument for Drumset')).toHaveValue('kit');
    await shot(page, 'desktop-import');
    await page.getByRole('button', { name: 'Add As New Parts' }).click();
    await expect(page.locator('[data-part]')).toHaveCount(6);
    await expect(status(page)).toHaveText('Added 4 tracks from musescore-quartet.musicxml. Undo takes them back.');
    await undo(page);
    await expect(page.locator('[data-part]')).toHaveCount(2);
    await redo(page);
    await expect(page.locator('[data-part]')).toHaveCount(6);
    await view(page, 'compose');
    await expect(page.locator('[data-track-head]')).toHaveCount(6);
    await view(page, 'sheet');

    const [mid] = await Promise.all([page.waitForEvent('download'), pieceMenu(page, 'Export MIDI')]);
    expect(mid.suggestedFilename()).toBe('my-first-tune.mid');
    expect(readFileSync((await mid.path())!).subarray(0, 4).toString('latin1')).toBe('MThd');
    const [xml] = await Promise.all([page.waitForEvent('download'), pieceMenu(page, 'Export MusicXML')]);
    expect(xml.suggestedFilename()).toBe('my-first-tune.musicxml');
    expect(readFileSync((await xml.path())!, 'utf8')).toContain('<part-name>Clarinet in B♭</part-name>');

    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 3.');
    await page.goto(`${base}music/piece.php?id=my-first-tune`);
    await page.getByRole('tab', { name: 'Sheet music' }).click();
    await expect(page.locator('#sheet svg').first()).toBeVisible({ timeout: 30_000 });
    await shot(page, 'desktop-piece-sheet');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

/** Holds an on-screen key of the open Record drawer and checks the page is put straight back when something scrolls it. */
async function heldKeyStays(page: Page): Promise<void> {
  const key = page.locator('[data-record-drawer] [data-key="60"]');
  await key.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -40));
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(200);
  const kb = (await key.boundingBox())!;
  await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height - 10);
  await page.mouse.down();
  await expect(page.locator('[data-record-drawer] [data-live-state]')).toContainText('● Recording');
  // Something tries to move the page while the key is held: it is put straight back.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.scrollY), 'held: the page has not moved').toBe(y);
  await page.mouse.up();
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.locator('[data-record-drawer]').getByRole('button', { name: 'Stop Recording' }).click();
}

test('on a phone, holding a key never moves the page', async ({ browser, baseURL }) => {
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT);
    await page.goto(`${base}music/compose.php?id=my-first-tune`);
    await expect(page.locator('[data-track-head]').first()).toBeVisible();
    await shot(page, 'phone-top');
    await page.getByRole('button', { name: 'Expand Cello' }).click();
    await recordDrawer(page, 'cello');
    await heldKeyStays(page);
    await shot(page, 'phone-recorded');
  } finally {
    await context.close();
  }
});

/** A fake Web MIDI keyboard ("Yamaha P-125") and a fake microphone humming D, E and F♯, both counting when they are asked for. */
function fakeDevices(): void {
  const w = window as unknown as Record<string, unknown>;
  const input = { id: 'in1', name: 'P-125', manufacturer: 'Yamaha', state: 'connected', onmidimessage: null as null | ((e: { data: Uint8Array }) => void) };
  const sent: number[][] = [];
  const output = { id: 'out1', name: 'P-125', manufacturer: 'Yamaha', state: 'connected', send: (d: number[]) => { sent.push([...d]); } };
  const access = { inputs: new Map([['in1', input]]), outputs: new Map([['out1', output]]), onstatechange: null, sysexEnabled: false };
  const asked: unknown[] = [];
  w['__midi'] = { asked, sent, play: (bytes: number[]) => input.onmidimessage?.({ data: new Uint8Array(bytes) }) };
  (navigator as unknown as Record<string, unknown>)['requestMIDIAccess'] = async (o: unknown) => { asked.push(o); return access; };
  const mic = { asked: 0, tracks: [] as MediaStreamTrack[] };
  w['__mic'] = mic;
  navigator.mediaDevices.getUserMedia = async () => {
    mic.asked++;
    const ctx = new AudioContext();
    await ctx.resume();
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    amp.gain.value = 0;
    osc.connect(amp).connect(dest);
    const t = ctx.currentTime + 0.3;
    for (const [hz, at] of [[293.66, 0], [329.63, 0.6], [369.99, 1.2]] as const) {
      osc.frequency.setValueAtTime(hz, t + at);
      amp.gain.setValueAtTime(0.5, t + at);
      amp.gain.setValueAtTime(0, t + at + 0.45);
    }
    osc.start();
    mic.tracks = dest.stream.getTracks();
    return dest.stream;
  };
}
/** A fake microphone that sings on and on (a tone with vibrato and a little breath), counting when it is asked for. */
function fakeSinger(): void {
  const mic = { asked: 0, tracks: [] as MediaStreamTrack[] };
  (window as unknown as Record<string, unknown>)['__mic'] = mic;
  navigator.mediaDevices.getUserMedia = async () => {
    mic.asked++;
    const ctx = new AudioContext();
    await ctx.resume();
    const dest = ctx.createMediaStreamDestination();
    const osc = ctx.createOscillator();
    osc.frequency.value = 220;
    const vib = ctx.createOscillator();
    vib.frequency.value = 5;
    const depth = ctx.createGain();
    depth.gain.value = 6;
    vib.connect(depth).connect(osc.frequency);
    const amp = ctx.createGain();
    amp.gain.value = 0.4;
    osc.connect(amp).connect(dest);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = (Math.random() - 0.5) * 0.05;
    const breath = ctx.createBufferSource();
    breath.buffer = noise;
    breath.loop = true;
    breath.connect(dest);
    osc.start();
    vib.start();
    breath.start();
    mic.tracks = dest.stream.getTracks();
    return dest.stream;
  };
}
const midi = (page: Page, bytes: number[]) => page.evaluate(b => (window as unknown as { __midi: { play(b: number[]): void } }).__midi.play(b), bytes);
const midiAsked = (page: Page) => page.evaluate(() => (window as unknown as { __midi: { asked: unknown[] } }).__midi.asked);
const micAsked = (page: Page) => page.evaluate(() => (window as unknown as { __mic: { asked: number } }).__mic.asked);
const micTracks = (page: Page) => page.evaluate(() => (window as unknown as { __mic: { tracks: MediaStreamTrack[] } }).__mic.tracks.map(t => t.readyState));

test('a plugged-in keyboard, drum pads, Hum and Play Along', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT2);
    await newPiece(page, base, 'Keys And Hum');
    await addInstrument(page, 'cello');
    await recordDrawer(page, 'cello');
    const drawer = page.locator('[data-record-drawer]');
    const cello = notesOf(page, 'cello');

    // Your Keyboard: Web MIDI is asked for only now, without SysEx, and the device is named as the browser reports it.
    expect(await midiAsked(page)).toEqual([]);
    await drawer.getByRole('button', { name: 'Your Keyboard: Off' }).click();
    await expect(drawer.locator('[data-midi-devices]')).toHaveText('Plugged In: Yamaha P-125');
    expect(await midiAsked(page)).toEqual([{ sysex: false }]);
    await drawer.locator('[data-midi-output]').selectOption('out1');
    await expect.poll(() => page.evaluate(() => (window as unknown as { __midi: { sent: number[][] } }).__midi.sent)).toEqual([[0xc0, 42]]);

    // Play Live from the keyboard: a soft note, a loud one, and one held by the pedal after its key comes up.
    await midi(page, [0x90, 48, 40]);
    await expect(drawer.locator('[data-midi-last]')).toHaveText('C3 · Velocity 40');
    await page.waitForTimeout(350);
    await midi(page, [0x80, 48, 0]);
    await midi(page, [0x90, 50, 120]);
    await page.waitForTimeout(350);
    await midi(page, [0x90, 50, 0]);
    await midi(page, [0xb0, 64, 127]);
    await expect(drawer.locator('[data-pedal]')).toHaveText('Sustain Pedal: Down');
    await midi(page, [0x90, 52, 90]);
    await page.waitForTimeout(100);
    await midi(page, [0x80, 52, 0]);
    await page.waitForTimeout(600);
    await midi(page, [0xb0, 64, 0]);
    await expect(drawer.locator('[data-pedal]')).toHaveText('Sustain Pedal: Up');
    await drawer.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(cello).toHaveCount(3);
    expect(await cello.evaluateAll(els => els.map(e => [e.getAttribute('data-note'), e.getAttribute('data-velocity')]))).toEqual([['C3', '40'], ['D3', '120'], ['E3', '90']]);
    const held = (await page.locator('[data-grid="cello"] [data-note="E3"]').boundingBox())!.width;
    expect(held, 'a beat, not the tenth of a second the key was down').toBeGreaterThan((await ppb(page)) * 0.75);

    // Drum pads: a melody track does not record them; a Drum Kit track does, named the General MIDI way.
    await midi(page, [0x99, 38, 100]);
    await expect(status(page)).toHaveText('Drum pads play a drum track: open a Drum Kit track\'s Record drawer.');
    await midi(page, [0x89, 38, 0]);
    await addInstrument(page, 'kit', 'Drums & Percussion');
    await expect(page.locator('[data-editor-title]').last()).toHaveText('Drum Kit· Step Sequencer');
    await recordDrawer(page, 'drum-kit');
    await expect(page.locator('[data-record-drawer="drum-kit"]')).toBeVisible();
    await drawer.getByRole('button', { name: 'Your Keyboard: Off' }).click();
    await expect(drawer.locator('[data-midi-devices]')).toHaveText('Plugged In: Yamaha P-125');
    await midi(page, [0x99, 38, 100]);
    await expect(drawer.locator('[data-midi-last]')).toHaveText('Snare · Pad 38 · Velocity 100');
    await midi(page, [0x89, 38, 0]);
    await drawer.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(hitsOf(page, 'drum-kit')).toHaveCount(1);
    await shot(page, 'desktop-keyboard');

    // Hum: the demo, snapped to all twelve notes, after the track's notes.
    await recordDrawer(page, 'cello');
    await drawer.getByRole('tab', { name: 'Hum' }).click();
    await drawer.locator('[data-hum-snap="all12"]').click();
    await drawer.getByRole('button', { name: 'Play The Demo Hum' }).click();
    await expect(drawer.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4 A4', { timeout: 15_000 });
    await shot(page, 'desktop-hum-demo');
    await drawer.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(cello).toHaveCount(7);
    await expect(status(page)).toHaveText('Added 4 hummed notes at bar 2. Undo takes them back.');

    // The microphone: asked for only on Record With Mic, let go when the recording stops.
    expect(await micAsked(page)).toBe(0);
    await drawer.getByRole('button', { name: '● Record With Mic' }).click();
    // The fake microphone hums for about 1.75 s after a 0.3 s pause: stop once the recording's clock has passed 2 s.
    await expect(drawer.locator('[data-hum-stop]')).toContainText(/· [2-9] s/, { timeout: 10_000 });
    await drawer.locator('[data-hum-stop]').click();
    await expect(drawer.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4', { timeout: 15_000 });
    expect(await micTracks(page)).toEqual(['ended']);
    await drawer.locator('[data-hum-place="replace"]').click();
    await drawer.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(cello).toHaveCount(3);
    await undo(page);
    await expect(cello).toHaveCount(7);

    // Play Along with the other tracks off: one bar of count-in, then a key lands in time with the clicks.
    await drawer.getByRole('tab', { name: 'Play Live' }).click();
    await drawer.getByRole('button', { name: 'Hear The Other Tracks: On' }).click();
    await drawer.getByRole('button', { name: '▶ Play Along' }).click();
    await expect(drawer.locator('[data-live-state]')).toContainText('● Playing Along', { timeout: 10_000 });
    await shot(page, 'desktop-play-along');
    await hold(page, ['KeyA'], 400);
    await drawer.locator('[data-along-stop]').click();
    await expect(status(page)).toHaveText('Recorded 1 note. Undo takes it back.');
    await expect(cello).toHaveCount(8);
    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('on a phone, a note held by the sustain pedal never moves the page', async ({ browser, baseURL }) => {
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT2);
    await newPiece(page, base, 'Pedal On A Phone');
    await addInstrument(page, 'cello');
    await recordDrawer(page, 'cello');
    const drawer = page.locator('[data-record-drawer]');
    await drawer.getByRole('button', { name: 'Your Keyboard: Off' }).click();
    await expect(drawer.locator('[data-midi-devices]')).toHaveText('Plugged In: Yamaha P-125');
    await drawer.locator('[data-key="60"]').scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    await midi(page, [0xb0, 64, 127]);
    await midi(page, [0x90, 60, 90]);
    await midi(page, [0x80, 60, 0]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await shot(page, 'phone-pedal');
    await midi(page, [0xb0, 64, 0]);
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    await context.close();
  }
});

test('speed, loudness and Exact Pitch bends are saved as a schema 2 draft', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT3);
    await newPiece(page, base, 'Speed Test');
    await addInstrument(page, 'cello');
    await recordDrawer(page, 'cello');
    const drawer = page.locator('[data-record-drawer]');

    // Hum the demo with Exact Pitch: the scooped, wavering A keeps its bend.
    await drawer.getByRole('tab', { name: 'Hum' }).click();
    await drawer.locator('[data-hum-snap="exact"]').click();
    await drawer.getByRole('button', { name: 'Play The Demo Hum' }).click();
    await expect(drawer.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4 A4', { timeout: 15_000 });
    await drawer.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(notesOf(page, 'cello')).toHaveCount(4);

    // The Mix view's Speed And Loudness: the piece's speed, Quick 128, then a gradual slow-down to 66 at a later bar.
    await view(page, 'mix');
    await expect(page.locator('[data-part="cello"]')).toHaveAttribute('aria-pressed', 'true');
    const panel = page.locator('[data-speed-panel]');
    await panel.locator('[data-piece-speed="128"]').click();
    await expect(page.locator('[data-draft-line]')).toContainText('128 BPM');
    await expect(page.locator('[data-transport] [data-bpm]')).toContainText('128');
    await panel.locator('[data-add-tempo]').click();
    const mark = panel.locator('[data-tempo-mark]').first();
    const bar = Number(await mark.getAttribute('data-tempo-mark'));
    await mark.getByRole('spinbutton').fill('66');
    await mark.getByRole('spinbutton').press('Enter');
    await mark.locator(`[data-gradual="${bar}"]`).click();
    await expect(mark.locator(`[data-gradual="${bar}"]`)).toHaveText('Slow Down');
    await expect(mark.locator(`[data-gradual="${bar}"]`)).toHaveAttribute('aria-pressed', 'true');

    // This track's own speed, and a loudness line from Soft getting louder to Loud.
    await panel.locator('[data-part-speed="bpm"]').click();
    await expect(panel.locator('[data-speed-words]')).toHaveText('Its own 128 BPM');
    await panel.locator('[data-add-loudness]').click();
    await panel.locator('[data-level="1"]').selectOption('48');
    await panel.locator('[data-add-loudness]').click();
    const second = panel.locator('[data-loudness-mark]').nth(1);
    const loudBar = Number(await second.getAttribute('data-loudness-mark'));
    await second.locator('select').selectOption('100');
    await panel.locator('[data-dyn-gradual="1"]').click();
    await expect(panel.locator('[data-dyn-gradual="1"]')).toHaveText('Get Louder');
    await shot(page, 'desktop-speed-loudness');

    // Undo takes the last change back, Redo puts it back.
    await undo(page);
    await expect(panel.locator('[data-dyn-gradual="1"]')).toHaveAttribute('aria-pressed', 'false');
    await redo(page);
    await expect(panel.locator('[data-dyn-gradual="1"]')).toHaveAttribute('aria-pressed', 'true');

    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    const score = await scoreOf<{
      schema: number; piece_tempo: { bar: number; bpm: number; shape: string }[]; tempo: { bar: number; bpm: number }[];
      lanes: { speed?: unknown; dynamics?: { bar: number; level: number; shape: string }[] }[]; notes: { bend?: [number, number][] }[];
    }>(page, 'speed-test', 1);
    expect(score.schema).toBe(2);
    expect(score.piece_tempo).toEqual([{ bar: 1, bpm: 128, shape: 'slow_down' }, { bar, bpm: 66, shape: 'steady' }]);
    expect(score.tempo[0]!.bpm).toBe(128);
    expect(score.tempo[score.tempo.length - 1]!.bpm).toBe(66);
    expect(score.lanes[0]!.speed).toEqual({ bpm: 128 });
    expect(score.lanes[0]!.dynamics).toEqual([{ bar: 1, level: 48, shape: 'louder' }, { bar: loudBar, level: 100, shape: 'steady' }]);
    const bent = score.notes.filter(n => n.bend);
    expect(bent.length).toBeGreaterThan(0);
    expect(bent.every(n => n.bend!.length >= 2 && n.bend!.length <= 64 && n.bend![0]![0] === 0)).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('on a phone, the Mix view fits and a held key never moves the page', async ({ browser, baseURL }) => {
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT3);
    await page.goto(`${base}music/compose.php?id=speed-test`);
    await view(page, 'mix');
    await expect(page.locator('[data-speed-panel]')).toBeVisible();
    await shot(page, 'phone-speed-loudness');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, 'no sideways scroll').toBeLessThanOrEqual(400);
    await view(page, 'compose');
    await page.getByRole('button', { name: 'Expand Cello' }).click();
    await recordDrawer(page, 'cello');
    await heldKeyStays(page);
  } finally {
    await context.close();
  }
});

/** Starts a New Piece with a cello track and a horn track, each with a note or two, both open and no Record drawer open. */
async function twoParts(page: Page, base: string, title: string): Promise<void> {
  await newPiece(page, base, title);
  await addInstrument(page, 'cello');
  await recordDrawer(page, 'cello');
  await hold(page, ['KeyA', 'KeyD'], 400);
  await page.locator('[data-record-drawer]').getByRole('button', { name: 'Stop Recording' }).click();
  await addInstrument(page, 'horn', 'Brass');
  await recordDrawer(page, 'french-horn');
  await hold(page, ['KeyG'], 400);
  await page.locator('[data-record-drawer]').getByRole('button', { name: 'Stop Recording' }).click();
  await page.locator('[data-record-drawer]').getByRole('button', { name: 'Close Record' }).click();
  await expect(page.locator('[data-record-drawer]')).toHaveCount(0);
}

/** Play heard to its building and playing, then Stop. */
async function playAndStop(page: Page, timeout: number): Promise<void> {
  await play(page).click();
  await expect(play(page)).toHaveAttribute('aria-label', 'Stop', { timeout });
  await expect(play(page)).toHaveText('Stop');
  await play(page).click();
  await expect(play(page)).toHaveAttribute('aria-label', 'Play');
}

test('Sound, Voice Effects, the Room and the limiter are heard and saved as score settings', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT4);
    await twoParts(page, base, 'Sound Test');

    await view(page, 'mix');
    const sound = page.locator('[data-sound-panel]');
    const slide = async (name: string, value: number) => sound.locator(`[data-fx="${name}"]`).first().evaluate((el, v) => {
      const input = el as HTMLInputElement;
      input.value = String(v);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
    await page.locator('[data-part="cello"]').click();
    await slide('pan', -0.5);
    await slide('bass', 6);
    await slide('echo', 0.4);
    await slide('warmth', 0.3);

    // Voice Effects on the horn: a Vocoder with the cello as its carrier, then Auto-Tune.
    await page.locator('[data-part="french-horn"]').click();
    await sound.locator('[data-voice-pick]').selectOption('vocoder');
    await sound.locator('[data-voice-add]').click();
    await expect(sound.locator('[data-carrier]')).toHaveValue('cello');
    await sound.locator('[data-voice-pick]').selectOption('autotune');
    await sound.locator('[data-voice-add]').click();
    await expect(sound.locator('[data-voice-fx]')).toHaveCount(2);

    // Try It With The Mic: the microphone is asked for only now, and let go on Stop The Mic.
    expect(await micAsked(page)).toBe(0);
    await sound.locator('[data-live-try]').click();
    await expect(sound.locator('[data-live-stop]')).toBeVisible();
    expect(await micAsked(page)).toBe(1);
    await expect(sound.locator('[data-live-note]')).toContainText('Listening');
    await sound.locator('[data-live-stop]').click();
    expect(await micTracks(page)).toEqual(['ended']);

    // The Whole Piece: a Cathedral and the limiter.
    await sound.locator('[data-room-preset="cathedral"]').click();
    await sound.locator('[data-limiter]').click();
    await expect(sound.locator('[data-limiter]')).toHaveText('Limiter: On');
    await sound.locator('summary', { hasText: 'What The Score Saves' }).click();
    await expect(sound.locator('[data-score-saves]')).toContainText('"cathedral"');
    await shot(page, 'desktop-sound');

    // Mute is the track header's speaker in Compose; Undo takes it back.
    await view(page, 'compose');
    const mute = page.locator('[data-mute="cello"]');
    await mute.click();
    await expect(mute).toHaveAttribute('aria-pressed', 'true');
    await expect(mute).toHaveAttribute('aria-label', 'Unmute Cello');
    await expect(page.locator('[data-track-head="cello"]')).toContainText('Muted');
    await undo(page);
    await expect(mute).toHaveAttribute('aria-pressed', 'false');

    // Heard with Play: the longer road through the tracks, the Room and the limiter builds and plays.
    await playAndStop(page, 60_000);

    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    const score = await scoreOf<{
      schema: number; mix: { room?: { preset: string }; limiter?: { on: boolean } };
      lanes: { id: string; fx?: { pan?: number; eq?: { bass?: number }; echo?: { amount: number }; warmth?: number; mute?: boolean }; voice?: { effect: string; carrier?: string }[] }[];
    }>(page, 'sound-test', 1);
    expect(score.schema).toBe(2);
    expect(score.mix.room?.preset).toBe('cathedral');
    expect(score.mix.limiter?.on).toBe(true);
    const cello = score.lanes.find(l => l.id === 'cello')!;
    expect(cello.fx).toMatchObject({ pan: -0.5, eq: { bass: 6 }, echo: { amount: 0.4 }, warmth: 0.3 });
    expect(cello.fx?.mute ?? false).toBe(false);
    const horn = score.lanes[1]!;
    expect(horn.voice!.map(v => v.effect)).toEqual(['vocoder', 'autotune']);
    expect(horn.voice![0]!.carrier).toBe('cello');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('Vocal Tracks: recorded on this device, kept through a reload, saved both ways, converted and exported', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await context.addInitScript(fakeSinger);
  try {
    const page = await context.newPage();
    page.on('dialog', d => void d.accept());
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT5);
    await newPiece(page, base, 'Vocal Test');
    await addInstrument(page, 'cello');
    await recordDrawer(page, 'cello');
    await hold(page, ['KeyA', 'KeyD'], 400);
    await page.locator('[data-record-drawer]').getByRole('button', { name: 'Stop Recording' }).click();
    await page.locator('[data-record-drawer]').getByRole('button', { name: 'Close Record' }).click();
    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');

    const panel = page.locator('[data-vocal-panel]');
    const record = async () => {
      await panel.getByRole('button', { name: '● Record A Vocal' }).click();
      await expect(status(page)).toContainText('Counting in', { timeout: 60_000 });
      await page.waitForTimeout(4500); // the one-bar count-in at 92 BPM, then about two seconds of singing
      await panel.getByRole('button', { name: '■ Stop' }).click();
      await expect(status(page)).toContainText('is kept on this device');
    };

    // Add Vocal Track from the Piece Menu: the track opens on its panel; the microphone is asked for only on Record A
    // Vocal, and the take is Only On This Device.
    await pieceMenu(page, 'Add Vocal Track');
    await expect(panel).toBeVisible();
    await expect(page.locator('[data-track-head="voice"]')).toContainText('Vocal Track');
    expect(await micAsked(page)).toBe(0);
    await record();
    expect(await micAsked(page)).toBe(1);
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['Only On This Device']);
    await expect(panel.locator('[data-clip]')).toHaveCount(1);
    await expect(page.locator('[data-track-row="voice"] [data-vocal-clip]')).toHaveCount(1);
    // The count-in is recorded but not heard: the clip starts where the piece starts, past the count-in in its take.
    const placed = async () => ({ at: Number(await panel.locator('[data-clip-at]').inputValue()), from: Number(await panel.locator('[data-clip-from]').inputValue()) });
    const first = await placed();
    expect(first.at).toBeLessThan(0.5);
    expect(first.from).toBeGreaterThan(2);
    await shot(page, 'vocal-recorded');

    // A reload before saving: the take is still on this device, and goes back where it was sung.
    await page.reload();
    await expect(page.locator('[data-track-head="cello"]')).toBeVisible({ timeout: 60_000 });
    await pieceMenu(page, 'Add Vocal Track');
    await expect(panel.locator('[data-device-take]')).toHaveCount(1);
    await panel.getByRole('button', { name: 'Add To The Track' }).click();
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['Only On This Device']);
    expect(await placed()).toEqual(first);

    // Save To Studio: both sizes, made for real, and what each leaves; Perfect is the studio's first choice.
    await save(page);
    const takes = page.locator('[data-save-takes]');
    await expect(takes.locator('[data-choice="perfect"] [data-size]')).toBeVisible({ timeout: 60_000 });
    await expect(takes.locator('[data-choice="ear"] [data-size]')).toBeVisible();
    const bytes = async (q: string) => {
      const t = (await takes.locator(`[data-choice="${q}"] [data-size]`).textContent())!;
      return Number.parseFloat(t) * (t.endsWith('MB') ? 1024 : 1);
    };
    expect(await bytes('ear')).toBeLessThan(await bytes('perfect'));
    await expect(takes.locator('[data-choice="perfect"] input')).toBeChecked();
    await expect(takes.locator('[data-choice="perfect"]')).toContainText(/leaves .* about [\d.]+ more minutes/);
    await shot(page, 'vocal-save-choice');
    await takes.getByRole('button', { name: 'Save To Studio' }).click();
    await expect(status(page)).toHaveText('Saved as draft 2.', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Perfect']);
    const draft = await scoreOf<{ schema: number; lanes: { id: string; vocal?: { takes: { file: string }[] } }[] }>(page, 'vocal-test', 2);
    expect(draft.schema).toBe(2);
    const take = draft.lanes.find(l => l.vocal)!.vocal!.takes[0]!.file;
    expect(take).toMatch(/^vocal-[0-9a-f]{64}\.flac$/);
    expect((await page.evaluate(async f => (await fetch(`take.php?file=${f}`)).status, take))).toBe(200);

    // Heard with Play: the take plays from the studio through the renderer.
    await playAndStop(page, 60_000);

    // Convert To Good To The Ear: a warning first, then every draft moves onto the smaller copy.
    await panel.getByRole('button', { name: 'Convert To Good To The Ear' }).click();
    await expect(panel.locator('[data-convert-warning]')).toContainText('cannot be undone');
    await panel.getByRole('button', { name: 'Convert', exact: true }).click();
    await expect(status(page)).toContainText('Converted', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Good To The Ear']);
    expect((await page.evaluate(async f => (await fetch(`take.php?file=${f}`)).status, take))).toBe(404);
    const moved = await scoreOf<{ lanes: { vocal?: { takes: { file: string }[] } }[] }>(page, 'vocal-test', 2);
    expect(moved.lanes.find(l => l.vocal)!.vocal!.takes[0]!.file).toMatch(/^vocal-[0-9a-f]{64}\.(ogg|webm)$/);

    // A second take saved as Good To The Ear.
    await record();
    await save(page);
    await expect(takes.locator('[data-choice="ear"] [data-size]')).toBeVisible({ timeout: 60_000 });
    await takes.locator('[data-choice="ear"] input').check();
    await takes.getByRole('button', { name: 'Save To Studio' }).click();
    await expect(status(page)).toHaveText('Saved as draft 3.', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Good To The Ear', 'In Your Studio · Good To The Ear']);

    // Export With Vocals: one zip.
    const [zip] = await Promise.all([page.waitForEvent('download'), pieceMenu(page, 'Export With Vocals')]);
    expect(zip.suggestedFilename()).toBe('vocal-test-with-vocals.zip');

    // Your studio shows the takes and the minutes left.
    await page.goto(`${base}music/studio.php`);
    await expect(page.locator('[data-vocal-takes]')).toContainText('2 saved');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('Save To Studio says when the takes need more room than the studio has, and keeps them on this device', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeSinger);
  try {
    const page = await context.newPage();
    page.on('dialog', d => void d.accept());
    await signInAt(page, base, 'music', STUDENT6);
    // The studio says it has 1 KB left, as a nearly full studio would.
    await page.route(/compose\.php/, async route => {
      const r = await route.fetch();
      await route.fulfill({ response: r, body: (await r.text()).replace(/data-room="\d+"/, 'data-room="1024"') });
    });
    await newPiece(page, base, 'Full Studio');
    // Add Vocal Track from the Add Instrument popover of the empty song.
    await page.locator('[data-add-instrument]').first().click();
    await page.locator('[data-pop="add"]').getByRole('button', { name: 'Add Vocal Track' }).click();
    const panel = page.locator('[data-vocal-panel]');
    await panel.getByRole('button', { name: '● Record A Vocal' }).click();
    await expect(status(page)).toContainText('Counting in', { timeout: 60_000 });
    await page.waitForTimeout(4500);
    await panel.getByRole('button', { name: '■ Stop' }).click();
    await save(page);
    const takes = page.locator('[data-save-takes]');
    await expect(takes.locator('[data-save-total]')).toContainText('but your studio has 1 KB left', { timeout: 60_000 });
    await expect(takes.getByRole('button', { name: 'Save To Studio' })).toBeDisabled();
    await takes.getByRole('button', { name: 'Not Now' }).click();
    await expect(status(page)).toHaveText('Not saved. Your takes are still on this device.');
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['Only On This Device']);
    // On a phone, the Vocal Track panel fits the screen with no sideways scroll.
    await page.setViewportSize({ width: 400, height: 860 });
    await panel.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await shot(page, 'vocal-phone');
  } finally {
    await context.close();
  }
});

/** Clicks a timeline row (`lane` for the Effects lane, else a track's piano roll) at `beat` beats in. */
async function tapTimeline(page: Page, row: string, beat: number): Promise<void> {
  const cell = page.locator(row === 'lane' ? '[data-row="lane"] .cmp-cell' : `[data-grid="${row}"]`);
  const box = (await cell.boundingBox())!;
  await cell.click({ position: { x: beat * (await ppb(page)) + 3, y: Math.min(12, box.height / 2) } });
}

test('DJ & Effects: placed on the timeline, performed live under Record To Timeline, and saved as fx_clips', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT5);
    await twoParts(page, base, 'Dj Test');
    const beat = await ppb(page);
    await page.locator('[data-add-effect]').click();
    const palette = page.locator('[data-palette]');
    await expect(palette).toBeVisible();

    // By tap: Riser, then the bar line it builds into on the Effects lane.
    await palette.locator('[data-family="build"]').click();
    await palette.locator('[data-effect="riser"]').click();
    await expect(page.locator('[data-place-banner]')).toContainText('the bar line the Riser should build into');
    await tapTimeline(page, 'lane', 12);
    await expect.poll(() => clipCount(page)).toBe(1);
    await expect(page.locator('[data-place-banner]')).toHaveCount(0);
    const riser = page.locator('[data-row="lane"] [data-clip-effect="riser"]');
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 2 to bar 4');
    const settings = page.locator('[data-fx-settings="riser"]');
    await expect(settings).toBeVisible();

    // Hear From Here plays on its first press however long the sound takes to build: on a slowed machine the build
    // outlasts the moments after a press in which a browser lets a page start sound.
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 40 });
    await settings.getByRole('button', { name: 'Hear From Here' }).click();
    await expect(settings.getByRole('button', { name: 'Getting Ready…' }), 'the button says the sound is on its way').toBeDisabled();
    await expect(play(page)).toHaveAttribute('aria-label', 'Stop', { timeout: 120_000 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const readout = page.locator('[data-transport] [data-readout]');
    const at = await readout.textContent();
    await expect(readout, 'the readout moves with the sound').not.toHaveText(at!);
    await expect(settings.getByRole('button', { name: 'Hear From Here' })).toBeEnabled();
    // The piece plays on to its end by itself.
    await expect(play(page)).toHaveAttribute('aria-label', 'Play', { timeout: 60_000 });
    await settings.getByRole('button', { name: 'Longer' }).click();
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 2 to bar 4 beat 2');

    // By drag: Tape Stop dragged onto the cello, then given a setting.
    await palette.locator('[data-family="turntable"]').click();
    await palette.locator('[data-effect="tape_stop"]').dragTo(page.locator('[data-grid="cello"]'), { targetPosition: { x: 5, y: 10 } });
    await expect.poll(() => clipCount(page)).toBe(2);
    const tape = page.locator('[data-fx-settings="tape_stop"]');
    await expect(tape).toBeVisible();
    await tape.locator('[data-clip-control="time"]').getByRole('button', { name: 'Slow' }).click();
    await expect(tape.locator('[data-clip-control="time"]').getByRole('button', { name: 'Slow' })).toHaveAttribute('aria-pressed', 'true');

    // Drag the riser a bar earlier (a clip stays inside the piece) and pull its end in a bar.
    // In the middle of the screen, clear of the transport bar that stays at the top.
    await riser.evaluate(e => e.scrollIntoView({ block: 'center' }));
    const rb = (await riser.boundingBox())!;
    await page.mouse.move(rb.x + 20, rb.y + rb.height / 2);
    await page.mouse.down();
    await page.mouse.move(rb.x + 20 - beat * 4, rb.y + rb.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 1 to bar 3 beat 2');
    const eb = (await riser.locator('.edge.r').boundingBox())!;
    await page.mouse.move(eb.x + eb.width / 2, eb.y + eb.height / 2);
    await page.mouse.down();
    await page.mouse.move(eb.x + eb.width / 2 - beat * 4, eb.y + eb.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 1 to bar 2 beat 2');

    // Remove, and Undo puts it back.
    await page.locator('[data-fx-settings="riser"]').getByRole('button', { name: 'Remove' }).click();
    await expect.poll(() => clipCount(page)).toBe(1);
    await undo(page);
    await expect.poll(() => clipCount(page)).toBe(2);

    // From the keys: Enter on a chip, the arrows to the bar, Enter to place; then Earlier, and Undo twice.
    await palette.locator('[data-family="rhythm"]').click();
    await palette.locator('[data-effect="tremolo"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-place-banner]')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect.poll(() => clipCount(page)).toBe(3);
    const tremolo = page.locator('[data-fx-settings="tremolo"]');
    await expect(tremolo).toContainText('bar 3 → bar 4');
    await tremolo.getByRole('button', { name: 'Earlier' }).click();
    await expect(tremolo).toContainText('bar 2 beat 4 → bar 3 beat 4');
    await undo(page);
    await undo(page);
    await expect.poll(() => clipCount(page)).toBe(2);

    // A Crossfade on the cello: the cello fades out, and in its settings the horn Fades In.
    await palette.locator('[data-family="live"]').click();
    await palette.locator('[data-effect="crossfader"]').click();
    await expect(page.locator('[data-place-banner]')).toContainText('the track that fades out');
    await tapTimeline(page, 'cello', 8);
    await expect.poll(() => clipCount(page)).toBe(3);
    const fade = page.locator('[data-fx-settings="crossfader"]');
    await expect(fade.locator('[data-crossfade-sides]')).toContainText('Choose the track that fades in. Until you do, Cello just fades out.');
    await expect(page.locator('[data-track-row="cello"] [data-auto="crossfader"][data-shape="down"]').first()).toBeVisible();
    await fade.locator('[data-crossfade-sides] > div', { hasText: 'French Horn' }).getByRole('button', { name: 'Fades In' }).click();
    await expect(page.locator('[data-track-row="french-horn"] [data-auto="crossfader"][data-shape="up"]').first()).toBeVisible();
    await expect(page.locator('[data-track-row="french-horn"] [data-auto="crossfader"] [role="button"]').first()).toHaveAttribute('aria-label', 'Crossfade: Fades In, French Horn, bar 3 to bar 5');
    await shot(page, 'desktop-effects');

    // DJ Mode in the Mix view, recorded to the timeline.
    await view(page, 'mix');
    const dj = page.locator('[data-dj]');
    await dj.getByRole('button', { name: 'Get The Deck Ready' }).click();
    await expect(dj.getByRole('button', { name: '▶ Play' })).toBeVisible({ timeout: 90_000 });
    await dj.getByRole('button', { name: '▶ Play' }).click();
    await expect(dj.locator('[data-deck-bar]')).toHaveText(/^Bar \d+$/);
    const deck = async () => Number(await dj.locator('[data-deck-bar]').getAttribute('data-deck-pos'));
    const p0 = await deck();
    await expect.poll(deck, { message: 'the deck moves on' }).toBeGreaterThan(p0);
    /** Holds until the deck has played on a fifth of a bar, wherever it goes round. */
    const playOn = async () => { const from = await deck(); await expect.poll(async () => { const now = await deck(); return now >= from ? now - from : now; }).toBeGreaterThan(0.2); };
    await dj.locator('[data-record-timeline]').click();
    await expect(dj.locator('[data-recording]')).toHaveText('Recording.');
    for (const k of ['3', 'KeyZ']) {
      await page.keyboard.down(k);
      await playOn();
      await page.keyboard.up(k);
    }
    const pad = dj.locator('[data-pad="q"]');
    await pad.scrollIntoViewIfNeeded();
    const pb = (await pad.boundingBox())!;
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.mouse.down();
    await expect(pad).toHaveAttribute('aria-pressed', 'true');
    await playOn();
    await page.mouse.up();
    await dj.locator('[data-platter]').scrollIntoViewIfNeeded();
    const pl = (await dj.locator('[data-platter]').boundingBox())!;
    const cx = pl.x + pl.width / 2;
    const cy = pl.y + pl.height / 2;
    await page.mouse.move(cx + pl.width / 3, cy);
    await page.mouse.down();
    for (let k = 1; k <= 10; k++) await page.mouse.move(cx + (pl.width / 3) * Math.cos(-k * 0.3), cy + (pl.width / 3) * Math.sin(-k * 0.3));
    await page.mouse.up();
    await dj.locator('[data-xy]').scrollIntoViewIfNeeded();
    const xy = (await dj.locator('[data-xy]').boundingBox())!;
    await page.mouse.move(xy.x + 10, xy.y + xy.height - 10);
    await page.mouse.down();
    await page.mouse.move(xy.x + xy.width - 10, xy.y + 10, { steps: 10 });
    await playOn();
    await page.mouse.up();
    await dj.locator('[data-record-timeline]').click();
    await expect(status(page)).toContainText(/Recorded \d+ effects onto the timeline/);
    await shot(page, 'desktop-dj');
    await dj.getByRole('button', { name: '■ Stop' }).click();

    // On the timeline: the clips, and the pad keys played pads, not notes. Undo takes them back in one step.
    await view(page, 'compose');
    const after = await clipCount(page);
    expect(after).toBeGreaterThanOrEqual(3 + 4);
    await expect(notesOf(page, 'cello')).toHaveCount(2);
    await undo(page);
    await expect.poll(() => clipCount(page)).toBe(3);
    await redo(page);
    await expect.poll(() => clipCount(page)).toBe(after);

    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    const score = await scoreOf<{ schema: number; fx_clips: { effect: string; lane: string | null; settings?: Record<string, unknown>; points?: number[][] }[] }>(page, 'dj-test', 1);
    expect(score.schema).toBe(2);
    const effects = score.fx_clips.map(c => c.effect);
    for (const e of ['riser', 'tape_stop', 'crossfader', 'stutter', 'bitcrusher', 'scratch', 'filter']) expect(effects).toContain(e);
    expect(score.fx_clips.find(c => c.effect === 'tape_stop')).toMatchObject({ lane: 'cello', settings: { time: 'slow' } });
    expect(score.fx_clips.find(c => c.effect === 'crossfader')!.settings).toMatchObject({ a: ['cello'], b: ['french-horn'], fade: true });
    expect(score.fx_clips.find(c => c.effect === 'scratch')!.points!.length).toBeGreaterThanOrEqual(2);
    // Heard with Play: the clips are built into its sound.
    await playAndStop(page, 90_000);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('on a phone, a held DJ pad never moves the page', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT5);
    await twoParts(page, base, 'Dj Phone Test');
    await view(page, 'mix');
    const dj = page.locator('[data-dj]');
    await dj.getByRole('button', { name: 'Get The Deck Ready' }).click();
    await expect(dj.getByRole('button', { name: '▶ Play' })).toBeVisible({ timeout: 90_000 });
    await dj.getByRole('button', { name: '▶ Play' }).click();
    const pad = dj.locator('[data-pad="a"]');
    await pad.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -40));
    const y = await page.evaluate(() => window.scrollY);
    const b = (await pad.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const point = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await expect(pad).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => window.scrollTo(0, 0));
    // The pin puts the page back on the scroll event; a short wait lets any later scroll land before the check.
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await shot(page, 'phone-dj');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(pad).toHaveAttribute('aria-pressed', 'false');
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    await context.close();
  }
});

/** Every sound the page plays, by its address, to tell a Hear that played from one that did nothing. */
function countPlays(): void {
  const played: string[] = [];
  (window as unknown as Record<string, unknown>)['__played'] = played;
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    const p = play.call(this);
    void p.then(() => { if (this.src) played.push(this.src); }, () => {});
    return p;
  };
}
const played = (page: Page) => page.evaluate(() => (window as unknown as { __played: string[] }).__played.length);

test('the redesign: Hear, tracks open and closed, Type Notes, chords, box select, mutes, the grip, regions, sections, the playhead and a phone', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(countPlays);
  try {
    const page = await context.newPage();
    const errors = watchErrors(page);
    await signInAt(page, base, 'music', STUDENT7);
    await newPiece(page, base, 'Redesign Test');

    // The Add Instrument popover hears an instrument before it is added.
    await page.locator('[data-add-instrument]').first().click();
    const pop = page.locator('[data-pop="add"]');
    await pop.locator('[data-hear-instrument="cello"]').click();
    await expect(pop).toBeVisible();
    await pop.locator('[data-instrument="cello"]').click();
    await addInstrument(page, 'piano', 'Keyboards');
    expect(await trackIds(page)).toEqual(['cello', 'piano']);
    await expect(page.locator('[data-grid]')).toHaveCount(2);

    // Collapse All closes every track, Expand All opens them, a caret opens one.
    const bar = page.locator('[data-hear-bar]');
    await bar.getByRole('button', { name: 'Collapse All', exact: true }).click();
    await expect(page.locator('[data-grid]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Expand Cello' }).click();
    await expect(page.locator('[data-grid]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Collapse Cello' }).click();
    await bar.getByRole('button', { name: 'Expand All', exact: true }).click();
    await expect(page.locator('[data-grid]')).toHaveCount(2);

    // Type Notes: three keys at one step make a chord there; → moves on to the next step.
    const cello = notesOf(page, 'cello');
    const typeNotes = page.locator('[data-tools="cello"] [data-type-notes]');
    await typeNotes.click();
    await expect(typeNotes).toHaveText('Type Notes: On');
    await expect(page.locator('[data-grid="cello"] [data-step-col]')).toBeVisible();
    for (const k of ['KeyA', 'KeyD', 'KeyG']) await page.keyboard.press(k);
    await expect(cello).toHaveCount(3);
    expect(new Set(await cello.evaluateAll(els => els.map(e => (e as HTMLElement).style.left)))).toEqual(new Set(['0px']));
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('KeyF');
    await expect(cello).toHaveCount(4);
    await typeNotes.click();
    await expect(typeNotes).toHaveText('Type Notes');

    // The chord helper: pick F, then tap the piano roll; the chord's notes are put in at one beat and picked.
    const piano = notesOf(page, 'piano');
    await page.locator('[data-tools="piano"]').getByRole('button', { name: 'Chords' }).click();
    await page.locator('[data-pop="chords"] [data-chord="F"]').click();
    const act = page.locator('[data-actbar]');
    await expect(act).toContainText('Chord F');
    const low = Number(await page.locator('[data-keys="piano"] [data-key]').last().getAttribute('data-key'));
    await tapRoll(page, 'piano', 4, low + 5);
    await expect(piano).toHaveCount(3);
    expect(new Set(await piano.evaluateAll(els => els.map(e => (e as HTMLElement).style.left))).size).toBe(1);
    await expect(act).toContainText('3 Notes');
    await act.getByRole('button', { name: 'Done' }).click();
    await expect(act).toHaveCount(0);

    // Box select with Select on, then the action bar moves the picked notes up a semitone.
    const names = () => piano.evaluateAll(els => els.map(e => e.getAttribute('data-note')!));
    const chordNotes = await names();
    const select = page.locator('[data-tools="piano"]').getByRole('button', { name: 'Select' });
    await select.click();
    await expect(select).toHaveAttribute('aria-pressed', 'true');
    await piano.first().evaluate(e => e.scrollIntoView({ block: 'center' }));
    const boxes = await piano.evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }));
    const [x1, y1, x2, y2] = [Math.min(...boxes.map(b => b[0]!)), Math.min(...boxes.map(b => b[1]!)), Math.max(...boxes.map(b => b[2]!)), Math.max(...boxes.map(b => b[3]!))];
    await page.mouse.move(x1 - 12, y1 - 6);
    await page.mouse.down();
    await page.mouse.move(x2 + 6, y2 + 6, { steps: 6 });
    await page.mouse.up();
    await expect(status(page)).toHaveText('3 notes picked.');
    await expect(act).toContainText('3 Notes');
    await act.getByRole('button', { name: 'Higher', exact: true }).click();
    const up = (n: string) => ({ C: 'C#', 'C#': 'D', D: 'D#', 'D#': 'E', E: 'F', F: 'F#', 'F#': 'G', G: 'G#', 'G#': 'A', A: 'A#', 'A#': 'B' } as Record<string, string>)[n.replace(/\d+$/, '')]! + n.match(/\d+$/)![0];
    await expect.poll(names).toEqual(chordNotes.map(up));
    await select.click();
    await act.getByRole('button', { name: 'Done' }).click();
    await shot(page, 'desktop-chords');

    // Mute All and Unmute All, and the status line under them.
    const heard = page.locator('[data-mute-status]');
    await expect(heard).toHaveText('All tracks will play.');
    await page.locator('[data-mute="piano"]').click();
    await expect(heard).toHaveText('Playing: Cello. Muted: Piano.');
    await bar.getByRole('button', { name: 'Mute All', exact: true }).click();
    await expect(heard).toHaveText('All tracks are muted. Press Unmute on each track you want to hear.');
    await bar.getByRole('button', { name: 'Unmute All', exact: true }).click();
    await expect(heard).toHaveText('All tracks will play.');

    // The grip moves a track (↓ and ↑ on it from the keys); Undo puts it back.
    await page.locator('[data-grip="cello"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => trackIds(page)).toEqual(['piano', 'cello']);
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => trackIds(page)).toEqual(['cello', 'piano']);
    await page.locator('[data-grip="cello"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => trackIds(page)).toEqual(['piano', 'cello']);
    await undo(page);
    await expect.poll(() => trackIds(page)).toEqual(['cello', 'piano']);

    // Regions: the cello's is split at the cursor with S, the right half duplicated, the left half dragged onto the
    // piano (a note track like it), and a piano region set to repeat.
    const regions = (part: string) => page.locator(`[data-region-part="${part}"]`).filter({ has: page.locator('.rname') });
    await expect(regions('cello')).toHaveCount(1);
    const beat = await ppb(page);
    const ruler = page.locator('[data-ruler]');
    await ruler.click({ position: { x: beat * 2 + 3, y: 10 } });
    await expect(page.locator('[data-transport] [data-readout]')).toHaveText('Bar 1 · Beat 3 · 0:01');
    await regions('cello').first().click();
    await expect(act).toContainText('Region');
    await page.keyboard.press('s');
    await expect(regions('cello')).toHaveCount(2);
    await act.getByRole('button', { name: 'Duplicate' }).click();
    await expect(regions('cello')).toHaveCount(3);
    // Closed, the two tracks sit one above the other, each row showing its regions.
    await act.getByRole('button', { name: 'Done' }).click();
    await bar.getByRole('button', { name: 'Collapse All', exact: true }).click();
    const mini = (part: string) => page.locator(`[data-track-row="${part}"].cmp-mini [data-region]`);
    await expect(mini('cello')).toHaveCount(3);
    const pianoRegions = await mini('piano').count();
    await mini('cello').first().evaluate(e => e.scrollIntoView({ block: 'center' }));
    const left = (await mini('cello').first().boundingBox())!;
    const target = (await page.locator('[data-track-row="piano"].cmp-mini .cmp-cell').boundingBox())!;
    await page.mouse.move(left.x + 6, left.y + left.height / 2);
    await page.mouse.down();
    await page.mouse.move(left.x + 20, left.y + left.height / 2, { steps: 3 });
    await page.mouse.move(left.x + 6, target.y + target.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(mini('piano')).toHaveCount(pianoRegions + 1);
    await expect(mini('cello')).toHaveCount(2);
    // The dropped region stays picked.
    await expect(mini('piano').first()).toHaveAttribute('aria-pressed', 'true');
    await expect(act).toContainText('Piano');
    // The piano's last region (nothing after it) is set to repeat.
    await mini('piano').last().click();
    await expect(act).toContainText('Region');
    await act.getByRole('button', { name: 'Repeat' }).click();
    await expect(status(page)).toHaveText('The region repeats once more.');
    await expect(mini('piano').last()).toHaveAttribute('aria-label', /, repeats$/);
    await act.getByRole('button', { name: 'Done' }).click();

    // Sections: Add Section names bars; a picked section is duplicated straight after itself.
    await page.getByRole('button', { name: 'Add Section' }).click();
    const sec = page.locator('[data-pop="section"]');
    await sec.getByRole('button', { name: 'Chorus' }).click();
    await sec.locator('[data-section-done]').click();
    await expect(status(page)).toContainText(/^Chorus is bar \d+ to bar \d+\.$/);
    await expect(page.locator('[data-section]', { hasText: 'Chorus' })).toHaveCount(1);
    await expect(act).toContainText('Chorus');
    await act.getByRole('button', { name: 'Duplicate' }).click();
    await expect(status(page)).toHaveText('Chorus now plays twice.');
    await expect(page.locator('[data-section]', { hasText: 'Chorus' })).toHaveCount(2);
    await act.getByRole('button', { name: 'Done' }).click();
    await shot(page, 'desktop-regions-sections');

    // Saved as schema 2 with the looped region, and opened again with it.
    await save(page);
    await expect(status(page)).toHaveText('Saved as draft 1.');
    const score = await scoreOf<{ schema: number; lanes: { id: string; regions?: { from_bar: number; to_bar: number; loop_bars?: number }[] }[] }>(page, 'redesign-test', 1);
    expect(score.schema).toBe(2);
    const looped = score.lanes.find(l => l.id === 'piano')!.regions!.filter(r => r.loop_bars !== undefined);
    // The looped region, and its copy in the duplicated section.
    expect(looped.length).toBeGreaterThanOrEqual(1);
    for (const r of looped) expect(r.loop_bars!).toBeLessThan(r.to_bar - r.from_bar);
    expect(score.lanes.find(l => l.id === 'cello')!.regions!.length).toBeGreaterThanOrEqual(2);
    await page.goto(`${base}music/compose.php?id=redesign-test`);
    await expect(page.locator('[data-track-head]')).toHaveCount(2);
    await expect(page.locator('[data-region-part="piano"][aria-label$=", repeats"]')).toHaveCount(looped.length);
    await expect(page.locator('[data-section]', { hasText: 'Chorus' })).toHaveCount(2);

    // The Effects palette's Hear plays an example of the effect.
    await page.locator('[data-add-effect]').click();
    const plays = await played(page);
    const hear = page.locator('[data-palette] [data-hear-effect="riser"]');
    await hear.click();
    await expect.poll(() => played(page), { timeout: 60_000 }).toBeGreaterThan(plays);
    await expect(hear).toHaveText('Hear');
    await page.locator('[data-palette]').getByRole('button', { name: 'Close Effects' }).click();

    // Play: the playhead and the readout move with the sound, and nothing else on the page is redrawn while it plays.
    await play(page).click();
    await expect(play(page)).toHaveAttribute('aria-label', 'Stop', { timeout: 60_000 });
    await page.evaluate(() => {
      const w = window as unknown as { __changes: string[] };
      w.__changes = [];
      const keep = (n: Node): boolean => { const el = n instanceof Element ? n : n.parentElement; return !!el?.closest('[data-readout],[data-playhead]'); };
      new MutationObserver(list => { for (const m of list) if (!keep(m.target)) w.__changes.push(`${m.type} ${(m.target as Element).outerHTML?.slice(0, 80) ?? m.target.nodeName}`); })
        .observe(document.querySelector('[data-composer]')!, { subtree: true, childList: true, attributes: true, characterData: true });
    });
    const readout = page.locator('[data-transport] [data-readout]');
    const from = await readout.textContent();
    const head = page.locator('[data-playhead]');
    const x0 = await head.evaluate(e => (e as HTMLElement).style.transform);
    await expect(readout).not.toHaveText(from!);
    await expect.poll(() => head.evaluate(e => (e as HTMLElement).style.transform)).not.toBe(x0);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as unknown as { __changes: string[] }).__changes), 'only the readout and the playhead change').toEqual([]);
    await play(page).click();
    await expect(play(page)).toHaveAttribute('aria-label', 'Play');

    // On a phone, every track open: no sideways page scroll.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-hear-bar]').getByRole('button', { name: 'Expand All' }).click();
    await expect(page.locator('[data-grid]')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll').toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
    await shot(page, 'phone-open-tracks');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});
