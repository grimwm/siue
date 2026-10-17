<?php
// The API key panel: list, create (the key is shown once) and revoke.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $p->keysAction($r) : $p->keysPanel($r));
