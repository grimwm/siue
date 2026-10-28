// Answering in the Workroom: Pin a note picks a span on the Story view and
// sends a typed note on it; React reacts to the section under the playhead;
// Draw the energy swaps the view for the drawing, with its own legend and
// guide; Hum it records at the playhead; a kept note says why; the notes
// panel is "Notes & answers" with Your notes first. Before an unlock a tap on
// any of them opens the notes panel at the unlock form, with the reason, and
// what was asked for opens after the unlock; with no keyring on the server,
// notes are off. Pinning keeps the timeline on screen above a docked composer;
// nothing typed or recorded is lost before the note is stored; a recording
// always has a Stop; no key takes Escape.
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { memoryStorage } from '../../_kit/test/record.ts';
import { guideStore } from '../src/guide.ts';
import type { NoteBody } from '../src/note.ts';
import { UNLOCK_FIRST } from '../src/notes-session.ts';
import type { NotesSession } from '../src/notes-session.ts';
import { KEPT_MESSAGES, MEMORY_NOTICE, SENT_MESSAGE, SEND_MESSAGES } from '../src/outbox.ts';
import type { AddReport } from '../src/outbox.ts';
import { RECORDER_MESSAGES } from '../src/recorder.ts';
import type { MediaPorts, RecorderLike } from '../src/recorder.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the page puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
// The page's leave guards (beforeunload), so a test can try to leave.
type LeaveListener = (e: { preventDefault(): void; returnValue: unknown }) => void;
const leaveListeners: LeaveListener[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); if (type === 'beforeunload') leaveListeners.push(f as LeaveListener); };
const unlisten = (type: string, f: unknown): void => { const i = leaveListeners.indexOf(f as LeaveListener); if (type === 'beforeunload' && i >= 0) leaveListeners.splice(i, 1); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener: unlisten } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
Object.assign(globalThis, { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} });
const originalNS = stubDocument.createElementNS;
const originalEl = stubDocument.createElement;
const asAudio = (el: StubElement): StubElement => Object.assign(el, { currentTime: 0, paused: true, canPlayType: () => 'maybe', play: () => Promise.resolve(), pause() {} });
stubDocument.createElement = tag => (tag === 'audio' ? asAudio(originalEl(tag)) : originalEl(tag));
stubDocument.createElementNS = (ns, tag) => (tag === 'audio' ? asAudio(originalNS(ns, tag)) : originalNS(ns, tag));

