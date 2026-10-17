/* The Island of Crete: what to tell the player when the Fullscreen toggle
 * does not go full screen. DOM lib program (it names the kit's app types). */
import type { FullscreenToggle } from "../../_kit/app.ts";

export function fullscreenNote(outcome: FullscreenToggle): string | null {
  if (outcome === "unsupported") return "Full screen is not supported in this browser.";
  if (outcome === "refused") return "Full screen is not available right now.";
  return null;
}
