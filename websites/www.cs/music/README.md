# Music workroom

A signed-in admin page on www.cs for music and sound-effect drafts, with
end-to-end-encrypted notes. It serves any project: a piece's `score.json` names
its project, its kind (`music` or `sound`) and its characters.

## Security model

- Notes are sealed in the browser (AES-256-GCM per note, key wrapped with RSA-OAEP
  to the committed public key). The server stores sealed bytes only and never
  decrypts; www.cs PHP has no sodium and needs none.
- The private keys live in one locked keyring (PBKDF2-SHA-256, 600,000 rounds,
  AES-256-GCM) that only a signed-in session can fetch; it is unlocked in the
  browser, in memory, and never stored there.
- Pages need the admin session. Page loads must be browser navigations; the JSON
  and byte routes refuse cross-site requests; every POST needs the session's
  CSRF token. All routes refuse plain HTTP.
- API keys are made on the admin hub and carry scopes. A key cannot delete.
- `lib/`, `tools/`, `pieces/` and `keys/` are never served (`.htaccess` on Apache,
  `docker/nginx/default.conf` locally). `deploy.sh` ships the pages, `api/`, `lib/`,
  `music.css` and `keys/public.json` only.

## Routes

Session routes (same-origin, signed in): `index.php`, `piece.php?id=&v=` (pages);
`csrf.php`, `notes.php` (GET list, POST upload), `note.php?id=`, `delete.php`
(POST), `keyring.php`, `drafts.php?piece=`, `draft.php?piece=&v=&file=` (data).

API routes (Bearer key, HTTPS): `api/notes.php` and `api/note.php?id=` (GET) and
`api/picked-up.php` (POST) need `notes:pickup`; `api/drafts.php` (POST) needs
`drafts:publish`; `api/keyring.php` (POST) needs `keys:publish`.

## Limits

- A sealed note is at most 2,097,152 bytes; 2,000 notes are kept.
- A draft request is at most 8 MB (declared `Content-Length`, refused with 413
  before the script reads the body); the newest 20 drafts are kept; a publish that would
  leave more than 100 MB stored is refused with 413.

## After a deploy

`curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer throwaway' https://www.cs.siue.edu/~wgrim/music/api/notes.php`
must answer 403 (or 200 with a real key), never 401: a 401 means Apache is not
handing the Authorization header to PHP.

## Make targets

None yet; the answering tools bring their own.

## API keys

Sign in at the admin hub, open the API key panel and create two keys: one with
`notes:pickup` (pickup of notes) and one with `drafts:publish` and `keys:publish`
(publishing drafts and the locked keyring). A key is shown once.