const ui = await importTsx<{ room: typeof import('../src/ui/Workroom.tsx'); api: typeof import('../src/api.ts') }>(import.meta.dirname, { room: '../src/ui/Workroom.tsx', api: '../src/api.ts' });
const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const NOW = () => new Date('2026-10-20T14:03:11.000Z');
const named = (root: StubElement, attr: string) => walk(root).find(e => e._attrs[attr] !== undefined);
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text);
const settle = async (): Promise<void> => { for (let i = 0; i < 20; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

/** `failures`: how many sends reject first, with the message of a note that could not be sealed. Unlocked unless `opts.unlocked` is false (any passphrase then unlocks); the server holds a keyring unless `opts.keyring` is false. */
function fakeNotes(answer: (key: string) => AddReport = key => ({ key, memoryOnly: false, sent: [{ key, id: 'f'.repeat(32) }], kept: [] }), failures = 0, opts: { unlocked?: boolean; keyring?: boolean } = {}) {
  const sent: { body: NoteBody; audio: Uint8Array | null }[] = [];
  let failing = failures;
  let open = opts.unlocked ?? true;
  const session: NotesSession = {
    hasKeyring: async () => opts.keyring ?? true,
    unlocked: () => open,
    unlock: async () => { open = true; return null; },
    restore: async () => false,
    history: async () => [],
    send: async (body, audio) => {
      if (!open) throw new Error(UNLOCK_FIRST);
      if (failing > 0) { failing--; throw new Error(SEND_MESSAGES.sealFailed); }
      sent.push({ body, audio });
      return answer(`k${sent.length}`);
    },
    flush: async () => ({ sent: [], kept: [] }), kept: async () => [], discard: async () => {}, remove: async () => {}, removeAll: async () => 0, lock() {}, memoryOnly: () => false, unreadable: () => 0,
  };
  return { session, sent };
}

function fakeMedia(): { ports: MediaPorts; clock: { ms: number }; released: { tracks: number } } {
  const clock = { ms: 0 };
  const released = { tracks: 0 };
  const ports: MediaPorts = {
    getUserMedia: async () => ({ getTracks: () => [{ stop() { released.tracks++; } }] }),
    isTypeSupported: m => m === 'audio/mp4',
    makeRecorder: () => {
      const r: RecorderLike & { state: string } = {
        state: 'inactive', ondataavailable: null, onstop: null,
        start() { r.state = 'recording'; },
        stop() { r.state = 'inactive'; r.ondataavailable?.({ data: { size: 3, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer } }); r.onstop?.(); },
      };
      return r;
    },
    timers: { setTimeout: () => 1, clearTimeout: () => {} },
    now: () => clock.ms,
    audioSession: null,
  };
  return { ports, clock, released };
}

/** Every root a test mounts; each is unmounted after its test, even one that failed, so no recording clock outlives it. */
const mounted: StubElement[] = [];
const mount = async (extra: Record<string, unknown> = {}): Promise<StubElement> => {
  const root = makeEl('root');
  mounted.push(root);
  await act(() => { render(h(ui.room.Workroom, { score, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {}, now: NOW, ...extra }), renderTarget(root)); });
  await settle();
  return root;
};
const unmount = (root: StubElement): void => { render(null, renderTarget(root)); };
afterEach(() => { for (const root of mounted.splice(0)) unmount(root); });
const at = (x: number, y: number, t: number) => ({ pointerId: 1, clientX: x, clientY: y, timeStamp: t });

test('without notes there is no answer bar; with no keyring on the server, notes are off', async () => {
  const none = await mount();
  assert.ok(named(none, 'data-answer-bar') === undefined);
  assert.ok(named(none, 'data-answer-off') === undefined);
  unmount(none);
  const { session } = fakeNotes(undefined, 0, { unlocked: false, keyring: false });
  const off = await mount({ notes: session });
  assert.equal(named(off, 'data-answer-off')!.textContent, 'Notes are off until a notes key is uploaded (make music-setup).');
  assert.ok(button(off, 'Pin a note') === undefined);
  unmount(off);
});

/** Unlocks through the notes panel's form, as the owner does (the fake takes any passphrase). */
async function unlockInPanel(root: StubElement): Promise<void> {
  const pass = walk(root).find(e => e._attrs['autocomplete'] === 'current-password')!;
  pass.value = 'the passphrase';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
}

test('before an unlock, Pin a note opens the notes panel at the unlock form with the reason, and the composer opens after the unlock', async () => {
  const { session, sent } = fakeNotes(undefined, 0, { unlocked: false });
  const root = await mount({ notes: session });
  const handle = walk(named(root, 'data-sheet')!).find(e => e.localName === 'button' && e._attrs['aria-controls'] !== undefined)!;
  assert.equal(String(handle._attrs['aria-expanded']), 'false');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.ok(named(root, 'data-pin-composer') === undefined, 'nothing to compose before an unlock');
  assert.equal(String(handle._attrs['aria-expanded']), 'true', 'the notes panel opens');
  assert.equal(named(root, 'data-unlock-reason')!.textContent, UNLOCK_FIRST);
  await unlockInPanel(root);
  assert.ok(named(root, 'data-unlock-reason') === undefined);
  assert.ok(named(root, 'data-pin-composer'), 'Pin a note goes on from where it stopped');
  assert.equal(button(root, 'Pin a note')!._attrs['aria-pressed'], 'true');
  assert.equal(String(handle._attrs['aria-expanded']), 'false', 'the panel closes so the timeline and the composer show');
  assert.equal(sent.length, 0);
  unmount(root);
});

test('before an unlock, React and Draw the energy ask for it too; Hum it opens no microphone and waits for a tap after the unlock', async () => {
  const { session } = fakeNotes(undefined, 0, { unlocked: false });
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  assert.ok(named(root, 'data-react-bar') === undefined);
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.ok(named(root, 'data-energy-editor') === undefined);
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  assert.ok(named(root, 'data-recording-strip') === undefined, 'no microphone before an unlock');
  assert.equal(named(root, 'data-unlock-reason')!.textContent, UNLOCK_FIRST);
  await unlockInPanel(root);
  assert.ok(named(root, 'data-recording-strip') === undefined, 'iOS grants the microphone only inside a tap: the next one starts it');
  assert.equal(named(root, 'data-answer-status')!.textContent, 'Unlocked. Tap Hum it to start recording.');
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  assert.ok(named(root, 'data-recording-strip'));
  unmount(root);
});

test('the notes panel is "Notes & answers", with Your notes first', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  const aside = named(root, 'data-sheet')!;
  assert.equal(aside._attrs['aria-label'], 'Notes & answers');
  const body = named(aside, 'data-sheet-body')!;
  assert.equal(walk(body)[0]!._attrs['data-answers'], '');
  unmount(root);
});

test('on a phone the open notes panel closes when the bar needs the screen: a mode opens or a recording starts', async () => {
  for (const what of ['Pin a note', 'React', 'Draw the energy', 'Hum it']) {
    const { session } = fakeNotes();
    const media = fakeMedia();
    const root = await mount({ notes: session, media: media.ports });
    const handle = walk(named(root, 'data-sheet')!).find(e => e.localName === 'button' && e._attrs['aria-controls'] !== undefined)!;
    await act(() => { fire(handle, 'click'); });
    assert.equal(String(handle._attrs['aria-expanded']), 'true');
    await act(() => { fire(button(root, what)!, 'click'); });
    await settle();
    assert.equal(String(handle._attrs['aria-expanded']), 'false', `${what}: the panel closes so the timeline and the dock show`);
    unmount(root);
  }
});

test('Pin a note: from another view it goes to Story, a drag picks the span, Send seals a typed note on it', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  let scrolled = 0;
  const stage = walk(root).find(e => e._attrs['data-guide'] === 'view')!;
  Object.assign(stage, { scrollIntoView: () => { scrolled++; } });
  await act(() => { fire(walk(root).find(e => e._attrs['role'] === 'tab' && e.textContent === 'Piano roll')!, 'click'); });
  assert.equal(scrolled, 0);
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.equal(scrolled, 1, 'the timeline is scrolled into view to pick on');
  assert.equal(button(root, 'Pin a note')!._attrs['aria-pressed'], 'true');
  const svg = named(root, 'data-timeline')!;
  assert.ok(svg, 'the Story view is shown for pinning');
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 100)); });
  assert.match(named(root, 'data-pin-span')!.textContent, /^For Bars 5–7 · 8 s – 13\.6 s · Horns$/, 'the lane by its name');
  assert.ok(named(root, 'data-selection'));
  const box = walk(root).find(e => e.localName === 'textarea')!;
  assert.equal(box.parentElement?.localName, 'label');
  box.value = 'louder and slower right here';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.piece, b.draft, b.fromBar, b.toBar, b.lane, b.text, b.made], ['text', 'test-piece', 1, 5, 7, 'brass', 'louder and slower right here', '2026-10-20T14:03:11.000Z']);
  close(b.from, 8);
  close(b.to, 13.6);
  assert.equal(named(root, 'data-answer-status')!.textContent, SENT_MESSAGE);
  assert.ok(named(root, 'data-pin-composer') === undefined, 'the composer closes once the note is safe');
  unmount(root);
});

