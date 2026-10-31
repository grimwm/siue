<?php
// A mailed confirmation link (Forgot your passphrase, Start over) lands here: GET shows what its button deletes and
// deletes nothing; POST, the button, does it.
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
music_run('page', fn(Music\Pages $p, Admin\Request $r) => $p->confirm($r));
