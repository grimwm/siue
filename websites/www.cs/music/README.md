# Music workroom

A private studio on www.cs for every plain `@siue.edu` address, for music and sound-effect drafts, with
end-to-end-encrypted notes. It serves any project: a piece's `score.json` names
its project, its kind (`music` or `sound`) and its characters.

## Studios

Anyone with a plain `@siue.edu` address (no `+`, no subdomain; trimmed and lower-cased) signs in at
`https://www.cs.siue.edu/~wgrim/music/` with a link mailed to them. The first completed sign-in makes
their studio: one account per address, holding only their own pieces, drafts, notes, notes key and AI
keys. Nobody else's studio is ever visible to them.

- **Two sign-ins.** The studio has its own sign-in (`music/login.php`, the studio realm); the admin hub
  keeps its own (`admin/login.php`, named admins only). A studio session never reaches `admin/`, and an
  admin session never opens a studio page. The owner signs in to each separately.
- **Named people** come from the optional `studio-config` field of the Secure Note `SIUE music studio config`
  in the SIUE 1Password vault, which the deploy writes to `admin/config/studio.json` (never from git; see
  `admin/README.md`). Without it the owner is the only admin, with the allowance. A named person may be an admin
  (the hub) and may have the allowance (the larger limits and full drafts). The owner, `wgrim@siue.edu`,
  is always both. Everyone else is a student, with the studio limits below.
- **The notes key** is made on the page the first time (the "Make your notes key" panel: a passphrase of
  at least 12 characters, typed twice). The page makes an RSA-4096 key, locks it with the passphrase
  (PBKDF2-SHA-256, 600,000 rounds, AES-256-GCM), uploads the locked copy and unlocks it. Nobody can reset
  it.
- **Change your passphrase** on Your studio: the current passphrase, then the new one twice. The page opens
  the keyring with the current one, locks the same keys, in the same order, under the new one, checks that
  it opens, and uploads it with a proof: the current private key's signature (RSASSA-PKCS1-v1_5 SHA-256, the
  same RSA key) over this sign-in's tag and the new envelope. The server stores it only when its fingerprints are
  exactly the stored ones and the signature verifies against the SPKI whose SHA-256 is the current fingerprint,
  so knowing the fingerprints (every sealed note's header names the current one) is not enough.
  Every browser's remembered unlock is forgotten (the keyring changed), so the next unlock takes the new one.
- **Forgot your passphrase?** on Your studio deletes every note and the notes key, after the emailed
  confirmation below. Pieces, drafts and AI keys stay, and the pieces page asks for a new notes key.
- **Your studio** (`studio.php`) shows the address, the usage against the studio's limit, Change your
  passphrase and Forgot your passphrase (while the studio has a notes key), the AI keys and Start over.
- **AI keys** are made on Your studio. Each is 64 hex characters, shown once and stored as SHA-256, with
  any of three permissions: "read notes" (`notes:pickup`), "publish drafts" (`drafts:publish`) and
  "delete drafts" (`drafts:delete`). An AI key never uploads a notes key, never makes another key and
  never starts over. A studio holds at most 10 active AI keys, each limited to 60 requests a minute.
  An AI key works only in its own studio. Right after a key is made, the panel that shows it once also
  shows the Connect Your AI commands with that key in them.
- **Pairing an AI** (a key with "read notes"): the key's AI starts the studio MCP server (below), which
  registers its own sealing key and shows a pairing code. The key's row on Your studio says "not started",
  "waiting for the code" (with the form: Pairing Code, Passphrase, Pair) or "paired". Pairing checks the code
  with the server, checks it again in the browser against the key the server handed back, and then adds
  the AI's public key to the locked keyring (opened and locked again with the passphrase). From then on the
  page seals each note to the person and to that AI (`SIUEN2`). Revoking the key forgets its sealing key;
  Forgot your passphrase unpairs every key, and the same code pairs it again.
- **Drafts in a studio are scores only:** one renderable `score.json` (every lane has a `sound` whose
  `instrument` is in `music/library/library.json`, and `mix` is present), which the page plays by building
  the sound in the browser from the shared sample library. People with the allowance may also publish
  full drafts (MusicXML, audio, spectrogram).
- **The shared sample library** (`music/library/`, its README lists each instrument and its source) holds
  27 instruments from two CC0 libraries, VSCO-2 CE and VCSL, as lossless FLAC. `library.json` also carries
  each instrument's catalogue entry for the composer (category, ranges, clef, written transposition, General
  MIDI program, drum pieces, icon). Drums play each sample on its own key only. Celesta, Choir and Lyre are
  stand-ins, marked as such, playing another instrument's samples. `make music-library` rebuilds it from
  `music/compose/samples.json`; `music/compose/tools/vsco-files` helps write new manifest entries.
- **Start over** on Your studio deletes every piece, draft and note, the notes key and the AI keys, after
  the emailed confirmation below. Nobody can undo it. The account and its sign-in stay, and the next visit
  asks for a new notes key.
- **Emailed confirmation** (`Music\Confirmations`, table `studio_confirms`): Forgot and Start over each mail
  a link to the account's own address, `confirm.php?token=`. The token is 32 random bytes stored as SHA-256
  with the account, its address and the action; it is good for 15 minutes, once, and at most 3 are mailed
  per account an hour. The mail goes after the reply, and a link whose mail fails is deleted. Opening the
  link (GET) deletes nothing and spends nothing: the page names what its one button deletes, with counts,
  and what stays. The button's POST, carrying a mark the page set in a cookie, spends the link and the
  account's other unspent ones, then deletes. It needs no studio session: the link proves the mailbox, as a
  sign-in link does. Removing an account deletes its links.
- **Studios on the admin hub:** `admin/studios.php` lists every studio's address, usage and last sign-in,
  never a piece, title or note.

### The composer