test('React: the section under the playhead, in one tap', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  assert.match(named(root, 'data-react-bar')!.textContent, /React to: The Labyrinth stirs/);
  await act(() => { fire(button(root, 'Love it')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.from, b.to, b.fromBar, b.toBar, b.reaction], ['react', 0, 8, 1, 4, 'love-it']);
  unmount(root);
});

test('Draw the energy: the drawing replaces the view with its own legend; Send seals the whole curve', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.ok(named(root, 'data-timeline') === undefined);
  const editor = named(root, 'data-energy-editor')!;
  assert.equal(named(root, 'data-legend')!.textContent, 'dashed = the energy now · green = your shape · higher = more intense');
  await act(() => { fire(editor, 'pointerdown', { pointerId: 1, clientX: 180, clientY: 150 }); });
  await act(() => { fire(editor, 'pointermove', { pointerId: 1, clientX: 540, clientY: 20 }); });
  await act(() => { fire(editor, 'pointerup', { pointerId: 1, clientX: 540, clientY: 20 }); });
  await act(() => { fire(button(root, 'Send this shape')!, 'click'); });
  await settle();
  const b = sent[0]!.body;
  assert.deepEqual([b.kind, b.from, b.to, b.fromBar, b.toBar, b.curve![0]![0], b.curve!.at(-1)![0]], ['energy', 0, 16, 1, 8, 0, 16]);
  assert.ok(named(root, 'data-timeline'), 'the Story view comes back');
  unmount(root);
});

