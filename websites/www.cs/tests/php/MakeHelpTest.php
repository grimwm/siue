<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

// `make help` names every target the Makefile declares phony, so a new target
// can't land without a line saying what it does.
final class MakeHelpTest extends TestCase
{
    public function testEveryPhonyTargetHasAHelpLine(): void
    {
        $makefile = (string) file_get_contents(__DIR__ . '/../../Makefile');

        preg_match_all('/^\.PHONY:(.*)$/m', $makefile, $phony);
        $targets = preg_split('/\s+/', trim(implode(' ', $phony[1])), -1, PREG_SPLIT_NO_EMPTY);
        self::assertNotEmpty($targets);

        self::assertSame(1, preg_match('/^help:\n((?:\t.*\n)+)/m', $makefile, $recipe), 'the Makefile has a help recipe');
        preg_match_all('/@echo "  ([a-z][a-z0-9-]*)[ "]/', $recipe[1], $named);

        $missing = array_values(array_diff($targets, $named[1]));
        self::assertSame([], $missing, 'targets with no line in make help');
    }
}
