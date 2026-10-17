<?php
// {"mail":"yes|no","db":"yes|no"}: the database opens, the SMTP server greets us.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => $p->health(), true);
