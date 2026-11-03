/* The Island of Crete: Endless's Web Worker (dist/endless-worker.js), started by src/endless/client.ts. It runs
 * src/endless/host.ts with the bank and the campaign's layouts, so the generator never runs on the page. */
import { createEndlessHost } from './endless/host.ts';
import type { ToEndless } from './endless/host.ts';
import { BANK } from './endless/bank.ts';
import { knownOf } from './endless/gate.ts';
import { campaignLevels } from './endless/campaign.ts';

const host = createEndlessHost({
  post: m => self.postMessage(m),
  bank: BANK,
  known: () => knownOf(campaignLevels()),
  now: () => performance.now(),
});
self.onmessage = (e: MessageEvent<ToEndless>) => host.receive(e.data);
