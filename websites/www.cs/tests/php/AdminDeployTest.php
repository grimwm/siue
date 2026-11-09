<?php
// The admin login's slice of the deploy set: its pages, stylesheet, libraries and
// .htaccess files ship; its storage, notes and local compose override never do.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class AdminDeployTest extends TestCase
{
    /** @var array{int, list<string>}|null the one deploy-list run, shared by every test */
    private static ?array $run = null;
    private static string $suffix = '';

    private static function site(): string
    {
        return dirname(__DIR__, 2);
    }

    /**
     * The set of files deploy.sh ships (LIST=1 ./deploy.sh), run once with probes: untracked files
     * under admin/ (a stray file, a nested page, a stray lib file, a PHP file in a lib subfolder) and one under admin/data/, which
     * .gitignore hides, so it is force-added to a scratch copy of the index the run reads.
     *
     * @return array{int, list<string>} exit code and output lines
     */
    private static function deploy(): array
    {
        if (self::$run !== null) {
            return self::$run;
        }
        $site = self::site();
        $u = self::$suffix = bin2hex(random_bytes(6));
        $probes = ["admin/zz-probe-$u.txt", "admin/zz-sub/zz-probe-$u.php", "admin/lib/zz-probe-$u.txt", "admin/lib/zz-sub/zz-probe-$u.php", "admin/data/zz-deploy-probe-$u.sqlite"];
        $made = [];
        $madeDirs = [];
        foreach ($probes as $f) {
            $dir = dirname("$site/$f");
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
                $madeDirs[] = $dir;
            }
            $h = fopen("$site/$f", 'x');
            self::assertNotFalse($h, "probe $f is new");
            $made[] = $f;
            fwrite($h, "probe\n");
            fclose($h);
        }
        $index = tempnam(sys_get_temp_dir(), 'admin-deploy-index');
        $out = [];
        $code = 1;
        try {
            $real = trim((string) shell_exec('cd ' . escapeshellarg($site) . ' && git rev-parse --path-format=absolute --git-path index'));
            self::assertTrue($real !== '' && copy($real, $index), 'the index is copied');
            $env = 'GIT_INDEX_FILE=' . escapeshellarg($index);
            exec("cd " . escapeshellarg($site) . " && $env git add -f -- admin/data/zz-deploy-probe-$u.sqlite 2>&1 && $env LIST=1 ./deploy.sh 2>&1", $out, $code);
        } finally {
            foreach ($made as $f) {
                @unlink("$site/$f");
            }
            foreach (array_reverse($madeDirs) as $d) {
                if (is_dir($d) && count(scandir($d)) === 2) {
                    rmdir($d);
                }
            }
            @unlink($index);
        }
        return self::$run = [$code, $out];
    }

    /** @return array<string, int> */
    private static function set(): array
    {
        return array_flip(self::deploy()[1]);
    }

    /** the deploy list runs and exits clean */
    public function testListRuns(): void
    {
        [$code, $out] = self::deploy();
        self::assertTrue($code === 0, 'list-runs :: ' . implode(' | ', array_slice($out, -3)));
    }

    /** every tracked admin page, stylesheet, library and .htaccess ships */
    public function testShipsAdmin(): void
    {
        $set = self::set();
        $site = self::site();
        $expected = ['admin/.htaccess', 'admin/admin.css', 'admin/admin.js', 'admin/index.php', 'admin/login.php', 'admin/verify.php', 'admin/logout.php',
            'admin/health.php', 'admin/keys.php', 'admin/lib/.htaccess', 'admin/lib/bootstrap.php', 'admin/lib/Auth.php', 'admin/lib/Pages.php',
            'admin/lib/store-dir.php', 'admin/lib/store-modes.php'];
        foreach ($expected as $f) {
            self::assertTrue(isset($set[$f]), "ships $f");
        }
        foreach (array_merge(glob("$site/admin/*.php") ?: [], glob("$site/admin/lib/*.php") ?: []) as $abs) {
            $f = substr($abs, strlen($site) + 1);
            self::assertTrue(isset($set[$f]), "ships $f");
        }
    }

    /** storage, notes, strays and the local compose override stay home */
    public function testAdminHomeOnlyFilesStayHome(): void
    {
        $set = self::set();
        $u = self::$suffix;
        foreach (["admin/data/zz-deploy-probe-$u.sqlite", 'admin/README.md', "admin/zz-probe-$u.txt", "admin/zz-sub/zz-probe-$u.php", "admin/lib/zz-probe-$u.txt", "admin/lib/zz-sub/zz-probe-$u.php", 'compose.admin-local.yaml'] as $f) {
            self::assertTrue(!isset($set[$f]), "never ships $f");
        }
        $leaks = array_values(array_filter(array_keys($set), fn(string $f): bool => str_starts_with($f, 'admin/data/')));
        self::assertTrue($leaks === [], 'nothing under admin/data/ ships :: ' . implode(', ', $leaks));
    }

    /** the deploy makes admin/data group-writable for PHP and never sends, removes or lists anything in it */
    public function testDeployMakesTheDataFolderAndNeverTouchesWhatIsInIt(): void
    {
        $src = (string) file_get_contents(self::site() . '/deploy.sh');
                preg_match_all('/^.*admin\/data.*$/m', $src, $lines);
        foreach ($lines[0] as $line) {
            $code = trim($line);
            if ($code === '' || $code[0] === '#') {
                continue;
            }
            self::assertDoesNotMatchRegularExpression('/\b(put|rm|-rm|rmdir|rename|ln)\b/', $code, "deploy.sh never writes or removes inside admin/data :: $code");
        }
    }

    /** neither server serves the folder the deploy writes the studio configuration into */
    public function testTheConfigFolderIsNeverServed(): void
    {
        $htaccess = (string) file_get_contents(self::site() . '/admin/.htaccess');
        self::assertMatchesRegularExpression('#\(lib\|config\|data\)/#', $htaccess);
        $nginx = (string) file_get_contents(self::site() . '/docker/nginx/default.conf');
        self::assertMatchesRegularExpression('#location \^~ /admin/config/ \{ deny all; \}#', $nginx);
    }

    /** the configuration is staged only from STUDIO_CONFIG; without it the deploy goes on, with an invalid one it stops */
    public function testTheDeployWritesTheConfigOnlyFromTheEnvironment(): void
    {
        $site = escapeshellarg(self::site());
        $with = [];
        exec("cd $site && LIST=1 STUDIO_CONFIG='{\"people\":[]}' ./deploy.sh 2>&1", $with, $code);
        self::assertSame(0, $code, implode(' | ', array_slice($with, -3)));
        self::assertContains('admin/config/studio.json', $with);
        $without = [];
        exec("cd $site && env -u STUDIO_CONFIG LIST=1 ./deploy.sh 2>&1", $without, $code);
        self::assertSame(0, $code);
        self::assertNotContains('admin/config/studio.json', $without);
        $empty = [];
        exec("cd $site && STUDIO_CONFIG= LIST=1 ./deploy.sh 2>&1", $empty, $code);
        self::assertSame(0, $code);
        self::assertNotContains('admin/config/studio.json', $empty);
        $bad = [];
        exec("cd $site && LIST=1 STUDIO_CONFIG='{\"people\":[{\"email\":\"x@evil.test\"}]}' ./deploy.sh 2>&1", $bad, $code);
        self::assertNotSame(0, $code, 'an invalid configuration stops the deploy');
        $src = (string) file_get_contents(self::site() . '/deploy.sh');
        self::assertStringNotContainsString('STUDIO_CONFIG is not set', $src, 'a deploy without the optional configuration goes on');
        self::assertStringContainsString('deploy: STUDIO_CONFIG is not valid', $src);
    }

    /** the admin-data batch makes the folder right after admin/, every line failure-tolerant, 770 before the setgid try */
    public function testTheAdminDataBatchIsOrderedAndFailureTolerant(): void
    {
        $out = [];
        exec('cd ' . escapeshellarg(self::site()) . ' && ADMIN_BATCH=1 ./deploy.sh 2>&1', $out, $code);
        self::assertSame(0, $code);
        self::assertSame(['-mkdir admin', '-mkdir admin/data', '-chmod 770 admin/data', '-chmod 2770 admin/data'], $out);
        $src = (string) file_get_contents(self::site() . '/deploy.sh');
        self::assertLessThan(strpos($src, "# 3. Upload the changed files."), strpos($src, 'admin_data_batch >"$work/admin-data"'), 'before the upload batch chmods admin/');
        self::assertStringNotContainsString('chmod 2755 admin', $src);
    }

    /** Crete's shared bank runs on happystl.com: this site's deploy never ships its endpoint, library, settings or data */
    public function testTheSiteNeverShipsCretesBank(): void
    {
        $site = escapeshellarg(self::site());
        $out = [];
        exec("cd $site && LIST=1 CRETE_BANK_VERIFIER_TOKEN=tok_" . bin2hex(random_bytes(20)) . ' ./deploy.sh 2>&1', $out, $code);
        self::assertSame(0, $code, implode(' | ', array_slice($out, -3)));
        self::assertContains('games/crete/index.html', $out);
        foreach ($out as $f) {
            self::assertDoesNotMatchRegularExpression('{^games/crete/(endless-bank\.php|bank/|server/|data/)}', $f);
        }
        $src = (string) file_get_contents(self::site() . '/deploy.sh');
        self::assertStringNotContainsString('CRETE_BANK_VERIFIER_TOKEN', $src);
        self::assertStringNotContainsString('games/crete/data\'', $src, 'no folder made for it');
    }

    /** The bank's own deploy: only its files and a hash of the token, its levels outside the web root, nothing deleted */
    public function testTheBankDeployStagesOnlyTheBankAndAHashOfTheToken(): void
    {
        $script = escapeshellarg(self::site() . '/games/crete/tools/deploy-bank.sh');
        $token = 'tok_' . bin2hex(random_bytes(20));
        $out = [];
        exec("env -u HOST LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token $script 2>&1", $out, $code);
        self::assertSame(0, $code, implode(' | ', $out));
        self::assertSame([
            '.htaccess', 'bank/.htaccess', 'bank/Bank.php', 'bank/Place.php', 'bank/config.json', 'bank/import-backup.php',
            'bank/place.json', 'bank/verifier.json', 'endless-bank.php', 'server/.htaccess', 'server/blocked-initials.json',
            'server/score-guard.php', 'server/store-dir.php',
        ], $out);
        $stage = sys_get_temp_dir() . '/crete-bank-stage-' . bin2hex(random_bytes(6));
        try {
            exec("STAGE_DIR=$stage CRETE_BANK_VERIFIER_TOKEN=$token DATA_DIR=/home/acct/levels $script 2>&1", $out, $code);
            self::assertSame(0, $code);
            self::assertSame(['dir' => '/home/acct/levels'], json_decode((string) file_get_contents("$stage/bank/place.json"), true));
            self::assertSame(['tokenSha256' => hash('sha256', $token)], json_decode((string) file_get_contents("$stage/bank/verifier.json"), true));
            self::assertStringContainsString('Require all denied', (string) file_get_contents("$stage/bank/.htaccess"));
            self::assertStringContainsString('Require all denied', (string) file_get_contents("$stage/server/.htaccess"));
            self::assertSame(0644, fileperms("$stage/endless-bank.php") & 0777);
        } finally {
            exec('rm -rf ' . escapeshellarg($stage));
        }
        self::assertStringNotContainsString($token, implode("\n", $out));

        $refused = [
            'no token' => "env -u CRETE_BANK_VERIFIER_TOKEN LIST=1 $script",
            'a bad token' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN='short;rm' $script",
            'levels in the web root' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token DATA_DIR=/home/happystl/happystl.com/levels $script",
            'the bank as the web root' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token BANK_DIR=/home/happystl/happystl.com $script",
            'the bank deeper down' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token BANK_DIR=/home/happystl/happystl.com/a/b $script",
            'a relative folder' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token DATA_DIR=levels $script",
            'a climb out' => "LIST=1 CRETE_BANK_VERIFIER_TOKEN=$token DATA_DIR=/home/happystl/happystl.com/../x $script",
        ];
        foreach ($refused as $why => $cmd) {
            $bad = [];
            exec("$cmd 2>&1", $bad, $code);
            self::assertNotSame(0, $code, $why);
            self::assertStringStartsWith('deploy-bank: ', $bad[0] ?? '', $why);
            self::assertStringNotContainsString('short;rm', implode("\n", $bad));
        }

        $src = (string) file_get_contents(self::site() . '/games/crete/tools/deploy-bank.sh');
        self::assertDoesNotMatchRegularExpression('/--delete|\brm -[a-z]*r|\bunlink\b/', preg_replace('/^\s*#.*$/m', '', str_replace("trap 'rm -rf \"\$stage\"' EXIT", '', $src)), 'it never deletes on the host');
        self::assertStringContainsString("printf '%s' \"\$CRETE_BANK_VERIFIER_TOKEN\" | sha256sum", $src);
        foreach (explode("\n", $src) as $line) {
            if (preg_match('/\$\{?CRETE_BANK_VERIFIER_TOKEN\b/', $line) && preg_match('/\b(echo|printf|cat|tee)\b/', $line)) {
                self::assertStringContainsString('| sha256sum', $line, 'the token is only ever hashed: ' . $line);
            }
        }
    }

}
