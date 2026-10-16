<?php
// Where a game's PHP keeps its files, and whether that place can be trusted:
// a directory someone else made, a symbolic link, or one open to others is
// refused. install-files.php copies it into each game's server/; edit
// games/_kit/php/store-dir.php, never a copy.
declare(strict_types=1);

namespace Kit;

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

final class StoreDir
{
    private const DENY = "# Storage: PHP reads it, browsers may not.\nRequire all denied\n";

    /**
     * @param string $logPrefix starts the error_log line of every refusal, such as "tankity storage:"
     * @param class-string<\Throwable> $refusal thrown on a refusal; built with the message "<path> <problem>"
     * @param string $denyFile the .htaccess text denyHttp() writes; it must contain "Require all denied"
     */
    public function __construct(
        private readonly string $logPrefix,
        private readonly string $refusal = \RuntimeException::class,
        private readonly string $denyFile = self::DENY,
    ) {
    }

    /** The account the site belongs to: the owner of the running script, the same in every PHP-FPM worker and pool; uid<N> when the name cannot be looked up. */
    public static function username(): string
    {
        $name = strtolower((string) preg_replace('/[^A-Za-z0-9_-]+/', '', get_current_user()));
        return $name !== '' ? substr($name, 0, 32) : 'uid' . getmyuid();
    }

    /** PHP's own effective uid: who must own a directory on a shared /var/tmp. */
    public static function euid(): int
    {
        return function_exists('posix_geteuid') ? posix_geteuid() : getmyuid();
    }

    /** Logs one line naming the path and the problem, then refuses. */
    public function refuse(string $path, string $problem, string $remedy = 'remove it, or set data_dir'): never
    {
        error_log("{$this->logPrefix} $path $problem; $remedy");
        throw new ($this->refusal)("$path $problem");
    }

    /**
     * Creates $dir (0700) unless it exists, then checks it is a real directory
     * PHP can write. $private also requires that PHP owns it and nobody else
     * may enter: /var/tmp is shared, so a directory another account made is
     * refused.
     */
    public function claim(string $dir, bool $private): string
    {
        // mkdir is the atomic step: if the name is taken, whatever holds it is
        // verified below, never adopted.
        if (!file_exists($dir) && !is_link($dir)) {
            if (!@mkdir($dir, StoreModes::modes()['dir'], true) && !file_exists($dir) && !is_link($dir)) {
                $this->refuse($dir, 'cannot be created', 'fix its parent directory, or set data_dir');
            }
        }
        clearstatcache(true, $dir);
        $st = @lstat($dir); // lstat: a link is reported as a link, not followed
        if ($st === false) {
            $this->refuse($dir, 'is not a writable directory', 'fix its permissions, or set data_dir');
        }
        $isLink = ($st['mode'] & 0170000) === 0120000;
        if ($isLink && !$private) {
            $this->refuse($dir, 'is a symbolic link, not a writable directory', 'point data_dir at the directory itself');
        }
        if ($private) {
            // Ownership comes before writability: a directory someone else made
            // is not writable to us, and that squat must be refused and logged,
            // not reported as a plain permissions problem.
            if ($isLink) {
                $this->refuse($dir, 'is a symbolic link');
            }
            if (($st['mode'] & 0170000) !== 0040000) {
                $this->refuse($dir, 'is not a directory');
            }
            if ($st['uid'] !== self::euid()) {
                $this->refuse($dir, 'belongs to another account');
            }
            if (($st['mode'] & 0777) !== StoreModes::modes()['dir']) {
                $this->refuse($dir, sprintf('has mode %04o, not %04o', $st['mode'] & 0777, StoreModes::modes()['dir']));
            }
        }
        if (($st['mode'] & 0170000) !== 0040000 || !is_writable($dir)) {
            $this->refuse($dir, 'is not a writable directory', 'fix its permissions, or set data_dir');
        }
        return $dir;
    }

    /**
     * A file PHP keeps directly in a shared directory such as /var/tmp, where
     * its name can be squatted: a link, a non-file or another account's file is
     * refused; one of ours that is open to others is made private. A missing
     * file passes.
     */
    public function claimFile(string $path): string
    {
        $st = @lstat($path);
        if ($st === false) {
            return $path;
        }
        if (($st['mode'] & 0170000) === 0120000) {
            $this->refuse($path, 'is a symbolic link', 'remove it');
        }
        if (($st['mode'] & 0170000) !== 0100000) {
            $this->refuse($path, 'is not a file', 'remove it');
        }
        if ($st['uid'] !== self::euid()) {
            $this->refuse($path, 'belongs to another account', 'remove it');
        }
        if ($st['nlink'] !== 1) {
            $this->refuse($path, 'has other hard links', 'remove it');
        }
        if (($st['mode'] & 0077) !== 0) {
            @chmod($path, StoreModes::modes()['file']);
        }
        return $path;
    }