test('the energy drawing\'s guide opens by itself the first time', async () => {
  const storage = memoryStorage();
  for (const v of ['story', 'roll', 'sound', 'sheet']) storage.setItem(`workroom-guide-${v}`, 'seen');
  const { session } = fakeNotes();
  const root = await mount({ notes: session, guide: guideStore(storage) });
  assert.ok(named(root, 'data-guide-card') === undefined);
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.match(named(root, 'data-guide-card')!.textContent, /Part 1 of 4/);
  assert.equal(storage.getItem('workroom-guide-energy'), 'seen');
  unmount(root);
});

test('Hum it records at the playhead and sends a hum with its recording', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  media.clock.ms += 2500;
  const stop = walk(root).find(e => e.localName === 'button' && /^Stop \(0:00 of 1:00\)$/.test(e.textContent))!;
  await act(() => { fire(stop, 'click'); });
  await settle();
  const { body, audio } = sent[0]!;
  assert.deepEqual([body.kind, body.from, body.to, body.fromBar, body.audio], ['hum', 0, 0, 1, { mime: 'audio/mp4', seconds: 2.5 }]);
  assert.deepEqual([...(audio ?? [])], [1, 2, 3]);
  unmount(root);
});

test('a note kept on this device says why', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: false, sent: [], kept: [{ key, reason: 'offline' }] }));
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, KEPT_MESSAGES.offline);
  unmount(root);
});

/** Pins a span on the Story view: Pin a note, then a drag across the brass lane (bars 5–7). */
async function pinSpan(root: StubElement): Promise<StubElement> {
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const svg = named(root, 'data-timeline')!;
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 120, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 120, 100)); });
  return svg;
}

test('the pin composer is docked at the bottom of a phone, above the notes handle, and scrolls inside itself', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  assert.ok(named(root, 'data-answer-dock') === undefined, 'nothing is docked until something needs the owner');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const dock = named(root, 'data-answer-dock')!;
  for (const c of ['fixed', 'bottom-11', 'max-h-[40dvh]', 'overflow-y-auto', 'lg:static']) assert.ok((dock._attrs['class'] ?? dock.className).split(' ').includes(c), c);
  assert.ok(walk(dock).includes(named(root, 'data-pin-composer')!), 'the composer is in the dock');
  await act(() => { fire(button(root, 'Cancel')!, 'click'); });
  assert.ok(named(root, 'data-answer-dock') === undefined);
  unmount(root);
});

/** The page's room under its content while pinning: the dock's most (40 dvh) above the notes handle (bottom-11) and a gap. */
const PIN_ROOM = 'pb-[calc(40dvh+3.5rem)]';
test('while pinning, a phone\'s page keeps room under its content for the dock, so the Story view can scroll to the top above the composer', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  const page = walk(root).find(e => (e._attrs['class'] ?? e.className ?? '').split(' ').includes('workroom'))!;
  const classes = (): string[] => (page._attrs['class'] ?? page.className).split(' ');
  assert.ok(classes().includes('pb-14') && !classes().includes(PIN_ROOM), 'room for the notes handle only');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.ok(classes().includes(PIN_ROOM) && !classes().includes('pb-14'), 'room for the dock (at most 40 dvh) above the handle');
  assert.ok(classes().includes('lg:pb-0'), 'from 1024 px the dock is in the page\'s flow');
  await act(() => { fire(button(root, 'Cancel')!, 'click'); });
  assert.ok(classes().includes('pb-14') && !classes().includes(PIN_ROOM));
  unmount(root);
});
test('a drag that starts in one lane and ends in another pins the span without a lane', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  const svg = named(root, 'data-timeline')!;
  await act(() => { fire(svg, 'pointerdown', at(360, 120, 0)); });
  await act(() => { fire(svg, 'pointermove', at(612, 80, 50)); });
  await act(() => { fire(svg, 'pointerup', at(612, 80, 100)); });
  assert.match(named(root, 'data-pin-span')!.textContent, /^For Bars 5–7 · 8 s – 13\.6 s$/, 'no lane named');
  unmount(root);
});

