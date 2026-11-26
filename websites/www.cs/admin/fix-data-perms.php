<?php
// admin/fix-data-perms.php
// One-shot (Nov 25, 2026): the stats migration's transfer job logs in as
// wgrim, but the stats database is owned by the web-server user (uid 48)
// with mode 600, so sftp cannot read it. This script runs as that user and
// makes the migration's files readable: it chmods admin/data/stats.sqlite
// (and its -wal/-shm, when present) to 0644, and stages Tankity's database
// — which lives in /var/tmp/<username>-tankity on this host, because
// games/tankity/data/ cannot be created here — as admin/data/tankity.sqlite
// (0644) for the transfer to fetch. It returns no data, only what it did.
// Remove it, with the transfer job, once the migration has run.
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$site = dirname(__DIR__);
$lines = [];

function fix_perms_chmod(string $path): string
{
    if (!file_exists($path)) {
        return 'missing';
    }
    return @chmod($path, 0644) ? 'ok' : 'chmod-failed';
}

// 1. The stats database: owned by this user, mode 600.
$stats = $site . '/admin/data/stats.sqlite';
foreach (['', '-wal', '-shm'] as $suffix) {
    $lines[] = 'stats.sqlite' . $suffix . ': ' . fix_perms_chmod($stats . $suffix);
}

// 2. Tankity's database: games/tankity/data/ when it exists, else the
// /var/tmp/<username>-tankity fallback the game itself uses.
$source = null;
foreach ([$site . '/games/tankity/data/tankity.sqlite'] as $candidate) {
    if (file_exists($candidate)) {
        $source = $candidate;
        break;
    }
}
if ($source === null) {
    $found = glob('/var/tmp/*-tankity/tankity.sqlite') ?: [];
    $source = $found[0] ?? null;
}
if ($source === null) {
    $lines[] = 'tankity.sqlite: no database found, nothing staged';
} else {
    $staged = $site . '/admin/data/tankity.sqlite';
    $copied = @copy($source, $staged) && @chmod($staged, 0644);
    $lines[] = 'tankity.sqlite: ' . ($copied ? 'staged from ' . $source : 'copy-failed from ' . $source);
    foreach (['-wal', '-shm'] as $suffix) {
        if (!file_exists($source . $suffix)) {
            $lines[] = 'tankity.sqlite' . $suffix . ': missing';
            continue;
        }
        $ok = @copy($source . $suffix, $staged . $suffix) && @chmod($staged . $suffix, 0644);
        $lines[] = 'tankity.sqlite' . $suffix . ': ' . ($ok ? 'staged' : 'copy-failed');
    }
}

echo implode("\n", $lines) . "\n";
