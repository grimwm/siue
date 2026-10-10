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

// Protocol fixtures (protocol/*.json): what room_snapshot builds today must
// have the keys and types the fixtures record, which the client's smoke test
// is run against. The values are not compared (generate.php --check does that
// in the room container); a changed shape fails here, on any PHP.
require_once __DIR__ . '/protocol/scenarios.php';
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
