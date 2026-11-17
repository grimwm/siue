# Task 4 report: the link codec

Commit 07276fd "Crete: share links carry a level, its proof and its author".

## Implemented
- src/share/link.ts: LINK_VERSION, ENCODED_MAX, DECODED_MAX, MAX_LINE, Shared, encodeLink, decodeLink, LinkError, LINK_MESSAGES. Own base64url; deflate-raw via CompressionStream; streamed inflate with a fatal streaming TextDecoder, counting UTF-16 characters, cancelling the reader and aborting the writer past DECODED_MAX (too-large). Corrupt/truncated stream or bad UTF-8 -> damaged. decodeLink wraps everything in try/catch and never throws.
- Decode order: version, length, base64url, inflate, payload header (by/best/line, strict), raw grid shape (3..64 rows, each row 3..64 wide), parse (LevelError -> damaged), no-free-text (title, intro, pageIds, any page cell), line length (> MAX_LINE -> too-long), lineOf, best >= line length. Initials via the kit's validInitials (must already be uppercase).
- src/share/name.ts: levelCode (first 5 hex digits of cache.ts sha256Hex = 20 bits, 4 chars), sharedName.
- tsconfig.json: both files added to the DOM-free program. Declares for streams/TextEncoder/TextDecoder are local, as in cache.ts.

## Tests (test/share-link.test.ts): 13 pass
RED: `node --test crete/test/share-link.test.ts` -> ERR_MODULE_NOT_FOUND src/share/link.ts.
GREEN: pass 13 / fail 0. levelCode literal pinned: 48BQ (title/intro emptied text of trial-1-like small level).
`sh crete/test.sh` exit 0; `bash units.sh` pass 3351 fail 0 (exit 0). No rebuild needed: src/share is not imported by main.ts.

## Worst case
With MAX_LINE = 20_000 the worst case (seeded random 64x64 over every legend char + one P, random line of the 8 move letters) encoded to 17,296 chars, over ENCODED_MAX. Deflate spends ~3.58 bits/move on a random line (zlib takes poor 3-byte matches) and mixing with the grid costs ~1 KB more. Measured now with MAX_LINE = 18_000: 16,043 of 16,384.

## Self-review
Untrusted paths: base64 regex/length checked before decode; inflate errors caught in read loop, write/close rejections swallowed (no unhandled rejection); fatal decoder errors caught; parse only throws LevelError (others rethrown into the outer catch -> damaged); outer try/catch around everything. Hostile boards are bounded by the raw shape check before parse. encodeLink validates nothing.

## Concerns
1. DEVIATION: MAX_LINE lowered from the plan's 20_000 to 18_000, because the plan's worst case does not fit ENCODED_MAX (17,296). Alternatives: keep 20_000 and change the line encoding (e.g. pack two moves per character), or raise ENCODED_MAX to about 18_000. Owner/controller to decide.
2. encodeLink does not check the limits; Task 5 should check that the fragment is <= ENCODED_MAX and the line <= MAX_LINE before offering a link.
3. Decode does not require the text to equal serialize's canonical form; levelCode hashes the text as carried.

## Fix round 1
Changes (link.ts, share-link.test.ts):
1. `inflate` feeds the compressed input in PIECE = 1024-byte writes. Finding: Node's DecompressionStream accepts every write at once (all 12 pieces resolved before any read), so awaiting writes alone bounds nothing. Each piece therefore waits (up to PAUSE_MS = 20) until the reader has counted a chunk of output; on passing DECODED_MAX or any error the feeder stops, the reader is cancelled and the writer aborted. Comment now states this.
2. `levelCode is stable` pins the code of TRIALS[0] through parse/serialize with title and intro emptied: V43B (was a made-up level, 48BQ).
New test: `a bomb is caught after a bounded number of input pieces`: 12 MB of '#' (about 12 pieces), a spy on the writer counts writes; asserts 1 to 4 writes.
Command: `node --test crete/test/share-link.test.ts` x3: pass 14, fail 0 each time. `sh crete/test.sh` exit 0 after a one-line type fix (wake typed with a cast), committed separately.
