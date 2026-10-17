<?php
// The session routes: plain HTTP, script-made page loads and cross-site data
// requests refused; a session for everything; CSRF on every POST (burned on
// use, the next token returned); deletes remove row and file; an API key is
// never a session; the locked keyring and drafts go only to a session.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicPagesTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    private Music\Pages $pages;
    private Music\Store $store;
    private Admin\Sessions $sessions;
    private Admin\Keys $keys;
    private FakeClock $clock;
    private string $dir;

    protected function setUp(): void
    {
        [$this->store, $db, $this->dir, $clock] = music_world();
        $this->clock = $clock;
        $this->sessions = new Admin\Sessions($db, $clock, '/~wgrim/');
        $this->keys = new Admin\Keys($db, $clock, null, self::BASE);
        $admin = new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true, $this->keys);
        $this->pages = new Music\Pages($this->store, $admin, $this->sessions, '0123456789', self::BASE);
    }

    private function csrfFor(Admin\Request $r): string
    {
        return json_decode($this->pages->csrf($r)->body, true)['csrf'];
    }

    public function testEveryRouteNeedsASession(): void
    {
        $anon = req(['https' => true, 'query' => ['id' => str_repeat('0', 32), 'piece' => 'x', 'v' => '1', 'file' => 'score.json']]);
        $login = self::BASE . 'login.php';
        foreach (['index', 'piece', 'csrf', 'note', 'keyring', 'drafts', 'draftFile', 'delete'] as $route) {
            $res = $this->pages->$route($anon);
            self::assertSame(303, $res->status, $route);
            self::assertSame($login, $res->headers['Location'], "$route sends the browser to the admin login, not to /music/login.php");
        }
        $res = $this->pages->notes($anon, '');
        self::assertSame([303, $login], [$res->status, $res->headers['Location']]);
    }

    public function testAnApiKeyIsNotASession(): void
    {
        $key = $this->keys->create('all', ['notes:pickup', 'drafts:publish', 'keys:publish']);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->putKeyring('{"v":1}');
        $bearer = ['authorization' => "Bearer $key"];
        self::assertSame(303, $this->pages->delete(req(['https' => true, 'method' => 'POST', 'headers' => $bearer, 'post' => ['id' => $id]]))->status);
        self::assertNotNull($this->store->noteBytes($id), 'an API key cannot delete');
        self::assertSame(303, $this->pages->keyring(req(['https' => true, 'headers' => $bearer]))->status, 'the keyring goes only to a session');
        self::assertSame(303, $this->pages->note(req(['https' => true, 'headers' => $bearer, 'query' => ['id' => $id]]))->status);
    }

    public function testHttpsIsRequired(): void
    {
        $r = music_signed_in($this->sessions, ['https' => false]);
        foreach (['index', 'piece', 'csrf', 'keyring', 'drafts'] as $route) {
            self::assertSame(403, $this->pages->$route($r)->status, $route);
        }
    }

    public function testPagesRefuseRequestsAScriptMade(): void
    {
        $script = ['sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty', 'sec-fetch-site' => 'same-origin'];
        $navigation = ['sec-fetch-mode' => 'navigate', 'sec-fetch-dest' => 'document', 'sec-fetch-site' => 'none'];
        foreach (['index', 'piece'] as $route) {
            $query = ['query' => ['id' => 'ch1-labyrinth']];
            self::assertSame(403, $this->pages->$route(music_signed_in($this->sessions, ['headers' => $script] + $query))->status, "$route by script");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, ['headers' => $navigation] + $query))->status, "$route by navigation");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, $query))->status, "$route without Fetch Metadata headers");
        }
    }

    public function testDataRoutesRefuseCrossSiteRequests(): void
    {
        $this->store->putKeyring('{"v":1}');
        foreach (['cross-site', 'same-site'] as $site) {
            $r = music_signed_in($this->sessions, ['headers' => ['sec-fetch-site' => $site]]);
            foreach (['csrf', 'notes', 'keyring', 'drafts'] as $route) {
                $res = $route === 'notes' ? $this->pages->notes($r, '') : $this->pages->$route($r);
                self::assertSame(403, $res->status, "$route from $site");
            }
        }
        $own = music_signed_in($this->sessions, ['headers' => ['sec-fetch-site' => 'same-origin', 'sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty']]);
        self::assertSame(200, $this->pages->keyring($own)->status, "the page's own script is same-origin");
    }

    public function testUploadNeedsCsrfAndReturnsTheNextToken(): void
    {
        // Every check spends the session's token, right or wrong (Admin\Sessions::checkCsrf), so the order below matters.
        $r = music_signed_in($this->sessions, ['method' => 'POST']);
        $cookies = req(['https' => true, 'cookies' => $r->cookies]);
        $withToken = fn(string $t) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $t]]);
        self::assertSame(403, $this->pages->notes($r, music_sealed())->status, 'no token');
        $token = $this->csrfFor($cookies);
        $res = $this->pages->notes($withToken($token), music_sealed());
        self::assertSame(201, $res->status);
        $body = json_decode($res->body, true);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $body['id']);
        self::assertNotSame($token, $body['csrf']);
        // The token returned by a success is the next one and works at once.
        $second = $this->pages->notes($withToken($body['csrf']), music_sealed());
        self::assertSame(201, $second->status, 'the returned token works');
        $next = json_decode($second->body, true)['csrf'];
        // A spent token is refused, and that refusal spends the token the last success returned.
        self::assertSame(403, $this->pages->notes($withToken($token), music_sealed())->status, 'a token works once');
        self::assertSame(403, $this->pages->notes($withToken($next), music_sealed())->status, 'a refusal spends the current token too');
        // The page's recovery: ask csrf.php for a fresh token, then retry.
        self::assertSame(201, $this->pages->notes($withToken($this->csrfFor($cookies)), music_sealed())->status, 'a fresh token from csrf.php works');
    }

    public function testUploadLimitsAreReported(): void
    {
        $r = music_signed_in($this->sessions);
        $post = fn() => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $this->csrfFor($r)]]);
        self::assertSame(413, $this->pages->notes($post(), music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES))->status);
        self::assertSame(422, $this->pages->notes($post(), music_sealed(str_repeat('ef', 32)))->status);
    }

    public function testDeleteOneAndAllRemoveRowAndFile(): void
    {
        $r = music_signed_in($this->sessions);
        $a = $this->store->addNote(music_sealed())['id'];
        $b = $this->store->addNote(music_sealed())['id'];
        $post = fn(array $fields, ?string $t = null) => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies,
            'headers' => ['x-csrf' => $t ?? $this->csrfFor($r)], 'post' => $fields]);
        self::assertSame(403, $this->pages->delete($post(['id' => $a], 'nope'))->status);
        self::assertNotNull($this->store->noteBytes($a));
        $one = $this->pages->delete($post(['id' => $a]));
        self::assertSame(1, json_decode($one->body, true)['deleted']);
        self::assertFileDoesNotExist("{$this->dir}/notes/$a.sealed");
        $all = $this->pages->delete($post(['all' => '1']));
        self::assertSame(1, json_decode($all->body, true)['deleted']);
        self::assertFileDoesNotExist("{$this->dir}/notes/$b.sealed");
        self::assertSame([], $this->store->notes());
    }

    public function testTheKeyringAndTheHistoryGoToTheSession(): void
    {
        $r = music_signed_in($this->sessions);
        $none = $this->pages->keyring($r);
        self::assertSame(404, $none->status);
        self::assertSame('no_keyring', json_decode($none->body, true)['error']);
        $locked = ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => 'c2FsdA==', 'iv' => 'aXY=', 'ct' => 'Y3Q='];
        $this->store->putKeyring(json_encode($locked));
        $res = $this->pages->keyring($r);
        self::assertSame(200, $res->status);
        self::assertSame($locked, json_decode($res->body, true)['keyring']);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->markPickedUp($id);
        $notes = json_decode($this->pages->notes($r, '')->body, true)['notes'];
        self::assertSame([$id], array_column($notes, 'id'), 'picked-up notes stay in the history');
        self::assertArrayNotHasKey('sha256', $notes[0]);
    }

    public function testPieceShellLoadsTheBundleAndCarriesAToken(): void
    {
        $r = music_signed_in($this->sessions, ['query' => ['id' => 'ch1-labyrinth']]);
        $res = $this->pages->piece($r);
        self::assertSame(200, $res->status);
        self::assertStringContainsString('src="../games/workroom/dist/workroom.js?v=0123456789"', $res->body);
        self::assertMatchesRegularExpression('/<meta name="csrf" content="[0-9a-f]{64}">/', $res->body);
        self::assertStringContainsString('data-piece="ch1-labyrinth"', $res->body);
        self::assertStringContainsString('<p class="crumb"><a href="./">All pieces</a></p>', $res->body, 'a way back to the pieces');
        self::assertStringNotContainsString('<h1>', $res->body, 'the piece page is headed by the piece, which the script draws');
        self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy']);
        self::assertSame(400, $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => '<script>']]))->status);
    }

    public function testTheIndexListsEachPieceAsALinkNamedByItsTitle(): void
    {
        $score = ['schema' => 1, 'piece' => ['id' => 'test-piece', 'title' => 'Test piece: <the> Labyrinth wakes'], 'draft' => 1, 'changes' => [
            ['text' => 'Horns carry the theme.'], ['text' => 'Strings < softer'], ['text' => 'Third change'], ['text' => 'Fourth-change-text'],
        ]];
        $this->store->putDraft('test-piece', 1, ['score.json' => json_encode($score)], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $res = $this->pages->index(music_signed_in($this->sessions));
        self::assertSame(200, $res->status);
        self::assertStringContainsString(
            '<a href="piece.php?id=test-piece" data-waiting="test-piece">Test piece: &lt;the&gt; Labyrinth wakes</a><span class="waiting-count"></span><span class="version">v1</span>',
            $res->body,
        );
        self::assertStringContainsString('Strings &lt; softer', $res->body, 'change text is escaped');
        self::assertStringNotContainsString('Fourth-change-text', $res->body, 'only the first three changes');
        self::assertStringContainsString('<li class="piece" data-kind="music">', $res->body);
    }

    public function testTheIndexGroupsPiecesUnderTheirProjectsNewestFirst(): void
    {
        $put = function (string $piece, string $title, string $project, string $name, string $kind): void {
            $this->clock->now += 10;
            $score = ['schema' => 1, 'kind' => $kind, 'project' => ['id' => $project, 'name' => $name], 'piece' => ['id' => $piece, 'title' => $title], 'draft' => 1, 'changes' => []];
            $this->store->putDraft($piece, 1, ['score.json' => json_encode($score)], ['project_id' => $project, 'project_name' => $name, 'kind' => $kind]);
        };
        $put('ch1-labyrinth', 'Chapter 1', 'crete', 'Crete', 'music');
        $put('cannon-fire', 'Cannon fire', 'tankity', 'Tankity <Games>', 'sound');
        $put('ch2-descent', 'Chapter 2', 'crete', 'Crete', 'music');
        $res = $this->pages->index(music_signed_in($this->sessions));
        self::assertSame(200, $res->status);
        // Crete published most recently (chapter 2), so its heading comes first and chapter 2 leads inside it; Tankity follows.
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $res->body, $headings);
        self::assertSame(['Crete', 'Tankity &lt;Games&gt;'], $headings[1], 'projects by their most recent publish, names escaped');
        preg_match_all('~data-waiting="([a-z0-9-]+)"~', $res->body, $rows);
        self::assertSame(['ch2-descent', 'ch1-labyrinth', 'cannon-fire'], $rows[1], 'pieces by their latest publish, grouped by project');
        self::assertSame(1, preg_match('~<h2 class="project">Crete</h2><ul class="pieces"><li class="piece" data-kind="music"><a href="piece.php\?id=ch2-descent"~', $res->body));
        self::assertStringContainsString('<li class="piece" data-kind="sound"><a href="piece.php?id=cannon-fire"', $res->body);
        // A fresh publish in the older project moves that project to the front.
        $put('mortar-fire', 'Mortar fire', 'tankity', 'Tankity <Games>', 'sound');
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $this->pages->index(music_signed_in($this->sessions))->body, $again);
        self::assertSame(['Tankity &lt;Games&gt;', 'Crete'], $again[1]);
    }

    public function testHubListsTheWorkroomAndItsFingerprint(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_800_000_000);
        $sessions = new Admin\Sessions($db, $clock, '/~wgrim/');
        $hub = (new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true))->hub(music_signed_in($sessions));
        self::assertSame(200, $hub->status);
        self::assertStringContainsString('href="../music/"', $hub->body);
        self::assertStringContainsString('Music notes key', $hub->body);
    }

    public function testAMalformedPublicKeyFileDoesNotBreakTheHub(): void
    {
        $file = admin_tmp_dir() . '/public.json';
        file_put_contents($file, '{not json');
        self::assertSame(['Music notes key' => 'invalid (see music/keys/public.json)'], admin_key_fingerprints($file));
        self::assertSame(['Music notes key' => 'not made yet (make keys-init)'], admin_key_fingerprints(admin_tmp_dir() . '/absent.json'));
    }

    public function testACorruptStoredKeyringIsABadKeyringNotAMissingOne(): void
    {
        $this->store->putKeyring('not json');
        $res = $this->pages->keyring(music_signed_in($this->sessions));
        self::assertSame(500, $res->status);
        self::assertSame(['error' => 'bad_keyring'], json_decode($res->body, true));
    }

    public function testDraftFilesAreServedWithTheirTypeAndRanges(): void
    {
        $files = ['score.json' => '{"piece":{"title":"T"}}', 'audio.webm' => '0123456789', 'spectrogram.png' => 'png', 'audio.m4a' => 'm4a', 'score.musicxml' => '<x/>'];
        $this->store->putDraft('p1', 1, $files, ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $get = fn(string $file, array $headers = [], string $v = '1') => $this->pages->draftFile(music_signed_in($this->sessions, ['query' => ['piece' => 'p1', 'v' => $v, 'file' => $file], 'headers' => $headers]));
        $types = ['score.json' => 'application/json', 'score.musicxml' => 'application/vnd.recordare.musicxml+xml', 'audio.webm' => 'audio/webm', 'audio.m4a' => 'audio/mp4', 'spectrogram.png' => 'image/png'];
        foreach ($types as $name => $mime) {
            $res = $get($name);
            self::assertSame([200, $mime, $files[$name]], [$res->status, $res->headers['Content-Type'], $res->body], $name);
        }
        $part = $get('audio.webm', ['range' => 'bytes=2-4']);
        self::assertSame([206, '234', 'bytes 2-4/10'], [$part->status, $part->body, $part->headers['Content-Range']]);
        self::assertSame(404, $get('audio.webm', [], '2')->status, 'unknown version');
        self::assertSame(400, $get('../score.json')->status, 'a name outside the fixed set');
        self::assertSame(400, $get('score.json', [], '0')->status);
    }

    public function testAWrongMethodWithASessionIs405(): void
    {
        $post = music_signed_in($this->sessions, ['method' => 'POST']);
        foreach (['csrf', 'note', 'keyring', 'drafts', 'draftFile'] as $route) {
            self::assertSame(405, $this->pages->$route($post)->status, $route);
        }
        self::assertSame(405, $this->pages->notes(music_signed_in($this->sessions, ['method' => 'PUT']), '')->status);
        self::assertSame(405, $this->pages->delete(music_signed_in($this->sessions))->status, 'delete takes POST only');
    }

    public function testStorageDownIsThe503Page(): void
    {
        $r = music_signed_in($this->sessions, ['query' => ['piece' => 'p1']]);
        $this->store->drafts(); // the table exists now; drop it so the next read fails
        (new ReflectionProperty($this->store, 'db'))->getValue($this->store)->exec('DROP TABLE music_drafts');
        $res = $this->pages->drafts($r);
        self::assertSame(503, $res->status);
        self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy']);
    }

    public function testABadIdDeleteIs400AndKeepsTheNotes(): void
    {
        $r = music_signed_in($this->sessions);
        $id = $this->store->addNote(music_sealed())['id'];
        $res = $this->pages->delete(req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $this->csrfFor($r)], 'post' => ['id' => 'nope']]));
        self::assertSame(400, $res->status);
        self::assertNotNull($this->store->noteBytes($id));
    }

    public function testTheIndexHasANoProjectGroupAndAnEmptyState(): void
    {
        $empty = $this->pages->index(music_signed_in($this->sessions));
        self::assertStringContainsString('No drafts have been published yet.', $empty->body);
        $this->store->putDraft('loose', 1, ['score.json' => '{"piece":{"title":"Loose"}}'], ['project_id' => '', 'project_name' => '', 'kind' => 'music']);
        $this->clock->now += 10;
        $this->store->putDraft('ch1', 1, ['score.json' => '{"piece":{"title":"C"}}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $this->clock->now += 10;
        $this->store->putDraft('loose2', 1, ['score.json' => '{"piece":{"title":"Loose2"}}'], ['project_id' => '', 'project_name' => '', 'kind' => 'music']);
        $body = $this->pages->index(music_signed_in($this->sessions))->body;
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $body, $h);
        self::assertSame(['Crete', 'No project'], $h[1], 'the unprojected group is last whatever its recency');
    }

    public function testTheNoSuchPiecePageMountsNothing(): void
    {
        $res = $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => '<script>']]));
        self::assertSame(400, $res->status);
        self::assertStringContainsString('No such piece.', $res->body);
        self::assertStringNotContainsString('workroom', $res->body);
        self::assertStringNotContainsString('<script', $res->body);
    }
}
