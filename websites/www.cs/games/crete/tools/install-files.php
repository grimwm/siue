<?php
// Keeps The Island of Crete installable: php tools/install-files.php [--check].
// The work is games/_kit/php/install-core.php; this is Crete's config.
declare(strict_types=1);
require_once __DIR__ . '/../../_kit/php/install-core.php';

exit(install_run(dirname(__DIR__), [
    'kind' => 'play',
    'versioned' => ['dist/main.js', 'dist/install.js', 'dist/kit.css', 'game.css'],
    'precache_dirs' => ['dist', 'fx/sprites'],
    'precache_exclude' => ['tiles-test.*'],
], $argv));
