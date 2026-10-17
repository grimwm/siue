<?php
// The signed-in routes: the two page shells and the JSON and byte routes the
// workroom's own script fetches. Every route runs the same gates in the same
// order (HTTPS, who may ask, a session, CSRF for a POST); an API key is never a
// session.
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
    private const NOTE_ERRORS = ['too_large' => 413, 'full' => 409, 'bad_header' => 422, 'unknown_key' => 422, 'no_key' => 503];
    private const ID = '/^[0-9a-f]{32}$/D';
    private const LISTED_CHANGES = 3;

    /** $assetVersion: 10 hex of games/workroom/dist/workroom.js (the ?v= on the script); $baseUrl: admin_base_url(). */
    public function __construct(
        private Store $store,
        private \Admin\Pages $admin,
        private \Admin\Sessions $sessions,
        private ?PublicKeys $keys,
        private string $assetVersion,
        private string $baseUrl,
    ) {
    }

    /** GET index.php: the pieces, grouped by project. */
    public function index(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, function () use ($r): \Admin\Response {
            $latest = [];
            foreach ($this->store->drafts() as $row) {
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
            $body = '<p class="waiting-total">' . $this->store->waitingCount() . ' notes waiting for pickup</p>';
            foreach ($groups as $group) {
                $body .= '<section class="project"><h2 class="project">' . Html::e($group['name']) . '</h2><ul class="pieces">';
                foreach ($group['rows'] as $row) {
                    $body .= $this->pieceRow($row);
                }
                $body .= '</ul></section>';
            }
            if ($groups === []) {
                $body .= '<p class="empty">No drafts have been published yet.</p>';
            }
            return $this->shell(200, 'Music workroom', 'index', '', '', $body, $r);
        });
    }

    /** GET piece.php?id=<piece>[&v=<n>]: the page shell. */
    public function piece(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, true, false, function () use ($r): \Admin\Response {
            $id = $r->query['id'] ?? null;
            $v = $r->query['v'] ?? '';
            if (!Store::validPieceId($id) || !is_string($v) || ($v !== '' && preg_match('/^[1-9]\d{0,3}$/D', $v) !== 1)) {
                return $this->shell(400, 'No such piece.', 'index', '', '', '<p>No such piece.</p>', $r);
            }
            return $this->shell(200, 'Music workroom', 'piece', $id, $v, '', $r);
        });
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
            return $this->guarded($r, false, true, function () use ($r, $body): \Admin\Response {
                try {
                    $note = $this->store->addNote($body);
                } catch (NoteRejected $e) {
                    return $this->refuseWithToken(self::NOTE_ERRORS[$e->reason] ?? 422, $e->reason, $r);
                }
                return Http::json(201, ['id' => $note['id'], 'csrf' => $this->sessions->csrf($r)]);
            }, 'POST');
        }
        return $this->guarded($r, false, false, function (): \Admin\Response {
            $notes = array_map(static function (array $n): array {
                unset($n['sha256']);
                return $n;
            }, $this->store->notes());
            return Http::json(200, ['notes' => $notes]);
        }, 'GET');
    }

    /** GET note.php?id=: one sealed note's bytes. */
    public function note(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function () use ($r): \Admin\Response {
            $id = $r->query['id'] ?? null;
            if (!is_string($id) || preg_match(self::ID, $id) !== 1) {
                return Http::json(400, ['error' => 'bad_id']);
            }
            $bytes = $this->store->noteBytes($id);
            if ($bytes === null) {
                return Http::json(404, ['error' => 'not_found']);
            }
            return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/octet-stream', 'Content-Length' => (string) strlen($bytes)], $bytes));
        }, 'GET');
    }

    /** POST delete.php: one note (post id) or all of them (post all=1). */
    public function delete(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, true, function () use ($r): \Admin\Response {
            $id = $r->post['id'] ?? null;
            if (($r->post['all'] ?? null) === '1') {
                $deleted = $this->store->deleteAllNotes();
            } elseif (is_string($id) && preg_match(self::ID, $id) === 1) {
                $deleted = $this->store->deleteNote($id) ? 1 : 0;
            } else {
                return $this->refuseWithToken(400, 'bad_id', $r);
            }
            return Http::json(200, ['deleted' => $deleted, 'csrf' => $this->sessions->csrf($r)]);
        }, 'POST');
    }

    /** GET keyring.php: the locked keyring. */
    public function keyring(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function (): \Admin\Response {
            $row = $this->store->keyring();
            $keyring = $row === null ? null : json_decode($row['locked'], true);
            return is_array($keyring) ? Http::json(200, ['keyring' => $keyring]) : Http::json(404, ['error' => 'no_keyring']);
        }, 'GET');
    }

    /** GET drafts.php?piece=: a piece's kept versions, newest first. */
    public function drafts(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function () use ($r): \Admin\Response {
            $piece = $r->query['piece'] ?? null;
            if (!Store::validPieceId($piece)) {
                return Http::json(400, ['error' => 'bad_piece']);
            }
            $drafts = array_map(
                static fn(array $d): array => ['version' => $d['version'], 'published_at' => $d['published_at']],
                $this->store->drafts($piece),
            );
            return Http::json(200, ['drafts' => $drafts]);
        }, 'GET');
    }

    /** GET draft.php?piece=&v=&file=: one draft file, with Range for audio. */
    public function draftFile(\Admin\Request $r): \Admin\Response
    {
        return $this->guarded($r, false, false, function () use ($r): \Admin\Response {
            $piece = $r->query['piece'] ?? null;
            $v = $r->query['v'] ?? null;
            $file = $r->query['file'] ?? null;
            if (!Store::validPieceId($piece) || !is_string($v) || preg_match('/^[1-9]\d{0,3}$/D', $v) !== 1 || !is_string($file) || !isset(self::MIME[$file])) {
                return Http::json(400, ['error' => 'bad_request']);
            }
            $path = $this->store->draftFile($piece, (int) $v, $file);
            if ($path === null) {
                return Http::json(404, ['error' => 'not_found']);
            }
            return Http::serveFile($path, self::MIME[$file], Http::header($r, 'Range'));
        }, 'GET');
    }

    /**
     * Runs the gates in order, then $work. $page: a browser navigation only (Fetch Metadata), else the
     * route refuses cross-site requests. $post: CSRF is checked. $method: the one method the route takes.
     *
     * @param \Closure(): \Admin\Response $work
     */
    private function guarded(\Admin\Request $r, bool $page, bool $post, \Closure $work, ?string $method = null): \Admin\Response
    {
        $refused = admin_refuse_plain_http($r, $this->baseUrl);
        if ($refused === null) {
            $refused = $page ? admin_refuse_script_fetch($r) : Http::refuseCrossSite($r);
        }
        if ($refused !== null) {
            return Http::finish($refused);
        }
        try {
            $refused = $this->admin->requireAdmin($r);
            if ($refused !== null) {
                if ($refused->status === 303 && isset($refused->headers['Location'])) {
                    $refused->headers['Location'] = $this->baseUrl . 'login.php';
                }
                return Http::finish($refused);
            }
            if ($method !== null && $r->method !== $method) {
                return Http::json(405, ['error' => 'method']);
            }
            if ($post && !$this->sessions->checkCsrf($r, Http::header($r, 'X-CSRF') ?? '')) {
                return Http::json(403, ['error' => 'csrf']);
            }
            return $work();
        } catch (\PDOException $e) {
            return Http::finish(\Admin\Pages::fromStorageError($e));
        }
    }

    /** A refusal of a POST that passed its CSRF check: the error plus the next token. */
    private function refuseWithToken(int $status, string $error, \Admin\Request $r): \Admin\Response
    {
        return Http::json($status, ['error' => $error, 'csrf' => $this->sessions->csrf($r)]);
    }

    /** @param array{piece: string, version: int, kind: string} $row */
    private function pieceRow(array $row): string
    {
        $score = [];
        $path = $this->store->draftFile($row['piece'], $row['version'], 'score.json');
        $json = $path === null ? false : @file_get_contents($path);
        $decoded = $json === false ? null : json_decode($json, true);
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
            . Html::e($title) . '</a><span class="waiting-count"></span><ul class="changes">' . $changes . '</ul></li>';
    }

    private function shell(int $status, string $title, string $view, string $piece, string $version, string $body, \Admin\Request $r): \Admin\Response
    {
        $v = Html::e($this->assetVersion);
        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow">'
            . '<meta name="color-scheme" content="dark">'
            . '<meta name="csrf" content="' . Html::e($this->sessions->csrf($r)) . '">'
            . '<title>' . Html::e($title) . '</title>'
            . '<link rel="stylesheet" href="music.css?v=' . $v . '">'
            . '</head><body data-view="' . Html::e($view) . '" data-piece="' . Html::e($piece) . '" data-version="' . Html::e($version) . '">'
            . '<h1>' . Html::e($title) . '</h1>'
            . $body
            . '<main id="workroom"></main>'
            . '<script type="module" src="../games/workroom/dist/workroom.js?v=' . $v . '"></script>'
            . '</body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }
}
