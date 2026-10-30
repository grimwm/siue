<?php
// The emailed link lands here: GET in the browser that asked for the link signs in, anywhere else it shows a
// button; POST spends the link and signs in.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

studio_sign_in_serve(static fn(Admin\SignIn $s, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $s->signIn($r) : $s->confirm($r));
