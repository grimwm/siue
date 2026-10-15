// Tests for shard.ts. Run: node shard-test.ts
import { readdirSync } from 'node:fs';
import { shard, WEIGHTS, DEFAULT_S } from './shard.ts';

let failed = 0;
const check = (name: string, ok: boolean, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${extra}`}`);
  if (!ok) failed++;
};
const all = readdirSync(new URL('.', import.meta.url)).filter(f => f.endsWith('.spec.ts')).sort();
const parts = [1, 2, 3, 4].map(n => shard(all, n, 4));
const flat = parts.flat().sort();
check('every-spec-runs-once', flat.join() === all.join(), `${flat.length} of ${all.length}`);
const load = (p: string[]) => p.reduce((a, s) => a + (WEIGHTS[s] ?? DEFAULT_S), 0);
const loads = parts.map(load);
check('runners-balanced', Math.max(...loads) - Math.min(...loads) <= Math.max(...all.map(s => WEIGHTS[s] ?? DEFAULT_S)), loads.join());
check('deterministic', JSON.stringify([1, 2, 3, 4].map(n => shard([...all].reverse(), n, 4))) === JSON.stringify(parts));
check('few-specs-leave-runners-idle', shard(['a.spec.ts'], 2, 4).length === 0 && shard(['a.spec.ts'], 1, 4).join() === 'a.spec.ts');
const unweighted = all.filter(s => !(s in WEIGHTS));
check('every-spec-has-a-weight', unweighted.length === 0, unweighted.join());
const stale = Object.keys(WEIGHTS).filter(s => !all.includes(s));
check('no-weight-for-a-missing-spec', stale.length === 0, stale.join());
if (failed) { console.log('SHARD-TEST-FAILED'); process.exit(1); }
console.log('SHARD-TEST-OK');
