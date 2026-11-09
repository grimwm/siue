<?php
// Where the shared bank keeps its stores (bank/Place.php): the rule that never
// moves it on its own and never starts it empty in /var/tmp while data/
// exists, the birth record, and trusted-where's read-only report.
declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/_kit/php/tests/TempDir.php';
require_once dirname(__DIR__, 2) . '/bank/Place.php';

use Crete\Bank;
use Crete\Place;
use Kit\StoreDir;
use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class BankPlaceTest extends TestCase
{
    use TempDir;

    private const NOW = 1_800_000_000;
    private const BOOT = 1_799_000_000;

    private string $root;
    private string $data;
    private string $varTmp;
    private string $log;

    protected function setUp(): void
    {
        $this->root = self::makeTempDir('crete-place-test');
        $this->data = $this->root . '/site/data';
        $this->varTmp = $this->root . '/var-tmp/acct-crete-bank';
        mkdir($this->root . '/site', 0700);
        mkdir($this->root . '/var-tmp', 0700);
        $this->log = $this->root . '/php.log';
        touch($this->log);
    }

    protected function tearDown(): void
    {
        self::removeTree($this->root);
    }

    /** A Place whose data/ PHP can write when $dataWritable says so; /proc is this test's own. */
    private function place(bool $dataWritable, ?string $override = null, ?string $host = null): Place
    {
        $writable = fn(string $p): bool => $dataWritable ? is_writable($p) : !str_starts_with($p, $this->root . '/site') && is_writable($p);
        return new Place($this->data, $this->varTmp, $override, new StoreDir('crete bank storage:'), $writable, static fn(): int => self::NOW, $this->root . '/proc', $host);
    }

    /** A grade's served store with levels that came in at each of $at. */
    private static function served(string $dir, string $grade, array $at): void
    {
        @mkdir($dir, 0700, true);
        file_put_contents("$dir/served-$grade.json", json_encode(array_map(static fn(int $t): array => ['h' => sprintf('%016x', $t), 'v' => 2, 'at' => $t, 'n' => 0], $at)));
    }

    /** Every path under the test's folder with its bytes, and the log aside. */
    private function snapshot(): array
    {
        $out = [];
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($this->root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST);
        foreach ($it as $f) {
            $out[$f->getPathname()] = $f->isDir() ? 'dir' : (string) file_get_contents($f->getPathname());
        }
        ksort($out);
        return $out;
    }

    /** Place::choose with PHP's error log in this test's file. */
    private function choose(Place $place): array
    {
        $old = ini_set('error_log', $this->log);
        try {
            return $place->choose();
        } finally {
            ini_set('error_log', (string) $old);
        }
    }

    private function logged(): string
    {
        return (string) file_get_contents($this->log);
    }

    public function testWithNoDataFolderANewBankBeginsInVarTmpAndSaysSo(): void
    {
        $got = $this->choose($this->place(false));
        self::assertSame(['kind' => 'vartmp', 'dir' => $this->varTmp], $got);
        self::assertSame(0700, fileperms($this->varTmp) & 0777);
        self::assertSame(['at' => self::NOW, 'kind' => 'vartmp'], json_decode((string) file_get_contents("{$this->varTmp}/born.json"), true));
        self::assertStringContainsString("a new, empty bank begins in {$this->varTmp} (vartmp, which a php-fpm restart empties)", $this->logged());
        $this->choose($this->place(false));
        self::assertSame(1, substr_count($this->logged(), 'a new, empty bank begins'), 'said once');
    }

    public function testANewBankNeverStartsInVarTmpWhileDataExists(): void
    {
        mkdir($this->data, 0700);
        try {
            $this->choose($this->place(false));
            self::fail('refused');
        } catch (RuntimeException $e) {
            self::assertStringContainsString("{$this->data} exists but PHP cannot write it", $e->getMessage());
            self::assertStringContainsString('a php-fpm restart empties', $e->getMessage());
        }
        self::assertDirectoryDoesNotExist($this->varTmp, 'nothing begun there');
    }

    public function testABankInDataThatPhpCannotWriteIsNeverLeftForVarTmp(): void
    {
        self::served($this->data, 'easy', [100]);
        self::served($this->varTmp, 'easy', [200]);
        chmod($this->varTmp, 0700);
        $d = $this->place(false)->decide(false);
        self::assertNull($d['kind']);
        self::assertStringContainsString("{$this->data} holds the bank but PHP cannot write it", (string) $d['refused']);
        $this->expectException(RuntimeException::class);
        $this->choose($this->place(false));
    }

    public function testABankInVarTmpStaysThereWhenDataBecomesWritable(): void
    {
        mkdir($this->data, 0700);
        self::served($this->varTmp, 'medium', [300]);
        chmod($this->varTmp, 0700);
        self::assertSame(['kind' => 'vartmp', 'dir' => $this->varTmp], $this->choose($this->place(true)));
        self::assertFileDoesNotExist("{$this->varTmp}/born.json", 'not a new bank');
        self::assertFileDoesNotExist("{$this->data}/born.json");
        self::assertSame(['kind' => 'vartmp', 'dir' => $this->varTmp], $this->choose($this->place(false)), 'and while data/ is not writable');
    }

    public function testALinkInVarTmpNeverHoldsTheBank(): void
    {
        self::served($this->root . '/planted', 'easy', [1]);
        symlink($this->root . '/planted', $this->varTmp);
        self::assertSame('data', $this->place(true)->decide(true)['kind'], 'a planted link does not keep the bank from data/');
        self::assertTrue($this->place(false)->decide(false)['fresh'], 'nor counts as a bank that exists');
        $this->expectException(RuntimeException::class);
        $this->choose($this->place(false));
    }

    public function testDataIsUsedWhenWritableAndANewBankThereIsRecorded(): void
    {
        self::assertSame(['kind' => 'data', 'dir' => $this->data], $this->choose($this->place(true)));
        self::assertFileExists("{$this->data}/.htaccess");
        self::assertSame('data', json_decode((string) file_get_contents("{$this->data}/born.json"), true)['kind']);
        self::assertStringContainsString("a new, empty bank begins in {$this->data} (data)", $this->logged());
    }

    public function testABankInDataStaysInDataEvenWithOneInVarTmp(): void
    {
        self::served($this->data, 'hard', [400]);
        self::served($this->varTmp, 'hard', [500]);
        chmod($this->varTmp, 0700);
        self::assertSame(['kind' => 'data', 'dir' => $this->data], $this->choose($this->place(true)));
        self::assertFileDoesNotExist("{$this->data}/born.json", 'an existing bank gets no birth record');
        self::assertSame('', $this->logged());
    }

    public function testTheHostsFolderIsTheOnlyOneAndIsNeverMade(): void
    {
        $host = $this->root . '/home/crete-bank-data';
        mkdir($this->root . '/home', 0700);
        mkdir($this->data, 0770);
        $before = $this->snapshot();
        try {
            $this->choose($this->place(true, null, $host));
            self::fail('a missing host folder must refuse');
        } catch (\RuntimeException $e) {
            self::assertStringContainsString("$host, the folder bank/place.json names, is not a directory", $e->getMessage());
        }
        self::assertSame($before, $this->snapshot(), 'nothing made: no host folder, no data/ deny file, nothing in /var/tmp');
        $r = $this->place(true, null, $host)->report();
        self::assertSame([null, ['host'], false], [$r['kind'], array_keys($r['folders']), $r['dataWritable']]);

        mkdir($host, 0755);
        try {
            $this->choose($this->place(true, null, $host));
            self::fail('a folder others may enter must refuse');
        } catch (\RuntimeException $e) {
            self::assertStringContainsString('has mode 0755, not 0700', $e->getMessage());
        }
        chmod($host, 0700);
        self::served($this->data, 'easy', [1000]);
        self::assertSame(['kind' => 'host', 'dir' => $host], $this->choose($this->place(true, null, $host)), 'a bank in data/ never pulls it back');
        self::assertSame(['at' => self::NOW, 'kind' => 'host'], json_decode((string) file_get_contents("$host/born.json"), true));
        self::assertStringContainsString("a new, empty bank begins in $host (host)", $this->logged());
        self::assertFileDoesNotExist("{$this->data}/.htaccess", 'data/ is never set up');
        $r = $this->place(true, null, $host)->report();
        self::assertSame(['host', $host, null], [$r['kind'], $r['dir'], $r['refused']]);
        self::assertSame(['host'], array_keys($r['folders']));
        self::assertSame(['override', $this->root . '/o'], [$this->place(true, $this->root . '/o', $host)->decide(true)['kind'], $this->place(true, $this->root . '/o', $host)->decide(true)['dir']], 'the tests\' override still wins');
    }

    public function testTheOverrideWins(): void
    {
        $dir = $this->root . '/elsewhere';
        self::served($this->data, 'easy', [1]);
        self::assertSame(['kind' => 'override', 'dir' => $dir], $this->choose($this->place(false, $dir)));
        self::assertDirectoryExists($dir);
    }

    private function fakeProc(): void
    {
        mkdir($this->root . '/proc/self', 0700, true);
        mkdir($this->root . '/proc/77', 0700);
        file_put_contents($this->root . '/proc/stat', "cpu 1 2 3\nbtime " . self::BOOT . "\nprocesses 9\n");
        file_put_contents($this->root . '/proc/self/stat', '123 (php-fpm: pool www) S 77 123 123 0');
        $rest = ['S', ...array_fill(0, 18, '0'), '360000', '0', '0'];
        file_put_contents($this->root . '/proc/77/stat', '77 (php-fpm) ' . implode(' ', $rest));
        file_put_contents($this->root . '/proc/77/comm', "php-fpm\n");
        file_put_contents($this->root . '/proc/self/mountinfo', implode("\n", [
            '22 1 253:0 / / rw,relatime shared:1 - xfs /dev/vda1 rw',
            '90 22 253:0 /tmp/systemd-private-abc-php-fpm.service-Xy/tmp /tmp rw,relatime - xfs /dev/vda1 rw',
            '91 22 253:0 /var/tmp/systemd-private-abc-php-fpm.service-Zq/tmp /var/tmp rw,relatime - xfs /dev/vda1 rw',
        ]) . "\n");
    }

    public function testTheReportNamesTheFolderItsStoresAndTheHostReadOnly(): void
    {
        $this->fakeProc();
        self::served($this->varTmp, 'easy', [1000, 3000, 2000]);
        chmod($this->varTmp, 0700);
        file_put_contents("{$this->varTmp}/pending-easy.json", json_encode([['h' => 'a', 'at' => 4000]]));
        file_put_contents("{$this->varTmp}/retired-easy.json", json_encode(['0123456789abcdef', 'fedcba9876543210']));
        file_put_contents("{$this->varTmp}/served-hard.json", 'not json');
        file_put_contents("{$this->varTmp}/born.json", json_encode(['at' => 900, 'kind' => 'vartmp']));
        $before = $this->snapshot();

        $r = $this->place(false)->report();

        self::assertSame($before, $this->snapshot(), 'no folder, file or lock made');
        self::assertSame(['vartmp', $this->varTmp, null, false], [$r['kind'], $r['dir'], $r['refused'], $r['dataWritable']]);
        self::assertSame(filectime($this->varTmp), $r['ctime']);
        self::assertSame(filemtime($this->varTmp), $r['mtime']);
        $easy = $r['grades']['easy'];
        self::assertSame([3, 1000, 3000], [$easy['served']['count'], $easy['served']['oldest'], $easy['served']['newest']]);
        self::assertSame(filesize("{$this->varTmp}/served-easy.json"), $easy['served']['bytes']);
        self::assertSame(1, $easy['pending']['count']);
        self::assertSame(2, $easy['retired']['count']);
        self::assertNull($r['grades']['medium']['served'], 'no store');
        self::assertSame([null, 'unreadable'], [$r['grades']['hard']['served']['count'], $r['grades']['hard']['served']['error']]);
        self::assertSame(['data', 'vartmp'], array_keys($r['folders']));
        self::assertFalse($r['folders']['data']['exists']);
        self::assertSame(['at' => 900, 'kind' => 'vartmp'], $r['folders']['vartmp']['born']);
        self::assertSame('0700', $r['folders']['vartmp']['mode']);
        self::assertTrue($r['folders']['vartmp']['holdsBank']);
        self::assertSame(self::BOOT, $r['bootTime']);
        $hz = function_exists('posix_sysconf') && defined('POSIX_SC_CLK_TCK') ? (int) posix_sysconf(POSIX_SC_CLK_TCK) : 100;
        self::assertSame(['pid' => 77, 'name' => 'php-fpm', 'startedAt' => self::BOOT + intdiv(360000, $hz)], $r['server']);
        self::assertSame([
            ['mount' => '/tmp', 'root' => '/tmp/systemd-private-abc-php-fpm.service-Xy/tmp'],
            ['mount' => '/var/tmp', 'root' => '/var/tmp/systemd-private-abc-php-fpm.service-Zq/tmp'],
        ], $r['tmpMounts']);
        self::assertSame(StoreDir::euid(), $r['php']['uid']);
        self::assertSame(self::NOW, $r['now']);
    }

    public function testTheReportSaysWhyTheBankRefusesAndNullsWhatProcHides(): void
    {
        mkdir($this->data, 0700);
        $before = $this->snapshot();
        $r = $this->place(false)->report();
        self::assertSame($before, $this->snapshot());
        self::assertNull($r['kind']);
        self::assertStringContainsString('exists but PHP cannot write it', (string) $r['refused']);
        self::assertNull($r['grades']);
        self::assertTrue($r['folders']['data']['exists']);
        self::assertFalse($r['folders']['data']['writable']);
        self::assertFalse($r['folders']['vartmp']['exists']);
        self::assertSame([null, null, null], [$r['bootTime'], $r['server'], $r['tmpMounts']], 'no /proc here');
    }

    public function testStoreSummaryCoversEveryGradeAndList(): void
    {
        $s = Bank::storeSummary($this->root);
        self::assertSame(Bank::GRADES, array_keys($s));
        foreach ($s as $lists) {
            self::assertSame(['served' => null, 'pending' => null, 'retired' => null], $lists);
        }
    }
}
