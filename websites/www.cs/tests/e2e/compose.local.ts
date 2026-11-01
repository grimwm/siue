// The composer in a real browser against local docker (make music-e2e E2E_ARGS=compose.local.ts): a student starts a
// New Piece, adds a Cello, plays notes in live (a held key sets the length; two keys together are a chord), steps a
// chord, a rest and Back One, adds and drags a note on the grid, selects and deletes one with Undo and Redo, puts a
// note below a Violin's range (red) and moves it into range, saves draft 1, hears it on the piece page, and saves
// draft 2 from Compose. Then it shows a part as sheet music and both, imports a MuseScore file (preview, Add As New
// Parts, Undo), exports MIDI and MusicXML, and reads the saved draft's engraved sheet music on the piece page. On a
// phone, holding an on-screen key never moves the page, in the Both view too. Then, with a fake Web MIDI keyboard and a
// fake microphone: Your Keyboard (asked for only when turned on, velocity, the sustain pedal, drum pads, the GM program
// sent), Hum (the demo, the microphone, the three snaps and Replace The Part with Undo) and Play Along; and on a phone
// a note held by the pedal never moves the page. Then Speed And Loudness: the piece's speed, a gradual speed change, a
// part at its own BPM, a loudness line, and Hum's Exact Pitch bends, saved as a schema 2 draft; on a phone a held key
// still never moves the page with the panel open. Then Sound: a part's settings, Mute and Solo, Voice Effects (a
// Vocoder on another part, Auto-Tune) tried on the fake microphone and let go, the Room and the limiter, heard with the
// piece and saved as score settings. Then Vocal Tracks with a fake singer: Record A Vocal (the microphone asked for only
// then), the take Only On This Device and kept through a reload, Save To Studio showing both sizes, saved as Perfect,
// heard, converted to Good To The Ear, a second take saved as Good To The Ear, Export With Vocals, and Your studio's
// count; and Save To Studio refusing takes that need more room than the studio has. Then DJ & Effects: effects placed
// on the timeline by tap and by drag, a clip moved, lengthened, stepped Longer, given a setting and removed with Undo;
// DJ Mode's deck played with held keys and a held pad, the platter and the XY Pad under Record To Timeline, landing as
// clips Undo takes back in one step; saved as fx_clips; and on a phone a held pad never moves the page. SHOTS_DIR
// keeps screenshots.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { signInAt } from './music-mail.ts';

const STUDENT = 'composer1@siue.edu';
// A second student: sign-in links are limited to three an hour for each address.
const STUDENT2 = 'composer2@siue.edu';
const STUDENT3 = 'composer3@siue.edu';
const STUDENT4 = 'composer4@siue.edu';
const STUDENT5 = 'composer5@siue.edu';
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

test('speed, loudness and Exact Pitch bends are saved as a schema 2 draft', async ({ browser, baseURL }) => {
  test.setTimeout(180_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT3);
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Speed Test');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.locator('[data-instrument="cello"]').click();
    const cello = page.locator('[data-note-id]');

    // Hum the demo with Exact Pitch: the scooped, wavering A keeps its bend.
    await page.getByRole('tab', { name: 'Hum' }).click();
    await page.locator('[data-hum-snap="exact"]').click();
    await page.getByRole('button', { name: 'Play The Demo Hum' }).click();
    await expect(page.locator('[data-hum-notes]')).toHaveText('D4 E4 F#4 A4', { timeout: 15_000 });
    await page.getByRole('button', { name: 'Add To The Part' }).click();
    await expect(cello).toHaveCount(4);

    // The piece's speed: Quick 128, then a gradual slow-down to 66 at a later bar.
    const panel = page.locator('[data-speed-panel]');
    await panel.locator('[data-piece-speed="128"]').click();
    await expect(page.locator('[data-draft-line]')).toContainText('128 BPM');
    await panel.locator('[data-add-tempo]').click();
    const mark = panel.locator('[data-tempo-mark]').first();
    const bar = Number(await mark.getAttribute('data-tempo-mark'));
    await mark.getByRole('spinbutton').fill('66');
    await mark.getByRole('spinbutton').press('Enter');
    await mark.locator(`[data-gradual="${bar}"]`).click();
    await expect(mark.locator(`[data-gradual="${bar}"]`)).toHaveText('Slow Down');
    await expect(mark.locator(`[data-gradual="${bar}"]`)).toHaveAttribute('aria-pressed', 'true');

    // This part's own speed, and a loudness line from Soft getting louder to Loud.
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
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(panel.locator('[data-dyn-gradual="1"]')).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: /^↷ Redo/ }).click();
    await expect(panel.locator('[data-dyn-gradual="1"]')).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');
    const score = await page.evaluate(async () => (await fetch('draft.php?piece=speed-test&v=1&file=score.json')).json()) as {
      schema: number; piece_tempo: { bar: number; bpm: number; shape: string }[]; tempo: { bar: number; bpm: number }[];
      lanes: { speed?: unknown; dynamics?: { bar: number; level: number; shape: string }[] }[]; notes: { bend?: [number, number][] }[];
    };
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

