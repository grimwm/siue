// The composer in a real browser against local docker (make music-e2e E2E_ARGS=compose.local.ts): a student starts a
// New Piece, adds a Cello, plays notes in live (a held key sets the length; two keys together are a chord), steps a
// chord, a rest and Back One, adds and drags a note on the grid, selects and deletes one with Undo and Redo, puts a
// note below a Violin's range (red) and moves it into range, saves draft 1, hears it on the piece page, and saves
// draft 2 from Compose. Then it shows a part as sheet music and both, imports a MuseScore file (preview, Add As New
// Parts, Undo), exports MIDI and MusicXML, and reads the saved draft's engraved sheet music on the piece page. On a
// phone, holding an on-screen key never moves the page, in the Both view too. Then, with a fake Web MIDI keyboard and a
// fake microphone: Your Keyboard (asked for only when turned on, velocity, the sustain pedal, drum pads, the GM program
// sent), Hum (the demo, the microphone, the three snaps and Replace The Part with Undo) and Play Along; and on a phone
// a note held by the pedal never moves the page. SHOTS_DIR keeps screenshots.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { signInAt } from './music-mail.ts';

const STUDENT = 'composer1@siue.edu';
// A second student: sign-in links are limited to three an hour for each address.
const STUDENT2 = 'composer2@siue.edu';
const QUARTET = join(import.meta.dirname, '..', '..', 'games', 'workroom', 'test', 'fixtures', 'import', 'musescore-quartet.musicxml');
const GUIDE_VIEWS = ['story', 'roll', 'sound', 'sheet', 'energy'] as const;
const shots = process.env.SHOTS_DIR;
const shot = async (page: Page, name: string): Promise<void> => {
  if (!shots) return;
  mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: join(shots, `${name}.png`), fullPage: true });
};
const notes = (page: Page) => page.locator('[data-note-id]');
const hold = async (page: Page, keys: string[], ms: number): Promise<void> => {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
};

test.describe.configure({ mode: 'serial' });

