<?php
// The admin's list of studios (studios.php): each account's address, usage and last sign-in, never a piece, title
// or note; remove after the typed address and a csrf token; the owner's studio stays.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class AdminStudiosTest extends TestCase
{
    private const BASE = 'https://example.test/~wgrim/admin/';
    private const STUDENT = 'student@siue.edu';

    private Admin\Pages $pages;
    private Admin\Sessions $admin;
    private Admin\Sessions $studio;
    private PDO $db;
    private string $dir;
    private FakeClock $clock;
    private Music\Accounts $accounts;
    private Music\Store $store;
    private int $account;

    protected function setUp(): void
    {
        [$this->store, $this->db, $this->dir, $this->clock, $this->accounts, $this->account] = music_world(true, self::STUDENT);
        $this->pages = new Admin\Pages($this->db, $this->clock, new class implements Admin\Mailer {
            public function send(string $to, string $subject, string $mime): void
            {
            }
        }, self::BASE, static fn(): bool => true, null, $this->dir);
        $this->admin = new Admin\Sessions($this->db, $this->clock, admin_realm(self::BASE));
        $this->studio = new Admin\Sessions($this->db, $this->clock, Admin\Realm::studio(self::BASE));
    }

    private function post(Admin\Request $as, array $post): Admin\Response
    {
        $post += ['csrf' => $this->admin->csrf($as)];
        return $this->pages->studiosAction(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'post' => $post]));
    }

    private function adminIn(): Admin\Request
    {
        return music_admin_signed_in($this->admin);
    }

    private function draft(): void
    {
        $this->store->putDraft('secret-title', 1, ['score.json' => '{"schema":1,"piece":{"id":"secret-title","title":"secret-title"}}']);
    }

    public function testTheListShowsUsageAndLastSignInAndNoPieceNames(): void
    {
        $this->draft();
        $this->store->addNote(music_sealed());
        $this->db->prepare('UPDATE music_notes SET size = 1258291 WHERE account_id = ?')->execute([$this->account]);
        $res = $this->pages->studios($this->adminIn());
        self::assertSame(200, $res->status);
        self::assertStringContainsString(self::STUDENT, $res->body);
        self::assertStringContainsString(Music\Usage::human($this->accounts->usage($this->account)), $res->body);
        self::assertStringContainsString('2027-01-15', $res->body, 'the last sign-in date');
        self::assertStringContainsString('Shared usage: ' . Music\Usage::human($this->accounts->sharedUsage()) . ' of ' . Music\Usage::human(admin_people()->maxSharedBytes()), $res->body);
        self::assertStringContainsString('Accounts: 1 of ' . admin_people()->maxAccounts(), $res->body);
        self::assertStringContainsString('>Remove<', $res->body);
        self::assertStringNotContainsString('secret-title', $res->body);
    }

    public function testRemoveNeedsTheTypedAddressAndCsrf(): void
    {
        $as = $this->adminIn();
        $this->draft();
        $wrong = $this->post($as, ['action' => 'remove', 'id' => (string) $this->account, 'confirm' => 'someone@siue.edu']);
        self::assertSame(400, $wrong->status);
        $none = $this->post($as, ['action' => 'remove', 'id' => (string) $this->account]);
        self::assertSame(400, $none->status);
        $csrf = $this->post($as, ['action' => 'remove', 'id' => (string) $this->account, 'confirm' => self::STUDENT, 'csrf' => str_repeat('0', 64)]);
        self::assertSame(403, $csrf->status);
        self::assertSame(self::STUDENT, $this->accounts->emailOf($this->account), 'nothing was removed');
        self::assertCount(1, $this->store->drafts());
        self::assertSame(404, $this->post($as, ['action' => 'remove', 'id' => '99999', 'confirm' => self::STUDENT])->status);
    }

    public function testRemovedAccountsLoseEverythingAndTheirSessions(): void
    {
        $as = $this->adminIn();
        $this->draft();
        $this->store->addNote(music_sealed());
        music_signed_in($this->studio, $this->account);
        $this->db->prepare('INSERT INTO studio_devices (token_hash, account_id, created_at, expires_at) VALUES (?, ?, 1, 2)')->execute([str_repeat('a', 64), $this->account]);
        $this->db->prepare('INSERT INTO studio_links (token_hash, email, created_at, expires_at) VALUES (?, ?, 1, 2)')->execute([str_repeat('b', 64), self::STUDENT]);
        $this->db->prepare('INSERT INTO studio_links (token_hash, email, created_at, expires_at) VALUES (?, ?, 1, 2)')->execute([str_repeat('c', 64), 'other@siue.edu']);
        $res = $this->post($as, ['action' => 'remove', 'id' => (string) $this->account, 'confirm' => self::STUDENT]);
        self::assertSame(303, $res->status);
        self::assertNull($this->accounts->idFor(self::STUDENT));
        foreach (['studio_sessions', 'studio_devices'] as $table) {
            self::assertSame(0, (int) $this->db->query("SELECT COUNT(*) FROM $table WHERE account_id = {$this->account}")->fetchColumn(), $table);
        }
        self::assertSame(['other@siue.edu'], $this->db->query('SELECT email FROM studio_links')->fetchAll(PDO::FETCH_COLUMN), 'the unused links of the address went too');
        self::assertDirectoryDoesNotExist("{$this->dir}/drafts/{$this->account}");
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM music_drafts')->fetchColumn());
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM music_notes')->fetchColumn());
        self::assertStringNotContainsString(self::STUDENT, $this->pages->studios($this->adminIn())->body);
    }

    public function testTheOwnerCannotBeRemoved(): void
    {
        $owner = $this->accounts->ownerId();
        $res = $this->post($this->adminIn(), ['action' => 'remove', 'id' => (string) $owner, 'confirm' => Admin\Auth::OWNER]);
        self::assertSame(400, $res->status);
        self::assertStringContainsString(htmlspecialchars("The owner's studio cannot be removed here.", ENT_QUOTES), $res->body);
        self::assertSame($owner, $this->accounts->idFor(Admin\Auth::OWNER));
    }

    public function testAStudioSessionCannotOpenTheList(): void
    {
        $studio = music_signed_in($this->studio, $this->account);
        $res = $this->pages->studios($studio);
        self::assertSame(303, $res->status);
        self::assertStringContainsString('login.php', $res->headers['Location']);
        $post = $this->pages->studiosAction(req(['https' => true, 'method' => 'POST', 'cookies' => $studio->cookies, 'post' => ['action' => 'remove', 'id' => (string) $this->account, 'confirm' => self::STUDENT, 'csrf' => $this->studio->csrf($studio)]]));
        self::assertSame(303, $post->status);
        self::assertSame($this->account, $this->accounts->idFor(self::STUDENT));
    }

    public function testASignedOutVisitGoesToSignIn(): void
    {
        self::assertSame('login.php?next=studios.php', $this->pages->studios(req(['https' => true]))->headers['Location']);
    }

    public function testTheHubLinksStudios(): void
    {
        self::assertSame('studios.php', admin_dashboards()['Studios']);
        $hub = $this->pages->hub($this->adminIn());
        self::assertStringContainsString('<a href="studios.php">Studios</a>', $hub->body);
    }
}
