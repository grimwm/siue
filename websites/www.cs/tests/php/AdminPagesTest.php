<?php
// The sign-in pages and the hub: same reply whatever the address, mail sent after
// the reply, links that confirm before they spend, per-page CSRF, trusted devices,
// the mailer guard, and a page body that the CSP lets render.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class MemoryMailer implements Admin\Mailer
{
    /** @var list<array{to:string,subject:string,mime:string}> */
    public array $sent = [];
    public bool $fail = false;

    public function send(string $to, string $subject, string $mime): void
    {
        if ($this->fail) {
            throw new RuntimeException('smtp down');
        }
        $this->sent[] = ['to' => $to, 'subject' => $subject, 'mime' => $mime];
    }
}

final class AdminPagesTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';

    /** @return array{0:Admin\Pages,1:PDO,2:FakeClock,3:MemoryMailer} */
    private function pages(): array
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $mailer = new MemoryMailer();
        return [new Admin\Pages($db, $clock, $mailer, self::BASE, static fn(): bool => true), $db, $clock, $mailer];
    }

    private function post(array $post, array $with = []): Admin\Request
    {
        return req($with + ['method' => 'POST', 'post' => $post]);
    }

    /** The token in the one link a mailer holds. */
    private function tokenOf(MemoryMailer $m): string
    {
        $mime = quoted_printable_decode($m->sent[0]['mime']);
        self::assertSame(1, preg_match('~' . preg_quote(self::BASE, '~') . 'verify\.php\?token=([0-9a-f]{64})~', $mime, $found));
        return $found[1];
    }

    private function cookieValue(Admin\Response $r, string $name): ?string
    {
        foreach ($r->cookies as $c) {
            if (str_starts_with($c, $name . '=')) {
                return explode(';', substr($c, strlen($name) + 1))[0];
            }
        }
        return null;
    }

    /** A signed-in request, via the real flow. */
    private function signedIn(Admin\Pages $p, MemoryMailer $m): Admin\Request
    {
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $p->flush();
        $token = $this->tokenOf($m);
        $confirm = $p->confirm(req(['query' => ['token' => $token]]));
        $mark = $this->cookieValue($confirm, Admin\Pages::CONFIRM_COOKIE);
        $done = $p->signIn($this->post(['token' => $token, 'csrf' => $mark], ['cookies' => [Admin\Pages::CONFIRM_COOKIE => $mark]]));
        self::assertSame(303, $done->status);
        $cookies = [Admin\Sessions::COOKIE => $this->cookieValue($done, Admin\Sessions::COOKIE)];
        $device = $this->cookieValue($done, Admin\Sessions::DEVICE_COOKIE);
        if ($device !== null) {
            $cookies[Admin\Sessions::DEVICE_COOKIE] = $device;
        }
        $p->flush();
        $m->sent = [];
        return req(['cookies' => $cookies]);
    }

    private function csrfsIn(string $html): array
    {
        preg_match_all('/name="csrf" value="([0-9a-f]{64})"/', $html, $found);
        return $found[1];
    }

    public function testLinkRequestRepliesTheSameAndMailsOnlyTheOwner(): void
    {
        [$p, , , $m] = $this->pages();
        $a = $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $b = $p->requestLink($this->post(['email' => 'x@siue.edu']));
        self::assertSame(200, $a->status);
        self::assertSame($a->status, $b->status);
        self::assertSame($a->body, $b->body);
        self::assertSame([], $m->sent, 'nothing is sent before the reply is out');
        $p->flush();
        self::assertCount(1, $m->sent);
        self::assertSame('wgrim@siue.edu', $m->sent[0]['to']);
        self::assertSame(64, strlen($this->tokenOf($m)));
        $p->flush();
        self::assertCount(1, $m->sent, 'flush sends each message once');
    }

    public function testAFailedSendDeletesTheLink(): void
    {
        [$p, $db, , $m] = $this->pages();
        $m->fail = true;
        $ok = $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $p->flush();
        $m->fail = false;
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM links')->fetchColumn());
        [$p2] = $this->pages();
        self::assertSame($p2->requestLink($this->post(['email' => 'x@siue.edu']))->body, $ok->body);
    }

    public function testAStorageErrorOnTheLinkPathLooksLikeSuccess(): void
    {
        [$p, $db] = $this->pages();
        $good = $p->requestLink($this->post(['email' => 'x@siue.edu']));
        $db->exec('DROP TABLE link_requests');
        $bad = $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        self::assertSame($good->status, $bad->status);
        self::assertSame($good->body, $bad->body);
    }

    public function testConfirmShowsAFormAndNeverSpendsTheLink(): void
    {
        [$p, $db, , $m] = $this->pages();
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $p->flush();
        $token = $this->tokenOf($m);
        for ($i = 0; $i < 5; $i++) {
            $r = $p->confirm(req(['query' => ['token' => $token]]));
            self::assertSame(200, $r->status);
            self::assertStringContainsString('method="post"', $r->body);
            self::assertStringContainsString('name="token" value="' . $token . '"', $r->body);
            self::assertMatchesRegularExpression('/name="csrf" value="[0-9a-f]{64}"/', $r->body);
        }
        self::assertSame('wgrim@siue.edu', (new Admin\Auth($db, new FakeClock()))->peek($token));
        self::assertSame(403, $p->confirm(req(['query' => ['token' => str_repeat('0', 64)]]))->status);
    }

    public function testSignInChecksCsrfConsumesOnceStartsASessionAndMailsANotice(): void
    {
        [$p, , , $m] = $this->pages();
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $p->flush();
        $token = $this->tokenOf($m);
        $m->sent = [];
        $mark = $this->cookieValue($p->confirm(req(['query' => ['token' => $token]])), Admin\Pages::CONFIRM_COOKIE);
        self::assertNotNull($mark);

        $bad = $p->signIn($this->post(['token' => $token, 'csrf' => 'nope'], ['cookies' => [Admin\Pages::CONFIRM_COOKIE => $mark]]));
        self::assertSame(403, $bad->status);
        self::assertStringContainsString('This form expired. Open the link again.', $bad->body);
        self::assertNull($this->cookieValue($bad, Admin\Sessions::COOKIE));
        $none = $p->signIn($this->post(['token' => $token, 'csrf' => $mark]));
        self::assertSame(403, $none->status, 'the confirm cookie is required');

        $ok = $p->signIn($this->post(['token' => $token, 'csrf' => $mark], ['cookies' => [Admin\Pages::CONFIRM_COOKIE => $mark]]));
        self::assertSame(303, $ok->status);
        self::assertSame('index.php', $ok->headers['Location']);
        self::assertNotNull($this->cookieValue($ok, Admin\Sessions::COOKIE));
        $p->flush();
        self::assertCount(1, $m->sent);
        self::assertSame('New sign-in to your admin pages', $m->sent[0]['subject']);

        $again = $p->signIn($this->post(['token' => $token, 'csrf' => $mark], ['cookies' => [Admin\Pages::CONFIRM_COOKIE => $mark]]));
        self::assertSame(403, $again->status);
        self::assertNull($this->cookieValue($again, Admin\Sessions::COOKIE));
    }

    public function testHubNeedsASessionAndOffersTwoSignOutForms(): void
    {
        [$p, , , $m] = $this->pages();
        $r = $p->hub(req());
        self::assertSame(303, $r->status);
        self::assertSame('login.php', $r->headers['Location']);
        self::assertSame('login.php', $p->requireAdmin(req())?->headers['Location']);

        $in = $this->signedIn($p, $m);
        self::assertNull($p->requireAdmin($in));
        $hub = $p->hub($in);
        self::assertSame(200, $hub->status);
        self::assertStringContainsString('action="logout.php"', $hub->body);
        self::assertStringContainsString('action="logout.php?all=1"', $hub->body);
        self::assertStringContainsString('Sign out everywhere', $hub->body);
    }

    public function testEitherHubFormWorksOnItsOwn(): void
    {
        foreach ([false, true] as $all) {
            [$p, , , $m] = $this->pages();
            $in = $this->signedIn($p, $m);
            $tokens = $this->csrfsIn($p->hub($in)->body);
            self::assertCount(2, $tokens);
            self::assertSame($tokens[0], $tokens[1], 'one token per page');
            $out = $all
                ? $p->signOutEverywhere($this->post(['csrf' => $tokens[1]], ['cookies' => $in->cookies, 'query' => ['all' => '1']]))
                : $p->signOut($this->post(['csrf' => $tokens[0]], ['cookies' => $in->cookies]));
            self::assertSame(303, $out->status);
            self::assertSame('login.php', $out->headers['Location']);
            self::assertSame(303, $p->hub($in)->status, 'the session is gone');
        }
    }

    public function testSignOutRefusesAWrongOrReusedToken(): void
    {
        [$p, , , $m] = $this->pages();
        $in = $this->signedIn($p, $m);
        $t = $this->csrfsIn($p->hub($in)->body)[0];
        self::assertSame(403, $p->signOut($this->post(['csrf' => 'x'], ['cookies' => $in->cookies]))->status);
        self::assertSame(200, $p->hub($in)->status, 'still signed in');
        self::assertSame(403, $p->signOut($this->post(['csrf' => $t], ['cookies' => $in->cookies]))->status, 'a failed check spent it');
    }

    public function testSignOutEverywhereEndsSessionsLinksAndDevices(): void
    {
        [$p, $db, , $m] = $this->pages();
        $in = $this->signedIn($p, $m);
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '198.51.100.1']));
        $p->flush();
        $token = $this->tokenOf($m);
        $t = $this->csrfsIn($p->hub($in)->body)[1];
        $out = $p->signOutEverywhere($this->post(['csrf' => $t], ['cookies' => $in->cookies, 'query' => ['all' => '1']]));
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM sessions')->fetchColumn());
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM devices')->fetchColumn());
        self::assertNull((new Admin\Auth($db, new FakeClock()))->peek($token));
        self::assertNotNull($this->cookieValue($out, Admin\Sessions::COOKIE));
        self::assertContains(Admin\Sessions::expireDeviceCookie('/~wgrim/'), $out->cookies);
    }

    public function testSignInSetsTheDeviceCookieAndItSkipsTheSharedLimits(): void
    {
        [$p, $db, , $m] = $this->pages();
        $dev = $this->signedIn($p, $m);
        $device = $dev->cookies[Admin\Sessions::DEVICE_COOKIE] ?? null;
        self::assertNotNull($device, 'sign-in sets the device cookie');
        self::assertTrue((new Admin\Auth($db, new FakeClock()))->isTrustedDevice($device));

        // Strangers exhaust the address and global limits from other addresses.
        for ($i = 0; $i < 31; $i++) {
            $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '192.0.2.' . ($i % 250 + 1)]));
        }
        $p->flush();
        $m->sent = [];
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '198.51.100.77']));
        $p->flush();
        self::assertCount(0, $m->sent, 'a stranger is limited');
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '198.51.100.78', 'cookies' => [Admin\Sessions::DEVICE_COOKIE => $device]]));
        $p->flush();
        self::assertCount(1, $m->sent, 'the owner\'s device still gets a link');

        $t = $this->csrfsIn($p->hub($dev)->body)[1];
        $p->signOutEverywhere($this->post(['csrf' => $t], ['cookies' => $dev->cookies, 'query' => ['all' => '1']]));
        $m->sent = [];
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '198.51.100.79', 'cookies' => [Admin\Sessions::DEVICE_COOKIE => $device]]));
        $p->flush();
        self::assertCount(0, $m->sent, 'after sign out everywhere the device is forgotten');
    }

    public function testEveryControllerResponseCarriesEveryHeader(): void
    {
        [$p, , , $m] = $this->pages();
        $in = $this->signedIn($p, $m);
        $responses = [
            $p->loginForm(req()),
            $p->requestLink($this->post(['email' => 'x@siue.edu'])),
            $p->confirm(req(['query' => ['token' => 'bad']])),
            $p->signIn($this->post([])),
            $p->signOut($this->post([])),
            $p->signOutEverywhere($this->post([])),
            $p->hub(req()),
            $p->hub($in),
            $p->health(),
            Admin\Pages::storageDown(),
            Admin\Pages::fromStorageError(new RuntimeException('x')),
        ];
        foreach ($responses as $i => $r) {
            foreach (Admin\Headers::LIST as $name => $value) {
                self::assertSame($value, $r->headers[$name] ?? null, "response $i lacks $name");
            }
        }
    }

    public function testStorageDownRevealsNoPath(): void
    {
        self::assertStringNotContainsString('/', Admin\Pages::storageDown()->body);
    }

    public function testHealthReportsOnlyYesOrNo(): void
    {
        [$p] = $this->pages();
        self::assertSame('{"mail":"yes","db":"yes"}', $p->health()->body);
        self::assertSame('{"mail":"no","db":"no"}', Admin\Pages::healthResponse(false, false)->body);
    }

    public function testPageBodiesNeedNothingTheCspForbids(): void
    {
        [$p, , , $m] = $this->pages();
        $in = $this->signedIn($p, $m);
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu']));
        $p->flush();
        $token = $this->tokenOf($m);
        $bodies = [
            $p->loginForm(req())->body,
            $p->requestLink($this->post(['email' => 'x@siue.edu']))->body,
            $p->confirm(req(['query' => ['token' => $token]]))->body,
            $p->confirm(req(['query' => ['token' => 'bad']]))->body,
            $p->signIn($this->post([]))->body,
            $p->hub($in)->body,
        ];
        foreach ($bodies as $i => $body) {
            self::assertStringContainsString('<link rel="stylesheet" href="admin.css">', $body, "page $i");
            self::assertDoesNotMatchRegularExpression('/<style|<script|<link(?![^>]*admin\.css)|\sstyle\s*=|\son[a-z]+\s*=|javascript:/i', $body, "page $i");
        }
        self::assertFileExists(__DIR__ . '/../../admin/admin.css');
    }

    public function testCaptureMailerOnlyForLocalHosts(): void
    {
        $dir = admin_tmp_dir();
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('www.cs.siue.edu', $dir));
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('localhost.evil.com', $dir));
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('localhost:8123@evil.com', $dir));
        $local = 'http://localhost:8123/admin/';
        self::assertInstanceOf(Admin\CaptureMailer::class, admin_mailer('localhost:8123', $dir, $local, 'cli-server'));
        self::assertInstanceOf(Admin\CaptureMailer::class, admin_mailer('127.0.0.1', $dir, $local, 'fpm-fcgi'));
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('127.0.0.1', $dir, $local, 'cli'));
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('localhost', $dir, self::BASE, 'cli-server'), 'production config');
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('127.0.0.1', null, 'http://127.0.0.1/admin/', 'cli-server'));
        self::assertInstanceOf(Admin\SmtpMailer::class, admin_mailer('127.0.0.1', '', 'http://127.0.0.1/admin/', 'cli-server'));
    }

    public function testBaseUrlIsFixedUnlessLocal(): void
    {
        putenv('ADMIN_BASE_URL');
        self::assertSame('https://www.cs.siue.edu/~wgrim/admin/', admin_base_url());
        putenv('ADMIN_BASE_URL=http://127.0.0.1:18123/admin/');
        try {
            self::assertSame('http://127.0.0.1:18123/admin/', admin_base_url());
        } finally {
            putenv('ADMIN_BASE_URL');
        }
    }

    public function testAForgedLocalHostOnProductionConfigGetsNoPlainHttp(): void
    {
        $forged = req(['host' => 'localhost', 'https' => false]);
        self::assertSame(403, admin_refuse_plain_http($forged, self::BASE)?->status);
        self::assertNull(admin_refuse_plain_http(req(['https' => true]), self::BASE));
        self::assertNull(admin_refuse_plain_http($forged, 'http://localhost:8123/admin/'));
        // The mailed link follows the configured base, whatever Host said.
        [$p, , , $m] = $this->pages();
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['host' => 'localhost', 'https' => false]));
        $p->flush();
        self::assertStringContainsString(self::BASE . 'verify.php?token=', quoted_printable_decode($m->sent[0]['mime']));
    }

    public function testCookiePathComesFromTheBaseUrl(): void
    {
        self::assertSame('/~wgrim/', admin_cookie_path('https://www.cs.siue.edu/~wgrim/admin/'));
        self::assertSame('/', admin_cookie_path('http://localhost:8123/admin/'));
        [$p, , , $m] = $this->pages();
        $in = $this->signedIn($p, $m);
        $p->requestLink($this->post(['email' => 'wgrim@siue.edu'], ['ip' => '198.51.100.5']));
        $p->flush();
        $confirm = $p->confirm(req(['query' => ['token' => $this->tokenOf($m)]]));
        self::assertStringStartsWith('__Secure-admin-confirm=', $confirm->cookies[0]);
        self::assertStringContainsString('Path=/~wgrim/;', $confirm->cookies[0]);
        $out = $p->signOut($this->post(['csrf' => $this->csrfsIn($p->hub($in)->body)[0]], ['cookies' => $in->cookies]));
        self::assertStringStartsWith('__Secure-admin=;', $out->cookies[0]);
        self::assertStringContainsString('Path=/~wgrim/;', $out->cookies[0]);
    }

    public function testFailedSignInClearsTheConfirmCookie(): void
    {
        [$p] = $this->pages();
        $r = $p->signIn($this->post(['token' => 'x', 'csrf' => 'y']));
        self::assertSame(403, $r->status);
        self::assertStringStartsWith('__Secure-admin-confirm=;', $r->cookies[0]);
    }

    public function testHealthProbesMailAtMostOncePerTenMinutes(): void
    {
        $clock = new FakeClock(1_000_000);
        $calls = 0;
        $p = new Admin\Pages(admin_tmp_db(), $clock, new MemoryMailer(), self::BASE, static function () use (&$calls): bool {
            $calls++;
            return true;
        });
        for ($i = 0; $i < 100; $i++) {
            $clock->now += 5;
            self::assertSame('{"mail":"yes","db":"yes"}', $p->health()->body);
        }
        self::assertSame(1, $calls);
        $clock->now += 600;
        $p->health();
        self::assertSame(2, $calls);
    }

    public function testHealthWithADeadDatabaseProbesNothing(): void
    {
        $calls = 0;
        $dead = new class ('sqlite::memory:') extends PDO {
            public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
            {
                throw new PDOException('down');
            }
        };
        $p = new Admin\Pages($dead, new FakeClock(), new MemoryMailer(), self::BASE, static function () use (&$calls): bool {
            $calls++;
            return true;
        });
        self::assertSame('{"mail":"no","db":"no"}', $p->health()->body);
        self::assertSame(0, $calls);
    }
}
