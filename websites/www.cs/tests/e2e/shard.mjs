#!/usr/bin/env node
/* Which specs one CI runner takes: `node shard.mjs <n> <of> [spec ...]` prints
   runner n's share (1-based) of the given specs, or of every spec when none are
   given; empty output means that runner has nothing to do. Specs go to runners
   heaviest first, each to the lightest runner so far, by how long each spec
   took in CI (seconds; a spec not listed counts as DEFAULT_S). Deterministic:
   every runner computes the same split. Refresh the weights when a spec's run
   time changes a lot. */
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEIGHTS = {
  'tankity-fx-editor.spec.mjs': 64,
  'tankity-fx-battle.spec.mjs': 74,
  'tankity-fx-range.spec.mjs': 73,
  'tankity-solo.spec.mjs': 61,
  'tankity-rooms.spec.mjs': 53,
  'tankity-rooms-play.spec.mjs': 47,
  'tankity-audio.spec.mjs': 39,
  'tankity-rooms-seats.spec.mjs': 38,
  'tankity-rooms-shop.spec.mjs': 33,
  'tankity-hud.spec.mjs': 27,
  'tankity-overlays.spec.mjs': 21,
  'tankity-pickers.spec.mjs': 10,
  'tankity-toolbar.spec.mjs': 8,
  'games-hub.spec.mjs': 8,
  'home-eye.spec.mjs': 8,
  'cylon-help.spec.mjs': 6,
  'tankity-touch.spec.mjs': 3,
  'games-pwa.spec.mjs': 3,
};
export const DEFAULT_S = 30;

/** Runner n's (1-based) specs out of `of` runners. */
export function shard(specs, n, of) {
  const load = Array.from({ length: of }, () => 0);
  const out = Array.from({ length: of }, () => []);
  const weight = s => WEIGHTS[s] ?? DEFAULT_S;
  const order = [...new Set(specs)].sort((a, b) => weight(b) - weight(a) || a.localeCompare(b));
  for (const s of order) {
    let k = 0;
    for (let i = 1; i < of; i++) if (load[i] < load[k]) k = i;
    load[k] += weight(s);
    out[k].push(s);
  }
  return out[n - 1].sort();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [n, of, ...given] = process.argv.slice(2);
  const N = Number(n), OF = Number(of);
  if (!Number.isInteger(N) || !Number.isInteger(OF) || N < 1 || N > OF) {
    console.error('usage: node shard.mjs <n> <of> [spec ...]');
    process.exit(2);
  }
  const all = readdirSync(dirname(fileURLToPath(import.meta.url))).filter(f => f.endsWith('.spec.mjs'));
  const specs = given.length ? given : all;
  console.log(shard(specs, N, OF).join(' '));
}
