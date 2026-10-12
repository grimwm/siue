<?php
// Tests for the set of files deploy.sh ships (LIST=1 ./deploy.sh, which needs
// no host or password). Run by the PHPUnit case beside it.
declare(strict_types=1);

$site = dirname(__DIR__, 3);
// Probes for the kit's build setup, tests and per-game build config (kept
// home) and a game's built dist/ (shipped), asserted below against the one
// deploy-list run. The probes are untracked files in a
// scratch game folder (a real game's install files hash its whole folder),
// removed again afterwards. The build.json probe sits one folder down
// because the games' check script would try to build a game with a real one.
$probes = ['games/zz-probe/nested/build.json', 'games/zz-probe/test/engine.test.mjs', 'games/zz-probe/dist/main.js', 'games/zz-probe/dist/main.js.map'];
$made = [];
foreach ($probes as $f) {
    if (file_exists("$site/$f")) {
        continue;
    }
    $dir = dirname("$site/$f");
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    file_put_contents("$site/$f", "probe\n");
    $made[] = $f;
}
$out = [];
$code = 0;
try {
    exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./deploy.sh 2>&1', $out, $code);
} finally {
    foreach ($made as $f) {
        unlink("$site/$f");
    }
    foreach (['games/zz-probe/test', 'games/zz-probe/dist', 'games/zz-probe/nested', 'games/zz-probe'] as $d) {
        if (is_dir("$site/$d") && count(scandir("$site/$d")) === 2) {
            rmdir("$site/$d");
        }
    }
}
$check('list-runs', $code === 0, implode(' | ', array_slice($out, -3)));
$set = array_flip($out);

// Served: the game and effects-engine bundles and the rendered sprite sheets (the effects data rides game.json).
foreach (['games/tankity/dist/main.js', 'games/tankity/dist/fx.js', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.json', 'games/tankity/sw.js', 'games/tankity/rooms.php', 'games/tankity/server/settings.php', 'games/tankity/server/store.php', 'games/tankity/server/sim.php', 'games/tankity/server/ai.php', 'games/tankity/server/rules.php', 'games/tankity/server/protocol.php', 'games/tankity/server/.htaccess'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The licenses of the npm code inside a game's bundle ship beside it.
$check('ships games/tankity/dist/THIRD_PARTY_LICENSES.txt', isset($set['games/tankity/dist/THIRD_PARTY_LICENSES.txt']));
$check('ships games/crete/dist/THIRD_PARTY_LICENSES.txt', isset($set['games/crete/dist/THIRD_PARTY_LICENSES.txt']));
// Cylon: the bundle, its page pieces and server.
foreach (['games/cylon/dist/main.js', 'games/cylon/css/eye.css', 'games/cylon/css/units.css', 'games/cylon/css/intro.css', 'games/cylon/mount.html', 'games/cylon/scores.php', 'games/cylon/manifest.webmanifest'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The site's own scripts: compiled from src/, served from the root and play/.
foreach (['main.js', 'play/play.js', 'play/play.css', 'index.html'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The root .htaccess carries the page revalidation header.
$check('ships-root-htaccess', isset($set['.htaccess']));
// Crete: the bundle, its page and PWA files.
foreach (['games/crete/index.html', 'games/crete/dist/main.js', 'games/crete/game.css', 'games/crete/sw.js', 'games/crete/manifest.webmanifest'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The game is loaded from its own folder; nothing of it sits at the site root.
foreach (['mount.html', 'cylon-mount.html'] as $f) {
    $check("no root copy of $f", !isset($set[$f]) && !file_exists("$site/$f"));
}
$sheets = glob("$site/games/tankity/fx/sprites/*.png") ?: [];
$check('sprite sheets exist', count($sheets) > 0);
foreach ($sheets as $abs) {
    $f = substr($abs, strlen($site) + 1);
    $check("ships $f", isset($set[$f]));
}

// Never served: authoring sources, build setup, tools, tests and notes. The
// rule is a pattern over every tracked file, so a new test, source or config
// needs no entry here: it is kept back by what it is.
const NEVER_SHIPS = '~'
    . '(^|/)src/|(^|/)tools/|^tests/|/protocol/|/node_modules/'
    . '|^games/(_kit/|package(-lock)?\.json$|\.gitignore$)|/build\.json$|/test/'
    . '|-test\.[a-z]+$|(^|/)test\.sh$|(^|/)tsconfig[^/]*\.json$|(^|/)package(-lock)?\.json$'
    . '|(^|/)\.gitignore$|^games/[^/]+/test/|(^|/)README\.md$|/fx-editor\.|/fx/blender/|^games/tankity/game\.yaml$'
    . '|\.(blend1?|wav|flac|aiff?)$'
    . '~';
$tracked = [];
exec('cd ' . escapeshellarg($site) . ' && git ls-files', $tracked);
$kept = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match(NEVER_SHIPS, $f)));
$check('the rule matches the authoring files', count($kept) > 80, (string) count($kept));
foreach (['games/tankity/src/sim.ts', 'games/tankity/test/smoke.test.mjs', 'games/tankity/protocol/sim-vectors.json', 'games/tankity/dist/fx-editor.js',
    'games/cylon/src/state.ts', 'games/crete/src/engine.ts', 'src/main.ts', 'tools/ts-build.mjs', 'tsconfig.json'] as $f) {
    $check("the rule covers $f", in_array($f, $kept, true));
}
$shipped = array_values(array_filter($kept, fn(string $f): bool => isset($set[$f])));
$check('keeps back every authoring file', $shipped === [], implode(', ', $shipped));
$leaks = array_values(array_filter($out, fn(string $f): bool => (bool) preg_match(NEVER_SHIPS, $f)));
$check('ships no authoring or test files', $leaks === [], implode(', ', $leaks));
// Every built bundle and its map ships, except the dev-only effects editor's.
$built = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match('~^games/[^/]+/dist/~', $f) && !str_contains($f, '/fx-editor.')));
$missing = array_values(array_filter($built, fn(string $f): bool => !isset($set[$f])));
$check('ships every built file', count($built) >= 8 && $missing === [], implode(', ', $missing));

$check('node_modules never ships', array_filter($out, fn(string $f): bool => str_contains($f, 'node_modules')) === []);
$check('composer-files-stay-home', !array_intersect(['composer.json', 'composer.lock', 'phpunit.xml'], $out), '');
$check('vendor-stays-home', !array_filter($out, fn($f) => str_starts_with($f, 'vendor/')), '');
$check('kit-php-stays-home', !array_filter($out, fn($f) => str_starts_with($f, 'games/_kit/')), '');

// games/node_modules is gitignored, so it can never be listed; assert absence.
foreach (['games/_kit/ports.ts', 'games/_kit/test/prefs.test.mjs', 'games/node_modules/x/index.js', 'games/package.json', 'games/package-lock.json', 'games/.gitignore', 'games/zz-probe/nested/build.json', 'games/zz-probe/test/engine.test.mjs'] as $f) {
    $check("never-ships-$f", !in_array($f, $out, true), '');
}
foreach (['games/zz-probe/dist/main.js', 'games/zz-probe/dist/main.js.map'] as $f) {
    $check("ships-$f", in_array($f, $out, true), '');
}
