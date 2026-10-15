/* Prints the arsenal's balance table (src/balance.ts) as Markdown: each gun's
 * expected damage at one target and at three, dollars per shot and damage per
 * dollar, its speed and full-power reach on a room's field, in rack order,
 * then the band the damage guns must sit in.
 *
 *   node tools/balance-report.ts            from game.json
 *   node tools/balance-report.ts other.json from another game.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import { BAL_W, BAND_HI, BAND_LO, fullReach, measureArsenal, median, lineOf } from '../src/balance.ts';
import { flies } from '../src/sim.ts';

const file = process.argv[2] || path.join(import.meta.dirname, '..', 'game.json');
const arsenal = buildArsenal(JSON.parse(fs.readFileSync(file, 'utf8')).arsenal);
if (!arsenal) throw new Error(`${file} has no arsenal`);
const rows = measureArsenal(arsenal);
const mid = median(rows.filter(r => r.role === 'damage' && r.perDollar !== null).map(r => r.perDollar!));
const f1 = (v: number) => v.toFixed(1);
console.log('| gun | line | role | dmg, 1 target | dmg, 3 targets | $ per shot | dmg per $ | min round | speed | reach |');
console.log('|---|---|---|--:|--:|--:|--:|--:|--:|--:|');
for (const r of rows) {
  const w = arsenal.weapons[r.key]!;
  console.log(`| ${w.name} | ${lineOf(w)} | ${r.role} | ${f1(r.single)} | ${f1(r.cluster)} | ${r.perShot ? f1(r.perShot) : 'free'} | ${r.perDollar === null ? '-' : r.perDollar.toFixed(2)} | ${w.minRound} | ${w.speed} | ${flies(w) ? (fullReach(w) / BAL_W * 100).toFixed(0) + '%' : '-'} |`);
}
console.log(`\nDamage guns' median damage per dollar: ${mid.toFixed(3)}; band ${(mid * BAND_LO).toFixed(3)} to ${(mid * BAND_HI).toFixed(3)}.`);
