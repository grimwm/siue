<?php
// The ingest side: validates one beacon message and stores it. Every outcome is an empty 204 (405 for a
// method other than POST), so the endpoint never tells a caller anything, not even whether it kept the write.
declare(strict_types=1);

namespace Stats;

final class Collector
{
    public const MAX_BODY = 2048;
    public const PER_CLIENT_MINUTE = 600;
    public const ALL_MINUTE = 6000;
    /** Longest time on a page that counts: 4 hours. */
    public const MAX_SECS = 14400;

    /**
     * The events each page may send, name => rule: null for no property, a list of the allowed values, or
     * 'level' for a short level name. '*' lists the events every game page (not the faculty page) may send.
     */
    public const EVENTS = [
        '*' => ['share' => null, 'install' => null],
        'crete' => ['game_start' => ['new', 'continue'], 'level_start' => 'level', 'level_win' => 'level', 'hint' => null, 'route' => null, 'auto' => null],
        'tankity' => ['room_host' => null, 'match_start' => ['solo', 'room'], 'match_end' => ['solo', 'room']],
        'cylon' => ['game_start' => null, 'score_submit' => null],
    ];

    private const ID = '/^[0-9a-f]{16,32}$/D';
    private const VID = '/^[0-9a-f]{32}$/D';
    private const LEVEL = '/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,31}$/D';

    /** @var callable(): list<string> */
    private $pages;

    /** @param (callable(): list<string>)|null $pages the pages that may be counted; defaults to sitePages() */
    public function __construct(private \PDO $db, private \Admin\Clock $clock, private string $host, ?callable $pages = null)
    {
        $this->pages = $pages ?? self::sitePages(...);
    }

    /** The faculty page ('home') and every game folder with a metadata.yaml. @return list<string> */
    public static function sitePages(?string $games = null): array
    {
        $games ??= __DIR__ . '/../../games';
        $out = ['home'];
        foreach (glob($games . '/*/metadata.yaml') ?: [] as $file) {
            $id = basename(dirname($file));
            if (preg_match('/^[a-z0-9][a-z0-9-]{0,31}$/D', $id) === 1) {
                $out[] = $id;
            }
        }
        return $out;
    }

    /**
     * One request to the endpoint, returning its status.
     *
     * @param array<string, string> $headers lower-case names
     */
    public function handle(string $method, array $headers, string $body, string $ip, string $ua): int
    {
        if ($method !== 'POST') {
            return 405;
        }
        $msg = $this->accept($headers, $body, $ua);
        if ($msg === null) {
            return 204;
        }
        $now = $this->clock->now();
        try {
            Db::write($this->db, function () use ($msg, $now, $ip, $ua): void {
                $salt = $this->salt(Days::of($now));
                if (!$this->underLimit($now, hash_hmac('sha256', 'rate|' . $ip, $salt))) {
                    return;
                }
                $this->store($msg, $now, $ip, $ua, $salt);
            });
            Rollup::maybeRun($this->db, $now);
        } catch (\PDOException $e) {
            error_log('stats: write failed: ' . $e->getMessage());
        }
        return 204;
    }

    /**
     * The validated message, or null when it must be dropped.
     *
     * @param array<string, string> $headers
     * @return array<string, mixed>|null
     */
    private function accept(array $headers, string $body, string $ua): ?array
    {
        if (($headers['dnt'] ?? '') === '1' || ($headers['sec-gpc'] ?? '') === '1' || Classify::isBot($ua)) {
            return null;
        }
        $origin = $headers['origin'] ?? '';
        if ($origin !== '' && strtolower((string) parse_url($origin, PHP_URL_HOST)) !== strtolower($this->host)) {
            return null;
        }
        $site = $headers['sec-fetch-site'] ?? '';
        if ($site !== '' && $site !== 'same-origin') {
            return null;
        }
        $length = $headers['content-length'] ?? '';
        if (($length !== '' && (!ctype_digit($length) || (int) $length > self::MAX_BODY)) || strlen($body) > self::MAX_BODY) {
            return null;
        }
        $m = json_decode($body, true);
        if (!is_array($m) || array_is_list($m) || !is_string($m['p'] ?? null) || !in_array($m['p'], ($this->pages)(), true)) {
            return null;
        }
        return match ($m['t'] ?? null) {
            'v' => self::id($m['pv'] ?? null) && self::id($m['sid'] ?? null) && self::vid($m['vid'] ?? null)
                && is_string($m['r'] ?? '') && strlen($m['r'] ?? '') <= 253 && is_int($m['tp'] ?? 0) && is_int($m['sw'] ?? 0) ? $m : null,
            's' => self::id($m['pv'] ?? null) && is_int($m['sec'] ?? null) ? $m : null,
            'e' => self::id($m['sid'] ?? null) && self::vid($m['vid'] ?? null) && $this->eventOk($m['p'], $m['n'] ?? null, $m['k'] ?? null) ? $m : null,
            default => null,
        };
    }

