<?php
// The time source: the system clock in production, a settable one in tests.
declare(strict_types=1);

namespace Admin;

interface Clock
{
    /** Seconds since the Unix epoch. */
    public function now(): int;
}

final class SystemClock implements Clock
{
    public function now(): int
    {
        return time();
    }
}
