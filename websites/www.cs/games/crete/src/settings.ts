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
export const PAD_KEY = "crete-pad";
export const MINIMAP_KEY = "crete-minimap";
export const HELP_BUILD_KEY = "crete-help-build";
/** The switch's earlier key, on by default: only an "off" the player chose there is carried over. */
export const HELP_CHECK_KEY = "crete-help-check";

/** Help Build Endless Levels: on or off as the player answered, unset (off) until they do. */
export type HelpBuild = "on" | "off" | "unset";

/** How the board is drawn: the painted 3D look, or the flat tiles. */
export type Look = "modern" | "classic";
/** How the modern look draws the walls that stand in front of the player. */
export type WallMode = "solid" | "ghosted" | "low";
/** The edge of the strip the arrows stand at; the other buttons take the other side. */
export type PadSide = "left" | "right";

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
  pad: Pref<PadSide>;
  /** Only the modern look shows the mini map, and only when this is on. */
  minimap: Pref<OnOff>;
  /** Whether this device helps build Endless levels: sends the levels it makes up to the shared bank and checks
   *  levels other players made in its spare time (src/endless/shared.ts, src/endless/verifier.ts). Unset until the
   *  player answers, and unset is off. */
  helpBuild: Pref<HelpBuild>;
}

export function createSettings(storage: StorageLike | null): Settings {
  migrateHelpCheck(storage);
  return {
    sound: pref<OnOff>(SOUND_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    music: pref<OnOff>(MUSIC_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    musicHidden: pref<OnOff>(MUSIC_HIDDEN_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    fullscreen: pref<OnOff>(FULLSCREEN_KEY, "off", oneOf<OnOff>(["on", "off"], "off"), storage),
    look: pref<Look>(LOOK_KEY, "modern", oneOf<Look>(["modern", "classic"], "modern"), storage),
    walls: pref<WallMode>(WALLS_KEY, "ghosted", oneOf<WallMode>(["solid", "ghosted", "low"], "ghosted"), storage),
    pad: pref<PadSide>(PAD_KEY, "left", oneOf<PadSide>(["left", "right"], "left"), storage),
    minimap: pref<OnOff>(MINIMAP_KEY, "off", oneOf<OnOff>(["on", "off"], "off"), storage),
    helpBuild: pref<HelpBuild>(HELP_BUILD_KEY, "unset", oneOf<HelpBuild>(["on", "off", "unset"], "unset"), storage),
  };
}

/** The old Help Check switch was on by default, so a stored "on" is no answer and is dropped; an "off" the player
 *  chose stays off. The old key goes either way. */
function migrateHelpCheck(storage: StorageLike | null): void {
  try {
    const old = storage?.getItem(HELP_CHECK_KEY);
    if (old == null) return;
    if (old === "off" && storage?.getItem(HELP_BUILD_KEY) == null) storage?.setItem(HELP_BUILD_KEY, "off");
    storage?.removeItem(HELP_CHECK_KEY);
  } catch {
    // Storage that refuses keeps the default: unset, which is off.
  }
}
