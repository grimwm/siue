<?php
// One-shot converter: a sectioned PHP check script becomes a PHPUnit TestCase.
//
//   php checks-to-testcase.php <LegacyClassFile> <checksScript>
//
// The script's `// @test camelName: what it covers` markers split it into
// sections; each becomes `public function testCamelName(): void`. `$check(N, C)`
// becomes `self::assertTrue(C, N)` and `$check(N, C, D)` becomes
// `self::assertTrue(C, N . ' :: ' . D)`: exactly one assertion per old check.
// The class file is overwritten with the TestCase. Members the implementer
// wrote into the legacy class (helpers, constants, setUp) are kept; its
// script() method is dropped. The script is removed (`git rm` when tracked).
//
// Refused, with `file:line: reason` on stderr and nothing written: a prelude
// (everything before the first marker) with anything but declare, require*,
// define and if (!defined(...)); a named function declaration, exit or $fail in
// a section; a $check call without two or three arguments.
declare(strict_types=1);

const C2T_PRELUDE_HINT = 'the prelude may hold only declare, require, define and if (!defined(...)); move helpers into private static methods of the class';

function c2t_fail(string $file, int $line, string $why): never
{
    throw new RuntimeException("$file:$line: $why");
}

/** @param list<PhpToken> $t */
function c2t_next(array $t, int $i): int
{
    for ($i++; isset($t[$i]) && $t[$i]->isIgnorable(); $i++) {
    }
    return $i;
}

/**
 * Per token: true when it sits inside a double-quoted string or heredoc (code
 * in a `{$...}` interpolation inside one counts as code again).
 *
 * @param list<PhpToken> $t
 * @return list<bool>
 */
function c2t_in_string(array $t): array
{
    $stack = [];
    $out = [];
    foreach ($t as $tok) {
        $top = $stack === [] ? 'c' : $stack[count($stack) - 1];
        if ($tok->text === '"' && $tok->id === ord('"')) {
            if ($top === 'd') {
                array_pop($stack);
                $out[] = false;
            } else {
                $stack[] = 'd';
                $out[] = false;
            }
            continue;
        }
        if ($tok->id === T_START_HEREDOC) {
            $stack[] = 'd';
            $out[] = false;
            continue;
        }
        if ($tok->id === T_END_HEREDOC) {
            array_pop($stack);
            $out[] = false;
            continue;
        }
        $out[] = $top === 'd';
        if ($tok->id === T_CURLY_OPEN || $tok->id === T_DOLLAR_OPEN_CURLY_BRACES || ($tok->id === ord('{') && $top !== 'd')) {
            $stack[] = 'c';
        } elseif ($tok->id === ord('}') && $top === 'c') {
            array_pop($stack);
        }
    }
    return $out;
}

function c2t_is_open(PhpToken $t): bool
{
    return in_array($t->id, [ord('('), ord('['), ord('{'), T_CURLY_OPEN, T_DOLLAR_OPEN_CURLY_BRACES], true);
}

function c2t_is_close(PhpToken $t): bool
{
    return in_array($t->id, [ord(')'), ord(']'), ord('}')], true);
}

/** Index of the token that closes the opener at $i. @param list<PhpToken> $t */
function c2t_match(array $t, int $i, string $file): int
{
    $depth = 0;
    for ($n = count($t); $i < $n; $i++) {
        if (c2t_is_open($t[$i])) {
            $depth++;
        } elseif (c2t_is_close($t[$i]) && --$depth === 0) {
            return $i;
        }
    }
    c2t_fail($file, $t[$i - 1]->line, 'unbalanced brackets');
}

/**
 * Text of tokens [$from, $to), re-indented by $indent. Only newlines in
 * whitespace tokens get the indent, so multi-line strings stay byte-equal.
 *
 * @param list<PhpToken> $t
 * @param list<bool> $str
 */
