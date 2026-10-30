<?php
// The studios: every account's address, usage and last sign-in, and removing one. Never any content.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $p->studiosAction($r) : $p->studios($r));
