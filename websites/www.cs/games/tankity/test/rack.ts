// A drone's magazine for a test that needs one: n shells of every gun a drone may use (`ai: true`).
// A drone owns no free gear, so a case that wants it holding a gun hands it one, as the aim vectors do.
import type { Ammo, Arsenal } from '../src/sim.ts';

export function rackOf(arsenal: Arsenal, n = 2): Ammo {
  const rack: Ammo = { shell: Infinity };
  for (const k of arsenal.order) {
    if (k !== 'shell' && arsenal.weapons[k]!.ai) rack[k] = n;
  }
  return rack;
}
