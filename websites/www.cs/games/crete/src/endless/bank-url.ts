/* The Island of Crete: where the shared Endless bank is. One bank serves every player: endless-bank.php on
 * happystl.com, called from the game's pages on www.cs.siue.edu (it allows that origin, bank/config.json's
 * allowedOrigins). A page served anywhere else (a local checkout, the end-to-end tests) asks the endless-bank.php
 * beside it instead. The tools (tools/verify-bank.ts and the rest) default to the same address. DOM-free. */

/** The shared bank's address. */
export const SHARED_BANK_URL = 'https://www.happystl.com/crete-bank/endless-bank.php';

/** The host whose pages use the shared bank. */
export const SHARED_BANK_PAGE_HOST = 'www.cs.siue.edu';

/** The bank a page at `page` (its whole address) asks. */
export function bankUrlFor(page: string): string {
  const here = new URL(page);
  return here.protocol === 'https:' && here.hostname === SHARED_BANK_PAGE_HOST ? SHARED_BANK_URL : new URL('endless-bank.php', here).toString();
}
