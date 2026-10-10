<?php
// Tests for tools/game-json.php: the YAML-subset parser, the game.yaml
// schema checks, and the --check workflow. Run: php game-json-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/tools/game-json.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};
/** The message a parse or render throws, or null when it succeeds. */
$errOf = function (callable $f): ?string {
    try {
        $f();
        return null;
    } catch (TankityConfigError $e) {
        return $e->getMessage();
    }
};
$parse = fn(string $y) => tankity_yaml_parse($y);

// ---- parser: good input ----
$check('scalars', $parse("a: 1\nb: -2\nc: 1.5\nd: true\ne: false\nf: null\ng: ~\nh:\ni: hello world\nj: 1e3\nk: 007\n")
    === ['a' => 1, 'b' => -2, 'c' => 1.5, 'd' => true, 'e' => false, 'f' => null, 'g' => null, 'h' => null, 'i' => 'hello world', 'j' => 1000.0, 'k' => '007'],
    json_encode($parse("a: 1\nj: 1e3\nk: 007\n")));
$check('quoted', $parse("a: \"x: y # z\"\nb: 'it''s'\nc: \"tab\\there\\u0041\"\nd: \"5\"\n")
    === ['a' => 'x: y # z', 'b' => "it's", 'c' => "tab\thereA", 'd' => '5']);
$check('apostrophe-in-plain', $parse("a: Don't stop\nb: it's a 'thing'\n") === ['a' => "Don't stop", 'b' => "it's a 'thing'"]);
$check('comments', $parse("# top\na: 1 # trailing\n\n   # indented comment\nb: \"#keep\" # and this\nc: x#notcomment\n")
    === ['a' => 1, 'b' => '#keep', 'c' => 'x#notcomment']);
$check('nested-mapping', $parse("a:\n  b:\n    c: 1\n  d: 2\ne: 3\n") === ['a' => ['b' => ['c' => 1], 'd' => 2], 'e' => 3]);
$check('block-sequence', $parse("a:\n  - 1\n  - two\n  - \"3\"\n") === ['a' => [1, 'two', '3']]);
$check('sequence-at-key-indent', $parse("a:\n- 1\n- 2\nb: 3\n") === ['a' => [1, 2], 'b' => 3]);
$check('sequence-of-mappings', $parse("rows:\n  - key: a\n    n: 1\n  - key: b\n    inner:\n      x: y\n    n: 2\n")
    === ['rows' => [['key' => 'a', 'n' => 1], ['key' => 'b', 'inner' => ['x' => 'y'], 'n' => 2]]]);
$check('sequence-item-with-nested-block', $parse("rows:\n  -\n    k: v\n  - w\n") === ['rows' => [['k' => 'v'], 'w']]);
$check('flow-sequence', $parse("a: [x, 2, \"c, d\", [1, 2], {k: v}]\nb: []\nc: [a, b,]\n")
    === ['a' => ['x', 2, 'c, d', [1, 2], ['k' => 'v']], 'b' => [], 'c' => ['a', 'b']]);
$check('flow-mapping', $parse("a: {shell: \"#ffe27a\", n: 1, blast: [\"#fff\", \"#000\"], z: }\n")
    === ['a' => ['shell' => '#ffe27a', 'n' => 1, 'blast' => ['#fff', '#000'], 'z' => null]]);
$check('flow-in-sequence-item', $parse("- {a: 1}\n- [1, 2]\n") === [['a' => 1], [1, 2]]);
$check('quoted-key', $parse("\"a b\": 1\n'c': 2\n") === ['a b' => 1, 'c' => 2]);
$check('crlf', $parse("a: 1\r\nb:\r\n  - 2\r\n") === ['a' => 1, 'b' => [2]]);
$check('empty-document', $parse("# nothing\n\n") === null);
$lm = [];
tankity_yaml_parse("a:\n  b: 1\n  rows:\n    - x: 1\n      y: 2\n    - x: 3\n", $lm);
$check('line-map', ($lm['a'] ?? 0) === 1 && ($lm['a.b'] ?? 0) === 2 && ($lm['a.rows[0]'] ?? 0) === 4
    && ($lm['a.rows[0].y'] ?? 0) === 5 && ($lm['a.rows[1].x'] ?? 0) === 6, json_encode($lm));

