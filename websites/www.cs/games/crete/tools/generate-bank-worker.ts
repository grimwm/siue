/* The Island of Crete: one worker thread of tools/generate-bank.ts. It runs the one part each tuple names with this
 * checkout's generator (provenance.ts's remake, the call the verifiers make through regenerate), a grown tuple's
 * climb included, and posts back the level it made, or null when the part made none, and whether it was grown; asked
 * for a child, it climbs a Medium level toward Hard too (provenance.ts's childOf) and posts the Hard child with its
 * own tuple when the climb reached Hard's band. */
import { parentPort } from 'node:worker_threads';
import { remake } from '../src/endless/provenance.ts';
import type { Tuple } from '../src/endless/provenance.ts';
import { knownOf } from '../src/endless/gate.ts';
import type { Known } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';

let known: Known | null = null;
parentPort?.on('message', (m: { id: number; tuple: Tuple; child?: boolean }) => {
  known ??= knownOf(campaignLevels());
  let r: ReturnType<typeof remake> = { made: null, grown: false, child: null };
  try { r = remake(m.tuple, known, undefined, m.child === true); } catch { /* none made */ }
  parentPort?.postMessage({ id: m.id, found: r.made, grown: r.grown, child: r.child });
});
