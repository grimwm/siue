### Task 5: Opening a link proves it

**Files:**
- Create: `src/share/open.ts`
- Test: `test/share-link.test.ts`

**Interfaces:**
- Consumes: `decodeLink`, `Shared`, `LinkError` (Task 4).
- Produces: `export async function openLink(fragment: string): Promise<{ ok: true; shared: Shared; name: string } | { ok: false; error: LinkError }>`. It decodes the link, then replays `shared.line` from `initial(level)`.

- [ ] **Step 1: Write the failing tests:**
  - `a real link opens`: encode trial 9 with its title, intro and pages cleared (`p` cells become `.`) and its solver line, then open it.
  - `a line that wins early or never is damaged`: one line with an extra move after the win, and one with its last move removed.
  - `a line that loses before the end is damaged`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.** Replay with `step`. The line must be `playing` before every move and `won` after the last.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a link's line must win`.

