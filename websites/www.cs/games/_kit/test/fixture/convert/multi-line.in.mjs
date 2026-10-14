import { check } from '../../_kit/test/check.ts';

const hits = [{ id: 1 }];
check(
  'lance-hits-once',
  hits.length === 1 && hits.every(h => ({ id: h.id }).id === 1),
  JSON.stringify({ hits, n: [1, 2] })
);
