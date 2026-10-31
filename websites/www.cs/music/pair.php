<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
music_run('data', fn(Music\Pages $p, Admin\Request $r) => $p->pair($r, $r->method === 'POST' ? music_read_body(1024) : ''));
