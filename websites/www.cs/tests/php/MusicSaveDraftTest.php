<?php
// The editor's save (save-draft.php): the session and its CSRF token, a bundle of score.json alone for every account,
// the next draft only, the studio limit's words, and the next token on every answer. The editor's page (compose.php)
// and the sheet flag on drafts.php.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicSaveDraftTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';

    private Music\Pages $pages;
    private Music\Store $store;
    private Admin\Sessions $sessions;
    private int $account;

    protected function setUp(): void
    {
        [$this->store, $db, $dir, $clock, , $this->account] = music_world();
        [$this->pages, $this->sessions] = music_pages($db, $dir, $clock, self::BASE);
    }

    /** The test fixture's renderable score as draft $draft of $piece. */
    private static function score(string $piece, int $draft): string
    {
        $score = json_decode((string) file_get_contents(__DIR__ . '/../../games/workroom/test/fixtures/draft-score/score.json'), true);
        $score['piece']['id'] = $piece;
        $score['draft'] = $draft;
        return (string) json_encode($score);
    }

    /** POSTs $body to save-draft.php?piece=&version= with a fresh token; the answer's status and JSON. */
    private function save(string $piece, int|string $version, string $body, bool $token = true): array
    {
        $in = music_signed_in($this->sessions, $this->account);
        $csrf = json_decode($this->pages->csrf($in)->body, true)['csrf'];
        $r = req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'query' => ['piece' => $piece, 'version' => (string) $version],
            'headers' => $token ? ['x-csrf' => $csrf] : []]);
        $res = $this->pages->saveDraft($r, $body);
        return [$res->status, json_decode($res->body, true)];
    }

    public function testANewPieceSavesAsDraftOneAndTheAnswerCarriesTheNextToken(): void
    {
        [$status, $body] = $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        self::assertSame(201, $status);
        self::assertSame(['my-tune', 1], [$body['piece'], $body['version']]);
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $body['csrf']);
        self::assertSame([1], array_column($this->store->drafts('my-tune'), 'version'));
        self::assertNotNull($this->store->draftBytes('my-tune', 1, 'score.json'));
    }

    public function testOnlyTheNextDraftIsTaken(): void
    {
        $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        [$status, $body] = $this->save('my-tune', 3, music_draft_bundle(['score.json' => self::score('my-tune', 3)]));
        self::assertSame([409, 'stale', 1], [$status, $body['error'], $body['latest']]);
        self::assertArrayHasKey('csrf', $body);
        [$again] = $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        self::assertSame(409, $again, 'draft 1 is taken');
        [$next] = $this->save('my-tune', 2, music_draft_bundle(['score.json' => self::score('my-tune', 2)]));
        self::assertSame(201, $next);
    }

    public function testTheEditorSavesTheScoreAloneEvenForTheOwner(): void
    {
        $bundle = music_draft_bundle(['score.json' => self::score('my-tune', 1), 'score.musicxml' => '<score-partwise/>']);
        [$status, $body] = $this->save('my-tune', 1, $bundle);
        self::assertSame([422, 'score_only'], [$status, $body['error']]);
        self::assertSame([], $this->store->drafts('my-tune'));
    }

    public function testABadScoreOrBundleIsRefused(): void
    {
        self::assertSame([422, 'bad_bundle'], (fn($a) => [$a[0], $a[1]['error']])($this->save('my-tune', 1, 'not a bundle')));
        $wrongPiece = music_draft_bundle(['score.json' => self::score('other', 1)]);
        self::assertSame('bad_score', $this->save('my-tune', 1, $wrongPiece)[1]['error']);
        $score = json_decode(self::score('my-tune', 1), true);
        $score['lanes'][0]['sound']['instrument'] = 'kazoo';
        self::assertSame('unknown_instrument', $this->save('my-tune', 1, music_draft_bundle(['score.json' => json_encode($score)]))[1]['error']);
        self::assertSame('bad_piece', $this->save('../x', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]))[1]['error']);
        self::assertSame('bad_version', $this->save('my-tune', 'x', music_draft_bundle(['score.json' => self::score('my-tune', 1)]))[1]['error']);
    }

    public function testASaveNeedsTheTokenAndASession(): void
    {
        [$status] = $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]), false);
        self::assertSame(403, $status);
        $anon = $this->pages->saveDraft(req(['https' => true, 'method' => 'POST', 'query' => ['piece' => 'my-tune', 'version' => '1']]), '');
        self::assertSame(401, $anon->status);
        self::assertSame([], $this->store->drafts());
    }

    public function testAStudentPastTheLimitIsToldTheRoomLeft(): void
    {
        [$store, $db, $dir, $clock, , $account] = music_world(true, 'student@siue.edu');
        [$pages, $sessions] = music_pages($db, $dir, $clock, self::BASE);
        while ($store->room() > 400) {
            $store->addNote(music_sealed(MUSIC_FP_CURRENT, max(1, min(1_000_000, $store->room() - 300))));
        }
        $in = music_signed_in($sessions, $account);
        $csrf = json_decode($pages->csrf($in)->body, true)['csrf'];
        $res = $pages->saveDraft(req(['https' => true, 'method' => 'POST', 'cookies' => $in->cookies, 'query' => ['piece' => 'my-tune', 'version' => '1'], 'headers' => ['x-csrf' => $csrf]]),
            music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        $body = json_decode($res->body, true);
        self::assertSame([413, 'over_quota'], [$res->status, $body['error']]);
        self::assertStringContainsString('left', $body['message']);
        self::assertArrayHasKey('csrf', $body);
        self::assertSame([], $store->drafts());
    }

    public function testDraftsSayWhetherSheetMusicIsStored(): void
    {
        $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        $this->store->putDraft('full', 1, ['score.json' => self::score('full', 1), 'score.musicxml' => '<score-partwise/>']);
        $list = fn(string $piece) => json_decode($this->pages->drafts(music_signed_in($this->sessions, $this->account, ['query' => ['piece' => $piece]]))->body, true)['drafts'];
        self::assertFalse($list('my-tune')[0]['sheet']);
        self::assertTrue($list('full')[0]['sheet']);
    }

    public function testTheComposePageIsTheWorkroomShellInComposeView(): void
    {
        $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        $page = $this->pages->compose(music_signed_in($this->sessions, $this->account, ['query' => ['id' => 'my-tune']]));
        self::assertSame(200, $page->status);
        self::assertStringContainsString('data-view="compose"', $page->body);
        self::assertStringContainsString('data-piece="my-tune"', $page->body);
        // Start A New Piece from an imported file needs the studio's pieces on an existing piece's editor too.
        preg_match('/data-pieces="([^"]*)"/', $page->body, $m);
        self::assertSame(['my-tune'], json_decode(html_entity_decode($m[1] ?? ''), true));
        $new = $this->pages->compose(music_signed_in($this->sessions, $this->account));
        self::assertSame(200, $new->status);
        self::assertStringContainsString('data-piece=""', $new->body);
        preg_match('/data-pieces="([^"]*)"/', $new->body, $m);
        self::assertSame(['my-tune'], json_decode(html_entity_decode($m[1]), true));
        preg_match('/data-projects="([^"]*)"/', $new->body, $m);
        self::assertSame([['id' => 'crete', 'name' => 'Crete']], json_decode(html_entity_decode($m[1]), true));
        $login = $this->pages->compose(req(['https' => true, 'query' => ['id' => 'my-tune']]));
        self::assertSame(303, $login->status);
        self::assertStringContainsString(rawurlencode('compose.php?id=my-tune'), $login->headers['Location']);
    }

    public function testThePiecePageLinksComposeForMusicAndThePiecesPageLinksNewPiece(): void
    {
        $this->save('my-tune', 1, music_draft_bundle(['score.json' => self::score('my-tune', 1)]));
        $piece = $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => 'my-tune']]));
        self::assertStringContainsString('<a class="compose-link" href="compose.php?id=my-tune">Compose</a>', $piece->body);
        $sound = json_decode(self::score('a-sound', 1), true);
        $this->store->putDraft('a-sound', 1, ['score.json' => json_encode($sound)], ['project_id' => 'crete', 'project_name' => 'Crete', 'kind' => 'sound']);
        $soundPage = $this->pages->piece(music_signed_in($this->sessions, $this->account, ['query' => ['id' => 'a-sound']]));
        self::assertStringNotContainsString('compose.php', $soundPage->body, 'a sound piece has no bars to compose in');
        $index = $this->pages->index(music_signed_in($this->sessions, $this->account));
        self::assertStringContainsString('href="compose.php">New Piece</a>', $index->body);
        $studio = $this->pages->studio(music_signed_in($this->sessions, $this->account));
        self::assertStringContainsString('href="compose.php">New Piece</a>', $studio->body);
    }
}
