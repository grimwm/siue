<?php
// Fixture for ChecksToTestCaseTest.
declare(strict_types=1);
require_once __DIR__ . '/helpers.php';
define('FIXTURE_X', 1);
if (!defined('FIXTURE_Y')) {
    define('FIXTURE_Y', 2);
}

use PHPUnit\Framework\TestCase;

final class OkTest extends TestCase
{
    private const ROOT = '/x';

    private static function twice(int $n): int
    {
        return $n * 2;
    }

    /** sums, with and without a detail string */
    public function testArithmetic(): void
    {
        $a = 1 + 1;
        self::assertTrue($a === 2, 'two');
        self::assertTrue($a + 1 === 3, 'three' . ' :: ' . "a={$a}");
    }

    /** nested parentheses, a string naming the call, a loose detail */
    public function testMultiline(): void
    {
        $list = ['x', 'y'];
        $a = count($list);
        self::assertTrue(in_array('x', array_map(fn(string $s): string => strtolower($s), $list), true)
                && count($list) === 2, 'multi (nested) ' . strtoupper('z') . ' :: ' . 'text with $check( inside, ' . implode(',', $list));
        foreach ([1, 2] as $n) {
            self::assertTrue($n > 0, "loop-$n" . ' :: ' . "n={$n}");
        }
        self::assertTrue(true, 'wrapped' . ' :: ' . ($a === 2 ? 'yes' : 'no'));
    }
}
