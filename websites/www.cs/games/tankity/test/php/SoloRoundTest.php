<?php
// games/tankity/test/php/SoloRoundTest.php
// server/solo.php's round: every round of the browser's recorded solo runs
// (protocol/solo-runs.json), played from the stored state, reaches the
// browser's claim; a tampered round does not, and the shared refusal table
// (test/solo-refusals.json) gets soloRound's reasons. Runs marked slow are the
// slow group, which CI's units job runs on every pull request.
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;

final class SoloRoundTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    /** @return list<array> */
    private static function all(): array
    {
        return json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/solo-runs.json'), true)['runs'];
    }

    /** @return array<string, array{array}> */
    private static function runs(bool $slow): array
    {
        $out = [];
        foreach (self::all() as $r) {
            if ((bool) $r['slow'] === $slow) {
                $out[$r['name']] = [$r];
            }
        }
        return $out;
    }

    public static function quickRuns(): array
    {
        return self::runs(false);
    }

    public static function slowRuns(): array
    {
        return self::runs(true);
    }

    /** Plays $run round by round, carrying the state between rounds as the store does: through JSON, zero fractions kept. */
    private function play(array $run, ?callable $tamper = null): array
    {
        $s = solo_deal($run['seed'], $run['difficulty'], $run['w']);
        foreach ($run['rounds'] as $k => $r) {
            if ($tamper !== null) {
                $r = $tamper($k, $r);
            }
            $got = solo_round(json_decode(json_encode($s, JSON_PRESERVE_ZERO_FRACTION | JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR), $r['buys'], $r['shots'], 30.0);
            if (!$got['ok']) {
                return ['round' => $r['n'], 'error' => $got['error']];
            }
            if ($got['claim'] !== $r['claim']) {
                return ['round' => $r['n'], 'error' => 'mismatch', 'server' => $got['claim'], 'browser' => $r['claim']];
            }
            $s = $got['s'];
        }
        return ['score' => (int) $s['scores'][0], 'roundsWon' => (int) $s['roundsWon'], 'rounds' => (int) $s['round'], 'phase' => $s['phase']];
    }

    private function assertPlays(array $run): void
    {
        $this->assertSame(['score' => $run['score'], 'roundsWon' => $run['roundsWon'], 'rounds' => count($run['rounds']), 'phase' => 'over'],
            $this->play($run), $run['name']);
    }

    #[DataProvider('quickRuns')]
    public function testEveryRoundReachesTheBrowsersClaim(array $run): void
    {
        $this->assertPlays($run);
    }

    #[DataProvider('slowRuns')]
    #[Group('slow')]
    public function testASlowRunPlaysToo(array $run): void
    {
        $this->assertPlays($run);
    }

    public function testTheRecordedRunsCoverEveryDifficultyAndPassSixtyRounds(): void
    {
        $all = self::all();
        $levels = array_unique(array_column($all, 'difficulty'));
        sort($levels);
        $this->assertSame(['easy', 'hard', 'normal'], array_values($levels));
        $this->assertGreaterThan(60, max(array_map(fn($r) => count($r['rounds']), $all)), 'solo has no round limit');
        $this->assertNotEmpty(self::quickRuns());
        $this->assertNotEmpty(self::slowRuns());
    }

    private function sample(): array
    {
        return array_values(self::quickRuns())[0][0];
    }

    public function testTheRunsDifficultyAimsTheDrones(): void
    {
        $run = $this->sample();
        $run['difficulty'] = $run['difficulty'] === 'hard' ? 'easy' : 'hard';
        $this->assertArrayHasKey('error', $this->play($run));
    }

    public function testAMissingShotLeavesTheRoundUnfinished(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                array_pop($r['shots']);
            }
            return $r;
        });
        $this->assertSame(1, $got['round']);
        $this->assertContains($got['error'], ['unfinished', 'mismatch']);
    }

    public function testShotsAfterTheEndAreRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $r['shots'][] = end($r['shots']) ?: ['w' => 'shell', 'a' => 45, 'p' => 50, 'x' => 100];
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'shots after the end'], array_intersect_key($got, ['round' => 1, 'error' => 1]));
    }

    public function testAShotOutOfRangeIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $r['shots'][0]['a'] = 200;
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'out of range'], $got);
    }

    public function testATeleportIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                $x = $r['shots'][0]['x'];
                $r['shots'][0]['x'] = $x < 360 ? $x + 300 : $x - 300;
            }
            return $r;
        });
        $this->assertArrayHasKey('error', $got);
    }

    public function testBuyingWithoutCashIsRefused(): void
    {
        $got = $this->play($this->sample(), function (int $k, array $r): array {
            if ($k === 0) {
                array_unshift($r['buys'], ['i' => 'extralife', 'q' => 1]);
            }
            return $r;
        });
        $this->assertSame(['round' => 1, 'error' => 'bad buy'], $got);
    }

    public function testTooManyShotsAreRefusedBeforeAnyPlay(): void
    {
        $s = solo_deal('x', 'normal', ROOM_W);
        $this->assertSame(['ok' => false, 'error' => 'too many shots'],
            solo_round($s, [], array_fill(0, SOLO_MAX_SHOTS + 1, ['w' => 'shell', 'a' => 45, 'p' => 50, 'x' => 100]), 30.0));
        $this->assertSame(['ok' => false, 'error' => 'bad buys'], solo_round($s, ['i' => 'mortar'], [], 30.0));
    }

    public function testAnOverRunPlaysNoMore(): void
    {
        $s = solo_deal('x', 'normal', ROOM_W);
        $s['phase'] = 'over';
        $this->assertSame(['ok' => false, 'error' => 'the run is over'], solo_round($s, [], []));
    }

    public function testTheCpuBudgetIsEnforced(): void
    {
        $run = $this->sample();
        $r = $run['rounds'][0];
        // A budget below zero: getrusage may not have ticked since the round began.
        $this->assertSame(['ok' => false, 'error' => 'too slow'], solo_round(solo_deal($run['seed'], $run['difficulty'], $run['w']), $r['buys'], $r['shots'], -1.0));
    }

    public function testAVolleyStillFlyingWhenTheStepsRunOutIsRefused(): void
    {
        $s = solo_deal('garbage', 'normal', ROOM_W);
        $probe = $s;
        $probe['round'] = 1;
        solo_muster($probe);
        $shot = ['w' => 'shell', 'a' => 80, 'p' => 100, 'x' => $probe['tanks'][0]['x']];
        $this->assertSame(['ok' => false, 'error' => 'too slow'], solo_round($s, [], [$shot], 30.0, 5));
        $this->assertNotSame('too slow', solo_round($s, [], [$shot], 30.0)['error'] ?? null, 'the full budget lands it');
    }

    /** The cases of test/solo-refusals.json, decoded as the endpoint decodes a request. */
    public static function refusals(): array
    {
        $table = json_decode((string) file_get_contents(dirname(__DIR__) . '/solo-refusals.json'), true);
        $out = [];
        foreach ($table['cases'] as $c) {
            $out[$c['name']] = [$c, $table['seed']];
        }
        return $out;
    }

    #[DataProvider('refusals')]
    public function testTheSharedRefusalTableGetsSoloRoundsReasons(array $c, string $seed): void
    {
        if (isset($c['run'])) {
            $run = array_values(array_filter(self::all(), fn($r) => $r['name'] === $c['run']))[0];
            $s = solo_deal($run['seed'], $run['difficulty'], $run['w']);
            $buys = $run['rounds'][0]['buys'];
            $shots = [...$run['rounds'][0]['shots'], $c['append']];
        } else {
            $s = solo_deal($seed, 'normal', 720);
            $buys = $c['buys'];
            $shots = $c['shots'];
        }
        if (isset($c['buysRepeat'])) {
            $buys = array_fill(0, $c['buysRepeat'], $c['buys']);
        }
        if (isset($c['shotsRepeat'])) {
            $shots = array_fill(0, $c['shotsRepeat'], $c['shots']);
        }
        $this->assertSame(['ok' => false, 'error' => $c['error']], solo_round($s, $buys, $shots, 30.0));
    }

    public function testTheShooterIsLandedBeforeTheShot(): void
    {
        $s = solo_deal('land', 'normal', ROOM_W);
        $s['round'] = 1;
        solo_muster($s);
        $ground = $s['tanks'][0]['y'];
        $s['tanks'][0]['y'] -= 40; // left hanging over the ground
        $s['tanks'][0]['vy'] = 90.0;
        $this->assertNull(solo_player_fire($s, ['w' => 'shell', 'a' => 60, 'p' => 70, 'x' => $s['tanks'][0]['x']]));
        $this->assertSame([$ground, 0.0], [$s['tanks'][0]['y'], $s['tanks'][0]['vy']]);
    }

    public function testSettleStandsTheLivingExactlyOnTheGround(): void
    {
        $s = solo_deal('land', 'normal', ROOM_W);
        $s['round'] = 1;
        solo_muster($s);
        $ground = array_column($s['tanks'], 'y');
        foreach ($s['tanks'] as $i => &$t) {
            $t['y'] -= 0.1 * ($i + 1); // inside the half pixel a fall stops short of
        }
        unset($t);
        $this->assertSame('next', solo_settle($s));
        $this->assertSame($ground, array_column($s['tanks'], 'y'));
    }
}