`compose.php` is the editor (`games/workroom/src/ui/compose/`, its DOM-free parts in `src/compose/`): a music piece's
parts, each a lane with an instrument from the library's catalogue, and three ways to put notes in, all writing to one
grid: **Play Live** (a held key sets the note's length; Tidy To snaps the starts to 1/4, 1/8, 1/16 or Off; recording
stops after a bar of quiet; an optional count-in), **Step** (a length, Dotted, + Rest, ‹ Back One) and **Grid** (tap
to add, drag to move, drag the right end to stretch, Line Up To). Keys pressed together are a chord in every mode.
Tap a note to select it and again to delete it; Undo and Redo cover every edit. A note outside its instrument's range
is drawn amber (experts only) or red (beyond the instrument) and never moved, except by Move Them Into Range. While a
key is held the page is pinned where it is. Hear With The Piece and Hear My Part Alone build the sound with the same
renderer the piece page uses. Save Draft keeps the piece's next draft through `save-draft.php`; the edit stays in the
page when a save is refused. The piece page links Compose on a music piece; the pieces page and Your studio link New
Piece. The design is `docs/superpowers/specs/2026-10-31-composer-editor-design.md`.

### Limits

| Limit | Studio | With the allowance |
| --- | --- | --- |
| Stored (drafts as stored plus sealed notes, hums included) | 5 MB (5,242,880 bytes) | 100 MB (104,857,600 bytes) |
| One draft request | 262,208 bytes | 8 MB |
| `score.json` | 262,144 bytes, 20,000 notes, 16 lanes | the same |
| One sealed note | 1,048,576 bytes | 2,097,152 bytes |
| Notes kept | 2,000 | 2,000 |
| Drafts kept per piece | the newest 20 | the newest 20 |
| Active AI keys | 10, each 60 requests a minute | the same |

