<?php
// Keeps Cylon installable from the site page: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Cylon's config.
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), ['kind' => 'start'], $argv));
