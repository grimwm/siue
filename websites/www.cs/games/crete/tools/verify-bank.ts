/* The Island of Crete: the shared Endless bank's trusted verifier, run by .github/workflows/crete-verify.yml every
 * six hours and by hand from the Actions tab. Over HTTPS only, it asks the bank (games/crete/endless-bank.php) for the
 * levels waiting in quarantine, makes each again from its tuple with this checkout's generator, and posts whether it
 * made the same level. The bank admits a level on one trusted match, and rejects it on a mismatch. Its token is the
 * CRETE_BANK_VERIFIER_TOKEN secret, sent in the X-Crete-Verifier header; it is never printed. A level of another
 * generator version is left for the players' devices. Each run stops after `--items` levels or `--minutes`, and it
 * always exits 0: a failed run only leaves levels waiting for the next.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/verify-bank.ts [--items 25] [--minutes 45] [--url <endpoint>] */
import { ENDLESS_VERSION, regenerate, sameMade } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { tupleShape } from '../src/endless/verifier.ts';
import { knownOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { pathToFileURL } from 'node:url';

export const BANK_URL = 'https://www.cs.siue.edu/~wgrim/games/crete/endless-bank.php';
export const TOKEN_HEADER = 'X-Crete-Verifier';

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface VerifyDeps {
  fetch: FetchLike;
  url: string;
  token: string;
  /** The level the tuple makes here (provenance.ts's regenerate), null when it makes none. */
  regenerate(t: Tuple): SharedMade | null;
  now(): number;
  log(line: string): void;
}

export interface Tally { checked: number; matched: number; mismatched: number; skipped: number }

/** Checks up to `items` waiting levels, stopping once `ms` have passed; what it did. Never throws. */
export async function verifyAll(deps: VerifyDeps, limits: { items: number; ms: number }): Promise<Tally> {
  const tally: Tally = { checked: 0, matched: 0, mismatched: 0, skipped: 0 };
  const start = deps.now();
  const post = async (body: Record<string, unknown>): Promise<unknown> => {
    const res = await deps.fetch(deps.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [TOKEN_HEADER]: deps.token },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`the bank answered ${res.status}`);
    return res.json();
  };
  let items: unknown[];
  try {
    const body = await post({ op: 'trusted-list', limit: Math.max(1, Math.min(50, limits.items)) }) as { items?: unknown };
    items = Array.isArray(body.items) ? body.items : [];
  } catch (e) {
    deps.log(`could not list the waiting levels: ${e instanceof Error ? e.message : String(e)}`);
    return tally;
  }
  deps.log(`${items.length} waiting level(s)`);
  for (const raw of items) {
    if (tally.checked >= limits.items || deps.now() - start >= limits.ms) { deps.log('stopping: this run\'s share is done'); break; }
    const item = raw as { grade?: unknown; h?: unknown; tuple?: unknown; made?: unknown };
    const tuple = tupleShape(item.tuple);
    if (!tuple || typeof item.h !== 'string' || typeof item.grade !== 'string' || typeof item.made !== 'object' || item.made === null) { tally.skipped++; continue; }
    if (tuple.v !== ENDLESS_VERSION) { tally.skipped++; deps.log(`${item.h}: version ${tuple.v}, left for the players`); continue; }
    let found: SharedMade | null;
    try { found = deps.regenerate(tuple); } catch { found = null; }
    const verdict = sameMade(found, item.made as SharedMade) ? 'match' : 'mismatch';
    tally.checked++;
    if (verdict === 'match') tally.matched++; else tally.mismatched++;
    try {
      await post({ op: 'trusted-verify', grade: item.grade, h: item.h, verdict, found });
      deps.log(`${item.h}: ${verdict}`);
    } catch (e) {
      deps.log(`${item.h}: ${verdict}, not sent: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return tally;
}

/** `--name value` from the command line, as a number, or `fallback`. */
function arg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  const n = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN ?? '';
  const i = process.argv.indexOf('--url');
  const url = i >= 0 ? process.argv[i + 1]! : BANK_URL;
  if (!token) {
    console.log('verify-bank: no CRETE_BANK_VERIFIER_TOKEN; nothing to do');
  } else {
    const known = knownOf(campaignLevels());
    const tally = await verifyAll({
      fetch: (u, init) => fetch(u, { ...init, signal: AbortSignal.timeout(60_000) }),
      url, token,
      regenerate: t => regenerate(t, known),
      now: () => Date.now(),
      log: line => console.log(`verify-bank: ${line}`),
    }, { items: arg('items', 25), ms: arg('minutes', 45) * 60_000 });
    console.log(`verify-bank: checked ${tally.checked}, matched ${tally.matched}, mismatched ${tally.mismatched}, skipped ${tally.skipped}`);
  }
}
