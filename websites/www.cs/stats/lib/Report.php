<?php
// The numbers the dashboard draws, for one page (or '*', the whole site) over the last $days days.
// Daily series come from the aggregates (finished days) and the raw rows (today, and any day not rolled yet);
// counts across days (unique visitors, visits, the funnel) come from the raw rows, kept Days::KEEP days.
declare(strict_types=1);

namespace Stats;

final class Report
{
    public const RANGES = [7, 30, 90];
    private const FUNNEL = ['level_start' => 'start', 'level_win' => 'win'];

    /** @var array<string, array<string, array<string, float>>> day => page => metric => value */
    private array $days = [];

    private function __construct(private \PDO $db, private string $today)
    {
    }

    /**
     * @param list<string> $pages the pages the overview splits by
     * @return array<string, mixed>
     */
    public static function build(\PDO $db, int $now, string $page, int $days, array $pages): array
    {
        $today = Days::of($now);
        $r = new self($db, $today);
        $from = Days::add($today, -($days - 1));
        $pto = Days::add($from, -1);
        $pfrom = Days::add($from, -$days);
        $dates = Days::range($from, $today);
        $prevDates = Days::range($pfrom, $pto);
        $r->load($pfrom, $today);
        $rawFrom = Days::add($today, -(Days::KEEP - 1));
        $prevRaw = $pfrom >= $rawFrom;

        $series = [];
        foreach (['views', 'visits', 'dau', 'wau', 'mau', 'new', 'returning'] as $metric) {
            $series[$metric] = $r->series($dates, $page, $metric);
        }
        $prevDau = $r->series($prevDates, $page, 'dau');
        $share = array_map(static fn(int $ret, int $dau): float => $dau > 0 ? $ret / $dau : 0.0, $series['returning'], $series['dau']);
        $byPage = [];
        foreach ($pages as $p) {
            $byPage[$p] = $r->series($dates, $p, 'dau');
        }

        $sum = static fn(string $prefix): array => $r->sumPrefix($dates, $page, $prefix);
        $refs = $sum('ref:');
        $devs = $sum('device:');
        $hours = [];
        foreach ($dates as $d) {
            foreach ($r->metrics($d, $page) as $k => $v) {
                if (str_starts_with($k, 'hour:')) {
                    $hours[Days::weekday($d)][(int) substr($k, 5)] = ($hours[Days::weekday($d)][(int) substr($k, 5)] ?? 0) + (int) $v;
                }
            }
        }
        $heat = [];
        for ($w = 0; $w < 7; $w++) {
            for ($h = 0; $h < 24; $h++) {
                $heat[$w][$h] = $hours[$w][$h] ?? 0;
            }
        }
        $secsSum = array_sum($r->seriesF($dates, $page, 'secs_sum'));
        $secsN = array_sum($r->seriesF($dates, $page, 'secs_n'));

        return [
            'page' => $page,
            'days' => $days,
            'from' => $from,
            'to' => $today,
            'dates' => $dates,
            'kpis' => [
                'uniques' => ['value' => $r->distinct('who', $page, $from, $today), 'prev' => $prevRaw ? $r->distinct('who', $page, $pfrom, $pto) : null, 'spark' => $series['dau']],
                'visits' => ['value' => $r->distinct('sid', $page, $from, $today), 'prev' => $prevRaw ? $r->distinct('sid', $page, $pfrom, $pto) : null, 'spark' => $series['visits']],
                'dau' => ['value' => array_sum($series['dau']) / $days, 'prev' => array_sum($prevDau) / $days, 'spark' => $series['dau']],
                'returning' => ['value' => $r->returningShare($page, $from, $today), 'prev' => $prevRaw ? $r->returningShare($page, $pfrom, $pto) : null, 'spark' => $share],
            ],
            'series' => $series,
            'byPage' => $byPage,
            'referrers' => self::ordered(Classify::REFERRERS, $refs),
            'devices' => self::ordered(Classify::DEVICES, $devs),
            'time' => ['median' => $r->medianSecs($page, $from, $today), 'mean' => $secsN > 0 ? (int) round($secsSum / $secsN) : 0, 'n' => (int) $secsN],
            'retention' => $r->retention($page, $dates),
            'events' => array_map('intval', $sum('ev:')),
            'eventProps' => $page === '*' ? [] : $r->eventProps($page, $from, $today),
            'funnel' => $page === '*' ? [] : $r->funnel($page, $from, $today),
            'heat' => $heat,
        ];
    }

