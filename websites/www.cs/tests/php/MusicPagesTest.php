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
    private Admin\Sessions $adminSessions;
    private Closure $storeFor;
    private Admin\Keys $keys;
    private PDO $db;
    private FakeClock $clock;
    private string $dir;
    private int $account;

    protected function setUp(): void
    {
        [$this->store, $db, $this->dir, $clock, , $this->account] = music_world();
        $this->db = $db;
        $this->clock = $clock;
        [$this->pages, $this->sessions, $this->storeFor] = music_pages($db, $this->dir, $clock, self::BASE);
        $this->adminSessions = new Admin\Sessions($db, $clock, admin_realm(self::BASE));
        $this->keys = new Admin\Keys($db, $clock, null, self::BASE);
    }

    private function csrfFor(Admin\Request $r): string
    {
        return json_decode($this->pages->csrf($r)->body, true)['csrf'];
    }

    public function testEveryRouteNeedsASession(): void
    {
        $anon = req(['https' => true, 'query' => ['id' => str_repeat('0', 32), 'piece' => 'x', 'v' => '1', 'file' => 'score.json']]);
        foreach (['csrf', 'note', 'keyring', 'drafts', 'draftFile', 'delete', 'deleteDraft'] as $route) {
            $res = $this->pages->$route($anon);
            self::assertSame([401, ['error' => 'signed_out']], [$res->status, json_decode($res->body, true)], $route);
            self::assertArrayNotHasKey('Location', $res->headers, "$route is fetched by the page's script, which shows the sign-in itself");
        }
        foreach (['notes' => $this->pages->notes($anon, ''), 'keyring upload' => $this->pages->keyring(req(['https' => true, 'method' => 'POST']), '{}')] as $route => $res) {
            self::assertSame(401, $res->status, $route);
        }
    }

    public function testTheWorkroomPagesSendTheBrowserToTheStudioLoginWithTheirNext(): void
    {
        $login = 'https://example.test/~wgrim/music/login.php';
        $index = $this->pages->index(req(['https' => true]));
        self::assertSame([303, "$login?next=index.php"], [$index->status, $index->headers['Location']]);
        $piece = $this->pages->piece(req(['https' => true, 'query' => ['id' => 'ch1-labyrinth', 'v' => '3']]));
        self::assertSame([303, $login . '?next=' . rawurlencode('piece.php?id=ch1-labyrinth&v=3')], [$piece->status, $piece->headers['Location']]);
        $bad = $this->pages->piece(req(['https' => true, 'query' => ['id' => '../admin/']]));
        self::assertSame([303, $login], [$bad->status, $bad->headers['Location']], 'a malformed piece is not remembered');
        self::assertSame(Music\Http::csp(), $index->headers['Content-Security-Policy']);
    }

    public function testAnApiKeyIsNotASession(): void
    {
        $key = $this->keys->create('all', Admin\Keys::SCOPES);
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        $bearer = ['authorization' => "Bearer $key"];
        self::assertSame(401, $this->pages->delete(req(['https' => true, 'method' => 'POST', 'headers' => $bearer, 'post' => ['id' => $id]]))->status);
        self::assertNotNull($this->store->noteBytes($id), 'an API key cannot delete a note');
        self::assertSame(401, $this->pages->keyring(req(['https' => true, 'headers' => $bearer]))->status, 'the keyring goes only to a session');
        self::assertSame(401, $this->pages->note(req(['https' => true, 'headers' => $bearer, 'query' => ['id' => $id]]))->status);
    }

    public function testHttpsIsRequired(): void
    {
        $r = music_signed_in($this->sessions, $this->account, ['https' => false]);
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
            self::assertSame(403, $this->pages->$route(music_signed_in($this->sessions, $this->account, ['headers' => $script] + $query))->status, "$route by script");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, $this->account, ['headers' => $navigation] + $query))->status, "$route by navigation");
            self::assertSame(200, $this->pages->$route(music_signed_in($this->sessions, $this->account, $query))->status, "$route without Fetch Metadata headers");
        }
    }

    public function testDataRoutesRefuseCrossSiteRequests(): void
    {
        $this->store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        foreach (['cross-site', 'same-site'] as $site) {
            $r = music_signed_in($this->sessions, $this->account, ['headers' => ['sec-fetch-site' => $site]]);
            foreach (['csrf', 'notes', 'keyring', 'drafts'] as $route) {
                $res = $route === 'notes' ? $this->pages->notes($r, '') : $this->pages->$route($r);
                self::assertSame(403, $res->status, "$route from $site");
            }
        }
        $own = music_signed_in($this->sessions, $this->account, ['headers' => ['sec-fetch-site' => 'same-origin', 'sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty']]);
        self::assertSame(200, $this->pages->keyring($own)->status, "the page's own script is same-origin");
    }

    public function testUploadNeedsCsrfAndReturnsTheNextToken(): void
    {
        // Every check spends the session's token, right or wrong (Admin\Sessions::checkCsrf), so the order below matters.
        $r = music_signed_in($this->sessions, $this->account, ['method' => 'POST']);
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
        $r = music_signed_in($this->sessions, $this->account);
        $post = fn() => req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $this->csrfFor($r)]]);
        self::assertSame(413, $this->pages->notes($post(), music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES))->status);
        self::assertSame(422, $this->pages->notes($post(), music_sealed(str_repeat('ef', 32)))->status);
    }

    public function testDeleteOneAndAllRemoveRowAndFile(): void
    {
        $r = music_signed_in($this->sessions, $this->account);
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
        $r = music_signed_in($this->sessions, $this->account);
        $this->db->exec('DELETE FROM music_keyring');
        $none = $this->pages->keyring($r);
        self::assertSame(404, $none->status);
        self::assertSame('no_keyring', json_decode($none->body, true)['error']);
        $locked = ['v' => 1, 'kdf' => 'PBKDF2-SHA-256', 'iterations' => 600000, 'salt' => 'c2FsdA==', 'iv' => 'aXY=', 'ct' => 'Y3Q='];
        $this->store->putKeyring(json_encode($locked), MUSIC_FP_CURRENT, []);
        $res = $this->pages->keyring($r);
        self::assertSame(200, $res->status);
        self::assertSame($locked, json_decode($res->body, true)['keyring']);
        $tag = json_decode($res->body, true)['session'];
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $tag);
        self::assertSame($tag, json_decode($this->pages->keyring($r)->body, true)['session'], 'one session, one tag');
        self::assertNotSame($tag, json_decode($this->pages->keyring(music_signed_in($this->sessions, $this->account))->body, true)['session'], 'a new sign-in, a new tag');
        $id = $this->store->addNote(music_sealed())['id'];
        $this->store->markPickedUp($id);
        $notes = json_decode($this->pages->notes($r, '')->body, true)['notes'];
        self::assertSame([$id], array_column($notes, 'id'), 'picked-up notes stay in the history');
        self::assertArrayNotHasKey('sha256', $notes[0]);
    }

    public function testPieceShellLoadsTheBundleAndCarriesAToken(): void
    {
        $r = music_signed_in($this->sessions, $this->account, ['query' => ['id' => 'ch1-labyrinth']]);
        $res = $this->pages->piece($r);
        self::assertSame(200, $res->status);
        self::assertStringContainsString('src="../games/workroom/dist/workroom.js?v=0123456789"', $res->body);
        self::assertMatchesRegularExpression('/<meta name="csrf" content="[0-9a-f]{64}">/', $res->body);
        self::assertStringContainsString('data-piece="ch1-labyrinth"', $res->body);
        self::assertStringContainsString('<p class="crumb"><a href="./">All pieces</a></p>', $res->body, 'a way back to the pieces');
        self::assertStringNotContainsString('<h1>', $res->body, 'the piece page is headed by the piece, which the script draws');
        self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy']);
        self::assertSame(400, $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => '<script>']]))->status);
    }

    public function testTheIndexListsEachPieceAsALinkNamedByItsTitle(): void
    {
        $score = ['schema' => 1, 'piece' => ['id' => 'test-piece', 'title' => 'Test piece: <the> Labyrinth wakes'], 'draft' => 1, 'changes' => [
            ['text' => 'Horns carry the theme.'], ['text' => 'Strings < softer'], ['text' => 'Third change'], ['text' => 'Fourth-change-text'],
        ]];
        $this->store->putDraft('test-piece', 1, ['score.json' => json_encode($score)], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $res = $this->pages->index(music_signed_in($this->sessions, $this->account));
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
        $res = $this->pages->index(music_signed_in($this->sessions, $this->account));
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
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $this->pages->index(music_signed_in($this->sessions, $this->account))->body, $again);
        self::assertSame(['Tankity &lt;Games&gt;', 'Crete'], $again[1]);
    }

    public function testHubListsTheWorkroomAndItsFingerprint(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_800_000_000);
        $sessions = new Admin\Sessions($db, $clock, admin_realm(self::BASE));
        $hub = (new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true))->hub(music_admin_signed_in($sessions));
        self::assertSame(200, $hub->status);
        self::assertStringContainsString('href="../music/"', $hub->body);
        self::assertStringContainsString('Music notes key', $hub->body);
    }

    private function adminPages(): Admin\Pages
    {
        return new Admin\Pages($this->db, $this->clock, new MemoryMailer(), self::BASE, static fn(): bool => true, $this->keys);
    }

    private function hubCsrf(Admin\Request $in): string
    {
        preg_match('/name="csrf" value="([0-9a-f]{64})"/', $this->adminPages()->hub($in)->body, $m);
        return $m[1];
    }

    public function testTheHubOffersToRemoveTheNotesKeyOnlyWhileOneIsStored(): void
    {
        $in = music_admin_signed_in($this->adminSessions);
        $with = $this->adminPages()->hub($in)->body;
        self::assertStringContainsString('<details class="remover"><summary>Remove the notes key</summary>', $with);
        self::assertStringContainsString('1Password is not touched.', $with);
        self::assertStringContainsString('name="do" value="remove-key"', $with);
        $this->db->exec('DELETE FROM music_keyring');
        $without = $this->adminPages()->hub($in)->body;
        self::assertStringNotContainsString('Remove the notes key', $without);
        self::assertStringContainsString('not made yet (make music-setup)', $without);
    }

    public function testRemovingTheNotesKeyNeedsASessionAndAFreshToken(): void
    {
        $in = music_admin_signed_in($this->adminSessions);
        $csrf = $this->hubCsrf($in);
        $post = ['do' => 'remove-key', 'label' => 'Music notes key'];
        $anon = $this->adminPages()->removeKey(req(['https' => true, 'method' => 'POST', 'post' => $post + ['csrf' => $csrf]]));
        self::assertSame([303, 'login.php'], [$anon->status, $anon->headers['Location']]);
        $wrong = $this->adminPages()->removeKey(music_admin_signed_in($this->adminSessions, ['method' => 'POST', 'post' => $post + ['csrf' => 'nope']]));
        self::assertSame(403, $wrong->status);
        self::assertNotNull(Music\Store::fingerprintsIn($this->db, $this->account), 'a refused request removes nothing');
    }

    public function testRemovingTheNotesKeyForgetsTheKeyringAndTheHubSaysNotMadeYet(): void
    {
        $in = music_admin_signed_in($this->adminSessions);
        $csrf = $this->hubCsrf($in);
        $done = $this->adminPages()->removeKey($this->postAs($in, ['do' => 'remove-key', 'label' => 'Music notes key', 'csrf' => $csrf]));
        self::assertSame([303, 'index.php?removed=1'], [$done->status, $done->headers['Location']]);
        self::assertNull(Music\Store::fingerprintsIn($this->db, $this->account));
        self::assertNull($this->store->keyring());
        $hub = $this->adminPages()->hub($in);
        self::assertStringContainsString('not made yet (make music-setup)', $hub->body);
        self::assertStringNotContainsString('Remove the notes key', $hub->body);
    }

    public function testRemovingAKeyTheHubDoesNotListIsNotFound(): void
    {
        $in = music_admin_signed_in($this->adminSessions);
        $csrf = $this->hubCsrf($in);
        $res = $this->adminPages()->removeKey($this->postAs($in, ['do' => 'remove-key', 'label' => 'Other', 'csrf' => $csrf]));
        self::assertSame(404, $res->status);
    }

    public function testRemoveKeyringToleratesAMissingTableAndReportsWhetherARowWent(): void
    {
        self::assertFalse(Music\Store::removeKeyring(admin_tmp_db(), $this->account), 'a database the workroom never touched');
        self::assertTrue(Music\Store::removeKeyring($this->db, $this->account));
        self::assertFalse(Music\Store::removeKeyring($this->db, $this->account), 'nothing left to remove');
    }

    public function testRemoveKeyringThrowsAStorageErrorRatherThanReportNothingRemoved(): void
    {
        $this->db->exec("CREATE TRIGGER keep_keyring BEFORE DELETE ON music_keyring BEGIN SELECT RAISE(ABORT, 'database is locked'); END");
        $this->expectException(PDOException::class);
        Music\Store::removeKeyring($this->db, $this->account);
    }

    private function postAs(Admin\Request $in, array $post): Admin\Request
    {
        return req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'post' => $post]);
    }

    public function testTheHubShowsTheStoredFingerprintInGroupsOfFour(): void
    {
        self::assertSame(['Music notes key' => implode(' ', array_fill(0, 16, 'abab'))], admin_key_fingerprints($this->db));
        $this->store->putKeyring('{"v":1}', str_repeat('0123456789abcdef', 4), []);
        self::assertSame(['Music notes key' => implode(' ', array_fill(0, 4, '0123 4567 89ab cdef'))], admin_key_fingerprints($this->db));
    }

    public function testTheHubSaysNotMadeYetWithoutAKeyringOrItsTable(): void
    {
        $this->db->exec('DELETE FROM music_keyring');
        self::assertSame(['Music notes key' => 'not made yet (make music-setup)'], admin_key_fingerprints($this->db));
        self::assertSame(['Music notes key' => 'not made yet (make music-setup)'], admin_key_fingerprints(admin_tmp_db()), 'a database the workroom never touched');
    }

    public function testTheHubShowsOnlyNotMadeYetForARowWithoutAFingerprint(): void
    {
        $this->db->exec("UPDATE music_keyring SET current_fp = ''");
        self::assertSame(['Music notes key' => 'not made yet (make music-setup)'], admin_key_fingerprints($this->db));
    }

    public function testACorruptStoredKeyringIsABadKeyringNotAMissingOne(): void
    {
        $this->store->putKeyring('not json', MUSIC_FP_CURRENT, []);
        $res = $this->pages->keyring(music_signed_in($this->sessions, $this->account));
        self::assertSame(500, $res->status);
        self::assertSame(['error' => 'bad_keyring'], json_decode($res->body, true));
    }

    public function testDraftFilesAreServedWithTheirTypeAndRanges(): void
    {
        $files = ['score.json' => '{"piece":{"title":"T"}}', 'audio.webm' => '0123456789', 'spectrogram.png' => 'png', 'audio.m4a' => 'm4a', 'score.musicxml' => '<x/>'];
        $this->store->putDraft('p1', 1, $files, ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $get = fn(string $file, array $headers = [], string $v = '1') => $this->pages->draftFile(music_signed_in($this->sessions, $this->account, ['query' => ['piece' => 'p1', 'v' => $v, 'file' => $file], 'headers' => $headers]));
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
        $post = music_signed_in($this->sessions, $this->account, ['method' => 'POST']);
        foreach (['csrf', 'note', 'drafts', 'draftFile'] as $route) {
            self::assertSame(405, $this->pages->$route($post)->status, $route);
        }
        $put = music_signed_in($this->sessions, $this->account, ['method' => 'PUT']);
        self::assertSame(405, $this->pages->notes($put, '')->status);
        self::assertSame(405, $this->pages->keyring($put, '')->status);
        self::assertSame(405, $this->pages->delete(music_signed_in($this->sessions, $this->account))->status, 'delete takes POST only');
        self::assertSame(405, $this->pages->deleteDraft(music_signed_in($this->sessions, $this->account))->status, 'deleteDraft takes POST only');
    }

    public function testStorageDownIsThe503Page(): void
    {
        $r = music_signed_in($this->sessions, $this->account, ['query' => ['piece' => 'p1']]);
        $this->store->drafts(); // the table exists now; drop it so the next read fails
        (new ReflectionProperty($this->store, 'db'))->getValue($this->store)->exec('DROP TABLE music_drafts');
        $res = $this->pages->drafts($r);
        self::assertSame(503, $res->status);
        self::assertSame(Music\Http::csp(), $res->headers['Content-Security-Policy']);
    }

    public function testABadIdDeleteIs400AndKeepsTheNotes(): void
    {
        $r = music_signed_in($this->sessions, $this->account);
        $id = $this->store->addNote(music_sealed())['id'];
        $res = $this->pages->delete(req(['https' => true, 'method' => 'POST', 'cookies' => $r->cookies, 'headers' => ['x-csrf' => $this->csrfFor($r)], 'post' => ['id' => 'nope']]));
        self::assertSame(400, $res->status);
        self::assertNotNull($this->store->noteBytes($id));
    }

    public function testTheIndexHasANoProjectGroupAndAnEmptyState(): void
    {
        $empty = $this->pages->index(music_signed_in($this->sessions, $this->account));
        self::assertStringContainsString('No drafts have been published yet.', $empty->body);
        $this->store->putDraft('loose', 1, ['score.json' => '{"piece":{"title":"Loose"}}'], ['project_id' => '', 'project_name' => '', 'kind' => 'music']);
        $this->clock->now += 10;
        $this->store->putDraft('ch1', 1, ['score.json' => '{"piece":{"title":"C"}}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $this->clock->now += 10;
        $this->store->putDraft('loose2', 1, ['score.json' => '{"piece":{"title":"Loose2"}}'], ['project_id' => '', 'project_name' => '', 'kind' => 'music']);
        $body = $this->pages->index(music_signed_in($this->sessions, $this->account))->body;
        preg_match_all('~<h2 class="project">(.*?)</h2>~', $body, $h);
        self::assertSame(['Crete', 'No project'], $h[1], 'the unprojected group is last whatever its recency');
    }

    /** A studio account (5 MB, 1 MB notes) on this database, with a keyring naming the fixed fingerprints; [its id, its store]. */
    private function student(string $email = 'student@siue.edu', bool $keyed = true): array
    {
        $id = (int) (new Music\Accounts($this->db, $this->clock, Admin\People::fromJson('{}')))->signIn($email);
        $store = ($this->storeFor)($id);
        if ($keyed) {
            $store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        }
        return [$id, $store];
    }

    /** A POST as $account with a fresh CSRF token. */
    private function postWithToken(int $account, array $over = []): Admin\Request
    {
        $in = music_signed_in($this->sessions, $account);
        return req(array_replace(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'headers' => ['x-csrf' => $this->csrfFor($in)]], $over));
    }

    public function testANoteOverTheStudioLimitIsRefusedWithTheRoom(): void
    {
        [$id, $store] = $this->student();
        for ($i = 0; $i < 4; $i++) {
            $store->addNote(music_sealed(MUSIC_FP_CURRENT, 1_048_576 - 38));
        }
        $store->addNote(music_sealed(MUSIC_FP_CURRENT, 100_000 - 38));
        $room = 5_242_880 - 4 * 1_048_576 - 100_000;
        self::assertSame($room, $store->room());
        $res = $this->pages->notes($this->postWithToken($id), music_sealed(MUSIC_FP_CURRENT, $room + 1 - 38));
        self::assertSame(413, $res->status);
        $body = json_decode($res->body, true);
        self::assertSame('over_quota', $body['error']);
        self::assertSame($room, $body['room']);
        self::assertSame('Your studio has 926 KB of 5 MB left. Delete drafts or picked-up notes to make room.', $body['message']);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $body['csrf'], 'the next token, as for every refusal after CSRF');
        self::assertCount(5, $store->notes(), 'nothing is stored and nothing deleted to make room');
        self::assertSame(201, $this->pages->notes($this->postWithToken($id), music_sealed(MUSIC_FP_CURRENT, $room - 38))->status, 'exactly the room fits');
    }

    public function testANoteRefusedForTheSharedSpaceSaysSo(): void
    {
        $dir = $this->dir . '-pool';
        [$pages, $sessions, $storeFor] = music_pages($this->db, $dir, $this->clock, self::BASE, '{"max_shared_bytes": 600000}');
        $id = (int) (new Music\Accounts($this->db, $this->clock, Admin\People::fromJson('{}')))->signIn('pool@siue.edu');
        $storeFor($id)->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        $in = music_signed_in($sessions, $id);
        $csrf = json_decode($pages->csrf($in)->body, true)['csrf'];
        $res = $pages->notes(req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'headers' => ['x-csrf' => $csrf]]), music_sealed(MUSIC_FP_CURRENT, 700_000 - 38));
        $body = json_decode($res->body, true);
        self::assertSame([413, 'over_quota', 600_000], [$res->status, $body['error'], $body['room']]);
        self::assertSame('The studios\' shared space has 586 KB left. Delete drafts or picked-up notes to make room.', $body['message']);
    }

    public function testAScoreOnlyStudioShellSaysSoAndTheOwnersDoesNot(): void
    {
        $attr = static function (Admin\Response $res): string {
            preg_match('~<body [^>]*data-score-only="([01])"~', $res->body, $m);
            return $m[1] ?? 'missing';
        };
        self::assertSame('0', $attr($this->pages->index(music_signed_in($this->sessions, $this->account))));
        [$id] = $this->student('fresh@siue.edu', false);
        self::assertSame('1', $attr($this->pages->piece(music_signed_in($this->sessions, $id, ['query' => ['id' => 'p']]))));
    }

    public function testAStudioNoteOverOneMegabyteIsTooLarge(): void
    {
        [$id] = $this->student();
        $res = $this->pages->notes($this->postWithToken($id), music_sealed(MUSIC_FP_CURRENT, 1_048_576 + 1 - 38));
        self::assertSame([413, 'too_large'], [$res->status, json_decode($res->body, true)['error']]);
        self::assertSame(201, $this->pages->notes($this->postWithToken($id), music_sealed(MUSIC_FP_CURRENT, 1_048_576 - 38))->status, 'exactly 1 MB');
        $owner = $this->pages->notes($this->postWithToken($this->account), music_sealed(MUSIC_FP_CURRENT, 1_048_576 + 1 - 38));
        self::assertSame(201, $owner->status, 'the allowance takes notes up to 2 MB');
    }

    public function testTheShellCarriesTheNoteMaxRoomAndNamed(): void
    {
        $attrs = static function (Admin\Response $res): array {
            preg_match('~<body ([^>]*)>~', $res->body, $m);
            preg_match_all('~(data-[a-z-]+)="([^"]*)"~', $m[1], $pairs, PREG_SET_ORDER);
            return array_column($pairs, 2, 1);
        };
        $owner = $attrs($this->pages->index(music_signed_in($this->sessions, $this->account)));
        self::assertSame(['2097152', (string) $this->store->room(), '1', '1'], [$owner['data-note-max'], $owner['data-room'], $owner['data-named'], $owner['data-account-has-key']]);
        [$id, $store] = $this->student('fresh@siue.edu', false);
        $fresh = $attrs($this->pages->piece(music_signed_in($this->sessions, $id, ['query' => ['id' => 'p']])));
        self::assertSame(['1048576', '5242880', '0', '0'], [$fresh['data-note-max'], $fresh['data-room'], $fresh['data-named'], $fresh['data-account-has-key']]);
        self::assertSame('piece', $fresh['data-view']);
        $store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        $store->addNote(music_sealed(MUSIC_FP_CURRENT, 1000 - 38));
        $keyed = $attrs($this->pages->index(music_signed_in($this->sessions, $id)));
        self::assertSame(['5241880', '1'], [$keyed['data-room'], $keyed['data-account-has-key']]);
    }

    public function testKeyringUploadNeedsSessionAndCsrfAndKeepsTheEnvelopeRules(): void
    {
        [$id, $store] = $this->student('fresh@siue.edu', false);
        $env = music_locked_keyring();
        $good = json_encode(['keyring' => $env, 'current' => MUSIC_FP_CURRENT, 'previous' => []], JSON_UNESCAPED_SLASHES);
        self::assertSame(401, $this->pages->keyring(req(['https' => true, 'method' => 'POST']), $good)->status, 'no session');
        $noToken = music_signed_in($this->sessions, $id, ['method' => 'POST']);
        self::assertSame(403, $this->pages->keyring($noToken, $good)->status, 'no CSRF token');
        self::assertSame(403, $this->pages->keyring($this->postWithToken($id, ['headers' => ['x-csrf' => 'nope']]), $good)->status, 'a wrong token');
        self::assertNull($store->keyring(), 'refused before anything is stored');
        $wrapped = fn(array $keyring, array $over = []): string => json_encode(array_replace(['keyring' => $keyring, 'current' => MUSIC_FP_CURRENT, 'previous' => []], $over), JSON_UNESCAPED_SLASHES);
        foreach ([
            'weak KDF' => $wrapped(music_locked_keyring(['iterations' => 1000])),
            'wrong KDF' => $wrapped(music_locked_keyring(['kdf' => 'scrypt'])),
            'short salt' => $wrapped(music_locked_keyring(['salt' => base64_encode('short')])),
            'extra field' => $wrapped(music_locked_keyring(['fingerprint' => MUSIC_FP_CURRENT])),
            'upper-case hex' => $wrapped($env, ['current' => strtoupper(MUSIC_FP_CURRENT)]),
            'previous repeats current' => $wrapped($env, ['previous' => [MUSIC_FP_CURRENT]]),
            'a bare envelope' => json_encode($env),
            'not json' => 'not json',
        ] as $why => $bad) {
            $res = $this->pages->keyring($this->postWithToken($id), $bad);
            $body = json_decode($res->body, true);
            self::assertSame([422, 'bad_keyring'], [$res->status, $body['error']], $why);
            self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $body['csrf'], $why);
        }
        $huge = $wrapped(music_locked_keyring(['ct' => base64_encode(random_bytes(Music\Store::MAX_KEYRING_BYTES))]));
        self::assertSame(413, $this->pages->keyring($this->postWithToken($id), $huge)->status, 'over the keyring limit');
        self::assertNull($store->keyring(), 'refused uploads store nothing');
        $res = $this->pages->keyring($this->postWithToken($id), $good);
        self::assertSame(201, $res->status);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', json_decode($res->body, true)['csrf']);
        self::assertSame(json_encode($env, JSON_UNESCAPED_SLASHES), $store->keyring()['locked']);
        self::assertSame(['current' => MUSIC_FP_CURRENT, 'previous' => []], $store->fingerprints());
        $read = json_decode($this->pages->keyring(music_signed_in($this->sessions, $id))->body, true);
        self::assertSame($env, $read['keyring'], 'the page reads back what it stored');
    }

    public function testKeyringUploadNeverReplacesAKeyTheStudioHolds(): void
    {
        [$id, $store] = $this->student('second@siue.edu', false);
        $first = music_locked_keyring();
        $second = music_locked_keyring(['ct' => base64_encode(str_repeat('x', 48))]);
        $upload = fn(array $env, string $fp) => $this->pages->keyring($this->postWithToken($id), json_encode(['keyring' => $env, 'current' => $fp, 'previous' => []], JSON_UNESCAPED_SLASHES));
        self::assertSame(201, $upload($first, MUSIC_FP_CURRENT)->status);
        $refused = $upload($second, str_repeat('cd', 32));
        $body = json_decode($refused->body, true);
        self::assertSame([409, 'key_exists'], [$refused->status, $body['error']]);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $body['csrf'], 'the page gets a fresh token');
        self::assertSame(json_encode($first, JSON_UNESCAPED_SLASHES), $store->keyring()['locked'], 'the first key stays');
        self::assertSame(['current' => MUSIC_FP_CURRENT, 'previous' => []], $store->fingerprints());
    }

    public function testDeleteDraftRemovesOneDraftOrAWholePiece(): void
    {
        foreach ([1, 2] as $v) {
            $this->clock->now += 1;
            $this->store->putDraft('p1', $v, ['score.json' => '{"piece":{"title":"T"}}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        }
        $this->store->putDraft('p2', 1, ['score.json' => '{"piece":{"title":"U"}}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        $del = fn(array $post, ?string $token = null) => $this->pages->deleteDraft($token === null ? $this->postWithToken($this->account, ['post' => $post])
            : req(['https' => true, 'method' => 'POST', 'cookies' => music_signed_in($this->sessions, $this->account)->cookies, 'headers' => ['x-csrf' => $token], 'post' => $post]));
        self::assertSame(403, $del(['piece' => 'p1', 'v' => '1'], 'nope')->status);
        self::assertCount(3, $this->store->drafts());
        foreach ([[['piece' => '../x'], 'bad_piece'], [['piece' => 'p1', 'v' => '0'], 'bad_version'], [['piece' => 'p1', 'v' => 'x'], 'bad_version']] as [$post, $error]) {
            $res = $del($post);
            self::assertSame([400, $error], [$res->status, json_decode($res->body, true)['error']], json_encode($post));
        }
        $one = $del(['piece' => 'p1', 'v' => '1']);
        self::assertSame(200, $one->status);
        $body = json_decode($one->body, true);
        self::assertSame(1, $body['deleted']);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $body['csrf']);
        self::assertSame([2], array_column($this->store->drafts('p1'), 'version'));
        self::assertSame(404, $del(['piece' => 'p1', 'v' => '1'])->status, 'already gone');
        $this->clock->now += 1;
        $this->store->putDraft('p1', 3, ['score.json' => '{"piece":{"title":"T"}}'], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'music']);
        self::assertSame(2, json_decode($del(['piece' => 'p1'])->body, true)['deleted'], 'no v: the whole piece');
        self::assertSame([], $this->store->drafts('p1'));
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->account}/p1");
        self::assertSame(['p2'], array_column($this->store->drafts(), 'piece'), 'other pieces stay');
        self::assertSame(404, $del(['piece' => 'p1'])->status);
    }

    private const HEAD_ASSETS = '<script src="../games/workroom/dist/theme.js?v=0123456789"></script>'
        . '<link rel="stylesheet" href="../games/workroom/dist/workroom.css?v=0123456789">';

    private static function assertConsoleShell(string $html): void
    {
        $head = substr($html, 0, (int) strpos($html, '</head>'));
        self::assertStringContainsString('<meta name="color-scheme" content="dark light">', $head);
        self::assertStringContainsString(self::HEAD_ASSETS, $head, 'the theme boot runs before the stylesheet, as a plain script in the head');
        self::assertStringNotContainsString('music.css', $html);
        self::assertStringNotContainsString('style="', $html, 'no inline style attribute (the CSP blocks them)');
        self::assertMatchesRegularExpression('~<header class="console-head">.*<div id="theme-switch"></div></header>~s', $html);
    }

    public function testEveryShellLinksTheConsoleStylesheetAndTheThemeBoot(): void
    {
        $piece = $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => 'ch1-labyrinth']]));
        self::assertConsoleShell($piece->body);
        self::assertStringContainsString('<header class="console-head"><p class="crumb"><a href="./">All pieces</a></p><p class="crumb"><a href="studio.php">Your studio</a></p><div id="theme-switch"></div></header>', $piece->body);
        $index = $this->pages->index(music_signed_in($this->sessions, $this->account));
        self::assertConsoleShell($index->body);
        self::assertStringContainsString('<header class="console-head"><h1>Music workroom</h1><p class="crumb"><a href="studio.php">Your studio</a></p><div id="theme-switch"></div></header>', $index->body);
        self::assertStringContainsString('<div class="index-body"><p class="waiting-total">', $index->body);
    }

    public function testTheErrorPageWearsTheConsoleToo(): void
    {
        $res = $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => '<script>']]));
        self::assertSame(400, $res->status);
        $head = substr($res->body, 0, (int) strpos($res->body, '</head>'));
        self::assertStringContainsString(self::HEAD_ASSETS, $head);
        self::assertStringContainsString('<p class="error" role="alert">No such piece.</p>', $res->body);
        self::assertStringContainsString('<a href="./">All pieces</a>', $res->body);
    }

    public function testTheNoSuchPiecePageMountsNothing(): void
    {
        $res = $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => '<script>']]));
        self::assertSame(400, $res->status);
        self::assertStringContainsString('No such piece.', $res->body);
        preg_match_all('~<script\b[^>]*>~', $res->body, $scripts);
        self::assertSame(['<script src="../games/workroom/dist/theme.js?v=0123456789">'], $scripts[0], 'the only script is the theme boot');
        foreach (['workroom.js', 'sheet.js', 'type="module"', 'data-view', 'data-piece', '<main id="workroom">'] as $mount) {
            self::assertStringNotContainsString($mount, $res->body, "the error page does not mount the workroom: $mount");
        }
    }
}
