/* Operation Tankity: full screen when a phone or tablet starts playing.
 *
 * On a touch device the browser's own bars take a slice of a landscape screen,
 * so each tap that starts a match (Play, Play with friends, hosting or joining
 * a room, the Tutorial) asks for full screen on the game's frame. The request
 * must be made inside the tap, so callers invoke this first thing in the
 * handler. It never throws: a browser that refuses (iPhone Safari has no
 * fullscreen API for pages) simply stays as it is, and a player who leaves
 * full screen is not pulled back, only asked again on the next tap. The
 * orientation is never locked: the game plays in either. */
import { enterFullscreen } from '../../_kit/app.ts';
import type { AppEnv } from '../../_kit/app.ts';

/** `touch` is asked at the tap, since a physical key turns the touch rule off. */
export function fullscreenForPlay(touch: () => boolean, env: AppEnv, frame: Element | null): void {
  if (!touch() || !frame) return;
  void enterFullscreen(env, frame);
}

interface WebkitElement { requestFullscreen?: unknown; webkitRequestFullscreen?: () => void | Promise<void> }
export interface WebkitDocument { webkitFullscreenElement?: Element | null }

/** The env with the webkit-prefixed fullscreen API as the fallback (older Safari and iPadOS). */
export function withWebkitFullscreen(base: AppEnv, doc: WebkitDocument): AppEnv {
  return {
    ...base,
    fullscreenElement: () => base.fullscreenElement() ?? doc.webkitFullscreenElement ?? null,
    requestFullscreen: el => {
      const e = el as WebkitElement;
      if (typeof e.requestFullscreen === 'function') return base.requestFullscreen(el);
      if (typeof e.webkitRequestFullscreen === 'function') return Promise.resolve(e.webkitRequestFullscreen());
      return Promise.reject(new Error('no fullscreen'));
    },
  };
}
