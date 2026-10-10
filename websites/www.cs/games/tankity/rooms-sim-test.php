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
// on the next frame while the bolt is still inside that hull.
$weapons = room_weapons();
$lance = $weapons['lance'];
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500)]);
$events = [];
room_fly_arc($room, $events, $room['tanks'][0], $lance, 'lance', 0, 285.0, 388.0, 400.0, 0.0, 0.5, false, null);
$hits = $hitsOn($events, 1);
$check('lance-hits-once', count($hits) === 1, 'hits=' . count($hits));
// Direct hits double, after falloff from where the bolt burst on the hull.
$dmg = (int) $lance['dmg'];
$check('lance-direct-damage', count($hits) === 1 && $hits[0]['direct'] && $hits[0]['dmg'] > $dmg && $hits[0]['dmg'] <= 2 * $dmg,
    'dmg=' . ($hits[0]['dmg'] ?? '?') . " range=($dmg, " . (2 * $dmg) . ']');

// The bolt keeps flying after the first hull and can still strike another.
$room = $flatRoom([$tank(0, 'human', 100.0, 100), $tank(1, 'ai', 300.0, 500), $tank(2, 'ai', 330.0, 500)]);
$events = [];
$end = room_fly_arc($room, $events, $room['tanks'][0], $lance, 'lance', 0, 285.0, 388.0, 400.0, 0.0, 0.5, false, null);
// The arc hands its final impact back to the caller: [status, x, y, vx, vy, directIdx].
$check('lance-pierces-to-next-tank', $end[0] === 'hit' && $end[5] === 2, json_encode([$end[0], $end[5]]));

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

// Last stand's wreck blast reads its numbers from weapons.json.
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

echo $fail === 0 ? "SIM-OK\n" : "SIM-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
