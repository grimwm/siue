<?php
// Operation Tankity rooms. Drone brains: bracketing a target, the strategies a drone plays and flips between
// after a dry spell, weapon choice, and the rack a drone brings to a round. Loaded by
// rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

const ROOM_AI_IDS = ['reaper', 'wraith', 'spotter'];
/* A drone's bracket learns where its volley first burst. */
function room_brk_land(array &$tank, float $x): void
{
    if (isset($tank['brk']) && $tank['brk']['land'] === null) {
        $tank['brk']['land'] = $x;
    }
}
/* Drone bracketing, like real artillery. The first shot at a target is the
 * ballistic solution plus the round's wobble (the ranging shot). While the
 * target and the gunner both stay put, each next shot starts from the last aim
 * and corrects by the measured miss, with the wobble shrinking by
 * ROOM_BRK_SHRINK per correction down to ROOM_BRK_FLOOR (never zero, so a
 * drone cannot lock into a bad aim). A target that moved more than
 * ROOM_BRK_DRIFT px, a gunner that moved, a dead target, or ROOM_BRK_MAX
 * corrections without a kill all send it back to a fresh solution.
 * src/sim.ts aiChoose is the same algorithm; protocol/sim-vectors.php keeps
 * them identical. Memory per drone: $tank['brk'] = [t target index, a, p
 * angle and power fired, w weapon, n corrections so far, tx target x then,
 * ox own x then, land first burst x of the volley (null until it bursts)]. */
const ROOM_BRK_SHRINK = 0.65;
const ROOM_BRK_FLOOR = 0.2;
const ROOM_BRK_MAX = 5;
const ROOM_BRK_DRIFT = 3.0;
const ROOM_BRK_ON = 22.0;

/* The best (angle, power) near a last aim for a shot to burst on goalX: a
 * coarse sweep, then a fine one around its best. Nearer the last aim wins ties. */
function room_ai_correct(array $room, float $mx, float $my, string $wkey, int $dirS, float $a0, float $p0, float $goalX): array
{
    $width = count($room['terrain']);
    $best = null;
    $try = function (int $a, int $p) use (&$best, $room, $mx, $my, $wkey, $dirS, $a0, $p0, $goalX, $width): void {
        if ($a < 10 || $a > 170 || $p < 10 || $p > 100) {
            return;
        }
        $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width);
        $err = ($land['oob'] ? 400 + abs($land['x'] - $goalX) * 0.2 : abs($land['x'] - $goalX)) + 0.02 * (abs($a - $a0) + abs($p - $p0));
        if ($best === null || $err < $best['err']) {
            $best = ['err' => $err, 'a' => $a, 'p' => $p];
        }
    };
    for ($da = -15; $da <= 15; $da += 3) {
        for ($dp = -18; $dp <= 18; $dp += 3) {
            $try((int) $a0 + $da, (int) $p0 + $dp);
        }
    }
    $ca = $best['a'];
    $cp = $best['p'];
    for ($da = -2; $da <= 2; $da++) {
        for ($dp = -2; $dp <= 2; $dp++) {
            $try($ca + $da, $cp + $dp);
        }
    }
    return [$best['a'], $best['p']];
}

/* Drone strategies: who a drone shoots at and how it aims. Every drone is
 * dealt one at random when it spawns, and a drone that goes ROOM_DRY_FLIP turns
 * without hurting anyone may switch (ROOM_FLIP_CHANCE per further dry turn).
 * Every strategy brackets a standing target the same way.
 *   hunter   keeps its target until it is wrecked (nearest when it picks)
 *   bully    always the nearest rival
 *   sniper   the weakest rival (lowest hp, nearest on a tie); wobble x0.8
 *   avenger  whoever last damaged it; the nearest while nobody has
 *   glory    the rival with the most score (a drone: 300 per kill); its strongest gun
 *   lobber   any rival; high arcs (above ROOM_LOB_ANGLE degrees first) and area guns
 * src/sim.ts has the same table. Per tank: 's' strategy, 'dry' turns without
 * damage, 'dealt' damage since the last turn, 'lastHitBy' tanks index of the
 * last attacker, 'kills' this round. */
const ROOM_TACTICS = ['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'];
const ROOM_DRY_FLIP = 3;
const ROOM_FLIP_CHANCE = 0.35;
const ROOM_SNIPER_WOB = 0.8;
const ROOM_LOB_ANGLE = 60;
const ROOM_LOB_OK = 40.0; // a high arc this close is good enough; otherwise flat shots may compete
const ROOM_KILL_GLORY = 300;
function room_pick_tactic(int &$rng): string
{
    return ROOM_TACTICS[(int) floor(room_rng_next($rng) * count(ROOM_TACTICS))];
}
/* The strategy dealt to a seat: a stream of its own, seeded from the room's
 * stream and the seat, so dealing never shifts the room's shots and terrain. */
