// One small line drawing per instrument family, on a 16 by 16 grid: path data
// only, so it is drawn as inline SVG with no font or image file. DOM-free.
import type { Family } from './score.ts';

export const LANE_ICONS: Record<Family, readonly string[]> = {
  strings: ['M4 2v12', 'M8 2v12', 'M12 2v12', 'M2 13h12'],
  brass: ['M2 6h5l7-4v12l-7-4H2z', 'M4 10l1 4'],
  woodwinds: ['M2 14L14 2', 'M5 11l2 2', 'M8 8l2 2', 'M11 5l2 2'],
  percussion: ['M2 6a6 2.5 0 1012 0a6 2.5 0 10-12 0', 'M2 6v5c0 3 12 3 12 0V6', 'M5 1l3 4', 'M11 1L8 5'],
  choir: ['M5.5 5a2.5 2.5 0 105 0a2.5 2.5 0 10-5 0', 'M3 14c0-4 2-5 5-5s5 1 5 5'],
  keys: ['M2 3h12v10H2z', 'M6 3v10', 'M10 3v10', 'M5 3v5', 'M9 3v5', 'M13 3v5'],
  synth: ['M1 12V4h4v8h4V4h4v8h2'],
  harp: ['M3 14V3q8-1 10 6v5', 'M6 13V5', 'M9 13V7', 'M3 14h10'],
  bells: ['M4 12c1-2 1-4 1-6a3 3 0 016 0c0 2 0 4 1 6z', 'M8 2v1', 'M7 14h2'],
  impact: ['M8 1l2 4 4-1-2 4 3 3-4 0-1 4-2-3-3 3 0-4-4-1 3-3-2-4z'],
  whoosh: ['M2 5h8a2 2 0 10-2-2', 'M2 9h11a2 2 0 11-2 2', 'M2 13h6'],
  ambience: ['M4 12a3 3 0 010-6a4 4 0 017-1a3.5 3.5 0 011 7z'],
  voice: ['M2 3h12v8H7l-3 3v-3H2z'],
  electronic: ['M9 1L4 9h4l-1 6 5-8H8z'],
  foley: ['M5 6a3 4 0 106 0a3 4 0 10-6 0', 'M6 13a2 1.5 0 104 0a2 1.5 0 10-4 0'],
  ui: ['M4 2l8 6-4 1 2 5-2 1-2-5-3 3z'],
};
