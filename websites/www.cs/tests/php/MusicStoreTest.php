<?php
// The store: only sealed bundles with a known key's header, the note limits,
// private files, deletes that remove row and file, pickup marks only; drafts
// are immutable, capped at 8 MB each, 20 in all and 100 MB in total; one
// locked keyring; public.json is checked against its own spki.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicStoreTest extends TestCase
{
    public function testAddsANoteAndKeepsOnlyIdSizeTimeAndHash(): void
    {
        [$s, $db, $dir] = music_world();
        $bytes = music_sealed();
        $n = $s->addNote($bytes);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $n['id']);
        self::assertSame(strlen($bytes), $n['size']);
        self::assertSame(hash('sha256', $bytes), $n['sha256']);
        self::assertSame(1_800_000_000, $n['arrived_at']);
        self::assertSame($bytes, $s->noteBytes($n['id']));
        $cols = array_column($db->query('PRAGMA table_info(music_notes)')->fetchAll(), 'name');
        self::assertSame(['id', 'size', 'sha256', 'arrived_at', 'picked_up_at'], $cols);
        self::assertSame(0, fileperms("$dir/notes/{$n['id']}.sealed") & 0077, 'note file is private');
        self::assertSame(0, fileperms("$dir/notes") & 0077, 'notes dir is private');
    }

    public function testSizeLimitIsExact(): void
    {
        [$s] = music_world();
        $s->addNote(music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES - 38));
        try {
            $s->addNote(music_sealed(MUSIC_FP_CURRENT, Music\Store::MAX_NOTE_BYTES - 37));
            self::fail('one byte over must be refused');
        } catch (Music\NoteRejected $e) {
            self::assertSame('too_large', $e->reason);
        }
    }

    public function testCountLimit(): void
    {
        [$s, $db] = music_world();
        $insert = $db->prepare('INSERT INTO music_notes VALUES (?, 1, ?, 0, NULL)');
        for ($i = 0; $i < Music\Store::MAX_NOTES; $i++) {
            $insert->execute([sprintf('%032x', $i), str_repeat('0', 64)]);
        }
        try {
            $s->addNote(music_sealed());
            self::fail('the 2,001st note must be refused');
        } catch (Music\NoteRejected $e) {
            self::assertSame('full', $e->reason);
        }
    }

    public function testHeaderMustNameAKnownKey(): void
    {
        [$s] = music_world();
        $s->addNote(music_sealed(MUSIC_FP_PREVIOUS)); // a page built before a rotation
        foreach (['bad_header' => 'XXXXXX' . str_repeat("\0", 60), 'unknown_key' => music_sealed(str_repeat('ef', 32))] as $reason => $bytes) {
            try {
                $s->addNote($bytes);
                self::fail($reason);
            } catch (Music\NoteRejected $e) {
                self::assertSame($reason, $e->reason);
            }
        }
        [$none] = music_world(new Music\PublicKeys('', []));
        try {
            $none->addNote(music_sealed());
            self::fail('no key yet');
        } catch (Music\NoteRejected $e) {
            self::assertSame('no_key', $e->reason);
        }
    }

    public function testPickupOnlyMarks(): void
    {
        [$s, , $dir, $clock] = music_world();
        $id = $s->addNote(music_sealed())['id'];
        self::assertCount(1, $s->notes('waiting'));
        $clock->now += 5;
        self::assertTrue($s->markPickedUp($id));
        self::assertTrue($s->markPickedUp($id), 'twice is fine');
        self::assertSame([], $s->notes('waiting'));
        self::assertSame(1_800_000_005, $s->notes('picked-up')[0]['picked_up_at']);
        self::assertFileExists("$dir/notes/$id.sealed", 'picked-up notes stay sealed on the server');
        self::assertFalse($s->markPickedUp(str_repeat('0', 32)));
    }

    public function testDeleteRemovesRowAndFile(): void
    {
        [$s, $db, $dir] = music_world();
        $a = $s->addNote(music_sealed())['id'];
        $b = $s->addNote(music_sealed())['id'];
        self::assertTrue($s->deleteNote($a));
        self::assertFileDoesNotExist("$dir/notes/$a.sealed");
        self::assertNull($s->noteBytes($a));
        self::assertFalse($s->deleteNote($a));
        self::assertSame(1, $s->deleteAllNotes());
        self::assertFileDoesNotExist("$dir/notes/$b.sealed");
        self::assertSame(0, (int) $db->query('SELECT COUNT(*) FROM music_notes')->fetchColumn());
        self::assertSame(1, (int) $db->query('PRAGMA secure_delete')->fetchColumn());
    }

    public function testIdsAreCheckedBeforeTouchingFiles(): void
    {
        [$s] = music_world();
        self::assertNull($s->noteBytes('../../etc/passwd'));
        self::assertFalse($s->deleteNote('../x'));
    }

    public function testDraftsAreImmutableAndNamesAllowListed(): void
    {
        [$s, , $dir] = music_world();
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => '{"schema":1}']);
        self::assertSame('{"schema":1}', file_get_contents((string) $s->draftFile('ch1-labyrinth', 2, 'score.json')));
        self::assertSame(0, fileperms("$dir/drafts/ch1-labyrinth/2/score.json") & 0077, 'draft files are private');
        self::assertNull($s->draftFile('ch1-labyrinth', 2, '../../admin.sqlite'));
        self::assertNull($s->draftFile('ch1-labyrinth', 3, 'score.json'));
        $this->expectExceptionObject(new Music\DraftRejected('exists'));
        $s->putDraft('ch1-labyrinth', 2, ['score.json' => '{"schema":1}']);
    }

    public function testADraftOfExactlyEightMegabytesIsKeptAndOneByteMoreIsRefused(): void
    {
        [$s, , $dir] = music_world();
        $s->putDraft('big', 1, ['score.json' => str_repeat('x', Music\Store::MAX_REQUEST_BYTES)]);
        self::assertSame(8_388_608, $s->draftBytes());
        try {
            $s->putDraft('big', 2, ['score.json' => str_repeat('x', Music\Store::MAX_REQUEST_BYTES - 1), 'audio.webm' => 'xx']);
            self::fail('8,388,609 bytes must be refused');
        } catch (Music\DraftRejected $e) {
            self::assertSame('too_large', $e->reason);
        }
        self::assertDirectoryDoesNotExist("$dir/drafts/big/2");
        self::assertSame(8_388_608, $s->draftBytes());
    }

    public function testTwentyDraftsStayAndTheTwentyFirstEvictsTheOldest(): void
    {
        [$s, $db, $dir, $clock] = music_world();
        for ($v = 1; $v <= 20; $v++) {
            $clock->now += 10;
            $s->putDraft($v % 2 === 0 ? 'even' : 'odd', $v, ['score.json' => "v$v"]);
        }
        self::assertCount(20, $s->drafts());
        self::assertNotNull($s->draftFile('odd', 1, 'score.json'), 'twenty are all kept');
        $clock->now += 10;
        $s->putDraft('odd', 21, ['score.json' => 'v21']);
        $kept = $s->drafts();
        self::assertCount(20, $kept);
        self::assertSame(['odd', 21], [$kept[0]['piece'], $kept[0]['version']], 'newest first');
        self::assertNull($s->draftFile('odd', 1, 'score.json'), 'the oldest is gone');
        self::assertFileDoesNotExist("$dir/drafts/odd/1/score.json");
        self::assertSame(20, (int) $db->query('SELECT COUNT(*) FROM music_drafts')->fetchColumn());
        self::assertSame('v2', file_get_contents((string) $s->draftFile('even', 2, 'score.json')));
        self::assertSame(52, $s->draftBytes(), 'v2 to v9 are 2 bytes each, v10 to v21 are 3: sizes follow the rows');
    }

    public function testDraftQuotaIsExactAndARefusalWritesNothing(): void
    {
        [$s, $db, $dir] = music_world();
        $seed = $db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)');
        $seed->execute(['seed', 1, 1, 60_000_000]);
        $seed->execute(['seed', 2, 2, Music\Store::MAX_DRAFT_TOTAL_BYTES - 60_000_000 - 1000]);
        $before = [$s->drafts(), scandir("$dir/drafts")];
        try {
            $s->putDraft('next', 1, ['score.json' => str_repeat('x', 1001)]);
            self::fail('one byte past 104,857,600 must be refused');
        } catch (Music\DraftRejected $e) {
            self::assertSame('over_quota', $e->reason);
        }
        self::assertSame($before, [$s->drafts(), scandir("$dir/drafts")], 'storage is unchanged');
        self::assertDirectoryDoesNotExist("$dir/drafts/next");
        $s->putDraft('next', 1, ['score.json' => str_repeat('x', 1000)]);
        self::assertSame(Music\Store::MAX_DRAFT_TOTAL_BYTES, $s->draftBytes(), 'exactly 104,857,600 is allowed');
    }

    public function testTheQuotaCountsOnlyWhatRemainsAfterEviction(): void
    {
        [$s, $db] = music_world();
        $seed = $db->prepare('INSERT INTO music_drafts (piece, version, published_at, size) VALUES (?, ?, ?, ?)');
        // The seeded rows have no files on disk: eviction deletes the rows and skips what is not there.
        $seed->execute(['old', 1, 1, 100_000_000]); // the oldest of twenty: it goes when the next draft lands
        for ($v = 2; $v <= 20; $v++) {
            $seed->execute(['old', $v, $v, 1]);
        }
        $s->putDraft('new', 1, ['score.json' => str_repeat('x', 1_000_000)]);
        self::assertNull($s->draftFile('old', 1, 'score.json'));
        self::assertCount(20, $s->drafts());
        self::assertSame(1_000_019, $s->draftBytes());
    }

    public function testTheKeyringIsOneReplaceableDocument(): void
    {
        [$s, $db, , $clock] = music_world();
        self::assertNull($s->keyring());
        $s->putKeyring('{"v":1,"ct":"first"}');
        $clock->now += 1;
        $s->putKeyring('{"v":1,"ct":"second"}');
        self::assertSame(['locked' => '{"v":1,"ct":"second"}', 'uploaded_at' => 1_800_000_001], $s->keyring());
        self::assertSame(1, (int) $db->query('SELECT COUNT(*) FROM music_keyring')->fetchColumn());
    }

    public function testPublicKeysFileMustMatchItsSpki(): void
    {
        $dir = admin_tmp_dir();
        $spki = random_bytes(550);
        $good = ['schema' => 1, 'current' => ['fingerprint' => hash('sha256', $spki), 'spki' => base64_encode($spki)], 'previous' => []];
        file_put_contents("$dir/ok.json", json_encode($good));
        self::assertSame(hash('sha256', $spki), Music\PublicKeys::fromFile("$dir/ok.json")?->current);
        self::assertNull(Music\PublicKeys::fromFile("$dir/missing.json"));
        $good['current']['fingerprint'] = MUSIC_FP_CURRENT;
        file_put_contents("$dir/bad.json", json_encode($good));
        $this->expectException(RuntimeException::class);
        Music\PublicKeys::fromFile("$dir/bad.json");
    }

    public function testDisplayGroupsByFour(): void
    {
        self::assertSame('abab abab', substr(Music\PublicKeys::display(MUSIC_FP_CURRENT), 0, 9));
    }
}
