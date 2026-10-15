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
   list with its labels; test/turn-time.test.ts keeps them equal. */
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
/* A room with this turn time or longer is a long game (the 8 h stop and up). */
const ROOM_LONG_TURN_SECS = 28800;
const ROOM_LONG_SHARE = 0.5;
/* The share of the room cap that long games may hold, so rooms left waiting
   on a slow turn cannot fill every place. A fraction above 0 up to 1;
   anything else is refused with a log line and the default stands. */
function room_long_share(): float
{
    $raw = trim((string) tankity_setting('TANKITY_ROOM_LONG_SHARE', 'room_long_share', ''));
    if ($raw === '') {
        return ROOM_LONG_SHARE;
    }
    if (is_numeric($raw) && (float) $raw > 0 && (float) $raw <= 1) {
        return (float) $raw;
    }
    error_log("tankity setting room_long_share (TANKITY_ROOM_LONG_SHARE): refused '$raw', not a fraction above 0 up to 1; using " . ROOM_LONG_SHARE);
    return ROOM_LONG_SHARE;
}
/* How many long games may exist at once under a room cap of $max: the share
   of it, rounded down, and never fewer than one. */
function room_long_cap(int $max): int
{
    return max(1, (int) floor($max * room_long_share()));
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
/* The game speeds the host can pick (the FF button): every client replays
   the war this many times as fast, and the drones' paced turns wait that
   fraction (room_pace_ready). src/speed.ts SPEEDS holds the same list;
   test/speed.test.ts keeps them equal. */
const ROOM_SPEEDS = [1, 2, 4];
/* The room's game speed; anything that is not one of the speeds (a room
   from before the setting) is 1. */
function room_speed(array $room): int
{
    $s = $room['speed'] ?? null;
    return is_int($s) && in_array($s, ROOM_SPEEDS, true) ? $s : 1;
}
/* The shop stays open 90 s in quick rooms (never longer than a turn) and a
   whole turn time in long ones. */
function room_shop_secs(int $turnSecs): int
{
    return $turnSecs <= 120 ? min($turnSecs, 90) : $turnSecs;
}
