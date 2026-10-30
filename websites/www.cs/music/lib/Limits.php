<?php
// What one account may store: its studio limit, the largest note and draft request, whether it stores
// scores only, and whether its bytes count toward the shared pool.
declare(strict_types=1);

namespace Music;

final readonly class Limits
{
    public function __construct(
        public int $quotaBytes,
        public int $maxNoteBytes,
        public int $maxRequestBytes,
        public bool $scoreOnly,
        public bool $sharedPool,
    ) {
    }

    /** The allowance's limits for the owner and named people with the allowance flag; the studio's 5 MB for everyone else. */
    public static function for(\Admin\People $p, string $email): self
    {
        if ($p->hasAllowance($email)) {
            return new self(Store::MAX_DRAFT_TOTAL_BYTES, Store::MAX_NOTE_BYTES, Store::MAX_REQUEST_BYTES, false, false);
        }
        // A request carries one score.json of at most 262,144 bytes plus 64 bytes of bundle framing.
        return new self(5_242_880, 1_048_576, 262_208, true, true);
    }
}
