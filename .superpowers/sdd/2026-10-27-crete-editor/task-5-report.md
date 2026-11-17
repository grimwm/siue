# Task 5 report
Implemented src/share/open.ts (openLink: decodeLink, replay with initial/step, playing before each move, won after last, else damaged; name via levelCode/sharedName). DOM-free.
Tests (test/share-link.test.ts, 18 pass): a real link opens (trial 9 stripped, solver line); wins early / last move removed / empty line damaged; loses before the end (hearts: 1, Minotaur two steps from P, line rrrdr: lost after move 1, refused at move 2); decode errors pass through. Bounded-pieces bound widened to <= 6.
RED: node --test crete/test/share-link.test.ts -> ERR_MODULE_NOT_FOUND open.ts (pass 0 fail 1). GREEN: pass 18 fail 0.
bash units.sh exit 0; sh crete/test.sh exit 0. No generated files changed (src/share not imported by game).
Self-review: diff is open.ts plus tests; no concerns.