Every studio without the allowance also shares one pool: 1,073,741,824 bytes (about 1 GB) in all, and at
most 500 accounts (`max_shared_mb` and `max_accounts` in the configuration). When either is reached, a
new sign-up gets "The studio is full". An upload past a limit is refused, and nothing is deleted to make
room; the refusal says how much room is left (the smaller of the studio's own room and the shared room)
and to delete drafts or picked-up notes. `score.json` and `score.musicxml` are stored gzip-compressed and
count at their stored size.

Sign-in links (each hour): 300 overall, 100 requests from one IP (a class behind one campus address can
sign in at once), 3 per address, 3,000 request rows kept.

## Security model

- Notes are sealed in the browser (AES-256-GCM per note, key wrapped with RSA-OAEP
  to the current public key, which the browser takes from the unlocked keyring). The
  server stores sealed bytes only and never decrypts; www.cs PHP has no sodium and needs none.
- A paired AI's public key is in that same locked keyring, put there only by the unlocked page after the
  person typed the AI's pairing code: the server cannot add a recipient. The page seals to the AI keys the
  keyring holds and the server still lists as active (`keyring.php`'s `ai`, asked again before each note);
  the server accepts a note only when every key it names is the studio's current or an earlier notes key or
  a paired active AI key, and at least one is the person's. The code is the first 80 bits of the AI key's
  fingerprint (SHA-256 of its SPKI) in Crockford base32, and the page and the server both take only an
  RSA-4096 key with exponent 65537 in canonical DER, so a server would need about 2^80 tries to find one of
  its own with the same code. Pairing tries are limited: 5 wrong codes per AI key and 20 tries per
  studio an hour.
- The private keys live in one locked keyring (PBKDF2-SHA-256, 600,000 rounds,
  AES-256-GCM) that only a signed-in session can fetch; it is unlocked in the
  browser, in memory, and never stored there.
- Pages need a studio session (`__Secure-studio`, its path the `music/` folder), and
  each serves only the studio of the session's account: every note, draft and
  keyring query names that account, never one from the request. An admin session
  opens no studio page, and the studio cookie never reaches `/admin/`. Page loads
  must be browser navigations; the JSON and byte routes refuse cross-site requests;
  every POST needs the session's CSRF token. All routes refuse plain HTTP.
- The only browser storage the workroom writes besides the theme and the guide
  flags is the outbox: sealed notes waiting to be sent. Nothing of any key, and
  nothing in the clear about a note, is stored in the browser.
- AI keys are made on Your studio and serve only their own studio (see Studios).
  The owner's API keys are made on the admin hub and carry scopes. The one thing a key can
  delete is a published draft, with `drafts:delete`: a key that publishes drafts may
  also delete them. Every active key that held `drafts:publish` before
  `drafts:delete` existed holds it too, added in place by a one-time step when the
  admin database opens (`Db::open`, recorded in its `migrations` table so it never
  runs again): same key, nothing to remake. Revoked keys and keys without
  `drafts:publish` do not hold it; any other key holds exactly the scopes ticked when
  it was made (`make music-setup` ticks `drafts:delete` for a new `music-publish`
  key); revoking a key on the hub ends all it can do. Notes are deleted only from
  the page, with the session.
- The server also keeps the fingerprints the uploader named (current and earlier), only
  to refuse notes sealed to other keys and to show the current one on the admin hub.
- `lib/`, `tools/` and `pieces/` are never served (`.htaccess` on Apache,
  `docker/nginx/default.conf` locally). `deploy.sh` ships the pages, `api/` and `lib/`
  only; the page's script, stylesheet, theme boot and fonts ship
  from `games/workroom/dist/`.

## Routes

Sign-in pages (the studio realm, any plain `@siue.edu` address; `lib/bootstrap.php` wires `Admin\SignIn`
to `Music\Accounts::signIn`): `login.php` (GET form, POST asks for a link), `verify.php` (GET confirm,
POST signs in) and `logout.php` (POST; `?all=1` is everywhere for the account). Sign-in returns to `index.php`,
`studio.php` or `piece.php?id=&v=` in this folder. The link is mailed to any such address; only after it is
spent does a full studio answer "The studio is full" and start no session, so the reply to a request never
tells who has an account. Its sessions are separate from the admin hub's.

Session routes (same-origin, a studio session, the session's own studio): `index.php`,
`piece.php?id=&v=` (pages; the front page's body carries `data-connect`, the Connect Your AI commands from
`Music\Connect`); `studio.php` (Your studio, a plain page that needs no script: the address,
usage of the studio's limit, its AI keys and their pairing, sign out; the change of passphrase and the
pairing forms are the parts drawn by the page's script; POST `action` `make-key` (`label`, `scopes[]`) shows the new key once, `revoke-key` (`id`),
`forgot-passphrase` (while the studio has a keyring) or `start-over`, each with the session's token in a
`csrf` field; the last two mail a confirmation link and delete nothing); `confirm.php` (no session: GET
`token` shows what the button deletes, POST `token` and `mark` does it; Forgot is `Music\Store::forgetNotesKey`,
the notes and keyring in one transaction; Start over is `Music\Accounts::startOver`, the AI keys, notes, drafts,
files and keyring in one transaction; the account and its sessions stay); `csrf.php`, `pair.php` (POST `{key, code}`: one counted pairing try; 200 `{spki, fingerprint}` when the code is
that AI key's, 422 `wrong_code`, 429 `too_many`, 404 `no_key`, 409 `not_registered`), `notes.php` (GET list,
POST upload, `SIUEN1` or `SIUEN2`), `note.php?id=`, `delete.php` (POST `id`, or `all=1`), `keyring.php` (GET the locked keyring, the session's tag and `ai`, the paired active AI keys' fingerprints; POST
stores `{keyring, current, previous}`, the rules `api/keyring.php` keeps, only while the studio has none: 409
`key_exists` otherwise; POST `?change=1` with `proof` `{spki, sig}` stores the same keys under a new passphrase
only when `current` and `previous` are exactly the stored fingerprints (409 `key_changed` otherwise, 404
`no_keyring` when none) and the proof holds (403 `bad_proof` otherwise); POST `?pair=1` is the same with `pair`
`{key, code, fingerprint}`, the code checked again, and stores the keyring and marks the AI key paired in one
transaction),
`delete-draft.php` (POST
`piece` and `v` deletes one draft, `piece` alone the whole piece; 404 `not_found` when none
went), `drafts.php?piece=` (each draft's `version`, `published_at` and `sheet`, whether it stores MusicXML),
`draft.php?piece=&v=&file=` (data), `compose.php?id=&v=` (the editor's page on that piece; with no `id`, New Piece,
its body carrying `data-pieces` and `data-projects`) and `save-draft.php?piece=&version=` (POST, the editor's save: a
SIUED1 bundle of `score.json` alone from any account, checked as an AI's publish is, kept only as the piece's next
draft; 409 `stale` with `latest` otherwise, 409 `exists`, 413 `over_quota` with `room` and `message`). Signed out, a page goes to
`login.php?next=` (the page, when sign-in may return to it) and a data route answers 401
`{"error":"signed_out"}`. Each POST's answer carries the next CSRF token. The page shells'
`<body>` carries `data-note-max` (the largest note), `data-room` (bytes the studio may still
store), `data-score-only` (`1` when drafts hold a score and no MusicXML) and `data-account-has-key` (`1` once a keyring is stored).

API routes (Bearer key, HTTPS; `lib/KeyGate.php`): an AI key (`lib/AiKeys.php`, the
`studio_keys` table: per account, at most 10 active, 60 requests a minute, scopes
`notes:pickup`, `drafts:publish` and `drafts:delete` only) serves its own account's studio;
any other key is checked as one of the owner's admin keys and serves the owner's studio.
`api/notes.php` and `api/note.php?id=` (GET) and
`api/picked-up.php` (POST) need `notes:pickup` (an AI key sees only the notes sealed to the key it is paired to,
none before it is paired); `api/seal-key.php` is an AI key's sealing key (GET, any AI key: its label, scopes and
`sealing` `{fingerprint, code, paired, paired_at}` or null; POST `{spki}`, `notes:pickup`: registers the MCP's
public key, 409 `paired` when the key is paired to another, 422 `bad_key` unless it is RSA-4096, exponent 65537,
canonical DER); `api/draft.php?piece=&version=` (GET, `drafts:publish`) answers that draft's `score.json`; `api/drafts.php` (GET lists the
published drafts, newest first; POST publishes one, of at most the account's request
limit: 8 MB with the allowance, 262,208 bytes without; 413 `too_large` above it, 413
`{"error":"over_quota","room","message"}` past the studio limit) needs `drafts:publish`;
`api/delete-draft.php?piece=&version=` (POST) needs `drafts:delete` and deletes that
one draft, its row and files (404 `not_found` when it is not stored, 422 `bad_piece`
or `bad_version` as for a publish); `api/delete-piece.php?piece=` (POST) needs
`drafts:delete` and deletes every draft of that piece, answering `{"piece","deleted":<n>}`
(404 `not_found` when it has none, 422 `bad_piece`); `api/keyring.php` needs `keys:publish`,
which only the owner's admin keys hold (POST uploads
`{keyring, current, previous}`; GET answers the stored fingerprints).

## The look

The workroom has its own Studio Console look, dark or light ("daylight"),
compiled with Tailwind at build time from `games/workroom/src/app.css` into
`games/workroom/dist/workroom.css`, with self-hosted OFL fonts in
`dist/fonts/`. The header's switch (System, Dark, Light) is remembered in this
browser (`workroom-theme` in localStorage); `dist/theme.js`, the first script
in the head, applies it before the first paint. Colours are tokens in
`app.css`; a score's own colours are nudged to stay readable on either theme.

Every view has a legend line and a **How to read this** button: a guided walk
through the view's parts, one lit at a time, each with Hear it (a clip of the
piece, or a built-in demo). It opens by itself the first time each view is
shown in a browser (`workroom-guide-<view>` in localStorage).

The Story, Piano roll and Sound picture share one time axis. It zooms with a
pinch, with ctrl or cmd and the wheel, with a trackpad pinch, or with the
**−**, **+** and **Fit** buttons above the view, and pans with a drag; zooming
never scrolls the page. In the Story each character's tune is a constellation
whose lines are kept quiet: thin curves along the tune's top line only (the
accompaniment under it is dimmer stars with no line), and a link that leaps
more than an octave, follows a long silence or would cross another star shows
only while its constellation is hovered, tapped or focused.

