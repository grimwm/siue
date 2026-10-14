<?php
// games/tankity/test/php/RoomSnapshotLeakTest.php
// What a room snapshot never carries: the room's seed or generator state, a
// seat's token, or any server-side bookkeeping. The hills it does carry are the
// round's nine numbers and nothing that names the seed.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class RoomSnapshotLeakTest extends TestCase
{
    private const TOKEN = 'seat-token-0123456789abcdef';

    public static function setUpBeforeClass(): void
    {
        if (!defined('TANKITY_ROOMS_LIB')) {
            define('TANKITY_ROOMS_LIB', true);
        }
        require_once dirname(__DIR__, 2) . '/rooms.php';
    }

    private function room(?string $map): array
    {
        $room = room_new('TEST', 'hos');
        $room['map'] = $map;
        $room['seats'][0] = room_seat_human('HOS', self::TOKEN, [], '');
        $room['seats'][1] = room_idle_seat(1);
        room_seat_economy($room, 0);
        room_start_round($room);
        return $room;
    }

    /** Every key at any depth. */
    private function keys(mixed $v): array
    {
        $out = [];
        if (is_array($v)) {
            foreach ($v as $k => $x) {
                if (is_string($k)) {
                    $out[] = $k;
                }
                array_push($out, ...$this->keys($x));
            }
        }
        return $out;
    }

    public function testNoSeedTokenOrServerFieldReachesAClient(): void
    {
        foreach ([null, 'riverbed'] as $map) {
            $room = $this->room($map);
            foreach ([null, 0] as $seat) {
                $snap = room_snapshot($room, $seat, 0, null, true);
                $json = json_encode($snap);
                $at = ($map ?? 'random') . ($seat === null ? ' spectator' : ' seat 0');
                foreach (['seed', 'rng', 'token', 'secret', 'host', 'ip', 'path', 'created', 'touched', 'runs', 'lastAct'] as $bad) {
                    $this->assertNotContains($bad, $this->keys($snap), "$at: key $bad");
                }
                $this->assertStringNotContainsString(self::TOKEN, $json, "$at: a seat token");
                $this->assertStringNotContainsString('tankity-room-', $json, "$at: the room's seed string");
                $this->assertStringNotContainsString('tankity-riverbed', $json, "$at: a map's seed string");
                $this->assertStringNotContainsString((string) $room['rng'], $json, "$at: the generator state");
                foreach (['/var/', '/dev/shm', '.sqlite', '.db'] as $frag) {
                    $this->assertStringNotContainsString($frag, $json, "$at: a server path ($frag)");
                }
            }
        }
    }

    public function testOnlyASeatedPlayerGetsTheRoomsCsrf(): void
    {
        $room = $this->room(null);
        $this->assertArrayNotHasKey('csrf', room_snapshot($room, null, 0, null, true));
        $this->assertSame($room['csrf'], room_snapshot($room, 0, 0, null, true)['csrf']);
    }

    public function testTheHillsAreNineNumbersAndNothingElse(): void
    {
        $snap = room_snapshot($this->room(null), null, 0, null, true);
        $this->assertCount(9, $snap['hills']);
        foreach ($snap['hills'] as $n) {
            $this->assertTrue(is_float($n) || is_int($n));
        }
    }
}
