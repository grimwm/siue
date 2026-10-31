// The Island of Crete: the banner. A later pickup slides it in at the top of the board with each thing's picture,
// name and a reminder of what it does; src/ui.ts takes it away after BANNER_MS (src/notices.ts). It is a live region that takes no
// pointer and no focus, so play goes on under it.
import { render } from 'preact';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { Atlas } from '../board-plan.ts';
import type { Entry } from '../dictionary.ts';
import { Sprite } from './sprite.tsx';

export interface BannerProps {
  entries: readonly Entry[];
  /** Counts the banners shown: a new one starts its slide again. */
  seq: number;
  atlas: Atlas;
}

export function Banner(p: BannerProps) {
  return (
    <div id="banner" class="banner" role="status" aria-live="polite">
      {p.entries.length > 0 && (
        <div key={p.seq} class="banner-box">
          {p.entries.map(e => (
            <p key={e.id} class="banner-row" data-entry={e.id}>
              <Sprite atlas={p.atlas} name={e.sprite} size={28} />
              <span class="banner-name">{e.name}</span>
              <span class="banner-short">{e.short}</span>
              {e.key && <KeyChip label={e.key} />}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function renderBanner(root: Element, props: BannerProps): void {
  render(<Banner {...props} />, root);
}