Sheet music shows the **Full Score** (every part stacked in standard score
order, bars aligned, each staff named) or one instrument, in **Page View**
(lines that wrap to the width) or **Continuous** (one long line that scrolls
right). It zooms the same ways as the time views. **Print / Save PDF** draws
the shown music on US letter pages, the piece's title and opening tempo on the
first page and a page number on the rest, and prints it alone on white.

Sheet music also has **Learn to read sheet music**: a six-step lesson beside the
notation (staff and clef, note lengths and rests, bars and the time signature,
sharps, flats and the key signature, ties, reading along). Each step uses the
shown instrument's own bars as its example, lights that bar in amber and plays
it with Hear it; while reading along the lit bar follows the playhead. A step
the instrument has no example for (no accidental, no tie) keeps its plain
explanation and offers no Hear it. Its words open glossary cards.

## Answering

The answer bar sits under the player on a piece's page, with four buttons: **Pin
a note** (typed or spoken words on a moment or span, optionally one lane), **Hum
it** (a recording of up to 60 s at the playhead), **React** (one of eight
reactions to the section at the playhead, or to the whole piece when there is no
section) and **Draw the energy** (a curve for how intense the piece should be).
Each note is tied to its draft, in bars and seconds on music and in seconds on a
sound.

Notes are sealed in the browser to the current key of the keyring the passphrase
unlocks. Before an unlock each of the four asks for it: the notes panel opens at
the unlock form with one line saying why, and Pin a note, React or Draw the
energy opens once unlocked. Hum it waits for the next tap, since iOS grants the
microphone only inside one. With no keyring on the server the bar says "Notes are
off until you make your notes key under Your notes.", and the notes panel shows the
"Make your notes key" panel.

- **Pinning** scrolls the Story view into view and picks a span on it: a drag, or a
  tap for one moment; the lane only when the drag starts and ends in one lane. On a
  phone the composer is docked at the bottom of the screen, above the notes handle,
  so the timeline and the picked span stay visible above it.
- **The recorder** records 60 s at most, in the first type the browser records, at
  64 kb/s; the microphone is asked for inside the tap. A recording that is not
  stored stays on screen to Send or Discard.
- **The energy drawing** has its own guide (`workroom-guide-energy` in localStorage).
- **Notes & answers** is the notes panel: the passphrase unlocks it, it lists the notes of this piece or of all pieces, and each note has
  Delete; Delete, Delete all and Discard (for a note not sent yet) each ask
  first, in plain words. Notes on the server are marked Waiting until they are
  picked up; notes this browser has not sent yet are listed under Not sent yet.