    /**
     * Opens a file in a shared directory without ever following a link or
     * creating through one: a missing file is made with an exclusive 'x' open
     * (O_EXCL fails on any existing name, a dangling link included) and born
     * with $mode; the file is then opened 'r+', which neither creates nor
     * truncates. The handle is verified against the path before it is returned.
     * A caller rewrites only through the handle (ftruncate, fwrite) under flock.
     * @param string $initial what a newly made file starts with
     * @return resource
     */
    public function openExisting(string $path, int $mode, string $initial = '')
    {
        if (!file_exists($path) && !is_link($path)) {
            $old = umask(0777 & ~$mode);
            try {
                $made = @fopen($path, 'x');
            } finally {
                umask($old);
            }
            if ($made !== false) {
                $this->verifyOpened($made, $path);
                // Exclusive creation: nobody else holds it yet, so the lock only orders us against a later opener.
                if (flock($made, LOCK_EX)) {
                    if ((fstat($made)['size'] ?? 0) === 0 && $initial !== '') {
                        fwrite($made, $initial);
                        fflush($made);
                    }
                    flock($made, LOCK_UN);
                }
                fclose($made);
            }
        }
        $fh = @fopen($path, 'r+');
        if ($fh === false) {
            $this->refuse($path, 'cannot be opened', 'remove it, or fix its permissions');
        }
        $this->verifyOpened($fh, $path);
        return $fh;
    }

    /**
     * The check after every fopen of a file in a shared directory, where
     * another account can plant a link between claimFile() and the open: the
     * open handle must be a regular file owned by PHP's user, and the path must
     * still name that same file (not a link, same device and inode). Otherwise
     * the handle is closed and the open refused.
     * @param resource $fh
     */
    public function verifyOpened($fh, string $path): void
    {
        $open = is_resource($fh) ? @fstat($fh) : false;
        clearstatcache(true, $path);
        $named = @lstat($path);
        $problem = null;
        if ($open === false || $named === false) {
            $problem = 'cannot be verified after opening';
        } elseif (($named['mode'] & 0170000) === 0120000) {
            $problem = 'is a symbolic link';
        } elseif (($open['mode'] & 0170000) !== 0100000 || ($named['mode'] & 0170000) !== 0100000) {
            $problem = 'is not a file';
        } elseif ($open['uid'] !== self::euid()) {
            $problem = 'belongs to another account';
        } elseif ($open['dev'] !== $named['dev'] || $open['ino'] !== $named['ino']) {
            $problem = 'changed while it was being opened';
        } elseif ($open['nlink'] !== 1) {
            $problem = 'has other hard links';
        }
        if ($problem !== null) {
            if (is_resource($fh)) {
                fclose($fh);
            }
            $this->refuse($path, $problem, 'remove it');
        }
    }

    /** The deny file Apache reads in a storage directory under the web root; true once it is in place. */
    public function denyHttp(string $dir): bool
    {
        $f = $dir . '/.htaccess';
        if (is_file($f) && str_contains((string) @file_get_contents($f), 'Require all denied')) {
            return true;
        }
        if (@file_put_contents($f, $this->denyFile) === false) {
            return false;
        }
        @chmod($f, StoreModes::modes()['file']);
        return true;
    }

    /**
     * $preferred when PHP can write it (or create it there) and its deny file
     * is in place; otherwise the private $fallback. $writable is the tests' seam.
     */
    public function pick(string $preferred, string $fallback, ?\Closure $writable = null): string
    {
        $writable ??= fn(string $p): bool => is_writable($p);
        if (is_dir($preferred) && !is_link($preferred)) {
            // A checkout or deploy may have made it 0755; PHP's own directory is private.
            if (fileowner($preferred) === self::euid() && (fileperms($preferred) & 0077) !== 0) {
                @chmod($preferred, StoreModes::modes()['dir']);
            }
            $usable = $writable($preferred);
        } else {
            // A request that lost the mkdir race uses the directory the winner made.
            $usable = !file_exists($preferred) && $writable(dirname($preferred))
                && (@mkdir($preferred, StoreModes::modes()['dir']) || (is_dir($preferred) && !is_link($preferred)));
            if ($usable) {
                @chmod($preferred, StoreModes::modes()['dir']);
            }
        }
        if ($usable && $this->denyHttp($preferred)) {
            return $preferred;
        }
        return $this->claim($fallback, true);
    }
}
