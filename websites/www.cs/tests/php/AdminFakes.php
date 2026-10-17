<?php
// Helpers the admin tests share. Not named *Test.php, so PHPUnit does not run it.
declare(strict_types=1);

require_once __DIR__ . '/../../admin/lib/bootstrap.php';

/** A clock the test sets. */
final class FakeClock implements Admin\Clock
{
    public function __construct(public int $now = 1_000_000)
    {
    }

    public function now(): int
    {
        return $this->now;
    }
}

/** A fresh private directory under the system temp dir; removed at shutdown. */
function admin_tmp_dir(): string
{
    static $made = [];
    $dir = sys_get_temp_dir() . '/admin-test-' . bin2hex(random_bytes(6));
    mkdir($dir, 0700);
    $made[] = $dir;
    if (count($made) === 1) {
        register_shutdown_function(static function () use (&$made): void {
            foreach ($made as $d) {
                exec('rm -rf ' . escapeshellarg($d));
            }
        });
    }
    return $dir;
}

/** A database in a fresh temp directory. */
function admin_tmp_db(): PDO
{
    return Admin\Db::open(admin_tmp_dir());
}

/** A request as the endpoints see it; override only what a test cares about. */
function req(array $with = []): Admin\Request
{
    $a = $with + [
        'method' => 'GET', 'ip' => '203.0.113.9', 'https' => true, 'host' => 'www.cs.siue.edu',
        'headers' => [], 'cookies' => [], 'post' => [], 'query' => [], 'agent' => 'PHPUnit',
    ];
    return new Admin\Request($a['method'], $a['ip'], $a['https'], $a['host'], $a['headers'], $a['cookies'], $a['post'], $a['query'], $a['agent']);
}