- **Signing in:** a signed-out visit goes to the studio's own sign-in (`login.php`), which returns to the page asked for.
- **General notes** are written on the front page (`/music/`), under the same
  passphrase, tied to no piece: plain words only, sealed and sent like any other
  note. Their body has piece `general`, draft 1, from 0 to 0, no bars, lane or
  curve; the server cannot tell them apart, since the body is sealed. The front
  page lists them with Delete and Discard (no Delete all there, which would also
  delete every piece's notes) and still shows each piece's count of waiting
  notes, which comes from every note. No piece can be published as `general`:
  the server refuses the id (`bad_piece`) as the tool does. Words typed in the box stay
  until the note is stored, across a lost sign-in too (the unlock form says the note is
  kept), and leaving the page asks first while they are there. A note the page could not
  open is listed as such, since its piece is not known.
- **The unlock is remembered** in this browser, so a reload or a later visit does
  not ask for the passphrase again: IndexedDB `siue-music-keys`, store `unlocked`,
  holds the unlocked private keys as non-extractable `CryptoKey`s (no script can read
  their bytes), the current public key, the SHA-256 of the locked keyring and the
  session tag `keyring.php` answers (an HMAC of `music-unlock` under the sign-in's
  session id). The passphrase and the locked keyring are never stored. A page that
  finds the tag or the keyring changed forgets it and asks again: Sign out, Sign
  out everywhere, a sign-in that ended (7 days idle, 30 days at most) and `make
  music-rotate` all do that. A lost sign-in on the page forgets it at once; a
  failed connection keeps it for the next visit. Any page on www.cs, which serves
  every user's pages from one origin, could use (never read) those keys while they
  are remembered, as it could the outbox.
- **The outbox** is IndexedDB `siue-music`, store `outbox`, and holds sealed
  bundles only. It is sent on load and when the browser is back online, one tab at
  a time under the Web Locks lock `workroom-outbox`; Discard drops one. A browser
  that refuses IndexedDB keeps the note in memory and says so.
- Nothing typed or recorded is cleared until the note is stored. Typed words
  stay when the composer closes, and leaving the page asks first while words, a
  recording or a note kept only in memory would be lost.
- The pieces list shows each piece's waiting count after an unlock.
- Chrome may offer to save the unlock form's username and passphrase; the owner
  answers Never (1Password fills the form either way).

## Refusals

The limits are in [Studios](#limits). A note or draft past the stored limit is refused
with 413 `over_quota`, the `room` left in bytes and a `message` such as "Your studio has
926 KB of 5 MB left. Delete drafts or picked-up notes to make room." (`Music\Usage`). A
draft request over the account's request limit is refused with 413 from its declared
`Content-Length`, before the script reads the body. Each piece keeps its newest 20
drafts, like an undo history: its oldest rolls off, and other pieces are never touched.

## The owner's key tool

Every `make music-*` step in this README is owner-only: it needs this repository, the owner's
1Password and the owner's API keys, which studio people do not have. These steps live only in
this README, never on the page: every studio, the owner's included, sees the same Connect Your AI
panel and messages, which point at what the page offers (uv, AI keys and pairing on Your studio,
Forgot your passphrase?, or a reload).

`music/tools/siue-music` keeps the notes keys in 1Password (vault `SIUE`, or
`$OP_VAULT`; the `op` CLI must be 2.25 or newer) and a working copy in
`~/.config/siue/music.json` (folder 0700, file 0600). Secrets reach `op` on
standard input and are never printed.

- `make music-setup` is the one command that gets everything started; run it again any time, it skips what is done. It checks `op` is installed and signed in; for each API key not yet saved (and any saved under the wrong name, or revoked) it opens the hub's API key page with the label and boxes filled in, asks you to press Create and paste the key (not echoed), and saves it to 1Password; makes the notes key if 1Password has none (adopts the current one it holds); uploads the locked keyring with its fingerprints unless the server already holds exactly this computer's current and previous keys, then reads the fingerprints back to check the server's current key is yours. It refuses to make a key while the server holds a keyring this computer cannot open (to start over on purpose, press Remove the notes key under Music notes key on the admin hub, then run it again). It touches no git, builds nothing and asks no question; it ends by naming the workroom address to open. It makes the tool's virtualenv when missing or broken.
- `make music-status` prints the current notes key in 1Password, in this computer's cache and on the server (it asks the server, so it needs the network), whether they match (exit 3 when they differ or the server cannot be asked), whether each saved API key still works and has the right permission, and ends with a "What's left" checklist (done or not): key in 1Password, key in the cache, both API keys saved, the server's current key is yours. It ends with `Next: make music-setup` while anything is missing and says setup is complete otherwise. The "Notes key on the server" line is the one the admin hub shows as "Music notes key" (`https://www.cs.siue.edu/~wgrim/admin/`).
- `make music-rotate` makes a new pair under a new passphrase (so a passphrase that leaked can neither unlock nor forge the new keyring); the new item becomes current in 1Password and the old one is retitled `SIUE music notes key (previous)`, and the full keyring, current key first, is uploaded with its fingerprints (current, then previous), replacing the stored one, and read back to check it. 1Password decides which key is current: the one `siue-music-key` item whose title (`SIUE music notes key`) does not end in `(previous)`; the items are matched by their fingerprint field, so equal titles are fine; none, or more than one, stops every command with what to fix in the titles. It refuses when the server holds a key neither 1Password nor the cache has the private key for. A retitle that fails (the approval timed out) stops before the upload and names the item to retitle by hand. It exits 4 when the keyring was not uploaded: run `make music-setup`, which uploads it. A 429 on any API call is retried after back-off pauses that add up to more than the server's one-minute window.
- `make music-forget` deletes the cache. A key removed from 1Password stays usable from this computer's cache until you run it; every cached key is checked against its fingerprint before it is used.
- `make music-test` runs the tool's tests; the MCP server's protocol test runs when the virtualenv has the SDK (`make music-mcp-setup`) and is skipped otherwise.
- `make music-pickup` downloads each waiting note with the `music-pickup` API key, checks its length and SHA-256 against the listing, opens it with the cached keyring and saves it under the notes folder (`~/Library/Application Support/siue-music/notes/` on macOS, `$XDG_DATA_HOME/siue-music/notes/` elsewhere on Unix, `%APPDATA%\siue-music\notes\` on Windows; `SIUE_MUSIC_NOTES_DIR` overrides; the tool refuses a folder inside the repository) as `<arrival date>-<id>/` with `note.json` and `audio.webm|m4a|ogg` (a general note, piece `general`, is filed the same way beside the piece notes, and the closing line counts them: `Picked up 3 notes (1 general) into ...`). Only then does it mark the note picked up. A note whose download is corrupt or that will not open stays waiting, is reported with its reason, and the run goes on with the next; the exit code is 1 when any note was left. Every API call, the listing included, waits out a 429 and is retried; a 429 that never clears leaves that note waiting and the run goes on.
- Speech notes (webm, m4a or ogg audio; ffmpeg is told the format and never sniffs it) also get `transcript.txt` (local Whisper, `faster-whisper`; `SIUE_MUSIC_WHISPER_MODEL` picks the model, default `small.en`) and hum notes `motif.mid` (`librosa.pyin` and `mido`). Both are optional: `music/tools/.venv/bin/pip install -r music/tools/requirements-answering.txt` and `brew install ffmpeg`. Without them pickup still opens and saves every note and prints one line naming what is missing.
- The server address is `SIUE_MUSIC_BASE`, else `"base"` in `~/.config/siue/music-config.json` (`$SIUE_CONFIG_DIR/music-config.json` when that is set), else `https://www.cs.siue.edu/~wgrim/music/`. The same file may hold `"poll_seconds"` for the MCP server below. The notes key item links to that address (the passphrase is typed on the workroom page); the API key items, titled `SIUE music API key: publish` and `SIUE music API key: pickup`, have no address, so 1Password never offers them on a page.
- `make music-publish PIECE=ch1-labyrinth [VERSION=3]` checks `music/pieces/<piece>/v<N>/score.json` with the page's rules (glossary ids from `games/workroom/src/glossary.json`), checks instrument ids against `music/library/library.json`, requires the audio and the spectrogram (a renderable score, below, needs neither) and, for music, `score.musicxml`, refuses a draft over 8 MB before sending, and publishes it with the `music-publish` API key. The newest version is the default.
- `make music-delete PIECE=ch1-labyrinth VERSION=3` deletes that one published draft from the server with the `music-publish` API key (which holds `drafts:delete`); the files under `music/pieces/` are untouched. A bad piece id or version is refused before anything is sent; a draft the server does not hold exits 1 with `not_found`. `make music-status` says whether the key may delete drafts; the key is healthy either way.

## Your AI: the studio MCP server

`siue-music mcp` is the MCP server any studio's own AI app runs on that person's computer (Claude Code,
Claude Desktop, Cursor, Codex, Gemini CLI, any app that speaks MCP over stdio). It needs no repository,
make or 1Password: the app starts it with `uvx --from <wheel address> siue-music mcp`, and the front page's
Connect Your AI panel (`Music\Connect`, `games/workroom/src/ui/ConnectAi.tsx`) shows the command or settings
block for each app, with the studio's address and the wheel in it and `PASTE-YOUR-AI-KEY-HERE` where the key
goes; Your studio shows the same with a new key filled in. uv (a link to its installation page) is the only
thing to install.

- **Configuration:** `SIUE_MUSIC_BASE` (the studio's `music/` address) and `SIUE_MUSIC_AI_KEY` (the AI key). When
  `SIUE_MUSIC_AI_KEY` is missing or still the placeholder, the key comes from the `ai-key` file in the config
  folder, which `uvx --from <wheel address> siue-music save-key` writes (it reads the key without echoing it):
  one place for every app on a computer.
- **The config folder** (`SIUE_MUSIC_CONFIG_DIR`, else `~/Library/Application Support/siue-music` on macOS,
  `%APPDATA%\siue-music` on Windows, `$XDG_CONFIG_HOME/siue-music` or `~/.config/siue-music` elsewhere; 0700)
  holds `ai-key` and `sealing-key.json` (0600): the AI's own RSA-4096 sealing key, made on first start and
  shared by every app on that computer. Opened notes are saved in the notes folder (as for the owner's
  pickup, below). Moving `sealing-key.json` away makes a new key, which needs a new pairing (and, once paired,
  a new AI key).
- **Pairing:** on start the server registers the sealing key's public half through the AI key (when it may
  read notes) and logs `siue-music: this computer's pairing code is XXXX-XXXX-XXXX-XXXX` to the app's log;
  `studio_status`, `siue-music pairing-code` and every notes tool before pairing give the code. The person
  types it on that key's row on Your studio with their passphrase (see Studios).
- Without a key, with the placeholder, or with a revoked key, the server still starts and every tool answers
  what to do (make an AI key on Your studio, paste it, restart the app), never a traceback.

Tools (each within the AI key's permissions, which the server enforces from the key):

| Tool | What it does |
| --- | --- |
| `studio_status` | The studio's address, the key's label and permissions, the pairing code, whether it is paired, and the next step to tell the person. |
| `list_pieces` | The studio's pieces with their project, kind and draft versions. |
| `read_score(piece, version?)` | A draft's `score.json` (the newest when no version) and its page. |
| `list_instruments()` | The instruments a lane may use, in the picker's order, from the site's `library/library.json`: name, category, normal and expert range, clef, written transposition, General MIDI program, drum pieces and any stand-in note. Needs no key. |
| `publish_draft(score)` | Checks the score as the page does (the glossary built into the wheel, the site's `library/library.json`) and publishes it as draft `score.draft` of `score.piece.id`; a published version is never replaced. |
| `delete_draft(piece, version)`, `delete_piece(piece)` | Delete one draft, or every draft of a piece (`drafts:delete`). |
| `read_new_notes(limit?)` | Downloads the waiting notes sealed to this AI, checks their length and SHA-256, opens them here and saves them in the notes folder; marks none. Same note shape as the owner's `pick_up_notes`. |
| `mark_notes_picked_up(note_ids)` | Marks those notes picked up. |
| `wait_for_notes(timeout_seconds, poll_seconds?)` | Asks every `poll_seconds` (default `SIUE_MUSIC_POLL_SECONDS`, else 10; never under 2) and answers as soon as a note waits that this computer has not opened, or at the timeout (at most 3600 s). |

No tool deletes a note; the person does that on the pages.

**The wheel.** `music/tools/build-wheel` builds `siue_music-<version>-py3-none-any.whl` with the standard
library alone, reproducibly (stored entries, sorted, fixed times): the `siue_music` package, the page's
glossary as `siue_music/data/glossary.json`, and metadata naming `cryptography` and `mcp` exactly as
`music/tools/pyproject.toml` does, with the `siue-music` console script. `music/dist/release.json` (committed)
names its version, file name and SHA-256; `deploy.sh` builds it into `music/dist/` and stops when it is not
that wheel, and the page shows that address and SHA-256. To release a change to the tool or the glossary,
raise `__version__` in `music/tools/siue_music/__init__.py`, run `music/tools/build-wheel --record`, and commit
`music/dist/release.json` (`make music-test` fails until then). The deploy removes the previous wheel, so an
app set up with an older one needs the new command from the page. The wheel is served with `Cache-Control: immutable` for a year:
uv keeps the copy it first downloaded, so a file changed on the server later never reaches a computer that has
it (uv cannot check a hash given with `--from`; the page's SHA-256 is for people to compare).

## The owner's MCP server

`siue-music owner-mcp` (`siue-music-owner`) is the owner's MCP server for this repository. The app starts it
on the owner's computer over stdio; it uses the key tool above, so keys, sealing and refusals are those of
`make music-publish`, `make music-delete` and `make music-pickup`, the private notes key comes from
1Password through `op`, and no answer carries a key. It is built on the official MCP
Python SDK (`mcp`, pinned in `tools/requirements-mcp.in`), installed into
`music/tools/.venv` from the hashed lock (see Locked packages).

- `make music-mcp-setup` installs the SDK into the virtualenv (making it when needed)
  and prints the commands to connect: the `claude mcp add --scope user siue-music-owner ...` line for
  Claude Code and the JSON block for Claude Desktop's `claude_desktop_config.json`,
  with this checkout's absolute paths, `SIUE_MUSIC_BASE` (the server address), and
  `SIUE_OP` (op's full path, since an app started from the dock has no shell PATH).
  It talks to neither the server nor 1Password. Before it, run `make music-setup` once.
- `make music-mcp` runs the server by hand (it waits for JSON-RPC on standard input).
- A keyring that `make music-rotate` uploads holds no paired AI key, so a paired studio AI says "not paired"
  until the owner pairs it again on Your studio.

Tools:

| Tool | What it does |
| --- | --- |
| `list_pieces` | The drafts published on the server (GET `api/drafts.php`, with the `music-publish` key) and the local drafts in `music/pieces` with their files. |
| `read_score(piece, version?)` | A local draft's `score.json` (newest when no version), its path, and what publish would refuse in it. |
| `publish_draft(piece, version?)` | `make music-publish`: the same checks and refusals. |
| `delete_draft(piece, version)` | `make music-delete`: deletes that one published draft from the server with the `music-publish` key's `drafts:delete` permission (publish keys have it); the files in `music/pieces` stay. The piece id and version are checked first; a key without the permission is told to run `make music-setup`, and a draft the server does not hold is named. |
| `pick_up_notes` | `make music-pickup`: downloads, opens, saves, then marks each note picked up. Answers each note's kind, piece, draft, span, bars, lane, text, reaction, energy curve, transcript, and the paths of its recording, `transcript.txt` and `motif.mid`. |
| `read_notes(limit?, piece?)` | The notes already in the notes folder, newest first, in the same shape. |
| `wait_for_notes(timeout_seconds, poll_seconds?)` | Lists the waiting notes every `poll_seconds` (default `SIUE_MUSIC_POLL_SECONDS`, else `poll_seconds` in `music-config.json`, else 10; never under 2) and answers as soon as one waits, or at the timeout (at most 3600 s). It only lists; it reports each empty poll as MCP progress when the app asks for progress. |

`delete_draft` is the only delete: the AI cannot delete notes, which the owner deletes
on the workroom pages.

## Locked packages

The tool's virtualenv installs only hashed locks: `music/tools/ensure-venv` runs
`pip install --require-hashes -r` on `tools/requirements.txt` (`make music-setup`) or
`tools/requirements-mcp.txt` (`make music-mcp-setup`), so pip refuses any package or
release the lock does not name. The locks are compiled from the files people edit,
`tools/requirements.in` and `tools/requirements-mcp.in`, for every platform and Python
3.10 and newer. To change a package, edit the `.in` file and recompile both locks with
uv in a throwaway virtualenv (from `websites/www.cs/music/tools`):

    python3 -m venv /tmp/uv && /tmp/uv/bin/pip install uv
    /tmp/uv/bin/uv pip compile --universal --python-version 3.10 --generate-hashes --no-cache requirements.in -o requirements.txt
    /tmp/uv/bin/uv pip compile --universal --python-version 3.10 --generate-hashes --no-cache requirements-mcp.in -c requirements.txt -o requirements-mcp.txt

The second lock is constrained by the first, so both install the same `cryptography`. The wheel names the
same `cryptography` and `mcp` versions (`pyproject.toml`, `build-wheel`); uv resolves their own dependencies
when a person's app first runs it.
`make music-test` checks every pin is exact and hashed. `requirements-answering.txt`
(the optional speech and humming steps) is installed by hand and is not locked.

## The local browser check

`make music-e2e` (local only; CI never runs it; `E2E_ARGS=studio.local.ts` runs one
spec) builds the studio MCP wheel (`music/tools/build-wheel --check`), brings up its own docker project with
the mail capture and `tests/e2e/studio-config.json` (it names only the owner), and runs four specs in Chrome.

`tests/e2e/studio-ai.local.ts` is a studio's own AI connected as Connect Your AI says, as
`student3@siue.edu`: a notes key and an AI key (read notes, publish drafts) on Your studio, whose panel shows the
commands with the key in them; the wheel downloaded from the stack, checked against the SHA-256 the page shows,
and installed into a fresh virtualenv outside the repository; its `siue-music mcp` over stdio gives the
pairing code; a wrong code is refused and the right one pairs; a note typed in the browser reaches
`wait_for_notes`, `read_new_notes` opens it and `mark_notes_picked_up` marks it; the AI publishes a draft the
page lists; revoking the key stops it with what to do. Your studio's new-key panel and pairing form are checked
at 390 px. `MUSIC_E2E_SHOTS=<folder>` saves them and the Connect Your AI panel.

`tests/e2e/studio.local.ts` is a student's studio from first sign-in to a deleted draft:
`student1@siue.edu` signs in through the captured mail to an empty studio, makes a
notes key on the page and pins a typed note; makes an AI key with all three
permissions on Your studio, seen once; publishes the score-only fixture with it and
plays the sound the page builds; deletes the draft on the page; and `admin/` sends the
browser to the admin sign-in.

`tests/e2e/studio-keys.local.ts` is the notes key's life on Your studio, as
`student2@siue.edu`: a wrong current passphrase changes nothing, the right one changes
it, and then the old passphrase fails to unlock while the new one opens the same note;
Forgot your passphrase mails a link that a plain GET (a mail scanner) never acts on,
whose page names what goes and what stays, and whose one button deletes the notes and
the key while the piece stays, back to Make your notes key, and works once; Start over
mails a link the same way, and its button empties the studio, after which the AI key
gets 401.

`tests/e2e/workroom.local.ts` signs the owner in to the studio and, separately, to the
admin hub, publishes the fixture drafts with API keys made on the hub, and drives the
page:
play, seek, the four views, a glossary card, the sheet music and its reading lesson, a sound effect from
a second project, and no content security policy violation. It also uploads the
committed TEST keyring (`games/workroom/test/fixtures/test-key.json`) with its
fingerprints through `music/api/keyring.php`, unlocks it in the shipped page with
the TEST passphrase, records with Chrome's fake microphone, pins a typed note,
picks it up with `siue-music pickup` from a temporary config folder whose cache
holds the TEST key, with the tool's 1Password stand-in
(`music/tools/tests/fake_op.py`), so the run never touches the owner's 1Password or
cache (it needs the tool's virtualenv, which `make music-setup` also makes), reads
and deletes it on a second, phone-sized device, finds a composer asking for the
unlock first, hums, reacts, draws the energy, and sends a note made offline once
the connection is back. `MUSIC_E2E_SHOTS=<folder>` saves every screen. It prints
`MUSIC-E2E-OK` and tears the project down. The page it drives is the shipped
`games/workroom/dist/workroom.js`.
Sign-in links are limited to three an hour per address in each realm; one run asks
the studio for three for the owner and one for the student, and the admin hub for one.
The fixtures under `games/workroom/test/fixtures/draft*/` come from
`node games/workroom/tools/make-draft-fixture.ts` and `ffmpeg` (see that script).

## After a deploy

`curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer throwaway' https://www.cs.siue.edu/~wgrim/music/api/notes.php`
must answer 403 (or 200 with a real key), never 401: a 401 means Apache is not
handing the Authorization header to PHP.

`curl -s https://www.cs.siue.edu/~wgrim/music/dist/<file in music/dist/release.json> | sha256sum` must print the
SHA-256 in `music/dist/release.json`.

## `score.json`, schema 1

The page refuses any other `schema` value with: "This draft uses score schema N, which this page does not know. Reload the page; if it still says so, the page needs an update." Every `music/pieces/*/v*/score.json` is validated by `games/workroom/test/committed-drafts.test.ts`.

| Field | Type and rule |
| --- | --- |
| `schema` | `1` |
| `kind` | `music` or `sound`. A `sound` piece is a sound effect or an ambience |
| `project` | `{ id, name }`; `id` matches `^[a-z0-9][a-z0-9-]{0,47}$`; `name` 1–80 chars. Every piece belongs to one project |
| `piece` | `{ id, title }`; `id` matches `^[a-z0-9][a-z0-9-]{0,47}$`; `title` 1–120 chars |
| `draft` | integer ≥ 1 (the draft version) |
| `made` | ISO 8601 UTC string ending in `Z` |
| `duration` | seconds, > 0; for `sound`, ≥ 0.05 |
| `bars` | `music`: integer ≥ 1, the last bar number (bars count from 1). `sound`: absent |
| `tempo` | `music`: ≥ 1 of `{ bar, bpm, beats, unit }`; first `bar` is 1; bars strictly increasing and ≤ `bars`; `bpm` > 0 counts `unit` notes per minute; `beats` integer 1–16; `unit` one of 1, 2, 4, 8, 16. `sound`: absent |
| `sections` | `music`: ≥ 1 of `{ id, name, from_bar, to_bar, color }`; contiguous: the first starts at bar 1, each starts one bar after the previous ends, the last ends at `bars`; `name` is plain words, 1–60 chars. `sound`: ≥ 0 named moments `{ id, name, from, to, color }` in seconds; `0 ≤ from < to ≤ duration`, in time order, none overlapping the one before; `name` 1–60 chars; sections of either kind have unique ids |
| `lanes` | ≥ 1 of `{ id, name, family, icon, color, sound? }` (for a sound piece the lanes are its layers); unique ids; `family` and `icon` each one of `strings`, `brass`, `woodwinds`, `percussion`, `choir`, `keys`, `synth`, `harp`, `bells`, `impact`, `whoosh`, `ambience`, `voice`, `electronic`, `foley`, `ui`; either kind may use any family; `sound`, optional, is `{ instrument, gain_db, attack, release }`: `instrument` an id in `music/library/library.json` (the tool checks it; the page checks only the id format when it parses, and the renderer refuses an id the fetched library lacks), `gain_db` −40 to 20, `attack` 0–10 and `release` 0–20 seconds |
| `mix` | optional `{ style: "lofi", loudness }`; `loudness` −30 to −10 (LUFS). A score is **renderable** when every lane has `sound` and `mix` is present: the page plays it from the sample library, so it needs no audio file |
| `characters` | ≥ 0 of `{ id, name, color }`; unique ids; `name` 1–60 chars. The page has no built-in characters or colours |
| `motifs` | `{ id, character, spans: [{ lane, from, to }] }`; `character` is the `id` of an entry of `characters` (the motif takes that character's colour); `from` < `to` seconds within `[0, duration]`; `lane` names a lane |
| `notes` | ≥ 0 of `{ lane, start, length, pitch, velocity, motif }` (a sound piece may have none, and then has no Piano roll); `start` ≥ 0 and `start + length` ≤ `duration` (seconds), `length` > 0; `pitch` MIDI integer 0–127; `velocity` integer 1–127; `motif` a motif id or `null` |
| `energy` | ≥ 2 points `[seconds, value]`; times strictly increasing, first 0, last `duration`; values in [0, 1] |
| `glossary` | `{ term, from, to }`; `term` is a page glossary id (an `id` in `games/workroom/src/glossary.json`, the glossary's one source; the page and the tool both read it); `0 ≤ from < to ≤ duration`, `to - from` ≤ 15 |
| `audio` | ≥ 1 of `{ file, type }` (an empty list only for a renderable score); `file` is `audio.webm` (type `audio/webm; codecs=opus`) or `audio.m4a` (type `audio/mp4; codecs=mp4a.40.2`) |
| `spectrogram` | required unless the score is renderable; `{ file: "spectrogram.png", low_hz, high_hz, scale }`; 0 < `low_hz` < `high_hz`; `scale` `log` or `linear` |
| `musicxml` | `music`: `"score.musicxml"`, required; each lane is the MusicXML part whose `id` equals the lane id. `sound`: absent, or `"score.musicxml"` (a sound piece never shows Sheet music) |
| `changes` | `music`: `{ from_bar, to_bar, lane, text, answers }` with `1 ≤ from_bar ≤ to_bar ≤ bars`. `sound`: `{ from, to, lane, text, answers }` with `0 ≤ from < to ≤ duration` seconds. Both: `lane` a lane id or `null`; `text` 1–500 chars; `answers` a list of note ids (32 hex) |

Colours everywhere match `^#[0-9a-f]{6}$`. Ids everywhere match `^[a-z0-9][a-z0-9-]{0,47}$`. The server checks only what it records or must refuse (`schema`, `kind`, `project`, `piece`, `draft`, the file set, the file signatures and whether a draft without audio is renderable); the page and the tool check every rule in the table.

## Setup

The owner runs `make music-setup` (in `websites/www.cs`). Two kinds of key are involved. The
**notes key** is the encryption key: its private half and passphrase live in 1Password,
and a locked copy goes to the server so any device can open notes with the passphrase.
The page takes the public half it seals to from that unlocked copy, so notes are sealed
before they leave the phone and the server cannot swap the key.
**API keys** are not encryption: they are passwords that let the key tool talk to the
server. `music-publish` (boxes `drafts:publish` and `keys:publish`) uploads drafts and
the locked copy; `music-pickup` (box `notes:pickup`) downloads waiting notes. They are
made on the admin hub's API keys page (`https://www.cs.siue.edu/~wgrim/admin/keys.php`,
which accepts `?label=` and `?scopes=a,b` to fill the form in; it never creates a key
from a GET); a key is shown once.
