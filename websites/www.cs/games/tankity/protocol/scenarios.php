<?php
// The room protocol's fixture scenarios: deterministic rooms built with
// rooms.php's own functions, in the same order the act handlers use, and the
// shape comparison both the PHP test and the generator share.
// Included by generate.php and ../rooms-sim-test.php; serves nothing.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once __DIR__ . '/../rooms.php';

const PROTOCOL_CODE = 'FXT1';

/** A lobby: the host ABC, a guest DEF, one drone seat, one open seat. */
function protocol_lobby(): array
{
    $room = room_new(PROTOCOL_CODE, 'ABC');
    $room['csrf'] = 'fixture-csrf';
    $room['seats'][0] = room_seat_human('ABC', 'fixture-token-0', []);
    $room['seats'][1] = room_seat_human('DEF', 'fixture-token-1', ['body' => 'hover']);
    $room['seats'][2] = room_idle_seat(2, 'ai');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    room_seat_economy($room, 1);
    return $room;
}

/** Host ABC against one drone, as the start handler leaves it: seat 0 up. */
function protocol_play(): array
{
    $room = room_new(PROTOCOL_CODE, 'ABC');
    $room['csrf'] = 'fixture-csrf';
    $room['seats'][0] = room_seat_human('ABC', 'fixture-token-0', []);
    $room['seats'][1] = room_idle_seat(1, 'ai');
    $room['seats'][2] = room_idle_seat(2, 'open');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    room_start_round($room);
    $events = [['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']]];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    return $room;
}

/** The fire branch of the act handler: the shot, the wind drift, then the
 * crew's answer. */
function protocol_fire(array $room, float $angle, float $power): array
{
    $seat = 0;
    $room['tanks'][0]['angle'] = $angle;
    $room['tanks'][0]['power'] = $power;
    $me = $room['tanks'][0];
    $events = [['t' => 'fire', 'seat' => $seat, 'w' => 'shell',
        'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)]];
    room_fire_shot($room, $events, 0, 'shell');
    room_settle_tanks($room);
    $rng = $room['rng'];
    $room['wind'] = (int) max(-12, min(12, round($room['wind'] + room_gauss($rng) * 2)));
    $room['rng'] = $rng;
    room_check_oneups($room, $events, $seat);
    if (room_round_settled($room)) {
        room_end_round($room, $events);
    } else {
        $room['turn'] = ($room['turn'] + 1) % max(1, count($room['tanks']));
        room_advance($room, $events);
        room_settle_tanks($room);
    }
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    return $room;
}

/** The first aim (angle ascending, power descending) whose shell wounds the
 * drone from the opening position and draws its answer; fixed, so the fixtures never move. */
function protocol_hitting_aim(array $room): array
{
    $dir = $room['tanks'][0]['x'] < $room['tanks'][1]['x'] ? 1 : -1;
    for ($angle = 20; $angle <= 80; $angle += 2) {
        for ($power = 100; $power >= 30; $power -= 5) {
            $a = $dir > 0 ? $angle : 180 - $angle;
            $after = protocol_fire($room, (float) $a, (float) $power);
            $types = array_column($after['events'], 't');
            $hit = array_filter($after['events'], fn($e) => ($e['t'] ?? '') === 'hit' && $e['seat'] === 1 && ($e['by'] ?? -1) === 0);
            // A wounding hit, not a kill, and the drone answers: the whole turn.
            if ($hit && $after['phase'] === 'play' && in_array('aifire', $types, true) && !in_array('kill', $types, true)) {
                return [(float) $a, (float) $power];
            }
        }
    }
    throw new RuntimeException('no aim hits the drone from the opening position');
}

/** Every deterministic fixture: name => [description, status, body]. */
function protocol_snapshots(): array
{
    $out = [];
    $ok = fn(array $room) => ['ok' => true, 'room' => $room];

    $lobby = protocol_lobby();
    $out['lobby-host'] = ['Lobby as the host sees it: four seats (human, human, AI, open), the private you block and the csrf token.',
        200, $ok(room_snapshot($lobby, 0, 0))];
    $out['lobby-public'] = ['The same lobby to a watcher with no seat: no you block, no csrf.',
        200, $ok(room_snapshot($lobby, null, 0))];

    $play = protocol_play();
    $out['play-my-turn'] = ['Start of round one, the host to aim: terrain, tanks, wind, the round event, you.',
        200, $ok(room_snapshot($play, 0, 0))];

    [$angle, $power] = protocol_hitting_aim($play);
    $fired = protocol_fire($play, $angle, $power);
    $out['play-after-fire'] = ['After the host fires: fire, shot and hit events, then the drone answers (aifire, shot).',
        200, $ok(room_snapshot($fired, 0, 0))];

    // A delta: the asker names the hills revision it holds (`have`) and the
    // newest event it has seen (`since`), so the snapshot leaves the hills out
    // and carries only the events after the opening round event.
    $out['play-after-fire-delta'] = ['The same moment as a poll that holds the current hills (have = terrainRev) and has seen the round event (since = 1): terrain is left out, terrainRev names the revision, and only the later events ride along.',
        200, $ok(room_snapshot($fired, 0, 1, $fired['terrainRev']))];
    $out['play-resync'] = ['A poll whose since is newer than anything the room has recorded (the room was lost or restarted): the snapshot is full again and carries resync: true.',
        200, $ok(room_snapshot($fired, 0, 999, $fired['terrainRev']))];

    $kill = $play;
    $kill['tanks'][1]['hp'] = 1;
    $won = protocol_fire($kill, $angle, $power);
    $out['shop-after-win'] = ['The drone is down: the round is won, the room is at the shop, cash and score paid out.',
        200, $ok(room_snapshot($won, 0, 0))];

    $shop = $won;
    $shop['seats'][2] = room_seat_human('DEF', 'fixture-token-2', []);
    room_seat_economy($shop, 2);
    room_shop_set_ready($shop, 0, true);
    $shop['shop']['at'] = microtime(true);
    $out['shop-ready'] = ['The shop with a second human seated: the host has pressed Ready (seats[].ready), the other has not, and the shop clock reads shopLeft.',
        200, $ok(room_snapshot($shop, 0, 0))];
    return $out;
}

/** The shape of a decoded JSON value: object keys with types, lists as the
 * sorted distinct shapes of their elements. Numbers are one type, since
 * PHP's 3.0 and JSON's 3 are the same number to the client. */
function protocol_shape($v)
{
    if (is_array($v)) {
        if (array_is_list($v)) {
            $shapes = [];
            foreach ($v as $item) {
                $s = protocol_shape($item);
                $shapes[json_encode($s)] = $s;
            }
            ksort($shapes);
            return array_values($shapes);
        }
        $keys = [];
        foreach ($v as $k => $item) {
            $keys[$k] = protocol_shape($item);
        }
        ksort($keys);
        return (object) $keys;
    }
    if (is_int($v) || is_float($v)) {
        return 'number';
    }
    return get_debug_type($v);
}

/** Round-trip through JSON so objects and lists compare the way the client sees them. */
function protocol_wire($v)
{
    return json_decode(json_encode($v, JSON_UNESCAPED_SLASHES), true);
}
