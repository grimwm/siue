/* Operation Tankity: the high scores.
 *
 * One all-time board per difficulty from scores.php, this player's rows marked,
 * opening on the player's own difficulty with a switcher to the others; and a
 * solo run sent through the filer (src/solo-file.ts): each round as it ends,
 * the filing at game over, on its difficulty's board. Every outcome has a line
 * for the end card; a run still waiting files itself later, on one retry timer
 * that follows the filer's nextTry(). The page arrives as deps. */
import type { Timers } from '../../_kit/ports.ts';
import { DIFFICULTY_NAMES } from './difficulty.ts';
import type { Difficulty } from './sim.ts';
import { PENDING_MAX } from './solo-file.ts';
import type { FileOutcome, createFiler } from './solo-file.ts';
import type { SoloRoundLog } from './solo-log.ts';
import { filedLine, fmt } from './standings.ts';
import type { KeyHintFn } from './ui/chrome.tsx';
import { renderScores as drawScores } from './ui/scores.tsx';

/** A board row as scores.php sends it; `standin` marks initials that stand in for a refused name. */
interface BoardRow { name: string; best: number; banked: number; place: number; standin?: boolean }

export type SoloFiler = Pick<ReturnType<typeof createFiler>, 'begin' | 'round' | 'finish' | 'drop' | 'abandoned' | 'flush' | 'nextTry' | 'wake' | 'stored'>;

export interface ScoresDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  say(text: string, tone?: string): void;
  toggleOverlay(id: string, btnId?: string): void;
  initials(): string;
  /** The Menu's Difficulty: the board Scores opens on. */
  difficulty(): Difficulty;
  filer: SoloFiler;
  timers: Pick<Timers, 'setTimeout' | 'clearTimeout'>;
}

/** The shortest wait before the retry timer flushes again, so a run due at once is never a tight loop. */
const RETRY_FLOOR = 1000;

/** The end card's line for a run's outcome. `kept`: the queue reached this browser's storage. */
export function lineFor(o: FileOutcome, kept = true): string {
  switch (o.kind) {
    case 'filed': return filedLine(o.rank, o.score, o.difficulty);
    case 'refused': return `Not filed: ${o.why}.`;
    case 'sent': return 'Sent: the score server took the filing, but its answer was lost. Check Scores.';
    case 'waiting': return kept
      ? 'Saved in this browser; it files itself when the score server answers.'
      : 'Waiting for the score server on this page; it is lost if you close this page.';
  }
}

