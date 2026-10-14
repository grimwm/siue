/* Operation Tankity: the high scores.
 *
 * Two boards per difficulty: the online one from scores.php (room matches two
 * or more humans played), this player's rows marked, and this browser's own
 * (src/local-board.ts: solo matches and one-human rooms), the run just saved
 * marked. Scores opens on the player's own difficulty with a switcher to the
 * others. Main's older `tankity-local` rows move onto this browser's board at
 * every load, and when another tab writes them. The page arrives as deps. */
import type { StorageLike } from '../../_kit/ports.ts';
import { DIFFICULTY_NAMES } from './difficulty.ts';
import { LEGACY_KEY, LOCAL_KEY, localBoard } from './local-board.ts';
import type { LocalRow, Saved } from './local-board.ts';
import type { Difficulty } from './sim.ts';
import { fmt } from './standings.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** A board row as scores.php sends it. */
interface BoardRow { name: string; best: number; banked: number; place: number }

export interface ScoresDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  toggleOverlay(id: string, btnId?: string): void;
  initials(): string;
  /** The Menu's Difficulty: the board Scores opens on. */
  difficulty(): Difficulty;
  /** Where this browser's board is kept; null when there is no storage. */
  storage: StorageLike | null;
  /** Calls `fn` with the key another tab wrote (null: it cleared storage). */
  onStorage(fn: (key: string | null) => void): void;
}

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, toggleOverlay, initials, difficulty, storage, onStorage } = deps;
  const board = localBoard(storage);
  board.migrate();
  /** The run this page saved last; its row is marked. */
  let fresh: string | null = null;

  const SCORES: { level: Difficulty; rows: { text: string; mine: boolean }[] | null; note: string } = { level: 'normal', rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      level: SCORES.level, onLevel: lv => { void loadScores(lv); }, rows: SCORES.rows, note: SCORES.note,
      local: localRows(SCORES.level),
    });
  }
  /** This browser's board for a level as the overlay lists it; null when storage is blocked. */
  function localRows(level: Difficulty): { text: string; mine: boolean }[] | null {
    const rows = board.rows(level);
    return rows && rows.map((r, i) => ({
      text: `#${i + 1} ${r.initials} \u00b7 ${fmt(r.score)} pts \u00b7 ${r.rounds} rounds won \u00b7 ${r.kind}`, mine: r.ref === fresh,
    }));
  }
  /** Keeps a finished run on this browser's board: a solo match, or a room match only one human played. */
  function saveLocal(level: Difficulty, row: LocalRow): Saved {
    const saved = board.add(level, row);
    if (saved.kept) fresh = row.ref;
    renderScoresOverlay();
    return saved;
  }
  // Another tab saved a run, or a stale page kept one under main's old key: an open overlay shows it.
  onStorage(key => {
    if (key === LEGACY_KEY) board.migrate();
    if (key === null || key === LOCAL_KEY || key === LEGACY_KEY) renderScoresOverlay();
  });
  /* Loads one board. Only the latest load may draw: a slower reply for a board
     the player has since left would otherwise show another difficulty's rows
     under the pressed button. */
  let loads = 0;
  let shown: Difficulty | null = null; // the board SCORES.rows holds
  async function loadScores(level: Difficulty = difficulty()): Promise<void> {
    const me = initials().toUpperCase();
    const mine = ++loads;
    SCORES.level = level;
    try {
      const res = await fetch(`scores.php?difficulty=${level}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = (await res.json()) as { scores?: BoardRow[] };
      if (mine !== loads) return;
      SCORES.rows = (data.scores || []).map(r => ({
        text: `#${r.place} ${r.name} · ${fmt(r.best)} pts · ${r.banked} rounds won`, mine: !!me && r.name.toUpperCase() === me,
      }));
      SCORES.note = `Room matches with two or more players on ${DIFFICULTY_NAMES[level]}. Your runs are marked.`;
      shown = level;
    } catch (_) {
      if (mine !== loads) return;
      SCORES.rows = null; // not "nobody has filed"
      SCORES.note = 'The online board is out of reach right now.';
      shown = level;
    }
    renderScoresOverlay();
  }
  /* The overlay opens on the player's current difficulty and reads the board afresh: the
     Difficulty may have changed, and a room match files on the server unseen. This browser's
     board is read at every draw. */
  function openScores(): void {
    SCORES.level = difficulty();
    // The last board read stays up while the fresh one loads, when it is this board's.
    if (shown !== SCORES.level) SCORES.rows = null;
    SCORES.note = 'Loading…';
    renderScoresOverlay();
    void loadScores();
  }

  return { SCORES, renderScoresOverlay, openScores, loadScores, saveLocal };
}
