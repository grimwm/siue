<?php
// An AI's sealing key and its pairing: the MCP registers an RSA-4096 public key through its AI key; the person types
// the code made from its fingerprint on Your studio, which the server counts and limits; only a keyring the browser
// locked again with the current key's proof pairs the key; SIUEN2 notes name the person and the paired AI keys, and
// an AI key lists only the notes sealed to its own key. Revoking, Forgot your passphrase and Start over undo it.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicPairingTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';
    private const STUDENT = 'student@siue.edu';

    /** @var array{pem: string, der: string, fp: string}|null one RSA-4096 key for every test (they are slow to make) */
    private static ?array $ai = null;
    /** @var array{pem: string, der: string, fp: string}|null */
    private static ?array $other = null;

    private Music\Pages $pages;
    private Admin\Sessions $sessions;
    private Music\Store $store;
    private Music\Accounts $accounts;
    private Music\AiKeys $aiKeys;
    private Music\Pairing $pairing;
    private Music\Api $api;
    private Closure $storeFor;
    private PDO $db;
    private string $dir;
    private FakeClock $clock;
    private int $account;
    /** @var array{pem: string, spki: string, fp: string} the person's current notes key */
    private array $person;

    public static function rsa(int $bits = 4096): array
    {
        $key = openssl_pkey_new(['private_key_bits' => $bits, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $pem);
        $der = base64_decode(preg_replace('/-----[^-]+-----|\s/', '', openssl_pkey_get_details($key)['key']));
        return ['pem' => $pem, 'der' => $der, 'fp' => hash('sha256', $der)];
    }

    protected function setUp(): void
    {
        self::$ai ??= self::rsa();
        self::$other ??= self::rsa();
        [$this->store, $this->db, $this->dir, $this->clock, $this->accounts, $this->account] = music_world(false, self::STUDENT);
        [$this->pages, $this->sessions, $this->storeFor] = music_pages($this->db, $this->dir, $this->clock, self::BASE);
        $this->aiKeys = new Music\AiKeys($this->db, $this->clock);
        $this->pairing = new Music\Pairing($this->db, $this->clock);
        $this->api = new Music\Api($this->storeFor, new Music\KeyGate($this->db, $this->clock, new Admin\Keys($this->db, $this->clock, null, self::BASE), $this->accounts, self::BASE), ['cello']);
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $pem);
        $der = base64_decode(preg_replace('/-----[^-]+-----|\s/', '', openssl_pkey_get_details($key)['key']));
        $this->person = ['pem' => $pem, 'spki' => base64_encode($der), 'fp' => hash('sha256', $der)];
        $this->store->putKeyring((string) json_encode(music_locked_keyring()), $this->person['fp'], [MUSIC_FP_PREVIOUS]);
    }

    private function key(int $account, array $scopes = ['notes:pickup', 'drafts:publish', 'drafts:delete']): array
    {
        $secret = $this->aiKeys->create($account, 'my assistant', $scopes);
        $id = (int) $this->db->query('SELECT MAX(id) FROM studio_keys')->fetchColumn();
        return [$secret, $id];
    }

    private function asKey(string $secret, array $over = []): Admin\Request
    {
        $headers = ['authorization' => "Bearer $secret"] + ($over['headers'] ?? []);
        unset($over['headers']);
        return req(array_replace(['https' => true, 'method' => 'GET', 'headers' => $headers], $over));
    }

    private function register(string $secret, string $der): Admin\Response
    {
        $body = (string) json_encode(['spki' => base64_encode($der)]);
        return $this->api->sealKey($this->asKey($secret, ['method' => 'POST', 'headers' => ['content-length' => (string) strlen($body)]]), fn(int $n): string => substr($body, 0, $n));
    }

    private function json(Admin\Response $r): array
    {
        return json_decode($r->body, true, flags: JSON_THROW_ON_ERROR);
    }

    private function signedIn(): Admin\Request
    {
        return music_signed_in($this->sessions, $this->account);
    }

    private function data(Admin\Request $as, string $method, array $over = []): Admin\Request
    {
        return req(array_replace(['https' => true, 'method' => $method, 'cookies' => $as->cookies,
            'headers' => ['x-csrf' => $this->sessions->csrf($as), 'sec-fetch-site' => 'same-origin']], $over));
    }

    private function pairBody(Admin\Request $as, int $key, string $code, string $fp, ?array $locked = null): string
    {
        $locked ??= music_locked_keyring();
        openssl_sign(Music\Keyring::changeMessage($this->sessions->tag($as, 'music-unlock'), $this->person['fp'], $locked), $sig, $this->person['pem'], OPENSSL_ALGO_SHA256);
        return (string) json_encode(['keyring' => $locked, 'current' => $this->person['fp'], 'previous' => [MUSIC_FP_PREVIOUS],
            'proof' => ['spki' => $this->person['spki'], 'sig' => base64_encode($sig)], 'pair' => ['key' => $key, 'code' => $code, 'fingerprint' => $fp]]);
    }

    /** Pairs $key through the page as the browser does: the code first, then the keyring. */
    private function pairThroughThePage(int $key): void
    {
        $as = $this->signedIn();
        $code = Music\Pairing::code(self::$ai['fp']);
        $found = $this->pages->pair($this->data($as, 'POST'), (string) json_encode(['key' => $key, 'code' => $code]));
        self::assertSame(200, $found->status, $found->body);
        $done = $this->pages->keyring($this->data($as, 'POST', ['query' => ['pair' => '1']]), $this->pairBody($as, $key, $code, self::$ai['fp']));
        self::assertSame(200, $done->status, $done->body);
    }

    public function testTheCodeIsTheFirstSixtyBitsOfTheFingerprintInCrockfordBase32(): void
    {
        self::assertSame('BH16-EYT6-88ZR', Music\Pairing::code(hash('sha256', 'siue')));
        self::assertSame('8ZCB-THM7-F0RW', Music\Pairing::code(hash('sha256', 'pair')));
        self::assertSame('0000-0000-0000', Music\Pairing::code(str_repeat('0', 64)));
        self::assertSame('ZZZZ-ZZZZ-ZZZZ', Music\Pairing::code(str_repeat('f', 64)));
    }

    public function testATypedCodeIgnoresCaseSpacesAndHyphensAndReadsLookalikes(): void
    {
        self::assertSame('BH16-EYT6-88ZR', Music\Pairing::normalize(' bh16 eyt6-88zr '));
        self::assertSame('BH16-EYT6-88ZR', Music\Pairing::normalize('BHI6EYT688ZR'));
        self::assertSame('0000-1111-0000', Music\Pairing::normalize('OOOO-IlIL-oooo'));
        self::assertNull(Music\Pairing::normalize('BH16-EYT6-88Z'));
        self::assertNull(Music\Pairing::normalize('BH16-EYT6-88ZU'), 'U is not in the alphabet');
        self::assertNull(Music\Pairing::normalize(''));
    }

    public function testOnlyACanonicalRsa4096KeyWithExponent65537IsASealingKey(): void
    {
        self::assertTrue(Music\Pairing::validSpki(self::$ai['der']));
        self::assertFalse(Music\Pairing::validSpki(self::rsa(2048)['der']), 'RSA-2048');
        self::assertStringEndsWith("\x02\x03\x01\x00\x01", self::$ai['der']);
        self::assertFalse(Music\Pairing::validSpki(substr(self::$ai['der'], 0, -5) . "\x02\x03\x01\x00\x03"), 'exponent 65539');
        self::assertFalse(Music\Pairing::validSpki(self::$ai['der'] . "\0"), 'trailing bytes');
        self::assertFalse(Music\Pairing::validSpki('not a key'));
    }

    public function testTheMcpRegistersItsKeyAndReadsItsStatus(): void
    {
        [$secret, $id] = $this->key($this->account);
        $before = $this->api->sealKey($this->asKey($secret), fn(): string => '');
        self::assertSame(200, $before->status);
        self::assertSame(['label' => 'my assistant', 'scopes' => ['notes:pickup', 'drafts:publish', 'drafts:delete'], 'sealing' => null], $this->json($before));

        self::assertSame(200, $this->register($secret, self::$ai['der'])->status);
        $status = $this->json($this->api->sealKey($this->asKey($secret), fn(): string => ''))['sealing'];
        self::assertSame(self::$ai['fp'], $status['fingerprint']);
        self::assertSame(Music\Pairing::code(self::$ai['fp']), $status['code']);
        self::assertFalse($status['paired']);
        self::assertSame(200, $this->register($secret, self::$ai['der'])->status, 'the same key again');
        self::assertSame(200, $this->register($secret, self::$other['der'])->status, 'an unpaired key may be replaced');
        self::assertSame(self::$other['fp'], $this->pairing->status($this->account, $id)['fingerprint']);

        self::assertSame(422, $this->register($secret, self::rsa(2048)['der'])->status);
        [$noRead] = $this->key($this->account, ['drafts:publish']);
        self::assertSame(403, $this->register($noRead, self::$ai['der'])->status, 'registering needs read notes');
        self::assertSame(200, $this->api->sealKey($this->asKey($noRead), fn(): string => '')->status, 'any AI key reads its status');
        self::assertSame(401, $this->api->sealKey($this->asKey(str_repeat('9', 64)), fn(): string => '')->status);
    }

    public function testAPairedKeyRefusesAnotherSealingKey(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $this->pairThroughThePage($id);
        $res = $this->register($secret, self::$other['der']);
        self::assertSame(409, $res->status);
        self::assertSame('paired', $this->json($res)['error']);
        self::assertTrue($this->pairing->status($this->account, $id)['paired']);
    }

    public function testPairingTriesAreCountedAndLimited(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $code = Music\Pairing::code(self::$ai['fp']);
        for ($i = 0; $i < Music\Pairing::WRONG_PER_KEY_HOUR; $i++) {
            self::assertSame('wrong_code', $this->pairing->check($this->account, $id, 'AAAA-AAAA-AAAA'));
        }
        self::assertSame('too_many', $this->pairing->check($this->account, $id, $code), 'the sixth try within the hour, even the right code');
        $this->clock->now += 3601;
        self::assertIsArray($this->pairing->check($this->account, $id, $code), 'an hour later it is allowed again');

        [$secret2, $id2] = $this->key($this->account);
        $this->register($secret2, self::$ai['der']);
        for ($i = 0; $i < Music\Pairing::TRIES_PER_ACCOUNT_HOUR - 1; $i++) {
            self::assertIsArray($this->pairing->check($this->account, $id2, $code));
        }
        self::assertSame('too_many', $this->pairing->check($this->account, $id2, $code), 'twenty tries an hour per studio');
    }

    public function testACodeOnlyPairsTheStudiosOwnRegisteredActiveKey(): void
    {
        [$secret, $id] = $this->key($this->account);
        self::assertSame('not_registered', $this->pairing->check($this->account, $id, 'AAAA-AAAA-AAAA'));
        $other = (int) $this->accounts->signIn('someone@siue.edu');
        [$theirs, $theirId] = $this->key($other);
        $this->register($theirs, self::$ai['der']);
        self::assertSame('no_key', $this->pairing->check($this->account, $theirId, Music\Pairing::code(self::$ai['fp'])));
        $this->register($secret, self::$ai['der']);
        $this->aiKeys->revoke($this->account, $id);
        self::assertSame('no_key', $this->pairing->check($this->account, $id, Music\Pairing::code(self::$ai['fp'])));
    }

    public function testThePageRefusesAWrongCodeAndPairsOnlyWithTheKeyringAndItsProof(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $as = $this->signedIn();
        $wrong = $this->pages->pair($this->data($as, 'POST'), (string) json_encode(['key' => $id, 'code' => 'AAAA-AAAA-AAAA']));
        self::assertSame(422, $wrong->status);
        self::assertSame('wrong_code', $this->json($wrong)['error']);
        self::assertArrayHasKey('csrf', $this->json($wrong));

        $code = Music\Pairing::code(self::$ai['fp']);
        $right = $this->json($this->pages->pair($this->data($as, 'POST'), (string) json_encode(['key' => $id, 'code' => $code])));
        self::assertSame(base64_encode(self::$ai['der']), $right['spki']);
        self::assertSame(self::$ai['fp'], $right['fingerprint']);
        self::assertFalse($this->pairing->status($this->account, $id)['paired'], 'checking the code pairs nothing');

        $before = $this->store->keyring()['locked'];
        $badCode = $this->pages->keyring($this->data($as, 'POST', ['query' => ['pair' => '1']]), $this->pairBody($as, $id, 'AAAA-AAAA-AAAA', self::$ai['fp']));
        self::assertSame(422, $badCode->status);
        $otherFp = $this->pages->keyring($this->data($as, 'POST', ['query' => ['pair' => '1']]), $this->pairBody($as, $id, $code, self::$other['fp']));
        self::assertSame(409, $otherFp->status, 'the fingerprint named must be the registered key');
        $body = json_decode($this->pairBody($as, $id, $code, self::$ai['fp']), true);
        $body['proof']['sig'] = base64_encode(str_repeat("\1", 256));
        self::assertSame(403, $this->pages->keyring($this->data($as, 'POST', ['query' => ['pair' => '1']]), (string) json_encode($body))->status, 'a bad proof');
        self::assertSame($before, $this->store->keyring()['locked']);
        self::assertSame([], $this->pairing->activeRecipients($this->account));

        $locked = music_locked_keyring();
        $ok = $this->pages->keyring($this->data($as, 'POST', ['query' => ['pair' => '1']]), $this->pairBody($as, $id, $code, self::$ai['fp'], $locked));
        self::assertSame(200, $ok->status, $ok->body);
        self::assertSame($locked, json_decode($this->store->keyring()['locked'], true));
        self::assertSame([self::$ai['fp']], $this->pairing->activeRecipients($this->account));
        $got = $this->json($this->pages->keyring(req(['https' => true, 'cookies' => $as->cookies, 'headers' => ['sec-fetch-site' => 'same-origin']])));
        self::assertSame([self::$ai['fp']], $got['ai'], 'the page learns which AI keys are still active');
    }

    public function testSiuen2NotesNameThePersonAndPairedAiKeysOnly(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['fp'] === '' ? '' : self::$ai['der']);
        $ai = [self::$ai['fp']];
        $person = $this->person['fp'];
        $reason = function (string $bundle, array $recipients) {
            try {
                $this->store->addNote($bundle, $recipients);
                return 'stored';
            } catch (Music\NoteRejected $e) {
                return $e->reason;
            }
        };
        self::assertSame('unknown_key', $reason(music_sealed2([$person, self::$ai['fp']]), []), 'not paired yet');
        self::assertSame('stored', $reason(music_sealed2([$person, self::$ai['fp']]), $ai));
        self::assertSame('stored', $reason(music_sealed2([$person]), $ai));
        self::assertSame('unknown_key', $reason(music_sealed2([self::$ai['fp']]), $ai), 'the person must be a recipient');
        self::assertSame('unknown_key', $reason(music_sealed2([$person, self::$other['fp']]), $ai));
        self::assertSame('bad_header', $reason(music_sealed2([$person, $person]), $ai), 'a repeated recipient');
        self::assertSame('bad_header', $reason(substr(music_sealed2([$person, self::$ai['fp']]), 0, 600), $ai), 'cut short');
        self::assertSame('bad_header', $reason('SIUEN2' . chr(0) . random_bytes(64), $ai));
        self::assertSame('stored', $reason(music_sealed($person), $ai), 'SIUEN1 still goes in');
    }

    public function testAnAiKeyListsReadsAndMarksOnlyTheNotesSealedToItsPairedKey(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $older = $this->store->addNote(music_sealed($this->person['fp']));
        $unpaired = $this->api->listNotes($this->asKey($secret, ['query' => ['state' => 'waiting']]));
        self::assertSame(['notes' => []], $this->json($unpaired), 'before pairing no note is sealed to it');

        $this->pairThroughThePage($id);
        $both = $this->store->addNote(music_sealed2([$this->person['fp'], self::$ai['fp']]), $this->pairing->activeRecipients($this->account));
        $listed = $this->json($this->api->listNotes($this->asKey($secret, ['query' => ['state' => 'waiting']])))['notes'];
        self::assertSame([$both['id']], array_column($listed, 'id'), 'only the note sealed after pairing');
        self::assertSame(404, $this->api->getNote($this->asKey($secret, ['query' => ['id' => $older['id']]]))->status);
        self::assertSame(200, $this->api->getNote($this->asKey($secret, ['query' => ['id' => $both['id']]]))->status);
        self::assertSame(404, $this->api->pickedUp($this->asKey($secret, ['method' => 'POST', 'query' => ['id' => $older['id']]]))->status);
        self::assertSame(200, $this->api->pickedUp($this->asKey($secret, ['method' => 'POST', 'query' => ['id' => $both['id']]]))->status);
        self::assertNull($this->store->notes('waiting')[0]['picked_up_at'] ?? null);
        self::assertSame([$older['id']], array_column($this->store->notes('waiting'), 'id'), 'the older note still waits for the person');
    }

    public function testRevokingForgetsTheSealingKeySoNewNotesCannotNameIt(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $this->pairThroughThePage($id);
        $this->aiKeys->revoke($this->account, $id);
        self::assertSame([], $this->pairing->activeRecipients($this->account));
        self::assertNull($this->pairing->status($this->account, $id));
        $this->expectExceptionObject(new Music\NoteRejected('unknown_key'));
        $this->store->addNote(music_sealed2([$this->person['fp'], self::$ai['fp']]), $this->pairing->activeRecipients($this->account));
    }

    public function testForgotYourPassphraseUnpairsAndStartOverForgetsTheSealingKeys(): void
    {
        [$secret, $id] = $this->key($this->account);
        $this->register($secret, self::$ai['der']);
        $this->pairThroughThePage($id);
        $this->store->forgetNotesKey();
        $status = $this->pairing->status($this->account, $id);
        self::assertFalse($status['paired'], 'the new keyring will hold no AI key');
        self::assertSame(self::$ai['fp'], $status['fingerprint'], 'the same code pairs it again');
        $this->accounts->startOver($this->account);
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM studio_seal_keys')->fetchColumn());
    }

    public function testYourStudioShowsEachKeysPairing(): void
    {
        [$secret, $id] = $this->key($this->account);
        [, $publishOnly] = $this->key($this->account, ['drafts:publish']);
        $page = fn(): string => $this->pages->studio(req(['https' => true, 'cookies' => $this->signedIn()->cookies, 'headers' => ['sec-fetch-dest' => 'document', 'sec-fetch-mode' => 'navigate']]))->body;
        self::assertStringContainsString('data-pairing="none"', $page());
        $this->register($secret, self::$ai['der']);
        self::assertStringContainsString('data-pair-ai="' . $id . '"', $page());
        self::assertStringNotContainsString('data-pair-ai="' . $publishOnly . '"', $page(), 'a key that cannot read notes has nothing to pair');
        $this->pairThroughThePage($id);
        self::assertStringContainsString('data-pairing="paired"', $page());
    }
}
