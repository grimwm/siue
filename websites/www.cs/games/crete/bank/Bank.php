<?php
// The shared Endless level bank: every check and every store behind
// endless-bank.php, testable without HTTP. A level comes in with the tuple that
// made it and waits in quarantine (pending) until two other installs, one on
// another network, regenerate it from that tuple byte for byte; only then is it
// served to players. One mismatch rejects it and strikes its uploader. The
// trusted runner (our own CI) may also add levels it made itself, served at
// once. The design is docs/superpowers/specs/2026-11-04-crete-shared-bank-design.md.
declare(strict_types=1);

namespace Crete;

require_once dirname(__DIR__) . '/server/score-guard.php';
require_once dirname(__DIR__) . '/server/store-dir.php';

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

use Kit\ScoreGuard;
use Kit\StoreModes;

/** A request the bank turns down: the HTTP status and the JSON body to answer with. */
final class Refusal extends \RuntimeException
{
    /** @param array<string, mixed> $payload */
    public function __construct(public readonly int $status, public readonly array $payload)
    {
        parent::__construct((string) json_encode($payload));
    }

    public static function invalid(string $field): self
    {
        return new self(400, ['error' => 'invalid', 'field' => $field]);
    }
}

final class Bank
{
    /** Every character a level's grid may hold: the game's terrain, object (never 'p', a story page) and hazard characters, and P, M. */
    public const TILES = '.#E|~F=^v<>%S_tTRBYG&-+;:WI@$!C*rbygfhkuzxcOowePM';

    public const GRADES = ['easy', 'medium', 'hard'];

    /** The fields of a level as made and as played, in the order they are stored. */
    public const MADE_FIELDS = ['text', 'line', 'shortest', 'score', 'explored', 'chapter', 'hides'];

    /** The rate-limit kinds endless-bank.php takes: one per browser op, the level fetch, and the trusted verifier's ops. */
    public const RATE_KINDS = ['submit', 'claim', 'verify', 'report', 'levels', 'trusted'];

    /** The ops only the trusted runner may call, with the X-Crete-Verifier header. */
    public const TRUSTED_OPS = ['trusted-list', 'trusted-verify', 'trusted-counts', 'trusted-add'];

    /** The form a trusted verifier token takes; deploy.sh refuses any other. */
    public const TOKEN = '/^[A-Za-z0-9_-]{32,128}\z/';

    private const DAY = 86400;
    private const KEY_DAYS = 3;
    private const MAX_TEXT = 4000;
    private const DIRS = ['up', 'down', 'left', 'right'];
    private const TEMPLATES = ['block', 'ball', 'glider', 'fireball'];
    private const HEADERS = ['hearts', 'relics', 'facing', 'machines'];
    private const HAZARD_CHARS = 'owe';
    private const WEIGHT = 1000000;

    /** The bank's own config keys and their integer ranges. */
    private const INTS = [
        'parts' => [1, 1000],
        'servedCap' => [1, 100000],
        'pendingCap' => [1, 10000],
        'pendingDays' => [1, 30],
        'needed' => [1, 10],
        'ticketMinutes' => [1, 1440],
        'strikeLimit' => [1, 100],
        'strikeHours' => [1, 168],
        'reportsToRetire' => [1, 100],
    ];

    private readonly \Closure $clock;
    private readonly \Closure $rng;
    private readonly int $fileMode;
    /** The layouts admitted into served during the current withGrade, so one rolled out at once is retired too. @var list<string> */
    private array $admitted = [];

    /**
     * @param array<string, mixed> $config through validateConfig()
     * @param string $dir the data folder, already checked (StoreDir)
     * @param (\Closure(): int)|null $clock seconds since the epoch; time() by default
     * @param (\Closure(int, int): int)|null $rng a whole number from $min to $max inclusive; random_int by default
     */
    public function __construct(
        private readonly array $config,
        private readonly string $dir,
        ?\Closure $clock = null,
        ?\Closure $rng = null,
        ?int $fileMode = null,
    ) {
        $this->clock = $clock ?? static fn(): int => time();
        $this->rng = $rng ?? static fn(int $min, int $max): int => random_int($min, $max);
        $this->fileMode = $fileMode ?? StoreModes::modes()['file'];
    }

    // ---- Config ----------------------------------------------------------