function c2t_render(array $t, array $str, int $from, int $to, string $indent, string $file, int &$rewrites): string
{
    $out = '';
    for ($i = $from; $i < $to; $i++) {
        $tok = $t[$i];
        if ($tok->id === T_VARIABLE && $tok->text === '$check' && !$str[$i]) {
            $open = c2t_next($t, $i);
            if (!isset($t[$open]) || $t[$open]->text !== '(') {
                c2t_fail($file, $tok->line, '$check is used other than as a call');
            }
            $close = c2t_match($t, $open, $file);
            $args = [];
            $depth = 0;
            $start = $open + 1;
            for ($j = $open + 1; $j < $close; $j++) {
                if (c2t_is_open($t[$j])) {
                    $depth++;
                } elseif (c2t_is_close($t[$j])) {
                    $depth--;
                } elseif ($depth === 0 && $t[$j]->text === ',' && !$str[$j]) {
                    $args[] = [$start, $j];
                    $start = $j + 1;
                }
            }
            $args[] = [$start, $close];
            $last = $args[count($args) - 1];
            if (trim(c2t_render($t, $str, $last[0], $last[1], '', $file, $rewrites)) === '') {
                array_pop($args);
            }
            if (count($args) < 2 || count($args) > 3) {
                c2t_fail($file, $tok->line, '$check takes 2 or 3 arguments, found ' . count($args));
            }
            $r = array_map(
                fn(array $a): string => trim(c2t_render($t, $str, $a[0], $a[1], $indent, $file, $rewrites)),
                $args,
            );
            $msg = $r[0];
            if (count($r) === 3) {
                $msg = c2t_wrap($t, $str, $args[0], $r[0]) . " . ' :: ' . " . c2t_wrap($t, $str, $args[2], $r[2]);
            }
            $out .= "self::assertTrue($r[1], $msg)";
            $rewrites++;
            $i = $close;
            continue;
        }
        if ($tok->id === T_WHITESPACE && str_contains($tok->text, "\n")) {
            $out .= preg_replace('/\n(?=[^\n])/', "\n$indent", $tok->text) ?? $tok->text;
            if (str_ends_with($tok->text, "\n")) {
                $out .= $indent;
            }
            continue;
        }
        $out .= $tok->text;
    }
    return $out;
}

/**
 * Parenthesise $text when it has a top-level operator that binds looser than `.`.
 *
 * @param list<PhpToken> $t
 * @param list<bool> $str
 * @param array{int, int} $range
 */
function c2t_wrap(array $t, array $str, array $range, string $text): string
{
    $loose = [
        T_COALESCE, T_BOOLEAN_AND, T_BOOLEAN_OR, T_LOGICAL_AND, T_LOGICAL_OR, T_LOGICAL_XOR,
        T_IS_EQUAL, T_IS_NOT_EQUAL, T_IS_IDENTICAL, T_IS_NOT_IDENTICAL, T_IS_SMALLER_OR_EQUAL,
        T_IS_GREATER_OR_EQUAL, T_SPACESHIP, T_INSTANCEOF, T_SL, T_SR,
        ord('?'), ord('<'), ord('>'), ord('='), ord('!'), ord('+'), ord('-'), ord('|'), ord('&'), ord('^'),
    ];
    $depth = 0;
    for ($i = $range[0]; $i < $range[1]; $i++) {
        if (c2t_is_open($t[$i])) {
            $depth++;
        } elseif (c2t_is_close($t[$i])) {
            $depth--;
        } elseif ($depth === 0 && !$str[$i] && in_array($t[$i]->id, $loose, true)) {
            return "($text)";
        }
    }
    return $text;
}

/**
 * Checks the prelude (tokens [$from, $to)) holds only what R5 allows.
 *
 * @param list<PhpToken> $t
 */
