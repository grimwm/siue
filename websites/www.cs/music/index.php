<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
music_run('page', fn(Music\Pages $p, Admin\Request $r) => $p->index($r));
