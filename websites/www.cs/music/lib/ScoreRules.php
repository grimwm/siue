<?php
// What a score from outside may be before it is kept: its size, its note and lane counts, the instruments
// it names, and, for an account that stores scores only, that nothing but score.json comes with it.
declare(strict_types=1);

namespace Music;

final class ScoreRules
{
    public const MAX_SCORE_BYTES = 262_144;
    public const MAX_NOTES = 20_000;
    public const MAX_LANES = 16;

    /**
     * The first refusal for a draft's files and decoded score, or null.
     * @param array<string, string> $files
     * @param list<string> $instruments the library's instrument names
     */
    public static function check(array $files, array $score, Limits $limits, array $instruments): ?string
    {
        if ($limits->scoreOnly && array_diff(array_keys($files), ['score.json']) !== []) {
            return 'score_only';
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
            if ($instrument !== null && (!is_string($instrument) || !in_array($instrument, $instruments, true))) {
                return 'unknown_instrument';
            }
        }
        return null;
    }
}
