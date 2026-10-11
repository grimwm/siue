<?php
// Operation Tankity rooms. Room server settings: what a room is (code shape, seats, AI names) and the knobs the
// host can turn (room cap, room age, live window, scores directory) through
// .config.yaml or the environment. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const ROOM_GAME = 'operation-tankity';
const ROOM_CODE_LEN = 4;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const ROOM_SEATS = 4; // seat 0 is always the host; every other seat starts as AI
const ROOM_AI_NAMES = ['REAPER', 'WRAITH', 'SPOTTER'];
const ROOM_MAX_ROOMS = 10; // built-in default; .config.yaml and env can raise it
function room_max_rooms(): int
{
    $raw = (string) tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(1, (int) trim($raw));
    }
    return ROOM_MAX_ROOMS;
}
function room_max_age(): int
{
    $raw = (string) tankity_setting('TANKITY_ROOM_MAX_AGE', 'room_max_age', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(60, (int) trim($raw));
    }
    return 86400;
}
function room_live_secs(): int
{
    $raw = (string) tankity_setting('TANKITY_ROOM_LIVE_SECS', 'room_live_secs', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(60, (int) trim($raw));
    }
    return 600;
}

/* Room score files still live on disk (scores are files; rooms are not),
using the scores setting with the same /var/tmp default as scores.php. */
function room_scores_dir(): string
{
    $d = (string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', '');
    if (trim($d) !== '') {
        return rtrim(trim($d), '/');
    }
    return '/var/tmp';
}
