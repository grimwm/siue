// The engine's answers, held still: every campaign level's measure and every-piece verdicts, every bank level's
// measure and whole gate, and a fixed set of Endless searches, computed now and compared with the answers the engine
// gave before its hot path was rewritten for speed (test/engine-same/shard-<k>.json, written by
// tools/engine-same.ts). A faster engine must give these bit for bit: the fewest moves, the shortest line, the
// situations each search stores (the difficulty measure), every verdict, and the level each Endless search makes.
// test/engine-same-<k>.test.ts runs shard k of SHARDS, so node runs them side by side. Not a test file.
import { BANK } from '../src/endless/bank.ts';
import { campaignLevels, CAMPAIGN_TEXTS } from '../src/endless/campaign.ts';
import { floorOf, gateProblems, knownOf, bandAfter, PLATEAU } from '../src/endless/gate.ts';
import type { Known } from '../src/endless/gate.ts';
import { fromBank, makePart } from '../src/endless/generate.ts';
import { measure, purposeProblems, threatOf, uselessProblems } from '../src/puzzle/difficulty.ts';
import type { Difficulty, Threat } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';

export const SHARDS = 4;

/** The Endless searches: part `k` of the search for a run's second level (after the bank's first for the seed), each
 *  part given `part` situations. Chosen so that some find a level and some spend their whole budget. */
export const SEARCHES: readonly { tier: number; seed: string; k: number; part: number }[] = [
  // These three find a level within PART_BUDGET.
  { tier: 3, seed: 'bench2', k: 0, part: 3_000_000 },
  { tier: 6, seed: 'bench0', k: 0, part: 3_000_000 },
  { tier: 7, seed: 'bench1', k: 0, part: 3_000_000 },
  { tier: 1, seed: 'same0', k: 0, part: 400_000 },
  { tier: 2, seed: 'same1', k: 1, part: 400_000 },
  { tier: 4, seed: 'same3', k: 0, part: 400_000 },
  { tier: 5, seed: 'same4', k: 2, part: 400_000 },
  { tier: 8, seed: 'same7', k: 0, part: 400_000 },
  { tier: 9, seed: 'same8', k: 1, part: 400_000 },
  { tier: 10, seed: 'same9', k: 3, part: 400_000 },
];

export interface CampaignAnswer { id: string; d: Difficulty; useless: string[]; purpose: string[]; threat: Threat }
export interface BankAnswer { i: number; d: Difficulty; gate: string[] }
export interface SearchAnswer { tier: number; seed: string; k: number; part: number; found: unknown; tries: number; spent: number }
export interface Shard { campaign: CampaignAnswer[]; bank: BankAnswer[]; searches: SearchAnswer[] }

export function campaignAnswer(id: string, text: string): CampaignAnswer {
  const level = parse(text);
  const d = measure(level);
  return { id, d, useless: uselessProblems(level, d), purpose: purposeProblems(level, d), threat: threatOf(level, d) };
}

export function bankAnswer(i: number, known: Known): BankAnswer {
  const b = BANK[i]!;
  const level = parse(b.text);
  const d = measure(level);
  const gate = gateProblems(level, d, { band: { least: floorOf(b.chapter).explored, most: PLATEAU.most, plateau: true }, previous: null }, known);
  return { i, d, gate };
}

export function searchAnswer(s: (typeof SEARCHES)[number], known: Known): SearchAnswer {
  const first = fromBank(BANK, { seed: s.seed, tier: s.tier, depth: 1, run: [] }, bandAfter(null, false)!);
  const req = { seed: s.seed, tier: s.tier, depth: 2, run: [{ text: first.text, explored: first.explored }], budget: s.part * 12 };
  const r = makePart(req, s.k, known);
  return { ...s, found: r.found, tries: r.tries, spent: r.spent };
}

/** Shard `k`'s answers, from the engine as it is now; `each` hears each one as it is made. */
export function shardAnswers(k: number, each: (what: string) => void = () => {}): Shard {
  const known = knownOf(campaignLevels());
  const out: Shard = { campaign: [], bank: [], searches: [] };
  CAMPAIGN_TEXTS.forEach((t, i) => { if (i % SHARDS === k) { out.campaign.push(campaignAnswer(t.id, t.text)); each(`campaign ${t.id}`); } });
  BANK.forEach((_, i) => { if (i % SHARDS === k) { out.bank.push(bankAnswer(i, known)); each(`bank ${i}`); } });
  SEARCHES.forEach((s, i) => { if (i % SHARDS === k) { out.searches.push(searchAnswer(s, known)); each(`search ${s.tier}/${s.seed}/${s.k}`); } });
  return out;
}

export const shardFile = (k: number): string => new URL(`./engine-same/shard-${k}.json`, import.meta.url).pathname;
