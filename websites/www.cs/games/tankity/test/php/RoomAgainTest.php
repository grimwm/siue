<?php
// games/tankity/test/php/RoomAgainTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Play again keeps the code and the seats and resets lives, scores and cash:
   the room goes back to its lobby for the host to start. */
final class RoomAgainTest extends TestCase
{
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

    private string $dir;

    private function over(): array
    {
        $room = room_new('AGIN', 'HOS');
        $room['seats'][0] = room_seat_human('HOS', 't0', []);
        $room['seats'][1] = room_seat_human('GST', 't1', []);
        $room['seats'][2] = ['human' => false, 'name' => 'LFT', 'initials' => 'LFT', 'mode' => 'ai', 'bot' => true, 'lives' => 2];
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        $room['scores'][0] = 4200;
        $room['cash'][0] = 50;
        $room['seats'][0]['lives'] = 1;
        $room['seats'][1]['lives'] = 0;
        $room['plate'][0] = 2;
        $room['phase'] = 'over';
        $room['winner'] = 0;
        $room['difficulty'] = 'hard';
        return $room;
    }

    public function testNoTwoIdleSeatsShareADroneName(): void
    {
        $names = array_map(fn(int $i): string => room_idle_seat($i)['name'], [0, 1, 2, 3]);
        $this->assertCount(4, array_unique($names), implode(',', $names));
    }

    public function testBackToTheLobbyWithSeatsKept(): void
    {
        $room = $this->over();
        $this->assertTrue(room_again($room));
        $this->assertSame('lobby', $room['phase']);
        $this->assertSame('AGIN', $room['code']);
        $this->assertSame('hard', room_difficulty($room), 'the host chose the drones\' aim for the room, not the match');
        $this->assertSame('HOS', $room['seats'][0]['initials']);
        $this->assertSame('t1', $room['seats'][1]['token']);
        $this->assertSame([3, 3], [$room['seats'][0]['lives'], $room['seats'][1]['lives']]);
        $this->assertSame([0, 0], [$room['scores'][0], $room['scores'][1]]);
        $this->assertSame([600, 600], [$room['cash'][0], $room['cash'][1]]);
        $this->assertSame(0, $room['plate'][0]);
        $this->assertSame(100, $room['armor'][0]);
        $this->assertSame(0, $room['round']);
        $this->assertSame([], $room['tanks']);
        $this->assertNull($room['winner']);
        $this->assertSame(0, room_snapshot($room, 0, 0)['winBonus']);
    }

    public function testALeaversSeatGoesBackToTheBattery(): void
    {
        $room = $this->over();
        room_again($room);
        $this->assertFalse($room['seats'][2]['human']);
        $this->assertArrayNotHasKey('bot', $room['seats'][2]);
        $this->assertSame('ai', $room['seats'][2]['mode']);
    }

    public function testASecondPressIsHarmlessAndAMatchInPlayRefuses(): void
    {
        $room = $this->over();
        room_again($room);
        $this->assertTrue(room_again($room));
        $playing = $this->over();
        $playing['phase'] = 'play';
        $this->assertFalse(room_again($playing));
    }

    /* The host is seat 0 until it leaves; then the lowest-numbered human holds it. */
    public function testWhenTheHostLeftTheLowestHumanHostsThePlayAgainLobby(): void
    {
        $room = $this->over();
        $room['seats'][0] = ['human' => false, 'name' => 'HOS', 'initials' => 'HOS', 'mode' => 'ai', 'bot' => true, 'lives' => 0];
        $this->assertTrue(room_again($room));
        $this->assertSame(1, room_host($room));
        $this->assertSame(1, room_snapshot($room, 1, 0)['hostSeat']);
    }

    public function testTheHostLeavingMidMatchHandsTheRoomOn(): void
    {
        $room = $this->over();
        $room['phase'] = 'play';
        $this->assertSame(0, room_snapshot($room, 1, 0)['hostSeat']);
        $this->assertTrue(room_leave($room, 0));
        $this->assertSame(1, room_host($room));
        $this->assertSame(1, room_snapshot($room, 1, 0)['hostSeat']);
    }

    public function testNoHumanLeftMeansNoPlayAgain(): void
    {
        $room = $this->over();
        $room['seats'][0] = ['human' => false, 'name' => 'X', 'initials' => 'X', 'mode' => 'ai', 'lives' => 0];
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $this->assertFalse(room_again($room));
        $this->assertSame('over', $room['phase']);
    }

    /* The host's start runs room_match_begin, which clears what was filed, so the
       next match files its humans again. */
    public function testTheNextMatchFilesItsHumansAgain(): void
    {
        $room = room_new('AGN2', 'WIN');
        $room['seats'][0] = room_seat_human('WIN', 't0', []);
        $room['seats'][1] = room_idle_seat(1, 'ai');
        $room['seats'][2] = room_idle_seat(2, 'open');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        for ($match = 1; $match <= 2; $match++) {
            $room['seats'][0]['lives'] = 1;
            room_match_begin($room);
            room_start_round($room);
            foreach ($room['tanks'] as &$t) {
                if ($t['seat'] === 0) {
                    $t['hp'] = 0;
                }
            }
            unset($t);
            $events = [];
            room_end_round($room, $events);
            $this->assertCount($match, board_top('normal', 10), "match $match filed its human");
            $room['phase'] = 'over';
            $this->assertTrue(room_again($room));
        }
    }
}
