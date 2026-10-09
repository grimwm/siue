<?php
// Focused test for .config.yaml precedence. Run: php config-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$fail = 0;
$check = function (string $name, bool $cond) use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . "\n";
    if (!$cond) {
        $fail++;
    }
};

$oldConfigFile = getenv('CONFIG_FILE');
$oldMax = getenv('TANKITY_MAX_ROOMS');
$tmp = sys_get_temp_dir() . '/tankity-config-test-' . getmypid();
@mkdir($tmp);

// Default path is the game directory when CONFIG_FILE is unset.
putenv('CONFIG_FILE');
tankity_config(true);
$check('default-path', tankity_config_path() === __DIR__ . '/.config.yaml');

// A missing file falls back to built-in defaults.
putenv('CONFIG_FILE=' . $tmp . '/nope.yaml');
tankity_config(true);
$check('missing-default', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === 10);

// File values are picked up; comments and quotes are tolerated.
file_put_contents(
    $tmp . '/a.yaml',
    "# a comment\nmax_rooms: 3\nscores_dir: \"/tmp/sco\" # trailing note\nroom_max_age: '60'\nblank: \n"
);
putenv('CONFIG_FILE=' . $tmp . '/a.yaml');
tankity_config(true);
$check('file-max', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === '3');
$check('file-dir', tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', '/var/tmp') === '/tmp/sco');
$check('file-age', tankity_setting('TANKITY_ROOM_MAX_AGE', 'room_max_age', 86400) === '60');
$check('file-blank-default', tankity_setting('TANKITY_X', 'blank', 'dflt') === 'dflt');

// The environment beats the file.
putenv('TANKITY_MAX_ROOMS=7');
$check('env-beats-file', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === '7');
putenv('TANKITY_MAX_ROOMS');
tankity_config(true);
$check('env-cleared-file', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === '3');

// Loading never writes: bytes and mtime are identical afterwards.
$before = file_get_contents($tmp . '/a.yaml');
$mtBefore = filemtime($tmp . '/a.yaml');
tankity_config(true);
clearstatcache();
$check(
    'never-writes',
    file_get_contents($tmp . '/a.yaml') === $before && filemtime($tmp . '/a.yaml') === $mtBefore
);

@unlink($tmp . '/a.yaml');
@rmdir($tmp);
if (is_string($oldConfigFile)) {
    putenv('CONFIG_FILE=' . $oldConfigFile);
} else {
    putenv('CONFIG_FILE');
}
if (is_string($oldMax)) {
    putenv('TANKITY_MAX_ROOMS=' . $oldMax);
}
exit($fail ? 1 : 0);
