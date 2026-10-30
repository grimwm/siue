<?php
// How the studio names sizes and the refusal when an upload would pass the studio limit.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicUsageTest extends TestCase
{
    public function testSizesAreWholeKilobytesBelowAMegabyteAndOneDecimalAbove(): void
    {
        foreach ([
            0 => '0 KB',
            1 => '0 KB',
            512 => '1 KB',
            1024 => '1 KB',
            948_576 => '926 KB',
            1_048_575 => '1024 KB',
            1_048_576 => '1 MB',
            1_258_291 => '1.2 MB',
            5_242_880 => '5 MB',
            104_857_600 => '100 MB',
            1_073_741_824 => '1024 MB',
        ] as $bytes => $human) {
            self::assertSame($human, Music\Usage::human($bytes), (string) $bytes);
        }
    }

    public function testTheRefusalSaysTheRoomTheLimitAndHowToFreeSome(): void
    {
        self::assertSame('Your studio has 1.2 MB of 5 MB left. Delete drafts or picked-up notes to make room.', Music\Usage::refusal(1_258_291, 5_242_880));
        self::assertSame('Your studio has 0 KB of 100 MB left. Delete drafts or picked-up notes to make room.', Music\Usage::refusal(0, 104_857_600));
    }
}
