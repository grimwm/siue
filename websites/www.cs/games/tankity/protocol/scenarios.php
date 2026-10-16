<?php
// The room protocol's fixture scenarios: deterministic rooms built with
// rooms.php's own functions, in the same order the act handlers use, and the
// shape comparison both the PHP test and the generator share.
// Included by generate.php and ../test/php/RoomsSimTest.php; serves nothing.
declare(strict_types=1);
if (!defined('TANKITY_ROOMS_LIB')) {
    define('TANKITY_ROOMS_LIB', true);
}
require_once __DIR__ . '/../rooms.php';

const PROTOCOL_CODE = 'FXT1';
/** The stored touch time every fixture room carries: a fixed second, so expiresAt is stable. */
const PROTOCOL_TOUCHED = 1_800_000_000;

/** A lobby: the host ABC, a guest DEF, one drone seat, one open seat. */
function protocol_lobby(): array
{
    $room = room_new(PROTOCOL_CODE, 'ABC');
    $room['created'] = $room['touched'] = PROTOCOL_TOUCHED; // expiresAt must not depend on the clock
    $room['csrf'] = 'fixture-csrf';
    $room['seats'][0] = room_seat_human('ABC', 'fixture-token-0', [], '');
    $room['seats'][1] = room_seat_human('DEF', 'fixture-token-1', ['body' => 'hover'], '');
    $room['seats'][2] = room_idle_seat(2, 'ai');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    room_seat_economy($room, 1);
    return $room;
}

/** Host ABC against one hard drone (a ranging shot that comes down on the field), as the start handler leaves it: seat 0 up. */
function protocol_play(): array
{
    $room = room_new(PROTOCOL_CODE, 'ABC');
    $room['difficulty'] = 'hard';
    $room['created'] = $room['touched'] = PROTOCOL_TOUCHED; // expiresAt must not depend on the clock
    $room['csrf'] = 'fixture-csrf';
    $room['seats'][0] = room_seat_human('ABC', 'fixture-token-0', [], '');
    $room['seats'][1] = room_idle_seat(1, 'ai');
    $room['seats'][2] = room_idle_seat(2, 'open');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    $room['droneSeed'] = 'fixture-drones'; // a fixed seed, so the drones shop the same way every run
    room_match_begin($room);
    $room['matchId'] = 'fixturematch'; // a fixed id, as the csrf token is
    room_seat_economy($room, 1); // the drone fires its Shell: what it bought at the pre-match shop is not what these volleys show
    room_start_round($room);
    $events = [['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']]];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    return $room;
}

/** The fire branch of the act handler: the shot, the wind drift, then the
 * crew's answer. */
function protocol_fire(array $room, float $angle, float $power, string $wkey = 'shell'): array
{
    $seat = 0;
    $room['tanks'][0]['angle'] = $angle;
    $room['tanks'][0]['power'] = $power;
    $me = $room['tanks'][0];
    $events = [['t' => 'fire', 'seat' => $seat, 'w' => $wkey,
        'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)]];
    room_fire_shot($room, $events, 0, $wkey);
    $rng = $room['rng'];
    $room['wind'] = (int) max(-12, min(12, round($room['wind'] + room_gauss($rng) * 2)));
    $room['rng'] = $rng;
    room_check_oneups($room, $events, $seat);
    if (room_round_settled($room)) {
        room_end_round($room, $events);
    } else {
        $room['turn'] = ($room['turn'] + 1) % max(1, count($room['tanks']));
        room_advance($room, $events);
    }
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    return $room;
}

/** The first aim (angle ascending, power descending) whose shell wounds the
 * drone from the opening position and draws its answer, a shot that comes
 * down on the field; fixed, so the fixtures never move. */
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
            if ($hit && $after['phase'] === 'play' && in_array('aifire', $types, true) && !in_array('kill', $types, true)
                && !in_array('fizzle', $types, true)) {
                return [(float) $a, (float) $power];
            }
        }
    }
    throw new RuntimeException('no aim hits the drone from the opening position');
}

