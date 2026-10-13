<?php
// games/tankity/test/php/FlightTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* The solo flight: fixed steps, tanks dropping between them, pinned to the
   browser's flyVolley by the volley-fall vectors. */
final class FlightTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /* make test's `php protocol/sim-vectors.php --check` keeps the file current; this checks the cases cover what they are for. */
    public function testTheVolleyFallVectorsReallyFall(): void
    {
        $dir = dirname(__DIR__, 2);
        $cases = json_decode((string) file_get_contents($dir . '/protocol/sim-vectors.json'), true)['groups']['volley-fall'];
        $this->assertGreaterThanOrEqual(4, count($cases));
        $this->assertNotEmpty(array_filter($cases, fn(array $c): bool => $c['out']['midFall']), 'some case drops a tank mid-volley');
        foreach ($cases as $c) {
            $this->assertSame('zeros-equal', $c['exact'], "{$c['name']} is compared exactly");
        }
    }

    public function testATankOverAPitFallsAndLands(): void
    {
        $s = ['terrain' => array_fill(0, 720, 400.0), 'shells' => [], 'tanks' => [['hp' => 50, 'x' => 300.0, 'y' => 300.0]]];
        $this->assertTrue(flight_falling($s));
        $y = [];
        for ($i = 0; $i < 3; $i++) {
            flight_fall($s, FLIGHT_STEP);
            $y[] = $s['tanks'][0]['y'];
        }
        $this->assertGreaterThan($y[0], $y[2]);
        $this->assertEqualsWithDelta(FLIGHT_FALL_GRAVITY * FLIGHT_STEP * 3, $s['tanks'][0]['vy'], 1e-9);
        $this->assertGreaterThan(0, flight_volley($s), 'a fall left over is stepped to its end');
        $this->assertSame(400.0, $s['tanks'][0]['y']);
        $this->assertFalse(flight_falling($s));
    }

    public function testLaterPelletsWaitForEarlierOnes(): void
    {
        $s = ['shells' => [
            ['owner' => 0, 'order' => [0], 'dead' => false], ['owner' => 0, 'order' => [1], 'dead' => false],
            ['owner' => 0, 'order' => [0, 2], 'dead' => false], ['owner' => 1, 'order' => [0], 'dead' => false],
        ]];
        $this->assertFalse(flight_waits($s, 0));
        $this->assertTrue(flight_waits($s, 1), 'pellet 1 waits on pellet 0');
        $this->assertTrue(flight_waits($s, 2), 'a bomblet of pellet 0 waits on the pellet itself');
        $this->assertFalse(flight_waits($s, 3), 'another gunner\'s shell never waits on this one');
    }

    /* D22: a shell lives 12 s times the field's reach, as the browser's fireWeapon and splitShell give it. */
    public function testShellLifeScalesWithTheField(): void
    {
        foreach ([720, 1080, 1440] as $w) {
            $s = ['terrain' => array_fill(0, $w, 400.0), 'shells' => [], 'wind' => 0.0,
                'tanks' => [['seat' => 0, 'kind' => 'human', 'x' => 100.0, 'y' => 400.0, 'hp' => 100, 'angle' => 45.0, 'power' => 50.0, 'dirS' => 1]]];
            flight_launch($s, 0, 'shell');
            $this->assertSame(12.0 * room_field_reach($w), $s['shells'][0]['life'], "life at $w");
        }
    }
}
