<?php
// Your studio's notes key: changing the passphrase (the same key, re-locked, accepted only when the fingerprints
// match), forgetting it (only the notes and the keyring go), and the mailed one-use link that confirms Forgot and
// Start over: fifteen minutes, spent once, three an hour, bound to its account and address, and a GET that
// deletes nothing.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class StudioKeysTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';
    private const STUDENT = 'student@siue.edu';

    private Music\Pages $pages;
    private Admin\Sessions $sessions;
    private Music\Store $store;
    private Music\Accounts $accounts;
    private Music\AiKeys $aiKeys;
    private Music\Confirmations $confirmations;
    private MemoryMailer $mailer;
    private PDO $db;
    private string $dir;
    private FakeClock $clock;
    private int $account;

    protected function setUp(): void
    {
        [$this->store, $this->db, $this->dir, $this->clock, $this->accounts, $this->account] = music_world(true, self::STUDENT);
        [$this->pages, $this->sessions, , , $this->confirmations, $this->mailer] = music_pages($this->db, $this->dir, $this->clock, self::BASE);
        $this->aiKeys = new Music\AiKeys($this->db, $this->clock);
    }

    private function signedIn(): Admin\Request
    {
        return music_signed_in($this->sessions, $this->account);
    }

    private function post(Admin\Request $as, array $post): Admin\Response
    {
        $post += ['csrf' => $this->sessions->csrf($as)];
        return $this->pages->studioAction(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'post' => $post]));
    }

    private function draft(string $piece = 'ch1-labyrinth', int $v = 1): void
    {
        $this->store->putDraft($piece, $v, ['score.json' => '{"schema":1,"piece":{"id":"' . $piece . '"}}']);
    }

    /** The token in the one mail sent since $before mails, after the queue is flushed. */
    private function mailedToken(int $before = 0): string
    {
        $this->pages->flush();
        self::assertCount($before + 1, $this->mailer->sent);
        $mail = end($this->mailer->sent);
        $text = quoted_printable_decode($mail['mime']);
        self::assertSame(1, preg_match('#https://example\.test/~wgrim/music/confirm\.php\?token=([0-9a-f]{64})#', $text, $m), $text);
        return $m[1];
    }

    private function confirmGet(string $token, array $cookies = []): Admin\Response
    {
        return $this->pages->confirm(req(['https' => true, 'query' => ['token' => $token], 'cookies' => $cookies]));
    }

    /** Opens the link, then presses its button with the mark cookie the page set. */
    private function confirmPost(string $token, ?string $mark = null): Admin\Response
    {
        $page = $this->confirmGet($token);
        self::assertSame(200, $page->status);
        self::assertSame(1, preg_match('/name="mark" value="([0-9a-f]{64})"/', $page->body, $m));
        $cookie = null;
        foreach ($page->cookies as $c) {
            if (preg_match('/^__Secure-studio-act=([0-9a-f]{64});/', $c, $cm) === 1) {
                $cookie = $cm[1];
            }
        }
        self::assertSame($m[1], $cookie, 'the form carries the mark its cookie holds');
        return $this->pages->confirm(req(['https' => true, 'method' => 'POST', 'cookies' => ['__Secure-studio-act' => $cookie],
            'post' => ['token' => $token, 'mark' => $mark ?? $m[1]]]));
    }

    // --- the store ---

    public function testForgetNotesKeyDeletesOnlyNotesAndKeyring(): void
    {
        $this->draft();
        $note = $this->store->addNote(music_sealed())['id'];
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        [$theirs, , $other] = music_store_of($this->db, $this->dir, $this->clock, 'other@siue.edu');
        $theirs->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        $theirNote = $theirs->addNote(music_sealed())['id'];

        self::assertSame(1, $this->store->forgetNotesKey());

        self::assertSame([], $this->store->notes());
        self::assertFileDoesNotExist("{$this->dir}/notes/$note.sealed");
        self::assertNull($this->store->keyring());
        self::assertCount(1, $this->store->drafts(), 'the drafts stay');
        self::assertCount(1, $this->aiKeys->list($this->account), 'the AI keys stay');
        self::assertNotNull($theirs->keyring(), 'another studio is untouched');
        self::assertNotNull($theirs->noteBytes($theirNote));
        self::assertSame($other, $this->accounts->idFor('other@siue.edu'));
    }

    public function testChangeKeyringNeedsTheStoredFingerprints(): void
    {
        $before = $this->store->keyring();
        self::assertSame('mismatch', $this->store->changeKeyring('{"v":2}', MUSIC_FP_PREVIOUS, [MUSIC_FP_CURRENT]), 'another current key');
        self::assertSame('mismatch', $this->store->changeKeyring('{"v":2}', MUSIC_FP_CURRENT, []), 'a previous key dropped');
        self::assertSame('mismatch', $this->store->changeKeyring('{"v":2}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS, str_repeat('ef', 32)]), 'a previous key added');
        self::assertSame($before, $this->store->keyring(), 'nothing changed');
        $this->clock->now += 5;
        self::assertSame('changed', $this->store->changeKeyring('{"v":2}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]));
        $after = $this->store->keyring();
        self::assertSame(['{"v":2}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS], $before['uploaded_at'] + 5], [$after['locked'], $after['current'], $after['previous'], $after['uploaded_at']]);
        $this->store->forgetNotesKey();
        self::assertSame('none', $this->store->changeKeyring('{"v":2}', MUSIC_FP_CURRENT, [MUSIC_FP_PREVIOUS]));
        self::assertNull($this->store->keyring(), 'a change never makes a keyring');
    }

    // --- keyring.php?change=1 ---

    /** A real RSA key as the studio's current notes key: its PEM private key and its fingerprint (SHA-256 of the SPKI DER). */
    private function realKey(): array
    {
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $pem);
        $pub = openssl_pkey_get_details($key)['key'];
        $der = base64_decode(preg_replace('/-----[^-]+-----|\s/', '', $pub));
        $this->store->putKeyring('{"v":1}', hash('sha256', $der), [MUSIC_FP_PREVIOUS]);
        return ['pem' => $pem, 'spki' => base64_encode($der), 'fp' => hash('sha256', $der)];
    }

    /** The upload the page makes: the envelope, the fingerprints, and the proof signed with $pem over this session's tag. */
    private function changeBody(Admin\Request $as, array $key, array $locked, ?string $pem = null, ?string $tag = null, ?string $current = null): string
    {
        $current ??= $key['fp'];
        openssl_sign(Music\Keyring::changeMessage($tag ?? $this->sessions->tag($as, 'music-unlock'), $current, $locked), $sig, $pem ?? $key['pem'], OPENSSL_ALGO_SHA256);
        return (string) json_encode(['keyring' => $locked, 'current' => $current, 'previous' => [MUSIC_FP_PREVIOUS], 'proof' => ['spki' => $key['spki'], 'sig' => base64_encode($sig)]]);
    }

    private function changeKeyring(Admin\Request $as, string $body): Admin\Response
    {
        return $this->pages->keyring(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'query' => ['change' => '1'],
            'headers' => ['x-csrf' => $this->sessions->csrf($as), 'sec-fetch-site' => 'same-origin']]), $body);
    }

    public function testThePageChangesTheKeyringOnlyWithTheSameFingerprints(): void
    {
        $as = $this->signedIn();
        $key = $this->realKey();
        $locked = music_locked_keyring();
        $wrong = $this->changeKeyring($as, $this->changeBody($as, $key, $locked, null, null, MUSIC_FP_CURRENT));
        self::assertSame(409, $wrong->status);
        self::assertSame('key_changed', json_decode($wrong->body, true)['error']);
        self::assertSame('{"v":1}', $this->store->keyring()['locked']);

        self::assertSame(422, $this->changeKeyring($as, '{"keyring":{}}')->status);

        $ok = $this->changeKeyring($as, $this->changeBody($as, $key, $locked));
        self::assertSame(200, $ok->status, $ok->body);
        self::assertTrue(json_decode($ok->body, true)['changed']);
        self::assertSame($locked, json_decode($this->store->keyring()['locked'], true));

        $noCsrf = $this->pages->keyring(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'query' => ['change' => '1'],
            'headers' => ['sec-fetch-site' => 'same-origin']]), $this->changeBody($as, $key, $locked));
        self::assertSame(403, $noCsrf->status);

        $this->store->forgetNotesKey();
        $none = $this->changeKeyring($as, $this->changeBody($as, $key, $locked));
        self::assertSame(404, $none->status);
        self::assertSame('no_keyring', json_decode($none->body, true)['error']);
    }

    /** Knowing the fingerprints (every sealed note's header names the current one) is not enough: only the private key changes the envelope. */
    public function testAChangeNeedsProofOfTheCurrentPrivateKey(): void
    {
        $as = $this->signedIn();
        $key = $this->realKey();
        $locked = music_locked_keyring();
        $refused = function (string $body, string $why) use ($as): void {
            $res = $this->changeKeyring($as, $body);
            self::assertSame(403, $res->status, $why);
            self::assertSame('bad_proof', json_decode($res->body, true)['error'], $why);
            self::assertSame('{"v":1}', $this->store->keyring()['locked'], $why);
        };
        $plain = (string) json_encode(['keyring' => $locked, 'current' => $key['fp'], 'previous' => [MUSIC_FP_PREVIOUS]]);
        $refused($plain, 'no proof');
        $other = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($other, $otherPem);
        $refused($this->changeBody($as, $key, $locked, $otherPem), 'signed by another key');
        $otherDer = base64_decode(preg_replace('/-----[^-]+-----|\s/', '', openssl_pkey_get_details($other)['key']));
        $refused($this->changeBody($as, ['spki' => base64_encode($otherDer)] + $key, $locked, $otherPem), "another key's own SPKI");
        $refused($this->changeBody($as, $key, $locked, null, str_repeat('0', 64)), "another session's tag");
        $body = json_decode($this->changeBody($as, $key, $locked), true);
        $body['keyring']['ct'] = base64_encode(random_bytes(2400));
        $refused((string) json_encode($body), 'signed over another envelope');
        $body = json_decode($this->changeBody($as, $key, $locked), true);
        $body['proof']['extra'] = 1;
        self::assertSame(422, $this->changeKeyring($as, (string) json_encode($body))->status, 'a proof with more fields is malformed');
        self::assertSame('{"v":1}', $this->store->keyring()['locked']);
    }

    public function testAPlainKeyringPostStillNeverReplacesOne(): void
    {
        $as = $this->signedIn();
        $res = $this->pages->keyring(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies,
            'headers' => ['x-csrf' => $this->sessions->csrf($as), 'sec-fetch-site' => 'same-origin']]),
            (string) json_encode(['keyring' => music_locked_keyring(), 'current' => MUSIC_FP_CURRENT, 'previous' => [MUSIC_FP_PREVIOUS]]));
        self::assertSame(409, $res->status);
        self::assertSame('{"v":1}', $this->store->keyring()['locked']);
    }

    // --- Your studio ---

    public function testTheStudioPageOffersChangeAndForgotWhenThereIsAKey(): void
    {
        $res = $this->pages->studio($this->signedIn());
        self::assertStringContainsString('data-change-passphrase', $res->body);
        self::assertStringContainsString('<meta name="csrf" content="', $res->body);
        self::assertStringContainsString('<script type="module" src="../games/workroom/dist/workroom.js?v=0123456789"></script>', $res->body);
        self::assertStringContainsString('<h2>Forgot your passphrase?</h2>', $res->body);
        self::assertStringContainsString('name="action" value="forgot-passphrase"', $res->body);
        self::assertStringContainsString('Your pieces, drafts and AI keys stay.', $res->body);
        self::assertStringContainsString('name="action" value="start-over"', $res->body);
        self::assertStringNotContainsString('Type start over', $res->body, 'the mailed link is the confirmation');

        $this->store->forgetNotesKey();
        $none = $this->pages->studio($this->signedIn());
        self::assertStringNotContainsString('data-change-passphrase', $none->body);
        self::assertStringNotContainsString('value="forgot-passphrase"', $none->body);
        self::assertStringContainsString('name="action" value="start-over"', $none->body);
    }

    public function testChangedSaysSo(): void
    {
        $res = $this->pages->studio(music_signed_in($this->sessions, $this->account, ['query' => ['changed' => 'passphrase']]));
        self::assertStringContainsString('role="status">Your passphrase is changed. Unlock your notes with the new one.</p>', $res->body);
    }

    public function testForgotMailsALinkAndDeletesNothing(): void
    {
        $note = $this->store->addNote(music_sealed())['id'];
        $as = $this->signedIn();
        $res = $this->post($as, ['action' => 'forgot-passphrase']);
        self::assertSame(200, $res->status);
        self::assertStringContainsString('We emailed a link to ' . self::STUDENT . '.', $res->body);
        self::assertSame([], $this->mailer->sent, 'the mail goes after the reply');
        $token = $this->mailedToken();
        $mail = $this->mailer->sent[0];
        self::assertSame(self::STUDENT, $mail['to']);
        self::assertSame('Confirm: delete your notes and notes key', $mail['subject']);
        $text = quoted_printable_decode($mail['mime']);
        self::assertStringContainsString('Good for 15 minutes, once.', $text);
        self::assertStringContainsString('Nothing is deleted until you press the button on that page.', $text);
        self::assertStringContainsString('Content-Type: text/plain', $mail['mime']);
        self::assertStringContainsString('Content-Type: text/html', $mail['mime']);
        self::assertNotNull($this->store->noteBytes($note));
        self::assertNotNull($this->store->keyring());
        self::assertSame(1, (int) $this->db->query('SELECT COUNT(*) FROM studio_confirms')->fetchColumn());
        self::assertSame(hash('sha256', $token), $this->db->query('SELECT token_hash FROM studio_confirms')->fetchColumn(), 'only the hash is stored');
    }

    public function testStudioActionsNeedCsrf(): void
    {
        $as = $this->signedIn();
        foreach (['forgot-passphrase', 'start-over'] as $action) {
            self::assertSame(403, $this->post($as, ['action' => $action, 'csrf' => ''])->status);
        }
        $this->pages->flush();
        self::assertSame([], $this->mailer->sent);
    }

    public function testForgotWithNoKeyMailsNothing(): void
    {
        $this->store->forgetNotesKey();
        $res = $this->post($this->signedIn(), ['action' => 'forgot-passphrase']);
        self::assertSame(409, $res->status);
        self::assertStringContainsString('You have no notes key, so there is nothing to forget.', $res->body);
        $this->pages->flush();
        self::assertSame([], $this->mailer->sent);
    }

    public function testThreeLinksAnHour(): void
    {
        $as = $this->signedIn();
        foreach (['forgot-passphrase', 'start-over', 'forgot-passphrase'] as $action) {
            self::assertSame(200, $this->post($as, ['action' => $action])->status);
        }
        $res = $this->post($as, ['action' => 'start-over']);
        self::assertSame(429, $res->status);
        self::assertStringContainsString('You asked for three links in the last hour.', $res->body);
        $this->pages->flush();
        self::assertCount(3, $this->mailer->sent);
        $this->clock->now += 3601;
        self::assertSame(200, $this->post($as, ['action' => 'start-over'])->status);
    }

    public function testAFailedMailDeletesItsLink(): void
    {
        $this->mailer->fail = true;
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $this->pages->flush();
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM studio_confirms')->fetchColumn());
    }

    // --- confirm.php ---

    public function testGetShowsWhatGoesAndDeletesNothing(): void
    {
        $this->draft('ch1-labyrinth', 1);
        $this->draft('ch1-labyrinth', 2);
        $this->draft('ch2-sea', 1);
        $this->store->addNote(music_sealed());
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $this->post($this->signedIn(), ['action' => 'forgot-passphrase']);
        $token = $this->mailedToken();

        foreach ([[], ['__Secure-studio-act' => str_repeat('a', 64)]] as $cookies) {
            $page = $this->confirmGet($token, $cookies);
            self::assertSame(200, $page->status);
            self::assertStringContainsString('<h1>Delete your notes and notes key?</h1>', $page->body);
            self::assertStringContainsString('<li>Every note in your studio: 1 note</li>', $page->body);
            self::assertStringContainsString('<li>Your notes key</li>', $page->body);
            self::assertStringContainsString('Your pieces (2 pieces, 3 drafts) and your AI keys (1 AI key) stay.', $page->body);
            self::assertStringContainsString('<form method="post" action="confirm.php">', $page->body);
            self::assertSame(1, substr_count($page->body, '<button'), 'one button');
            self::assertStringContainsString('>Delete my notes and notes key</button>', $page->body);
        }
        self::assertCount(1, $this->store->notes(), 'a GET deletes nothing');
        self::assertNotNull($this->store->keyring());
        self::assertNull($this->db->query('SELECT used_at FROM studio_confirms')->fetchColumn(), 'and spends nothing');
    }

    public function testTheStartOverPageNamesEverything(): void
    {
        $this->draft();
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $page = $this->confirmGet($this->mailedToken());
        self::assertStringContainsString('<h1>Start over?</h1>', $page->body);
        self::assertStringContainsString('<li>Every piece and draft: 1 piece, 1 draft</li>', $page->body);
        self::assertStringContainsString('<li>Every note: 0 notes</li>', $page->body);
        self::assertStringContainsString('<li>Your notes key</li>', $page->body);
        self::assertStringContainsString('<li>Your AI keys: 0 AI keys</li>', $page->body);
        self::assertStringContainsString('Your account and your sign-in stay.', $page->body);
        self::assertStringContainsString('>Delete everything in my studio</button>', $page->body);
        self::assertSame('Confirm: start over in your music studio', $this->mailer->sent[0]['subject']);
    }

    public function testThePostForgetsTheKeyAndKeepsThePieces(): void
    {
        $this->draft();
        $this->store->addNote(music_sealed());
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $this->post($this->signedIn(), ['action' => 'forgot-passphrase']);
        $token = $this->mailedToken();

        $done = $this->confirmPost($token);
        self::assertSame(200, $done->status);
        self::assertStringContainsString('Your notes and your notes key are deleted.', $done->body);
        self::assertStringContainsString('href="index.php"', $done->body);
        self::assertSame([], $this->store->notes());
        self::assertNull($this->store->keyring());
        self::assertCount(1, $this->store->drafts());
        self::assertCount(1, $this->aiKeys->list($this->account));
        $index = $this->pages->index($this->signedIn());
        self::assertStringContainsString('data-account-has-key="0"', $index->body, 'the pieces page asks for a new key');

        self::assertSame(403, $this->confirmGet($token)->status, 'spent once');
    }

    public function testThePostStartsOver(): void
    {
        $this->draft();
        $this->aiKeys->create($this->account, 'claude', ['notes:pickup']);
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $done = $this->confirmPost($this->mailedToken());
        self::assertSame(200, $done->status);
        self::assertStringContainsString('Your studio is empty.', $done->body);
        self::assertSame([], $this->store->drafts());
        self::assertNull($this->store->keyring());
        self::assertSame([], $this->aiKeys->list($this->account));
        self::assertSame($this->account, $this->accounts->idFor(self::STUDENT), 'the account stays');
    }

    public function testThePostNeedsTheMark(): void
    {
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $token = $this->mailedToken();
        $res = $this->confirmPost($token, str_repeat('b', 64));
        self::assertSame(403, $res->status);
        $none = $this->pages->confirm(req(['https' => true, 'method' => 'POST', 'post' => ['token' => $token, 'mark' => str_repeat('b', 64)]]));
        self::assertSame(403, $none->status, 'no cookie');
        self::assertNotNull($this->store->keyring(), 'nothing was deleted');
        self::assertNull($this->db->query('SELECT used_at FROM studio_confirms')->fetchColumn(), 'the link is not spent');
    }

    public function testALinkLastsFifteenMinutes(): void
    {
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $token = $this->mailedToken();
        $this->clock->now += 901;
        $res = $this->confirmGet($token);
        self::assertSame(403, $res->status);
        self::assertStringContainsString('This link has expired or was already used.', $res->body);
        self::assertNotNull($this->store->keyring());
    }

    public function testUsingOneLinkSpendsTheOthers(): void
    {
        $as = $this->signedIn();
        $this->post($as, ['action' => 'forgot-passphrase']);
        $forgot = $this->mailedToken();
        $this->post($as, ['action' => 'start-over']);
        $startOver = $this->mailedToken(1);
        $this->confirmPost($forgot);
        self::assertSame(403, $this->confirmGet($startOver)->status);
    }

    public function testALinkIsBoundToItsAccountAndAddress(): void
    {
        $this->post($this->signedIn(), ['action' => 'start-over']);
        $token = $this->mailedToken();
        $this->accounts->remove($this->account);
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM studio_confirms')->fetchColumn(), 'removing the account deletes its links');

        // A row whose account now has another address (an id handed out again) is refused.
        $other = (int) $this->accounts->signIn('other@siue.edu');
        $this->db->prepare('INSERT INTO studio_confirms (token_hash, account_id, email, action, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
            ->execute([hash('sha256', $token), $other, self::STUDENT, 'start-over', $this->clock->now, $this->clock->now + 900]);
        self::assertSame(403, $this->confirmGet($token)->status);
        self::assertNull($this->confirmations->consume($token));
    }

    public function testMalformedTokensAreRefused(): void
    {
        foreach (['', 'abc', str_repeat('g', 64), str_repeat('a', 65)] as $token) {
            self::assertSame(403, $this->confirmGet($token)->status, $token);
        }
        self::assertSame(403, $this->pages->confirm(req(['https' => true, 'query' => ['token' => ['x']]]))->status);
    }
}
