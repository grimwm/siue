# Music studios for everyone at SIUE

The music workroom becomes a private studio for anyone with an `@siue.edu`
address: their own pieces, drafts, notes and keys, made by composing in the
editor, by working with an AI they connect, or both.

## Why

The owner's students make music for their game projects, and faculty can use
it to teach AI, music, and the arts and sciences together. Today one person
(`wgrim@siue.edu`) can sign in, every note is sealed to that one person's key,
and drafts are published from a terminal with 1Password. None of that works
for a class.

## Goals

- **Sign-in:** anyone whose address ends in `@siue.edu` signs in with an
  emailed link, as the owner does today.
- **A private studio:** each person's pieces, drafts, notes and keys are theirs
  alone.
  - Nobody else can see or hear any of it, including the owner, other faculty
    and the server.
  - A piece leaves a studio only when its owner downloads it (audio, sheet
    music, the score) and sends it on.
- **Two ways to make music, freely mixed:**
  - composing in the editor (its own project, below);
  - an AI the person connects, which publishes drafts straight into the studio.
- **Drafts appear at once.** An AI's draft goes straight in, like the owner's
  publishes today, with no approval step.
  - The person can delete any draft or piece at any time, on the page or by
    asking their AI, whose MCP tool deletes it.
- **Keys made from the page:**
  - A **notes key**, locked with the person's own passphrase.
  - **AI keys**, each connecting one AI, with limited permissions.
  - No 1Password and no `make` is needed.
- **A live connection for AI.** A local MCP server notices new notes within
  seconds and hands them to the connected AI.

## Non-goals

- Sharing editable work between people (later).
- Any view of another person's studio, for anyone.
- University rules about coursework (the owner: "ignore what I said about the
  university"; this is a private studio).
- Recovering a forgotten passphrase.

## Anti-goals

- A student ever seeing, hearing or reaching another studio's data, or the
  admin hub.
- The server ever able to read a note.
- One person filling the shared host.

## Decided by the owner

- **No resets.** Notes are sealed with a key only the person's passphrase
  unlocks. A forgotten passphrase means "start over": that person's whole
  studio is deleted and they begin empty. Nothing is recoverable, by anyone.
- **A hard limit of 4–6 MB per person** for everyone except specially named
  people, who get more. The design uses **5 MB** (my call within that range).
- **Store the composition, not its renders.** A long piece's score is about
  45 KB, or about 4 KB compressed; its audio is 2.7 MB. The browser builds
  the audio, the sheet music and the sound picture from the score and a
  shared sample library.
- **Lossless compression on the server** for everything stored:
  - scores and other text are compressed with a lossless general compressor;
  - the shared instrument samples are stored as FLAC;
  - nothing is ever re-encoded lossily.
- **Drafts appear at once,** and deleting (on the page, or by the AI through
  the MCP) is always available.
- **AI connection over MCP,** with the MCP server on the person's own computer.

## How it works (decided in conversation)

### Accounts and sign-in

- **Who may sign in:** an address whose domain is exactly `siue.edu`, after the
  existing checks:
  - trimmed and lower-cased;
  - CR/LF refused;
  - a generic reply to everyone else.
- **One account per address,** created at the first completed sign-in.
- **Rate limits** stay per address and per IP. The global limit (today 30 links
  an hour) is raised to fit a class signing in at once.
- **Studio users are not admins.** A studio session reaches only the studio's
  pages and routes. The admin hub (`/admin/`: keys, health, other dashboards)
  stays for named admins only.
- **Named people** are a short list in the server's configuration, not in git
  (the repo is public). The owner is on it. Each named person has two flags:
  - **admin:** reaches the admin hub;
  - **allowance:** a larger studio limit.

  The owner's current studio becomes his account's studio, with its pieces
  and drafts kept.

### The studio's storage

- Every row and file belongs to one account. Every query names the account
  from the session or the AI key, never from the request.
  - Pieces, drafts, notes, keyrings and keys are all per account.
  - The owner's single-keyring table becomes one keyring per account.
- **A draft is its `score.json`,** checked by the same validator as today.
  - MusicXML, audio and the spectrogram are not stored for studio users; the
    browser makes them.
  - Named people may keep publishing full drafts with audio, as today, within
    their allowance.
- **Usage** is the stored bytes after compression: scores plus sealed notes,
  hums included.
  - An upload that would pass the limit is refused, with a message that says
    how much room is left and how to free some (delete drafts, or picked-up
    notes).
- **Start over** deletes the account's rows and files, its keyring and its AI
  keys, after the person types a confirmation. Their sign-in stays.
- **The admin view** (named admins only) lists accounts with their usage and
  last sign-in, and can remove an account (the same delete as start over).
  It never shows names of pieces or any content.

### Notes and keys

- **The notes key** is made in the browser on the first visit:
  - the person chooses a passphrase;
  - the browser makes the key pair and uploads the keyring locked with
    PBKDF2-SHA-256 (600,000 rounds) and AES-GCM, as the owner's is today;
  - the remembered unlock works as now.
- **Notes** are compressed losslessly in the browser, then sealed, as today.
  - Hums are kept exactly as the browser recorded them.
- **AI keys** are made on the studio's page:
  - **Scopes:** read notes, publish drafts, delete drafts.
  - **Shown once.** Only a hash is stored, the same rule as the owner's API
    keys today.
  - **The person can revoke a key** at any time.
- **Connecting an AI** also gives it a sealing key of its own:
  - The AI's machine makes a key pair and registers the public half with the
    studio, through the AI key.
  - From then on, the browser seals each note to both the person's key and the
    AI's key, so the AI can open notes without the person's passphrase.
  - Revoking the AI key removes its public key, and new notes stop being sealed
    to it.

### The MCP server

- **A small program on the person's computer,** started by their AI app (Claude
  Code, Claude Desktop or another MCP client). It is configured with:
  - the studio's address;
  - the AI key;
  - the AI's private sealing key, kept in that computer's user config folder.
