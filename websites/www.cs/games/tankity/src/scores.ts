/* Operation Tankity: the high scores.
 *
 * Reports are filed with scores.php and read back from it; when the server
 * store cannot be reached they fall back to this browser's localStorage. The
 * scores overlay (src/ui/scores.tsx) draws the lines kept here. The game's
 * state and the page arrive as deps. */
import type { GameState } from './game-types.js';
import type { KeyHintFn } from './ui/chrome.js';
import { renderScores as drawScores } from './ui/scores.js';

/** The slice of the game's state a filed report is written from (game.js's G). */
export type ScoresState = Pick<GameState, 'score' | 'roundsWon' | 'won' | 'seed'>;

/** A finished run as it is filed. */
interface ScoreEntry { name: string; score: number; banked: number; won: boolean; seed: string }

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

  /* ---------- scores: file-backed API with localStorage fallback ---------- */
  function localScores(): ScoreEntry[] {
    try {
      return JSON.parse(window.localStorage.getItem('tankity-local') || '[]');
    } catch (_) { return []; }
  }
  function saveLocal(entry: ScoreEntry): void {
    try {
      const arr = localScores();
      arr.push(entry);
      arr.sort((a, b) => b.score - a.score);
      window.localStorage.setItem('tankity-local', JSON.stringify(arr.slice(0, 10)));
    } catch (_) { /* private mode etc. */ }
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
      const res = await fetch('scores.php', { headers: { Accept: 'application/json' } });
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
  /* The last callsign filed, so the next report is one tap. */
  function savedCallsign(): string {
    try { return window.localStorage.getItem('tankity-callsign') || ''; } catch (_) { return ''; }
  }
  async function fileReport(name: string): Promise<void> {
    try { window.localStorage.setItem('tankity-callsign', name); } catch (_) { /* fine */ }
    const entry = { name, score: G.score, banked: G.roundsWon, won: G.won, seed: G.seed };
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

  return { SCORES, renderScoresOverlay, loadScores, savedCallsign, fileReport };
}
