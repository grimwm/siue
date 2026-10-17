<?php
// The emailed link lands here: GET shows a button, POST spends the link and signs in.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $p->signIn($r) : $p->confirm($r));
