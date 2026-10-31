<?php
// Visitors: the site's statistics, for a signed-in admin only.
declare(strict_types=1);

require __DIR__ . '/../stats/lib/bootstrap.php';

admin_serve(static fn(Admin\Pages $p, Admin\Request $r): Admin\Response => Stats\Dashboard::serve($p, $r, static fn(): PDO => Stats\Db::open(Admin\Db::dataDir()), time()));
