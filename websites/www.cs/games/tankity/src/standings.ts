/* Operation Tankity: this match's scoreboards.
 *
 * The room's match-end rule (server/rules.php room_match_outcome() is the
 * same, pinned by the 'match-end' sim vectors) and the rows the scoreboards show. Pure: seats and rounds in, rows out. */
import { DIFFICULTY_NAMES } from './difficulty.ts';
import { LOCAL_KEEP, coerceInitials } from './local-board.ts';
import type { LocalRow, Saved } from './local-board.ts';
import type { RoomSeat, RoomSnapshot } from './protocol.ts';
import type { Difficulty } from './sim.ts';

/** No human with a life left ends the match with no winner; in a room that
 * started with two or more humans, exactly one left ends it, and wins. */
export function matchOutcome(seats: readonly Pick<RoomSeat, 'seat' | 'human' | 'lives'>[], startHumans: number): { over: boolean; winner: number | null } {
  const left = seats.filter(s => s.human && s.lives > 0).map(s => s.seat);
  if (!left.length) return { over: true, winner: null };
  if (startHumans >= 2 && left.length === 1) return { over: true, winner: left[0]! };
  return { over: false, winner: null };
}

/** "8,420". */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** server/board.php BOARD_KEEP: the runs each difficulty's board keeps. */
export const BOARD_KEEP = 100;

/** Where a run went: its place on its difficulty's board. */
export function filedLine(rank: number | null, score: number, difficulty: Difficulty): string {
  const on = DIFFICULTY_NAMES[difficulty];
  return rank !== null ? `Filed · #${rank} all-time on ${on}` : `Filed · ${fmt(score)} pts, outside the best ${BOARD_KEEP} on ${on}`;
}

/** Where a run kept in this browser went: its place on this browser's board, or why it was not kept. */
export function localLine(saved: Saved, score: number, difficulty: Difficulty): string {
  const on = DIFFICULTY_NAMES[difficulty];
  if (!saved.kept) return "This browser can't keep scores (storage is blocked).";
  return saved.place !== null ? `Saved on this browser's board · #${saved.place} on ${on}`
    : `Saved in this browser · ${fmt(score)} pts, outside its best ${LOCAL_KEEP} on ${on}`;
}

/** The filed line of a room card: where the score went, why it did not, or nothing while the server has not tried.
 *  A match only one human played is kept in this browser (`filedLocal`); `local` is how that save went, null before it. */
export function roomFiledLine(
  you: { filed: boolean; filedFailed: boolean; filedRank: number | null; filedLocal?: boolean; score: number } | undefined,
  difficulty: Difficulty, local: Saved | null = null,
): string | null {
  if (!you) return null;
  if (you.filedLocal) return local ? localLine(local, you.score || 0, difficulty) : null;
  if (you.filed) return filedLine(you.filedRank, you.score || 0, difficulty);
  return you.filedFailed ? "Couldn't file your score: the score server had a problem. It is not kept in this browser." : null;
}

/** What a room snapshot tells a one-human match's save. */
type RoomForLocal = Pick<RoomSnapshot, 'code' | 'difficulty'> & {
  matchId?: string | null;
  seats: readonly Pick<RoomSeat, 'seat' | 'name' | 'roundsWon'>[];
  you?: { filedLocal?: boolean; score: number };
};

/** Saves a room match only one human played on this browser's board, once per match: the first
 *  snapshot whose `you.filedLocal` is set saves it, by `room:<code>:<matchId>`, so a rejoin, a reload or
 *  another poll never saves it twice. `keep` answers how the save went for this snapshot's match, null
 *  when it is not one this browser keeps. */
export function roomLocalSaver(save: (level: Difficulty, row: LocalRow) => Saved, now: () => string) {
  let last: { ref: string; saved: Saved } | null = null;
  return {
    keep(room: RoomForLocal, seat: number): Saved | null {
      if (!room.you?.filedLocal || !room.matchId) return null;
      const ref = `room:${room.code}:${room.matchId}`;
      if (last?.ref === ref) return last.saved;
      const me = room.seats.find(s => s.seat === seat);
      const saved = save(room.difficulty, {
        initials: coerceInitials(me?.name ?? ''), score: room.you.score || 0, rounds: me?.roundsWon ?? 0, seed: '', at: now(), kind: 'room', ref,
      });
      last = { ref, saved };
      return saved;
    },
  };
}

