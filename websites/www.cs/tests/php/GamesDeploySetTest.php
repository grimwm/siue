<?php
// Tests for the set of files deploy-games.sh ships to happystl.com: one
// LIST=1 run, asserted below.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class GamesDeploySetTest extends TestCase
{
    /**
     * Never served: authoring sources, build setup, tools, tests and notes,
     * plus the server data (Tankity's database, the CIC board, the admin
     * login's database). The rule is a pattern over every tracked file, so a
     * new test, source or config needs no entry in a test: it is kept back by
     * what it is.
     */
    private const NEVER_SHIPS = '~'
        . '(^|/)src/|(^|/)tools/|^tests/|/protocol/|/node_modules/'
        . '|^games/(_kit/|package(-lock)?\.json$|\.gitignore$)|/build\.json$|/test/'
        . '|-test\.[a-z]+$|(^|/)test\.sh$|(^|/)tsconfig[^/]*\.json$|(^|/)package(-lock)?\.json$'
        . '|(^|/)\.gitignore$|(^|/)README\.md$|/fx-editor\.|/dist/pow-bench\.|/fx/blender/|^games/tankity/game\.yaml$'
        . '|\.(blend1?|wav|flac|aiff?)$'
        . '|^games/tankity/data/|^games/cylon/data/scores\.json$|^admin/data/'
        . '~';

    private static function neverShips(string $f): bool
    {
        return (bool) preg_match(self::NEVER_SHIPS, $f);
    }

    /** @var array{int, list<string>}|null the one deploy-list run, shared by every test */
    private static ?array $run = null;

    private static function site(): string
    {
        return dirname(__DIR__, 2);
    }

    /**
     * The set of files deploy-games.sh ships (LIST=1 ./games/tools/deploy-games.sh,
     * which needs no host or key), run once with probes for a game's tools,
     * tests, protocol fixtures and sources (kept home) and Tankity's data
     * (kept home). The probes are untracked files inside the three games
     * (a new game folder is not in the script's input, so a scratch folder
     * would prove nothing), removed again afterwards. They sit outside the
     * install files' precache folders (dist, fx/*) and are not TypeScript,
     * so the script's own freshness checks still pass with them in place.
     *
     * @return array{int, list<string>} exit code and output lines
     */
    private static function deploy(): array
    {
        if (self::$run !== null) {
            return self::$run;
        }
        $site = self::site();
        $probes = [];
        foreach (['crete', 'tankity', 'cylon'] as $game) {
            $probes[] = "games/$game/tools/zz-probe.php";
            $probes[] = "games/$game/test/zz-probe.txt";
            $probes[] = "games/$game/protocol/zz-probe.txt";
            $probes[] = "games/$game/src/zz-probe.txt";
        }
        $probes[] = 'games/tankity/data/zz-probe.sqlite';
        $made = [];
        foreach ($probes as $f) {
            if (file_exists("$site/$f")) {
                continue;
            }
            $dir = dirname("$site/$f");
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            file_put_contents("$site/$f", "probe\n");
            $made[] = $f;
        }
        $out = [];
        $code = 0;
        try {
            exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./games/tools/deploy-games.sh 2>&1', $out, $code);
        } finally {
            foreach ($made as $f) {
                unlink("$site/$f");
            }
            foreach (['games/tankity/data', 'games/crete/test', 'games/crete/protocol', 'games/crete/src', 'games/tankity/test', 'games/tankity/protocol', 'games/tankity/src', 'games/cylon/test', 'games/cylon/protocol', 'games/cylon/src'] as $d) {
                if (is_dir("$site/$d") && count(scandir("$site/$d")) === 2) {
                    rmdir("$site/$d");
                }
            }
        }
        return self::$run = [$code, $out];
    }

    /** @return array<string, int> the shipped paths, as keys */
    private static function set(): array
    {
        return array_flip(self::deploy()[1]);
    }

    /** @return list<string> every tracked file */
    private static function tracked(): array
    {
        $tracked = [];
        exec('cd ' . escapeshellarg(self::site()) . ' && git ls-files', $tracked);
        return $tracked;
    }

    /** the deploy list runs and exits clean */
    public function testListRuns(): void
    {
        [$code, $out] = self::deploy();
        self::assertTrue($code === 0, 'list-runs' . ' :: ' . implode(' | ', array_slice($out, -3)));
    }

    /** the bundle, its page pieces and server */
    public function testShipsTankity(): void
    {
        $set = self::set();
        foreach (['games/tankity/dist/main.js', 'games/tankity/dist/fx.js', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.json', 'games/tankity/sw.js', 'games/tankity/rooms.php', 'games/tankity/server/settings.php', 'games/tankity/server/store.php', 'games/tankity/server/detmath.php', 'games/tankity/server/sim.php', 'games/tankity/server/earth.php', 'games/tankity/server/fire.php', 'games/tankity/server/ai.php', 'games/tankity/server/rules.php', 'games/tankity/server/rate.php', 'games/tankity/server/protocol.php', 'games/tankity/server/.htaccess', 'games/tankity/server/blocked-initials.json', 'games/tankity/server/score-guard.php', 'games/tankity/server/store-dir.php', 'games/tankity/.config.yaml'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** the bundle, its page and server, and the board config (the board itself is server data) */
    public function testShipsCylon(): void
    {
        $set = self::set();
        foreach (['games/cylon/dist/main.js', 'games/cylon/css/eye.css', 'games/cylon/css/units.css', 'games/cylon/css/intro.css', 'games/cylon/mount.html', 'games/cylon/scores.php', 'games/cylon/manifest.webmanifest', 'games/cylon/data/config.json', 'games/cylon/server/blocked-initials.json', 'games/cylon/server/score-guard.php', 'games/cylon/server/store-dir.php'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        self::assertTrue(isset($set['games/cylon/dist/THIRD_PARTY_LICENSES.txt']), 'ships games/cylon/dist/THIRD_PARTY_LICENSES.txt');
        self::assertTrue(!isset($set['games/cylon/data/scores.json']), 'scores stay home');
    }

    /** the bundle, its page and PWA files */
    public function testShipsCrete(): void
    {
        $set = self::set();
        foreach (['games/crete/index.html', 'games/crete/dist/main.js', 'games/crete/game.css', 'games/crete/sw.js', 'games/crete/manifest.webmanifest'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        self::assertTrue(isset($set['games/crete/dist/THIRD_PARTY_LICENSES.txt']), 'ships games/crete/dist/THIRD_PARTY_LICENSES.txt');
    }

    /** the games' own .htaccess (dotfile denial, media types, no-cache for HTML) */
    public function testShipsGamesHtaccess(): void
    {
        $set = self::set();
        self::assertTrue(isset($set['games/.htaccess']), 'ships games/.htaccess');
    }

    /** the stats endpoint and its library, and the admin library the collector loads */
    public function testShipsStatsAndAdminLib(): void
    {
        $set = self::set();
        foreach (['stats/collect.php', 'stats/.htaccess', 'stats/lib/bootstrap.php', 'stats/lib/Classify.php', 'stats/lib/Collector.php', 'stats/lib/Dashboard.php', 'stats/lib/Days.php', 'stats/lib/Db.php', 'stats/lib/Report.php', 'stats/lib/Rollup.php', 'stats/lib/.htaccess'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        foreach (['admin/lib/bootstrap.php', 'admin/lib/Address.php', 'admin/lib/Auth.php', 'admin/lib/Clock.php', 'admin/lib/Db.php', 'admin/lib/Headers.php', 'admin/lib/Html.php', 'admin/lib/Keys.php', 'admin/lib/MailTemplate.php', 'admin/lib/Mailer.php', 'admin/lib/Pages.php', 'admin/lib/People.php', 'admin/lib/Realm.php', 'admin/lib/Request.php', 'admin/lib/Sessions.php', 'admin/lib/SignIn.php', 'admin/lib/store-dir.php', 'admin/lib/store-modes.php', 'admin/lib/.htaccess'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** the never-ships rule matches the authoring files, and none of them ships */
    public function testAuthoringFilesStayHome(): void
    {
        $set = self::set();
        $out = self::deploy()[1];
        $tracked = self::tracked();
        $kept = array_values(array_filter($tracked, fn(string $f): bool => self::neverShips($f)));
        self::assertTrue(count($kept) > 80, 'the rule matches the authoring files' . ' :: ' . (string) count($kept));
        foreach (['games/tankity/src/sim.ts', 'games/tankity/test/smoke.test.ts', 'games/tankity/protocol/sim-vectors.json', 'games/tankity/dist/fx-editor.js',
            'games/tankity/dist/pow-bench.js', 'games/crete/dist/tiles-test.js', 'games/cylon/src/state.ts', 'games/crete/src/puzzle/step.ts', 'games/tankity/game.yaml', 'games/_kit/ports.ts', 'games/tankity/tools/game-json.php'] as $f) {
            self::assertTrue(in_array($f, $kept, true), "the rule covers $f");
        }
        $shipped = array_values(array_filter($kept, fn(string $f): bool => isset($set[$f])));
        self::assertTrue($shipped === [], 'keeps back every authoring file' . ' :: ' . implode(', ', $shipped));
        $leaks = array_values(array_filter($out, fn(string $f): bool => self::neverShips($f)));
        self::assertTrue($leaks === [], 'ships no authoring or test files' . ' :: ' . implode(', ', $leaks));
    }

    /** every built bundle and its map ships, except the dev-only ones: the effects editor's, the puzzle bench's and test pages' */
    public function testShipsEveryBuiltFile(): void
    {
        $set = self::set();
        $tracked = self::tracked();
        $built = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match('~^games/(crete|tankity|cylon)/dist/~', $f) && !str_contains($f, '/fx-editor.') && !str_contains($f, '/pow-bench.') && !preg_match('~-test\.[a-z.]+$~', $f)));
        $missing = array_values(array_filter($built, fn(string $f): bool => !isset($set[$f])));
        self::assertTrue(count($built) >= 8 && $missing === [], 'ships every built file' . ' :: ' . implode(', ', $missing));
    }

    /** node_modules, the kit, the build setup and the server data never ship */
    public function testHomeOnlyFilesStayHome(): void
    {
        $out = self::deploy()[1];
        self::assertTrue(array_filter($out, fn(string $f): bool => str_contains($f, 'node_modules')) === [], 'node_modules never ships');
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'games/_kit/')), 'kit-php-stays-home' . ' :: ' . '');
        // Server data belongs to the server: nothing under games/tankity/data/,
        // games/cylon/data/scores.json or admin/data/ ships.
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'games/tankity/data/')), 'tankity-data-stays-home' . ' :: ' . '');
        self::assertTrue(!in_array('games/cylon/data/scores.json', $out, true), 'cylon-scores-stay-home' . ' :: ' . '');
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'admin/data/')), 'admin-data-stays-home' . ' :: ' . '');
    }

    /** the probe files are kept home */
    public function testProbesStayHome(): void
    {
        $out = self::deploy()[1];
        foreach (['crete', 'tankity', 'cylon'] as $game) {
            foreach (["games/$game/tools/zz-probe.php", "games/$game/test/zz-probe.txt", "games/$game/protocol/zz-probe.txt", "games/$game/src/zz-probe.txt"] as $f) {
                self::assertTrue(!in_array($f, $out, true), "never-ships-$f" . ' :: ' . '');
            }
        }
        self::assertTrue(!in_array('games/tankity/data/zz-probe.sqlite', $out, true), 'never-ships-games/tankity/data/zz-probe.sqlite' . ' :: ' . '');
    }

    /** the SIUE hub's files and the site's own pages never ship with the games */
    public function testSiteFilesDoNotShip(): void
    {
        $out = self::deploy()[1];
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'play/')), 'play-wrappers-stay-home' . ' :: ' . '');
        foreach (['index.html', 'games.php', 'hub.php', 'games/hub.php', 'main.js', 'admin/README.md', 'admin/stats.php', 'admin/index.php'] as $f) {
            self::assertTrue(!in_array($f, $out, true), "never-ships-$f" . ' :: ' . '');
        }
    }
}
