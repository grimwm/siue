<?php
// Unit checks for the room server's simulation, no web server or shared
// memory needed. Run: php rooms-sim-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
const TANKITY_ROOMS_LIB = true;
require __DIR__ . '/rooms.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$tank = function (int $seat, string $kind, float $x, int $hp) {
    return ['seat' => $seat, 'kind' => $kind, 'name' => 'T' . $seat, 'x' => $x, 'y' => 400.0,
        'angle' => 0.0, 'power' => 50.0, 'hp' => $hp, 'maxHp' => $hp, 'fuel' => 80.0, 'dirS' => 1];
};
$flatRoom = function (array $tanks) {
    return ['terrain' => array_fill(0, 720, 400.0), 'tanks' => $tanks, 'wind' => 0.0,
        'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
};
$hitsOn = function (array $events, int $seat): array {
    return array_values(array_filter($events, fn($e) => ($e['t'] ?? '') === 'hit' && $e['seat'] === $seat));
};

// Lance: one direct hit on the tank it punches through, never a second one
// on the next frame while the bolt is still inside that hull. The targets are
// drones, so the bolt flies at their bodies, 30 px up.
$weapons = room_weapons();
$lance = $weapons['lance'];
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500)]);
$events = [];
room_fly_arc($room, $events, $room['tanks'][0], $lance, 'lance', 0, 285.0, 370.0, 400.0, 0.0, 0.5, false, null);
$hits = $hitsOn($events, 1);
$check('lance-hits-once', count($hits) === 1, 'hits=' . count($hits));
// Direct hits double, after falloff from where the bolt burst on the hull.
$dmg = (int) $lance['dmg'];
$check('lance-direct-damage', count($hits) === 1 && $hits[0]['direct'] && $hits[0]['dmg'] > $dmg && $hits[0]['dmg'] <= 2 * $dmg,
    'dmg=' . ($hits[0]['dmg'] ?? '?') . " range=($dmg, " . (2 * $dmg) . ']');

// The bolt keeps flying after the first hull and can still strike another.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500), $tank(2, 'ai', 330.0, 500)]);
$events = [];
$end = room_fly_arc($room, $events, $room['tanks'][0], $lance, 'lance', 0, 285.0, 370.0, 400.0, 0.0, 0.5, false, null);
// The arc hands its final impact back to the caller: [status, x, y, vx, vy, directIdx].
$check('lance-pierces-to-next-tank', $end[0] === 'hit' && $end[5] === 2, json_encode([$end[0], $end[5]]));

// Hit boxes follow the drawn units, and a shell is tested along its whole
// step: a fast shell crossing a drone's body in one step still hits it, and
// one passing under a drone (where the old ground-level circle sat) does not.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500)]);
$clear = true;
$hit = room_sweep_hit($room, 270.0, 370.0, 330.0, 370.0, null, 0, $clear);
$check('sweep-hits-drone-body', $hit !== null && $hit[0] === 1, json_encode($hit));
$check('sweep-misses-under-drone', room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, null, 0, $clear) === null);
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'human', 300.0, 100)]);
$check('sweep-hits-tank-hull', (room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, null, 0, $clear)[0] ?? null) === 1);
$check('sweep-skips-pierced', room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, 1, 0, $clear) === null);

// A shell leaves the muzzle inside its own gunner's box (a drone's body sits
// 30 px up, the muzzle 14 px up and 20 px out): it ignores its gunner until it
// is clear of that box, then hits it like anyone else if it comes back.
$room = $flatRoom([$tank(0, 'ai', 300.0, 100), $tank(1, 'human', 600.0, 100)]);
$clear = false;
$check('own-shell-passes-out-of-gunner', room_sweep_hit($room, 309.0, 368.0, 330.0, 360.0, null, 0, $clear) === null && $clear);
$check('own-shell-hits-gunner-coming-back', (room_sweep_hit($room, 330.0, 360.0, 300.0, 370.0, null, 0, $clear)[0] ?? null) === 0);
$room = $flatRoom([$tank(0, 'ai', 300.0, 100), $tank(1, 'human', 600.0, 100)]);
$events = [];
$a = deg2rad(62.0);
$end = room_fly_arc($room, $events, $room['tanks'][0], $weapons['shell'], 'shell', 0,
    300.0 + cos($a) * 20, 386.0 - sin($a) * 20, cos($a) * 120, -sin($a) * 120, 0.0, false, null);
$check('drone-shot-does-not-hit-itself', $end[5] !== 0 && $hitsOn($events, 0) === [], json_encode([$end[0], $end[5]]));

// Banked repair rides above full armor for the round, as in solo play;
// banked fuel adds on. Drones are untouched.
$room = $flatRoom([$tank(0, 'human', 100.0, 125), $tank(1, 'ai', 300.0, 60)]);
$room['repairApplied'] = [0 => 40];
$room['fuelApplied'] = [0 => 60];
room_apply_banked($room);
$me = $room['tanks'][0];
$check('repair-above-max', $me['hp'] === 165 && $me['maxHp'] === 165, "hp={$me['hp']} max={$me['maxHp']}");
$check('fuel-banked', $me['fuel'] === 140.0, 'fuel=' . $me['fuel']);
$check('drone-untouched', $room['tanks'][1]['hp'] === 60);

// Last stand's wreck blast reads its numbers from game.json.
$ls = room_gear('laststand');
$check('laststand-blast-from-data', isset($ls['dmg'], $ls['radius']) && (int) $ls['dmg'] > 0 && (float) $ls['radius'] > 0,
    'dmg=' . ($ls['dmg'] ?? '?') . ' radius=' . ($ls['radius'] ?? '?'));