- **Tools:**
  - list pieces and drafts;
  - read a draft's score;
  - publish a draft (a score);
  - delete a draft or a piece;
  - read new notes, opened locally;
  - wait for notes;
  - mark notes picked up.
- **"Wait for notes"** asks the server every few seconds and returns as soon as
  something arrives, so a connected AI starts work within seconds of a note
  being sent.
- **The www.cs server never calls out and holds no connections open.** It is a
  plain PHP host with per-request execution and sftp-only access, so
  WebSockets are not available. Long-polling is used only if a probe of the
  host's limits shows it is safe; plain polling is the default.

### The shared sample library and the browser renderer

- **The instrument samples** live once on the site, as FLAC, for everyone. The
  page loads only the instruments a piece uses. The browser caches them.
- **The browser renders a score** with the same lanes, instruments and lo-fi
  chain as the container pipeline, so a score sounds the same wherever it
  plays. From the rendered audio it draws the sound picture, and from the
  score it writes the sheet music.
- **The rendered audio is cached** in that browser. It is never uploaded.

## Constraints

- The siue repo is public: no secrets, addresses of named people or keys in
  git.
- **The www.cs host:**
  - plain PHP 8.4 behind Apache;
  - no shell, no background processes;
  - deploys only through `deploy.yml`.
- **Shared disk:** the sample library and every account share one host. Before
  the samples ship, a probe checks the host's disk limit and PHP's limits
  (execution time, upload size).
- **Every rule gets its own PHPUnit test:**
  - an account can never read, list, publish over or delete another account's
    data;
  - a studio session never reaches the admin hub.

## Projects and order

This is several projects. Each gets its own plan, and the browser renderer
comes first because a score-only studio cannot be heard without it.

1. **The browser renderer and the shared sample library:** play, render and
   download any score in the browser. It serves the owner's pieces first.
2. **Studios for everyone:** accounts, per-account storage and limits,
   notes keys from the page, AI keys, start over, and the admin view.
3. **The MCP server and AI sealing keys:** the live connection.
4. **Composing in the editor:** add, move and remove notes, choose
   instruments, and hear edits at once. It has its own design, not this one.

## Settled after review (Claude's calls)

- **Studio sessions are separate from admin sessions:**
  - their own cookie (`__Secure-studio`, Path `/~wgrim/music/`), so a studio
    cookie is never sent to `/admin/`;
  - their own sessions table carrying the account id;
  - the same rules as admin sessions: idle and maximum ages, trusted device,
    CSRF on every POST, and "sign out everywhere", all per account.

  A named admin signs in to each place separately.
- **Notes sealed to several keys** use a new note format (`SIUEN2`): one
  AES-GCM body with the AES key wrapped once per recipient, each wrap tagged
  with its key's fingerprint.
  - The server accepts a note only when every recipient is in that account's
    keyring.
  - `SIUEN1` notes stay readable.
  - An AI reads only notes sealed after it was connected; earlier notes are
    never re-wrapped.
- **Only the person can add an AI as a recipient.** An AI's public key joins the
  person's locked keyring, and only the unlocked browser can rewrite that
  keyring. To pair, the MCP prints a short code made from its key's
  fingerprint; the person types the code into the page, and only then does the
  browser add the key. A server that slipped in a key of its own could not
  make the browser seal to it.
- **AI keys** are a new per-account table. The owner's existing API keys and
  his 1Password publish and pickup flow keep working, as keys on his account.
- **A piece** is a name that groups drafts. A piece's first draft creates it,
  deleting a piece deletes its drafts, and pieces have no size of their own.
- **One account per person:**
  - addresses with `+` are refused;
  - the server caps the number of accounts and their total disk, both set in
    its configuration;
  - when either cap is reached, new sign-ups get a plain "the studio is full"
    page.
- **Untrusted scores** get limits on top of today's validator:
  - `score.json` at most 256 KB;
  - at most 20,000 notes;
  - at most 16 lanes;
  - every lane's instrument must be in the shared library.

  The admin view never shows piece names.
- **Notes for studio users:** at most 1 MB each. A 60-second hum is about
  0.5 MB, so one hum is a tenth of a studio.

## Left to the builder

- The schema migration that turns the owner's single-user tables into
  per-account tables while keeping his data.
- The lossless compressor for text (gzip or brotli, whichever the host's PHP
  supports), and how compressed sizes are counted.
- The FLAC encoding settings and how the browser decodes FLAC where it lacks
  native support.
- How the browser renderer reproduces the container's master chain in Web
  Audio, and how closely it must match. A listening comparison of one piece is
  part of done.
- The MCP server's language and packaging, and how often it polls.
- Exact rate-limit numbers.

## Open (Claude's calls, marked for the owner)

- **5 MB** for studio users (the owner said 4–6 MB).
- **The named-person allowance** stays at today's draft limits: 20 drafts and
  100 MB.
- **AI key scopes:** read notes, publish drafts, delete drafts. Never create
  keys, never start over.
