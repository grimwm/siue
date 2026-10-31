<?php
// The cleanup that runs inside requests: daily aggregates, cohorts, pruning.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Stats\Days;
use Stats\Rollup;

require_once __DIR__ . '/StatsFakes.php';

final class StatsRollupTest extends TestCase
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

    /** @return array<string, float> */
    private function daily(string $day, string $page): array
    {
        $q = $this->db->prepare('SELECT metric, value FROM daily WHERE day = ? AND page = ? ORDER BY metric');
        $q->execute([$day, $page]);
        return array_map('floatval', $q->fetchAll(PDO::FETCH_KEY_PAIR));
    }

    public function testAFinishedDayRollsUpToWhatTheRawRowsSay(): void
    {
        $a = str_repeat('1', 32);
        $b = str_repeat('2', 32);
        $this->visit($a, 'crete', ['r' => 'discord.com']);
        $this->visit($a, 'home');
        $this->visit($b, 'crete', ['tp' => 5, 'sw' => 390]);
        stats_post($this->c, stats_event('hint', null, ['vid' => $a]));
        $live = Rollup::day($this->db, '2026-10-15');
        $this->clock->now += 86400 + 3600;
        $this->visit($a);
        $crete = $this->daily('2026-10-15', 'crete');
        ksort($live['crete']);
        self::assertSame($live['crete'], $crete);
        self::assertSame(2.0, $crete['views']);
        self::assertSame(2.0, $crete['dau']);
        self::assertSame(1.0, $crete['ref:discord']);
        self::assertSame(1.0, $crete['ev:hint']);
        self::assertSame(2.0, $this->daily('2026-10-15', '*')['dau'], 'a visitor on two pages is one visitor');
        self::assertSame(3.0, $this->daily('2026-10-15', '*')['views']);
    }

    public function testNewAndReturningAndTheTrailingWindows(): void
    {
        $a = str_repeat('1', 32);
        $this->visit($a);
        $this->clock->now += 3 * 86400;
        $this->visit($a);
        $this->visit(str_repeat('2', 32));
        $day = Rollup::day($this->db, '2026-10-18')['crete'];
        self::assertSame(1.0, $day['new']);
        self::assertSame(1.0, $day['returning']);
        self::assertSame(2.0, $day['wau']);
        self::assertSame(2.0, $day['mau']);
    }

    public function testRunningTwiceChangesNothing(): void
    {
        $this->visit(str_repeat('1', 32));
        $this->clock->now += 2 * 86400;
        Stats\Db::write($this->db, fn() => Rollup::run($this->db, $this->clock->now));
        $before = $this->db->query('SELECT * FROM daily ORDER BY day, page, metric')->fetchAll(PDO::FETCH_ASSOC);
        Stats\Db::write($this->db, fn() => Rollup::run($this->db, $this->clock->now));
        Rollup::maybeRun($this->db, $this->clock->now);
        Rollup::maybeRun($this->db, $this->clock->now);
        self::assertSame($before, $this->db->query('SELECT * FROM daily ORDER BY day, page, metric')->fetchAll(PDO::FETCH_ASSOC));
        self::assertNotEmpty($before);
    }

    public function testTheCleanupRunsAtMostHourly(): void
    {
        Rollup::maybeRun($this->db, $this->clock->now);
        $at = $this->db->query("SELECT v FROM meta WHERE k = 'cleanup_at'")->fetchColumn();
        Rollup::maybeRun($this->db, $this->clock->now + 1800);
        self::assertSame($at, $this->db->query("SELECT v FROM meta WHERE k = 'cleanup_at'")->fetchColumn());
        Rollup::maybeRun($this->db, $this->clock->now + 3600);
        self::assertSame((string) ($this->clock->now + 3600), $this->db->query("SELECT v FROM meta WHERE k = 'cleanup_at'")->fetchColumn());
    }

    public function testOldRawRowsArePrunedAndAggregatesKept(): void
    {
        $this->visit(str_repeat('1', 32));
        $this->clock->now += (Days::KEEP + 1) * 86400;
        $this->visit(str_repeat('2', 32));
        self::assertSame(0, (int) $this->db->query("SELECT COUNT(*) FROM hits WHERE day = '2026-10-15'")->fetchColumn());
        self::assertSame(1.0, $this->daily('2026-10-15', 'crete')['views']);
        self::assertSame(1, (int) $this->db->query('SELECT COUNT(*) FROM hits')->fetchColumn());
    }

    public function testCohortReturnRates(): void
    {
        [$a, $b, $c] = [str_repeat('a', 32), str_repeat('b', 32), str_repeat('c', 32)];
        foreach ([$a, $b, $c] as $v) {
            $this->visit($v);
        }
        stats_post($this->c, stats_view(['vid' => null, 'sid' => str_repeat('e', 16)]));
        $this->clock->now += 86400;
        $this->visit($a);
        $this->visit($a, 'home');
        $this->clock->now += 4 * 86400;
        $this->visit($b);
        self::assertSame(['size' => 3, 'd1' => 1, 'd7' => 2], Rollup::cohort($this->db, '2026-10-15', 'crete'), 'no ID, no return rate');
        self::assertSame(['size' => 3, 'd1' => 1, 'd7' => 2], Rollup::cohort($this->db, '2026-10-15', '*'));
        $this->clock->now += 5 * 86400;
        $this->visit(str_repeat('f', 32));
        $row = $this->db->query("SELECT size, d1, d7 FROM cohorts WHERE day = '2026-10-15' AND page = 'crete'")->fetch(PDO::FETCH_ASSOC);
        self::assertSame(['size' => 3, 'd1' => 1, 'd7' => 2], array_map('intval', $row));
    }
}
