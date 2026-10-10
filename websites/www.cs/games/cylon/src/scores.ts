/* Cylon Defense: the high-score client.
 *
 * Everything between the page and scores.php that is not drawing: the CSRF
 * token, the per-run token, the cached board, the board's size and blocked
 * initials, the qualifying rule, the score submission and what its replies
 * mean. It never touches the document; what it learns reaches the page as
 * return values (the board to render, the config the server sent, the problem
 * to show next to the initials).
 *
 * `fetch` comes in as an argument, so scores-test.js drives it with a fake
 * server. cylon.js builds the real client from the page's fetch and the
 * scores URL. */

export interface ScoreEntry {
  initials?: string;
  score: number;
  /** When it was set; anything Date can read. */
  at?: string | number;
}

/** The part of scores.php's config the page shows or enforces. */
export interface ScoreConfig {
  maxScores?: unknown;
  blockedInitials?: unknown;
  weekStartsOn?: unknown;
  timezone?: unknown;
}

/** Why a submission did not save; null in the cases that stay silent. */
export type SubmitProblem = 'invalid-initials' | 'save-failed';
export interface SubmitResult { saved: boolean; problem: SubmitProblem | null }

export interface ScoresClient {
  /** The board as last heard from the server. */
  board(): readonly ScoreEntry[];
  /** True when `score` earns a board slot: open seats, or strictly above the lowest shown. */
  qualifies(score: number, list?: readonly ScoreEntry[]): boolean;
  isBlocked(initials: string): boolean;
  /** Fetches the board and the config; returns the config, or null when the call failed. */
  load(): Promise<ScoreConfig | null>;
  /** Asks the server for a run token (the start of a run); resolves when it has been answered. */
  startRun(): Promise<void>;
  /** Submits a finished run's score. */
  submit(score: number, initials: string, hits: number): Promise<SubmitResult>;
}

export interface ScoresEnv {
  fetch: typeof fetch;
  /** Where failures that the page cannot show are logged. */
  log?: (message: string, err: unknown) => void;
}

/** A line saying when the board resets, from the server's config. */
export function weeklyResetText(config: ScoreConfig): string {
  const day = config.weekStartsOn === 'sunday' ? 'Sunday' : 'Monday';
  const zone = config.timezone === 'America/Chicago' ? 'Central' : String(config.timezone || '');
  return `Play often — scores reset every ${day} at midnight ${zone}.`;
}

/** The board as list items. */
export function formatHighScoreRows(list: readonly ScoreEntry[]): string {
  if (!list.length) {
    return '<li class="cylon-hs-empty">No scores yet</li>';
  }
  return list.map((entry, i) => {
    const when = entry.at ? new Date(entry.at) : null;
    const date = when && !Number.isNaN(when.getTime())
      ? when.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      : '';
    const initials = (entry.initials || 'AAA').toString().slice(0, 3).toUpperCase();
    const dateHtml = date
      ? `<span class="cylon-hs-date">${date}</span>`
      : '<span class="cylon-hs-date"></span>';
    return `<li><span class="cylon-hs-rank">#${i + 1}</span><strong class="cylon-hs-initials">${initials}</strong>${dateHtml}<span class="cylon-hs-score">${entry.score} KOs</span></li>`;
  }).join('');
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function createScoresClient(api: string, env: ScoresEnv): ScoresClient {
  const log = env.log ?? ((message, err) => console.error(message, err));
  let csrfToken = '';
  let runToken = '';
  let runIssueGen = 0;
  let runIssue: Promise<void> | null = null;
  let limit = 10;
  const blocked = new Set<string>();
  let cached: ScoreEntry[] = [];

  function headers(extra?: Record<string, string>): Record<string, string> {
    return { 'X-Cylon-CSRF': csrfToken, ...extra };
  }

  function applyConfig(config: unknown): void {
    if (!isRecord(config)) return;
    const maxScores = Number(config.maxScores);
    if (maxScores >= 1) limit = maxScores;
    if (Array.isArray(config.blockedInitials)) {
      blocked.clear();
      config.blockedInitials.forEach((item) => {
        const initials = String(item || '').toUpperCase();
        if (/^[A-Z]{3}$/.test(initials)) blocked.add(initials);
      });
    }
  }

  function takeBoard(data: unknown): void {
    if (isRecord(data) && Array.isArray(data.scores)) cached = data.scores as ScoreEntry[];
  }

  async function load(): Promise<ScoreConfig | null> {
    try {
      const res = await env.fetch(api, {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: headers(),
      });
      if (!res.ok) throw new Error('bad status');
      const data: unknown = await res.json();
      if (!isRecord(data)) throw new Error('bad body');
      if (typeof data.csrf === 'string' && data.csrf) csrfToken = data.csrf;
      applyConfig(data.config);
      cached = Array.isArray(data.scores) ? data.scores as ScoreEntry[] : [];
      return isRecord(data.config) ? data.config : null;
    } catch {
      return null;
    }
  }

  function startRun(): Promise<void> {
    const gen = ++runIssueGen;
    runToken = '';
    runIssue = (async () => {
      try {
        if (!csrfToken) await load();
        const res = await env.fetch(api, {
          method: 'POST',
          credentials: 'same-origin',
          headers: headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ op: 'start' }),
          cache: 'no-store',
        });
        const data: unknown = await res.json().catch(() => null);
        if (gen !== runIssueGen) return;
        if (res.ok && isRecord(data) && typeof data.run === 'string') runToken = data.run;
      } catch (err) {
        log('Cylon run token failed', err);
      }
    })();
    return runIssue;
  }

  function qualifies(score: number, list: readonly ScoreEntry[] = cached): boolean {
    if (score < 1) return false;
    if (!list || list.length < limit) return true;
    let lowest = Infinity;
    for (const entry of list) {
      const s = Number(entry.score) || 0;
      if (s < lowest) lowest = s;
    }
    return score > lowest;
  }

  function isBlocked(initials: string): boolean {
    return blocked.has((initials || '').toUpperCase());
  }

  async function submit(score: number, initials: string, hits: number): Promise<SubmitResult> {
    if (!score || score < 1) return { saved: false, problem: null };
    const clean = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, 'A');
    if (isBlocked(clean)) return { saved: false, problem: 'invalid-initials' };
    try {
      if (runIssue) await runIssue;
      if (!runToken) return { saved: false, problem: 'save-failed' };
      const res = await env.fetch(api, {
        method: 'POST',
        credentials: 'same-origin',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ op: 'score', score, hits, initials: clean, run: runToken }),
        cache: 'no-store',
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.status === 400 && isRecord(data) && data.error === 'invalid initials') {
        takeBoard(data);
        return { saved: false, problem: 'invalid-initials' };
      }
      if (!res.ok) {
        takeBoard(data);
        return { saved: false, problem: 'save-failed' };
      }
      runToken = '';
      cached = isRecord(data) && Array.isArray(data.scores) ? data.scores as ScoreEntry[] : cached;
      return { saved: true, problem: null };
    } catch {
      return { saved: false, problem: null };
    }
  }

  return {
    board: () => cached,
    qualifies,
    isBlocked,
    load,
    startRun,
    submit,
  };
}
