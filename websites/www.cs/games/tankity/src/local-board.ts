/* Operation Tankity: this browser's board.
 *
 * Solo matches and room matches only one human played are kept here, never on
 * the server: the best LOCAL_KEEP runs per difficulty under one localStorage
 * key. A damaged value reads back as empty boards, and blocked storage keeps
 * nothing and says so; nothing here throws. Main's older `tankity-local` rows
 * (runs its filer could not file) move onto this board on every load.
 *
 * Two tabs saving in the same millisecond can lose one row: each save is a
 * read-modify-write of the one key. One player ends one match at a time, so
 * that is accepted. */
import type { StorageLike } from '../../_kit/ports.ts';
import { json } from '../../_kit/prefs.ts';
import type { Difficulty } from './sim.ts';

export const LOCAL_KEY = 'tankity-scores-local';
/** Main's key for runs its filer could not file. */
export const LEGACY_KEY = 'tankity-local';
/** Rows kept per difficulty: the same as the online board shows. */
export const LOCAL_KEEP = 20;

const LEVELS: readonly Difficulty[] = ['easy', 'normal', 'hard'];

export interface LocalRow {
  /** Three uppercase letters. */
  initials: string;
  score: number;
  /** Rounds won. */
  rounds: number;
  seed: string;
  /** ISO time the match ended; '' when unknown (it then counts as oldest). */
  at: string;
  kind: 'solo' | 'room';
  /** One match's key: `solo:<seed>:<at>`, `room:<code>:<matchId>` or `legacy:<seed>:<score>:<name>`. */
  ref: string;
}

interface LocalBoards { v: 1; boards: Record<Difficulty, LocalRow[]> }

function isRow(r: unknown): r is LocalRow {
  if (r === null || typeof r !== 'object') return false;
  const o = r as Record<string, unknown>;
  return typeof o.initials === 'string' && typeof o.score === 'number' && typeof o.rounds === 'number'
    && typeof o.seed === 'string' && typeof o.at === 'string' && (o.kind === 'solo' || o.kind === 'room')
    && typeof o.ref === 'string';
}

function isBoards(v: unknown): v is LocalBoards {
  if (v === null || typeof v !== 'object') return false;
  const o = v as { v?: unknown; boards?: unknown };
  if (o.v !== 1 || o.boards === null || typeof o.boards !== 'object') return false;
  const b = o.boards as Record<string, unknown>;
  return LEVELS.every(lv => Array.isArray(b[lv]) && (b[lv] as unknown[]).every(isRow));
}

const CODEC = json(isBoards);

/** A row as main's `tankity-local` kept it; one without a difficulty counts as Normal. */
interface ScoreEntry { name: string; score: number; banked: number; won: boolean; seed: string; difficulty?: Difficulty }

/** Main's guard for `tankity-local`. */
function isScoreRows(v: unknown): v is ScoreEntry[] {
  return Array.isArray(v) && v.every(r => r !== null && typeof r === 'object'
    && typeof r.name === 'string' && typeof r.score === 'number' && typeof r.banked === 'number'
    && typeof r.won === 'boolean' && typeof r.seed === 'string'
    && (r.difficulty === undefined || LEVELS.includes(r.difficulty)));
}

/** Any value as three uppercase letters, the score guard's rule: everything but letters dropped, then cut or padded with X. */
export function coerceInitials(raw: unknown): string {
  const letters = String(raw ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  return letters.padEnd(3, 'X').slice(0, 3);
}

/** Best first; a tie goes to the older run ('' oldest), then to the row already held. */
function ranked(rows: LocalRow[]): LocalRow[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.score - a.r.score || (a.r.at < b.r.at ? -1 : a.r.at > b.r.at ? 1 : 0) || a.i - b.i)
    .map(x => x.r)
    .slice(0, LOCAL_KEEP);
}

const empty = (): LocalBoards => ({ v: 1, boards: { easy: [], normal: [], hard: [] } });

export interface Saved {
  /** 1-based place on its difficulty's board; null when it fell outside the best LOCAL_KEEP or was not kept. */
  place: number | null;
  /** False when this browser's storage refused it. */
  kept: boolean;
}

export interface LocalBoard {
  /** One difficulty's rows, best first; null when storage is blocked. */
  rows(level: Difficulty): LocalRow[] | null;
  /** Saves a run. A run whose ref is already held is not added again and answers its place. */
  add(level: Difficulty, row: LocalRow): Saved;
  /** Moves main's `tankity-local` rows onto this board; how many moved. */
  migrate(): number;
}

export function localBoard(storage: StorageLike | null): LocalBoard {
  /** The boards, empty for a missing or damaged value; null when storage cannot be read. */
  function read(): LocalBoards | null {
    if (!storage) return null;
    let raw: string | null;
    try {
      raw = storage.getItem(LOCAL_KEY);
    } catch {
      return null;
    }
    if (raw === null) return empty();
    try {
      return CODEC.parse(raw);
    } catch {
      return empty();
    }
  }
  function write(b: LocalBoards): boolean {
    try {
      storage?.setItem(LOCAL_KEY, CODEC.stringify(b));
      return !!storage;
    } catch {
      return false;
    }
  }
  /** Adds rows to `b` in place, skipping refs it holds; how many went in. */
  function merge(b: LocalBoards, level: Difficulty, rows: LocalRow[]): number {
    let added = 0;
    for (const row of rows) {
      if (LEVELS.some(lv => b.boards[lv].some(r => r.ref === row.ref))) continue;
      b.boards[level] = ranked([...b.boards[level], row]);
      added++;
    }
    return added;
  }
  const placeOf = (b: LocalBoards, level: Difficulty, ref: string): number | null => {
    const i = b.boards[level].findIndex(r => r.ref === ref);
    return i < 0 ? null : i + 1;
  };

  return {
    rows(level) {
      const b = read();
      return b ? b.boards[level] : null;
    },
    add(level, row) {
      const b = read();
      if (!b) return { place: null, kept: false };
      if (merge(b, level, [row]) === 0) return { place: placeOf(b, level, row.ref), kept: true };
      if (!write(b)) return { place: null, kept: false };
      return { place: placeOf(b, level, row.ref), kept: true };
    },
    migrate() {
      let raw: string | null;
      try {
        raw = storage ? storage.getItem(LEGACY_KEY) : null;
      } catch {
        return 0;
      }
      if (raw === null) return 0;
      let old: unknown;
      try {
        old = JSON.parse(raw);
      } catch {
        return 0; // not ours to destroy
      }
      if (!isScoreRows(old) || old.length === 0) return 0;
      const b = read();
      if (!b) return 0;
      let moved = 0;
      for (const e of old) {
        moved += merge(b, e.difficulty ?? 'normal', [{
          initials: coerceInitials(e.name), score: e.score, rounds: e.banked, seed: e.seed, at: '', kind: 'solo',
          ref: `legacy:${e.seed}:${e.score}:${e.name}`,
        }]);
      }
      if (moved > 0 && !write(b)) return 0;
      try {
        storage?.removeItem(LEGACY_KEY);
      } catch {
        // The rows are on the board; the old key goes on a later load.
      }
      return moved;
    },
  };
}
