<?php
// Sessions (hashed ids, idle and absolute limits, regeneration), per-session CSRF
// tokens, the trusted-device cookie strings, request parsing and response headers.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminSessionsTest extends TestCase
{
    private function sessions(): array
    {
        $c = new FakeClock(1_000_000);
        $db = admin_tmp_db();
        return [new Admin\Sessions($db, $c, '/'), $db, $c];
    }

    private function idOf(string $cookie): string
    {
        self::assertSame(1, preg_match('/^__Secure-admin=([0-9a-f]{64});/', $cookie, $m));
        return $m[1];
    }

    private function reqWith(string $cookie): Admin\Request
    {
        return req(['cookies' => [Admin\Sessions::COOKIE => $this->idOf($cookie)]]);
    }

    public function testStartCookieAttributes(): void
    {
        [$s] = $this->sessions();
        $cookie = $s->start(req());
        self::assertStringStartsWith('__Secure-admin=', $cookie);
        self::assertStringContainsString('; Secure', $cookie);
        self::assertStringContainsString('; HttpOnly', $cookie);
        self::assertStringContainsString('; SameSite=Strict', $cookie);
        self::assertStringContainsString('; Path=/', $cookie);
        self::assertStringNotContainsString('Domain', $cookie);
    }

    public function testDatabaseHoldsOnlyTheHashOfTheId(): void
    {
        [$s, $db] = $this->sessions();
        $id = $this->idOf($s->start(req()));
        self::assertSame([hash('sha256', $id)], $db->query('SELECT id_hash FROM sessions')->fetchAll(PDO::FETCH_COLUMN));
    }

    public function testCurrentIsTrueJustBeforeIdle(): void
    {
        [$s, , $c] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $c->now += 1799;
        self::assertTrue($s->current($r));
    }

    public function testCurrentIsFalseAtExactlyIdle(): void
    {
        [$s, , $c] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $c->now += 1800;
        self::assertFalse($s->current($r));
    }

    public function testActivityKeepsASessionAliveButNotPastMax(): void
    {
        [$s, , $c] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        for ($i = 0; $i < 71; $i++) {
            $c->now += 1200;
            self::assertTrue($s->current($r), "step $i");
        }
        $c->now += 1200;
        self::assertFalse($s->current($r));
    }

    public function testExpiredSessionsAreDeleted(): void
    {
        [$s, $db, $c] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $c->now += 1800;
        $s->current($r);
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM sessions')->fetchColumn());
    }

    public function testNoCookieOrUnknownCookieIsNotCurrent(): void
    {
        [$s] = $this->sessions();
        self::assertFalse($s->current(req()));
        self::assertFalse($s->current(req(['cookies' => ['__Secure-admin' => str_repeat('a', 64)]])));
        self::assertFalse($s->current(req(['cookies' => ['__Secure-admin' => ['x']]])));
    }

    public function testEverySessionIdIsFresh(): void
    {
        [$s] = $this->sessions();
        self::assertNotSame($this->idOf($s->start(req())), $this->idOf($s->start(req())));
    }

    public function testEndKillsOnlyThatSession(): void
    {
        [$s] = $this->sessions();
        $a = $this->reqWith($s->start(req()));
        $b = $this->reqWith($s->start(req()));
        $expiring = $s->end($a);
        self::assertFalse($s->current($a));
        self::assertTrue($s->current($b));
        self::assertStringStartsWith('__Secure-admin=;', $expiring);
        self::assertStringContainsString('Max-Age=0', $expiring);
        self::assertStringContainsString('; Secure', $expiring);
        self::assertStringContainsString('; HttpOnly', $expiring);
        self::assertStringContainsString('; SameSite=Strict', $expiring);
        self::assertStringContainsString('; Path=/', $expiring);
        self::assertStringNotContainsString('Domain', $expiring);
    }

    public function testEndAllKillsEverySession(): void
    {
        [$s] = $this->sessions();
        $a = $this->reqWith($s->start(req()));
        $b = $this->reqWith($s->start(req()));
        $s->endAll();
        self::assertFalse($s->current($a));
        self::assertFalse($s->current($b));
    }

    public function testCsrfTokenWorksOnce(): void
    {
        [$s] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $token = $s->csrf($r);
        self::assertTrue($s->checkCsrf($r, $token));
        self::assertFalse($s->checkCsrf($r, $token));
    }

    public function testCsrfTokenIsNeverStoredAndIsStableUntilChecked(): void
    {
        [$s, $db] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $token = $s->csrf($r);
        self::assertSame($token, $s->csrf($r));
        self::assertNotContains($token, $db->query('SELECT csrf_nonce FROM sessions')->fetchAll(PDO::FETCH_COLUMN));
        self::assertTrue($s->checkCsrf($r, $token));
        self::assertNotSame($token, $s->csrf($r));
    }

    public function testCsrfRefusesAnExpiredSession(): void
    {
        [$s, , $c] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $token = $s->csrf($r);
        $c->now += Admin\Sessions::IDLE + 1;
        self::assertSame('', $s->csrf($r));
        self::assertFalse($s->checkCsrf($r, $token));
    }

    public function testCsrfTokenFromAnotherSessionFails(): void
    {
        [$s] = $this->sessions();
        $a = $this->reqWith($s->start(req()));
        $b = $this->reqWith($s->start(req()));
        $tokenA = $s->csrf($a);
        $s->csrf($b);
        self::assertFalse($s->checkCsrf($b, $tokenA));
    }

    public function testAFailedCheckSpendsTheToken(): void
    {
        [$s] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        $token = $s->csrf($r);
        self::assertFalse($s->checkCsrf($r, 'wrong'));
        self::assertFalse($s->checkCsrf($r, $token));
    }

    public function testCsrfWithoutASessionOrToken(): void
    {
        [$s] = $this->sessions();
        $r = $this->reqWith($s->start(req()));
        self::assertFalse($s->checkCsrf($r, ''));
        self::assertFalse($s->checkCsrf(req(), 'x'));
        self::assertSame('', $s->csrf(req()));
    }

    public function testDeviceCookieString(): void
    {
        self::assertSame('__Secure-admin-device', Admin\Sessions::DEVICE_COOKIE);
        self::assertSame(
            '__Secure-admin-device=abc123; Max-Age=7776000; Path=/; Secure; HttpOnly; SameSite=Strict',
            Admin\Sessions::deviceCookie('abc123', '/'),
        );
    }

    public function testExpireDeviceCookieString(): void
    {
        self::assertSame(
            '__Secure-admin-device=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Strict',
            Admin\Sessions::expireDeviceCookie('/'),
        );
    }

    public function testDeviceTokenIsReadFromTheCookie(): void
    {
        self::assertSame('tok', Admin\Sessions::deviceToken(req(['cookies' => ['__Secure-admin-device' => 'tok']])));
        self::assertNull(Admin\Sessions::deviceToken(req()));
        self::assertNull(Admin\Sessions::deviceToken(req(['cookies' => ['__Secure-admin-device' => ['x']]])));
        self::assertNull(Admin\Sessions::deviceToken(req(['cookies' => ['__Secure-admin-device' => '']])));
    }

    public function testClientIpIsRemoteAddrOnly(): void
    {
        $r = $this->fromGlobals(['REMOTE_ADDR' => '198.51.100.7', 'HTTP_X_FORWARDED_FOR' => '6.6.6.6']);
        self::assertSame('198.51.100.7', $r->ip);
    }

    public function testClientIpIsCappedAt45Characters(): void
    {
        $r = $this->fromGlobals(['REMOTE_ADDR' => str_repeat('1', 80)]);
        self::assertSame(45, strlen($r->ip));
    }

    public function testAuthorizationHeaderComesFromEitherServerKey(): void
    {
        $a = $this->fromGlobals(['HTTP_AUTHORIZATION' => 'Bearer one']);
        self::assertSame('Bearer one', $a->headers['authorization']);
        $b = $this->fromGlobals(['REDIRECT_HTTP_AUTHORIZATION' => 'Bearer two']);
        self::assertSame('Bearer two', $b->headers['authorization']);
    }

    public function testHttpsFromHttpsOrRequestScheme(): void
    {
        self::assertTrue($this->fromGlobals(['HTTPS' => 'on'])->https);
        self::assertTrue($this->fromGlobals(['REQUEST_SCHEME' => 'https'])->https);
        self::assertFalse($this->fromGlobals(['HTTPS' => 'off'])->https);
        self::assertFalse($this->fromGlobals([])->https);
    }

    public function testRequestFieldsComeFromGlobals(): void
    {
        $r = $this->fromGlobals(['REQUEST_METHOD' => 'post', 'HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_USER_AGENT' => 'UA'],
            ['a' => '1'], ['q' => '2'], ['c' => '3']);
        self::assertSame('POST', $r->method);
        self::assertSame('www.cs.siue.edu', $r->host);
        self::assertSame('UA', $r->agent);
        self::assertSame(['a' => '1'], $r->post);
        self::assertSame(['q' => '2'], $r->query);
        self::assertSame(['c' => '3'], $r->cookies);
    }

    private function fromGlobals(array $server, array $post = [], array $get = [], array $cookie = []): Admin\Request
    {
        $saved = [$_SERVER, $_POST, $_GET, $_COOKIE];
        try {
            [$_SERVER, $_POST, $_GET, $_COOKIE] = [$server, $post, $get, $cookie];
            return Admin\Request::fromGlobals();
        } finally {
            [$_SERVER, $_POST, $_GET, $_COOKIE] = $saved;
        }
    }

    public function testHeadersApplyAddsEveryRequiredHeader(): void
    {
        $h = Admin\Headers::apply([]);
        self::assertSame('no-store', $h['Cache-Control']);
        self::assertSame('no-referrer', $h['Referrer-Policy']);
        self::assertSame('noindex, nofollow', $h['X-Robots-Tag']);
        self::assertSame('nosniff', $h['X-Content-Type-Options']);
        self::assertSame(
            "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
            $h['Content-Security-Policy'],
        );
    }

    public function testHeadersApplyKeepsOthersAndOverridesTheRequiredOnes(): void
    {
        $h = Admin\Headers::apply(['Content-Type' => 'text/html', 'Cache-Control' => 'public']);
        self::assertSame('text/html', $h['Content-Type']);
        self::assertSame('no-store', $h['Cache-Control']);
    }

    public function testCookiesCarryTheGivenPath(): void
    {
        $s = new Admin\Sessions(admin_tmp_db(), new FakeClock(), '/~wgrim/');
        self::assertStringContainsString('; Path=/~wgrim/; Secure; HttpOnly; SameSite=Strict', $s->start(req()));
        self::assertStringContainsString('; Path=/~wgrim/; Secure', $s->end(req()));
        self::assertSame(
            '__Secure-admin-device=t; Max-Age=7776000; Path=/~wgrim/; Secure; HttpOnly; SameSite=Strict',
            Admin\Sessions::deviceCookie('t', '/~wgrim/'),
        );
        self::assertStringNotContainsString('Domain', Admin\Sessions::expireDeviceCookie('/~wgrim/'));
    }
}