// Spawns: never closer than ROOM_SPAWN_GAP, always on the field, and seat 0
// (the host) does not always land on the left.
$minGap = INF;
$inside = true;
$hostLeftmost = 0;
for ($seed = 1; $seed <= 200; $seed++) {
    $rng = $seed * 7919;
    $xs = room_spawn_spots($rng, 4, 720);
    $sorted = $xs;
    sort($sorted);
    for ($i = 1; $i < 4; $i++) {
        $minGap = min($minGap, $sorted[$i] - $sorted[$i - 1]);
    }
    $inside = $inside && $sorted[0] >= 12 && $sorted[3] <= 708;
    if ($xs[0] === $sorted[0]) {
        $hostLeftmost++;
    }
}
$check('spawn-gap', $minGap >= ROOM_SPAWN_GAP, 'min gap=' . $minGap);
$check('spawn-on-field', $inside);
$check('spawn-host-varies', $hostLeftmost > 20 && $hostLeftmost < 120, "host leftmost in $hostLeftmost/200");

// Moves never end on top of another unit.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 140.0, 60), $tank(2, 'ai', 300.0, 0)]);
$check('spot-taken-near', room_spot_taken($room, 0, 120.0));
$check('spot-free-far', !room_spot_taken($room, 0, 200.0));
$check('spot-ignores-self', !room_spot_taken($room, 1, 160.0)); // 20 from itself, 60 from tank 0
$check('spot-ignores-wrecks', !room_spot_taken($room, 0, 290.0));

// Replay stamping: a shot event carries its path and flight times, and the
// blast it causes lands at the moment the shell does.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500)]);
$room['tanks'][0]['angle'] = 45.0;
$room['tanks'][0]['power'] = 60.0;
$events = [['t' => 'fire', 'seat' => 0, 'w' => 'shell']];
room_fire_shot($room, $events, 0, 'shell');
$shot = null;
foreach ($events as $e) {
    if ($e['t'] === 'shot') {
        $shot = $e;
    }
}
$pts = $shot ? explode(' ', $shot['p']) : [];
$check('replay-fire-at-zero', ($events[0]['at'] ?? null) === 0.0);
$check('replay-shot-path', $shot !== null && count($pts) >= 3, 'points=' . count($pts));
$check('replay-shot-times', $shot !== null && $shot['t0'] === 0.0 && $shot['t1'] > 0.2, 't1=' . ($shot['t1'] ?? '?'));
// Same shot again with a tank parked where it landed: its hit must carry the
// landing time.
$landX = $shot['x1'] ?? 300.0;
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', $landX, 500)]);
$room['tanks'][0]['angle'] = 45.0;
$room['tanks'][0]['power'] = 60.0;
$events = [['t' => 'fire', 'seat' => 0, 'w' => 'shell']];
room_fire_shot($room, $events, 0, 'shell');
$shot2 = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0] ?? null;
$hits = array_values(array_filter($events, fn($e) => $e['t'] === 'hit'));
$check('replay-blast-at-landing', $shot2 !== null && count($hits) >= 1 && abs($hits[0]['at'] - $shot2['t1']) < 0.001,
    json_encode(['t1' => $shot2['t1'] ?? null, 'hits' => array_map(fn($e) => $e['at'], $hits)]));

// A drone on the left fires to the right, the way it faces.
$room = $flatRoom([$tank(0, 'human', 600.0, 100), $tank(1, 'ai', 100.0, 500)]);
$room['tanks'][1]['dirS'] = 1;
$room['tanks'][1]['angle'] = 45.0;
$events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell']];
room_fire_shot($room, $events, 1, 'shell');
$shot = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0] ?? null;
$check('drone-fires-its-facing', $shot !== null && $shot['x1'] > $shot['x0'], json_encode([$shot['x0'] ?? null, $shot['x1'] ?? null]));

// The lobby's silhouettes come from the terrain a room on that map plays.
foreach (ROOM_MAPS as $id => $m) {
    $prof = room_map_profile($id);
    $rng = room_hash_seed($m['seed'] . '|round1');
    $terrain = room_gen_terrain($rng, 720);
    $ok = count($prof) === ROOM_PROFILE_N && min($prof) >= 0.0 && max($prof) <= 1.0
        && abs($prof[0] - (415.0 - $terrain[0]) / 225.0) < 0.001
        && abs($prof[ROOM_PROFILE_N - 1] - (415.0 - $terrain[719]) / 225.0) < 0.001;
    $check("map-profile-$id", $ok, json_encode([count($prof), min($prof), max($prof)]));
}
$check('map-profiles-differ', count(array_unique(array_map(fn($id) => json_encode(room_map_profile($id)), array_keys(ROOM_MAPS)))) === count(ROOM_MAPS));

// Seat modes: open seats field no unit, the rest do, and spacing and the
// drones' turns hold up with fewer tanks.
$seatRoom = function (array $modes) {
    $room = room_new('TEST', 'hos');
    $room['seats'][0] = ['human' => true, 'initials' => 'HOS', 'token' => 't', 'lives' => 3, 'lastAct' => microtime(true)];
    foreach ($modes as $i => $m) {
        $room['seats'][$i + 1] = room_idle_seat($i + 1, $m);
    }
    room_seat_economy($room, 0);
    return $room;
};
$room = $seatRoom(['ai', 'open', 'open']);
room_start_round($room);
$check('open-seats-no-tanks', count($room['tanks']) === 2 && room_fielded($room) === 2
    && array_column($room['tanks'], 'seat') === [0, 1], json_encode(array_column($room['tanks'], 'seat')));
