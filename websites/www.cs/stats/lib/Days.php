<?php
// Calendar days and hours as the statistics count them: in America/Chicago, the owner's time.
declare(strict_types=1);

namespace Stats;

final class Days
{
    public const ZONE = 'America/Chicago';

    /** Days of raw rows kept: about 90, with room so a 90-day range and its cohorts are always whole. */
    public const KEEP = 95;

    private static ?\DateTimeZone $zone = null;

    private static function zone(): \DateTimeZone
    {
        return self::$zone ??= new \DateTimeZone(self::ZONE);
    }

    /** The local day of $t, YYYY-MM-DD. */
    public static function of(int $t): string
    {
        return (new \DateTimeImmutable('@' . $t))->setTimezone(self::zone())->format('Y-m-d');
    }

    /** The local hour of $t, 0-23. */
    public static function hourOf(int $t): int
    {
        return (int) (new \DateTimeImmutable('@' . $t))->setTimezone(self::zone())->format('G');
    }

    /** $day moved by $n days. */
    public static function add(string $day, int $n): string
    {
        return (new \DateTimeImmutable($day . ' 12:00:00', self::zone()))->modify(($n >= 0 ? '+' : '') . $n . ' days')->format('Y-m-d');
    }

    /** Weekday of $day, 0 = Monday .. 6 = Sunday. */
    public static function weekday(string $day): int
    {
        return (int) (new \DateTimeImmutable($day . ' 12:00:00', self::zone()))->format('N') - 1;
    }

    /** Every day from $from to $to inclusive. @return list<string> */
    public static function range(string $from, string $to): array
    {
        $out = [];
        for ($d = $from; $d <= $to; $d = self::add($d, 1)) {
            $out[] = $d;
        }
        return $out;
    }
}
