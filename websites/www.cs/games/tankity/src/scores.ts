/* Operation Tankity: the high scores.
 *
 * One all-time board per difficulty from scores.php, this player's rows marked,
 * opening on the player's own difficulty with a switcher to the others; and a
 * finished solo run filed the moment it ends, on its difficulty's board. When
 * the server cannot be read the board falls back to this browser's own rows. A
 * filing that fails says why on the end card and keeps the run in this browser.
 * The page arrives as deps. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { DIFFICULTY_NAMES } from './difficulty.ts';
import { isScoreRows, type ScoreEntry } from './score-rows.ts';
import type { Difficulty } from './sim.ts';
import { filedLine, fmt } from './standings.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** A board row as scores.php sends it. */
interface BoardRow { name: string; best: number; banked: number; place: number }

export interface ScoresDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  toggleOverlay(id: string, btnId?: string): void;
  initials(): string;
  /** The Menu's Difficulty: the board Scores opens on. */
  difficulty(): Difficulty;
}

export interface SoloRun { initials: string; score: number; banked: number; seed: string; difficulty: Difficulty }

/** Why a filing failed, in words for the end card. */
export function filingFailure(status: number | null, error: string): string {
  if (status === null) return 'the score server is out of reach';
  if (status === 429) return 'too many reports from this connection just now, try again later';
  if (status === 403) return 'the request was refused (it must come from this site)';
  if (status === 415) return 'the server refused the report format';
  if (status >= 500) return `the score server had a problem (${error || 'http ' + status})`;
  return error || 'http ' + status;
}

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, say, toggleOverlay, initials, difficulty } = deps;
  const localRows = pref<ScoreEntry[]>('tankity-local', [], json(isScoreRows), browserStorage());

  const SCORES: { level: Difficulty; rows: { text: string; mine: boolean }[] | null; note: string } = { level: 'normal', rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      level: SCORES.level, onLevel: lv => { void loadScores(lv); }, rows: SCORES.rows, note: SCORES.note,
    });
  }
  async function loadScores(level: Difficulty = difficulty()): Promise<void> {
    const me = initials().toUpperCase();
    SCORES.level = level;
    try {
      const res = await fetch(`scores.php?difficulty=${level}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('http ' + res.status);
      const data = (await res.json()) as { scores?: BoardRow[] };
      SCORES.rows = (data.scores || []).map(r => ({
        text: `#${r.place} ${r.name} \u00b7 ${fmt(r.best)} pts \u00b7 ${r.banked} rounds won`, mine: !!me && r.name.toUpperCase() === me,
      }));
      SCORES.note = `The all-time board on ${DIFFICULTY_NAMES[level]}. Your runs are marked.`;
    } catch (_) {
      SCORES.rows = localRows.get().map((r, i) => ({ text: `#${i + 1} ${r.name} \u00b7 ${fmt(r.score)} pts \u00b7 ${r.banked} rounds won`, mine: !!me && r.name.toUpperCase() === me }));
      SCORES.note = 'The score server is out of reach: these are this browser\'s runs only.';
    }
    renderScoresOverlay();
  }
  function saveLocal(entry: ScoreEntry): void {
    localRows.set([...localRows.get(), entry].sort((a, b) => b.score - a.score).slice(0, 10));
  }
  /* Files a finished solo run on its difficulty's board; `done` always gets a
     line for the end card, a failure's reason included (an empty line would hide
     the card's filed line and read as "did not place"). */
  async function fileSolo(run: SoloRun, done: (line: string) => void): Promise<void> {
    let ok = false;
    try {
      let res: Response;
      try {
        res = await fetch('scores.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: run.initials, score: run.score, banked: run.banked, seed: run.seed, difficulty: run.difficulty }),
        });
      } catch (_) {
        throw filingFailure(null, '');
      }
      const data = (await res.json().catch(() => null)) as { ok?: boolean; place?: number | null; error?: string } | null;
      if (!res.ok || !data || !data.ok) throw filingFailure(res.ok ? 200 : res.status, (data && data.error) || '');
      ok = true;
      done(filedLine(data.place ?? null, run.score, run.difficulty));
    } catch (why) {
      saveLocal({ name: run.initials, score: run.score, banked: run.banked, won: false, seed: run.seed });
      say('The run could not be filed; it stays in this browser.', 'info');
      done(`Couldn't file your score: ${typeof why === 'string' ? why : 'unexpected reply'}. Kept in this browser.`);
    }
    if (ok) void loadScores();
  }

  return { SCORES, renderScoresOverlay, loadScores, fileSolo };
}
