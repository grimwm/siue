<?php
// games/tankity/test/php/RoomMineTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* action=mine: a browser's seats, one row each, with due timeouts applied. */
final class RoomMineTest extends TestCase
{
    private string $dir;

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    protected function setUp(): void
    {
        $this->dir = tankity_test_dir();
    }

    protected function tearDown(): void
    {
        room_release_all();
        tankity_test_rm($this->dir);
    }

    private function store(array $room): void
    {
        $lock = room_alloc(fn() => $room['code']);
        $this->assertTrue(room_save($lock, $lock->code, $room));
        room_unlock($lock);
    }

    private function stored(string $code): array
    {
        $room = room_peek($code);
        $this->assertIsArray($room);
        return $room;
    }

    /* Two humans (ABC seat 0, ZED seat 1) and a drone; seat 0's turn is up. */
    private function playing(string $code = 'MINE'): array
    {
        $room = room_new($code, 'ABC');
        $room['seats'][0] = room_seat_human('ABC', 't0', [], '');
        $room['seats'][1] = room_seat_human('ZED', 't1', [], '');
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        $events = [];
        room_advance($room, $events);
        $this->assertSame(0, $room['tanks'][$room['turn']]['seat']);
        return $room;
    }

    public function testAGoneRoomIsGone(): void
    {
        $this->store($this->playing());
        $expired = $this->playing('OLDR');
        $this->store($expired);
        room_test_age('OLDR', 100000);
        $rows = room_mine([
            ['code' => 'ZZZZ', 'token' => 'x'],
            ['code' => 'MINE', 'token' => 'wrong'],
            ['code' => 'OLDR', 'token' => 't0'],
        ]);
        $this->assertSame([
            ['code' => 'ZZZZ', 'gone' => true],
            ['code' => 'MINE', 'gone' => true],
            ['code' => 'OLDR', 'gone' => true],
        ], $rows);
    }

    public function testYourTurnCarriesItsKey(): void
    {
        $room = $this->playing();
        $this->store($room);
        [$mine, $other] = room_mine([['code' => 'MINE', 'token' => 't0'], ['code' => 'mine', 'token' => 't1']]);
        $stored = $this->stored('MINE');
        $this->assertFalse($mine['gone']);
        $this->assertSame(0, $mine['seat']);
        $this->assertSame('play', $mine['phase']);
        $this->assertTrue($mine['yourTurn']);
        $this->assertSame(room_turn_key($stored), $mine['turnKey']);
        $this->assertGreaterThan(0, $mine['turnLeft']);
        $this->assertNull($mine['shopLeft']);
        $this->assertSame(120, $mine['turnSecs']);
        $this->assertSame(['ABC', 'ZED'], $mine['players']);
        $this->assertSame(0, $mine['hostSeat']);
        $this->assertSame(1, $other['seat']);
        $this->assertFalse($other['yourTurn']);
        $this->assertNull($other['turnKey']);
        $this->assertSame(0, $other['turn']);
        // Both rows name whose turn it is, so the list can say "ABC's turn".
        $this->assertSame('ABC', $mine['turnName']);
        $this->assertSame('ABC', $other['turnName']);
    }

    public function testTurnNameIsTheDronesOnADroneTurnAndNullOutsidePlay(): void
    {
        $room = $this->playing();
        $drone = null;
        foreach ($room['tanks'] as $i => $t) {
            if ($t['kind'] !== 'human') {
                $drone = $i;
            }
        }
        $room['turn'] = $drone;
        $seat = $room['tanks'][$drone]['seat'];
        $this->assertSame($room['seats'][$seat]['name'], room_mine_row($room, 0)['turnName']);
        $room['phase'] = 'shop';
        $this->assertNull(room_mine_row($room, 0)['turnName']);
    }

    public function testMineAppliesADueTimeout(): void
    {
        $room = $this->playing();
        room_turn_left($room);
        $room['clock']['at'] -= 500;
        $shots = $room['shots'] ?? 0;
        $this->store($room);
        [$row] = room_mine([['code' => 'MINE', 'token' => 't0']]);
        $after = $this->stored('MINE');
        $this->assertGreaterThan($shots, $after['shots']);
        $this->assertContains('auto', array_column($after['events'], 't'));
        $this->assertSame(1, $after['tanks'][$after['turn']]['seat'], 'the stand-in shot passed the turn to ZED');
        $this->assertSame($after['tanks'][$after['turn']]['seat'], $row['turn']);
        $this->assertFalse($row['yourTurn']);
        $this->assertNull($row['turnKey']);
        [$zed] = room_mine([['code' => 'MINE', 'token' => 't1']]);
        $this->assertTrue($zed['yourTurn']);
        $this->assertSame(room_turn_key($this->stored('MINE')), $zed['turnKey']);
    }

    public function testMineLeavesALobbyAlone(): void
    {
        $lobby = room_new('LOBY', 'ABC');
        $lobby['seats'][0] = room_seat_human('ABC', 't0', [], '');
        $this->store($lobby);
        tankity_db()->exec("UPDATE rooms SET touched = touched - 300 WHERE code = 'LOBY'");
        $before = (int) tankity_db()->query("SELECT touched FROM rooms WHERE code = 'LOBY'")->fetchColumn();
        [$row] = room_mine([['code' => 'LOBY', 'token' => 't0']]);
        $this->assertSame('lobby', $row['phase']);
        $this->assertFalse($row['yourTurn']);
        $this->assertSame($before, (int) tankity_db()->query("SELECT touched FROM rooms WHERE code = 'LOBY'")->fetchColumn());
    }

    public function testMineDoesNotStampActedAt(): void
    {
        $room = $this->playing();
        room_turn_left($room);
        $room['clock']['at'] -= 500;
        $acted = time() - 50;
        $room['actedAt'] = $acted;
        $this->store($room);
        room_mine([['code' => 'MINE', 'token' => 't0']]);
        $this->assertSame($acted, $this->stored('MINE')['actedAt']);
    }

    public function testTooManySeatsIsRefusedAndOddEntriesAreGone(): void
    {
        $this->assertNull(room_mine(array_fill(0, 13, ['code' => 'ZZZZ', 'token' => 'x'])));
        $this->assertNull(room_mine('nope'));
        $this->assertNull(room_mine(['a' => ['code' => 'ZZZZ', 'token' => 'x']]));
        $this->assertSame(12, ROOM_MINE_MAX);
        $rows = room_mine([['code' => 'ZZZZ'], 'junk', ['token' => 't']]);
        $this->assertSame([true, true, true], array_column($rows, 'gone'));
        $this->assertSame([], room_mine([]));
    }

    public function testATickThatCannotBeSavedIsNotReported(): void
    {
        $room = $this->playing();
        room_turn_left($room);
        $room['clock']['at'] -= 500;
        $this->store($room);
        // Past the size limit the save refuses, however the room changes.
        $before = $this->stored('MINE');
        $before['pad'] = str_repeat('x', ROOM_MAX_BYTES);
        tankity_db()->prepare("UPDATE rooms SET data = ? WHERE code = 'MINE'")->execute([serialize($before)]);
        [$row] = room_mine([['code' => 'MINE', 'token' => 't0']]);
        $this->assertSame(room_turn_key($before), $row['turnKey'], 'the row is the room as stored, not an unsaved tick');
    }

    public function testTheSameSeatAskedTwiceGetsTwoEqualRows(): void
    {
        $this->store($this->playing());
        $rows = room_mine([['code' => 'MINE', 'token' => 't0'], ['code' => 'mine', 'token' => 't0']]);
        $this->assertCount(2, $rows);
        $this->assertSame($rows[0], $rows[1]);
    }
}
