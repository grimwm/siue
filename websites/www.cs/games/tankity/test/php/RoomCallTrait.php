<?php
// games/tankity/test/php/RoomCallTrait.php
declare(strict_types=1);

/* rooms.php as a real request, for handler-level tests: each call runs the
   endpoint in its own PHP process against the test's data directory
   ($this->dir), so exits, headers and the write lock behave as on the host. */
trait RoomCallTrait
{
    /** @return array{int, array} the status and the JSON answer of rooms.php as a request. A
        create or join whose body carries neither `proto` nor `pow` is sent as the
        current bundle sends it: with the protocol and a solved puzzle (solve()). */
    private function call(string $action, array $body, array $server = [], array $env = []): array
    {
        if (in_array($action, ['create', 'join'], true) && !array_key_exists('proto', $body) && !array_key_exists('pow', $body)) {
            $body += ['proto' => ROOM_PROTO, 'pow' => $this->solve($action, $server, $env)];
        }
        return $this->collect($this->launch($action, $body, $server, $env));
    }

    /** @return array{int, array} rooms.php as a request, the body sent exactly as given */
    private function raw(string $action, array $body, array $server = [], array $env = []): array
    {
        return $this->collect($this->launch($action, $body, $server, $env));
    }

    /** @return array{int, array} rooms.php as a GET request: $query is the whole query
        string (action included), $server any request headers (HTTP_*) */
    private function get(array $query, array $server = [], array $env = []): array
    {
        return $this->collect($this->launch((string) ($query['action'] ?? ''), [], $server, $env, $query));
    }

    /** @return array{c: string, n: list<int>} a $action ('create' or 'join') puzzle asked
        for as $server and solved here: the first POW_COUNT nonces from 0 up */
    private function solve(string $action, array $server = [], array $env = []): array
    {
        [$st, $ch] = $this->raw('challenge', ['for' => $action], $server, $env);
        if ($st !== 200) {
            throw new RuntimeException("challenge answered $st: " . json_encode($ch));
        }
        $found = [];
        for ($n = 0; count($found) < $ch['count']; $n++) {
            if (room_pow_lead($ch['challenge'], $n) >= $ch['bits']) {
                $found[] = $n;
            }
        }
        return ['c' => $ch['challenge'], 'n' => $found];
    }

    /** @return array{resource, array} a request started and still running, for collect().
        `challenge` is a GET whose body is its query, and $query makes any action a GET
        with that query; every other action is a POST. */
    private function launch(string $action, array $body, array $server = [], array $env = [], ?array $query = null): array
    {
        $get = $query ?? ($action === 'challenge' ? ['action' => $action] + $body : ['action' => $action]);
        $isGet = $query !== null || $action === 'challenge';
        $script = 'register_shutdown_function(static function () { while (ob_get_level()) { ob_end_flush(); } echo "\n", http_response_code(); });'
            . 'require ' . var_export(__DIR__ . '/scores-stdin.php', true) . ';'
            . '$_SERVER = ' . var_export($server + ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.9',
                'HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_ORIGIN' => 'https://www.cs.siue.edu'], true) . ' + $_SERVER;'
            . '$_SERVER["REQUEST_METHOD"] = ' . var_export($isGet ? 'GET' : 'POST', true) . '; $_GET = ' . var_export($get, true) . ';'
            . 'require ' . var_export(dirname(__DIR__, 2) . '/rooms.php', true) . ';';
        // The puzzle runs at 2 bits here, so solving it in PHP takes microseconds.
        $proc = proc_open([PHP_BINARY, '-d', 'zlib.output_compression=0', '-r', $script],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null,
            $env + ['TANKITY_DATA_DIR' => $this->dir, 'TANKITY_ROOM_JOINS_PER_HOUR' => '2', 'TANKITY_POW_BITS' => '2'] + getenv());
        fwrite($pipes[0], json_encode($body));
        fclose($pipes[0]);
        return [$proc, $pipes];
    }

    /** @return array{int, array} the status and the JSON answer of a launched request */
    private function collect(array $running): array
    {
        [$proc, $pipes] = $running;
        $out = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($proc);
        [$json, $status] = array_pad(explode("\n", rtrim($out), 2), 2, '');
        return [(int) trim($status), json_decode($json, true) ?? ['raw' => $out]];
    }

    /** @return array the stored room, decoded */
    private function stored(string $code): array
    {
        $q = tankity_db()->prepare('SELECT data FROM rooms WHERE code = ?');
        $q->execute([$code]);
        return room_decode($q->fetchColumn());
    }

    /* One seat's acts are spaced 150 ms apart (create counts as one): wait past it. */
    private function gap(): void
    {
        usleep(200_000);
    }
}
