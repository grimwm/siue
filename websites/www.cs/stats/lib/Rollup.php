<?php
// Daily aggregates and the cleanup. The host has no cron, so a write runs the cleanup at most once an hour:
// finished days roll into `daily`, week-old cohorts into `cohorts`, and old raw rows, salts and limits go.
declare(strict_types=1);

namespace Stats;

final class Rollup
{
    public const EVERY = 3600;
    /** A visitor ID unseen this many days is forgotten. */
    public const FORGET_VISITOR = 400;

    /** The cleanup, when the last one was an hour or more ago (one request claims it; the rest skip). */
    public static function maybeRun(\PDO $db, int $now): void
    {
        $last = $db->query("SELECT v FROM meta WHERE k = 'cleanup_at'")->fetchColumn();
        if ($last !== false && $now - (int) $last < self::EVERY) {
            return;
        }
        Db::write($db, static function () use ($db, $now): void {
            $last = $db->query("SELECT v FROM meta WHERE k = 'cleanup_at'")->fetchColumn();
            if ($last !== false && $now - (int) $last < self::EVERY) {
                return;
            }
            self::run($db, $now);
            $db->prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('cleanup_at', ?)")->execute([(string) $now]);
        });
    }

    /** The whole cleanup, inside the caller's transaction. */
    public static function run(\PDO $db, int $now): void
    {
        $today = Days::of($now);
        $yesterday = Days::add($today, -1);
        $done = $db->query("SELECT v FROM meta WHERE k = 'rolled_through'")->fetchColumn();
        $oldest = $db->query('SELECT MIN(day) FROM hits')->fetchColumn();
        $first = is_string($oldest) ? ($done === false ? $oldest : max($oldest, Days::add((string) $done, 1))) : null;
        if ($first !== null && $first <= $yesterday) {
            $put = $db->prepare('INSERT OR REPLACE INTO daily (day, page, metric, value) VALUES (?, ?, ?, ?)');
            foreach (Days::range($first, $yesterday) as $day) {
                $db->prepare('DELETE FROM daily WHERE day = ?')->execute([$day]);
                foreach (self::day($db, $day) as $page => $metrics) {
                    foreach ($metrics as $metric => $value) {
                        $put->execute([$day, $page, $metric, $value]);
                    }
                }
            }
        }
        $db->prepare("INSERT OR REPLACE INTO meta (k, v) VALUES ('rolled_through', ?)")->execute([$yesterday]);
        // A cohort is final once its seventh day has passed.
        $put = $db->prepare('INSERT OR IGNORE INTO cohorts (day, page, size, d1, d7) VALUES (?, ?, ?, ?, ?)');
        $pending = $db->prepare('SELECT DISTINCT v.first_day, v.page FROM visitors v WHERE v.first_day >= ? AND v.first_day <= ? AND NOT EXISTS (SELECT 1 FROM cohorts c WHERE c.day = v.first_day AND c.page = v.page)');
        $pending->execute([Days::add($today, -Days::KEEP + 8), Days::add($today, -8)]);
        foreach ($pending->fetchAll(\PDO::FETCH_NUM) as [$day, $page]) {
            $c = self::cohort($db, (string) $day, (string) $page);
            $put->execute([$day, $page, $c['size'], $c['d1'], $c['d7']]);
        }
        $cut = Days::add($today, -Days::KEEP);
        $db->prepare('DELETE FROM hits WHERE day < ?')->execute([$cut]);
        $db->prepare('DELETE FROM salts WHERE day <> ?')->execute([$today]);
        $db->prepare('DELETE FROM visitors WHERE last_day < ?')->execute([Days::add($today, -self::FORGET_VISITOR)]);
        $db->prepare('DELETE FROM rate WHERE minute < ?')->execute([intdiv($now, 60)]);
    }

    /** The visitors first seen on $day on $page ('*' for the site) that kept an ID, and how many came back. @return array{size:int,d1:int,d7:int} */
    public static function cohort(\PDO $db, string $day, string $page): array
    {
        $cond = $page === '*' ? '' : ' AND h.page = :page';
        $sql = 'SELECT COUNT(*) AS size,'
            . " COALESCE(SUM(EXISTS (SELECT 1 FROM hits h WHERE h.vid = v.vid AND h.day = :d1$cond)), 0) AS d1,"
            . " COALESCE(SUM(EXISTS (SELECT 1 FROM hits h WHERE h.vid = v.vid AND h.day > :day AND h.day <= :d7$cond)), 0) AS d7"
            . ' FROM visitors v WHERE v.page = :vpage AND v.first_day = :day';
        $q = $db->prepare($sql);
        $args = ['d1' => Days::add($day, 1), 'd7' => Days::add($day, 7), 'day' => $day, 'vpage' => $page];
        if ($page !== '*') {
            $args['page'] = $page;
        }
        $q->execute($args);
        $row = $q->fetch(\PDO::FETCH_ASSOC);
        return ['size' => (int) $row['size'], 'd1' => (int) $row['d1'], 'd7' => (int) $row['d7']];
    }

