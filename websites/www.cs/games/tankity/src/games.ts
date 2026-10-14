/* Operation Tankity: the rooms this browser sits in, watched.
 *
 * Polls rooms.php?action=mine for every stored seat but the room on screen
 * (which has its own poll and alert), hands the rows to the Your games list,
 * forgets rooms the server says are gone, and reports each turn that starts
 * once (by its turn key). The server applies any timeout that is due while
 * answering, so a turn that ran out while nobody looked moves on here too.
 * DOM-free: timers and the fetch arrive as deps. */
import type { MineRow } from './protocol.ts';
import type { SeatStore } from './seats.ts';

export const GAMES_POLL_MS = 10_000;
export type LiveRow = Extract<MineRow, { gone: false }>;

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
  onRows(rows: LiveRow[]): void;
  onTurn(row: LiveRow): void;
}

export interface GamesWatch {
  start(): void;
  stop(): void;
  /** Asks now (the tab came back, the player stepped out); a no-op while an ask is out. */
  pollNow(): Promise<void>;
}

export function createGamesWatch(d: GamesWatchDeps): GamesWatch {
  const told = new Set<string>();
  let id: unknown = 0;
  let busy = false;
  async function poll(): Promise<void> {
    if (busy) return;
    const here = d.viewing();
    const asks = d.store.list().filter(s => s.code !== here).map(s => ({ code: s.code, token: s.token }));
    if (!asks.length) { d.onRows([]); return; }
    busy = true;
    try {
      const rows = await d.mine(asks);
      const live: LiveRow[] = [];
      for (const r of rows) {
        if (r.gone) { d.store.forget(r.code); continue; }
        // The room may have come on screen while the answer was out: it has its own list place and alert.
        if (r.code === d.viewing()) continue;
        live.push(r);
        const key = r.code + '#' + r.turnKey;
        if (r.yourTurn && r.turnKey && !told.has(key)) { told.add(key); d.onTurn(r); }
      }
      d.onRows(live);
    } catch (_) { /* the next tick asks again */ } finally { busy = false; }
  }
  return {
    start() { if (!id) id = d.setInterval(() => { void poll(); }, GAMES_POLL_MS); void poll(); },
    stop() { if (id) { d.clearInterval(id); id = 0; } },
    pollNow: poll,
  };
}
