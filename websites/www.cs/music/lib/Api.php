<?php
// The API-key routes: pickup of sealed notes, publishing drafts and uploading the
// locked keyring. Every route checks its key and scope first, then the method,
// then the declared length, and nothing here can delete.
declare(strict_types=1);

namespace Music;

final class Api
{
    public const DRAFT_MAGIC = 'SIUED1';

    private const ID = '/^[0-9a-f]{32}$/D';
    private const KEYRING_FIELDS = ['ct', 'iterations', 'iv', 'kdf', 'salt', 'v'];
    private const MIN_ITERATIONS = 600000;

    public function __construct(private Store $store, private \Admin\Keys $keys)
    {
    }

    public function listNotes(\Admin\Request $r): \Admin\Response
    {
        if ($res = $this->gate($r, 'notes:pickup', 'GET')) {
            return $res;
        }
        $state = $r->query['state'] ?? null;
        if ($state !== null && $state !== 'waiting' && $state !== 'picked-up') {
            return Http::json(400, ['error' => 'bad_state']);
        }
        return Http::json(200, ['notes' => $this->store->notes($state)]);
    }

    public function getNote(\Admin\Request $r): \Admin\Response
    {
        if ($res = $this->gate($r, 'notes:pickup', 'GET')) {
            return $res;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        $bytes = $this->store->noteBytes($id);
        if ($bytes === null) {
            return Http::json(404, ['error' => 'not_found']);
        }
        return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/octet-stream', 'Content-Length' => (string) strlen($bytes)], $bytes));
    }

    public function pickedUp(\Admin\Request $r): \Admin\Response
    {
        if ($res = $this->gate($r, 'notes:pickup', 'POST')) {
            return $res;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        return $this->store->markPickedUp($id)
            ? Http::json(200, ['id' => $id, 'picked_up' => true])
            : Http::json(404, ['error' => 'not_found']);
    }

    /**
     * POST ?piece=&version=, drafts:publish; the body is a SIUED1 draft bundle. $read(int $n) returns the request
     * body's first $n bytes and is called only after the key, the method and the declared length have passed.
     */
    public function publishDraft(\Admin\Request $r, \Closure $read): \Admin\Response
    {
        if ($res = $this->gate($r, 'drafts:publish', 'POST')) {
            return $res;
        }
        $body = $this->body($r, $read, Store::MAX_REQUEST_BYTES, $res);
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
        if (!is_string($version) || preg_match('/^[1-9]\d{0,3}$/D', $version) !== 1) {
            return Http::json(422, ['error' => 'bad_version']);
        }
        $about = null;
        $error = self::checkFiles($files, $piece, (int) $version, $about);
        if ($error !== null) {
            return Http::json(422, ['error' => $error]);
        }
        try {
            $this->store->putDraft($piece, (int) $version, $files, $about);
        } catch (DraftRejected $e) {
            return Http::json(match ($e->reason) {
                'exists' => 409,
                'too_large', 'over_quota' => 413,
                default => 422,
            }, ['error' => $e->reason]);
        }
        return Http::json(201, ['piece' => $piece, 'version' => (int) $version]);
    }

    /** POST, keys:publish; the body is the locked keyring JSON. $read as for publishDraft. */
    public function publishKeyring(\Admin\Request $r, \Closure $read): \Admin\Response
    {
        if ($res = $this->gate($r, 'keys:publish', 'POST')) {
            return $res;
        }
        $body = $this->body($r, $read, Store::MAX_KEYRING_BYTES, $res);
        if ($body === null) {
            return $res;
        }
        if (!self::keyringIsWellFormed($body)) {
            return Http::json(422, ['error' => 'bad_keyring']);
        }
        $this->store->putKeyring($body);
        return Http::json(201, ['uploaded' => true]);
    }

    /** The refusal for a bad key, scope or method (in that order), or null. */
    private function gate(\Admin\Request $r, string $scope, string $method): ?\Admin\Response
    {
        $deny = $this->keys->check($r, $scope);
        if ($deny !== null) {
            return Http::finish($deny);
        }
        return $r->method === $method ? null : Http::json(405, ['error' => 'method']);
    }

    private function noteId(\Admin\Request $r): ?string
    {
        $id = $r->query['id'] ?? null;
        return is_string($id) && preg_match(self::ID, $id) === 1 ? $id : null;
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

    /**
     * The first reason the files cannot be kept, or null; then $about holds the score's project and kind.
     * @param array<string, string> $files
     * @param array{project_id: string, project_name: string, kind: string}|null $about
     */
    private static function checkFiles(array $files, string $piece, int $version, ?array &$about): ?string
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
        if (!isset($files['audio.webm']) && !isset($files['audio.m4a'])) {
            return 'missing_file';
        }
        if (!isset($files['score.musicxml'])) {
            if ($score['kind'] === 'music') {
                return 'missing_file';
            }
        } elseif (!str_contains($files['score.musicxml'], '<score-partwise')) {
            return 'bad_file';
        }
        $about = ['project_id' => $id, 'project_name' => $name, 'kind' => $score['kind']];
        return null;
    }

    /** The envelope check: exactly the six fields, the pinned KDF and strength, and correctly sized base64 parts. */
    private static function keyringIsWellFormed(string $body): bool
    {
        $k = json_decode($body, true);
        if (!is_array($k)) {
            return false;
        }
        $fields = array_keys($k);
        sort($fields);
        return $fields === self::KEYRING_FIELDS
            && $k['v'] === 1
            && $k['kdf'] === 'PBKDF2-SHA-256'
            && is_int($k['iterations']) && $k['iterations'] >= self::MIN_ITERATIONS
            && self::base64Length($k['salt']) === 16
            && self::base64Length($k['iv']) === 12
            && (self::base64Length($k['ct']) ?? 0) >= 17;
    }

    /** The decoded length of canonical base64, or null when $value is not that. */
    private static function base64Length(mixed $value): ?int
    {
        if (!is_string($value)) {
            return null;
        }
        $bytes = base64_decode($value, true);
        return $bytes !== false && base64_encode($bytes) === $value ? strlen($bytes) : null;
    }
}
