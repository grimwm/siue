<?php
// The API-key routes: pickup of sealed notes, listing, reading, publishing and deleting
// drafts, deleting a piece, an AI key's sealing key, and uploading the locked keyring. Every route checks its key and
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
    private Pairing $pairing;

    public function __construct(private \Closure $storeFor, private KeyGate $gate, ?array $instruments = null, ?Pairing $pairing = null)
    {
        $this->instruments = $instruments ?? \music_library_instruments();
        $this->pairing = $pairing ?? $gate->pairing();
    }

    /**
     * notes:pickup. GET ?state= lists the notes; an AI key sees only the notes sealed to the key it is paired to (none
     * before it is paired: api/seal-key.php says whether it is).
     */
    public function listNotes(\Admin\Request $r): \Admin\Response
    {
        [$store, $sealedTo] = $this->notesGate($r, 'GET');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $state = $r->query['state'] ?? null;
        if ($state !== null && $state !== 'waiting' && $state !== 'picked-up') {
            return Http::json(400, ['error' => 'bad_state']);
        }
        return Http::json(200, ['notes' => $store->notes($state, $sealedTo)]);
    }

    public function getNote(\Admin\Request $r): \Admin\Response
    {
        [$store, $sealedTo] = $this->notesGate($r, 'GET');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        $bytes = $store->noteBytes($id, $sealedTo);
        if ($bytes === null) {
            return Http::json(404, ['error' => 'not_found']);
        }
        return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/octet-stream', 'Content-Length' => (string) strlen($bytes)], $bytes));
    }

    public function pickedUp(\Admin\Request $r): \Admin\Response
    {
        [$store, $sealedTo] = $this->notesGate($r, 'POST');
        if ($store instanceof \Admin\Response) {
            return $store;
        }
        $id = $this->noteId($r);
        if ($id === null) {
            return Http::json(400, ['error' => 'bad_id']);
        }
        return $store->markPickedUp($id, $sealedTo)
            ? Http::json(200, ['id' => $id, 'picked_up' => true])
            : Http::json(404, ['error' => 'not_found']);
    }

    /**
     * api/seal-key.php, an AI key's sealing key. GET (any live AI key): its label, scopes and the sealing key it registered
     * with its pairing code and whether the person paired it; null before it registered one. POST (notes:pickup)
     * {"spki": base64 DER} registers the MCP's public key: 200 once stored (again: the same key), 409 paired when the key
     * is paired to another (make a new AI key), 422 bad_key unless it is RSA-4096 with exponent 65537 in canonical DER.
     * Admin keys have no sealing key (403). $read as for publishDraft.
     */
    public function sealKey(\Admin\Request $r, \Closure $read): \Admin\Response
    {
        $caller = $this->gate->caller($r, $r->method === 'POST' ? 'notes:pickup' : null);
        if ($caller instanceof \Admin\Response) {
            return Http::finish($caller);
        }
        if ($caller->aiKey === null) {
            return Http::json(403, ['error' => 'not_ai_key']);
        }
        if (!in_array($r->method, ['GET', 'POST'], true)) {
            return Http::json(405, ['error' => 'method']);
        }
        if ($r->method === 'POST') {
            $body = $this->body($r, $read, 4096, $res);
            if ($body === null) {
                return $res;
            }
            $doc = json_decode($body, true);
            $der = is_array($doc) && array_keys($doc) === ['spki'] && is_string($doc['spki']) ? base64_decode($doc['spki'], true) : false;
            if ($der === false || base64_encode($der) !== $doc['spki']) {
                return Http::json(422, ['error' => 'bad_key']);
            }
            $done = $this->pairing->register($caller->account, $caller->aiKey, $der);
            if ($done !== 'ok') {
                return Http::json(match ($done) { 'paired' => 409, 'no_key' => 401, default => 422 }, ['error' => $done]);
            }
        }
        return Http::json(200, ['label' => $caller->label, 'scopes' => $caller->scopes,
            'sealing' => $this->pairing->status($caller->account, $caller->aiKey)]);
    }

    /** api/draft.php?piece=&version=, drafts:publish: that draft's score.json. 404 not_found when it is not stored. */
    public function getScore(\Admin\Request $r): \Admin\Response
    {
        $store = $this->gate($r, 'drafts:publish', 'GET');
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
        $bytes = $store->draftBytes($piece, (int) $version, 'score.json');
        if ($bytes === null) {
            return Http::json(404, ['error' => 'not_found']);
        }
        return Http::finish(new \Admin\Response(200, ['Content-Type' => 'application/json', 'Content-Length' => (string) strlen($bytes)], $bytes));
    }

    /**
     * The studio and the key the notes routes keep to: an admin key every note (null), an AI key only the notes sealed
     * to the key it is paired to, and none while it is not paired.
     *
     * @return array{Store|\Admin\Response, ?string}
     */
    private function notesGate(\Admin\Request $r, string $method): array
    {
        $caller = $this->gate->caller($r, 'notes:pickup');
        if ($caller instanceof \Admin\Response) {
            return [Http::finish($caller), null];
        }
        if ($r->method !== $method) {
            return [Http::json(405, ['error' => 'method']), null];
        }
        // An AI key not paired yet has no note sealed to it: '' names none.
        $sealedTo = $caller->aiKey === null ? null : ($this->pairing->pairedFingerprint($caller->account, $caller->aiKey) ?? '');
        return [($this->storeFor)($caller->account), $sealedTo];
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
        $files = DraftCheck::parseBundle($body);
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
        $error = DraftCheck::checkFiles($files, $piece, (int) $version, $limits, $this->instruments, $about);
        if ($error !== null) {
            return Http::json(422, ['error' => $error]);
        }
        try {
            $store->putDraft($piece, (int) $version, $files, $about);
        } catch (DraftRejected $e) {
            if ($e->reason === 'over_quota') {
                return Http::json(413, ['error' => 'over_quota', 'room' => $e->room, 'message' => Usage::refusal($e->room, $limits->quotaBytes, $e->shared)]);
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
}
