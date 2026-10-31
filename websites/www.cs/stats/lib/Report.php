<?php
// The numbers the dashboard draws, for one page (or '*', the whole site) over a range ending today.
// Daily series come from the aggregates (finished days) and the raw rows (today, and any day not rolled yet);
// counts across days (unique visitors, visits, the funnel) come from the raw rows. Both are kept forever.
// Long ranges draw by week or by month: visits and views add up, visitor counts are averages a day.
declare(strict_types=1);

namespace Stats;

final class Report
{
    /** The fixed ranges, key => label; any number of years from 2 up ('3y') is a range too. */
    public const RANGES = ['7d' => '7 Days', '30d' => '30 Days', '90d' => '90 Days', '6m' => '6 Months', '1y' => '1 Year'];
    public const DEFAULT = '30d';
    /** Ranges longer than this many days draw by week, and longer than the second by month. */
    public const WEEKLY_PAST = 120;
    public const MONTHLY_PAST = 731;
    private const FUNNEL = ['level_start' => 'start', 'level_win' => 'win'];
    /** The per-day metrics of the chosen page the report reads from the aggregates. */
    private const SERIES = ['views', 'visits', 'dau', 'wau', 'mau', 'new', 'returning', 'secs_sum', 'secs_n'];
    /** Visitor counts: a week or month shows their average a day; the other series add up. */
    private const AVERAGED = ['dau', 'wau', 'mau', 'new', 'returning'];

    /** @var array<string, array<string, array<string, float>>> day => page => metric => value, from `daily` */
    private array $days = [];
    /** @var array<string, array<string, array<string, float>>> day => page => metric => value, days not rolled up yet */
    private array $live = [];

    private function __construct(private \PDO $db, private string $today)
    {
    }

    /** Whether $range names a range: one of RANGES, or 2 to 99 years. */
    public static function valid(string $range): bool
    {
        return isset(self::RANGES[$range]) || preg_match('/^[1-9][0-9]?y$/D', $range) === 1 && (int) $range >= 2;
    }

    /** The first day of $range when it ends on $today. */
    public static function start(string $range, string $today): string
    {
        if (!self::valid($range)) {
            throw new \InvalidArgumentException('not a range: ' . $range);
        }
        $n = (int) $range;
        return match (substr($range, -1)) {
            'd' => Days::add($today, -($n - 1)),
            'm' => Days::add(Days::shift($today, -$n, 'month'), 1),
            default => Days::add(Days::shift($today, -$n, 'year'), 1),
        };
    }

    /** How many years back the numbers go from $today, at least 1: the most a "Years" range needs. */
    public static function yearsOfData(\PDO $db, string $today): int
    {
        // The daily totals can reach back further than the raw rows.
        $days = [self::firstDay($db), $db->query('SELECT MIN(day) FROM daily')->fetchColumn()];
        $days = array_filter($days, 'is_string');
        $first = $days === [] ? null : min($days);
        $n = 1;
        while ($first !== null && $n < 99 && self::start($n . 'y', $today) > $first) {
            $n++;
        }
        return $n;
    }

    private static function firstDay(\PDO $db): ?string
    {
        $first = $db->query('SELECT MIN(day) FROM hits')->fetchColumn();
        return is_string($first) ? $first : null;
    }

    /** The first day of $day's bucket. */
    private static function bucketOf(string $day, string $bucket): string
    {
        return match ($bucket) {
            'week' => Days::add($day, -Days::weekday($day)),
            'month' => substr($day, 0, 8) . '01',
            default => $day,
        };
    }

