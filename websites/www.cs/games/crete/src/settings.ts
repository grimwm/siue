/* The Island of Crete: the settings a player keeps in this browser, on the
 * kit's prefs. Storage that is blocked or missing degrades to the session. */
import { pref, oneOf } from "../../_kit/prefs.ts";
import type { Pref } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export type OnOff = "on" | "off";
export const SOUND_KEY = "crete-sound";
export const MUSIC_KEY = "crete-music";
export const MUSIC_HIDDEN_KEY = "crete-music-hidden";
export const FULLSCREEN_KEY = "crete-fullscreen";
export const LOOK_KEY = "crete-look";
export const WALLS_KEY = "crete-walls";
export const VIEW_KEY = "crete-view";

/** How the board is drawn: the painted 3D look, or the flat tiles. */
export type Look = "modern" | "classic";
/** How the modern look draws the walls that stand in front of the player. */
export type WallMode = "solid" | "ghosted" | "low";
/** How the modern camera looks at the board: at 45° (Angled), or straight down like the classic look (Top-down). */
export type View = "angled" | "top";

export interface Settings {
  sound: Pref<OnOff>;
  /** The title theme; Sound off silences it too. */
  music: Pref<OnOff>;
  /** Whether the music goes on while the page is hidden (a background tab). */
  musicHidden: Pref<OnOff>;
  /** Whether the player was in full screen last; Play goes back there. */
  fullscreen: Pref<OnOff>;
  look: Pref<Look>;
  /** Only the modern look has walls to show. */
  walls: Pref<WallMode>;
  /** Only the modern look has a camera to tilt. */
  view: Pref<View>;
}

export function createSettings(storage: StorageLike | null): Settings {
  return {
    sound: pref<OnOff>(SOUND_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    music: pref<OnOff>(MUSIC_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    musicHidden: pref<OnOff>(MUSIC_HIDDEN_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    fullscreen: pref<OnOff>(FULLSCREEN_KEY, "off", oneOf<OnOff>(["on", "off"], "off"), storage),
    look: pref<Look>(LOOK_KEY, "modern", oneOf<Look>(["modern", "classic"], "modern"), storage),
    walls: pref<WallMode>(WALLS_KEY, "solid", oneOf<WallMode>(["solid", "ghosted", "low"], "solid"), storage),
    view: pref<View>(VIEW_KEY, "top", oneOf<View>(["angled", "top"], "top"), storage),
  };
}
