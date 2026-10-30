<?php
// The studio's sign-in: any plain @siue.edu address signs in through a mailed link and gets an account, a full
// studio is told only after the link is spent, and the realm refuses a wiring that would fail after the link.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class StudioSignInTest extends TestCase
{
    private const ADMIN = 'https://www.cs.siue.edu/~wgrim/admin/';
    private const STUDIO = 'https://www.cs.siue.edu/~wgrim/music/';

    /** @return array{0:Admin\SignIn,1:PDO,2:MemoryMailer} */
    private function flow(string $people = '{}'): array
    {
        $db = admin_tmp_db();
        $mailer = new MemoryMailer();
        $realm = Admin\Realm::studio(self::ADMIN);
        $s = studio_sign_in($db, new FakeClock(1_800_000_000), $mailer, $realm, Admin\People::fromJson($people));
        return [$s, $db, $mailer];
    }

    private static function cookie(Admin\Response $r, string $name): ?string
    {
        foreach ($r->cookies as $c) {
            if (str_starts_with($c, $name . '=')) {
                return explode(';', substr($c, strlen($name) + 1))[0];
            }
        }
        return null;
    }

    /** Requests a link for $email, opens it in the asking browser, presses the button and sends the mail; the final reply.
     * The mailer then holds the link and, after a sign-in, the notice. */
    private function signIn(Admin\SignIn $s, MemoryMailer $m, string $email, string $ip = '203.0.113.9'): Admin\Response
    {
        $m->sent = [];
        $asked = $s->requestLink(req(['method' => 'POST', 'post' => ['email' => $email], 'ip' => $ip]));
        $s->flush();
        self::assertCount(1, $m->sent, 'one link mailed');
        self::assertSame(1, preg_match('~verify\.php\?token=([0-9a-f]{64})~', quoted_printable_decode($m->sent[0]['mime']), $f));
        $token = $f[1];
        $page = $s->confirm(req(['query' => ['token' => $token]]));
        $mark = self::cookie($page, '__Secure-studio-confirm');
        self::assertNotNull($mark);
        $done = $s->signIn(req(['method' => 'POST', 'ip' => $ip, 'post' => ['token' => $token, 'csrf' => $mark], 'cookies' => ['__Secure-studio-confirm' => $mark]]));
        $s->flush();
        return $done;
    }

    public function testAStudentSignsInAndHasAnAccount(): void
    {
        [$s, $db, $m] = $this->flow();
        $done = $this->signIn($s, $m, 'student@siue.edu');
        self::assertSame(303, $done->status);
        self::assertSame('index.php', $done->headers['Location']);
        $id = self::cookie($done, '__Secure-studio');
        self::assertNotNull($id);
        $account = (int) $db->query("SELECT id FROM accounts WHERE email = 'student@siue.edu'")->fetchColumn();
        self::assertGreaterThan(0, $account);
        $sessions = new Admin\Sessions($db, new FakeClock(1_800_000_000), Admin\Realm::studio(self::ADMIN));
        self::assertSame($account, $sessions->account(req(['cookies' => ['__Secure-studio' => $id]])));
    }

    public function testTheSecondSignInReusesTheAccount(): void
    {
        [$s, $db, $m] = $this->flow();
        $this->signIn($s, $m, 'student@siue.edu');
        $this->signIn($s, $m, 'student@siue.edu', '203.0.113.10');
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM accounts')->fetchColumn());
    }

    public function testANewSignUpWhenFullSeesTheStudioIsFullAndGetsNoSession(): void
    {
        [$s, $db, $m] = $this->flow('{"max_accounts": 1}');
        $this->signIn($s, $m, 'first@siue.edu');
        $done = $this->signIn($s, $m, 'second@siue.edu', '203.0.113.10');
        self::assertSame(200, $done->status);
        self::assertStringContainsString('<title>The studio is full', $done->body);
        self::assertStringContainsString('The studio has no room for new people right now. Ask Will Grim, who runs it.', $done->body);
        self::assertNull(self::cookie($done, '__Secure-studio'));
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM accounts')->fetchColumn());
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM studio_sessions')->fetchColumn(), 'only the first person has a session');
        self::assertCount(1, $m->sent, 'the link only: no sign-in notice for a refused sign-in');
    }

    public function testTheFullPageIsShownOnlyAfterTheLinkSoTheReplyStaysGeneric(): void
    {
        [$s, , $m] = $this->flow('{"max_accounts": 1}');
        $this->signIn($s, $m, 'first@siue.edu');
        $m->sent = [];
        $replies = [];
        foreach (['first@siue.edu', 'second@siue.edu', 'stranger@example.com'] as $email) {
            $replies[] = $s->requestLink(req(['method' => 'POST', 'post' => ['email' => $email], 'ip' => '203.0.113.50']));
        }
        self::assertSame($replies[0]->status, $replies[1]->status);
        self::assertSame($replies[0]->body, $replies[1]->body);
        self::assertSame($replies[0]->body, $replies[2]->body);
        self::assertStringNotContainsString('full', strtolower($replies[1]->body));
        $s->flush();
        self::assertCount(2, $m->sent, 'the full studio still mails the new address a link');
    }

    public function testTheNoticeGoesToThePersonWhoSignedIn(): void
    {
        [$s, , $m] = $this->flow();
        $this->signIn($s, $m, 'student@siue.edu');
        self::assertCount(2, $m->sent);
        $notice = $m->sent[1];
        self::assertSame('student@siue.edu', $notice['to']);
        self::assertSame('New sign-in to your music studio', $notice['subject']);
        $mime = quoted_printable_decode($notice['mime']);
        self::assertStringContainsString(self::STUDIO . 'index.php', $mime);
        self::assertStringNotContainsString('admin pages', $mime);
    }

    public function testNextStaysInsideTheStudio(): void
    {
        foreach (['../admin/', '../admin/index.php', 'https://evil.test/', '//evil.test', 'keys.php', 'studio.php/../x'] as $bad) {
            self::assertSame('', Admin\SignIn::safeNext($bad, 'studio'), $bad);
        }
        foreach (['index.php', 'studio.php', 'piece.php?id=a-b&v=2'] as $good) {
            self::assertSame($good, Admin\SignIn::safeNext($good, 'studio'), $good);
        }
        self::assertSame('', Admin\SignIn::safeNext('piece.php?id=1', 'admin'));
    }

    public function testAStudioRealmWithoutItsSignedInStepIsRefusedAtConstruction(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new Admin\SignIn(admin_tmp_db(), new FakeClock(), new MemoryMailer(), Admin\Realm::studio(self::ADMIN));
    }

    public function testASignedInStepThatAnswersNullStartsNoSessionInTheStudio(): void
    {
        $db = admin_tmp_db();
        $m = new MemoryMailer();
        $s = new Admin\SignIn($db, new FakeClock(1_800_000_000), $m, Admin\Realm::studio(self::ADMIN), static fn(string $e): ?int => null);
        $done = $this->signIn($s, $m, 'student@siue.edu');
        self::assertNull(self::cookie($done, '__Secure-studio'));
        self::assertSame(200, $done->status);
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM studio_sessions')->fetchColumn());
    }
}