// ---- parser: bad input, each error names its line ----
$bad = [
    'tab' => ["a: 1\n\tb: 2\n", 'line 2: tabs'],
    'duplicate-key' => ["a: 1\nb: 2\na: 3\n", 'line 3: duplicate key `a`'],
    'duplicate-flow-key' => ["a: {x: 1, x: 2}\n", 'line 1: duplicate key `x`'],
    'unclosed-flow-seq' => ["ok: 1\na: [1, 2\n", 'line 2:'],
    'unclosed-flow-map' => ["a: {x: 1\n", 'line 1:'],
    'unterminated-quote' => ["a: 1\nb: \"oops\n", 'line 2: unterminated'],
    'anchor' => ["a: &x 1\n", 'line 1:'],
    'alias' => ["a: *x\n", 'line 1:'],
    'tag' => ["a: !!str 1\n", 'line 1:'],
    'block-scalar' => ["a: |\n  text\n", 'line 1:'],
    'folded-scalar' => ["a: >\n  text\n", 'line 1:'],
    'bad-indent' => ["a:\n    b: 1\n  c: 2\n", 'line 3: unexpected indentation'],
    'deeper-after-scalar' => ["a: 1\n  b: 2\n", 'line 2: unexpected indentation'],
    'no-colon' => ["a: 1\njust text\n", 'line 2: expected `key: value`'],
    'doc-marker' => ["---\na: 1\n", 'line 1: document markers'],
    'seq-in-seq' => ["- - a\n", 'line 1:'],
    'list-where-key' => ["a: 1\n- b\n", 'line 2:'],
    'trailing-junk' => ["a: [1] x\n", 'line 1: unexpected text'],
    'bad-escape' => ["a: \"\\q\"\n", 'line 1: unknown escape'],
    'missing-flow-colon' => ["a: {x 1}\n", 'line 1:'],
];
foreach ($bad as $name => [$yaml, $want]) {
    $e = $errOf(fn() => $parse($yaml));
    $check("bad-$name", $e !== null && str_contains($e, $want), (string) $e);
}

// ---- schema ----
$tmp = sys_get_temp_dir() . '/game-json-test-' . getmypid();
@mkdir("$tmp/audio/sfx", 0777, true);
@mkdir("$tmp/audio/music", 0777, true);
file_put_contents("$tmp/audio/sfx/boom.mp3", 'x');
file_put_contents("$tmp/audio/music/a.mp3", 'x');
file_put_contents("$tmp/audio/notes.txt", 'x');
@mkdir(dirname($tmp) . '/tankity-outside-' . getmypid());
file_put_contents(dirname($tmp) . '/tankity-outside-' . getmypid() . '/o.mp3', 'x');

$keysYaml = '';
foreach (TANKITY_KEY_ACTIONS as $ctx => $actions) {
    $keysYaml .= "  $ctx:\n";
    foreach ($actions as $i => $a) {
        $keysYaml .= "    $a: [Tok$ctx$i]\n";
    }
}
$good = <<<YAML
arsenal:
  ammo:
    - key: shell
      name: Shell
      cat: Shells
      dmg: 34
      radius: 26
      price: 0
      pack: 0
      minRound: 1
      ai: true
      aiRound: 1
      effect: shot
      speed: 1.0
      note: Free and honest.
      gfx: {shell: "#ffe27a", trail: "#ffd75e", blast: ["#ffb13c", "#fff3c4"], painter: disc, shake: 0.3}
    - key: buck
      name: Buckshot
      cat: Shells
      dmg: 17
      radius: 20
      price: 80
      pack: 2
      minRound: 1
      ai: true
      aiRound: 2
      effect: pellets
      pellets: 3
      spread: 0.1
      speed: 1.0
      flat: true
      note: Three pellets.
      gfx: {shell: "#FFD166", trail: "#fb3", blast: ["#ffb13c", "#fff3c4"], painter: spark, shake: 0.3}
  gear:
    - key: repair
      name: Repair +40 armor
      cat: Hull and fuel
      price: 120
      n: 40
      effect: repair
      note: Restores armor.
    - key: laststand
      name: Last stand
      cat: Tricks
      price: 125
      n: 1
      effect: laststand
      dmg: 50
      radius: 44
      note: Your wreck detonates.
