<?php
// The room shelf, live: the server (its own php -S on a free 127.0.0.1 port, a private data directory, a two-match, two-lobby cap) is RoomsTest's setUpBeforeClass.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 2));
}

use PHPUnit\Framework\TestCase;

final class RoomsTest extends TestCase
{
    private static string $tmp;
    private static string $base;
    private static int $port;
    /** @var array<string, string|false> */
    private static array $env;
    /** @var resource */
    private static $proc;

    public static function setUpBeforeClass(): void
    {
        self::$tmp = sys_get_temp_dir() . '/tankity-rooms-test-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir(self::$tmp, 0700);
        file_put_contents(self::$tmp . '/test.yaml', "max_rooms: 2\nmax_lobbies: 2\nroom_live_secs: 60\n");
        self::$env = array_merge(getenv(), ['CONFIG_FILE' => self::$tmp . '/test.yaml', 'TANKITY_DATA_DIR' => self::$tmp . '/data']);
        // The room functions, in this process, for aging records and holding the lock.
        putenv('CONFIG_FILE=' . self::$tmp . '/test.yaml');
        putenv('TANKITY_DATA_DIR=' . self::$tmp . '/data');
        require_once dirname(__DIR__) . '/php/rooms-lib.php';
        tankity_config(true);
        // Ask the kernel for a free port, then hand it to php -S.
        $probe = stream_socket_server('tcp://127.0.0.1:0');
        self::$port = (int) substr((string) strrchr((string) stream_socket_get_name($probe, false), ':'), 1);
        fclose($probe);
        self::$base = 'http://127.0.0.1:' . self::$port;
        self::$proc = self::spawn();
        self::assertIsResource(self::$proc, 'server-spawn');
    }

    public static function tearDownAfterClass(): void
    {
        proc_terminate(self::$proc);
        proc_close(self::$proc);
        // Remove the private shelf.
        tankity_test_rm(self::$tmp);
        putenv('CONFIG_FILE');
        tankity_config(true);
    }

    /** Every test starts on an empty shelf, a creation throttle after the last one. */
    protected function setUp(): void
    {
        tankity_db()->exec('DELETE FROM rooms');
        usleep(1100000);
    }

