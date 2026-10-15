/* Operation Tankity: the rooms this browser sits in, watched.
 *
 * Polls rooms.php?action=mine for every stored seat but the room on screen
 * (which has its own poll and alert), hands the rows to the Your games list,
 * forgets rooms the server says are gone (keeping, marked, those closed to
 * make space, which it lists and never asks about again), and reports each turn that starts
 * once (by its turn key). The server applies any timeout that is due while
 * answering, so a turn that ran out while nobody looked moves on here too.
 * DOM-free: timers and the fetch arrive as deps. */
import type { MineRow } from './protocol.ts';
import type { SeatStore } from './seats.ts';

export const GAMES_POLL_MS = 10_000;
export type LiveRow = Extract<MineRow, { gone: false }>;
/** A room closed to make space for another match, kept until dismissed. */
export interface ClosedRow { code: string; closed: 'space' }
export type GameRow = LiveRow | ClosedRow;
export function isClosedRow(r: GameRow): r is ClosedRow {
  return 'closed' in r && r.closed === 'space';
}

/** The room on screen, which the watcher leaves to its own poll: a running
 * match, or a room's lobby while the lobby shows. A lobby closed with Q keeps
 * the seat and the session, and the room is listed in Your games. */
export function roomOnScreen(net: { code: string; on: boolean }, lobbyOpen: boolean): string {
  return net.code && (net.on || lobbyOpen) ? net.code : '';
}

export interface GamesWatchDeps {
  store: SeatStore;
  mine(seats: { code: string; token: string }[]): Promise<MineRow[]>;
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
  /** The room on screen (its lobby or match), or ''. */
  viewing(): string;
  /** Another tab of the game is showing this room (on-screen.ts). */
  elsewhere?(code: string): boolean;
  /** The live rows, then the rooms closed to make space. */
  onRows(rows: GameRow[]): void;
  onTurn(row: LiveRow): void;
}

export interface GamesWatch {
  start(): void;
  stop(): void;
  /** Asks now (the tab came back, the player stepped out); a no-op while an ask is out. */
  pollNow(): Promise<void>;
  /** The player just left this room on their own turn: the next answer's turn there is
   * already known to them and raises nothing. Lapses with that answer. */
  quietNext(code: string): void;
}

export function createGamesWatch(d: GamesWatchDeps): GamesWatch {
  const told = new Set<string>();
  const quiet = new Set<string>();
  let id: unknown = 0;
  let busy = false;
  async function poll(): Promise<void> {
    if (busy) return;
    const here = d.viewing();
    // A closed seat's room is gone for good: it is listed, never asked about.
    const closedRows = (): ClosedRow[] => d.store.list().filter(s => s.closed === 'space' && s.code !== here)
      .map(s => ({ code: s.code, closed: 'space' }));
    const asks = d.store.list().filter(s => s.code !== here && !s.closed).map(s => ({ code: s.code, token: s.token }));
    if (!asks.length) { d.onRows(closedRows()); return; }
    busy = true;
    try {
      const rows = await d.mine(asks);
      const live: LiveRow[] = [];
      for (const r of rows) {
        if (r.gone) {
          if (r.closed === 'space') d.store.markClosed(r.code);
          else d.store.forget(r.code);
          continue;
        }
        // The room may have come on screen while the answer was out: it has its own list place and alert.
        if (r.code === d.viewing()) continue;
        live.push(r);
        const key = r.code + '#' + r.turnKey;
        const hush = quiet.delete(r.code) || !!d.elsewhere?.(r.code);
        if (r.yourTurn && r.turnKey && !told.has(key)) {
          told.add(key);
          // Told already: the player just left it on this turn, or another tab shows it.
          if (!hush) d.onTurn(r);
        }
      }
      d.onRows([...live, ...closedRows()]);
    } catch (_) { /* the next tick asks again */ } finally { busy = false; }
  }
  return {
    start() { if (!id) id = d.setInterval(() => { void poll(); }, GAMES_POLL_MS); void poll(); },
    stop() { if (id) { d.clearInterval(id); id = 0; } },
    pollNow: poll,
    quietNext(code) { quiet.add(code); },
  };
}