/** The first gun in the arsenal with effect $effect (and, given $also, that it accepts). */
function protocol_gun(string $effect, ?callable $also = null): string
{
    foreach (room_weapons() as $k => $def) {
        if ($def['effect'] === $effect && ($also === null || $also($def))) {
            return $k;
        }
    }
    throw new RuntimeException("the arsenal has no $effect gun");
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

    // A beam aimed as a drone aims one, from the host's barrel pivot at the drone's body (a little below level).
    $beam = protocol_gun('beam');
    [$beamAngle] = room_ai_beam_aim($play['tanks'][0], $play['tanks'][1], room_weapons()[$beam]);
    $out['play-after-beam'] = ['After the host fires a beam at the drone: fire, the beam event with its unrounded line (no shot: nothing flies), its hit at the same moment, then the drone answers.',
        200, $ok(room_snapshot(protocol_fire($play, $beamAngle, 100.0, $beam), 0, 0))];
    // A plasma ring with the drone moved in beside the host, inside the ring.
    $ring = protocol_gun('plasma');
    $close = $play;
    $close['tanks'][1]['x'] = $close['tanks'][0]['x'] + 0.6 * room_weapons()[$ring]['radius'];
    $close['tanks'][1]['y'] = $close['terrain'][(int) round($close['tanks'][1]['x'])];
    $out['play-after-ring'] = ['After the host fires a plasma ring with the drone beside it: fire, the ring event (centre and radius, no shot, no crater), its hit at the same moment, then the drone answers.',
        200, $ok(room_snapshot(protocol_fire($close, 60.0, 100.0, $ring), 0, 0))];

    // The earth guns, one after another (the drone answering each): a burrow with
    // warheads, a mound of dirt, a pour, a riot scoop and a slump.
    $earth = $play;
    foreach ([[protocol_gun('dig', fn($d) => $d['warheads'] > 0), $angle, $power - 20], [protocol_gun('dirt'), $angle, $power],
        [protocol_gun('pour'), $angle, $power], [protocol_gun('riot'), $angle, $power], [protocol_gun('slump'), $angle, $power]] as [$gun, $a, $p]) {
        $earth = protocol_fire($earth, $a, $p, $gun);
    }
    $out['play-after-earth'] = ['After the host fires a sandhog, dirt, liquid dirt, a riot charge and a disrupter in turn (the drone answering each): the dig event (start, heading, steps, from at to t1) before its warheads\' bursts, then dirt, pour, riot and slump events with the server\'s own unrounded numbers.',
        200, $ok(room_snapshot($earth, 0, 0))];

    // Napalm: the hills dug into a valley under the drone, and the first aim
    // whose pool burns it (the drone answering): the burn event (the pool and
    // t1, its last tick), then each tick's hit, stamped at its tick.
    $napalm = protocol_gun('napalm');
    $vale = $play;
    $dx = (int) round($vale['tanks'][1]['x']);
    foreach ($vale['terrain'] as $ix => $y) {
        $vale['terrain'][$ix] = 330.0 + 90.0 * max(0.0, 1.0 - abs($ix - $dx) / 150.0);
    }
    foreach ($vale['tanks'] as $i => $t) {
        $vale['tanks'][$i]['y'] = room_surf_y($vale['terrain'], (float) $t['x']);
    }
    $burnt = null;
    $dir = $vale['tanks'][0]['x'] < $vale['tanks'][1]['x'] ? 1 : -1;
    for ($a = 20; $a <= 80 && $burnt === null; $a += 2) {
        for ($p = 100; $p >= 30 && $burnt === null; $p -= 5) {
            $after = protocol_fire($vale, (float) ($dir > 0 ? $a : 180 - $a), (float) $p, $napalm);
            $hits = array_filter($after['events'], fn($e) => ($e['t'] ?? '') === 'hit' && $e['seat'] === 1 && ($e['by'] ?? -1) === 0);
            if (count($hits) > 1 && $after['phase'] === 'play' && in_array('aifire', array_column($after['events'], 't'), true)) {
                $burnt = $after;
            }
        }
    }
    if ($burnt === null) {
        throw new RuntimeException('no aim burns the drone in its valley');
    }
    $out['play-after-burn'] = ['After the host fires napalm into the valley the drone sits in: the shot (r 0: no blast), the burn event (the pool poured at column x, its level over x0..x1, its flames, and t1, when its last tick burns), each tick\'s hit stamped at its tick, then the drone answers. The ground does not change.',
        200, $ok(room_snapshot($burnt, 0, 0))];

    $kill = $play;
    $kill['tanks'][1]['hp'] = 1;
    $won = protocol_fire($kill, $angle, $power);
    $out['shop-after-win'] = ['The drone is down: the round is won, the room is at the shop, cash and score paid out.',
        200, $ok(room_snapshot($won, 0, 0))];

    $shop = $won;
    $shop['seats'][2] = room_seat_human('DEF', 'fixture-token-2', [], '');
    room_seat_economy($shop, 2);
    room_shop_set_ready($shop, 0, true);
    $shop['shop']['at'] = microtime(true);
    $out['shop-ready'] = ['The shop with a second human seated: the host has pressed Ready (seats[].ready), the other has not, and the shop clock reads shopLeft.',
        200, $ok(room_snapshot($shop, 0, 0))];

    // The host sets the turn time mid-play: one event, and the snapshot's turnSecs.
    $timed = $play;
    $timed['turnSecs'] = 600;
    room_emit($timed, ['t' => 'turntime', 'seat' => 0, 'secs' => 600]);
    $out['play-turntime'] = ['The host moved the turn time to 10 minutes: turnSecs reads 600 and one turntime event rides along (since = 1 skips the round event).',
        200, $ok(room_snapshot($timed, 0, 1))];

    // The host sets the game speed mid-play: one event, and the snapshot's speed.
    $fast = $play;
    if (room_set_speed($fast, 0, 4) !== null) {
        throw new RuntimeException('the fixture host could not set the speed');
    }
    $out['play-speed'] = ['The host set the game speed to 4×: speed reads 4 and one speed event rides along (since = 1 skips the round event).',
        200, $ok(room_snapshot($fast, 0, 1))];

    // The host picks the walls between rounds (in the shop): one event, the snapshot's walls; the round just played keeps its own.
    $walled = $won;
    $since = (int) ($walled['seq'] ?? 0);
    if (room_set_walls($walled, 0, 'wrap') !== null) {
        throw new RuntimeException('the fixture host could not pick the walls');
    }
    $out['shop-walls'] = ['The host picked Wraparound in the shop: walls reads wrap, wallsNow still names the round just played (none), and one walls event rides along; the next round plays it.',
        200, $ok(room_snapshot($walled, 0, $since))];

    // A browser's "Your games": a match with this seat up, a lobby it waits in, a room that is gone.
    $waiting = $lobby;
    $waiting['code'] = 'FXT2'; // two different rooms, two codes
    $out['mine-reply'] = ['action=mine for three stored seats, in the order asked: a running match where it is this seat\'s turn (turnKey names the turn), a lobby, and a room that is gone.',
        200, ['ok' => true, 'rooms' => [
            room_mine_row($play, 0),
            room_mine_row($waiting, 1),
            ['code' => 'GONE', 'gone' => true],
        ]]];
    foreach ($out as $name => [$about, $status, $body]) {
        $out[$name][2] = protocol_fixed_close($body);
    }
    return $out;
}

/* closesIn is seconds from the moment of the reply: in a fixture it is
   counted from the fixture rooms' fixed touch time (PROTOCOL_TOUCHED), so it
   is stable like expiresAt. */
function protocol_fixed_close(array $v): array
{
    if (array_key_exists('closesIn', $v) && is_int($v['expiresAt'] ?? null)) {
        $v['closesIn'] = max(0, $v['expiresAt'] - PROTOCOL_TOUCHED);
    }
    foreach ($v as $k => $item) {
        if (is_array($item)) {
            $v[$k] = protocol_fixed_close($item);
        }
    }
    return $v;
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
