<?php
// Limits on untrusted scores: size, notes, lanes, known instruments, score-only studios.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicScoreRulesTest extends TestCase
{
    private function allowance(): Music\Limits
    {
        return Music\Limits::for(Admin\People::fromJson('{}'), Admin\Auth::OWNER);
    }

    private function studio(): Music\Limits
    {
        return Music\Limits::for(Admin\People::fromJson('{}'), 'student@siue.edu');
    }

    /** @return list<string> */
    private function instruments(): array
    {
        return music_library_instruments();
    }

    private function check(array $files, array $score, ?Music\Limits $limits = null): ?string
    {
        return Music\ScoreRules::check($files, $score, $limits ?? $this->studio(), $this->instruments());
    }

    public function testAScoreOf256KbPassesAndOneByteMoreIsRefused(): void
    {
        $this->assertNull($this->check(['score.json' => str_repeat('x', 262_144)], []));
        $this->assertSame('too_large', $this->check(['score.json' => str_repeat('x', 262_145)], []));
    }

    public function testTwentyThousandNotesPassAndOneMoreIsRefused(): void
    {
        $this->assertNull($this->check(['score.json' => '{}'], ['notes' => array_fill(0, 20_000, [])]));
        $this->assertSame('too_many_notes', $this->check(['score.json' => '{}'], ['notes' => array_fill(0, 20_001, [])]));
    }

    public function testSixteenLanesPassAndSeventeenAreRefused(): void
    {
        $this->assertNull($this->check(['score.json' => '{}'], ['lanes' => array_fill(0, 16, ['id' => 'a'])]));
        $this->assertSame('too_many_lanes', $this->check(['score.json' => '{}'], ['lanes' => array_fill(0, 17, ['id' => 'a'])]));
    }

    public function testAnInstrumentOutsideTheLibraryIsRefused(): void
    {
        $lane = fn(string $i) => ['id' => 'a', 'sound' => ['instrument' => $i]];
        $this->assertNull($this->check(['score.json' => '{}'], ['lanes' => [$lane('harp')]]));
        $this->assertSame('unknown_instrument', $this->check(['score.json' => '{}'], ['lanes' => [$lane('../../etc')]]));
    }

    public function testAStudioUserMaySendOnlyTheScore(): void
    {
        $this->assertNull($this->check(['score.json' => '{}'], []));
        foreach (['audio.webm', 'audio.m4a', 'score.musicxml', 'spectrogram.png'] as $name) {
            $this->assertSame('score_only', $this->check(['score.json' => '{}', $name => 'x'], []), $name);
        }
    }

    public function testTheAllowanceMayStillSendAudioAndMusicXml(): void
    {
        $files = ['score.json' => '{}', 'audio.webm' => 'x', 'score.musicxml' => 'x'];
        $this->assertNull($this->check($files, [], $this->allowance()));
    }

    public function testEveryCommittedPieceStillPasses(): void
    {
        $scores = glob(__DIR__ . '/../../music/pieces/*/v*/score.json');
        $this->assertNotEmpty($scores);
        foreach ($scores as $path) {
            $json = file_get_contents($path);
            $this->assertNull($this->check(['score.json' => $json], json_decode($json, true), $this->allowance()), $path);
        }
    }
}
