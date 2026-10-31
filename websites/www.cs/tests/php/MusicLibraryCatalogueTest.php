<?php
// The shared sample library holds the composer's whole orchestra, and ScoreRules accepts every one of its instruments.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicLibraryCatalogueTest extends TestCase
{
    private const IDS = ['violin', 'viola', 'cello', 'bass', 'harp', 'flute', 'piccolo', 'oboe', 'clarinet', 'bassoon', 'trumpet', 'horn',
        'trombone', 'tuba', 'piano', 'organ', 'celesta', 'timpani', 'glock', 'xylo', 'marimba', 'vibes', 'bells', 'kit', 'orch', 'choir'];

    private function check(array $lanes): ?string
    {
        $studio = Music\Limits::for(Admin\People::fromJson('{}'), 'student@siue.edu');
        return Music\ScoreRules::check(['score.json' => '{}'], ['lanes' => $lanes], $studio, music_library_instruments());
    }

    public function testTheLibraryHoldsTheWholeOrchestra(): void
    {
        $this->assertSame(self::IDS, music_library_instruments());
    }

    public function testStandInsDrumsAndNewInstrumentsPass(): void
    {
        $lanes = array_map(fn(string $i) => ['id' => $i, 'sound' => ['instrument' => $i]], ['celesta', 'kit', 'violin']);
        $this->assertNull($this->check($lanes));
    }

    public function testAnInstrumentTheLibraryLacksIsStillRefused(): void
    {
        $this->assertSame('unknown_instrument', $this->check([['id' => 'a', 'sound' => ['instrument' => 'synth-pad']]]));
    }
}