$room = $seatRoom(['ai', 'ai', 'ai']);
room_start_round($room);
$check('all-seats-four-tanks', count($room['tanks']) === 4);
$gapOk = true;
for ($i = 0; $i < 60; $i++) {
    $room = $seatRoom(['ai', 'open', 'ai']);
    $room['rng'] = $i * 104729 + 17;
    room_start_round($room);
    $xs = array_column($room['tanks'], 'x');
    sort($xs);
    for ($j = 1; $j < count($xs); $j++) {
        $gapOk = $gapOk && $xs[$j] - $xs[$j - 1] >= ROOM_SPAWN_GAP;
    }
    $gapOk = $gapOk && count($xs) === 3;
}
$check('spawn-gap-fewer-tanks', $gapOk);
$room = $seatRoom(['ai', 'open', 'open']);
room_start_round($room);
$events = [];
room_advance($room, $events);
$check('ai-turns-with-two-tanks', $room['phase'] === 'play' && $room['tanks'][$room['turn']]['kind'] === 'human',
    'turn=' . $room['turn']);
// The human's turn clock started on the advance above; while it runs, aiming
// (a fresh lastAct) never resets it and the room waits.
$left = room_turn_left($room);
$check('turn-clock-runs', $left !== null && $left > ROOM_TURN_SECS - 5 && $left <= ROOM_TURN_SECS, 'left=' . $left);
$room['seats'][0]['lastAct'] = microtime(true);
$room['clock']['at'] -= 30;
$check('turn-clock-ignores-aim', room_turn_left($room) < ROOM_TURN_SECS - 29);
$events = [];
room_advance($room, $events);
$check('turn-clock-waits', count($events) === 0, json_encode($events));
$room['clock']['at'] = 0; // out of time: the crew fires for the human, then the lone drone answers
$events = [];
room_advance($room, $events);
$aiShots = count(array_filter($events, fn($e) => $e['t'] === 'aifire'));
$check('lone-drone-fires', $aiShots >= 1 && $aiShots <= 2, 'aifire=' . $aiShots);
$check('turn-clock-auto-fires', count(array_filter($events, fn($e) => $e['t'] === 'auto')) === 1);
// The next time it is the human's turn, the clock starts afresh.
$check('turn-clock-fresh-next-turn', ($room['tanks'][$room['turn']]['kind'] ?? '') !== 'human' || room_turn_left($room) > ROOM_TURN_SECS - 5);

// The crew's random gun comes from the rack: the Shell always, anything with
// ammo, never something the round has not unlocked.
$room['round'] = 1;
$room['ammo'][0] = ['shell' => -1, 'buck' => 2, 'mortar' => 0, 'nuke' => 3];
$picked = [];
for ($i = 0; $i < 200; $i++) {
    $picked[room_random_gun($room, 0)] = true;
}
ksort($picked);
$check('random-gun-from-rack', array_keys($picked) === ['buck', 'shell'], json_encode(array_keys($picked)));

// A guest leaving the lobby frees the chair back to a drone seat; a host
// leaving a begun match hands the tank to the battery and the room lives on.
$room = $seatRoom(['ai', 'open', 'ai']);
$room['seats'][1] = ['human' => true, 'initials' => 'GST', 'token' => 'g', 'lives' => 3];
room_seat_economy($room, 1);
$check('lobby-leave-keeps-room', room_leave($room, 1) === true && ($room['seats'][1]['human'] ?? true) === false
    && ($room['seats'][1]['mode'] ?? '') === 'ai');
$room['seats'][1] = ['human' => true, 'initials' => 'GST', 'token' => 'g', 'lives' => 3];
$check('lobby-host-leave-closes', room_leave($room, 0) === false);
$room = $seatRoom(['ai', 'open', 'ai']);
$room['seats'][1] = ['human' => true, 'initials' => 'GST', 'token' => 'g', 'lives' => 3];
room_seat_economy($room, 1);
room_start_round($room);
$room['phase'] = 'play';
$left = room_leave($room, 0);
$hostTank = null;
foreach ($room['tanks'] as $t) {
    if ($t['seat'] === 0) {
        $hostTank = $t;
    }
}
$check('host-leave-mid-match-continues', $left === true && ($room['seats'][0]['human'] ?? true) === false
    && $hostTank !== null && $hostTank['kind'] === 'ai' && $room['seats'][1]['human'] === true);

