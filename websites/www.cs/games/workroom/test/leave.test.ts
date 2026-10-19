// Leaving the page asks first while something the owner made would be lost:
// words typed but not sent, a recording running or kept but not stored, or a
// note this browser could keep only in memory.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardLeaving, unsavedWork } from '../src/leave.ts';
import type { LeaveEvent } from '../src/leave.ts';

const nothing = { draft: '', recording: false, held: false, memoryOnly: false };

test('only work that would be lost holds the page', () => {
  assert.equal(unsavedWork(nothing), false);
  assert.equal(unsavedWork({ ...nothing, draft: '   \n' }), false, 'spaces are not words');
  assert.equal(unsavedWork({ ...nothing, draft: 'louder here' }), true);
  assert.equal(unsavedWork({ ...nothing, recording: true }), true);
  assert.equal(unsavedWork({ ...nothing, held: true }), true);
  assert.equal(unsavedWork({ ...nothing, memoryOnly: true }), true);
});

test('the guard asks the browser to confirm only while there is unsaved work, and is removed again', () => {
  const listeners = new Map<string, (e: LeaveEvent) => void>();
  const target = { addEventListener: (t: 'beforeunload', f: (e: LeaveEvent) => void) => { listeners.set(t, f); }, removeEventListener: (t: 'beforeunload', f: (e: LeaveEvent) => void) => { if (listeners.get(t) === f) listeners.delete(t); } };
  let unsaved = false;
  const stop = guardLeaving(target, () => unsaved);
  const leave = (): { prevented: boolean; returnValue: unknown } => {
    const e = { prevented: false, returnValue: undefined as unknown, preventDefault() { e.prevented = true; } };
    listeners.get('beforeunload')!(e);
    return { prevented: e.prevented, returnValue: e.returnValue };
  };
  assert.deepEqual(leave(), { prevented: false, returnValue: undefined }, 'nothing to lose: the page just goes');
  unsaved = true;
  assert.deepEqual(leave(), { prevented: true, returnValue: '' }, 'the browser asks first');
  stop();
  assert.equal(listeners.size, 0);
});
