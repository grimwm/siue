<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
music_run('api', fn(Music\Pages $p, Music\Api $a, Admin\Request $r) => $a->publishKeyring($r, fn(int $n) => music_read_body($n)));
