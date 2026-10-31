<?php
// Helpers the stats tests share. Not named *Test.php, so PHPUnit does not run it.
declare(strict_types=1);

require_once __DIR__ . '/AdminFakes.php';
require_once __DIR__ . '/../../stats/lib/bootstrap.php';

/** A stats database in a fresh temp directory. */
function stats_tmp_db(): PDO
{
    return Stats\Db::open(admin_tmp_dir());
}

/** 2026-10-15 12:00 in Chicago (17:00 UTC), a Thursday. */
const STATS_NOON = 1_792_083_600;

const STATS_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const STATS_PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** A collector on $db with the clock at $now and the pages home, crete, tankity and cylon. */
function stats_collector(PDO $db, FakeClock $clock): Stats\Collector
{
    return new Stats\Collector($db, $clock, 'www.cs.siue.edu', static fn(): array => ['home', 'crete', 'tankity', 'cylon']);
}

/**
 * Posts $payload as the beacon would, returning the status.
 *
 * @param array<string, mixed> $payload
 * @param array<string, string> $headers
 */
function stats_post(Stats\Collector $c, array $payload, array $headers = [], string $ip = '198.51.100.7', string $ua = STATS_UA): int
{
    $body = json_encode($payload, JSON_THROW_ON_ERROR);
    return $c->handle('POST', $headers + ['origin' => 'https://www.cs.siue.edu', 'sec-fetch-site' => 'same-origin'], $body, $ip, $ua);
}

/** A page view payload; override only what a test cares about. @return array<string, mixed> */
function stats_view(array $with = []): array
{
    return $with + ['t' => 'v', 'p' => 'crete', 'pv' => bin2hex(random_bytes(8)), 'sid' => str_repeat('a', 16), 'vid' => str_repeat('b', 32), 'r' => '', 'tp' => 0, 'sw' => 900];
}

/** An event payload. @return array<string, mixed> */
function stats_event(string $name, ?string $prop = null, array $with = []): array
{
    return $with + ['t' => 'e', 'p' => 'crete', 'sid' => str_repeat('a', 16), 'vid' => str_repeat('b', 32), 'n' => $name] + ($prop === null ? [] : ['k' => $prop]);
}