function room_deal_tactic(array $room, int $seat): string
{
    $deal = room_hash_seed('tactic|' . $room['rng'] . '|' . $seat . '|' . ($room['round'] ?? 0));
    return room_pick_tactic($deal);
}
/* A different strategy from the one it has. */
function room_flip_tactic(int &$rng, string $now): string
{
    $others = array_values(array_filter(ROOM_TACTICS, fn($k) => $k !== $now));
    return $others[(int) floor(room_rng_next($rng) * count($others))];
}
/* Guns that hurt an area: pellets, cluster bomblets, a big blast. */
function room_area_gun(array $def): bool
{
    return in_array($def['effect'] ?? 'shot', ['pellets', 'cluster'], true) || ($def['radius'] ?? 0) >= 40;
}
/* The rival a strategy would pick, ignoring any bracket in progress. Null for
 * a lobber, whose pick is random. $rivals are sorted nearest first. */
function room_tactic_target(array $room, array $tank, array $rivals, string $s, ?array $mem): ?array
{
    if ($s === 'lobber') {
        return null;
    }
    $pick = $rivals[0];
    if ($s === 'hunter') {
        foreach ($rivals as $r) {
            if ($mem !== null && $r['idx'] === $mem['t']) {
                $pick = $r;
            }
        }
    } elseif ($s === 'sniper') {
        foreach ($rivals as $r) {
            if ($r['hp'] < $pick['hp']) {
                $pick = $r;
            }
        }
    } elseif ($s === 'avenger') {
        foreach ($rivals as $r) {
            if ($r['idx'] === ($tank['lastHitBy'] ?? -1)) {
                $pick = $r;
            }
        }
    } elseif ($s === 'glory') {
        $glory = fn($r) => $r['kind'] === 'human' ? ($room['scores'][$r['seat']] ?? 0) : ($r['kills'] ?? 0) * ROOM_KILL_GLORY;
        foreach ($rivals as $r) {
            if ($glory($r) > $glory($pick)) {
                $pick = $r;
            }
        }
    }
    return $pick;
}

/* Server-side drone AI: same ballistic search as the browser, with the same
 * round-scaled error, driven by the room rng stream. Remembers the shot in
 * the drone's 'brk' (the caller fixes 'ox' once the drone has moved) and
 * reports a strategy switch in 'tactic'. */
