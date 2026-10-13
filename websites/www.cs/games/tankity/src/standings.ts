/* Operation Tankity: this match's scoreboards.
 *
 * The room's match-end rule and the winner's bonus (server/rules.php
 * room_match_outcome() is the same, pinned by the 'match-end' sim vectors),
 * and the rows the scoreboards show. Pure: seats and rounds in, rows out. */
import type { RoomSeat } from './protocol.ts';
import { TUNE } from './sim.ts';

/** No human with a life left ends the match with no winner; in a room that
 * started with two or more humans, exactly one left ends it, and wins. */
export function matchOutcome(seats: readonly Pick<RoomSeat, 'seat' | 'human' | 'lives'>[], startHumans: number): { over: boolean; winner: number | null } {
  const left = seats.filter(s => s.human && s.lives > 0).map(s => s.seat);
  if (!left.length) return { over: true, winner: null };
  if (startHumans >= 2 && left.length === 1) return { over: true, winner: left[0]! };
  return { over: false, winner: null };
}

/** Twice the round bonus of the round the match ended in. */
export function winnerBonus(round: number): number {
  return 2 * (TUNE.roundWinScore + round * 150);
}
