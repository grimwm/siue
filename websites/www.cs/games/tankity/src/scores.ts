/* Operation Tankity: the high scores.
 *
 * Reports are filed with scores.php and read back from it; when the server
 * store cannot be reached they fall back to this browser's localStorage. The
 * scores overlay (src/ui/scores.tsx) draws the lines kept here. The game's
 * state and the page arrive as deps. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { json, pref, text } from '../../_kit/prefs.ts';
import type { GameState } from './game-types.ts';
import { isScoreRows, type ScoreEntry } from './score-rows.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** The slice of the game's state a filed report is written from (main.ts's G). */
export type ScoresState = Pick<GameState, 'score' | 'roundsWon' | 'won' | 'seed' | 'difficulty'>;

/** A line of the high-score list as scores.php sends it. */
interface ScoreRow { name: string; best: number; banked: number; won: boolean }

/** What the scores need from the page and the rest of the game. */
export interface ScoresDeps {
  G: ScoresState;
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  toggleOverlay(id: string, btnId?: string): void;
}

export function createScores(deps: ScoresDeps) {
  const { G, $, keyHint, say, toggleOverlay } = deps;
  const storage = browserStorage();
  const localRows = pref<ScoreEntry[]>('tankity-local', [], json(isScoreRows), storage);
  const callsign = pref('tankity-callsign', '', text, storage);

  /* ---------- scores: file-backed API with localStorage fallback ---------- */
  function localScores(): ScoreEntry[] {
    return localRows.get();
  }
  function saveLocal(entry: ScoreEntry): void {
    const arr = [...localScores(), entry];
    arr.sort((a, b) => b.score - a.score);
    localRows.set(arr.slice(0, 10));
  }
  /* The scores overlay is a Preact component (src/ui/scores.tsx); the game loads
     the list and hands in finished lines. */
  const SCORES: { rows: string[] | null; note: string; formHidden: boolean } = { rows: null, note: '', formHidden: false };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint,
      onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      rows: SCORES.rows,
      note: SCORES.note,
      formHidden: SCORES.formHidden,
      onFile: raw => {
        const name = raw.trim();
        if (!name) { say('Give your callsign first, hero.', 'info'); return; }
        fileReport(name);
      },
    });
  }
  async function loadScores(): Promise<void> {
    let rows: ScoreRow[] = [];
    let src = 'file store';
    try {
      const res = await fetch('scores.php?difficulty=' + encodeURIComponent(G.difficulty ?? 'normal'), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();
      rows = data.scores || [];
    } catch (_) {
      rows = localScores().map(s => ({ name: s.name, best: s.score, banked: s.banked, won: s.won }));
      src = 'this browser only (server store unreachable)';
    }
    SCORES.rows = rows.slice(0, 10).map(r => `${r.name}: ${r.best} pts (${r.banked} rounds won${r.won ? ', champion' : ''})`);
    SCORES.note = `Showing reports from ${src}.`;
    renderScoresOverlay();
  }
  async function fileReport(name: string): Promise<void> {
    callsign.set(name);
    const entry = { name, score: G.score, banked: G.roundsWon, won: G.won, seed: G.seed, difficulty: G.difficulty ?? 'normal' };
    try {
      const res = await fetch('scores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error('http ' + res.status);
      say(`Report filed for ${name}. The base salutes you.`, 'good');
    } catch (_) {
      saveLocal(entry);
      say(`Server store unreachable, so the report stays in ${name}'s browser instead.`, 'info');
    }
    loadScores();
  }

  return { SCORES, renderScoresOverlay, loadScores, fileReport };
}
