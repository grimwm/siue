<?php
// The signed-in routes: the two page shells and the JSON and byte routes the
// workroom's own script fetches. Every route runs the same gates in the same
// order (HTTPS, who may ask, a studio session, CSRF for a POST), then serves the
// studio of the session's account and no other; the account never comes from the
// request. An API key and an admin session are never a studio session.
declare(strict_types=1);

namespace Music;

use Admin\Html;

final class Pages
{
    private const MIME = [
        'score.json' => 'application/json',
        'score.musicxml' => 'application/vnd.recordare.musicxml+xml',
        'audio.webm' => 'audio/webm',
        'audio.m4a' => 'audio/mp4',
        'spectrogram.png' => 'image/png',
    ];
    private const NOTE_ERRORS = ['too_large' => 413, 'over_quota' => 413, 'full' => 409, 'bad_header' => 422, 'unknown_key' => 422, 'no_key' => 503];
    private const LISTED_CHANGES = 3;

    /** Where a signed-out page visit goes: the studio's own sign-in. */
    private string $login;

    /**
     * $storeFor: fn(int $account): Store, the studio of one account; $sessions: the studio realm's sessions;
     * $assetVersion: 10 hex over games/workroom/dist's workroom.js, sheet.js, theme.js and workroom.css (the ?v= on
     * each; the script passes it on to sheet.js); $baseUrl: admin_base_url(), the studio's folder sits beside it;
     * $aiKeys: every studio's AI keys, of which a page shows and changes only its own account's.
     */
    public function __construct(
        private \Closure $storeFor,
        private Accounts $accounts,
        private \Admin\People $people,
        private \Admin\Sessions $sessions,
        private string $assetVersion,
        private string $baseUrl,
        private AiKeys $aiKeys,
    ) {
        $this->login = \Admin\Realm::studio($baseUrl)->baseUrl . 'login.php';
    }

