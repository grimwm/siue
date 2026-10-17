<?php
// The two sign-in messages and the mailers: structure, escaping, and refusals before any connection.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminMailTest extends TestCase
{
    private const URL = 'https://www.cs.siue.edu/admin/verify.php?t=abc123';

    /** @return array{0:string,1:string} the text and html bodies of a multipart/alternative mime */
    private function parts(string $mime): array
    {
        self::assertMatchesRegularExpression('/^MIME-Version: 1\.0\r\n/', $mime);
        self::assertSame(1, preg_match('/^Content-Type: multipart\/alternative; boundary="([^"]+)"\r\n/m', $mime, $m));
        $chunks = explode('--' . $m[1], $mime);
        // preamble (the headers), two parts, closing "--\r\n"
        self::assertCount(4, $chunks);
        self::assertStringStartsWith("--\r\n", $chunks[3]);
        self::assertStringContainsString('Content-Type: text/plain', $chunks[1]);
        self::assertStringContainsString('Content-Type: text/html', $chunks[2]);
        $decode = static function (string $chunk): string {
            self::assertStringContainsString('Content-Transfer-Encoding: quoted-printable', $chunk);
            $body = substr($chunk, strpos($chunk, "\r\n\r\n") + 4);
            return quoted_printable_decode(substr($body, 0, -2));
        };
        return [$decode($chunks[1]), $decode($chunks[2])];
    }

    public function testLinkMessage(): void
    {
        $m = Admin\MailTemplate::link(self::URL, 15);
        self::assertSame('Your sign-in link', $m['subject']);
        [$text, $html] = $this->parts($m['mime']);
        self::assertSame(1, substr_count($text, self::URL));
        self::assertSame(1, substr_count($html, htmlspecialchars(self::URL, ENT_QUOTES)));
        foreach ([$text, $html] as $p) {
            self::assertStringContainsString('15 minutes', $p);
            self::assertStringContainsString('If you did not ask for this, ignore it.', $p);
        }
        self::assertStringContainsString('Good for 15 minutes, once.', $html);
        self::assertStringContainsString('Sign in', $html);
        self::assertStringContainsString(Admin\MailTemplate::RED, $html);
        self::assertStringContainsString(Admin\MailTemplate::CARD, $html);
        self::assertStringContainsString('<meta name="color-scheme" content="light">', $html);
        self::assertStringNotContainsString('#0d0f12', $html, 'no dark design for clients to grey out');
        self::assertStringNotContainsString('<img', $html);
    }

    public function testNoLineExceedsTheSmtpLimitAndTheLinkSurvives(): void
    {
        $url = 'https://www.cs.siue.edu/admin/verify.php?t=' . str_repeat('ab', 32);
        foreach ([Admin\MailTemplate::link($url, 15), Admin\MailTemplate::notice(1_700_000_000, '1.2.3.4', str_repeat('é', 300), $url)] as $m) {
            $full = Admin\SmtpMailer::data('wgrim@siue.edu', 'wgrim@siue.edu', $m['subject'], $m['mime'], 1);
            foreach (explode("\r\n", $full) as $line) {
                self::assertLessThanOrEqual(998, strlen($line));
                if (preg_match('/^(Message-ID|Content-Type):/', $line) !== 1) {
                    self::assertLessThanOrEqual(76, strlen($line));
                }
            }
            [$text, $html] = $this->parts($m['mime']);
            self::assertSame(1, substr_count($text, $url));
            self::assertStringContainsString('href="' . $url . '"', $html);
        }
    }

    public function testMinutesArePluralisedAndInvalidUtf8IsScrubbed(): void
    {
        [$text] = $this->parts(Admin\MailTemplate::link('https://h.example/', 1)['mime']);
        self::assertStringContainsString('Good for 1 minute, once.', $text);
        $m = Admin\MailTemplate::notice(1_700_000_000, '1.2.3.4', "bad\xff agent", 'https://h.example/');
        [$t, $h] = $this->parts($m['mime']);
        self::assertTrue(mb_check_encoding($t, 'UTF-8'));
        self::assertStringContainsString('agent', $h);
    }

    /** @return resource */
    private function stream(string $replies)
    {
        $fp = fopen('php://memory', 'w+');
        fwrite($fp, $replies);
        rewind($fp);
        return $fp;
    }

    public function testExpectReadsMultiLineAndBareCodes(): void
    {
        Admin\SmtpMailer::expect($this->stream("250-smtp.example\r\n250-8BITMIME\r\n250 OK\r\n"), '2');
        Admin\SmtpMailer::expect($this->stream("354\r\n"), '3');
        Admin\SmtpMailer::expect($this->stream("250"), '2');
        $this->addToAssertionCount(1);
    }

    public function testExpectThrowsOnErrorsAndEof(): void
    {
        foreach (["450 try later\r\n", "550-no\r\n550 no such user\r\n", "250 OK\r\n"] as $i => $replies) {
            try {
                Admin\SmtpMailer::expect($this->stream($replies), $i === 2 ? '3' : '2');
                self::fail('expected an error');
            } catch (RuntimeException $e) {
                self::assertStringContainsString('SMTP error', $e->getMessage());
            }
        }
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('no reply');
        Admin\SmtpMailer::expect($this->stream(''), '2');
    }

    public function testSmtpRefusesNonAsciiSubjectBeforeConnecting(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('ASCII');
        (new Admin\SmtpMailer('127.0.0.1', 1))->send('wgrim@siue.edu', "Caf\u{e9}", 'MIME-Version: 1.0');
    }

    public function testCaptureRefusesOtherRecipientsAndFailedWrites(): void
    {
        $dir = admin_tmp_dir();
        try {
            (new Admin\CaptureMailer($dir))->send('x@siue.edu', 'Hi', 'm');
            self::fail('expected a refusal');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('recipient', $e->getMessage());
        }
        self::assertSame([], glob($dir . '/*.eml'));
        $this->expectException(RuntimeException::class);
        (new Admin\CaptureMailer($dir . '/missing'))->send('wgrim@siue.edu', 'Hi', 'm');
    }

    public function testNoticeMessageEscapesTheAgent(): void
    {
        $hub = 'https://www.cs.siue.edu/admin/';
        $m = Admin\MailTemplate::notice(1_700_000_000, '203.0.113.9', '<script>alert(1)</script>', $hub);
        self::assertSame('New sign-in to your admin pages', $m['subject']);
        [$text, $html] = $this->parts($m['mime']);
        self::assertStringContainsString('&lt;script&gt;alert(1)&lt;/script&gt;', $html);
        self::assertStringNotContainsString('<script>', $html);
        self::assertStringContainsString('Tue 14 Nov 2023, 4:13 PM CST', $text);
        self::assertStringContainsString('Tue 14 Nov 2023, 4:13 PM CST', $html);
        foreach ([$text, $html] as $p) {
            self::assertStringContainsString('203.0.113.9', $p);
            self::assertSame(1, substr_count($p, $hub));
        }
        self::assertStringContainsString('sign in and press Sign out everywhere', $html);
        self::assertStringContainsString('sign in, then sign out everywhere', $text);
    }

    public function testAgentIsTrimmedTo120Characters(): void
    {
        $m = Admin\MailTemplate::notice(1_700_000_000, '1.2.3.4', str_repeat('a', 300), 'https://h.example/');
        [$text] = $this->parts($m['mime']);
        self::assertStringContainsString(str_repeat('a', 120), $text);
        self::assertStringNotContainsString(str_repeat('a', 121), $text);
    }

    public function testAgentCannotBreakTheTextPart(): void
    {
        $m = Admin\MailTemplate::notice(1_700_000_000, '1.2.3.4', "x\r\n--evil\r\nBcc: a@b.c", 'https://h.example/');
        $this->parts($m['mime']);
        self::assertStringNotContainsString("\r\n--evil", $m['mime']);
        self::assertStringNotContainsString("\r\nBcc:", $m['mime']);
    }

    public function testSmtpRefusesOtherRecipientsBeforeConnecting(): void
    {
        $mailer = new Admin\SmtpMailer('127.0.0.1', 1);
        try {
            $mailer->send('x@siue.edu', 'Hello', 'MIME-Version: 1.0');
            self::fail('expected a refusal');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('recipient', $e->getMessage());
            self::assertStringNotContainsString('connect', $e->getMessage());
        }
    }

    public function testSmtpRefusesHeaderInjectionBeforeConnecting(): void
    {
        $mailer = new Admin\SmtpMailer('127.0.0.1', 1);
        try {
            $mailer->send('wgrim@siue.edu', "Hi\r\nBcc: x@y.z", 'MIME-Version: 1.0');
            self::fail('expected a refusal');
        } catch (RuntimeException $e) {
            self::assertStringContainsString('header', $e->getMessage());
        }
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('header');
        (new Admin\SmtpMailer('127.0.0.1', 1, "a@b.c\r\nBcc: x@y.z"))->send('wgrim@siue.edu', 'Hi', 'MIME-Version: 1.0');
    }

    public function testSmtpMessageHasHeadersAndDotStuffing(): void
    {
        $data = Admin\SmtpMailer::data('wgrim@siue.edu', 'wgrim@siue.edu', 'Hi', "MIME-Version: 1.0\r\n\r\n.dot\r\nline", 1_700_000_000);
        self::assertStringStartsWith("From: wgrim@siue.edu\r\nTo: wgrim@siue.edu\r\nSubject: Hi\r\nDate: Tue, 14 Nov 2023 22:13:20 +0000\r\n", $data);
        self::assertMatchesRegularExpression('/\r\nMessage-ID: <[0-9a-f]{32}@siue\.edu>\r\n/', $data);
        self::assertStringContainsString("\r\n..dot\r\n", Admin\SmtpMailer::stuff($data));
        self::assertNotSame(
            Admin\SmtpMailer::data('a@siue.edu', 'b@siue.edu', 'Hi', 'm', 1),
            Admin\SmtpMailer::data('a@siue.edu', 'b@siue.edu', 'Hi', 'm', 1),
        );
    }

    public function testCaptureWritesOneEml(): void
    {
        $dir = admin_tmp_dir();
        (new Admin\CaptureMailer($dir))->send('wgrim@siue.edu', 'Hi', "MIME-Version: 1.0\r\n\r\nbody");
        $files = glob($dir . '/*.eml');
        self::assertCount(1, $files);
        $eml = file_get_contents($files[0]);
        self::assertStringContainsString('To: wgrim@siue.edu', $eml);
        self::assertStringContainsString('Subject: Hi', $eml);
    }

    /** WCAG contrast ratio of two #rrggbb colours. */
    private static function contrast(string $a, string $b): float
    {
        $lum = static function (string $hex): float {
            $c = array_map(static fn (string $h): float => hexdec($h) / 255, str_split(ltrim($hex, '#'), 2));
            $c = array_map(static fn (float $v): float => $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4, $c);
            return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
        };
        [$hi, $lo] = [max($lum($a), $lum($b)), min($lum($a), $lum($b))];
        return ($hi + 0.05) / ($lo + 0.05);
    }

    public function testEveryTextColourIsClearlyLegible(): void
    {
        self::assertGreaterThanOrEqual(7.0, self::contrast(Admin\MailTemplate::TEXT, Admin\MailTemplate::CARD), 'body text');
        self::assertGreaterThanOrEqual(4.5, self::contrast(Admin\MailTemplate::MUTED, Admin\MailTemplate::CARD), 'muted text');
        self::assertGreaterThanOrEqual(4.5, self::contrast('#ffffff', Admin\MailTemplate::RED), 'button label');
        self::assertGreaterThanOrEqual(4.5, self::contrast(Admin\MailTemplate::RED, Admin\MailTemplate::CARD), 'red label');
    }
}
