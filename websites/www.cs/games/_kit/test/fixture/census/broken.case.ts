import { test } from 'node:test';
import './no-such-module.ts';

test('never runs', () => {});
