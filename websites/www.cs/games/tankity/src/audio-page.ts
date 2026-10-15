/* Operation Tankity: sound follows the page. Hidden, frozen or leaving, the
 * page goes silent (the context is suspended, media elements paused, the media
 * session cleared); visible again, only what the settings call for resumes. */

import { pageHide, pageVisible, pageClose } from './audio.ts';

interface Targets {
  doc: Pick<Document, 'addEventListener' | 'querySelectorAll'> & { visibilityState: string };
  win: Pick<Window, 'addEventListener'>;
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
  const hide = (): void => { pageHide(); silenceMedia(t); };
  const show = (): void => { if (t.doc.visibilityState !== 'hidden') pageVisible(); };
  t.doc.addEventListener('visibilitychange', () => { if (t.doc.visibilityState === 'hidden') hide(); else show(); });
  t.doc.addEventListener('freeze', hide);
  t.doc.addEventListener('resume', show);
  t.win.addEventListener('pagehide', e => {
    hide();
    if ((e as PageTransitionEvent).persisted === false) pageClose();
  });
  t.win.addEventListener('pageshow', show);
  if (t.doc.visibilityState === 'hidden') hide();
}
