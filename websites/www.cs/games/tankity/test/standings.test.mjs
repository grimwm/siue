// This match's scoreboards (src/standings.ts): the room's match-end rule first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_KEEP, filedLine, fmt, matchOutcome, roomBoard, soloBoard, winnerBonus } from '../src/standings.ts';

const seats = (...lives) => lives.map((l, seat) => ({ seat, human: l !== null, lives: l ?? 0 }));

test('one human plays like solo: over only when the last life goes', () => {
  assert.deepEqual(matchOutcome(seats(2, null, null, null), 1), { over: false, winner: null });
  assert.deepEqual(matchOutcome(seats(0, null, null, null), 1), { over: true, winner: null });
});

test('two or more humans: the last one with lives wins', () => {
  assert.deepEqual(matchOutcome(seats(1, 0, null, null), 2), { over: true, winner: 0 });
  assert.deepEqual(matchOutcome(seats(0, 0, 2, null), 3), { over: true, winner: 2 });
  assert.deepEqual(matchOutcome(seats(1, 1, 0, null), 3), { over: false, winner: null });
});

test('nobody left: over with no winner', () => {
  assert.deepEqual(matchOutcome(seats(0, 0, null, null), 2), { over: true, winner: null });
});

test("the winner's bonus is twice the round bonus", () => {
  assert.equal(winnerBonus(1), 1800);
  assert.equal(winnerBonus(9), 2 * (750 + 9 * 150));
});


const seat = (s, name, o) => ({ seat: s, human: true, name, mode: 'human', bot: false, ready: false, lives: 2, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ...o });
const ROOM = {
  code: 'ABCD', round: 6, winner: null,
  seats: [
    seat(0, 'AK', { score: 6105, gain: 380, roundsWon: 2, kills: 8, lives: 1 }),
    seat(1, 'WG', { score: 8420, gain: 1650, roundsWon: 3, kills: 11 }),
    seat(2, 'JR', { score: 3940, roundsWon: 1, kills: 4, lives: 0, out: 5 }),
    { seat: 3, human: false, name: 'reaper', mode: 'ai', bot: false, ready: false, lives: 0, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null },
  ],
};

test('numbers read with thousands separators', () => {
  assert.equal(fmt(8420), '8,420');
  assert.equal(fmt(98760), '98,760');
});

test('after a round: humans only, by score, with this round\'s gain and lives or the round they went out', () => {
  const b = roomBoard(ROOM, 0, 'shop', 'WG');
  assert.equal(b.kind, 'room');
  assert.equal(b.caption, 'Room ABCD · after round 6');
  assert.equal(b.title, 'Round 6 to WG');
  assert.equal(b.lastHead, 'Lives');
  assert.deepEqual(b.rows.map(r => [r.place, r.name, r.gain, r.last, r.you, r.out]), [
    [1, 'WG', '+1,650', '♥ 2', false, false],
    [2, 'AK', '+380', '♥ 1', true, false],
    [3, 'JR', '', 'out in round 5', false, true],
  ]);
});

test('match over: the winner is crowned and the last column says when each went out', () => {
  const over = { ...ROOM, round: 9, winner: 1, seats: ROOM.seats.map(s => s.seat === 0 ? { ...s, lives: 0, out: 9 } : s.seat === 1 ? { ...s, gain: 2000 } : s) };
  const b = roomBoard(over, 0, 'over', 'WG');
  assert.equal(b.caption, 'Room ABCD · match over after round 9');
  assert.equal(b.title, '♛ WG wins: last tank standing');
  assert.equal(b.lastHead, 'Out in');
  assert.deepEqual(b.rows.map(r => [r.name, r.crown, r.gain, r.last]), [
    ['WG', true, '+2,000 win', '♥ 2'], ['AK', false, '', 'round 9'], ['JR', false, '', 'round 5'],
  ]);
  const nobody = roomBoard({ ...over, winner: null }, 0, 'over', 'the battery');
  assert.equal(nobody.title, 'Match over: the battery holds the hills');
});

test("you're out, and a peek while playing", () => {
  assert.equal(roomBoard(ROOM, 2, 'out', 'WG').title, "You're out");
  assert.equal(roomBoard(ROOM, 0, 'peek', 'WG').title, 'Standings');
});

test('solo: the rounds so far, with a total', () => {
  const rounds = [
    { round: 1, won: true, points: 1020, kills: 3, cash: 600, lives: 3 },
    { round: 2, won: false, points: 240, kills: 1, cash: 0, lives: 2 },
  ];
  const b = soloBoard(rounds, 'shop');
  assert.equal(b.kind, 'solo');
  assert.equal(b.caption, 'Solo · after round 2');
  assert.equal(b.title, 'Round 2 lost');
  assert.deepEqual(b.total, { points: 1260, kills: 4 });
  assert.equal(soloBoard(rounds.slice(0, 1), 'shop').title, 'Round 1 cleared');
  assert.equal(soloBoard(rounds, 'over').caption, 'Solo · match over after round 2');
});

test('the filed line', () => {
  assert.equal(filedLine(12, 9210, 'normal'), 'Filed · #12 all-time on Normal');
  assert.equal(filedLine(null, 40, 'hard'), `Filed · 40 pts, outside the all-time top ${BOARD_KEEP} on Hard`);
});