test('a note that cannot be sealed leaves the words in the box and says so where the owner is looking', async () => {
  const { session, sent } = fakeNotes(undefined, 1);
  const root = await mount({ notes: session });
  await pinSpan(root);
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'this must survive';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(box.value, 'this must survive');
  assert.ok(named(root, 'data-pin-composer'), 'the composer stays open');
  assert.equal(named(root, 'data-answer-status')!.textContent, SEND_MESSAGES.sealFailed);
  assert.equal(sent.length, 0);
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.text, 'this must survive', 'the same words go on the next try');
  assert.ok(named(root, 'data-pin-composer') === undefined);
  unmount(root);
});

test('a recording always has a Stop; Record in the composer starts it and the dock shows Stop', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  assert.ok(walk(named(root, 'data-recording-strip')!).some(e => e.localName === 'button' && /^Stop \(/.test(e.textContent)), 'Stop sits in the dock');
  assert.equal(button(root, 'Recording…')!.disabled, true);
  media.clock.ms += 4000;
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  const { body, audio } = sent[0]!;
  assert.deepEqual([body.kind, body.fromBar, body.toBar, body.lane, body.audio], ['speech', 5, 7, 'brass', { mime: 'audio/mp4', seconds: 4 }]);
  assert.deepEqual([...(audio ?? [])], [1, 2, 3]);
  assert.equal(media.released.tracks, 1, 'the microphone is released');
  unmount(root);
});

test('switching to React or Draw while recording stops the microphone and keeps the recording to Send or Discard', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  media.clock.ms += 7000;
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await settle();
  assert.equal(media.released.tracks, 1, 'the microphone is off');
  assert.ok(named(root, 'data-recording-strip') === undefined);
  assert.equal(sent.length, 0, 'nothing was sent behind the owner\'s back');
  const held = named(root, 'data-held-recording')!;
  assert.match(held.textContent, /A 0:07 recording is waiting here, not sent yet\./);
  await act(() => { fire(button(held, 'Send recording')!, 'click'); });
  await settle();
  assert.deepEqual([sent[0]!.body.kind, sent[0]!.body.fromBar, sent[0]!.body.toBar, sent[0]!.body.audio!.seconds], ['speech', 5, 7, 7]);
  assert.ok(named(root, 'data-held-recording') === undefined, 'gone once stored');
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  await settle();
  const again = named(root, 'data-held-recording')!;
  assert.ok(again, 'a hum is kept the same way');
  await act(() => { fire(button(again, 'Discard recording')!, 'click'); });
  assert.ok(named(root, 'data-held-recording') === undefined);
  assert.equal(sent.length, 1);
  unmount(root);
});

test('a recording that could not be stored stays held and goes on the next Send', async () => {
  const { session, sent } = fakeNotes(undefined, 1);
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  assert.equal(sent.length, 0);
  const held = named(root, 'data-held-recording')!;
  assert.ok(held, 'the recording is kept');
  assert.equal(named(root, 'data-answer-status')!.textContent, SEND_MESSAGES.sealFailed);
  await act(() => { fire(button(held, 'Send recording')!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.kind, 'hum');
  assert.ok(named(root, 'data-held-recording') === undefined);
  unmount(root);
});

test('a reaction is one tap and the bar stays open for the next', async () => {
  const { session, sent } = fakeNotes();
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Love it')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, SENT_MESSAGE);
  assert.ok(named(root, 'data-react-bar'), 'still open');
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.deepEqual(sent.map(s => s.body.reaction), ['love-it', 'calmer']);
  assert.equal(button(root, 'React')!._attrs['aria-pressed'], 'true');
  unmount(root);
});

test('a note this browser could only keep in memory says so', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: true, sent: [], kept: [{ key, reason: 'offline' }] }));
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, `${KEPT_MESSAGES.offline} ${MEMORY_NOTICE}`);
  unmount(root);
});