    /** @return resource */
    private static function spawn()
    {
        return proc_open(
            [PHP_BINARY, '-S', '127.0.0.1:' . self::$port, '-t', TANKITY_GAME_DIR],
            [0 => ['file', '/dev/null', 'r'], 1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
            $pipes,
            null,
            self::$env
        );
    }

    private static function storedInitials(string $c): string
    {
        [$room, $lock] = room_load($c);
        room_unlock($lock);
        return is_array($room) ? ($room['seats'][0]['initials'] ?? '(missing)') : '(no room)';
    }

    private static function storedDifficulty(string $c): string
    {
        [$room, $lock] = room_load($c);
        room_unlock($lock);
        return is_array($room) ? ($room['difficulty'] ?? '(missing)') : '(no room)';
    }

    private static function storedTurn(string $c): int
    {
        [$room, $lock] = room_load($c);
        room_unlock($lock);
        return is_array($room) ? room_turn_secs($room) : -1;
    }

    private static function ageRoom(string $c): void
    {
        room_test_age($c, 3600);
    }

    private static function get(string $url, int $timeout = 5): mixed
    {
        $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'ignore_errors' => true]]);
        $raw = @file_get_contents($url, false, $ctx);
        return $raw === false ? null : json_decode($raw, true);
    }

    private static function post(string $action, array $body): mixed
    {
        $ctx = stream_context_create(['http' => [
            'method' => 'POST', 'timeout' => 5, 'ignore_errors' => true,
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($body),
        ]]);
        $raw = @file_get_contents(self::$base . '/rooms.php?action=' . $action, false, $ctx);
        return $raw === false ? null : json_decode($raw, true);
    }

    private static function waitUp(): mixed
    {
        $ping = null;
        for ($i = 0; $i < 50 && $ping === null; $i++) {
            usleep(100000);
            $ping = self::get(self::$base . '/rooms.php?action=ping');
        }
        return $ping;
    }

    /** @return array{list<string>, string} the response headers and body */
    private static function rawGet(string $url, string $accept): array
    {
        $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true, 'header' => $accept === '' ? '' : "Accept-Encoding: $accept\r\n"]]);
        $body = @file_get_contents($url, false, $ctx);
        return [$http_response_header ?? [], $body === false ? '' : $body];
    }

    private static function headerOf(array $headers, string $name): string
    {
        foreach ($headers as $h) {
            if (stripos($h, $name . ':') === 0) {
                return trim(substr($h, strlen($name) + 1));
            }
        }
        return '';
    }

    private static function volatile(array $r): array
    {
        unset($r['room']['turnLeft'], $r['room']['shopLeft']);
        return $r;
    }

    private static function seatsOf(mixed $r): array
    {
        return $r['room']['seats'] ?? [];
    }

    private static function modeOf(mixed $r, int $i): string
    {
        return self::seatsOf($r)[$i]['mode'] ?? '?';
    }

    /** Create, count and stale: a new room counts, initials are upper-cased and the difficulty defaults, an untouched room is swept and unreachable. */
    public function testShelfCounting(): void
    {
        $ping = self::waitUp();
        self::assertTrue($ping !== null, 'server-up');
        self::assertTrue(($ping['rooms']['max'] ?? 0) === 2, 'cap-from-file' . ' :: ' . 'max=' . ($ping['rooms']['max'] ?? '?'));
        self::assertTrue(($ping['rooms']['used'] ?? -1) === 0 && ($ping['lobbies']['used'] ?? -1) === 0, 'empty-shelf');

        $room = self::post('create', ['initials' => 'tst']);
        self::assertTrue(($room['ok'] ?? false) === true, 'create-ok' . ' :: ' . 'code=' . ($room['code'] ?? '?'));
        $code = (string) ($room['code'] ?? '');
        $token = (string) ($room['token'] ?? '');
        $ping = self::get(self::$base . '/rooms.php?action=ping');
        self::assertTrue(($ping['lobbies']['used'] ?? -1) === 1 && ($ping['rooms']['used'] ?? -1) === 0, 'a-lobby-counts-in-the-pool-not-the-slots');
        self::assertTrue(self::storedInitials($code) === 'TST', 'lowercase-initials-stored-uppercase' . ' :: ' . self::storedInitials($code));
        self::assertTrue(self::storedDifficulty($code) === 'normal', 'create-without-difficulty-stores-normal' . ' :: ' . self::storedDifficulty($code));

        // Age a record the way an abandoned room ages.
        self::ageRoom($code);
        // An untouched record is truly gone: the sweep drops it, freeing the slot.
        $ping = self::get(self::$base . '/rooms.php?action=ping');
        self::assertTrue(($ping['lobbies']['used'] ?? -1) === 0, 'stale-not-counted');
        $gone = self::get(self::$base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
        self::assertTrue(($gone['error'] ?? '') === 'no such room', 'stale-unreachable' . ' :: ' . ($gone['error'] ?? ''));
    }

    /** a seated state poll is a heartbeat, a request holding the write lock never stalls the count, the ceiling uses the live count and rooms outlive a server restart. */
    public function testShelfCeilingAndRestart(): void
    {
        $room = self::post('create', ['initials' => 'qrs', 'difficulty' => 'hard']);
        $code = (string) ($room['code'] ?? '');
        $token = (string) ($room['token'] ?? '');
        $state = self::get(self::$base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
        self::assertTrue(($state['ok'] ?? false) === true, 'heartbeat-ok');
        self::assertTrue(self::storedDifficulty($code) === 'hard', 'create-stores-the-hosts-difficulty' . ' :: ' . self::storedDifficulty($code));
        self::assertTrue(($state['room']['difficulty'] ?? null) === 'hard', 'snapshot-shows-the-difficulty' . ' :: ' . json_encode($state['room']['difficulty'] ?? null));
        $ping = self::get(self::$base . '/rooms.php?action=ping');
        self::assertTrue(($ping['lobbies']['used'] ?? -1) === 1, 'heartbeat-counts');

        // A request holding the write lock never stalls the shelf's count: ping only
        // reads (RoomsStoreTest covers the full lock behaviour).
        $held = tankity_db();
        $held->exec('BEGIN IMMEDIATE');
        $lockT = microtime(true);
        $pingHeld = self::get(self::$base . '/rooms.php?action=ping', 20);
        $lockDt = microtime(true) - $lockT;
        $held->exec('ROLLBACK');
        self::assertTrue($pingHeld !== null && ($pingHeld['lobbies']['used'] ?? -1) >= 1
            && $lockDt < 1.0, 'ping-ignores-room-lock' . ' :: ' . sprintf('wait=%.2fs', $lockDt));

        // The ceiling uses the live count, and refusals stay human.
        $second = self::post('create', ['initials' => 'abc', 'difficulty' => 'HARD', 'turn' => 28800]);
        self::assertTrue(self::storedDifficulty((string) ($second['code'] ?? '')) === 'normal', 'create-with-an-unknown-difficulty-stores-normal' . ' :: ' . self::storedDifficulty((string) ($second['code'] ?? '')));
        $storedTurn = function (string $c) {
            [$room, $lock] = room_load($c);
            room_unlock($lock);
            return is_array($room) ? room_turn_secs($room) : -1;
        };
        self::assertTrue(self::storedTurn((string) ($second['code'] ?? '')) === 28800, 'create-with-a-turn-time-stores-it' . ' :: ' . (string) self::storedTurn((string) ($second['code'] ?? '')));
        usleep(1100000); // respect the creation throttle before the next attempt
        $third = self::post('create', ['initials' => 'def']);
        self::assertTrue(($second['ok'] ?? false) === true && ($third['ok'] ?? false) === false, 'cap-live' . ' :: ' . 'second=' . ($second['code'] ?? '?') . ' thirdErr=' . ($third['error'] ?? '?'));
        self::assertTrue(isset($third['error']) && strpos($third['error'], 'Every lobby is busy') !== false, 'cap-human' . ' :: ' . ($third['error'] ?? ''));

        // Rooms live in the database, which outlives a web-server restart: a
        // restarted server still sees the same shelf. Then age every room out so the
        // cap is free for the match below.
        proc_terminate(self::$proc);
        proc_close(self::$proc);
        self::$proc = self::spawn();
        $ping = self::waitUp();
        self::assertTrue(($ping['lobbies']['used'] ?? -1) === 2, 'restart-keeps-shelf' . ' :: ' . 'used=' . ($ping['lobbies']['used'] ?? '?'));
        foreach ([$code, (string) ($second['code'] ?? '')] as $c) {
            self::ageRoom($c);
        }
        $ping = self::get(self::$base . '/rooms.php?action=ping');
        self::assertTrue(($ping['lobbies']['used'] ?? -1) === 0, 'sweep-frees-cap' . ' :: ' . 'used=' . ($ping['lobbies']['used'] ?? '?'));
        $gone = self::get(self::$base . '/rooms.php?action=state&code=' . $code . '&token=' . $token . '&since=0');
        self::assertTrue(($gone['error'] ?? '') === 'no such room', 'swept-unreachable' . ' :: ' . ($gone['error'] ?? ''));
    }

    /** Turns must cycle host -> guest -> battery. A guest who just sat down is present, not idle (no instant auto-fire), and one drone shot passes the turn on instead of machine-gunning the whole round from a frozen turn. */
    public function testMatchFlow(): void
    {
        $match = self::post('create', ['initials' => 'hos']);
        $mcode = (string) ($match['code'] ?? '');
        $mtoken = (string) ($match['token'] ?? '');
        $mcsrf = (string) ($match['csrf'] ?? '');
        $guest = self::post('join', ['code' => $mcode, 'initials' => 'gst', 'difficulty' => 'easy']);
        $gseat = (int) ($guest['seat'] ?? -1);
        $gtoken = (string) ($guest['token'] ?? '');
        $gcsrf = (string) ($guest['csrf'] ?? '');
        self::assertTrue(($match['ok'] ?? false) === true && ($guest['ok'] ?? false) === true && $gseat === 1, 'match-seats' . ' :: ' . 'code=' . $mcode . ' gseat=' . $gseat);
        self::assertTrue(self::storedDifficulty($mcode) === 'normal', 'a-joiner-cannot-change-the-difficulty' . ' :: ' . self::storedDifficulty($mcode));
        // The host's next poll carries the guest's arrival, so the lobby can say so.
        $lobby = self::get(self::$base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
        $joins = array_values(array_filter($lobby['room']['events'] ?? [], fn($e) => ($e['t'] ?? '') === 'join'));
        self::assertTrue(count($joins) === 1 && ($joins[0]['seat'] ?? -1) === $gseat && ($joins[0]['seq'] ?? 0) > 0, 'join-event-reaches-the-host' . ' :: ' . json_encode($joins));
        usleep(300000); // seats clock in on create/join; starting is throttled like any other act
        $started = self::post('start', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
        self::assertTrue(($started['ok'] ?? false) === true && ($started['room']['turn'] ?? -1) === 0, 'match-starts' . ' :: ' . 'turn=' . ($started['room']['turn'] ?? '?'));
        usleep(300000);
        $afterHost = self::post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'fire']);
        $turnH = $afterHost['room']['turn'] ?? -1;
        $aiH = 0;
        $guestHp = -1;
        foreach (($afterHost['room']['events'] ?? []) as $e) {
            if (($e['t'] ?? '') === 'aifire') $aiH++;
        }
        foreach (($afterHost['room']['tanks'] ?? []) as $t) {
            if (($t['seat'] ?? -1) === 1) $guestHp = (int) $t['hp'];
        }
        self::assertTrue(($afterHost['ok'] ?? false) === true && $turnH === 1 && $aiH === 0 && $guestHp > 0, 'turn-reaches-guest' . ' :: ' . 'turn=' . $turnH . ' ai=' . $aiH . ' guestHp=' . $guestHp);
        usleep(300000);
        $afterGuest = self::post('act', ['code' => $mcode, 'token' => $gtoken, 'csrf' => $gcsrf, 'kind' => 'fire']);
        $turnG = $afterGuest['room']['turn'] ?? -1;
        $aiG = 0;
        foreach (($afterGuest['room']['events'] ?? []) as $e) {
            if (($e['t'] ?? '') === 'aifire') $aiG++;
        }
        self::assertTrue(($afterGuest['ok'] ?? false) === true && $turnG === 0 && $aiG >= 1 && $aiG <= 2, 'turn-cycles-past-ai' . ' :: ' . 'turn=' . $turnG . ' ai=' . $aiG);
        usleep(300000);
        $calm = self::get(self::$base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
        $aiC = 0;
        foreach (($calm['room']['events'] ?? []) as $e) {
            if (($e['t'] ?? '') === 'aifire') $aiC++;
        }
        self::assertTrue(($calm['ok'] ?? false) === true && ($calm['room']['turn'] ?? -1) === 0 && $aiC === $aiG, 'polls-hold-turn' . ' :: ' . 'turn=' . ($calm['room']['turn'] ?? '?') . ' ai=' . $aiC);
        // Delta snapshots: the hills ride only when the asker lacks them. A poll
        // names the terrainRev it holds (have); the reply leaves terrain out when that
        // is the room's revision, and always names the revision. full=1, another
        // revision, or a missing have gets everything.
        $dUrl = self::$base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken;
        $dFull = self::get($dUrl . '&since=0');
        $dRev = $dFull['room']['terrainRev'] ?? null;
        self::assertTrue(is_int($dRev) && is_array($dFull['room']['terrain'] ?? null) && count($dFull['room']['terrain']) === 720
            && !isset($dFull['room']['resync']), 'delta-first-poll-is-full' . ' :: ' . json_encode([$dRev, count($dFull['room']['terrain'] ?? [])]));
        $dLean = self::get($dUrl . '&since=0&have=' . $dRev);
        self::assertTrue(($dLean['ok'] ?? false) === true && !array_key_exists('terrain', $dLean['room'] ?? [])
            && ($dLean['room']['terrainRev'] ?? null) === $dRev && count($dLean['room']['tanks'] ?? []) >= 2, 'delta-omits-terrain-when-rev-matches' . ' :: ' . json_encode(array_keys($dLean['room'] ?? [])));
        $dOther = self::get($dUrl . '&since=0&have=' . ($dRev + 1));
        self::assertTrue(count($dOther['room']['terrain'] ?? []) === 720 && ($dOther['room']['terrainRev'] ?? null) === $dRev, 'delta-other-rev-gets-terrain');
        $dForce = self::get($dUrl . '&since=0&full=1&have=' . $dRev);
        self::assertTrue(count($dForce['room']['terrain'] ?? []) === 720 && ($dForce['room']['terrain'] ?? []) === ($dFull['room']['terrain'] ?? null), 'delta-full-1-returns-terrain');
        $dZero = self::get($dUrl . '&since=0&full=0&have=' . $dRev);
        self::assertTrue(!array_key_exists('terrain', $dZero['room'] ?? []), 'delta-full-0-is-not-full');
        // since cannot be ahead of the room: events were lost (a restarted room), so
        // the answer is a full resync.
        $dLost = self::get($dUrl . '&since=99999&have=' . $dRev);
        self::assertTrue(($dLost['room']['resync'] ?? false) === true && count($dLost['room']['terrain'] ?? []) === 720, 'delta-stale-since-resyncs-with-terrain' . ' :: ' . json_encode(array_keys($dLost['room'] ?? [])));
        // The same fields ride on the POST actions (act, ready, buy).
        usleep(300000);
        $dAct = self::post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 60, 'power' => 50, 'since' => 999999, 'have' => $dRev]);
        self::assertTrue(($dAct['room']['resync'] ?? false) === true && count($dAct['room']['terrain'] ?? []) === 720, 'delta-act-reply-resyncs-too' . ' :: ' . json_encode(array_keys($dAct['room'] ?? [])));
        usleep(300000);
        $dAct = self::post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 61, 'power' => 50, 'since' => 0, 'have' => $dRev]);
        self::assertTrue(($dAct['ok'] ?? false) === true && !array_key_exists('terrain', $dAct['room'] ?? []) && !isset($dAct['room']['resync']), 'delta-act-reply-omits-terrain' . ' :: ' . json_encode(array_keys($dAct['room'] ?? ['error' => $dAct['error'] ?? '?'])));
        usleep(300000);
        $dReady = self::post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'ready' => false, 'have' => $dRev]);
        self::assertTrue(($dReady['ok'] ?? false) === true && !array_key_exists('terrain', $dReady['room'] ?? []), 'delta-ready-reply-omits-terrain');
        // A client that sends nothing extra still gets the old, complete reply.
        usleep(300000);
        $dPlain = self::post('act', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'kind' => 'aim', 'angle' => 62, 'power' => 50]);
        self::assertTrue(count($dPlain['room']['terrain'] ?? []) === 720, 'delta-plain-client-gets-terrain');
        // Compression: Accept-Encoding: gzip returns Content-Encoding: gzip that
        // decodes to the same JSON; without it the body is plain.
        $rawGet = function (string $url, string $accept) {
            $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true, 'header' => $accept === '' ? '' : "Accept-Encoding: $accept\r\n"]]);
            $body = @file_get_contents($url, false, $ctx);
            return [$http_response_header ?? [], $body === false ? '' : $body];
        };
        $headerOf = function (array $headers, string $name): string {
            foreach ($headers as $h) {
                if (stripos($h, $name . ':') === 0) {
                    return trim(substr($h, strlen($name) + 1));
                }
            }
            return '';
        };
        $volatile = function (array $r): array {
            unset($r['room']['turnLeft'], $r['room']['shopLeft']);
            return $r;
        };
        [$hPlain, $bPlain] = self::rawGet($dUrl . '&since=0', '');
        [$hGz, $bGz] = self::rawGet($dUrl . '&since=0', 'gzip');
        $unz = $bGz === '' ? false : @gzdecode($bGz);
        self::assertTrue(self::headerOf($hPlain, 'Content-Encoding') === '' && is_array(json_decode($bPlain, true)), 'gzip-plain-without-accept-encoding');
        self::assertTrue(strtolower(self::headerOf($hGz, 'Content-Encoding')) === 'gzip' && stripos(self::headerOf($hGz, 'Vary'), 'Accept-Encoding') !== false, 'gzip-content-encoding' . ' :: ' . json_encode($hGz));
        self::assertTrue($unz !== false && self::volatile(json_decode($unz, true)) == self::volatile(json_decode($bPlain, true)), 'gzip-decodes-to-the-same-json' . ' :: ' . ($unz === false ? 'gzdecode failed' : ''));
        self::assertTrue($bGz !== '' && strlen($bGz) * 2 < strlen($bPlain), 'gzip-shrinks-the-reply' . ' :: ' . strlen($bGz) . ' vs ' . strlen($bPlain));
        [$hErr, $bErr] = self::rawGet(self::$base . '/rooms.php?action=state&code=ZZZZ&token=x', 'gzip');
        $errJson = $bErr === '' ? null : json_decode((string) @gzdecode($bErr), true);
        self::assertTrue(is_array($errJson) && ($errJson['error'] ?? '') === 'no such room' && strtolower(self::headerOf($hErr, 'Content-Encoding')) === 'gzip', 'gzip-errors-compress-too');
        self::assertTrue(strpos($hErr[0] ?? '', '404') !== false, 'gzip-error-status-kept' . ' :: ' . ($hErr[0] ?? ''));
        // Ready outside the shop changes nothing and answers quietly with the room
        // as it is; a ready that does not say true or false is refused.
        usleep(300000);
        $idle = self::post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf, 'ready' => false]);
        self::assertTrue(($idle['ok'] ?? false) === true && ($idle['room']['phase'] ?? '') === 'play'
            && array_key_exists('shopLeft', $idle['room']) && $idle['room']['shopLeft'] === null, 'ready-outside-shop-ignored' . ' :: ' . json_encode($idle['room']['phase'] ?? $idle));
        $vague = self::post('ready', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
        self::assertTrue(!isset($vague['ok']) && isset($vague['error']), 'ready-needs-a-state' . ' :: ' . json_encode($vague));
        // Leaving: a guest's seat goes to the battery and the room stays; the last
        // human out closes the room at once, freeing its slot.
        usleep(300000);
        $gLeft = self::post('leave', ['code' => $mcode, 'token' => $gtoken, 'csrf' => $gcsrf]);
        $after = self::get(self::$base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
        $gSeat = $after['room']['seats'][1] ?? [];
        self::assertTrue(($gLeft['ok'] ?? false) === true && ($gSeat['human'] ?? true) === false, 'leave-guest-to-battery' . ' :: ' . json_encode($gSeat));
        usleep(300000);
        $usedBefore = (self::get(self::$base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
        $hLeft = self::post('leave', ['code' => $mcode, 'token' => $mtoken, 'csrf' => $mcsrf]);
        $usedAfter = (self::get(self::$base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
        self::assertTrue(($hLeft['ok'] ?? false) === true && $usedAfter === $usedBefore - 1, 'leave-last-closes-room' . ' :: ' . "used $usedBefore -> $usedAfter");
        $gone = self::get(self::$base . '/rooms.php?action=state&code=' . $mcode . '&token=' . $mtoken . '&since=0');
        self::assertTrue(($gone['error'] ?? '') === 'no such room', 'leave-room-gone' . ' :: ' . ($gone['error'] ?? ''));
    }

    /** Seat modes. The host flips seats nobody holds between AI and Open; nobody else may; open seats field no tank; a guest takes the first free chair. */
    public function testSeatModesAndTurnTime(): void
    {
        $seatsOf = fn($r) => $r['room']['seats'] ?? [];
        $modeOf = fn($r, int $i) => self::seatsOf($r)[$i]['mode'] ?? '?';
        $m2 = self::post('create', ['initials' => 'sma', 'turn' => 5]);
        $c2 = (string) ($m2['code'] ?? '');
        self::assertTrue(self::storedTurn($c2) === 120, 'create-with-an-unknown-turn-time-stores-the-default' . ' :: ' . (string) self::storedTurn($c2));
        $h2 = ['code' => $c2, 'token' => (string) ($m2['token'] ?? ''), 'csrf' => (string) ($m2['csrf'] ?? '')];
        $snap = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
        self::assertTrue(count(self::seatsOf($snap)) === 4 && self::modeOf($snap, 0) === 'human' && self::modeOf($snap, 1) === 'ai'
            && self::modeOf($snap, 3) === 'ai', 'lobby-four-seats' . ' :: ' . json_encode(self::seatsOf($snap)));
        $g2 = self::post('join', ['code' => $c2, 'initials' => 'smb']);
        $g2a = ['code' => $c2, 'token' => (string) ($g2['token'] ?? ''), 'csrf' => (string) ($g2['csrf'] ?? '')];
        self::assertTrue(($g2['seat'] ?? -1) === 1, 'join-takes-first-free-seat');
        usleep(300000);
        $denied = self::post('seatmode', $g2a + ['seat' => 2, 'mode' => 'open']);
        self::assertTrue(isset($denied['error']) && strpos($denied['error'] ?? '', 'host') !== false, 'seatmode-host-only' . ' :: ' . ($denied['error'] ?? ''));
        $noCsrf = self::post('seatmode', ['code' => $c2, 'token' => $h2['token'], 'seat' => 2, 'mode' => 'open']);
        self::assertTrue(isset($noCsrf['error']), 'seatmode-needs-csrf' . ' :: ' . ($noCsrf['error'] ?? ''));
        usleep(300000);
        $fast1 = self::post('seatmode', $h2 + ['seat' => 2, 'mode' => 'open']);
        $fast2 = self::post('seatmode', $h2 + ['seat' => 3, 'mode' => 'open']);
        self::assertTrue(($fast1['ok'] ?? false) === true && isset($fast2['error']) && strpos($fast2['error'] ?? '', 'fast') !== false, 'seatmode-throttled' . ' :: ' . ($fast2['error'] ?? ''));
        usleep(300000);
        $fast2 = self::post('seatmode', $h2 + ['seat' => 3, 'mode' => 'open']);
        self::assertTrue(($fast2['ok'] ?? false) === true && self::modeOf($fast2, 2) === 'open' && self::modeOf($fast2, 3) === 'open', 'seatmode-host-opens' . ' :: ' . json_encode(self::seatsOf($fast2)));
        usleep(300000);
        $onHuman = self::post('seatmode', $h2 + ['seat' => 1, 'mode' => 'open']);
        self::assertTrue(isset($onHuman['error']), 'seatmode-not-on-humans' . ' :: ' . ($onHuman['error'] ?? ''));
        usleep(300000);
        $badMode = self::post('seatmode', $h2 + ['seat' => 2, 'mode' => 'banana']);
        self::assertTrue(isset($badMode['error']), 'seatmode-validates' . ' :: ' . ($badMode['error'] ?? ''));
        $seen = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $g2a['token'] . '&since=0');
        self::assertTrue(self::modeOf($seen, 2) === 'open' && self::modeOf($seen, 1) === 'human', 'guest-sees-open');
        // The guest steps out of the lobby: the chair goes back to a drone seat.
        usleep(300000);
        self::post('leave', $g2a);
        $seen = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
        self::assertTrue(self::modeOf($seen, 1) === 'ai' && (self::seatsOf($seen)[1]['name'] ?? '') !== 'SMB', 'lobby-leave-chair-resets' . ' :: ' . json_encode(self::seatsOf($seen)[1] ?? null));
        // All three other seats open and the host alone: a bundle without the
        // room protocol cannot play that here, so it is told to reload.
        usleep(300000);
        self::post('seatmode', $h2 + ['seat' => 1, 'mode' => 'open']);
        usleep(300000);
        $lone = self::post('start', $h2);
        self::assertTrue(($lone['reload'] ?? false) === true && strpos($lone['error'] ?? '', 'Reload the page') !== false, 'start-alone-old-bundle-reloads' . ' :: ' . json_encode($lone));
        $still = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $h2['token'] . '&since=0');
        self::assertTrue(($still['room']['phase'] ?? '') === 'lobby', 'refused-start-stays-lobby');
        // A guest joins the open chair; humans alone have nobody to fight.
        usleep(300000);
        $g3 = self::post('join', ['code' => $c2, 'initials' => 'smc']);
        $g3a = ['code' => $c2, 'token' => (string) ($g3['token'] ?? ''), 'csrf' => (string) ($g3['csrf'] ?? '')];
        self::assertTrue(($g3['seat'] ?? -1) === 1, 'join-into-open-seat');
        usleep(300000);
        $noFoe = self::post('start', $h2);
        self::assertTrue(isset($noFoe['error']) && strpos($noFoe['error'] ?? '', 'AI') !== false, 'start-refuses-no-drone' . ' :: ' . ($noFoe['error'] ?? ''));
        // One drone seat back on: host + guest + drone, the fourth seat stays open.
        usleep(300000);
        self::post('seatmode', $h2 + ['seat' => 3, 'mode' => 'ai']);
        usleep(300000);
        $go = self::post('start', $h2);
        $seatsFielded = array_map(fn($t) => $t['seat'], $go['room']['tanks'] ?? []);
        sort($seatsFielded);
        self::assertTrue(($go['room']['startHumans'] ?? -1) === 2, 'start-sets-start-humans' . ' :: ' . (string) ($go['room']['startHumans'] ?? '?'));
        self::assertTrue(($go['ok'] ?? false) === true && $seatsFielded === [0, 1, 3], 'start-skips-open-seat' . ' :: ' . json_encode($seatsFielded));
        usleep(300000);
        $late = self::post('join', ['code' => $c2, 'initials' => 'smd']);
        self::assertTrue(isset($late['error']), 'no-join-after-start');
        usleep(300000);
        $late = self::post('seatmode', $h2 + ['seat' => 2, 'mode' => 'ai']);
        self::assertTrue(isset($late['error']), 'no-seatmode-after-start');

        // The turn time: only the host sets it, only to a stop, in any phase; the
        // snapshot carries it and one event says who changed it.
        usleep(300000);
        $tGuest = self::post('turntime', $g3a + ['secs' => 600]);
        self::assertTrue(isset($tGuest['error']) && strpos($tGuest['error'] ?? '', 'host') !== false, 'turntime-host-only' . ' :: ' . json_encode($tGuest));
        usleep(300000);
        $tOdd = self::post('turntime', $h2 + ['secs' => 90]);
        self::assertTrue(isset($tOdd['error']) && strpos($tOdd['error'] ?? '', 'turn time') !== false, 'turntime-only-a-stop' . ' :: ' . json_encode($tOdd));
        usleep(300000);
        $tSet = self::post('turntime', $h2 + ['secs' => 600]);
        $tEvents = array_values(array_filter($tSet['room']['events'] ?? [], fn($e) => ($e['t'] ?? '') === 'turntime'));
        self::assertTrue(($tSet['ok'] ?? false) === true && ($tSet['room']['turnSecs'] ?? 0) === 600
            && count($tEvents) === 1 && $tEvents[0]['secs'] === 600 && $tEvents[0]['seat'] === 0, 'turntime-host-sets-mid-play' . ' :: ' . json_encode($tSet['room']['turnSecs'] ?? $tSet));

        // The game speed: only the host sets it, only to 1, 2 or 4, mid-play; the
        // snapshot carries it and one event says who changed it.
        usleep(300000);
        $sGuest = self::post('speed', $g3a + ['speed' => 2]);
        self::assertTrue(isset($sGuest['error']) && strpos($sGuest['error'] ?? '', 'host') !== false, 'speed-host-only' . ' :: ' . json_encode($sGuest));
        usleep(300000);
        $sOdd = self::post('speed', $h2 + ['speed' => 3]);
        self::assertTrue(isset($sOdd['error']) && strpos($sOdd['error'] ?? '', '4×') !== false, 'speed-only-a-speed' . ' :: ' . json_encode($sOdd));
        usleep(300000);
        $sSet = self::post('speed', $h2 + ['speed' => 4]);
        $sEvents = array_values(array_filter($sSet['room']['events'] ?? [], fn($e) => ($e['t'] ?? '') === 'speed'));
        self::assertTrue(($sSet['ok'] ?? false) === true && ($sSet['room']['speed'] ?? 0) === 4
            && count($sEvents) === 1 && $sEvents[0]['speed'] === 4 && $sEvents[0]['seat'] === 0, 'speed-host-sets-mid-play' . ' :: ' . json_encode($sSet['room']['speed'] ?? $sSet));
        $sSeen = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $g3a['token'] . '&since=0');
        self::assertTrue(($sSeen['room']['speed'] ?? 0) === 4, 'speed-guest-sees-it' . ' :: ' . json_encode($sSeen['room']['speed'] ?? $sSeen));

        // The walls: only the host picks them, never while a round is played; the
        // snapshot carries the pick and the round's wall.
        usleep(300000);
        $wGuest = self::post('walls', $g3a + ['walls' => 'rubber']);
        self::assertTrue(isset($wGuest['error']) && strpos($wGuest['error'] ?? '', 'host') !== false, 'walls-host-only' . ' :: ' . json_encode($wGuest));
        usleep(300000);
        $wMid = self::post('walls', $h2 + ['walls' => 'rubber']);
        self::assertTrue(isset($wMid['error']) && strpos($wMid['error'] ?? '', 'between rounds') !== false, 'walls-not-mid-round' . ' :: ' . json_encode($wMid));
        self::assertTrue(($sSeen['room']['walls'] ?? '') === 'none' && ($sSeen['room']['wallsNow'] ?? '') === 'none', 'walls-default-none'
            . ' :: ' . json_encode([$sSeen['room']['walls'] ?? null, $sSeen['room']['wallsNow'] ?? null]));

        // The host walks out mid-match: the match goes on for the guest (the host's
        // tank turns drone), the room stays on the shelf, and only the last human
        // out takes it down.
        usleep(300000);
        $used0 = (self::get(self::$base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
        $hostGone = self::post('leave', $h2);
        $used1 = (self::get(self::$base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
        self::assertTrue(($hostGone['ok'] ?? false) === true && $used1 === $used0, 'host-leave-keeps-room' . ' :: ' . "used $used0 -> $used1");
        $after = self::get(self::$base . '/rooms.php?action=state&code=' . $c2 . '&token=' . $g3a['token'] . '&since=0');
        $hostTank = null;
        foreach (($after['room']['tanks'] ?? []) as $t) {
            if (($t['seat'] ?? -1) === 0) $hostTank = $t;
        }
        self::assertTrue(($after['ok'] ?? false) === true && ($after['room']['phase'] ?? '') === 'play'
            && self::modeOf($after, 0) === 'ai' && $hostTank !== null && $hostTank['kind'] === 'ai', 'host-seat-now-drone' . ' :: ' . json_encode($hostTank));
        self::assertTrue(($after['room']['turn'] ?? -1) === 1, 'guest-turn-after-host-left' . ' :: ' . 'turn=' . ($after['room']['turn'] ?? '?'));
        $ghost = self::post('act', $h2 + ['kind' => 'fire']);
        self::assertTrue(isset($ghost['error']), 'left-host-token-dead');
        usleep(300000);
        $play = self::post('act', $g3a + ['kind' => 'fire']);
        self::assertTrue(($play['ok'] ?? false) === true && ($play['room']['turn'] ?? -1) === 1, 'guest-keeps-playing' . ' :: ' . 'turn=' . ($play['room']['turn'] ?? '?'));
        usleep(300000);
        // A leave straight behind an aim tap is never throttled away.
        $aimed = self::post('act', $g3a + ['kind' => 'aim', 'angle' => 70, 'power' => 50]);
        $last = self::post('leave', $g3a);
        self::assertTrue((($aimed['ok'] ?? false) === true) && (($last['ok'] ?? false) === true), 'leave-not-throttled' . ' :: ' . json_encode([$aimed['error'] ?? 'ok', $last['error'] ?? 'ok']));
        $used2 = (self::get(self::$base . '/rooms.php?action=ping')['rooms']['used'] ?? -1);
        self::assertTrue(($last['ok'] ?? false) === true && $used2 === $used0 - 1, 'last-human-closes-room' . ' :: ' . "used $used0 -> $used2");

        // Leave the shelf as found.
        self::ageRoom($c2);
        $ping = self::get(self::$base . '/rooms.php?action=ping');
        self::assertTrue(($ping['rooms']['used'] ?? -1) === 0, 'match-cleaned');
    }

    /** A refused purchase answers with room_buy's status and line, in the JSON error field, and takes no cash. The room is staged straight into the shop because reaching it by play is slow. */
    public function testRefusedPurchases(): void
    {
        $bought = self::post('create', ['initials' => 'shp']);
        $bcode = (string) ($bought['code'] ?? '');
        [$stage, $stageLock] = room_load($bcode);
        $stage['phase'] = 'shop';
        $stage['round'] = 1;
        $stage['shop'] = ['at' => microtime(true), 'ready' => []];
        $stage['cash'][0] = 100;
        $stage['armor'][0] = 30;
        room_save($stageLock, $bcode, $stage);
        room_unlock($stageLock);
        $buy = function (string $item) use ($bought, $bcode): array {
            $ctx = stream_context_create(['http' => [
                'method' => 'POST', 'timeout' => 5, 'ignore_errors' => true,
                'header' => "Content-Type: application/json\r\n",
                'content' => json_encode(['code' => $bcode, 'token' => $bought['token'], 'csrf' => $bought['csrf'], 'item' => $item, 'qty' => 1]),
            ]]);
            $raw = @file_get_contents(self::$base . '/rooms.php?action=buy', false, $ctx);
            $status = 0;
            foreach ($http_response_header ?? [] as $h) {
                if (preg_match('#^HTTP/\S+ (\d+)#', $h, $mm)) {
                    $status = (int) $mm[1];
                }
            }
            return [$status, $raw === false ? null : json_decode($raw, true)];
        };
        foreach ([
            'unknown-item' => ['nope', 422, 'not for sale'],
            'locked-item' => ['nuke', 409, 'NUKE unlocks in round ' . room_weapons()['nuke']['minRound']],
            'short-on-cash' => ['repair', 409, 'short on cash'],
        ] as $name => [$item, $want, $line]) {
            usleep(300000);
            [$status, $reply] = $buy($item);
            self::assertTrue($status === $want && ($reply['error'] ?? null) === $line && !isset($reply['ok']), "buy-refused-$name" . ' :: ' . "$status " . json_encode($reply));
            [$after, $afterLock] = room_load($bcode);
            room_unlock($afterLock);
            self::assertTrue(($after['cash'][0] ?? -1) === 100, "buy-refused-$name-takes-no-cash" . ' :: ' . (string) ($after['cash'][0] ?? '?'));
        }
        // A seat that is out of the match is refused, and keeps its cash.
        [$stage, $stageLock] = room_load($bcode);
        $stage['seats'][0]['lives'] = 0;
        room_save($stageLock, $bcode, $stage);
        room_unlock($stageLock);
        usleep(300000);
        [$status, $reply] = $buy('mortar');
        self::assertTrue($status === 409 && ($reply['error'] ?? null) === 'You are out of this match.' && !isset($reply['ok']), 'buy-refused-out-of-match' . ' :: ' . "$status " . json_encode($reply));
        [$after, $afterLock] = room_load($bcode);
        room_unlock($afterLock);
        self::assertTrue(($after['cash'][0] ?? -1) === 100, 'buy-refused-out-of-match-takes-no-cash' . ' :: ' . (string) ($after['cash'][0] ?? '?'));
        [$stage, $stageLock] = room_load($bcode);
        $stage['seats'][0]['lives'] = 3;
        $stage['cash'][0] = 500;
        $stage['armor'][0] = 100;
        room_save($stageLock, $bcode, $stage);
        room_unlock($stageLock);
        usleep(300000);
        [$status, $reply] = $buy('repair');
        self::assertTrue($status === 409 && ($reply['error'] ?? null) === 'armor is full', 'buy-refused-armor-at-max' . ' :: ' . "$status " . json_encode($reply));
        [$stage, $stageLock] = room_load($bcode);
        room_unlock($stageLock);
        self::assertTrue(($stage['cash'][0] ?? -1) === 500, 'buy-refused-armor-at-max-takes-no-cash' . ' :: ' . (string) ($stage['cash'][0] ?? '?'));
        self::ageRoom($bcode);
    }
}
