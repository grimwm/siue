<?php
// The API-key routes: HTTPS only, exactly the right scope on every route,
// header-only keys, one delete route (one draft, drafts:delete), pickup marks after a separate
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
    private string $dir;
    private Music\Accounts $accounts;
    private int $account;
    /** How many times a route read its request body. */
    private int $reads = 0;

    protected function setUp(): void
    {
        [$this->store, $this->db, $this->dir, $clock, $this->accounts, $this->account] = music_world();
        $this->keys = new Admin\Keys($this->db, $clock, null, self::BASE);
        $this->api = new Music\Api($this->store, $this->keys, Music\Limits::for(Admin\People::fromJson('{}'), Admin\Auth::OWNER), music_library_instruments());
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

    /** The upload wrapper for $envelope naming the fixed fingerprints, with $over replacing its fields. */
    private function wrapper(?array $envelope = null, array $over = []): string
    {
        return json_encode(array_replace(['keyring' => $envelope ?? $this->keyring(), 'current' => MUSIC_FP_CURRENT, 'previous' => [MUSIC_FP_PREVIOUS]], $over), JSON_UNESCAPED_SLASHES);
    }

    private function uploadKeyring(string $key, string $body, ?int $length = null): Admin\Response
    {
        return $this->api->publishKeyring($this->post($key, [], $body, $length), $this->reading($body));
    }

    public function testScopesAreRegistered(): void
    {
        self::assertSame(['notes:pickup', 'drafts:publish', 'drafts:delete', 'keys:publish'], Admin\Keys::SCOPES);
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
        // Each route as [call, the status the key that holds its scope gets]. The empty draft and keyring bodies and the
        // delete without a piece pass the scope and are refused as malformed (422), so the own-scope status proves the
        // route ran past the key check.
        $routes = [
            'notes:pickup' => [
                'listNotes' => [fn(string $k) => $this->api->listNotes($this->as($k, ['query' => ['state' => 'waiting']])), 200],
                'getNote' => [fn(string $k) => $this->api->getNote($this->as($k, ['query' => ['id' => $id]])), 200],
                'pickedUp' => [fn(string $k) => $this->api->pickedUp($this->as($k, ['method' => 'POST', 'query' => ['id' => $id]])), 200],
            ],
            'drafts:publish' => [
                'publishDraft' => [fn(string $k) => $this->api->publishDraft($this->post($k, [], ''), $this->reading('')), 422],
                'listDrafts' => [fn(string $k) => $this->api->publishDraft($this->as($k), $this->reading('')), 200],
            ],
            'drafts:delete' => ['deleteDraft' => [fn(string $k) => $this->api->deleteDraft($this->as($k, ['method' => 'POST'])), 422]],
            'keys:publish' => [
                'publishKeyring' => [fn(string $k) => $this->api->publishKeyring($this->post($k, [], ''), $this->reading('')), 422],
                'keyringFingerprints' => [fn(string $k) => $this->api->publishKeyring($this->as($k), $this->reading('')), 200],
            ],
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

    public function testTheGeneralNotesPieceIdCannotBePublished(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $res = $this->publish($k, $this->draftFiles(), 'general', 1);
        self::assertSame([422, 'bad_piece'], [$res->status, $this->body($res)['error']]);
        self::assertSame([], $this->store->drafts());
        self::assertFalse(Music\Store::validPieceId('general'));
        self::assertTrue(Music\Store::validPieceId('generally'));
        self::assertTrue(Music\Store::validProjectId('general'), 'only a piece id is reserved');
    }

    public function testPublishDraftValidatesFiles(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $files = $this->draftFiles();
        $res = $this->publish($k, $files, 'ch1-labyrinth', 1);
        self::assertSame(201, $res->status);
        self::assertSame(['piece' => 'ch1-labyrinth', 'version' => 1], $this->body($res));
        self::assertSame($files['audio.webm'], $this->store->draftBytes('ch1-labyrinth', 1, 'audio.webm'));
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

    public function testARenderableMusicScoreNeedsOnlyScoreJsonAndMusicXml(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $sound = ['instrument' => 'cello', 'gain_db' => 0, 'attack' => 0.35, 'release' => 2.5];
        $renderable = ['audio' => [], 'mix' => ['style' => 'lofi', 'loudness' => -20], 'lanes' => [['id' => 'a', 'sound' => $sound], ['id' => 'b', 'sound' => $sound]]];
        $files = array_diff_key($this->draftFiles('ch3-renderer', 1), ['audio.webm' => 1, 'spectrogram.png' => 1]);
        self::assertSame(['score.json', 'score.musicxml'], array_keys($files));
        self::assertSame(422, $this->publish($k, $files, 'ch3-renderer', 1)->status, 'no audio and no sound in the score');
        $res = $this->publish($k, $this->withScore($files, $renderable), 'ch3-renderer', 1);
        self::assertSame(201, $res->status, 'a renderable score needs no audio or spectrogram');
        self::assertCount(1, $this->store->drafts());
        self::assertNull($this->store->draftBytes('ch3-renderer', 1, 'audio.webm'));
        self::assertNotNull($this->store->draftBytes('ch3-renderer', 1, 'score.musicxml'));

        $noXml = array_diff_key($this->withScore($this->draftFiles('ch3-renderer', 2), $renderable), ['audio.webm' => 1, 'spectrogram.png' => 1, 'score.musicxml' => 1]);
        $res = $this->publish($k, $noXml, 'ch3-renderer', 2);
        self::assertSame(['missing_file', 422], [$this->body($res)['error'], $res->status], 'music still needs score.musicxml');
        $lacksSound = array_diff_key($this->withScore($this->draftFiles('ch3-renderer', 3), ['audio' => [], 'mix' => $renderable['mix'], 'lanes' => [['id' => 'a', 'sound' => $sound], ['id' => 'b']]]), ['audio.webm' => 1, 'spectrogram.png' => 1]);
        self::assertSame(422, $this->publish($k, $lacksSound, 'ch3-renderer', 3)->status, 'one lane without sound is not renderable');
    }

    public function testPublishDraftAppliesTheScoreRules(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $many = $this->withScore($this->draftFiles('ch3-renderer', 1), ['lanes' => array_fill(0, 17, ['id' => 'a'])]);
        $res = $this->publish($k, $many, 'ch3-renderer', 1);
        self::assertSame([422, 'too_many_lanes'], [$res->status, $this->body($res)['error']]);
        $odd = $this->withScore($this->draftFiles('ch3-renderer', 1), ['lanes' => [['id' => 'a', 'sound' => ['instrument' => 'kazoo']]]]);
        $res = $this->publish($k, $odd, 'ch3-renderer', 1);
        self::assertSame([422, 'unknown_instrument'], [$res->status, $this->body($res)['error']]);
        self::assertSame([], $this->store->drafts());
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
        self::assertSame($files, array_map(fn(string $name): ?string => $this->store->draftBytes('ch1-labyrinth', 1, $name), array_combine(array_keys($files), array_keys($files))), 'every file is kept whole');
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

    public function testEachPieceKeepsItsOwnNewestTwentyDraftsAndOtherPiecesAreUntouched(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        self::assertSame(201, $this->publish($k, $this->draftFiles('other-piece', 1), 'other-piece', 1)->status);
        for ($v = 1; $v <= 21; $v++) {
            self::assertSame(201, $this->publish($k, $this->draftFiles('ch1-labyrinth', $v), 'ch1-labyrinth', $v)->status, "draft $v");
        }
        self::assertCount(21, $this->store->drafts(), 'twenty of ch1-labyrinth and one of other-piece');
        self::assertNull($this->store->draftBytes('ch1-labyrinth', 1, 'score.json'), 'the piece\'s oldest is gone');
        self::assertNotNull($this->store->draftBytes('ch1-labyrinth', 2, 'score.json'));
        self::assertNotNull($this->store->draftBytes('ch1-labyrinth', 21, 'score.json'));
        self::assertNotNull($this->store->draftBytes('other-piece', 1, 'score.json'), 'another piece\'s only draft stays');
    }

    public function testWhenStorageIsFullAnotherPiecesDraftsAreNeverDroppedToMakeRoom(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $add = $this->db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (' . $this->account . ', ?, ?, ?, ?)');
        $add->execute(['big-piece', 1, 1, Music\Store::MAX_DRAFT_TOTAL_BYTES - 20]);
        for ($v = 1; $v <= 19; $v++) {
            $add->execute(['ch1-labyrinth', $v, 1 + $v, 1]);
        }
        $res = $this->publish($k, $this->draftFiles('ch1-labyrinth', 20), 'ch1-labyrinth', 20);
        self::assertSame(413, $res->status);
        self::assertSame('over_quota', $this->body($res)['error']);
        self::assertCount(20, $this->store->drafts(), 'big-piece and the nineteen are all still there');
    }

    public function testThePiecesOwnOldestDraftRollingOffMakesRoom(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $add = $this->db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (' . $this->account . ', ?, ?, ?, ?)');
        $add->execute(['ch1-labyrinth', 1, 1, Music\Store::MAX_DRAFT_TOTAL_BYTES - 1000]);
        for ($v = 2; $v <= 20; $v++) {
            $add->execute(['ch1-labyrinth', $v, $v, 1]);
        }
        self::assertSame(201, $this->publish($k, $this->draftFiles('ch1-labyrinth', 21), 'ch1-labyrinth', 21)->status, 'v1 rolls off, so v21 fits');
        self::assertNull($this->store->draftBytes('ch1-labyrinth', 1, 'score.json'));
    }

    public function testADraftThatWouldPassTheQuotaIsRefusedAndNothingIsWritten(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        $this->db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (' . $this->account . ', ?, ?, ?, ?)')
            ->execute(['seed', 1, 1, Music\Store::MAX_DRAFT_TOTAL_BYTES - 10]);
        $before = $this->store->drafts();
        $res = $this->publish($k, $this->draftFiles(), 'ch1-labyrinth', 1);
        self::assertSame(413, $res->status);
        self::assertSame('over_quota', $this->body($res)['error']);
        self::assertSame($before, $this->store->drafts());
        self::assertNull($this->store->draftBytes('ch1-labyrinth', 1, 'score.json'));
    }

    public function testKeyringUploadNeedsKeysScopeAndAWellFormedEnvelope(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $env = $this->keyring();
        self::assertSame(201, $this->uploadKeyring($k, $this->wrapper($env))->status);
        self::assertSame(json_encode($env, JSON_UNESCAPED_SLASHES), $this->store->keyring()['locked']);
        $second = $this->keyring();
        self::assertSame(201, $this->uploadKeyring($k, $this->wrapper($second))->status);
        $kept = $this->store->keyring()['locked'];
        self::assertSame(json_encode($second, JSON_UNESCAPED_SLASHES), $kept, 'a new upload replaces the stored keyring');
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
            self::assertSame(422, $this->uploadKeyring($k, $this->wrapper($bad))->status, $why);
        }
        self::assertSame(422, $this->uploadKeyring($k, 'not json')->status);
        self::assertSame(422, $this->uploadKeyring($k, json_encode($env))->status, 'a bare envelope is not the wrapper');
        self::assertSame($kept, $this->store->keyring()['locked'], 'refused uploads change nothing');
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        self::assertSame(403, $this->uploadKeyring($drafts, $this->wrapper())->status);
    }

    public function testKeyringUploadChecksTheNamedFingerprints(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $other = str_repeat('ef', 32);
        $env = $this->keyring();
        self::assertSame(201, $this->uploadKeyring($k, $this->wrapper($env, ['previous' => []]))->status, 'no earlier keys');
        self::assertSame(201, $this->uploadKeyring($k, $this->wrapper($env, ['previous' => array_map(static fn(int $i): string => sprintf('%064x', $i + 1), range(1, 32))]))->status, '32 earlier keys');
        $kept = $this->store->keyring();
        $bad = [
            'no current' => json_encode(['keyring' => $env, 'previous' => []]),
            'no previous' => json_encode(['keyring' => $env, 'current' => MUSIC_FP_CURRENT]),
            'no keyring' => json_encode(['current' => MUSIC_FP_CURRENT, 'previous' => []]),
            'extra key' => $this->wrapper($env, ['extra' => 1]),
            'upper-case hex' => $this->wrapper($env, ['current' => strtoupper($other)]),
            'short hex' => $this->wrapper($env, ['current' => substr($other, 1)]),
            'non-hex' => $this->wrapper($env, ['current' => str_repeat('g', 64)]),
            'current not a string' => $this->wrapper($env, ['current' => 5]),
            'previous not a list' => $this->wrapper($env, ['previous' => ['a' => $other]]),
            'bad previous entry' => $this->wrapper($env, ['previous' => [$other, 'zz']]),
            'previous repeats current' => $this->wrapper($env, ['previous' => [MUSIC_FP_CURRENT]]),
            'previous repeats itself' => $this->wrapper($env, ['previous' => [$other, $other]]),
            '33 earlier keys' => $this->wrapper($env, ['previous' => array_map(static fn(int $i): string => sprintf('%064x', $i + 1), range(1, 33))]),
            'envelope not an object' => $this->wrapper($env, ['keyring' => 'x']),
        ];
        foreach ($bad as $why => $body) {
            $res = $this->uploadKeyring($k, $body);
            self::assertSame([422, 'bad_keyring'], [$res->status, $this->body($res)['error'] ?? null], $why);
        }
        self::assertSame($kept, $this->store->keyring(), 'refused uploads change nothing');
    }

    public function testKeyringGetAnswersTheFingerprintsAndNeverTheLockedKeyring(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $this->db->exec('DELETE FROM music_keyring');
        $none = $this->api->publishKeyring($this->as($k), $this->reading(''));
        self::assertSame([404, 'no_keyring'], [$none->status, $this->body($none)['error']]);
        $this->uploadKeyring($k, $this->wrapper());
        $reads = $this->reads;
        $res = $this->api->publishKeyring($this->as($k), $this->reading(''));
        self::assertSame(200, $res->status);
        self::assertSame(['current' => MUSIC_FP_CURRENT, 'previous' => [MUSIC_FP_PREVIOUS], 'uploaded_at' => 1_800_000_000], $this->body($res));
        self::assertStringNotContainsString('ct', $res->body);
        $drafts = $this->keys->create('drafts', ['drafts:publish']);
        self::assertSame(403, $this->api->publishKeyring($this->as($drafts), $this->reading(''))->status);
        self::assertSame(405, $this->api->publishKeyring($this->as($k, ['method' => 'DELETE']), $this->reading(''))->status);
        self::assertSame($reads, $this->reads, 'a GET reads no body');
    }

    public function testAKeyringUploadedWithoutFingerprintsReadsAsNone(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $this->db->exec("UPDATE music_keyring SET current_fp = '', previous_fps = '[]'");
        self::assertSame(404, $this->api->publishKeyring($this->as($k), $this->reading(''))->status);
    }

    public function testTheKeyringsPythonAndTheTestKeyProduceAreAccepted(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $dir = dirname(__DIR__, 2) . '/games/workroom/test/fixtures/';
        $fromPython = json_decode((string) file_get_contents($dir . 'keyring-by-python.json'), true);
        $testKey = json_decode((string) file_get_contents($dir . 'test-key.json'), true)['keyring'];
        foreach (['keyring-by-python.json' => $fromPython, 'test-key.json' => $testKey] as $name => $envelope) {
            self::assertSame(201, $this->uploadKeyring($k, $this->wrapper($envelope))->status, $name);
            self::assertSame($envelope, json_decode($this->store->keyring()['locked'], true), $name);
        }
    }

    public function testKeyringSizeLimitIsExactAndCheckedBeforeReading(): void
    {
        $k = $this->keys->create('publish', ['keys:publish']);
        $base = $this->keyring(['ct' => '']);
        $room = Music\Store::MAX_KEYRING_BYTES - strlen($this->wrapper($base));
        $wrapped = $this->wrapper(['ct' => str_repeat('A', 4 * intdiv($room, 4))] + $base);
        $body = $wrapped . str_repeat(' ', Music\Store::MAX_KEYRING_BYTES - strlen($wrapped));
        self::assertSame(Music\Store::MAX_KEYRING_BYTES, strlen($body));
        self::assertSame(201, $this->uploadKeyring($k, $body)->status);
        $reads = $this->reads;
        self::assertSame(413, $this->uploadKeyring($k, '', Music\Store::MAX_KEYRING_BYTES + 1)->status);
        self::assertSame($reads, $this->reads, 'an oversized keyring is refused from its declared length');
    }

    public function testAGetOnTheDraftsRouteListsThePublishedDraftsNewestFirst(): void
    {
        $k = $this->keys->create('publish', ['drafts:publish']);
        self::assertSame(['drafts' => []], $this->body($this->api->publishDraft($this->as($k), $this->reading(''))));
        self::assertSame(201, $this->publish($k, $this->draftFiles(), 'ch1-labyrinth', 1)->status);
        self::assertSame(201, $this->publish($k, $this->draftFiles('cannon-fire', 1, 'sound', 'tankity'), 'cannon-fire', 1)->status);
        $reads = $this->reads;
        $res = $this->api->publishDraft($this->as($k), $this->reading(''));
        self::assertSame(200, $res->status);
        self::assertSame($reads, $this->reads, 'a listing reads no body');
        $drafts = $this->body($res)['drafts'];
        self::assertSame([['cannon-fire', 1, 'sound', 'tankity'], ['ch1-labyrinth', 1, 'music', 'crete']],
            array_map(fn(array $d) => [$d['piece'], $d['version'], $d['kind'], $d['project_id']], $drafts));
        self::assertSame(['piece', 'version', 'published_at', 'project_id', 'project_name', 'kind'], array_keys($drafts[0]));
        self::assertSame(405, $this->api->publishDraft($this->as($k, ['method' => 'DELETE']), $this->reading(''))->status);
    }

    public function testDeletingADraftIsTheApisOnlyWayToDelete(): void
    {
        $methods = array_map(fn(ReflectionMethod $m) => $m->name, (new ReflectionClass(Music\Api::class))->getMethods(ReflectionMethod::IS_PUBLIC));
        self::assertSame(['deleteDraft'], array_values(array_filter($methods, fn(string $m) => stripos($m, 'delete') !== false || stripos($m, 'remove') !== false)));
        self::assertSame(['delete-draft.php', 'drafts.php', 'keyring.php', 'note.php', 'notes.php', 'picked-up.php'],
            array_values(array_map('basename', glob(dirname(__DIR__, 2) . '/music/api/*.php'))));
    }

    private function deleting(string $key, array $query, array $over = []): Admin\Response
    {
        return $this->api->deleteDraft($this->as($key, array_replace(['method' => 'POST', 'query' => $query], $over)));
    }

    public function testADeleteKeyRemovesOneDraftsRowAndFilesAndNothingElse(): void
    {
        $publish = $this->keys->create('music-publish', ['drafts:publish', 'keys:publish', 'drafts:delete']);
        foreach ([['ch1-labyrinth', 1], ['ch1-labyrinth', 2], ['ch2-sea', 1]] as [$piece, $v]) {
            self::assertSame(201, $this->publish($publish, $this->draftFiles($piece, $v), $piece, $v)->status);
        }
        $before = $this->accounts->usage($this->account);
        $gone = "{$this->dir}/drafts/{$this->account}/ch1-labyrinth/2";
        self::assertDirectoryExists($gone);
        $res = $this->deleting($publish, ['piece' => 'ch1-labyrinth', 'version' => '2']);
        self::assertSame(200, $res->status);
        self::assertSame(['piece' => 'ch1-labyrinth', 'version' => 2, 'deleted' => true], $this->body($res));
        self::assertSame('application/json', $res->headers['Content-Type']);
        self::assertDirectoryDoesNotExist($gone, 'its files and folder are gone');
        self::assertNull($this->store->draftBytes('ch1-labyrinth', 2, 'score.json'));
        self::assertSame([['ch1-labyrinth', 1], ['ch2-sea', 1]], array_map(fn(array $d) => [$d['piece'], $d['version']], array_reverse($this->store->drafts())));
        self::assertNotNull($this->store->draftBytes('ch1-labyrinth', 1, 'audio.webm'), 'the piece\'s other draft is untouched');
        self::assertNotNull($this->store->draftBytes('ch2-sea', 1, 'score.json'), 'another piece is untouched');
        self::assertLessThan($before, $this->accounts->usage($this->account), 'its bytes no longer count toward the quota');
        self::assertSame(404, $this->deleting($publish, ['piece' => 'ch1-labyrinth', 'version' => '2'])->status, 'deleting twice finds nothing');
        self::assertSame(['error' => 'not_found'], $this->body($this->deleting($publish, ['piece' => 'ch9-none', 'version' => '1'])));
        // The last draft of a piece takes the piece's folder with it.
        self::assertSame(200, $this->deleting($publish, ['piece' => 'ch2-sea', 'version' => '1'])->status);
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->account}/ch2-sea");
    }

    public function testDeletingADraftNeedsItsScopePostAndHttps(): void
    {
        $publishOnly = $this->keys->create('publish', ['drafts:publish', 'keys:publish']);
        $delete = $this->keys->create('delete', ['drafts:delete']);
        self::assertSame(201, $this->publish($publishOnly, $this->draftFiles(), 'ch1-labyrinth', 1)->status);
        $draft = ['piece' => 'ch1-labyrinth', 'version' => '1'];
        self::assertSame(403, $this->deleting($publishOnly, $draft)->status, 'a key without drafts:delete');
        self::assertSame(403, $this->deleting($delete, $draft, ['https' => false])->status, 'plain HTTP');
        self::assertSame(405, $this->deleting($delete, $draft, ['method' => 'GET'])->status);
        self::assertSame(405, $this->deleting($delete, $draft, ['method' => 'DELETE'])->status);
        self::assertSame(401, $this->api->deleteDraft(req(['https' => true, 'method' => 'POST', 'query' => $draft + ['key' => $delete]]))->status, 'a key in the URL');
        self::assertCount(1, $this->store->drafts(), 'no refused request deleted anything');
        self::assertSame(200, $this->deleting($delete, $draft)->status);
        self::assertSame([], $this->store->drafts());
    }

    public function testADeleteValidatesThePieceAndVersionLikeAPublish(): void
    {
        $delete = $this->keys->create('delete', ['drafts:delete']);
        foreach ([[[], 'bad_piece'], [['piece' => '../x', 'version' => '1'], 'bad_piece'], [['piece' => 'general', 'version' => '1'], 'bad_piece'],
            [['piece' => 'ch1-labyrinth'], 'bad_version'], [['piece' => 'ch1-labyrinth', 'version' => '01'], 'bad_version'],
            [['piece' => 'ch1-labyrinth', 'version' => '0'], 'bad_version'], [['piece' => 'ch1-labyrinth', 'version' => '10000'], 'bad_version']] as [$query, $error]) {
            $res = $this->deleting($delete, $query);
            self::assertSame([422, ['error' => $error]], [$res->status, $this->body($res)], json_encode($query));
        }
    }

    public function testAStoreDeleteRefusesBadIdsAndAnswersWhetherADraftWent(): void
    {
        $this->store->putDraft('ch1-labyrinth', 3, $this->draftFiles('ch1-labyrinth', 3));
        self::assertFalse($this->store->deleteDraft('../x', 3));
        self::assertFalse($this->store->deleteDraft('ch1-labyrinth', 0));
        self::assertFalse($this->store->deleteDraft('ch1-labyrinth', 4));
        self::assertTrue($this->store->deleteDraft('ch1-labyrinth', 3));
        self::assertFalse($this->store->deleteDraft('ch1-labyrinth', 3));
    }

    public function testServeBytesRanges(): void
    {
        $b = '0123456789';
        self::assertSame(['200', '0123456789'], [(string) Music\Http::serveBytes($b, 'audio/webm', null)->status, Music\Http::serveBytes($b, 'audio/webm', null)->body]);
        $part = Music\Http::serveBytes($b, 'audio/webm', 'bytes=2-4');
        self::assertSame([206, '234', 'bytes 2-4/10'], [$part->status, $part->body, $part->headers['Content-Range']]);
        self::assertSame('789', Music\Http::serveBytes($b, 'audio/webm', 'bytes=-3')->body);
        self::assertSame(416, Music\Http::serveBytes($b, 'audio/webm', 'bytes=20-30')->status);
        self::assertSame('bytes', Music\Http::serveBytes($b, 'audio/webm', null)->headers['Accept-Ranges']);
    }

    public function testCrossSiteRequestsAreRefusedForSessionData(): void
    {
        $at = fn(string $site) => req(['https' => true, 'headers' => ['sec-fetch-site' => $site]]);
        self::assertSame(403, Music\Http::refuseCrossSite($at('cross-site'))?->status);
        self::assertSame(403, Music\Http::refuseCrossSite($at('same-site'))?->status);
        self::assertNull(Music\Http::refuseCrossSite($at('same-origin')));
        self::assertNull(Music\Http::refuseCrossSite(req(['https' => true])), 'curl and older browsers send none');
    }

    /** Each of the six routes as a closure from a request to its response; the body readers return an empty body. */
    private function allRoutes(): array
    {
        $read = $this->reading('');
        return [
            'listNotes' => fn(Admin\Request $r) => $this->api->listNotes($r),
            'getNote' => fn(Admin\Request $r) => $this->api->getNote($r),
            'pickedUp' => fn(Admin\Request $r) => $this->api->pickedUp($r),
            'publishDraft' => fn(Admin\Request $r) => $this->api->publishDraft($r, $read),
            'publishKeyring' => fn(Admin\Request $r) => $this->api->publishKeyring($r, $read),
            'deleteDraft' => fn(Admin\Request $r) => $this->api->deleteDraft($r),
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
        $body = $this->wrapper();
        $before = $this->store->keyring();
        $res = $this->api->publishKeyring($this->post($k, [], $body, strlen($body) + 5), $this->reading($body));
        self::assertSame(['bad_length', 400], [$this->body($res)['error'], $res->status]);
        self::assertSame($before, $this->store->keyring());
    }

    /** The key tool probes with a GET: 403 means the scope is missing; 200, or 405 on the POST-only delete route, means the key is accepted. */
    public function testAGetProbeSaysWhetherTheKeyHoldsTheScope(): void
    {
        $lacking = $this->keys->create('pickup', ['notes:pickup']);
        $holding = $this->keys->create('publish', ['drafts:publish', 'keys:publish', 'drafts:delete']);
        $read = $this->reading('');
        foreach (['publishKeyring', 'publishDraft', 'deleteDraft'] as $route) {
            self::assertSame(403, $this->api->$route($this->as($lacking), $read)->status, "$route without its scope");
            self::assertSame($route === 'deleteDraft' ? 405 : 200, $this->api->$route($this->as($holding), $read)->status, "$route with its scope");
            self::assertSame(401, $this->api->$route($this->as(str_repeat('0', 64)), $read)->status, "$route with an unknown key");
        }
        self::assertSame(0, $this->reads, 'a probe reads no body');
    }
}
