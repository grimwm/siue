/* The Island of Crete: the settings a player keeps in this browser, on the
 * kit's prefs. Storage that is blocked or missing degrades to the session. */
import { pref, oneOf } from "../../_kit/prefs.ts";
import type { Pref } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export type OnOff = "on" | "off";
export const SOUND_KEY = "crete-sound";
export const FULLSCREEN_KEY = "crete-fullscreen";

export interface Settings {
  sound: Pref<OnOff>;
  /** Whether the player was in full screen last; Play goes back there. */
  fullscreen: Pref<OnOff>;
}

export function createSettings(storage: StorageLike | null): Settings {
  return {
    sound: pref<OnOff>(SOUND_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    fullscreen: pref<OnOff>(FULLSCREEN_KEY, "off", oneOf<OnOff>(["on", "off"], "off"), storage),
  };
}
