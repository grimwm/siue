<?php
// The ingest endpoint: what it stores, what it drops, and that it never answers with data.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/StatsFakes.php';

final class StatsCollectorTest extends TestCase
{
    private PDO $db;
    private FakeClock $clock;
    private Stats\Collector $c;

    protected function setUp(): void
    {
        $this->db = stats_tmp_db();
        $this->clock = new FakeClock(STATS_NOON);
        $this->c = stats_collector($this->db, $this->clock);
    }

    private function rows(string $kind = 'view'): array
    {
        $q = $this->db->prepare('SELECT * FROM hits WHERE kind = ? ORDER BY id');
        $q->execute([$kind]);
        return $q->fetchAll(PDO::FETCH_ASSOC);
    }

    public function testAViewIsStoredWithItsDayHourAndClasses(): void
    {
        self::assertSame(204, stats_post($this->c, stats_view(['r' => 'l.facebook.com', 'tp' => 5, 'sw' => 390]), [], '198.51.100.7', STATS_PHONE_UA));
        $rows = $this->rows();
        self::assertCount(1, $rows);
        $row = $rows[0];
        self::assertSame('2026-10-15', $row['day']);
        self::assertSame(12, (int) $row['hour']);
        self::assertSame('crete', $row['page']);
        self::assertSame('facebook', $row['ref']);
        self::assertSame('phone', $row['device']);
        self::assertSame(str_repeat('b', 32), $row['vid']);
        self::assertSame(str_repeat('b', 32), $row['who']);
        self::assertMatchesRegularExpression('/^[0-9a-f]{32}$/', $row['dhash']);
    }

    public function testNoIpOrUserAgentIsStoredAnywhere(): void
    {
        stats_post($this->c, stats_view());
        stats_post($this->c, stats_event('hint'));
        $dump = '';
        foreach ($this->db->query("SELECT name FROM sqlite_master WHERE type = 'table'")->fetchAll(PDO::FETCH_COLUMN) as $t) {
            foreach ($this->db->query("SELECT * FROM \"$t\"")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $dump .= json_encode($row) . "\n";
            }
        }
        self::assertStringNotContainsString('198.51.100.7', $dump);
        self::assertStringNotContainsString('Macintosh', $dump);
    }

    public function testWithoutAVisitorIdTheDailyHashIdentifies(): void
    {
        stats_post($this->c, stats_view(['vid' => null]));
        stats_post($this->c, stats_view(['vid' => null, 'sid' => str_repeat('c', 16)]));
        $rows = $this->rows();
        self::assertNull($rows[0]['vid']);
        self::assertSame('d' . $rows[0]['dhash'], $rows[0]['who']);
        self::assertSame($rows[0]['dhash'], $rows[1]['dhash'], 'same address and browser, same day');
        $this->clock->now += 86400;
        stats_post($this->c, stats_view(['vid' => null]));
        self::assertNotSame($rows[0]['dhash'], $this->rows()[2]['dhash'], 'a new day, a new hash');
    }

    public function testOnlyTodaysSaltIsKept(): void
    {
        stats_post($this->c, stats_view());
        $this->clock->now += 86400;
        stats_post($this->c, stats_view());
        self::assertSame(['2026-10-16'], $this->db->query('SELECT day FROM salts')->fetchAll(PDO::FETCH_COLUMN));
    }

