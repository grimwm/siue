// The rule tips: which tip each sight or turn shows, in what order, each once, and back again after Reset Tips.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXIT_AT, TIP_IDS, TIP_TURNS, UNDO_AT, createRuleTips, nextTip, tipText } from '../src/rule-tips.ts';
import type { TipEvent, TipId } from '../src/rule-tips.ts';
import { createMet } from '../src/met.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const view: TipEvent = { kind: 'view', beast: true, relics: false };
const turn = (moves: number, more: Partial<Extract<TipEvent, { kind: 'turn' }>> = {}): TipEvent =>
  ({ kind: 'turn', beast: true, relics: false, moves, steps: ['left', 'up'], caught: false, ...more });
const seenOf = (...ids: TipId[]) => (id: TipId) => ids.includes(id);
const memory = (): StorageLike & { data: Record<string, string> } => {
  const data: Record<string, string> = {};
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('the board in view with the Minotaur on it tells how he moves, before anything else', () => {
  assert.equal(nextTip(view, seenOf()), 'tip-beast');
  assert.equal(nextTip(turn(1), seenOf()), 'tip-beast', 'a first move made before it could show still tells it');
  assert.equal(nextTip({ ...view, beast: false }, seenOf()), null, 'no Minotaur, no tips');
  assert.equal(nextTip(view, seenOf('tip-beast')), null, 'a view tells nothing more without relics');
  assert.equal(nextTip({ ...view, relics: true }, seenOf('tip-beast')), 'tip-relics');
});

test('each turn tells the next tip in order: what he did, Wait and Undo, then the exit', () => {
  assert.equal(nextTip(turn(1), seenOf('tip-beast')), 'tip-walls');
  assert.equal(nextTip(turn(1, { steps: [] }), seenOf('tip-beast')), null, 'the walls tip waits for a turn he moved in');
  assert.equal(nextTip(turn(UNDO_AT - 1), seenOf('tip-beast', 'tip-walls')), null);
  assert.equal(nextTip(turn(UNDO_AT), seenOf('tip-beast', 'tip-walls')), 'tip-undo');
  assert.equal(nextTip(turn(EXIT_AT - 1), seenOf('tip-beast', 'tip-walls', 'tip-undo')), null);
  assert.equal(nextTip(turn(EXIT_AT), seenOf('tip-beast', 'tip-walls', 'tip-undo')), 'tip-exit');
  assert.equal(nextTip(turn(EXIT_AT), seenOf('tip-beast', 'tip-walls')), 'tip-undo', 'the exit waits for Wait and Undo');
  assert.equal(nextTip(turn(1, { caught: true }), seenOf('tip-beast')), 'tip-undo', 'a catch tells Undo at once');
  assert.equal(nextTip(turn(2, { relics: true }), seenOf('tip-beast', 'tip-walls')), 'tip-relics');
  assert.equal(nextTip(turn(9), seenOf(...TIP_IDS)), null, 'all told');
});

test('the words: short, sentence case, and the walls tip says what the Minotaur just did', () => {
  assert.equal(tipText('tip-beast'), 'The Minotaur takes two steps for each of yours, always toward you: across if he can, else up or down.');
  assert.equal(tipText('tip-walls', turn(1)), 'He went left, then up: two steps for your one. He never steps away from you, so a wall in his way can trap him.');
  assert.equal(tipText('tip-walls', turn(1, { steps: ['right'] })), 'He went right, then a wall stopped him. He never steps away from you, so a wall in his way can trap him.');
  assert.equal(tipText('tip-relics'), 'Take every relic: the last one opens the Daedalus Gate on the way to the exit.');
  assert.equal(tipText('tip-undo'), 'Wait lets him move while you stand still. Undo takes back a turn, as often as you like.');
  assert.equal(tipText('tip-exit'), 'Reach the exit to clear the level. Each catch costs a heart; lose them all and the try is over.');
  for (const id of TIP_IDS) {
    const text = tipText(id, turn(1));
    assert.ok(text.split(/[.!?](?:\s|$)/).filter(Boolean).length <= 2, `${id}: one sentence, or two`);
    assert.ok(text.length <= 130, `${id}: short`);
  }
});

test('each tip shows once, a later one replaces it, it goes after a few turns, and Reset Tips brings them back', () => {
  const st = memory();
  const met = createMet(st);
  const tips = createRuleTips(met);
  assert.equal(tips.shown(), null);
  assert.equal(tips.on(view), true);
  assert.equal(tips.shown()?.id, 'tip-beast');
  assert.ok(met.carded('tip-beast'), 'kept with the first cards as soon as it shows');
  assert.equal(tips.on(view), false, 'shown once: the same view again shows nothing new');
  assert.equal(tips.on(turn(1)), true);
  assert.equal(tips.shown()?.id, 'tip-walls', 'the first move replaces it with what the Minotaur did');
  assert.match(tips.shown()!.text, /^He went left, then up/);
  tips.close();
  assert.equal(tips.shown(), null, 'Got It puts it away');
  assert.equal(tips.on(turn(UNDO_AT)), true);
  assert.equal(tips.shown()?.id, 'tip-undo');
  for (let i = 1; i < TIP_TURNS; i++) assert.equal(tips.on(turn(UNDO_AT)), false, 'it stands through a few turns');
  assert.equal(tips.on(turn(UNDO_AT)), true);
  assert.equal(tips.shown(), null, 'then goes by itself');
  tips.on(turn(EXIT_AT));
  assert.equal(tips.shown()?.id, 'tip-exit');
  tips.clear();
  assert.equal(tips.shown(), null, 'a level opened takes it away');

  const again = createRuleTips(createMet(st));
  assert.equal(again.on(view), false, 'kept between visits');
  met.resetCards();
  const reset = createRuleTips(createMet(st));
  assert.equal(reset.on(view), true, 'Reset Tips shows them again');
  assert.equal(reset.shown()?.id, 'tip-beast');
});

test('the browser specs\' every-entry word keeps the tips away, as it does the first cards', () => {
  const st = memory();
  st.data['crete-met'] = '["*"]';
  assert.equal(createRuleTips(createMet(st)).on(view), false);
});
