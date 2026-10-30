<?php
// The locked keyring's upload, as a session (the page) or an admin key (the owner's tool) sends it: the wrapper
// naming the fingerprints, and the envelope's pinned shape. The server never reads inside the envelope.
declare(strict_types=1);

namespace Music;

final class Keyring
{
    private const KEYRING_FIELDS = ['ct', 'iterations', 'iv', 'kdf', 'salt', 'v'];
    private const MAX_PREVIOUS = 32;
    private const MIN_ITERATIONS = 600000;
    private const MAX_ITERATIONS = 10000000;

    /**
     * The upload wrapper: exactly keyring, current and previous; a well-formed envelope; 64-hex fingerprints, none
     * repeated, at most MAX_PREVIOUS earlier ones. The envelope comes back re-encoded for storage.
     *
     * @return array{locked: string, current: string, previous: list<string>}|null
     */
    public static function parseUpload(string $body): ?array
    {
        $doc = json_decode($body, true);
        if (!is_array($doc)) {
            return null;
        }
        $fields = array_keys($doc);
        sort($fields);
        if ($fields !== ['current', 'keyring', 'previous'] || !is_array($doc['keyring']) || !is_array($doc['previous']) || !array_is_list($doc['previous'])) {
            return null;
        }
        $prints = [$doc['current'], ...$doc['previous']];
        foreach ($prints as $fp) {
            if (!is_string($fp) || preg_match('/^[0-9a-f]{64}$/D', $fp) !== 1) {
                return null;
            }
        }
        if (count($doc['previous']) > self::MAX_PREVIOUS || count(array_unique($prints)) !== count($prints)) {
            return null;
        }
        $locked = json_encode($doc['keyring'], JSON_UNESCAPED_SLASHES);
        if ($locked === false || !self::keyringIsWellFormed($locked)) {
            return null;
        }
        return ['locked' => $locked, 'current' => $doc['current'], 'previous' => $doc['previous']];
    }

    /** The envelope check: exactly the six fields, the pinned KDF and strength, and correctly sized base64 parts. */
    private static function keyringIsWellFormed(string $body): bool
    {
        $k = json_decode($body, true);
        if (!is_array($k)) {
            return false;
        }
        $fields = array_keys($k);
        sort($fields);
        return $fields === self::KEYRING_FIELDS
            && $k['v'] === 1
            && $k['kdf'] === 'PBKDF2-SHA-256'
            && is_int($k['iterations']) && $k['iterations'] >= self::MIN_ITERATIONS && $k['iterations'] <= self::MAX_ITERATIONS
            && self::base64Length($k['salt']) === 16
            && self::base64Length($k['iv']) === 12
            && (self::base64Length($k['ct']) ?? 0) >= 17;
    }

    /** The decoded length of canonical base64, or null when $value is not that. */
    private static function base64Length(mixed $value): ?int
    {
        if (!is_string($value)) {
            return null;
        }
        $bytes = base64_decode($value, true);
        return $bytes !== false && base64_encode($bytes) === $value ? strlen($bytes) : null;
    }
}