/** One finished solo round. */
export interface SoloRound { round: number; won: boolean; points: number; kills: number; cash: number; lives: number }

/** One player in a room's scoreboard. `gain` is this round's ("+1,650", "+2,000 win", or ""); `last` fills the Lives / Out in column. */
export interface BoardRow {
  place: number; name: string; you: boolean; crown: boolean; out: boolean;
  score: number; gain: string; won: number; kills: number; last: string;
}

export type Board =
  | { kind: 'room'; caption: string; title: string; lastHead: 'Lives' | 'Out in'; rows: BoardRow[] }
  | { kind: 'solo'; caption: string; title: string; rows: SoloRound[]; total: { points: number; kills: number } };

/** After a round (top of the shop), the match over, you're out, or a look from the menu. */
export type RoomCard = 'shop' | 'over' | 'out' | 'peek';

/** The winner's match bonus comes from the snapshot, so a client that missed the matchwin event (reload, rejoin) shows it too.
 *  `roundTo` names who took the last round; '' when this client never heard (it reloaded in the shop). */
export function roomBoard(room: Pick<RoomSnapshot, 'code' | 'round' | 'seats' | 'winner' | 'winBonus'>, mySeat: number, card: RoomCard, roundTo: string): Board {
  const over = card === 'over';
  const winner = room.winner;
  const bonus = room.winBonus;
  const rows = room.seats
    .filter(s => s.human)
    .sort((a, b) => b.score - a.score || a.seat - b.seat)
    .map((s, i): BoardRow => {
      const crown = over && s.seat === winner;
      // The final card credits the match bonus alone (the winner's snapshot gain also holds the
      // last round's points); the bonus is the server's, never worked out here.
      // The per-seat round gains belong to the shop card.
      const gain = crown ? (bonus > 0 ? `+${fmt(bonus)} win` : '') : over || !s.gain ? '' : `+${fmt(s.gain)}`;
      const alive = s.lives > 0;
      const last = over
        ? (crown || (alive && s.out === null) ? `♥ ${s.lives}` : `round ${s.out ?? room.round}`)
        : (alive ? `♥ ${s.lives}` : `out in round ${s.out ?? room.round}`);
      return { place: i + 1, name: s.name, you: s.seat === mySeat, crown, out: !alive, score: s.score, gain, won: s.roundsWon, kills: s.kills, last };
    });
  const champ = room.seats.find(s => s.seat === winner);
  const caption = over ? `Room ${room.code} · match over after round ${room.round}`
    : card === 'shop' ? `Room ${room.code} · after round ${room.round}` : `Room ${room.code} · round ${room.round}`;
  const title = card === 'shop' ? (roundTo ? `Round ${room.round} to ${roundTo}` : `Round ${room.round} is over`)
    : card === 'out' ? "You're out"
    : card === 'peek' ? 'Standings'
    : champ ? `♛ ${champ.name} wins: last tank standing` : 'Match over: the battery holds the hills';
  return { kind: 'room', caption, title, lastHead: over ? 'Out in' : 'Lives', rows };
}

export function soloBoard(rounds: readonly SoloRound[], card: 'shop' | 'over'): Board {
  const last = rounds[rounds.length - 1];
  const n = last ? last.round : 0;
  return {
    kind: 'solo',
    caption: card === 'over' ? `Solo · match over after round ${n}` : `Solo · after round ${n}`,
    title: card === 'over' || !last ? '' : `Round ${n} ${last.won ? 'cleared' : 'lost'}`,
    rows: [...rounds],
    total: { points: rounds.reduce((a, r) => a + r.points, 0), kills: rounds.reduce((a, r) => a + r.kills, 0) },
  };
}

/** What Q does on an end card: a look from the menu ('peek') goes back to
 *  the battle and the you're-out card ('out') watches the finish, both as their
 *  button does; a finished room match ('over') keeps its card until a button is
 *  pressed; a solo card ('solo') leaves Q to its usual job. */
export function endCardBack(buttons: 'solo' | 'over' | 'out' | 'peek'): 'watch' | 'stay' | 'pass' {
  if (buttons === 'out' || buttons === 'peek') return 'watch';
  return buttons === 'over' ? 'stay' : 'pass';
}
