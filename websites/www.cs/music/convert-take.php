<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
// One Good To The Ear take, never more than a studio's worth.
music_run('data', fn(Music\Pages $p, Admin\Request $r) => $p->convertTake($r, $r->method === 'POST' ? music_read_body(Music\Limits::STUDIO_BYTES + 1) : ''));
