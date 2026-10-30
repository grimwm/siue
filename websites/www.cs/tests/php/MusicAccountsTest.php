<?php
// Accounts: one per address, made at the first sign-in; a new address that is not named is refused once
// the studio has max_accounts accounts or the shared pool is full; usage is stored bytes of drafts and notes.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicAccountsTest extends TestCase
{
    private function accounts(string $people = '{}', ?PDO $db = null, ?FakeClock $clock = null): Music\Accounts
    {
        return new Music\Accounts($db ?? admin_tmp_db(), $clock ?? new FakeClock(1_800_000_000), Admin\People::fromJson($people));
    }

    public function testSignInCreatesOneAccountPerAddress(): void
    {
        $db = admin_tmp_db();
        $clock = new FakeClock(1_800_000_000);
        $a = $this->accounts('{}', $db, $clock);
        $first = $a->signIn('student@siue.edu');
        self::assertIsInt($first);
        $clock->now += 60;
        self::assertSame($first, $a->signIn('student@siue.edu'), 'the same address is the same account');
        self::assertNotSame($first, $a->signIn('other@siue.edu'));
        self::assertSame($first, $a->idFor('student@siue.edu'));
        self::assertNull($a->idFor('nobody@siue.edu'));
        self::assertSame('student@siue.edu', $a->emailOf($first));
        self::assertNull($a->emailOf(999));
        $row = $db->query("SELECT created_at, last_sign_in_at FROM accounts WHERE email = 'student@siue.edu'")->fetch(PDO::FETCH_ASSOC);
        self::assertSame([1_800_000_000, 1_800_000_060], [(int) $row['created_at'], (int) $row['last_sign_in_at']], 'created once, stamped at every sign-in');
        self::assertSame(2, (int) $db->query('SELECT COUNT(*) FROM accounts')->fetchColumn());
    }

    public function testANewAddressIsRefusedOnceMaxAccountsIsReached(): void
    {
        $a = $this->accounts('{"max_accounts": 2}');
        self::assertIsInt($a->signIn('a@siue.edu'));
        self::assertIsInt($a->signIn('b@siue.edu'));
        self::assertNull($a->signIn('c@siue.edu'), 'the studio is full');
        self::assertNull($a->idFor('c@siue.edu'), 'no account was made');
        self::assertIsInt($a->signIn('a@siue.edu'), 'an existing account still signs in');
    }

    public function testANewAddressIsRefusedOnceTheSharedPoolIsFull(): void
    {
        [, $db, , $clock, , $id] = music_world(false, 'a@siue.edu', '{"max_shared_bytes": 1000}');
        $a = new Music\Accounts($db, $clock, Admin\People::fromJson('{"max_shared_bytes": 1000}'));
        $db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (?, ?, ?, ?, ?)')->execute([$id, 'p', 1, 1, 999]);
        self::assertIsInt($a->signIn('b@siue.edu'), '999 of 1000 bytes: room for one more account');
        $db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (?, ?, ?, ?, ?)')->execute([$id, 'p', 2, 2, 1]);
        self::assertNull($a->signIn('c@siue.edu'), '1000 of 1000 bytes: the studio is full');
        self::assertIsInt($a->signIn('b@siue.edu'), 'an existing account still signs in');
    }

    public function testNamedPeopleSignUpWhenFull(): void
    {
        $a = $this->accounts('{"max_accounts": 1, "people": [{"email": "named@siue.edu"}]}');
        self::assertIsInt($a->signIn('a@siue.edu'));
        self::assertNull($a->signIn('b@siue.edu'));
        self::assertIsInt($a->signIn('named@siue.edu'), 'a named person is never refused');
        self::assertIsInt($a->signIn(Admin\Auth::OWNER), 'nor is the owner');
        self::assertSame(3, count($a->list()));
    }

    public function testUsageCountsStoredDraftBytesAndSealedNotes(): void
    {
        [$s, , , , $a, $id] = music_world(true, 'student@siue.edu');
        self::assertSame(0, $a->usage($id));
        $score = json_encode(['notes' => array_fill(0, 200, ['pitch' => 60, 'at' => 0])]);
        $s->putDraft('p', 1, ['score.json' => $score]);
        $stored = strlen(gzencode($score, 9));
        self::assertLessThan(strlen($score), $stored);
        self::assertSame($stored, $a->usage($id), 'a score counts as its stored, compressed bytes');
        $note = music_sealed(MUSIC_FP_CURRENT, 500);
        $s->addNote($note);
        self::assertSame($stored + strlen($note), $a->usage($id), 'sealed notes count whole');
        $other = $a->signIn('other@siue.edu');
        self::assertSame(0, $a->usage($other));
    }

    public function testSharedUsageLeavesOutTheAllowance(): void
    {
        $people = '{"people": [{"email": "big@siue.edu", "allowance": true}, {"email": "named@siue.edu"}]}';
        [, $db, , $clock] = music_world(false, 'student@siue.edu', $people);
        $a = new Music\Accounts($db, $clock, Admin\People::fromJson($people));
        $add = $db->prepare('INSERT INTO music_drafts (account_id, piece, version, published_at, size) VALUES (?, ?, ?, ?, ?)');
        foreach (['student@siue.edu' => 10, 'named@siue.edu' => 20, 'big@siue.edu' => 400, Admin\Auth::OWNER => 800] as $email => $size) {
            $add->execute([$a->signIn($email), 'p', 1, 1, $size]);
        }
        self::assertSame(30, $a->sharedUsage(), 'the owner and big@ have the allowance; named@ without it shares the pool');
        $list = $a->list();
        self::assertSame(['student@siue.edu', 'named@siue.edu', 'big@siue.edu', Admin\Auth::OWNER], array_column($list, 'email'));
        self::assertSame([10, 20, 400, 800], array_column($list, 'usage'));
        self::assertSame([false, true, true, true], array_column($list, 'named'));
        self::assertSame(1_800_000_000, $list[0]['last_sign_in_at']);
    }

    public function testOwnerIdMakesTheOwnersAccountOnce(): void
    {
        $db = admin_tmp_db();
        $a = $this->accounts('{}', $db);
        $id = $a->ownerId();
        self::assertSame($id, $a->ownerId());
        self::assertSame(Admin\Auth::OWNER, $a->emailOf($id));
        self::assertNull($db->query('SELECT last_sign_in_at FROM accounts')->fetchColumn(), 'making the account is not a sign-in');
    }

    /** Removal is one transaction: when its last step fails, the wipe, the sessions and the AI keys come back too. */
    public function testRemoveIsOneTransaction(): void
    {
        [$store, $db, , $clock, $accounts, $id] = music_world(true, 'student@siue.edu');
        $store->putDraft('piece', 1, ['score.json' => '{"schema":1}']);
        $store->addNote(music_sealed());
        (new Music\AiKeys($db, $clock))->create($id, 'ai', ['drafts:publish']);
        $db->prepare('INSERT INTO studio_sessions (id_hash, account_id, created_at, seen_at, ip, agent) VALUES (?, ?, 1, 1, ?, ?)')->execute([str_repeat('a', 64), $id, '203.0.113.9', 'x']);
        $db->exec("CREATE TRIGGER refuse_delete BEFORE DELETE ON accounts BEGIN SELECT RAISE(ABORT, 'refused'); END");
        try {
            $accounts->remove($id);
            self::fail('the delete of the account row was refused');
        } catch (PDOException) {
            self::assertFalse($db->inTransaction(), 'the transaction ended');
        }
        $count = static fn(string $table): int => (int) $db->query("SELECT COUNT(*) FROM $table WHERE account_id = $id")->fetchColumn();
        foreach (['music_drafts', 'music_notes', 'music_keyring', 'studio_keys', 'studio_sessions'] as $table) {
            self::assertSame(1, $count($table), "$table rolled back with the rest");
        }
        self::assertSame($id, $accounts->idFor('student@siue.edu'));
    }
}