test('no key takes Escape while a composer is open and a recording runs', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  assert.equal(pressEscape(root), 0);
  assert.ok(named(root, 'data-pin-composer'), 'the composer is still open');
  assert.ok(named(root, 'data-recording-strip'), 'the recording goes on');
  assert.equal(sent.length, 0);
  unmount(root);
});

/** Presses Escape at every element and at every window and document key listener; how many of them took it. */
function pressEscape(root: StubElement): number {
  let taken = 0;
  for (const el of [root, ...walk(root)]) for (const type of ['keydown', 'keyup', 'keypress']) fire(el, type, { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } });
  for (const f of keyListeners) {
    const ev = { type: 'keydown', key: 'Escape', preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
    (f as (e: typeof ev) => void)(ev);
  }
  return taken;
}

test('no key takes Escape while the reactions, a recording kept to send, or the energy drawing are open', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await settle();
  assert.equal(pressEscape(root), 0);
  assert.ok(named(root, 'data-react-bar'), 'the reactions stay open');
  assert.ok(named(root, 'data-held-recording'), 'the recording is still kept');
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  assert.equal(pressEscape(root), 0);
  assert.ok(named(root, 'data-energy-editor'), 'the drawing stays open');
  assert.ok(named(root, 'data-held-recording'));
  assert.equal(sent.length, 0);
  unmount(root);
});

test('while the microphone is being asked for, Hum it cannot start a second recording; leaving the mode cancels it quietly', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  let grant: (s: { getTracks(): { stop(): void }[] }) => void = () => {};
  media.ports.getUserMedia = () => new Promise(r => { grant = r; });
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  assert.equal(button(root, 'Hum it')!.disabled, true, 'no second tap while the microphone is asked for');
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await settle();
  grant({ getTracks: () => [{ stop() { media.released.tracks++; } }] });
  await settle();
  assert.ok(named(root, 'data-recording-strip') === undefined, 'nothing listens');
  assert.ok(named(root, 'data-held-recording') === undefined, 'nothing was recorded');
  assert.equal(media.released.tracks, 1, 'the microphone is released');
  assert.notEqual(named(root, 'data-answer-status')!.textContent, RECORDER_MESSAGES.cancelled, 'a cancelled start is not a problem to report');
  assert.equal(button(root, 'Hum it')!.disabled, false);
  assert.equal(sent.length, 0);
  unmount(root);
});

test('Cancel in the pin composer while recording stops the microphone and keeps the recording', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  media.clock.ms += 3000;
  await act(() => { fire(button(root, 'Cancel')!, 'click'); });
  await settle();
  assert.ok(named(root, 'data-pin-composer') === undefined);
  assert.equal(media.released.tracks, 1);
  assert.match(named(root, 'data-held-recording')!.textContent, /A 0:03 recording is waiting here/);
  await act(() => { fire(button(root, 'Send recording')!, 'click'); });
  await settle();
  assert.deepEqual([sent[0]!.body.kind, sent[0]!.body.fromBar, sent[0]!.body.toBar], ['speech', 5, 7]);
  unmount(root);
});

test('a sign-in that ended while the notes panel loads locks the bar too: the next tap asks for the unlock', async () => {
  const { SignedOut } = ui.api; // the copy the components bundle, so instanceof agrees
  const { session } = fakeNotes();
  let open = true;
  let locks = 0;
  Object.assign(session, { unlocked: () => open, lock: () => { locks++; open = false; }, history: async () => { throw new SignedOut(); } });
  const root = await mount({ notes: session });
  assert.equal(locks, 1);
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.ok(named(root, 'data-pin-composer') === undefined);
  assert.equal(named(root, 'data-unlock-reason')!.textContent, UNLOCK_FIRST);
  unmount(root);
});

