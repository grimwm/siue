# Studios for everyone: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anyone with an `@siue.edu` address signs in to a private music studio of their own: their pieces, drafts, notes, notes key and AI keys, within a hard storage limit, with start over and an admin view of accounts.

**Architecture:**
- The admin sign-in kit becomes realm-aware. One `Admin\Realm` value names a realm's cookies, tables, base URL, who may sign in and its rate limits. The admin realm admits named admins only. The studio realm admits any `@siue.edu` address and lives under `music/` with its own cookie (`__Secure-studio`, Path `/~wgrim/music/`), links, devices and sessions tables, with an account id on each session.
- An `accounts` table holds one row per address. A one-time migration turns the workroom's single-user tables into per-account tables and gives every existing row and file to the owner's account. `Music\Store` is built for one account and every query names it.
- Named people (admin flag, allowance flag) and the two caps come from `admin/config/studio.json`. The deploy writes that file from a 1Password field, so no address but the owner's (already public in `Admin\Auth`) is in git.
- AI keys are a per-account table behind `Music\KeyGate`. The gate resolves an AI key to its account, and an owner's admin API key to the owner's account, so his 1Password publish and pickup flow keeps working.
- The page makes the notes key in the browser (RSA-4096, locked with PBKDF2-SHA-256 600,000 rounds and AES-GCM). It uploads the key with the session and CSRF.

**Tech Stack:** PHP 8.4 (PDO SQLite, zlib), PHPUnit; TypeScript + Preact (node:test, Web Crypto); Playwright (`make music-e2e`); GitHub Actions (`deploy.yml`) with the 1Password load-secrets action.

**Spec:** `docs/superpowers/specs/2026-10-29-music-studios-design.md`, project 2 of "Projects and order". Binding sections: "Decided by the owner", "How it works", "Constraints", "Settled after review", "Open (Claude's calls)". The existing system is in `docs/superpowers/specs/2026-10-17-music-workroom-design.md` and `websites/www.cs/admin/README.md`.

## Global Constraints

