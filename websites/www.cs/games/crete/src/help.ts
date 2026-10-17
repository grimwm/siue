/* The Island of Crete: the "How to play" lines. Key names come from the key
 * table and the tools' own keys, so the text can never disagree with a
 * binding. DOM-free. */
import type { Action, KeyDef } from "./keys.ts";

/** A run of plain text, or one in bold. */
export type Seg = string | { strong: string };

export function helpLines(keys: Record<Action, KeyDef>, itemKeys: readonly string[]): Seg[][] {
  const k = (a: Action): string => keys[a].label;
  return [
    ["Reach the ", { strong: "exit 🚪" }, " alive. The Minotaur 👹 moves ", { strong: "twice" }, " per move you make."],
    [
      { strong: "Safe zones 🛡️" },
      " block the Minotaur. Catch your breath there — but lingering beside it still burns 2 HP a turn.",
    ],
    [
      { strong: "Barriers 🚧" },
      " block corridors. Grab a ",
      { strong: "🔌 fuse" },
      " and walk into one to blow it open (+40). Nothing ever pauses.",
    ],
    [
      { strong: `Bash (${k("bash")})` },
      " shoves the adjacent Minotaur backwards. It costs your turn and needs 3 turns to recharge.",
    ],
    [
      "Grab ",
      { strong: "tools 🔮🥣📻" },
      " and ",
      { strong: "script pages 📄" },
      `. Use a tool with ${itemKeys.join(" / ")}; it costs your turn, so the Minotaur still moves twice, unless a Mirror Shard freezes it. Three pages earn the True Ending.`,
    ],
    [
      "Move with the arrow keys or WASD; bumping a wall costs no turn. Stuck? ",
      { strong: `Hint (${k("hint")})` },
      " flashes one step. ",
      { strong: `Route (${k("route")})` },
      " reveals the whole route. ",
      { strong: `Auto (${k("auto")})` },
      " plays for you. ",
      { strong: k("mute") },
      " toggles sound, ",
      { strong: k("new") },
      " starts a new run, and ",
      { strong: k("menu") },
      " opens this menu and closes whatever is open.",
    ],
  ];
}
