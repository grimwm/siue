<?php
// The statistics' slice of the deploy set: the endpoint, its library and its .htaccess files ship, and so do the
// dashboard's stylesheet and script, the privacy note and each game's beacon; neither server serves the library.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class StatsDeployTest extends TestCase
{
    /** @var list<string>|null */
    private static ?array $set = null;

    private static function site(): string
    {
        return dirname(__DIR__, 2);
    }

    /** @return array<string, int> */
    private static function set(): array
    {
        if (self::$set === null) {
            exec('cd ' . escapeshellarg(self::site()) . ' && LIST=1 ./deploy.sh 2>&1', $out, $code);
            self::assertSame(0, $code, implode(' | ', array_slice($out, -3)));
            self::$set = $out;
        }
        return array_flip(self::$set);
    }

    public function testShipsTheEndpointDashboardAndBeacons(): void
    {
        $set = self::set();
        $site = self::site();
        $expected = ['stats/collect.php', 'stats/.htaccess', 'stats/lib/.htaccess', 'admin/stats.php', 'admin/stats.css', 'admin/stats.js', 'privacy.html',
            'games/crete/dist/stats.js', 'games/tankity/dist/stats.js', 'games/cylon/dist/stats.js'];
        foreach (glob("$site/stats/lib/*.php") ?: [] as $abs) {
            $expected[] = substr($abs, strlen($site) + 1);
        }
        foreach ($expected as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    public function testNeitherServerServesTheLibrary(): void
    {
        $nginx = (string) file_get_contents(self::site() . '/docker/nginx/default.conf');
        self::assertStringContainsString('location ^~ /stats/lib/ { deny all; }', $nginx);
        self::assertSame("Require all denied\n", file_get_contents(self::site() . '/stats/lib/.htaccess'));
        self::assertStringContainsString('m#/stats/lib/#', (string) file_get_contents(self::site() . '/stats/.htaccess'));
    }
}
