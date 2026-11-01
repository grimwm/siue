<?php
// A vocal take as it arrives, before it is kept. Its magic bytes only pick the reader: FLAC (fLaC), Ogg (OggS) or
// WebM (EBML). Each reader walks the whole container itself, checks every frame or page it can (FLAC's CRC-8 and
// CRC-16, Ogg's CRC-32), checks that the codec is FLAC or Opus, and counts the take's length from its frames, never
// from a header field. A header that disagrees with the frames is refused. The name must be the bytes' own SHA-256.
declare(strict_types=1);

namespace Music;

final class TakeCheck
{
    public const NAME = '/^vocal-([0-9a-f]{64})\.(flac|ogg|webm)$/D';
    /** A take is at most 15 minutes. */
    public const MAX_SECONDS = 900;
    private const OPUS_RATE = 48000;

    /**
     * The take's length in seconds, or the reason it cannot be kept: bad_take (unreadable, wrong codec, wrong name),
     * take_too_long (past 15 minutes, or decoding to more than $maxDecodedBytes of 16-bit samples).
     */
    public static function check(string $name, string $bytes, int $maxDecodedBytes): float|string
    {
        if (!preg_match(self::NAME, $name, $m) || hash('sha256', $bytes) !== $m[1]) {
            return 'bad_take';
        }
        $read = match ($m[2]) {
            'flac' => str_starts_with($bytes, 'fLaC') ? self::flac($bytes) : null,
            'ogg' => str_starts_with($bytes, 'OggS') ? self::ogg($bytes) : null,
            default => str_starts_with($bytes, "\x1A\x45\xDF\xA3") ? self::webm($bytes) : null,
        };
        if ($read === null) {
            return 'bad_take';
        }
        [$samples, $rate, $channels] = $read;
        $seconds = $samples / $rate;
        if ($seconds <= 0) {
            return 'bad_take';
        }
        if ($seconds > self::MAX_SECONDS || $samples * $channels * 2 > $maxDecodedBytes) {
            return 'take_too_long';
        }
        return round($seconds, 3);
    }

    // ---- FLAC ----

    private static ?array $crc16 = null;

    private static function crc8(string $b, int $from, int $to): int
    {
        $c = 0;
        for ($i = $from; $i < $to; $i++) {
            $c ^= ord($b[$i]);
            for ($k = 0; $k < 8; $k++) {
                $c = $c & 0x80 ? (($c << 1) ^ 0x07) & 0xff : ($c << 1) & 0xff;
            }
        }
        return $c;
    }

    private static function crc16(string $b, int $from, int $to): int
    {
        if (self::$crc16 === null) {
            self::$crc16 = [];
            for ($i = 0; $i < 256; $i++) {
                $c = $i << 8;
                for ($k = 0; $k < 8; $k++) {
                    $c = $c & 0x8000 ? (($c << 1) ^ 0x8005) & 0xffff : ($c << 1) & 0xffff;
                }
                self::$crc16[$i] = $c;
            }
        }
        $t = self::$crc16;
        $c = 0;
        for ($i = $from; $i < $to; $i++) {
            $c = (($c << 8) & 0xffff) ^ $t[(($c >> 8) ^ ord($b[$i])) & 0xff];
        }
        return $c;
    }

    /** The frame header at $at: [block size, header length] with a valid CRC-8, or null. */
    private static function flacHeader(string $b, int $at, int $rate): ?array
    {
        $end = strlen($b);
        if ($at + 6 > $end || ord($b[$at]) !== 0xFF || (ord($b[$at + 1]) & 0xFE) !== 0xF8) {
            return null;
        }
        $sizeCode = ord($b[$at + 2]) >> 4;
        $rateCode = ord($b[$at + 2]) & 0x0F;
        $channels = ord($b[$at + 3]) >> 4;
        if ($sizeCode === 0 || $rateCode === 0x0F || $channels > 10 || (ord($b[$at + 3]) & 1) !== 0) {
            return null;
        }
        $p = $at + 4;
        // The frame number: a lead byte of n + 1 ones and n continuation bytes.
        $lead = ord($b[$p++]);
        $ones = 0;
        while ($ones < 8 && ($lead & (0x80 >> $ones))) {
            $ones++;
        }
        if ($ones === 1 || $ones > 7) {
            return null;
        }
        $more = $ones === 0 ? 0 : $ones - 1;
        for ($i = 0; $i < $more; $i++) {
            if ($p >= $end || (ord($b[$p++]) & 0xC0) !== 0x80) {
                return null;
            }
        }
        $size = match (true) {
            $sizeCode === 1 => 192,
            $sizeCode >= 2 && $sizeCode <= 5 => 576 << ($sizeCode - 2),
            $sizeCode === 6 => $p < $end ? ord($b[$p++]) + 1 : 0,
            $sizeCode === 7 => $p + 1 < $end ? ((ord($b[$p++]) << 8) | ord($b[$p++])) + 1 : 0,
            default => 256 << ($sizeCode - 8),
        };
        if ($rateCode === 0x0C) {
            $p += 1;
        } elseif ($rateCode === 0x0D || $rateCode === 0x0E) {
            $p += 2;
        }
        if ($size === 0 || $p >= $end || self::crc8($b, $at, $p) !== ord($b[$p])) {
            return null;
        }
        return [$size, $p + 1 - $at];
    }

