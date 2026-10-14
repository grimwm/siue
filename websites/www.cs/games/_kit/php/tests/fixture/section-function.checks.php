<?php
declare(strict_types=1);

// @test one: declares a function
function helper(): int
{
    return 1;
}
$check('one', helper() === 1);
