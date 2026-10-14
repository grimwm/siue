import { check } from '../../_kit/test/check.ts';
import { els, makeEl } from '../../_kit/test/dom-stub.mjs';
import { local } from './dom-stub.mjs';

check('stubbed', makeEl('div') !== els.none && local !== undefined);
