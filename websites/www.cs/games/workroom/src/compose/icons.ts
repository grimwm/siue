// The instrument picker's icons: one small line drawing per category, and the Lyre's own, on the lane icons' 16 by 16
// grid (laneicons.ts). DOM-free.
import { LANE_ICONS } from '../laneicons.ts';

const ICONS: Readonly<Record<string, readonly string[]>> = {
  strings: LANE_ICONS.strings,
  woodwinds: LANE_ICONS.woodwinds,
  brass: LANE_ICONS.brass,
  keys: LANE_ICONS.keys,
  pitched: ['M2 4h12', 'M3 8h10', 'M4 12h8', 'M5 2l-2 12', 'M11 2l2 12'],
  drums: LANE_ICONS.percussion,
  voices: LANE_ICONS.choir,
  lyre: ['M4 14c-3-4-2-10 1-12', 'M12 14c3-4 2-10-1-12', 'M3 4h10', 'M6 4v10', 'M8 4v10', 'M10 4v10', 'M4 14h8'],
};

/** The path data of an icon by name (a category id, or an instrument's own icon such as "lyre"); strings' when unknown. */
export const iconPaths = (name: string): readonly string[] => ICONS[name] ?? LANE_ICONS.strings;
