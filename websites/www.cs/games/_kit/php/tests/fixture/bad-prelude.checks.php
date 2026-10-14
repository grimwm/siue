<?php
declare(strict_types=1);
$helper = function (int $n): int {
    return $n + 1;
};

// @test one: nothing to see
$check('one', $helper(1) === 2);