test('a note kept because the sign-in ended locks the notes; the next tap asks for the unlock', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: false, sent: [], kept: [{ key, reason: 'signed_out' }] }));
  let open = true;
  let locks = 0;
  Object.assign(session, { unlocked: () => open, lock: () => { locks++; open = false; } });
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(named(root, 'data-answer-status')!.textContent, KEPT_MESSAGES.signed_out);
  assert.ok(locks >= 1);
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.ok(named(root, 'data-pin-composer') === undefined);
  assert.equal(named(root, 'data-unlock-reason')!.textContent, UNLOCK_FIRST);
  unmount(root);
});

test('a spoken note leaves the words typed in the composer, and the composer open', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await pinSpan(root);
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = 'and also this, typed';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Record')!, 'click'); });
  await settle();
  media.clock.ms += 2000;
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.kind, 'speech');
  assert.ok(named(root, 'data-pin-composer'), 'the composer stays open');
  assert.equal(walk(root).find(e => e.localName === 'textarea')!.value, 'and also this, typed');
  assert.match(named(root, 'data-pin-span')!.textContent, /^For Bars 5–7/, 'the span stays picked');
});

test('a hum sent while the reactions are open leaves them open', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && /^Stop \(/.test(e.textContent))!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.kind, 'hum');
  assert.ok(named(root, 'data-react-bar'), 'still open');
});

test('a recording sent while the energy drawing is open leaves the drawing as it is', async () => {
  const { session, sent } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  await settle();
  const editor = named(root, 'data-energy-editor')!;
  await act(() => { fire(editor, 'pointerdown', { pointerId: 1, clientX: 180, clientY: 150 }); });
  await act(() => { fire(editor, 'pointermove', { pointerId: 1, clientX: 540, clientY: 20 }); });
  await act(() => { fire(editor, 'pointerup', { pointerId: 1, clientX: 540, clientY: 20 }); });
  assert.ok(named(root, 'data-energy-drawn'));
  await act(() => { fire(button(named(root, 'data-held-recording')!, 'Send recording')!, 'click'); });
  await settle();
  assert.equal(sent[0]!.body.kind, 'hum');
  assert.ok(named(root, 'data-energy-editor'), 'the drawing stays');
  assert.ok(named(root, 'data-energy-drawn'), 'with the shape drawn on it');
});

test('the reactions close on a tap of React even after the notes locked', async () => {
  const { session } = fakeNotes(key => ({ key, memoryOnly: false, sent: [], kept: [{ key, reason: 'signed_out' }] }));
  let open = true;
  Object.assign(session, { unlocked: () => open, lock: () => { open = false; } });
  const root = await mount({ notes: session });
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await act(() => { fire(button(root, 'Calmer')!, 'click'); });
  await settle();
  assert.equal(open, false);
  await act(() => { fire(button(root, 'React')!, 'click'); });
  assert.ok(named(root, 'data-react-bar') === undefined, 'closed');
  assert.ok(named(root, 'data-unlock-reason') === undefined, 'closing asks for nothing');
});

const noteBox = (root: StubElement) => walk(root).find(e => e.localName === 'textarea');
async function type(root: StubElement, words: string): Promise<void> {
  const box = noteBox(root)!;
  box.value = words;
  await act(() => { fire(box, 'input'); });
}

test('words typed in the pin composer survive React, Draw the energy, Pin a note again and another view', async () => {
  const { session } = fakeNotes();
  const root = await mount({ notes: session });
  await pinSpan(root);
  await type(root, 'keep these words');
  for (const leave of [
    () => fire(button(root, 'React')!, 'click'),
    () => fire(button(root, 'Draw the energy')!, 'click'),
    () => fire(button(root, 'Pin a note')!, 'click'),
    () => fire(walk(root).find(e => e._attrs['role'] === 'tab' && e.textContent === 'Piano roll')!, 'click'),
  ]) {
    await act(leave);
    assert.ok(named(root, 'data-pin-composer') === undefined, 'the composer is closed');
    await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
    assert.equal(noteBox(root)!.value, 'keep these words');
  }
});

