<?php
// Pages refuse requests a script made (Fetch Metadata); health and API endpoints are exempt.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminFetchGuardTest extends TestCase
{
    private array $server;

    protected function setUp(): void
    {
        $this->server = $_SERVER;
        putenv('ADMIN_DATA_DIR=' . admin_tmp_dir() . '/data');
        putenv('ADMIN_BASE_URL=https://www.cs.siue.edu/~wgrim/admin/');
    }

    protected function tearDown(): void
    {
        $_SERVER = $this->server;
        putenv('ADMIN_DATA_DIR');
        putenv('ADMIN_BASE_URL');
    }

    /** @return array{0:string,1:bool} the body and whether the handler ran */
    private function serve(string $method, array $fetch, bool $health = false): array
    {
        $_SERVER = ['REQUEST_METHOD' => $method, 'HTTPS' => 'on', 'HTTP_HOST' => 'www.cs.siue.edu', 'REMOTE_ADDR' => '203.0.113.9'];
        foreach ($fetch as $name => $value) {
            $_SERVER['HTTP_SEC_FETCH_' . $name] = $value;
        }
        $ran = false;
        ob_start();
        admin_serve(static function () use (&$ran): Admin\Response {
            $ran = true;
            return new Admin\Response(200, [], 'handled');
        }, $health);
        return [(string) ob_get_clean(), $ran];
    }

    public function testAScriptFetchIsRefusedOnEveryPageAndMethod(): void
    {
        foreach (['GET', 'POST'] as $method) {
            foreach ([['MODE' => 'cors', 'DEST' => 'empty'], ['MODE' => 'cors'], ['MODE' => 'navigate', 'DEST' => 'iframe'], ['MODE' => 'no-cors', 'DEST' => 'document']] as $fetch) {
                [$body, $ran] = $this->serve($method, $fetch);
                self::assertSame('Open this page directly.', $body, "$method " . json_encode($fetch));
                self::assertFalse($ran);
            }
        }
    }

    public function testTheRefusalIsA403WithEveryHeader(): void
    {
        $r = admin_refuse_script_fetch(req(['headers' => ['sec-fetch-mode' => 'cors', 'sec-fetch-dest' => 'empty']]));
        self::assertSame(403, $r?->status);
        foreach (Admin\Headers::LIST as $name => $value) {
            self::assertSame($value, $r->headers[$name]);
        }
    }

    public function testNavigationAndHeaderlessRequestsPass(): void
    {
        foreach ([['MODE' => 'navigate', 'DEST' => 'document'], []] as $fetch) {
            [$body, $ran] = $this->serve('POST', $fetch);
            self::assertSame('handled', $body);
            self::assertTrue($ran);
        }
    }

    public function testHealthIgnoresTheGuard(): void
    {
        [$body, $ran] = $this->serve('GET', ['MODE' => 'cors', 'DEST' => 'empty'], true);
        self::assertSame('handled', $body);
        self::assertTrue($ran);
    }
}