// The shop between multiplayer rounds: ready is a wanted state, the last
// ready starts the round inside the same step, and the clock starts it too.
// $shopRoom: humans HOS (seat 0) and GST (seat 1) plus a drone, round won.
$shopRoom = function (int $humans = 2) {
    $room = room_new('SHOP', 'hos');
    $room['seats'][0] = ['human' => true, 'initials' => 'HOS', 'token' => 't0', 'lives' => 3, 'lastAct' => microtime(true)];
    $room['seats'][1] = $humans > 1
        ? ['human' => true, 'initials' => 'GST', 'token' => 't1', 'lives' => 3, 'lastAct' => microtime(true)]
        : room_idle_seat(1, 'open');
    $room['seats'][2] = room_idle_seat(2, 'ai');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    if ($humans > 1) {
        room_seat_economy($room, 1);
    }
    room_start_round($room);
    // The drones fall and, with two humans, the guest falls too: the host is
    // the last unit standing and wins (a round ends on one unit left).
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] === 'ai' || ($humans > 1 && $t['seat'] === 1)) {
            $t['hp'] = 0;
        }
    }
    unset($t);
    $events = [];
    room_end_round($room, $events);
    return $room;
};
// A lost round (a drone outlasts every human) also goes through the shop: a
// life gone, no winnings, the same clock; the last life still ends the match.
$lostRoom = function (int $lives) {
    $room = room_new('LOST', 'hst');
    $room['seats'][0] = ['human' => true, 'initials' => 'HST', 'token' => 't0', 'lives' => $lives, 'lastAct' => microtime(true)];
    $room['seats'][1] = room_idle_seat(1, 'ai');
    $room['seats'][2] = room_idle_seat(2, 'open');
    $room['seats'][3] = room_idle_seat(3, 'open');
    room_seat_economy($room, 0);
    room_start_round($room);
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] === 'human') {
            $t['hp'] = 0;
        }
    }
    unset($t);
    $cash = $room['cash'][0] ?? 0;
    $events = [];
    room_end_round($room, $events);
    return [$room, $events, $cash];
};
[$room, $events, $cash] = $lostRoom(3);
$check('lost-round-opens-the-shop', $room['phase'] === 'shop' && room_shop_left($room) > ROOM_SHOP_SECS - 2, $room['phase']);
$check('lost-round-costs-a-life-pays-nothing', $room['seats'][0]['lives'] === 2 && ($room['cash'][0] ?? 0) === $cash);
$check('lost-round-says-so', array_column($events, 't') === ['roundlost'], json_encode(array_column($events, 't')));
room_shop_set_ready($room, 0, true);
$check('lost-round-shop-starts-the-next-round', room_shop_settle($room) === true && $room['phase'] === 'play');
[$room, $events] = $lostRoom(1);
$check('last-life-lost-ends-the-match', $room['phase'] === 'over' && in_array('matchover', array_column($events, 't'), true));

// Drones left alone cannot stall a round forever: after ROOM_WATCH_TURNS
// drone-only turns it ends as the battery's, and solo uses the same number.
$stall = room_new('STAL', 'stl');
$stall['seats'][0] = ['human' => true, 'initials' => 'STL', 'token' => 't0', 'lives' => 3, 'lastAct' => microtime(true)];
for ($i = 1; $i < ROOM_SEATS; $i++) {
    $stall['seats'][$i] = room_idle_seat($i, 'ai');
}
room_seat_economy($stall, 0);
room_start_round($stall);
foreach ($stall['tanks'] as &$t) {
    if ($t['kind'] === 'human') {
        $t['hp'] = 0;
    } else {
        $t['hp'] = 100000; // nobody can die: a guaranteed stalemate
    }
}
unset($t);
$stall['watchTurns'] = ROOM_WATCH_TURNS - 1;
unset($stall['pace']);
$events = [];
room_advance($stall, $events);
$check('drone-stalemate-ends-the-round', $stall['phase'] === 'shop' && in_array('roundlost', array_column($events, 't'), true),
    $stall['phase'] . ' ' . json_encode(array_column($events, 't')));
$flowSrc = (string) file_get_contents(__DIR__ . '/src/flow.ts');
$check('solo-and-rooms-share-the-stalemate-cap', (bool) preg_match('/WATCH_TURNS = ' . ROOM_WATCH_TURNS . ';/', $flowSrc));

$room = $shopRoom();
$check('shop-opens-with-clock', $room['phase'] === 'shop' && room_shop_left($room) > ROOM_SHOP_SECS - 2 && room_shop_left($room) <= ROOM_SHOP_SECS,
    $room['phase'] . ' ' . (string) room_shop_left($room));
$snap = room_snapshot($room, 0, 0);
$check('shop-snapshot-carries-clock-and-ready', $snap['shopLeft'] > 85 && $snap['seats'][0]['ready'] === false && $snap['seats'][2]['ready'] === false);
$check('shop-clock-null-in-play', room_shop_left(['phase' => 'play']) === null);

// All ready starts the round; one of two ready does not.
$room = $shopRoom();
room_shop_set_ready($room, 0, true);
$check('shop-one-ready-waits', room_shop_settle($room) === false && $room['phase'] === 'shop'
    && room_snapshot($room, 0, 0)['seats'][0]['ready'] === true);
room_shop_set_ready($room, 1, true);
$round0 = $room['round'];
$check('shop-all-ready-starts', room_shop_settle($room) === true && $room['phase'] === 'play' && $room['round'] === $round0 + 1);
$check('shop-start-clears-state', !isset($room['shop']) && room_snapshot($room, 0, 0)['shopLeft'] === null
    && room_snapshot($room, 0, 0)['seats'][0]['ready'] === false);

// Unready while the other has not readied: the shop stays and the flag clears.
$room = $shopRoom();
room_shop_set_ready($room, 0, true);
room_shop_settle($room);
room_shop_set_ready($room, 0, false);
$check('shop-unready-before-all', room_shop_settle($room) === false && $room['phase'] === 'shop' && !room_shop_ready($room, 0));
room_shop_set_ready($room, 1, true);
$check('shop-unready-blocks-start', room_shop_settle($room) === false && $room['phase'] === 'shop');

// The race: the last ready starts the round, and an unready that arrives
// afterwards neither reopens the shop nor un-starts the round.
$room = $shopRoom();
room_shop_set_ready($room, 0, true);
room_shop_set_ready($room, 1, true);
room_shop_settle($room);
$tanksBefore = json_encode($room['tanks']);
$roundBefore = $room['round'];
$applied = room_shop_set_ready($room, 0, false);
$check('shop-late-unready-ignored', $applied === false && room_shop_settle($room) === false
    && $room['phase'] === 'play' && $room['round'] === $roundBefore && json_encode($room['tanks']) === $tanksBefore
    && !isset($room['shop']));