    /** @return array{int, int, int}|null samples, rate, channels */
    private static function flac(string $b): ?array
    {
        $end = strlen($b);
        $p = 4;
        $rate = 0;
        $channels = 0;
        $declared = 0;
        do {
            if ($p + 4 > $end) {
                return null;
            }
            $h = ord($b[$p]);
            $last = ($h & 0x80) !== 0;
            $type = $h & 0x7F;
            $len = (ord($b[$p + 1]) << 16) | (ord($b[$p + 2]) << 8) | ord($b[$p + 3]);
            $p += 4;
            if ($p + $len > $end) {
                return null;
            }
            if ($type === 0) {
                if ($len !== 34) {
                    return null;
                }
                $v = substr($b, $p + 10, 8);
                $hi = unpack('N', substr($v, 0, 4))[1];
                $lo = unpack('N', substr($v, 4, 4))[1];
                $rate = $hi >> 12;
                $channels = (($hi >> 9) & 0x7) + 1;
                $bits = (($hi >> 4) & 0x1F) + 1;
                $declared = (($hi & 0xF) << 32) | $lo;
                if ($rate < 8000 || $rate > 192000 || $channels !== 1 || $bits !== 16) {
                    return null;
                }
            }
            $p += $len;
        } while (!$last);
        if ($rate === 0) {
            return null;
        }
        // Every frame from the end of the metadata to the end of the file: each starts where the last ended, its header
        // checks, and the frame's own CRC-16 holds at the next frame's start (or the file's end).
        $samples = 0;
        while ($p < $end) {
            $h = self::flacHeader($b, $p, $rate);
            if ($h === null) {
                return null;
            }
            $next = $p + $h[1] + 2;
            $found = false;
            while (true) {
                $cand = $next >= $end ? $end : strpos($b, "\xFF", $next);
                if ($cand === false) {
                    $cand = $end;
                }
                if ($cand === $end || ((ord($b[$cand + 1] ?? "\0") & 0xFE) === 0xF8 && self::flacHeader($b, $cand, $rate) !== null)) {
                    $stored = $cand - 2 >= $p ? (ord($b[$cand - 2]) << 8) | ord($b[$cand - 1]) : -1;
                    if ($stored === self::crc16($b, $p, $cand - 2)) {
                        $found = true;
                        $samples += $h[0];
                        $p = $cand;
                        break;
                    }
                }
                if ($cand === $end) {
                    break;
                }
                $next = $cand + 1;
            }
            if (!$found) {
                return null;
            }
        }
        // The last frame may be shorter than its header's block size only through its own header; the header's count must agree.
        if ($samples !== $declared && $declared !== 0) {
            return null;
        }
        return [$samples, $rate, $channels];
    }

    // ---- Opus ----

    /** The 48 kHz samples in one Opus packet (RFC 6716 §3.1), or 0 when it is not one. */
    public static function opusSamples(string $packet): int
    {
        if ($packet === '') {
            return 0;
        }
        $toc = ord($packet[0]);
        $config = $toc >> 3;
        $frame = $config < 12 ? [480, 960, 1920, 2880][$config & 3] : ($config < 16 ? [480, 960][$config & 1] : [120, 240, 480, 960][$config & 3]);
        $code = $toc & 3;
        $frames = $code === 0 ? 1 : ($code < 3 ? 2 : (strlen($packet) < 2 ? 0 : ord($packet[1]) & 0x3F));
        $total = $frame * $frames;
        return $total > 5760 ? 0 : $total;
    }

    /** The pre-skip of an OpusHead packet for one channel, or null. */
    private static function opusHead(string $p): ?int
    {
        if (strlen($p) < 19 || !str_starts_with($p, 'OpusHead') || ord($p[8]) !== 1 || ord($p[9]) !== 1) {
            return null;
        }
        return unpack('v', substr($p, 10, 2))[1];
    }

    private static ?array $oggTable = null;

    private static function oggCrc(string $b): int
    {
        if (self::$oggTable === null) {
            self::$oggTable = [];
            for ($i = 0; $i < 256; $i++) {
                $c = $i << 24;
                for ($k = 0; $k < 8; $k++) {
                    $c = ($c & 0x80000000) ? (($c << 1) ^ 0x04C11DB7) & 0xFFFFFFFF : ($c << 1) & 0xFFFFFFFF;
                }
                self::$oggTable[$i] = $c;
            }
        }
        $t = self::$oggTable;
        $c = 0;
        $n = strlen($b);
        for ($i = 0; $i < $n; $i++) {
            $c = (($c << 8) & 0xFFFFFFFF) ^ $t[(($c >> 24) ^ ord($b[$i])) & 0xFF];
        }
        return $c;
    }

