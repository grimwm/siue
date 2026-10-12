// Whether the coach has been seen. Storage that is missing or cannot be read
// counts as seen: with nowhere to remember a skip, the coach must never nag.
import type { StorageLike } from '../../_kit/ports.ts';

export function tutorialSeen(storage: StorageLike | null): boolean {
  try {
    return storage === null || storage.getItem('tankity-tutorial') === 'done';
  } catch {
    return true;
  }
}
