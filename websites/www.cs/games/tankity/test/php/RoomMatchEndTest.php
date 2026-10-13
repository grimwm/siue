<?php
// games/tankity/test/php/RoomMatchEndTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* A room that started with two or more humans ends when one human has lives
   left: that human wins, with twice the round bonus. One human plays like solo. */
final class RoomMatchEndTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** $humans humans on $lives lives each, the rest drones, the match begun. */
    private function room(int $humans, int $lives = 1): array
    {
        $room = room_new('ENDS', 'H00');
        for ($i = 0; $i < 4; $i++) {
            $room['seats'][$i] = $i < $humans
                ? room_seat_human('H0' . $i, 't' . $i, [])
                : room_idle_seat($i, 'ai');
            if ($i < $humans) {
                $room['seats'][$i]['lives'] = $lives;
                room_seat_economy($room, $i);
            }
        }
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    private function wreck(array &$room, callable $which): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($which($t)) {
                $t['hp'] = 0;
            }
        }
        unset($t);
    }

    private function types(array $events): array
    {
        return array_column($events, 't');
    }

    public function testOneHumanPlaysLikeSolo(): void
    {
        $room = $this->room(1, 2);
        $this->wreck($room, fn($t) => $t['kind'] === 'human');
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
        $this->assertSame(['over' => false, 'winner' => null], room_match_outcome($room));
    }

    public function testLastHumanStandingWinsWithTwiceTheRoundBonus(): void
    {
        $room = $this->room(2, 1);
        $this->wreck($room, fn($t) => $t['seat'] === 1);
        $score0 = $room['scores'][0] ?? 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertSame(0, $room['winner']);
        $this->assertContains('matchwin', $this->types($events));
        $win = array_values(array_filter($events, fn($e) => $e['t'] === 'matchwin'))[0];
        $this->assertSame(room_winner_bonus(1), $win['bonus']);
        $this->assertSame(2 * (750 + 150), room_winner_bonus(1));
        $this->assertSame($score0 + $win['bonus'], $room['scores'][0]);
        $this->assertSame('matchover', end($events)['t']);
    }

    public function testLeavingIsAForfeit(): void
    {
        $room = $this->room(2, 3);
        $this->assertTrue(room_leave($room, 1));
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertSame(0, $room['winner']);
        $win = array_values(array_filter($events, fn($e) => $e['t'] === 'matchwin'))[0];
        $this->assertSame(room_winner_bonus(1), $win['bonus']);
    }

    public function testTwoOutAtOnceLeaveOneWinner(): void
    {
        $room = $this->room(3, 1);
        $this->wreck($room, fn($t) => $t['seat'] === 1 || $t['seat'] === 2);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertSame(0, $room['winner']);
    }

    public function testLastTwoFallTogetherNobodyWins(): void
    {
        $room = $this->room(2, 1);
        $this->wreck($room, fn($t) => $t['kind'] === 'human');
        $score0 = $room['scores'][0] ?? 0;
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('over', $room['phase']);
        $this->assertNull($room['winner']);
        $this->assertNotContains('matchwin', $this->types($events));
        $this->assertSame($score0, $room['scores'][0] ?? 0);
    }

    public function testTwoHumansWithLivesLeftPlayOn(): void
    {
        $room = $this->room(2, 3);
        $this->wreck($room, fn($t) => $t['seat'] === 1);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
    }

    public function testTheWatchCapStays(): void
    {
        $this->assertSame(40, ROOM_WATCH_TURNS);
    }
}
