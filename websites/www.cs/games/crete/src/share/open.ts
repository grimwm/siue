/* The Island of Crete: opening a share link. A link is trusted only once its line has been played: it decodes within
 * link.ts's limits, then the line replays on the engine from the level's start and must still be `playing` before
 * each move and `won` after the last. Anything else is damaged. DOM-free. */
import { decodeLink } from './link.ts';
import type { Shared, LinkError } from './link.ts';
import { levelCode, sharedName } from './name.ts';
import { initial } from '../puzzle/state.ts';
import { step } from '../puzzle/step.ts';

/** The shared level, and the name it goes by, when the fragment decodes and its line wins; otherwise why not. */
export async function openLink(fragment: string): Promise<{ ok: true; shared: Shared; name: string } | { ok: false; error: LinkError }> {
  const decoded = await decodeLink(fragment);
  if (!decoded.ok) return decoded;
  const { shared } = decoded;
  let state = initial(shared.level);
  for (const action of shared.line) {
    if (state.outcome !== 'playing') return { ok: false, error: 'damaged' };
    state = step(state, action).state;
  }
  if (state.outcome !== 'won') return { ok: false, error: 'damaged' };
  return { ok: true, shared, name: sharedName(await levelCode(shared.text), shared.initials) };
}