// Duplicate ready is idempotent: a retried request cannot flip the state.
$room = $shopRoom();
room_shop_set_ready($room, 0, true);
room_shop_set_ready($room, 0, true);
$check('shop-duplicate-ready-idempotent', room_shop_ready($room, 0) === true && room_shop_settle($room) === false);
room_shop_set_ready($room, 0, false);
room_shop_set_ready($room, 0, false);
$check('shop-duplicate-unready-idempotent', room_shop_ready($room, 0) === false);

// The clock: an expired shop starts the round whatever the ready flags say.
$room = $shopRoom();
$room['shop']['at'] = microtime(true) - ROOM_SHOP_SECS - 1;
$check('shop-clock-expiry-starts', room_shop_left($room) === 0.0 && room_shop_settle($room) === true && $room['phase'] === 'play');
$room = $shopRoom();
$room['shop']['at'] = microtime(true) - ROOM_SHOP_SECS + 5;
$check('shop-clock-running-waits', room_shop_settle($room) === false && $room['phase'] === 'shop');

// A leaver does not block: the seat becomes a drone, so the remaining human's
// ready is enough.
$room = $shopRoom();
room_shop_set_ready($room, 0, true);
room_shop_settle($room);
room_leave($room, 1);
$check('shop-leaver-does-not-block', room_shop_settle($room) === true && $room['phase'] === 'play');
// A leaver who had readied does not count towards anything either.
$room = $shopRoom();
room_shop_set_ready($room, 1, true);
room_leave($room, 1);
$check('shop-leaver-ready-is-not-a-vote', room_shop_ready($room, 1) === false && room_shop_settle($room) === false);

// AI and open seats never block: a lone human readying starts the round.
$room = $shopRoom(1);
$check('shop-ai-never-blocks-waits-for-human', room_shop_settle($room) === false);
room_shop_set_ready($room, 0, true);
$check('shop-ai-never-blocks', room_shop_settle($room) === true && $room['phase'] === 'play');
// An eliminated human (no lives) never blocks either.
$room = $shopRoom();
$room['seats'][1]['lives'] = 0;
room_shop_set_ready($room, 0, true);
$check('shop-eliminated-never-blocks', room_shop_settle($room) === true);
// Ready changes outside the shop are refused, and settle is inert there.
$room = $seatRoom(['ai', 'open', 'open']);
room_start_round($room);
$check('shop-ready-outside-shop', room_shop_set_ready($room, 0, true) === false && room_shop_settle($room) === false && !isset($room['shop']));

// A round ends only with one unit left standing, humans and drones alike.
// $battle: humans in seats 0..$humans-1 plus drones in the rest of the four
// seats, every human on three lives, the round started.
$battle = function (int $humans, int $drones, int $lives = 3, int $rng = 12345) {
    $room = room_new('LAST', 'hos');
    for ($i = 0; $i < 4; $i++) {
        if ($i < $humans) {
            $room['seats'][$i] = ['human' => true, 'initials' => 'H0' . $i, 'token' => 't' . $i, 'lives' => $lives, 'lastAct' => microtime(true)];
        } else {
            $room['seats'][$i] = room_idle_seat($i, $i - $humans < $drones ? 'ai' : 'open');
        }
    }
    foreach (range(0, $humans - 1) as $i) {
        room_seat_economy($room, $i);
    }
    $room['rng'] = $rng;
    room_start_round($room);
    return $room;
};
$wreck = function (array &$room, callable $which): void {
    foreach ($room['tanks'] as &$t) {
        if ($which($t)) {
            $t['hp'] = 0;
        }
    }
    unset($t);
};
$types = fn(array $events): array => array_column($events, 't');

// Free-for-all: the drones are all wrecked but two humans live, so the round
// goes on; it ends when one human is left, who alone is paid.
$room = $battle(2, 2);
$wreck($room, fn($t) => $t['kind'] === 'ai');
$check('ffa-two-humans-fight-on', !room_round_settled($room));
$events = [];
$room['turn'] = 0;
room_advance($room, $events);
$check('ffa-waits-on-a-human', $room['phase'] === 'play' && $types($events) === []);
$cash0 = $room['cash'][0] ?? 0;
$cash1 = $room['cash'][1] ?? 0;
$wreck($room, fn($t) => $t['seat'] === 1);
$check('ffa-last-human-settles', room_round_settled($room));
$events = [];
room_end_round($room, $events);
$won = array_values(array_filter($events, fn($e) => $e['t'] === 'roundwin'));
$check('ffa-roundwin-names-the-winner', count($won) === 1 && $won[0]['seat'] === 0 && $won[0]['round'] === 1, json_encode($events));
$check('ffa-winner-paid-loser-not', ($room['cash'][0] ?? 0) > $cash0 && ($room['cash'][1] ?? 0) === $cash1
    && ($room['scores'][0] ?? 0) > 0 && ($room['scores'][1] ?? 0) === 0);
$check('ffa-winner-keeps-lives-loser-loses-one', $room['seats'][0]['lives'] === 3 && $room['seats'][1]['lives'] === 2);
$check('ffa-shop-opens', $room['phase'] === 'shop' && !in_array('roundlost', $types($events), true));

// A human who survives to be the last unit, drones wrecked: no life lost.
$room = $battle(1, 3);
$wreck($room, fn($t) => $t['kind'] === 'ai');
$events = [];
room_end_round($room, $events);
$check('survivor-loses-nothing', $room['seats'][0]['lives'] === 3 && $types($events) === ['roundwin'] && $events[0]['seat'] === 0);

