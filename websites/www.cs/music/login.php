<?php
// Sign-in: the address form (GET) and the link request (POST).
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

studio_sign_in_serve(static fn(Admin\SignIn $s, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $s->requestLink($r) : $s->loginForm($r));
