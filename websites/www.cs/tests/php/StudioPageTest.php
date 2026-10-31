<?php
// Your studio (studio.php): usage against the account's limit, AI keys made (shown once), listed and revoked,
// start over, and sign out. Its forms work with no script: plain forms, a csrf field. Start over takes the AI keys
// with everything else, and waits for a publish that holds the lock. Its mailed confirmation is StudioKeysTest's.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class StudioPageTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';
    private const STUDENT = 'student@siue.edu';

    private Music\Pages $pages;
    private Admin\Sessions $sessions;
    private Music\Store $store;
    private Music\Accounts $accounts;
    private Music\AiKeys $aiKeys;
    private PDO $db;
    private string $dir;
    private FakeClock $clock;
    private int $account;

    private function world(string $people = '{}'): void
    {
        [$this->store, $this->db, $this->dir, $this->clock, $this->accounts, $this->account] = music_world(true, self::STUDENT, $people);
        [$this->pages, $this->sessions] = music_pages($this->db, $this->dir, $this->clock, self::BASE, $people);
        $this->aiKeys = new Music\AiKeys($this->db, $this->clock);
    }

    protected function setUp(): void
    {
        $this->world();
    }

    private function signedIn(): Admin\Request
    {
        return music_signed_in($this->sessions, $this->account);
    }

    /** A POST of the studio's form from the session of $as, with the session's current token unless $post names one. */
    private function post(Admin\Request $as, array $post): Admin\Response
    {
        $post += ['csrf' => $this->sessions->csrf($as)];
        return $this->pages->studioAction(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'post' => $post]));
    }

    private function draft(Music\Store $store, string $piece = 'ch1-labyrinth', int $v = 1): void
    {
        $store->putDraft($piece, $v, ['score.json' => '{"schema":1,"piece":{"id":"' . $piece . '"}}']);
    }

    public function testThePageShowsUsageOfFiveMegabytes(): void
    {
        $this->store->addNote(music_sealed());
        $this->db->prepare('UPDATE music_notes SET size = 1258291 WHERE account_id = ?')->execute([$this->account]);
        $res = $this->pages->studio($this->signedIn());
        self::assertSame(200, $res->status);
        self::assertStringContainsString('<h1>Your studio</h1>', $res->body);
        self::assertStringContainsString('<address>' . self::STUDENT . '</address>', $res->body);
        self::assertStringContainsString('<meter min="0" max="5242880" value="1258291"', $res->body);
        self::assertStringContainsString('1.2 MB of 5 MB used', $res->body);
        foreach (['read notes', 'publish drafts', 'delete drafts'] as $words) {
            self::assertMatchesRegularExpression('/<input type="checkbox" name="scopes\[\]" value="[a-z:]+"> ' . $words . '<\/label>/', $res->body, $words);
        }
        self::assertStringContainsString('Start over deletes every piece, draft and note in your studio, your notes key and your AI keys. Nobody can undo it, and nobody can get them back.', $res->body);
        self::assertStringContainsString('action="logout.php"', $res->body);
        self::assertStringContainsString('action="logout.php?all=1"', $res->body);
        self::assertStringContainsString('>Sign out<', $res->body);
        self::assertStringContainsString('>Sign out everywhere<', $res->body);
        $index = $this->pages->index($this->signedIn());
        self::assertStringContainsString('<a href="studio.php">Your studio</a>', $index->body, 'the workroom header links the page');
    }

    public function testTheAllowanceShowsOneHundredMegabytes(): void
    {
        $this->world('{"people":[{"email":"' . self::STUDENT . '","admin":false,"allowance":true}]}');
        $res = $this->pages->studio($this->signedIn());
        self::assertStringContainsString('<meter min="0" max="104857600" value="', $res->body);
        self::assertMatchesRegularExpression('/\d+ KB of 100 MB used/', $res->body);
    }

    public function testAMadeKeyIsShownOnceThenOnlyItsLabel(): void
    {
        $as = $this->signedIn();
        $res = $this->post($as, ['action' => 'make-key', 'label' => '<b>Claude</b> & me', 'scopes' => ['notes:pickup', 'drafts:publish']]);
        self::assertSame(200, $res->status);
        self::assertSame(1, preg_match('/<code class="secret">([0-9a-f]{64})<\/code>/', $res->body, $m));
        self::assertStringContainsString('Copy it now: it is not shown again.', $res->body);
        self::assertStringNotContainsString('<b>Claude</b>', $res->body, 'the label is escaped');
        $keys = $this->aiKeys->list($this->account);
        self::assertCount(1, $keys);
        self::assertSame(hash('sha256', $m[1]), $this->db->query('SELECT key_hash FROM studio_keys')->fetchColumn());

        $again = $this->pages->studio($as);
        self::assertStringNotContainsString($m[1], $again->body, 'the key is shown only once');
        self::assertStringNotContainsString('class="secret"', $again->body);
        self::assertStringContainsString('&lt;b&gt;Claude&lt;/b&gt; &amp; me', $again->body);
        self::assertStringNotContainsString('<b>Claude</b>', $again->body);
        self::assertStringContainsString('read notes, publish drafts', $again->body);
        self::assertStringContainsString('Last used: never', $again->body);
        self::assertStringContainsString('<input type="hidden" name="id" value="' . $keys[0]['id'] . '">', $again->body);
        self::assertStringContainsString('>Revoke<', $again->body);

        $bad = $this->post($as, ['action' => 'make-key', 'label' => 'x', 'scopes' => ['keys:publish']]);
        self::assertSame(400, $bad->status, 'an AI key never gets keys:publish');
        self::assertCount(1, $this->aiKeys->list($this->account));
    }

    public function testRevokeNeedsCsrf(): void
    {
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $id = (string) $this->aiKeys->list($this->account)[0]['id'];
        $as = $this->signedIn();
        self::assertSame(403, $this->post($as, ['action' => 'revoke-key', 'id' => $id, 'csrf' => ''])->status, 'no token');
        self::assertSame(403, $this->post($as, ['action' => 'revoke-key', 'id' => $id, 'csrf' => str_repeat('a', 64)])->status, 'a wrong token');
        self::assertNull($this->aiKeys->list($this->account)[0]['revoked_at']);
        $res = $this->post($as, ['action' => 'revoke-key', 'id' => $id]);
        self::assertSame([303, 'studio.php'], [$res->status, $res->headers['Location']]);
        self::assertNotNull($this->aiKeys->list($this->account)[0]['revoked_at']);
        self::assertStringContainsString('Revoked', $this->pages->studio($as)->body);

        $other = (int) $this->accounts->signIn('other@siue.edu');
        $this->aiKeys->create($other, 'theirs', ['notes:pickup']);
        $theirs = (string) $this->aiKeys->list($other)[0]['id'];
        self::assertSame(404, $this->post($as, ['action' => 'revoke-key', 'id' => $theirs])->status, "another studio's key is not this studio's to revoke");
        self::assertNull($this->aiKeys->list($other)[0]['revoked_at']);
    }

    public function testStartOverEmptiesTheStudioAndKeepsTheSession(): void
    {
        $this->draft($this->store);
        $note = $this->store->addNote(music_sealed())['id'];
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $other = (int) $this->accounts->signIn('other@siue.edu');
        $theirs = music_store_for($this->db, $this->dir, $this->clock)($other);
        $theirs->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        $this->draft($theirs);
        $theirNote = $theirs->addNote(music_sealed())['id'];
        $this->aiKeys->create($other, 'theirs', ['notes:pickup']);
        self::assertDirectoryExists("{$this->dir}/drafts/{$this->account}");
        self::assertFileExists("{$this->dir}/notes/$note.sealed");

        $as = $this->signedIn();
        $this->accounts->startOver($this->account);

        self::assertSame([], $this->store->drafts());
        self::assertSame([], $this->store->notes());
        self::assertNull($this->store->keyring(), 'the notes key goes too');
        self::assertSame([], $this->aiKeys->list($this->account));
        self::assertSame(0, $this->accounts->usage($this->account));
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->account}");
        self::assertFileDoesNotExist("{$this->dir}/notes/$note.sealed");
        self::assertSame($this->account, $this->accounts->idFor(self::STUDENT), 'the account stays');
        self::assertSame($this->account, $this->sessions->account($as), 'the session stays');
        $page = $this->pages->studio($as);
        self::assertSame(200, $page->status);
        self::assertStringContainsString('0 KB of 5 MB used', $page->body);

        self::assertCount(1, $theirs->drafts(), "another studio is untouched");
        self::assertNotNull($theirs->noteBytes($theirNote));
        self::assertNotNull($theirs->keyring());
        self::assertCount(1, $this->aiKeys->list($other));
    }

    public function testAKeyAnswers401AfterStartOver(): void
    {
        $key = $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $api = new Music\Api(
            music_store_for($this->db, $this->dir, $this->clock),
            new Music\KeyGate($this->db, $this->clock, new Admin\Keys($this->db, $this->clock, null, self::BASE), $this->accounts, self::BASE),
        );
        $call = fn(): Admin\Response => $api->listNotes(req(['https' => true, 'headers' => ['authorization' => "Bearer $key"]]));
        self::assertSame(200, $call()->status);
        $this->accounts->startOver($this->account);
        $res = $call();
        self::assertSame(401, $res->status);
        self::assertArrayHasKey('WWW-Authenticate', $res->headers);
    }

    /**
     * A second PHP process publishes through its own connection and holds the lock after writing the draft's
     * files (putDraft writes them inside its BEGIN IMMEDIATE). Start over, begun while it holds the lock, waits
     * for its COMMIT and then removes that draft's row and files with the rest.
     */
    public function testAPublishThatWonTheLockBeforeStartOverLeavesNoFilesAfter(): void
    {
        $path = (string) $this->db->query('PRAGMA database_list')->fetch(PDO::FETCH_ASSOC)['file'];
        $tmp = admin_tmp_dir();
        $signal = "$tmp/files-written";
        $child = <<<'PHP'
            <?php
            declare(strict_types=1);
            require $argv[1] . '/music/lib/bootstrap.php';
            [, , $dbDir, $dir, $account, $signal] = $argv;
            final class SlowClock implements Admin\Clock
            {
                public bool $armed = false;
                public function __construct(private string $signal) {}
                public function now(): int
                {
                    if ($this->armed) {
                        // Called for the draft's row, after its files are written, while the lock is held.
                        $this->armed = false;
                        touch($this->signal);
                        usleep(2_000_000);
                    }
                    return 1_800_000_000;
                }
            }
            $clock = new SlowClock($signal);
            $db = Admin\Db::open($dbDir);
            $people = Admin\People::fromJson('{}');
            $accounts = new Music\Accounts($db, $clock, $people);
            $store = new Music\Store($db, $dir, $clock, (int) $account, Music\Limits::for($people, 'student@siue.edu'), $accounts);
            $clock->armed = true;
            $store->putDraft('race-piece', 1, ['score.json' => '{"schema":1}']);
            echo 'published';
            PHP;
        file_put_contents("$tmp/publish.php", $child);
        // The child writes to files, not pipes: reading a pipe would wait for the child to end.
        $proc = proc_open([PHP_BINARY, "$tmp/publish.php", dirname(__DIR__, 2), dirname($path), $this->dir, (string) $this->account, $signal], [1 => ['file', "$tmp/out", 'w'], 2 => ['file', "$tmp/err", 'w']], $pipes);
        self::assertIsResource($proc);
        $until = microtime(true) + 20;
        while (!file_exists($signal) && microtime(true) < $until) {
            usleep(10_000);
        }
        self::assertFileExists($signal, 'the publish reached its row: ' . file_get_contents("$tmp/err"));
        $files = "{$this->dir}/drafts/{$this->account}/race-piece/1";
        self::assertFileExists("$files/score.json.gz", 'the publish wrote its files before start over began');
        self::assertSame('', file_get_contents("$tmp/out"), 'and has not committed yet');

        $began = microtime(true);
        $this->accounts->startOver($this->account);
        self::assertGreaterThan(1.0, microtime(true) - $began, "start over waited for the publish's lock");

        self::assertSame(0, proc_close($proc), file_get_contents("$tmp/err"));
        self::assertSame('published', file_get_contents("$tmp/out"), 'the publish committed first');
        self::assertSame([], $this->store->drafts());
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->account}", 'no files are left behind');
    }

    public function testThePageNeedsAStudioSession(): void
    {
        $login = 'https://example.test/~wgrim/music/login.php?next=studio.php';
        $anon = $this->pages->studio(req(['https' => true]));
        self::assertSame([303, $login], [$anon->status, $anon->headers['Location']]);
        $admin = music_admin_signed_in(new Admin\Sessions($this->db, $this->clock, admin_realm(self::BASE)));
        self::assertSame(303, $this->pages->studio($admin)->status, 'an admin session is not a studio session');

        $this->draft($this->store);
        $post = req(['https' => true, 'method' => 'POST', 'cookies' => $admin->cookies, 'post' => ['action' => 'start-over', 'confirm' => 'start over']]);
        self::assertSame(303, $this->pages->studioAction($post)->status);
        self::assertCount(1, $this->store->drafts(), 'nothing changes without a studio session');
        self::assertSame(403, $this->pages->studio(music_signed_in($this->sessions, $this->account, ['https' => false]))->status, 'HTTPS only');
    }
}