keys:
$keysYaml
audio:
  sfx:
    boom: {file: audio/sfx/boom.mp3, volume: 0.5}
    click:
  music:
    - file: audio/music/a.mp3
      title: Theme
      volume: 0.7
      credit: Someone, CC0
YAML;
$good .= "\n";
$render = fn(string $y) => tankity_config_render($y, $tmp);
/** The good document with one textual replacement. */
$mut = function (string $from, string $to) use ($good): string {
    if (substr_count($good, $from) < 1) {
        throw new LogicException("fixture lacks: $from");
    }
    return str_replace($from, $to, $good);
};

$out = null;
$e = $errOf(function () use ($render, $good, &$out) {
    $out = json_decode($render($good), true);
});
$check('good-renders', $e === null && is_array($out), (string) $e);
$check('good-shape', isset($out['arsenal']['ammo'][1]['pellets'], $out['keys']['aim']['barrelLeft'], $out['audio']['music'][0]['title'])
    && $out['audio']['sfx']['boom'] === ['file' => 'audio/sfx/boom.mp3', 'volume' => 0.5]
    && !isset($out['audio']['sfx']['click']));
$check('colours-lowercased', ($out['arsenal']['ammo'][1]['gfx']['shell'] ?? '') === '#ffd166');
$check('optional-flat-kept', ($out['arsenal']['ammo'][1]['flat'] ?? null) === true && !isset($out['arsenal']['ammo'][0]['flat']));
$check('volume-defaults-to-1', ($out['audio']['music'][0]['volume'] ?? 0) === 0.7
    && (json_decode($render($mut("      volume: 0.7\n", '')), true)['audio']['music'][0]['volume'] ?? 0) === 1.0);
$check('deterministic', $render($good) === $render($good) && str_ends_with($render($good), "}\n"));
$check('empty-audio-ok', ($d = json_decode($render(preg_replace('/audio:.*/s', "audio:\n  sfx:\n  music:\n", $good)), true)) !== null
    && $d['audio']['music'] === []);
$check('empty-sfx-is-object', str_contains($render(preg_replace('/audio:.*/s', "audio:\n  sfx:\n  music: []\n", $good)), '"sfx": {}'));

