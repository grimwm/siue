<?php
// An AI's sealing key and its pairing. The MCP on the person's computer registers the public half of its own RSA-4096
// key through its AI key (api/seal-key.php) and shows a pairing code made from the key's fingerprint. The person types
// that code on Your studio; check() counts every try and answers the key only when the code matches, so the browser can
// check the code again itself and add the key to the locked keyring. The server never adds a recipient: a paired key is
// one the unlocked browser stored in the keyring (Pages::keyring ?pair=1 calls markPaired), and notes are sealed only to
// keys that are both in that keyring and active here.
declare(strict_types=1);

namespace Music;

final class Pairing
{
    /** Crockford's base32: no I, L, O or U. */
    public const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    /** 12 characters of 5 bits: the first 60 bits of the fingerprint. */
    public const CODE_CHARS = 12;
    public const WRONG_PER_KEY_HOUR = 5;
    public const TRIES_PER_ACCOUNT_HOUR = 20;
    public const RSA_BITS = 4096;

    public function __construct(private \PDO $db, private \Admin\Clock $clock)
    {
    }

    /** The pairing code of a 64-hex fingerprint: XXXX-XXXX-XXXX. */
    public static function code(string $fingerprint): string
    {
        $bits = '';
        foreach (str_split(substr($fingerprint, 0, 15)) as $hex) {
            $bits .= str_pad(base_convert($hex, 16, 2), 4, '0', STR_PAD_LEFT);
        }
        $chars = '';
        foreach (str_split($bits, 5) as $five) {
            $chars .= self::ALPHABET[bindec($five)];
        }
        return implode('-', str_split($chars, 4));
    }

    /** A typed code as code() writes it, or null: case, spaces and hyphens do not matter, I and L read as 1, O as 0. */
    public static function normalize(string $typed): ?string
    {
        $plain = strtr(strtoupper(preg_replace('/[\s-]+/u', '', $typed) ?? ''), ['I' => '1', 'L' => '1', 'O' => '0']);
        if (strlen($plain) !== self::CODE_CHARS || strspn($plain, self::ALPHABET) !== self::CODE_CHARS) {
            return null;
        }
        return implode('-', str_split($plain, 4));
    }

    /** True for the DER SPKI of an RSA-4096 key with exponent 65537, in the canonical encoding (re-exported unchanged). */
    public static function validSpki(string $der): bool
    {
        if ($der === '' || strlen($der) > 1024) {
            return false;
        }
        $pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
        $key = @openssl_pkey_get_public($pem);
        if ($key === false) {
            return false;
        }
        $d = openssl_pkey_get_details($key);
        if (!is_array($d) || ($d['type'] ?? null) !== OPENSSL_KEYTYPE_RSA || ($d['bits'] ?? 0) !== self::RSA_BITS
            || ltrim((string) ($d['rsa']['e'] ?? ''), "\0") !== "\x01\x00\x01") {
            return false;
        }
        $again = preg_replace('/-----[A-Z ]+-----|\s+/', '', (string) ($d['key'] ?? ''));
        return base64_decode((string) $again, true) === $der;
    }

    /**
     * Registers $der as AI key $key's sealing key. 'ok' when stored (or already that key); 'paired' when the key is
     * paired to another sealing key (make a new AI key instead); 'bad_key' when $der is not validSpki; 'no_key' when
     * $key is not an active key of $account.
     */
    public function register(int $account, int $key, string $der): string
    {
        if (!self::validSpki($der)) {
            return 'bad_key';
        }
        $fp = hash('sha256', $der);
        return $this->transaction(function () use ($account, $key, $der, $fp): string {
            if (!$this->active($account, $key)) {
                return 'no_key';
            }
            $row = $this->row($account, $key);
            if ($row !== null && hash_equals($row['fingerprint'], $fp)) {
                return 'ok';
            }
            if ($row !== null && $row['paired_at'] !== null) {
                return 'paired';
            }
            $this->db->prepare('INSERT INTO studio_seal_keys (key_id, account_id, spki, fingerprint, registered_at, paired_at) VALUES (?, ?, ?, ?, ?, NULL)'
                . ' ON CONFLICT(key_id) DO UPDATE SET spki = excluded.spki, fingerprint = excluded.fingerprint, registered_at = excluded.registered_at, paired_at = NULL')
                ->execute([$key, $account, base64_encode($der), $fp, $this->clock->now()]);
            return 'ok';
        });
    }

    /** @return array{fingerprint: string, code: string, paired: bool, paired_at: ?int}|null the sealing key AI key $key of $account registered */
    public function status(int $account, int $key): ?array
    {
        $row = $this->row($account, $key);
        return $row === null ? null : ['fingerprint' => $row['fingerprint'], 'code' => self::code($row['fingerprint']),
            'paired' => $row['paired_at'] !== null, 'paired_at' => $row['paired_at']];
    }

