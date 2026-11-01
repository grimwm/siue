<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
// The editor saves score.json and the new vocal takes it names: never more than a score, a studio's worth of takes
// and the bundle's framing, whatever the account.
music_run('data', fn(Music\Pages $p, Admin\Request $r) => $p->saveDraft($r, $r->method === 'POST' ? music_read_body(Music\Limits::SAVE_REQUEST_BYTES + 1) : ''));