    private static function id(mixed $v): bool
    {
        return is_string($v) && preg_match(self::ID, $v) === 1;
    }

    /** A visitor ID is optional (null or absent when the browser keeps none). */
    private static function vid(mixed $v): bool
    {
        return $v === null || (is_string($v) && preg_match(self::VID, $v) === 1);
    }

    private function eventOk(string $page, mixed $name, mixed $prop): bool
    {
        if (!is_string($name)) {
            return false;
        }
        $rules = (self::EVENTS[$page] ?? []) + ($page === 'home' ? [] : self::EVENTS['*']);
        if (!array_key_exists($name, $rules)) {
            return false;
        }
        $rule = $rules[$name];
        if ($rule === null) {
            return $prop === null;
        }
        if ($rule === 'level') {
            return is_string($prop) && preg_match(self::LEVEL, $prop) === 1;
        }
        return in_array($prop, $rule, true);
    }

    /** Today's salt, made when the day's first write arrives; every other day's is deleted. */
    private function salt(string $day): string
    {
        $q = $this->db->prepare('SELECT salt FROM salts WHERE day = ?');
        $q->execute([$day]);
        $salt = $q->fetchColumn();
        if (is_string($salt)) {
            return $salt;
        }
        $salt = random_bytes(32);
        $this->db->prepare('DELETE FROM salts WHERE day <> ?')->execute([$day]);
        $ins = $this->db->prepare('INSERT INTO salts (day, salt) VALUES (?, ?)');
        $ins->bindValue(1, $day);
        $ins->bindValue(2, $salt, \PDO::PARAM_LOB);
        $ins->execute();
        return $salt;
    }

    /** Counts one write against the client's and the overall per-minute limits; false when either is spent. */
    private function underLimit(int $now, string $client): bool
    {
        $minute = intdiv($now, 60);
        $this->db->prepare('DELETE FROM rate WHERE minute < ?')->execute([$minute]);
        $take = $this->db->prepare('INSERT INTO rate (bucket, minute, n) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET n = n + 1 RETURNING n');
        $take->execute(['all', $minute]);
        $all = (int) $take->fetchColumn();
        $take->closeCursor();
        $take->execute(['c:' . substr($client, 0, 32), $minute]);
        $mine = (int) $take->fetchColumn();
        $take->closeCursor();
        return $all <= self::ALL_MINUTE && $mine <= self::PER_CLIENT_MINUTE;
    }

    /** @param array<string, mixed> $m */
    private function store(array $m, int $now, string $ip, string $ua, string $salt): void
    {
        if ($m['t'] === 's') {
            $secs = max(0, min(self::MAX_SECS, (int) $m['sec']));
            $this->db->prepare("UPDATE hits SET secs = MAX(secs, CAST(? AS INTEGER)) WHERE pv = ? AND page = ? AND kind = 'view' AND at > ?")
                ->execute([$secs, $m['pv'], $m['p'], $now - 86400]);
            return;
        }
        $day = Days::of($now);
        $dhash = substr(hash('sha256', $salt . "\0" . $ip . "\0" . $ua . "\0" . $this->host . "\0" . $day), 0, 32);
        $vid = $m['vid'] ?? null;
        $who = $vid ?? 'd' . $dhash;
        $view = $m['t'] === 'v';
        $this->db->prepare('INSERT OR IGNORE INTO hits (at, day, hour, page, kind, name, prop, pv, sid, vid, dhash, who, ref, device) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([
                $now, $day, Days::hourOf($now), $m['p'], $view ? 'view' : 'event',
                $view ? null : $m['n'], $view ? null : ($m['k'] ?? null), $view ? $m['pv'] : null, $m['sid'], $vid, $dhash, $who,
                $view ? Classify::referrer((string) ($m['r'] ?? ''), $this->host) : null,
                $view ? Classify::device($ua, max(0, (int) ($m['tp'] ?? 0)), max(0, (int) ($m['sw'] ?? 0))) : null,
            ]);
        if ($vid !== null) {
            $seen = $this->db->prepare('INSERT INTO visitors (vid, page, first_day, last_day) VALUES (?, ?, ?, ?) ON CONFLICT(vid, page) DO UPDATE SET last_day = MAX(last_day, excluded.last_day)');
            $seen->execute([$vid, $m['p'], $day, $day]);
            $seen->execute([$vid, '*', $day, $day]);
        }
    }
}
