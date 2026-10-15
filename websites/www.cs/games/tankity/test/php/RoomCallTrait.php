<?php
// games/tankity/test/php/RoomCallTrait.php
declare(strict_types=1);

/* rooms.php as a real request, for handler-level tests: each call runs the
   endpoint in its own PHP process against the test's data directory
   ($this->dir), so exits, headers and the write lock behave as on the host. */
trait RoomCallTrait
{
    /** @return array{int, array} the status and the JSON answer of rooms.php as a request */
    private function call(string $action, array $body, array $server = [], array $env = []): array
    {
        $script = 'register_shutdown_function(static function () { while (ob_get_level()) { ob_end_flush(); } echo "\n", http_response_code(); });'
            . 'require ' . var_export(__DIR__ . '/scores-stdin.php', true) . ';'
            . '$_SERVER = ' . var_export($server + ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '203.0.113.9',
                'HTTP_HOST' => 'www.cs.siue.edu', 'HTTP_ORIGIN' => 'https://www.cs.siue.edu'], true) . ' + $_SERVER;'
            . '$_SERVER["REQUEST_METHOD"] = "POST"; $_GET = ' . var_export(['action' => $action], true) . ';'
            . 'require ' . var_export(dirname(__DIR__, 2) . '/rooms.php', true) . ';';
        $proc = proc_open([PHP_BINARY, '-d', 'zlib.output_compression=0', '-r', $script],
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, null,
            $env + ['TANKITY_DATA_DIR' => $this->dir, 'TANKITY_ROOM_JOINS_PER_HOUR' => '2'] + getenv());
        fwrite($pipes[0], json_encode($body));
        fclose($pipes[0]);
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
