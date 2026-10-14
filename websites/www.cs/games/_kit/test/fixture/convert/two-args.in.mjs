import { check } from '../../_kit/test/check.ts';
import { score } from '../src/rules.ts';

check('zero-start', score([]) === 0);
