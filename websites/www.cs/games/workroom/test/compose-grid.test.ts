// The editing grid's rows and hits, the computer keyboard's notes, and the scroll pin that keeps the page still while
// keys are held.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogue, writtenPitch } from '../src/catalogue.ts';
import { cellAt, gridRows, noteRect } from '../src/compose/grid.ts';
import { keyboardStart, pitchForKey, screenKeys } from '../src/compose/keys.ts';
import { pinScroll } from '../src/compose/scrollpin.ts';
import type { ScrollWindow } from '../src/compose/scrollpin.ts';
import type { Library } from '../src/render/plan.ts';

const ENTRIES = catalogue(JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8')) as Library);
const entry = (id: string) => ENTRIES.find(e => e.id === id)!;
const note = (pitch: number, start = 0, length = 1) => ({ id: 1, start, length, pitch, velocity: 90, motif: null });

test('a pitched part shows its expert range, highest first, with names, black keys and range colours', () => {
  const rows = gridRows(entry('violin'), []);
  assert.deepEqual([rows[0]!.pitch, rows.at(-1)!.pitch], [105, 55]);
  assert.equal(rows.find(r => r.pitch === 61)!.black, true);
  assert.equal(rows.find(r => r.pitch === 60)!.name, 'C4');
  assert.equal(rows.find(r => r.pitch === 103)!.range, 'expert');
  const low = gridRows(entry('violin'), [note(24)]);
  assert.equal(low.at(-1)!.pitch, 24, 'a note below the range still has its row');
  assert.equal(low.at(-1)!.range, 'out');
});

test('a drum part shows its pieces by General MIDI number, and a red row for any other key', () => {
  const rows = gridRows(entry('kit'), []);
  assert.deepEqual(rows.map(r => [r.pitch, r.name]), [[51, 'Ride'], [50, 'High Tom'], [49, 'Crash'], [46, 'Open Hi-Hat'], [45, 'Low Tom'], [42, 'Closed Hi-Hat'], [38, 'Snare'], [36, 'Kick']]);
  assert.ok(rows.every(r => !r.black && r.range === 'normal'));
  const odd = gridRows(entry('kit'), [note(61)]);
  assert.deepEqual(odd[0], { pitch: 61, name: 'C#4 (no drum)', black: false, range: 'out' });
});

test('notes and points map to rows and beats', () => {
  const layout = { rows: gridRows(entry('cello'), []), rowH: 10, beatW: 40, beats: 16 };
  const top = layout.rows[0]!.pitch;
  assert.deepEqual(noteRect(layout, note(top - 2, 1.5, 2)), { x: 60, y: 20, w: 80, h: 10 });
  assert.deepEqual(cellAt(layout, 60, 25), { beat: 1.5, pitch: top - 2 });
  assert.equal(cellAt(layout, 10, 99_999), null);
});

test('written pitch: Double Bass an octave up, Piccolo an octave down, Glockenspiel two down', () => {
  assert.equal(writtenPitch(entry('bass'), 28), 40, 'the open E string, written E2');
  assert.equal(writtenPitch(entry('piccolo'), 86), 74);
  assert.equal(writtenPitch(entry('glock'), 84), 60);
  assert.equal(writtenPitch(entry('celesta'), 72), 60);
  assert.equal(writtenPitch(entry('xylo'), 72), 60);
  assert.equal(writtenPitch(entry('violin'), 67), 67);
});

test('the computer keyboard: A is C, W is C sharp, K the next C, from the C at or below home', () => {
  assert.equal(keyboardStart(entry('cello')), 48);
  assert.equal(keyboardStart(entry('violin')), 60);
  assert.equal(keyboardStart(entry('kit')), 36);
  assert.deepEqual(['KeyA', 'KeyW', 'KeyJ', 'KeyK', 'KeyL'].map(c => pitchForKey(c, 48)), [48, 49, 59, 60, 62]);
  assert.equal(pitchForKey('KeyQ', 48), null);
  assert.equal(pitchForKey('KeyL', 120), null, 'nothing above MIDI 127');
  const keys = screenKeys(48, 2);
  assert.deepEqual([keys.length, keys[0]!.pitch, keys.at(-1)!.pitch, keys.filter(k => k.black).length], [25, 48, 72, 10]);
});

/** A window that scrolls when told to, and says when it did. */
function fakeWindow(): ScrollWindow & { scroll(x: number, y: number): void; moves: number } {
  const fns: Record<string, (() => void)[]> = { scroll: [], resize: [] };
  const w = {
    scrollX: 0, scrollY: 0, moves: 0,
    scrollTo(x: number, y: number) { w.scrollX = x; w.scrollY = y; w.moves++; },
    scroll(x: number, y: number) { w.scrollX = x; w.scrollY = y; for (const f of fns['scroll']!) f(); },
    addEventListener(type: 'scroll' | 'resize', fn: () => void) { fns[type]!.push(fn); },
    removeEventListener(type: 'scroll' | 'resize', fn: () => void) { fns[type] = fns[type]!.filter(f => f !== fn); },
  };
  return w;
}

test('the page stays where it was while any key is held, and is free once all are let go', () => {
  const w = fakeWindow();
  const pin = pinScroll(w);
  w.scroll(0, 300);
  pin.hold('key-60');
  pin.hold('key-64');
  w.scroll(0, 250);
  assert.equal(w.scrollY, 300, 'put back');
  pin.release('key-60');
  w.scroll(0, 900);
  assert.equal(w.scrollY, 300, 'one key is still held');
  pin.release('key-64');
  w.scroll(0, 900);
  assert.equal(w.scrollY, 900, 'free again');
  pin.hold('a');
  w.scrollY = 500; // a layout change moved it without a scroll event
  pin.keep();
  assert.equal(w.scrollY, 900);
  pin.dispose();
  pin.release('a');
});
