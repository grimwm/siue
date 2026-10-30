<?php
// Sign out (POST); ?all=1 signs out everywhere for this account.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

studio_sign_in_serve(static function (Admin\SignIn $s, Admin\Request $r): Admin\Response {
    if ($r->method !== 'POST') {
        return new Admin\Response(303, Admin\Headers::apply(['Location' => 'index.php']), '');
    }
    return ($r->query['all'] ?? '') === '1' ? $s->signOutEverywhere($r) : $s->signOut($r);
});
