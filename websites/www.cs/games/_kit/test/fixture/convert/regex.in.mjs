import { check } from '../../_kit/test/check.ts';

const said = (h, re) => re.test(h);
const h = 'ran left';
check('turns', said(h, /ran (left|right)/), 'no, turn');
check('slash-class', /[/,)]x/.test(h) === false, 'a / b');
check('ratio', h.length / 2 > 1);
