<?php
// The public-key fingerprints a sealed note's header may name: the current key
// and the earlier ones a page built before a rotation may still seal to.
declare(strict_types=1);

namespace Music;

final class PublicKeys
{
    /**
     * @param string $current 64-hex fingerprint of the current key
     * @param list<string> $previous 64-hex fingerprints of the retained earlier keys
     */
    public function __construct(public readonly string $current, public readonly array $previous)
    {
    }

    /** MUSIC_PUBLIC_KEYS when set (local runs), else the committed music/keys/public.json. */
    public static function defaultPath(): string
    {
        return getenv('MUSIC_PUBLIC_KEYS') ?: __DIR__ . '/../keys/public.json';
    }

    /** null when the file is missing; \RuntimeException when it is invalid or a fingerprint does not match its spki. */
    public static function fromFile(string $path): ?self
    {
        if (!is_file($path)) {
            return null;
        }
        try {
            $doc = json_decode((string) file_get_contents($path), true, 8, JSON_THROW_ON_ERROR);
            if (!is_array($doc) || ($doc['schema'] ?? null) !== 1 || !is_array($doc['previous'] ?? null)) {
                throw new \RuntimeException('shape');
            }
            $current = self::checked($doc['current'] ?? null);
            $previous = array_map(self::checked(...), array_values($doc['previous']));
        } catch (\JsonException | \RuntimeException) {
            throw new \RuntimeException('music/keys/public.json is invalid');
        }
        return new self($current, $previous);
    }

    /** The fingerprint of an entry whose fingerprint is the SHA-256 of its spki. */
    private static function checked(mixed $entry): string
    {
        $fp = is_array($entry) ? ($entry['fingerprint'] ?? null) : null;
        $spki = is_array($entry) && is_string($entry['spki'] ?? null) ? base64_decode($entry['spki'], true) : false;
        if (!is_string($fp) || preg_match('/^[0-9a-f]{64}$/', $fp) !== 1 || $spki === false || $spki === '' || !hash_equals(hash('sha256', $spki), $fp)) {
            throw new \RuntimeException('entry');
        }
        return $fp;
    }

    /** @return list<string> current first */
    public function all(): array
    {
        return array_values(array_filter([$this->current, ...$this->previous]));
    }

    /** "abcd ef01 ..." groups of four for people to compare. */
    public static function display(string $hex): string
    {
        return implode(' ', str_split($hex, 4));
    }
}
