<?php
// Where the shared Endless bank keeps its stores, and the rule that keeps it
// there: CRETE_BANK_DIR when it is set; otherwise data/ when PHP can write it,
// else /var/tmp/<account>-crete-bank. The bank never moves on its own: a
// folder that holds a bank wins over one that does not, and a new, empty bank
// is never started in /var/tmp while data/ exists (php-fpm keeps /var/tmp
// private to itself and empties it on every restart). trusted-where reports
// all of it, read only.
declare(strict_types=1);

namespace Crete;

require_once __DIR__ . '/Bank.php';

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

use Kit\StoreDir;
use Kit\StoreModes;

final class Place
{
    public const KINDS = ['override', 'data', 'vartmp'];

    /** Written once into a folder when a new, empty bank starts there: { "at", "kind" }. */
    public const BORN = 'born.json';

    /**
     * @param string $data the game's data/ folder
     * @param string $varTmp the private folder in /var/tmp
     * @param string|null $override CRETE_BANK_DIR, or null when it is not set
     * @param (\Closure(string): bool)|null $writable the tests' seam for is_writable
     * @param (\Closure(): int)|null $clock seconds since the epoch
     * @param string $proc where /proc is (the tests' seam)
     */
    public function __construct(
        private readonly string $data,
        private readonly string $varTmp,
        private readonly ?string $override,
        private readonly StoreDir $store,
        private readonly ?\Closure $writable = null,
        private readonly ?\Closure $clock = null,
        private readonly string $proc = '/proc',
    ) {
    }