- **Who signs in to the studio:** the address is trimmed and lower-cased, and CR or LF refuses it. The domain must be exactly `siue.edu`, and a `+` in the local part refuses it. Everyone else gets the same generic reply.
- **One account per address,** created at the first completed sign-in.
- **Limits:**
  - **Studio limit:** 5 MB = `5_242_880` bytes per account, for everyone but people with the allowance flag.
  - **Allowance:** 100 MB = `104_857_600` bytes (today's `Store::MAX_DRAFT_TOTAL_BYTES`).
  - **Per piece:** each piece keeps its newest 20 drafts (`Store::KEEP_DRAFTS`), whoever owns it.
- **Shared caps** (from `admin/config/studio.json`, with these defaults):
  - `max_shared_bytes` `1_073_741_824` (about 1 GB), the total of every account without the allowance;
  - `max_accounts` `500`.
  - When either is reached, a new sign-up gets a plain "The studio is full" page.
- **Usage** is stored bytes after compression: draft files as stored plus sealed notes, hums included.
  - An upload that would pass the limit is refused, and nothing is deleted to make room.
  - The refusal says how much room is left (the smaller of the account's own room and, for an account without the allowance, the shared room). It also says how to free some: delete drafts, or picked-up notes.
- **Compression:** `score.json` and `score.musicxml` are stored with `gzencode($bytes, 9)` as `score.json.gz` / `score.musicxml.gz` and served decompressed. Audio and PNG are stored as sent. Nothing is ever re-encoded lossily.
- **Studio users store scores only:**
  - a studio user's draft is exactly one file, `score.json`, renderable (`Api::isRenderable`);
  - named people with the allowance may publish today's full drafts (MusicXML, audio, spectrogram);
  - the request limit is 8 MB (`Store::MAX_REQUEST_BYTES`) for the allowance and `262_144 + 64` bytes for everyone else.
- **Untrusted score limits,** on every draft: `score.json` at most `262_144` bytes, at most `20_000` notes, at most `16` lanes. In every score-only draft, each lane's `sound.instrument` must be a key of `music/library/library.json`'s `instruments`.
- **Notes:**
  - at most `1_048_576` bytes each for studio users, and `2_097_152` for people with the allowance;
  - `2000` notes per account;
  - the server never opens a note.
- **The notes key:** RSA-4096 RSA-OAEP SHA-256, locked with PBKDF2-SHA-256 at `600_000` rounds and AES-256-GCM (`unlock.ts` `lockKeyring`, unchanged envelope). The passphrase is at least 12 characters, typed twice.
  - No resets. A forgotten passphrase means start over.
- **AI keys:**
  - per account; 64 hex, shown once, stored as SHA-256;
  - scopes only `notes:pickup` (shown as "read notes"), `drafts:publish` ("publish drafts") and `drafts:delete` ("delete drafts");
  - never `keys:publish`; they never create keys and never start over;
  - at most `10` active per account;
  - 60 requests a minute each (`Admin\Keys::PER_MINUTE`).
- **Start over** deletes the account's notes, drafts, pieces, keyring and AI keys after the person types `start over`. The account and its sign-in stay.
- **Studio sessions:**
  - **Cookie:** `__Secure-studio`, `Path` = the admin cookie path + `music/` (`/~wgrim/music/` live), `Secure; HttpOnly; SameSite=Strict`.
  - **Rules:** the same idle (`604800`) and maximum (`2592000`) ages, trusted device, CSRF on every POST, and sign out everywhere per account.
  - **Separation:** a studio session never reaches `/admin/`, and an admin session never opens a studio page.
- **Studio sign-in rate limits** (an hour each):
  - 300 links overall;
  - 100 requests per IP (a class behind one campus address);
  - 3 links per address;
  - 3000 request rows at most.
  The admin realm keeps 30 / 20 / 3 / 1000.
- **The repo is public:** no address of a named person other than the owner's (already in `Admin\Auth`), no key and no secret in git. The named list reaches the host only through the deploy.
- **The host:** plain PHP 8.4, sftp only, deploys only through `.github/workflows/deploy.yml`. Never plan or run a manual deploy or SSH.
- **Tests:**
  - **PHPUnit:** from `websites/www.cs`, `podman run --rm -v "$PWD":/w:z -w /w docker.io/library/php:8.4-cli vendor/bin/phpunit --testsuite site --filter <Name>` (written `PHPUNIT --filter <Name>` below). The Deploy, DeploySet and MakeHelp tests need git, so check those with `LIST=1 ./deploy.sh`.
  - **Node:** from `websites/www.cs/games`, one file at a time: `systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 300 node --test workroom/test/<f>.test.ts` (written `NODE <f>` below).
  - **The rest:** `make test` plus at most two e2e specs locally; CI runs the full suite. `games/workroom/dist/` is rebuilt (`cd games && npm run build`) and committed whenever `games/workroom/src` changes.
- **Docs:** they describe the current state only, never history.

## Review Focus

1. **A class signs in at once from one campus IP:** 40 different `@siue.edu` addresses from one IP inside an hour all get links. The 101st request from that IP gets the generic reply and no link. Test in Task 3.
2. **The shared pool is full while the person's own studio still has room:** the refusal names the shared room, not the 5 MB room. An account with the allowance is never refused for the pool. Test in Task 2.
3. **The migration meets the owner's live data twice, or is interrupted:** a second open of the database changes nothing. An interrupted migration (a throw after the files moved) leaves the drafts readable under the layout the database records. Test in Task 2.
4. **Start over while an AI key is publishing:** after start over, that key answers 401. A publish that won the lock before the wipe leaves no orphaned files after it. Test in Task 8.
5. **Address variants:**
   - `  Student@SIUE.EDU ` lands in the same account as `student@siue.edu`;
   - `a@mail.siue.edu`, `a@siue.edu.evil.test`, `a+b@siue.edu` and `a@siue.edu\r\nBcc: x` get the generic reply and no link;
   - the mailer refuses each of them as a recipient.
   Test in Task 3.

---

### Task 1: Named people and caps from the server's configuration

**Files:**
- Create:
  - `websites/www.cs/admin/lib/People.php`
  - `websites/www.cs/admin/lib/Address.php`
  - `websites/www.cs/tools/studio-config.php` (validates the JSON on stdin; exit 0/1)
  - `websites/www.cs/tests/php/AdminPeopleTest.php`
- Modify:
  - `websites/www.cs/admin/lib/bootstrap.php` (require `People.php`; `admin_people(): Admin\People`)
  - `websites/www.cs/admin/.htaccess` and `websites/www.cs/docker/nginx/default.conf` (deny `/admin/config/`)
  - `websites/www.cs/deploy.sh` (stage `admin/config/studio.json` from `$STUDIO_CONFIG`)
  - `.github/workflows/deploy.yml` (load `STUDIO_CONFIG`)
  - `websites/www.cs/tests/php/AdminDeployTest.php`
  - `websites/www.cs/.gitignore` (`admin/config/`)

**Interfaces:**
- Produces, in `Admin\People`:
  - `People::load(?string $path = null): People`. Its path is `STUDIO_CONFIG_FILE` when set, else `admin/config/studio.json`. A missing file gives the defaults. A malformed one is logged and gives the defaults; it never throws.
  - `People::fromJson(string $json): ?People`, null when malformed.
  - `isAdmin(string $email): bool`, `hasAllowance(string $email): bool`, `isNamed(string $email): bool`. Each takes a normalized address.
  - `maxAccounts(): int` and `maxSharedBytes(): int`.
  - `Admin\Auth::OWNER` (`'wgrim@siue.edu'`) is always admin and always has the allowance, whatever the file says. A broken config can never lock the owner out.
- Produces, in `Admin\Address`:
  - `normalize(string $raw): ?string` gives trimmed lower case, or null on CR/LF or no single `@`;
  - `studio(string $raw): ?string` gives the normalized address when its domain is exactly `siue.edu` and its local part matches `/^[a-z0-9._-]{1,64}$/` (no `+`), else null.
- The file's shape is `{"people":[{"email":"a@siue.edu","admin":bool,"allowance":bool}],"max_accounts":int,"max_shared_bytes":int}`. The two caps are optional, and each entry's email must pass `Address::studio()`.

- [ ] **Step 1: Write the failing tests** in `AdminPeopleTest`:
  - `testTheOwnerIsAlwaysAnAdminWithTheAllowance` (no file, an empty list, a list without him);
  - `testFlagsComeFromTheFile`;
  - `testDefaultsAre500AccountsAndOneGigabyte`: `maxAccounts() === 500` and `maxSharedBytes() === 1_073_741_824`;
  - `testAMalformedFileGivesTheDefaults`: bad JSON, a non-siue address, a `+` address, a negative cap;
  - `testAddressesAreMatchedNormalized`;
  - `testStudioAddressesAreExactlySiueWithoutPlus` (`Address::studio`: `a@siue.edu` passes; `a@mail.siue.edu`, `a@siue.edu.evil.test`, `a+b@siue.edu` and CR/LF give null).
  - In `AdminDeployTest`:
    - `testTheConfigFolderIsNeverServed` (`.htaccess` and nginx both deny `/admin/config/`);
    - `testTheDeployWritesTheConfigOnlyFromTheEnvironment`: `LIST=1 STUDIO_CONFIG='{"people":[]}' ./deploy.sh` lists `admin/config/studio.json`, and without the variable it does not.
- [ ] **Step 2: Run** `PHPUNIT --filter 'AdminPeopleTest|AdminDeployTest'`. Expected: FAIL (`Admin\People` not found).
- [ ] **Step 3: Implement `People` and `tools/studio-config.php`.** In `deploy.sh`:
  - when `STUDIO_CONFIG` is set, pipe it through `php tools/studio-config.php` and write it to `$stage/admin/config/studio.json`, so it joins the hash and the manifest;
  - a real deploy (not `LIST`/`DRY_RUN`) without it stops with `deploy: STUDIO_CONFIG is not set (the studio-config field of the SIUE 1Password item)`.
  In `deploy.yml`, add to the load-secrets step:
  ```yaml
  STUDIO_CONFIG: op://khvwk3iogv3mhhjui4se7xqyni/ioa6izbxvctbalcb65y5fr3esu/studio-config
  ```
  and pass it to the Deploy step's environment. The workflow's header comment names the field. Keep `admin/config/` out of git (`.gitignore`).
- [ ] **Step 4: Run** the same filter, then `LIST=1 ./deploy.sh | grep -c admin/config` (expected `0`). Expected: PASS.
- [ ] **Step 5: Write the owner's steps** into the PR description, under "Before merging (owner)":
  > 1. Open 1Password, vault **SIUE**, item **SIUE** (the deploy login).
  > 2. Add a field named exactly `studio-config` (type: text) with this value, adding a line per named person if you have any:
  >    `{"people":[{"email":"wgrim@siue.edu","admin":true,"allowance":true}],"max_accounts":500,"max_shared_bytes":1073741824}`
  > 3. Save. Until this field exists, every deploy stops at "Load the deploy login" and the site stays as it is.
  > 4. Later changes to the list: edit the field, then GitHub, **Actions**, **deploy**, **Run workflow** on `main`.
- [ ] **Step 6: Commit** `git commit -m "Admin: named people and studio caps from the deploy's configuration"`

### Task 2: Accounts and the per-account workroom store

**Files:**
- Create:
  - `websites/www.cs/music/lib/Accounts.php`
  - `websites/www.cs/music/lib/Limits.php`
  - `websites/www.cs/tests/php/MusicAccountsTest.php`
  - `websites/www.cs/tests/php/MusicMigrationTest.php`
- Modify:
  - `websites/www.cs/admin/lib/Db.php` (`once()` becomes `public static`; the `accounts` table in `SCHEMA`)
  - `websites/www.cs/music/lib/Store.php`
  - `websites/www.cs/music/lib/bootstrap.php` (`music_store()`)
  - `websites/www.cs/tests/php/MusicFakes.php` (`music_world()` makes an account)
  - `websites/www.cs/tests/php/MusicStoreTest.php` and `MusicStoreDraftOrderTest.php` (the new constructor)

**Interfaces:**
- **Schema:**
  - `accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, last_sign_in_at INTEGER)`.
  - After migration `music-accounts-1`:
    - `music_notes` gains `account_id INTEGER NOT NULL` (indexed);
    - `music_drafts` is keyed `(account_id, piece, version)`;
    - `music_keyring` is keyed `account_id INTEGER PRIMARY KEY` (the `id = 1` check goes).
  - **Draft files** move from `drafts/<piece>/<v>/` to `drafts/<account>/<piece>/<v>/`.
  - **Compression:** each stored `score.json`/`score.musicxml` is gzipped to `.gz`, and the row's `size` is recomputed as stored bytes.
  - **Ownership:** every existing row and file belongs to the account for `Admin\Auth::OWNER`, created by the migration.
  - **Order:** files move before the COMMIT, and a rerun finds the moved layout and does nothing.
- **`Music\Limits` (readonly):**
  - fields `int $quotaBytes`, `int $maxNoteBytes`, `int $maxRequestBytes`, `bool $scoreOnly`, `bool $sharedPool`;
  - `Limits::for(Admin\People $p, string $email): Limits` gives the allowance `(104_857_600, 2_097_152, 8_388_608, false, false)` and everyone else `(5_242_880, 1_048_576, 262_208, true, true)`.
- **`Music\Accounts`** (`__construct(\PDO $db, Admin\Clock $clock, Admin\People $people)`):
  - `idFor(string $email): ?int`;
  - `emailOf(int $id): ?string`;
  - `signIn(string $email): ?int` creates on first use and stamps `last_sign_in_at`. It returns null (studio full) for a new address that is not named once `max_accounts` accounts exist or the shared bytes reach `max_shared_bytes`. It runs in BEGIN IMMEDIATE.
  - `usage(int $id): int` (drafts plus notes);
  - `sharedUsage(): int`, the sum over accounts whose email `!People::hasAllowance`;
  - `list(): list<array{id:int,email:string,usage:int,last_sign_in_at:?int,named:bool}>`;
  - `ownerId(): int` creates the owner's row when missing.
- **`Music\Store`:**
  - `__construct(\PDO $db, string $dir, Admin\Clock $clock, int $account, Limits $limits, Accounts $accounts)`.
  - Every SQL statement has `account_id = ?`.
  - **Changed:**
    - `putDraft()` checks the account's room and, when `$limits->sharedPool`, the shared room. It throws `DraftRejected('over_quota')` with `public readonly int $room`.
    - `addNote()` throws `NoteRejected('over_quota')` (with `$room`) and `too_large` above `$limits->maxNoteBytes`.
    - `draftFile()` becomes `draftBytes(string $piece, int $version, string $name): ?string`, decompressed.
  - **New:**
    - `deletePiece(string $piece): int` (drafts deleted);
    - `room(): int`;
    - `wipe(): void` (every note, draft and file and the keyring of this account, in one transaction, files before COMMIT).
  - **Statics:** `fingerprintsIn(\PDO $db, int $account)` and `removeKeyring(\PDO $db, int $account)` now take the account. The admin hub passes the owner's (`bootstrap.php` `admin_key_fingerprints`, `admin_key_removers`).
  - `music_store(\PDO $db, Admin\Clock $clock, int $account): Music\Store`.

- [ ] **Step 1: Write the failing tests.** `MusicAccountsTest`:
  - `testSignInCreatesOneAccountPerAddress`;
  - `testANewAddressIsRefusedOnceMaxAccountsIsReached` (config `max_accounts: 2`);
  - `testANewAddressIsRefusedOnceTheSharedPoolIsFull`;
  - `testNamedPeopleSignUpWhenFull`;
  - `testUsageCountsStoredDraftBytesAndSealedNotes`;
  - `testSharedUsageLeavesOutTheAllowance`.
  `MusicMigrationTest` builds the pre-migration tables and files by hand:
  - `testTheOwnersNotesDraftsAndKeyringBecomeHisAccounts`;
  - `testDraftFilesMoveUnderTheAccountAndTextIsGzipped`: `gzdecode` of the stored file equals the old bytes;
  - `testASecondOpenChangesNothing`;
  - `testAThrowMidMigrationLeavesEveryDraftReadable`.
  `MusicStoreTest`, new:
  - `testAStudioUploadPastFiveMegabytesIsRefusedWithTheRoomLeft`: the room equals `5_242_880 - usage`;
  - `testTheSharedRoomIsNamedWhenItIsSmaller` (Review Focus 2);
  - `testTheAllowanceIsNeverRefusedForThePool`;
  - `testTheTwentyFirstDraftRollsOffOnlyItsOwnPiece`;
  - `testAFullStudioDeletesNothingToMakeRoom`;
  - `testDeletePieceRemovesItsDraftsAndFiles`;
  - `testWipeLeavesNoRowsOrFilesOfThatAccountAndTouchesNoOther`;
  - `testStoredScoresAreGzipAndServedWhole`.
- [ ] **Step 2: Run** `PHPUNIT --filter 'MusicAccounts|MusicMigration|MusicStore'`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Rebuild the three music tables with SQLite's create, copy, drop and rename inside `Admin\Db::once($db, 'music-accounts-1', …)`, called from `Store::__construct`.
  - Keep the existing column-adding code ahead of it, for databases older than the columns.
  - Room is `min(quota - usage, sharedPool ? max_shared - sharedUsage : PHP_INT_MAX)`, clamped at 0.
- [ ] **Step 4: Run** the same filter plus `PHPUNIT --filter 'MusicApi|MusicPages'` (callers updated to pass the owner's account for now). Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: accounts, per-account storage with limits, the owner's data moved to his account"`

### Task 3: Realms in the sign-in kit; the admin hub for named admins only

**Files:**
- Create:
  - `websites/www.cs/admin/lib/Realm.php`
  - `websites/www.cs/admin/lib/SignIn.php` (the sign-in flow moved out of `Pages.php`)
  - `websites/www.cs/tests/php/AdminRealmTest.php`
- Modify:
  - `websites/www.cs/admin/lib/Auth.php`, `Sessions.php`, `Pages.php`, `Mailer.php`, `Db.php`, `bootstrap.php`
  - `websites/www.cs/admin/login.php`, `verify.php`, `logout.php`
  - the admin tests that name `Auth::ALLOWED` (rename to `Auth::OWNER`)

**Interfaces:**
- Consumes `Admin\Address` and `Admin\People` (Task 1).
- **`Admin\Realm` (readonly):**
  - fields `string $name` (`'admin'|'studio'`), `string $baseUrl`, `string $cookiePath`, `string $cookie` (`__Secure-admin` | `__Secure-studio`), `string $tables` (`''` | `'studio_'`), `\Closure $allows` (`fn(string $normalized): bool`), `array{global:int,ip:int,address:int,rows:int} $limits`, `string $stylesheet`;
  - cookie names are derived: `$cookie`, `$cookie.'-device'`, `$cookie.'-pending'`, `$cookie.'-confirm'`;
  - `Realm::admin(People $p, string $baseUrl)` allows `People::isAdmin`, with limits 30/20/3/1000;
  - `Realm::studio(string $adminBaseUrl)` has base `<admin base minus admin/>music/` and cookie path `admin_cookie_path(base) . 'music/'` when that ends in `/~user/`, else `/music/`. It allows `Address::studio(...) !== null`, with limits 300/100/3/3000;
  - studio tables: `studio_links`, `studio_link_requests`, `studio_devices (token_hash, account_id, created_at, expires_at)`, `studio_sessions (id_hash, account_id, created_at, seen_at, ip, agent, csrf_nonce)`, made in `Db::SCHEMA`.
- **`Admin\Auth`:**
  - `__construct(\PDO $db, Clock $clock, Realm $realm)`;
  - `OWNER` replaces `ALLOWED`;
  - `allowed()` becomes the realm's `allows` over `Address::normalize`;
  - links store the normalized address (never what a refused stranger typed);
  - per-address counting uses that address;
  - `isTrustedDevice(?string $token, ?int $account = null)`.
- **`Admin\Sessions`:**
  - `__construct(\PDO $db, Clock $clock, Realm $realm)`;
  - `start(Request $r, ?int $account = null): string`;
  - `account(Request $r): ?int` (refreshes like `current()`, studio realm only);
  - `endAll(?int $account = null)`.
- **`Admin\SignIn`:**
  - `__construct(\PDO $db, Clock $clock, Mailer $mailer, Realm $realm, ?\Closure $onSignedIn = null)`, where `$onSignedIn(string $email): int|false|null` gives an account id, `false` (studio full) or `null` (admin realm: no account);
  - methods `loginForm`, `requestLink`, `confirm`, `signIn`, `signOut`, `signOutEverywhere`, `safeNext`, `flush`, with today's behaviour;
  - the sign-in notice goes to the address that signed in.
- **`Admin\Pages`** keeps hub, keys and health and delegates sign-in to `SignIn` with `Realm::admin(admin_people(), $baseUrl)`. `safeNext` no longer admits `../music/` targets.
- **Mail:** `SmtpMailer::send`/`CaptureMailer::send` refuse any recipient for which `Address::studio($to) === null`, and send from `Auth::OWNER`.

- [ ] **Step 1: Write the failing tests** in `AdminRealmTest`:
  - `testTheAdminSignInIssuesLinksOnlyToNamedAdmins`: a named non-admin and a plain student get the generic reply and no row in `links`;
  - `testTheStudioSignInTakesAnySiueAddress`;
  - `testAddressVariantsAreRefusedAlike` (Review Focus 5 inputs);
  - `testCaseAndSpacesMapToOneAddress`;
  - `testFortyStudentsBehindOneIpAllGetLinks` and `testTheHundredAndFirstFromOneIpGetsNone` (Review Focus 1);
  - `testAStudioLinkNeverOpensAnAdminSessionAndBack`: tokens are looked up only in their realm's table;
  - `testStudioCookiesCarryTheMusicPath`: `Path=/~wgrim/music/` for base `https://www.cs.siue.edu/~wgrim/admin/`;
  - `testTheMailerRefusesNonSiueRecipients`;
  - `testSignOutEverywhereInTheStudioEndsOnlyThatAccount`.
  The existing `AdminAuthTest`, `AdminSessionsTest`, `AdminPagesTest` and `AdminMailTest` pass after the rename and the constructor changes, with their assertions unchanged.
- [ ] **Step 2: Run** `PHPUNIT --filter 'Admin'`. Expected: FAIL on the new tests.
- [ ] **Step 3: Implement.** Table names come only from `Realm::$tables`, never from input; build each SQL string with it as a fixed prefix.
- [ ] **Step 4: Run** `PHPUNIT --filter 'Admin'` and `make admin-smoke`. Expected: PASS, `ADMIN-SMOKE-OK`.
- [ ] **Step 5: Commit** `git commit -m "Admin: sign-in realms; the hub admits named admins only"`

### Task 4: Studio sign-in under music/

**Files:**
- Create:
  - `websites/www.cs/music/login.php`, `verify.php`, `logout.php` (thin, like `admin/login.php`)
  - `websites/www.cs/tests/php/StudioSignInTest.php`
- Modify:
  - `websites/www.cs/music/lib/bootstrap.php` (`studio_realm(): Admin\Realm`, `studio_sign_in(...)`)
  - `websites/www.cs/admin/README.md` and `websites/www.cs/music/README.md` (the two sign-ins)

**Interfaces:**
- Consumes `Admin\SignIn`, `Admin\Realm::studio` (Task 3) and `Music\Accounts::signIn` (Task 2).
- Produces the studio sign-in pages:
  - `music/login.php` (GET form, POST request);
  - `music/verify.php` (GET confirm, POST sign in): at the moment the link is spent, `Accounts::signIn($email)` runs. On `false` the answer is 200 with the title "The studio is full" and the body "The studio has no room for new people right now. Ask Will Grim, who runs it.", and no session starts;
  - `music/logout.php` (POST; `?all=1` is everywhere for this account).
- **Where sign-in leads:** to `index.php`, or to `safeNext` targets inside `music/` (`index.php`, `studio.php`, `piece.php?id=…&v=…`).

- [ ] **Step 1: Write the failing tests** in `StudioSignInTest`:
  - `testAStudentSignsInAndHasAnAccount`;
  - `testTheSecondSignInReusesTheAccount`;
  - `testANewSignUpWhenFullSeesTheStudioIsFullAndGetsNoSession`;
  - `testTheFullPageIsShownOnlyAfterTheLinkSoTheReplyStaysGeneric`: the POST reply bytes are identical for a new address, a known address and a refused one;
  - `testTheNoticeGoesToThePersonWhoSignedIn`;
  - `testNextStaysInsideTheStudio` (`../admin/` is refused).
- [ ] **Step 2: Run** `PHPUNIT --filter StudioSignIn`. Expected: FAIL.
- [ ] **Step 3: Implement** the three thin pages via `music_run`-style serving with `Realm::studio`.
- [ ] **Step 4: Run** `PHPUNIT --filter 'StudioSignIn|Admin'`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: sign in to your studio with any siue.edu address"`

### Task 5: Workroom routes on studio sessions, and the isolation rules

**Files:**
- Create:
  - `websites/www.cs/music/delete-draft.php` (POST: one draft, or a whole piece with `piece` and no `v`)
  - `websites/www.cs/tests/php/StudioIsolationTest.php`
- Modify:
  - `websites/www.cs/music/lib/Pages.php`
  - `websites/www.cs/music/lib/Http.php` (`serveFile` becomes `serveBytes(string $bytes, string $mime, ?string $range)`)
  - `websites/www.cs/music/lib/bootstrap.php` (`music_run` builds the store after the gate)
  - `websites/www.cs/music/keyring.php` (POST)
  - `websites/www.cs/tests/php/MusicPagesTest.php` and `MusicFakes.php` (`music_signed_in` makes a studio session for an account)

**Interfaces:**
- **`Music\Pages`:**
  - `__construct(\Closure $storeFor /* fn(int $account): Store */, Accounts $accounts, Admin\People $people, Admin\Sessions $studioSessions, string $assetVersion, string $baseUrl)`.
  - `guarded()` resolves the account with `$studioSessions->account($r)`. A missing session redirects a page to `music/login.php?next=…` and answers a data route 401 `{"error":"signed_out"}`. The admin session is never consulted.
- **New routes:**
  - `keyring(Request, string $body)` POST: session plus `X-CSRF`, body validated by the moved `Music\Keyring::parseUpload(string $body): ?array` (today's `Api::keyringUpload`/`keyringIsWellFormed`, unchanged rules). It stores to this account.
  - `deleteDraft(Request)` POST: session plus CSRF; `piece` and optional `v`.
- **The shell:** the `<body>` gains `data-note-max` (`Limits::maxNoteBytes`), `data-room` (`Store::room()`), `data-named` (`"1"` for the allowance) and `data-account-has-key` (`"1"` when a keyring is stored).
- **Refusals:** `NOTE_ERRORS` gains `over_quota => 413`, whose JSON carries `room` (bytes) and `message`. The message is made by `Music\Usage::refusal(int $room, int $quota): string`, for example "Your studio has 1.2 MB of 5 MB left. Delete drafts or picked-up notes to make room." It uses `Music\Usage::human(int $bytes)`: MiB with one decimal at 1 MB and above, else whole KB.

- [ ] **Step 1: Write the failing tests.** `StudioIsolationTest`: two accounts A and B, each with a note, a draft `p` v1 and a keyring. Each rule is its own test:
  - `testACannotReadBsNote`;
  - `testACannotListBsNotes`;
  - `testACannotDeleteBsNote`;
  - `testACannotDeleteAllOfBsNotes` (`all=1` leaves B's);
  - `testACannotReadBsDraftFile`;
  - `testACannotListBsDrafts`;
  - `testAPublishOfTheSamePieceAndVersionNeverTouchesBs`;
  - `testACannotDeleteBsDraftOrPiece`;
  - `testACannotReadOrReplaceBsKeyring`;
  - `testTheIndexListsOnlyOwnPieces`;
  - `testAStudioSessionNeverReachesTheAdminHub`: the studio cookie's value sent as `__Secure-admin` to `Admin\Pages::hub` and `keysPanel` redirects to `login.php`, and the studio cookie path excludes `/~wgrim/admin/`;
  - `testAnAdminSessionNeverOpensAStudioPage`.
  `MusicPagesTest`, new:
  - `testANoteOverTheStudioLimitIsRefusedWithTheRoom`;
  - `testAStudioNoteOverOneMegabyteIsTooLarge`;
  - `testTheShellCarriesTheNoteMaxRoomAndNamed`;
  - `testKeyringUploadNeedsSessionAndCsrfAndKeepsTheEnvelopeRules`.
- [ ] **Step 2: Run** `PHPUNIT --filter 'StudioIsolation|MusicPages'`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `PHPUNIT --filter 'StudioIsolation|MusicPages|MusicStore|MusicBootstrap'`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: every workroom route serves the signed-in person's own studio"`

### Task 6: Score limits for untrusted drafts

**Files:**
- Create:
  - `websites/www.cs/music/lib/ScoreRules.php`
  - `websites/www.cs/tests/php/MusicScoreRulesTest.php`
- Modify:
  - `websites/www.cs/music/lib/Api.php` (`checkFiles` calls `ScoreRules::check`)
  - `websites/www.cs/music/lib/bootstrap.php`

**Interfaces:**
- **Constants:** `ScoreRules::MAX_SCORE_BYTES = 262_144`, `MAX_NOTES = 20_000`, `MAX_LANES = 16`.
- **`ScoreRules::check(array $files, array $score, Limits $limits, array $instruments): ?string`** gives the first refusal, or null:
  - `too_large` when `score.json` is over 256 KB;
  - `too_many_notes`;
  - `too_many_lanes`;
  - `unknown_instrument` (score-only drafts, each `lanes[].sound.instrument` not in `$instruments`);
  - `score_only` when `$limits->scoreOnly` and any file but `score.json` is sent.
- **`music_library_instruments(): list<string>`** reads the keys of `music/library/library.json` `instruments`, read once per request.

- [ ] **Step 1: Write the failing tests:**
  - `testAScoreOf256KbPassesAndOneByteMoreIsRefused`;
  - `testTwentyThousandNotesPassAndOneMoreIsRefused`;
  - `testSixteenLanesPassAndSeventeenAreRefused`;
  - `testAnInstrumentOutsideTheLibraryIsRefused`;
  - `testAStudioUserMaySendOnlyTheScore`;
  - `testTheAllowanceMayStillSendAudioAndMusicXml`;
  - `testEveryCommittedPieceStillPasses` (each `music/pieces/*/v*/score.json` under the allowance limits).
- [ ] **Step 2: Run** `PHPUNIT --filter 'MusicScoreRules|MusicApi'`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same filter. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: limits on untrusted scores"`

### Task 7: AI keys and the per-account API

**Files:**
- Create:
  - `websites/www.cs/music/lib/AiKeys.php`
  - `websites/www.cs/music/lib/KeyGate.php`
  - `websites/www.cs/music/api/delete-piece.php`
  - `websites/www.cs/tests/php/MusicAiKeysTest.php`
- Modify:
  - `websites/www.cs/music/lib/Api.php`
  - `websites/www.cs/music/lib/bootstrap.php`
  - `websites/www.cs/admin/lib/Db.php` (`studio_keys`, `studio_key_hits`)
  - `websites/www.cs/tests/php/MusicApiTest.php`

**Interfaces:**
- **Schema:** `studio_keys (id INTEGER PRIMARY KEY, account_id INTEGER NOT NULL, label TEXT NOT NULL, key_hash TEXT NOT NULL UNIQUE, scopes TEXT NOT NULL, created_at INTEGER NOT NULL, last_used_at INTEGER, revoked_at INTEGER)` and `studio_key_hits (key_id, at)`.
- **`Music\AiKeys`:**
  - `SCOPES = ['notes:pickup' => 'read notes', 'drafts:publish' => 'publish drafts', 'drafts:delete' => 'delete drafts']`, `MAX_ACTIVE = 10`;
  - `create(int $account, string $label, list<string> $scopes): string` gives the key, shown once. It throws `\InvalidArgumentException` for a bad label (1–80), no scope, a scope outside `SCOPES`, or the 11th active key;
  - `list(int $account): list<array{id,label,scopes,created_at,last_used_at,revoked_at}>`;
  - `revoke(int $account, int $id): bool`;
  - `deleteAll(int $account): void`.
- **`Music\KeyGate`:**
  - `__construct(\PDO $db, Admin\Clock $clock, Admin\Keys $adminKeys, Accounts $accounts, string $baseUrl)`.
  - `check(Admin\Request $r, string $scope): int|Admin\Response`: HTTPS first, then the Bearer key. A studio key gives its `account_id` (rate 60/min, scope checked). Otherwise `$adminKeys->check()`, and on success `Accounts::ownerId()`.
- **`Music\Api`:**
  - `__construct(\Closure $storeFor, KeyGate $gate)`;
  - every route builds its store for the gate's account;
  - `publishKeyring` stays admin-key-only (`keys:publish` exists only in the admin registry);
  - new `deletePiece(Request)` (POST `?piece=`, `drafts:delete`) answers `{"piece":…, "deleted": <n>}` or 404;
  - an over-quota publish answers 413 `{"error":"over_quota","room":<bytes>,"message":<Usage::refusal>}`.
- **Hook for project 3** (named, not built): `studio_keys` gains the AI's sealing public key and fingerprint there. `AiKeys::revoke` is the one place that will drop it.

- [ ] **Step 1: Write the failing tests.** `MusicAiKeysTest`:
  - `testAKeyIsShownOnceAndStoredHashed`;
  - `testOnlyTheThreeScopes` (`keys:publish` refused);
  - `testTheEleventhActiveKeyIsRefused`;
  - `testARevokedKeyAnswers401`;
  - `testAKeyReachesOnlyItsOwnAccount`: A's key lists, reads, publishes and deletes in A only, and B's piece gives 404;
  - `testTheOwnersAdminKeysStillReachHisStudio`;
  - `testAKeyCannotUploadAKeyring`;
  - `testDeletePieceRemovesEveryDraft`;
  - `testOverQuotaAnswers413WithTheRoom`.
  The existing `MusicApiTest` passes against the owner's account.
- [ ] **Step 2: Run** `PHPUNIT --filter 'MusicAiKeys|MusicApi'`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same filter, then `make music-test` (the owner's Python tool against its fake server; no change expected). Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: AI keys per studio; the API serves the key's own studio"`

### Task 8: The studio page: usage, AI keys, start over, sign out

**Files:**
- Create:
  - `websites/www.cs/music/studio.php`
  - `websites/www.cs/tests/php/StudioPageTest.php`
- Modify:
  - `websites/www.cs/music/lib/Pages.php` (`studio(Request)`, `studioAction(Request)`)
  - `websites/www.cs/music/lib/Accounts.php` (`startOver(int $account)`)

**Interfaces:**
- **`GET studio.php`** is a server-rendered page with no script needed:
  - "Your studio": `<address>`, a usage meter `<meter min=0 max=quota value=usage>` with "1.2 MB of 5 MB used";
  - the AI keys list (label, permissions in plain words, last used, Revoke);
  - "Make an AI key" (label plus the three checkboxes labelled `read notes`, `publish drafts`, `delete drafts`). A new key appears once in `<code class="secret">`, with "Copy it now: it is not shown again.";
  - "Start over";
  - "Sign out" and "Sign out everywhere".
- **`POST studio.php`** takes `action` = `make-key|revoke-key|start-over` and a `csrf` form field (the session's token, checked with `checkCsrf`).
  - `start-over` needs `confirm` exactly `start over` (trimmed, case-insensitive). It then runs `Accounts::startOver`, which is `Store::wipe()` plus `AiKeys::deleteAll()` in one transaction, and the session stays.
  - The start-over text reads: "Start over deletes every piece, draft and note in your studio, your notes key and your AI keys. Nobody can undo it, and nobody can get them back. Use it if you forgot your passphrase. Type start over to confirm."

- [ ] **Step 1: Write the failing tests:**
  - `testThePageShowsUsageOfFiveMegabytes`;
  - `testTheAllowanceShowsOneHundredMegabytes`;
  - `testAMadeKeyIsShownOnceThenOnlyItsLabel`;
  - `testRevokeNeedsCsrf`;
  - `testStartOverNeedsTheTypedConfirmation`;
  - `testStartOverEmptiesTheStudioAndKeepsTheSession`;
  - `testAKeyAnswers401AfterStartOver` (Review Focus 4);
  - `testAPublishThatWonTheLockBeforeStartOverLeavesNoFilesAfter`;
  - `testThePageNeedsAStudioSession`.
- [ ] **Step 2: Run** `PHPUNIT --filter StudioPage`. Expected: FAIL.
- [ ] **Step 3: Implement.** Link the page from the workroom header ("Your studio") in `Pages::shell`.
- [ ] **Step 4: Run** `PHPUNIT --filter 'StudioPage|StudioIsolation'`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Music: your studio page: usage, AI keys, start over"`

### Task 9: The admin view of studios

**Files:**
- Create:
  - `websites/www.cs/admin/studios.php`
  - `websites/www.cs/tests/php/AdminStudiosTest.php`
- Modify:
  - `websites/www.cs/admin/lib/Pages.php` (`studios(Request)`, `studiosAction(Request)`)
  - `websites/www.cs/admin/lib/bootstrap.php` (`admin_dashboards()` adds `'Studios' => 'studios.php'`)
  - `websites/www.cs/music/lib/Accounts.php` (`remove(int $account)`)

**Interfaces:**
- **`GET studios.php`** (admin session) shows a table of every account: address, "named" when it is, usage (`Usage::human`), last sign-in (date), and Remove. Above it: shared usage of `max_shared_bytes`, and accounts of `max_accounts`. Never a piece name, project, title or any content.
- **`POST studios.php`** takes `action=remove`, `id`, `csrf`, and `confirm` equal to the account's address.
  - `Accounts::remove()` runs `startOver()`, then deletes the account row and its studio sessions, devices and unused links.
  - The owner's account cannot be removed; the answer is 400 "The owner's studio cannot be removed here."

- [ ] **Step 1: Write the failing tests:**
  - `testTheListShowsUsageAndLastSignInAndNoPieceNames`: a draft titled `secret-title` never appears in the body;
  - `testRemoveNeedsTheTypedAddressAndCsrf`;
  - `testRemovedAccountsLoseEverythingAndTheirSessions`;
  - `testTheOwnerCannotBeRemoved`;
  - `testAStudioSessionCannotOpenTheList`;
  - `testTheHubLinksStudios`.
- [ ] **Step 2: Run** `PHPUNIT --filter AdminStudios`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `PHPUNIT --filter 'AdminStudios|AdminPages'`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Admin: a list of studios with their usage, and remove"`

### Task 10: The notes key made on the page

**Files:**
- Create:
  - `websites/www.cs/games/workroom/src/keymaker.ts`
  - `websites/www.cs/games/workroom/src/ui/MakeKeyPanel.tsx`
  - `websites/www.cs/games/workroom/test/keymaker.test.ts`
- Modify:
  - `websites/www.cs/games/workroom/src/api.ts` (`uploadKeyring`)
  - `websites/www.cs/games/workroom/src/notes-session.ts`
  - `websites/www.cs/games/workroom/src/ui/UnlockPanel.tsx`
  - `websites/www.cs/games/workroom/src/ui/Workroom.tsx`
  - `websites/www.cs/games/workroom/src/unlock.ts` (doc comment: the page now locks)
  - `websites/www.cs/games/workroom/test/no-storage.test.ts` and `api.test.ts`
  - `websites/www.cs/games/workroom/dist/*`

**Interfaces:**
- **`keymaker.ts`:**
  - `MIN_PASSPHRASE = 12`;
  - `checkPassphrase(a: string, b: string): 'short' | 'differ' | null`;
  - `makeNotesKey(passphrase: string): Promise<{ locked: LockedKeyring; current: string }>`. It generates RSA-OAEP 4096 SHA-256 (extractable only inside this function), takes the SPKI fingerprint with `fingerprintOf`, exports pkcs8 and calls `lockKeyring([{fingerprint, pkcs8}], passphrase)`. It zeroes the pkcs8 bytes after locking.
- **`PageApi.uploadKeyring(locked: LockedKeyring, current: string): Promise<void>`** POSTs `keyring.php` with `{"keyring", "current", "previous": []}` and `X-CSRF`.
- **The panel:** when the keyring answer is `NoKeyring`, the panel says:
  > Make your notes key. Your notes are sealed in this browser with a key only your passphrase unlocks. Nobody can reset it, not even the people who run this site. If you forget it, the only way back is Start over on Your studio, which deletes everything.

  It has two passphrase fields and "Make my notes key". On success it unlocks at once with the same passphrase, through the existing `unlockKeyring` path.
- **Wording for studio users** (`data-named` not `"1"`): `UNLOCK_MESSAGES.noKeyring`, `KEPT_MESSAGES.no_key` and `NOTES_OFF` drop "make music-setup" and point to the panel. `ConnectAi` renders only when `data-named="1"`; project 3 rewrites it for everyone.

- [ ] **Step 1: Write the failing tests** in `keymaker.test.ts`:
  - `a made key unlocks with its passphrase and seals a note that opens` (round trip through `unlockKeyring`, `seal`, `open`);
  - `the fingerprint uploaded is the SPKI SHA-256 of the key`;
  - `the envelope is PBKDF2-SHA-256 at 600000 rounds`;
  - `a wrong passphrase does not unlock it`;
  - `passphrases under 12 characters or not matching are refused`.
  - `api.test.ts`: `uploadKeyring posts the three fields with the CSRF header`.
  - `no-storage.test.ts`: making a key writes nothing of it to browser storage.
- [ ] **Step 2: Run** `NODE keymaker`, `NODE api`, `NODE no-storage`. Expected: FAIL.
- [ ] **Step 3: Implement,** then rebuild `dist/`.
- [ ] **Step 4: Run** the three again, then `games/workroom/test.sh`. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Workroom: make your notes key on the page"`

### Task 11: Limits and deleting on the page

**Files:**
- Create:
  - `websites/www.cs/games/workroom/src/studio-limits.ts`
  - `websites/www.cs/games/workroom/test/studio-limits.test.ts`
- Modify:
  - `websites/www.cs/games/workroom/src/api.ts` (`RefusedReason` gains `'over_quota'`, `UploadResult` refused carries `room?: number`; `deleteDraft(piece, version?)`)
  - `websites/www.cs/games/workroom/src/outbox.ts`
  - `websites/www.cs/games/workroom/src/main.ts`
  - `websites/www.cs/games/workroom/src/ui/History.tsx`
  - `websites/www.cs/games/workroom/src/ui/PiecesIndex.tsx`
  - `websites/www.cs/games/workroom/dist/*`

**Interfaces:**
- **`studio-limits.ts`:**
  - `readLimits(body: HTMLElement): { noteMax: number; room: number; named: boolean }`, falling back to `MAX_NOTE_BYTES` and `Infinity` when the attributes are absent;
  - `humanBytes(n: number): string`, the same rule as PHP's `Usage::human`.
- **The outbox** pre-checks against `noteMax`, not the constant. `KEPT_MESSAGES.over_quota(room)` reads: "Your studio is full: {humanBytes(room)} left. Delete drafts or picked-up notes to make room; this note stays on this device until then."
- **The piece page** gets "Delete this draft" and "Delete this piece". Each asks with the browser's own confirm (`window.confirm`), POSTs `delete-draft.php`, then goes to the next newest draft or to the pieces list.

- [ ] **Step 1: Write the failing tests:**
  - `studio-limits.test.ts`: `limits come from the body`, `humanBytes matches the server` (0 → "0 KB", 1_258_291 → "1.2 MB", 5_242_880 → "5 MB");
  - `outbox.test.ts`: `a note over the studio's note max stays on the device as too_large`, `over_quota keeps the note and names the room`;
  - `api.test.ts`: `deleteDraft posts piece and version with CSRF`.
- [ ] **Step 2: Run** `NODE studio-limits`, `NODE outbox`, `NODE api`. Expected: FAIL.
- [ ] **Step 3: Implement,** then rebuild `dist/`.
- [ ] **Step 4: Run** them again. Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "Workroom: studio limits on the page, delete a draft or a piece"`

### Task 12: End to end, and the docs

**Files:**
- Create: `websites/www.cs/tests/e2e/studio.local.ts`
- Modify:
  - `websites/www.cs/tests/e2e/workroom.local.ts` (`signIn` signs in at `music/login.php`; `createKey` signs in to `admin/` separately, as a named admin does)
  - `websites/www.cs/compose.admin-local.yaml` (`STUDIO_CONFIG_FILE` pointing at a test config that names only the owner)
  - `websites/www.cs/music/README.md`
  - `websites/www.cs/admin/README.md`

**Interfaces:**
- Consumes everything above; produces no code interface.

- [ ] **Step 1: Write the spec** `studio.local.ts`. In one serial test, `a student's studio from first sign-in to start over`:
  - `student1@siue.edu` signs in through the captured mail, sees an empty studio and makes a notes key (12+ characters, twice);
  - pins a typed note and sees it waiting;
  - on Your studio, makes an AI key with all three permissions, reads it once, and reloads to see only its label;
  - with that key (`request.post`), publishes `games/workroom/test/fixtures/draft-score` as piece `built-piece` v1, and the pieces list shows it. Opening it plays the browser-built sound;
  - deletes the draft on the page;
  - starts over by typing `start over`, and sees an empty studio and the "Make your notes key" panel again;
  - the old AI key now gets 401;
  - the same browser at `admin/` is sent to the admin sign-in.
- [ ] **Step 2: Run** `make music-e2e E2E_ARGS=studio.local.ts`. Expected: FAIL before Tasks 3–11 land, PASS on this branch.
- [ ] **Step 3: Update `workroom.local.ts`,** then run `make music-e2e E2E_ARGS=workroom.local.ts`. Expected: PASS.
- [ ] **Step 4: Update the READMEs.** In `music/README.md`: the studios, both sign-ins, the limits table with this plan's exact values, start over, AI keys, and "named people come from the `studio-config` field of the SIUE 1Password item". In `admin/README.md`: realms, admins from that config, `studios.php`, and `admin/config/` in the security model ("readable by other host accounts' PHP, like everything stored").
- [ ] **Step 5: Run** `make test`. Expected: PASS.
- [ ] **Step 6: Commit** `git commit -m "Music: studio end-to-end check and docs"`
- [ ] **Step 7: Write the owner's steps after deploy** into the PR description, under "After the deploy (owner)":
  > 1. Open https://www.cs.siue.edu/~wgrim/music/ and sign in with wgrim@siue.edu (the studio has its own sign-in; the admin hub keeps its own).
  > 2. Your pieces and drafts are there. Unlock your notes with your 1Password passphrase as before.
  > 3. Ask one student or colleague with an @siue.edu address to sign in at the same page. If their email has not arrived within ten minutes (spam folder included), tell Claude: the site's mail server may not deliver to addresses other than yours.
  > 4. Open https://www.cs.siue.edu/~wgrim/admin/studios.php and check the new account is listed with its usage.
