import { check } from '../../_kit/test/check.ts';
import { score } from '../src/rules.ts';

const s = score([1, 2]);
check('sums', s === 3, `score=${s}`);
check('positive', s > 0, 'score, ' + s);
