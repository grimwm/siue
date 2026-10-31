<?php
// admin/stats.php: the owner's view of the statistics. The page carries the report as a JSON block that
// admin/stats.js draws as charts; every chart's numbers are also in a table beneath it.
declare(strict_types=1);

namespace Stats;

use Admin\Html;
use Admin\Headers;
use Admin\Pages;
use Admin\Request;
use Admin\Response;

final class Dashboard
{
    /**
     * GET admin/stats.php. Signed out, the login redirect, before the stats database is opened.
     *
     * @param callable(): \PDO $open opens the stats database
     * @param list<string>|null $pages the pages counted; defaults to Collector::sitePages()
     */
    public static function serve(Pages $p, Request $r, callable $open, int $now, ?array $pages = null): Response
    {
        $gate = $p->requireAdmin($r, 'stats.php');
        if ($gate !== null) {
            return $gate;
        }
        $pages ??= Collector::sitePages();
        $page = $r->query['page'] ?? '*';
        $page = is_string($page) && in_array($page, $pages, true) ? $page : '*';
        $range = $r->query['range'] ?? null;
        $days = $r->query['days'] ?? null;
        // Links from before the longer ranges said ?days=7, 30 or 90.
        if ($range === null && is_string($days) && in_array($days, ['7', '30', '90'], true)) {
            $range = $days . 'd';
        }
        try {
            $db = $open();
            $years = Report::yearsOfData($db, Days::of($now));
            $range = is_string($range) && Report::valid($range) && (isset(Report::RANGES[$range]) || (int) $range <= max(2, $years)) ? $range : Report::DEFAULT;
            $report = Report::build($db, $now, $page, $range, $pages);
        } catch (\Throwable $e) {
            error_log('stats: dashboard: ' . get_class($e) . ': ' . $e->getMessage());
            return Pages::storageDown();
        }
        $labels = self::labels($pages);
        $json = json_encode(['report' => $report, 'labels' => $labels], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
        $body = self::filters($page, $range, max(2, $years), $labels) . self::body($report, $labels)
            . '<script type="application/json" id="stats-data">' . $json . '</script>'
            . '<p class="back"><a href="index.php">Back to the hub</a> · <a href="../privacy.html">What is counted</a></p>';
        $head = '<link rel="stylesheet" href="stats.css"><script src="stats.js" defer></script>';
        return new Response(200, Headers::apply(['Content-Type' => 'text/html; charset=utf-8']), Html::page('Visitors', $body, false, $head, 'admin.css', 'light dark', 'card dash'));
    }

    /** Page id => short name: 'Faculty page', else the game's short_name (or title). @param list<string> $pages @return array<string, string> */
    public static function labels(array $pages, ?string $games = null): array
    {
        $games ??= __DIR__ . '/../../games';
        $out = [];
        foreach ($pages as $id) {
            if ($id === 'home') {
                $out[$id] = 'Faculty page';
                continue;
            }
            $yaml = (string) @file_get_contents("$games/$id/metadata.yaml");
            $name = preg_match('/^short_name:\s*(.+)$/m', $yaml, $m) === 1 || preg_match('/^title:\s*(.+)$/m', $yaml, $m) === 1 ? trim($m[1], " \t\"'") : $id;
            $out[$id] = $name;
        }
        return $out;
    }

    private static function link(string $page, string $range): string
    {
        $q = http_build_query(($page === '*' ? [] : ['page' => $page]) + ($range === Report::DEFAULT ? [] : ['range' => $range]));
        return 'stats.php' . ($q === '' ? '' : '?' . $q);
    }

    /**
     * The range choices (fixed ones as links, then a choice of 2 to $years years) and the page tabs.
     *
     * @param array<string, string> $labels
     */
    private static function filters(string $page, string $range, int $years, array $labels): string
    {
        $out = '<nav class="filters" aria-label="What to show"><div class="seg" role="group" aria-label="Range">';
        foreach (Report::RANGES as $key => $label) {
            $out .= '<a href="' . Html::e(self::link($page, $key)) . '"' . ($key === $range ? ' aria-current="page"' : '') . '>' . Html::e($label) . '</a>';
        }
        $many = !isset(Report::RANGES[$range]);
        $out .= '<form class="years' . ($many ? ' on' : '') . '" method="get" action="stats.php">'
            . ($page === '*' ? '' : '<input type="hidden" name="page" value="' . Html::e($page) . '">')
            . '<label>Years <select name="range"' . ($many ? ' aria-current="page"' : '') . '>'
            . ($many ? '' : '<option value="" selected disabled>Pick</option>');
        for ($n = 2; $n <= $years; $n++) {
            $out .= '<option value="' . $n . 'y"' . ($range === $n . 'y' ? ' selected' : '') . '>' . $n . ' Years</option>';
        }
        $out .= '</select></label> <button type="submit">Show</button></form>';
        $out .= '</div><div class="seg tabs" role="group" aria-label="Page">';
        foreach (['*' => 'Overview'] + $labels as $id => $label) {
            $out .= '<a href="' . Html::e(self::link((string) $id, $range)) . '"' . ((string) $id === $page ? ' aria-current="page"' : '') . '>' . Html::e($label) . '</a>';
        }
        return $out . '</div></nav>';
    }

    /** "previous 30 days", "previous 6 months", "previous year", "previous 3 years". */
    private static function period(string $range): string
    {
        $n = (int) $range;
        $unit = ['d' => 'day', 'm' => 'month', 'y' => 'year'][substr($range, -1)];
        return 'previous ' . ($n === 1 ? $unit : $n . ' ' . $unit . 's');
    }

    /** @param array<string, mixed> $r @param array<string, string> $labels */
    private static function body(array $r, array $labels): string
    {
        $one = $r['page'] !== '*';
        $period = self::period($r['range']);
        $by = ['day' => '', 'week' => ', averaged over each week', 'month' => ', averaged over each month'][$r['bucket']];
        $each = ['day' => 'day', 'week' => 'week', 'month' => 'month'][$r['bucket']];
        $when = ['day' => 'Day', 'week' => 'Week of', 'month' => 'Month'][$r['bucket']];
        $out = Html::p(self::date($r['from']) . ' to ' . self::date($r['to']) . ($one ? ' · ' . $labels[$r['page']] : ' · every page') . ' · days in Chicago time'
            . ($r['bucket'] === 'day' ? '' : ' · charts by ' . $each), 'range');
        $k = $r['kpis'];
        $out .= '<section class="kpis" aria-label="Headline numbers">'
            . self::kpi('uniques', 'Unique visitors', self::num($k['uniques']['value']), $k['uniques'], $period)
            . self::kpi('visits', 'Visits', self::num($k['visits']['value']), $k['visits'], $period)
            . self::kpi('dau', 'Daily visitors', self::num($k['dau']['value'], 1), $k['dau'], $period, 'average a day')
            . self::kpi('returning', 'Returning', self::pct($k['returning']['value']), $k['returning'], $period, 'of visitors came back')
            . '</section>';
        $dates = $r['dates'];
        $s = $r['series'];
        if ($one) {
            $out .= self::viz('daily', 'Visitors and visits each ' . $each, $r['bucket'] === 'day' ? 'Unique visitors and visits per day.' : 'Unique visitors a day, averaged over each ' . $each . ', and the ' . $each . '\'s visits.', [$when, 'Visitors', 'Visits', 'Page views'], array_map(null, $dates, $s['dau'], $s['visits'], $s['views']));
        } else {
            $rows = [];
            foreach ($dates as $i => $d) {
                $row = [$d];
                foreach (array_keys($labels) as $p) {
                    $row[] = $r['byPage'][$p][$i];
                }
                $row[] = $s['dau'][$i];
                $rows[] = $row;
            }
            $out .= self::viz('byPage', 'Daily visitors by page', 'Unique visitors per day on each page' . $by . '. Press a name to hide or show its line.', array_merge([$when], array_values($labels), ['Every page']), $rows);
        }
        $out .= self::viz('newret', 'New and returning visitors', 'Each day\'s visitors: first time here, or back again' . $by . '.', [$when, 'New', 'Returning'], array_map(null, $dates, $s['new'], $s['returning']));
        $out .= self::viz('active', 'Active visitors', 'Distinct visitors that day (DAU), in the 7 days to it (WAU) and in the 30 days to it (MAU)' . $by . '.', [$when, 'DAU', 'WAU', 'MAU'], array_map(null, $dates, $s['dau'], $s['wau'], $s['mau']));
        $ret = $r['retention'];
        $out .= self::viz('retention', 'Coming back', 'Of each ' . $each . '\'s new visitors, the share back the next day and within 7 days. ' . ($ret['d1'] === null ? 'Not enough days yet.' : 'Day 1: ' . self::pct($ret['d1']) . ' of ' . $ret['size1'] . '. Day 7: ' . ($ret['d7'] === null ? 'not yet' : self::pct($ret['d7']) . ' of ' . $ret['size7']) . '.'),
            [$r['bucket'] === 'day' ? 'First day' : $when, 'New visitors', 'Back next day', 'Back within 7 days'],
            array_map(static fn(array $c): array => [$c['day'], $c['size'], $c['d1'] ?? '…', $c['d7'] ?? '…'], $ret['cohorts']));
        if ($one && ($r['funnel'] !== [] || $r['page'] === 'crete')) {
            $out .= self::viz('funnel', 'Level funnel', 'Players who started and who won each level. Where the bars shrink, players stopped.', ['Level', 'Started', 'Won'], array_map(static fn(array $f): array => [$f['level'], $f['start'], $f['win']], $r['funnel']));
        }
        if ($r['events'] !== []) {
            $rows = [];
            foreach ($r['events'] as $name => $n) {
                $props = $r['eventProps'][$name] ?? [];
                $rows[] = [$name, $n, implode(', ', array_map(static fn($p, $c) => "$p: $c", array_keys($props), $props))];
            }
            $out .= self::viz('events', 'Game events', 'How often each event was sent.', ['Event', 'Times', 'By kind'], $rows);
        }
        $out .= '<div class="pair">'
            . self::viz('referrers', 'Where visits come from', 'Each visit by the site that sent it.', ['Source', 'Visits'], self::pairs($r['referrers'], ['facebook' => 'Facebook', 'discord' => 'Discord', 'search' => 'Search', 'site' => 'This site', 'direct' => 'Direct', 'other' => 'Other']))
            . self::viz('devices', 'Devices', 'Each visit by the kind of device.', ['Device', 'Visits'], self::pairs($r['devices'], ['phone' => 'Phone', 'tablet' => 'Tablet', 'desktop' => 'Desktop']))
            . '</div>';
        $heat = [];
        foreach (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as $w => $name) {
            $heat[] = array_merge([$name], $r['heat'][$w]);
        }
        $out .= self::viz('heat', 'When people visit', 'Page views by weekday and hour, Chicago time.', array_merge(['Day'], array_map(static fn(int $h): string => (string) $h, range(0, 23))), $heat);
        $t = $r['time'];
        $out .= '<section class="viz" aria-labelledby="h-time"><h2 id="h-time">Time on page</h2>'
            . ($t['n'] === 0 ? Html::p('No timed visits yet.', 'sub') : '<div class="tiles"><div class="tile"><p class="tile-value">' . self::secs($t['median']) . '</p><p class="tile-label">median, while the page was in view</p></div>'
            . '<div class="tile"><p class="tile-value">' . self::secs($t['mean']) . '</p><p class="tile-label">average, over ' . self::num($t['n']) . ' page views</p></div></div>')
            . '</section>';
        return $out;
    }

    /** @param array<string, int> $counts @param array<string, string> $names @return list<array{string, int}> */
    private static function pairs(array $counts, array $names): array
    {
        $out = [];
        foreach ($counts as $k => $n) {
            $out[] = [$names[$k] ?? $k, $n];
        }
        return $out;
    }

    /** @param array{value: int|float, prev: int|float|null, spark: list<int|float>} $k */
    private static function kpi(string $id, string $label, string $value, array $k, string $period, string $note = ''): string
    {
        $prev = $k['prev'];
        if ($prev === null) {
            $delta = '<p class="kpi-delta">No numbers yet for the ' . Html::e($period) . '</p>';
        } elseif ((float) $prev === 0.0) {
            $delta = '<p class="kpi-delta">' . ((float) $k['value'] > 0 ? 'Nothing in the ' : 'None in this or the ') . Html::e($period) . '</p>';
        } else {
            $change = ((float) $k['value'] - (float) $prev) / (float) $prev;
            $dir = $change > 0.0005 ? 'up' : ($change < -0.0005 ? 'down' : 'flat');
            $mark = ['up' => '▲', 'down' => '▼', 'flat' => '■'][$dir];
            $delta = '<p class="kpi-delta ' . $dir . '"><span aria-hidden="true">' . $mark . '</span> '
                . ['up' => 'Up ', 'down' => 'Down ', 'flat' => 'Level '][$dir] . self::pct(abs($change)) . ' on the ' . Html::e($period) . '</p>';
        }
        return '<div class="kpi"><p class="kpi-label">' . Html::e($label) . '</p><p class="kpi-value">' . Html::e($value) . '</p>'
            . ($note === '' ? '' : '<p class="kpi-note">' . Html::e($note) . '</p>')
            . $delta . '<div class="spark" data-spark="' . Html::e($id) . '" aria-hidden="true"></div></div>';
    }

    /**
     * A chart card: its title, a line on what it shows, the plot stats.js draws into, and the numbers.
     *
     * @param list<string> $head
     * @param list<list<int|float|string|null>> $rows
     */
    private static function viz(string $id, string $title, string $sub, array $head, array $rows): string
    {
        $table = '<table><thead><tr>';
        foreach ($head as $h) {
            $table .= '<th scope="col">' . Html::e($h) . '</th>';
        }
        $table .= '</tr></thead><tbody>';
        foreach ($rows as $row) {
            $table .= '<tr>';
            foreach (array_values($row) as $i => $cell) {
                $table .= $i === 0 ? '<th scope="row">' . Html::e((string) $cell) . '</th>' : '<td>' . Html::e(is_int($cell) ? self::num($cell) : (is_float($cell) ? self::num($cell, 1) : (string) $cell)) . '</td>';
            }
            $table .= '</tr>';
        }
        $table .= '</tbody></table>';
        $empty = $rows === [] ? Html::p('Nothing yet in this range.', 'empty') : '';
        return '<section class="viz" aria-labelledby="h-' . $id . '"><h2 id="h-' . $id . '">' . Html::e($title) . '</h2>'
            . Html::p($sub, 'sub') . $empty
            . '<div class="plot" data-chart="' . Html::e($id) . '"></div>'
            . ($rows === [] ? '' : '<details class="numbers"><summary>Numbers</summary><div class="scroll">' . $table . '</div></details>')
            . '</section>';
    }

    private static function num(int|float $n, int $decimals = 0): string
    {
        return number_format((float) $n, $decimals);
    }

    private static function pct(float $f): string
    {
        $p = $f * 100;
        return ($p > 0 && $p < 10 ? number_format($p, 1) : number_format($p)) . '%';
    }

    private static function secs(int $s): string
    {
        return $s < 60 ? $s . 's' : intdiv($s, 60) . 'm ' . str_pad((string) ($s % 60), 2, '0', STR_PAD_LEFT) . 's';
    }

    private static function date(string $day): string
    {
        return (new \DateTimeImmutable($day))->format('M j, Y');
    }
}
