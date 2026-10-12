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

    // Only browser-set Origin and Referer headers are trusted: non-browser clients can forge both, so CSRF is what stops them.
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

    /** This client's rate-limit key: an HMAC of its address, so the store never holds an IP. */
    public function clientKey(): string
    {
        return substr(hash_hmac('sha256', (string) ($this->server['REMOTE_ADDR'] ?? ''), $this->rateSalt), 0, 24);
    }

    /** A new run token, or null when this client has started too many runs this hour. */
    public function startRun(): ?string
    {
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($now): ?string {
            if (!$this->rateAllows($store, 'start', $this->config['startsPerHour'], $now)) {
                return null;
            }
            $id = bin2hex(random_bytes(16));
            $store['runs'][] = ['id' => $id, 'at' => $now, 'exp' => $now + $this->config['runTtlSec'], 'used' => false];
            $this->rateMark($store, 'start', $now);
            return $id;
        });
    }

    /**
     * Spends a run token. $plausible, given the seconds since the token was
     * issued, may reject the score it came with; a rejected token stays
     * unspent. Returns null when the run is accepted, else 'rate',
     * 'invalid run' or 'score rejected'.
     * @param (callable(int): bool)|null $plausible
     */
    public function consumeRun(string $id, ?callable $plausible = null): ?string
    {
        if (!preg_match(self::TOKEN, $id)) {
            return 'invalid run';
        }
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($id, $plausible, $now): ?string {
            if (!$this->rateAllows($store, 'score', $this->config['scoresPerHour'], $now)) {
                return 'rate';
            }
            foreach ($store['runs'] as $i => $run) {
                if (!is_array($run) || ($run['id'] ?? '') !== $id) {
                    continue;
                }
                if (!empty($run['used']) || (int) ($run['exp'] ?? 0) < $now) {
                    return 'invalid run';
                }
                if ($plausible !== null && !$plausible($now - (int) ($run['at'] ?? $now))) {
                    return 'score rejected';
                }
                $store['runs'][$i]['used'] = true;
                $this->rateMark($store, 'score', $now);
                return null;
            }
            return 'invalid run';
        });
    }

    /**
     * Takes one of this client's $perHour slots for $kind (a lowercase word,
     * such as 'room'); false, and nothing taken, when this hour's are spent.
     * For endpoints other than run starts and scores that still need a cap.
     */
    public function rateTake(string $kind, int $perHour): bool
    {
        if (!preg_match('/^[a-z]{1,16}\z/', $kind)) {
            throw new \InvalidArgumentException('rate kind must be 1 to 16 lowercase letters');
        }
        $now = ($this->clock)();
        return $this->withStore(function (array &$store) use ($kind, $perHour, $now): bool {
            if (!$this->rateAllows($store, $kind, $perHour, $now)) {
                return false;
            }
            $this->rateMark($store, $kind, $now);
            return true;
        });
    }

    /** @param array{runs: list<mixed>, rates: array<string, mixed>} $store */
    private function rateAllows(array $store, string $kind, int $limit, int $now): bool
    {
        $recent = 0;
        foreach ($store['rates'][$this->clientKey()][$kind] ?? [] as $ts) {
            if ((int) $ts >= $now - self::WINDOW_SEC) {
                $recent++;
            }
        }
        return $recent < $limit;
    }

    /** @param array{runs: list<mixed>, rates: array<string, mixed>} $store */
    private function rateMark(array &$store, string $kind, int $now): void
    {
        $key = $this->clientKey();
        if (!isset($store['rates'][$key]) || !is_array($store['rates'][$key])) {
            $store['rates'][$key] = ['start' => [], 'score' => []];
        }
        $store['rates'][$key][$kind][] = $now;
    }

    /** @return array{runs: list<mixed>, rates: array<string, mixed>} */
    private static function parseStore(string $raw): array
    {
        $data = json_decode($raw !== '' ? $raw : '{}', true);
        $store = ['runs' => [], 'rates' => []];
        if (is_array($data)) {
            if (isset($data['runs']) && is_array($data['runs'])) {
                $store['runs'] = array_values($data['runs']);
            }
            if (isset($data['rates']) && is_array($data['rates'])) {
                $store['rates'] = $data['rates'];
            }
        }
        return $store;
    }

    /**
     * Drops what can no longer matter: tokens an hour past expiry and rate
     * stamps older than the window. Every client row keeps `start` and
     * `score` (the shape Cylon's old code wrote), plus any kind rateTake() added.
     * @param array{runs: list<mixed>, rates: array<string, mixed>} $store
     * @return array{runs: list<mixed>, rates: array<string, mixed>}
     */
    private static function prune(array $store, int $now): array
    {
        $cutoff = $now - self::WINDOW_SEC;
        $store['runs'] = array_values(array_filter($store['runs'], static fn($run): bool => is_array($run) && (int) ($run['exp'] ?? 0) >= $cutoff));
        $rates = [];
        foreach ($store['rates'] as $key => $row) {
            if (!is_array($row)) {
                continue;
            }
            $clean = ['start' => [], 'score' => []];
            foreach ($row as $kind => $stamps) {
                if (is_string($kind) && preg_match('/^[a-z]{1,16}\z/', $kind) && is_array($stamps)) {
                    $clean[$kind] = array_values(array_filter(array_map('intval', $stamps), static fn(int $ts): bool => $ts >= $cutoff));
                }
            }
            if (array_filter($clean)) {
                $rates[$key] = $clean;
            }
        }
        $store['rates'] = $rates;
        return $store;
    }

    /** @param resource $fh */
    private static function overwrite($fh, string $bytes): bool
    {
        $len = strlen($bytes);
        if (!rewind($fh) || fwrite($fh, $bytes) !== $len || !ftruncate($fh, $len)) {
            return false;
        }
        fflush($fh);
        @fsync($fh);
        return true;
    }

    /** Runs $fn on the store under one exclusive lock and writes back what it leaves. */
    private function withStore(callable $fn): mixed
    {
        $fh = @fopen($this->runsPath, 'c+');
        if ($fh === false) {
            throw new \RuntimeException('unable to open the run store: ' . $this->runsPath);
        }
        try {
            if (!flock($fh, LOCK_EX)) {
                throw new \RuntimeException('unable to lock the run store');
            }
            $raw = stream_get_contents($fh);
            $store = self::prune(self::parseStore($raw === false ? '' : $raw), ($this->clock)());
            $result = $fn($store);
            $encoded = json_encode($store, JSON_UNESCAPED_SLASHES);
            if ($encoded === false) {
                throw new \RuntimeException('run store encode failed');
            }
            // Write over the old bytes and cut to length afterwards, so a failed
            // write never leaves the store emptier than it was; put the old
            // bytes back if the new ones did not all land.
            if (!self::overwrite($fh, $encoded)) {
                self::overwrite($fh, $raw === false ? '' : $raw);
                throw new \RuntimeException('run store write failed');
            }
            flock($fh, LOCK_UN);
            // Only PHP writes the store: StoreModes decides what that means on this host.
            @chmod($this->runsPath, StoreModes::modes()['file']);
            return $result;
        } finally {
            fclose($fh);
        }
    }
}

/**
 * The file modes a game's PHP uses, decided in one place. PHP runs either as
 * the account that deployed the game or as a web user every site on the host
 * shares (what Cylon's 0666/0777 assumed). A path only PHP writes is 0700/0600
 * either way: its owner is PHP's user, and that is all PHP needs. A path the
 * deploy account also writes (a game's own data/ folder) must be open to both
 * when they are different users. With a shared web user, any other site's PHP
 * runs as that same user and can read and write what this one stores; no
 * mode prevents that.
 */
final class StoreModes
{
    /** PHP's effective user is the owner of the running script: the deploying account. */
    public static function phpIsOwner(): bool
    {
        return !function_exists('posix_geteuid') || posix_geteuid() === getmyuid();
    }

    /** @return array{dir: int, file: int, sharedDir: int, sharedFile: int} */
    public static function modes(?bool $phpIsOwner = null): array
    {
        $own = $phpIsOwner ?? self::phpIsOwner();
        return ['dir' => 0700, 'file' => 0600, 'sharedDir' => $own ? 0700 : 0777, 'sharedFile' => $own ? 0600 : 0666];
    }
}
