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

// Served: the effects engine, the compiled ES modules and the rendered sprite sheets (the effects data rides game.json).
foreach (['games/tankity/fx.js', 'games/tankity/js/sim.js', 'games/tankity/js/net.js', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.js', 'games/tankity/game.json', 'games/tankity/sw.js'] as $f) {
    $check("ships $f", isset($set[$f]));
}
$sheets = glob("$site/games/tankity/fx/sprites/*.png") ?: [];
$check('sprite sheets exist', count($sheets) > 0);
foreach ($sheets as $abs) {
    $f = substr($abs, strlen($site) + 1);
    $check("ships $f", isset($set[$f]));
}

// Never served: the effects editor, the Blender scenes and script, authoring
// sources, the TypeScript sources and their build setup, the room protocol
// fixtures, maintainer notes and tests.
foreach (['games/tankity/fx-editor.html', 'games/tankity/fx-editor.js', 'games/tankity/fx-editor.css', 'games/tankity/fx/blender/render_fx.py', 'games/tankity/game.yaml', 'games/tankity/README.md', 'games/tankity/smoke-test.js', 'games/tankity/protocol/generate.php', 'games/tankity/protocol/play-my-turn.json', 'games/tankity/protocol/sim-vectors.php', 'games/tankity/protocol/sim-vectors.json', 'games/tankity/sim-vectors-test.js', 'games/tankity/audio-test.js', 'games/tankity/net-test.js', 'games/tankity/protocol-test.js',
    'games/tankity/src/sim.ts', 'games/tankity/src/audio.ts', 'games/tankity/src/net.ts', 'games/tankity/src/protocol.ts', 'games/tankity/src/protocol-fixtures.check.ts', 'games/tankity/src/tsconfig.dom.json', 'games/tankity/src/tsconfig.check.json', 'games/tankity/tsconfig.json', 'games/tankity/package.json', 'games/tankity/package-lock.json',
    'games/tankity/tools/ts-build.mjs', 'games/tankity/.gitignore'] as $f) {
    $check("keeps back $f", file_exists("$site/$f") && !isset($set[$f]));
}
$leaks = array_values(array_filter($out, fn(string $f): bool => (bool) preg_match('~(\.blend1?|\.wav|\.flac|\.aiff?)$|/fx/blender/|/fx-editor\.|/protocol/|-test\.|^tests/|/src/|/node_modules/|/tsconfig\.json$|/package(-lock)?\.json$~', $f)));
$check('no authoring or test files', $leaks === [], implode(', ', $leaks));

$check('node_modules never ships', !is_dir("$site/games/tankity/node_modules") || array_filter($out, fn(string $f): bool => str_contains($f, 'node_modules')) === []);

echo $fail === 0 ? "DEPLOY-SET-OK\n" : "DEPLOY-SET-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