$cases = [
    // name => [yaml, substring that must appear in the error]
    'unknown-top-key' => [$good . "\nextra: 1\n", 'unknown key'],
    'missing-section' => [preg_replace('/\naudio:.*/s', "\n", $good), 'section `audio` is required'],
    'unknown-ammo-field' => [$mut("      dmg: 34\n", "      dmg: 34\n      dmgg: 3\n"), 'arsenal.ammo[0].dmgg: unknown key'],
    'missing-required' => [$mut("      radius: 26\n", ''), 'arsenal.ammo[0].radius: is required'],
    'dmg-range' => [$mut("      dmg: 34\n", "      dmg: 9000\n"), 'arsenal.ammo[0].dmg: must be a whole number from 1 to 500'],
    'dmg-float' => [$mut("      dmg: 34\n", "      dmg: 34.5\n"), 'arsenal.ammo[0].dmg'],
    'dmg-string' => [$mut("      dmg: 34\n", "      dmg: lots\n"), 'arsenal.ammo[0].dmg'],
    'bad-effect' => [$mut('effect: shot', 'effect: laser'), 'arsenal.ammo[0].effect: must be one of'],
    'bad-gear-effect' => [$mut('effect: repair', 'effect: heal'), 'arsenal.gear[0].effect: must be one of'],
    'bad-painter' => [$mut('painter: disc', 'painter: blob'), 'painter: must be one of'],
    'bad-colour' => [$mut('"#ffe27a"', 'red'), 'arsenal.ammo[0].gfx.shell: must be a quoted'],
    'unquoted-colour-is-comment' => [$mut('shell: "#ffe27a"', 'shell: #ffe27a'), 'a value is missing'],
    'blast-count' => [$mut('blast: ["#ffb13c", "#fff3c4"], painter: disc', 'blast: ["#ffb13c"], painter: disc'), 'blast: must list exactly two'],
    'shake-range' => [$mut('shake: 0.3}', 'shake: 2}'), 'shake: must be a number from 0 to 1'],
    'bool-type' => [$mut('ai: true', 'ai: yes'), 'arsenal.ammo[0].ai: must be true or false'],
    'bad-key-format' => [$mut('key: buck', 'key: Buck-1'), 'arsenal.ammo[1].key: has the wrong format'],
    'duplicate-key' => [$mut('key: buck', 'key: shell'), 'duplicate key `shell`'],
    'gear-ammo-key-clash' => [$mut('key: repair', 'key: buck'), 'arsenal.gear[0].key: duplicate key'],
    'no-shell' => [$mut('key: shell', 'key: pea'), 'needs a free `shell`'],
    'paid-shell' => [$mut("      price: 0\n", "      price: 5\n"), 'arsenal.ammo[0].price: the `shell` must be free'],
    'pellets-need-fields' => [$mut("      pellets: 3\n", ''), 'arsenal.ammo[1].pellets: is required when effect is pellets'],
    'dmg-on-wrong-gear' => [$mut("      n: 40\n", "      n: 40\n      dmg: 5\n"), 'arsenal.gear[0].dmg: only the laststand'],
    'laststand-needs-dmg' => [$mut("      dmg: 50\n", ''), 'arsenal.gear[1].dmg: is required'],
    'em-dash' => [$mut('Free and honest.', "Free \u{2014} honest."), 'must not contain en or em dashes'],
    'name-too-long' => [$mut('name: Shell', 'name: ' . str_repeat('x', 50)), 'arsenal.ammo[0].name: must be text of 1 to 40'],
    'missing-key-action' => [$mut("    barrelLeft: [Tokaim0]\n", ''), 'keys.aim.barrelLeft: must be a list'],
    'unknown-key-action' => [$mut("    barrelLeft: [Tokaim0]\n", "    barrelLeft: [Tokaim0]\n    fav: [\"1\"]\n"), 'keys.aim.fav: unknown key'],
    'unknown-key-context' => [$mut("  scroll:\n", "  extra: {a: [b]}\n  scroll:\n"), 'keys.extra: unknown key'],
    'empty-token-list' => [$mut('barrelLeft: [Tokaim0]', 'barrelLeft: []'), 'needs at least one key token'],
    'token-with-space' => [$mut('barrelLeft: [Tokaim0]', 'barrelLeft: ["a b"]'), 'must be a quoted key token'],
    'token-is-number' => [$mut('barrelLeft: [Tokaim0]', 'barrelLeft: [1]'), 'must be a quoted key token'],
    'token-reused' => [$mut('barrelRight: [Tokaim1]', 'barrelRight: [Tokaim0]'), 'already bound to barrelLeft'],
    'unknown-sfx-event' => [$mut("    click:\n", "    click:\n    zap: {file: audio/sfx/boom.mp3}\n"), 'audio.sfx.zap: unknown key'],
    'sfx-volume' => [$mut('volume: 0.5', 'volume: 3'), 'audio.sfx.boom.volume: must be a number from 0 to 1'],
    'sfx-missing-file' => [$mut('audio/sfx/boom.mp3', 'audio/sfx/none.mp3'), 'file not found'],
    'sfx-bad-extension' => [$mut('audio/sfx/boom.mp3', 'audio/notes.txt'), 'must end in one of'],
    'sfx-dotdot' => [$mut('audio/sfx/boom.mp3', '../tankity-outside-' . getmypid() . '/o.mp3'), 'relative path inside the game folder'],
    'sfx-absolute' => [$mut('audio/sfx/boom.mp3', '/etc/boom.mp3'), 'relative path inside the game folder'],
    'sfx-url' => [$mut('audio/sfx/boom.mp3', 'https://x.example/b.mp3'), 'relative path inside the game folder'],
    'music-needs-title' => [$mut("      title: Theme\n", ''), 'audio.music[0].title: is required'],
    'music-needs-file' => [$mut("    - file: audio/music/a.mp3\n      title: Theme\n", "    - title: Theme\n"), 'audio.music[0].file'],
    'music-extra-field' => [$mut("      credit: Someone, CC0\n", "      credit: Someone, CC0\n      loop: true\n"), 'audio.music[0].loop: unknown key'],
];
foreach ($cases as $name => [$yaml, $want]) {
    $e = $errOf(fn() => $render($yaml));
    $check("schema-$name", $e !== null && str_contains($e, $want), (string) $e);
}
// Schema errors carry the YAML line of the offending value.
$badDmg = $mut('dmg: 34', 'dmg: 9000');
$n = array_search('      dmg: 9000', explode("\n", $badDmg), true) + 1;
$e = (string) $errOf(fn() => $render($badDmg));
$check('schema-error-has-line', str_starts_with($e, "line $n: arsenal.ammo[0].dmg"), $e);
// Several mistakes are all reported at once.
$e = (string) $errOf(fn() => $render($mut('effect: shot', 'effect: nope') . "\nextra: 1\n"));
$check('schema-reports-all', substr_count($e, "\n") >= 1, $e);

