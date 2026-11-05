/* The Island of Crete: one worker thread of tools/generate-bank.ts. It runs the one part each tuple names with this
 * checkout's generator (provenance.ts's regenerate, the same call the verifiers make) and posts back the level it
 * made, or null when the part made none. */
import { parentPort } from 'node:worker_threads';
import { regenerate } from '../src/endless/provenance.ts';
import type { Tuple } from '../src/endless/provenance.ts';
import { knownOf } from '../src/endless/gate.ts';
import type { Known } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';

let known: Known | null = null;
parentPort?.on('message', (m: { id: number; tuple: Tuple }) => {
  known ??= knownOf(campaignLevels());
  let found = null;
  try { found = regenerate(m.tuple, known); } catch { found = null; }
  parentPort?.postMessage({ id: m.id, found });
});
