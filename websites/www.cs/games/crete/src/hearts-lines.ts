/* The Island of Crete: what the banner says when Theseus goes on to the next level from inside the game (the end
 * card's Next, or a chapter's closing card going on), where his hearts are back to three: one line of HEARTS_LINES,
 * picked at random, never the one shown last. Add a line to the list to widen the pool. DOM-free. */

export const HEARTS_LINES: readonly string[] = [
  "Ariadne's thread steadies you: three hearts again.",
  'You catch your breath in the dark. Three hearts.',
  'The halls fall quiet a moment. Three hearts, and on.',
  'You think of Athens and stand taller. Three hearts.',
  'A cool draught from the deep. Three hearts again.',
  'The thread tugs gently at your wrist: three hearts.',
  'You bind your wounds by torchlight. Three hearts.',
  'Somewhere above, the sea. Three hearts, Theseus.',
  'The beast is far off, for now. Back to three hearts.',
  'Ariadne waits beyond the gate. Three hearts, and onward.',
];

/** The index of the next line: `rng` in [0, 1) picks one, and the one shown `last` steps aside for its neighbour. */
export function nextLine(rng: () => number, last: number, count = HEARTS_LINES.length): number {
  const i = Math.min(count - 1, Math.floor(rng() * count));
  return count > 1 && i === last ? (i + 1) % count : i;
}
