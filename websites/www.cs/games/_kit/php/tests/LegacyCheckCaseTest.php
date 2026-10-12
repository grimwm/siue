<?php
// Proves the adapter turns each $check call of a PASS/FAIL script into a case.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class LegacyCheckCaseTest extends TestCase
{
    public function testEachCheckBecomesACase(): void
    {
        $script = tempnam(sys_get_temp_dir(), 'lcc') . '.php';
        file_put_contents($script, "<?php\n\$check('one', true);\n\$check('two', false, 'why');\n\$check('one', true);\n");
        $case = new class ('x') extends LegacyCheckCase {
            public static string $path = '';
            protected static function script(): string { return self::$path; }
        };
        $case::$path = $script;
        $got = iterator_to_array($case::checks());
        unlink($script);
        $this->assertSame(['one' => [true, ''], 'two' => [false, 'why'], 'one #2' => [true, '']], $got);
    }

    public function testAScriptWithNoChecksFails(): void
    {
        $script = tempnam(sys_get_temp_dir(), 'lcc') . '.php';
        file_put_contents($script, "<?php\n");
        $case = new class ('x') extends LegacyCheckCase {
            public static string $path = '';
            protected static function script(): string { return self::$path; }
        };
        $case::$path = $script;
        $got = iterator_to_array($case::checks());
        unlink($script);
        $this->assertSame([false, $script], $got['script ran no checks']);
    }
}
