<?php
declare(strict_types=1);
require __DIR__ . '/../lib/bootstrap.php';
music_run('api', fn(Music\Api $a, Admin\Request $r) => $a->sealKey($r, fn(int $n): string => music_read_body($n)));
