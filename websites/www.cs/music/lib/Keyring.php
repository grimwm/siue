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

    /**
     * The upload of a new passphrase (keyring.php?change=1): parseUpload's wrapper plus `proof`, exactly {spki, sig},
     * both canonical base64. Null when it is not that.
     *
     * @return array{locked: string, current: string, previous: list<string>, keyring: array<string, mixed>, spki: string, sig: string}|null
     */
    public static function parseChange(string $body): ?array
    {
        $doc = json_decode($body, true);
        if (!is_array($doc) || !is_array($doc['proof'] ?? null)) {
            return null;
        }
        $proof = $doc['proof'];
        unset($doc['proof']);
        $fields = array_keys($proof);
        sort($fields);
        $spki = is_string($proof['spki'] ?? null) ? base64_decode($proof['spki'], true) : false;
        $sig = is_string($proof['sig'] ?? null) ? base64_decode($proof['sig'], true) : false;
        if ($fields !== ['sig', 'spki'] || $spki === false || $sig === false || $spki === '' || $sig === ''
            || base64_encode($spki) !== $proof['spki'] || base64_encode($sig) !== $proof['sig']) {
            return null;
        }
        $parsed = self::parseUpload((string) json_encode($doc, JSON_UNESCAPED_SLASHES));
        return $parsed === null ? null : $parsed + ['keyring' => $doc['keyring'], 'spki' => $spki, 'sig' => $sig];
    }

    /**
     * The upload that pairs an AI key (keyring.php?pair=1): parseChange's wrapper plus `pair`, exactly
     * {key: the AI key's id, code: the typed pairing code, fingerprint: its sealing key's 64 hex}. Null when it is not that.
     *
     * @return array{locked: string, current: string, previous: list<string>, keyring: array<string, mixed>, spki: string, sig: string, key: int, code: string, fingerprint: string}|null
     */
    public static function parsePair(string $body): ?array
    {
        $doc = json_decode($body, true);
        if (!is_array($doc) || !is_array($doc['pair'] ?? null)) {
            return null;
        }
        $pair = $doc['pair'];
        unset($doc['pair']);
        $fields = array_keys($pair);
        sort($fields);
        if ($fields !== ['code', 'fingerprint', 'key'] || !is_int($pair['key']) || $pair['key'] < 1 || !is_string($pair['code'])
            || strlen($pair['code']) > 64 || !is_string($pair['fingerprint']) || preg_match('/^[0-9a-f]{64}$/D', $pair['fingerprint']) !== 1) {
            return null;
        }
        $change = self::parseChange((string) json_encode($doc, JSON_UNESCAPED_SLASHES));
        return $change === null ? null : $change + ['key' => $pair['key'], 'code' => $pair['code'], 'fingerprint' => $pair['fingerprint']];
    }

    /**
     * What the page signs to prove it holds the current private key: this session's unlock tag, the current
     * fingerprint and the new envelope's parts, so a proof serves only this session and this envelope.
     *
     * @param array<string, mixed> $keyring the new envelope
     */
    public static function changeMessage(string $tag, string $current, array $keyring): string
    {
        $part = static fn(string $k): string => is_scalar($keyring[$k] ?? null) ? (string) $keyring[$k] : '';
        return implode("\n", ['siue-music-keyring-change-v1', $tag, $current, $part('iterations'), $part('salt'), $part('iv'), $part('ct')]);
    }

    /**
     * True when $spki (DER) is the key $fingerprint names and $sig is its RSASSA-PKCS1-v1_5 SHA-256 signature of
     * changeMessage(...): proof that the uploader holds the current private key, which only the old passphrase opens.
     *
     * @param array<string, mixed> $keyring
     */
    public static function proofHolds(string $spki, string $sig, string $fingerprint, string $tag, array $keyring): bool
    {
        if ($tag === '' || $fingerprint === '' || !hash_equals($fingerprint, hash('sha256', $spki))) {
            return false;
        }
        $pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($spki), 64, "\n") . "-----END PUBLIC KEY-----\n";
        $key = openssl_pkey_get_public($pem);
        if ($key === false) {
            return false;
        }
        return openssl_verify(self::changeMessage($tag, $fingerprint, $keyring), $sig, $key, OPENSSL_ALGO_SHA256) === 1;
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
