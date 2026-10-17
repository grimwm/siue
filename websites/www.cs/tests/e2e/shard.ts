#!/usr/bin/env node
/* Which specs one CI runner takes: `node shard.ts <n> <of> [spec ...]` prints
   runner n's share (1-based) of the given specs, or of every spec when none are
   given; empty output means that runner has nothing to do. Specs go to runners
   heaviest first, each to the lightest runner so far, by how long each spec
   took in CI (seconds; a spec not listed counts as DEFAULT_S). Deterministic:
   every runner computes the same split. Refresh the weights when a spec's run
   time changes a lot. */
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEIGHTS: Record<string, number> = {
  'crete-layout.spec.ts': 10,
  'crete-play.spec.ts': 15,
  'tankity-start.spec.ts': 12,
  'tankity-layout.spec.ts': 15,
  'tankity-sky-camera.spec.ts': 70,
  'tankity-fx-editor.spec.ts': 64,
  'tankity-fx-battle.spec.ts': 74,
  'tankity-fx-range.spec.ts': 73,
  'tankity-solo.spec.ts': 61,
  'tankity-end.spec.ts': 90,
  'tankity-end-again.spec.ts': 105,
  'tankity-end-forfeit.spec.ts': 205,
  'tankity-end-out.spec.ts': 18,
  'tankity-rooms.spec.ts': 53,
  'tankity-rooms-play.spec.ts': 95,
  'tankity-speed.spec.ts': 60,
  'tankity-walls.spec.ts': 25,
  'tankity-audio.spec.ts': 39,
  'tankity-rooms-seats.spec.ts': 38,
  'tankity-rooms-shop.spec.ts': 110,
  'tankity-rooms-leave.spec.ts': 80,
  'tankity-rooms-long.spec.ts': 90,
  'tankity-pow.spec.ts': 20,
  'tankity-hud.spec.ts': 27,
  'tankity-armor.spec.ts': 15,
  'tankity-overlays.spec.ts': 21,
  'tankity-lobby-initials.spec.ts': 15,
  'tankity-pickers.spec.ts': 10,
  'tankity-fullscreen-esc.spec.ts': 5,
  'tankity-a11y.spec.ts': 10,
  'games-hub.spec.ts': 8,
  'home-eye.spec.ts': 8,
  'cylon-help.spec.ts': 6,
  'cylon-play.spec.ts': 25,
  'tankity-touch.spec.ts': 3,
  'tankity-tutorial.spec.ts': 45,
  'games-pwa.spec.ts': 3,
  'games-install.spec.ts': 10,
  'play-nav.spec.ts': 14,
};
export const DEFAULT_S = 30;

/** Runner n's (1-based) specs out of `of` runners. */
export function shard(specs: string[], n: number, of: number): string[] {
  const load = Array.from({ length: of }, () => 0);
  const out: string[][] = Array.from({ length: of }, () => []);
  const weight = (s: string) => WEIGHTS[s] ?? DEFAULT_S;
  const order = [...new Set(specs)].sort((a, b) => weight(b) - weight(a) || a.localeCompare(b));
  for (const s of order) {
    let k = 0;
    for (let i = 1; i < of; i++) if (load[i]! < load[k]!) k = i;
    load[k]! += weight(s);
    out[k]!.push(s);
  }
  return out[n - 1]!.sort();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [n, of, ...given] = process.argv.slice(2);
  const N = Number(n), OF = Number(of);
  if (!Number.isInteger(N) || !Number.isInteger(OF) || N < 1 || N > OF) {
    console.error('usage: node shard.ts <n> <of> [spec ...]');
    process.exit(2);
  }
  const all = readdirSync(dirname(fileURLToPath(import.meta.url))).filter(f => f.endsWith('.spec.ts'));
  const specs = given.length ? given : all;
  console.log(shard(specs, N, OF).join(' '));
}
