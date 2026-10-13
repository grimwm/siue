// Writes (or checks) protocol/solo-runs.json: solo runs a bot plays with the
// browser's rules, each round as the page sends it (buys, shots, the claim).
// test/php/SoloRoundTest.php plays every round in PHP from the stored state
// and must reach every claim.
//   node tools/solo-runs.mjs          rewrite solo-runs.json
//   node tools/solo-runs.mjs --check  exit 1 if the short runs are stale (seconds)
//   node tools/solo-runs.mjs --check --all  replay every run too (about a minute; nightly)
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { makeBot, playSolo } from '../src/solo-play.ts';

const dir = path.join(import.meta.dirname, '..');
const arsenal = buildArsenal(JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8')).arsenal);
// name, bot skill, the round the bot stops aiming, the drones' difficulty, the field's width.
// Every difficulty is played, so the PHP drones are checked at each level's
// aim. The long runs are for the per-round CPU bench (tools/round-bench.php)
// and the nightly; long-70 shows a run past 60 rounds plays and files.
// The last field marks the runs that take tens of seconds to replay; the quick
// check leaves them to --all so make test stays inside its budget.
const PLAN = [
  ['wild-1', 0, 0, 'easy'], ['wild-2', 0, 0, 'hard'], ['middling-1', 0.5, 99, 'easy', 720, true], ['middling-2', 0.5, 99, 'normal', 720, true],
  ['sharp-5', 1, 5, 'hard'], ['long-15', 1, 15, 'normal'], ['long-70', 1, 70, 'easy', 720, true], ['wide-1440', 0.5, 99, 'normal', 1440, true],
];
const play = ([name, skill, until, difficulty, w = 720]) => {
  const seed = `runs-${name}`;
  const run = playSolo(seed, arsenal, makeBot(seed, skill, until), difficulty, w);
  return { name, skill, until, ...run };
};
const file = path.join(dir, 'protocol', 'solo-runs.json');
const about = 'Solo runs played by node tools/solo-runs.mjs with the browser rules, round by round; SoloRoundTest plays each round in PHP. Do not edit by hand.';
const stale = why => {
  console.error(`solo-runs: protocol/solo-runs.json is stale (${why}); run make solo-runs and commit the result`);
  process.exit(1);
};
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file)) stale('missing');
  const stored = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (stored.about !== about || stored.runs.map(r => r.name).join() !== PLAN.map(p => p[0]).join()) stale('the run list changed');
  const all = process.argv.includes('--all');
  let n = 0;
  for (const [i, p] of PLAN.entries()) {
    if (p[5] && !all) continue;
    if (JSON.stringify(stored.runs[i]) !== JSON.stringify(play(p))) stale(p[0]);
    n++;
  }
  console.log(`solo-runs: ${n} of ${PLAN.length} runs current`);
} else {
  const runs = PLAN.map(play);
  fs.writeFileSync(file, JSON.stringify({ about, runs }, null, 1) + '\n');
  fs.writeFileSync(file, text);
  for (const r of runs) {
    const shots = r.rounds.reduce((n, x) => n + x.shots.length, 0);
    console.log(`  ${r.name.padEnd(12)} ${r.difficulty.padEnd(6)} ${String(r.rounds.length).padStart(3)} rounds  ${r.score} pts  ${shots} shots`);
  }
}
