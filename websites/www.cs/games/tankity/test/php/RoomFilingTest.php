<?php
// games/tankity/test/php/RoomFilingTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The server files every room score itself, on the board of the room's
   difficulty: an eliminated human when the last life goes, the winner with the
   bonus when the match ends, each once. */
final class RoomFilingTest extends TestCase
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
        tankity_test_rm($this->dir);
    }

    private function duel(): array
    {
        $room = room_new('FILE', 'WIN');
        $room['seats'][0] = room_seat_human('WIN', 't0', []);
        $room['seats'][1] = room_seat_human('OUT', 't1', []);
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'open');
        foreach ([0, 1] as $s) {
            room_seat_economy($room, $s);
            $room['seats'][$s]['lives'] = 1;
        }
        room_match_begin($room);
        room_start_round($room);
        $room['scores'][1] = 700;
        foreach ($room['tanks'] as &$t) {
            if ($t['seat'] === 1) {
                $t['hp'] = 0;
            }
        }
        unset($t);
        return $room;
    }

    public function testTheEliminatedAndTheWinnerAreFiled(): void
    {
        $room = $this->duel();
        $events = [];
        room_end_round($room, $events);
        $top = board_top('normal', 10);
        $this->assertSame(['WIN', 'OUT'], array_column($top, 'initials'));
        $this->assertSame($room['scores'][0], $top[0]['score']);
        $this->assertSame('room:FILE', $top[0]['seed']);
        $this->assertSame(1, $room['filed'][0]);
        $this->assertSame(2, $room['filed'][1]);
        $snap = room_snapshot($room, 1, 0);
        $this->assertTrue($snap['you']['filed']);
        $this->assertSame(2, $snap['you']['filedRank']);
    }

    public function testASeatIsFiledOnce(): void
    {
        $room = $this->duel();
        $events = [];
        room_end_round($room, $events);
        room_file_seat($room, 0);
        $this->assertCount(2, board_top('normal', 10));
    }

    public function testAHardRoomFilesOnTheHardBoard(): void
    {
        $room = $this->duel();
        $room['difficulty'] = 'hard';
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(['WIN', 'OUT'], array_column(board_top('hard', 10), 'initials'));
        $this->assertSame([], board_top('normal', 10));
    }

    public function testInitialsAreFiledUppercase(): void
    {
        $room = $this->duel();
        $room['seats'][1]['initials'] = 'out';
        $events = [];
        room_end_round($room, $events);
        $this->assertContains('OUT', array_column(board_top('normal', 10), 'initials'));
    }
}
