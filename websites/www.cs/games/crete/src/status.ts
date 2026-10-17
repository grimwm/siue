/* The Island of Crete: the words of the status bar, short enough for a phone.
 * The long form of the Minotaur's distance is `foeNote`, for a tooltip and a
 * screen reader. DOM-free. */
export interface StatusInput {
  hp: number;
  maxHp: number;
  turns: number;
  pages: number;
  totalPages: number;
  score: number;
  fuses: number;
  /** Turns until Bash is ready again; 0 when ready. */
  bashCd: number;
  /** Turns the creature stays frozen; 0 when it moves. */
  frozen: number;
  inSafe: boolean;
  /** Steps from the player to the creature; -1 when there is no way. */
  foeDist: number;
}

export interface StatusView {
  hp: string;
  turns: string;
  pages: string;
  score: string;
  fuses: string;
  bash: string;
  foe: string;
  foeNote: string;
}

export function statusView(i: StatusInput): StatusView {
  let foe: string;
  let foeNote: string;
  if (i.frozen > 0) {
    foe = `❄ ${i.frozen}`;
    foeNote = `frozen solid (${i.frozen} turn${i.frozen === 1 ? "" : "s"})`;
  } else if (i.inSafe) {
    foe = "safe";
    foeNote = "pacing outside your safe zone";
  } else if (i.foeDist < 0) {
    foe = "?";
    foeNote = "lost in the static";
  } else {
    foe = String(i.foeDist);
    foeNote = `${i.foeDist} step${i.foeDist === 1 ? "" : "s"} away — and it moves twice`;
  }
  return {
    hp: `${i.hp}/${i.maxHp}`,
    turns: String(i.turns),
    pages: `${i.pages}/${i.totalPages}`,
    score: String(i.score),
    fuses: String(i.fuses),
    bash: i.bashCd > 0 ? String(i.bashCd) : "ready",
    foe,
    foeNote,
  };
}
