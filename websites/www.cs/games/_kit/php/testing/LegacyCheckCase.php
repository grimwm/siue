<?php
// Runs a PASS/FAIL check script under PHPUnit: every $check(name, cond, extra)
// the script makes becomes one test case, named after the check.
declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

abstract class LegacyCheckCase extends TestCase
{
    /** Absolute path of the check script. */
    abstract protected static function script(): string;

    /** @return iterable<string, array{bool, string}> */
    public static function checks(): iterable
    {
        $results = [];
        $check = function (string $name, bool $cond, string $extra = '') use (&$results): void {
            $key = $name;
            for ($n = 2; isset($results[$key]); $n++) {
                $key = "$name #$n";
            }
            $results[$key] = [$cond, $extra];
        };
        $fail = 0;
        (static function (string $__script) use ($check, &$fail): void {
            require $__script;
        })(static::script());
        if ($results === []) {
            $results['script ran no checks'] = [false, static::script()];
        }
        return $results;
    }

    #[DataProvider('checks')]
    public function testCheck(bool $ok, string $detail): void
    {
        $this->assertTrue($ok, $detail);
    }
}
