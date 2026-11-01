// How the editor lines notes up with the beat: "Tidy To" for Play Live's starts, "Line Up To" for the grid, both a
// note value (1/4, 1/8, 1/16) or Off; and a held key's length, snapped to the nearest of the lengths a player means.
// Lengths and starts are in the tempo's beats; `quarter` is how many of them make a quarter note (beats.ts). DOM-free.
export const GRIDS = ['1/4', '1/8', '1/16', 'off'] as const;
export type Grid = (typeof GRIDS)[number];
export const GRID_LABELS: Readonly<Record<Grid, string>> = { '1/4': '1/4', '1/8': '1/8', '1/16': '1/16', off: 'Off' };

/** A held key's length snaps to the nearest of these, in beats. */
export const HELD_LENGTHS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4] as const;

/** The grid's step in beats; 0 for Off. */
export function gridBeats(grid: Grid, quarter: number): number {
  return grid === 'off' ? 0 : (quarter * 4) / Number(grid.slice(2));
}

/** `beat` on the nearest line of the grid (never before 0); unchanged for Off. */
export function snapStart(beat: number, grid: Grid, quarter: number): number {
  const step = gridBeats(grid, quarter);
  return Math.max(0, step === 0 ? beat : Math.round(beat / step + 1e-9) * step);
}

/** The nearest of HELD_LENGTHS to `beats` (the shorter one on a tie). */
export function snapHeld(beats: number): number {
  let best: number = HELD_LENGTHS[0];
  for (const l of HELD_LENGTHS) if (Math.abs(l - beats) < Math.abs(best - beats) - 1e-9) best = l;
  return best;
}