    /**
     * One pairing try: counted first, refused past the limits, then the typed code compared with the registered key's.
     *
     * @return array{spki: string, fingerprint: string}|'wrong_code'|'too_many'|'no_key'|'not_registered'
     */
    public function check(int $account, int $key, string $typed): array|string
    {
        return $this->transaction(function () use ($account, $key, $typed): array|string {
            if (!$this->active($account, $key)) {
                return 'no_key';
            }
            $since = $this->clock->now() - 3600;
            $this->db->prepare('DELETE FROM studio_pair_tries WHERE at <= ?')->execute([$since]);
            $tries = $this->db->prepare('SELECT COUNT(*) FROM studio_pair_tries WHERE account_id = ?');
            $tries->execute([$account]);
            $wrong = $this->db->prepare('SELECT COUNT(*) FROM studio_pair_tries WHERE key_id = ? AND ok = 0');
            $wrong->execute([$key]);
            if ((int) $tries->fetchColumn() >= self::TRIES_PER_ACCOUNT_HOUR || (int) $wrong->fetchColumn() >= self::WRONG_PER_KEY_HOUR) {
                return 'too_many';
            }
            $row = $this->row($account, $key);
            if ($row === null) {
                return 'not_registered';
            }
            $given = self::normalize($typed);
            $ok = $given !== null && hash_equals(self::code($row['fingerprint']), $given);
            $this->db->prepare('INSERT INTO studio_pair_tries (account_id, key_id, at, ok) VALUES (?, ?, ?, ?)')
                ->execute([$account, $key, $this->clock->now(), $ok ? 1 : 0]);
            return $ok ? ['spki' => $row['spki'], 'fingerprint' => $row['fingerprint']] : 'wrong_code';
        });
    }

    /** Marks AI key $key paired to $fingerprint, inside the caller's transaction; false unless it is active and registered that key. */
    public function markPaired(int $account, int $key, string $fingerprint): bool
    {
        $st = $this->db->prepare('UPDATE studio_seal_keys SET paired_at = ? WHERE key_id = ? AND account_id = ? AND fingerprint = ?'
            . ' AND key_id IN (SELECT id FROM studio_keys WHERE account_id = ? AND revoked_at IS NULL)');
        $st->execute([$this->clock->now(), $key, $account, $fingerprint, $account]);
        return $st->rowCount() === 1;
    }

    /** @return list<string> the fingerprints of $account's paired, active AI keys: the AI recipients a note may name */
    public function activeRecipients(int $account): array
    {
        $q = $this->db->prepare('SELECT s.fingerprint FROM studio_seal_keys s JOIN studio_keys k ON k.id = s.key_id'
            . ' WHERE s.account_id = ? AND k.account_id = ? AND k.revoked_at IS NULL AND s.paired_at IS NOT NULL ORDER BY s.key_id');
        $q->execute([$account, $account]);
        return array_values(array_unique(array_map('strval', $q->fetchAll(\PDO::FETCH_COLUMN))));
    }

    /** The fingerprint AI key $key is paired to, or null; for the API's note routes. */
    public function pairedFingerprint(int $account, int $key): ?string
    {
        $row = $this->row($account, $key);
        return $row !== null && $row['paired_at'] !== null ? $row['fingerprint'] : null;
    }

    /** Forgot your passphrase: the new keyring holds no AI key, so none stays paired. Their sealing keys stay registered. */
    public function unpairAll(int $account): void
    {
        $this->db->prepare('UPDATE studio_seal_keys SET paired_at = NULL WHERE account_id = ?')->execute([$account]);
    }

    /** A revoked key's sealing key is forgotten. Inside the caller's transaction when one is open. */
    public static function forget(\PDO $db, int $account, ?int $key = null): void
    {
        if ($key === null) {
            $db->prepare('DELETE FROM studio_seal_keys WHERE account_id = ?')->execute([$account]);
            $db->prepare('DELETE FROM studio_pair_tries WHERE account_id = ?')->execute([$account]);
            return;
        }
        $db->prepare('DELETE FROM studio_seal_keys WHERE key_id = ? AND account_id = ?')->execute([$key, $account]);
    }

    private function active(int $account, int $key): bool
    {
        $q = $this->db->prepare('SELECT 1 FROM studio_keys WHERE id = ? AND account_id = ? AND revoked_at IS NULL');
        $q->execute([$key, $account]);
        return $q->fetchColumn() !== false;
    }

    /** @return array{spki: string, fingerprint: string, paired_at: ?int}|null spki in base64 */
    private function row(int $account, int $key): ?array
    {
        $q = $this->db->prepare('SELECT spki, fingerprint, paired_at FROM studio_seal_keys WHERE key_id = ? AND account_id = ?');
        $q->execute([$key, $account]);
        $r = $q->fetch(\PDO::FETCH_ASSOC);
        return $r === false ? null : ['spki' => (string) $r['spki'], 'fingerprint' => (string) $r['fingerprint'],
            'paired_at' => $r['paired_at'] === null ? null : (int) $r['paired_at']];
    }

    private function transaction(\Closure $work): mixed
    {
        if ($this->db->inTransaction()) {
            return $work();
        }
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $result = $work();
            $this->db->exec('COMMIT');
            return $result;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->exec('ROLLBACK');
            }
            throw $e;
        }
    }
}