// A human outlived by a drone loses a life, wins nothing, and the round is lost.
$room = $battle(1, 2);
$wreck($room, fn($t) => $t['kind'] === 'human' || $t['seat'] === 1);
$cash = $room['cash'][0] ?? 0;
$events = [];
room_end_round($room, $events);
$check('drone-survivor-is-roundlost', $types($events) === ['roundlost'] && !isset($events[0]['seat'])
    && $room['seats'][0]['lives'] === 2 && ($room['cash'][0] ?? 0) === $cash && $room['phase'] === 'shop');

// The last two fall together: nobody wins; the wrecked humans each lose a life.
$room = $battle(2, 1);
$wreck($room, fn($t) => true);
$check('nobody-left-settles', room_round_settled($room));
$events = [];
room_end_round($room, $events);
$check('nobody-left-is-roundlost', $types($events) === ['roundlost'] && $room['seats'][0]['lives'] === 2 && $room['seats'][1]['lives'] === 2);

// Every human wrecked: the drones fight on, ONE turn per poll, paced to the
// last volley, until one is left; then the round is lost and every human loses
// a life. $poll mimics a poll of a running room (advance, emit, settle).
$poll = function (array &$room): array {
    $events = [];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    return $events;
};
$room = $battle(2, 2, 3, 777);
$wreck($room, fn($t) => $t['kind'] === 'human');
$check('drones-fight-on-after-every-human-falls', !room_round_settled($room) && !room_humans_alive($room));
$turnsSeen = 0;
$unfinished = 0;
$maxVolley = 0;
$since = 0;      // a client that polls every time
$lagSince = 0;   // one that polls every fifth time
$gapless = true;
$lagGapless = true;
$sawWatch = true;
$onePerPoll = true;
$minWait = INF;
for ($i = 0; $i < 600 && $room['phase'] === 'play'; $i++) {
    // Nothing moves until the last volley has had time to play.
    $again = [];
    if (isset($room['pace'])) {
        $again = $poll($room);
        $onePerPoll = $onePerPoll && $again === [];
    }
    if ($room['phase'] !== 'play') {
        break;
    }
    if (isset($room['pace'])) {
        $minWait = min($minWait, $room['pace']['wait']);
        $room['pace']['at'] -= $room['pace']['wait'] + 0.01; // the volley has played
    }
    $events = $poll($room);
    $fires = array_filter($events, fn($e) => $e['t'] === 'aifire');
    $onePerPoll = $onePerPoll && count($fires) <= 1;
    $turnsSeen += count($fires);
    $sawWatch = $sawWatch && array_reduce($fires, fn($c, $e) => $c && !empty($e['watch']), true);
    $maxVolley = max($maxVolley, count($events));
    $snap = room_snapshot($room, 0, $since);
    foreach ($snap['events'] as $e) {
        $gapless = $gapless && $e['seq'] === $since + 1;
        $since = $e['seq'];
    }
    if ($i % 5 === 4) {
        $snap = room_snapshot($room, 0, $lagSince);
        foreach ($snap['events'] as $e) {
            $lagGapless = $lagGapless && $e['seq'] === $lagSince + 1;
            $lagSince = $e['seq'];
        }
    }
}
$snap = room_snapshot($room, 0, $lagSince);
foreach ($snap['events'] as $e) {
    $lagGapless = $lagGapless && $e['seq'] === $lagSince + 1;
    $lagSince = $e['seq'];
}
$check('drones-only-battle-ends', $room['phase'] === 'shop', $room['phase'] . " after $turnsSeen turns");
$check('drones-only-one-turn-per-poll', $onePerPoll && $turnsSeen >= 2, "turns=$turnsSeen");
$check('drones-only-volleys-are-marked-for-speed', $sawWatch);
$check('drones-only-gap-is-a-third', $minWait >= ROOM_DRONE_PACE_MIN / ROOM_DRONE_SPEED - 0.001 && $minWait < ROOM_DRONE_PACE_MIN,
    'min wait=' . $minWait);
$check('drones-only-no-volley-dropped-for-a-client-polling-every-time', $gapless);
$check('drones-only-no-volley-dropped-for-a-laggard', $lagGapless && $lagSince === ($room['seq'] ?? 0));
$check('event-buffer-outlasts-many-volleys', ROOM_EVENT_KEEP >= 5 * $maxVolley, "keep=" . ROOM_EVENT_KEEP . " volley=$maxVolley");
$lost = array_values(array_filter($room['events'], fn($e) => $e['t'] === 'roundlost'));
$check('drones-only-battle-is-roundlost', count($lost) === 1 && !isset($lost[0]['seat']));
$check('drones-only-every-human-loses-a-life', $room['seats'][0]['lives'] === 2 && $room['seats'][1]['lives'] === 2);

// Paced: a poll before the volley has played does nothing, whatever the guard.
$room = $battle(1, 2, 3, 99);
$wreck($room, fn($t) => $t['kind'] === 'human');
$first = $poll($room);
$second = $poll($room);
$check('pace-first-poll-fires-one-drone', count(array_filter($first, fn($e) => $e['t'] === 'aifire')) === 1);
$check('pace-early-poll-waits', $second === [] && isset($room['pace']));
$room['pace']['at'] -= $room['pace']['wait'] - 0.2;
$check('pace-still-waiting-just-short', $poll($room) === []);
$room['pace']['at'] -= 0.5;
$check('pace-then-one-more-turn', count(array_filter($poll($room), fn($e) => $e['t'] === 'aifire')) <= 1);

