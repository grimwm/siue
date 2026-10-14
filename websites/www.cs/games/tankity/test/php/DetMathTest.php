<?php
// games/tankity/test/php/DetMathTest.php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/* server/detmath.php: accurate, the rounding rule is JavaScript's, and the
   detmath vectors cover every function (the TS side checks them bit for bit). */
final class DetMathTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/rooms-lib.php';
    }

    public function testSinCosAndAtanAgreeWithLibmTo1e15(): void
    {
        for ($x = -40.0; $x <= 40.0; $x += 0.0137) {
            $tol = 1e-15 * max(1.0, abs($x));
            $this->assertEqualsWithDelta(sin($x), det_sin($x), $tol, "sin $x");
            $this->assertEqualsWithDelta(cos($x), det_cos($x), $tol, "cos $x");
            $this->assertEqualsWithDelta(atan($x), det_atan($x), 1e-15, "atan $x");
        }
        foreach ([[1, 1], [1, -1], [-1, -1], [-1, 1], [0.3, 2e-9], [-5, 0.01], [7, -1e-6], [0, -3], [0, 3]] as [$y, $x]) {
            $this->assertEqualsWithDelta(atan2($y, $x), det_atan2((float) $y, (float) $x), 4e-15, "atan2 $y $x");
        }
    }

    public function testHalvesRoundTowardPositiveInfinityLikeJavaScript(): void
    {
        $this->assertSame([3.0, -2.0, 0.0, -0.0, 0.0, 1.0], [det_round(2.5), det_round(-2.5), det_round(0.49999999999999994), det_round(-0.5), det_round(0.4), det_round(0.5)]);
    }

    /* === cannot tell the zeros apart; fdiv by the zero can (PHP 8's / throws on a zero). */
    public function testRoundingKeepsTheSignOfZeroLikeJavaScript(): void
    {
        $this->assertSame(-INF, fdiv(1.0, det_round(-0.5)));
        $this->assertSame(-INF, fdiv(1.0, det_round(-0.2)));
        $this->assertSame(-INF, fdiv(1.0, det_round(-0.0)));
        $this->assertSame(INF, fdiv(1.0, det_round(0.2)));
        $this->assertSame(INF, fdiv(1.0, det_round(0.0)));
    }

    public function testTheVectorsCoverEveryFunction(): void
    {
        $cases = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/protocol/sim-vectors.json'), true)['groups']['detmath'];
        $fns = array_unique(array_map(fn(array $c): string => $c['in']['fn'], $cases));
        sort($fns);
        $this->assertSame(['atan', 'atan2', 'cos', 'round', 'sin'], array_values($fns));
        $this->assertGreaterThan(200, count($cases));
    }
}
