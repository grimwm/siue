/* Operation Tankity: sound follows the page. Hidden, frozen or leaving, the
 * page goes silent (the context is suspended, media elements paused, the media
 * session cleared); visible again, only what the settings call for resumes. */

import { followPage } from '../../_kit/page-life.ts';
import type { PageTargets } from '../../_kit/page-life.ts';
import { pageHide, pageVisible, pageClose } from './audio.ts';

interface Targets extends PageTargets {
  doc: PageTargets['doc'] & Pick<Document, 'querySelectorAll'>;
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
}
