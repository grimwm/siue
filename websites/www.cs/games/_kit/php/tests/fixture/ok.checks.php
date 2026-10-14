<?php
// Fixture for ChecksToTestCaseTest.
declare(strict_types=1);
require_once __DIR__ . '/helpers.php';
define('FIXTURE_X', 1);
if (!defined('FIXTURE_Y')) {
    define('FIXTURE_Y', 2);
}

// @test arithmetic: sums, with and without a detail string
$a = 1 + 1;
$check('two', $a === 2);
$check('three', $a + 1 === 3, "a={$a}");

// @test multiline: nested parentheses, a string naming the call, a loose detail
$list = ['x', 'y'];
$a = count($list);
$check(
    'multi (nested) ' . strtoupper('z'),
    in_array('x', array_map(fn(string $s): string => strtolower($s), $list), true)
        && count($list) === 2,
    'text with $check( inside, ' . implode(',', $list)
);
foreach ([1, 2] as $n) {
    $check("loop-$n", $n > 0, "n={$n}");
}
$check('wrapped', true, $a === 2 ? 'yes' : 'no');