    /** @return array{int, int, int}|null samples at 48 kHz less the pre-skip, 48000, 1 */
    private static function ogg(string $b): ?array
    {
        $end = strlen($b);
        $p = 0;
        $serial = null;
        $packets = [];
        $pending = '';
        while ($p < $end) {
            if ($p + 27 > $end || substr($b, $p, 4) !== 'OggS' || ord($b[$p + 4]) !== 0) {
                return null;
            }
            $s = unpack('V', substr($b, $p + 14, 4))[1];
            if ($serial !== null && $s !== $serial) {
                return null; // one stream only
            }
            $serial = $s;
            $n = ord($b[$p + 26]);
            if ($p + 27 + $n > $end) {
                return null;
            }
            $lacing = array_values(unpack('C*', substr($b, $p + 27, $n)) ?: []);
            $size = 27 + $n + array_sum($lacing);
            if ($p + $size > $end) {
                return null;
            }
            $page = substr($b, $p, $size);
            $crc = unpack('V', substr($page, 22, 4))[1];
            $page = substr_replace($page, "\0\0\0\0", 22, 4);
            if (self::oggCrc($page) !== $crc) {
                return null;
            }
            $q = 27 + $n;
            foreach ($lacing as $l) {
                $pending .= substr($page, $q, $l);
                $q += $l;
                if ($l < 255) {
                    $packets[] = $pending;
                    $pending = '';
                }
            }
            $p += $size;
        }
        if (count($packets) < 2 || $pending !== '' || !str_starts_with($packets[1], 'OpusTags')) {
            return null;
        }
        $preSkip = self::opusHead($packets[0]);
        if ($preSkip === null) {
            return null;
        }
        $samples = 0;
        foreach (array_slice($packets, 2) as $pk) {
            $one = self::opusSamples($pk);
            if ($one === 0) {
                return null;
            }
            $samples += $one;
        }
        return [max(0, $samples - $preSkip), self::OPUS_RATE, 1];
    }

    // ---- WebM ----

    /** An EBML variable-length integer at $p: [value, length], with an all-ones size as -1 (unknown); null past the end. */
    private static function vint(string $b, int $p, bool $id): ?array
    {
        if ($p >= strlen($b)) {
            return null;
        }
        $first = ord($b[$p]);
        $len = 1;
        while ($len <= 8 && !($first & (0x80 >> ($len - 1)))) {
            $len++;
        }
        if ($len > 8 || $p + $len > strlen($b)) {
            return null;
        }
        $v = $id ? $first : $first & ((0x80 >> ($len - 1)) - 1);
        $ones = $v === ((0x80 >> ($len - 1)) - 1);
        for ($i = 1; $i < $len; $i++) {
            $byte = ord($b[$p + $i]);
            $v = ($v << 8) | $byte;
            $ones = $ones && $byte === 0xFF;
        }
        return [!$id && $ones ? -1 : $v, $len];
    }

    /** @return array{int, int, int}|null */
    private static function webm(string $b): ?array
    {
        $end = strlen($b);
        // The master elements walked into rather than skipped: EBML, Segment, Cluster, Tracks, TrackEntry, BlockGroup.
        $masters = [0x1A45DFA3, 0x18538067, 0x1F43B675, 0x1654AE6B, 0xAE, 0xA0];
        $p = 0;
        $docType = null;
        $codec = null;
        $tracks = 0;
        $preSkip = null;
        $samples = 0;
        $blocks = 0;
        while ($p < $end) {
            $id = self::vint($b, $p, true);
            if ($id === null) {
                return null;
            }
            $sz = self::vint($b, $p + $id[1], false);
            if ($sz === null) {
                return null;
            }
            $body = $p + $id[1] + $sz[1];
            $len = $sz[0];
            if (in_array($id[0], $masters, true)) {
                if ($id[0] === 0xAE) {
                    $tracks++;
                }
                $p = $body; // walk in; an unknown size (MediaRecorder's Segment and Cluster) runs on to what follows
                continue;
            }
            if ($len < 0 || $body + $len > $end) {
                return null;
            }
            $data = substr($b, $body, $len);
            if ($id[0] === 0x4282) {
                $docType = $data;
            } elseif ($id[0] === 0x86) {
                $codec = $data;
            } elseif ($id[0] === 0x63A2) {
                $preSkip = self::opusHead($data);
            } elseif ($id[0] === 0xA3 || $id[0] === 0xA1) {
                $track = self::vint($data, 0, false);
                if ($track === null || strlen($data) < $track[1] + 3) {
                    return null;
                }
                if ((ord($data[$track[1] + 2]) & 0x06) !== 0) {
                    return null; // laced blocks are not what a browser records
                }
                $one = self::opusSamples(substr($data, $track[1] + 3));
                if ($one === 0) {
                    return null;
                }
                $samples += $one;
                $blocks++;
            }
            $p = $body + $len;
        }
        if ($docType !== 'webm' || $codec !== 'A_OPUS' || $tracks !== 1 || $blocks === 0) {
            return null;
        }
        return [max(0, $samples - ($preSkip ?? 0)), self::OPUS_RATE, 1];
    }
}
