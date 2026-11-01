<?php
// Vocal takes in the editor's save: a take comes in the same bundle as the score that names it, is checked whole and
// kept once per account; a later draft names it without sending it again; a take the score does not name, one that
// is not what its name or the score says, another account's take, a take past the room or the disk floor, are all
// refused with nothing kept; a take goes when the last draft naming it goes; Convert To Good To The Ear moves every
// draft onto the new take and frees the old one.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicVocalTakesTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';
    private const PEOPLE = '{"people":[],"min_free_disk_mb":1}';

    private Music\Pages $pages;
    private Admin\Sessions $sessions;
    private Closure $storeFor;
    private Music\Accounts $accounts;
    private string $dir;
    private int $student;

    protected function setUp(): void
    {
        [, $db, $this->dir, $clock] = music_world(true, Admin\Auth::OWNER, self::PEOPLE);
        [$this->pages, $this->sessions, $this->storeFor, $this->accounts] = music_pages($db, $this->dir, $clock, self::BASE, self::PEOPLE);
        $this->student = $this->accounts->signIn('student@siue.edu') ?? throw new RuntimeException('no account');
    }

    private static function fixture(string $name): string
    {
        return (string) file_get_contents(__DIR__ . '/../../games/workroom/test/fixtures/takes/' . $name);
    }

    private static function takeName(string $bytes, string $ext): string
    {
        return 'vocal-' . hash('sha256', $bytes) . '.' . $ext;
    }

    /** The fixture score as draft $draft of $piece, with a vocal lane naming $takes (file => seconds), a clip of the first. */
    private static function score(string $piece, int $draft, array $takes): string
    {
        $score = json_decode((string) file_get_contents(__DIR__ . '/../../games/workroom/test/fixtures/draft-score/score.json'), true);
        $score['piece']['id'] = $piece;
        $score['draft'] = $draft;
        $score['schema'] = 2;
        $first = array_key_first($takes);
        $score['lanes'][] = [
            'id' => 'voice', 'name' => 'My Voice', 'family' => 'voice', 'icon' => 'voice', 'color' => '#c0392b',
            'sound' => ['instrument' => 'vocal', 'gain_db' => 0, 'attack' => 0, 'release' => 0],
            'vocal' => [
                'takes' => array_map(static fn(string $f, float $s): array => ['file' => $f, 'seconds' => $s], array_keys($takes), array_values($takes)),
                'clips' => [['take' => $first, 'at' => 0, 'from' => 0, 'to' => min(1, $takes[$first]), 'gain_db' => 0, 'fade_in' => 0, 'fade_out' => 0]],
            ],
        ];
        return (string) json_encode($score);
    }

    private function save(int $account, string $piece, int $version, array $files): array
    {
        $in = music_signed_in($this->sessions, $account);
        $csrf = json_decode($this->pages->csrf($in)->body, true)['csrf'];
        $r = req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'query' => ['piece' => $piece, 'version' => (string) $version], 'headers' => ['x-csrf' => $csrf]]);
        $res = $this->pages->saveDraft($r, music_draft_bundle($files));
        return [$res->status, json_decode($res->body, true)];
    }

    private function store(int $account): Music\Store
    {
        return ($this->storeFor)($account);
    }

    public function testATakeIsKeptWithItsScoreAndNamedAgainWithoutBeingSent(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        [$status, $body] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac]);
        self::assertSame(201, $status, json_encode($body));
        $store = $this->store($this->student);
        self::assertSame([['file' => $take, 'size' => strlen($flac), 'seconds' => $seconds, 'drafts' => 1]], $store->takes());
        self::assertSame($flac, $store->takeBytes($take));
        $before = $this->accounts->usage($this->student);
        [$again] = $this->save($this->student, 'song', 2, ['score.json' => self::score('song', 2, [$take => $seconds])]);
        self::assertSame(201, $again);
        self::assertSame(2, $store->takes()[0]['drafts']);
        self::assertLessThan(strlen($flac), $this->accounts->usage($this->student) - $before, 'the take is not counted twice');
        self::assertSame(26_214_400 - $before, $body['room'], 'the answer says the room left after the save');
    }

    public function testOggAndWebmOpusTakesAreKeptToo(): void
    {
        foreach (['ogg' => 'sine-1.5s.opus', 'webm' => 'sine-1.5s.webm'] as $ext => $file) {
            $bytes = self::fixture($file);
            $take = self::takeName($bytes, $ext);
            $seconds = Music\TakeCheck::check($take, $bytes, 1 << 30);
            [$status] = $this->save($this->student, "song-$ext", 1, ['score.json' => self::score("song-$ext", 1, [$take => $seconds]), $take => $bytes]);
            self::assertSame(201, $status, $ext);
        }
        self::assertCount(2, $this->store($this->student)->takes());
    }

    public function testATakeThatIsNotWhatItsNameOrTheScoreSaysIsRefused(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        $ogg = self::fixture('sine-1.5s.opus');
        [$s1, $b1] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $ogg]);
        self::assertSame([422, 'bad_take'], [$s1, $b1['error']], 'another file under the name');
        $magic = self::takeName($ogg, 'flac');
        [$s2, $b2] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$magic => 1.5]), $magic => $ogg]);
        self::assertSame([422, 'bad_take'], [$s2, $b2['error']], 'Ogg bytes named as FLAC');
        [$s3, $b3] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => 1.0]), $take => $flac]);
        self::assertSame([422, 'bad_take'], [$s3, $b3['error']], 'the score says one second; the frames say two');
        $other = self::takeName(self::fixture('sine-1.5s.opus'), 'ogg');
        [$s4, $b4] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac, $other => $ogg]);
        self::assertSame([422, 'bad_take'], [$s4, $b4['error']], 'a take the score does not name');
        self::assertSame([], $this->store($this->student)->takes());
        self::assertSame([], $this->store($this->student)->drafts('song'));
        self::assertDirectoryDoesNotExist("{$this->dir}/takes/{$this->student}");
    }

    public function testAScoreMayNameOnlyItsOwnAccountsTakes(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        $owner = (int) $this->accounts->idFor(Admin\Auth::OWNER);
        [$mine] = $this->save($owner, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac]);
        self::assertSame(201, $mine);
        [$status, $body] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds])]);
        self::assertSame([422, 'missing_take'], [$status, $body['error']], 'the owner\'s take is not the student\'s');
        self::assertNull($this->store($this->student)->takeBytes($take));
        self::assertSame($flac, $this->store($owner)->takeBytes($take));
    }

    public function testATakePastTheRoomIsRefusedWithTheRoomLeft(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        $store = $this->store($this->student);
        $store->putKeyring('{"v":1}', MUSIC_FP_CURRENT, []);
        for ($i = 0; $i < 25; $i++) {
            $store->addNote(music_sealed(MUSIC_FP_CURRENT, 1_048_576 - 38 - ($i === 24 ? 20_000 : 0)));
        }
        [$status, $body] = $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac]);
        self::assertSame([413, 'over_quota'], [$status, $body['error']]);
        self::assertStringContainsString('of 25 MB left', $body['message']);
        self::assertSame([], $store->takes());
    }

    public function testATakeIsRefusedWhileTheDiskWouldDropBelowItsFloor(): void
    {
        [, $db, $dir, $clock] = music_world(true, Admin\Auth::OWNER, '{"people":[],"min_free_disk_mb":999999999}');
        [$pages, $sessions, , $accounts] = music_pages($db, $dir, $clock, self::BASE, '{"people":[],"min_free_disk_mb":999999999}');
        $id = (int) $accounts->signIn('student@siue.edu');
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $in = music_signed_in($sessions, $id);
        $csrf = json_decode($pages->csrf($in)->body, true)['csrf'];
        $r = req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'query' => ['piece' => 'song', 'version' => '1'], 'headers' => ['x-csrf' => $csrf]]);
        $res = $pages->saveDraft($r, music_draft_bundle(['score.json' => self::score('song', 1, [$take => round((48000 * 2 + 777) / 48000, 3)]), $take => $flac]));
        self::assertSame([507, 'low_disk'], [$res->status, json_decode($res->body, true)['error']]);
    }

    public function testATakeGoesWhenTheLastDraftNamingItGoes(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac]);
        $this->save($this->student, 'song', 2, ['score.json' => self::score('song', 2, [$take => $seconds])]);
        $store = $this->store($this->student);
        self::assertTrue($store->deleteDraft('song', 1));
        self::assertSame($flac, $store->takeBytes($take), 'draft 2 still names it');
        self::assertTrue($store->deleteDraft('song', 2));
        self::assertSame([], $store->takes());
        self::assertFileDoesNotExist("{$this->dir}/takes/{$this->student}/$take");
        $this->save($this->student, 'tune', 1, ['score.json' => self::score('tune', 1, [$take => $seconds]), $take => $flac]);
        self::assertSame(1, $store->deletePiece('tune'));
        self::assertSame([], $store->takes(), 'deleting a piece frees its takes');
        $this->save($this->student, 'tune', 1, ['score.json' => self::score('tune', 1, [$take => $seconds]), $take => $flac]);
        $store->wipe();
        self::assertSame([], $store->takes(), 'starting over frees every take');
        self::assertDirectoryDoesNotExist("{$this->dir}/takes/{$this->student}");
    }

    public function testConvertingMovesEveryDraftOntoTheNewTakeAndFreesTheOld(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $seconds = round((48000 * 2 + 777) / 48000, 3);
        $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => $seconds]), $take => $flac]);
        $this->save($this->student, 'song', 2, ['score.json' => self::score('song', 2, [$take => $seconds])]);
        $ogg = self::fixture('sine-1.5s.opus');
        $new = self::takeName($ogg, 'ogg');
        $store = $this->store($this->student);
        self::assertTrue($store->convertTake($take, $new, $ogg, 1.5));
        self::assertSame([$new], array_column($store->takes(), 'file'));
        self::assertNull($store->takeBytes($take));
        foreach ([1, 2] as $v) {
            $score = json_decode((string) $store->draftBytes('song', $v, 'score.json'), true);
            $vocal = end($score['lanes'])['vocal'];
            self::assertSame([['file' => $new, 'seconds' => 1.5]], $vocal['takes']);
            self::assertSame($new, $vocal['clips'][0]['take']);
        }
        self::assertSame(2, $store->takes()[0]['drafts']);
        self::assertFalse($store->convertTake($take, $new, $ogg, 1.5), 'the old take is gone');
    }

    public function testTakePhpServesOnlyTheAccountsOwnTakes(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => round((48000 * 2 + 777) / 48000, 3)]), $take => $flac]);
        $get = fn(int $account, string $file) => $this->pages->takeFile(music_signed_in($this->sessions, $account, ['method' => 'GET', 'query' => ['file' => $file]]));
        $mine = $get($this->student, $take);
        self::assertSame(200, $mine->status);
        self::assertSame($flac, $mine->body);
        self::assertSame(404, $get((int) $this->accounts->idFor(Admin\Auth::OWNER), $take)->status, 'another account\'s take is not there');
        self::assertSame(400, $get($this->student, '../secret.flac')->status);
    }

    public function testConvertTakePhpChecksTheNewTakeAgainstTheOld(): void
    {
        $flac = self::fixture('voice-2s.flac');
        $take = self::takeName($flac, 'flac');
        $this->save($this->student, 'song', 1, ['score.json' => self::score('song', 1, [$take => round((48000 * 2 + 777) / 48000, 3)]), $take => $flac]);
        $ogg = self::fixture('sine-1.5s.opus');
        $new = self::takeName($ogg, 'ogg');
        $in = music_signed_in($this->sessions, $this->student);
        $csrf = json_decode($this->pages->csrf($in)->body, true)['csrf'];
        $res = $this->pages->convertTake(req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'query' => ['from' => $take, 'to' => $new], 'headers' => ['x-csrf' => $csrf]]), $ogg);
        self::assertSame([422, 'bad_take'], [$res->status, json_decode($res->body, true)['error']], 'a 1.5 s take cannot stand for a 2 s one');
        self::assertSame([$take], array_column($this->store($this->student)->takes(), 'file'), 'nothing changed');
    }

    public function testYourStudioShowsTheTakesTheMinutesLeftAndKeepsTheQualityChoice(): void
    {
        $in = music_signed_in($this->sessions, $this->student);
        $page = $this->pages->studio($in)->body;
        self::assertStringContainsString('No vocal takes saved yet.', $page);
        self::assertStringContainsString('Room for about 9 more minutes of singing at Perfect, or about 36 at Good To The Ear.', $page);
        self::assertStringContainsString('value="perfect" checked', $page);
        $post = req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'post' => ['csrf' => $this->sessions->csrf($in), 'action' => 'vocal-quality', 'quality' => 'ear']]);
        self::assertSame(303, $this->pages->studioAction($post)->status);
        self::assertSame('ear', $this->store($this->student)->vocalQuality());
        self::assertStringContainsString('value="ear" checked', $this->pages->studio($in)->body);
        $bad = req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'post' => ['csrf' => $this->sessions->csrf($in), 'action' => 'vocal-quality', 'quality' => 'mp3']]);
        self::assertSame(400, $this->pages->studioAction($bad)->status);
        self::assertStringContainsString('data-vocal-quality="ear"', $this->pages->index($in)->body);
    }
}