    /**
     * @param string $range a key that valid() accepts
     * @param list<string> $pages the pages the overview splits by
     * @return array<string, mixed>
     */
    public static function build(\PDO $db, int $now, string $page, string $range, array $pages): array
    {
        $today = Days::of($now);
        $r = new self($db, $today);
        $from = self::start($range, $today);
        $dates = Days::range($from, $today);
        $days = count($dates);
        $pto = Days::add($from, -1);
        $pfrom = Days::add($from, -$days);
        $prevDates = Days::range($pfrom, $pto);
        $bucket = $days > self::MONTHLY_PAST ? 'month' : ($days > self::WEEKLY_PAST ? 'week' : 'day');
        $r->load($pfrom, $today, $page, $pages);
        $first = self::firstDay($db);
        // The earlier period compares only when counting had begun by its first day, so a sliver is never "the
        // previous 3 years".
        $known = $first !== null && $first <= $pfrom;
        $now = $r->counts($page, $from, $today);
        $prev = $known ? $r->finished($page, $pfrom, $pto) : ['who' => null, 'sid' => null, 'returning' => null];

        // The buckets: each one's first day (the range's first day for the first one) and its days' indexes.
        $groups = [];
        foreach ($dates as $i => $d) {
            $groups[max($from, self::bucketOf($d, $bucket))][] = $i;
        }
        $fold = static function (array $daily, bool $average) use ($groups, $bucket): array {
            if ($bucket === 'day') {
                return $daily;
            }
            $out = [];
            foreach ($groups as $idx) {
                $sum = 0;
                foreach ($idx as $i) {
                    $sum += $daily[$i];
                }
                $out[] = $average ? round($sum / count($idx), 2) : $sum;
            }
            return $out;
        };

        $daily = [];
        $series = [];
        foreach (['views', 'visits', 'dau', 'wau', 'mau', 'new', 'returning'] as $metric) {
            $daily[$metric] = $r->series($dates, $page, $metric);
            $series[$metric] = $fold($daily[$metric], in_array($metric, self::AVERAGED, true));
        }
        $prevDau = $r->series($prevDates, $page, 'dau');
        $share = array_map(static fn($ret, $dau): float => $dau > 0 ? $ret / $dau : 0.0, $series['returning'], $series['dau']);
        $byPage = [];
        foreach ($pages as $p) {
            $byPage[$p] = $fold($r->series($dates, $p, 'dau'), true);
        }

        $secsSum = array_sum($r->seriesF($dates, $page, 'secs_sum'));
        $secsN = array_sum($r->seriesF($dates, $page, 'secs_n'));

        return [
            'page' => $page,
            'range' => $range,
            'days' => $days,
            'bucket' => $bucket,
            'from' => $from,
            'to' => $today,
            'dates' => array_keys($groups),
            'kpis' => [
                'uniques' => ['value' => $now['who'], 'prev' => $prev['who'], 'spark' => $series['dau']],
                'visits' => ['value' => $now['sid'], 'prev' => $prev['sid'], 'spark' => $series['visits']],
                'dau' => ['value' => array_sum($daily['dau']) / $days, 'prev' => $known ? array_sum($prevDau) / $days : null, 'spark' => $series['dau']],
                'returning' => ['value' => $now['returning'], 'prev' => $prev['returning'], 'spark' => $share],
            ],
            'series' => $series,
            'byPage' => $byPage,
            'referrers' => self::ordered(Classify::REFERRERS, $r->totals($page, $from, $today, 'ref:')),
            'devices' => self::ordered(Classify::DEVICES, $r->totals($page, $from, $today, 'device:')),
            'time' => ['median' => $r->medianSecs($page, $from, $today), 'mean' => $secsN > 0 ? (int) round($secsSum / $secsN) : 0, 'n' => (int) $secsN],
            'retention' => $r->retention($page, $dates, $groups),
            'events' => array_map('intval', $r->totals($page, $from, $today, 'ev:')),
            'eventProps' => $page === '*' ? [] : $r->eventProps($page, $from, $today),
            'funnel' => $page === '*' ? [] : $r->funnel($page, $from, $today),
            'heat' => $r->heat($page, $from, $today),
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

    /** The first day the aggregates do not hold yet. */
    private function liveFrom(): string
    {
        $done = $this->db->query("SELECT v FROM meta WHERE k = 'rolled_through'")->fetchColumn();
        return $done === false ? '' : Days::add((string) $done, 1);
    }

    /**
     * Loads, over [$from, $to], $page's SERIES and every page's dau from the aggregates; days after the last
     * rollup are computed whole from the raw rows.
     *
     * @param list<string> $pages
     */
    private function load(string $from, string $to, string $page, array $pages): void
    {
        $in = static fn(array $list): string => implode(', ', array_fill(0, count($list), '?'));
        $q = $this->db->prepare('SELECT day, page, metric, value FROM daily WHERE page = ? AND metric IN (' . $in(self::SERIES) . ') AND day >= ? AND day <= ?');
        $q->execute(array_merge([$page], self::SERIES, [$from, $to]));
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$day, $p, $metric, $value]) {
            $this->days[$day][$p][$metric] = (float) $value;
        }
        if ($pages !== []) {
            $q = $this->db->prepare("SELECT day, page, value FROM daily WHERE page IN (" . $in($pages) . ") AND metric = 'dau' AND day >= ? AND day <= ?");
            $q->execute(array_merge($pages, [$from, $to]));
            foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$day, $p, $value]) {
                $this->days[$day][$p]['dau'] = (float) $value;
            }
        }
        $live = max($from, $this->liveFrom());
        if ($live <= $to) {
            foreach (Days::range($live, $to) as $day) {
                $this->live[$day] = Rollup::day($this->db, $day);
            }
        }
    }

    /** @return array<string, float> */
    private function metrics(string $day, string $page): array
    {
        return $this->live[$day][$page] ?? $this->days[$day][$page] ?? [];
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

    /** Each metric named $prefix + key, summed over [$from, $to]. @return array<string, float> key => sum */
    private function totals(string $page, string $from, string $to, string $prefix): array
    {
        $out = [];
        $q = $this->db->prepare('SELECT metric, SUM(value) FROM daily WHERE page = ? AND metric >= ? AND metric < ? AND day >= ? AND day <= ? GROUP BY metric');
        $q->execute([$page, $prefix, substr($prefix, 0, -1) . chr(ord(substr($prefix, -1)) + 1), $from, $to]);
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$metric, $sum]) {
            $out[substr((string) $metric, strlen($prefix))] = (float) $sum;
        }
        foreach ($this->live as $day => $byPage) {
            if ($day < $from || $day > $to) {
                continue;
            }
            foreach ($byPage[$page] ?? [] as $k => $v) {
                if (str_starts_with($k, $prefix)) {
                    $key = substr($k, strlen($prefix));
                    $out[$key] = ($out[$key] ?? 0) + $v;
                }
            }
        }
        return $out;
    }

    /** Page views by weekday (0 = Monday) and hour over [$from, $to]. @return list<list<int>> */
    private function heat(string $page, string $from, string $to): array
    {
        $heat = array_fill(0, 7, array_fill(0, 24, 0));
        $add = static function (string $metric, int $weekday, float $n) use (&$heat): void {
            $heat[$weekday][(int) substr($metric, 5)] += (int) $n;
        };
        // strftime('%w') counts from Sunday.
        $q = $this->db->prepare("SELECT metric, CAST(strftime('%w', day) AS INTEGER), SUM(value) FROM daily WHERE page = ? AND metric >= 'hour:' AND metric < 'hour;' AND day >= ? AND day <= ? GROUP BY metric, 2");
        $q->execute([$page, $from, $to]);
        foreach ($q->fetchAll(\PDO::FETCH_NUM) as [$metric, $w, $n]) {
            $add((string) $metric, ((int) $w + 6) % 7, (float) $n);
        }
        foreach ($this->live as $day => $byPage) {
            if ($day < $from || $day > $to) {
                continue;
            }
            foreach ($byPage[$page] ?? [] as $k => $v) {
                if (str_starts_with($k, 'hour:')) {
                    $add($k, Days::weekday($day), $v);
                }
            }
        }
        return $heat;
    }

    /** @return array{string, array<string, string>} the page condition on hits h and its argument */
    private static function cond(string $page, string $alias = ''): array
    {
        return $page === '*' ? ['', []] : [" AND {$alias}page = :page", ['page' => $page]];
    }

    /**
     * counts() of a period that ended before today. Rows are only ever added for today
     * and never deleted, so these numbers are final: they are counted once and kept in `memo`.
     *
     * @return array{who: int, sid: int, returning: float}
     */
    private function finished(string $page, string $from, string $to): array
    {
        $key = "kpis|$page|$from|$to";
        $q = $this->db->prepare('SELECT v FROM memo WHERE k = ?');
        $q->execute([$key]);
        $kept = $q->fetchColumn();
        $out = is_string($kept) ? json_decode($kept, true) : null;
        if (is_array($out) && isset($out['who'], $out['sid'], $out['returning'])) {
            return ['who' => (int) $out['who'], 'sid' => (int) $out['sid'], 'returning' => (float) $out['returning']];
        }
        $out = $this->counts($page, $from, $to);
        if ($to < $this->today) {
            // Only a cache: when a write holds the database too long, show the numbers without keeping them.
            try {
                $this->db->prepare('INSERT OR REPLACE INTO memo (k, v) VALUES (?, ?)')->execute([$key, json_encode($out, JSON_THROW_ON_ERROR)]);
            } catch (\PDOException $e) {
                error_log('stats: memo not kept: ' . $e->getMessage());
            }
        }
        return $out;
    }

    /**
     * Over [$from, $to]: distinct visitors (who), distinct visits (sid), and the share of those visitors who came
     * on a later day than their first. A visitor's latest day in the range is after their first day exactly when
     * they came back in it. Only visitor IDs are in `visitors`; a hashed who ('d' and 32 characters) never
     * equals one, so it counts as a visitor but never as returning.
     *
     * @return array{who: int, sid: int, returning: float}
     */
    private function counts(string $page, string $from, string $to): array
    {
        [$cond, $args] = self::cond($page);
        $args += ['from' => $from, 'to' => $to];
        $q = $this->db->prepare("SELECT COUNT(*), COALESCE(SUM(v.first_day IS NOT NULL AND h.last > v.first_day), 0) FROM (SELECT who, MAX(day) AS last FROM hits WHERE day >= :from AND day <= :to$cond GROUP BY who) h LEFT JOIN visitors v ON v.vid = h.who AND v.page = :vpage");
        $q->execute($args + ['vpage' => $page]);
        [$who, $back] = array_map('intval', $q->fetch(\PDO::FETCH_NUM));
        $q = $this->db->prepare("SELECT COUNT(DISTINCT sid) FROM hits WHERE day >= :from AND day <= :to$cond");
        $q->execute($args);
        return ['who' => $who, 'sid' => (int) $q->fetchColumn(), 'returning' => $who > 0 ? (float) $back / $who : 0.0];
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
     * Day-1 and day-7 return of the range's cohorts that have had the time, with each bucket's cohorts added up:
     * size counts every new visitor, size1 and size7 those whose day 1 or day 7 has passed.
     *
     * @param list<string> $dates
     * @param array<string, list<int>> $groups bucket => indexes into $dates
     * @return array<string, mixed>
     */
    private function retention(string $page, array $dates, array $groups): array
    {
        $q = $this->db->prepare('SELECT day, size, d1, d7 FROM cohorts WHERE page = ? AND day >= ? AND day <= ?');
        $q->execute([$page, $dates[0], end($dates)]);
        $final = [];
        foreach ($q->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $final[$row['day']] = ['size' => (int) $row['size'], 'd1' => (int) $row['d1'], 'd7' => (int) $row['d7']];
        }
        // Through `cohorts_through` every cohort with a new visitor has its row; a day without one had none.
        $through = (string) $this->db->query("SELECT v FROM meta WHERE k = 'cohorts_through'")->fetchColumn();
        $none = ['size' => 0, 'd1' => 0, 'd7' => 0];
        $cohorts = [];
        $tot = ['size1' => 0, 'd1' => 0, 'size7' => 0, 'd7' => 0];
        foreach ($groups as $start => $idx) {
            $b = ['day' => $start, 'size' => 0, 'd1' => null, 'd7' => null, 'size1' => 0, 'size7' => 0];
            foreach ($idx as $i) {
                $d = $dates[$i];
                $c = $final[$d] ?? ($d <= $through ? $none : Rollup::cohort($this->db, $d, $page));
                $b['size'] += $c['size'];
                if ($this->today > Days::add($d, 1)) {
                    $b['size1'] += $c['size'];
                    $b['d1'] = ($b['d1'] ?? 0) + $c['d1'];
                }
                if ($this->today > Days::add($d, 7)) {
                    $b['size7'] += $c['size'];
                    $b['d7'] = ($b['d7'] ?? 0) + $c['d7'];
                }
            }
            $cohorts[] = $b;
            $tot['size1'] += $b['size1'];
            $tot['d1'] += $b['d1'] ?? 0;
            $tot['size7'] += $b['size7'];
            $tot['d7'] += $b['d7'] ?? 0;
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
