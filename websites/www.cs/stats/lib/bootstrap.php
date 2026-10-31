<?php
// The site's visitor statistics: the admin kit (its storage folder and clock) plus the stats classes.
declare(strict_types=1);

require_once __DIR__ . '/../../admin/lib/bootstrap.php';
require_once __DIR__ . '/Db.php';
require_once __DIR__ . '/Days.php';
require_once __DIR__ . '/Classify.php';
require_once __DIR__ . '/Rollup.php';
require_once __DIR__ . '/Collector.php';
require_once __DIR__ . '/Report.php';
require_once __DIR__ . '/Dashboard.php';

/** POST stats/collect.php: store what the beacon sent, answer 204 (405 for another method), never any data. */
function stats_collect(): void
{
    $r = Admin\Request::fromGlobals();
    $length = $_SERVER['CONTENT_LENGTH'] ?? null;
    if (is_string($length) && $length !== '') {
        $r->headers['content-length'] = $length;
    }
    $status = 204;
    if ($r->method !== 'POST') {
        $status = 405;
    } else {
        $body = (string) file_get_contents('php://input', false, null, 0, Stats\Collector::MAX_BODY + 1);
        try {
            $db = Stats\Db::open(Admin\Db::dataDir());
            $status = (new Stats\Collector($db, new Admin\SystemClock(), $r->host))->handle($r->method, $r->headers, $body, $r->ip, $r->agent);
        } catch (\Throwable $e) {
            error_log('stats: ' . get_class($e) . ': ' . $e->getMessage());
        }
    }
    http_response_code($status);
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Robots-Tag: noindex, nofollow');
    if ($status === 405) {
        header('Allow: POST');
    }
}
