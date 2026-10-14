// games/tankity/test/standings-ui.test.ts
// The scoreboard component (src/ui/standings.tsx): a room's players, then a
// solo run's rounds, rendered into the kit's DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Board } from '../src/standings.ts';

installDocument();
const { standings } = await importTsx<{ standings: typeof import('../src/ui/standings.tsx') }>(import.meta.dirname, { standings: '../src/ui/standings.tsx' });
const { Standings } = standings;
const hasClass = (el: StubElement, name: string) => String(el.className || '').split(' ').includes(name);
const byClass = (el: StubElement, name: string) => walk(el).filter(n => hasClass(n, name));
/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}

const ROOM: Board = {
  kind: 'room', caption: 'Room ABCD · after round 6', title: 'Round 6 to WG', lastHead: 'Lives',
  rows: [
    { place: 1, name: 'WG', you: false, crown: false, out: false, score: 8420, gain: '+1,650', won: 3, kills: 11, last: '♥ 2' },
    { place: 2, name: 'AK', you: true, crown: false, out: false, score: 6105, gain: '', won: 2, kills: 8, last: '♥ 1' },
    { place: 3, name: 'JR', you: false, crown: false, out: true, score: 3940, gain: '', won: 1, kills: 4, last: 'out in round 5' },
  ],
};
const SOLO: Board = {
  kind: 'solo', caption: 'Solo · after round 2', title: 'Round 2 lost',
  rows: [{ round: 1, won: true, points: 1020, kills: 3, cash: 600, lives: 3 }, { round: 2, won: false, points: 240, kills: 1, cash: 0, lives: 2 }],
  total: { points: 1260, kills: 4 },
};

test('a room board: the heads, your row and an out row marked, the YOU badge, score with its gain', () => {
  const host = makeEl('div');
  render(h(Standings, { board: ROOM }), renderTarget(host));
  const table = walk(host).find(n => n.localName === 'table');
  assert.ok(table, 'a table');
  assert.deepEqual(walk(table).filter(n => n.localName === 'th').map(n => n.textContent), ['#', 'Player', 'Score', 'Rounds', 'Kills', 'Lives']);
  const trs = walk(table).filter(n => n.localName === 'tr').slice(1);
  assert.equal(trs.length, 3);
  assert.ok(hasClass(nth(trs, 1), 'me'));
  assert.ok(hasClass(nth(trs, 2), 'out'));
  assert.equal(byClass(nth(trs, 1), 'you').length, 1);
  assert.equal(byClass(nth(trs, 0), 'you').length, 0);
  assert.equal(nth(walk(nth(trs, 0)).filter(n => n.localName === 'td'), 2).textContent, '8,420+1,650');
  assert.equal(nth(byClass(host, 'kicker'), 0).textContent, 'Room ABCD · after round 6');
  assert.equal(nth(byClass(host, 'board-title'), 0).textContent, 'Round 6 to WG');
});

test('a solo board: its rounds, then the total', () => {
  const host = makeEl('div');
  render(h(Standings, { board: SOLO }), renderTarget(host));
  assert.deepEqual(walk(host).filter(n => n.localName === 'th').map(n => n.textContent), ['Round', 'Points', 'Kills', 'Cash', 'Lives']);
  const foot = walk(host).find(n => n.localName === 'tfoot');
  assert.ok(foot);
  assert.match(foot.textContent, /^Total1,2604/);
});
