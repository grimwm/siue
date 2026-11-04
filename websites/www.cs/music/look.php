<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
// The composer's Colors And Style choice, kept for the account.
music_run('data', fn(Music\Pages $p, Admin\Request $r) => $p->saveLook($r));
