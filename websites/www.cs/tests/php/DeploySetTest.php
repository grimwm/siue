<?php
// Tests for the set of files deploy.sh ships: one LIST=1 run, asserted below.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class DeploySetTest extends TestCase
{
    /**
     * Never served: authoring sources, build setup, tools, tests and notes. The
     * rule is a pattern over every tracked file, so a new test, source or config
     * needs no entry in a test: it is kept back by what it is.
     */
    private const NEVER_SHIPS = '~'
        . '(^|/)src/|(^|/)tools/|^tests/|/protocol/|/node_modules/'
        . '|^games/(_kit/|package(-lock)?\.json$|\.gitignore$)|/build\.json$|/test/'
        . '|-test\.[a-z]+$|(^|/)test\.sh$|(^|/)tsconfig[^/]*\.json$|(^|/)package(-lock)?\.json$'
        . '|(^|/)\.gitignore$|^games/[^/]+/test/|(^|/)README\.md$|/fx-editor\.|/dist/pow-bench\.|/fx/blender/|^games/tankity/game\.yaml$'
        . '|\.(blend1?|wav|flac|aiff?)$'
        . '~';

    /** @var array{int, list<string>}|null the one deploy-list run, shared by every test */
    private static ?array $run = null;

    private static function site(): string
    {
        return dirname(__DIR__, 2);
    }

    /**
     * The set of files deploy.sh ships (LIST=1 ./deploy.sh, which needs no host or
     * password), run once with probes for the kit's build setup, tests and per-game
     * build config (kept home) and a game's built dist/ (shipped). The probes are
     * untracked files in a scratch game folder (a real game's install files hash its
     * whole folder), removed again afterwards. The build.json probe sits one folder
     * down because the games' check script would try to build a game with a real one.
     *
     * @return array{int, list<string>} exit code and output lines
     */
    private static function deploy(): array
    {
        if (self::$run !== null) {
            return self::$run;
        }
        $site = self::site();
        $probes = ['games/zz-probe/nested/build.json', 'games/zz-probe/test/engine.test.mjs', 'games/zz-probe/dist/main.js', 'games/zz-probe/dist/main.js.map', 'games/tankity/data/zz-deploy-probe.sqlite'];
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
            exec('cd ' . escapeshellarg($site) . ' && LIST=1 ./deploy.sh 2>&1', $out, $code);
        } finally {
            foreach ($made as $f) {
                unlink("$site/$f");
            }
            foreach (['games/tankity/data', 'games/zz-probe/test', 'games/zz-probe/dist', 'games/zz-probe/nested', 'games/zz-probe'] as $d) {
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

    /** the game and effects-engine bundles and the rendered sprite sheets (the effects data rides game.json) */
    public function testShipsTankity(): void
    {
        $set = self::set();
        foreach (['games/tankity/dist/main.js', 'games/tankity/dist/fx.js', 'games/tankity/fx/sprites/sprites.json', 'games/tankity/game.json', 'games/tankity/sw.js', 'games/tankity/rooms.php', 'games/tankity/server/settings.php', 'games/tankity/server/store.php', 'games/tankity/server/detmath.php', 'games/tankity/server/sim.php', 'games/tankity/server/earth.php', 'games/tankity/server/fire.php', 'games/tankity/server/ai.php', 'games/tankity/server/rules.php', 'games/tankity/server/rate.php', 'games/tankity/server/protocol.php', 'games/tankity/server/.htaccess'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** the licenses of the npm code inside a game's bundle ship beside it */
    public function testShipsLicenses(): void
    {
        $set = self::set();
        self::assertTrue(isset($set['games/tankity/dist/THIRD_PARTY_LICENSES.txt']), 'ships games/tankity/dist/THIRD_PARTY_LICENSES.txt');
        self::assertTrue(isset($set['games/crete/dist/THIRD_PARTY_LICENSES.txt']), 'ships games/crete/dist/THIRD_PARTY_LICENSES.txt');
    }

    /** the bundle, its page pieces and server */
    public function testShipsCylon(): void
    {
        $set = self::set();
        foreach (['games/cylon/dist/main.js', 'games/cylon/css/eye.css', 'games/cylon/css/units.css', 'games/cylon/css/intro.css', 'games/cylon/mount.html', 'games/cylon/scores.php', 'games/cylon/manifest.webmanifest'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        self::assertTrue(isset($set['games/cylon/dist/THIRD_PARTY_LICENSES.txt']), 'ships games/cylon/dist/THIRD_PARTY_LICENSES.txt');
    }

    /** the site's own scripts, compiled from src/ and served from the root and play/, and the root .htaccess with the page revalidation header */
    public function testShipsSiteScripts(): void
    {
        $set = self::set();
        foreach (['main.js', 'play/play.js', 'play/play.css', 'index.html'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        self::assertTrue(isset($set['.htaccess']), 'ships-root-htaccess');
    }

    /** the bundle, its page and PWA files */
    public function testShipsCrete(): void
    {
        $set = self::set();
        foreach (['games/crete/index.html', 'games/crete/dist/main.js', 'games/crete/game.css', 'games/crete/sw.js', 'games/crete/manifest.webmanifest'] as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** the game is loaded from its own folder; nothing of it sits at the site root */
    public function testNoRootCopyOfGamePages(): void
    {
        $set = self::set();
        $site = self::site();
        foreach (['mount.html', 'cylon-mount.html'] as $f) {
            self::assertTrue(!isset($set[$f]) && !file_exists("$site/$f"), "no root copy of $f");
        }
    }

    /** every rendered sprite sheet ships */
    public function testShipsSpriteSheets(): void
    {
        $set = self::set();
        $site = self::site();
        $sheets = glob("$site/games/tankity/fx/sprites/*.png") ?: [];
        self::assertTrue(count($sheets) > 0, 'sprite sheets exist');
        foreach ($sheets as $abs) {
            $f = substr($abs, strlen($site) + 1);
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** the never-ships rule matches the authoring files, and none of them ships */
    public function testAuthoringFilesStayHome(): void
    {
        $set = self::set();
        $out = self::deploy()[1];
        $tracked = self::tracked();
        $kept = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match(self::NEVER_SHIPS, $f)));
        self::assertTrue(count($kept) > 80, 'the rule matches the authoring files' . ' :: ' . (string) count($kept));
        foreach (['games/tankity/src/sim.ts', 'games/tankity/test/smoke.test.ts', 'games/tankity/protocol/sim-vectors.json', 'games/tankity/dist/fx-editor.js',
            'games/tankity/dist/pow-bench.js', 'games/cylon/src/state.ts', 'games/crete/src/engine.ts', 'src/main.ts', 'tools/ts-build.mjs', 'tsconfig.json'] as $f) {
            self::assertTrue(in_array($f, $kept, true), "the rule covers $f");
        }
        $shipped = array_values(array_filter($kept, fn(string $f): bool => isset($set[$f])));
        self::assertTrue($shipped === [], 'keeps back every authoring file' . ' :: ' . implode(', ', $shipped));
        $leaks = array_values(array_filter($out, fn(string $f): bool => (bool) preg_match(self::NEVER_SHIPS, $f)));
        self::assertTrue($leaks === [], 'ships no authoring or test files' . ' :: ' . implode(', ', $leaks));
    }

    /** every built bundle and its map ships, except the dev-only effects editor's and puzzle bench's */
    public function testShipsEveryBuiltFile(): void
    {
        $set = self::set();
        $tracked = self::tracked();
        $built = array_values(array_filter($tracked, fn(string $f): bool => (bool) preg_match('~^games/[^/]+/dist/~', $f) && !str_contains($f, '/fx-editor.') && !str_contains($f, '/pow-bench.')));
        $missing = array_values(array_filter($built, fn(string $f): bool => !isset($set[$f])));
        self::assertTrue(count($built) >= 8 && $missing === [], 'ships every built file' . ' :: ' . implode(', ', $missing));
    }

    /** node_modules, composer, vendor, the kit's PHP and Tankity's storage never ship */
    public function testHomeOnlyFilesStayHome(): void
    {
        $out = self::deploy()[1];
        self::assertTrue(array_filter($out, fn(string $f): bool => str_contains($f, 'node_modules')) === [], 'node_modules never ships');
        self::assertTrue(!array_intersect(['composer.json', 'composer.lock', 'phpunit.xml'], $out), 'composer-files-stay-home' . ' :: ' . '');
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'vendor/')), 'vendor-stays-home' . ' :: ' . '');
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'games/_kit/')), 'kit-php-stays-home' . ' :: ' . '');
        // Tankity's storage belongs to the server: nothing under games/tankity/data/ ships.
        self::assertTrue(!array_filter($out, fn($f) => str_starts_with($f, 'games/tankity/data/')), 'tankity-data-stays-home' . ' :: ' . '');
    }

    /** the probe files are kept home (kit, tests, build config) or shipped (a game's dist) */
    public function testProbesStayHomeOrShip(): void
    {
        // games/node_modules is gitignored, so it can never be listed; assert absence.
        $out = self::deploy()[1];
        foreach (['games/_kit/ports.ts', 'games/_kit/test/prefs.test.ts', 'games/node_modules/x/index.js', 'games/package.json', 'games/package-lock.json', 'games/.gitignore', 'games/zz-probe/nested/build.json', 'games/zz-probe/test/engine.test.mjs'] as $f) {
            self::assertTrue(!in_array($f, $out, true), "never-ships-$f" . ' :: ' . '');
        }
        foreach (['games/zz-probe/dist/main.js', 'games/zz-probe/dist/main.js.map'] as $f) {
            self::assertTrue(in_array($f, $out, true), "ships-$f" . ' :: ' . '');
        }
    }
}
