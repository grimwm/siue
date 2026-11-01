<?php
// A vocal take before it is kept: FLAC, Ogg Opus and WebM Opus read by walking their frames, the length counted from
// them, and refused for a wrong name, wrong magic, a damaged frame, a header that lies about the length, a codec
// that is not FLAC or Opus, or a take past 15 minutes or the decoded-size limit.
declare(strict_types=1);

use Music\TakeCheck;
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicTakeCheckTest extends TestCase
{
    private const LIMIT = 200 * 1_048_576;

    private static function fixture(string $name): string
    {
        return (string) file_get_contents(__DIR__ . '/../../games/workroom/test/fixtures/takes/' . $name);
    }

    private static function named(string $bytes, string $ext): string
    {
        return 'vocal-' . hash('sha256', $bytes) . '.' . $ext;
    }

    public function testThePagesFlacIsReadFrameByFrame(): void
    {
        $b = self::fixture('voice-2s.flac');
        $this->assertSame(round((48000 * 2 + 777) / 48000, 3), TakeCheck::check(self::named($b, 'flac'), $b, self::LIMIT));
    }

    public function testOggAndWebmOpusAreReadPacketByPacket(): void
    {
        $ogg = self::fixture('sine-1.5s.opus');
        $webm = self::fixture('sine-1.5s.webm');
        $this->assertEqualsWithDelta(1.5, TakeCheck::check(self::named($ogg, 'ogg'), $ogg, self::LIMIT), 0.03);
        $this->assertEqualsWithDelta(1.5, TakeCheck::check(self::named($webm, 'webm'), $webm, self::LIMIT), 0.03);
    }

    public function testANameThatIsNotTheBytesHashIsRefused(): void
    {
        $b = self::fixture('voice-2s.flac');
        $this->assertSame('bad_take', TakeCheck::check('vocal-' . str_repeat('0', 64) . '.flac', $b, self::LIMIT));
        $this->assertSame('bad_take', TakeCheck::check('take.flac', $b, self::LIMIT));
    }

    public function testWrongMagicForTheNameIsRefused(): void
    {
        $ogg = self::fixture('sine-1.5s.opus');
        $this->assertSame('bad_take', TakeCheck::check(self::named($ogg, 'flac'), $ogg, self::LIMIT));
        $this->assertSame('bad_take', TakeCheck::check(self::named($ogg, 'webm'), $ogg, self::LIMIT));
        $text = "fLaC but not really a FLAC file at all";
        $this->assertSame('bad_take', TakeCheck::check(self::named($text, 'flac'), $text, self::LIMIT));
    }

    public function testADamagedFrameOrPageIsRefused(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $flac[20000] = chr(ord($flac[20000]) ^ 0x40);
        $this->assertSame('bad_take', TakeCheck::check(self::named($flac, 'flac'), $flac, self::LIMIT));
        $ogg = self::fixture('sine-1.5s.opus');
        $ogg[8000] = chr(ord($ogg[8000]) ^ 0x01);
        $this->assertSame('bad_take', TakeCheck::check(self::named($ogg, 'ogg'), $ogg, self::LIMIT));
        $cut = substr(self::fixture('voice-2s.flac'), 0, 15000);
        $this->assertSame('bad_take', TakeCheck::check(self::named($cut, 'flac'), $cut, self::LIMIT));
    }

    public function testAFlacHeaderThatClaimsAShorterTakeThanItsFramesIsRefused(): void
    {
        $b = self::fixture('silence-901s.flac');
        // STREAMINFO's total samples (36 bits at bytes 21..25 of the file) said to be one second.
        $total = 48000;
        $b[21] = chr((ord($b[21]) & 0xF0) | (($total >> 32) & 0x0F));
        $b[22] = chr(($total >> 24) & 0xFF);
        $b[23] = chr(($total >> 16) & 0xFF);
        $b[24] = chr(($total >> 8) & 0xFF);
        $b[25] = chr($total & 0xFF);
        $this->assertSame('bad_take', TakeCheck::check(self::named($b, 'flac'), $b, self::LIMIT));
    }

    public function testATakePastFifteenMinutesOrTheDecodedLimitIsRefused(): void
    {
        $long = self::fixture('silence-901s.flac');
        $this->assertSame('take_too_long', TakeCheck::check(self::named($long, 'flac'), $long, self::LIMIT));
        $b = self::fixture('voice-2s.flac');
        $this->assertSame('take_too_long', TakeCheck::check(self::named($b, 'flac'), $b, 100_000));
    }

    public function testAWebmOfAnotherCodecIsRefused(): void
    {
        $webm = self::fixture('sine-1.5s.webm');
        $vorbis = str_replace('A_OPUS', 'A_VORB', $webm);
        $this->assertSame('bad_take', TakeCheck::check(self::named($vorbis, 'webm'), $vorbis, self::LIMIT));
    }

    public function testOpusPacketLengthsComeFromTheirTocByte(): void
    {
        $this->assertSame(960, TakeCheck::opusSamples(chr(31 << 3)));
        $this->assertSame(720, TakeCheck::opusSamples(chr((16 << 3) | 3) . chr(6)));
        $this->assertSame(0, TakeCheck::opusSamples(''));
    }
}
