<?php
// Unit checks for the room server's simulation, no web server needed.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 2));
}
// The room library, storing in this test process's own directory.
require_once __DIR__ . '/rooms-lib.php';
require_once TANKITY_GAME_DIR . '/protocol/scenarios.php';

use PHPUnit\Framework\TestCase;

final class RoomsSimTest extends TestCase
{
    private static function tank(int $seat, string $kind, float $x, int $hp)
    {
        return ['seat' => $seat, 'kind' => $kind, 'name' => 'T' . $seat, 'x' => $x, 'y' => 400.0,
            'angle' => 0.0, 'power' => 50.0, 'hp' => $hp, 'maxHp' => $hp, 'fuel' => 80.0, 'dirS' => 1];
    }

    private static function flatRoom(array $tanks)
    {
        return ['terrain' => array_fill(0, 720, 400.0), 'tanks' => $tanks, 'wind' => 0.0,
            'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
    }

    private static function hitsOn(array $events, int $seat): array
    {
        return array_values(array_filter($events, fn($e) => ($e['t'] ?? '') === 'hit' && $e['seat'] === $seat));
    }

    private static function selfLoss(array $ammo, string $s, int $gap, int $dir, int $seed): array
    {
        $room = self::flatRoom([self::tank(0, 'ai', 300.0, 1000), self::tank(1, 'human', 300.0 + $dir * $gap, 100)]);
        $room += ['round' => 9, 'rng' => $seed, 'difficulty' => 'hard', 'jammer' => []];
        $room['tanks'][0] = ['dirS' => $dir, 'ammo' => ['shell' => -1] + $ammo, 's' => $s] + $room['tanks'][0];
        $c = room_ai_choose($room, $room['tanks'][0]);
        $room['tanks'][0]['angle'] = $c['angle'];
        $room['tanks'][0]['power'] = $c['power'];
        $events = [['t' => 'aifire', 'seat' => 0]];
        room_fire_shot($room, $events, 0, $c['wkey']);
        return [$c['wkey'], 1000 - $room['tanks'][0]['hp']];
    }

    private static function seatRoom(array $modes)
    {
        $room = room_new('TEST', 'hos');
        $room['seats'][0] = ['human' => true, 'initials' => 'HOS', 'token' => 't', 'lives' => 3, 'lastAct' => microtime(true)];
        foreach ($modes as $i => $m) {
            $room['seats'][$i + 1] = room_idle_seat($i + 1, $m);
        }
        room_seat_economy($room, 0);
        return $room;
    }

    /** Humans HOS (seat 0) and GST (seat 1) plus a drone, round won. */
    private static function shopRoom(int $humans = 2)
    {
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
    }

    /** A lost round (a drone outlasts every human) also goes through the shop: a life gone, no winnings, the same clock; the last life still ends the match. */
    private static function lostRoom(int $lives)
    {
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
    }

    /** Humans in seats 0..$humans-1 plus drones in the rest of the four seats, every human on three lives, the round started. */
    private static function battle(int $humans, int $drones, int $lives = 3, int $rng = 12345)
    {
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
    }

    private static function wreck(array &$room, callable $which): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($which($t)) {
                $t['hp'] = 0;
            }
        }
        unset($t);
    }

    private static function types(array $events): array
    {
        return array_column($events, 't');
    }

    /** Mimics a poll of a running room: advance, then emit; each volley settles its own falls. */
    private static function poll(array &$room): array
    {
        $events = [];
        room_advance($room, $events);
        foreach ($events as $e) {
            room_emit($room, $e);
        }
        return $events;
    }

    /** A flat room with a tough human at 200 and a drone at 500, each turn played by droneTurn(). */
    private static function bracketRoom(int $seed, int $round, array $extra = [], string $level = 'normal')
    {
        $room = self::flatRoom(array_merge([self::mk(0, 'human', 200.0, 1), self::mk(1, 'ai', 500.0, -1)], $extra));
        $room['wind'] = 2.0;
        $room['round'] = $round;
        $room['rng'] = $seed;
        $room['jammer'] = [];
        $room['difficulty'] = $level;
        return $room;
    }

    /** What the room's caller does for a drone: choose, move if it wants to, fire the volley, which records the burst. Returns how far the burst landed from the target. */
    private static function droneTurn(array &$room, int $idx): float
    {
        $choice = room_ai_choose($room, $room['tanks'][$idx]);
        $room['tanks'][$idx]['angle'] = $choice['angle'];
        $room['tanks'][$idx]['power'] = $choice['power'];
        if (abs($choice['dx']) > 0.5) {
            $room['tanks'][$idx]['x'] = max(12.0, min(708.0, $room['tanks'][$idx]['x'] + $choice['dx']));
        }
        $room['tanks'][$idx]['brk']['ox'] = $room['tanks'][$idx]['x'];
        $events = [['t' => 'aifire', 'seat' => $idx]];
        room_fire_shot($room, $events, $idx, 'shell');
        $land = $room['tanks'][$idx]['brk']['land'];
        return $land === null ? 400.0 : abs($land - $room['tanks'][$room['tanks'][$idx]['brk']['t']]['x']);
    }

    private static function median(array $v): float
    {
        sort($v);
        return (float) $v[intdiv(count($v), 2)];
    }

    /** A tough drone-or-human unit for the bracketing and strategy scenes: nobody dies mid-test. */
    private static function mk(int $seat, string $kind, float $x, int $dir)
    {
        return ['seat' => $seat, 'kind' => $kind, 'name' => 'T' . $seat, 'x' => $x, 'y' => 400.0,
            'angle' => 62.0, 'power' => 55.0, 'hp' => 100000, 'maxHp' => 100000, 'fuel' => 0.0, 'dirS' => $dir, 'ammo' => []];
    }

    private static function scene(string $strategy, array $shooter = [], array $far = [], array $near = [])
    {
        $human = ['hp' => 80] + self::mk(0, 'human', 100.0, 1);
        $weak = ['hp' => 30] + self::mk(2, 'ai', 300.0, 1);
        $near = $near + ['hp' => 70, 'kills' => 4] + self::mk(3, 'ai', 450.0, -1);
        $gunner = $shooter + ['s' => $strategy] + self::mk(1, 'ai', 520.0, -1);
        $room = ['terrain' => array_fill(0, 720, 400.0), 'wind' => 0.0, 'round' => 3, 'rng' => 12, 'jammer' => [],
            'scores' => [0 => 900], 'tanks' => [$far + $human, $gunner, $weak, $near]];
        return $room;
    }

    private static function picks(string $strategy, array $shooter = [], array $far = [], array $near = []): int
    {
        $room = self::scene($strategy, $shooter, $far, $near);
        room_ai_choose($room, $room['tanks'][1]);
        return $room['tanks'][1]['brk']['t'];
    }

    private static function tiePick()
    {
        $room = ['terrain' => array_fill(0, 720, 400.0), 'wind' => 0.0, 'round' => 2, 'rng' => 5, 'jammer' => [], 'scores' => [],
            'tanks' => [self::mk(0, 'human', 100.0, 1), ['s' => 'sniper'] + self::mk(1, 'ai', 520.0, -1), self::mk(2, 'ai', 330.0, 1), self::mk(3, 'ai', 260.0, 1)]];
        room_ai_choose($room, $room['tanks'][1]);
        return $room['tanks'][1]['brk']['t'];
    }

    private static function spread(string $strategy): float
    {
        $v = [];
        for ($seed = 1; $seed <= 60; $seed++) {
            $room = self::scene($strategy, [], [], ['kills' => 0]);
            $room['tanks'][2]['hp'] = 70; // same target for both: the nearest, tied on hp
            $room['rng'] = $seed;
            $v[] = room_ai_choose($room, $room['tanks'][1])['angle'];
        }
        $m = array_sum($v) / count($v);
        return sqrt(array_sum(array_map(fn($x) => ($x - $m) ** 2, $v)) / count($v));
    }

    private static function deal(int $seed): string
    {
        return room_pick_tactic($seed);
    }

    private static function onHills(array $tanks)
    {
        $hills = self::hills();
        foreach ($tanks as &$t) {
            $t['y'] = $hills[(int) $t['x']];
        }
        unset($t);
        return ['terrain' => $hills, 'tanks' => $tanks, 'wind' => 0.0, 'round' => 1, 'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
    }

    private static function fireRoller(array $room, float $angle, float $power)
    {
        $room['tanks'][0]['angle'] = $angle;
        $room['tanks'][0]['power'] = $power;
        $events = [['t' => 'fire', 'seat' => 0]];
        room_fire_shot($room, $events, 0, 'roller');
        return [$room, $events];
    }

    private static function shotOf(array $events)
    {
        return array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0];
    }

    private static function pathOf(array $shot)
    {
        return array_map(fn($p) => array_map('floatval', explode(',', $p)), explode(' ', $shot['p']));
    }

    /** Where a beam fired by $t is $s px along its line. */
    private static function along(array $t, float $s): array
    {
        [$mx, $my] = room_muzzle($t);
        $a = deg2rad($t['angle']);
        return [$mx + det_cos($a) * $t['dirS'] * $s, $my - det_sin($a) * $s];
    }

    private static function hurt(float $x)
    {
        return room_blast_damage(60, room_dist($x - 300.0, 370.0 - 390.0), 90.0);
    }

    /** Rolling hills with valleys at x=60, 300 and 540. */
    private static function hills(): array
    {
        $hills = [];
        for ($ix = 0; $ix < 720; $ix++) {
            $hills[] = round(330 + 40 * sin($ix * 2 * M_PI / 240), 3);
        }
        return $hills;
    }

    /** A room whose round has just started: the host and a drone, the hills fresh. */
    private static function revisionRound(): array
    {
        $round = room_new('REV1', 'ABC');
        $round['seats'][0] = room_seat_human('ABC', 'tok', [], '');
        $round['seats'][1] = room_idle_seat(1, 'ai');
        $round['seats'][2] = room_idle_seat(2, 'open');
        $round['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($round, 0);
        room_start_round($round);
        return $round;
    }

    /** Every field a row may leave out reads the default src/sim.ts uses, and no row carries a free drone rack. */
    public function testWeaponRowDefaults(): void
    {
        foreach (room_weapons() as $k => $def) {
            self::assertTrue(!array_key_exists('aiRound', $def) && !array_key_exists('aiRack', $def), "no-free-rack-$k");
        }
        $bare = room_weapon_row(['key' => 'x', 'dmg' => 5, 'radius' => 5]);
        self::assertTrue($bare['start'] === 0 && $bare['apex'] === false && $bare['hops'] === 1 && $bare['hopKeep'] === 0.5
            && $bare['kick'] === 150.0 && $bare['fuse'] === 0.9 && $bare['fan'] === 0.22 && $bare['split'] === 4 && $bare['speed'] === 1.0, 'weapon-row-defaults' . ' :: ' . json_encode($bare));
        self::assertTrue(room_weapon_row(['key' => 'x', 'apex' => true, 'hops' => 3, 'hopKeep' => 0.55, 'kick' => 90])
            === array_replace($bare, ['name' => 'x', 'apex' => true, 'hops' => 3, 'hopKeep' => 0.55, 'kick' => 90.0, 'dmg' => 30, 'radius' => 24, 'subDmg' => 30, 'subRadius' => 24]), 'weapon-row-reads-new-fields');
    }

    /** Bomblets of one burst burst as they land: every cluster and scatter gun's shots after the first land in time order, fired either way. */
    public function testBombletsLandInOrder(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if (!in_array($def['effect'], ['cluster', 'scatter'], true)) {
                continue;
            }
            foreach ([[1, 120.0], [-1, 600.0]] as [$dirS, $x]) {
                $room = self::flatRoom([self::tank(0, 'human', $x, 1000), self::tank(1, 'ai', 360.0, 1000)]);
                $room['tanks'][0] = ['dirS' => $dirS, 'angle' => 45.0, 'power' => 60.0] + $room['tanks'][0];
                $room['tanks'][1]['y'] = 200.0;
                $events = [['t' => 'fire', 'seat' => 0]];
                room_fire_shot($room, $events, 0, $k);
                $landings = array_map(fn($e) => $e['t1'], array_values(array_filter($events, fn($e) => ($e['t'] ?? '') === 'shot' && $e['t0'] > 0)));
                $sorted = $landings;
                sort($sorted);
                self::assertTrue(count($landings) > 1 && $landings === $sorted, "bomblets-land-in-order-$k-$dirS" . ' :: ' . json_encode($landings));
            }
        }
    }

    /** A drone never hurts itself with its own Funky Bomb, its target 160 to 220 px away: it chooses, it fires what it chose, and its armor is unchanged. */
    public function testDroneNeverHurtsItselfWithFunkyBomb(): void
    {
        foreach ([160, 170, 180, 190, 200, 210, 220] as $gap) {
            foreach ([1, -1] as $dir) {
                foreach ([1, 2, 3] as $seed) {
                    $room = self::flatRoom([self::tank(0, 'ai', 360.0, 1000), self::tank(1, 'human', 360.0 + $dir * $gap, 100)]);
                    $room += ['round' => 9, 'rng' => $seed, 'difficulty' => 'hard', 'jammer' => []];
                    $room['tanks'][0]['dirS'] = $dir;
                    $room['tanks'][0]['ammo'] = ['shell' => -1, 'funky' => 1];
                    $room['tanks'][0]['s'] = 'hunter';
                    $c = room_ai_choose($room, $room['tanks'][0]);
                    $room['tanks'][0]['angle'] = $c['angle'];
                    $room['tanks'][0]['power'] = $c['power'];
                    $events = [['t' => 'aifire', 'seat' => 0]];
                    room_fire_shot($room, $events, 0, $c['wkey']);
                    self::assertTrue($room['tanks'][0]['hp'] === 1000, "funky-never-hurts-its-drone-$gap-$dir-$seed" . ' :: ' . "{$c['wkey']}: hp {$room['tanks'][0]['hp']}");
                }
            }
        }
    }

    /** Point blank, every strategy fires what hurts itself least: it chooses from a full round-9 rack, fires it from where it aimed, and loses no more than it would firing a Shell alone (within 3 hp: the predicted landing is not quite where the shell bursts). */
    public function testPointBlankLeastSelfHarm(): void
    {
        $fullRack = tankity_test_rack();
        unset($fullRack['shell']);
        foreach (['hunter', 'bully', 'sniper', 'avenger', 'glory', 'lobber'] as $s) {
            for ($gap = 20; $gap <= 80; $gap += 10) {
                foreach ([1, -1] as $dir) {
                    foreach ([1, 2] as $seed) {
                        [$k, $lost] = self::selfLoss($fullRack, $s, $gap, $dir, $seed);
                        [, $alone] = self::selfLoss([], $s, $gap, $dir, $seed);
                        self::assertTrue($lost <= $alone + 3, "point-blank-least-self-harm-$s-$gap-$dir-$seed" . ' :: ' . "$k cost $lost, Shell alone $alone");
                    }
                }
            }
        }
    }

    /** A harmless burst (dmg 0) carves its crater and touches no unit: no hit, no shield spent, nobody credited or blamed. */
    public function testHarmlessBurst(): void
    {
        $room = self::flatRoom([self::tank(0, 'ai', 100.0, 100), self::tank(1, 'human', 300.0, 100), self::tank(2, 'ai', 330.0, 100)]);
        $room['shield'][1] = true;
        $before = $room['terrain'];
        $events = [];
        room_explode($room, $events, $room['tanks'][0], 'shell', 310.0, 395.0, 1, ['dmg' => 0, 'radius' => 40]);
        self::assertTrue($events === [], 'harmless-blast-no-events' . ' :: ' . json_encode($events));
        self::assertTrue($room['shield'][1] === true && $room['tanks'][1]['hp'] === 100 && $room['tanks'][2]['hp'] === 100, 'harmless-blast-keeps-shield-and-armor');
        self::assertTrue(!isset($room['tanks'][1]['lastHitBy']) && !isset($room['tanks'][2]['lastHitBy']) && empty($room['tanks'][0]['dealt']), 'harmless-blast-credits-nobody');
        self::assertTrue($room['terrain'] !== $before, 'harmless-blast-still-carves');
        // It still credits the fall of a unit it dug out from under, as any crater does.
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', 300.0, 100)]);
        $events = [];
        room_explode($room, $events, $room['tanks'][0], 'shell', 300.0, 400.0, null, ['dmg' => 0, 'radius' => 45]);
        self::assertTrue(($room['tanks'][1]['fellBy'] ?? null) === 0 && $events === [], 'harmless-crater-credits-the-fall' . ' :: ' . json_encode([$room['tanks'][1]['fellBy'] ?? null, $events]));
    }

    /** Hit boxes follow the drawn units, and a shell is tested along its whole step: a fast shell crossing a drone's body in one step still hits it, and one passing under a drone (where the old ground-level circle sat) does not. */
    public function testSweepHitBoxes(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', 300.0, 500)]);
        $clear = true;
        $hit = room_sweep_hit($room, 270.0, 370.0, 330.0, 370.0, null, 0, $clear);
        self::assertTrue($hit !== null && $hit[0] === 1, 'sweep-hits-drone-body' . ' :: ' . json_encode($hit));
        self::assertTrue(room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, null, 0, $clear) === null, 'sweep-misses-under-drone');
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 300.0, 100)]);
        self::assertTrue((room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, null, 0, $clear)[0] ?? null) === 1, 'sweep-hits-tank-hull');
        self::assertTrue(room_sweep_hit($room, 270.0, 392.0, 330.0, 392.0, 1, 0, $clear) === null, 'sweep-skips-pierced');
    }

    /** A shell leaves the muzzle inside its own gunner's box (a drone's body sits 30 px up, the muzzle 14 px up and 20 px out): it ignores its gunner until it is clear of that box, then hits it like anyone else if it comes back. */
    public function testOwnShellLeavesGunnerBox(): void
    {
        $weapons = room_weapons();
        $room = self::flatRoom([self::tank(0, 'ai', 300.0, 100), self::tank(1, 'human', 600.0, 100)]);
        $clear = false;
        self::assertTrue(room_sweep_hit($room, 309.0, 368.0, 330.0, 360.0, null, 0, $clear) === null && $clear, 'own-shell-passes-out-of-gunner');
        self::assertTrue((room_sweep_hit($room, 330.0, 360.0, 300.0, 370.0, null, 0, $clear)[0] ?? null) === 0, 'own-shell-hits-gunner-coming-back');
        $room = self::flatRoom([self::tank(0, 'ai', 300.0, 100), self::tank(1, 'human', 600.0, 100)]);
        $events = [];
        $a = deg2rad(62.0);
        $end = room_fly_arc($room, $events, $room['tanks'][0], $weapons['shell'], 'shell', 0,
            300.0 + cos($a) * 20, 386.0 - sin($a) * 20, cos($a) * 120, -sin($a) * 120, 0.0, false, null);
        self::assertTrue($end[5] !== 0 && self::hitsOn($events, 0) === [], 'drone-shot-does-not-hit-itself' . ' :: ' . json_encode([$end[0], $end[5]]));
    }

    /** Banked fuel adds on when the tanks muster; drones are untouched. */
    public function testBankedFuel(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 125), self::tank(1, 'ai', 300.0, 60)]);
        $room['fuelApplied'] = [0 => 60];
        room_apply_fuel($room);
        $me = $room['tanks'][0];
        self::assertTrue($me['fuel'] === 140.0, 'fuel-banked' . ' :: ' . 'fuel=' . $me['fuel']);
        self::assertTrue($room['tanks'][1]['hp'] === 60, 'drone-untouched');
    }

    /** Last stand's wreck blast reads its numbers from game.json. */
    public function testLaststandBlastFromData(): void
    {
        $ls = room_gear('laststand');
        self::assertTrue(isset($ls['dmg'], $ls['radius']) && (int) $ls['dmg'] > 0 && (float) $ls['radius'] > 0, 'laststand-blast-from-data' . ' :: ' . 'dmg=' . ($ls['dmg'] ?? '?') . ' radius=' . ($ls['radius'] ?? '?'));
    }

    /** Spawns: never closer than ROOM_SPAWN_GAP, always on the field, and seat 0 (the host) does not always land on the left. */
    public function testSpawnSpots(): void
    {
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
        self::assertTrue($minGap >= ROOM_SPAWN_GAP, 'spawn-gap' . ' :: ' . 'min gap=' . $minGap);
        self::assertTrue($inside, 'spawn-on-field');
        self::assertTrue($hostLeftmost > 20 && $hostLeftmost < 120, 'spawn-host-varies' . ' :: ' . "host leftmost in $hostLeftmost/200");
    }

    /** Moves never end on top of another unit. */
    public function testMovesNeverStack(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', 140.0, 60), self::tank(2, 'ai', 300.0, 0)]);
        self::assertTrue(room_spot_taken($room, 0, 120.0), 'spot-taken-near');
        self::assertTrue(!room_spot_taken($room, 0, 200.0), 'spot-free-far');
        self::assertTrue(!room_spot_taken($room, 1, 160.0), 'spot-ignores-self'); // 20 from itself, 60 from tank 0
        self::assertTrue(!room_spot_taken($room, 0, 290.0), 'spot-ignores-wrecks');
    }

    /** Replay stamping: a shot event carries its path and flight times, and the blast it causes lands at the moment the shell does. */
    public function testReplayStamping(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', 300.0, 500)]);
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
        self::assertTrue(($events[0]['at'] ?? null) === 0.0, 'replay-fire-at-zero');
        self::assertTrue($shot !== null && count($pts) >= 3, 'replay-shot-path' . ' :: ' . 'points=' . count($pts));
        self::assertTrue($shot !== null && $shot['t0'] === 0.0 && $shot['t1'] > 0.2, 'replay-shot-times' . ' :: ' . 't1=' . ($shot['t1'] ?? '?'));
        // Same shot again with a tank parked where it landed: its hit must carry the
        // landing time.
        $landX = $shot['x1'] ?? 300.0;
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', $landX, 500)]);
        $room['tanks'][0]['angle'] = 45.0;
        $room['tanks'][0]['power'] = 60.0;
        $events = [['t' => 'fire', 'seat' => 0, 'w' => 'shell']];
        room_fire_shot($room, $events, 0, 'shell');
        $shot2 = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0] ?? null;
        $hits = array_values(array_filter($events, fn($e) => $e['t'] === 'hit'));
        self::assertTrue($shot2 !== null && count($hits) >= 1 && abs($hits[0]['at'] - $shot2['t1']) < 0.001, 'replay-blast-at-landing' . ' :: ' . json_encode(['t1' => $shot2['t1'] ?? null, 'hits' => array_map(fn($e) => $e['at'], $hits)]));
    }

    /** A drone on the left fires to the right, the way it faces. */
    public function testDroneFiresItsFacing(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 600.0, 100), self::tank(1, 'ai', 100.0, 500)]);
        $room['tanks'][1]['dirS'] = 1;
        $room['tanks'][1]['angle'] = 45.0;
        $events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell']];
        room_fire_shot($room, $events, 1, 'shell');
        $shot = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'))[0] ?? null;
        self::assertTrue($shot !== null && $shot['x1'] > $shot['x0'], 'drone-fires-its-facing' . ' :: ' . json_encode([$shot['x0'] ?? null, $shot['x1'] ?? null]));
    }

    /** The lobby's silhouettes come from the terrain a room on that map plays. */
    public function testMapProfiles(): void
    {
        foreach (ROOM_MAPS as $id => $m) {
            $prof = room_map_profile($id);
            $rng = room_hash_seed($m['seed'] . '|round1');
            $terrain = room_gen_terrain($rng, 720);
            $ok = count($prof) === ROOM_PROFILE_N && min($prof) >= 0.0 && max($prof) <= 1.0
                && abs($prof[0] - (415.0 - $terrain[0]) / 225.0) < 0.001
                && abs($prof[ROOM_PROFILE_N - 1] - (415.0 - $terrain[719]) / 225.0) < 0.001;
            self::assertTrue($ok, "map-profile-$id" . ' :: ' . json_encode([count($prof), min($prof), max($prof)]));
        }
        self::assertTrue(count(array_unique(array_map(fn($id) => json_encode(room_map_profile($id)), array_keys(ROOM_MAPS)))) === count(ROOM_MAPS), 'map-profiles-differ');
    }

    /** Seat modes: open seats field no unit, the rest do, and spacing and the drones' turns hold up with fewer tanks. */
    public function testSeatModes(): void
    {
        $room = self::seatRoom(['ai', 'open', 'open']);
        room_start_round($room);
        self::assertTrue(count($room['tanks']) === 2 && room_fielded($room) === 2
            && array_column($room['tanks'], 'seat') === [0, 1], 'open-seats-no-tanks' . ' :: ' . json_encode(array_column($room['tanks'], 'seat')));
        $room = self::seatRoom(['ai', 'ai', 'ai']);
        room_start_round($room);
        self::assertTrue(count($room['tanks']) === 4, 'all-seats-four-tanks');
        $gapOk = true;
        for ($i = 0; $i < 60; $i++) {
            $room = self::seatRoom(['ai', 'open', 'ai']);
            $room['rng'] = $i * 104729 + 17;
            room_start_round($room);
            $xs = array_column($room['tanks'], 'x');
            sort($xs);
            for ($j = 1; $j < count($xs); $j++) {
                $gapOk = $gapOk && $xs[$j] - $xs[$j - 1] >= ROOM_SPAWN_GAP;
            }
            $gapOk = $gapOk && count($xs) === 3;
        }
        self::assertTrue($gapOk, 'spawn-gap-fewer-tanks');
        $room = self::seatRoom(['ai', 'open', 'open']);
        room_start_round($room);
        $events = [];
        room_advance($room, $events);
        self::assertTrue($room['phase'] === 'play' && $room['tanks'][$room['turn']]['kind'] === 'human', 'ai-turns-with-two-tanks' . ' :: ' . 'turn=' . $room['turn']);
        // The human's turn clock started on the advance above; while it runs, aiming
        // (a fresh lastAct) never resets it and the room waits.
        $left = room_turn_left($room);
        self::assertTrue($left !== null && $left > ROOM_TURN_DEFAULT - 5 && $left <= ROOM_TURN_DEFAULT, 'turn-clock-runs' . ' :: ' . 'left=' . $left);
        $room['seats'][0]['lastAct'] = microtime(true);
        $room['clock']['at'] -= 30;
        self::assertTrue(room_turn_left($room) < ROOM_TURN_DEFAULT - 29, 'turn-clock-ignores-aim');
        $events = [];
        room_advance($room, $events);
        self::assertTrue(count($events) === 0, 'turn-clock-waits' . ' :: ' . json_encode($events));
        $room['clock']['at'] = 0; // out of time: the crew fires for the human, then the lone drone answers
        $events = [];
        room_advance($room, $events);
        $aiShots = count(array_filter($events, fn($e) => $e['t'] === 'aifire'));
        self::assertTrue($aiShots >= 1 && $aiShots <= 2, 'lone-drone-fires' . ' :: ' . 'aifire=' . $aiShots);
        self::assertTrue(count(array_filter($events, fn($e) => $e['t'] === 'auto')) === 1, 'turn-clock-auto-fires');
        // The next time it is the human's turn, the clock starts afresh.
        self::assertTrue(($room['tanks'][$room['turn']]['kind'] ?? '') !== 'human' || room_turn_left($room) > ROOM_TURN_DEFAULT - 5, 'turn-clock-fresh-next-turn');
    }

    /** A guest leaving the lobby frees the chair back to a drone seat; a host leaving a begun match hands the tank to the battery and the room lives on. */
    public function testLeavingTheLobby(): void
    {
        $room = self::seatRoom(['ai', 'open', 'ai']);
        $room['seats'][1] = ['human' => true, 'initials' => 'GST', 'token' => 'g', 'lives' => 3];
        room_seat_economy($room, 1);
        self::assertTrue(room_leave($room, 1) === true && ($room['seats'][1]['human'] ?? true) === false
            && ($room['seats'][1]['mode'] ?? '') === 'ai', 'lobby-leave-keeps-room');
        $room['seats'][1] = ['human' => true, 'initials' => 'GST', 'token' => 'g', 'lives' => 3];
        self::assertTrue(room_leave($room, 0) === false, 'lobby-host-leave-closes');
        $room = self::seatRoom(['ai', 'open', 'ai']);
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
        self::assertTrue($left === true && ($room['seats'][0]['human'] ?? true) === false
            && $hostTank !== null && $hostTank['kind'] === 'ai' && $room['seats'][1]['human'] === true, 'host-leave-mid-match-continues');
    }

    /** The shop between multiplayer rounds: ready is a wanted state, the last ready starts the round inside the same step, and the clock starts it too. */
    public function testShopOpensAfterARound(): void
    {
        [$room, $events, $cash] = self::lostRoom(3);
        self::assertTrue($room['phase'] === 'shop' && room_shop_left($room) > 90 - 2, 'lost-round-opens-the-shop' . ' :: ' . $room['phase']);
        self::assertTrue($room['seats'][0]['lives'] === 2 && ($room['cash'][0] ?? 0) === $cash, 'lost-round-costs-a-life-pays-nothing');
        self::assertTrue(array_column($events, 't') === ['roundlost'], 'lost-round-says-so' . ' :: ' . json_encode(array_column($events, 't')));
        room_shop_set_ready($room, 0, true);
        self::assertTrue(room_shop_settle($room) === true && $room['phase'] === 'play', 'lost-round-shop-starts-the-next-round');
        [$room, $events] = self::lostRoom(1);
        self::assertTrue($room['phase'] === 'over' && in_array('matchover', array_column($events, 't'), true), 'last-life-lost-ends-the-match');
    }

    /** Drones left alone cannot stall a round forever: after ROOM_WATCH_TURNS drone-only turns it ends as the battery's, and solo uses the same number. */
    public function testDroneStalemate(): void
    {
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
        self::assertTrue($stall['phase'] === 'shop' && in_array('roundlost', array_column($events, 't'), true), 'drone-stalemate-ends-the-round' . ' :: ' . $stall['phase'] . ' ' . json_encode(array_column($events, 't')));
        $flowSrc = (string) file_get_contents(TANKITY_GAME_DIR . '/src/flow.ts');
        self::assertTrue((bool) preg_match('/WATCH_TURNS = ' . ROOM_WATCH_TURNS . ';/', $flowSrc), 'solo-and-rooms-share-the-stalemate-cap');

        $room = self::shopRoom();
        self::assertTrue($room['phase'] === 'shop' && room_shop_left($room) > 90 - 2 && room_shop_left($room) <= 90, 'shop-opens-with-clock' . ' :: ' . $room['phase'] . ' ' . (string) room_shop_left($room));
        $snap = room_snapshot($room, 0, 0);
        self::assertTrue($snap['shopLeft'] > 85 && $snap['seats'][0]['ready'] === false && $snap['seats'][2]['ready'] === false, 'shop-snapshot-carries-clock-and-ready');
        self::assertTrue(room_shop_left(['phase' => 'play']) === null, 'shop-clock-null-in-play');
    }

    /** All ready starts the round; one of two ready does not. */
    public function testShopAllReadyStarts(): void
    {
        $room = self::shopRoom();
        room_shop_set_ready($room, 0, true);
        self::assertTrue(room_shop_settle($room) === false && $room['phase'] === 'shop'
            && room_snapshot($room, 0, 0)['seats'][0]['ready'] === true, 'shop-one-ready-waits');
        room_shop_set_ready($room, 1, true);
        $round0 = $room['round'];
        self::assertTrue(room_shop_settle($room) === true && $room['phase'] === 'play' && $room['round'] === $round0 + 1, 'shop-all-ready-starts');
        self::assertTrue(!isset($room['shop']) && room_snapshot($room, 0, 0)['shopLeft'] === null
            && room_snapshot($room, 0, 0)['seats'][0]['ready'] === false, 'shop-start-clears-state');
    }

    /** Unready while the other has not readied: the shop stays and the flag clears. */
    public function testShopUnreadyClears(): void
    {
        $room = self::shopRoom();
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        room_shop_set_ready($room, 0, false);
        self::assertTrue(room_shop_settle($room) === false && $room['phase'] === 'shop' && !room_shop_ready($room, 0), 'shop-unready-before-all');
        room_shop_set_ready($room, 1, true);
        self::assertTrue(room_shop_settle($room) === false && $room['phase'] === 'shop', 'shop-unready-blocks-start');
    }

    /** The race: the last ready starts the round, and an unready that arrives afterwards neither reopens the shop nor un-starts the round. */
    public function testShopReadyRace(): void
    {
        $room = self::shopRoom();
        room_shop_set_ready($room, 0, true);
        room_shop_set_ready($room, 1, true);
        room_shop_settle($room);
        $tanksBefore = json_encode($room['tanks']);
        $roundBefore = $room['round'];
        $applied = room_shop_set_ready($room, 0, false);
        self::assertTrue($applied === false && room_shop_settle($room) === false
            && $room['phase'] === 'play' && $room['round'] === $roundBefore && json_encode($room['tanks']) === $tanksBefore
            && !isset($room['shop']), 'shop-late-unready-ignored');
    }

    /** Duplicate ready is idempotent: a retried request cannot flip the state. */
    public function testShopDuplicateReady(): void
    {
        $room = self::shopRoom();
        room_shop_set_ready($room, 0, true);
        room_shop_set_ready($room, 0, true);
        self::assertTrue(room_shop_ready($room, 0) === true && room_shop_settle($room) === false, 'shop-duplicate-ready-idempotent');
        room_shop_set_ready($room, 0, false);
        room_shop_set_ready($room, 0, false);
        self::assertTrue(room_shop_ready($room, 0) === false, 'shop-duplicate-unready-idempotent');
    }

    /** The clock: an expired shop starts the round whatever the ready flags say. */
    public function testShopClockStartsTheRound(): void
    {
        $room = self::shopRoom();
        $room['shop']['at'] = microtime(true) - 90 - 1;
        self::assertTrue(room_shop_left($room) === 0.0 && room_shop_settle($room) === true && $room['phase'] === 'play', 'shop-clock-expiry-starts');
        $room = self::shopRoom();
        $room['shop']['at'] = microtime(true) - 90 + 5;
        self::assertTrue(room_shop_settle($room) === false && $room['phase'] === 'shop', 'shop-clock-running-waits');
    }

    /** A leaver does not block: the seat becomes a drone, so the remaining human's ready is enough. */
    public function testShopLeaverDoesNotBlock(): void
    {
        $room = self::shopRoom();
        room_shop_set_ready($room, 0, true);
        room_shop_settle($room);
        room_leave($room, 1);
        self::assertTrue(room_shop_settle($room) === true && $room['phase'] === 'play', 'shop-leaver-does-not-block');
        // A leaver who had readied does not count towards anything either.
        $room = self::shopRoom();
        room_shop_set_ready($room, 1, true);
        room_leave($room, 1);
        self::assertTrue(room_shop_ready($room, 1) === false && room_shop_settle($room) === false, 'shop-leaver-ready-is-not-a-vote');
    }

    /** AI and open seats never block: a lone human readying starts the round. */
    public function testShopNeverBlocksOnAiOrOpenSeats(): void
    {
        $room = self::shopRoom(1);
        self::assertTrue(room_shop_settle($room) === false, 'shop-ai-never-blocks-waits-for-human');
        room_shop_set_ready($room, 0, true);
        self::assertTrue(room_shop_settle($room) === true && $room['phase'] === 'play', 'shop-ai-never-blocks');
        // An eliminated human (no lives) never blocks either.
        $room = self::shopRoom();
        $room['seats'][1]['lives'] = 0;
        room_shop_set_ready($room, 0, true);
        self::assertTrue(room_shop_settle($room) === true, 'shop-eliminated-never-blocks');
        // Ready changes outside the shop are refused, and settle is inert there.
        $room = self::seatRoom(['ai', 'open', 'open']);
        room_start_round($room);
        self::assertTrue(room_shop_set_ready($room, 0, true) === false && room_shop_settle($room) === false && !isset($room['shop']), 'shop-ready-outside-shop');
    }

    /** A round ends only with one unit left standing, humans and drones alike. */
    public function testFreeForAllRound(): void
    {
        // Free-for-all: the drones are all wrecked but two humans live, so the round
        // goes on; it ends when one human is left, who alone is paid.
        $room = self::battle(2, 2);
        self::wreck($room, fn($t) => $t['kind'] === 'ai');
        self::assertTrue(!room_round_settled($room), 'ffa-two-humans-fight-on');
        $events = [];
        $room['turn'] = 0;
        room_advance($room, $events);
        self::assertTrue($room['phase'] === 'play' && self::types($events) === [], 'ffa-waits-on-a-human');
        $cash0 = $room['cash'][0] ?? 0;
        $cash1 = $room['cash'][1] ?? 0;
        self::wreck($room, fn($t) => $t['seat'] === 1);
        self::assertTrue(room_round_settled($room), 'ffa-last-human-settles');
        $events = [];
        room_end_round($room, $events);
        $won = array_values(array_filter($events, fn($e) => $e['t'] === 'roundwin'));
        self::assertTrue(count($won) === 1 && $won[0]['seat'] === 0 && $won[0]['round'] === 1, 'ffa-roundwin-names-the-winner' . ' :: ' . json_encode($events));
        self::assertTrue(($room['cash'][0] ?? 0) > $cash0 && ($room['cash'][1] ?? 0) === $cash1
            && ($room['scores'][0] ?? 0) > 0 && ($room['scores'][1] ?? 0) === 0, 'ffa-winner-paid-loser-not');
        self::assertTrue($room['seats'][0]['lives'] === 3 && $room['seats'][1]['lives'] === 2, 'ffa-winner-keeps-lives-loser-loses-one');
        self::assertTrue($room['phase'] === 'shop' && !in_array('roundlost', self::types($events), true), 'ffa-shop-opens');
    }

    /** A human who survives to be the last unit, drones wrecked: no life lost. */
    public function testLastHumanStandingWins(): void
    {
        $room = self::battle(1, 3);
        self::wreck($room, fn($t) => $t['kind'] === 'ai');
        $events = [];
        room_end_round($room, $events);
        self::assertTrue($room['seats'][0]['lives'] === 3 && self::types($events) === ['roundwin'] && $events[0]['seat'] === 0, 'survivor-loses-nothing');
    }

    /** A human outlived by a drone loses a life, wins nothing, and the round is lost. */
    public function testHumanOutlivedByDroneLosesALife(): void
    {
        $room = self::battle(1, 2);
        self::wreck($room, fn($t) => $t['kind'] === 'human' || $t['seat'] === 1);
        $cash = $room['cash'][0] ?? 0;
        $events = [];
        room_end_round($room, $events);
        self::assertTrue(self::types($events) === ['roundlost'] && !isset($events[0]['seat'])
            && $room['seats'][0]['lives'] === 2 && ($room['cash'][0] ?? 0) === $cash && $room['phase'] === 'shop', 'drone-survivor-is-roundlost');
    }

    /** The last two fall together: nobody wins; the wrecked humans each lose a life. */
    public function testLastTwoFallTogether(): void
    {
        $room = self::battle(2, 1);
        self::wreck($room, fn($t) => true);
        self::assertTrue(room_round_settled($room), 'nobody-left-settles');
        $events = [];
        room_end_round($room, $events);
        self::assertTrue(self::types($events) === ['roundlost'] && $room['seats'][0]['lives'] === 2 && $room['seats'][1]['lives'] === 2, 'nobody-left-is-roundlost');
    }

    /** Every human wrecked: the drones fight on, ONE turn per poll, paced to the last volley, until one is left; then the round is lost and every human loses a life. */
    public function testDronesFightOnAfterEveryHumanFalls(): void
    {
        $room = self::battle(2, 2, 3, 777);
        self::wreck($room, fn($t) => $t['kind'] === 'human');
        self::assertTrue(!room_round_settled($room) && !room_humans_alive($room), 'drones-fight-on-after-every-human-falls');
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
                $again = self::poll($room);
                $onePerPoll = $onePerPoll && $again === [];
            }
            if ($room['phase'] !== 'play') {
                break;
            }
            if (isset($room['pace'])) {
                $minWait = min($minWait, $room['pace']['wait']);
                $room['pace']['at'] -= $room['pace']['wait'] + 0.01; // the volley has played
            }
            $events = self::poll($room);
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
        self::assertTrue($room['phase'] === 'shop', 'drones-only-battle-ends' . ' :: ' . $room['phase'] . " after $turnsSeen turns");
        self::assertTrue($onePerPoll && $turnsSeen >= 2, 'drones-only-one-turn-per-poll' . ' :: ' . "turns=$turnsSeen");
        self::assertTrue($sawWatch, 'drones-only-volleys-are-marked-for-speed');
        self::assertTrue($minWait >= ROOM_DRONE_PACE_MIN / ROOM_DRONE_SPEED - 0.001 && $minWait < ROOM_DRONE_PACE_MIN, 'drones-only-gap-is-a-third' . ' :: ' . 'min wait=' . $minWait);
        self::assertTrue($gapless, 'drones-only-no-volley-dropped-for-a-client-polling-every-time');
        self::assertTrue($lagGapless && $lagSince === ($room['seq'] ?? 0), 'drones-only-no-volley-dropped-for-a-laggard');
        self::assertTrue(ROOM_EVENT_KEEP >= 5 * $maxVolley, 'event-buffer-outlasts-many-volleys' . ' :: ' . "keep=" . ROOM_EVENT_KEEP . " volley=$maxVolley");
        $lost = array_values(array_filter($room['events'], fn($e) => $e['t'] === 'roundlost'));
        self::assertTrue(count($lost) === 1 && !isset($lost[0]['seat']), 'drones-only-battle-is-roundlost');
        self::assertTrue($room['seats'][0]['lives'] === 2 && $room['seats'][1]['lives'] === 2, 'drones-only-every-human-loses-a-life');
    }

    /** Paced: a poll before the volley has played does nothing, whatever the guard. */
    public function testPacedPollWaitsForTheVolley(): void
    {
        $room = self::battle(1, 2, 3, 99);
        self::wreck($room, fn($t) => $t['kind'] === 'human');
        $first = self::poll($room);
        $second = self::poll($room);
        self::assertTrue(count(array_filter($first, fn($e) => $e['t'] === 'aifire')) === 1, 'pace-first-poll-fires-one-drone');
        self::assertTrue($second === [] && isset($room['pace']), 'pace-early-poll-waits');
        $room['pace']['at'] -= $room['pace']['wait'] - 0.2;
        self::assertTrue(self::poll($room) === [], 'pace-still-waiting-just-short');
        $room['pace']['at'] -= 0.5;
        self::assertTrue(count(array_filter(self::poll($room), fn($e) => $e['t'] === 'aifire')) <= 1, 'pace-then-one-more-turn');
    }

    /** The wait follows the volley: a long flight waits longer than the minimum. */
    public function testWaitFollowsTheVolley(): void
    {
        $room = self::battle(1, 2, 3, 5);
        $events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell', 'watch' => true], ['t' => 'shot', 't1' => 9.0, 'at' => 0.0]];
        room_pace_stamp($room, $events, 0);
        self::assertTrue(abs($room['pace']['wait'] - (ROOM_AIM_MAX + 9.0 + ROOM_VOLLEY_LINGER) / ROOM_DRONE_SPEED) < 0.001, 'pace-follows-the-flight-time' . ' :: ' . (string) $room['pace']['wait']);
        $events = [['t' => 'aifire', 'seat' => 1, 'w' => 'shell'], ['t' => 'shot', 't1' => 0.2, 'at' => 0.0]];
        room_pace_stamp($room, $events, 0);
        // A short volley still waits out the client's longest aim swing and the tail.
        self::assertTrue(abs($room['pace']['wait'] - max(ROOM_DRONE_PACE_MIN, ROOM_AIM_MAX + 0.2 + ROOM_VOLLEY_LINGER)) < 0.001 && $room['pace']['wait'] >= ROOM_DRONE_PACE_MIN, 'pace-covers-aim-swing-and-tail' . ' :: ' . (string) $room['pace']['wait']);
    }

    /** With a human standing the drones still answer inline, unpaced. */
    public function testDronesAnswerInlineWithAHumanStanding(): void
    {
        $room = self::battle(1, 3, 3, 4242);
        $room['tanks'][0]['hp'] = 100;
        $room['turn'] = 1;
        $room['pace'] = ['at' => microtime(true), 'wait' => 1000.0];
        $events = [];
        room_advance($room, $events);
        self::assertTrue(count(array_filter($events, fn($e) => $e['t'] === 'aifire')) >= 1
            && empty(array_filter($events, fn($e) => !empty($e['watch']))), 'human-alive-drones-answer-inline');
    }

    /** The last life ends the match once the drones have fought it out. */
    public function testLastLifeEndsTheMatch(): void
    {
        $room = self::battle(1, 2, 1, 31337);
        self::wreck($room, fn($t) => $t['kind'] === 'human');
        for ($i = 0; $i < 600 && $room['phase'] === 'play'; $i++) {
            if (isset($room['pace'])) {
                $room['pace']['at'] -= $room['pace']['wait'] + 0.01;
            }
            self::poll($room);
        }
        $kinds = array_column($room['events'], 't');
        self::assertTrue($room['phase'] === 'over' && in_array('eliminated', $kinds, true)
            && in_array('matchover', $kinds, true) && in_array('roundlost', $kinds, true), 'last-life-ends-the-match-after-the-drones-finish' . ' :: ' . $room['phase']);
        // ...but a second human with lives left keeps the room in the shop.
        $room = self::battle(2, 1, 1, 8);
        $room['seats'][1]['lives'] = 2;
        self::wreck($room, fn($t) => $t['seat'] !== 1 || false);
        $events = [];
        room_end_round($room, $events);
        self::assertTrue($room['phase'] === 'shop' && $room['seats'][0]['lives'] === 0
            && $room['seats'][1]['lives'] === 2 && in_array('eliminated', self::types($events), true) && self::types($events)[count($events) - 1] === 'roundwin', 'another-human-with-lives-keeps-the-match');
    }

    /** Difficulty: only the three exact words count; anything else, and a room stored before the setting, aims at normal. */
    public function testDifficultyParsing(): void
    {
        foreach ([['easy', 'easy'], ['normal', 'normal'], ['hard', 'hard'], [null, 'normal'], ['', 'normal'], ['HARD', 'normal'],
            [' hard', 'normal'], ['brutal', 'normal'], [2, 'normal'], [['hard'], 'normal'], [true, 'normal']] as $i => [$raw, $want]) {
            self::assertTrue(room_parse_difficulty($raw) === $want, "difficulty-parse-$i" . ' :: ' . json_encode($raw) . ' -> ' . room_parse_difficulty($raw));
        }
        $old = room_new('OLDR', 'abc');
        unset($old['difficulty']);
        self::assertTrue(room_difficulty($old) === 'normal' && room_snapshot($old, null, 0)['difficulty'] === 'normal', 'difficulty-old-room-is-normal');
        self::assertTrue(room_new('NEWR', 'abc')['difficulty'] === 'normal', 'difficulty-new-room-is-normal');
        self::assertTrue(array_keys(ROOM_DIFFICULTY) === ['easy', 'normal', 'hard'], 'difficulty-table-matches-the-levels');
    }

    /** Drone bracketing: a drone that keeps shooting at a target standing still walks its shots in. The target is a tough human (nobody dies mid-test), the ground is flat, and each turn is what the room's caller does for a drone: choose, move if it wants to, fire the volley, which records the burst. */
    public function testBracketingWalksShotsIn(): void
    {
        $seeds = 60;
        $misses = [[], [], [], []];
        $hitWithin4 = 0;
        foreach ([1, 3] as $round) {
            for ($seed = 1; $seed <= $seeds; $seed++) {
                // Hard: the full-correction aim these thresholds describe; each
                // level's hit rates are test/ai-hitrate.test.ts's.
                $room = self::bracketRoom($seed * 7919, $round, [], 'hard');
                $hit = false;
                for ($k = 0; $k < 4; $k++) {
                    $hp = $room['tanks'][0]['hp'];
                    $misses[$k][$round][] = self::droneTurn($room, 1);
                    $hit = $hit || $room['tanks'][0]['hp'] < $hp;
                }
                $hitWithin4 += $hit ? 1 : 0;
            }
        }
        foreach ([1, 3] as $round) {
            $med = array_map(fn($k) => self::median($misses[$k][$round]), [0, 1, 2, 3]);
            self::assertTrue($med[1] < $med[0] && $med[2] < $med[1] && $med[3] <= $med[2] + 3, "bracket-misses-shrink-round$round" . ' :: ' . // the last shots sit on the hull-edge floor
                'median |miss| by shot ' . implode(', ', array_map('round', $med)));
        }
        self::assertTrue($hitWithin4 >= 0.75 * 2 * $seeds, 'bracket-hits-within-4-shots-in-most-seeds' . ' :: ' . "$hitWithin4 of " . (2 * $seeds));
    }

    /** The ranging shot starts at zero corrections and every shot at the same standing target adds one, up to the cap; then it starts over. */
    public function testBracketCorrectionsCountUp(): void
    {
        $room = self::bracketRoom(77, 2);
        $ns = [];
        for ($k = 0; $k < ROOM_DIFFICULTY['normal']['brkMax'] + 2; $k++) {
            self::droneTurn($room, 1);
            $ns[] = $room['tanks'][1]['brk']['n'];
        }
        self::assertTrue($ns === [0, 1, 2, 3, 4, 5, 0], 'bracket-corrections-count-up-to-the-cap-then-restart' . ' :: ' . implode(',', $ns));
    }

    /** A target that drives off, or a gunner that moves, goes back to a fresh solution. */
    public function testBracketResetsWhenTheSceneMoves(): void
    {
        $room = self::bracketRoom(5, 2);
        self::droneTurn($room, 1);
        self::droneTurn($room, 1);
        $before = $room['tanks'][1]['brk']['n'];
        $room['tanks'][0]['x'] += 40.0;
        self::droneTurn($room, 1);
        self::assertTrue($before === 1 && $room['tanks'][1]['brk']['n'] === 0, 'bracket-target-moved-resets-corrections' . ' :: ' . "before=$before after=" . $room['tanks'][1]['brk']['n']);
        self::droneTurn($room, 1);
        self::droneTurn($room, 1);
        $before = $room['tanks'][1]['brk']['n'];
        $room['tanks'][1]['x'] -= 25.0;
        self::droneTurn($room, 1);
        self::assertTrue($before >= 1 && $room['tanks'][1]['brk']['n'] === 0, 'bracket-gunner-moved-resets-corrections' . ' :: ' . "before=$before after=" . $room['tanks'][1]['brk']['n']);
        $room = self::bracketRoom(5, 2);
        self::droneTurn($room, 1);
        $room['tanks'][0]['x'] += ROOM_BRK_DRIFT - 1.0; // a nudge inside the tolerance still counts as standing still
        self::droneTurn($room, 1);
        self::assertTrue($room['tanks'][1]['brk']['n'] === 1, 'bracket-a-small-nudge-keeps-the-bracket');
    }

    /** With several rivals a drone keeps the target it is bracketing instead of the 40% random switch, and picks another once that target is wrecked. */
    public function testBracketKeepsItsTarget(): void
    {
        $stuck = 0;
        for ($seed = 1; $seed <= 20; $seed++) {
            $room = self::bracketRoom($seed * 31, 3, [self::mk(2, 'ai', 330.0, 1), self::mk(3, 'ai', 640.0, -1)]);
            self::droneTurn($room, 1);
            $first = $room['tanks'][1]['brk']['t'];
            $same = true;
            for ($k = 0; $k < 3; $k++) {
                self::droneTurn($room, 1);
                $same = $same && $room['tanks'][1]['brk']['t'] === $first;
            }
            $stuck += $same ? 1 : 0;
        }
        self::assertTrue($stuck === 20, 'bracket-keeps-its-target' . ' :: ' . "$stuck of 20 seeds");
        $room = self::bracketRoom(9, 3, [self::mk(2, 'ai', 330.0, 1)]);
        self::droneTurn($room, 1);
        $first = $room['tanks'][1]['brk']['t'];
        $room['tanks'][$first]['hp'] = 0;
        self::droneTurn($room, 1);
        self::assertTrue($room['tanks'][1]['brk']['t'] !== $first && $room['tanks'][1]['brk']['n'] === 0, 'bracket-switches-when-the-target-dies');

        // The memory is a handful of numbers per drone.
        self::assertTrue(strlen(json_encode($room['tanks'][1]['brk'])) < 160, 'bracket-memory-is-small' . ' :: ' . (string) strlen(json_encode($room['tanks'][1]['brk'])));
    }

    /** Drone strategies. A scene: a human leading on score at x=100, a drone shooter (seat 1) at 520, a weak drone at 300 and a strong, nearest drone at 450 with kills; each strategy must pick its own target. */
    public function testStrategies(): void
    {
        self::assertTrue(self::picks('hunter') === 3 && self::picks('bully') === 3, 'tactic-hunter-and-bully-take-the-nearest');
        self::assertTrue(self::picks('sniper') === 2, 'tactic-sniper-takes-the-weakest');
        self::assertTrue(self::picks('avenger', ['lastHitBy' => 0]) === 0 && self::picks('avenger') === 3
            && self::picks('avenger', ['lastHitBy' => 0], ['hp' => 0]) === 3, 'tactic-avenger-takes-its-attacker-else-the-nearest');
        self::assertTrue(self::picks('glory') === 3 && self::picks('glory', [], [], ['kills' => 1]) === 0, 'tactic-glory-takes-the-leader');
        self::assertTrue(self::tiePick() === 2, 'tactic-sniper-ties-go-to-the-nearest');
        // A hunter holds the target it picked even when a weaker or nearer one turns up.
        $room = self::scene('hunter');
        room_ai_choose($room, $room['tanks'][1]);
        $room['tanks'][2]['hp'] = 1;
        $room['tanks'][3]['x'] = 380.0;
        room_ai_choose($room, $room['tanks'][1]);
        self::assertTrue($room['tanks'][1]['brk']['t'] === 3, 'tactic-hunter-keeps-its-target');
        $room['tanks'][3]['hp'] = 0;
        room_ai_choose($room, $room['tanks'][1]);
        self::assertTrue($room['tanks'][1]['brk']['t'] === 2, 'tactic-hunter-moves-on-when-its-target-dies');
        // A lobber lobs: high arcs and area guns; a glory-hunter takes its most harmful gun.
        $lobAngles = [];
        for ($seed = 1; $seed <= 12; $seed++) {
            $room = self::scene('lobber');
            $room['rng'] = $seed;
            $c = room_ai_choose($room, $room['tanks'][1]);
            $lobAngles[] = $c['angle'];
        }
        self::assertTrue(self::median($lobAngles) >= 60, 'tactic-lobber-lobs' . ' :: ' . implode(',', $lobAngles));
        $room = self::scene('lobber', ['ammo' => ['needle' => 1, 'buck' => 2]], [], ['x' => 250.0]);
        self::assertTrue(room_ai_choose($room, $room['tanks'][1])['wkey'] === 'buck', 'tactic-lobber-prefers-area-guns');
        // Its target 70 px off, every high arc of Buckshot would reach the lobber itself: it fires a gun that spares it.
        $room = self::scene('lobber', ['ammo' => ['needle' => 1, 'buck' => 2]]);
        $c = room_ai_choose($room, $room['tanks'][1]);
        self::assertTrue($room['tanks'][1]['brk']['t'] === 3 && $c['wkey'] !== 'buck', 'tactic-lobber-spares-itself-point-blank' . ' :: ' . json_encode($c));
        // Glory goes for the drone with 4 kills, 70 px off: every big blast would reach the gunner itself, so it fires the Shell.
        $room = self::scene('glory', ['ammo' => ['mortar' => 2, 'heavy' => 2, 'buck' => 2]]);
        self::assertTrue(room_ai_choose($room, $room['tanks'][1])['wkey'] === 'shell', 'tactic-glory-spares-itself');
        // A sniper's hands are steadier: a smaller spread of aims than a bully's.
        self::assertTrue(self::spread('sniper') < self::spread('bully'), 'tactic-sniper-aims-steadier' . ' :: ' . round(self::spread('sniper'), 2) . ' vs ' . round(self::spread('bully'), 2));
    }

    /** A dry spell flips the strategy, never before three dry turns, and resets dry. */
    public function testDryFlipsTheStrategy(): void
    {
        $firstFlip = [];
        $flipOk = true;
        for ($seed = 1; $seed <= 80; $seed++) {
            $room = self::scene('bully');
            $room['rng'] = $seed * 17;
            $flippedAt = null;
            for ($k = 0; $k < 12 && $flippedAt === null; $k++) {
                $c = room_ai_choose($room, $room['tanks'][1]);
                if (isset($c['tactic'])) {
                    $flippedAt = $k;
                    $t = $room['tanks'][1];
                    $flipOk = $flipOk && $t['dry'] === 0 && $t['s'] === $c['tactic'] && $c['tactic'] !== 'bully' && in_array($c['tactic'], ROOM_TACTICS, true)
                        && ($room['tactic'][1] ?? null) === $c['tactic'];
                }
            }
            $firstFlip[] = $flippedAt;
        }
        $flips = array_filter($firstFlip, fn($k) => $k !== null);
        self::assertTrue(count($flips) > 0 && min($flips) >= ROOM_DRY_FLIP, 'tactic-no-flip-before-three-dry-turns' . ' :: ' . 'earliest=' . (count($flips) ? min($flips) : 'none'));
        self::assertTrue($flipOk, 'tactic-flip-resets-dry-and-switches');
        self::assertTrue(count($flips) >= 60, 'tactic-flips-happen-in-a-dry-spell' . ' :: ' . count($flips) . ' of 80 seeds within 12 turns');
        // A drone that keeps hurting someone never flips.
        $flipped = 0;
        for ($seed = 1; $seed <= 30; $seed++) {
            $room = self::scene('bully');
            $room['rng'] = $seed * 13;
            for ($k = 0; $k < 12; $k++) {
                $room['tanks'][1]['dealt'] = true;
                $flipped += isset(room_ai_choose($room, $room['tanks'][1])['tactic']) ? 1 : 0;
            }
        }
        self::assertTrue($flipped === 0, 'tactic-no-flip-while-hurting-someone' . ' :: ' . (string) $flipped);
    }

    /** Assignment: random per seed, the same every time for a seed, all six dealt. */
    public function testTacticAssignment(): void
    {
        $seen = [];
        for ($seed = 1; $seed <= 200; $seed++) {
            $seen[self::deal($seed)] = true;
        }
        self::assertTrue(count($seen) === 6 && array_diff(ROOM_TACTICS, array_keys($seen)) === [], 'tactic-assignment-covers-all-six' . ' :: ' . implode(',', array_keys($seen)));
        self::assertTrue(self::deal(41) === self::deal(41) && self::deal(7) === self::deal(7), 'tactic-assignment-is-deterministic');
        // Dealt at round start and kept; a seat taken over by a bot gets one too.
        $seats = [['human' => true, 'name' => 'AAA', 'initials' => 'AAA', 'lives' => 3, 'mode' => 'human'],
            ['human' => false, 'name' => 'B', 'initials' => 'B', 'mode' => 'ai'], ['human' => false, 'name' => 'C', 'initials' => 'C', 'mode' => 'ai']];
        $room = ['seats' => $seats, 'round' => 0, 'map' => null, 'rng' => 99, 'plate' => [], 'ammo' => [], 'scores' => [], 'cash' => []];
        room_start_round($room);
        $first = array_map(fn($t) => $t['s'] ?? null, $room['tanks']);
        room_start_round($room);
        $again = array_map(fn($t) => $t['s'] ?? null, $room['tanks']);
        self::assertTrue($first[0] === null && in_array($first[1], ROOM_TACTICS, true) && in_array($first[2], ROOM_TACTICS, true), 'tactic-dealt-to-each-drone-at-round-start' . ' :: ' . json_encode($first));
        self::assertTrue($first === $again, 'tactic-kept-from-round-to-round' . ' :: ' . json_encode([$first, $again]));
    }

    /** Damage bookkeeping: whoever last hurt a unit, whether the shooter dealt damage, kills. */
    public function testDamageBookkeeping(): void
    {
        $room = self::flatRoom([self::tank(0, 'ai', 300.0, 100), self::tank(1, 'ai', 340.0, 20), self::tank(2, 'ai', 600.0, 100)]);
        $events = [];
        room_explode($room, $events, $room['tanks'][0], 'mortar', 340.0, 370.0, 1, null);
        self::assertTrue(($room['tanks'][1]['lastHitBy'] ?? null) === 0 && !empty($room['tanks'][0]['dealt'])
            && empty($room['tanks'][2]['dealt']) && $room['tanks'][1]['hp'] === 0 && ($room['tanks'][0]['kills'] ?? 0) === 1 && !isset($room['tanks'][0]['lastHitBy']), 'tactic-hit-records-attacker-and-damage' . ' :: ' . json_encode([$room['tanks'][0], $room['tanks'][1]['lastHitBy'] ?? null]));
    }

    /** Roller: touching down it does not burst but rolls the ground, downhill gaining speed, and bursts on a unit, at rest in a dip, or off the board. */
    public function testRollerIsARoller(): void
    {
        $weapons = room_weapons();
        $roller = $weapons['roller'];
        self::assertTrue(($roller['effect'] ?? '') === 'roller' && $roller['friction'] > 0 && $roller['rollTime'] > 0, 'roller-is-a-roller');
    }

    /** Fired down a slope, it rolls down and damages a unit at the bottom. */
    public function testRollerRollsDownAndHits(): void
    {
        $weapons = room_weapons();
        $roller = $weapons['roller'];
        $hills = self::hills();
        $gun = self::tank(0, 'human', 60.0, 100);
        $target = self::tank(1, 'human', 300.0, 100);
        $target['dirS'] = -1;
        $room = self::onHills([$gun, $target]);
        [$after, $events] = self::fireRoller($room, 45.0, 44.0);
        $shot = self::shotOf($events);
        $hits = self::hitsOn($events, 1);
        self::assertTrue(count($hits) === 1 && $hits[0]['direct'] && $hits[0]['dmg'] > (int) $roller['dmg'], 'roller-rolls-down-and-hits' . ' :: ' . json_encode($hits));
        $path = self::pathOf($shot);
        $landed = null;
        foreach ($path as $i => [$px, $py]) {
            if ($i > 0 && $py >= $hills[(int) round($px)] - 3.5 && $landed === null) {
                $landed = $i;
            }
        }
        self::assertTrue($landed !== null && count($path) - $landed > 8, 'roller-path-rolls-after-landing' . ' :: ' . 'landed point ' . json_encode($landed) . ' of ' . count($path));
        self::assertTrue(array_reduce(array_slice($path, (int) $landed + 1, -1), fn($ok, $p) => $ok && abs($p[1] - (room_ground_at($hills, $p[0]) - ROOM_ROLL_LIFT)) < 2.0, true), 'roller-path-follows-the-ground');
        self::assertTrue(abs($shot['x1'] - $path[count($path) - 1][0]) < 1.0 && $shot['r'] === (float) $roller['radius'], 'roller-bursts-where-the-shot-ends');
        self::assertTrue($after['terrain'][(int) round($shot['x1'])] > $hills[(int) round($shot['x1'])], 'roller-burst-craters-the-ground');
        self::assertTrue($shot['t1'] > 1.0 && $shot['x1'] > 200.0 && $shot['x1'] < 300.0, 'roller-burst-after-landing' . ' :: ' . json_encode([$shot['t1'], $shot['x1']]));
    }

    /** With nobody to touch it settles in the valley and craters there. */
    public function testRollerRestsInTheValley(): void
    {
        $weapons = room_weapons();
        $roller = $weapons['roller'];
        $hills = self::hills();
        $gun = self::tank(0, 'human', 60.0, 100);
        $room = self::onHills([$gun, self::tank(1, 'ai', 640.0, 100)]);
        [$after, $events] = self::fireRoller($room, 45.0, 52.0);
        $shot = self::shotOf($events);
        self::assertTrue(abs($shot['x1'] - 300.0) < 12.0 && abs($shot['y1'] - $hills[300]) < 4.0, 'roller-rests-in-the-valley' . ' :: ' . json_encode([$shot['x1'], $shot['y1']]));
        self::assertTrue($after['terrain'][300] > $hills[300] + 20.0 && count(self::hitsOn($events, 1)) === 0, 'roller-valley-crater');
        self::assertTrue($shot['t1'] < 0.9 + (float) $roller['rollTime'] - 0.2, 'roller-valley-rest-before-time-up' . ' :: ' . (string) $shot['t1']);
    }

    /** Wind does not push a rolling ball: the same shot, windy, rolls the same way once down (the landing differs, the roll from a spot does not). */
    public function testRollerFlatRoll(): void
    {
        $weapons = room_weapons();
        $roller = $weapons['roller'];
        $flatTerrain = array_fill(0, 720, 400.0);
        [$rx1, $ry1] = room_roll_out($flatTerrain, 100.0, 120.0, 30.0, $roller);
        self::assertTrue($rx1 > 150.0 && $rx1 < 260.0 && $ry1 === 400.0, 'roller-flat-roll-coasts-then-stops' . ' :: ' . json_encode([$rx1, $ry1]));
        $slow = room_roll_out($flatTerrain, 100.0, 10.0, 5.0, $roller);
        self::assertTrue(abs($slow[0] - 100.0) < 0.001, 'roller-barely-moving-stays-put');
    }

    /** It bursts at the board's edge, where it runs off it. */
    public function testRollerBurstsAtTheEdge(): void
    {
        $down = [];
        for ($ix = 0; $ix < 720; $ix++) {
            $down[] = round(300 + 120 * $ix / 719, 3);
        }
        $room = ['terrain' => $down, 'tanks' => [self::tank(0, 'human', 560.0, 100), self::tank(1, 'ai', 100.0, 100)], 'wind' => 0.0, 'round' => 1,
            'scores' => [], 'cash' => [], 'shield' => [], 'bunker' => [], 'laststand' => []];
        $room['tanks'][0]['y'] = $down[560];
        $room['tanks'][1]['y'] = $down[100];
        [$after, $events] = self::fireRoller($room, 35.0, 20.0);
        $shot = self::shotOf($events);
        self::assertTrue($shot['x1'] >= 718.0 && $shot['r'] > 0 && !in_array('fizzle', array_column($events, 't'), true), 'roller-bursts-at-the-edge' . ' :: ' . json_encode([$shot['x1'], $shot['r']]));
    }

    /** A roller that is still airborne when it meets a unit bursts as a direct hit, like a shell. */
    public function testRollerAirborneHitIsDirect(): void
    {
        $weapons = room_weapons();
        $roller = $weapons['roller'];
        $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 300.0, 100)]);
        $events = [];
        $end = room_fly_arc($room, $events, $room['tanks'][0], $roller, 'roller', 0, 285.0, 392.0, 300.0, 0.0, 0.5, false, null);
        self::assertTrue($end[0] === 'hit' && $end[5] === 1 && $end[2] < 395.0, 'roller-airborne-hit-is-direct' . ' :: ' . json_encode([$end[0], $end[5], $end[2]]));
    }

    /** The gunner is safe from its own roller until it has left the gunner's box, and it passes under a drone's body and hits the column. */
    public function testRollHitOwnerAndDrones(): void
    {
        $room = self::flatRoom([self::tank(0, 'human', 300.0, 100), self::tank(1, 'ai', 500.0, 100)]);
        $clear = false;
        self::assertTrue(room_roll_hit($room, 299.0, 397.0, 301.0, 397.0, 0, $clear) === null && $clear === false, 'roll-hit-ignores-owner-before-clear');
        $clear = true;
        self::assertTrue((room_roll_hit($room, 290.0, 397.0, 295.0, 397.0, 0, $clear)[0] ?? null) === 0, 'roll-hit-owner-after-clear');
        $clear = true;
        self::assertTrue((room_roll_hit($room, 470.0, 397.0, 485.0, 397.0, 0, $clear)[0] ?? null) === 1, 'roll-hit-drone-overhead');
        self::assertTrue(room_roll_hit($room, 470.0, 397.0, 481.0, 397.0, 0, $clear) === null, 'roll-hit-misses-beyond-its-width');
    }

    /** Drones count a roller's landing where it comes to rest. */
    public function testDronesAimAtARollersRest(): void
    {
        $hills = self::hills();
        $land = room_sim_shot($hills, 0.0, 74.0, 342.0, 45.0, 52.0, 'roller', 1, 720);
        self::assertTrue(!$land['oob'] && abs($land['x'] - 300.0) < 12.0, 'roller-aim-predicts-the-rest' . ' :: ' . json_encode($land));
    }

    /** Terrain revisions: the counter rises exactly when the hills change. */
    public function testTerrainRevisions(): void
    {
        $revRoom = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'ai', 300.0, 500)]);
        $revRoom['terrainRev'] = 7;
        $revEvents = [];
        room_explode($revRoom, $revEvents, $revRoom['tanks'][0], 'shell', 200.0, 10.0, null); // bursts in the sky
        self::assertTrue($revRoom['terrainRev'] === 7, 'rev-steady-when-nothing-is-carved' . ' :: ' . 'rev=' . $revRoom['terrainRev']);
        room_explode($revRoom, $revEvents, $revRoom['tanks'][0], 'shell', 200.0, 400.0, null); // bursts on the ground
        self::assertTrue($revRoom['terrainRev'] === 8 && max($revRoom['terrain']) > 400.0, 'rev-bumps-on-a-crater' . ' :: ' . 'rev=' . $revRoom['terrainRev']);
        $legacy = self::flatRoom([self::tank(0, 'human', 100.0, 100)]);
        room_explode($legacy, $revEvents, $legacy['tanks'][0], 'shell', 200.0, 400.0, null);
        self::assertTrue($legacy['terrainRev'] === 2, 'rev-legacy-room-reads-as-1');
        $round = room_new('REV1', 'ABC');
        $round['seats'][0] = room_seat_human('ABC', 'tok', [], '');
        $round['seats'][1] = room_idle_seat(1, 'ai');
        $round['seats'][2] = room_idle_seat(2, 'open');
        $round['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($round, 0);
        $before = $round['terrainRev'];
        room_start_round($round);
        self::assertTrue($round['terrainRev'] === $before + 1, 'rev-bumps-on-a-new-round');
    }

    /** Delta rules in the snapshot itself. */
    public function testDeltaSnapshots(): void
    {
        $round = self::revisionRound();
        $snapFull = room_snapshot($round, 0, 0);
        $snapHave = room_snapshot($round, 0, 0, $round['terrainRev']);
        self::assertTrue(count($snapFull['terrain'] ?? []) === 720 && $snapFull['terrainRev'] === $round['terrainRev'], 'delta-snapshot-full-without-have');
        self::assertTrue(!array_key_exists('terrain', $snapHave) && $snapHave['terrainRev'] === $round['terrainRev'], 'delta-snapshot-omits-when-current');
        self::assertTrue(count(room_snapshot($round, 0, 0, $round['terrainRev'], true)['terrain'] ?? []) === 720, 'delta-snapshot-full-when-asked');
        self::assertTrue(count(room_snapshot($round, 0, 0, $round['terrainRev'] - 1)['terrain'] ?? []) === 720, 'delta-snapshot-full-when-behind');
        $lobbyRoom = room_new('REV2', 'ABC');
        self::assertTrue(room_snapshot($lobbyRoom, 0, 0, 1)['terrain'] === [], 'delta-snapshot-lobby-has-no-hills-to-omit');
    }

    /** Resync: events the room dropped are lost for good. */
    public function testResync(): void
    {
        $round = self::revisionRound();
        $gap = $round;
        $gap['events'] = [];
        $gap['seq'] = 0;
        for ($i = 0; $i < ROOM_EVENT_KEEP + 30; $i++) {
            room_emit($gap, ['t' => 'hit', 'seat' => 1, 'dmg' => 1, 'by' => 0, 'direct' => false]);
        }
        $oldest = $gap['events'][0]['seq'];
        self::assertTrue($oldest === 31 && $gap['seq'] === ROOM_EVENT_KEEP + 30, 'resync-fixture-dropped-events' . ' :: ' . "oldest=$oldest");
        $lost = room_snapshot($gap, 0, 5, $gap['terrainRev']);
        self::assertTrue(($lost['resync'] ?? false) === true && count($lost['terrain'] ?? []) === 720 && count($lost['events']) === ROOM_EVENT_KEEP, 'resync-since-before-the-oldest-event');
        $edge = room_snapshot($gap, 0, $oldest - 1, $gap['terrainRev']);
        self::assertTrue(!isset($edge['resync']) && !array_key_exists('terrain', $edge) && count($edge['events']) === ROOM_EVENT_KEEP, 'resync-not-when-nothing-was-missed');
        $fresh = room_snapshot($gap, 0, $gap['seq'], $gap['terrainRev']);
        self::assertTrue(!isset($fresh['resync']) && $fresh['events'] === [], 'resync-not-when-caught-up');
        self::assertTrue((room_snapshot($gap, 0, $gap['seq'] + 1, $gap['terrainRev'])['resync'] ?? false) === true, 'resync-since-ahead-of-the-room');
        self::assertTrue(!isset(room_snapshot($gap, 0, 0, null)['resync']), 'resync-not-on-the-first-sync');
    }

    /** What a request says it holds, from a body or the query string. */
    public function testRequestWant(): void
    {
        self::assertTrue(room_want(['since' => '4', 'have' => 3, 'full' => true]) === ['since' => 4, 'have' => 3, 'full' => true], 'want-from-body');
        self::assertTrue(room_want([]) === ['since' => 0, 'have' => null, 'full' => false], 'want-defaults');
        $_GET = ['since' => '9', 'have' => '12', 'full' => '1'];
        self::assertTrue(room_want([]) === ['since' => 9, 'have' => 12, 'full' => true], 'want-from-query');
        $_GET = ['full' => '0'];
        self::assertTrue(room_want([])['full'] === false, 'want-full-zero-is-no');
        $_GET = [];
    }

    /** server/*.php are libraries for rooms.php. Required without it they stop at their guard (over HTTP that is a 404) before anything after it runs. */
    public function testServerLibrariesAreGuarded(): void
    {
        foreach (['settings', 'store', 'sim', 'ai', 'rules', 'protocol'] as $lib) {
            $outLib = [];
            $codeLib = 0;
            exec(escapeshellarg(PHP_BINARY) . ' -r ' . escapeshellarg('require $argv[1]; echo "RAN";') . ' '
                . escapeshellarg(TANKITY_GAME_DIR . '/server/' . $lib . '.php') . ' 2>&1', $outLib, $codeLib);
            self::assertTrue($codeLib === 0 && $outLib === [], "server-$lib-guarded" . ' :: ' . $codeLib . ' ' . implode('|', array_slice($outLib, 0, 2)));
        }
    }

    /** ---- beams and plasma rings: no flight, resolved the moment they fire ---- */
    public function testBeamsResolveAtOnce(): void
    {
        $zap = room_weapon_row(['key' => 'zap', 'dmg' => 45, 'radius' => 6, 'effect' => 'beam', 'range' => 520]);
        self::assertTrue($zap['range'] === 520.0 && room_weapon_row(['key' => 'x'])['range'] === 0.0, 'weapon-row-reads-range' . ' :: ' . json_encode($zap['range']));
        $gunner = ['angle' => 45.0, 'power' => 100.0, 'dirS' => 1] + self::tank(0, 'human', 100.0, 100);
        [$ax, $ay] = self::along($gunner, 120.0);
        [$bx, $by] = self::along($gunner, 220.0);
        $room = self::flatRoom([$gunner, ['y' => $ay + 30] + self::tank(1, 'ai', $ax, 100), ['y' => $by + 30] + self::tank(2, 'ai', $bx, 100)]);
        $events = [];
        room_fire_beam($room, $events, 0, $zap, 'zap');
        $beam = array_values(array_filter($events, fn($e) => $e['t'] === 'beam'))[0] ?? null;
        [$mx, $my] = room_muzzle($gunner);
        self::assertTrue($beam !== null && $beam['by'] === 0 && $beam['w'] === 'zap' && $beam['x0'] === $mx && $beam['y0'] === $my
            && abs(room_dist($beam['x1'] - $mx, $beam['y1'] - $my) - 519.0) < 1e-9, 'beam-event' . ' :: ' . json_encode($beam));
        self::assertTrue(array_map(fn($e) => [$e['seat'], $e['dmg'], $e['direct']], array_values(array_filter($events, fn($e) => $e['t'] === 'hit')))
            === [[1, 45, false], [2, 45, false]] && $room['tanks'][1]['hp'] === 55 && $room['tanks'][2]['hp'] === 55 && $room['tanks'][0]['hp'] === 100, 'beam-through-two-drones-once-each' . ' :: ' . json_encode($events));
        self::assertTrue(($room['cash'][0] ?? 0) === 180 && ($room['tanks'][1]['lastHitBy'] ?? null) === 0 && !empty($room['tanks'][0]['dealt']), 'beam-pays-the-human');
        // Low power: a short beam stops short.
        $room = self::flatRoom([['power' => 20.0] + $gunner, ['y' => $by + 30] + self::tank(1, 'ai', $bx, 100)]);
        $events = [];
        room_fire_beam($room, $events, 0, $zap, 'zap');
        self::assertTrue($room['tanks'][1]['hp'] === 100 && count($events) === 1, 'beam-short-power-stops-short' . ' :: ' . json_encode($events));
        // Through a hill: the channel is carved, the ground's revision moves on, nothing else changes.
        $room = self::flatRoom([['angle' => 30.0] + $gunner]);
        for ($x = 200; $x <= 260; $x++) {
            $room['terrain'][$x] = 300.0;
        }
        $hill = $room['terrain'];
        $events = [];
        room_fire_beam($room, $events, 0, $zap, 'zap');
        $want = $hill;
        room_beam_carve($want, $events[0]['x0'], $events[0]['y0'], $events[0]['x1'], $events[0]['y1'], 6.0);
        self::assertTrue($room['terrain'] === $want && $room['terrain'] !== $hill && array_slice($room['terrain'], 0, 190) === array_slice($hill, 0, 190)
            && ($room['terrainRev'] ?? 1) === 2, 'beam-through-a-hill' . ' :: ' . json_encode(array_slice($room['terrain'], 200, 8)));
        // Into a shield: the shield is spent, nothing else.
        $d = ['angle' => 20.0, 'power' => 100.0, 'dirS' => 1] + self::tank(0, 'ai', 100.0, 100);
        [$px, $py] = self::along($d, 150.0);
        $room = self::flatRoom([$d, ['y' => $py + 10, 'dirS' => -1] + self::tank(1, 'human', $px, 100)]);
        $room['shield'][1] = true;
        $events = [];
        room_fire_beam($room, $events, 0, $zap, 'zap');
        self::assertTrue($room['shield'][1] === false && $room['tanks'][1]['hp'] === 100 && array_column($events, 't') === ['beam', 'shield'], 'beam-into-a-shield' . ' :: ' . json_encode($events));
    }

    /** Plasma: a ring around its gunner, falloff, the gunner spared, no crater. */
    public function testPlasmaRing(): void
    {
        $ring = room_weapon_row(['key' => 'ring', 'dmg' => 60, 'radius' => 90, 'effect' => 'plasma']);
        $room = self::flatRoom([['power' => 100.0] + self::tank(0, 'human', 300.0, 100), self::tank(1, 'ai', 330.0, 100), self::tank(2, 'ai', 380.0, 100), self::tank(3, 'ai', 420.0, 100)]);
        $flatGround = $room['terrain'];
        $events = [];
        room_fire_plasma($room, $events, 0, $ring, 'ring');
        self::assertTrue($room['tanks'][0]['hp'] === 100 && $room['tanks'][1]['hp'] === 100 - self::hurt(330.0) && $room['tanks'][2]['hp'] === 100 - self::hurt(380.0)
            && $room['tanks'][3]['hp'] === 100, 'plasma-spares-firer' . ' :: ' . json_encode(array_column($room['tanks'], 'hp')));
        self::assertTrue(($events[0] ?? null) === ['t' => 'ring', 'by' => 0, 'w' => 'ring', 'x' => 300.0, 'y' => 390.0, 'r' => 90.0], 'plasma-event' . ' :: ' . json_encode($events[0] ?? null));
        self::assertTrue($room['terrain'] === $flatGround && !isset($room['terrainRev']), 'plasma-no-crater');
        $room = self::flatRoom([['power' => 30.0] + self::tank(0, 'human', 300.0, 100), self::tank(1, 'ai', 345.0, 100)]);
        $events = [];
        room_fire_plasma($room, $events, 0, $ring, 'ring');
        self::assertTrue($events[0]['r'] === 27.0 && $room['tanks'][1]['hp'] === 100, 'plasma-power-30-small-ring' . ' :: ' . json_encode($events));
        $room = self::flatRoom([['power' => 10.0] + self::tank(0, 'human', 300.0, 100)]);
        $events = [];
        room_fire_plasma($room, $events, 0, $ring, 'ring');
        self::assertTrue($events[0]['r'] === 20.0, 'plasma-min-radius-20' . ' :: ' . json_encode($events));
    }

    /** A tracer's volley is its shot event and nothing else: radius 0, no burst, fizzle or hit, the ground and every unit as they were. */
    public function testTracerVolleyIsOnlyItsShot(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if ($def['effect'] !== 'tracer') {
                continue;
            }
            foreach ([[52.0, 63.0, 'lands'], [10.0, 40.0, 'strikes-a-drone'], [40.0, 100.0, 'leaves-the-field']] as [$a, $p, $how]) {
                $room = self::flatRoom([['angle' => $a, 'power' => $p] + self::tank(0, 'human', 100.0, 100), ['y' => 420.0] + self::tank(1, 'ai', 160.0, 100)]);
                $ground = $room['terrain'];
                $events = [['t' => 'fire', 'seat' => 0]];
                room_fire_shot($room, $events, 0, $k);
                $kinds = array_column($events, 't');
                $shot = array_values(array_filter($events, fn($e) => $e['t'] === 'shot'));
                self::assertTrue($kinds === ['fire', 'shot'] && $shot[0]['r'] === 0.0 && $room['terrain'] === $ground
                    && $room['tanks'][1]['hp'] === 100 && $room['tanks'][0]['hp'] === 100, "tracer-$k-$how-only-its-shot" . ' :: ' . json_encode($events));
            }
        }
    }

    /** A beam or a ring fired through room_fire_shot: its event at the volley's start, its hits after it, and no shot event (nothing flies). */
    public function testNoFlightResolvesAtOnce(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if (!in_array($def['effect'], ['beam', 'plasma'], true)) {
                continue;
            }
            $room = self::flatRoom([['angle' => 30.0, 'power' => 100.0] + self::tank(0, 'human', 300.0, 100), self::tank(1, 'ai', 340.0, 100)]);
            $events = [['t' => 'fire', 'seat' => 0]];
            room_fire_shot($room, $events, 0, $k);
            $own = array_values(array_filter($events, fn($e) => $e['t'] === ($def['effect'] === 'beam' ? 'beam' : 'ring')));
            self::assertTrue(count($own) === 1 && $own[0]['at'] === 0.0 && !in_array('shot', array_column($events, 't'), true)
                && $events[0]['at'] === 0.0, "no-flight-$k-resolves-at-once" . ' :: ' . json_encode($events));
        }
    }

    /** A human's turn ran out: the stand-in drone aims for them with the room's own gun choice, so a beam or a ring in their rack is aimed as a drone aims it and fires from their tank, never hurting it. */
    public function testStandinFiresBeamsAndRings(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if (!in_array($def['effect'], ['beam', 'plasma'], true)) {
                continue;
            }
            $beam = $def['effect'] === 'beam';
            $human = ['dirS' => 1, 'angle' => 45.0, 'power' => 50.0, 'ammo' => ['shell' => -1, $k => 2]] + self::tank(0, 'human', 120.0, 100);
            $rival = $beam ? ['y' => 330.0] + self::tank(1, 'ai', 320.0, 100) : self::tank(1, 'ai', 160.0, 100);
            $room = self::flatRoom([$human, $rival]);
            if ($beam) {
                for ($x = 300; $x <= 340; $x++) {
                    $room['terrain'][$x] = 330.0;
                }
            }
            $room += ['round' => 9, 'rng' => 4, 'difficulty' => 'hard', 'jammer' => [], 'ammo' => [0 => ['shell' => -1, $k => 2]]];
            $wkey = room_standin_shot($room, 0);
            $events = [['t' => 'auto', 'seat' => 0, 'w' => $wkey]];
            room_fire_shot($room, $events, 0, $wkey);
            self::assertTrue($wkey === $k && $room['tanks'][1]['hp'] < 100 && $room['tanks'][0]['hp'] === 100, "standin-fires-$k" . ' :: ' . json_encode([$wkey, array_column($room['tanks'], 'hp')]));
        }
    }

    /** The barrel's limits follow the loaded gun: a beam row's aimMin dips it below level, any other gun stays 10..170, and every shot leaves inside its own gun's limits. */
    public function testAimDipsWithBeams(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if ($def['effect'] !== 'beam' || $def['aimMin'] >= 10.0) {
                continue;
            }
            $dip = $def['aimMin'];
            $room = self::flatRoom([self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 400.0, 100)]);
            $room['weapon'] = [0 => $k];
            room_set_aim($room, 0, 0, $dip, 100);
            self::assertTrue($room['tanks'][0]['angle'] === $dip && $room['tanks'][0]['power'] === 100.0, "aim-dips-with-$k" . ' :: ' . json_encode($room['tanks'][0]));
            room_set_aim($room, 0, 0, 180 - $dip + 9, null);
            self::assertTrue($room['tanks'][0]['angle'] === 180.0 - $dip, "aim-dips-the-far-side-with-$k");
            room_set_aim($room, 0, 0, $dip, null);
            $room['weapon'][0] = 'shell';
            room_set_aim($room, 0, 0, null, null);
            self::assertTrue($room['tanks'][0]['angle'] === 10.0, "switching-$k-to-shell-reclamps" . ' :: ' . json_encode($room['tanks'][0]['angle']));
            room_set_aim($room, 0, 0, -20, null);
            self::assertTrue($room['tanks'][0]['angle'] === 10.0, 'shell-aim-stays-at-10');
            // A room fire at the dip with the beam: level ground, a hull 300 px off takes it.
            $room = self::flatRoom([['angle' => 0.0, 'power' => 100.0] + self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 400.0, 100)]);
            $room['weapon'] = [0 => $k];
            $events = [['t' => 'fire', 'seat' => 0, 'w' => $k]];
            room_fire_shot($room, $events, 0, $k);
            self::assertTrue($room['tanks'][1]['hp'] === 100 - (int) $def['dmg'], "$k-level-hits-a-hull-far-off" . ' :: ' . json_encode(array_column($room['tanks'], 'hp')));
            $room = self::flatRoom([['angle' => $dip, 'power' => 100.0] + self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 400.0, 100)]);
            $events = [['t' => 'fire', 'seat' => 0, 'w' => $k]];
            room_fire_shot($room, $events, 0, $k);
            $beamEv = array_values(array_filter($events, fn($e) => $e['t'] === 'beam'))[0];
            self::assertTrue($room['tanks'][0]['angle'] === $dip && $beamEv['y1'] > $beamEv['y0'] && $room['tanks'][0]['hp'] === 100, "$k-fires-at-the-dip" . ' :: ' . json_encode($beamEv));
            // A Shell held at the dip leaves at its own minimum.
            $room = self::flatRoom([['angle' => $dip, 'power' => 40.0] + self::tank(0, 'human', 100.0, 100), self::tank(1, 'human', 400.0, 100)]);
            $events = [['t' => 'fire', 'seat' => 0, 'w' => 'shell']];
            room_fire_shot($room, $events, 0, 'shell');
            self::assertTrue($room['tanks'][0]['angle'] === 10.0, 'shell-at-the-dip-fires-at-10' . ' :: ' . json_encode($room['tanks'][0]['angle']));
        }
    }

    /** Napalm in a room: a V valley (rim 330, floor 420 at x 360) with two drones in it and a human up on the flat rim. */
    public function testNapalmInTheValley(): void
    {
        $weapons = room_weapons();
        $vale = [];
        for ($ix = 0; $ix < 720; $ix++) {
            $vale[] = 330.0 + 90.0 * max(0.0, 1.0 - abs($ix - 360) / 150.0);
        }
        foreach ($weapons as $k => $def) {
            if ($def['effect'] !== 'napalm') {
                continue;
            }
            $valeRoom = function () use ($vale, $k): array {
                $room = self::flatRoom([['dirS' => 1, 'angle' => 45.0, 'ammo' => ['shell' => -1, $k => 2]] + self::tank(0, 'human', 110.0, 100),
                    self::tank(1, 'ai', 340.0, 100), self::tank(2, 'ai', 385.0, 100)]);
                $room['terrain'] = $vale;
                foreach ($room['tanks'] as $i => $t) {
                    $room['tanks'][$i]['y'] = $vale[(int) $t['x']];
                }
                return $room + ['round' => 9, 'rng' => 4, 'difficulty' => 'hard', 'jammer' => [], 'ammo' => [0 => ['shell' => -1, $k => 2]]];
            };
            // A human's turn ran out: the stand-in fires their napalm into the valley, burning both drones and never the human.
            $room = $valeRoom();
            $wkey = room_standin_shot($room, 0);
            $events = [['t' => 'auto', 'seat' => 0, 'w' => $wkey]];
            room_fire_shot($room, $events, 0, $wkey);
            self::assertTrue($wkey === $k && $room['tanks'][1]['hp'] < 100 && $room['tanks'][2]['hp'] < 100 && $room['tanks'][0]['hp'] === 100, "standin-fires-$k" . ' :: ' . json_encode([$wkey, array_column($room['tanks'], 'hp')]));
            // The burn is all inside its volley: a burn event, then each tick's hits stamped at landing + k x tick, and the pace (when the
            // next drone may fire) covers its last tick. Nothing burns on in the room, so a later poll has nothing to do for it.
            $burn = array_values(array_filter($events, fn($e) => $e['t'] === 'burn'))[0] ?? null;
            $n = room_burn_ticks($def['burn'], $def['tick']);
            $hitAts = array_values(array_unique(array_map(fn($e) => $e['at'], array_filter($events, fn($e) => $e['t'] === 'hit'))));
            $want = [];
            for ($i = 1; $i <= $n; $i++) {
                $want[] = round($burn['at'] + $i * room_tick_steps($def['tick']) / 60, 3);
            }
            self::assertTrue($burn !== null && $burn['t1'] === round($burn['at'] + $n * room_tick_steps($def['tick']) / 60, 3)
                && $hitAts === $want && $room['pace']['wait'] >= $burn['t1'] + ROOM_AIM_MAX, "$k-burns-inside-its-volley" . ' :: ' . json_encode([$burn, $hitAts, $want, $room['pace']]));
            // The same volley with a Shell: the room keys a napalm volley leaves are among those any volley leaves.
            $shellRoom = $valeRoom();
            $shellEvents = [['t' => 'fire', 'seat' => 0, 'w' => 'shell']];
            room_fire_shot($shellRoom, $shellEvents, 0, 'shell');
            $tankKeys = array_merge(...array_map('array_keys', $room['tanks']));
            self::assertTrue(array_diff(array_keys($room), array_keys($shellRoom)) === [] && preg_grep('/fire|burn|pool/i', $tankKeys) === [], "$k-leaves-no-fire-in-the-room" . ' :: ' . json_encode([array_keys($room), array_keys($shellRoom), $tankKeys]));
            self::assertTrue($room['terrain'] === $vale && !isset($room['terrainRev']), "$k-never-changes-the-ground");
        }
    }

    /** Napalm on flat ground: a puddle about volume / poolMin wide, poolMin deep, centred where it lands, burning the tank standing in it; by a field edge the puddle stays and its overflow spills off. */
    public function testNapalmOnFlatGround(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if ($def['effect'] !== 'napalm') {
                continue;
            }
            $pool = room_fire_pool(array_fill(0, 720, 400.0), 300.0, $def['volume'], $def['flame'], $def['poolMin']);
            $width = $pool['x1'] - $pool['x0'] + 1;
            self::assertTrue(abs($width - $def['volume'] / $def['poolMin']) <= 2 && abs(($pool['x0'] + $pool['x1']) / 2 - 300) <= 1
                && $pool['level'] === 400.0 - $def['poolMin'], "$k-puddle-on-flat" . ' :: ' . json_encode($pool));
            $edge = room_fire_pool(array_fill(0, 720, 400.0), 5.0, $def['volume'], $def['flame'], $def['poolMin']);
            self::assertTrue($edge['x0'] === 0 && $edge['x1'] > 5 && $edge['x1'] - $edge['x0'] + 1 < $def['volume'] / $def['poolMin'], "$k-puddle-at-the-edge-spills-its-overflow" . ' :: ' . json_encode($edge));
            // A drone's napalm comes down on a human on flat ground: every tick burns it.
            $room = self::flatRoom([self::tank(0, 'human', 400.0, 100), ['dirS' => -1] + self::tank(1, 'ai', 600.0, 200)]);
            $room += ['round' => 9, 'rng' => 4];
            $events = [];
            room_fire_burn($room, $events, 1, $def, $k, ['hit', 400.0, 400.0, 0.0, 80.0, null], 1.0);
            $n = room_burn_ticks($def['burn'], $def['tick']);
            self::assertTrue($room['tanks'][0]['hp'] === 100 - $n * (int) $def['dmg'] && $room['terrain'] === array_fill(0, 720, 400.0), "$k-on-flat-burns-the-tank-in-its-puddle" . ' :: ' . json_encode([$room['tanks'][0]['hp'], array_filter($events, fn($e) => $e['t'] === 'burn')]));
        }
    }

    /** The flames never reach a tank buried under the dirt the pool lies on. */
    public function testNapalmNeverBurnsABuriedTank(): void
    {
        $weapons = room_weapons();
        foreach ($weapons as $k => $def) {
            if ($def['effect'] !== 'napalm') {
                continue;
            }
            $room = self::flatRoom([self::tank(0, 'human', 400.0, 100), self::tank(1, 'human', 445.0, 100), ['dirS' => 1] + self::tank(2, 'ai', 100.0, 200)]);
            for ($x = 380; $x <= 420; $x++) {
                $room['terrain'][$x] = 370.0;
            }
            $room += ['round' => 9, 'rng' => 4];
            $events = [];
            room_fire_burn($room, $events, 2, $def, $k, ['hit', 400.0, 370.0, 0.0, 80.0, null], 1.0);
            self::assertTrue($room['tanks'][0]['hp'] === 100 && $room['tanks'][1]['hp'] < 100, "$k-never-burns-a-buried-tank" . ' :: ' . json_encode(array_column($room['tanks'], 'hp')));
        }
    }

    /** Protocol fixtures (protocol/*.json): what room_snapshot builds today must have the keys and types the fixtures record, which the client's smoke test is run against. The values are not compared (generate.php --check does that in the room container); a changed shape fails here, on any PHP. */
    public function testProtocolFixtures(): void
    {
        foreach (protocol_snapshots() as $name => [$about, $status, $body]) {
            $file = TANKITY_GAME_DIR . "/protocol/$name.json";
            $fixture = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
            self::assertTrue(is_array($fixture) && ($fixture['status'] ?? null) === $status, "protocol-$name-present");
            $want = json_encode(protocol_shape($fixture['body'] ?? null));
            $have = json_encode(protocol_shape(protocol_wire($body)));
            self::assertTrue($want === $have, "protocol-$name-shape" . ' :: ' . ($want === $have ? '' : 'run make protocol and read the diff; then teach the client the new shape'));
        }
        foreach (['error-too-fast' => 429, 'error-not-your-turn' => 409, 'create-reply' => 200, 'join-reply' => 200] as $name => $status) {
            $fixture = json_decode((string) @file_get_contents(TANKITY_GAME_DIR . "/protocol/$name.json"), true);
            self::assertTrue(is_array($fixture) && ($fixture['status'] ?? null) === $status
                && (isset($fixture['body']['error']) || isset($fixture['body']['token'])), "protocol-$name");
        }
        $fire = json_decode((string) @file_get_contents(TANKITY_GAME_DIR . '/protocol/play-after-fire.json'), true);
        $types = array_column($fire['body']['room']['events'] ?? [], 't');
        self::assertTrue(in_array('fire', $types, true) && in_array('shot', $types, true) && in_array('hit', $types, true), 'protocol-fire-has-shot-and-hit' . ' :: ' . implode(',', $types));
    }
}
