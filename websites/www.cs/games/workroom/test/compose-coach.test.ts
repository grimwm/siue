import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { StorageLike } from '../../_kit/ports.ts';
import { COACH_DONE, COACH_STEPS, coachPref, coachWords, nextStep, TIPS_KEY } from '../src/compose/coach.ts';
import type { CoachStep } from '../src/compose/coach.ts';

test('the steps come in the tour\'s order', () => {
  assert.deepEqual(COACH_STEPS.map(s => s.id), ['play', 'note', 'inst', 'fxadd', 'fx', 'xf']);
});

test('the next step is the first not done, whatever order they were done in', () => {
  assert.equal(nextStep(new Set()), 'play');
  assert.equal(coachWords(new Set()), COACH_STEPS[0]!.words);
  assert.equal(nextStep(new Set<CoachStep>(['play', 'inst'])), 'note');
  assert.equal(nextStep(new Set<CoachStep>(['play', 'note', 'inst', 'fxadd', 'fx'])), 'xf');
});

test('every step done gives the finished line', () => {
  const all = new Set(COACH_STEPS.map(s => s.id));
  assert.equal(nextStep(all), null);
  assert.equal(coachWords(all), COACH_DONE);
});

test('the words are sentences and name the real controls', () => {
  for (const s of COACH_STEPS) assert.match(s.words, /^[A-Z].*\.$/);
  assert.match(COACH_STEPS.find(s => s.id === 'fx')!.words, /Hear It From Here/);
  assert.match(COACH_STEPS.find(s => s.id === 'inst')!.words, /Add Instrument/);
});

const memory = (): StorageLike & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('tips show until hidden, and hiding is remembered', () => {
  const s = memory();
  assert.equal(coachPref(s).get(), 'shown');
  coachPref(s).set('hidden');
  assert.equal(s.data[TIPS_KEY], 'hidden');
  assert.equal(coachPref(s).get(), 'hidden');
  s.data[TIPS_KEY] = 'nonsense';
  assert.equal(coachPref(s).get(), 'shown');
  assert.equal(coachPref(null).get(), 'shown');
});
