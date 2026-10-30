<?php
// The walls between studios: two accounts, A and B, each with a note, a draft p v1 and a keyring. Every route A's
// session can reach answers from A's studio only, whatever ids A sends; and a studio session and an admin session
// never open each other's pages.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class StudioIsolationTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    private Music\Pages $pages;
    private Admin\Sessions $sessions;
    private Closure $storeFor;
    private PDO $db;
    private FakeClock $clock;
    private string $dir;
    private int $a;
    private int $b;
    /** @var array<string, string> account letter => its note's id */
    private array $note = [];
    /** @var array<string, array> account letter => its stored locked keyring */
    private array $keyring = [];

    protected function setUp(): void
    {
        $this->clock = new FakeClock(1_800_000_000);
        $this->db = admin_tmp_db();
        $this->dir = admin_tmp_dir() . '/music';
        [$this->pages, $this->sessions, $this->storeFor, $accounts] = music_pages($this->db, $this->dir, $this->clock, self::BASE);
        $this->a = (int) $accounts->signIn('a@siue.edu');
        $this->b = (int) $accounts->signIn('b@siue.edu');
        foreach (['A' => $this->a, 'B' => $this->b] as $who => $id) {
            $store = $this->store($id);
            $this->keyring[$who] = music_locked_keyring();
            $store->putKeyring(json_encode($this->keyring[$who], JSON_UNESCAPED_SLASHES), MUSIC_FP_CURRENT, []);
            $this->note[$who] = $store->addNote(music_sealed())['id'];
            $this->publish($id, 'p', 1, "$who's piece");
        }
    }

    private function store(int $account): Music\Store
    {
        return ($this->storeFor)($account);
    }

    private function publish(int $account, string $piece, int $version, string $title): void
    {
        $this->clock->now += 1;
        $score = ['schema' => 1, 'kind' => 'music', 'project' => ['id' => 'crete', 'name' => 'Crete'], 'piece' => ['id' => $piece, 'title' => $title], 'draft' => $version];
        $this->store($account)->putDraft($piece, $version, ['score.json' => json_encode($score)], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
    }

    private function asA(array $over = []): Admin\Request
    {
        return music_signed_in($this->sessions, $this->a, $over);
    }

    /** A POST as A with a fresh CSRF token. */
    private function postAsA(array $post = [], array $over = []): Admin\Request
    {
        $in = $this->asA();
        $csrf = json_decode($this->pages->csrf($in)->body, true)['csrf'];
        return req(array_replace(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'headers' => ['x-csrf' => $csrf], 'post' => $post], $over));
    }

    private static function json(Admin\Response $res): array
    {
        return json_decode($res->body, true, flags: JSON_THROW_ON_ERROR);
    }

    /** What B's studio holds: its notes, drafts, each draft's score and its keyring row. */
    private function bHolds(): array
    {
        $b = $this->store($this->b);
        $scores = [];
        foreach ($b->drafts() as $d) {
            $scores["{$d['piece']} v{$d['version']}"] = $b->draftBytes($d['piece'], $d['version'], 'score.json');
        }
        return ['notes' => $b->notes(), 'scores' => $scores, 'keyring' => $b->keyring(), 'note bytes' => $b->noteBytes($this->note['B'])];
    }

    public function testACannotReadBsNote(): void
    {
        $res = $this->pages->note($this->asA(['query' => ['id' => $this->note['B']]]));
        self::assertSame(404, $res->status);
        self::assertSame(['error' => 'not_found'], self::json($res));
        self::assertSame(200, $this->pages->note($this->asA(['query' => ['id' => $this->note['A']]]))->status, 'A reads its own');
    }

    public function testACannotListBsNotes(): void
    {
        $notes = self::json($this->pages->notes($this->asA(), ''))['notes'];
        self::assertSame([$this->note['A']], array_column($notes, 'id'));
        $index = $this->pages->index($this->asA())->body;
        self::assertStringContainsString('1 notes waiting for pickup', $index, 'the waiting count is A\'s alone');
    }

    public function testACannotDeleteBsNote(): void
    {
        $before = $this->bHolds();
        $res = $this->pages->delete($this->postAsA(['id' => $this->note['B']]));
        self::assertSame(200, $res->status);
        self::assertSame(0, self::json($res)['deleted']);
        self::assertFileExists("{$this->dir}/notes/{$this->note['B']}.sealed");
        self::assertSame($before, $this->bHolds());
    }

    public function testACannotDeleteAllOfBsNotes(): void
    {
        $before = $this->bHolds();
        $res = $this->pages->delete($this->postAsA(['all' => '1']));
        self::assertSame(1, self::json($res)['deleted'], 'A\'s one note');
        self::assertSame([], $this->store($this->a)->notes());
        self::assertFileExists("{$this->dir}/notes/{$this->note['B']}.sealed");
        self::assertSame($before, $this->bHolds());
    }

    public function testACannotReadBsDraftFile(): void
    {
        $this->publish($this->b, 'p', 2, 'B only');
        $this->publish($this->b, 'q', 1, 'B only');
        foreach ([['p', '2'], ['q', '1']] as [$piece, $v]) {
            $res = $this->pages->draftFile($this->asA(['query' => ['piece' => $piece, 'v' => $v, 'file' => 'score.json']]));
            self::assertSame(404, $res->status, "$piece v$v");
        }
        $own = $this->pages->draftFile($this->asA(['query' => ['piece' => 'p', 'v' => '1', 'file' => 'score.json']]));
        self::assertSame(200, $own->status);
        self::assertSame("A's piece", json_decode($own->body, true)['piece']['title'], 'the same piece and version serve A\'s own');
    }

    public function testACannotListBsDrafts(): void
    {
        $this->publish($this->b, 'p', 2, 'B only');
        $this->publish($this->b, 'q', 1, 'B only');
        $versions = fn(string $piece): array => array_column(self::json($this->pages->drafts($this->asA(['query' => ['piece' => $piece]])))['drafts'], 'version');
        self::assertSame([1], $versions('p'));
        self::assertSame([], $versions('q'));
    }

    public function testAPublishOfTheSamePieceAndVersionNeverTouchesBs(): void
    {
        $before = $this->bHolds();
        $res = $this->pages->deleteDraft($this->postAsA(['piece' => 'p', 'v' => '1']));
        self::assertSame(1, self::json($res)['deleted']);
        $this->publish($this->a, 'p', 1, 'A again');
        // Twenty more of A's drafts roll A's p v1 off; B's p v1 is another studio's and stays.
        for ($v = 2; $v <= Music\Store::KEEP_DRAFTS + 1; $v++) {
            $this->publish($this->a, 'p', $v, "A v$v");
        }
        self::assertNotContains(1, array_column($this->store($this->a)->drafts('p'), 'version'));
        self::assertSame($before, $this->bHolds());
        self::assertSame("B's piece", json_decode((string) $this->store($this->b)->draftBytes('p', 1, 'score.json'), true)['piece']['title']);
    }

    public function testACannotDeleteBsDraftOrPiece(): void
    {
        $this->publish($this->b, 'q', 1, 'B only');
        $before = $this->bHolds();
        foreach ([['piece' => 'q', 'v' => '1'], ['piece' => 'q']] as $post) {
            $res = $this->pages->deleteDraft($this->postAsA($post));
            self::assertSame([404, 'not_found'], [$res->status, self::json($res)['error']], json_encode($post));
        }
        self::assertSame(1, self::json($this->pages->deleteDraft($this->postAsA(['piece' => 'p'])))['deleted'], 'A\'s whole piece p');
        self::assertSame([], $this->store($this->a)->drafts());
        self::assertSame($before, $this->bHolds());
        self::assertFileExists("{$this->dir}/drafts/{$this->b}/p/1/score.json.gz");
    }

    public function testACannotReadOrReplaceBsKeyring(): void
    {
        $got = self::json($this->pages->keyring($this->asA()));
        self::assertSame($this->keyring['A'], $got['keyring']);
        $before = $this->bHolds();
        $mine = music_locked_keyring();
        $body = json_encode(['keyring' => $mine, 'current' => MUSIC_FP_PREVIOUS, 'previous' => []], JSON_UNESCAPED_SLASHES);
        // A already holds a keyring, which the page never replaces; once A starts over, A's upload lands in A's studio.
        $res = $this->pages->keyring($this->postAsA(), $body);
        self::assertSame([409, 'key_exists'], [$res->status, self::json($res)['error']]);
        self::assertSame($this->keyring['A'], json_decode($this->store($this->a)->keyring()['locked'], true));
        self::assertSame($before, $this->bHolds());
        $this->store($this->a)->wipe();
        $res = $this->pages->keyring($this->postAsA(), $body);
        self::assertSame(201, $res->status);
        self::assertSame(json_encode($mine, JSON_UNESCAPED_SLASHES), $this->store($this->a)->keyring()['locked']);
        self::assertSame($before, $this->bHolds(), 'B\'s keyring and fingerprints are untouched');
        self::assertSame(MUSIC_FP_CURRENT, Music\Store::fingerprintsIn($this->db, $this->b)['current']);
    }

    public function testTheIndexListsOnlyOwnPieces(): void
    {
        $this->publish($this->b, 'b-secret', 1, 'B secret title');
        $body = $this->pages->index($this->asA())->body;
        self::assertStringContainsString('A&#039;s piece', $body);
        self::assertStringNotContainsString('B secret', $body);
        self::assertStringNotContainsString('b-secret', $body);
        self::assertStringNotContainsString('B&#039;s piece', $body);
    }

    public function testAStudioSessionNeverReachesTheAdminHub(): void
    {
        $studio = $this->asA()->cookies['__Secure-studio'];
        $admin = new Admin\Pages($this->db, $this->clock, new MemoryMailer(), self::BASE, static fn(): bool => true);
        foreach ([req(['cookies' => ['__Secure-admin' => $studio]]), req(['cookies' => ['__Secure-studio' => $studio]])] as $r) {
            $hub = $admin->hub($r);
            self::assertSame([303, 'login.php'], [$hub->status, $hub->headers['Location']]);
            $keys = $admin->keysPanel($r);
            self::assertSame(303, $keys->status);
            self::assertStringStartsWith('login.php', $keys->headers['Location']);
        }
        $path = Admin\Realm::studio(self::BASE)->cookiePath;
        self::assertSame('/~wgrim/music/', $path);
        self::assertStringStartsNotWith($path, '/~wgrim/admin/', 'the browser never sends the studio cookie to the admin folder');
        self::assertStringContainsString('Path=/~wgrim/music/;', $this->sessions->start(req(), $this->a));
    }

    public function testAnAdminSessionNeverOpensAStudioPage(): void
    {
        $adminSessions = new Admin\Sessions($this->db, $this->clock, admin_realm(self::BASE));
        $admin = music_admin_signed_in($adminSessions)->cookies[Admin\Sessions::COOKIE];
        self::assertTrue($adminSessions->current(req(['cookies' => [Admin\Sessions::COOKIE => $admin]])), 'a live admin session');
        foreach ([[Admin\Sessions::COOKIE => $admin], ['__Secure-studio' => $admin]] as $cookies) {
            $page = $this->pages->index(req(['cookies' => $cookies]));
            self::assertSame([303, 'https://example.test/~wgrim/music/login.php?next=index.php'], [$page->status, $page->headers['Location']]);
            $data = $this->pages->notes(req(['cookies' => $cookies]), '');
            self::assertSame([401, ['error' => 'signed_out']], [$data->status, self::json($data)]);
            self::assertSame(401, $this->pages->keyring(req(['cookies' => $cookies]))->status);
        }
    }
}
