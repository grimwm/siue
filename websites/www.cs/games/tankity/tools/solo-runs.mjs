// Writes (or checks) protocol/solo-runs.json: solo runs a bot plays with the
// browser's rules, each round as the page sends it (buys, shots, the claim),
// for the server's solo referee to replay. Every run is replayed before it is
// written or passes a check, so each one files. CI runs --check --all on every PR.
//   node tools/solo-runs.mjs  |  --check (the quick runs)  |  --check --all (byte for byte)
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { makeBot, playSolo, replaySolo } from '../src/solo-play.ts';

const dir = path.join(import.meta.dirname, '..');
const arsenal = buildArsenal(JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8')).arsenal);
// name, bot skill, the round the bot stops aiming, the drones' difficulty, the
// field's width, and whether the run is slow (seconds, not tenths) to play.
// Every difficulty is played, so the drones are checked at each level's aim;
// the 5-life cap is reached at normal, at 1440 and past 60 rounds. long-63
// plays past 60 rounds; slow runs are left to --check --all, and each run
// carries its slow flag so every replayer splits the runs the same way.
const PLAN = [
  ['wild-1', 0, 0, 'easy'], ['wild-2', 0, 0, 'hard'], ['middling-1', 0.5, 12, 'easy'], ['middling-2', 0.5, 12, 'normal', 720, true],
  ['sharp-5', 1, 5, 'hard'], ['long-15', 1, 15, 'normal'], ['long-63', 1, 63, 'easy', 720, true], ['wide-1440', 0.5, 12, 'normal', 1440, true],
];
const play = ([name, skill, until, difficulty, w = 720, slow = false]) => {
  const seed = `runs-${name}`;
  const run = { name, skill, until, slow, ...playSolo(seed, arsenal, makeBot(seed, skill, until), difficulty, w) };
  // The page and the server must both take every round as recorded.
  const back = replaySolo(JSON.parse(JSON.stringify(run)), arsenal);
  const want = { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds.length };
  if (JSON.stringify(back) !== JSON.stringify(want)) {
    console.error(`solo-runs: ${name} does not file: ${JSON.stringify(back)}; pick another seed or until`);
    process.exit(1);
  }
  return run;
};
const file = path.join(dir, 'protocol', 'solo-runs.json');
const about = 'Solo runs played by node tools/solo-runs.mjs with the browser rules, round by round, for the server\'s solo referee to replay. Do not edit by hand.';
const textOf = runs => JSON.stringify({ about, runs }, null, 1) + '\n';
const stale = why => {
  console.error(`solo-runs: protocol/solo-runs.json is stale (${why}); run make solo-runs and commit the result`);
  process.exit(1);
};
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file)) stale('missing');
  const text = fs.readFileSync(file, 'utf8');
  const stored = JSON.parse(text);
  if (stored.about !== about || stored.runs.map(r => r.name).join() !== PLAN.map(p => p[0]).join()) stale('the run list changed');
  if (process.argv.includes('--all')) {
    if (text !== textOf(PLAN.map(play))) stale('the file differs');
    console.log(`solo-runs: ${PLAN.length} of ${PLAN.length} runs current, every one replayed`);
  } else {
    const quick = PLAN.map((p, i) => [p, i]).filter(([p]) => !p[5]);
    for (const [p, i] of quick) if (JSON.stringify(stored.runs[i]) !== JSON.stringify(play(p))) stale(p[0]);
    console.log(`solo-runs: ${quick.length} of ${PLAN.length} runs current, every one replayed`);
  }
} else {
  const runs = PLAN.map(play);
  fs.writeFileSync(file, textOf(runs));
  for (const r of runs) {
    const shots = r.rounds.reduce((n, x) => n + x.shots.length, 0);
    const most = Math.max(...r.rounds.map(x => x.shots.length));
    console.log(`  ${r.name.padEnd(12)} ${r.difficulty.padEnd(6)} ${String(r.rounds.length).padStart(3)} rounds  ${r.score} pts  ${shots} shots (at most ${most} in a round)`);
  }
}
