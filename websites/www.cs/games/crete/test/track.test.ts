// websites/www.cs/games/crete/test/track.test.ts
// The statistics events Crete sends as levels open and are won.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelName, watchPlay } from '../src/track.ts';
import { CHAPTERS } from '../src/campaign/chapters.ts';

test('levels are named chapter-level, in campaign order', () => {
  assert.equal(levelName(0), '1-1');
  const first = CHAPTERS[0]!.levelIds.length;
  assert.equal(levelName(first), '2-1');
});

test('a level start once per opening, a win once per won try, nothing for an outside level', () => {
  const sent: [string, string | undefined][] = [];
  const see = watchPlay((n, p) => sent.push([n, p]));
  const playing = { now: { outcome: 'playing' } };
  const won = { now: { outcome: 'won' } };
  see({ opens: 1, trial: 0, run: playing }, false);
  see({ opens: 1, trial: 0, run: playing }, false);
  see({ opens: 1, trial: 0, run: won }, false);
  see({ opens: 1, trial: 0, run: won }, false);
  see({ opens: 2, trial: 1, run: playing }, false);
  see({ opens: 3, trial: 1, run: playing }, true);
  see({ opens: 3, trial: 1, run: won }, true);
  assert.deepEqual(sent, [['level_start', '1-1'], ['level_win', '1-1'], ['level_start', '1-2']]);
});