    /** @return iterable<string, array{array<string,mixed>, array<string,string>, string}> */
    public static function dropped(): iterable
    {
        yield 'do not track' => [stats_view(), ['dnt' => '1'], STATS_UA];
        yield 'global privacy control' => [stats_view(), ['sec-gpc' => '1'], STATS_UA];
        yield 'a crawler' => [stats_view(), [], 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'];
        yield 'headless chrome' => [stats_view(), [], 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36'];
        yield 'curl' => [stats_view(), [], 'curl/8.9.1'];
        yield 'no user agent' => [stats_view(), [], ''];
        yield 'another site' => [stats_view(), ['origin' => 'https://evil.example'], STATS_UA];
        yield 'a cross-site fetch' => [stats_view(), ['sec-fetch-site' => 'cross-site'], STATS_UA];
        yield 'an unknown page' => [stats_view(['p' => 'nope']), [], STATS_UA];
        yield 'a page that is a path' => [stats_view(['p' => '../admin']), [], STATS_UA];
        yield 'a bad page view id' => [stats_view(['pv' => 'x']), [], STATS_UA];
        yield 'a bad visitor id' => [stats_view(['vid' => 'not-hex']), [], STATS_UA];
        yield 'a numeric visit id' => [stats_view(['sid' => 12345]), [], STATS_UA];
        yield 'an unknown kind' => [stats_view(['t' => 'x']), [], STATS_UA];
        yield 'an unknown event' => [stats_event('steal'), [], STATS_UA];
        yield 'an event of another game' => [stats_event('room_host'), [], STATS_UA];
        yield 'a mode not listed' => [stats_event('game_start', 'cheat'), [], STATS_UA];
        yield 'a level too long' => [stats_event('level_start', str_repeat('1', 40)), [], STATS_UA];
        yield 'a level with markup' => [stats_event('level_start', '<b>'), [], STATS_UA];
        yield 'a prop on an event without one' => [stats_event('hint', 'x'), [], STATS_UA];
        yield 'share on the faculty page' => [stats_event('share', null, ['p' => 'home']), [], STATS_UA];
    }

    /** @dataProvider dropped */
    #[\PHPUnit\Framework\Attributes\DataProvider('dropped')]
    public function testRejectsAndStillAnswers204(array $payload, array $headers, string $ua): void
    {
        self::assertSame(204, stats_post($this->c, $payload, $headers, '198.51.100.7', $ua));
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM hits')->fetchColumn());
    }

    public function testRejectsAnOversizeOrBrokenBody(): void
    {
        $big = json_encode(stats_view(['r' => str_repeat('a', 3000)]));
        self::assertSame(204, $this->c->handle('POST', [], (string) $big, '198.51.100.7', STATS_UA));
        self::assertSame(204, $this->c->handle('POST', [], '{not json', '198.51.100.7', STATS_UA));
        self::assertSame(204, $this->c->handle('POST', [], '[1,2]', '198.51.100.7', STATS_UA));
        self::assertSame(204, $this->c->handle('POST', ['content-length' => '99999'], '{}', '198.51.100.7', STATS_UA));
        self::assertSame(0, (int) $this->db->query('SELECT COUNT(*) FROM hits')->fetchColumn());
    }

    public function testOtherMethodsAre405(): void
    {
        self::assertSame(405, $this->c->handle('GET', [], '', '198.51.100.7', STATS_UA));
        self::assertSame(405, $this->c->handle('PUT', [], '{}', '198.51.100.7', STATS_UA));
    }

    public function testEventsOnTheAllowlistAreStored(): void
    {
        stats_post($this->c, stats_event('game_start', 'continue'));
        stats_post($this->c, stats_event('level_start', '1-3'));
        stats_post($this->c, stats_event('share'));
        stats_post($this->c, stats_event('match_start', 'room', ['p' => 'tankity']));
        stats_post($this->c, stats_event('score_submit', null, ['p' => 'cylon']));
        $rows = $this->rows('event');
        self::assertSame(['game_start', 'level_start', 'share', 'match_start', 'score_submit'], array_column($rows, 'name'));
        self::assertSame(['continue', '1-3', null, 'room', null], array_column($rows, 'prop'));
    }

    public function testATimePingRaisesSecondsToTheMostSeenCapped(): void
    {
        $view = stats_view();
        stats_post($this->c, $view);
        stats_post($this->c, ['t' => 's', 'p' => 'crete', 'pv' => $view['pv'], 'sec' => 30]);
        stats_post($this->c, ['t' => 's', 'p' => 'crete', 'pv' => $view['pv'], 'sec' => 12]);
        self::assertSame(30, (int) $this->rows()[0]['secs']);
        stats_post($this->c, ['t' => 's', 'p' => 'crete', 'pv' => $view['pv'], 'sec' => 999_999]);
        self::assertSame(14400, (int) $this->rows()[0]['secs']);
        stats_post($this->c, ['t' => 's', 'p' => 'crete', 'pv' => $view['pv'], 'sec' => -5]);
        self::assertSame(14400, (int) $this->rows()[0]['secs']);
    }

    public function testAPageViewIdIsCountedOnce(): void
    {
        $view = stats_view();
        stats_post($this->c, $view);
        stats_post($this->c, $view);
        self::assertCount(1, $this->rows());
    }

    public function testTheVisitorsFirstDayIsRemembered(): void
    {
        stats_post($this->c, stats_view());
        $this->clock->now += 3 * 86400;
        stats_post($this->c, stats_view());
        $row = $this->db->query("SELECT first_day, last_day FROM visitors WHERE page = 'crete'")->fetch(PDO::FETCH_ASSOC);
        self::assertSame(['first_day' => '2026-10-15', 'last_day' => '2026-10-18'], $row);
        self::assertSame(1, (int) $this->db->query("SELECT COUNT(*) FROM visitors WHERE page = '*'")->fetchColumn());
    }

    public function testOneClientIsLimitedPerMinute(): void
    {
        for ($i = 0; $i < Stats\Collector::PER_CLIENT_MINUTE + 5; $i++) {
            stats_post($this->c, stats_event('hint'));
        }
        stats_post($this->c, stats_event('hint'), [], '198.51.100.99');
        self::assertSame(Stats\Collector::PER_CLIENT_MINUTE + 1, (int) $this->db->query('SELECT COUNT(*) FROM hits')->fetchColumn());
        $this->clock->now += 60;
        stats_post($this->c, stats_event('hint'));
        self::assertSame(Stats\Collector::PER_CLIENT_MINUTE + 2, (int) $this->db->query('SELECT COUNT(*) FROM hits')->fetchColumn());
    }

    public function testTheDefaultPagesAreHomeAndEveryGame(): void
    {
        $pages = Stats\Collector::sitePages();
        self::assertContains('home', $pages);
        foreach (['crete', 'tankity', 'cylon'] as $game) {
            self::assertContains($game, $pages);
        }
        self::assertNotContains('_kit', $pages);
    }
}
