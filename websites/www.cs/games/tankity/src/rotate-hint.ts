// games/tankity/src/rotate-hint.ts
/* Operation Tankity: when the "turn sideways" chip shows (spec 6.6). DOM-free. */
export const ROTATE_HINT_KEY = 'tankity-rotate-hint';
export function rotateHintShows(s: { portrait: boolean; dismissed: boolean; playing: boolean }): boolean {
  return s.portrait && s.playing && !s.dismissed;
}