    /** True when $dir holds any grade's served, pending or retired store. */
    public static function holdsBank(string $dir): bool
    {
        foreach (Bank::GRADES as $grade) {
            foreach (Bank::EXPORT_LISTS as $list) {
                if (is_file("$dir/$list-$grade.json")) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Which folder the rule picks, given whether data/ is usable; changes nothing.
     * @return array{kind: string|null, dir: string|null, fresh: bool, refused: string|null}
     */
    public function decide(bool $dataUsable): array
    {
        if ($this->override !== null) {
            return ['kind' => 'override', 'dir' => $this->override, 'fresh' => !self::holdsBank($this->override), 'refused' => null];
        }
        $inData = self::holdsBank($this->data);
        $inVarTmp = is_dir($this->varTmp) && !is_link($this->varTmp) && self::holdsBank($this->varTmp);
        $refuse = fn(string $why): array => ['kind' => null, 'dir' => null, 'fresh' => false, 'refused' => $why];
        if ($dataUsable) {
            // data/ became writable after the bank started in /var/tmp: it stays where it is.
            if ($inVarTmp && !$inData) {
                return ['kind' => 'vartmp', 'dir' => $this->varTmp, 'fresh' => false, 'refused' => null];
            }
            return ['kind' => 'data', 'dir' => $this->data, 'fresh' => !$inData, 'refused' => null];
        }
        if ($inData) {
            return $refuse("{$this->data} holds the bank but PHP cannot write it; the bank will not move to {$this->varTmp}. Give PHP's group write access to {$this->data}");
        }
        if ($inVarTmp) {
            return ['kind' => 'vartmp', 'dir' => $this->varTmp, 'fresh' => false, 'refused' => null];
        }
        if (is_dir($this->data) || is_link($this->data)) {
            return $refuse("{$this->data} exists but PHP cannot write it, and the bank will not start empty in {$this->varTmp}, which a php-fpm restart empties. Give PHP's group write access to {$this->data}");
        }
        return ['kind' => 'vartmp', 'dir' => $this->varTmp, 'fresh' => true, 'refused' => null];
    }

    /**
     * The bank's folder, checked and ready: decide() on whether data/ is
     * usable (StoreDir::usable, which may make it and its deny file). A new,
     * empty bank gets born.json and one error_log line saying where it began.
     * @return array{kind: string, dir: string}
     * @throws \RuntimeException when the rule refuses, with the reason and its remedy
     */
    public function choose(): array
    {
        $dataUsable = $this->override === null && $this->store->usable($this->data, $this->writable);
        $d = $this->decide($dataUsable);
        if ($d['refused'] !== null) {
            throw new \RuntimeException('crete bank storage: ' . $d['refused']);
        }
        $dir = match ($d['kind']) {
            'override' => $this->store->claim(rtrim($d['dir'], '/'), false),
            'vartmp' => $this->store->claim($d['dir'], true),
            default => $d['dir'],
        };
        if ($d['fresh'] && !file_exists("$dir/" . self::BORN)) {
            $this->born($dir, $d['kind']);
        }
        return ['kind' => $d['kind'], 'dir' => $dir];
    }

    private function born(string $dir, string $kind): void
    {
        $now = $this->clock !== null ? ($this->clock)() : time();
        $old = umask(0777 & ~StoreModes::modes()['file']);
        try {
            $made = @fopen("$dir/" . self::BORN, 'x');
        } finally {
            umask($old);
        }
        if ($made === false) {
            return; // Another request began it first.
        }
        fwrite($made, Bank::encode(['at' => $now, 'kind' => $kind]));
        fclose($made);
        $note = $kind === 'vartmp' ? ', which a php-fpm restart empties' : '';
        error_log("crete bank storage: a new, empty bank begins in $dir ($kind$note)");
    }

    /**
     * Everything trusted-where answers, read only (no folder, file or lock is
     * made): the folder the rule picks or why it refuses, each candidate
     * folder and its stores, and what the host says about restarts.
     * @return array<string, mixed>
     */
    public function report(): array
    {
        $writable = $this->writable ?? static fn(string $p): bool => is_writable($p);
        $dataWritable = is_dir($this->data) && !is_link($this->data) && $writable($this->data);
        $d = $this->decide($this->override === null && $dataWritable);
        $folders = ['data' => self::folder($this->data, $writable), 'vartmp' => self::folder($this->varTmp, $writable)];
        if ($this->override !== null) {
            $folders = ['override' => self::folder($this->override, $writable)] + $folders;
        }
        $chosen = $d['kind'] !== null ? $folders[$d['kind']] : null;
        return [
            'kind' => $d['kind'],
            'dir' => $d['dir'],
            'refused' => $d['refused'],
            'ctime' => $chosen['ctime'] ?? null,
            'mtime' => $chosen['mtime'] ?? null,
            'grades' => $chosen['grades'] ?? null,
            'dataWritable' => $dataWritable,
            'folders' => $folders,
            'php' => self::php(),
            'bootTime' => $this->bootTime(),
            'server' => $this->server(),
            'tmpMounts' => $this->tmpMounts(),
            'now' => $this->clock !== null ? ($this->clock)() : time(),
        ];
    }

    /**
     * One candidate folder as it stands: whether it exists, who owns it, its
     * times, its parent's group, born.json, and each grade's stores.
     * @param \Closure(string): bool $writable
     * @return array<string, mixed>
     */
    private static function folder(string $dir, \Closure $writable): array
    {
        clearstatcache();
        $st = @lstat($dir);
        $parent = @stat(dirname($dir));
        $isDir = $st !== false && ($st['mode'] & 0170000) === 0040000;
        $out = [
            'path' => $dir,
            'exists' => $st !== false,
            'link' => $st !== false && ($st['mode'] & 0170000) === 0120000,
            'writable' => $isDir && $writable($dir),
            'mode' => $st !== false ? sprintf('%04o', $st['mode'] & 07777) : null,
            'uid' => $st !== false ? (int) $st['uid'] : null,
            'gid' => $st !== false ? (int) $st['gid'] : null,
            'parentGid' => $parent !== false ? (int) $parent['gid'] : null,
            'ctime' => $st !== false ? (int) $st['ctime'] : null,
            'mtime' => $st !== false ? (int) $st['mtime'] : null,
            'holdsBank' => $isDir && self::holdsBank($dir),
            'born' => null,
            'grades' => null,
        ];
        if (!$isDir) {
            return $out;
        }
        $born = json_decode((string) @file_get_contents("$dir/" . self::BORN), true);
        $out['born'] = is_array($born) && is_int($born['at'] ?? null) ? ['at' => $born['at'], 'kind' => (string) ($born['kind'] ?? '')] : null;
        $out['grades'] = Bank::storeSummary($dir);
        return $out;
    }

    /** PHP's own user and groups: whether it can be in a folder's group. */
    private static function php(): array
    {
        $posix = function_exists('posix_geteuid');
        return [
            'uid' => StoreDir::euid(),
            'gid' => $posix ? posix_getegid() : getmygid(),
            'groups' => $posix && function_exists('posix_getgroups') ? array_values(array_map('intval', posix_getgroups() ?: [])) : null,
            'sapi' => PHP_SAPI,
        ];
    }

    /** When the host booted (seconds since the epoch), from /proc/stat's btime; null when PHP cannot read it. */
    private function bootTime(): ?int
    {
        $stat = @file_get_contents("{$this->proc}/stat");
        return is_string($stat) && preg_match('/^btime (\d+)$/m', $stat, $m) ? (int) $m[1] : null;
    }

    /**
     * The process that started this PHP worker (php-fpm's master under FPM)
     * and when it started: a php-fpm restart shows here even without a reboot.
     * Null when /proc does not say.
     * @return array{pid: int, name: string, startedAt: int|null}|null
     */
    private function server(): ?array
    {
        $self = @file_get_contents("{$this->proc}/self/stat");
        $ppid = is_string($self) ? self::statField($self, 4) : null;
        if ($ppid === null || $ppid < 1) {
            return null;
        }
        $stat = @file_get_contents("{$this->proc}/$ppid/stat");
        $ticks = is_string($stat) ? self::statField($stat, 22) : null;
        $boot = $this->bootTime();
        $hz = function_exists('posix_sysconf') && defined('POSIX_SC_CLK_TCK') ? (int) posix_sysconf(POSIX_SC_CLK_TCK) : 100;
        return [
            'pid' => $ppid,
            'name' => trim((string) @file_get_contents("{$this->proc}/$ppid/comm")),
            'startedAt' => $ticks !== null && $boot !== null && $hz > 0 ? $boot + intdiv($ticks, $hz) : null,
        ];
    }

    /** Field $n (counted from 1, as proc(5) does) of a /proc/<pid>/stat line; the name in brackets may hold spaces. */
    private static function statField(string $stat, int $n): ?int
    {
        $close = strrpos($stat, ')');
        if ($close === false || $n < 3) {
            return null;
        }
        $rest = preg_split('/\s+/', trim(substr($stat, $close + 1)));
        $value = $rest[$n - 3] ?? null;
        return is_string($value) && ctype_digit($value) ? (int) $value : null;
    }

    /**
     * What is mounted on /tmp and /var/tmp as this worker sees them, from
     * /proc/self/mountinfo: a service with systemd's PrivateTmp shows a mount
     * whose root is a systemd-private-… folder. Null when PHP cannot read it.
     * @return list<array{mount: string, root: string}>|null
     */
    private function tmpMounts(): ?array
    {
        $info = @file_get_contents("{$this->proc}/self/mountinfo");
        if (!is_string($info)) {
            return null;
        }
        $out = [];
        foreach (explode("\n", $info) as $line) {
            $f = explode(' ', $line);
            if (isset($f[4]) && in_array($f[4], ['/tmp', '/var/tmp'], true)) {
                $out[] = ['mount' => $f[4], 'root' => $f[3]];
            }
        }
        return $out;
    }
}
