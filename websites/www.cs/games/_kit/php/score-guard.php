<?php
// The gate in front of a game's score endpoint: Origin/Referer allow-list,
// CSRF double-submit, single-use expiring run tokens, per-IP rate limits keyed
// by an HMAC of the address, and three-letter initials. It stores run tokens
// and rate stamps, nothing else. install-files.php copies it into each game's
// server/; edit games/_kit/php/score-guard.php, never a copy.
declare(strict_types=1);

namespace Kit;

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

final class ScoreGuard
{
    /** The config keys the guard reads; a game's config may hold others it checks itself. */
    public const CONFIG_KEYS = ['runTtlSec', 'startsPerHour', 'scoresPerHour', 'csrfCookie', 'storageKey', 'blockedInitials', 'allowedHosts'];

    private const WINDOW_SEC = 3600;
    private const TOKEN = '/^[a-f0-9]{32}\z/';

    /** @var array<string, string> */
    private array $cookies;
    private readonly \Closure $clock;
    private readonly \Closure $setCookie;

    /**
     * @param array<string, mixed> $config the CONFIG_KEYS, through validateConfig()
     * @param string $csrfHeader the request header that carries the CSRF token
     * @param string $rateSalt the HMAC key for client addresses; changing it forgets every rate stamp
     * @param array<string, mixed> $server $_SERVER
     * @param array<string, mixed> $cookies $_COOKIE
     * @param string $runsPath the run-token store, outside any web root
     */
    public function __construct(
        private readonly array $config,
        private readonly string $csrfHeader,
        private readonly string $rateSalt,
        private readonly array $server,
        array $cookies,
        private readonly string $runsPath,
        ?\Closure $clock = null,
        ?\Closure $setCookie = null,
    ) {
        $this->cookies = array_map('strval', array_filter($cookies, 'is_scalar'));
        $this->clock = $clock ?? static fn(): int => time();
        $this->setCookie = $setCookie ?? static function (string $name, string $value, array $options): void {
            setcookie($name, $value, $options);
        };
    }

    /**
     * The guard's part of a game's config, checked and normalised. Keys outside
     * CONFIG_KEYS are the caller's to check.
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function validateConfig(array $data): array
    {
        $missing = array_diff(self::CONFIG_KEYS, array_keys($data));
        if ($missing) {
            throw new \RuntimeException('missing config keys: ' . implode(', ', $missing));
        }
        $out = [];
        foreach (['runTtlSec' => [60, 86400], 'startsPerHour' => [1, 10000], 'scoresPerHour' => [1, 10000]] as $key => [$min, $max]) {
            if (!is_int($data[$key]) || $data[$key] < $min || $data[$key] > $max) {
                throw new \RuntimeException("config $key must be an integer from $min to $max");
            }
            $out[$key] = $data[$key];
        }
        foreach (['csrfCookie' => '/^[A-Za-z0-9_]{1,32}\z/', 'storageKey' => '/^[A-Za-z0-9_-]{1,32}\z/'] as $key => $pattern) {
            if (!is_string($data[$key]) || !preg_match($pattern, $data[$key])) {
                throw new \RuntimeException("config $key has an invalid value");
            }
            $out[$key] = $data[$key];
        }
        if (!is_array($data['blockedInitials'])) {
            throw new \RuntimeException('config blockedInitials must be a list');
        }
        $blocked = [];
        foreach ($data['blockedInitials'] as $initials) {
            $initials = strtoupper(is_scalar($initials) ? (string) $initials : '');
            if (!preg_match('/^[A-Z]{3}\z/', $initials)) {
                throw new \RuntimeException('config blockedInitials entries must be 3 letters');
            }
            $blocked[$initials] = true;
        }
        $out['blockedInitials'] = array_keys($blocked);
        if (!is_array($data['allowedHosts'])) {
            throw new \RuntimeException('config allowedHosts must be a list');
        }
        $hosts = [];
        foreach ($data['allowedHosts'] as $host) {
            $host = strtolower(is_scalar($host) ? (string) $host : '');
            if (!preg_match('/^[a-z0-9.-]+\z/', $host)) {
                throw new \RuntimeException('config allowedHosts has an invalid host');
            }
            $hosts[$host] = true;
        }
        $out['allowedHosts'] = array_keys($hosts);
        return $out;
    }

    /** Exactly three letters in either case, as uppercase; null for anything else. */
    public static function initials(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^[A-Za-z]{3}\z/', $value) ? strtoupper($value) : null;
    }

