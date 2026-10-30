<?php
// How the studio names sizes, and what it says when an upload would pass the studio limit. The page's own
// humanBytes matches human() exactly.
declare(strict_types=1);

namespace Music;

final class Usage
{
    /** At 1 MB (1,048,576 bytes) and above, MB with one decimal ("1.2 MB", "5 MB"); below it, whole KB ("0 KB", "926 KB"). */
    public static function human(int $bytes): string
    {
        $bytes = max(0, $bytes);
        if ($bytes >= 1_048_576) {
            $mb = sprintf('%.1f', $bytes / 1_048_576);
            return (str_ends_with($mb, '.0') ? substr($mb, 0, -2) : $mb) . ' MB';
        }
        return (int) round($bytes / 1024) . ' KB';
    }

    /** The refusal of an upload that would pass the limit: the room left of $quota (or, when $shared, of the studios' shared space), and how to free some. */
    public static function refusal(int $room, int $quota, bool $shared = false): string
    {
        if ($shared) {
            return 'The studios\' shared space has ' . self::human($room) . ' left. Delete drafts or picked-up notes to make room.';
        }
        return 'Your studio has ' . self::human($room) . ' of ' . self::human($quota) . ' left. Delete drafts or picked-up notes to make room.';
    }
}