export function createScores(deps: ScoresDeps) {
  const { $, keyHint, say, toggleOverlay, initials, difficulty, filer, timers } = deps;

  const SCORES: { level: Difficulty; rows: { text: string; mine: boolean }[] | null; note: string } = { level: 'normal', rows: null, note: '' };
  function renderScoresOverlay(): void {
    const section = $('report-overlay');
    if (!section) return;
    drawScores(section, {
      keyHint, onClose: () => toggleOverlay('report-overlay', 'scores-open'),
      level: SCORES.level, onLevel: lv => { void loadScores(lv); }, rows: SCORES.rows, note: SCORES.note,
    });
  }
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
        // A stand-in row (AAA for a name the blocklist refused) is nobody's.
        text: `#${r.place} ${r.name} \u00b7 ${fmt(r.best)} pts \u00b7 ${r.banked} rounds won`, mine: !!me && !r.standin && r.name.toUpperCase() === me,
      }));
      SCORES.note = `The all-time board on ${DIFFICULTY_NAMES[level]}. Your runs are marked.`;
      shown = level;
    } catch (_) {
      if (mine !== loads) return;
      SCORES.rows = [];
      SCORES.note = 'The score server is out of reach right now.';
      shown = level;
    }
    renderScoresOverlay();
  }
  /* The overlay opens on the player's current difficulty and reads the board afresh: the
     Difficulty may have changed, and a room match files on the server unseen. */
  function openScores(): void {
    SCORES.level = difficulty();
    // The last board read stays up while the fresh one loads, when it is this board's.
    if (shown !== SCORES.level) SCORES.rows = null;
    SCORES.note = 'Loading…';
    renderScoresOverlay();
    void loadScores();
  }
  /* The one retry timer: cleared and armed again from nextTry() after every flush, none when nothing is due. */
  let timer: number | null = null;
  function arm(): void {
    if (timer !== null) timers.clearTimeout(timer);
    timer = null;
    const ms = filer.nextTry();
    if (ms === null) return;
    timer = timers.setTimeout(() => { timer = null; void flushPending(); }, Math.max(RETRY_FLOOR, ms));
  }
  /** The end card's line for a run of this page that has not filed yet, by id, so a later flush can update it. */
  const waitingLines = new Map<string, (line: string) => void>();
  /** This page's runs still being played, with the refusal that ended one early. */
  const playing = new Map<string, FileOutcome | null>();
  /* Sends everything due: at load, after each round, at game over, and when the timer fires. */
  async function flushPending(): Promise<void> {
    let outcomes: FileOutcome[] = [];
    try {
      outcomes = await filer.flush();
    } catch (e) {
      console.warn('tankity scores: the filer failed', e);
    }
    arm();
    let filed: Difficulty | null = null;
    for (const o of outcomes) {
      if (o.kind === 'refused' && o.detail) console.warn(`tankity scores: run ${o.id} refused (${o.detail})`);
      if (o.kind === 'filed') filed = o.difficulty;
      const done = waitingLines.get(o.id);
      if (done) done(lineFor(o, filer.stored()));
      else if (playing.has(o.id)) {
        // Only a refusal reaches a run still being played; its end card says so.
        if (o.kind === 'refused') {
          playing.set(o.id, o);
          say(`This match can no longer be filed: ${o.why}.`, 'info');
        }
      } else if (o.kind !== 'waiting') say(`An earlier run: ${lineFor(o)}`, o.kind === 'refused' ? 'info' : 'good'); // never this match's card
      if (o.kind !== 'waiting') waitingLines.delete(o.id);
    }
    // Refresh the board the player is looking at; one never opened gets the run's own.
    if (filed) void loadScores(SCORES.rows ? SCORES.level : filed);
  }
  /* The page has loaded: runs an earlier page left unfinished can never be finished, and what waits goes on. */
  function boot(): Promise<void> {
    for (const id of filer.abandoned()) filer.drop(id);
    return flushPending();
  }
  /* The network is back or the page is shown again: an offline wait ends, through the one timer. */
  function wake(): void {
    filer.wake();
    arm();
  }
  /* A dealt run; false when the filer holds no room for it, and the player is told now, before playing. */
  function soloBegin(id: string, seed: string, level: Difficulty, w: number): boolean {
    if (filer.begin(id, seed, level, w)) {
      playing.set(id, null);
      return true;
    }
    say(`This match won't be filed: ${PENDING_MAX} finished runs are still waiting to reach the score server.`, 'info');
    return false;
  }
  /* A finished round: the server plays it from the run's state. */
  function soloRound(id: string, log: SoloRoundLog): void {
    filer.round(id, log);
    void flushPending();
  }
  /* Game over: the run files under these initials. `done` gets the end card's
     line now, and again if the run files later. */
  async function soloFinish(id: string, who: string, done: (line: string) => void): Promise<void> {
    const refused = playing.get(id);
    playing.delete(id);
    if (refused) { done(lineFor(refused)); return; }
    filer.finish(id, who);
    let told = false;
    waitingLines.set(id, line => { told = true; done(line); });
    await flushPending();
    // A pass already under way when the run finished did not see its initials: one more now does.
    if (!told) await flushPending();
    if (!told) {
      waitingLines.delete(id);
      done('Not filed: this browser no longer holds the run.');
    }
  }
  /* A run that will never finish (quit, a new match mid-match, a run that can no longer be filed). */
  function soloDrop(id: string): void {
    playing.delete(id);
    filer.drop(id);
  }

  return { SCORES, renderScoresOverlay, openScores, loadScores, soloBegin, soloRound, soloFinish, soloDrop, flushPending, boot, wake };
}
