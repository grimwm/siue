/* Operation Tankity: the game speed (the FF button).
 *
 * The war plays at 1×, 2× or 4×. Solo, the speed is the player's and is kept
 * in this browser under `tankity-speed`; in a room it is the room's, which
 * only the host sets (server/settings.php ROOM_SPEEDS is the authority, and
 * test/speed.test.ts keeps the two lists equal). The speed never changes what
 * happens, only how fast it plays: the solo war runs more of its fixed
 * SOLO_STEP steps per frame, a room replays its volleys faster, and the
 * server waits a matching fraction between drone turns. The player's own
 * controls, the turn clocks and the shop clock keep wall time.
 *
 * DOM-free: the page draws the button (main.ts) and the room client posts
 * the host's pick (net.ts). */
import type { StorageLike } from '../../_kit/ports.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { settleAfter, TURN_SETTLE_MS } from './turn-time.ts';

export const SPEEDS = [1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
export const SPEED_KEY = 'tankity-speed';
/** A host's taps are sent once they have stood this long, like the turn-time
 * slider: tapping through 2× to 4× is one change and one log line. */
export const SPEED_SETTLE_MS = TURN_SETTLE_MS;

export function isSpeed(v: unknown): v is Speed {
  return typeof v === 'number' && (SPEEDS as readonly number[]).includes(v);
}
/** Anything that is not one of the speeds (an old room, a stray value) is 1×. */
export function parseSpeed(v: unknown): Speed {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return isSpeed(n) ? n : 1;
}
/** The tap order: 1× → 2× → 4× → 1×. */
export function nextSpeed(s: Speed): Speed {
  return SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]!;
}
export function speedLabel(s: Speed): string {
  return `${s}×`;
}

/** What the FF button says to a screen reader and in its tooltip. `room`:
 * null solo, else whether this player hosts. */
export function speedTitle(s: Speed, room: { host: boolean } | null): string {
  const now = `Game speed ${speedLabel(s)}`;
  if (room && !room.host) return `${now}. The host sets the room's speed.`;
  return `${now}. Tap for ${speedLabel(nextSpeed(s))}.`;
}

export interface SpeedSetting {
  get(): Speed;
  set(s: Speed): void;
}
/** The solo speed, kept in this browser; storage that throws or is missing
 * keeps it for the session (games/_kit/prefs.ts never throws). */
export function speedSetting(storage: StorageLike | null): SpeedSetting {
  const saved = pref(SPEED_KEY, '1', text, storage);
  return {
    get: () => parseSpeed(saved.get()),
    set(s) { saved.set(String(s)); },
  };
}

export interface SpeedSenderDeps {
  /** Posts the pick; resolves once the server has taken it (and the reply's room is applied). */
  send(s: Speed): Promise<void>;
  /** The server refused or could not be reached: the room keeps its speed. */
  refused(err: unknown): void;
  /** The pick is settled one way or the other: redraw. */
  settled(): void;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
}
/** A host's pick in a room: shown at once, sent once it has stood
 * SPEED_SETTLE_MS, and held over whatever a poll says until the server's
 * answer comes back. Only the newest answer counts. */
export function createSpeedSender(d: SpeedSenderDeps) {
  let want: Speed | null = null;
  let seq = 0;
  const settle = settleAfter<Speed>(SPEED_SETTLE_MS, s => { void post(s); }, d);
  async function post(s: Speed): Promise<void> {
    const mine = ++seq;
    try {
      await d.send(s);
    } catch (err) {
      if (mine === seq) d.refused(err);
    } finally {
      if (mine === seq) {
        want = null;
        d.settled();
      }
    }
  }
  return {
    /** The pick waiting on the server, or null. */
    pending: (): Speed | null => want,
    pick(s: Speed): void {
      want = s;
      settle(s);
    },
    /** Leaving the room: forget a pick in flight. */
    clear(): void {
      want = null;
      seq++;
    },
  };
}
