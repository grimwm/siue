<?php
// .config.yaml precedence: defaults, file values, environment overrides.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 3));
}
require_once TANKITY_GAME_DIR . '/config.php';


$oldConfigFile = getenv('CONFIG_FILE');
$oldMax = getenv('TANKITY_MAX_ROOMS');
$oldDir = getenv('TANKITY_DATA_DIR');
$tmp = sys_get_temp_dir() . '/tankity-config-test-' . getmypid();
@mkdir($tmp);

// Default path is the game directory when CONFIG_FILE is unset.
putenv('CONFIG_FILE');
tankity_config(true);
$check('default-path', tankity_config_path() === TANKITY_GAME_DIR . '/.config.yaml');

// A missing file falls back to built-in defaults.
putenv('CONFIG_FILE=' . $tmp . '/nope.yaml');
tankity_config(true);
$check('missing-default', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === 10);

// File values are picked up; comments and quotes are tolerated.
file_put_contents(
    $tmp . '/a.yaml',
    "# a comment\nmax_rooms: 3\ndata_dir: \"/tmp/sco\" # trailing note\nroom_live_secs: '60'\nblank: \n"
);
putenv('CONFIG_FILE=' . $tmp . '/a.yaml');
tankity_config(true);
$check('file-max', tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', 10) === '3');
$check('file-dir', tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/sco');
putenv('TANKITY_DATA_DIR=/tmp/env-dir');
$check('env-dir-beats-file', tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/env-dir');
putenv('TANKITY_DATA_DIR');
$check('file-live', tankity_setting('TANKITY_ROOM_LIVE_SECS', 'room_live_secs', 600) === '60');
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
if (is_string($oldDir)) {
    putenv('TANKITY_DATA_DIR=' . $oldDir);
}