test('words typed while a note is sealed and stored stay, with the composer open; only the words sent are cleared', async () => {
  const { session, sent } = fakeNotes();
  let release: () => void = () => {};
  const slow: NotesSession = { ...session, send: (body, audio) => new Promise(resolve => { release = () => resolve(session.send(body, audio)); }) };
  const root = await mount({ notes: slow });
  await pinSpan(root);
  await type(root, 'first thought');
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await type(root, 'first thought, and a second');
  await act(() => { release(); });
  await settle();
  assert.deepEqual(sent.map(s => s.body.text), ['first thought']);
  assert.ok(named(root, 'data-pin-composer'), 'the composer stays open with the new words');
  assert.equal(noteBox(root)!.value, 'first thought, and a second');
  await act(() => { fire(button(root, 'Send')!, 'click'); });
  await act(() => { release(); });
  await settle();
  assert.deepEqual(sent.map(s => s.body.text), ['first thought', 'first thought, and a second']);
  assert.ok(named(root, 'data-pin-composer') === undefined, 'closed once everything typed is stored');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  assert.equal(noteBox(root)!.value, '', 'the box is empty again');
});

test('leaving the page asks first while typed words, a recording, a kept recording or a note held only in memory would be lost', async () => {
  const { session } = fakeNotes();
  let inMemory = false;
  const media = fakeMedia();
  const root = await mount({ notes: { ...session, memoryOnly: () => inMemory }, media: media.ports });
  const asks = (): boolean => leaveListeners.some(f => { const e = { prevented: false, returnValue: undefined as unknown, preventDefault() { e.prevented = true; } }; f(e); return e.prevented; });
  assert.equal(asks(), false, 'nothing to lose');
  await pinSpan(root);
  await type(root, 'not sent yet');
  assert.equal(asks(), true, 'typed words');
  await act(() => { fire(button(root, 'React')!, 'click'); });
  assert.equal(asks(), true, 'typed words in a closed composer');
  await act(() => { fire(button(root, 'Pin a note')!, 'click'); });
  await type(root, '');
  assert.equal(asks(), false);
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  assert.equal(asks(), true, 'a recording running');
  await act(() => { fire(button(root, 'Draw the energy')!, 'click'); });
  await settle();
  assert.ok(named(root, 'data-held-recording'));
  assert.equal(asks(), true, 'a recording kept but not stored');
  await act(() => { fire(button(root, 'Discard recording')!, 'click'); });
  assert.equal(asks(), false);
  inMemory = true;
  assert.equal(asks(), true, 'a note held only in memory');
});

test('a recording\'s Stop stays above the notes sheet, even when the sheet is opened while recording', async () => {
  const { session } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  const handle = walk(named(root, 'data-sheet')!).find(e => e.localName === 'button' && e._attrs['aria-controls'] !== undefined)!;
  await act(() => { fire(handle, 'click'); });
  assert.equal(String(handle._attrs['aria-expanded']), 'true');
  const z = (el: StubElement): number => Number(/(?:^| )z-(\d+)(?: |$)/.exec(el._attrs['class'] ?? el.className)?.[1] ?? 0);
  const dock = named(root, 'data-answer-dock')!;
  assert.ok(walk(dock).some(e => e.localName === 'button' && /^Stop \(/.test(e.textContent)));
  assert.ok(z(dock) > z(named(root, 'data-sheet')!), `the dock (z-${z(dock)}) is above the sheet (z-${z(named(root, 'data-sheet')!)})`);
});

test('while a recording runs or waits to be sent, a phone\'s page keeps room for the dock', async () => {
  const { session } = fakeNotes();
  const media = fakeMedia();
  const root = await mount({ notes: session, media: media.ports });
  const page = walk(root).find(e => (e._attrs['class'] ?? e.className ?? '').split(' ').includes('workroom'))!;
  const classes = (): string[] => (page._attrs['class'] ?? page.className).split(' ');
  await act(() => { fire(button(root, 'Hum it')!, 'click'); });
  await settle();
  assert.ok(classes().includes(PIN_ROOM) && classes().includes('lg:pb-0'), 'recording');
  await act(() => { fire(button(root, 'React')!, 'click'); });
  await settle();
  assert.ok(named(root, 'data-held-recording'));
  assert.ok(classes().includes(PIN_ROOM), 'a recording kept to send');
  await act(() => { fire(button(root, 'Discard recording')!, 'click'); });
  assert.ok(classes().includes('pb-14') && !classes().includes(PIN_ROOM), 'room for the handle only');
});
