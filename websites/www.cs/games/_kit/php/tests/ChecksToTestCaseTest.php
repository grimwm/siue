<?php
// The check-script converter: sections become test methods, $check becomes one
// assertTrue each, and a script that cannot convert is refused with file:line.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class ChecksToTestCaseTest extends TestCase
{
    private const TOOL = __DIR__ . '/../testing/checks-to-testcase.php';

    private string $dir;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/checks-to-testcase-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir($this->dir);
    }

    protected function tearDown(): void
    {
        exec('rm -rf ' . escapeshellarg($this->dir));
    }

    /** Copies a fixture beside a legacy class and runs the tool: [exit code, stderr+stdout, class path, script path]. */
    private function convert(string $fixture): array
    {
        $script = "$this->dir/$fixture.checks.php";
        copy(__DIR__ . "/fixture/$fixture.checks.php", $script);
        $class = "$this->dir/OkTest.php";
        copy(__DIR__ . '/fixture/ok.legacy.php', $class);
        $out = [];
        exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(self::TOOL) . ' ' . escapeshellarg($class) . ' ' . escapeshellarg($script) . ' 2>&1', $out, $code);
        return [$code, implode("\n", $out), $class, $script];
    }

    public function testConvertsToTheExpectedClass(): void
    {
        [$code, $out, $class, $script] = $this->convert('ok');
        self::assertSame(0, $code, $out);
        self::assertStringEqualsFile(__DIR__ . '/fixture/ok.expected.php', (string) file_get_contents($class));
        self::assertFileDoesNotExist($script, 'the script is removed once converted');
    }

    public function testWrittenClassPassesLint(): void
    {
        [$code, $out, $class] = $this->convert('ok');
        self::assertSame(0, $code, $out);
        exec(escapeshellarg(PHP_BINARY) . ' -l ' . escapeshellarg($class) . ' 2>&1', $lint, $lintCode);
        self::assertSame(0, $lintCode, implode("\n", $lint));
    }

    public function testOneAssertionPerCheck(): void
    {
        [, , $class] = $this->convert('ok');
        $text = (string) file_get_contents($class);
        self::assertSame(5, substr_count($text, 'self::assertTrue('));
        self::assertStringNotContainsString('$check(', str_replace("'text with \$check( inside, '", '', $text));
        self::assertStringContainsString("self::assertTrue(\$a + 1 === 3, 'three' . ' :: ' . \"a={\$a}\")", $text);
        self::assertStringContainsString("'wrapped' . ' :: ' . (\$a === 2 ? 'yes' : 'no')", $text);
    }

    /** @return iterable<string, array{string, int, string}> */
    public static function refusals(): iterable
    {
        yield 'closure in the prelude' => ['bad-prelude', 3, 'prelude may hold only declare, require, define'];
        yield 'function declaration in a section' => ['section-function', 5, 'function declaration helper()'];
        yield 'fail counter in a section' => ['uses-fail', 7, '$fail'];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('refusals')]
    public function testRefusesWithFileLineAndReason(string $fixture, int $line, string $reason): void
    {
        [$code, $out, $class] = $this->convert($fixture);
        self::assertSame(1, $code, $out);
        self::assertStringContainsString("$fixture.checks.php:$line: ", $out);
        self::assertStringContainsString($reason, $out);
        self::assertStringContainsString('extends LegacyCheckCase', (string) file_get_contents($class), 'nothing is written on a refusal');
        self::assertFileExists("$this->dir/$fixture.checks.php");
    }
}
