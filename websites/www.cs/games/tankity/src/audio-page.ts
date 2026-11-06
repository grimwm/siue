/* Operation Tankity: sound follows the page. Hidden, frozen or leaving, the
 * page goes silent (the context is suspended, media elements paused, the media
 * session cleared); visible again, only what the settings call for resumes.
 * In a frame on another page, the player clicking out of the frame silences it
 * too (kit audio-focus.ts), and clicking back in brings it back. */

import { followPage } from '../../_kit/page-life.ts';
import type { PageTargets } from '../../_kit/page-life.ts';
import { followFocus } from '../../_kit/audio-focus.ts';
import type { FocusTargets } from '../../_kit/audio-focus.ts';
import { pageHide, pageVisible, pageClose, frameAway } from './audio.ts';

interface Targets extends PageTargets {
  doc: PageTargets['doc'] & FocusTargets['doc'] & Pick<Document, 'querySelectorAll'>;
  win: PageTargets['win'] & FocusTargets['win'];
  timers: FocusTargets['timers'];
  nav?: { mediaSession?: { metadata: unknown; playbackState: string } };
}

/** Silences every media element the page holds and clears the media session. */
function silenceMedia(t: Targets): void {
  try {
    t.doc.querySelectorAll('audio,video').forEach(el => { (el as HTMLMediaElement).pause(); });
  } catch (_) { /* no DOM */ }
  const ms = t.nav?.mediaSession;
  if (ms) {
    try { ms.metadata = null; ms.playbackState = 'none'; } catch (_) { /* unsupported */ }
  }
}

export function installAudioPage(t: Targets): void {
  followPage(t, { hide: () => { pageHide(); silenceMedia(t); }, show: pageVisible, close: pageClose });
  // In a frame on another page, clicking out of it is as quiet as a hidden page.
  followFocus(t, { away: () => frameAway(true), back: () => frameAway(false) });
}
