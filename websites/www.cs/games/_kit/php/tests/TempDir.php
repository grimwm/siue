<?php
// A scratch directory for a PHPUnit test: unique, private, and removed whole.
// `use Kit\Tests\TempDir;` in a TestCase, make the directory in setUp (or
// setUpBeforeClass) and remove it in tearDown (or tearDownAfterClass).
declare(strict_types=1);

namespace Kit\Tests;

trait TempDir
{
    /**
     * A new empty directory under the system temp dir, named `<prefix>-<pid>-<random>`.
     * @param int $mode what the directory is created with
     */
    protected static function makeTempDir(string $prefix, int $mode = 0700): string
    {
        $dir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . "/$prefix-" . getmypid() . '-' . bin2hex(random_bytes(4));
        if (!mkdir($dir, $mode)) {
            throw new \RuntimeException("cannot create $dir");
        }
        return $dir;
    }

    /** Removes a file or a directory and everything under it; a symlink is unlinked, never followed. A missing path is fine. */
    protected static function removeTree(string $path): void
    {
        if (is_link($path) || is_file($path)) {
            @unlink($path);
            return;
        }
        if (!is_dir($path)) {
            return;
        }
        foreach (array_diff(scandir($path) ?: [], ['.', '..']) as $name) {
            self::removeTree("$path/$name");
        }
        @rmdir($path);
    }
}
