<?php
// games/tankity/server/solo.php
// Operation Tankity: the solo referee in PHP, for the server's play of each
// round of a solo run. The rules of src/solo.ts over the room sim: a solo
// match is a room with one human at seat 0 and three drones, and draws its
// random stream in the browser's order; the solo-deal sim vectors pin it to
// the browser. Loaded by rooms.php.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const SOLO_FOES = ['reaper', 'wraith', 'spotter'];
// The most shots and buys one round's log may carry: the browser's recorder
// stops at the same numbers (test/solo-log.test.mjs holds the two equal).
const SOLO_MAX_SHOTS = 200; // src/solo-log.ts ROUND_MAX_SHOTS
const SOLO_MAX_BUYS = 60; // src/solo-log.ts ROUND_MAX_BUYS

/* src/sim.ts genTerrain(): the hills over the field's width, then five clouds
   of four numbers each, which the server must draw too to stay on the
   browser's stream. */
function solo_gen_terrain(int &$rng, int $w): array
{
    $t = room_gen_terrain($rng, $w);
    for ($i = 0; $i < 20; $i++) {
        room_rng_next($rng);
    }
    return $t;
}

/* src/solo.ts soloDeal(): the stake, three lives, full armor, the drones'
   difficulty (room_ai_choose reads it, as the room's), the field's width the
   run was started at, and the pre-match hills (drawn, never fought on). The
   match opens in the shop. */
function solo_deal(string $seed, string $difficulty, int $w): array
{
    if (room_field_width($w) === null) {
        throw new InvalidArgumentException("field width $w");
    }
    $ammo = ['shell' => -1];
    foreach (room_weapons() as $k => $_) {
        if ($k !== 'shell') {
            $ammo[$k] = $k === 'buck' ? 1 : 0;
        }
    }
    $s = [
        'code' => 'SOLO', 'seed' => $seed, 'w' => $w, 'difficulty' => room_parse_difficulty($difficulty), 'rng' => room_hash_seed($seed), 'phase' => 'shop',
        'round' => 0, 'wind' => 0, 'terrain' => [], 'tanks' => [], 'shells' => [], 'turn' => 0, 'firstTurn' => 0, 'watchTurns' => 0,
        'seats' => [0 => ['human' => true, 'initials' => 'YOU', 'lives' => 3]],
        'scores' => [0 => 0], 'cash' => [0 => 600], 'ammo' => [0 => $ammo], 'nextUp' => [0 => 3000],
        'roundsWon' => 0, 'tactics' => [],
        'plate' => [0 => 0], 'armor' => [0 => 100], 'fuelBonus' => [0 => 0],
        'shield' => [0 => false], 'jammer' => [0 => 0], 'bunker' => [0 => 0], 'laststand' => [0 => false],
    ];
    $s['terrain'] = solo_gen_terrain($s['rng'], $w);
    return $s;
}

/* src/solo.ts soloMuster(): hills, wind, four spawn spots, the player's tank and
   the three drones (a new drone is dealt a strategy), the opener rotating. */
function solo_muster(array &$s): void
{
    $s['terrain'] = solo_gen_terrain($s['rng'], $s['w']);
    $s['watchTurns'] = 0;
    $s['wind'] = (int) det_round((room_rng_next($s['rng']) * 2 - 1) * 8);
    $xs = room_spawn_spots($s['rng'], 1 + count(SOLO_FOES), $s['w']);
    $fuel = 80.0 + (float) ($s['fuelBonus'][0] ?? 0);
    $s['fuelBonus'][0] = 0;
    $s['tanks'] = [[
        'seat' => 0, 'kind' => 'human', 'name' => 'tank', 'x' => (float) $xs[0], 'y' => 0.0, 'angle' => 62.0, 'power' => 55.0,
        'hp' => room_muster_armor($s, 0), 'maxHp' => room_max_armor($s, 0), 'fuel' => $fuel, 'dirS' => 1, 'ammo' => $s['ammo'][0],
    ]];
    foreach (SOLO_FOES as $i => $id) {
        $armor = 60 + 6 * ($s['round'] - 1);
        $s['tactics'][$id] ??= room_pick_tactic($s['rng']);
        $s['tanks'][] = [
            'seat' => $i + 1, 'kind' => 'ai', 'name' => $id, 'x' => (float) $xs[$i + 1], 'y' => 0.0, 'angle' => 62.0, 'power' => 55.0,
            'hp' => $armor, 'maxHp' => $armor, 'fuel' => 0.0, 'dirS' => -1, 'ammo' => room_ai_rack((int) $s['round']), 's' => $s['tactics'][$id],
        ];
    }
    foreach ($s['tanks'] as &$t) {
        // src/sim.ts surfY(): the column under the unit, exactly.
        $t['y'] = $s['terrain'][max(0, min($s['w'] - 1, (int) det_round($t['x'])))];
        $t['dirS'] = $t['x'] < $s['w'] / 2 ? 1 : -1;
    }
    unset($t);
    $s['turn'] = $s['firstTurn'] % count($s['tanks']);
    $s['firstTurn']++;
    $s['shells'] = [];
    $s['phase'] = 'play';
}
