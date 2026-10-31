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

    private function report(string $page = '*', string $range = '7d'): array
    {
        return Report::build($this->db, $this->clock->now, $page, $range, ['home', 'crete', 'tankity', 'cylon']);
    }

    public function testTheRangeEndsTodayAndHasOneEntryPerDay(): void
    {
        $r = $this->report('*', '7d');
        self::assertSame('2026-10-09', $r['from']);
        self::assertSame('2026-10-15', $r['to']);
        self::assertCount(7, $r['dates']);
        self::assertCount(7, $r['series']['dau']);
        self::assertSame([0, 0, 0, 0, 0, 0, 0], $r['series']['dau']);
    }

    public function testKpisCompareWithThePreviousPeriod(): void
    {
        // Counting began before the earlier period, so it is whole.
        $this->clock->now -= 14 * 86400;
        $this->visit(str_repeat('3', 32), 'home');
        $this->clock->now += 6 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 8 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->visit(str_repeat('2', 32));
        $this->clock->now += 86400;
        $this->visit(str_repeat('2', 32), 'tankity');
        $r = $this->report('*', '7d');
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

    public function testThePreviousPeriodIsUnknownBeforeTheFirstRecord(): void
    {
        $r = $this->report('*', '90d');
        foreach (['uniques', 'visits', 'dau', 'returning'] as $k) {
            self::assertNull($r['kpis'][$k]['prev'], $k);
        }
        $this->visit(str_repeat('1', 32));
        $r = $this->report('*', '7d');
        self::assertNull($r['kpis']['uniques']['prev'], 'nothing was counted before the range');
        $this->clock->now -= 8 * 86400;
        $this->visit(str_repeat('2', 32));
        $this->clock->now += 8 * 86400;
        $r = $this->report('*', '7d');
        foreach (['uniques', 'visits', 'dau', 'returning'] as $k) {
            self::assertNull($r['kpis'][$k]['prev'], "$k: counting began partway through the earlier period");
        }
    }

    public function testOldVisitsStillCountInLongRanges(): void
    {
        $this->clock->now -= 200 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 50 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 150 * 86400;
        $this->visit(str_repeat('2', 32));
        $r = $this->report('*', '90d');
        self::assertSame(1, $r['kpis']['uniques']['value']);
        self::assertSame(1, $r['kpis']['uniques']['prev'], 'raw rows are kept forever');
        $r = $this->report('*', '1y');
        self::assertSame(2, $r['kpis']['uniques']['value']);
        self::assertSame(3, $r['kpis']['visits']['value']);
        self::assertNull($r['kpis']['uniques']['prev'], 'counting began inside the year');
    }

    public function testAFinishedPeriodIsCountedOnce(): void
    {
        $this->clock->now -= 14 * 86400;
        $this->visit(str_repeat('3', 32), 'home');
        $this->clock->now += 6 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 8 * 86400;
        $this->visit(str_repeat('2', 32));
        self::assertSame(1, $this->report('*', '7d')['kpis']['uniques']['prev']);
        // Days before today never change, so their counts are kept; a row slipped in behind them is not seen.
        $this->db->exec("INSERT INTO hits (at, day, hour, page, kind, sid, dhash, who) VALUES (0, '2026-10-07', 1, 'crete', 'view', 'x', 'x', 'dx')");
        $r = $this->report('*', '7d');
        self::assertSame(1, $r['kpis']['uniques']['prev']);
        self::assertSame(1, $r['kpis']['uniques']['value']);
    }

    /** @return array<string, array{string, string, int}> range => from, bucket, number of buckets */
    public static function ranges(): array
    {
        return [
            '7d' => ['7d', '2026-10-09', 'day', 7],
            '30d' => ['30d', '2026-09-16', 'day', 30],
            '90d' => ['90d', '2026-07-18', 'day', 90],
            '6m' => ['6m', '2026-04-16', 'week', 27],
            '1y' => ['1y', '2025-10-16', 'week', 53],
            '2y' => ['2y', '2024-10-16', 'week', 105],
            '3y' => ['3y', '2023-10-16', 'month', 37],
        ];
    }

    #[PHPUnit\Framework\Attributes\DataProvider('ranges')]
    public function testEachRangeAndItsBuckets(string $range, string $from, string $bucket, int $n): void
    {
        $r = $this->report('*', $range);
        self::assertSame($range, $r['range']);
        self::assertSame($from, $r['from']);
        self::assertSame('2026-10-15', $r['to']);
        self::assertSame(count(Stats\Days::range($from, '2026-10-15')), $r['days']);
        self::assertSame($bucket, $r['bucket']);
        self::assertCount($n, $r['dates']);
        self::assertSame($from, $r['dates'][0], 'the first bucket starts with the range');
        foreach (['views', 'visits', 'dau', 'wau', 'mau', 'new', 'returning'] as $m) {
            self::assertCount($n, $r['series'][$m], $m);
        }
        self::assertCount($n, $r['byPage']['crete']);
        self::assertCount($n, $r['retention']['cohorts']);
        foreach (array_slice($r['dates'], 1) as $d) {
            if ($bucket === 'week') {
                self::assertSame(0, Stats\Days::weekday($d), "$d is a Monday");
            } elseif ($bucket === 'month') {
                self::assertStringEndsWith('-01', $d);
            }
        }
    }

    public function testAWeekSumsVisitsAndAveragesVisitorsADay(): void
    {
        $this->clock->now -= 2 * 86400;
        $this->visit(str_repeat('1', 32));
        $this->visit(str_repeat('2', 32));
        $this->clock->now += 2 * 86400;
        $this->visit(str_repeat('1', 32));
        $r = $this->report('*', '6m');
        self::assertSame('2026-10-12', end($r['dates']));
        self::assertSame(3, end($r['series']['visits']));
        self::assertSame(3, end($r['series']['views']));
        self::assertEqualsWithDelta(3 / 4, end($r['series']['dau']), 0.01, 'Monday to Thursday: four days');
        self::assertEqualsWithDelta(3 / 4, end($r['byPage']['crete']), 0.01);
        self::assertSame(0, $r['series']['visits'][0]);
        self::assertEqualsWithDelta(3 / $r['days'], $r['kpis']['dau']['value'], 1e-9);
    }

    public function testAWeekOfCohortsAddsUp(): void
    {
        [$a, $b] = [str_repeat('a', 32), str_repeat('b', 32)];
        $this->clock->now -= 9 * 86400;
        $this->visit($a);
        $this->visit($b);
        $this->clock->now += 86400;
        $this->visit($a);
        $this->clock->now += 8 * 86400;
        $r = $this->report('crete', '6m');
        $week = $r['retention']['cohorts'][count($r['retention']['cohorts']) - 2];
        self::assertSame(['day' => '2026-10-05', 'size' => 2, 'd1' => 1, 'd7' => 1, 'size1' => 2, 'size7' => 2], $week);
        $now = end($r['retention']['cohorts']);
        self::assertSame(['day' => '2026-10-12', 'size' => 0, 'd1' => 0, 'd7' => null, 'size1' => 0, 'size7' => 0], $now);
    }

    public function testYearsOfData(): void
    {
        self::assertSame(1, Report::yearsOfData($this->db, '2026-10-15'));
        $this->clock->now -= 1500 * 86400;
        $this->visit(str_repeat('1', 32));
        self::assertSame(5, Report::yearsOfData($this->db, '2026-10-15'));
    }

    public function testRangesOutsideTheListAreRefused(): void
    {
        foreach (['13d', '1m', '0y', '1y ', 'y', '100y'] as $bad) {
            self::assertFalse(Report::valid($bad), $bad);
        }
        foreach (['7d', '30d', '90d', '6m', '1y', '2y', '99y'] as $good) {
            self::assertTrue(Report::valid($good), $good);
        }
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
        $r = $this->report('crete', '30d');
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
