<?php
// The hub, and the POST that removes a key it lists.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $r->method === 'POST' ? $p->removeKey($r) : $p->hub($r));
