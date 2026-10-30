<?php
// AI keys: per account, shown once and stored hashed, three scopes and never keys:publish, ten active at
// most, 60 requests a minute each. Each key reaches only its own account's studio; the owner's admin keys
// reach the owner's.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicAiKeysTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';

    private Music\Api $api;
    private Music\AiKeys $aiKeys;
    private Admin\Keys $adminKeys;
    private Music\Accounts $accounts;
    private Closure $storeFor;
    private PDO $db;
    private string $dir;
    private FakeClock $clock;
    private int $owner;
    private int $a;
    private int $b;
    private int $reads = 0;

    protected function setUp(): void
    {
        [, $this->db, $this->dir, $this->clock, $this->accounts, $this->owner] = music_world();
        $this->a = (int) $this->accounts->signIn('student-a@siue.edu');
        $this->b = (int) $this->accounts->signIn('student-b@siue.edu');
        $this->storeFor = music_store_for($this->db, $this->dir, $this->clock);
        $this->adminKeys = new Admin\Keys($this->db, $this->clock, null, self::BASE);
        $this->aiKeys = new Music\AiKeys($this->db, $this->clock);
        $this->api = new Music\Api($this->storeFor, new Music\KeyGate($this->db, $this->clock, $this->adminKeys, $this->accounts, self::BASE));
    }

    private function store(int $account): Music\Store
    {
        return ($this->storeFor)($account);
    }

    private function as(string $key, array $over = []): Admin\Request
    {
        $headers = ['authorization' => "Bearer $key"] + ($over['headers'] ?? []);
        unset($over['headers']);
        return req(array_replace(['https' => true, 'method' => 'GET', 'headers' => $headers], $over));
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

    /** A score-only draft: one renderable score.json. */
    private function score(string $piece, int $draft): array
    {
        return ['score.json' => json_encode(['schema' => 1, 'kind' => 'music', 'project' => ['id' => 'crete', 'name' => 'Crete'],
            'piece' => ['id' => $piece, 'title' => 'T'], 'draft' => $draft, 'audio' => [], 'mix' => ['style' => 'lofi', 'loudness' => -20],
            'lanes' => [['id' => 'a', 'sound' => ['instrument' => 'cello', 'gain_db' => 0, 'attack' => 0.35, 'release' => 2.5]]]])];
    }

    /** Publishes the score-only draft, with $more files beside it. */
    private function publish(string $key, string $piece, int $draft, array $more = []): Admin\Response
    {
        $body = music_draft_bundle($this->score($piece, $draft) + $more);
        $r = $this->as($key, ['method' => 'POST', 'query' => ['piece' => $piece, 'version' => (string) $draft], 'headers' => ['content-length' => (string) strlen($body)]]);
        return $this->api->publishDraft($r, $this->reading($body));
    }

    private function all(int $account, string $label = 'ai'): string
    {
        return $this->aiKeys->create($account, $label, array_keys(Music\AiKeys::SCOPES));
    }

    public function testAKeyIsShownOnceAndStoredHashed(): void
    {
        $key = $this->aiKeys->create($this->a, '  Claude  ', ['drafts:publish']);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $key);
        $rows = $this->db->query('SELECT * FROM studio_keys')->fetchAll(PDO::FETCH_ASSOC);
        self::assertCount(1, $rows);
        self::assertSame(hash('sha256', $key), $rows[0]['key_hash']);
        self::assertStringNotContainsString($key, json_encode($rows));
        $list = $this->aiKeys->list($this->a);
        self::assertSame([['id' => (int) $rows[0]['id'], 'label' => 'Claude', 'scopes' => ['drafts:publish'], 'created_at' => 1_800_000_000, 'last_used_at' => null, 'revoked_at' => null]], $list);
        self::assertStringNotContainsString($key, json_encode($list), 'the list never shows the key');
        self::assertSame([], $this->aiKeys->list($this->b));
        self::assertNotSame($key, $this->aiKeys->create($this->a, 'Claude', ['drafts:publish']), 'every key is new');
    }

    public function testOnlyTheThreeScopes(): void
    {
        self::assertSame(['notes:pickup' => 'read notes', 'drafts:publish' => 'publish drafts', 'drafts:delete' => 'delete drafts'], Music\AiKeys::SCOPES);
        $bad = [
            'keys:publish' => ['label', ['keys:publish']],
            'keys:publish beside a good scope' => ['label', ['drafts:publish', 'keys:publish']],
            'unknown scope' => ['label', ['notes:everything']],
            'no scope' => ['label', []],
            'empty label' => ['   ', ['drafts:publish']],
            '81-character label' => [str_repeat('x', 81), ['drafts:publish']],
        ];
        foreach ($bad as $why => [$label, $scopes]) {
            try {
                $this->aiKeys->create($this->a, $label, $scopes);
                self::fail("$why was accepted");
            } catch (InvalidArgumentException) {
            }
        }
        self::assertSame([], $this->aiKeys->list($this->a));
        $this->aiKeys->create($this->a, str_repeat('x', 80), array_keys(Music\AiKeys::SCOPES));
        self::assertSame(array_keys(Music\AiKeys::SCOPES), $this->aiKeys->list($this->a)[0]['scopes']);
    }

    public function testTheEleventhActiveKeyIsRefused(): void
    {
        for ($i = 1; $i <= Music\AiKeys::MAX_ACTIVE; $i++) {
            $this->aiKeys->create($this->a, "k$i", ['notes:pickup']);
        }
        try {
            $this->aiKeys->create($this->a, 'k11', ['notes:pickup']);
            self::fail('the eleventh active key was made');
        } catch (InvalidArgumentException) {
        }
        self::assertCount(10, $this->aiKeys->list($this->a));
        $this->aiKeys->create($this->b, 'other', ['notes:pickup']);
        self::assertTrue($this->aiKeys->revoke($this->a, $this->aiKeys->list($this->a)[0]['id']));
        $this->aiKeys->create($this->a, 'k11', ['notes:pickup']);
        self::assertCount(11, $this->aiKeys->list($this->a), 'revoked keys stay listed and do not count');
    }

    public function testARevokedKeyAnswers401(): void
    {
        $key = $this->all($this->a);
        self::assertSame(200, $this->api->listNotes($this->as($key))->status);
        $id = $this->aiKeys->list($this->a)[0]['id'];
        self::assertFalse($this->aiKeys->revoke($this->b, $id), 'another account cannot revoke it');
        self::assertSame(200, $this->api->listNotes($this->as($key))->status);
        self::assertTrue($this->aiKeys->revoke($this->a, $id));
        self::assertFalse($this->aiKeys->revoke($this->a, $id), 'already revoked');
        self::assertSame(1_800_000_000, $this->aiKeys->list($this->a)[0]['revoked_at']);
        $res = $this->api->listNotes($this->as($key));
        self::assertSame(401, $res->status);
        self::assertSame('Bearer', $res->headers['WWW-Authenticate']);
        self::assertSame(401, $this->publish($key, 'p1', 1)->status);
        self::assertSame(0, $this->reads);
    }

    public function testAKeyReachesOnlyItsOwnAccount(): void
    {
        foreach ([$this->a, $this->b] as $account) {
            $this->store($account)->putKeyring('{"v":1}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]);
        }
        $theirs = $this->store($this->b);
        $theirs->putDraft('their-piece', 1, $this->score('their-piece', 1));
        $theirNote = $theirs->addNote(music_sealed())['id'];
        $mine = $this->store($this->a)->addNote(music_sealed())['id'];
        $key = $this->all($this->a);

        self::assertSame(201, $this->publish($key, 'my-piece', 1)->status);
        self::assertSame(['my-piece'], array_column($this->body($this->api->publishDraft($this->as($key), $this->reading('')))['drafts'], 'piece'));
        self::assertSame([$mine], array_column($this->body($this->api->listNotes($this->as($key)))['notes'], 'id'));
        self::assertSame(200, $this->api->getNote($this->as($key, ['query' => ['id' => $mine]]))->status);
        self::assertSame(404, $this->api->getNote($this->as($key, ['query' => ['id' => $theirNote]]))->status);
        self::assertSame(404, $this->api->pickedUp($this->as($key, ['method' => 'POST', 'query' => ['id' => $theirNote]]))->status);
        self::assertSame(404, $this->api->deleteDraft($this->as($key, ['method' => 'POST', 'query' => ['piece' => 'their-piece', 'version' => '1']]))->status);
        self::assertSame(404, $this->api->deletePiece($this->as($key, ['method' => 'POST', 'query' => ['piece' => 'their-piece']]))->status);
        self::assertSame(201, $this->publish($key, 'their-piece', 1)->status, 'the same piece name is a new piece in A');

        self::assertSame(['their-piece'], array_column($theirs->drafts(), 'piece'), 'B is untouched');
        self::assertSame([$theirNote], array_column($theirs->notes('waiting'), 'id'));
        self::assertSame(['their-piece', 'my-piece'], array_column($this->store($this->a)->drafts(), 'piece'));
        self::assertSame([], $this->store($this->owner)->drafts(), 'the owner is untouched');
        self::assertSame(200, $this->api->deletePiece($this->as($key, ['method' => 'POST', 'query' => ['piece' => 'their-piece']]))->status);
        self::assertSame(['their-piece'], array_column($theirs->drafts(), 'piece'), 'deleting A\'s piece of that name leaves B\'s');
    }

    public function testTheOwnersAdminKeysStillReachTheOwnersStudio(): void
    {
        $admin = $this->adminKeys->create('music-publish', ['drafts:publish', 'keys:publish', 'drafts:delete']);
        $musicXml = ['score.musicxml' => '<score-partwise version="4.0"></score-partwise>'];
        self::assertSame(201, $this->publish($admin, 'owner-piece', 1, $musicXml)->status, 'the owner publishes with the allowance\'s rules');
        self::assertSame(['owner-piece'], array_column($this->store($this->owner)->drafts(), 'piece'));
        self::assertSame([], $this->store($this->a)->drafts());
        self::assertSame(200, $this->api->publishKeyring($this->as($admin), $this->reading(''))->status, 'the owner\'s keyring fingerprints');
        self::assertSame(200, $this->api->deletePiece($this->as($admin, ['method' => 'POST', 'query' => ['piece' => 'owner-piece']]))->status);
        self::assertSame([], $this->store($this->owner)->drafts());
        self::assertNotNull($this->adminKeys->list()[0]['last_used_at'], 'the admin key\'s use is recorded where it always was');
    }

    public function testAKeyCannotUploadAKeyring(): void
    {
        $key = $this->all($this->a);
        $body = json_encode(['keyring' => music_locked_keyring(), 'current' => MUSIC_FP_CURRENT, 'previous' => []]);
        $post = $this->as($key, ['method' => 'POST', 'headers' => ['content-length' => (string) strlen($body)]]);
        self::assertSame(403, $this->api->publishKeyring($post, $this->reading($body))->status);
        self::assertSame(403, $this->api->publishKeyring($this->as($key), $this->reading(''))->status);
        self::assertSame(0, $this->reads, 'nothing was read');
        self::assertNull($this->store($this->a)->keyring());
        // A row given keys:publish behind AiKeys' back still cannot reach the keyring route.
        $this->db->exec("UPDATE studio_keys SET scopes = '[\"keys:publish\"]'");
        self::assertSame(403, $this->api->publishKeyring($post, $this->reading($body))->status);
        self::assertNull($this->store($this->a)->keyring());
    }

    public function testDeletePieceRemovesEveryDraft(): void
    {
        $key = $this->all($this->a);
        foreach ([['p1', 1], ['p1', 2], ['p1', 3], ['p2', 1]] as [$piece, $v]) {
            self::assertSame(201, $this->publish($key, $piece, $v)->status);
        }
        $delete = fn(array $query, string $method = 'POST'): Admin\Response => $this->api->deletePiece($this->as($key, ['method' => $method, 'query' => $query]));
        self::assertSame(405, $delete(['piece' => 'p1'], 'GET')->status);
        self::assertSame([422, ['error' => 'bad_piece']], [$delete(['piece' => '../x'])->status, $this->body($delete(['piece' => '../x']))]);
        self::assertSame(422, $delete([])->status);
        $res = $delete(['piece' => 'p1']);
        self::assertSame(200, $res->status);
        self::assertSame(['piece' => 'p1', 'deleted' => 3], $this->body($res));
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->a}/p1");
        self::assertSame(['p2'], array_column($this->store($this->a)->drafts(), 'piece'));
        $again = $delete(['piece' => 'p1']);
        self::assertSame([404, ['error' => 'not_found']], [$again->status, $this->body($again)]);
        $publishOnly = $this->aiKeys->create($this->a, 'publish', ['drafts:publish']);
        self::assertSame(403, $this->api->deletePiece($this->as($publishOnly, ['method' => 'POST', 'query' => ['piece' => 'p2']]))->status);
        self::assertSame(['p2'], array_column($this->store($this->a)->drafts(), 'piece'));
    }

    public function testOverQuotaAnswers413WithTheRoom(): void
    {
        $key = $this->all($this->a);
        $this->db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (?, ?, ?, ?, ?)')
            ->execute([$this->a, 'seed', 1, 1, 5_242_880 - 10]);
        $res = $this->publish($key, 'p1', 1);
        self::assertSame(413, $res->status);
        self::assertSame(['error' => 'over_quota', 'room' => 10, 'message' => Music\Usage::refusal(10, 5_242_880)], $this->body($res));
        self::assertSame(['seed'], array_column($this->store($this->a)->drafts(), 'piece'), 'nothing was written or deleted');
    }

    public function testARequestIsCappedAtTheAccountsLimitBeforeItIsRead(): void
    {
        $key = $this->all($this->a);
        $declare = fn(string $k, int $length): Admin\Request => $this->as($k, ['method' => 'POST', 'query' => ['piece' => 'p1', 'version' => '1'], 'headers' => ['content-length' => (string) $length]]);
        $res = $this->api->publishDraft($declare($key, 262_209), $this->reading(''));
        self::assertSame([413, 'too_large'], [$res->status, $this->body($res)['error']]);
        self::assertSame(0, $this->reads, 'the body is never read');
        $res = $this->api->publishDraft($declare($key, 262_208), $this->reading(str_repeat('x', 262_208)));
        self::assertSame([422, 'bad_bundle'], [$res->status, $this->body($res)['error']], 'exactly the limit is read');
        self::assertSame(1, $this->reads);
        $admin = $this->adminKeys->create('music-publish', ['drafts:publish']);
        $res = $this->api->publishDraft($declare($admin, 262_209), $this->reading(str_repeat('x', 262_209)));
        self::assertSame(422, $res->status, 'the owner\'s allowance reads more');
        self::assertSame(413, $this->api->publishDraft($declare($admin, 8_388_609), $this->reading(''))->status);
    }

    public function testAKeyIsLimitedTo60RequestsAMinute(): void
    {
        $key = $this->all($this->a);
        for ($i = 1; $i <= Admin\Keys::PER_MINUTE; $i++) {
            self::assertSame(200, $this->api->listNotes($this->as($key))->status, "request $i");
        }
        self::assertSame(429, $this->api->listNotes($this->as($key))->status);
        self::assertSame(200, $this->api->listNotes($this->as($this->all($this->a, 'second')))->status, 'each key has its own limit');
        $this->clock->now += 61;
        self::assertSame(200, $this->api->listNotes($this->as($key))->status);
        self::assertSame(1_800_000_061, $this->aiKeys->list($this->a)[0]['last_used_at']);
    }

    public function testAWrongScopeOrPlainHttpIsRefused(): void
    {
        $pickup = $this->aiKeys->create($this->a, 'pickup', ['notes:pickup']);
        self::assertSame(403, $this->publish($pickup, 'p1', 1)->status);
        self::assertSame(403, $this->api->listNotes($this->as($pickup, ['https' => false]))->status);
        self::assertSame(401, $this->api->listNotes(req(['https' => true, 'query' => ['key' => $pickup]]))->status, 'a key in the URL');
        self::assertSame(0, $this->reads);
        self::assertNull($this->aiKeys->list($this->a)[0]['last_used_at'], 'a refused scope is not a use');
    }

    public function testDeleteAllRemovesOnlyThatAccountsKeys(): void
    {
        $mine = $this->all($this->a);
        $theirs = $this->all($this->b);
        $this->api->listNotes($this->as($mine));
        $this->aiKeys->deleteAll($this->a);
        self::assertSame([], $this->aiKeys->list($this->a));
        self::assertSame(401, $this->api->listNotes($this->as($mine))->status);
        self::assertSame(200, $this->api->listNotes($this->as($theirs))->status);
        self::assertSame(1, (int) $this->db->query('SELECT COUNT(*) FROM studio_key_hits')->fetchColumn(), 'only B\'s hit is left');
    }
}