test('on a phone, a held key never moves the page with Speed And Loudness open', async ({ browser, baseURL }) => {
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 400, height: 780 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await signInAt(page, base, 'music', STUDENT3);
    await page.goto(`${base}music/compose.php?id=speed-test`);
    await expect(page.locator('[data-speed-panel]')).toBeVisible();
    await shot(page, 'phone-speed-loudness');
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, 'no sideways scroll').toBeLessThanOrEqual(400);
    const key = page.locator('[data-key="60"]');
    await key.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -40));
    const y = await page.evaluate(() => window.scrollY);
    const kb = (await key.boundingBox())!;
    await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height - 10);
    await page.mouse.down();
    await expect(page.locator('[data-live-state]')).toContainText('● Recording');
    // Something tries to move the page while the key is held: it is put straight back.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY), 'held: the page has not moved').toBe(y);
    await page.mouse.up();
    await page.getByRole('button', { name: 'Stop Recording' }).click();
  } finally {
    await context.close();
  }
});

test('Sound, Voice Effects, the Room and the limiter are heard and saved as score settings', async ({ browser, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(fakeDevices);
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT4);
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Sound Test');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.locator('[data-instrument="cello"]').click();
    await hold(page, ['KeyA', 'KeyD'], 400);
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await page.getByRole('button', { name: 'Add Part' }).click();
    await page.getByRole('button', { name: 'Brass' }).click();
    await page.locator('[data-instrument="horn"]').click();
    await hold(page, ['KeyG'], 400);
    await page.getByRole('button', { name: 'Stop Recording' }).click();

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
    await page.locator('[data-part]').nth(1).click();
    await sound.locator('[data-voice-pick]').selectOption('vocoder');
    await sound.locator('[data-voice-add]').click();
    await expect(sound.locator('[data-carrier]')).toHaveValue('cello');
    await sound.locator('[data-voice-pick]').selectOption('autotune');
    await sound.locator('[data-voice-add]').click();
    await expect(sound.locator('[data-voice-fx]')).toHaveCount(2);

    // Try It With The Mic: the microphone is asked for only now, and let go on Stop The Mic.
    expect(await page.evaluate(() => (window as unknown as { __mic: { asked: number } }).__mic.asked)).toBe(0);
    await sound.locator('[data-live-try]').click();
    await expect(sound.locator('[data-live-stop]')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __mic: { asked: number } }).__mic.asked)).toBe(1);
    await expect(sound.locator('[data-live-note]')).toContainText('Listening');
    await sound.locator('[data-live-stop]').click();
    expect(await page.evaluate(() => (window as unknown as { __mic: { tracks: MediaStreamTrack[] } }).__mic.tracks.map(t => t.readyState))).toEqual(['ended']);

    // The Whole Piece: a Cathedral and the limiter.
    await sound.locator('[data-room-preset="cathedral"]').click();
    await sound.locator('[data-limiter]').click();
    await expect(sound.locator('[data-limiter]')).toHaveText('Limiter: On');
    await sound.locator('summary', { hasText: 'What The Score Saves' }).click();
    await expect(sound.locator('[data-score-saves]')).toContainText('"cathedral"');
    await shot(page, 'desktop-sound');

    // Mute and Solo, and Undo.
    await sound.locator('[data-mute]').click();
    await expect(sound.locator('[data-mute]')).toHaveText('Muted');
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(sound.locator('[data-mute]')).toHaveText('Mute');

    // Heard with the piece: the longer road through the parts, the Room and the limiter builds and plays.
    await page.getByRole('button', { name: 'Hear With The Piece' }).click();
    await expect(page.locator('[data-listening]')).toContainText(/playing|Playing/, { timeout: 60_000 });
    await page.getByRole('button', { name: 'Stop', exact: true }).click();

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');
    const score = await page.evaluate(async () => (await fetch('draft.php?piece=sound-test&v=1&file=score.json')).json()) as {
      schema: number; mix: { room?: { preset: string }; limiter?: { on: boolean } };
      lanes: { id: string; fx?: { pan?: number; eq?: { bass?: number }; echo?: { amount: number }; warmth?: number }; voice?: { effect: string; carrier?: string }[] }[];
    };
    expect(score.schema).toBe(2);
    expect(score.mix.room?.preset).toBe('cathedral');
    expect(score.mix.limiter?.on).toBe(true);
    const cello = score.lanes.find(l => l.id === 'cello')!;
    expect(cello.fx).toMatchObject({ pan: -0.5, eq: { bass: 6 }, echo: { amount: 0.4 }, warmth: 0.3 });
    const horn = score.lanes[1]!;
    expect(horn.voice!.map(v => v.effect)).toEqual(['vocoder', 'autotune']);
    expect(horn.voice![0]!.carrier).toBe('cello');
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('Vocal Tracks: recorded on this device, kept through a reload, saved both ways, refused for room, converted and exported', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  await context.addInitScript(fakeSinger);
  try {
    const page = await context.newPage();
    page.on('dialog', d => void d.accept());
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', 'composer5@siue.edu');
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Vocal Test');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.locator('[data-instrument="cello"]').click();
    await hold(page, ['KeyA', 'KeyD'], 400);
    await page.getByRole('button', { name: 'Stop Recording' }).click();
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');

    const status = page.locator('[data-status]');
    const panel = page.locator('[data-vocal-panel]');
    const mic = () => page.evaluate(() => (window as unknown as { __mic: { asked: number } }).__mic.asked);
    const record = async () => {
      await panel.getByRole('button', { name: '● Record A Vocal' }).click();
      await expect(status).toContainText('Counting in', { timeout: 60_000 });
      await page.waitForTimeout(4500); // the one-bar count-in at 92 BPM, then about two seconds of singing
      await panel.getByRole('button', { name: '■ Stop' }).click();
      await expect(status).toContainText('is kept on this device');
    };

    // Record A Vocal: the microphone is asked for only now, and the take is Only On This Device.
    await page.getByRole('button', { name: 'Add Vocal Track' }).click();
    await expect(panel).toBeVisible();
    expect(await mic()).toBe(0);
    await record();
    expect(await mic()).toBe(1);
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['Only On This Device']);
    await expect(panel.locator('[data-clip]')).toHaveCount(1);
    // The count-in is recorded but not heard: the clip starts where the piece starts, past the count-in in its take.
    const placed = async () => ({ at: Number(await panel.locator('[data-clip-at]').inputValue()), from: Number(await panel.locator('[data-clip-from]').inputValue()) });
    const first = await placed();
    expect(first.at).toBeLessThan(0.5);
    expect(first.from).toBeGreaterThan(2);
    await shot(page, 'vocal-recorded');

    // A reload before saving: the take is still on this device, and goes back where it was sung.
    await page.reload();
    await expect(page.locator('[data-part="cello"]')).toBeVisible({ timeout: 60_000 });
    await page.getByRole('button', { name: 'Add Vocal Track' }).click();
    await expect(panel.locator('[data-device-take]')).toHaveCount(1);
    await panel.getByRole('button', { name: 'Add To The Track' }).click();
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['Only On This Device']);
    expect(await placed()).toEqual(first);

    // Save To Studio: both sizes, made for real, and what each leaves; Perfect is the studio's first choice.
    await page.getByRole('button', { name: 'Save Draft' }).click();
    const save = page.locator('[data-save-takes]');
    await expect(save.locator('[data-choice="perfect"] [data-size]')).toBeVisible({ timeout: 60_000 });
    await expect(save.locator('[data-choice="ear"] [data-size]')).toBeVisible();
    const bytes = async (q: string) => {
      const t = (await save.locator(`[data-choice="${q}"] [data-size]`).textContent())!;
      return Number.parseFloat(t) * (t.endsWith('MB') ? 1024 : 1);
    };
    expect(await bytes('ear')).toBeLessThan(await bytes('perfect'));
    await expect(save.locator('[data-choice="perfect"] input')).toBeChecked();
    await expect(save.locator('[data-choice="perfect"]')).toContainText(/leaves .* about [\d.]+ more minutes/);
    await shot(page, 'vocal-save-choice');
    await save.getByRole('button', { name: 'Save To Studio' }).click();
    await expect(status).toHaveText('Saved as draft 2.', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Perfect']);
    const draft = await page.evaluate(async () => (await fetch('draft.php?piece=vocal-test&v=2&file=score.json')).json()) as { schema: number; lanes: { id: string; vocal?: { takes: { file: string }[] } }[] };
    expect(draft.schema).toBe(2);
    const take = draft.lanes.find(l => l.vocal)!.vocal!.takes[0]!.file;
    expect(take).toMatch(/^vocal-[0-9a-f]{64}\.flac$/);
    expect((await page.evaluate(async f => (await fetch(`take.php?file=${f}`)).status, take))).toBe(200);

    // Heard with the piece: the take plays from the studio through the renderer.
    await page.getByRole('button', { name: 'Hear With The Piece' }).click();
    await expect(page.locator('[data-listening]')).toContainText(/playing|Playing/, { timeout: 60_000 });
    await page.getByRole('button', { name: 'Stop', exact: true }).click();

    // Convert To Good To The Ear: a warning first, then every draft moves onto the smaller copy.
    await panel.getByRole('button', { name: 'Convert To Good To The Ear' }).click();
    await expect(panel.locator('[data-convert-warning]')).toContainText('cannot be undone');
    await panel.getByRole('button', { name: 'Convert', exact: true }).click();
    await expect(status).toContainText('Converted', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Good To The Ear']);
    expect((await page.evaluate(async f => (await fetch(`take.php?file=${f}`)).status, take))).toBe(404);
    const moved = await page.evaluate(async () => (await fetch('draft.php?piece=vocal-test&v=2&file=score.json')).json()) as { lanes: { vocal?: { takes: { file: string }[] } }[] };
    expect(moved.lanes.find(l => l.vocal)!.vocal!.takes[0]!.file).toMatch(/^vocal-[0-9a-f]{64}\.(ogg|webm)$/);

    // A second take saved as Good To The Ear.
    await record();
    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(save.locator('[data-choice="ear"] [data-size]')).toBeVisible({ timeout: 60_000 });
    await save.locator('[data-choice="ear"] input').check();
    await save.getByRole('button', { name: 'Save To Studio' }).click();
    await expect(status).toHaveText('Saved as draft 3.', { timeout: 60_000 });
    await expect(panel.locator('[data-take] [data-where]')).toHaveText(['In Your Studio · Good To The Ear', 'In Your Studio · Good To The Ear']);

    // Export With Vocals: one zip.
    const [zip] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export With Vocals' }).click()]);
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
    await signInAt(page, base, 'music', 'composer6@siue.edu');
    // The studio says it has 1 KB left, as a nearly full studio would.
    await page.route(/compose\.php/, async route => {
      const r = await route.fetch();
      await route.fulfill({ response: r, body: (await r.text()).replace(/data-room="\d+"/, 'data-room="1024"') });
    });
    await page.goto(`${base}music/compose.php`);
    await page.getByLabel('Title').fill('Full Studio');
    await page.getByRole('button', { name: 'Start Composing' }).click();
    await page.getByRole('button', { name: 'Add Vocal Track' }).click();
    const panel = page.locator('[data-vocal-panel]');
    await panel.getByRole('button', { name: '● Record A Vocal' }).click();
    await expect(page.locator('[data-status]')).toContainText('Counting in', { timeout: 60_000 });
    await page.waitForTimeout(4500);
    await panel.getByRole('button', { name: '■ Stop' }).click();
    await page.getByRole('button', { name: 'Save Draft' }).click();
    const save = page.locator('[data-save-takes]');
    await expect(save.locator('[data-save-total]')).toContainText('but your studio has 1 KB left', { timeout: 60_000 });
    await expect(save.getByRole('button', { name: 'Save To Studio' })).toBeDisabled();
    await save.getByRole('button', { name: 'Not Now' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Not saved. Your takes are still on this device.');
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

/** Starts a New Piece with a cello part and a horn part, each with a note or two. */
async function twoParts(page: Page, base: string, title: string): Promise<void> {
  await page.goto(`${base}music/compose.php`);
  await page.getByLabel('Title').fill(title);
  await page.getByRole('button', { name: 'Start Composing' }).click();
  await page.locator('[data-instrument="cello"]').click();
  await hold(page, ['KeyA', 'KeyD'], 400);
  await page.getByRole('button', { name: 'Stop Recording' }).click();
  await page.getByRole('button', { name: 'Add Part' }).click();
  await page.getByRole('button', { name: 'Brass' }).click();
  await page.locator('[data-instrument="horn"]').click();
  await hold(page, ['KeyG'], 400);
  await page.getByRole('button', { name: 'Stop Recording' }).click();
}

/** Taps a timeline track at bar position `bar` of `bars`. */
async function tapBar(page: Page, track: string, bar: number, bars: number): Promise<void> {
  const t = page.locator(`[data-track="${track}"]`);
  const box = (await t.boundingBox())!;
  await t.click({ position: { x: ((bar - 1 + 0.05) / bars) * box.width, y: box.height / 2 } });
}

test('DJ & Effects: placed on the timeline, performed live under Record To Timeline, and saved as fx_clips', async ({ browser, baseURL }) => {
  test.setTimeout(300_000);
  const base = baseURL!;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) errors.push(m.text()); });
    await signInAt(page, base, 'music', STUDENT5);
    await twoParts(page, base, 'Dj Test');
    const fx = page.locator('[data-effects]');
    const clips = fx.locator('[data-clip]');
    const bars = await fx.locator('[data-timeline] > div').first().locator('span').count();
    await expect(fx.getByText('What A Browser Does Less Well')).toBeVisible();

    // Way One: tap Riser, then bar 2 of The Whole Piece; Tape Stop dragged onto the cello.
    await fx.locator('[data-family="build"]').click();
    await fx.locator('[data-effect="riser"]').click();
    await tapBar(page, 'whole', 2, bars);
    await expect(clips).toHaveCount(1);
    await expect(fx.locator('[data-clip-sheet] [data-clip-bars]')).toHaveText('bar 2 to bar 4');
    await fx.getByRole('button', { name: 'Longer' }).click();
    await expect(fx.locator('[data-clip-bars]')).toHaveText('bar 2 to bar 4 + 0.25');
    await fx.locator('[data-family="turntable"]').click();
    await fx.locator('[data-effect="tape_stop"]').dragTo(fx.locator('[data-track="cello"]'), { targetPosition: { x: 5, y: 10 } });
    await expect(clips).toHaveCount(2);
    await fx.locator('[data-clip-control="time"]').getByRole('button', { name: 'Slow' }).click();

    // Drag the riser a bar earlier (the piece is four bars: a clip stays inside it) and pull its end in a bar.
    const riser = fx.locator('[data-clip-effect="riser"]');
    const rb = (await riser.boundingBox())!;
    const barWidth = rb.width / 2.25; // the riser is two bars and a beat long
    await page.mouse.move(rb.x + 10, rb.y + rb.height / 2);
    await page.mouse.down();
    await page.mouse.move(rb.x + 10 - barWidth, rb.y + rb.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 1 to bar 3 + 0.25');
    const end = riser.locator('[data-clip-end]');
    const eb = (await end.boundingBox())!;
    await page.mouse.move(eb.x + 2, eb.y + eb.height / 2);
    await page.mouse.down();
    await page.mouse.move(eb.x + 2 - barWidth, eb.y + eb.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(riser).toHaveAttribute('aria-label', 'Riser, bar 1 to bar 2 + 0.25');

    // Remove, and Undo puts it back.
    await riser.click();
    await fx.getByRole('button', { name: 'Remove' }).click();
    await expect(clips).toHaveCount(1);
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(clips).toHaveCount(2);
    // From the keyboard: Place At Bar, then Enter on a row.
    await fx.locator('[data-family="rhythm"]').click();
    await fx.locator('[data-effect="tremolo"]').click();
    await fx.locator('[data-place-at]').fill('3');
    await fx.locator('[data-place-at]').dispatchEvent('change');
    await fx.locator('[data-track]').nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(fx.locator('[data-clip-effect="tremolo"]')).toHaveAttribute('aria-label', 'Tremolo, bar 3 to bar 4');
    await fx.getByRole('button', { name: 'Earlier' }).click();
    await expect(fx.locator('[data-clip-effect="tremolo"]')).toHaveAttribute('aria-label', 'Tremolo, bar 2 + 0.75 to bar 3 + 0.75');
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(clips).toHaveCount(2);
    await fx.locator('summary', { hasText: 'What Gets Saved' }).click();
    await expect(fx.locator('[data-saved-json]')).toContainText('"tape_stop"');
    await shot(page, 'desktop-effects');

    // Way Two: DJ Mode, recorded to the timeline.
    const dj = page.locator('[data-dj]');
    await dj.getByRole('button', { name: 'Get The Deck Ready' }).click();
    await expect(dj.getByRole('button', { name: '▶ Play' })).toBeVisible({ timeout: 90_000 });
    await dj.getByRole('button', { name: '▶ Play' }).click();
    await expect(dj.locator('[data-deck-bar]')).toHaveText(/^Bar \d+$/);
    const at = async () => Number(await dj.locator('[data-deck-bar]').getAttribute('data-deck-pos'));
    const p0 = await at();
    await expect.poll(at, { message: 'the deck moves on' }).toBeGreaterThan(p0);
    /** Holds until the deck has played on a fifth of a bar, wherever it goes round. */
    const playOn = async () => { const from = await at(); await expect.poll(async () => { const now = await at(); return now >= from ? now - from : now; }).toBeGreaterThan(0.2); };
    await dj.locator('[data-record-timeline]').click();
    await expect(dj.locator('[data-recording]')).toHaveText('Recording.');
    const notesBefore = await notes(page).count();
    for (const k of ['3', 'KeyZ']) {
      await page.keyboard.down(k);
      await playOn();
      await page.keyboard.up(k);
    }
    expect(await notes(page).count(), 'the pad keys play pads, not notes').toBe(notesBefore);
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
    await expect(page.locator('[data-status]')).toContainText(/Recorded \d+ effects onto the timeline/);
    const after = await clips.count();
    expect(after).toBeGreaterThanOrEqual(2 + 4);
    await shot(page, 'desktop-dj');
    await page.getByRole('button', { name: /^↶ Undo/ }).click();
    await expect(clips).toHaveCount(2);
    await page.getByRole('button', { name: /^↷ Redo/ }).click();
    await expect(clips).toHaveCount(after);
    await dj.getByRole('button', { name: '■ Stop' }).click();

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.locator('[data-status]')).toHaveText('Saved as draft 1.');
    const score = await page.evaluate(async () => (await fetch('draft.php?piece=dj-test&v=1&file=score.json')).json()) as { schema: number; fx_clips: { effect: string; lane: string | null; settings?: Record<string, unknown>; points?: number[][] }[] };
    expect(score.schema).toBe(2);
    const effects = score.fx_clips.map(c => c.effect);
    for (const e of ['riser', 'tape_stop', 'stutter', 'bitcrusher', 'scratch', 'filter']) expect(effects).toContain(e);
    expect(score.fx_clips.find(c => c.effect === 'tape_stop')).toMatchObject({ lane: 'cello', settings: { time: 'slow' } });
    expect(score.fx_clips.find(c => c.effect === 'scratch')!.points!.length).toBeGreaterThanOrEqual(2);
    // Heard with the piece: the clips are built into its sound.
    await page.getByRole('button', { name: 'Hear With The Piece' }).click();
    await expect(page.locator('[data-listening]')).toContainText(/playing|Playing/, { timeout: 90_000 });
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
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
