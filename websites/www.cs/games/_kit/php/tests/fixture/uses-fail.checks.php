<?php
declare(strict_types=1);

// @test one: counts failures itself
$check('one', true);
if (1 > 2) {
    $fail++;
}
