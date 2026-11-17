### Task 4: The link codec

**Files:**
- Create: `src/share/link.ts`, `src/share/name.ts`
- Test: `test/share-link.test.ts`

**Interfaces:**
- Produces from `link.ts`:
  - `export const LINK_VERSION = 'L1', ENCODED_MAX = 16_384, DECODED_MAX = 32_768, MAX_LINE = 20_000`;
  - `export interface Shared { text: string; level: Level; line: Action[]; initials: string; best: number | null }`;
  - `export async function encodeLink(s: { text: string; line: readonly Action[]; initials: string; best: number | null }): Promise<string>`, which returns the fragment without `#`;
  - `export type LinkError = 'damaged' | 'too-long' | 'too-large' | 'newer' | 'not-a-link'`;
  - `export async function decodeLink(fragment: string): Promise<{ ok: true; shared: Shared } | { ok: false; error: LinkError }>`;
  - `export const LINK_MESSAGES: Record<LinkError, string>`.
- Produces from `name.ts`:
  - `export async function levelCode(text: string): Promise<string>`;
  - `export function sharedName(code: string, initials: string): string`.

- [ ] **Step 1: Write the failing tests:**
  - `round trip keeps every piece`: build one level text holding every terrain, object, hazard (each facing), every machine template, `P` and `M`, with `hearts: 5` and `relics: 1`; use a hand-written short line, so do not check that it wins here. Decoding the encoding gives the same `text`, `line`, `initials` and `best`.
  - `round trip at 64 × 64`.
  - `the worst case fits`: a seeded random 64 × 64 grid of every legend character with one `P`, plus a seeded random 20,000-letter line, encodes to at most `ENCODED_MAX` characters.
  - `a fragment over ENCODED_MAX is too-long before decompressing`: pass `'L1.' + 'A'.repeat(ENCODED_MAX + 1)` and assert that `DecompressionStream` is never constructed, by spying on `globalThis.DecompressionStream`.
  - `a decompression bomb is too-large`: deflate 1 MB of `#`, which still encodes under `ENCODED_MAX`, gives `too-large`.
  - `L2 is newer; garbage, bad base64 and a truncated stream are damaged`.
  - `a link with a title, intro or pages is damaged`.
  - `a board side outside 3..64 is damaged`.
  - `a best below the line's length is damaged`.
  - `levelCode is stable`: pin the code of trial 1's text with its title and intro emptied to the literal it returns. Write the literal from the first run and check that it is 4 characters from the alphabet.
  - `sharedName('K7QX', 'WGR')` is `Level K7QX by WGR`.
- [ ] **Step 2:** Run `node --test crete/test/share-link.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement** with `CompressionStream('deflate-raw')`. Decode in this order:
  1. version;
  2. length;
  3. base64url;
  4. streamed decompress with the running count;
  5. the payload's header lines;
  6. the raw grid shape;
  7. `parse` (a `LevelError` is damaged);
  8. the no-free-text checks;
  9. `lineOf`;
  10. `best`.
  
  `link.ts` does not replay the line: Task 5 does, because replaying needs the engine. `LINK_MESSAGES`:
  - damaged: `This level link is damaged. Ask for the link again.`
  - too-long, too-large: `This level link is too long to open.`
  - newer: `This level was made by a newer version of the game. Reload the page and try again.`
  - not-a-link: `This is not a level link.`
- [ ] **Step 4:** Run the file. Expect PASS.
- [ ] **Step 5: Commit** `Crete: share links carry a level, its proof and its author`.

