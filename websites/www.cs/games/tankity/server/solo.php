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

const SOLO_ROUND_CPU = 2.0; // seconds of CPU one round may take on the server

/* src/solo.ts soloNextTurn(): the next unit standing, after the one that fired. */
function solo_next_turn(array &$s): void
{
    $n = count($s['tanks']);
    for ($k = 1; $k <= $n; $k++) {
        $i = ($s['turn'] + $k) % $n;
        if ($s['tanks'][$i]['hp'] > 0) {
            $s['turn'] = $i;
            return;
        }
    }
}

/* src/solo.ts soloSettle(): play on (the wind shifts, the next unit is up), or
   the round ends: won, a life lost, or the match lost. */
function solo_settle(array &$s): string
{
    // src/solo.ts snapTanks(): a fall stops within half a pixel, and the round goes on from exact heights.
    foreach ($s['tanks'] as &$t) {
        if ($t['hp'] > 0) {
            $t['y'] = flight_surf($s['terrain'], (float) $t['x']);
            $t['vy'] = 0.0;
        }
    }
    unset($t);
    $me = $s['tanks'][0];
    $alive = 0;
    foreach ($s['tanks'] as $t) {
        if ($t['hp'] > 0) {
            $alive++;
        }
    }
    if ($alive > 1 && !($me['hp'] <= 0 && ++$s['watchTurns'] >= ROOM_WATCH_TURNS)) {
        $s['wind'] = (int) max(-12, min(12, det_round($s['wind'] + room_gauss($s['rng']) * 2)));
        solo_next_turn($s);
        return 'next';
    }
    if ($me['hp'] <= 0) {
        $s['seats'][0]['lives']--;
        room_carry_armor($s, 0, 0, true);
        if ($s['seats'][0]['lives'] <= 0) {
            $s['seats'][0]['lives'] = 0;
            $s['phase'] = 'over';
            return 'matchLost';
        }
        $s['phase'] = 'shop';
        return 'tankLost';
    }
    $s['roundsWon']++;
    $s['scores'][0] += 750 + $s['round'] * 150;
    $s['cash'][0] += 500 + $s['round'] * 100;
    if ($s['jammer'][0] > 0) {
        $s['jammer'][0]--;
    }
    if ($s['bunker'][0] > 0) {
        $s['bunker'][0]--;
    }
    room_carry_armor($s, 0, (int) $me['hp'], false);
    $s['phase'] = 'shop';
    return 'roundWon';
}

/* src/solo.ts soloOneUps(): a life per 3000 points up to five; past five, 500 points. */
function solo_oneups(array &$s): void
{
    while ($s['scores'][0] >= $s['nextUp'][0]) {
        $s['nextUp'][0] += 3000;
        if ($s['seats'][0]['lives'] < 5) {
            $s['seats'][0]['lives']++;
        } else {
            $s['scores'][0] += 500;
        }
    }
}

/* A drone's turn, as src/solo-play.ts plays one: choose (aiChoose moves the
   drone itself; room_ai_choose leaves that to its caller), launch. */
function solo_drone_turn(array &$s): void
{
    $cur = $s['turn'];
    $choice = room_ai_choose($s, $s['tanks'][$cur]);
    if (isset($choice['tactic'])) {
        $s['tactics'][$s['tanks'][$cur]['name']] = $choice['tactic'];
    }
    $s['tanks'][$cur]['angle'] = $choice['angle'];
    $s['tanks'][$cur]['power'] = $choice['power'];
    $nx = max(12.0, min($s['w'] - 12.0, $s['tanks'][$cur]['x'] + $choice['dx']));
    if (abs($choice['dx']) > 0.5 && !room_spot_taken($s, $cur, $nx)) {
        $s['tanks'][$cur]['x'] = $nx;
        $s['tanks'][$cur]['y'] = flight_surf($s['terrain'], $nx);
    }
    if (isset($s['tanks'][$cur]['brk'])) {
        $s['tanks'][$cur]['brk']['ox'] = $s['tanks'][$cur]['x']; // the bracket remembers where it fired from
    }
    if ($choice['wkey'] !== 'shell') {
        $s['tanks'][$cur]['ammo'][$choice['wkey']] = max(0, ($s['tanks'][$cur]['ammo'][$choice['wkey']] ?? 0) - 1);
    }
    flight_launch($s, $cur, $choice['wkey']);
}

/* src/solo-play.ts playerFire(): the player's shot. The shape first (a string
   gun, three finite numbers), then the gun, the range, the landing (the page
   drops the tank while it aims), the drive (fuel pays for the distance; the
   spot must be free) and the ammo. An error line when the move is not legal. */