test('a student composes a piece, saves two drafts and hears it', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Every view's guide counts as seen, so none opens over the piece page (workroom.local.ts walks the guide).
  await context.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT);

    await page.getByRole('link', { name: 'New Piece' }).click();
    await expect(page).toHaveURL(/music\/compose\.php$/);
    await page.getByLabel('Title').fill('My First Tune');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await expect(page.getByRole('heading', { name: 'My First Tune' })).toBeVisible();
    await expect(page.locator('[data-draft-line]')).toHaveText(/^New Piece · not saved yet · 92 BPM · 4\/4$/);
    await page.locator('[data-instrument="cello"]').click();
    await expect(page.locator('[data-part="cello"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-keys-from]')).toHaveText('C3–C5');
    await shot(page, 'desktop-new-part');

    // Play Live: A held ~1 beat at 92 BPM, then C and E together.
    await page.getByRole('tab', { name: 'Play Live' }).click();
    await expect(page.locator('[data-live-state]')).toHaveText('Press a key to start recording at bar 1, beat 1.');
    await hold(page, ['KeyA'], 700);
    await expect(page.locator('[data-live-state]')).toContainText('● Recording');
    await page.waitForTimeout(300);
    await hold(page, ['KeyA', 'KeyD'], 700);
    // A key held while the keyboard moves an octave still stops the note it started.
    await page.keyboard.down('KeyA');
    await page.keyboard.press('KeyX');
    await page.keyboard.up('KeyA');
    await expect(page.locator('[data-live-state]')).toHaveText('● Recording · waiting for a bar of quiet');
    await page.keyboard.press('KeyZ');
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Recorded 4 notes. Undo takes them back.');
    await expect(notes(page)).toHaveCount(4);
    const lefts = await notes(page).evaluateAll(els => els.map(e => (e as HTMLElement).style.left));
    expect(lefts[0]).toBe('0px');
    expect(lefts[1]).toBe(lefts[2]);
    const width = await notes(page).first().evaluate(e => (e as HTMLElement).style.width);
    expect(width).toBe('36px'); // one beat: a held length snapped to 1

    // Step: a C major chord in one step, a rest, an F, then Back One takes the F back.
    await page.getByRole('tab', { name: 'Step' }).click();
    await page.locator('[data-length="quarter"]').click();
    await hold(page, ['KeyA', 'KeyD', 'KeyG'], 100);
    await expect(notes(page)).toHaveCount(7);
    await page.getByRole('button', { name: '+ Rest' }).click();
    await hold(page, ['KeyF'], 100);
    await expect(notes(page)).toHaveCount(8);
    await page.getByRole('button', { name: '‹ Back One' }).click();
    await expect(notes(page)).toHaveCount(7);
    await expect(page.locator('[data-step-state]')).toContainText('Next note at bar');

    // Grid: tap an empty square near the end of bar 2 to add a note, then drag it one row up.
    await page.getByRole('tab', { name: 'Grid' }).click();
    const area = page.locator('[data-grid-area]');
    await page.locator('[data-row-label="55"]').scrollIntoViewIfNeeded();
    const box = (await area.boundingBox())!;
    const g3 = (await page.locator('[data-row-label="55"]').boundingBox())!;
    const before = await notes(page).count();
    await page.mouse.click(box.x + 36 * 7 + 5, g3.y + 9);
    await expect(notes(page)).toHaveCount(before + 1);
    const added = page.locator('[data-note-id][aria-pressed="true"]');
    const name = await added.getAttribute('data-note');
    const nb = (await added.boundingBox())!;
    await page.mouse.move(nb.x + 6, nb.y + nb.height / 2);
    await page.mouse.down();
    await page.mouse.move(nb.x + 6, nb.y + nb.height / 2 - 18, { steps: 4 });
    await page.mouse.up();
    await expect(page.locator(`[data-note-id] >> nth=${before}`)).not.toHaveAttribute('data-note', name!);

    // Tap once selects, tap again deletes; Undo brings it back, Redo takes it away.
    const count = await notes(page).count();
    const first = notes(page).first();
    await first.click();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await first.click();
    await expect(notes(page)).toHaveCount(count - 1);
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(notes(page)).toHaveCount(count);
    await page.getByRole('button', { name: /^↷ Redo/ }).click();
    await expect(notes(page)).toHaveCount(count - 1);
    await page.keyboard.press('Control+z');
    await expect(notes(page)).toHaveCount(count);
    await shot(page, 'desktop-cello');

    // A Violin with a C2: red, kept, until Move Them Into Range; Undo puts it back.
    await page.getByRole('button', { name: 'Add Part' }).click();
    await page.locator('[data-instrument="violin"]').click();
    await page.getByRole('tab', { name: 'Step' }).click();
    await page.keyboard.press('KeyZ');
    await page.keyboard.press('KeyZ');
    await expect(page.locator('[data-keys-from]')).toHaveText('C2–C4');
    await hold(page, ['KeyA'], 80);
    await expect(page.locator('[data-note-id][data-range="out"]')).toHaveCount(1);
    await expect(page.locator('[data-out-of-range]')).toHaveText("1 note is out of this instrument's range (red).");
    await page.getByRole('button', { name: 'Move Them Into Range' }).click();
    await expect(page.locator('[data-note-id][data-range="out"]')).toHaveCount(0);
    await expect(page.locator('[data-note-id]')).toHaveAttribute('data-note', 'C4');
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(page.locator('[data-note-id][data-range="out"]')).toHaveCount(1);
    await page.getByRole('button', { name: /^↷ Redo/ }).click();
    await shot(page, 'desktop-violin');

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');
    await expect(page).toHaveURL(/compose\.php\?id=my-first-tune$/);

    // The piece page builds the saved draft's sound from its score.
    await page.goto(`${base}music/piece.php?id=my-first-tune`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My First Tune');
    await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/, { timeout: 60_000 });
    await page.getByRole('link', { name: 'Compose' }).click();
    await expect(page.locator('[data-draft-line]')).toHaveText(/^Draft 1 · 92 BPM/);
    await expect(page.locator('[data-part]')).toHaveCount(2);
    await page.getByRole('tab', { name: 'Grid' }).click();
    await page.locator('[data-row-label="60"]').scrollIntoViewIfNeeded();
    const box2 = (await page.locator('[data-grid-area]').boundingBox())!;
    const row = (await page.locator('[data-row-label="60"]').boundingBox())!;
    await page.mouse.click(box2.x + 36 * 12 + 5, row.y + 9);
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 2.');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('sheet music, import and export, and the piece page\'s engraved sheet', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await context.addInitScript((views: readonly string[]) => { for (const v of views) { localStorage.setItem(`workroom-guide-${v}`, 'seen'); localStorage.setItem(`workroom-guide-sound-${v}`, 'seen'); } }, GUIDE_VIEWS);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT);
    await page.goto(`${base}music/compose.php?id=my-first-tune`);
    await expect(page.locator('[data-part]')).toHaveCount(2);
    await page.locator('[data-part="cello"]').click();
    await expect(page.locator('[data-range-picture]')).toBeVisible();

    await page.locator('[data-show="sheet"]').click();
    await expect(page.locator('[data-part-sheet] svg').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[data-edit-grid]')).toHaveCount(0);
    await shot(page, 'desktop-sheet');
    await page.locator('[data-show="both"]').click();
    await expect(page.locator('[data-edit-grid]')).toBeVisible();
    await expect(page.locator('[data-part-sheet] svg').first()).toBeVisible({ timeout: 30_000 });
    await shot(page, 'desktop-both');

    await page.locator('[data-import-file]').setInputFiles(QUARTET);
    await expect(page.locator('[data-import-preview]')).toBeVisible();
    await expect(page.locator('[data-import-part]')).toHaveCount(4);
    await expect(page.locator('[data-import-preview]')).toContainText('From MuseScore 4.4.2 (MusicXML)');
    await expect(page.locator('[data-import-lost]')).toContainText('Lyrics (3 words)');
    await expect(page.getByLabel('Instrument for Drumset')).toHaveValue('kit');
    await shot(page, 'desktop-import');
    await page.getByRole('button', { name: 'Add As New Parts' }).click();
    await expect(page.locator('[data-part]')).toHaveCount(6);
    await expect(page.locator('[data-status]')).toHaveText('Added 4 parts from musescore-quartet.musicxml. Undo takes them back.');
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(page.locator('[data-part]')).toHaveCount(2);
    await page.getByRole('button', { name: /^↷ Redo/ }).click();
    await expect(page.locator('[data-part]')).toHaveCount(6);

    const [mid] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export MIDI' }).click()]);
    expect(mid.suggestedFilename()).toBe('my-first-tune.mid');
    expect(readFileSync((await mid.path())!).subarray(0, 4).toString('latin1')).toBe('MThd');
    const [xml] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export MusicXML' }).click()]);
    expect(xml.suggestedFilename()).toBe('my-first-tune.musicxml');
    expect(readFileSync((await xml.path())!, 'utf8')).toContain('<part-name>Clarinet in B♭</part-name>');

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 3.');
    await page.goto(`${base}music/piece.php?id=my-first-tune`);
    await page.getByRole('tab', { name: 'Sheet music' }).click();
    await expect(page.locator('#sheet svg').first()).toBeVisible({ timeout: 30_000 });
    await shot(page, 'desktop-piece-sheet');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('on a phone, holding a key never moves the page', async ({ browser, baseURL }) => {
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT);
    await page.goto(`${base}music/compose.php?id=my-first-tune`);
    await expect(page.locator('[data-part]').first()).toBeVisible();
    await shot(page, 'phone-top');
    const key = page.locator('[data-key="60"]');
    await key.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -40));
    const y = await page.evaluate(() => window.scrollY);
    expect(y).toBeGreaterThan(200);
    const kb = (await key.boundingBox())!;
    await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height - 10);
    await page.mouse.down();
    await expect(page.locator('[data-live-state]')).toContainText('● Recording');
    // Something tries to move the page while the key is held: it is put straight back.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(y);
    await page.mouse.up();
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await shot(page, 'phone-recorded');

    // Both: the grid and the sheet stacked, each tall enough to use, and a held key still never moves the page.
    await page.locator('[data-show="both"]').click();
    await expect(page.locator('[data-part-sheet] svg').first()).toBeVisible({ timeout: 30_000 });
    for (const sel of ['[data-edit-grid]', '[data-part-sheet]']) expect((await page.locator(sel).boundingBox())!.height).toBeGreaterThanOrEqual(200);
    await shot(page, 'phone-both');
    await key.scrollIntoViewIfNeeded();
    const y2 = await page.evaluate(() => window.scrollY);
    const kb2 = (await key.boundingBox())!;
    await page.mouse.move(kb2.x + kb2.width / 2, kb2.y + kb2.height - 10);
    await page.mouse.down();
    await page.waitForTimeout(700); // the sheet is engraved again while the key is held
    expect(await page.evaluate(() => window.scrollY)).toBe(y2);
    await page.mouse.up();
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
const midi = (page: Page, bytes: number[]) => page.evaluate(b => (window as unknown as { __midi: { play(b: number[]): void } }).__midi.play(b), bytes);

