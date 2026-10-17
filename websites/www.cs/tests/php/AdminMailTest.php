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
        return [$chunks[1], $chunks[2]];
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
        self::assertStringContainsString('#e02020', $html);
        self::assertStringContainsString('#0d0f12', $html);
        self::assertStringContainsString('<meta name="color-scheme" content="dark">', $html);
        self::assertStringNotContainsString('<img', $html);
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
        self::assertStringContainsString('Sign out everywhere', $html);
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
}
