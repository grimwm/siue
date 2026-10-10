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

// Served: the effects engine, its data and the rendered sprite sheets.
foreach (['games/tankity/fx.js', 'games/tankity/effects.json', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.js', 'games/tankity/game.json', 'games/tankity/sw.js'] as $f) {
    $check("ships $f", isset($set[$f]));
}
$sheets = glob("$site/games/tankity/fx/sprites/*.png") ?: [];
$check('sprite sheets exist', count($sheets) > 0);
foreach ($sheets as $abs) {
    $f = substr($abs, strlen($site) + 1);
    $check("ships $f", isset($set[$f]));
}

// Never served: the effects editor, the Blender scenes and script, authoring
// sources, the room protocol fixtures, maintainer notes and tests.
foreach (['games/tankity/fx-editor.html', 'games/tankity/fx-editor.js', 'games/tankity/fx-editor.css', 'games/tankity/fx/blender/render_fx.py', 'games/tankity/game.yaml', 'games/tankity/README.md', 'games/tankity/smoke-test.js', 'games/tankity/protocol/generate.php', 'games/tankity/protocol/play-my-turn.json'] as $f) {
    $check("keeps back $f", file_exists("$site/$f") && !isset($set[$f]));
}
$leaks = array_values(array_filter($out, fn(string $f): bool => (bool) preg_match('~(\.blend1?|\.wav|\.flac|\.aiff?)$|/fx/blender/|/fx-editor\.|/protocol/|-test\.|^tests/|/src/~', $f)));
$check('no authoring or test files', $leaks === [], implode(', ', $leaks));

echo $fail === 0 ? "DEPLOY-SET-OK\n" : "DEPLOY-SET-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
