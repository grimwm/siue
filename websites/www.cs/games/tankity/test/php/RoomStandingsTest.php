<?php
// games/tankity/test/php/RoomStandingsTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* Each human's match so far: rounds won, kills, this round's gain, the round
   they went out in, all in the snapshot the scoreboards draw. */
final class RoomStandingsTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    private function room(): array
    {
        $room = room_new('STAT', 'AAA');
        $room['seats'][0] = room_seat_human('AAA', 't0', []);
        $room['seats'][1] = room_seat_human('BBB', 't1', []);
        $room['seats'][2] = room_idle_seat(2, 'ai');
        $room['seats'][3] = room_idle_seat(3, 'open');
        room_seat_economy($room, 0);
        room_seat_economy($room, 1);
        room_match_begin($room);
        room_start_round($room);
        return $room;
    }

    private function idx(array $room, int $seat): int
    {
        foreach ($room['tanks'] as $i => $t) {
            if ($t['seat'] === $seat) {
                return $i;
            }
        }
        $this->fail("no tank for seat $seat");
    }

    public function testAKillByAHumanCounts(): void
    {
        $room = $this->room();
        $drone = $this->idx($room, 2);
        $room['tanks'][$drone]['hp'] = 1;
        $t = $room['tanks'][$drone];
        $events = [];
        room_explode($room, $events, $room['tanks'][$this->idx($room, 0)], 'shell', (float) $t['x'], (float) $t['y'] - 30.0, $drone, null);
        $this->assertSame(1, $room['stats'][0]['kills']);
        $this->assertSame(0, $room['stats'][1]['kills']);
    }

    public function testAHumanOnHumanKillCountsAndASelfWreckDoesNot(): void
    {
        $room = $this->room();
        $other = $this->idx($room, 1);
        $room['tanks'][$other]['hp'] = 1;
        $t = $room['tanks'][$other];
        $events = [];
        room_explode($room, $events, $room['tanks'][$this->idx($room, 0)], 'shell', (float) $t['x'], (float) $t['y'] - 30.0, $other, null);
        $this->assertLessThanOrEqual(0, $room['tanks'][$other]['hp'], 'the wreck happened');
        $this->assertSame(1, $room['stats'][0]['kills'], 'one human wrecking another is a kill');
        $self = $this->idx($room, 0);
        $room['tanks'][$self]['hp'] = 1;
        $me = $room['tanks'][$self];
        room_explode($room, $events, $room['tanks'][$self], 'shell', (float) $me['x'], (float) $me['y'] - 30.0, $self, null);
        $this->assertLessThanOrEqual(0, $room['tanks'][$self]['hp'], 'the self-wreck happened');
        $this->assertSame(1, $room['stats'][0]['kills'], 'wrecking your own tank is not a kill');
    }

    public function testRoundEndRecordsWinGainAndOut(): void
    {
        $room = $this->room();
        $room['seats'][1]['lives'] = 1;
        foreach ($room['tanks'] as &$t) {
            if ($t['seat'] !== 0) {
                $t['hp'] = 0;
            }
        }
        unset($t);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame(1, $room['stats'][0]['won']);
        $this->assertSame(1, $room['stats'][1]['out']);
        $this->assertSame($room['scores'][0], $room['stats'][0]['gain']);
        $snap = room_snapshot($room, 0, 0);
        $this->assertSame(2, $snap['startHumans']);
        $this->assertSame(0, $snap['winner']);
        $this->assertSame(room_winner_bonus(1), $snap['winBonus'], 'a client that missed matchwin still shows the bonus');
        $this->assertSame(['roundsWon' => 1, 'kills' => 0, 'out' => null],
            array_intersect_key($snap['seats'][0], ['roundsWon' => 0, 'kills' => 0, 'out' => 0]));
        $this->assertSame(1, $snap['seats'][1]['out']);
        $this->assertSame($room['scores'][0], $snap['seats'][0]['gain']);
    }

    private function killDrones(array &$room): void
    {
        foreach ($room['tanks'] as &$t) {
            if ($t['kind'] === 'ai') {
                $t['hp'] = 0;
            }
        }
        unset($t);
    }

    /* Round 2's gain is round 2's alone: the running total (400+ going in)
       would differ from it. */
    public function testGainIsPerRound(): void
    {
        $room = $this->room();
        $room['scores'][0] = 400;
        $this->killDrones($room);
        $events = [];
        room_end_round($room, $events);
        $this->assertSame('shop', $room['phase']);
        room_shop_set_ready($room, 0, true);
        room_shop_set_ready($room, 1, true);
        room_shop_settle($room);
        $this->assertSame($room['scores'][0], $room['stats'][0]['from']);
        $before = $room['scores'][0];
        $this->assertGreaterThanOrEqual(400, $before);
        $room['scores'][0] += 250;
        $this->killDrones($room);
        $events = [];
        room_end_round($room, $events);
        $gain = $room['stats'][0]['gain'];
        $this->assertSame($room['scores'][0] - $before, $gain);
        $this->assertGreaterThanOrEqual(250, $gain);
        $this->assertLessThan($room['scores'][0], $gain, 'not the running total');
    }
}