function room_ai_choose(array &$room, array $tank): array
{
    $rng = $room['rng'];
    $dirS = $tank['dirS'] ?? -1;
    [$mx, $my] = room_muzzle($tank);
    $selfIdx = null;
    foreach ($room['tanks'] as $i => $t) {
        if ($t['seat'] === $tank['seat']) {
            $selfIdx = $i;
        }
    }
    // Drones feud with each other too. Nobody is safe, nobody is perfect.
    $rivals = [];
    foreach ($room['tanks'] as $i => $t) {
        if ($t['hp'] > 0 && $t['seat'] !== $tank['seat']) {
            $rivals[] = $t + ['idx' => $i];
        }
    }
    if (!count($rivals)) {
        $room['rng'] = $rng;
        return ['wkey' => 'shell', 'angle' => 62.0, 'power' => 55.0, 'dx' => 0.0];
    }
    usort($rivals, fn($a, $b) => abs($a['x'] - $tank['x']) <=> abs($b['x'] - $tank['x']));
    $keys = ['shell'];
    $weapons = room_weapons();
    foreach ($weapons as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        if (($tank['ammo'][$k] ?? 0) > 0) {
            $keys[] = $k;
        }
    }
    // A drone that cannot hurt anyone for a while tries something else.
    $s = $tank['s'] ?? 'hunter';
    $mem = $tank['brk'] ?? null;
    $dry = $tank['dry'] ?? 0;
    $tactic = null;
    if ($mem !== null) {
        $dry = !empty($tank['dealt']) ? 0 : $dry + 1;
    }
    if ($dry >= ROOM_DRY_FLIP && room_rng_next($rng) < ROOM_FLIP_CHANCE) {
        $s = room_flip_tactic($rng, $s);
        $tactic = $s;
        $dry = 0;
        $room['tactic'][$tank['seat']] = $s;
    }
    $want = room_tactic_target($room, $tank, $rivals, $s, $mem);
    // A bracket in progress: same target standing where it stood, same gunner
    // on the same spot, the same gun still loaded, under the correction cap,
    // and a strategy that still wants that target.
    $cont = null;
    if ($mem !== null && $mem['n'] < ROOM_BRK_MAX && abs($tank['x'] - $mem['ox']) <= 1.0 && in_array($mem['w'], $keys, true)) {
        foreach ($rivals as $r) {
            if ($r['idx'] === $mem['t'] && abs($r['x'] - $mem['tx']) <= ROOM_BRK_DRIFT && ($want === null || $want['idx'] === $r['idx'])) {
                $cont = $r;
            }
        }
    }
    if ($cont !== null) {
        $me = $cont;
    } elseif ($want !== null) {
        $me = $want;
    } else {
        $me = count($rivals) > 1 ? $rivals[(int) floor(room_rng_next($rng) * count($rivals))] : $rivals[0];
    }
    $width = count($room['terrain']);
    // Deliberately shaky hands: dangerous up close, forgiving at range.
    // A jammer doubles the wobble of anything aimed at its owner.
    $skill = min(1.0, 0.35 + $room['round'] * 0.12);
    $wob = max(0.25, 1.2 - $skill) * ($s === 'sniper' ? ROOM_SNIPER_WOB : 1.0);
    if ($cont !== null) {
        $w = $mem['w'];
        $n = $mem['n'] + 1;
        $sim = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $mem['a'], (float) $mem['p'], $w, $dirS, $width);
        $landed = $mem['land'] ?? $sim['x'];
        $miss = $me['x'] - $landed;
        if (abs($miss) <= ROOM_BRK_ON) {
            $miss = 0.0; // a burst on the hull is on target: hold the aim
        }
        // Where the sim must put a shot so that, shifted by the measured miss
        // of the last one, it bursts on the target.
        [$ba, $bp] = room_ai_correct($room, $mx, $my, $w, $dirS, (float) $mem['a'], (float) $mem['p'], $sim['x'] + $miss);
        $wob = max(ROOM_BRK_FLOOR, $wob * ROOM_BRK_SHRINK ** $n);
    } else {
        $guns = $keys;
        if ($s === 'glory') {
            $top = $keys[0];
            foreach ($keys as $k) {
                if ($weapons[$k]['dmg'] > $weapons[$top]['dmg']) {
                    $top = $k;
                }
            }
            $guns = [$top];
        } elseif ($s === 'lobber') {
            $area = array_values(array_filter($keys, fn($k) => room_area_gun($weapons[$k])));
            $guns = count($area) ? $area : $keys;
        }
        $best = null;
        $consider = function (string $wkey, int $a) use (&$best, $room, $mx, $my, $dirS, $me, $width): void {
            for ($p = 20; $p <= 100; $p += 6) {
                $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width);
                $err = $land['oob'] ? 400 + abs($land['x'] - $me['x']) * 0.2 : abs($land['x'] - $me['x']);
                if ($best === null || $err < $best['err']) {
                    $best = ['err' => $err, 'a' => $a, 'p' => $p, 'wkey' => $wkey];
                }
            }
        };
        foreach ($guns as $wkey) {
            if ($s === 'lobber') {
                // High arcs first; flat ones only when no high arc lands near.
                for ($a = 25 + 6 * (int) ceil((ROOM_LOB_ANGLE + 1 - 25) / 6); $a <= 155; $a += 6) {
                    $consider($wkey, $a);
                }
            } else {
                for ($a = 25; $a <= 155; $a += 6) {
                    $consider($wkey, $a);
                }
            }
        }
        if ($s === 'lobber' && $best['err'] > ROOM_LOB_OK) {
            foreach ($guns as $wkey) {
                for ($a = 25; $a < 25 + 6 * (int) ceil((ROOM_LOB_ANGLE + 1 - 25) / 6); $a += 6) {
                    $consider($wkey, $a);
                }
            }
        }
        [$ba, $bp, $w, $n] = [$best['a'], $best['p'], $best['wkey'], 0];
    }
    if ($me['kind'] === 'human' && ($room['jammer'][$me['seat']] ?? 0) > 0) {
        $wob *= 2;
    }
    $angle = max(10.0, min(170.0, round($ba + room_gauss($rng) * 9 * $wob)));
    $power = max(10.0, min(100.0, round($bp + room_gauss($rng) * 12 * $wob)));
    // Drones shuffle for a better firing spot instead of camping one rut,
    // unless they are walking a bracket in.
    $dx = 0.0;
    if ($cont === null && room_rng_next($rng) < 0.35) {
        $dx = (room_rng_next($rng) < 0.5 ? -1.0 : 1.0) * (8 + room_rng_next($rng) * 27);
    }
    $room['rng'] = $rng;
    $room['tanks'][$selfIdx]['s'] = $s;
    $room['tanks'][$selfIdx]['dry'] = $dry;
    $room['tanks'][$selfIdx]['dealt'] = false;
    $room['tanks'][$selfIdx]['brk'] = ['t' => $me['idx'], 'a' => $angle, 'p' => $power, 'w' => $w, 'n' => $n,
        'tx' => $me['x'], 'ox' => $tank['x'], 'land' => null];
    $out = ['wkey' => $w, 'angle' => $angle, 'power' => $power, 'dx' => $dx];
    if ($tactic !== null) {
        $out['tactic'] = $tactic;
    }
    return $out;
}

/* Drone magazine from the data file: shells the battery may load by round. */
function room_ai_rack(int $round): array
{
    $rack = ['shell' => -1];
    foreach (room_weapons() as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        $rack[$k] = (!empty($def['ai']) && $round >= ($def['aiRound'] ?? 99)) ? 2 : 0;
    }
    return $rack;
}
