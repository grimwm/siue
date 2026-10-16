<?php
// Keeps Cylon installable from the site page: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Cylon's config (it also keeps server/score-guard.php and server/blocked-initials.json current).
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), ['kind' => 'start', 'kit_php' => ['score-guard.php', 'blocked-initials.json']], $argv));
