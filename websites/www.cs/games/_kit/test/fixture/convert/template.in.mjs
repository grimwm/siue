import { check } from '../../_kit/test/check.ts';

const f = (a, b) => a + b;
check(`sum-${f(1, 2)}`, f(1, 2) === 3, `got ${f(1, 2)}, ${`inner ${f(3, `x, ${4}`)}`}`);
