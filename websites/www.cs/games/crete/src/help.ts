/* The Island of Crete, trials: the "How to play" lines. Key names come from
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
      "Gather every ", { strong: "relic ✦" }, ", then step onto the ", { strong: "gate" },
      " to open the way, and walk out through the ", { strong: "exit 🚪" }, ".",
    ],
    [
      "The ", { strong: "Minotaur 👹" }, " takes ", { strong: "two steps" },
      " for every move you make, and always closes the distance by the longer way first. If it reaches you, you lose a heart.",
    ],
    [{ strong: "Safe zones 🛡️" }, " keep the Minotaur out. Hearts are all you have; none grow back unless you eat a honey cake."],
    [{ strong: "Keys 🔑" }, " open the door of their own colour, and are used up. Pick them up on the way."],
    [
      { strong: "Water" }, " needs flippers, ", { strong: "fire" }, " needs fire boots, ",
      { strong: "ice" }, " sends you sliding unless you wear skates, and ", { strong: "force floors" },
      " push you along unless you wear suction boots.",
    ],
    [
      { strong: "Blocks" }, " can be pushed; set one on a ", { strong: "button" },
      " to open what it holds shut. Stone blocks everyone.",
    ],
    ["Three tools, one use each. ", ...toolSegs],
    [
      `Move with ${arrows}${letters ? ` or ${letters}` : ""}; bumping a wall costs no turn. `,
      { strong: `Wait (${k("wait")})` }, " lets the Minotaur come. ",
      { strong: `Undo (${k("undo")})` }, " takes back a move. ",
      { strong: `Restart (${k("restart")})` }, " begins the trial again.",
    ],
    [
      "Stuck? ",
      { strong: `Hint (${k("hint")})` }, " flashes one step. ",
      { strong: `Route (${k("route")})` }, " draws the whole thread. ",
      { strong: `Auto (${k("auto")})` }, " plays it for you. ",
      { strong: k("mute") }, " toggles sound, ",
      { strong: k("new") }, " opens the trial list, and ",
      { strong: k("menu") }, " opens this menu and closes whatever is open.",
    ],
  ];
}
