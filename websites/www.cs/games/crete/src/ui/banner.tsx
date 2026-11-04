// The Island of Crete: the banner, at the top of the board. A later pickup, or a later touch of an active tile, slides
// it in with each thing's picture, name and a reminder of what it does; going on to the next level slides it in with
// a line saying the hearts are back to three. src/ui.ts takes it away after BANNER_MS (src/notices.ts). It is a live
// region that takes no pointer and no focus, so play goes on under it. Under it stands the rule tip, if one is
// (src/rule-tips.ts): a line and Got It, the only part that takes a pointer. It holds play until it is put away
// (src/ui.ts): Got It, Enter or Space.
import { render } from 'preact';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { Entry } from '../dictionary.ts';
import { Picture } from './sprite.tsx';
import type { Pics } from './sprite.tsx';
import type { Tip } from '../rule-tips.ts';

export interface BannerProps {
  entries: readonly Entry[];
  /** A line of words instead, with a heart (the hearts back to three on going on to a level). */
  line?: string | null;
  /** Counts the banners shown: a new one starts its slide again. */
  seq: number;
  pics: Pics;
  /** The rule tip standing, if one is, and Got It. */
  tip?: Tip | null;
  onTip?: () => void;
}

export function Banner(p: BannerProps) {
  return (
    <div id="banner" class="banner" role="status" aria-live="polite">
      {p.line && (
        <div key={p.seq} class="banner-box">
          <p class="banner-row banner-hearts" id="banner-hearts"><span class="banner-heart" aria-hidden="true">♥</span><span>{p.line}</span></p>
        </div>
      )}
      {!p.line && p.entries.length > 0 && (
        <div key={p.seq} class="banner-box">
          {p.entries.map(e => (
            <p key={e.id} class="banner-row" data-entry={e.id}>
              <Picture pics={p.pics} entry={e} size={28} />
              <span class="banner-name">{e.name}</span>
              <span class="banner-short">{e.short}</span>
              {e.key && <KeyChip label={e.key} />}
            </p>
          ))}
        </div>
      )}
      {p.tip && (
        <div key={p.tip.id} id="tip" class="tip-box" data-tip={p.tip.id}>
          <p id="tip-text" class="tip-text">{p.tip.text}</p>
          <button type="button" id="tip-ok" class="tip-ok" onClick={p.onTip}>Got It</button>
        </div>
      )}
    </div>
  );
}

export function renderBanner(root: Element, props: BannerProps): void {
  render(<Banner {...props} />, root);
}
