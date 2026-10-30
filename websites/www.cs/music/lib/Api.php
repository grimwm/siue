<?php
// The API-key routes: pickup of sealed notes, listing, publishing and deleting
// drafts, deleting a piece, and uploading the locked keyring. Every route checks its key and
// scope first (KeyGate, which names the account the key serves), then the method, then the
// declared length, and works only in that account's studio. Deleting a draft or a piece are
// the only deletes here.
declare(strict_types=1);

namespace Music;

final class Api
{
    public const DRAFT_MAGIC = 'SIUED1';


    /** @var list<string> */
    private array $instruments;

    /**
     * @param \Closure(int): Store $storeFor the studio of an account, with the limits its address has
     * @param list<string>|null $instruments the library's instrument names; production passes none and reads the library
     */
    public function __construct(private \Closure $storeFor, private KeyGate $gate, ?array $instruments = null)
    {
        $this->instruments = $instruments ?? \music_library_instruments();
    }

    public function listNotes(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'notes:pickup', 'GET');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $state = $r->query['state'] ?? null;
        if ($state !== null && $state !== 'waiting' && $state !== 'picked-up') {
            return Http::json(400, ['error' => 'bad_state']);
        }
        return Http::json(200, ['notes' => $store->notes($state)]);
    }

    public function getNote(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'notes:pickup', 'GET');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        $bytes = $store->noteBytes($id);
        if ($bytes === null) {
            return Http::json(404, ['error' => 'not_found']);
        }
        return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/octet-stream', 'Content-Length' => (string) strlen($bytes)], $bytes));
    }

    public function pickedUp(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'notes:pickup', 'POST');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        return $store->markPickedUp($id)
            ? Http::json(200, ['id' => $id, 'picked_up' => true])
            : Http::json(404, ['error' => 'not_found']);
    }

    /**
     * drafts:publish. GET answers the published drafts, newest first. POST ?piece=&version= takes a SIUED1 draft
     * bundle as the body, of at most the account's Limits::maxRequestBytes. $read(int $n) returns the request body's
     * first $n bytes and is called only after the key, the method and the declared length have passed. A draft that
     * would pass the studio limit answers 413 with the room left and Usage::refusal's words.
     */
    public function publishDraft(\Admin\Request $r, \Closure $read): \Admin\Response
    {
        $store = $this->gate($r, 'drafts:publish', ['GET', 'POST']);
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        if ($r->method === 'GET') {
            return Http::json(200, ['drafts' => $store->drafts()]);
        }
        $limits = $store->limits();
        $body = $this->body($r, $read, $limits->maxRequestBytes, $res);
        if ($body === null) {
            return $res;
        }
        $files = self::parseBundle($body);
        if ($files === null) {
            return Http::json(422, ['error' => 'bad_bundle']);
        }
        $piece = $r->query['piece'] ?? null;
        $version = $r->query['version'] ?? null;
        if (!Store::validPieceId($piece)) {
            return Http::json(422, ['error' => 'bad_piece']);
        }
        if (!Store::validVersion($version)) {
            return Http::json(422, ['error' => 'bad_version']);
        }
        $about = null;
        $error = $this->checkFiles($files, $piece, (int) $version, $limits, $about);
        if ($error !== null) {
            return Http::json(422, ['error' => $error]);
        }
        try {
            $store->putDraft($piece, (int) $version, $files, $about);
        } catch (DraftRejected $e) {
            if ($e->reason === 'over_quota') {
                return Http::json(413, ['error' => 'over_quota', 'room' => $e->room, 'message' => Usage::refusal($e->room, $limits->quotaBytes)]);
            }
            return Http::json(match ($e->reason) {
                'exists' => 409,
                'too_large' => 413,
                default => 422,
            }, ['error' => $e->reason]);
        }
        return Http::json(201, ['piece' => $piece, 'version' => (int) $version]);
    }

    /** POST ?piece=&version=, drafts:delete: deletes that one draft, its row and its files. A missing draft answers 404. */
    public function deleteDraft(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'drafts:delete', 'POST');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $piece = $r->query['piece'] ?? null;
        $version = $r->query['version'] ?? null;
        if (!Store::validPieceId($piece)) {
            return Http::json(422, ['error' => 'bad_piece']);
        }
        if (!Store::validVersion($version)) {
            return Http::json(422, ['error' => 'bad_version']);
        }
        return $store->deleteDraft($piece, (int) $version)
            ? Http::json(200, ['piece' => $piece, 'version' => (int) $version, 'deleted' => true])
            : Http::json(404, ['error' => 'not_found']);
    }

    /** POST ?piece=, drafts:delete: deletes every draft of that piece, rows and files, and says how many. None stored answers 404. */
    public function deletePiece(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'drafts:delete', 'POST');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $piece = $r->query['piece'] ?? null;
        if (!Store::validPieceId($piece)) {
            return Http::json(422, ['error' => 'bad_piece']);
        }
        $deleted = $store->deletePiece($piece);
        return $deleted > 0
            ? Http::json(200, ['piece' => $piece, 'deleted' => $deleted])
            : Http::json(404, ['error' => 'not_found']);
    }

    /**
     * keys:publish, which only the owner's admin keys hold (AiKeys never grants it), so this is the owner's keyring.
     * GET answers the stored fingerprints (never the locked keyring). POST takes
     * {"keyring": <locked envelope>, "current": <hex>, "previous": [<hex>, ...]}. $read as for publishDraft.
     */
    public function publishKeyring(\Admin\Request $r, \Closure $read): \Admin\Response
    {
        $store = $this->gate($r, 'keys:publish', ['GET', 'POST']);
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        if ($r->method === 'GET') {
            $row = $store->keyring();
            if ($row === null || $row['current'] === '') {
                return Http::json(404, ['error' => 'no_keyring']);
            }
            return Http::json(200, ['current' => $row['current'], 'previous' => $row['previous'], 'uploaded_at' => $row['uploaded_at']]);
        }
        $body = $this->body($r, $read, Store::MAX_KEYRING_BYTES, $res);
        if ($body === null) {
            return $res;
        }
        $parsed = Keyring::parseUpload($body);
        if ($parsed === null) {
            return Http::json(422, ['error' => 'bad_keyring']);
        }
        $store->putKeyring($parsed['locked'], $parsed['current'], $parsed['previous']);
        return Http::json(201, ['uploaded' => true]);
    }

    /**
     * The studio of the account the key serves, or the refusal for a bad key, scope or method (in that order).
     * $methods is one method or the allowed list.
     */
    private function gate(\Admin\Request $r, string $scope, string|array $methods): Store|\Admin\Response
    {
        $account = $this->gate->check($r, $scope);
        if ($account instanceof \Admin\Response) {
            return Http::finish($account);
        }
        if (!in_array($r->method, (array) $methods, true)) {
            return Http::json(405, ['error' => 'method']);
        }
        return ($this->storeFor)($account);
    }

    private function noteId(\Admin\Request $r): ?string
    {
        $id = $r->query['id'] ?? null;
        return Store::validNoteId($id) ? $id : null;
    }

    /**
     * The request body: refused from its declared length alone (none: 411, over $max: 413) before $read is called,
     * and refused when what $read returns is not that long (400). Null, with the refusal in $refusal, when refused.
     */
    private function body(\Admin\Request $r, \Closure $read, int $max, ?\Admin\Response &$refusal): ?string
    {
        $length = Http::declaredLength($r);
        if ($length === null) {
            $refusal = Http::json(411, ['error' => 'length_required']);
            return null;
        }
        if ($length > $max) {
            $refusal = Http::json(413, ['error' => 'too_large']);
            return null;
        }
        $body = $read($length);
        if (!is_string($body) || strlen($body) !== $length) {
            $refusal = Http::json(400, ['error' => 'bad_length']);
            return null;
        }
        return $body;
    }

    /** @return array<string, string>|null name => bytes, or null for a malformed bundle */
    private static function parseBundle(string $body): ?array
    {
        $magic = strlen(self::DRAFT_MAGIC);
        $end = strlen($body);
        if ($end < $magic + 1 || !str_starts_with($body, self::DRAFT_MAGIC)) {
            return null;
        }
        $count = ord($body[$magic]);
        if ($count < 1 || $count > 5) {
            return null;
        }
        $at = $magic + 1;
        $files = [];
        for ($i = 0; $i < $count; $i++) {
            if ($at >= $end) {
                return null;
            }
            $nameLength = ord($body[$at]);
            $at++;
            if ($at + $nameLength + 4 > $end) {
                return null;
            }
            $name = substr($body, $at, $nameLength);
            $at += $nameLength;
            $size = unpack('N', substr($body, $at, 4))[1];
            $at += 4;
            if (!in_array($name, Store::DRAFT_FILES, true) || isset($files[$name]) || $at + $size > $end) {
                return null;
            }
            $files[$name] = substr($body, $at, $size);
            $at += $size;
        }
        return $at === $end ? $files : null;
    }

    /** A renderable score lists no audio file and gives every lane a sound and the piece a mix: the page plays it itself. */
    private static function isRenderable(array $score): bool
    {
        if (($score['audio'] ?? null) !== [] || !is_array($score['mix'] ?? null) || !is_array($score['lanes'] ?? null) || $score['lanes'] === []) {
            return false;
        }
        foreach ($score['lanes'] as $lane) {
            if (!is_array($lane) || !is_array($lane['sound'] ?? null)) {
                return false;
            }
        }
        return true;
    }

    /**
     * The first reason the files cannot be kept, or null; then $about holds the score's project and kind.
     * @param array<string, string> $files
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     */
    private function checkFiles(array $files, string $piece, int $version, Limits $limits, ?array &$about): ?string
    {
        if (!isset($files['score.json'])) {
            return 'missing_file';
        }
        $score = json_decode($files['score.json'], true);
        if (!is_array($score) || ($score['schema'] ?? null) !== 1
            || !is_array($score['piece'] ?? null) || ($score['piece']['id'] ?? null) !== $piece
            || ($score['draft'] ?? null) !== $version
            || !in_array($score['kind'] ?? null, Store::KINDS, true)
            || !is_array($score['project'] ?? null)) {
            return 'bad_score';
        }
        if ($refusal = ScoreRules::check($files, $score, $limits, $this->instruments)) {
            return $refusal;
        }
        $id = $score['project']['id'] ?? null;
        $name = $score['project']['name'] ?? null;
        if (!Store::validProjectId($id) || !Store::validProjectName($name)) {
            return 'bad_score';
        }
        if (isset($files['spectrogram.png']) && !str_starts_with($files['spectrogram.png'], "\x89PNG")) {
            return 'bad_file';
        }
        if (isset($files['audio.webm']) && !str_starts_with($files['audio.webm'], "\x1A\x45\xDF\xA3")) {
            return 'bad_file';
        }
        if (isset($files['audio.m4a']) && substr($files['audio.m4a'], 4, 4) !== 'ftyp') {
            return 'bad_file';
        }
        if (!isset($files['audio.webm']) && !isset($files['audio.m4a']) && !self::isRenderable($score)) {
            return 'missing_file';
        }
        if (!isset($files['score.musicxml'])) {
            if ($score['kind'] === 'music' && !$limits->scoreOnly) {
                return 'missing_file';
            }
        } elseif (!str_contains($files['score.musicxml'], '<score-partwise')) {
            return 'bad_file';
        }
        $about = ['project_id' => $id, 'project_name' => $name, 'kind' => $score['kind']];
        return null;
    }
}
