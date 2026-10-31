<?php
// admin/stats.php: only a signed-in admin sees any number; the range and page come from fixed lists.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Stats\Dashboard;

require_once __DIR__ . '/StatsFakes.php';
require_once __DIR__ . '/MusicFakes.php';

final class StatsDashboardTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/admin/';
    private const PAGES = ['home', 'crete', 'tankity', 'cylon'];

    private Admin\Pages $pages;
    private Admin\Sessions $sessions;
    private PDO $stats;
    private FakeClock $clock;

    protected function setUp(): void
    {
        $db = admin_tmp_db();
        $this->clock = new FakeClock(STATS_NOON);
        $this->pages = new Admin\Pages($db, $this->clock, new class implements Admin\Mailer {
            public function send(string $to, string $subject, string $mime): void
            {
            }
        }, self::BASE, static fn(): bool => true);
        $this->sessions = new Admin\Sessions($db, $this->clock, admin_realm(self::BASE));
        $this->stats = stats_tmp_db();
        $c = stats_collector($this->stats, $this->clock);
        stats_post($c, stats_view(['r' => 'discord.com']));
        stats_post($c, stats_event('level_start', '1-1'));
    }

    private function serve(Admin\Request $r): Admin\Response
    {
        return Dashboard::serve($this->pages, $r, fn(): PDO => $this->stats, $this->clock->now, self::PAGES);
    }

    /** The JSON the page hands its script. @return array<string, mixed> */
    private static function data(Admin\Response $res): array
    {
        self::assertSame(1, preg_match('#<script type="application/json" id="stats-data">(.*?)</script>#s', $res->body, $m));
        return json_decode($m[1], true, 512, JSON_THROW_ON_ERROR);
    }

    public function testSignedOutGoesToTheLoginAndSeesNoNumbers(): void
    {
        $opened = false;
        $res = Dashboard::serve($this->pages, req(['query' => ['page' => 'crete']]), function () use (&$opened): PDO {
            $opened = true;
            return $this->stats;
        }, $this->clock->now, self::PAGES);
        self::assertSame(303, $res->status);
        self::assertSame('login.php?next=' . rawurlencode('stats.php?page=crete'), $res->headers['Location']);
        self::assertSame('', $res->body);
        self::assertFalse($opened, 'the stats database is not even opened');
    }

    public function testTheLoginReturnsToTheDashboard(): void
    {
        self::assertSame('stats.php?page=crete&days=7', Admin\Pages::safeNext('stats.php?page=crete&days=7'));
    }

    public function testTheOverviewForASignedInAdmin(): void
    {
        $res = $this->serve(music_admin_signed_in($this->sessions));
        self::assertSame(200, $res->status);
        self::assertStringContainsString("script-src 'self'", $res->headers['Content-Security-Policy']);
        self::assertStringContainsString('<script src="stats.js" defer></script>', $res->body);
        self::assertStringNotContainsString('<script>', $res->body, 'no inline script');
        self::assertStringNotContainsString('style="', $res->body, 'no inline style');
        $data = self::data($res);
        self::assertSame('*', $data['report']['page']);
        self::assertSame('30d', $data['report']['range']);
        self::assertSame(30, $data['report']['days']);
        self::assertSame(1, $data['report']['kpis']['uniques']['value']);
        self::assertSame(['home' => 'Faculty page', 'crete' => 'Crete', 'tankity' => 'Tankity', 'cylon' => 'The CIC'], $data['labels']);
        foreach (['Unique visitors', 'Visits', 'Daily visitors', 'Returning'] as $label) {
            self::assertStringContainsString($label, $res->body);
        }
        self::assertStringContainsString('<table', $res->body, 'every chart has its numbers in a table');
    }

    public function testAGamePageHasItsFunnel(): void
    {
        $res = $this->serve(music_admin_signed_in($this->sessions, ['query' => ['page' => 'crete', 'range' => '7d']]));
        $data = self::data($res);
        self::assertSame('crete', $data['report']['page']);
        self::assertSame(7, $data['report']['days']);
        self::assertSame([['level' => '1-1', 'start' => 1, 'win' => 0]], $data['report']['funnel']);
        self::assertStringContainsString('Level funnel', $res->body);
    }

    public function testUnknownChoicesFallBack(): void
    {
        $data = self::data($this->serve(music_admin_signed_in($this->sessions, ['query' => ['page' => '../x', 'days' => '13']])));
        self::assertSame('*', $data['report']['page']);
        self::assertSame('30d', $data['report']['range']);
        $data = self::data($this->serve(music_admin_signed_in($this->sessions, ['query' => ['page' => ['a'], 'days' => ['9'], 'range' => ['1y']]])));
        self::assertSame('*', $data['report']['page']);
        self::assertSame('30d', $data['report']['range']);
        foreach (['x', '13d', '3y', '1m'] as $bad) {
            $data = self::data($this->serve(music_admin_signed_in($this->sessions, ['query' => ['range' => $bad]])));
            self::assertSame('30d', $data['report']['range'], $bad);
        }
    }

    public function testTheRangeChoices(): void
    {
        $res = $this->serve(music_admin_signed_in($this->sessions));
        foreach (['7 Days' => '7d', '30 Days' => '30d', '90 Days' => '90d', '6 Months' => '6m', '1 Year' => '1y'] as $label => $key) {
            self::assertStringContainsString('>' . $label . '</a>', $res->body);
            if ($key !== '30d') {
                self::assertStringContainsString('href="stats.php?range=' . $key . '"', $res->body, $label);
            }
        }
        self::assertSame(1, preg_match('#<a href="stats.php"[^>]*aria-current="page">30 Days</a>#', $res->body), 'the default range is current and keeps a bare link');
        self::assertStringContainsString('<option value="2y">2 Years</option>', $res->body);
        self::assertStringNotContainsString('value="3y"', $res->body, 'no more years than there are numbers for');
        self::assertStringContainsString('<select name="range"', $res->body);
    }

    public function testAYearsRange(): void
    {
        $this->clock->now -= 1500 * 86400;
        stats_post(stats_collector($this->stats, $this->clock), stats_view(['vid' => str_repeat('9', 32)]));
        $this->clock->now += 1500 * 86400;
        $res = $this->serve(music_admin_signed_in($this->sessions, ['query' => ['range' => '5y', 'page' => 'crete']]));
        $data = self::data($res);
        self::assertSame('5y', $data['report']['range']);
        self::assertSame('month', $data['report']['bucket']);
        self::assertSame(2, $data['report']['kpis']['uniques']['value']);
        self::assertStringContainsString('<option value="5y" selected>5 Years</option>', $res->body);
        self::assertStringNotContainsString('value="6y"', $res->body);
        self::assertStringContainsString('<input type="hidden" name="page" value="crete">', $res->body);
        self::assertStringContainsString('<th scope="col">Month</th>', $res->body);
        self::assertStringContainsString('previous 5 years', $res->body);
    }

    public function testTheOldDaysLinksStillWork(): void
    {
        $data = self::data($this->serve(music_admin_signed_in($this->sessions, ['query' => ['days' => '90']])));
        self::assertSame('90d', $data['report']['range']);
    }

    public function testTheJsonCannotCloseItsScriptBlock(): void
    {
        $res = $this->serve(music_admin_signed_in($this->sessions));
        preg_match('#<script type="application/json" id="stats-data">(.*?)</script>#s', $res->body, $m);
        self::assertStringNotContainsString('<', $m[1]);
    }

    public function testTheHubListsTheDashboard(): void
    {
        self::assertSame('stats.php', admin_dashboards()['Visitors']);
    }
}
