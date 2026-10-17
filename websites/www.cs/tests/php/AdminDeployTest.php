<?php
// The admin login's slice of the deploy set: its pages, stylesheet, libraries and
// .htaccess files ship; its storage, notes and local compose override never do.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class AdminDeployTest extends TestCase
{
    /** @var array{int, list<string>}|null the one deploy-list run, shared by every test */
    private static ?array $run = null;

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
        $probes = ['admin/zz-probe.txt', 'admin/zz-sub/zz-probe.php', 'admin/lib/zz-probe.txt', 'admin/lib/zz-sub/zz-probe.php', 'admin/data/zz-deploy-probe.sqlite'];
        $made = [];
        $madeDirs = [];
        foreach ($probes as $f) {
            $dir = dirname("$site/$f");
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
                $madeDirs[] = $dir;
            }
            file_put_contents("$site/$f", "probe\n");
            $made[] = $f;
        }
        $index = tempnam(sys_get_temp_dir(), 'admin-deploy-index');
        $out = [];
        $code = 1;
        try {
            $real = trim((string) shell_exec('cd ' . escapeshellarg($site) . ' && git rev-parse --path-format=absolute --git-path index'));
            self::assertTrue($real !== '' && copy($real, $index), 'the index is copied');
            $env = 'GIT_INDEX_FILE=' . escapeshellarg($index);
            exec("cd " . escapeshellarg($site) . " && $env git add -f -- admin/data/zz-deploy-probe.sqlite 2>&1 && $env LIST=1 ./deploy.sh 2>&1", $out, $code);
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
        $expected = ['admin/.htaccess', 'admin/admin.css', 'admin/index.php', 'admin/login.php', 'admin/verify.php', 'admin/logout.php',
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
        foreach (['admin/data/zz-deploy-probe.sqlite', 'admin/README.md', 'admin/zz-probe.txt', 'admin/zz-sub/zz-probe.php', 'admin/lib/zz-probe.txt', 'admin/lib/zz-sub/zz-probe.php', 'compose.admin-local.yaml'] as $f) {
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

}
