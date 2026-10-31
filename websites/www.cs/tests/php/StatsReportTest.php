<?php
// What the dashboard reads: KPIs against the previous period, series, funnel, retention, heatmap.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Stats\Report;

require_once __DIR__ . '/StatsFakes.php';

final class StatsReportTest extends TestCase
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

    private function visit(string $vid, string $page = 'crete', array $with = []): void
    {
        stats_post($this->c, stats_view(['vid' => $vid, 'p' => $page, 'sid' => substr(hash('sha256', $vid . $this->clock->now), 0, 16)] + $with));
    }

    private function event(string $vid, string $name, ?string $prop = null): void
    {
        stats_post($this->c, stats_event($name, $prop, ['vid' => $vid]));
    }

    private function report(string $page = '*', int $days = 7): array
    {
        return Report::build($this->db, $this->clock->now, $page, $days, ['home', 'crete', 'tankity', 'cylon']);
    }

    public function testTheRangeEndsTodayAndHasOneEntryPerDay(): void
    {
        $r = $this->report('*', 7);
        self::assertSame('2026-10-09', $r['from']);
        self::assertSame('2026-10-15', $r['to']);
        self::assertCount(7, $r['dates']);
        self::assertCount(7, $r['series']['dau']);
        self::assertSame([0, 0, 0, 0, 0, 0, 0], $r['series']['dau']);
    }

    public function testKpisCompareWithThePreviousPeriod(): void
    {
        $this->clock->now -= 8 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 8 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->visit(str_repeat('2', 32));
        $this->clock->now += 86400;
        $this->visit(str_repeat('2', 32), 'tankity');
        $r = $this->report('*', 7);
        self::assertSame(2, $r['kpis']['uniques']['value']);
        self::assertSame(1, $r['kpis']['uniques']['prev']);
        self::assertSame(3, $r['kpis']['visits']['value']);
        self::assertEqualsWithDelta(1.0, $r['kpis']['returning']['value'], 1e-9, 'both came back on a later day than their first');
        self::assertSame(0.0, $r['kpis']['returning']['prev']);
        self::assertSame([0, 0, 0, 0, 0, 2, 1], $r['series']['dau']);
        self::assertEqualsWithDelta(3 / 7, $r['kpis']['dau']['value'], 1e-9);
        self::assertSame([0, 0, 0, 0, 0, 2, 0], $r['byPage']['crete']);
        self::assertSame([0, 0, 0, 0, 0, 0, 1], $r['byPage']['tankity']);
    }

    public function testThePreviousPeriodIsUnknownPastTheRawRows(): void
    {
        $r = $this->report('*', 90);
        self::assertNull($r['kpis']['uniques']['prev']);
        self::assertNotNull($r['kpis']['dau']['prev'], 'daily aggregates are kept forever');
    }

    public function testAPageReportCountsOnlyThatPage(): void
    {
        $this->visit(str_repeat('1', 32), 'crete', ['r' => 'www.google.com']);
        $this->visit(str_repeat('2', 32), 'home');
        $r = $this->report('crete');
        self::assertSame(1, $r['kpis']['uniques']['value']);
        self::assertSame(1, $r['referrers']['search']);
        self::assertSame(0, $r['referrers']['direct']);
        self::assertSame(['facebook', 'discord', 'search', 'site', 'direct', 'other'], array_keys($r['referrers']));
        self::assertSame(['phone', 'tablet', 'desktop'], array_keys($r['devices']));
    }

    public function testTheLevelFunnelCountsPlayersInLevelOrder(): void
    {
        [$a, $b] = [str_repeat('a', 32), str_repeat('b', 32)];
        $this->event($a, 'level_start', '1-1');
        $this->event($a, 'level_win', '1-1');
        $this->event($a, 'level_start', '1-2');
        $this->event($a, 'level_start', '1-10');
        $this->event($b, 'level_start', '1-1');
        $this->event($b, 'level_start', '1-1');
        $this->event($b, 'game_start', 'new');
        $r = $this->report('crete');
        self::assertSame([
            ['level' => '1-1', 'start' => 2, 'win' => 1],
            ['level' => '1-2', 'start' => 1, 'win' => 0],
            ['level' => '1-10', 'start' => 1, 'win' => 0],
        ], $r['funnel']);
        self::assertSame(5, $r['events']['level_start']);
        self::assertSame(['new' => 1], $r['eventProps']['game_start']);
    }

    public function testTimeOnPage(): void
    {
        foreach ([10, 20, 600] as $i => $sec) {
            $v = stats_view(['vid' => str_repeat((string) $i, 32)]);
            stats_post($this->c, $v);
            stats_post($this->c, ['t' => 's', 'p' => 'crete', 'pv' => $v['pv'], 'sec' => $sec]);
        }
        $r = $this->report('crete');
        self::assertSame(20, $r['time']['median']);
        self::assertSame(210, $r['time']['mean']);
    }

    public function testRetentionOverTheRange(): void
    {
        $this->clock->now -= 9 * 86400;
        [$a, $b] = [str_repeat('a', 32), str_repeat('b', 32)];
        $this->visit($a);
        $this->visit($b);
        $this->clock->now += 86400;
        $this->visit($a);
        $this->clock->now += 8 * 86400;
        $r = $this->report('crete', 30);
        self::assertEqualsWithDelta(0.5, $r['retention']['d1'], 1e-9);
        self::assertEqualsWithDelta(0.5, $r['retention']['d7'], 1e-9);
        self::assertSame(2, $r['retention']['size7']);
    }

    public function testTheHeatmapIsWeekdayByHour(): void
    {
        $this->visit(str_repeat('a', 32));
        $r = $this->report('*');
        self::assertCount(7, $r['heat']);
        self::assertCount(24, $r['heat'][0]);
        self::assertSame(1, $r['heat'][3][12], 'Thursday noon');
        self::assertSame(1, array_sum(array_map('array_sum', $r['heat'])));
    }
}
