// Builds Endless's bank (src/endless/bank.ts) with the generator Endless runs in the browser, with no budget.
//
//   node tools/endless-bank.ts make <chapter> <band> <count> [salt]   # prints one JSON line per level it makes
//   node tools/endless-bank.ts write <file.jsonl>...                    # writes src/endless/bank.ts from them
//
// `make` searches for levels whose newest pieces are at most Chapter <chapter>'s (a tier offers a bank level from its
// chapter on) and whose search stores situations inside band <band> of BANDS, each through the whole gate. Run
// several at once (at most four), each appending to its own file, then `write` them all; `write` leaves out a level whose layout repeats one it has kept. Run from games/crete.
import { readFileSync, writeFileSync } from 'node:fs';
import { search } from '../src/endless/generate.ts';
import type { BankLevel } from '../src/endless/generate.ts';
import { chapterOf, knownOf, floorOf } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { SAME, overlap } from '../src/puzzle/layouts.ts';

/** The bands the bank fills, a little under 1.3 times apart, from the shared bar up to the plateau's top. */
export const BANDS: readonly [number, number][] = [
  [6_000, 8_000], [8_000, 10_500], [10_500, 14_000], [14_000, 18_500], [18_500, 24_000], [24_000, 31_000], [31_000, 40_000], [40_000, 50_000],
];

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'make') {
  const [chapterS, bandS, countS, salt = '0'] = args;
  const chapter = Number(chapterS), [lo, hi] = BANDS[Number(bandS)]!, count = Number(countS);
  const least = Math.max(lo, floorOf(chapter).explored);
  if (least >= hi) throw new RangeError(`Chapter ${chapter}'s floor is past band ${bandS}`);
  const known = knownOf(campaignLevels());
  for (let k = 0; k < count; k++) {
    const at = { tries: 0, spent: 0 };
    const t0 = Date.now();
    const found = search(['bank', chapter, bandS!, salt, k], chapter, { least, most: hi, plateau: false }, null, known, [], Number.MAX_SAFE_INTEGER, at, undefined, null,
      process.env.TRACE ? line => process.stderr.write(`  ${line.slice(0, 300)}\n`) : undefined);
    if (!found) continue;
    const level = parse(found.text);
    const d = measure(level);
    const out: BankLevel = { text: found.text, explored: d.explored, shortest: d.shortest as number, chapter: chapterOf(level), line: d.line };
    process.stderr.write(`chapter ${chapter} band ${bandS}: ${d.explored} situations, ${d.shortest} moves, ${at.tries} tries, ${Math.round((Date.now() - t0) / 1000)} s\n`);
    console.log(JSON.stringify(out));
  }
} else if (cmd === 'write') {
  const seen = new Set<string>();
  const all: BankLevel[] = [];
  for (const f of args) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const b = JSON.parse(line) as BankLevel;
      if (seen.has(b.text)) continue;
      seen.add(b.text);
      // No two bank levels repeat a layout, so a run that falls back on the bank never meets one twice.
      const lv = parse(b.text);
      const like = all.find(k => overlap(lv, parse(k.text)) >= SAME);
      if (like) { console.log(`left out a level of chapter ${b.chapter} (${b.explored}): its layout repeats one of chapter ${like.chapter} (${like.explored})`); continue; }
      all.push(b);
    }
  }
  all.sort((a, b) => a.chapter - b.chapter || a.explored - b.explored);
  const body = all.map(b => `  { chapter: ${b.chapter}, explored: ${b.explored}, shortest: ${b.shortest}, line: '${b.line}', text: ${JSON.stringify(b.text)} },`).join('\n');
  writeFileSync(new URL('../src/endless/bank.ts', import.meta.url), `/* The Island of Crete: Endless's bank, written by tools/endless-bank.ts; do not edit it by hand. Levels the
 * generator made ahead of time and the gate passed, for a run's first level and for any level whose search runs out
 * of its budget: ${all.length} levels, by chapter and then situations stored. DOM-free. */
import type { BankLevel } from './generate.ts';

export const BANK: readonly BankLevel[] = [
${body}
];
`);
  console.log(`wrote ${all.length} levels`);
} else {
  console.error('usage: endless-bank.ts make <chapter> <band> <count> [salt] | write <file.jsonl>...');
  process.exit(2);
}
