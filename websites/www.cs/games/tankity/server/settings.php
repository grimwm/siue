<?php
// Operation Tankity rooms. Room server settings: what a room is (code shape, seats, AI names) and the knobs the
// host can turn (live window, per-address limits, disk guard) through
// .config.yaml or the environment. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const ROOM_GAME = 'operation-tankity';
const ROOM_CODE_LEN = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
/* A room code as the server accepts it: six characters, or four for a room
   made before codes grew (it keeps working until it ends). */
const ROOM_CODE_RE = '/^(?:[A-Z0-9]{4}|[A-Z0-9]{6})$/';
/* A code as a player may type or read it back: any case, with spaces or
   hyphens (the lobby shows it as K7Q 2MX). */
function room_code_clean(string $raw): string
{
    return strtoupper(str_replace([' ', '-', "\t"], '', trim($raw)));
}
const ROOM_SEATS = 4; // seat 0 hosts a new room (see room_host); every other seat starts as AI
const ROOM_AI_NAMES = ['REAPER', 'WRAITH', 'SPOTTER', 'HUNTER'];
/* The room protocol this server speaks. A bundle that sends it can play a
   one-human Start in the browser; one that does not is told to reload
   (room_reload_out) rather than handed a reply it cannot read. */
const ROOM_PROTO = 2;
function room_proto_ok(array $body): bool
{
    return ($body['proto'] ?? null) === ROOM_PROTO;
}
function room_reload_out(): never
{
    room_json_out(426, ['error' => 'Tankity was updated. Reload the page to keep playing.', 'reload' => true]);
    exit;
}
/* The turn times the host can pick, in seconds: Lightning 1 min, 2 min (the
   default), 10 min, 30 min, 8 h, 24 h, 1 week. src/turn-time.ts holds the same
   list with its labels; test/turn-time.test.ts keeps them equal. */
const ROOM_TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800];
const ROOM_TURN_DEFAULT = 120;
const ROOM_LOBBIES_PER_ADDRESS = 4;
/* The room puzzle's difficulty (server/pow.php): leading zero bits a join's
   solutions need at rest; a create needs one more, and load adds up to two.
   0 turns the puzzle off. Measured in README "Room limits". */
const ROOM_POW_BITS = 11;
const ROOM_POW_BITS_MAX = 20;
/* Creates from every address in ten minutes that count as a surge (one bit harder). */
const ROOM_POW_SURGE = 60;
function room_pow_bits_setting(): int
{
    static $logged = false;
    $set = tankity_setting('TANKITY_POW_BITS', 'pow_bits', '');
    $raw = trim(is_scalar($set) ? (string) $set : '');
    if (preg_match('/^\d{1,2}$/', $raw) && (int) $raw <= ROOM_POW_BITS_MAX) {
        return (int) $raw;
    }
    if ($raw !== '' && !$logged) {
        $logged = true;
        error_log('tankity setting pow_bits (TANKITY_POW_BITS): refused ' . var_export(substr($raw, 0, 40), true)
            . ', not a whole number from 0 to ' . ROOM_POW_BITS_MAX . '; using ' . ROOM_POW_BITS);
    }
    return ROOM_POW_BITS;
}
function room_pow_surge(): int
{
    return tankity_int_setting('TANKITY_POW_SURGE', 'pow_surge', ROOM_POW_SURGE);
}
/* Lobbies one address hosts at once. */
function room_lobbies_per_address(): int
{
    return tankity_int_setting('TANKITY_LOBBIES_PER_ADDRESS', 'lobbies_per_address', ROOM_LOBBIES_PER_ADDRESS);
}
/* The database file plus its -wal may grow to this many MB before a new
   lobby is refused (room_db_full). */
const ROOM_DB_MAX_MB = 256;
function room_db_max_mb(): int
{
    return tankity_int_setting('TANKITY_ROOM_DB_MAX_MB', 'room_db_max_mb', ROOM_DB_MAX_MB);
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