    /** @return array<string, mixed> the config file at $path, checked */
    public static function loadConfig(string $path): array
    {
        $raw = @file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException('config missing: ' . $path);
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new \RuntimeException('config is not a JSON object');
        }
        return self::validateConfig($data);
    }

    /**
     * The bank's config, checked: its own keys plus the score guard's
     * (ScoreGuard::CONFIG_KEYS), which come back normalised under 'guard'.
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function validateConfig(array $data): array
    {
        $own = array_merge(['accept', 'perHour'], array_keys(self::INTS));
        $known = array_merge($own, ScoreGuard::CONFIG_KEYS);
        $unknown = array_diff(array_keys($data), $known);
        if ($unknown) {
            throw new \RuntimeException('unknown config keys: ' . implode(', ', $unknown));
        }
        $missing = array_diff($known, array_keys($data), ScoreGuard::OPTIONAL_KEYS);
        if ($missing) {
            throw new \RuntimeException('missing config keys: ' . implode(', ', $missing));
        }
        $out = ['guard' => ScoreGuard::validateConfig(array_intersect_key($data, array_flip(ScoreGuard::CONFIG_KEYS)))];
        foreach (self::INTS as $key => [$min, $max]) {
            if (!is_int($data[$key]) || $data[$key] < $min || $data[$key] > $max) {
                throw new \RuntimeException("config $key must be an integer from $min to $max");
            }
            $out[$key] = $data[$key];
        }
        if (!is_array($data['accept']) || !array_is_list($data['accept']) || $data['accept'] === []) {
            throw new \RuntimeException('config accept must be a list of versions');
        }
        foreach ($data['accept'] as $v) {
            if (!is_int($v) || $v < 1 || $v > 1000000) {
                throw new \RuntimeException('config accept holds versions from 1 to 1000000');
            }
        }
        $out['accept'] = array_values(array_unique($data['accept']));
        $rates = $data['perHour'];
        if (!is_array($rates)) {
            throw new \RuntimeException('config perHour must be an object');
        }
        $keys = array_keys($rates);
        sort($keys);
        $want = self::RATE_KINDS;
        sort($want);
        if ($keys !== $want) {
            throw new \RuntimeException('config perHour must name exactly ' . implode(', ', self::RATE_KINDS));
        }
        foreach ($rates as $kind => $n) {
            if (!is_int($n) || $n < 1 || $n > 10000) {
                throw new \RuntimeException("config perHour.$kind must be an integer from 1 to 10000");
            }
        }
        $out['perHour'] = $rates;
        return $out;
    }

    /** @return array<string, mixed> the score guard's part of the config */
    public function guardConfig(): array
    {
        return $this->config['guard'];
    }

    /** @return array<string, int> requests per hour per network, by rate kind */
    public function perHour(): array
    {
        return $this->config['perHour'];
    }

    // ---- The operations --------------------------------------------------

    /**
     * One POST body, dispatched by its op.
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function handle(array $body, string $addr): array
    {
        return match ($body['op'] ?? null) {
            'submit' => $this->submit($body, $addr),
            'claim' => $this->claim($body, $addr),
            'verify' => $this->verify($body, $addr),
            'report' => $this->report($body, $addr),
            default => throw Refusal::invalid('op'),
        };
    }

    /**
     * A level a device made, with the tuple that made it, into quarantine;
     * a layout the grade holds answers 409 duplicate, one it retired 409 retired.
     * @param array<string, mixed> $body {op, install, tuple, made}
     * @return array{ok: true}
     */
    public function submit(array $body, string $addr): array
    {
        self::fields($body, ['op', 'install', 'tuple', 'made'], '');
        $install = self::install($body['install']);
        $tuple = $this->tuple($body['tuple']);
        $made = self::made($body['made'], 'made');
        if (!in_array($tuple['v'], $this->config['accept'], true)) {
            throw new Refusal(403, ['error' => 'version']);
        }
        $keys = $this->keys();
        $current = end($keys);
        $who = self::installHash($install);
        if ($this->throttled($who, $addr, $keys)) {
            throw new Refusal(429, ['error' => 'throttled']);
        }
        $h = self::layoutHash($made['text']);
        $now = ($this->clock)();
        $this->withGrade($tuple['grade'], $keys, function (array &$served, array &$pending, array $retired) use ($h, $tuple, $made, $who, $addr, $current, $now): void {
            if (isset($retired[$h])) {
                throw new Refusal(409, ['error' => 'retired']);
            }
            foreach ([$served, $pending] as $pool) {
                foreach ($pool as $entry) {
                    if ($entry['h'] === $h) {
                        throw new Refusal(409, ['error' => 'duplicate']);
                    }
                }
            }
            $pending[] = [
                'h' => $h, 'v' => $tuple['v'], 'at' => $now, 'kid' => $current['id'],
                'up' => ['i' => $who, 'n' => $this->netCode($addr, $current['key'])],
                'tuple' => $tuple, 'made' => $made, 'ok' => [], 'tk' => [],
            ];
            while (count($pending) > $this->config['pendingCap']) {
                $oldest = 0;
                foreach ($pending as $i => $item) {
                    if ($item['at'] < $pending[$oldest]['at']) {
                        $oldest = $i;
                    }
                }
                array_splice($pending, $oldest, 1);
            }
        });
        return ['ok' => true];
    }

    /**
     * A random pending level of the claimer's version for it to regenerate: one
     * it did not upload, has not verified and holds no ticket for. Only the
     * tuple goes out, never the level.
     * @param array<string, mixed> $body {op, install, v}
     * @return array{ticket: string, tuple: array<string, mixed>}|array{none: true}
     */
    public function claim(array $body, string $addr): array
    {
        self::fields($body, ['op', 'install', 'v'], '');
        $who = self::installHash(self::install($body['install']));
        $v = self::int($body['v'], 1, 1000000, 'v');
        if (!in_array($v, $this->config['accept'], true)) {
            return ['none' => true];
        }
        $keys = $this->keys();
        $now = ($this->clock)();
        foreach ($this->shuffled(self::GRADES) as $grade) {
            $got = $this->withGrade($grade, $keys, function (array &$served, array &$pending) use ($who, $v, $addr, $keys, $now): ?array {
                $open = [];
                foreach ($pending as $i => $item) {
                    if ($item['v'] === $v && empty($item['dispute']) && $item['up']['i'] !== $who && !self::holds($item, $who)) {
                        $open[] = $i;
                    }
                }
                if (!$open) {
                    return null;
                }
                $i = $open[($this->rng)(0, count($open) - 1)];
                $ticket = bin2hex(random_bytes(16));
                $pending[$i]['tk'][] = [
                    't' => $ticket, 'i' => $who, 'n' => $this->netCode($addr, $keys[$pending[$i]['kid']]['key']),
                    'exp' => $now + $this->config['ticketMinutes'] * 60, 'used' => false,
                ];
                return ['ticket' => $ticket, 'tuple' => $pending[$i]['tuple']];
            });
            if ($got !== null) {
                return $got;
            }
        }
        return ['none' => true];
    }

    /**
     * A verifier's regenerated level (null when its part made none) against
     * the uploader's. A mismatch rejects the level and strikes its uploader; a
     * match counts toward admission.
     * @param array<string, mixed> $body {op, install, ticket, found}
     * @return array{ok: true, verdict: 'match'|'mismatch'}
     */
    public function verify(array $body, string $addr): array
    {
        self::fields($body, ['op', 'install', 'ticket', 'found'], '');
        $who = self::installHash(self::install($body['install']));
        if (!is_string($body['ticket']) || !preg_match('/^[a-f0-9]{32}\z/', $body['ticket'])) {
            throw Refusal::invalid('ticket');
        }
        $ticket = $body['ticket'];
        $found = $body['found'] === null ? null : self::made($body['found'], 'found');
        $keys = $this->keys();
        $now = ($this->clock)();
        foreach (self::GRADES as $grade) {
            $verdict = $this->withGrade($grade, $keys, function (array &$served, array &$pending) use ($ticket, $who, $found, $addr, $keys, $now): ?string {
                foreach ($pending as $i => $item) {
                    foreach ($item['tk'] as $j => $tk) {
                        if (!hash_equals($tk['t'], $ticket)) {
                            continue;
                        }
                        $net = $this->netCode($addr, $keys[$item['kid']]['key']);
                        if ($tk['i'] !== $who || $tk['n'] !== $net || $tk['used'] || $tk['exp'] < $now) {
                            throw new Refusal(400, ['error' => 'ticket']);
                        }
                        $pending[$i]['tk'][$j]['used'] = true;
                        // One peer's word is no proof against the uploader: a mismatch disputes the level, which is
                        // then never served, never handed to another peer, and left to the trusted verifier, whose
                        // mismatch alone rejects it and strikes the uploader.
                        if ($found === null || !self::sameMade($found, $item['made'])) {
                            $pending[$i]['dispute'] = true;
                            return 'mismatch';
                        }
                        if (!empty($item['dispute'])) {
                            return 'match';
                        }
                        $this->admitIfReady($served, $pending, $i, $who, $net);
                        return 'match';
                    }
                }
                return null;
            });
            if ($verdict !== null) {
                return ['ok' => true, 'verdict' => $verdict];
            }
        }
        throw new Refusal(400, ['error' => 'ticket']);
    }

    /**
     * A player's report that a served level failed its client checks; enough
     * reports from distinct installs on distinct networks retire it.
     * @param array<string, mixed> $body {op, install, grade, h}
     * @return array{ok: true}
     */
    public function report(array $body, string $addr): array
    {
        self::fields($body, ['op', 'install', 'grade', 'h'], '');
        $who = self::installHash(self::install($body['install']));
        $grade = self::grade($body['grade'], 'grade');
        if (!is_string($body['h']) || !preg_match('/^[a-f0-9]{16}\z/', $body['h'])) {
            throw Refusal::invalid('h');
        }
        $h = $body['h'];
        $keys = $this->keys();
        $since = ($this->clock)() - $this->config['pendingDays'] * self::DAY;
        $now = ($this->clock)();
        $net = $this->netCode($addr, end($keys)['key']);
        $this->withGrade($grade, $keys, function (array &$served, array &$pending) use ($h, $who, $net, $since, $now): void {
            foreach ($served as $i => $entry) {
                if ($entry['h'] !== $h) {
                    continue;
                }
                $reports = array_values(array_filter($entry['r'] ?? [], static fn(array $r): bool => $r['at'] >= $since));
                if (!in_array($who, array_column($reports, 'i'), true) && !in_array($net, array_column($reports, 'n'), true)) {
                    $reports[] = ['i' => $who, 'n' => $net, 'at' => $now];
                }
                if (count($reports) >= $this->config['reportsToRetire']) {
                    array_splice($served, $i, 1);
                } else {
                    $served[$i]['r'] = $reports;
                }
                return;
            }
        });
        return ['ok' => true];
    }

    /**
     * Up to $n served levels of $grade whose chapter is at most $tier, drawn at
     * random with weight 1 / (1 + times served), each counted as served once more.
     * @return list<array<string, mixed>> Made fields plus h
     */
    public function levels(mixed $grade, mixed $tier, mixed $n): array
    {
        $grade = self::grade($grade, 'grade');
        $tier = self::int($tier, 1, 10, 'tier');
        $n = self::int($n, 0, 16, 'n');
        if ($n === 0) {
            return [];
        }
        return $this->withGrade($grade, $this->keys(), function (array &$served, array &$pending) use ($tier, $n): array {
            $pool = [];
            foreach ($served as $i => $entry) {
                if ($entry['made']['chapter'] <= $tier) {
                    $pool[$i] = max(1, intdiv(self::WEIGHT, 1 + $entry['n']));
                }
            }
            $out = [];
            while ($pool && count($out) < $n) {
                $i = $this->pick($pool);
                unset($pool[$i]);
                $served[$i]['n']++;
                $out[] = $served[$i]['made'] + ['h' => $served[$i]['h']];
            }
            return $out;
        });
    }

    // ---- The trusted verifier ----------------------------------------------

    /**
     * True when $token is the trusted verifier's: its sha256 equals the
     * tokenSha256 in $verifierFile. A missing or malformed file trusts nobody.
     * The token itself is never stored, logged or sent back.
     */
    public static function trusted(mixed $token, string $verifierFile): bool
    {
        if (!is_string($token) || !preg_match(self::TOKEN, $token) || !is_file($verifierFile)) {
            return false;
        }
        $data = json_decode((string) @file_get_contents($verifierFile), true);
        $stored = is_array($data) ? ($data['tokenSha256'] ?? null) : null;
        if (!is_string($stored) || !preg_match('/^[a-f0-9]{64}\z/', $stored)) {
            return false;
        }
        return hash_equals($stored, hash('sha256', $token));
    }

    /**
     * One trusted verifier's POST body, dispatched by its op once its token
     * passes trusted(); otherwise 401.
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function handleTrusted(array $body, mixed $token, string $verifierFile): array
    {
        if (!self::trusted($token, $verifierFile)) {
            throw new Refusal(401, ['error' => 'unauthorized']);
        }
        return match ($body['op'] ?? null) {
            'trusted-list' => $this->trustedList($body),
            'trusted-verify' => $this->trustedVerify($body),
            'trusted-counts' => $this->trustedCounts($body),
            'trusted-add' => $this->trustedAdd($body),
            default => throw Refusal::invalid('op'),
        };
    }

    /**
     * Pending levels of accepted versions, oldest first across the grades, with
     * the level as uploaded: the trusted verifier regenerates each and compares.
     * @param array<string, mixed> $body {op, limit}
     * @return array{items: list<array{grade: string, h: string, tuple: array<string, mixed>, made: array<string, mixed>}>}
     */
    private function trustedList(array $body): array
    {
        self::fields($body, ['op', 'limit'], '');
        $limit = self::int($body['limit'], 1, 50, 'limit');
        $keys = $this->keys();
        $all = [];
        foreach (self::GRADES as $grade) {
            $this->withGrade($grade, $keys, function (array &$served, array &$pending) use ($grade, &$all): void {
                foreach ($pending as $item) {
                    $all[] = ['d' => empty($item['dispute']) ? 1 : 0, 'at' => $item['at'], 'grade' => $grade, 'h' => $item['h'], 'tuple' => $item['tuple'], 'made' => $item['made']];
                }
            });
        }
        // Disputed levels first: they wait on this verifier alone. Then the oldest.
        usort($all, static fn(array $a, array $b): int => [$a['d'], $a['at']] <=> [$b['d'], $b['at']]);
        $items = array_map(static function (array $x): array {
            unset($x['at'], $x['d']);
            return $x;
        }, array_slice($all, 0, $limit));
        return ['items' => $items];
    }

    /**
     * The trusted verifier's verdict on one pending level. A match only when it
     * says so and its regenerated level equals the uploader's here too: the
     * level is served at once. Anything else rejects it and strikes its
     * uploader. 404 when the level is no longer pending.
     * @param array<string, mixed> $body {op, grade, h, verdict, found}
     * @return array{ok: true, verdict: 'match'|'mismatch'}
     */
    private function trustedVerify(array $body): array
    {
        self::fields($body, ['op', 'grade', 'h', 'verdict', 'found'], '');
        $grade = self::grade($body['grade'], 'grade');
        if (!is_string($body['h']) || !preg_match('/^[a-f0-9]{16}\z/', $body['h'])) {
            throw Refusal::invalid('h');
        }
        if ($body['verdict'] !== 'match' && $body['verdict'] !== 'mismatch') {
            throw Refusal::invalid('verdict');
        }
        $h = $body['h'];
        $says = $body['verdict'];
        $found = $body['found'] === null ? null : self::made($body['found'], 'found');
        $verdict = $this->withGrade($grade, $this->keys(), function (array &$served, array &$pending) use ($h, $says, $found): string {
            foreach ($pending as $i => $item) {
                if ($item['h'] !== $h) {
                    continue;
                }
                if ($says === 'match' && $found !== null && self::sameMade($found, $item['made'])) {
                    $this->admit($served, $pending, $i);
                    return 'match';
                }
                array_splice($pending, $i, 1);
                $this->strike($item['up']['i'], $item['up']['n'], $item['kid']);
                return 'mismatch';
            }
            throw new Refusal(404, ['error' => 'gone']);
        });
        return ['ok' => true, 'verdict' => $verdict];
    }

    /**
     * Each grade's served and pending counts, its cap, and a summary of every
     * served level ([score, chapter, rows, cols, hides as 0 or 1]): the trusted
     * runner works out from them which levels are scarce. It also forgets the
     * provenance of levels no longer served.
     * @param array<string, mixed> $body {op}
     * @return array{grades: array<string, array{served: int, pending: int, cap: int, levels: list<list<int>>}>}
     */
    private function trustedCounts(array $body): array
    {
        self::fields($body, ['op'], '');
        $keys = $this->keys();
        $out = [];
        foreach (self::GRADES as $grade) {
            $out[$grade] = $this->withGrade($grade, $keys, function (array &$served, array &$pending) use ($grade): array {
                $kept = array_flip(array_column($served, 'h'));
                foreach (glob("{$this->dir}/prov-$grade-*.json") ?: [] as $file) {
                    if (preg_match('/-([a-f0-9]{16})\.json\z/', $file, $m) && !isset($kept[$m[1]])) {
                        @unlink($file);
                    }
                }
                $levels = [];
                foreach ($served as $entry) {
                    $rows = self::rows($entry['made']['text']);
                    $levels[] = [$entry['made']['score'], $entry['made']['chapter'], count($rows), strlen($rows[0] ?? ''), $entry['made']['hides'] ? 1 : 0];
                }
                return ['served' => count($served), 'pending' => count($pending), 'cap' => $this->config['servedCap'], 'levels' => $levels];
            });
        }
        return ['grades' => $out];
    }

    /**
     * A level the trusted runner made itself with main's generator: our own
     * code on our own machine, as trusted as its verdicts, so it is served at
     * once. Its tuple is checked like any upload's and kept beside it
     * (prov-<grade>-<h>.json), so it can be made again later. Never past the
     * cap: a grade whose served and pending levels fill it answers 409 full.
     * With replace (true), a full grade instead retires one served level,
     * picked here by rollOut's weighting, and takes the new one in its place,
     * in one locked step: one out for each one in, so turnover never shrinks
     * the grade. A grade with room takes the level without retiring any, and
     * one with nothing served to retire still answers 409 full. A layout the
     * grade holds (served or waiting) answers 409 duplicate, and one it retired
     * 409 retired, before anything else is decided: neither takes room or
     * retires a level, with replace or without. No strike either way.
     * @param array<string, mixed> $body {op, tuple, made, replace?}
     * @return array{ok: true, h: string, retired?: string}
     */
    private function trustedAdd(array $body): array
    {
        self::fields($body, array_key_exists('replace', $body) ? ['op', 'tuple', 'made', 'replace'] : ['op', 'tuple', 'made'], '');
        $replace = array_key_exists('replace', $body) ? $body['replace'] : false;
        if (!is_bool($replace)) {
            throw Refusal::invalid('replace');
        }
        $tuple = $this->tuple($body['tuple']);
        $made = self::made($body['made'], 'made');
        if (!in_array($tuple['v'], $this->config['accept'], true)) {
            throw new Refusal(403, ['error' => 'version']);
        }
        $grade = $tuple['grade'];
        $h = self::layoutHash($made['text']);
        $now = ($this->clock)();
        $retired = $this->withGrade($grade, $this->keys(), function (array &$served, array &$pending, array $gone) use ($h, $tuple, $made, $grade, $now, $replace): ?string {
            if (isset($gone[$h])) {
                throw new Refusal(409, ['error' => 'retired']);
            }
            foreach ([$served, $pending] as $pool) {
                if (in_array($h, array_column($pool, 'h'), true)) {
                    throw new Refusal(409, ['error' => 'duplicate']);
                }
            }
            $retired = null;
            if (count($served) + count($pending) >= $this->config['servedCap']) {
                if (!$replace || $served === []) {
                    throw new Refusal(409, ['error' => 'full']);
                }
                $i = $this->pick($this->retireWeights($served));
                $retired = $served[$i]['h'];
                array_splice($served, $i, 1);
            }
            $this->writeIfChanged("{$this->dir}/prov-$grade-$h.json", '', $tuple);
            $served[] = self::servedEntry($made, $h, $tuple['v'], $now);
            return $retired;
        });
        return $retired === null ? ['ok' => true, 'h' => $h] : ['ok' => true, 'h' => $h, 'retired' => $retired];
    }

    /** @return list<string> a checked text's grid rows */
    private static function rows(string $text): array
    {
        $lines = explode("\n", rtrim($text, "\n"));
        return array_slice($lines, (int) array_search('', $lines, true) + 1);
    }

    // ---- Validation ------------------------------------------------------

    /**
     * The level text with its title and intro blanked, once it passes every
     * check of the design's "Server checks"; otherwise a Refusal naming $field.
     */
    public static function checkText(mixed $text, string $field): string
    {
        if (!is_string($text) || strlen($text) > self::MAX_TEXT || !str_ends_with($text, "\n") || str_contains($text, "\r")) {
            throw Refusal::invalid($field);
        }
        $lines = explode("\n", substr($text, 0, -1));
        if (count($lines) < 3 || !str_starts_with($lines[0], 'title: ') || !str_starts_with($lines[1], 'intro: ')) {
            throw Refusal::invalid($field);
        }
        $head = [];
        $i = 2;
        $order = 0;
        for (; $i < count($lines) && $lines[$i] !== ''; $i++) {
            if (!preg_match('/^([a-z]+): (.*)\z/', $lines[$i], $m)) {
                throw Refusal::invalid($field);
            }
            $at = array_search($m[1], self::HEADERS, true);
            if ($at === false || $at < $order) {
                throw Refusal::invalid($field);
            }
            $order = $at + 1;
            $head[$m[1]] = $m[2];
        }
        $rows = array_slice($lines, $i + 1);
        if ($i >= count($lines) || count($rows) < 5 || count($rows) > 41) {
            throw Refusal::invalid($field);
        }
        $cols = strlen($rows[0]);
        if ($cols < 5 || $cols > 41) {
            throw Refusal::invalid($field);
        }
        foreach ($rows as $row) {
            if (strlen($row) !== $cols || strspn($row, self::TILES) !== $cols) {
                throw Refusal::invalid($field);
            }
        }
        $grid = implode('', $rows);
        $hazards = strlen($grid) - strlen(str_replace(str_split(self::HAZARD_CHARS), '', $grid));
        if (substr_count($grid, 'P') !== 1 || substr_count($grid, 'M') > 1) {
            throw Refusal::invalid($field);
        }
        if (isset($head['hearts']) && !preg_match('/^[1-9][0-9]?\z/', $head['hearts'])) {
            throw Refusal::invalid($field);
        }
        if (isset($head['relics']) && (!preg_match('/^[0-9]{1,2}\z/', $head['relics']) || (int) $head['relics'] > substr_count($grid, '*'))) {
            throw Refusal::invalid($field);
        }
        if (!self::words($head['facing'] ?? null, $hazards, static fn(string $w): bool => in_array($w, self::DIRS, true))) {
            throw Refusal::invalid($field);
        }
        $machine = static function (string $w): bool {
            $parts = explode('-', $w);
            return count($parts) === 2 && in_array($parts[0], self::TEMPLATES, true) && in_array($parts[1], self::DIRS, true);
        };
        if (!self::words($head['machines'] ?? null, substr_count($grid, 'C'), $machine)) {
            throw Refusal::invalid($field);
        }
        return self::blank($text);
    }

    /** The text with its title and intro lines emptied: the server keeps no free text. */
    public static function blank(string $text): string
    {
        $lines = explode("\n", $text);
        $lines[0] = 'title: ';
        $lines[1] = 'intro: ';
        return implode("\n", $lines);
    }

    /**
     * The layout hash: the grid's walls ('#') as a bitmap, the smallest of its
     * eight turns and flips (dimensions included), sha256, first 16 hex.
     * $text must have passed checkText().
     */
    public static function layoutHash(string $text): string
    {
        $bits = array_map(static fn(string $row): string => strtr($row, self::wallMap()), self::rows($text));
        $best = null;
        foreach ([$bits, array_reverse($bits)] as $shape) {
            for ($turn = 0; $turn < 4; $turn++) {
                $key = count($shape) . 'x' . strlen($shape[0]) . ':' . implode('', $shape);
                if ($best === null || strcmp($key, $best) < 0) {
                    $best = $key;
                }
                $shape = self::turn($shape);
            }
        }
        return substr(hash('sha256', (string) $best), 0, 16);
    }

    /** @return array<string, string> every tile to '0', the wall to '1' */
    private static function wallMap(): array
    {
        static $map = null;
        if ($map === null) {
            $map = array_fill_keys(str_split(self::TILES), '0');
            $map['#'] = '1';
        }
        return $map;
    }

    /**
     * A quarter turn clockwise.
     * @param list<string> $rows
     * @return list<string>
     */
    private static function turn(array $rows): array
    {
        $out = [];
        $height = count($rows);
        for ($c = 0, $width = strlen($rows[0]); $c < $width; $c++) {
            $line = '';
            for ($r = $height - 1; $r >= 0; $r--) {
                $line .= $rows[$r][$c];
            }
            $out[] = $line;
        }
        return $out;
    }

    /** A header of space-separated words: exactly $count of them, each passing $ok; absent when $count is 0. */
    private static function words(?string $value, int $count, \Closure $ok): bool
    {
        if ($value === null || $value === '') {
            return $count === 0;
        }
        $words = explode(' ', $value);
        return count($words) === $count && count(array_filter($words, $ok)) === $count;
    }

    /**
     * @param array<string, mixed>|mixed $data
     * @param list<string> $names every field required, no others
     */
    private static function fields(mixed $data, array $names, string $at): void
    {
        $where = $at === '' ? 'body' : $at;
        if (!is_array($data) || ($data !== [] && array_is_list($data))) {
            throw Refusal::invalid($where);
        }
        foreach (array_keys($data) as $key) {
            if (!in_array($key, $names, true)) {
                throw Refusal::invalid($at === '' ? (string) $key : "$at.$key");
            }
        }
        foreach ($names as $name) {
            if (!array_key_exists($name, $data)) {
                throw Refusal::invalid($at === '' ? $name : "$at.$name");
            }
        }
    }

    private static function int(mixed $value, int $min, int $max, string $field): int
    {
        if (!is_int($value) || $value < $min || $value > $max) {
            throw Refusal::invalid($field);
        }
        return $value;
    }

    private static function install(mixed $value): string
    {
        if (!is_string($value) || !preg_match('/^[a-f0-9]{32}\z/', $value)) {
            throw Refusal::invalid('install');
        }
        return $value;
    }

    private static function grade(mixed $value, string $field): string
    {
        if (!is_string($value) || !in_array($value, self::GRADES, true)) {
            throw Refusal::invalid($field);
        }
        return $value;
    }

    /**
     * A Made (or a verifier's found level), checked, its text blanked.
     * @return array<string, mixed>
     */
    private static function made(mixed $data, string $at): array
    {
        self::fields($data, self::MADE_FIELDS, $at);
        if (!is_string($data['line']) || !preg_match('/^[a-z]{1,2000}\z/', $data['line'])) {
            throw Refusal::invalid("$at.line");
        }
        if (!is_bool($data['hides'])) {
            throw Refusal::invalid("$at.hides");
        }
        return [
            'text' => self::checkText($data['text'], "$at.text"),
            'line' => $data['line'],
            'shortest' => self::int($data['shortest'], 1, 2000, "$at.shortest"),
            'score' => self::int($data['score'], 0, 10000, "$at.score"),
            'explored' => self::int($data['explored'], 0, 10000000, "$at.explored"),
            'chapter' => self::int($data['chapter'], 1, 10, "$at.chapter"),
            'hides' => $data['hides'],
        ];
    }

    /**
     * A provenance tuple, checked, every run text blanked.
     * @return array<string, mixed>
     */
    private function tuple(mixed $data): array
    {
        self::fields($data, ['v', 'seed', 'tier', 'grade', 'depth', 'k', 'run'], 'tuple');
        if (!is_string($data['seed']) || !preg_match('/^[a-z0-9-]{1,32}\z/', $data['seed'])) {
            throw Refusal::invalid('tuple.seed');
        }
        $run = $data['run'];
        if (!is_array($run) || !array_is_list($run) || count($run) < 1 || count($run) > 13) {
            throw Refusal::invalid('tuple.run');
        }
        $played = [];
        foreach ($run as $i => $p) {
            self::fields($p, ['text', 'explored', 'score'], "tuple.run.$i");
            $played[] = [
                'text' => self::checkText($p['text'], "tuple.run.$i.text"),
                'explored' => self::int($p['explored'], 0, 10000000, "tuple.run.$i.explored"),
                'score' => self::int($p['score'], 0, 10000, "tuple.run.$i.score"),
            ];
        }
        return [
            'v' => self::int($data['v'], 1, 1000000, 'tuple.v'),
            'seed' => $data['seed'],
            'tier' => self::int($data['tier'], 1, 10, 'tuple.tier'),
            'grade' => self::grade($data['grade'], 'tuple.grade'),
            'depth' => self::int($data['depth'], 2, 100000, 'tuple.depth'),
            'k' => self::int($data['k'], 0, $this->config['parts'] - 1, 'tuple.k'),
            'run' => $played,
        ];
    }

    /** @param array<string, mixed> $a @param array<string, mixed> $b both checked by made() */
    private static function sameMade(array $a, array $b): bool
    {
        foreach (self::MADE_FIELDS as $f) {
            if ($a[$f] !== $b[$f]) {
                return false;
            }
        }
        return true;
    }

    // ---- Quarantine, admission, roll-out ----------------------------------

    /** @param array<string, mixed> $item */
    private static function holds(array $item, string $who): bool
    {
        return in_array($who, array_column($item['ok'], 'i'), true) || in_array($who, array_column($item['tk'], 'i'), true);
    }

    /**
     * Counts a matching verdict on pending item $i and admits the level once
     * it has the needed verdicts from distinct installs other than the
     * uploader's, at least one from a network other than the uploader's.
     * @param list<array<string, mixed>> $served
     * @param list<array<string, mixed>> $pending
     */
    private function admitIfReady(array &$served, array &$pending, int $i, string $who, string $net): void
    {
        $item = &$pending[$i];
        if ($who !== $item['up']['i'] && !in_array($who, array_column($item['ok'], 'i'), true)) {
            $item['ok'][] = ['i' => $who, 'n' => $net];
        }
        $others = array_filter($item['ok'], static fn(array $ok): bool => $ok['i'] !== $item['up']['i']);
        $elsewhere = array_filter($others, static fn(array $ok): bool => $ok['n'] !== $item['up']['n']);
        if (count($others) < $this->config['needed'] || !$elsewhere) {
            return;
        }
        unset($item);
        $this->admit($served, $pending, $i);
    }

    /**
     * Moves pending item $i into the served pool (unless its layout is already
     * there) and rolls out what the cap no longer holds.
     * @param list<array<string, mixed>> $served
     * @param list<array<string, mixed>> $pending
     */
    private function admit(array &$served, array &$pending, int $i): void
    {
        $entry = $pending[$i];
        array_splice($pending, $i, 1);
        if (in_array($entry['h'], array_column($served, 'h'), true)) {
            return;
        }
        $served[] = self::servedEntry($entry['made'], $entry['h'], $entry['v'], ($this->clock)());
        $this->admitted[] = $entry['h'];
        $this->rollOut($served);
    }

    /**
     * A served entry as the store keeps it.
     * @param array<string, mixed> $made checked by made()
     * @return array<string, mixed>
     */
    public static function servedEntry(array $made, string $h, int $v, int $at): array
    {
        return ['made' => $made, 'h' => $h, 'v' => $v, 'at' => $at, 'n' => 0];
    }

    /**
     * While the grade is over its cap, retires one served level at random,
     * weighted (1 + whole days since it came in) × (1 + times served).
     * @param list<array<string, mixed>> $served
     */
    private function rollOut(array &$served): void
    {
        while (count($served) > $this->config['servedCap']) {
            array_splice($served, $this->pick($this->retireWeights($served)), 1);
        }
    }

    /**
     * Each served level's weight for retiring: (1 + whole days since it came
     * in) × (1 + times served).
     * @param list<array<string, mixed>> $served
     * @return array<int, int>
     */
    private function retireWeights(array $served): array
    {
        $now = ($this->clock)();
        $weights = [];
        foreach ($served as $i => $entry) {
            $weights[$i] = (1 + intdiv(max(0, $now - $entry['at']), self::DAY)) * (1 + $entry['n']);
        }
        return $weights;
    }

    /**
     * One key of $weights at random, in proportion to its weight.
     * @param array<int, int> $weights every weight at least 1
     */
    private function pick(array $weights): int
    {
        $roll = ($this->rng)(1, array_sum($weights));
        foreach ($weights as $i => $w) {
            $roll -= $w;
            if ($roll <= 0) {
                return $i;
            }
        }
        return array_key_last($weights);
    }

    /**
     * @param list<string> $list
     * @return list<string>
     */
    private function shuffled(array $list): array
    {
        for ($i = count($list) - 1; $i > 0; $i--) {
            $j = ($this->rng)(0, $i);
            [$list[$i], $list[$j]] = [$list[$j], $list[$i]];
        }
        return $list;
    }

    // ---- Who: installs, networks, strikes ----------------------------------

    /** The only form an install id is kept in. */
    public static function installHash(string $install): string
    {
        return substr(hash('sha256', $install), 0, 16);
    }

    /** A network's code under $key: the score guard's clientKey rule (an IPv6 client's /64) with $key as the HMAC key. */
    public function netCode(string $addr, string $key): string
    {
        $probe = new ScoreGuard($this->config['guard'], 'X-Crete-CSRF', $key, ['REMOTE_ADDR' => $addr], [], $this->dir . '/guard.json');
        return $probe->clientKey();
    }

    /**
     * True when $who, or the network at $addr, has strikeLimit strikes in the
     * last strikeHours.
     * @param array<string, array{id: string, key: string, at: int}> $keys
     */
    private function throttled(string $who, string $addr, array $keys): bool
    {
        return $this->withStrikes(function (array &$strikes) use ($who, $addr, $keys): bool {
            $byInstall = 0;
            $byNet = 0;
            foreach ($strikes as $s) {
                $byInstall += $s['i'] === $who ? 1 : 0;
                if (isset($keys[$s['kid']]) && $s['n'] === $this->netCode($addr, $keys[$s['kid']]['key'])) {
                    $byNet++;
                }
            }
            return max($byInstall, $byNet) >= $this->config['strikeLimit'];
        });
    }

    /** One strike against an uploader's install and network. */
    private function strike(string $who, string $net, string $kid): void
    {
        $now = ($this->clock)();
        $this->withStrikes(function (array &$strikes) use ($who, $net, $kid, $now): void {
            $strikes[] = ['i' => $who, 'n' => $net, 'kid' => $kid, 'at' => $now];
        });
    }

    private function withStrikes(\Closure $fn): mixed
    {
        return $this->locked('strikes', function () use ($fn): mixed {
            $path = $this->dir . '/strikes.json';
            $raw = self::read($path);
            $since = ($this->clock)() - $this->config['strikeHours'] * 3600;
            $strikes = array_values(array_filter(self::decodeList($raw, $path), static fn(array $s): bool => $s['at'] >= $since));
            $result = $fn($strikes);
            $this->writeIfChanged($path, $raw, $strikes);
            return $result;
        });
    }

    /**
     * The network keys still kept, oldest first, by id: a new random key every
     * three days, the one before kept three more days, then deleted.
     * @return array<string, array{id: string, key: string, at: int}>
     */
    private function keys(): array
    {
        return $this->locked('keys', function (): array {
            $path = $this->dir . '/keys.json';
            $raw = self::read($path);
            $now = ($this->clock)();
            $keys = array_values(array_filter(self::decodeList($raw, $path), static fn(array $k): bool => $k['at'] > $now - 2 * self::KEY_DAYS * self::DAY));
            if (!$keys || end($keys)['at'] <= $now - self::KEY_DAYS * self::DAY) {
                $keys[] = ['id' => bin2hex(random_bytes(4)), 'key' => bin2hex(random_bytes(32)), 'at' => $now];
            }
            $this->writeIfChanged($path, $raw, $keys);
            return array_column($keys, null, 'id');
        });
    }

    /** The current network key: the HMAC key endless-bank.php gives the score guard for its rate stamps. */
    public function networkKey(): string
    {
        $keys = $this->keys();
        return end($keys)['key'];
    }

    // ---- Storage ------------------------------------------------------------

    /**
     * Runs $fn on a grade's served and pending stores under the grade's lock
     * and writes back whichever it changed. Served levels of a version no
     * longer accepted leave first, so retiring a version from `accept` retires
     * its levels at the grade's next request; so do pending levels past
     * pendingDays, of a version no longer accepted, or made under a deleted
     * network key.
     *
     * Every served level that leaves (turned over, rolled out past the cap,
     * reported, or of a retired version) has its layout hash kept in
     * retired-<grade>.json, written under the same lock before the served
     * store, so it can never be served again: $fn gets that set, keyed by
     * hash, as its third argument. About 19 bytes a level, kept for good.
     * @param array<string, array{id: string, key: string, at: int}> $keys
     */
    private function withGrade(string $grade, array $keys, \Closure $fn): mixed
    {
        return $this->locked($grade, function () use ($grade, $keys, $fn): mixed {
            $servedPath = "{$this->dir}/served-$grade.json";
            $pendingPath = "{$this->dir}/pending-$grade.json";
            $retiredPath = "{$this->dir}/retired-$grade.json";
            $servedRaw = self::read($servedPath);
            $pendingRaw = self::read($pendingPath);
            $retiredRaw = self::read($retiredPath);
            $retired = array_fill_keys(self::decodeHashes($retiredRaw, $retiredPath), true);
            $before = array_column(self::decodeList($servedRaw, $servedPath), 'h');
            $accepted = fn(array $e): bool => in_array($e['v'] ?? null, $this->config['accept'], true);
            $served = array_values(array_filter(self::decodeList($servedRaw, $servedPath), $accepted));
            $since = ($this->clock)() - $this->config['pendingDays'] * self::DAY;
            $pending = array_values(array_filter(
                self::decodeList($pendingRaw, $pendingPath),
                fn(array $p): bool => $p['at'] >= $since && $accepted($p) && isset($keys[$p['kid']]),
            ));
            // Reports are kept for pendingDays only, then forgotten with the install and network codes they hold.
            foreach ($served as $k => $entry) {
                if (isset($entry['r'])) {
                    $kept = array_values(array_filter($entry['r'], static fn(array $r): bool => $r['at'] >= $since && isset($r['n'])));
                    if ($kept) {
                        $served[$k]['r'] = $kept;
                    } else {
                        unset($served[$k]['r']);
                    }
                }
            }
            $this->admitted = [];
            $result = $fn($served, $pending, $retired);
            foreach (array_diff([...$before, ...$this->admitted], array_column($served, 'h')) as $gone) {
                $retired[$gone] = true;
            }
            // An all-digit hash is an integer key in PHP: written back as the string it is.
            $this->writeIfChanged($retiredPath, $retiredRaw, array_map('strval', array_keys($retired)));
            $this->writeIfChanged($servedPath, $servedRaw, array_values($served));
            $this->writeIfChanged($pendingPath, $pendingRaw, array_values($pending));
            return $result;
        });
    }

    /** Runs $fn holding an exclusive flock on <name>.lock. */
    private function locked(string $name, \Closure $fn): mixed
    {
        $path = "{$this->dir}/$name.lock";
        $fh = @fopen($path, 'c');
        if ($fh === false) {
            throw new \RuntimeException('cannot open ' . $path);
        }
        try {
            if (!flock($fh, LOCK_EX)) {
                throw new \RuntimeException('cannot lock ' . $path);
            }
            @chmod($path, $this->fileMode);
            return $fn();
        } finally {
            flock($fh, LOCK_UN);
            fclose($fh);
        }
    }

    private static function read(string $path): string
    {
        if (!is_file($path)) {
            return '';
        }
        $raw = file_get_contents($path);
        if ($raw === false) {
            throw new \RuntimeException('cannot read ' . $path);
        }
        return $raw;
    }

    /**
     * A store's list; an empty file is an empty list. A store that will not
     * parse is left alone for repair rather than overwritten.
     * @return list<array<string, mixed>>
     */
    private static function decodeList(string $raw, string $path): array
    {
        if ($raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data) || !array_is_list($data)) {
            throw new \RuntimeException('not a JSON list: ' . $path);
        }
        return $data;
    }

    /**
     * The retired store's hashes; an empty file is none. A store that will not
     * parse is left alone for repair rather than overwritten.
     * @return list<string>
     */
    private static function decodeHashes(string $raw, string $path): array
    {
        $list = $raw === '' ? [] : json_decode($raw, true);
        if (!is_array($list) || !array_is_list($list) || array_filter($list, static fn(mixed $h): bool => !is_string($h)) !== []) {
            throw new \RuntimeException('not a JSON list of hashes: ' . $path);
        }
        return $list;
    }

    /** The bytes a store is written as. */
    public static function encode(mixed $data): string
    {
        $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            throw new \RuntimeException('encode failed');
        }
        return $json;
    }

    /** Writes $data to $path when it differs from $raw: to a temporary file in the same folder, synced, then renamed over the old one. */
    private function writeIfChanged(string $path, string $raw, mixed $data): void
    {
        $bytes = self::encode($data);
        if ($bytes === $raw || ($raw === '' && $bytes === '[]')) {
            return;
        }
        $tmp = dirname($path) . '/.' . basename($path) . '.' . bin2hex(random_bytes(6)) . '.tmp';
        $old = umask(0777 & ~$this->fileMode);
        try {
            $fh = @fopen($tmp, 'x');
        } finally {
            umask($old);
        }
        if ($fh === false) {
            throw new \RuntimeException('cannot create ' . $tmp);
        }
        $ok = fwrite($fh, $bytes) === strlen($bytes) && fflush($fh);
        if ($ok) {
            @fsync($fh);
        }
        fclose($fh);
        if (!$ok || !@chmod($tmp, $this->fileMode) || !@rename($tmp, $path)) {
            @unlink($tmp);
            throw new \RuntimeException('cannot write ' . $path);
        }
    }
}
