/* The Island of Crete: the "How to play" lines. Key names come from
 * the key table and the tools' own keys, so the text can never disagree with
 * a binding. DOM-free. */
import type { Action, KeyDef } from "./keys.ts";
import type { TOOLS } from "./puzzle/tiles.ts";

/** A run of plain text, or one in bold. */
export type Seg = string | { strong: string };

export function helpLines(keys: Record<Action, KeyDef>, tools: typeof TOOLS): Seg[][] {
  const k = (a: Action): string => keys[a].label;
  const moves: Action[] = ["up", "left", "down", "right"];
  const arrows = moves.map(k).join(" ");
  const letters = moves.flatMap((a) => keys[a].keys.filter((x) => x.length === 1)).map((x) => x.toUpperCase()).join(" ");
  const toolSegs: Seg[] = [];
  for (const t of Object.values(tools)) toolSegs.push({ strong: `${t.name} (${t.key})` }, ` ${t.desc} `);
  return [
    [
      "Gather every ", { strong: "relic ✦" }, ": the ", { strong: "gate" },
      " opens when you take the last one. Then walk out through the ", { strong: "exit 🚪" }, ".",
    ],
    [
      "The ", { strong: "Minotaur 👹" }, " takes ", { strong: "two steps" },
      " for every move you make. Each step goes along the horizontal gap if that cell is open to it, else along the vertical gap. If it reaches you, you lose a heart.",
    ],
    [{ strong: "Safe zones 🛡️" }, " keep the Minotaur out. Hearts are all you have; none grow back unless you eat a honey cake."],
    [{ strong: "Keys 🔑" }, " open the door of their own colour. Red, blue and yellow keys are used up; a green key is kept."],
    [
      { strong: "Water" }, " needs flippers, ", { strong: "fire" }, " needs fire boots, ",
      { strong: "ice" }, " sends you sliding unless you wear skates, and ", { strong: "force floors" },
      " push you along unless you wear suction boots.",
    ],
    [
      { strong: "Blocks" }, " can be pushed. Stepping on a ", { strong: "button" },
      ", or pushing a block onto one, flips every toggle wall. Stone blocks everyone.",
    ],
    [
      { strong: "Daedalus's snare" }, " holds whoever steps in it until a ", { strong: "brown button" },
      " is pressed down, and only while something stands on it: you, a block or a hazard.",
    ],
    [
      { strong: "Pop-up walls" }, " rise behind you. ", { strong: "Fake walls" }, " and ", { strong: "invisible walls" },
      " open or show when you bump them. Only you can cross ", { strong: "gravel" }, ".",
    ],
    [
      { strong: "Teleports" }, " carry you to the next one in reading order. A ", { strong: "thief" },
      " takes all your gear (flippers, fire boots, skates and suction boots), never keys or tools.",
    ],
    [
      { strong: "Bombs" }, " cost a heart if you step on one, and destroy any block or hazard that meets one. ", { strong: "Clone machines" },
      " copy what stands in them when a ", { strong: "red button" }, " is pressed.",
    ],
    [
      "The ", { strong: "Bronze ball" }, " rolls straight and turns back, the ", { strong: "Harpy" },
      " crosses water, and ", { strong: "Talos's fire" }, " burns. Each turn goes you, then the hazards, then the Minotaur. Any catch costs a heart and throws you back to your last safe zone; a hazard standing where you land is sent home to its start.",
    ],
    ["Three tools, one use each. ", ...toolSegs],
    [
      `Move with ${arrows}${letters ? ` or ${letters}` : ""}; bumping a wall costs no turn. `,
      { strong: `Begin (${k("begin")})` }, " closes a level's start card; so does a move. ",
      { strong: `Wait (${k("wait")})` }, " lets the Minotaur come. ",
      { strong: `Undo (${k("undo")})` }, " takes back a move. ",
      { strong: `Restart (${k("restart")})` }, " begins the level again.",
    ],
    [
      "Stuck? ",
      { strong: `Hint (${k("hint")})` }, " plays one step of the thread. ",
      { strong: `Route (${k("route")})` }, " draws the whole thread. ",
      { strong: `Auto (${k("auto")})` }, " plays it for you. ",
      { strong: k("mute") }, " toggles sound, ",
      { strong: k("new") }, " opens the level list, and ",
      { strong: k("menu") }, " opens this menu and closes whatever is open.",
    ],
    [
      { strong: "Look" }, " in this menu picks the modern board or the classic tiles; ", { strong: "Walls" },
      " (modern only) draws the walls in front of you solid, ghosted or low. On the modern board one finger or the left mouse button turns it, two fingers or the right or middle button pan it, and a double tap or double click brings the view back to Theseus.",
    ],
    [
      "Every card works from the keyboard. ", { strong: `${k("up")} ${k("down")}` },
      " (or J and K) move between its buttons and Enter or Space presses the focused one; in the level list ",
      { strong: `${k("left")} ${k("right")}` }, " switch chapters. On the title card ",
      { strong: k("story") }, " opens the story, ", { strong: k("editor") }, " makes a level and ", { strong: k("menu") }, " opens the settings; in this menu ",
      { strong: k("fullscreen") }, " toggles full screen and ", { strong: k("lore") }, " opens the Lore book. A story page you take opens in the Lore book at once; Enter, Space or ",
      { strong: k("menu") }, " closes it and play goes on.",
    ],
    [
      { strong: "Music" }, " in this menu turns the music off, and ", { strong: "Music in the background" }, " whether it goes on while this tab is hidden; ",
      { strong: k("mute") }, " silences everything. ",
      "The title theme plays on every screen. It was made for the game, with samples from ",
      "VSCO-2 Community Edition by Versilian Studios (CC0), the organ sampled by Simon Dalzell of Ivy Audio.",
    ],
  ];
}