    /**
     * Every metric of $day from the raw rows, page => metric => value, with '*' for the whole site.
     * Visitors are counted by `who`: the visitor ID when the browser keeps one, else the daily hash.
     *
     * @return array<string, array<string, float>>
     */
    public static function day(\PDO $db, string $day): array
    {
        $q = $db->prepare('SELECT DISTINCT page FROM hits WHERE day = ?');
        $q->execute([$day]);
        $pages = $q->fetchAll(\PDO::FETCH_COLUMN);
        if ($pages === []) {
            return [];
        }
        $out = [];
        foreach (array_merge(['*'], $pages) as $page) {
            $out[$page] = self::pageDay($db, $day, (string) $page);
        }
        return $out;
    }

    /** @return array<string, float> */
    private static function pageDay(\PDO $db, string $day, string $page): array
    {
        $all = $page === '*';
        $cond = $all ? '' : ' AND page = :page';
        $one = static function (string $sql, array $args = []) use ($db, $day, $page, $all): float {
            $q = $db->prepare($sql);
            $q->execute($args + ['day' => $day] + ($all ? [] : ['page' => $page]));
            return (float) $q->fetchColumn();
        };
        $m = [
            'views' => $one("SELECT COUNT(*) FROM hits WHERE day = :day AND kind = 'view'$cond"),
            'visits' => $one("SELECT COUNT(DISTINCT sid) FROM hits WHERE day = :day$cond"),
            'dau' => $one("SELECT COUNT(DISTINCT who) FROM hits WHERE day = :day$cond"),
            'wau' => $one("SELECT COUNT(DISTINCT who) FROM hits WHERE day > :from AND day <= :day$cond", ['from' => Days::add($day, -7)]),
            'mau' => $one("SELECT COUNT(DISTINCT who) FROM hits WHERE day > :from AND day <= :day$cond", ['from' => Days::add($day, -30)]),
            'secs_sum' => $one("SELECT COALESCE(SUM(secs), 0) FROM hits WHERE day = :day AND kind = 'view' AND secs > 0$cond"),
            'secs_n' => $one("SELECT COUNT(*) FROM hits WHERE day = :day AND kind = 'view' AND secs > 0$cond"),
        ];
        $hcond = $all ? '' : ' AND h.page = :page';
        $m['new'] = $one("SELECT COUNT(DISTINCT h.who) FROM hits h LEFT JOIN visitors v ON v.vid = h.vid AND v.page = :vpage WHERE h.day = :day$hcond AND (h.vid IS NULL OR v.first_day IS NULL OR v.first_day >= :day)", ['vpage' => $page]);
        $m['returning'] = $m['dau'] - $m['new'];
        $grouped = static function (string $sql) use ($db, $day, $page, $all): array {
            $q = $db->prepare($sql);
            $q->execute(['day' => $day] + ($all ? [] : ['page' => $page]));
            return $q->fetchAll(\PDO::FETCH_KEY_PAIR);
        };
        // Source and device per visit: those of the visit's first page view that day.
        $firsts = "SELECT MIN(id) FROM hits WHERE day = :day AND kind = 'view'$cond GROUP BY sid";
        foreach ($grouped("SELECT ref, COUNT(*) FROM hits WHERE id IN ($firsts) GROUP BY ref") as $k => $n) {
            $m['ref:' . $k] = (float) $n;
        }
        foreach ($grouped("SELECT device, COUNT(*) FROM hits WHERE id IN ($firsts) GROUP BY device") as $k => $n) {
            $m['device:' . $k] = (float) $n;
        }
        foreach ($grouped("SELECT hour, COUNT(*) FROM hits WHERE day = :day AND kind = 'view'$cond GROUP BY hour") as $k => $n) {
            $m['hour:' . $k] = (float) $n;
        }
        foreach ($grouped("SELECT name, COUNT(*) FROM hits WHERE day = :day AND kind = 'event'$cond GROUP BY name") as $k => $n) {
            $m['ev:' . $k] = (float) $n;
        }
        if (!$all) {
            foreach ($grouped("SELECT name || ':' || prop, COUNT(DISTINCT who) FROM hits WHERE day = :day AND kind = 'event' AND prop IS NOT NULL$cond GROUP BY name, prop") as $k => $n) {
                $m['evp:' . $k] = (float) $n;
            }
        }
        return $m;
    }
}
