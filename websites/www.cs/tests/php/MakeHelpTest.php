<?php
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

// `make help` is generated from the `## description` on each rule line, so a
// new target can't land without saying what it does, and no help line wraps.
final class MakeHelpTest extends TestCase
{
    private const MAX_LINE = 120;
    private const MAX_DESCRIPTION = 80;

    /** @return array<string, array{string}> */
    public static function makefiles(): array
    {
        return [
            'root Makefile' => [dirname(__DIR__, 4) . '/Makefile'],
            'www.cs Makefile' => [dirname(__DIR__, 2) . '/Makefile'],
        ];
    }

    #[DataProvider('makefiles')]
    public function testEveryPhonyTargetHasADescription(string $path): void
    {
        $makefile = (string) file_get_contents($path);

        preg_match_all('/^\.PHONY:(.*)$/m', $makefile, $phony);
        $targets = preg_split('/\s+/', trim(implode(' ', $phony[1])), -1, PREG_SPLIT_NO_EMPTY);
        self::assertNotEmpty($targets);

        preg_match_all('/^([a-z][a-z0-9-]*):[^#\n]*##[ \t]*(\S.*)$/m', $makefile, $rules, PREG_SET_ORDER);
        $described = [];
        foreach ($rules as $rule) {
            $described[$rule[1]] = $rule[2];
            self::assertLessThanOrEqual(
                self::MAX_DESCRIPTION,
                strlen($rule[2]),
                "the description of {$rule[1]} is too long: " . $rule[2],
            );
        }

        self::assertSame([], array_values(array_diff($targets, array_keys($described))), 'phony targets with no ## description');
        self::assertSame([], array_values(array_diff(array_keys($described), $targets)), 'described targets missing from .PHONY');
    }

    #[DataProvider('makefiles')]
    public function testHelpOutputIsSectionedAndShort(string $path): void
    {
        $lines = $this->helpLines($path);
        $makefile = (string) file_get_contents($path);

        preg_match_all('/^##@ (.+)$/m', $makefile, $headings);
        self::assertNotEmpty($headings[1], 'the Makefile has ##@ section headings');
        foreach ($headings[1] as $heading) {
            self::assertContains($heading, $lines, "make help prints the heading $heading");
        }

        preg_match_all('/^([a-z][a-z0-9-]*):[^#\n]*##[ \t]*\S/m', $makefile, $targets);
        foreach ($targets[1] as $target) {
            self::assertMatchesRegularExpression('/^  ' . preg_quote($target, '/') . ' +\S/m', implode("\n", $lines), "make help lists $target");
        }

        foreach ($lines as $line) {
            self::assertLessThanOrEqual(self::MAX_LINE, strlen($line), "help line too wide: $line");
        }
    }

    /** @return list<string> */
    private function helpLines(string $path): array
    {
        $which = shell_exec('command -v make');
        if (!is_string($which) || trim($which) === '') {
            self::markTestSkipped('make is not installed, so `make help` cannot run (brew install make / apt install make)');
        }

        $process = proc_open(
            ['make', '-s', '-C', dirname($path), 'help'],
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
            $pipes,
            null,
            ['PATH' => (string) getenv('PATH'), 'HOME' => (string) getenv('HOME'), 'NO_COLOR' => '1'],
        );
        self::assertIsResource($process);
        $out = (string) stream_get_contents($pipes[1]);
        $err = (string) stream_get_contents($pipes[2]);
        $status = proc_close($process);
        self::assertSame(0, $status, "make help failed: $err");
        self::assertStringNotContainsString("\033", $out, 'NO_COLOR output is plain');

        return explode("\n", rtrim($out, "\n"));
    }
}
