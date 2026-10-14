/* Operation Tankity: a room's turn time.
 *
 * The host's seven stops (server/settings.php ROOM_TURN_STOPS is the
 * authority; test/turn-time.test.mjs keeps this list equal to it), their
 * labels, how a clock reads at any length, and the notes the status bar and
 * the shop add to a room's clocks. A room can close before its clock runs
 * out (nobody acting for its idle limit: 10 minutes when it is played from
 * a single connection, whatever the turn time), so a close that comes first
 * is shown instead of the clock. */
export const TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800] as const;
export const TURN_DEFAULT = 120;
export const TURN_LABELS = ['Lightning · 1 min', '2 min', '10 min', '30 min', '8 h', '24 h', '1 week'] as const;
/** Turn times this long or longer show the time left on the status bar. */
export const TURN_LONG_S = 600;

export function turnIndex(secs: number): number {
  const i = (TURN_STOPS as readonly number[]).indexOf(secs);
  return i >= 0 ? i : (TURN_STOPS as readonly number[]).indexOf(TURN_DEFAULT);
}
export function turnLabel(secs: number): string { return TURN_LABELS[turnIndex(secs)]!; }
/** The stop at a slider position (clamped). */
export function turnAt(index: number): number {
  const i = Math.max(0, Math.min(TURN_STOPS.length - 1, Math.round(index)));
  return TURN_STOPS[i]!;
}

/** "46 s", "9:59", "7h 59m", "6d 23h" (whole seconds, rounded up). */
export function clockText(secs: number): string {
  const s = Math.max(0, Math.ceil(secs));
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

function closes(word: string, left: number): string {
  return ` · ${word} closes in ${clockText(left)} unless someone plays`;
}

/** What the status bar's turn line adds in a room: the room's close when it
 * comes before the turn's clock runs out, else the time left on a long turn,
 * else nothing. No running clock (a drone's turn) adds nothing. */
export function turnNote(turnSecs: number, turnLeft: number | null, closeLeft: number | null): string {
  if (turnLeft === null) return '';
  if (closeLeft !== null && closeLeft < turnLeft) return closes('Room', closeLeft);
  return turnSecs >= TURN_LONG_S ? ` · ${clockText(turnLeft)} left` : '';
}

/** What the shop's ready line adds: when the shop closes, or the room's
 * close when that comes first. */
export function shopNote(shopLeft: number | null, closeLeft: number | null): string {
  if (shopLeft === null) return '';
  if (closeLeft !== null && closeLeft < shopLeft) return closes('room', closeLeft);
  return ` · shop closes in ${clockText(shopLeft)}`;
}
