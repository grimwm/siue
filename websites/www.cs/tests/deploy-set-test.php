<?php
// Tests for the set of files deploy.sh ships (LIST=1 ./deploy.sh, which needs
// no host or password). Run: php tests/deploy-set-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$site = dirname(__DIR__);
$out = [];
$code = 0;
exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./deploy.sh 2>&1', $out, $code);
$check('list-runs', $code === 0, implode(' | ', array_slice($out, -3)));
$set = array_flip($out);

// Served: the effects engine, the compiled ES modules, the vendored Preact and the rendered sprite sheets (the effects data rides game.json).
foreach (['games/tankity/fx.js', 'games/tankity/js/sim.js', 'games/tankity/js/net.js', 'games/tankity/js/ui/shop.js', 'games/tankity/js/ui/help.js', 'games/tankity/vendor/preact/preact.module.js', 'games/tankity/vendor/preact/hooks.module.js', 'games/tankity/vendor/preact/jsx-runtime.module.js', 'games/tankity/vendor/preact/LICENSE', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.js', 'games/tankity/game.json', 'games/tankity/sw.js', 'games/tankity/rooms.php', 'games/tankity/server/settings.php', 'games/tankity/server/store.php', 'games/tankity/server/sim.php', 'games/tankity/server/ai.php', 'games/tankity/server/rules.php', 'games/tankity/server/protocol.php', 'games/tankity/server/.htaccess'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// Cylon: the entry module, the compiled modules it imports, its page pieces and server.
foreach (['games/cylon/cylon.js', 'games/cylon/js/rules.js', 'games/cylon/js/playfield.js', 'games/cylon/js/scores.js', 'games/cylon/js/state.js', 'games/cylon/js/intro.js', 'games/cylon/js/units.js', 'games/cylon/js/chrome.js', 'games/cylon/css/eye.css', 'games/cylon/css/units.css', 'games/cylon/css/intro.css', 'games/cylon/mount.html', 'games/cylon/scores.php', 'games/cylon/manifest.webmanifest'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The site's own scripts: compiled from src/, served from the root and play/.
foreach (['main.js', 'play/play.js', 'play/play.css', 'index.html'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// Crete: the entry module, the compiled modules it imports, its page and PWA files.
foreach (['games/crete/index.html', 'games/crete/game.js', 'games/crete/game.css', 'games/crete/js/engine.js', 'games/crete/js/audio.js', 'games/crete/js/ui.js', 'games/crete/sw.js', 'games/crete/manifest.webmanifest'] as $f) {
    $check("ships $f", isset($set[$f]));
}
// The game is loaded from its own folder; nothing of it sits at the site root.
foreach (['cylon.js', 'cylon-mount.html'] as $f) {
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
    . '|-test\.[a-z]+$|(^|/)test\.sh$|(^|/)tsconfig[^/]*\.json$|(^|/)package(-lock)?\.json$'
    . '|(^|/)\.gitignore$|(^|/)README\.md$|/fx-editor\.|/fx/blender/|^games/tankity/game\.yaml$'
    . '|\.(blend1?|wav|flac|aiff?)$'
    . '~';
$tracked = [];
exec('cd ' . escapeshellarg($site) . ' && git ls-files', $tracked);
$kept = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match(NEVER_SHIPS, $f)));
$check('the rule matches the authoring files', count($kept) > 80, (string) count($kept));
foreach (['games/tankity/src/sim.ts', 'games/tankity/smoke-test.js', 'games/tankity/protocol/sim-vectors.json', 'games/tankity/fx-editor.js',
    'games/cylon/src/state.ts', 'games/crete/src/engine.ts', 'src/main.ts', 'tools/ts-build.mjs', 'tsconfig.json'] as $f) {
    $check("the rule covers $f", in_array($f, $kept, true));
}
$shipped = array_values(array_filter($kept, fn(string $f): bool => isset($set[$f])));
$check('keeps back every authoring file', $shipped === [], implode(', ', $shipped));
$leaks = array_values(array_filter($out, fn(string $f): bool => (bool) preg_match(NEVER_SHIPS, $f)));
$check('ships no authoring or test files', $leaks === [], implode(', ', $leaks));
// Every compiled module and vendored file ships.
$built = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match('~^games/[^/]+/(js|vendor)/~', $f)));
$missing = array_values(array_filter($built, fn(string $f): bool => !isset($set[$f])));
$check('ships every compiled and vendored file', count($built) > 10 && $missing === [], implode(', ', $missing));

$check('node_modules never ships', array_filter($out, fn(string $f): bool => str_contains($f, 'node_modules')) === []);

echo $fail === 0 ? "DEPLOY-SET-OK\n" : "DEPLOY-SET-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