function solo_player_fire(array &$s, array $m): ?string
{
    $w = $m['w'] ?? null;
    if (!is_string($w)) {
        return 'bad move';
    }
    foreach (['a', 'p', 'x'] as $k) {
        $v = $m[$k] ?? null;
        if (!(is_int($v) || is_float($v)) || !is_finite((float) $v)) {
            return 'bad move';
        }
    }
    if (!isset(room_weapons()[$w])) {
        return 'no such weapon';
    }
    $a = (float) $m['a'];
    $p = (float) $m['p'];
    $x = (float) $m['x'];
    if (!($a >= 10 && $a <= 170 && $p >= 10 && $p <= 100 && $x >= 12 && $x <= $s['w'] - 12)) {
        return 'out of range';
    }
    $s['tanks'][0]['y'] = flight_surf($s['terrain'], (float) $s['tanks'][0]['x']);
    $s['tanks'][0]['vy'] = 0.0;
    $dx = abs($x - $s['tanks'][0]['x']);
    if ($dx > 0) {
        if ($dx > $s['tanks'][0]['fuel'] + 1e-6) {
            return 'not enough fuel';
        }
        if (room_spot_taken($s, 0, $x)) {
            return 'blocked';
        }
        $s['tanks'][0]['fuel'] = max(0.0, $s['tanks'][0]['fuel'] - $dx);
        $s['tanks'][0]['x'] = $x;
        $s['tanks'][0]['y'] = flight_surf($s['terrain'], $x);
    }
    $s['tanks'][0]['angle'] = $a;
    $s['tanks'][0]['power'] = $p;
    if ($w !== 'shell') {
        $have = $s['ammo'][0][$w] ?? 0;
        if ($have <= 0) {
            return 'none left';
        }
        $s['ammo'][0][$w] = $have - 1;
    }
    flight_launch($s, 0, $w);
    return null;
}

function solo_cpu_now(): float
{
    $u = getrusage();
    return $u['ru_utime.tv_sec'] + $u['ru_utime.tv_usec'] / 1e6 + $u['ru_stime.tv_sec'] + $u['ru_stime.tv_usec'] / 1e6;
}

/* How a round ended, in src/solo-log.ts RoundClaim's shape. */
function solo_claim(array $s, string $end): array
{
    return ['end' => $end, 'score' => (int) $s['scores'][0], 'cash' => (int) $s['cash'][0],
        'lives' => (int) $s['seats'][0]['lives'], 'roundsWon' => (int) $s['roundsWon']];
}

/* A buy's count as src/solo-play.ts soloRound takes it: a whole number from 1
   up, of either JSON type (JSON cannot tell 2 from 2.0); null otherwise.
   room_buy clamps it to 9. */
function solo_buy_count(mixed $q): ?int
{
    if (is_int($q)) {
        return $q >= 1 ? $q : null;
    }
    if (is_float($q) && is_finite($q) && floor($q) === $q && $q >= 1) {
        return (int) min(9.0, $q);
    }
    return null;
}

/* Plays one round of a run from its stored state (the shop before it): the
   round's purchases, the muster, then turns until the round ends, the
   player's turns taking the round's shots in order. src/solo-play.ts
   soloRound() is the same, refusal for refusal (test/solo-refusals.json holds
   them to it). At most $cpuBudget seconds of CPU, SOLO_MAX_SHOTS shots,
   SOLO_MAX_BUYS purchases and $maxSteps steps a volley. */
function solo_round(array $s, mixed $buys, mixed $shots, float $cpuBudget = SOLO_ROUND_CPU, int $maxSteps = FLIGHT_MAX_STEPS): array
{
    $no = fn(string $why): array => ['ok' => false, 'error' => $why];
    if (($s['phase'] ?? '') !== 'shop') {
        return $no('the run is over');
    }
    if (!is_array($buys) || !array_is_list($buys) || count($buys) > SOLO_MAX_BUYS) {
        return $no('bad buys');
    }
    if (!is_array($shots) || !array_is_list($shots) || count($shots) > SOLO_MAX_SHOTS) {
        return $no('too many shots');
    }
    $t0 = solo_cpu_now();
    foreach ($buys as $b) {
        $q = is_array($b) ? solo_buy_count($b['q'] ?? null) : null;
        if ($q === null || !is_string($b['i'] ?? null) || room_buy($s, 0, $b['i'], $q) !== null) {
            return $no('bad buy');
        }
        solo_oneups($s);
    }
    $s['round']++;
    solo_muster($s);
    $i = 0;
    $n = count($shots);
    for (;;) {
        if (solo_cpu_now() - $t0 > $cpuBudget) {
            return $no('too slow');
        }
        if ($s['turn'] === 0) {
            if ($i >= $n) {
                return $no('unfinished');
            }
            $m = $shots[$i++];
            $err = is_array($m) ? solo_player_fire($s, $m) : 'bad move';
            if ($err !== null) {
                return $no($err);
            }
        } else {
            solo_drone_turn($s);
        }
        flight_volley($s, null, $maxSteps);
        if ($s['shells']) {
            return $no('too slow');
        }
        solo_oneups($s);
        $end = solo_settle($s);
        if ($end === 'next') {
            continue;
        }
        if ($end !== 'matchLost') {
            solo_oneups($s);
        }
        if ($i !== $n) {
            return $no('shots after the end');
        }
        return ['ok' => true, 's' => $s, 'claim' => solo_claim($s, $end)];
    }
}
