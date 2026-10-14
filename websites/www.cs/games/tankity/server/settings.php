<?php
// Operation Tankity rooms. Room server settings: what a room is (code shape, seats, AI names) and the knobs the
// host can turn (room cap, live window) through
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
const ROOM_SEATS = 4; // seat 0 hosts a new room (see room_host); every other seat starts as AI
const ROOM_AI_NAMES = ['REAPER', 'WRAITH', 'SPOTTER', 'HUNTER'];
const ROOM_MAX_ROOMS = 50; // built-in default; .config.yaml and env can change it
/* The turn times the host can pick, in seconds: Lightning 1 min, 2 min (the
   default), 10 min, 30 min, 8 h, 24 h, 1 week. src/turn-time.ts holds the same
   list with its labels; test/turn-time.test.mjs keeps them equal. */
const ROOM_TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800];
const ROOM_TURN_DEFAULT = 120;
function room_max_rooms(): int
{
    $raw = (string) tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(1, (int) trim($raw));
    }
    return ROOM_MAX_ROOMS;
}
function room_live_secs(): int
{
    $raw = (string) tankity_setting('TANKITY_ROOM_LIVE_SECS', 'room_live_secs', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(60, (int) trim($raw));
    }
    return 600;
}
/* The room's turn time; anything that is not a stop (a room from before the
   setting) is the default. */
function room_turn_secs(array $room): int
{
    $s = $room['turnSecs'] ?? null;
    return is_int($s) && in_array($s, ROOM_TURN_STOPS, true) ? $s : ROOM_TURN_DEFAULT;
}
/* The shop stays open 90 s in quick rooms (never longer than a turn) and a
   whole turn time in long ones. */
function room_shop_secs(int $turnSecs): int
{
    return $turnSecs <= 120 ? min($turnSecs, 90) : $turnSecs;
}
