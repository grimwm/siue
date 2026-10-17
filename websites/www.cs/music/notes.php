<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
music_run('data', fn(Music\Pages $p, Music\Api $a, Admin\Request $r) => $p->notes($r, $r->method === 'POST' ? music_read_body(Music\Store::MAX_NOTE_BYTES + 1) : ''));
