# Studio keys: change passphrase, forgot passphrase, emailed confirmation

**Goal:** On Your studio, a person changes their notes passphrase without losing anything, deletes only their notes and
notes key when they forgot it, and confirms that and Start over through a one-use link mailed to their own address.

**Spec:** `docs/superpowers/specs/2026-10-29-music-studios-design.md` (updated by this plan: "No resets", Start over,
Forgot your passphrase). Builds on `docs/superpowers/plans/2026-10-29-music-studios.md`.

## Design

- **Change passphrase** (`studio.php`, a script panel inside a `studio-card`, shown when the studio holds a keyring):
  - fields: current passphrase, new passphrase, the new one again (`checkPassphrase` rules: at least 12, the same);
  - the browser fetches the locked keyring, opens it with the current passphrase (`relockKeyring` in `unlock.ts`:
    every entry is checked against its fingerprint as `unlockKeyring` does), locks the same entries in the same
    order under the new passphrase, checks the new envelope unlocks, and POSTs `keyring.php?change=1` with
    `{keyring, current, previous, proof}`: `proof` is the current key's SPKI and its RSASSA-PKCS1-v1_5 SHA-256
    signature over this session's unlock tag, the current fingerprint and the new envelope;
  - the server replaces the envelope only when `current` equals the stored current fingerprint, `previous` holds
    exactly the stored previous ones (else 409 `key_changed`; 404 `no_keyring` when none is stored) and the proof
    verifies against the SPKI whose SHA-256 is the current fingerprint (else 403 `bad_proof`). No email;
  - afterwards the page goes to `studio.php?changed=passphrase`, which says so. Remembered unlocks are forgotten on
    every device (the keyring's digest changed), so the next unlock takes the new passphrase.
- **Emailed confirmation** (`Music\Confirmations`, table `studio_confirms`):
  - POST `studio.php` `action=forgot-passphrase` or `action=start-over` (csrf) mails a link to the account's own
    address: `confirm.php?token=<64 hex>`, a 32-byte random token stored as SHA-256 with the account id, its address
    and the action, valid `Admin\Auth::LINK_TTL` (15 minutes), spent once (one atomic UPDATE). At most 3 links per
    account an hour; the mail goes after the reply, and a link whose mail fails is deleted (the sign-in rules);
  - the mail is `MailTemplate::confirm`, the sign-in mails' look, saying what the page will delete;
  - GET `confirm.php?token=` deletes nothing and spends nothing: it shows exactly what will be deleted (with counts)
    and what stays, and one button. It sets a mark cookie (`__Secure-studio-act`, Strict, the studio path) that the
    form carries back;
  - POST `confirm.php` checks the mark against its cookie, spends the token, checks the account still has that
    address, does the action, and spends every other unused confirmation link of the account. No studio session is
    needed: the link proves the mailbox, as a sign-in link does;
  - **forgot-passphrase** (`Store::forgetNotesKey`): every note (rows and files) and the keyring, one transaction.
    Pieces, drafts and AI keys stay; the pieces page then shows Make your notes key;
  - **start-over** (`Accounts::startOver`): unchanged. The typed `start over` field is gone: the mailed link and the
    confirmation page are the confirmation;
  - removing an account (`Accounts::remove`) deletes its confirmation links.

## Tasks (test-first)

1. PHP: `Store::forgetNotesKey`, `Store::changeKeyring` (MusicStoreTest-style tests in `StudioKeysTest`).
2. PHP: `Confirmations` + `studio_confirms` table + `MailTemplate::confirm`; tests for TTL, one use, per-hour limit,
   account/address binding, failed mail.
3. PHP: `Pages` routes: studio actions, `confirm.php` GET/POST (GET never deletes), `keyring.php?change=1`; studio
   page sections; `music_run` flushes the mail after the reply. Update `StudioPageTest` (start over by link).
4. TS: `relockKeyring` (unit test round trip, wrong passphrase, fingerprints), `api.changeKeyring`,
   `changePassphrase` flow and `ChangePassphrase` panel, `main.ts` studio view; rebuild `dist/`.
5. e2e `studio-keys.local.ts`: change then unlock with the new passphrase; Forgot → mail → GET (nothing gone) →
   button → notes gone, pieces kept, Make your notes key; Start over → mail → GET (nothing gone) → button → empty.
   `studio.local.ts` loses its typed start over.
6. Docs: spec, `music/README.md`, MakeKeyPanel wording.
