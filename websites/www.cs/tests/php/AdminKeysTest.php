<?php
// Scoped API keys: only the hash is stored, the key is shown once, the registry
// decides which scopes exist, and check() is the one gate for API requests.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';
require_once __DIR__ . '/AdminPagesTest.php';

final class AdminKeysTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';
    private const SCOPES = ['notes:pickup', 'drafts:publish'];

    /** @return array{0:Admin\Keys,1:PDO,2:FakeClock} */
    private function keys(string $base = self::BASE): array
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        return [new Admin\Keys($db, $clock, self::SCOPES, $base), $db, $clock];
    }

    private function bearer(string $key, array $with = []): Admin\Request
    {
        return req($with + ['headers' => ['authorization' => 'Bearer ' . $key]]);
    }

    public function testProductionRegistryHoldsTheWorkroomScopes(): void
    {
        self::assertSame(['notes:pickup', 'drafts:publish', 'keys:publish'], Admin\Keys::SCOPES);
    }

    public function testCreateReturnsSixtyFourHexAndStoresOnlyItsHash(): void
    {
        [$k, $db] = $this->keys();
        $key = $k->create('laptop', ['notes:pickup']);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $key);
        $rows = $db->query('SELECT * FROM keys')->fetchAll(PDO::FETCH_ASSOC);
        self::assertCount(1, $rows);
        self::assertSame(hash('sha256', $key), $rows[0]['key_hash']);
        self::assertStringNotContainsString($key, json_encode($rows));
    }

    public function testCreateRefusesUnknownEmptyAndBadLabels(): void
    {
        [$k] = $this->keys();
        foreach ([['x', ['nope']], ['x', []], ['x', ['notes:pickup', 'nope']], ['', ['notes:pickup']], [str_repeat('a', 81), ['notes:pickup']]] as [$label, $scopes]) {
            try {
                $k->create($label, $scopes);
                self::fail('accepted ' . json_encode([$label, $scopes]));
            } catch (InvalidArgumentException) {
                self::assertTrue(true);
            }
        }
    }

    public function testListNeverHoldsTheKeyOrItsHash(): void
    {
        [$k] = $this->keys();
        $key = $k->create('laptop', ['notes:pickup', 'drafts:publish']);
        $list = $k->list();
        self::assertCount(1, $list);
        self::assertSame(['id', 'label', 'scopes', 'created_at', 'last_used_at', 'revoked_at'], array_keys($list[0]));
        self::assertSame(['notes:pickup', 'drafts:publish'], $list[0]['scopes']);
        self::assertStringNotContainsString($key, json_encode($list));
        self::assertStringNotContainsString(hash('sha256', $key), json_encode($list));
    }

    public function testAValidKeyPassesAndIsRecorded(): void
    {
        [$k, $db, $clock] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        $clock->now += 5;
        self::assertNull($k->check($this->bearer($key), 'notes:pickup'));
        self::assertSame($clock->now, $k->list()[0]['last_used_at']);
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM key_hits')->fetchColumn());
    }

    public function testAKeyInTheQueryStringIsIgnored(): void
    {
        [$k] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        $res = $k->check(req(['query' => ['key' => $key]]), 'notes:pickup');
        self::assertSame(401, $res?->status);
    }

    public function testMissingOrMalformedBearerIs401(): void
    {
        [$k] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        foreach ([[], ['authorization' => $key], ['authorization' => 'Bearer ' . substr($key, 1)], ['authorization' => 'Basic ' . $key], ['authorization' => 'Bearer ' . strtoupper($key)]] as $headers) {
            self::assertSame(401, $k->check(req(['headers' => $headers]), 'notes:pickup')?->status);
        }
    }

    public function testUnknownKeyIs401(): void
    {
        [$k] = $this->keys();
        self::assertSame(401, $k->check($this->bearer(str_repeat('a', 64)), 'notes:pickup')?->status);
    }

    public function testRevokedKeyIs401(): void
    {
        [$k] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        $k->revoke($k->list()[0]['id']);
        self::assertSame(401, $k->check($this->bearer($key), 'notes:pickup')?->status);
        self::assertNotNull($k->list()[0]['revoked_at']);
    }

    public function testWrongScopeIs403(): void
    {
        [$k] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        self::assertSame(403, $k->check($this->bearer($key), 'drafts:publish')?->status);
    }

    public function testPlainHttpIsRefusedBeforeAnythingIsRead(): void
    {
        [$k, $db] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        $res = $k->check($this->bearer($key, ['https' => false]), 'notes:pickup');
        self::assertSame(403, $res?->status);
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM key_hits')->fetchColumn());
        self::assertNull($k->list()[0]['last_used_at']);
    }

    public function testPlainHttpIsAllowedOnlyForALocalBase(): void
    {
        [$k] = $this->keys('http://127.0.0.1:54321/admin/');
        $key = $k->create('a', ['notes:pickup']);
        self::assertNull($k->check($this->bearer($key, ['https' => false]), 'notes:pickup'));
        [$k2] = $this->keys('http://example.com/admin/');
        $key2 = $k2->create('a', ['notes:pickup']);
        self::assertSame(403, $k2->check($this->bearer($key2, ['https' => false]), 'notes:pickup')?->status);
    }

    public function testRefusalsAreJsonWithEveryHeader(): void
    {
        [$k] = $this->keys();
        foreach ([$k->check(req(), 's'), $k->check(req(['https' => false]), 's')] as $res) {
            self::assertNotNull($res);
            self::assertSame('application/json', $res->headers['Content-Type']);
            self::assertIsString(json_decode($res->body, true)['error']);
            foreach (Admin\Headers::LIST as $name => $value) {
                self::assertSame($value, $res->headers[$name]);
            }
        }
    }

    public function testTheSixtyFirstRequestInAMinuteIs429AndTheNextMinuteIsAllowed(): void
    {
        [$k, , $clock] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        for ($i = 0; $i < Admin\Keys::PER_MINUTE; $i++) {
            self::assertNull($k->check($this->bearer($key), 'notes:pickup'), "request $i");
        }
        $res = $k->check($this->bearer($key), 'notes:pickup');
        self::assertSame(429, $res?->status);
        self::assertSame('application/json', $res->headers['Content-Type']);
        $clock->now += 59;
        self::assertSame(429, $k->check($this->bearer($key), 'notes:pickup')?->status);
        $clock->now += 1;
        self::assertNull($k->check($this->bearer($key), 'notes:pickup'));
    }

    public function testTheRateIsPerKeyAndOldHitsAreDeleted(): void
    {
        [$k, $db, $clock] = $this->keys();
        $a = $k->create('a', ['notes:pickup']);
        $b = $k->create('b', ['notes:pickup']);
        for ($i = 0; $i < Admin\Keys::PER_MINUTE; $i++) {
            $k->check($this->bearer($a), 'notes:pickup');
        }
        self::assertNull($k->check($this->bearer($b), 'notes:pickup'));
        $clock->now += 61;
        $k->check($this->bearer($b), 'notes:pickup');
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM key_hits')->fetchColumn());
    }

    public function testASessionAloneNeverSatisfiesCheck(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $s = new Admin\Sessions($db, $clock, '/');
        $cookie = $s->start(req());
        $id = explode(';', substr($cookie, strlen(Admin\Sessions::COOKIE) + 1))[0];
        $k = new Admin\Keys($db, $clock, self::SCOPES, self::BASE);
        $res = $k->check(req(['cookies' => [Admin\Sessions::COOKIE => $id]]), 'notes:pickup');
        self::assertSame(401, $res?->status);
    }

    public function testPagesRequireKeyDelegatesToTheGate(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $keys = new Admin\Keys($db, $clock, self::SCOPES, self::BASE);
        $key = $keys->create('a', ['notes:pickup']);
        $p = new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true, $keys);
        self::assertNull($p->requireKey($this->bearer($key), 'notes:pickup'));
        self::assertSame(401, $p->requireKey(req(), 'notes:pickup')?->status);
        $db->exec('DROP TABLE keys');
        self::assertSame(503, $p->requireKey($this->bearer($key), 'notes:pickup')?->status);
    }

    public function testAKeyAloneNeverSatisfiesRequireAdmin(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $keys = new Admin\Keys($db, $clock, self::SCOPES, self::BASE);
        $key = $keys->create('a', ['notes:pickup']);
        $p = new Admin\Pages($db, $clock, new MemoryMailer(), self::BASE, static fn(): bool => true, $keys);
        $res = $p->requireAdmin($this->bearer($key, ['cookies' => [Admin\Sessions::COOKIE => $key]]));
        self::assertSame(303, $res?->status);
        self::assertSame(303, $p->keysPanel($this->bearer($key))->status);
        self::assertSame(303, $p->keysAction($this->bearer($key, ['method' => 'POST', 'post' => ['do' => 'revoke', 'id' => '1', 'csrf' => 'x']]))->status);
    }

    /** @return array{0:Admin\Pages,1:Admin\Keys,2:Admin\Request,3:PDO} */
    private function panel(): array
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $mailer = new MemoryMailer();
        $keys = new Admin\Keys($db, $clock, self::SCOPES, self::BASE);
        $p = new Admin\Pages($db, $clock, $mailer, self::BASE, static fn(): bool => true, $keys);
        $p->requestLink(req(['method' => 'POST', 'post' => ['email' => 'wgrim@siue.edu']]));
        $p->flush();
        $mime = quoted_printable_decode($mailer->sent[0]['mime']);
        preg_match('~verify\.php\?token=([0-9a-f]{64})~', $mime, $m);
        $confirm = $p->confirm(req(['query' => ['token' => $m[1]]]));
        $mark = explode(';', substr($confirm->cookies[0], strlen(Admin\Pages::CONFIRM_COOKIE) + 1))[0];
        $done = $p->signIn(req(['method' => 'POST', 'post' => ['token' => $m[1], 'csrf' => $mark], 'cookies' => [Admin\Pages::CONFIRM_COOKIE => $mark]]));
        $id = explode(';', substr($done->cookies[0], strlen(Admin\Sessions::COOKIE) + 1))[0];
        return [$p, $keys, req(['cookies' => [Admin\Sessions::COOKIE => $id]]), $db];
    }

    private function csrfIn(string $html, int $n = 0): string
    {
        preg_match_all('/name="csrf" value="([0-9a-f]{64})"/', $html, $found);
        return $found[1][$n];
    }

    private function post(Admin\Request $in, array $post): Admin\Request
    {
        return req(['method' => 'POST', 'cookies' => $in->cookies, 'post' => $post]);
    }

    public function testThePanelNeedsASessionAndListsWithoutSecrets(): void
    {
        [$p, $keys, $in] = $this->panel();
        self::assertSame(303, $p->keysPanel(req())->status);
        $key = $keys->create('laptop', ['notes:pickup']);
        $res = $p->keysPanel($in);
        self::assertSame(200, $res->status);
        self::assertStringContainsString('laptop', $res->body);
        self::assertStringContainsString('notes:pickup', $res->body);
        self::assertStringNotContainsString($key, $res->body);
        self::assertStringNotContainsString(hash('sha256', $key), $res->body);
        self::assertStringNotContainsString('style=', $res->body);
        self::assertStringNotContainsString('<script', $res->body);
        self::assertDoesNotMatchRegularExpression('/\son[a-z]+=/', $res->body);
    }

    public function testTheCreateFormCanBePrefilledFromTheQueryAndNeverCreatesAKey(): void
    {
        [$p, $keys, $in] = $this->panel();
        $res = $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => 'music-publish', 'scopes' => 'drafts:publish, notes:pickup,nope']]));
        self::assertSame(200, $res->status);
        self::assertStringContainsString('name="label" maxlength="80" value="music-publish"', $res->body);
        self::assertMatchesRegularExpression('/value="drafts:publish" checked/', $res->body);
        self::assertMatchesRegularExpression('/value="notes:pickup" checked/', $res->body);
        self::assertStringNotContainsString('nope', $res->body);
        self::assertSame([], $keys->list(), 'a GET creates nothing');
        $plain = $p->keysPanel($in)->body;
        self::assertStringNotContainsString(' checked', $plain);
        self::assertStringContainsString('value=""', $plain);
    }

    public function testPrefillEscapesTheLabelAndIgnoresNonStrings(): void
    {
        [$p, , $in] = $this->panel();
        $res = $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => '"><script>alert(1)</script>']]));
        self::assertStringNotContainsString('<script>alert', $res->body);
        self::assertStringContainsString('&lt;script&gt;', $res->body);
        $odd = $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => ['x'], 'scopes' => ['notes:pickup']]]));
        self::assertSame(200, $odd->status);
        self::assertStringNotContainsString(' checked', $odd->body);
    }

    public function testCreatingShowsTheKeyOnceOnTheResponseOnly(): void
    {
        [$p, $keys, $in] = $this->panel();
        $csrf = $this->csrfIn($p->keysPanel($in)->body);
        $res = $p->keysAction($this->post($in, ['do' => 'create', 'label' => 'laptop', 'scopes' => ['notes:pickup'], 'csrf' => $csrf]));
        self::assertSame(200, $res->status);
        self::assertSame(1, preg_match('/<code[^>]*>([0-9a-f]{64})<\/code>/', $res->body, $m));
        self::assertStringContainsString('It is shown only this once.', $res->body);
        self::assertStringContainsString('<h1>Your new key</h1><div class="newkey"><button type="button" id="copykey" class="copykey"><code class="secret bigkey">' . $m[1], $res->body);
        self::assertStringContainsString('<span class="copyhint">Copy key</span>', $res->body);
        self::assertStringContainsString('role="status" aria-live="polite"', $res->body);
        self::assertStringContainsString('<script src="admin.js" defer></script>', $res->body);
        self::assertStringNotContainsString('<script src', $p->keysPanel($in)->body, 'only the new-key page loads the script');
        self::assertStringContainsString('make music-setup', $res->body);
        self::assertSame(hash('sha256', $m[1]), (new PDO('sqlite::memory:'))->query("SELECT '" . hash('sha256', $m[1]) . "'")->fetchColumn());
        self::assertNull($keys->check(req(['headers' => ['authorization' => 'Bearer ' . $m[1]]]), 'notes:pickup'));
        $again = $p->keysPanel($in);
        self::assertStringNotContainsString($m[1], $again->body);
        self::assertStringNotContainsString('shown only this once', $again->body);
    }

    public function testAPrefilledPageLeadsWithTheCalloutAndTheFormUnderIt(): void
    {
        [$p, , $in] = $this->panel();
        $body = $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => 'music-publish', 'scopes' => 'drafts:publish']]))->body;
        self::assertStringContainsString('<main class="card"><div class="mark" aria-hidden="true"><span></span></div><h1>API keys</h1><div class="callout"><p class="lead">Make the <strong>music-publish</strong> key: press <strong>Create key</strong>.</p><form', $body);
        self::assertLessThan(strpos($body, 'Existing keys'), strpos($body, 'Create key</button>'));
        self::assertStringNotContainsString('Create a key', $body);
        self::assertStringNotContainsString('<div class="callout">', $p->keysPanel($in)->body, 'no label, no callout');
    }

    public function testAnUnknownLabelPrefillsThePlainFormWithoutTheCallout(): void
    {
        [$p, , $in] = $this->panel();
        $body = $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => 'Click here <b>now</b>']]))->body;
        self::assertStringNotContainsString('class="callout"', $body);
        self::assertStringNotContainsString('Make the', $body);
        self::assertStringContainsString('<h2>Create a key</h2>', $body);
        self::assertStringContainsString('value="Click here &lt;b&gt;now&lt;/b&gt;"', $body);
        foreach (Admin\Keys::GUIDED_LABELS as $known) {
            self::assertStringContainsString('class="callout"', $p->keysPanel(req(['cookies' => $in->cookies, 'query' => ['label' => $known]]))->body);
        }
    }

    public function testRevokedKeysSitInACollapsedDetailsBelowTheExistingKeys(): void
    {
        [$p, $keys, $in] = $this->panel();
        $keys->create('live-one', ['notes:pickup']);
        $old = $keys->create('old-one', ['notes:pickup']);
        $id = (int) array_values(array_filter($keys->list(), static fn(array $k): bool => $k['label'] === 'old-one'))[0]['id'];
        self::assertTrue($keys->revoke($id));
        $body = $p->keysPanel($in)->body;
        self::assertStringContainsString('<h2>Existing keys</h2>', $body);
        self::assertStringContainsString('<details class="revoked"><summary>Revoked keys (1)</summary>', $body);
        self::assertStringNotContainsString('<details class="revoked" open', $body);
        $open = strpos($body, '<details');
        self::assertLessThan($open, strpos($body, 'live-one'));
        self::assertGreaterThan($open, strpos($body, 'old-one'));
        self::assertStringNotContainsString($old, $body);
    }

    public function testCreateAndRevokeNeedAFreshCsrfToken(): void
    {
        [$p, $keys, $in] = $this->panel();
        $bad = $p->keysAction($this->post($in, ['do' => 'create', 'label' => 'x', 'scopes' => ['notes:pickup'], 'csrf' => 'nope']));
        self::assertSame(403, $bad->status);
        self::assertSame([], $keys->list());
        $keys->create('x', ['notes:pickup']);
        $id = $keys->list()[0]['id'];
        $csrf = $this->csrfIn($p->keysPanel($in)->body);
        self::assertSame(200, $p->keysAction($this->post($in, ['do' => 'revoke', 'id' => (string) $id, 'csrf' => $csrf]))->status);
        self::assertNotNull($keys->list()[0]['revoked_at']);
        self::assertSame(403, $p->keysAction($this->post($in, ['do' => 'revoke', 'id' => (string) $id, 'csrf' => $csrf]))->status, 'a token is spent');
    }

    public function testThePanelRefusesAnUnknownScope(): void
    {
        [$p, $keys, $in] = $this->panel();
        $csrf = $this->csrfIn($p->keysPanel($in)->body);
        $res = $p->keysAction($this->post($in, ['do' => 'create', 'label' => 'x', 'scopes' => ['nope'], 'csrf' => $csrf]));
        self::assertSame(400, $res->status);
        self::assertSame([], $keys->list());
        self::assertDoesNotMatchRegularExpression('/<code[^>]*>[0-9a-f]{64}<\/code>/', $res->body);
    }

    public function testEveryPanelResponseCarriesEveryHeader(): void
    {
        [$p, , $in] = $this->panel();
        $csrf = $this->csrfIn($p->keysPanel($in)->body);
        foreach ([$p->keysPanel($in), $p->keysPanel(req()), $p->keysAction($this->post($in, ['do' => 'create', 'label' => 'x', 'scopes' => ['nope'], 'csrf' => $csrf]))] as $res) {
            foreach (Admin\Headers::LIST as $name => $value) {
                self::assertSame($value, $res->headers[$name]);
            }
        }
    }

    public function testTheHubLinksThePanel(): void
    {
        [$p, , $in] = $this->panel();
        self::assertStringContainsString('href="keys.php"', $p->hub($in)->body);
    }

    public function testNonStringScopesAreDroppedWithoutAWarning(): void
    {
        [$k] = $this->keys();
        $warnings = [];
        set_error_handler(static function (int $no, string $msg) use (&$warnings): bool {
            $warnings[] = $msg;
            return true;
        });
        try {
            $key = $k->create('x', [['nested'], 'notes:pickup', 7, 'notes:pickup']);
            try {
                $k->create('y', [['nested']]);
                self::fail('only non-string scopes must leave none');
            } catch (InvalidArgumentException) {
            }
        } finally {
            restore_error_handler();
        }
        self::assertSame([], $warnings);
        self::assertSame(['notes:pickup'], $k->list()[0]['scopes']);
        self::assertNotSame('', $key);
    }

    public function testWrongScopeRequestsCountTowardTheRateLimit(): void
    {
        [$k] = $this->keys();
        $key = $k->create('a', ['notes:pickup']);
        for ($i = 0; $i < Admin\Keys::PER_MINUTE; $i++) {
            self::assertSame(403, $k->check($this->bearer($key), 'drafts:publish')?->status, "request $i");
        }
        self::assertSame(429, $k->check($this->bearer($key), 'drafts:publish')?->status);
        self::assertSame(429, $k->check($this->bearer($key), 'notes:pickup')?->status, 'the limit is the key\'s, not the scope\'s');
    }

    public function testAMissingOrBadKeyAnswers401WithBearerChallenge(): void
    {
        [$k] = $this->keys();
        foreach ([req(), $this->bearer(str_repeat('a', 64))] as $in) {
            $res = $k->check($in, 'notes:pickup');
            self::assertSame(401, $res?->status);
            self::assertSame('Bearer', $res->headers['WWW-Authenticate']);
        }
        $key = $k->create('a', ['notes:pickup']);
        self::assertArrayNotHasKey('WWW-Authenticate', $k->check($this->bearer($key), 'drafts:publish')->headers, '403 is not a challenge');
    }

    public function testRevokeReportsWhetherAnActiveKeyWasRevoked(): void
    {
        [$k] = $this->keys();
        $k->create('a', ['notes:pickup']);
        $id = $k->list()[0]['id'];
        self::assertTrue($k->revoke($id));
        self::assertFalse($k->revoke($id), 'already revoked');
        self::assertFalse($k->revoke(9999), 'unknown');
    }

    public function testRevokingAnUnknownIdShowsAMessage(): void
    {
        [$p, , $in] = $this->panel();
        $csrf = $this->csrfIn($p->keysPanel($in)->body);
        $res = $p->keysAction($this->post($in, ['do' => 'revoke', 'id' => '9999', 'csrf' => $csrf]));
        self::assertSame(404, $res->status);
        self::assertStringContainsString('No active key has that id.', $res->body);
    }
}