    /** GET index.php: the pieces, grouped by project. */
    public function index(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, function (Store $store, int $account) use ($r): \Admin\Response {
            $latest = [];
            foreach ($store->drafts() as $row) {
                $latest[$row['piece']] ??= $row;
            }
            $groups = [];
            foreach ($latest as $row) {
                $key = $row['project_id'];
                $groups[$key]['name'] ??= $row['project_name'];
                $groups[$key]['rows'][] = $row;
            }
            // A piece recorded with no project goes last.
            if (isset($groups[''])) {
                $none = $groups[''];
                unset($groups['']);
                $groups[''] = ['name' => 'No project'] + $none;
            }
            $body = '<p class="waiting-total">' . $store->waitingCount() . ' notes waiting for pickup</p>';
            foreach ($groups as $group) {
                $body .= '<section class="project"><h2 class="project">' . Html::e($group['name']) . '</h2><ul class="pieces">';
                foreach ($group['rows'] as $row) {
                    $body .= $this->pieceRow($store, $row);
                }
                $body .= '</ul></section>';
            }
            if ($groups === []) {
                $body .= '<p class="empty">No drafts have been published yet.</p>';
            }
            return $this->shell(200, 'Music workroom', 'index', '', '', $body, $r, $store, $account);
        }, null, 'index.php');
    }

    /** Where a signed-out visit to piece.php returns after sign-in: the piece and draft it asked for, when both are well-formed, else nowhere. */
    private static function pieceBack(\Admin\Request $r): string
    {
        $id = $r->query['id'] ?? null;
        $v = $r->query['v'] ?? '';
        if (!Store::validPieceId($id) || ($v !== '' && !Store::validVersion($v))) {
            return '';
        }
        return 'piece.php?id=' . $id . ($v === '' ? '' : '&v=' . $v);
    }

    /** GET piece.php?id=<piece>[&v=<n>]: the page shell. */
    public function piece(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, function (Store $store, int $account) use ($r): \Admin\Response {
            $id = $r->query['id'] ?? null;
            $v = $r->query['v'] ?? '';
            if (!Store::validPieceId($id) || ($v !== '' && !Store::validVersion($v))) {
                return $this->errorPage(400, 'No such piece.');
            }
            return $this->shell(200, 'Music workroom', 'piece', $id, $v, '', $r, $store, $account);
        }, null, self::pieceBack($r));
    }

    /** GET studio.php: Your studio, a plain page that needs no script. */
    public function studio(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, fn(Store $store, int $account): \Admin\Response => $this->studioPage(200, $r, $account), 'GET', 'studio.php');
    }

    /**
     * POST studio.php: action make-key (label, scopes[]), revoke-key (id) or start-over (confirm, "start over" in any
     * case and spacing around it), each with the session's token in the csrf field. A new key is shown on this response
     * only; a revoke or a start over goes back to the page.
     */
    public function studioAction(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, function (Store $store, int $account) use ($r): \Admin\Response {
            $given = $r->post['csrf'] ?? '';
            if (!is_string($given) || !$this->sessions->checkCsrf($r, $given)) {
                return $this->studioPage(403, $r, $account, 'This form expired. Try again.');
            }
            $field = static fn(string $name): string => is_string($r->post[$name] ?? null) ? $r->post[$name] : '';
            switch ($field('action')) {
                case 'make-key':
                    $scopes = is_array($r->post['scopes'] ?? null) ? array_values($r->post['scopes']) : [];
                    try {
                        $key = $this->aiKeys->create($account, $field('label'), $scopes);
                    } catch (\InvalidArgumentException $e) {
                        return $this->studioPage(400, $r, $account, $e->getMessage());
                    }
                    return $this->studioPage(200, $r, $account, null, ['key' => $key, 'label' => trim($field('label'))]);
                case 'revoke-key':
                    $id = $field('id');
                    if (!ctype_digit($id) || !$this->aiKeys->revoke($account, (int) $id)) {
                        return $this->studioPage(404, $r, $account, 'No active key of yours has that id.');
                    }
                    return Http::finish(new \Admin\Response(303, ['Location' => 'studio.php'], ''));
                case 'start-over':
                    if (strtolower(trim($field('confirm'))) !== 'start over') {
                        return $this->studioPage(400, $r, $account, 'Nothing was deleted. Type start over to confirm.');
                    }
                    $this->accounts->startOver($account);
                    return Http::finish(new \Admin\Response(303, ['Location' => 'studio.php'], ''));
                default:
                    return $this->studioPage(400, $r, $account, 'Unknown action.');
            }
        }, 'POST', 'studio.php');
    }

    /**
     * Your studio: the address, usage of the account's limit, its AI keys with the form that makes one, start over,
     * and sign out. $error explains a refused form; $made is a key just made, shown here and never again.
     *
     * @param array{key: string, label: string}|null $made
     */
    private function studioPage(int $status, \Admin\Request $r, int $account, ?string $error = null, ?array $made = null): \Admin\Response
    {
        $csrf = Html::e($this->sessions->csrf($r));
        $hidden = static fn(string $action): string => '<input type="hidden" name="csrf" value="' . $csrf . '"><input type="hidden" name="action" value="' . $action . '">';
        $usage = $this->accounts->usage($account);
        $quota = $this->limitsOf($account)->quotaBytes;
        $body = '<h1>Your studio</h1>';
        if ($error !== null) {
            $body .= '<p class="error" role="alert">' . Html::e($error) . '</p>';
        }
        if ($made !== null) {
            $body .= '<section class="studio-card newkey" role="status"><h2>Your new AI key: ' . Html::e($made['label']) . '</h2>'
                . '<code class="secret">' . Html::e($made['key']) . '</code><p>Copy it now: it is not shown again.</p></section>';
        }
        $body .= '<section class="studio-card"><address>' . Html::e((string) $this->accounts->emailOf($account)) . '</address>'
            . '<meter min="0" max="' . $quota . '" value="' . $usage . '">' . Usage::human($usage) . '</meter>'
            . '<p class="usage">' . Usage::human($usage) . ' of ' . Usage::human($quota) . ' used</p></section>';

        $keys = '';
        foreach ($this->aiKeys->list($account) as $k) {
            $words = implode(', ', array_map(static fn(string $s): string => AiKeys::SCOPES[$s] ?? $s, $k['scopes']));
            $keys .= '<li><strong>' . Html::e($k['label']) . '</strong><p>Permissions: ' . Html::e($words) . '</p>'
                . '<p>Last used: ' . ($k['last_used_at'] === null ? 'never' : self::when($k['last_used_at'])) . '</p>'
                . ($k['revoked_at'] === null
                    ? '<form method="post" action="studio.php">' . $hidden('revoke-key') . '<input type="hidden" name="id" value="' . $k['id'] . '"><button type="submit">Revoke</button></form>'
                    : '<p>Revoked ' . self::when($k['revoked_at']) . '</p>')
                . '</li>';
        }
        $checks = '';
        foreach (AiKeys::SCOPES as $scope => $words) {
            $checks .= '<label><input type="checkbox" name="scopes[]" value="' . Html::e($scope) . '"> ' . Html::e($words) . '</label>';
        }
        $body .= '<section class="studio-card"><h2>AI keys</h2><p>An AI key lets one AI work in your studio with the permissions you give it.</p>'
            . ($keys === '' ? '<p class="empty">No AI keys yet.</p>' : '<ul class="studio-keys">' . $keys . '</ul>')
            . '<h3>Make an AI key</h3><form method="post" action="studio.php">' . $hidden('make-key')
            . '<label for="key-label">Label</label><input id="key-label" type="text" name="label" maxlength="' . AiKeys::LABEL_MAX . '" required>'
            . '<fieldset><legend>Permissions</legend>' . $checks . '</fieldset><button type="submit">Make key</button></form></section>';

        $body .= '<section class="studio-card"><h2>Start over</h2>'
            . '<p>Start over deletes every piece, draft and note in your studio, your notes key and your AI keys. Nobody can undo it, and nobody can get them back. Use it if you forgot your passphrase. Type start over to confirm.</p>'
            . '<form method="post" action="studio.php">' . $hidden('start-over')
            . '<label for="confirm">Type start over</label><input id="confirm" type="text" name="confirm" autocomplete="off" required>'
            . '<button type="submit" class="danger">Start over</button></form></section>';

        $body .= '<section class="studio-card studio-signout">'
            . Html::form('logout.php', ['csrf' => $this->sessions->csrf($r)], 'Sign out', 'quiet')
            . Html::form('logout.php?all=1', ['csrf' => $this->sessions->csrf($r)], 'Sign out everywhere', 'danger')
            . '</section>';

        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light">'
            . '<title>Your studio</title>' . $this->assets() . '</head>'
            . '<body data-view="studio"><header class="console-head"><p class="crumb"><a href="./">All pieces</a></p></header>'
            . '<main class="index-body studio">' . $body . '</main></body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }

    private static function when(int $t): string
    {
        return gmdate('Y-m-d H:i', $t) . ' UTC';
    }

    /** GET csrf.php: the session's current token. */
    public function csrf(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, fn(): \Admin\Response => Http::json(200, ['csrf' => $this->sessions->csrf($r)]), 'GET');
    }

    /** GET notes.php lists the history; POST uploads one sealed note ($body). */
    public function notes(\Admin\Request $r, string $body): \Admin\Response
    {
        if ($r->method === 'POST') {
            return $this->guarded($r, false, true, function (Store $store, int $account) use ($r, $body): \Admin\Response {
                try {
                    $note = $store->addNote($body);
                } catch (NoteRejected $e) {
                    $more = $e->reason === 'over_quota'
                        ? ['room' => $e->room, 'message' => Usage::refusal($e->room, $this->limitsOf($account)->quotaBytes)]
                        : [];
                    return $this->refuseWithToken(self::NOTE_ERRORS[$e->reason] ?? 422, $e->reason, $r, $more);
                }
                return Http::json(201, ['id' => $note['id'], 'csrf' => $this->sessions->csrf($r)]);
            }, 'POST');
        }
        return $this->guarded($r, false, false, function (Store $store): \Admin\Response {
            $notes = array_map(static function (array $n): array {
                unset($n['sha256']);
                return $n;
            }, $store->notes());
            return Http::json(200, ['notes' => $notes]);
        }, 'GET');
    }

    /** GET note.php?id=: one sealed note's bytes. */
    public function note(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function (Store $store) use ($r): \Admin\Response {
            $id = $r->query['id'] ?? null;
            if (!Store::validNoteId($id)) {
                return Http::json(400, ['error' => 'bad_id']);
            }
            $bytes = $store->noteBytes($id);
            if ($bytes === null) {
                return Http::json(404, ['error' => 'not_found']);
            }
            return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/octet-stream', 'Content-Length' => (string) strlen($bytes)], $bytes));
        }, 'GET');
    }

    /** POST delete.php: one note (post id) or all of them (post all=1). */
    public function delete(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, true, function (Store $store) use ($r): \Admin\Response {
            $id = $r->post['id'] ?? null;
            if (($r->post['all'] ?? null) === '1') {
                $deleted = $store->deleteAllNotes();
            } elseif (Store::validNoteId($id)) {
                $deleted = $store->deleteNote($id) ? 1 : 0;
            } else {
                return $this->refuseWithToken(400, 'bad_id', $r);
            }
            return Http::json(200, ['deleted' => $deleted, 'csrf' => $this->sessions->csrf($r)]);
        }, 'POST');
    }

    /**
     * GET keyring.php: the locked keyring, and this session's unlock tag (the page forgets a remembered unlock when it
     * changes). POST stores the keyring the page made or rewrote ($body, Keyring::parseUpload's wrapper), replacing
     * this studio's.
     */
    public function keyring(\Admin\Request $r, string $body = ''): \Admin\Response
    {
        if ($r->method === 'POST') {
            return $this->guarded($r, false, true, function (Store $store) use ($r, $body): \Admin\Response {
                if (strlen($body) > Store::MAX_KEYRING_BYTES) {
                    return $this->refuseWithToken(413, 'too_large', $r);
                }
                $parsed = Keyring::parseUpload($body);
                if ($parsed === null) {
                    return $this->refuseWithToken(422, 'bad_keyring', $r);
                }
                $store->putKeyring($parsed['locked'], $parsed['current'], $parsed['previous']);
                return Http::json(201, ['uploaded' => true, 'csrf' => $this->sessions->csrf($r)]);
            }, 'POST');
        }
        return $this->guarded($r, false, false, function (Store $store) use ($r): \Admin\Response {
            $row = $store->keyring();
            $keyring = $row === null ? null : json_decode($row['locked'], true);
            if ($row === null) {
                return Http::json(404, ['error' => 'no_keyring']);
            }
            if (!is_array($keyring)) {
                error_log('music: the stored keyring is not valid JSON');
                return Http::json(500, ['error' => 'bad_keyring']);
            }
            return Http::json(200, ['keyring' => $keyring, 'session' => $this->sessions->tag($r, 'music-unlock')]);
        }, 'GET');
    }

    /** GET drafts.php?piece=: a piece's kept versions, newest first. */
    public function drafts(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function (Store $store) use ($r): \Admin\Response {
            $piece = $r->query['piece'] ?? null;
            if (!Store::validPieceId($piece)) {
                return Http::json(400, ['error' => 'bad_piece']);
            }
            $drafts = array_map(
                static fn(array $d): array => ['version' => $d['version'], 'published_at' => $d['published_at']],
                $store->drafts($piece),
            );
            return Http::json(200, ['drafts' => $drafts]);
        }, 'GET');
    }

    /** POST delete-draft.php: one draft (post piece and v), or every draft of a piece (piece and no v). 404 when none went. */
    public function deleteDraft(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, true, function (Store $store) use ($r): \Admin\Response {
            $piece = $r->post['piece'] ?? null;
            $v = $r->post['v'] ?? '';
            if (!Store::validPieceId($piece)) {
                return $this->refuseWithToken(400, 'bad_piece', $r);
            }
            if ($v !== '' && !Store::validVersion($v)) {
                return $this->refuseWithToken(400, 'bad_version', $r);
            }
            $deleted = $v === '' ? $store->deletePiece($piece) : ($store->deleteDraft($piece, (int) $v) ? 1 : 0);
            if ($deleted === 0) {
                return $this->refuseWithToken(404, 'not_found', $r);
            }
            return Http::json(200, ['deleted' => $deleted, 'csrf' => $this->sessions->csrf($r)]);
        }, 'POST');
    }

    /** GET draft.php?piece=&v=&file=: one draft file, with Range for audio. */
    public function draftFile(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function (Store $store) use ($r): \Admin\Response {
            $piece = $r->query['piece'] ?? null;
            $v = $r->query['v'] ?? null;
            $file = $r->query['file'] ?? null;
            if (!Store::validPieceId($piece) || !Store::validVersion($v) || !is_string($file) || !isset(self::MIME[$file])) {
                return Http::json(400, ['error' => 'bad_request']);
            }
            $bytes = $store->draftBytes($piece, (int) $v, $file);
            if ($bytes === null) {
                return Http::json(404, ['error' => 'not_found']);
            }
            return Http::serveBytes($bytes, self::MIME[$file], Http::header($r, 'Range'));
        }, 'GET');
    }

    /**
     * Runs the gates in order, then $work with the studio of the session's account. $page: a browser navigation only
     * (Fetch Metadata), else the route refuses cross-site requests. $post: CSRF is checked. $method: the one method the
     * route takes. Without a studio session a page goes to the studio's sign-in, carrying $back (a studio page the
     * sign-in returns to) when SignIn::safeNext accepts it, and a data route answers 401 for the page's script.
     *
     * @param \Closure(Store, int): \Admin\Response $work
     */
    private function guarded(\Admin\Request $r, bool $page, bool $post, \Closure $work, ?string $method = null, string $back = ''): \Admin\Response
    {
        $refused = admin_refuse_plain_http($r, $this->baseUrl);
        if ($refused === null) {
            $refused = $page ? admin_refuse_script_fetch($r) : Http::refuseCrossSite($r);
        }
        if ($refused !== null) {
            return Http::finish($refused);
        }
        try {
            $account = $this->sessions->account($r);
            if ($account === null) {
                if (!$page) {
                    return Http::json(401, ['error' => 'signed_out']);
                }
                $next = \Admin\SignIn::safeNext($back, 'studio');
                return Http::finish(new \Admin\Response(303, ['Location' => $this->login . ($next === '' ? '' : '?next=' . rawurlencode($next))], ''));
            }
            if ($method !== null && $r->method !== $method) {
                return Http::json(405, ['error' => 'method']);
            }
            if ($post && !$this->sessions->checkCsrf($r, Http::header($r, 'X-CSRF') ?? '')) {
                return Http::json(403, ['error' => 'csrf']);
            }
            return $work(($this->storeFor)($account), $account);
        } catch (\PDOException $e) {
            return Http::finish(\Admin\Pages::fromStorageError($e));
        }
    }

    /** The limits of $account's address under the deploy's configuration. */
    private function limitsOf(int $account): Limits
    {
        return Limits::for($this->people, (string) $this->accounts->emailOf($account));
    }

    /**
     * A refusal of a POST that passed its CSRF check: the error, anything $more says about it, and the next token.
     * @param array<string, mixed> $more
     */
    private function refuseWithToken(int $status, string $error, \Admin\Request $r, array $more = []): \Admin\Response
    {
        return Http::json($status, ['error' => $error] + $more + ['csrf' => $this->sessions->csrf($r)]);
    }

    /** @param array{piece: string, version: int, kind: string} $row */
    private function pieceRow(Store $store, array $row): string
    {
        $score = [];
        $json = $store->draftBytes($row['piece'], $row['version'], 'score.json');
        $decoded = $json === null ? null : json_decode($json, true);
        if (is_array($decoded)) {
            $score = $decoded;
        }
        $title = $score['piece']['title'] ?? null;
        $title = is_string($title) && $title !== '' ? $title : $row['piece'];
        $changes = '';
        $listed = 0;
        foreach (is_array($score['changes'] ?? null) ? $score['changes'] : [] as $change) {
            if ($listed === self::LISTED_CHANGES) {
                break;
            }
            if (is_array($change) && is_string($change['text'] ?? null)) {
                $changes .= '<li>' . Html::e($change['text']) . '</li>';
                $listed++;
            }
        }
        $id = Html::e($row['piece']);
        return '<li class="piece" data-kind="' . Html::e($row['kind']) . '"><a href="piece.php?id=' . $id . '" data-waiting="' . $id . '">'
            . Html::e($title) . '</a><span class="waiting-count"></span><span class="version">v' . (int) $row['version'] . '</span><ul class="changes">' . $changes . '</ul></li>';
    }

    /** The head's assets: the theme boot first (a plain script, so data-theme is set before the first paint), then the stylesheet. */
    private function assets(): string
    {
        $v = Html::e($this->assetVersion);
        return '<script src="../games/workroom/dist/theme.js?v=' . $v . '"></script>'
            . '<link rel="stylesheet" href="../games/workroom/dist/workroom.css?v=' . $v . '">';
    }

    private function errorPage(int $status, string $message): \Admin\Response
    {
        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light">'
            . '<title>' . Html::e($message) . '</title>' . $this->assets() . '</head>'
            . '<body><header class="console-head"><p class="crumb"><a href="./">All pieces</a></p></header>'
            . '<main class="index-body"><p class="error" role="alert">' . Html::e($message) . '</p></main></body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }

    /**
     * The page shell. The body tells the script this studio's largest note (data-note-max), its room in bytes
     * (data-room), whether its address has the allowance (data-named) and whether its keyring is stored
     * (data-account-has-key); each flag is "1" or "0".
     */
    private function shell(int $status, string $title, string $view, string $piece, string $version, string $body, \Admin\Request $r, Store $store, int $account): \Admin\Response
    {
        $email = (string) $this->accounts->emailOf($account);
        $studio = ' data-note-max="' . $this->limitsOf($account)->maxNoteBytes . '" data-room="' . $store->room() . '"'
            . ' data-named="' . ($this->people->hasAllowance($email) ? '1' : '0') . '"'
            . ' data-account-has-key="' . ($store->keyring() === null ? '0' : '1') . '"';
        $v = Html::e($this->assetVersion);
        $heading = ($view === 'piece' ? '<p class="crumb"><a href="./">All pieces</a></p>' : '<h1>' . Html::e($title) . '</h1>')
            . '<p class="crumb"><a href="studio.php">Your studio</a></p>';
        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow">'
            . '<meta name="color-scheme" content="dark light">'
            . '<meta name="csrf" content="' . Html::e($this->sessions->csrf($r)) . '">'
            . '<title>' . Html::e($title) . '</title>'
            . $this->assets()
            . '</head><body data-view="' . Html::e($view) . '" data-piece="' . Html::e($piece) . '" data-version="' . Html::e($version) . '"' . $studio . '>'
            . '<header class="console-head">' . $heading . '<div id="theme-switch"></div></header>'
            . ($body === '' ? '' : '<div class="index-body">' . $body . '</div>')
            . '<main id="workroom"></main>'
            . '<script type="module" src="../games/workroom/dist/workroom.js?v=' . $v . '"></script>'
            . '</body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }
}
