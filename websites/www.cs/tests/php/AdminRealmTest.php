<?php
// Sign-in realms: the admin realm admits named admins only, the studio realm any plain @siue.edu address.
// Each realm keeps its own cookies, links, devices and sessions, and neither opens the other.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class RealmMemoryMailer implements Admin\Mailer
{
    /** @var list<array{to:string,subject:string,mime:string}> */
    public array $sent = [];

    public function send(string $to, string $subject, string $mime): void
    {
        $this->sent[] = ['to' => $to, 'subject' => $subject, 'mime' => $mime];
    }
}

final class AdminRealmTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';
    private const CAMPUS_IP = '146.163.1.1';
    /** Review Focus 5: each gets the generic reply, no link, and no mail. */
    private const VARIANTS = ['a@mail.siue.edu', 'a@siue.edu.evil.test', 'a+b@siue.edu', "a@siue.edu\r\nBcc: x"];

    private static function people(): Admin\People
    {
        $p = Admin\People::fromJson('{"people":[{"email":"helper@siue.edu","admin":false,"allowance":true},{"email":"deputy@siue.edu","admin":true}]}');
        self::assertNotNull($p);
        return $p;
    }

    private static function adminRealm(): Admin\Realm
    {
        return Admin\Realm::admin(self::people(), self::BASE);
    }

    private static function studioRealm(): Admin\Realm
    {
        return Admin\Realm::studio(self::BASE);
    }

    /** An account row for $email, as Music\Accounts makes it; its id. */
    private static function account(PDO $db, string $email): int
    {
        $db->prepare('INSERT OR IGNORE INTO accounts (email, created_at) VALUES (?, 1)')->execute([$email]);
        $st = $db->prepare('SELECT id FROM accounts WHERE email = ?');
        $st->execute([$email]);
        return (int) $st->fetchColumn();
    }

    /** @return array{0:Admin\SignIn,1:PDO,2:FakeClock,3:RealmMemoryMailer} */
    private function signIn(Admin\Realm $realm, ?PDO $db = null): array
    {
        $db ??= admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $mailer = new RealmMemoryMailer();
        $on = $realm->name === 'studio' ? static fn(string $email): int => self::account($db, $email) : null;
        return [new Admin\SignIn($db, $clock, $mailer, $realm, $on), $db, $clock, $mailer];
    }

    private static function post(array $post, array $with = []): Admin\Request
    {
        return req($with + ['method' => 'POST', 'post' => $post]);
    }

    private static function cookieValue(Admin\Response $r, string $name): ?string
    {
        foreach ($r->cookies as $c) {
            if (str_starts_with($c, $name . '=')) {
                return explode(';', substr($c, strlen($name) + 1))[0];
            }
        }
        return null;
    }

    /** The token in the newest mail. */
    private static function lastToken(RealmMemoryMailer $m, string $base): string
    {
        $mime = quoted_printable_decode($m->sent[count($m->sent) - 1]['mime']);
        self::assertSame(1, preg_match('~' . preg_quote($base, '~') . 'verify\.php\?token=([0-9a-f]{64})~', $mime, $found));
        return $found[1];
    }

    /** Signs $email in through the whole studio flow; the session id and the device token. */
    private function studioSignedIn(Admin\SignIn $s, RealmMemoryMailer $m, string $email): array
    {
        $reply = $s->requestLink(self::post(['email' => $email], ['ip' => '198.51.100.' . strlen($email)]));
        $s->flush();
        $mark = self::cookieValue($reply, '__Secure-studio-pending');
        $token = self::lastToken($m, self::studioRealm()->baseUrl);
        $done = $s->confirm(req(['query' => ['token' => $token], 'cookies' => ['__Secure-studio-pending' => $mark]]));
        self::assertSame(200, $done->status);
        $id = self::cookieValue($done, '__Secure-studio');
        $device = self::cookieValue($done, '__Secure-studio-device');
        self::assertNotNull($id);
        self::assertNotNull($device);
        return [$id, $device];
    }

    public function testTheAdminSignInIssuesLinksOnlyToNamedAdmins(): void
    {
        [$s, $db, , $m] = $this->signIn(self::adminRealm());
        $replies = [];
        foreach (['helper@siue.edu', 'student@siue.edu', 'wgrim@siue.edu', ' Deputy@SIUE.edu '] as $email) {
            $replies[] = $s->requestLink(self::post(['email' => $email]))->body;
        }
        self::assertCount(1, array_unique($replies), 'one generic reply for everyone');
        $s->flush();
        self::assertSame(['deputy@siue.edu', 'wgrim@siue.edu'], $db->query('SELECT email FROM links ORDER BY email')->fetchAll(PDO::FETCH_COLUMN));
        self::assertSame(['wgrim@siue.edu', 'deputy@siue.edu'], array_column($m->sent, 'to'));
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM studio_links')->fetchColumn());

        $auth = new Admin\Auth($db, new FakeClock(), self::adminRealm());
        self::assertFalse($auth->allowed('helper@siue.edu'), 'the allowance alone is not admin');
        self::assertFalse($auth->allowed('student@siue.edu'));
        self::assertTrue($auth->allowed('deputy@siue.edu'));

        // The notice goes to the admin who signed in.
        $m->sent = [];
        $s->requestLink(self::post(['email' => 'deputy@siue.edu']));
        $s->flush();
        $token = self::lastToken($m, self::BASE);
        $confirm = $s->confirm(req(['query' => ['token' => $token]]));
        $mark = self::cookieValue($confirm, '__Secure-admin-confirm');
        $done = $s->signIn(self::post(['token' => $token, 'csrf' => $mark], ['cookies' => ['__Secure-admin-confirm' => $mark]]));
        self::assertSame(303, $done->status);
        $s->flush();
        self::assertSame('New sign-in to your admin pages', $m->sent[1]['subject']);
        self::assertSame('deputy@siue.edu', $m->sent[1]['to']);
    }

    public function testTheStudioSignInTakesAnySiueAddress(): void
    {
        [$s, $db, , $m] = $this->signIn(self::studioRealm());
        $good = $s->requestLink(self::post(['email' => 'student@siue.edu']));
        $bad = $s->requestLink(self::post(['email' => 'student@example.com']));
        self::assertSame($good->body, $bad->body);
        $s->flush();
        self::assertSame(['student@siue.edu'], array_column($m->sent, 'to'));
        self::assertStringContainsString('https://www.cs.siue.edu/~wgrim/music/verify.php?token=', quoted_printable_decode($m->sent[0]['mime']));
        self::assertSame(['student@siue.edu'], $db->query('SELECT email FROM studio_links')->fetchAll(PDO::FETCH_COLUMN));
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM links')->fetchColumn(), 'nothing lands in the admin tables');

        [$id] = $this->studioSignedIn($s, $m, 'other.student@siue.edu');
        $sessions = new Admin\Sessions($db, new FakeClock(1_000_000), self::studioRealm());
        self::assertSame(self::account($db, 'other.student@siue.edu'), $sessions->account(req(['cookies' => ['__Secure-studio' => $id]])));
    }

    public function testAddressVariantsAreRefusedAlike(): void
    {
        foreach ([self::studioRealm(), self::adminRealm()] as $realm) {
            [$s, $db, , $m] = $this->signIn($realm);
            $generic = $s->requestLink(self::post(['email' => 'nobody@example.com']))->body;
            $auth = new Admin\Auth($db, new FakeClock(), $realm);
            foreach (self::VARIANTS as $v) {
                self::assertFalse($auth->allowed($v), $realm->name . ': ' . $v);
                self::assertSame($generic, $s->requestLink(self::post(['email' => $v]))->body, $v);
                self::assertNull($auth->requestLink($v, '192.0.2.1'), $v);
            }
            $s->flush();
            self::assertSame([], $m->sent);
            self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM ' . $realm->tables . 'links')->fetchColumn());
            self::assertSame([''], array_values(array_unique($db->query('SELECT email FROM ' . $realm->tables . 'link_requests')->fetchAll(PDO::FETCH_COLUMN))), 'what a refused stranger typed is never stored');
        }
    }

    public function testCaseAndSpacesMapToOneAddress(): void
    {
        [$s, $db, , $m] = $this->signIn(self::studioRealm());
        $a = new Admin\Auth($db, new FakeClock(1_000_000), self::studioRealm());
        $t1 = $a->requestLink('  Student@SIUE.EDU ', '192.0.2.1');
        $t2 = $a->requestLink('student@siue.edu', '192.0.2.2');
        $t3 = $a->requestLink('STUDENT@siue.edu', '192.0.2.3');
        self::assertNotNull($t1);
        self::assertSame('student@siue.edu', $a->peek((string) $t1));
        self::assertSame('student@siue.edu', $a->peek((string) $t2));
        self::assertNotNull($t3);
        self::assertNull($a->requestLink(' student@siue.edu', '192.0.2.4'), 'three links an hour for the one address, however it is typed');

        [$id] = $this->studioSignedIn($s, $m, ' Second@Siue.Edu');
        self::assertSame('second@siue.edu', $m->sent[0]['to']);
        self::assertSame(['second@siue.edu'], $db->query('SELECT email FROM accounts')->fetchAll(PDO::FETCH_COLUMN), 'the account is made for the normal form');
        $sessions = new Admin\Sessions($db, new FakeClock(1_000_000), self::studioRealm());
        self::assertSame(self::account($db, 'second@siue.edu'), $sessions->account(req(['cookies' => ['__Secure-studio' => $id]])));
    }

    public function testFortyStudentsBehindOneIpAllGetLinks(): void
    {
        $a = new Admin\Auth(admin_tmp_db(), new FakeClock(1_000_000), self::studioRealm());
        for ($i = 0; $i < 40; $i++) {
            self::assertNotNull($a->requestLink("student$i@siue.edu", self::CAMPUS_IP), "student $i");
        }
    }

    public function testTheHundredAndFirstFromOneIpGetsNone(): void
    {
        $db = admin_tmp_db();
        $a = new Admin\Auth($db, new FakeClock(1_000_000), self::studioRealm());
        for ($i = 0; $i < 100; $i++) {
            self::assertNotNull($a->requestLink("student$i@siue.edu", self::CAMPUS_IP), "student $i");
        }
        self::assertNull($a->requestLink('student100@siue.edu', self::CAMPUS_IP));
        self::assertSame(100, (int) $db->query('SELECT COUNT(*) FROM studio_links')->fetchColumn());
        self::assertSame(100, (int) $db->query('SELECT COUNT(*) FROM studio_link_requests')->fetchColumn());
        self::assertNotNull($a->requestLink('student100@siue.edu', '146.163.1.2'), 'another address of the campus still gets one');
    }

    public function testAStudioLinkNeverOpensAnAdminSessionAndBack(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_000_000);
        $admin = new Admin\Auth($db, $clock, self::adminRealm());
        $studio = new Admin\Auth($db, $clock, self::studioRealm());

        $st = (string) $studio->requestLink('wgrim@siue.edu', '192.0.2.1');
        self::assertNull($admin->peek($st));
        self::assertNull($admin->consume($st));
        self::assertSame('wgrim@siue.edu', $studio->peek($st), 'the admin realm did not spend it');
        [$adminPages] = $this->signIn(self::adminRealm(), $db);
        self::assertSame(403, $adminPages->confirm(req(['query' => ['token' => $st]]))->status);

        $at = (string) $admin->requestLink('wgrim@siue.edu', '192.0.2.1');
        self::assertNull($studio->peek($at));
        self::assertNull($studio->consume($at));
        self::assertSame('wgrim@siue.edu', $admin->consume($at));
        $at2 = (string) $admin->requestLink('wgrim@siue.edu', '192.0.2.2');
        [$studioPages] = $this->signIn(self::studioRealm(), $db);
        self::assertSame(403, $studioPages->confirm(req(['query' => ['token' => $at2]]))->status);
        self::assertSame('wgrim@siue.edu', $admin->peek($at2));

        // Session ids and devices do not cross either.
        $owner = self::account($db, 'wgrim@siue.edu');
        $adminSessions = new Admin\Sessions($db, $clock, self::adminRealm());
        $studioSessions = new Admin\Sessions($db, $clock, self::studioRealm());
        $sid = explode(';', substr($studioSessions->start(req(), $owner), strlen('__Secure-studio=')))[0];
        $aid = explode(';', substr($adminSessions->start(req()), strlen('__Secure-admin=')))[0];
        self::assertFalse($adminSessions->current(req(['cookies' => ['__Secure-admin' => $sid]])));
        self::assertFalse($studioSessions->current(req(['cookies' => ['__Secure-studio' => $aid]])));
        self::assertNull($studioSessions->account(req(['cookies' => ['__Secure-studio' => $aid]])));
        self::assertTrue($adminSessions->current(req(['cookies' => ['__Secure-admin' => $aid]])));
        self::assertSame($owner, $studioSessions->account(req(['cookies' => ['__Secure-studio' => $sid]])));
        self::assertFalse($studioSessions->current(req(['cookies' => ['__Secure-admin' => $sid]])), 'the studio reads only its own cookie');

        $sdev = $studio->issueDevice($owner);
        $adev = $admin->issueDevice();
        self::assertFalse($admin->isTrustedDevice($sdev));
        self::assertFalse($studio->isTrustedDevice($adev, $owner));
        self::assertTrue($studio->isTrustedDevice($sdev, $owner));
        self::assertFalse($studio->isTrustedDevice($sdev, $owner + 1), 'a studio device vouches only for its own account');
        self::assertFalse($studio->isTrustedDevice($sdev), 'and never without one');
    }

    public function testStudioCookiesCarryTheMusicPath(): void
    {
        $realm = self::studioRealm();
        self::assertSame('studio', $realm->name);
        self::assertSame('https://www.cs.siue.edu/~wgrim/music/', $realm->baseUrl);
        self::assertSame('/~wgrim/music/', $realm->cookiePath);
        self::assertSame('__Secure-studio', $realm->cookie);
        self::assertSame('studio_', $realm->tables);
        self::assertSame(['global' => 300, 'ip' => 100, 'address' => 3, 'rows' => 3000], $realm->limits);
        $admin = self::adminRealm();
        self::assertSame(['admin', self::BASE, '/~wgrim/', '__Secure-admin', ''], [$admin->name, $admin->baseUrl, $admin->cookiePath, $admin->cookie, $admin->tables]);
        self::assertSame(['global' => 30, 'ip' => 20, 'address' => 3, 'rows' => 1000], $admin->limits);

        $local = Admin\Realm::studio('http://localhost/admin/');
        self::assertSame(['http://localhost/music/', '/music/'], [$local->baseUrl, $local->cookiePath]);

        $db = admin_tmp_db();
        $start = (new Admin\Sessions($db, new FakeClock(), $realm))->start(req(), self::account($db, 'student@siue.edu'));
        self::assertMatchesRegularExpression('/^__Secure-studio=[0-9a-f]{64}; Max-Age=2592000; Path=\/~wgrim\/music\/; Secure; HttpOnly; SameSite=Strict$/D', $start);

        [$s, , , $m] = $this->signIn($realm, $db);
        $reply = $s->requestLink(self::post(['email' => 'student@siue.edu']));
        self::assertNotEmpty($reply->cookies);
        foreach ($reply->cookies as $c) {
            self::assertStringStartsWith('__Secure-studio-pending=', $c);
            self::assertStringContainsString('; Path=/~wgrim/music/; Secure; HttpOnly; SameSite=Lax', $c);
        }
        $s->flush();
        $confirm = $s->confirm(req(['query' => ['token' => self::lastToken($m, $realm->baseUrl)]]));
        self::assertStringStartsWith('__Secure-studio-confirm=', $confirm->cookies[0]);
        self::assertStringContainsString('; Path=/~wgrim/music/; Secure', $confirm->cookies[0]);
        self::assertStringContainsString('href="../admin/admin.css"', $confirm->body);
    }

    public function testTheMailerRefusesNonSiueRecipients(): void
    {
        $dir = admin_tmp_dir();
        foreach ([...self::VARIANTS, 'x@example.com', ''] as $bad) {
            foreach ([new Admin\CaptureMailer($dir), new Admin\SmtpMailer('127.0.0.1', 1)] as $mailer) {
                try {
                    $mailer->send($bad, 'Hi', 'MIME-Version: 1.0');
                    self::fail('expected a refusal for ' . $bad);
                } catch (RuntimeException $e) {
                    self::assertStringContainsString('recipient', $e->getMessage(), $bad);
                }
            }
        }
        self::assertSame([], glob($dir . '/*.eml'));
        (new Admin\CaptureMailer($dir))->send('  Student@SIUE.EDU ', 'Hi', "MIME-Version: 1.0\r\n\r\nbody");
        $eml = (string) file_get_contents(glob($dir . '/*.eml')[0]);
        self::assertStringStartsWith("From: wgrim@siue.edu\r\nTo: student@siue.edu\r\n", $eml);
    }

    public function testSignOutEverywhereInTheStudioEndsOnlyThatAccount(): void
    {
        [$s, $db, $clock, $m] = $this->signIn(self::studioRealm());
        [$aId, $aDev] = $this->studioSignedIn($s, $m, 'alice@siue.edu');
        [$aOther] = $this->studioSignedIn($s, $m, 'alice@siue.edu');
        [$bId, $bDev] = $this->studioSignedIn($s, $m, 'bob@siue.edu');
        $s->flush();
        $notices = array_filter($m->sent, static fn(array $x): bool => !str_contains(quoted_printable_decode($x['mime']), 'verify.php?token='));
        self::assertSame(['alice@siue.edu', 'alice@siue.edu', 'bob@siue.edu'], array_column($notices, 'to'), 'each notice goes to the person who signed in');
        $auth = new Admin\Auth($db, $clock, self::studioRealm());
        $alice = self::account($db, 'alice@siue.edu');
        $bob = self::account($db, 'bob@siue.edu');
        $aPending = (string) $auth->requestLink('alice@siue.edu', '192.0.2.50');
        $bPending = (string) $auth->requestLink('bob@siue.edu', '192.0.2.51');

        $sessions = new Admin\Sessions($db, $clock, self::studioRealm());
        $as = req(['cookies' => ['__Secure-studio' => $aId]]);
        $csrf = $sessions->csrf($as);
        $out = $s->signOutEverywhere(self::post(['csrf' => $csrf], ['cookies' => ['__Secure-studio' => $aId]]));
        self::assertSame(303, $out->status);
        self::assertSame('login.php', $out->headers['Location']);
        self::assertContains('__Secure-studio-device=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/~wgrim/music/; Secure; HttpOnly; SameSite=Strict', $out->cookies);

        self::assertNull($sessions->account($as));
        self::assertNull($sessions->account(req(['cookies' => ['__Secure-studio' => $aOther]])), 'every session of that account');
        self::assertSame($bob, $sessions->account(req(['cookies' => ['__Secure-studio' => $bId]])), 'another account keeps its session');
        self::assertFalse($auth->isTrustedDevice($aDev, $alice));
        self::assertTrue($auth->isTrustedDevice($bDev, $bob));
        self::assertNull($auth->peek($aPending));
        self::assertSame('bob@siue.edu', $auth->peek($bPending));
    }
}
