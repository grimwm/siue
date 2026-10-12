<?php
// games/tankity/test/php/FieldWidthTest.php
// The server's sim at any field width (spec 7.4): the width rule, the hills
// and their wire form, reach and aim exactly 1 on a room's field, units
// spread over the width outside each other's blast, and a room still dealt at 720.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class FieldWidthTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        if (!defined('TANKITY_ROOMS_LIB')) {
            define('TANKITY_ROOMS_LIB', true);
        }
        require_once dirname(__DIR__, 2) . '/rooms.php';
    }

    public function testOnlyWholeColumnsInRangeAreAWidth(): void
    {
        foreach ([720, 744, 1200, 1440] as $w) {
            $this->assertSame($w, room_field_width($w));
        }
        foreach ([696, 1464, 1201, 1200.0, '1200', null, true] as $w) {
            $this->assertNull(room_field_width($w), var_export($w, true));
        }
    }

    public function testTheHillsAreTheTerrainsNineDraws(): void
    {
        $a = room_hash_seed('scorch-01');
        $b = $a;
        $h = room_gen_hills($a);
        $this->assertSame(room_gen_terrain($b, 1440), room_hills_terrain($h, 1440));
        $this->assertSame(room_rng_next($a), room_rng_next($b), 'both drew exactly nine');
        $this->assertCount(9, room_hills_wire($h));
        $this->assertSame(array_slice(room_hills_terrain($h, 1440), 0, 720), room_hills_terrain($h, 720));
    }

    public function testReachAndAimAreExactlyOneOnARoomsField(): void
    {
        $this->assertSame(1.0, room_field_reach(ROOM_W));
        $this->assertSame(room_shot_speed(55.0, false), room_shot_speed(55.0, false, 1.0, room_field_reach(ROOM_W)));
        $this->assertSame(['aim' => 1.0, 'floor' => 1.0], room_field_aim(ROOM_W));
        $this->assertSame(sqrt(2.0), room_field_reach(1440));
        $mid = room_field_aim(900);
        $this->assertEqualsWithDelta(0.85, $mid['aim'], 1e-12);
        $this->assertEqualsWithDelta(0.75, $mid['floor'], 1e-12);
    }

    public function testUnitsSpreadOverTheWholeFieldAndNeverStartInABlast(): void
    {
        $biggest = max(array_map(fn($w) => (float) $w['radius'], room_weapons()));
        $this->assertGreaterThanOrEqual($biggest + 20, ROOM_SPAWN_GAP);
        for ($seed = 1; $seed <= 200; $seed++) {
            $r = $seed;
            $xs = room_spawn_spots($r, 4, 1440);
            sort($xs);
            $this->assertGreaterThanOrEqual(30, $xs[0]);
            $this->assertLessThanOrEqual(1410, $xs[3]);
            for ($i = 1; $i < 4; $i++) {
                $this->assertGreaterThanOrEqual(ROOM_SPAWN_GAP, $xs[$i] - $xs[$i - 1]);
            }
        }
    }

    public function testARoomRoundIsDealtAt720WithItsHills(): void
    {
        $room = room_new('ABCD', 'AAA');
        room_start_round($room);
        $this->assertCount(ROOM_W, $room['terrain']);
        $this->assertSame(room_hills_terrain($room['hills'], ROOM_W), $room['terrain']);
        $snap = room_snapshot($room, 0, 0, null, true);
        $this->assertSame(room_hills_wire($room['hills']), $snap['hills']);
    }
}
