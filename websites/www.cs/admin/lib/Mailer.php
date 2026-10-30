<?php
// Outgoing mail, from the owner's address to plain @siue.edu addresses only (Address::studio): an SMTP
// client over implicit TLS, and a capture mailer that writes each message to a file. Message bodies are never logged.
declare(strict_types=1);

namespace Admin;

interface Mailer
{
    /**
     * Sends one message; $mime carries its own MIME-Version and Content-Type headers.
     * Throws \RuntimeException on failure.
     */
    public function send(string $to, string $subject, string $mime): void;
}

final class SmtpMailer implements Mailer
{
    public function __construct(
        private string $host = 'smtp.siue.edu',
        private int $port = 465,
        private string $from = Auth::OWNER,
        private int $timeout = 20,
    ) {
    }

    public function send(string $to, string $subject, string $mime): void
    {
        // Every refusal happens before a socket is opened.
        $to = Address::studio($to) ?? throw new \RuntimeException('refused: recipient not allowed');
        self::assertSingleLine($to, $this->from, $subject);
        $data = self::stuff(self::data($this->from, $to, $subject, $mime, time()));

        $fp = @stream_socket_client(
            "ssl://{$this->host}:{$this->port}",
            $errno,
            $errstr,
            $this->timeout,
            STREAM_CLIENT_CONNECT,
            stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]),
        );
        if ($fp === false) {
            throw new \RuntimeException('connect failed: ' . $errstr);
        }
        stream_set_timeout($fp, $this->timeout);
        try {
            self::expect($fp, '2');
            self::command($fp, 'EHLO www.cs.siue.edu', '2');
            self::command($fp, "MAIL FROM:<{$this->from}>", '2');
            self::command($fp, "RCPT TO:<$to>", '2');
            self::command($fp, 'DATA', '3');
            self::command($fp, $data . "\r\n.", '2');
            self::write($fp, "QUIT\r\n");
        } finally {
            fclose($fp);
        }
    }

    /** The message as sent: From, To, Subject, Date (RFC 2822), Message-ID, then $mime. */
    public static function data(string $from, string $to, string $subject, string $mime, int $now): string
    {
        self::assertSingleLine($to, $from, $subject);
        if (preg_match('/[^\x20-\x7e]/', $subject) === 1) {
            throw new \RuntimeException('refused: subject must be plain ASCII');
        }
        $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
        return "From: $from\r\nTo: $to\r\nSubject: $subject\r\n"
            . 'Date: ' . gmdate('D, d M Y H:i:s', $now) . " +0000\r\n"
            . 'Message-ID: <' . bin2hex(random_bytes(16)) . "@$domain>\r\n"
            . $mime;
    }

    /** Normalises line endings to CRLF and dot-stuffs lines that begin with a period. */
    public static function stuff(string $body): string
    {
        $lines = preg_split("/\r?\n/", $body);
        foreach ($lines as &$line) {
            if (isset($line[0]) && $line[0] === '.') {
                $line = '.' . $line;
            }
        }
        return implode("\r\n", $lines);
    }

    private static function assertSingleLine(string ...$fields): void
    {
        foreach ($fields as $field) {
            if (preg_match('/[\r\n]/', $field) === 1) {
                throw new \RuntimeException('refused: header injection');
            }
        }
    }

    /** @param resource $fp */
    private static function command($fp, string $line, string $want): void
    {
        self::write($fp, $line . "\r\n");
        self::expect($fp, $want);
    }

    /**
     * Writes all of $bytes or throws.
     *
     * @param resource $fp
     */
    private static function write($fp, string $bytes): void
    {
        $len = strlen($bytes);
        for ($done = 0; $done < $len;) {
            $n = @fwrite($fp, substr($bytes, $done));
            if ($n === false || $n === 0) {
                throw new \RuntimeException('SMTP write failed');
            }
            $done += $n;
        }
    }

    /**
     * Reads one full reply, through its continuation lines ("250-..." to "250 ..."), and
     * requires the class $want ('2' or '3'). Public so tests can feed it a memory stream.
     *
     * @param resource $fp
     */
    public static function expect($fp, string $want): void
    {
        $last = '';
        for ($i = 0; $i < 20; $i++) {
            $line = fgets($fp, 512);
            if ($line === false) {
                break;
            }
            $last = $line;
            if (preg_match('/^(\d{3})([ -]|\r?\n?$)/', $line, $m) === 1 && $m[2] !== '-') {
                if ($m[1][0] === $want) {
                    return;
                }
                throw new \RuntimeException('SMTP error: ' . trim($line));
            }
        }
        throw new \RuntimeException('SMTP error: ' . ($last === '' ? 'no reply' : trim($last)));
    }
}

final class CaptureMailer implements Mailer
{
    public function __construct(private string $dir)
    {
    }

    public function send(string $to, string $subject, string $mime): void
    {
        $to = Address::studio($to) ?? throw new \RuntimeException('refused: recipient not allowed');
        $name = $this->dir . '/' . time() . '-' . bin2hex(random_bytes(4)) . '.eml';
        $eml = SmtpMailer::data(Auth::OWNER, $to, $subject, $mime, time());
        if (@file_put_contents($name, $eml) === false) {
            throw new \RuntimeException('capture failed');
        }
    }
}
