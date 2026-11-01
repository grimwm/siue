<?php
// What one account may store: its studio limit, the largest note and draft request, whether it stores
// scores only (with their vocal takes), whether its bytes count toward the shared pool, the host's free-disk floor
// under every upload, and how large a vocal take may decode.
declare(strict_types=1);

namespace Music;

final readonly class Limits
{
    /** A non-named person's studio: 25 MB, about 8 to 10 minutes of Perfect singing. */
    public const STUDIO_BYTES = 26_214_400;
    /** The editor's save: a score of at most 256 KB, its vocal takes up to a studio's worth, and the bundle's framing. */
    public const SAVE_REQUEST_BYTES = self::STUDIO_BYTES + ScoreRules::MAX_SCORE_BYTES + 65_536;

    public function __construct(
        public int $quotaBytes,
        public int $maxNoteBytes,
        public int $maxRequestBytes,
        public bool $scoreOnly,
        public bool $sharedPool,
        public int $minFreeDiskBytes = \Admin\People::DEFAULT_MIN_FREE_DISK_MB * 1_048_576,
        public int $maxTakeDecodedBytes = \Admin\People::DEFAULT_MAX_TAKE_DECODED_MB * 1_048_576,
    ) {
    }

    /** The allowance's limits for the owner and named people with the allowance flag; the studio's 25 MB for everyone else. */
    public static function for(\Admin\People $p, string $email): self
    {
        if ($p->hasAllowance($email)) {
            return new self(Store::MAX_DRAFT_TOTAL_BYTES, Store::MAX_NOTE_BYTES, Store::MAX_REQUEST_BYTES, false, false, $p->minFreeDiskBytes(), $p->maxTakeDecodedBytes());
        }
        // A request carries one score.json of at most 262,144 bytes plus 64 bytes of bundle framing; the editor's save
        // (save-draft.php) may carry vocal takes too, up to SAVE_REQUEST_BYTES.
        return new self(self::STUDIO_BYTES, 1_048_576, 262_208, true, true, $p->minFreeDiskBytes(), $p->maxTakeDecodedBytes());
    }
}