function c2t_check_prelude(array $t, int $from, int $to, string $file): void
{
    $i = c2t_next($t, $from - 1);
    while ($i < $to) {
        $tok = $t[$i];
        $line = $tok->line;
        $isDefine = $tok->id === T_STRING && strtolower($tok->text) === 'define';
        $isIf = false;
        if ($tok->id === T_IF) {
            $a = c2t_next($t, $i);
            $b = c2t_next($t, $a);
            $c = c2t_next($t, $b);
            $isIf = $t[$a]->text === '(' && $t[$b]->text === '!' && $t[$c]->id === T_STRING && strtolower($t[$c]->text) === 'defined';
        }
        $isDeclare = in_array($tok->id, [T_DECLARE, T_REQUIRE, T_REQUIRE_ONCE, T_INCLUDE, T_INCLUDE_ONCE], true);
        if (!$isDefine && !$isIf && !$isDeclare) {
            c2t_fail($file, $line, C2T_PRELUDE_HINT);
        }
        if ($isIf) {
            $open = $i;
            while ($t[$open]->text !== '{') {
                $open++;
            }
            $i = c2t_match($t, $open, $file) + 1;
            $n = c2t_next($t, $i - 1);
            if ($n < $to && in_array($t[$n]->id, [T_ELSE, T_ELSEIF], true)) {
                c2t_fail($file, $t[$n]->line, C2T_PRELUDE_HINT);
            }
        } else {
            $depth = 0;
            for (; $i < $to; $i++) {
                if (c2t_is_open($t[$i])) {
                    $depth++;
                } elseif (c2t_is_close($t[$i])) {
                    $depth--;
                } elseif ($depth === 0 && $t[$i]->text === ';') {
                    $i++;
                    break;
                }
            }
        }
        for ($n = $from; $n < $to; $n++) {
            if ($t[$n]->id === T_VARIABLE && $t[$n]->text === '$check') {
                c2t_fail($file, $t[$n]->line, '$check in the prelude; checks belong in a section');
            }
        }
        $i = c2t_next($t, $i - 1);
    }
}

/**
 * The class file's parts: [modifiers, name, kept member text, use lines].
 *
 * @return array{string, string, string, list<string>}
 */
function c2t_parse_class(string $file): array
{
    $src = (string) file_get_contents($file);
    $t = PhpToken::tokenize($src);
    $uses = [];
    $classAt = null;
    foreach ($t as $i => $tok) {
        if ($tok->id === T_USE) {
            $end = $i;
            while ($t[$end]->text !== ';') {
                $end++;
            }
            $uses[] = trim(implode('', array_map(fn(PhpToken $x): string => $x->text, array_slice($t, $i, $end - $i + 1))));
        }
        if ($tok->id === T_CLASS) {
            $classAt = $i;
            break;
        }
    }
    if ($classAt === null) {
        c2t_fail($file, 1, 'no class found');
    }
    $mods = '';
    for ($k = $classAt - 1; $k >= 0 && ($t[$k]->isIgnorable() || in_array($t[$k]->id, [T_FINAL, T_ABSTRACT, T_READONLY], true)); $k--) {
        if (!$t[$k]->isIgnorable()) {
            $mods = $t[$k]->text . ' ' . $mods;
        }
    }
    $name = $t[c2t_next($t, $classAt)]->text;
    $ext = c2t_next($t, c2t_next($t, $classAt));
    $parent = $t[c2t_next($t, $ext)]->text ?? '';
    if ($t[$ext]->id !== T_EXTENDS || $parent !== 'LegacyCheckCase') {
        c2t_fail($file, $t[$classAt]->line, "$name does not extend LegacyCheckCase");
    }
    $open = $classAt;
    while ($t[$open]->text !== '{') {
        $open++;
    }
    $close = c2t_match($t, $open, $file);
    // Cut the script() method, with the doc comment and modifiers before it.
    $cutFrom = null;
    $cutTo = null;
    for ($i = $open + 1; $i < $close; $i++) {
        if (c2t_is_open($t[$i]) && $t[$i]->text !== '(') {
            $i = c2t_match($t, $i, $file);
            continue;
        }
        if ($t[$i]->id === T_FUNCTION && $t[c2t_next($t, $i)]->text === 'script') {
            $cutFrom = $i;
            while ($cutFrom > $open + 1 && ($t[$cutFrom - 1]->isIgnorable() || in_array($t[$cutFrom - 1]->id, [T_PROTECTED, T_PUBLIC, T_PRIVATE, T_STATIC, T_FINAL], true))) {
                $cutFrom--;
            }
            $b = $i;
            while ($t[$b]->text !== '{') {
                $b++;
            }
            $cutTo = c2t_match($t, $b, $file);
            break;
        }
    }
    if ($cutFrom === null || $cutTo === null) {
        c2t_fail($file, $t[$classAt]->line, "$name has no script() method");
    }
    $texts = array_map(fn(PhpToken $x): string => $x->text, $t);
    $kept = implode('', array_slice($texts, $open + 1, $cutFrom - $open - 1))
        . implode('', array_slice($texts, $cutTo + 1, $close - $cutTo - 1));
    return [$mods, $name, trim($kept, "\n") === '' ? '' : rtrim(ltrim($kept, "\n")), $uses];
}

