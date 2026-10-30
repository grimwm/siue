<?php
// The named people and the studio caps, read from the file the deploy writes from the 1Password field.
declare(strict_types=1);

namespace Admin;

require_once __DIR__ . '/Address.php';
require_once __DIR__ . '/Auth.php';

final class People
{
    public const DEFAULT_MAX_ACCOUNTS = 500;
    public const DEFAULT_MAX_SHARED_BYTES = 1_073_741_824;

    /** @param array<string, array{admin: bool, allowance: bool}> $named keyed by normalized address */
    private function __construct(
        private readonly array $named,
        private readonly int $maxAccounts,
        private readonly int $maxSharedBytes,
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

    /** Null when the JSON is malformed: bad shape, an address that is not a studio address, a cap that is not a positive integer. */
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
        $caps = [];
        foreach (['max_accounts' => self::DEFAULT_MAX_ACCOUNTS, 'max_shared_bytes' => self::DEFAULT_MAX_SHARED_BYTES] as $key => $default) {
            $v = $d[$key] ?? $default;
            if (!is_int($v) || $v < 1) {
                return null;
            }
            $caps[] = $v;
        }
        return new self($named, $caps[0], $caps[1]);
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

    public function maxSharedBytes(): int
    {
        return $this->maxSharedBytes;
    }
}
