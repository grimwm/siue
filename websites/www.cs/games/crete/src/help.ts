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
    [{ strong: "Safe zones 🛡️" }, " keep the Minotaur out. Hearts are all you have. Each honey cake adds one, with no limit, even past the three you began with; extra hearts last until the level ends, and every level starts at three."],
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
      "You pick the modern board or the classic tiles when you start a new game; the ", { strong: `Map (${k("look")})` },
      " button under the board swaps between them in one press, its picture showing the squares round Theseus in the other look, and Theseus plays on in either. ",
      { strong: "Walls" }, " (modern only) draws the walls in front of you solid, ghosted or low. On the modern board in Angled, two fingers twist to turn it and slide up or down together to tilt it toward straight down; two fingers drag to pan and pinch to zoom. With a mouse, drag with the left button to turn (across) and tilt (up and down), drag with the right or middle button to pan, and use the wheel to zoom. When you let go the view squares up to the nearest quarter turn. The compass in the corner points north; a tap on it, a double tap or a double click brings back the starting view. The arrows and the pad move him the way the screen shows. With ", { strong: "Mini Map" }, " on in this menu, the whole level shows in a corner of the modern board, and a tap on it looks there.",
    ],
    [
      "Every card works from the keyboard. ", { strong: `${k("up")} ${k("down")}` },
      " (or J and K) move between its buttons and Enter or Space presses the focused one; in the level list ",
      { strong: `${k("left")} ${k("right")}` }, " switch chapters. On the title card ",
      { strong: k("story") }, " opens the story, ", { strong: k("editor") }, " makes a level and ", { strong: k("menu") }, " opens the settings; in this menu ",
      { strong: k("fullscreen") }, " toggles Full Screen, ", { strong: k("lore") }, " opens the Lore Book and ", { strong: k("dictionary") },
      " the Dictionary. A story page you take opens in the Lore Book at once; Enter, Space or ",
      { strong: k("menu") }, " closes it and play goes on.",
    ],
    [
      "The first time you pick up a kind of thing, or step on or into a tile that does something (a button, a teleport, a snare, a bomb, a hidden wall), a card says what it is and what it does; Enter, Space or ",
      { strong: k("menu") }, " closes it. After that it shows a short banner. The ", { strong: "Dictionary" },
      " in this menu lists what you carry now (", { strong: "Backpack" }, ") and every item and tile (", { strong: "Entries" }, ").",
    ],
    [
      { strong: "Music" }, " in this menu turns the music off, and ", { strong: "Music in the background" }, " whether it goes on while this tab is hidden; ",
      { strong: k("mute") }, " silences everything. ",
      "The title theme plays on every screen. It was made for the game, with samples from ",
      "VSCO-2 Community Edition by Versilian Studios (CC0), the organ sampled by Simon Dalzell of Ivy Audio.",
    ],
  ];
}