// The wait follows the volley: a long flight waits longer than the minimum.
$room = $battle(1, 2, 3, 5);
$events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell', 'watch' => true], ['t' => 'shot', 't1' => 9.0, 'at' => 0.0]];
room_pace_stamp($room, $events, 0);
$check('pace-follows-the-flight-time', abs($room['pace']['wait'] - (ROOM_AIM_MAX + 9.0 + ROOM_VOLLEY_LINGER) / ROOM_DRONE_SPEED) < 0.001, (string) $room['pace']['wait']);
$events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell'], ['t' => 'shot', 't1' => 0.2, 'at' => 0.0]];
room_pace_stamp($room, $events, 0);
// A short volley still waits out the client's longest aim swing and the tail.
$check('pace-covers-aim-swing-and-tail', abs($room['pace']['wait'] - max(ROOM_DRONE_PACE_MIN, ROOM_AIM_MAX + 0.2 + ROOM_VOLLEY_LINGER)) < 0.001 && $room['pace']['wait'] >= ROOM_DRONE_PACE_MIN,
    (string) $room['pace']['wait']);

// With a human standing the drones still answer inline, unpaced.
$room = $battle(1, 3, 3, 4242);
$room['tanks'][0]['hp'] = 100;
$room['turn'] = 1;
$room['pace'] = ['at' => microtime(true), 'wait' => 1000.0];
$events = [];
room_advance($room, $events);
$check('human-alive-drones-answer-inline', count(array_filter($events, fn($e) => $e['t'] === 'aifire')) >= 1
    && empty(array_filter($events, fn($e) => !empty($e['watch']))));

// The last life ends the match once the drones have fought it out.
$room = $battle(1, 2, 1, 31337);
$wreck($room, fn($t) => $t['kind'] === 'human');
for ($i = 0; $i < 600 && $room['phase'] === 'play'; $i++) {
    if (isset($room['pace'])) {
        $room['pace']['at'] -= $room['pace']['wait'] + 0.01;
    }
    $poll($room);
}
$kinds = array_column($room['events'], 't');
$check('last-life-ends-the-match-after-the-drones-finish', $room['phase'] === 'over' && in_array('eliminated', $kinds, true)
    && in_array('matchover', $kinds, true) && in_array('roundlost', $kinds, true), $room['phase']);
// ...but a second human with lives left keeps the room in the shop.
$room = $battle(2, 1, 1, 8);
$room['seats'][1]['lives'] = 2;
$wreck($room, fn($t) => $t['seat'] !== 1 || false);
$events = [];
room_end_round($room, $events);
$check('another-human-with-lives-keeps-the-match', $room['phase'] === 'shop' && $room['seats'][0]['lives'] === 0
    && $room['seats'][1]['lives'] === 2 && in_array('eliminated', $types($events), true) && $types($events)[count($events) - 1] === 'roundwin');

// Protocol fixtures (protocol/*.json): what room_snapshot builds today must
// have the keys and types the fixtures record, which the client's smoke test
// is run against. The values are not compared (generate.php --check does that
// in the room container); a changed shape fails here, on any PHP.
require_once __DIR__ . '/protocol/scenarios.php';
// Roller: touching down it does not burst but rolls the ground, downhill
// gaining speed, and bursts on a unit, at rest in a dip, or off the board.
$roller = $weapons['roller'];
$check('roller-is-a-roller', ($roller['effect'] ?? '') === 'roller' && $roller['friction'] > 0 && $roller['rollTime'] > 0);
$hills = [];
for ($ix = 0; $ix < 720; $ix++) {
    $hills[] = round(330 + 40 * sin($ix * 2 * M_PI / 240), 3); // valleys at x=60, 300, 540
}
$onHills = function (array $tanks) use ($hills) {
    foreach ($tanks as &$t) {
        $t['y'] = $hills[(int) $t['x']];
    }
    unset($t);
    return ['terrain' => $hills, 'tanks' => $tanks, 'wind' => 0.0, 'round' => 1, 'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
};
$fireRoller = function (array $room, float $angle, float $power) {
    $room['tanks'][0]['angle'] = $angle;
    $room['tanks'][0]['power'] = $power;
    $events = [['t' => 'fire', 'seat' => 0]];
    room_fire_shot($room, $events, 0, 'roller');
    return [$room, $events];
};
$shotOf = fn(array $events) => array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0];
$pathOf = fn(array $shot) => array_map(fn($p) => array_map('floatval', explode(',', $p)), explode(' ', $shot['p']));

// Fired down a slope, it rolls down and damages a unit at the bottom.
$gun = $tank(0, 'human', 60.0, 100);
$target = $tank(1, 'human', 300.0, 100);
$target['dirS'] = -1;
$room = $onHills([$gun, $target]);
[$after, $events] = $fireRoller($room, 45.0, 40.0);
$shot = $shotOf($events);
$hits = $hitsOn($events, 1);
$check('roller-rolls-down-and-hits', count($hits) === 1 && $hits[0]['direct'] && $hits[0]['dmg'] > (int) $roller['dmg'], json_encode($hits));
$path = $pathOf($shot);
$landed = null;
foreach ($path as $i => [$px, $py]) {
    if ($i > 0 && $py >= $hills[(int) round($px)] - 3.5 && $landed === null) {
        $landed = $i;
    }
}
$check('roller-path-rolls-after-landing', $landed !== null && count($path) - $landed > 8, 'landed point ' . json_encode($landed) . ' of ' . count($path));
$check('roller-path-follows-the-ground', array_reduce(array_slice($path, (int) $landed + 1, -1), fn($ok, $p) => $ok && abs($p[1] - (room_ground_at($hills, $p[0]) - ROOM_ROLL_LIFT)) < 2.0, true));
$check('roller-bursts-where-the-shot-ends', abs($shot['x1'] - $path[count($path) - 1][0]) < 1.0 && $shot['r'] === (float) $roller['radius']);
$check('roller-burst-craters-the-ground', $after['terrain'][(int) round($shot['x1'])] > $hills[(int) round($shot['x1'])]);
$check('roller-burst-after-landing', $shot['t1'] > 1.0 && $shot['x1'] > 200.0 && $shot['x1'] < 300.0, json_encode([$shot['t1'], $shot['x1']]));