// A symlink or ../ cannot leave the game folder.
@symlink(dirname($tmp) . '/tankity-outside-' . getmypid() . '/o.mp3', "$tmp/audio/sfx/link.mp3");
$e = (string) $errOf(fn() => $render($mut('audio/sfx/boom.mp3', 'audio/sfx/link.mp3')));
$check('schema-symlink-escape', str_contains($e, 'must stay inside the game folder'), $e);

// ---- the shipped game.yaml ----
$repoDir = __DIR__;
$e = $errOf(function () use ($repoDir, &$shipped) {
    $shipped = tankity_config_render((string) file_get_contents("$repoDir/game.yaml"), $repoDir);
});
$check('shipped-yaml-valid', $e === null, (string) $e);
$check('shipped-json-in-sync', $shipped !== null && $shipped === (string) @file_get_contents("$repoDir/game.json"),
    'run: php tools/game-json.php (in games/tankity)');
$sd = json_decode((string) $shipped, true);
$check('shipped-counts', count($sd['arsenal']['ammo'] ?? []) === 12 && count($sd['arsenal']['gear'] ?? []) === 8
    && count($sd['audio']['sfx'] ?? []) >= 1 && count($sd['audio']['music'] ?? []) >= 1);

// ---- --check workflow on a scratch copy of the tool and the game folder ----
$work = "$tmp/work";
@mkdir($work, 0777, true);
exec('cp -R ' . escapeshellarg($repoDir) . ' ' . escapeshellarg("$work/tankity"));
$run = function (string ...$args) use ($work): array {
    $cmd = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg("$work/tankity/tools/game-json.php") . ' ' . implode(' ', array_map('escapeshellarg', $args)) . ' 2>&1';
    exec($cmd, $lines, $rc);
    return [$rc, implode("\n", $lines)];
};
[$rc] = $run('--check');
$check('cli-check-passes-when-in-sync', $rc === 0);
file_put_contents("$work/tankity/game.json", "{}\n");
[$rc, $msg] = $run('--check');
$check('cli-check-detects-stale-json', $rc === 1 && str_contains($msg, 'stale'), $msg);
[$rc] = $run();
[$rc2] = $run('--check');
$check('cli-write-fixes-stale', $rc === 0 && $rc2 === 0 && file_get_contents("$work/tankity/game.json") === $shipped);
unlink("$work/tankity/game.json");
[$rc, $msg] = $run('--check');
$check('cli-check-detects-missing-json', $rc === 1 && str_contains($msg, 'stale'), $msg);
$y = (string) file_get_contents("$work/tankity/game.yaml");
file_put_contents("$work/tankity/game.yaml", preg_replace('/dmg: 34\b/', 'dmg: 99999', $y, 1));
[$rc, $msg] = $run('--check');
$check('cli-check-fails-on-invalid-yaml', $rc === 1 && preg_match('/game\.yaml line \d+: arsenal\.ammo\[0\]\.dmg/', $msg) === 1, $msg);
file_put_contents("$work/tankity/game.yaml", "arsenal:\n\tbad: 1\n");
[$rc, $msg] = $run('--check');
$check('cli-check-fails-on-parse-error', $rc === 1 && str_contains($msg, 'line 2: tabs'), $msg);
file_put_contents("$work/tankity/game.yaml", $y);
@unlink("$work/tankity/audio/music/" . basename($sd['audio']['music'][0]['file']));
[$rc, $msg] = $run('--check');
$check('cli-check-fails-on-missing-audio-file', $rc === 1 && str_contains($msg, 'file not found'), $msg);

exec('rm -rf ' . escapeshellarg($tmp) . ' ' . escapeshellarg(dirname($tmp) . '/tankity-outside-' . getmypid()));
echo $fail === 0 ? "GAME-JSON-OK\n" : "TANKITY-CONFIG-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
