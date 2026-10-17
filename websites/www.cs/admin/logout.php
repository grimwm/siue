<?php
// Sign out (POST); ?all=1 signs out everywhere.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static function (Admin\Pages $p, Admin\Request $r): Admin\Response {
    if ($r->method !== 'POST') {
        return $p->requireAdmin($r) ?? new Admin\Response(303, Admin\Headers::apply(['Location' => 'index.php']), '');
    }
    return ($r->query['all'] ?? '') === '1' ? $p->signOutEverywhere($r) : $p->signOut($r);
});