function c2t_convert(string $classFile, string $scriptFile): string
{
    [$mods, $name, $members, $uses] = c2t_parse_class($classFile);
    $src = (string) file_get_contents($scriptFile);
    $t = PhpToken::tokenize($src);
    $str = c2t_in_string($t);
    if ($t === [] || $t[0]->id !== T_OPEN_TAG) {
        c2t_fail($scriptFile, 1, 'not a PHP script');
    }
    $total = 0;
    foreach ($t as $i => $tok) {
        if ($tok->id === T_VARIABLE && $tok->text === '$check' && !$str[$i]) {
            $total++;
        }
    }
    $markers = [];
    $depth = 0;
    foreach ($t as $i => $tok) {
        if (c2t_is_open($tok) && !$str[$i]) {
            $depth++;
        } elseif (c2t_is_close($tok) && !$str[$i]) {
            $depth--;
        }
        if ($tok->id === T_COMMENT && preg_match('~^(?://|#)\s*@test\b~', $tok->text)) {
            if (!preg_match('~^//\s*@test\s+([a-z][A-Za-z0-9]*):\s*(\S.*?)\s*$~', $tok->text, $m)) {
                c2t_fail($scriptFile, $tok->line, 'malformed marker; write `// @test camelName: what it covers`');
            }
            if ($depth !== 0) {
                c2t_fail($scriptFile, $tok->line, 'a marker must sit at the top level, between statements');
            }
            foreach ($markers as $prev) {
                if ($prev[1] === $m[1]) {
                    c2t_fail($scriptFile, $tok->line, "duplicate section name {$m[1]}");
                }
            }
            $markers[] = [$i, $m[1], $m[2], $tok->line];
        }
    }
    if ($markers === []) {
        c2t_fail($scriptFile, 1, 'no `// @test name: description` marker');
    }
    c2t_check_prelude($t, 1, $markers[0][0], $scriptFile);
    $prelude = trim(implode('', array_map(fn(PhpToken $x): string => $x->text, array_slice($t, 1, $markers[0][0] - 1))));
    if (!str_contains($prelude, 'declare(strict_types=1);')) {
        $prelude = "declare(strict_types=1);\n" . $prelude;
    }

    $rewrites = 0;
    $methods = [];
    foreach ($markers as $k => [$at, $camel, $desc, $line]) {
        $from = $at + 1;
        $to = $markers[$k + 1][0] ?? count($t);
        for ($i = $from; $i < $to; $i++) {
            $tok = $t[$i];
            if ($str[$i]) {
                continue;
            }
            if ($tok->id === T_FUNCTION) {
                $n = c2t_next($t, $i);
                if ($t[$n]->text === '&') {
                    $n = c2t_next($t, $n);
                }
                if ($t[$n]->id === T_STRING) {
                    c2t_fail($scriptFile, $tok->line, "function declaration {$t[$n]->text}() in section $camel; make it a private static method of the class");
                }
            }
            if ($tok->id === T_EXIT || ($tok->id === T_VARIABLE && $tok->text === '$fail')) {
                c2t_fail($scriptFile, $tok->line, "{$tok->text} in section $camel; assert instead of exiting");
            }
        }
        while ($from < $to && $t[$from]->id === T_WHITESPACE) {
            $from++;
        }
        while ($to > $from && $t[$to - 1]->id === T_WHITESPACE) {
            $to--;
        }
        $before = $rewrites;
        $body = c2t_render($t, $str, $from, $to, '        ', $scriptFile, $rewrites);
        if ($rewrites === $before) {
            c2t_fail($scriptFile, $line, "section $camel has no \$check");
        }
        $methods[] = "    /** $desc */\n    public function test" . ucfirst($camel) . "(): void\n    {\n        $body\n    }";
    }
    if ($rewrites !== $total) {
        c2t_fail($scriptFile, 1, "rewrote $rewrites of $total \$check calls; a call sits outside every section");
    }

    $uses[] = 'use PHPUnit\Framework\TestCase;';
    $uses = array_values(array_unique($uses));
    sort($uses);
    $out = "<?php\n$prelude\n\n" . implode("\n", $uses) . "\n\n{$mods}class $name extends TestCase\n{\n"
        . ($members === '' ? '' : "$members\n\n")
        . implode("\n\n", $methods) . "\n}\n";

    // The written class must parse, and hold one assertion per old check and no $check.
    try {
        $o = PhpToken::tokenize($out, TOKEN_PARSE);
    } catch (ParseError $e) {
        c2t_fail($scriptFile, 1, 'the converted class does not parse: ' . $e->getMessage());
    }
    $os = c2t_in_string($o);
    $asserts = 0;
    foreach ($o as $i => $tok) {
        if ($os[$i]) {
            continue;
        }
        if ($tok->id === T_VARIABLE && $tok->text === '$check') {
            c2t_fail($scriptFile, 1, 'a $check survived the rewrite');
        }
        if ($tok->id === T_STRING && $tok->text === 'assertTrue' && ($o[$i - 1]->id ?? 0) === T_DOUBLE_COLON && ($o[$i - 2]->text ?? '') === 'self') {
            $asserts++;
        }
    }
    if ($asserts < $total) {
        c2t_fail($scriptFile, 1, "wrote $asserts assertions for $total checks");
    }
    return $out;
}

