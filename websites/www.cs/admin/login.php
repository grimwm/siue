<?php
// Sign-in: the address form (GET) and the link request (POST).
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $p->requestLink($r) : $p->loginForm($r));
