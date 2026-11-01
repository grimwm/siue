<?php
// What a score from outside may be before it is kept: its size, its note and lane counts, the instruments
// it names (a vocal lane's reserved one only on a vocal lane), and, for an account that stores scores only, that
// nothing but score.json and vocal takes comes with it.
declare(strict_types=1);

namespace Music;

final class ScoreRules
{
    public const MAX_SCORE_BYTES = 262_144;
    public const MAX_NOTES = 20_000;
    public const MAX_LANES = 16;
    public const MAX_TAKES = 32;
    /** A vocal lane's sound is this reserved instrument, which plays its takes rather than the sample library. */
    public const VOCAL_INSTRUMENT = 'vocal';

    /**
     * The first refusal for a draft's files and decoded score, or null.
     * @param array<string, string> $files
     * @param list<string> $instruments the library's instrument names
     */
    public static function check(array $files, array $score, Limits $limits, array $instruments): ?string
    {
        $takes = array_filter(array_keys($files), static fn(string $n): bool => preg_match(TakeCheck::NAME, $n) === 1);
        if ($limits->scoreOnly && array_diff(array_keys($files), ['score.json', ...$takes]) !== []) {
            return 'score_only';
        }
        if (count($takes) > self::MAX_TAKES) {
            return 'too_many_takes';
        }
        if (strlen($files['score.json'] ?? '') > self::MAX_SCORE_BYTES) {
            return 'too_large';
        }
        if (is_array($score['notes'] ?? null) && count($score['notes']) > self::MAX_NOTES) {
            return 'too_many_notes';
        }
        if (!is_array($score['lanes'] ?? null)) {
            return null;
        }
        if (count($score['lanes']) > self::MAX_LANES) {
            return 'too_many_lanes';
        }
        foreach ($score['lanes'] as $lane) {
            $instrument = is_array($lane) && is_array($lane['sound'] ?? null) ? ($lane['sound']['instrument'] ?? null) : null;
            $vocal = is_array($lane) && isset($lane['vocal']);
            if (($instrument === self::VOCAL_INSTRUMENT) !== $vocal || ($vocal && !is_array($lane['vocal']))) {
                return 'bad_score';
            }
            if ($instrument !== null && !$vocal && (!is_string($instrument) || !in_array($instrument, $instruments, true))) {
                return 'unknown_instrument';
            }
        }
        return null;
    }
}