if (PHP_SAPI === 'cli' && isset($argv[0]) && realpath($argv[0]) === __FILE__) {
    if ($argc !== 3) {
        fwrite(STDERR, "usage: php checks-to-testcase.php <LegacyClassFile> <checksScript>\n");
        exit(2);
    }
    [, $classFile, $scriptFile] = $argv;
    try {
        $out = c2t_convert($classFile, $scriptFile);
    } catch (RuntimeException $e) {
        fwrite(STDERR, $e->getMessage() . "\n");
        exit(1);
    }
    file_put_contents($classFile, $out);
    $dir = dirname($scriptFile);
    exec('git -C ' . escapeshellarg($dir) . ' ls-files --error-unmatch -- ' . escapeshellarg(basename($scriptFile)) . ' 2>/dev/null', $ignored, $tracked);
    if ($tracked === 0) {
        exec('git -C ' . escapeshellarg($dir) . ' rm -q -f -- ' . escapeshellarg(basename($scriptFile)) . ' 2>&1', $log, $rm);
        if ($rm !== 0) {
            fwrite(STDERR, "git rm failed: " . implode(' ', $log) . "\n");
            exit(1);
        }
    } else {
        unlink($scriptFile);
    }
    echo 'wrote ' . $classFile . ': ' . substr_count($out, "\n    public function test") . ' sections' . "\n";
}
