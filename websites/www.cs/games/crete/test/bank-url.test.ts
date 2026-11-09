// Which bank a page asks (src/endless/bank-url.ts): the shared one on happystl.com from the game's own pages, the
// endless-bank.php beside the page anywhere else.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHARED_BANK_URL, bankUrlFor } from '../src/endless/bank-url.ts';
import { BANK_URL } from '../tools/verify-bank.ts';

test('the game on www.cs.siue.edu asks the shared bank on happystl.com, in the frame and on its own', () => {
  assert.equal(SHARED_BANK_URL, 'https://www.happystl.com/crete-bank/endless-bank.php');
  assert.equal(bankUrlFor('https://www.cs.siue.edu/~wgrim/games/crete/'), SHARED_BANK_URL);
  assert.equal(bankUrlFor('https://www.cs.siue.edu/~wgrim/games/crete/index.html?v=abc#endless'), SHARED_BANK_URL);
});

test('a page anywhere else asks the endless-bank.php beside it', () => {
  assert.equal(bankUrlFor('http://localhost:8080/games/crete/'), 'http://localhost:8080/games/crete/endless-bank.php');
  assert.equal(bankUrlFor('http://127.0.0.1:4173/~wgrim/games/crete/index.html'), 'http://127.0.0.1:4173/~wgrim/games/crete/endless-bank.php');
  assert.equal(bankUrlFor('http://www.cs.siue.edu/~wgrim/games/crete/'), 'http://www.cs.siue.edu/~wgrim/games/crete/endless-bank.php', 'only over HTTPS');
  assert.equal(bankUrlFor('https://cs.siue.edu/~wgrim/games/crete/'), 'https://cs.siue.edu/~wgrim/games/crete/endless-bank.php');
});

test('the tools default to the shared bank', () => {
  assert.equal(BANK_URL, SHARED_BANK_URL);
});