test('a plugged-in keyboard, drum pads, Hum and Play Along', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT2);
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Keys And Hum');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.locator('[data-instrument="cello"]').click();
    const cello = page.locator('[data-note-id]');

    // Your Keyboard: Web MIDI is asked for only now, without SysEx, and the device is named as the browser reports it.
    expect(await page.evaluate(() => (window as unknown as { __midi: { asked: unknown[] } }).__midi.asked)).toEqual([]);
    await page.getByRole('button', { name: 'Your Keyboard: Off' }).click();
    await expect(page.locator('[data-midi-devices]')).toHaveText('Plugged In: Yamaha P-125');
    expect(await page.evaluate(() => (window as unknown as { __midi: { asked: unknown[] } }).__midi.asked)).toEqual([{ sysex: false }]);
    await page.locator('[data-midi-output]').selectOption('out1');
    await expect.poll(() => page.evaluate(() => (window as unknown as { __midi: { sent: number[][] } }).__midi.sent)).toEqual([[0xc0, 42]]);

    // Play Live from the keyboard: a soft note, a loud one, and one held by the pedal after its key comes up.
    await page.getByRole('tab', { name: 'Play Live' }).click();
    await midi(page, [0x90, 48, 40]);
    await expect(page.locator('[data-midi-last]')).toHaveText('C3 · Velocity 40');
    await page.waitForTimeout(350);
    await midi(page, [0x80, 48, 0]);
    await midi(page, [0x90, 50, 120]);
    await page.waitForTimeout(350);
    await midi(page, [0x90, 50, 0]);
    await midi(page, [0xb0, 64, 127]);
    await expect(page.locator('[data-pedal]')).toHaveText('Sustain Pedal: Down');
    await midi(page, [0x90, 52, 90]);
    await page.waitForTimeout(100);
    await midi(page, [0x80, 52, 0]);
    await page.waitForTimeout(600);
    await midi(page, [0xb0, 64, 0]);
    await expect(page.locator('[data-pedal]')).toHaveText('Sustain Pedal: Up');
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(cello).toHaveCount(3);
    expect(await cello.evaluateAll(els => els.map(e => [e.getAttribute('data-note'), e.getAttribute('data-velocity')]))).toEqual([['C3', '40'], ['D3', '120'], ['E3', '90']]);
    const held = (await page.locator('[data-note="E3"]').boundingBox())!.width;
    expect(held).toBeGreaterThan(30); // a beat, not the tenth of a second the key was down

    // Drum pads: into a melody part they are not recorded; a Drum Kit part takes them, named the General MIDI way.
    await midi(page, [0x99, 38, 100]);
    await expect(page.locator('[data-status]')).toHaveText('Drum pads play a drum part: Add Part, then Drums & Percussion.');
    await midi(page, [0x89, 38, 0]);
    await page.getByRole('button', { name: 'Add Part' }).click();
    await page.getByRole('button', { name: 'Drums & Percussion' }).click();
    await page.locator('[data-instrument="kit"]').click();
    await midi(page, [0x99, 38, 100]);
    await expect(page.locator('[data-midi-last]')).toHaveText('Snare · Pad 38 · Velocity 100');
    await midi(page, [0x89, 38, 0]);
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await expect(page.locator('[data-note-id]')).toHaveCount(1);
    await expect(page.locator('[data-note-id]')).toHaveAttribute('data-velocity', '100');

    // Play Live shows the other melody parts as outlines (a drum part's are not on a melody's rows).
    await expect(page.locator('[data-ghost]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Add Part' }).click();
    await page.locator('[data-instrument="viola"]').click();
    await expect(page.locator('[data-ghost]')).toHaveCount(3);
    await shot(page, 'desktop-keyboard');
    await page.locator('[data-part="cello"]').click();
    await expect(page.locator('[data-ghost]')).toHaveCount(0);

    // Hum: the demo, snapped to all twelve notes, after the part.
    await page.getByRole('tab', { name: 'Hum' }).click();
    await page.locator('[data-hum-snap="all12"]').click();
    await page.getByRole('button', { name: 'Play The Demo Hum' }).click();
    await expect(page.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4 A4', { timeout: 15_000 });
    await shot(page, 'desktop-hum-demo');
    await page.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(cello).toHaveCount(7);
    await expect(page.locator('[data-status]')).toHaveText('Added 4 hummed notes at bar 2. Undo takes them back.');

    // The microphone: asked for only on Record With Mic, let go when the recording stops.
    expect(await page.evaluate(() => (window as unknown as { __mic: { asked: number } }).__mic.asked)).toBe(0);
    await page.getByRole('button', { name: '● Record With Mic' }).click();
    // The fake microphone hums for about 1.75 s after a 0.3 s pause: stop once the recording's clock has passed 2 s.
    await expect(page.locator('[data-hum-stop]')).toContainText(/· [2-9] s/, { timeout: 10_000 });
    await page.locator('[data-hum-stop]').click();
    await expect(page.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4', { timeout: 15_000 });
    expect(await page.evaluate(() => (window as unknown as { __mic: { asked: number; tracks: MediaStreamTrack[] } }).__mic.tracks.map(t => t.readyState))).toEqual(['ended']);
    await page.locator('[data-hum-place="replace"]').click();
    await page.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(cello).toHaveCount(3);
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(cello).toHaveCount(7);
    await page.locator('[data-hum-place="line"]').click();
    await expect(page.locator('[data-line-handle]')).toBeVisible();
    await shot(page, 'desktop-hum-line');

    // Play Along with the other parts off: one bar of count-in, then a key lands in time with the clicks.
    await page.getByRole('tab', { name: 'Play Live' }).click();
    await page.getByRole('button', { name: 'Hear The Other Parts: On' }).click();
    await page.getByRole('button', { name: '▶ Play Along' }).click();
    await expect(page.locator('[data-live-state]')).toContainText('● Playing Along', { timeout: 10_000 });
    await shot(page, 'desktop-play-along');
    await hold(page, ['KeyA'], 400);
    await page.locator('[data-along-stop]').click();
    await expect(page.locator('[data-status]')).toHaveText('Recorded 1 note. Undo takes it back.');
    await expect(cello).toHaveCount(8);
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');
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
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Pedal On A Phone');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.locator('[data-instrument="cello"]').click();
    await page.getByRole('button', { name: 'Your Keyboard: Off' }).click();
    await expect(page.locator('[data-midi-devices]')).toHaveText('Plugged In: Yamaha P-125');
    await page.locator('[data-key="60"]').scrollIntoViewIfNeeded();
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