    /** @param list<string> $keys @param array<string, float> $have @return array<string, int> */
    private static function ordered(array $keys, array $have): array
    {
        $out = [];
        foreach ($keys as $k) {
            $out[$k] = (int) ($have[$k] ?? 0);
        }
        return $out;
    }

    /** Loads the aggregates of [$from, $to]; days after the last rollup are computed from the raw rows. */
    private function load(string $from, string $to): void
    {
        $q = $this->db->prepare('SELECT day, page, metric, value FROM daily WHERE day >= ? AND day <= ?');
        $q->execute([$from, $to]);
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$day, $page, $metric, $value]) {
            $this->days[$day][$page][$metric] = (float) $value;
        }
        $done = $this->db->query("SELECT v FROM meta WHERE k = 'rolled_through'")->fetchColumn();
        $live = $done === false ? $from : max($from, Days::add((string) $done, 1));
        if ($live <= $to) {
            foreach (Days::range($live, $to) as $day) {
                $this->days[$day] = Rollup::day($this->db, $day);
            }
        }
    }

    /** @return array<string, float> */
    private function metrics(string $day, string $page): array
    {
        return $this->days[$day][$page] ?? [];
    }

    /** @param list<string> $dates @return list<int> */
    private function series(array $dates, string $page, string $metric): array
    {
        return array_map(fn(string $d): int => (int) ($this->metrics($d, $page)[$metric] ?? 0), $dates);
    }

    /** @param list<string> $dates @return list<float> */
    private function seriesF(array $dates, string $page, string $metric): array
    {
        return array_map(fn(string $d): float => $this->metrics($d, $page)[$metric] ?? 0.0, $dates);
    }

    /** @param list<string> $dates @return array<string, float> suffix => sum */
    private function sumPrefix(array $dates, string $page, string $prefix): array
    {
        $out = [];
        foreach ($dates as $d) {
            foreach ($this->metrics($d, $page) as $k => $v) {
                if (str_starts_with($k, $prefix)) {
                    $key = substr($k, strlen($prefix));
                    $out[$key] = ($out[$key] ?? 0) + $v;
                }
            }
        }
        return $out;
    }

    /** @return array{string, array<string, string>} the page condition on hits h and its argument */
    private static function cond(string $page, string $alias = ''): array
    {
        return $page === '*' ? ['', []] : [" AND {$alias}page = :page", ['page' => $page]];
    }

    private function distinct(string $column, string $page, string $from, string $to): int
    {
        [$cond, $args] = self::cond($page);
        $q = $this->db->prepare("SELECT COUNT(DISTINCT $column) FROM hits WHERE day >= :from AND day <= :to$cond");
        $q->execute(['from' => $from, 'to' => $to] + $args);
        return (int) $q->fetchColumn();
    }

    /** The share of the range's visitors who came on a later day than their first. */
    private function returningShare(string $page, string $from, string $to): float
    {
        $all = $this->distinct('who', $page, $from, $to);
        if ($all === 0) {
            return 0.0;
        }
        [$cond, $args] = self::cond($page, 'h.');
        $q = $this->db->prepare("SELECT COUNT(DISTINCT h.who) FROM hits h JOIN visitors v ON v.vid = h.vid AND v.page = :vpage WHERE h.day >= :from AND h.day <= :to AND h.day > v.first_day$cond");
        $q->execute(['vpage' => $page, 'from' => $from, 'to' => $to] + $args);
        return (int) $q->fetchColumn() / $all;
    }

    private function medianSecs(string $page, string $from, string $to): int
    {
        [$cond, $args] = self::cond($page);
        $where = "FROM hits WHERE day >= :from AND day <= :to AND kind = 'view' AND secs > 0$cond";
        $n = $this->db->prepare("SELECT COUNT(*) $where");
        $n->execute(['from' => $from, 'to' => $to] + $args);
        $count = (int) $n->fetchColumn();
        if ($count === 0) {
            return 0;
        }
        $q = $this->db->prepare("SELECT secs $where ORDER BY secs LIMIT " . (2 - $count % 2) . ' OFFSET ' . intdiv($count - 1, 2));
        $q->execute(['from' => $from, 'to' => $to] + $args);
        $mid = array_map('intval', $q->fetchAll(\PDO::FETCH_COLUMN));
        return (int) round(array_sum($mid) / count($mid));
    }

    /**
     * Day-1 and day-7 return of the range's cohorts that have had the time, with each day's cohort.
     *
     * @param list<string> $dates
     * @return array<string, mixed>
     */
    private function retention(string $page, array $dates): array
    {
        $q = $this->db->prepare('SELECT day, size, d1, d7 FROM cohorts WHERE page = ? AND day >= ? AND day <= ?');
        $q->execute([$page, $dates[0], end($dates)]);
        $final = [];
        foreach ($q->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $final[$row['day']] = ['size' => (int) $row['size'], 'd1' => (int) $row['d1'], 'd7' => (int) $row['d7']];
        }
        $cohorts = [];
        $tot = ['size1' => 0, 'd1' => 0, 'size7' => 0, 'd7' => 0];
        foreach ($dates as $d) {
            $c = $final[$d] ?? Rollup::cohort($this->db, $d, $page);
            $ready1 = $this->today > Days::add($d, 1);
            $ready7 = $this->today > Days::add($d, 7);
            $cohorts[] = ['day' => $d, 'size' => $c['size'], 'd1' => $ready1 ? $c['d1'] : null, 'd7' => $ready7 ? $c['d7'] : null];
            if ($ready1) {
                $tot['size1'] += $c['size'];
                $tot['d1'] += $c['d1'];
            }
            if ($ready7) {
                $tot['size7'] += $c['size'];
                $tot['d7'] += $c['d7'];
            }
        }
        return [
            'd1' => $tot['size1'] > 0 ? $tot['d1'] / $tot['size1'] : null,
            'd7' => $tot['size7'] > 0 ? $tot['d7'] / $tot['size7'] : null,
            'size1' => $tot['size1'],
            'size7' => $tot['size7'],
            'cohorts' => $cohorts,
        ];
    }

    /** Event => property => times sent, for events with a property other than a level. @return array<string, array<string, int>> */
    private function eventProps(string $page, string $from, string $to): array
    {
        $q = $this->db->prepare("SELECT name, prop, COUNT(*) FROM hits WHERE page = ? AND day >= ? AND day <= ? AND kind = 'event' AND prop IS NOT NULL AND name NOT IN ('level_start', 'level_win') GROUP BY name, prop");
        $q->execute([$page, $from, $to]);
        $out = [];
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$name, $prop, $n]) {
            $out[$name][$prop] = (int) $n;
        }
        return $out;
    }

    /** Players who started and who won each level, in level order. @return list<array{level: string, start: int, win: int}> */
    private function funnel(string $page, string $from, string $to): array
    {
        $q = $this->db->prepare("SELECT prop, name, COUNT(DISTINCT who) FROM hits WHERE page = ? AND day >= ? AND day <= ? AND name IN ('level_start', 'level_win') GROUP BY prop, name");
        $q->execute([$page, $from, $to]);
        $levels = [];
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$prop, $name, $n]) {
            $levels[$prop] ??= ['level' => (string) $prop, 'start' => 0, 'win' => 0];
            $levels[$prop][self::FUNNEL[$name]] = (int) $n;
        }
        uksort($levels, static fn($a, $b): int => strnatcmp((string) $a, (string) $b));
        return array_values($levels);
    }
}
