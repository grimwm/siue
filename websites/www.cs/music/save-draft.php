<?php
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
// The editor saves score.json alone: never more than one score and its bundle framing, whatever the account.
music_run('data', fn(Music\Pages $p, Admin\Request $r) => $p->saveDraft($r, $r->method === 'POST' ? music_read_body(Music\ScoreRules::MAX_SCORE_BYTES + 65) : ''));
