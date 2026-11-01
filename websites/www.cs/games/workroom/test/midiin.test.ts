// Plugged-in keyboards and drum pads: MIDI messages read, the sustain pedal holding notes, drum pads on channel 10,
// devices named as the browser reports them, and the program change sent to a General MIDI keyboard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMidiKeys, deviceLabel, drumName, parseMidi, programChange } from '../src/compose/midiin.ts';

test('messages: note on, note off, velocity 0 is off, the sustain pedal, and others are ignored', () => {
  assert.deepEqual(parseMidi([0x90, 60, 96]), { kind: 'on', channel: 1, pitch: 60, velocity: 96 });
  assert.deepEqual(parseMidi([0x99, 38, 120]), { kind: 'on', channel: 10, pitch: 38, velocity: 120 });
  assert.deepEqual(parseMidi([0x80, 60, 40]), { kind: 'off', channel: 1, pitch: 60 });
  assert.deepEqual(parseMidi([0x90, 60, 0]), { kind: 'off', channel: 1, pitch: 60 });
  assert.deepEqual(parseMidi([0xb0, 64, 127]), { kind: 'sustain', channel: 1, down: true });
  assert.deepEqual(parseMidi([0xb0, 64, 63]), { kind: 'sustain', channel: 1, down: false });
  assert.equal(parseMidi([0xb0, 7, 100]), null, 'volume is not a note');
  assert.equal(parseMidi([0xf8]), null, 'clock');
  assert.equal(parseMidi([0x90, 60]), null, 'short');
  assert.equal(parseMidi([]), null);
});

function recorder() {
  const log: string[] = [];
  const keys = createMidiKeys({
    down: (key, pitch, velocity, drum) => log.push(`down ${key} ${pitch} ${velocity}${drum ? ' drum' : ''}`),
    up: key => log.push(`up ${key}`),
  });
  return { log, keys };
}

test('a key goes down and up; channel 10 is a drum', () => {
  const { log, keys } = recorder();
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 40 });
  keys.message('kb', { kind: 'off', channel: 1, pitch: 60 });
  keys.message('pads', { kind: 'on', channel: 10, pitch: 38, velocity: 120 });
  assert.deepEqual(log, ['down midi:kb:1:60 60 40', 'up midi:kb:1:60', 'down midi:pads:10:38 38 120 drum']);
});

test('the pedal holds a released key until it comes up', () => {
  const { log, keys } = recorder();
  keys.message('kb', { kind: 'sustain', channel: 1, down: true });
  assert.equal(keys.pedal(), true);
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 90 });
  keys.message('kb', { kind: 'off', channel: 1, pitch: 60 });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 64, velocity: 90 });
  assert.deepEqual(log, ['down midi:kb:1:60 60 90', 'down midi:kb:1:64 64 90'], 'nothing ends while the pedal is down');
  keys.message('kb', { kind: 'sustain', channel: 1, down: false });
  assert.deepEqual(log.slice(2), ['up midi:kb:1:60'], 'pedal up ends the released key, not the one still held');
  keys.message('kb', { kind: 'off', channel: 1, pitch: 64 });
  assert.deepEqual(log.slice(3), ['up midi:kb:1:64']);
  assert.equal(keys.pedal(), false);
});

test('a key pressed again under the pedal ends its old note first', () => {
  const { log, keys } = recorder();
  keys.message('kb', { kind: 'sustain', channel: 1, down: true });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 90 });
  keys.message('kb', { kind: 'off', channel: 1, pitch: 60 });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 70 });
  assert.deepEqual(log, ['down midi:kb:1:60 60 90', 'up midi:kb:1:60', 'down midi:kb:1:60 60 70']);
  keys.message('kb', { kind: 'sustain', channel: 1, down: false });
  assert.deepEqual(log.slice(3), [], 'the key is still physically down');
  keys.message('kb', { kind: 'off', channel: 1, pitch: 60 });
  assert.deepEqual(log.slice(3), ['up midi:kb:1:60']);
});

test('a second note-on for a key still down is ignored; an off for a key never down is ignored', () => {
  const { log, keys } = recorder();
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 90 });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 90 });
  keys.message('kb', { kind: 'off', channel: 1, pitch: 61 });
  assert.deepEqual(log, ['down midi:kb:1:60 60 90']);
});

test("a device's keys all end when it goes away, and its pedal is let go", () => {
  const { log, keys } = recorder();
  keys.message('kb', { kind: 'sustain', channel: 1, down: true });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 60, velocity: 90 });
  keys.message('kb', { kind: 'on', channel: 1, pitch: 62, velocity: 90 });
  keys.message('kb', { kind: 'off', channel: 1, pitch: 62 });
  keys.message('other', { kind: 'on', channel: 1, pitch: 70, velocity: 90 });
  keys.lost('kb');
  assert.deepEqual(log.slice(3).sort(), ['up midi:kb:1:60', 'up midi:kb:1:62']);
  assert.equal(keys.pedal(), false);
  keys.lost('other');
  assert.deepEqual(log.slice(5), ['up midi:other:1:70']);
});

test('a device is named as the browser reports it, with its maker once', () => {
  assert.equal(deviceLabel('P-125', 'Yamaha'), 'Yamaha P-125');
  assert.equal(deviceLabel('Yamaha P-125', 'Yamaha'), 'Yamaha P-125');
  assert.equal(deviceLabel('Launchkey Mini MK3 MIDI Port', null), 'Launchkey Mini MK3 MIDI Port');
  assert.equal(deviceLabel(null, null), 'A MIDI Device');
  assert.equal(deviceLabel('  ', 'Roland'), 'Roland');
});

test('program change and the General MIDI drum names', () => {
  assert.deepEqual(programChange(41), [0xc0, 40], 'Violin, GM 41, is program 40 on channel 1');
  assert.deepEqual(programChange(1, 3), [0xc2, 0]);
  assert.deepEqual(programChange(200), [0xc0, 127], 'kept to 1–128');
  assert.equal(drumName(38), 'Acoustic Snare');
  assert.equal(drumName(42), 'Closed Hi-Hat');
  assert.equal(drumName(36), 'Bass Drum 1');
  assert.equal(drumName(20), 'Drum 20');
});
