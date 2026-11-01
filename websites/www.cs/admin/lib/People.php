<?php
// The named people and the studio caps, read from the file the deploy writes from the 1Password field.
declare(strict_types=1);

namespace Admin;

require_once __DIR__ . '/Address.php';
require_once __DIR__ . '/Auth.php';

final class People
{
    public const DEFAULT_MAX_ACCOUNTS = 500;
    public const DEFAULT_MAX_SHARED_MB = 20480;
    public const DEFAULT_MAX_SHARED_BYTES = self::DEFAULT_MAX_SHARED_MB * 1_048_576;
    /** Uploads are refused while the host's free disk would drop below this many MiB. */
    public const DEFAULT_MIN_FREE_DISK_MB = 51200;
    /** A vocal take may decode to at most this many MiB of 16-bit samples. */
    public const DEFAULT_MAX_TAKE_DECODED_MB = 200;
    private const CAPS = ['max_accounts' => self::DEFAULT_MAX_ACCOUNTS, 'max_shared_mb' => self::DEFAULT_MAX_SHARED_MB,
        'min_free_disk_mb' => self::DEFAULT_MIN_FREE_DISK_MB, 'max_take_decoded_mb' => self::DEFAULT_MAX_TAKE_DECODED_MB];

    /** @param array<string, array{admin: bool, allowance: bool}> $named keyed by normalized address */
    private function __construct(
        private readonly array $named,
        private readonly int $maxAccounts,
        private readonly int $maxSharedBytes,
        private readonly int $minFreeDiskBytes = self::DEFAULT_MIN_FREE_DISK_MB * 1_048_576,
        private readonly int $maxTakeDecodedBytes = self::DEFAULT_MAX_TAKE_DECODED_MB * 1_048_576,
    ) {
    }

    /** The configuration at $path, else STUDIO_CONFIG_FILE, else admin/config/studio.json. Missing or malformed gives the defaults. */
    public static function load(?string $path = null): self
    {
        $path ??= (string) getenv('STUDIO_CONFIG_FILE');
        if ($path === '') {
            $path = __DIR__ . '/../config/studio.json';
        }
        if (!is_file($path)) {
            return new self([], self::DEFAULT_MAX_ACCOUNTS, self::DEFAULT_MAX_SHARED_BYTES);
        }
        $json = @file_get_contents($path);
        $people = $json === false ? null : self::fromJson($json);
        if ($people === null) {
            error_log('admin: studio configuration is unreadable; using the defaults');
            return new self([], self::DEFAULT_MAX_ACCOUNTS, self::DEFAULT_MAX_SHARED_BYTES);
        }
        return $people;
    }

    /** Null when the JSON is malformed: bad shape, an address that is not a studio address, a cap that is not a positive integer, a key that is not part of the shape (so
     *  a stale `max_shared_bytes` is caught rather than ignored). The shared-space cap is `max_shared_mb`, the free-disk
     *  floor `min_free_disk_mb` and a vocal take's decoded limit `max_take_decoded_mb`, each in MiB. */
    public static function fromJson(string $json): ?self
    {
        $d = json_decode($json, true);
        if (!is_array($d) || (array_is_list($d) && $d !== []) || !is_array($d['people'] ?? [])) {
            return null;
        }
        $named = [];
        foreach ($d['people'] ?? [] as $p) {
            if (!is_array($p) || !is_string($p['email'] ?? null)) {
                return null;
            }
            $email = Address::studio($p['email']);
            $admin = $p['admin'] ?? false;
            $allowance = $p['allowance'] ?? false;
            if ($email === null || !is_bool($admin) || !is_bool($allowance)) {
                return null;
            }
            $named[$email] = ['admin' => $admin, 'allowance' => $allowance];
        }
        if (array_diff(array_keys($d), ['people', ...array_keys(self::CAPS)]) !== []) {
            return null;
        }
        $caps = [];
        foreach (self::CAPS as $key => $default) {
            $v = $d[$key] ?? $default;
            if (!is_int($v) || $v < 1) {
                return null;
            }
            $caps[] = $v;
        }
        return new self($named, $caps[0], $caps[1] * 1_048_576, $caps[2] * 1_048_576, $caps[3] * 1_048_576);
    }

    public function isAdmin(string $email): bool
    {
        return $email === Auth::OWNER || ($this->named[$email]['admin'] ?? false);
    }

    public function hasAllowance(string $email): bool
    {
        return $email === Auth::OWNER || ($this->named[$email]['allowance'] ?? false);
    }

    /** True for the owner and anyone listed in the file. */
    public function isNamed(string $email): bool
    {
        return $email === Auth::OWNER || isset($this->named[$email]);
    }

    public function maxAccounts(): int
    {
        return $this->maxAccounts;
    }

    /** A copy with the shared-space cap set in bytes, for tests that need a pool smaller than a MiB. */
    public function withMaxSharedBytes(int $bytes): self
    {
        return new self($this->named, $this->maxAccounts, $bytes, $this->minFreeDiskBytes, $this->maxTakeDecodedBytes);
    }

    /** A copy with the free-disk floor set in bytes, for tests. */
    public function withMinFreeDiskBytes(int $bytes): self
    {
        return new self($this->named, $this->maxAccounts, $this->maxSharedBytes, $bytes, $this->maxTakeDecodedBytes);
    }

    public function minFreeDiskBytes(): int
    {
        return $this->minFreeDiskBytes;
    }

    public function maxTakeDecodedBytes(): int
    {
        return $this->maxTakeDecodedBytes;
    }

    public function maxSharedBytes(): int
    {
        return $this->maxSharedBytes;
    }
}