// With nobody to touch it settles in the valley and craters there.
$room = $onHills([$gun, $tank(1, 'ai', 640.0, 100)]);
[$after, $events] = $fireRoller($room, 45.0, 40.0);
$shot = $shotOf($events);
$check('roller-rests-in-the-valley', abs($shot['x1'] - 300.0) < 12.0 && abs($shot['y1'] - $hills[300]) < 4.0, json_encode([$shot['x1'], $shot['y1']]));
$check('roller-valley-crater', $after['terrain'][300] > $hills[300] + 20.0 && count($hitsOn($events, 1)) === 0);
$check('roller-valley-rest-before-time-up', $shot['t1'] < 0.9 + (float) $roller['rollTime'] - 0.2, (string) $shot['t1']);

// Wind does not push a rolling ball: the same shot, windy, rolls the same
// way once down (the landing differs, the roll from a spot does not).
$flatTerrain = array_fill(0, 720, 400.0);
[$rx1, $ry1] = room_roll_out($flatTerrain, 100.0, 120.0, 30.0, $roller);
$check('roller-flat-roll-coasts-then-stops', $rx1 > 150.0 && $rx1 < 260.0 && $ry1 === 400.0, json_encode([$rx1, $ry1]));
$slow = room_roll_out($flatTerrain, 100.0, 10.0, 5.0, $roller);
$check('roller-barely-moving-stays-put', abs($slow[0] - 100.0) < 0.001);

// It bursts at the board's edge, where it runs off it.
$down = [];
for ($ix = 0; $ix < 720; $ix++) {
    $down[] = round(300 + 120 * $ix / 719, 3);
}
$room = ['terrain' => $down, 'tanks' => [$tank(0, 'human', 560.0, 100), $tank(1, 'ai', 100.0, 100)], 'wind' => 0.0, 'round' => 1,
    'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
$room['tanks'][0]['y'] = $down[560];
$room['tanks'][1]['y'] = $down[100];
[$after, $events] = $fireRoller($room, 35.0, 20.0);
$shot = $shotOf($events);
$check('roller-bursts-at-the-edge', $shot['x1'] >= 718.0 && $shot['r'] > 0 && !in_array('fizzle', array_column($events, 't'), true), json_encode([$shot['x1'], $shot['r']]));

// A roller that is still airborne when it meets a unit bursts as a direct hit, like a shell.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'human', 300.0, 100)]);
$events = [];
$end = room_fly_arc($room, $events, $room['tanks'][0], $roller, 'roller', 0, 285.0, 392.0, 300.0, 0.0, 0.5, false, null);
$check('roller-airborne-hit-is-direct', $end[0] === 'hit' && $end[5] === 1 && $end[2] < 395.0, json_encode([$end[0], $end[5], $end[2]]));

// The gunner is safe from its own roller until it has left the gunner's box,
// and it passes under a drone's body and hits the column.
$room = $flatRoom([$tank(0, 'human', 300.0, 100), $tank(1, 'ai', 500.0, 100)]);
$clear = false;
$check('roll-hit-ignores-owner-before-clear', room_roll_hit($room, 299.0, 397.0, 301.0, 397.0, 0, $clear) === null && $clear === false);
$clear = true;
$check('roll-hit-owner-after-clear', (room_roll_hit($room, 290.0, 397.0, 295.0, 397.0, 0, $clear)[0] ?? null) === 0);
$clear = true;
$check('roll-hit-drone-overhead', (room_roll_hit($room, 470.0, 397.0, 485.0, 397.0, 0, $clear)[0] ?? null) === 1);
$check('roll-hit-misses-beyond-its-width', room_roll_hit($room, 470.0, 397.0, 481.0, 397.0, 0, $clear) === null);

// Drones count a roller's landing where it comes to rest.
$land = room_sim_shot($hills, 0.0, 74.0, 342.0, 45.0, 40.0, 'roller', 1, 720);
$check('roller-aim-predicts-the-rest', !$land['oob'] && abs($land['x'] - 300.0) < 12.0, json_encode($land));

foreach (protocol_snapshots() as $name => [$about, $status, $body]) {
    $file = __DIR__ . "/protocol/$name.json";
    $fixture = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    $check("protocol-$name-present", is_array($fixture) && ($fixture['status'] ?? null) === $status);
    $want = json_encode(protocol_shape($fixture['body'] ?? null));
    $have = json_encode(protocol_shape(protocol_wire($body)));
    $check("protocol-$name-shape", $want === $have, $want === $have ? '' : 'run make protocol and read the diff; then teach the client the new shape');
}
foreach (['error-too-fast' => 429, 'error-not-your-turn' => 409, 'create-reply' => 200, 'join-reply' => 200] as $name => $status) {
    $fixture = json_decode((string) @file_get_contents(__DIR__ . "/protocol/$name.json"), true);
    $check("protocol-$name", is_array($fixture) && ($fixture['status'] ?? null) === $status
        && (isset($fixture['body']['error']) || isset($fixture['body']['token'])));
}
$fire = json_decode((string) @file_get_contents(__DIR__ . '/protocol/play-after-fire.json'), true);
$types = array_column($fire['body']['room']['events'] ?? [], 't');
$check('protocol-fire-has-shot-and-hit', in_array('fire', $types, true) && in_array('shot', $types, true) && in_array('hit', $types, true),
    implode(',', $types));

echo $fail === 0 ? "SIM-OK\n" : "SIM-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
