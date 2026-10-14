import { check } from '../../_kit/test/check.ts';

// check('in-a-comment', false);
/* check('in-a-block', false); */
const text = "check('in-a-string', false)";
const other = { check: (a, b) => a === b };
other.check('member', true);
check('real', text.length > 0 && other.check(1, 1));
