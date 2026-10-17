<?php
// The API-key routes: HTTPS only, exactly the right scope on every route,
// header-only keys, no delete route at all, pickup marks after a separate
// call, drafts and the keyring validated before they are kept, and the draft
// limits (8 MB per request, 20 kept, 100 MB in total) enforced by the server.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicApiTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';

    private Music\Api $api;
    private Music\Store $store;
    private Admin\Keys $keys;
    private PDO $db;
    /** How many times a route read its request body. */
    private int $reads = 0;

    protected function setUp(): void
    {
        [$this->store, $this->db, , $clock] = music_world();
        $this->keys = new Admin\Keys($this->db, $clock, null, self::BASE);
        $this->api = new Music\Api($this->store, $this->keys);
    }

    private function as(string $key, array $over = []): Admin\Request
    {
        $headers = ['authorization' => "Bearer $key"] + ($over['headers'] ?? []);
        unset($over['headers']);
        return req(array_replace(['https' => true, 'method' => 'GET', 'headers' => $headers], $over));
    }

    /** A POST declaring $length bytes (default: the body's own length). */
    private function post(string $key, array $query, string $body, ?int $length = null): Admin\Request
    {
        return $this->as($key, ['method' => 'POST', 'query' => $query, 'headers' => ['content-length' => (string) ($length ?? strlen($body))]]);
    }

    private function reading(string $body): Closure
    {
        return function (int $n) use ($body): string {
            $this->reads++;
            return substr($body, 0, $n);
        };
    }

    private function body(Admin\Response $res): array
    {
        return json_decode($res->body, true, flags: JSON_THROW_ON_ERROR);
    }

    /** A complete, valid draft's files: a music draft carries score.musicxml, a sound draft does not. */
    private function draftFiles(string $piece = 'ch1-labyrinth', int $draft = 1, string $kind = 'music', string $project = 'crete'): array
    {
        return array_filter([
            'score.json' => json_encode(['schema' => 1, 'kind' => $kind, 'project' => ['id' => $project, 'name' => ucfirst($project)], 'piece' => ['id' => $piece, 'title' => 'T'], 'draft' => $draft]),
            'score.musicxml' => $kind === 'music' ? '<?xml version="1.0"?><score-partwise version="4.0"></score-partwise>' : null,
            'audio.webm' => "\x1A\x45\xDF\xA3" . random_bytes(100),
            'spectrogram.png' => "\x89PNG\r\n\x1A\n" . random_bytes(100),
        ], static fn(?string $bytes): bool => $bytes !== null);
    }

    /** The files with score.json's fields changed (a field set to null is removed). */
    private function withScore(array $files, array $changes): array
    {
        $score = array_filter(array_replace(json_decode($files['score.json'], true), $changes), static fn($v): bool => $v !== null);
        return ['score.json' => json_encode($score)] + $files;
    }

    private function publish(string $key, array $files, string $piece, int $version): Admin\Response
    {
        $body = music_draft_bundle($files);
        return $this->api->publishDraft($this->post($key, ['piece' => $piece, 'version' => (string) $version], $body), $this->reading($body));
    }

    private function keyring(array $over = []): array
    {
        return $over + ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => base64_encode(random_bytes(16)),
            'iv' => base64_encode(random_bytes(12)), 'ct' => base64_encode(random_bytes(2400))];
    }

    private function uploadKeyring(string $key, string $body, ?int $length = null): Admin\Response
    {
        return $this->api->publishKeyring($this->post($key, [], $body, $length), $this->reading($body));
    }

    public function testScopesAreRegistered(): void
    {
        self::assertSame(['notes:pickup', 'drafts:publish', 'keys:publish'], Admin\Keys::SCOPES);
        foreach (Admin\Keys::SCOPES as $scope) {
            self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $this->keys->create("t-$scope", [$scope]));
        }
    }

    public function testPickupNeedsItsScopeAndHttps(): void
    {
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        $publish = $this->keys->create('publish', ['drafts:publish', 'keys:publish']);
        $this->store->addNote(music_sealed());
        self::assertSame(200, $this->api->listNotes($this->as($pickup, ['query' => ['state' => 'waiting']]))->status);
        self::assertSame(403, $this->api->listNotes($this->as($publish, ['query' => ['state' => 'waiting']]))->status, 'wrong scope');
        self::assertSame(403, $this->api->listNotes($this->as($pickup, ['https' => false, 'query' => ['state' => 'waiting']]))->status, 'HTTP');
        self::assertSame(401, $this->api->listNotes(req(['https' => true, 'query' => ['state' => 'waiting', 'key' => $pickup]]))->status, 'key in URL ignored');
        self::assertSame(401, $this->api->listNotes($this->as(str_repeat('0', 64), ['query' => ['state' => 'waiting']]))->status);
    }

    public function testEveryRouteDemandsExactlyItsOwnScope(): void
    {
        $id = $this->store->addNote(music_sealed())['id'];
        // Each route as [call, the status the key that holds its scope gets]. The empty draft and keyring bodies pass the scope
        // and are refused as malformed (422), so the own-scope status proves the route ran past the key check.
        $routes = [
            'notes:pickup' => [
                'listNotes' => [fn(string $k) => $this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])), 200],
                'getNote' => [fn(string $k) => $this->api->getNote($this->as($k, ['query' => ['id' => $id]])), 200],
                'pickedUp' => [fn(string $k) => $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => $id]])), 200],
            ],
            'drafts:publish' => ['publishDraft' => [fn(string $k) => $this->api->publishDraft($this->post($k, [], ''), $this->reading('')), 422]],
            'keys:publish' => ['publishKeyring' => [fn(string $k) => $this->api->publishKeyring($this->post($k, [], ''), $this->reading('')), 422]],
        ];
        $held = [];
        foreach (array_keys($routes) as $scope) {
            $held[$scope] = $this->keys->create("only-$scope", [$scope]);
        }
        foreach ($routes as $scope => $calls) {
            foreach ($calls as $route => [$call, $ownStatus]) {
                foreach ($held as $heldScope => $key) {
                    $reads = $this->reads;
                    $status = $call($key)->status;
                    if ($heldScope === $scope) {
                        self::assertSame($ownStatus, $status, "$route with its own scope $scope");
                    } else {
                        self::assertSame(403, $status, "$route with only $heldScope");
                        self::assertSame($reads, $this->reads, "$route read a body for a key without $scope");
                    }
                }
            }
        }
        self::assertCount(1, $this->store->notes(), 'no route removed anything');
    }

    public function testListGetAndMarkInThatOrder(): void
    {
        $k = $this->keys->create('pickup', ['notes:pickup']);
        $bytes = music_sealed();
        $id = $this->store->addNote($bytes)['id'];
        $list = $this->body($this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])))['notes'];
        self::assertSame([['id' => $id, 'size' => strlen($bytes), 'sha256' => hash('sha256', $bytes), 'arrived_at' => 1_800_000_000, 'picked_up_at' => null]], $list);
        $got = $this->api->getNote($this->as($k, ['query' => ['id' => $id]]));
        self::assertSame(200, $got->status);
        self::assertSame($bytes, $got->body);
        self::assertSame('application/octet-stream', $got->headers['Content-Type']);
        self::assertCount(1, $this->store->notes('waiting'), 'a download never marks');
        self::assertSame(405, $this->api->pickedUp($this->as($k, ['query' => ['id' => $id]]))->status, 'GET cannot mark');
        self::assertSame(200, $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => $id]]))->status);
        self::assertSame([], $this->store->notes('waiting'));
        self::assertSame(404, $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => str_repeat('0', 32)]]))->status);
        self::assertSame(400, $this->api->getNote($this->as($k, ['query' => ['id' => '../x']]))->status);
    }

    public function testEveryResponseCarriesTheHeaders(): void
    {
        $k = $this->keys->create('pickup', ['notes:pickup']);
        foreach ([$this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])), $this->api->listNotes(req(['https' => true]))] as $res) {
            foreach (Admin\Headers::LIST as $name => $value) {
                $want = $name === 'Content-Security-Policy' ? Music\Http::csp() : $value;
                self::assertSame($want, $res->headers[$name] ?? null, $name);
            }
        }
    }

    public function testPublishDraftValidatesFiles(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $res = $this->publish($k, $files, 'ch1-labyrinth', 1);
        self::assertSame(201, $res->status);
        self::assertSame(['piece' => 'ch1-labyrinth', 'version' => 1], $this->body($res));
        self::assertSame($files['audio.webm'], file_get_contents((string) $this->store->draftFile('ch1-labyrinth', 1, 'audio.webm')));
        self::assertSame(
            [['piece' => 'ch1-labyrinth', 'version' => 1, 'published_at' => 1_800_000_000, 'project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']],
            $this->store->drafts(),
            'the project and kind come from score.json',
        );
        self::assertSame(409, $this->publish($k, $files, 'ch1-labyrinth', 1)->status, 'drafts are immutable');
        self::assertSame('bad_score', $this->body($this->publish($k, $files, 'ch1-labyrinth', 2))['error'], 'draft must equal version');
        self::assertSame('bad_score', $this->body($this->publish($k, $files, 'other-piece', 3))['error'], 'piece must equal the query');
        self::assertSame(422, $this->publish($k, ['spectrogram.png' => 'GIF89a'] + $files, 'ch1-labyrinth', 1)->status, 'a fake png');
        self::assertSame(422, $this->publish($k, array_diff_key($this->draftFiles('ch1-labyrinth', 4), ['audio.webm' => 1]), 'ch1-labyrinth', 4)->status, 'no audio');
        self::assertSame('bad_bundle', $this->body($this->api->publishDraft(
            $this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '5'], 'not a bundle'),
            $this->reading('not a bundle'),
        ))['error']);
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        self::assertSame(403, $this->publish($pickup, $files, 'ch1-labyrinth', 1)->status);
    }

    public function testMusicNeedsMusicXmlAndSoundDoesNot(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $music = array_diff_key($this->draftFiles('ch2-descent', 1), ['score.musicxml' => 1]);
        $res = $this->publish($k, $music, 'ch2-descent', 1);
        self::assertSame(422, $res->status, 'a music draft without score.musicxml');
        self::assertSame('missing_file', $this->body($res)['error']);
        self::assertSame([], $this->store->drafts(), 'nothing was written');

        $sound = $this->draftFiles('cannon-fire', 1, 'sound', 'tankity');
        self::assertArrayNotHasKey('score.musicxml', $sound);
        self::assertSame(201, $this->publish($k, $sound, 'cannon-fire', 1)->status, 'a sound draft needs no score.musicxml');
        self::assertSame(['tankity', 'Tankity', 'sound'], [$this->store->drafts()[0]['project_id'], $this->store->drafts()[0]['project_name'], $this->store->drafts()[0]['kind']]);

        $notXml = ['score.musicxml' => 'not musicxml'] + $this->draftFiles('cannon-fire', 2, 'sound', 'tankity');
        $res = $this->publish($k, $notXml, 'cannon-fire', 2);
        self::assertSame(['bad_file', 422], [$this->body($res)['error'], $res->status], 'a score.musicxml that is not MusicXML is refused for either kind');
        $notXml = ['score.musicxml' => 'not musicxml'] + $this->draftFiles('ch2-descent', 2);
        self::assertSame('bad_file', $this->body($this->publish($k, $notXml, 'ch2-descent', 2))['error']);
        $withXml = ['score.musicxml' => '<score-partwise></score-partwise>'] + $this->draftFiles('cannon-fire', 3, 'sound', 'tankity');
        self::assertSame(201, $this->publish($k, $withXml, 'cannon-fire', 3)->status, 'a sound draft may carry one');
    }

    public function testADraftWithoutAProjectOrKindTheServerCanRecordIsRefused(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $base = $this->draftFiles();
        $bad = [
            'no kind' => ['kind' => null],
            'unknown kind' => ['kind' => 'noise'],
            'no project' => ['project' => null],
            'project is not an object' => ['project' => 'crete'],
            'project id with capitals' => ['project' => ['id' => 'Crete', 'name' => 'Crete']],
            'project id too long' => ['project' => ['id' => str_repeat('a', 49), 'name' => 'Crete']],
            'project name empty' => ['project' => ['id' => 'crete', 'name' => '']],
            'project name 81 characters' => ['project' => ['id' => 'crete', 'name' => str_repeat('n', 81)]],
            'project name not a string' => ['project' => ['id' => 'crete', 'name' => 7]],
        ];
        foreach ($bad as $why => $change) {
            $res = $this->publish($k, $this->withScore($base, $change), 'ch1-labyrinth', 1);
            self::assertSame(['bad_score', 422], [$this->body($res)['error'], $res->status], $why);
        }
        self::assertSame([], $this->store->drafts(), 'nothing was written');
        $edge = $this->withScore($base, ['project' => ['id' => str_repeat('a', 48), 'name' => str_repeat('n', 80)]]);
        self::assertSame(201, $this->publish($k, $edge, 'ch1-labyrinth', 1)->status, '48-character id and 80-character name are allowed');
    }

    public function testADraftBodyOverEightMegabytesIsRefusedBeforeItIsRead(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $res = $this->api->publishDraft($this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '1'], '', 8_388_609), $this->reading(''));
        self::assertSame(413, $res->status);
        self::assertSame('too_large', $this->body($res)['error']);
        self::assertSame(0, $this->reads, 'the body is never read');
        self::assertSame([], $this->store->drafts());
    }

    public function testADraftBodyOfExactlyEightMegabytesIsAccepted(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $files['audio.webm'] .= str_repeat("\0", Music\Store::MAX_REQUEST_BYTES - strlen(music_draft_bundle($files)));
        $body = music_draft_bundle($files);
        self::assertSame(8_388_608, strlen($body));
        $res = $this->api->publishDraft($this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '1'], $body), $this->reading($body));
        self::assertSame(201, $res->status);
        self::assertSame(array_sum(array_map('strlen', $files)), $this->store->draftBytes());
    }

    public function testADraftNeedsADeclaredLengthThatTheBodyMatches(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $query = ['piece' => 'ch1-labyrinth', 'version' => '1'];
        $none = $this->as($k, ['method' => 'POST', 'query' => $query]);
        self::assertSame(411, $this->api->publishDraft($none, $this->reading(''))->status);
        $bad = $this->as($k, ['method' => 'POST', 'query' => $query, 'headers' => ['content-length' => '12abc']]);
        self::assertSame(411, $this->api->publishDraft($bad, $this->reading(''))->status);
        self::assertSame(0, $this->reads);
        $body = music_draft_bundle($this->draftFiles());
        $res = $this->api->publishDraft($this->post($k, $query, $body, strlen($body) + 10), $this->reading($body));
        self::assertSame(400, $res->status);
        self::assertSame('bad_length', $this->body($res)['error']);
        self::assertSame([], $this->store->drafts());
    }

    public function testTheTwentyFirstDraftEvictsTheOldest(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        for ($v = 1; $v <= 21; $v++) {
            self::assertSame(201, $this->publish($k, $this->draftFiles('ch1-labyrinth', $v), 'ch1-labyrinth', $v)->status, "draft $v");
        }
        self::assertCount(20, $this->store->drafts());
        self::assertNull($this->store->draftFile('ch1-labyrinth', 1, 'score.json'), 'the oldest is gone');
        self::assertNotNull($this->store->draftFile('ch1-labyrinth', 2, 'score.json'));
        self::assertNotNull($this->store->draftFile('ch1-labyrinth', 21, 'score.json'));
    }

    public function testADraftThatWouldPassTheQuotaIsRefusedAndNothingIsWritten(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $this->db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)')
            ->execute(['seed', 1, 1, Music\Store::MAX_DRAFT_TOTAL_BYTES - 10]);
        $before = $this->store->drafts();
        $res = $this->publish($k, $this->draftFiles(), 'ch1-labyrinth', 1);
        self::assertSame(413, $res->status);
        self::assertSame('over_quota', $this->body($res)['error']);
        self::assertSame($before, $this->store->drafts());
        self::assertNull($this->store->draftFile('ch1-labyrinth', 1, 'score.json'));
    }

    public function testKeyringUploadNeedsKeysScopeAndAWellFormedEnvelope(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $good = json_encode($this->keyring());
        self::assertSame(201, $this->uploadKeyring($k, $good)->status);
        self::assertSame($good, $this->store->keyring()['locked']);
        $second = json_encode($this->keyring());
        self::assertSame(201, $this->uploadKeyring($k, $second)->status);
        self::assertSame($second, $this->store->keyring()['locked'], 'a new upload replaces the stored keyring');
        foreach ([
            'weak KDF' => $this->keyring(['iterations' => 1000]),
            'absurd KDF' => $this->keyring(['iterations' => 10000001]),
            'wrong version' => $this->keyring(['v' => 2]),
            'wrong KDF' => $this->keyring(['kdf' => 'scrypt']),
            'short salt' => $this->keyring(['salt' => base64_encode('short')]),
            'short iv' => $this->keyring(['iv' => base64_encode(random_bytes(8))]),
            'ct not base64' => $this->keyring(['ct' => '***']),
            'ct too short' => $this->keyring(['ct' => base64_encode(random_bytes(16))]),
            'extra field' => $this->keyring(['fingerprint' => MUSIC_FP_CURRENT]),
        ] as $why => $bad) {
            self::assertSame(422, $this->uploadKeyring($k, json_encode($bad))->status, $why);
        }
        self::assertSame(422, $this->uploadKeyring($k, 'not json')->status);
        self::assertSame($second, $this->store->keyring()['locked'], 'refused uploads change nothing');
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        self::assertSame(403, $this->uploadKeyring($drafts, $good)->status);
    }

    public function testTheKeyringsPythonAndTheTestKeyProduceAreAccepted(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $dir = dirname(__DIR__, 2) . '/games/workroom/test/fixtures/';
        $fromPython = (string) file_get_contents($dir . 'keyring-by-python.json');
        $testKey = json_encode(json_decode((string) file_get_contents($dir . 'test-key.json'), true)['keyring']);
        foreach (['keyring-by-python.json' => $fromPython, 'test-key.json' => $testKey] as $name => $body) {
            self::assertSame(201, $this->uploadKeyring($k, $body)->status, $name);
            self::assertSame($body, $this->store->keyring()['locked'], $name);
        }
    }

    public function testKeyringSizeLimitIsExactAndCheckedBeforeReading(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $base = $this->keyring(['ct' => '']);
        $room = Music\Store::MAX_KEYRING_BYTES - strlen(json_encode($base, JSON_UNESCAPED_SLASHES));
        $envelope = json_encode(['ct' => str_repeat('A', 4 * intdiv($room, 4))] + $base, JSON_UNESCAPED_SLASHES);
        $body = $envelope . str_repeat(' ', Music\Store::MAX_KEYRING_BYTES - strlen($envelope));
        self::assertSame(65_536, strlen($body));
        self::assertSame(201, $this->uploadKeyring($k, $body)->status);
        $reads = $this->reads;
        self::assertSame(413, $this->uploadKeyring($k, '', 65_537)->status);
        self::assertSame($reads, $this->reads, 'an oversized keyring is refused from its declared length');
    }

    public function testTheApiHasNoWayToDelete(): void
    {
        $methods = array_map(fn(ReflectionMethod $m) => $m->name, (new ReflectionClass(Music\Api::class))->getMethods(ReflectionMethod::IS_PUBLIC));
        self::assertSame([], array_values(array_filter($methods, fn(string $m) => stripos($m, 'delete') !== false || stripos($m, 'remove') !== false)));
        self::assertFileDoesNotExist(dirname(__DIR__, 2) . '/music/api/delete.php');
    }

    public function testServeFileRanges(): void
    {
        $f = admin_tmp_dir() . '/a.bin';
        file_put_contents($f, '0123456789');
        self::assertSame(['200', '0123456789'], [(string) Music\Http::serveFile($f, 'audio/webm', null)->status, Music\Http::serveFile($f, 'audio/webm', null)->body]);
        $part = Music\Http::serveFile($f, 'audio/webm', 'bytes=2-4');
        self::assertSame([206, '234', 'bytes 2-4/10'], [$part->status, $part->body, $part->headers['Content-Range']]);
        self::assertSame('789', Music\Http::serveFile($f, 'audio/webm', 'bytes=-3')->body);
        self::assertSame(416, Music\Http::serveFile($f, 'audio/webm', 'bytes=20-30')->status);
        self::assertSame('bytes', Music\Http::serveFile($f, 'audio/webm', null)->headers['Accept-Ranges']);
    }

    public function testCrossSiteRequestsAreRefusedForSessionData(): void
    {
        $at = fn(string $site) => req(['https' => true, 'headers' => ['sec-fetch-site' => $site]]);
        self::assertSame(403, Music\Http::refuseCrossSite($at('cross-site'))?->status);
        self::assertSame(403, Music\Http::refuseCrossSite($at('same-site'))?->status);
        self::assertNull(Music\Http::refuseCrossSite($at('same-origin')));
        self::assertNull(Music\Http::refuseCrossSite(req(['https' => true])), 'curl and older browsers send none');
    }

    /** Each of the five routes as a closure from a request to its response; the body readers return an empty body. */
    private function allRoutes(): array
    {
        $read = $this->reading('');
        return [
            'listNotes' => fn(Admin\Request $r) => $this->api->listNotes($r),
            'getNote' => fn(Admin\Request $r) => $this->api->getNote($r),
            'pickedUp' => fn(Admin\Request $r) => $this->api->pickedUp($r),
            'publishDraft' => fn(Admin\Request $r) => $this->api->publishDraft($r, $read),
            'publishKeyring' => fn(Admin\Request $r) => $this->api->publishKeyring($r, $read),
        ];
    }

    public function testEveryRouteRefusesPlainHttpAndUrlKeysAndLearnsNothingWithoutAKey(): void
    {
        $all = $this->keys->create('all', Admin\Keys::SCOPES);
        $query = ['id' => str_repeat('a', 32), 'state' => 'waiting', 'piece' => 'p', 'version' => '1'];
        foreach ($this->allRoutes() as $route => $call) {
            foreach (['GET', 'POST', 'DELETE'] as $method) {
                $over = ['method' => $method, 'query' => $query, 'headers' => ['content-length' => '0']];
                self::assertSame(403, $call($this->as($all, ['https' => false] + $over))->status, "$route $method over HTTP");
                self::assertSame(401, $call(req(['https' => true, 'method' => $method, 'headers' => ['content-length' => '0'], 'query' => $query + ['key' => $all]]))->status, "$route $method with the key in the URL");
                self::assertSame(401, $call(req(['https' => true, 'method' => $method, 'headers' => ['content-length' => '0'], 'query' => $query]))->status, "$route $method with no key is 401, never 405");
            }
        }
        self::assertSame(0, $this->reads);
    }

    public function testAnOversizedDeclaredLengthWithTheWrongScopeIsForbiddenNotTooLarge(): void
    {
        $pickup = $this->keys->create('pickup', ['notes:pickup']);
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        $keyring = $this->keys->create('keyring', ['keys:publish']);
        $huge = ['content-length' => '99999999'];
        self::assertSame(403, $this->api->publishDraft($this->as($pickup, ['method' => 'POST', 'query' => ['piece' => 'p', 'version' => '1'], 'headers' => $huge]), $this->reading(''))->status);
        self::assertSame(403, $this->api->publishKeyring($this->as($drafts, ['method' => 'POST', 'headers' => $huge]), $this->reading(''))->status);
        self::assertSame(403, $this->api->publishDraft($this->as($keyring, ['method' => 'POST', 'query' => ['piece' => 'p', 'version' => '1'], 'headers' => $huge]), $this->reading(''))->status);
        self::assertSame(0, $this->reads);
    }

    public function testMalformedBundlesAreRefused(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $entry = static fn(string $name, string $bytes): string => chr(strlen($name)) . $name . pack('N', strlen($bytes)) . $bytes;
        $one = $entry('score.json', '{}');
        $cases = [
            'truncated entry' => 'SIUED1' . chr(1) . substr($one, 0, -1),
            'size past the end' => 'SIUED1' . chr(1) . chr(10) . 'score.json' . pack('N', 500) . '{}',
            'duplicate name' => 'SIUED1' . chr(2) . $one . $one,
            'unknown name' => 'SIUED1' . chr(1) . $entry('evil.php', '<?php'),
            'trailing bytes' => 'SIUED1' . chr(1) . $one . 'x',
            'count 0' => 'SIUED1' . chr(0),
            'count 6' => 'SIUED1' . chr(6) . $one . $one . $one . $one . $one . $one,
            'count above entries' => 'SIUED1' . chr(2) . $one,
            'no count' => 'SIUED1',
        ];
        foreach ($cases as $why => $body) {
            $res = $this->api->publishDraft($this->post($k, ['piece' => 'ch1-labyrinth', 'version' => '1'], $body), $this->reading($body));
            self::assertSame(['bad_bundle', 422], [$this->body($res)['error'], $res->status], $why);
        }
        self::assertSame([], $this->store->drafts());
    }

    public function testAudioSignaturesAndAMissingScoreAreRefused(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $res = $this->publish($k, ['audio.webm' => 'RIFF....WEBM'] + $files, 'ch1-labyrinth', 1);
        self::assertSame(['bad_file', 422], [$this->body($res)['error'], $res->status], 'a fake webm');
        $res = $this->publish($k, ['audio.m4a' => 'abcdefghijkl'] + $files, 'ch1-labyrinth', 1);
        self::assertSame(['bad_file', 422], [$this->body($res)['error'], $res->status], 'a fake m4a');
        $res = $this->publish($k, array_diff_key($files, ['score.json' => 1]), 'ch1-labyrinth', 1);
        self::assertSame(['missing_file', 422], [$this->body($res)['error'], $res->status], 'no score.json');
        $m4a = ['audio.m4a' => "\0\0\0\x18ftypM4A " . random_bytes(20)] + array_diff_key($files, ['audio.webm' => 1]);
        self::assertSame(201, $this->publish($k, $m4a, 'ch1-labyrinth', 1)->status, 'a real m4a alone is enough audio');
    }

    public function testKeyringNeedsADeclaredLengthThatTheBodyMatches(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $none = $this->as($k, ['method' => 'POST']);
        self::assertSame(411, $this->api->publishKeyring($none, $this->reading(''))->status);
        self::assertSame(0, $this->reads);
        $body = json_encode($this->keyring());
        $res = $this->api->publishKeyring($this->post($k, [], $body, strlen($body) + 5), $this->reading($body));
        self::assertSame(['bad_length', 400], [$this->body($res)['error'], $res->status]);
        self::assertNull($this->store->keyring());
    }
}