    /**
     * Any value forced to three uppercase letters: everything but letters
     * dropped, then cut or padded with $pad. For rows stored before initials
     * were checked, never for new input.
     */
    public static function coerceInitials(mixed $value, string $pad): string
    {
        if (!preg_match('/^[A-Z]\z/', $pad)) {
            throw new \InvalidArgumentException('pad must be one uppercase letter');
        }
        $letters = (string) preg_replace('/[^A-Z]/', '', strtoupper(is_scalar($value) ? (string) $value : ''));
        return substr(str_pad($letters, 3, $pad), 0, 3);
    }

    public function isBlocked(string $initials): bool
    {
        return in_array(strtoupper($initials), $this->config['blockedInitials'], true);
    }

    /**
     * A browser post from an allowed page: Origin, else Referer, must name the
     * request's own host or an allowed one. A request with neither passes only
     * when it carries the CSRF header, which a cross-site form cannot set.
     */
    public function originAllowed(): bool
    {
        $allowed = array_values(array_filter(array_unique(array_merge($this->config['allowedHosts'], [$this->requestHost()]))));
        foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $field) {
            $value = (string) ($this->server[$field] ?? '');
            if ($value !== '') {
                return in_array(self::urlHost($value), $allowed, true);
            }
        }
        return isset($this->server[$this->headerKey()]);
    }

    /** This browser's CSRF token: the cookie's, or a new one set now (7 days, Strict, HttpOnly, scoped to the script's folder). */
    public function csrfToken(): string
    {
        $name = $this->config['csrfCookie'];
        $current = $this->cookies[$name] ?? '';
        if (preg_match(self::TOKEN, $current)) {
            return $current;
        }
        $token = bin2hex(random_bytes(16));
        ($this->setCookie)($name, $token, [
            'expires' => ($this->clock)() + 7 * 86400,
            'path' => $this->cookiePath(),
            'secure' => $this->https(),
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        $this->cookies[$name] = $token;
        return $token;
    }

    /** Double submit: the header must equal the cookie, and the cookie must be a token this guard issues. */
    public function csrfOk(): bool
    {
        $cookie = $this->cookies[$this->config['csrfCookie']] ?? '';
        $header = (string) ($this->server[$this->headerKey()] ?? '');
        return preg_match(self::TOKEN, $cookie) === 1 && $header !== '' && hash_equals($cookie, $header);
    }

    private function requestHost(): string
    {
        return (string) preg_replace('/:\d+$/', '', strtolower((string) ($this->server['HTTP_HOST'] ?? '')));
    }

    // Only the browser-set Origin and Referer are trusted; a script can forge neither.
    private static function urlHost(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST);
        return is_string($host) ? strtolower($host) : '';
    }

    private function headerKey(): string
    {
        return 'HTTP_' . strtoupper(str_replace('-', '_', $this->csrfHeader));
    }

    private function cookiePath(): string
    {
        $dir = rtrim(str_replace('\\', '/', dirname((string) ($this->server['SCRIPT_NAME'] ?? ''))), '/');
        return ($dir === '' || $dir === '.') ? '/' : $dir;
    }

    private function https(): bool
    {
        return (!empty($this->server['HTTPS']) && $this->server['HTTPS'] !== 'off')
            || ($this->server['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'
            || ($this->server['REQUEST_SCHEME'] ?? '') === 'https';
    }
}
