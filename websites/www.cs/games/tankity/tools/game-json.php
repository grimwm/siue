<?php
/**
 * Builds Operation Tankity's one runtime data file, game.json,
 * from the one file a maintainer edits, game.yaml (arsenal,
 * keys, audio, effects). Browsers cannot read YAML and the server has no YAML
 * extension, so the YAML is checked here and written out as JSON; the client
 * (game.js) and the room server (rooms.php) read only the JSON.
 *
 *   php tools/game-json.php          validate game.yaml, rewrite game.json
 *   php tools/game-json.php --check  exit 1 if game.yaml is invalid or
 *                                  game.json is stale (make test and
 *                                  make deploy run this)
 *
 * Run from this game's folder; from the site root the path is
 * php games/tankity/tools/game-json.php. It needs only PHP and this folder.
 *
 * The YAML subset is documented at the top of game.yaml's parser below
 * (tankity_yaml_parse); the schema is documented field by field in game.yaml.
 * server settings stay out of this: ./.config.yaml is read by
 * config.php at request time and never reaches the browser.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
declare(strict_types=1);

/** A YAML or schema problem; the message already carries the line number. */
final class TankityConfigError extends RuntimeException
{
}

/* ------------------------------------------------------------------ YAML */

/**
 * Parses the YAML subset game.yaml uses. Supported:
 *   - block mappings (`key: value`, `key:` then an indented block);
 *   - block sequences (`- item`), including sequences of mappings
 *     (`- key: v` with the rest of the keys aligned under the first), and a
 *     sequence written at the same indent as its key;
 *   - flow sequences `[a, b]` and flow mappings `{a: 1, b: [x, y]}`, on one line;
 *   - plain, 'single-quoted' and "double-quoted" scalars (double quotes know
 *     \\ \" \n \t \/ and \uXXXX; single quotes double '' for one quote);
 *   - ints, floats, true/false, null and ~ (lowercase only; anything else
 *     is a string, so quote a string that must not be read as one of these);
 *   - `#` comments (whole line or trailing, after whitespace, outside quotes)
 *     and blank lines.
 * Rejected with a line number: tabs, anchors/aliases/tags, block scalars
 * (| >), multi-line flow collections, multiple documents, duplicate keys.
 *
 * @param array<string,int> $lineMap filled with display path => line number
 * @throws TankityConfigError
 */
function tankity_yaml_parse(string $text, array &$lineMap = []): mixed
{
    $lines = [];
    foreach (preg_split('/\r\n|\n|\r/', $text) as $i => $raw) {
        $n = $i + 1;
        if (str_contains($raw, "\t")) {
            // Tabs inside a quoted scalar are legal YAML but never needed here.
            throw new TankityConfigError("line $n: tabs are not allowed; indent with spaces");
        }
        $body = tankity_yaml_strip_comment($raw, $n);
        if (trim($body) === '') {
            continue;
        }
        if (preg_match('/^(---|\.\.\.)\s*$/', $body)) {
            throw new TankityConfigError("line $n: document markers are not supported");
        }
        $indent = strlen($body) - strlen(ltrim($body, ' '));
        $lines[] = ['indent' => $indent, 'text' => rtrim(substr($body, $indent)), 'n' => $n];
    }
    if (!$lines) {
        return null;
    }
    $i = 0;
    $lineMap = [];
    $value = tankity_yaml_block($lines, $i, $lines[0]['indent'], '', $lineMap);
    if ($i < count($lines)) {
        throw new TankityConfigError("line {$lines[$i]['n']}: unexpected indentation");
    }
    return $value;
}

/** The line without its trailing comment; quotes only open at a value start. */
function tankity_yaml_strip_comment(string $raw, int $n): string
{
    $len = strlen($raw);
    $quote = '';
    $prevSig = '';
    for ($p = 0; $p < $len; $p++) {
        $c = $raw[$p];
        if ($quote !== '') {
            if ($quote === '"' && $c === '\\') {
                $p++;
            } elseif ($c === $quote) {
                if ($quote === "'" && $p + 1 < $len && $raw[$p + 1] === "'") {
                    $p++;
                } else {
                    $quote = '';
                    $prevSig = $c;
                }
            }
            continue;
        }
        if (($c === '"' || $c === "'") && ($prevSig === '' || strpos(':-[{,', $prevSig) !== false)
            && ($p === 0 || $raw[$p - 1] === ' ' || strpos('[{,', $raw[$p - 1]) !== false)) {
            $quote = $c;
            continue;
        }
        if ($c === '#' && ($p === 0 || $raw[$p - 1] === ' ')) {
            return rtrim(substr($raw, 0, $p));
        }
        if ($c !== ' ') {
            $prevSig = $c;
        }
    }
    if ($quote !== '') {
        throw new TankityConfigError("line $n: unterminated quoted string");
    }
    return rtrim($raw);
}

function tankity_yaml_is_seq(string $text): bool
{
    return $text === '-' || str_starts_with($text, '- ');
}

/** Splits `key: rest`; null when the text is not a mapping entry. */
function tankity_yaml_entry(string $text, int $n): ?array
{
    if ($text !== '' && ($text[0] === '"' || $text[0] === "'")) {
        $end = tankity_yaml_quote_end($text, 0, $n);
        $after = substr($text, $end + 1);
        if ($after === ':' || str_starts_with($after, ': ')) {
            return [tankity_yaml_unquote(substr($text, 0, $end + 1), $n), trim(substr($after, 1))];
        }
        return null;
    }
    if ($text !== '' && strpos('[{', $text[0]) !== false) {
        return null;
    }
    if (preg_match('/^([^\s:][^:]*?|[^\s:]):(?: +(.*))?$/', $text, $m)) {
        return [trim($m[1]), trim($m[2] ?? '')];
    }
    return null;
}

/**
 * @param list<array{indent:int,text:string,n:int}> $lines
 * @param array<string,int> $map
 */
function tankity_yaml_block(array &$lines, int &$i, int $indent, string $path, array &$map): mixed
{
    $first = $lines[$i];
    if (tankity_yaml_is_seq($first['text'])) {
        $out = [];
        while ($i < count($lines) && $lines[$i]['indent'] === $indent && tankity_yaml_is_seq($lines[$i]['text'])) {
            $line = $lines[$i];
            $itemPath = $path . '[' . count($out) . ']';
            $map[$itemPath] = $line['n'];
            $rest = $line['text'] === '-' ? '' : ltrim(substr($line['text'], 1));
            if ($rest === '') {
                $i++;
                $out[] = ($i < count($lines) && $lines[$i]['indent'] > $indent)
                    ? tankity_yaml_block($lines, $i, $lines[$i]['indent'], $itemPath, $map)
                    : null;
                continue;
            }
            if (tankity_yaml_is_seq($rest)) {
                throw new TankityConfigError("line {$line['n']}: a sequence directly inside a sequence item is not supported");
            }
            if (tankity_yaml_entry($rest, $line['n']) !== null) {
                // `- key: v`: the mapping's keys line up under the first one.
                $lines[$i] = ['indent' => $indent + (strlen($line['text']) - strlen($rest)), 'text' => $rest, 'n' => $line['n']];
                $out[] = tankity_yaml_block($lines, $i, $lines[$i]['indent'], $itemPath, $map);
                continue;
            }
            $i++;
            $out[] = tankity_yaml_inline($rest, $line['n']);
            if ($i < count($lines) && $lines[$i]['indent'] > $indent) {
                throw new TankityConfigError("line {$lines[$i]['n']}: unexpected indentation");
            }
        }
        return $out;
    }
    $out = [];
    while ($i < count($lines) && $lines[$i]['indent'] === $indent) {
        $line = $lines[$i];
        if (tankity_yaml_is_seq($line['text'])) {
            throw new TankityConfigError("line {$line['n']}: a list item where a key was expected");
        }
        $entry = tankity_yaml_entry($line['text'], $line['n']);
        if ($entry === null) {
            throw new TankityConfigError("line {$line['n']}: expected `key: value`");
        }
        [$key, $rest] = $entry;
        if ($key === '') {
            throw new TankityConfigError("line {$line['n']}: empty key");
        }
        if (array_key_exists($key, $out)) {
            throw new TankityConfigError("line {$line['n']}: duplicate key `$key`");
        }
        $kp = $path === '' ? $key : "$path.$key";
        $map[$kp] = $line['n'];
        $i++;
        if ($rest === '') {
            if ($i < count($lines) && $lines[$i]['indent'] > $indent) {
                $out[$key] = tankity_yaml_block($lines, $i, $lines[$i]['indent'], $kp, $map);
            } elseif ($i < count($lines) && $lines[$i]['indent'] === $indent && tankity_yaml_is_seq($lines[$i]['text'])) {
                $out[$key] = tankity_yaml_block($lines, $i, $indent, $kp, $map);
            } else {
                $out[$key] = null;
            }
            continue;
        }
        $out[$key] = tankity_yaml_inline($rest, $line['n']);
        if ($i < count($lines) && $lines[$i]['indent'] > $indent) {
            throw new TankityConfigError("line {$lines[$i]['n']}: unexpected indentation");
        }
    }
    if ($i < count($lines) && $lines[$i]['indent'] > $indent) {
        throw new TankityConfigError("line {$lines[$i]['n']}: unexpected indentation");
    }
    return $out;
}

/** A value written after `key:` or `- `: a flow collection or one scalar. */
function tankity_yaml_inline(string $s, int $n): mixed
{
    $p = 0;
    $v = tankity_yaml_flow_value($s, $p, $n, false);
    tankity_yaml_skip($s, $p);
    if ($p < strlen($s)) {
        throw new TankityConfigError("line $n: unexpected text after the value: `" . substr($s, $p) . '`');
    }
    return $v;
}

function tankity_yaml_skip(string $s, int &$p): void
{
    while ($p < strlen($s) && $s[$p] === ' ') {
        $p++;
    }
}

function tankity_yaml_quote_end(string $s, int $start, int $n): int
{
    $q = $s[$start];
    for ($p = $start + 1; $p < strlen($s); $p++) {
        if ($q === '"' && $s[$p] === '\\') {
            $p++;
        } elseif ($s[$p] === $q) {
            if ($q === "'" && ($s[$p + 1] ?? '') === "'") {
                $p++;
            } else {
                return $p;
            }
        }
    }
    throw new TankityConfigError("line $n: unterminated quoted string");
}

function tankity_yaml_unquote(string $q, int $n): string
{
    $inner = substr($q, 1, -1);
    if ($q[0] === "'") {
        return str_replace("''", "'", $inner);
    }
    $map = ['\\' => '\\', '"' => '"', 'n' => "\n", 't' => "\t", '/' => '/'];
    return preg_replace_callback('/\\\\(u[0-9a-fA-F]{4}|.)/s', function (array $m) use ($map, $n): string {
        $e = $m[1];
        if ($e[0] === 'u' && strlen($e) === 5) {
            return html_entity_decode('&#x' . substr($e, 1) . ';', ENT_QUOTES, 'UTF-8');
        }
        if (!isset($map[$e])) {
            throw new TankityConfigError("line $n: unknown escape \\$e in a double-quoted string");
        }
        return $map[$e];
    }, $inner);
}

function tankity_yaml_flow_value(string $s, int &$p, int $n, bool $inFlow): mixed
{
    tankity_yaml_skip($s, $p);
    if ($p >= strlen($s)) {
        throw new TankityConfigError("line $n: a value is missing");
    }
    $c = $s[$p];
    if ($c === '[') {
        $p++;
        $out = [];
        while (true) {
            tankity_yaml_skip($s, $p);
            if ($p >= strlen($s)) {
                throw new TankityConfigError("line $n: `[` is never closed (flow lists must fit on one line)");
            }
            if ($s[$p] === ']') {
                $p++;
                return $out;
            }
            $out[] = tankity_yaml_flow_value($s, $p, $n, true);
            tankity_yaml_skip($s, $p);
            if (($s[$p] ?? '') === ',') {
                $p++;
            } elseif (($s[$p] ?? '') !== ']') {
                throw new TankityConfigError("line $n: expected `,` or `]` in a flow list");
            }
        }
    }
    if ($c === '{') {
        $p++;
        $out = [];
        while (true) {
            tankity_yaml_skip($s, $p);
            if ($p >= strlen($s)) {
                throw new TankityConfigError("line $n: `{` is never closed (flow maps must fit on one line)");
            }
            if ($s[$p] === '}') {
                $p++;
                return $out;
            }
            if ($s[$p] === '"' || $s[$p] === "'") {
                $end = tankity_yaml_quote_end($s, $p, $n);
                $key = tankity_yaml_unquote(substr($s, $p, $end - $p + 1), $n);
                $p = $end + 1;
            } else {
                $start = $p;
                while ($p < strlen($s) && strpos(':,{}[]', $s[$p]) === false) {
                    $p++;
                }
                $key = trim(substr($s, $start, $p - $start));
            }
            tankity_yaml_skip($s, $p);
            if (($s[$p] ?? '') !== ':' || $key === '') {
                throw new TankityConfigError("line $n: expected `key: value` in a flow map");
            }
            $p++;
            if (array_key_exists($key, $out)) {
                throw new TankityConfigError("line $n: duplicate key `$key`");
            }
            tankity_yaml_skip($s, $p);
            $out[$key] = (($s[$p] ?? '') === ',' || ($s[$p] ?? '') === '}') ? null : tankity_yaml_flow_value($s, $p, $n, true);
            tankity_yaml_skip($s, $p);
            if (($s[$p] ?? '') === ',') {
                $p++;
            } elseif (($s[$p] ?? '') !== '}') {
                throw new TankityConfigError("line $n: expected `,` or `}` in a flow map");
            }
        }
    }
    if ($c === '"' || $c === "'") {
        $end = tankity_yaml_quote_end($s, $p, $n);
        $v = tankity_yaml_unquote(substr($s, $p, $end - $p + 1), $n);
        $p = $end + 1;
        return $v;
    }
    if (strpos('&*!|>%@`', $c) !== false) {
        throw new TankityConfigError("line $n: `$c` (anchors, aliases, tags, block scalars) is not supported; quote the text if it is a string");
    }
    $start = $p;
    if ($inFlow) {
        while ($p < strlen($s) && strpos(',]}', $s[$p]) === false) {
            $p++;
        }
    } else {
        $p = strlen($s);
    }
    return tankity_yaml_scalar(trim(substr($s, $start, $p - $start)));
}

function tankity_yaml_scalar(string $t): mixed
{
    if ($t === '' || $t === 'null' || $t === '~') {
        return null;
    }
    if ($t === 'true') {
        return true;
    }
    if ($t === 'false') {
        return false;
    }
    if (preg_match('/^-?(0|[1-9][0-9]*)$/', $t) && strlen($t) < 16) {
        return (int) $t;
    }
    if (preg_match('/^-?[0-9]+(\.[0-9]+([eE][-+]?[0-9]+)?|[eE][-+]?[0-9]+)$/', $t)) {
        return (float) $t;
    }
    return $t;
}

/* ---------------------------------------------------------------- schema */

const TANKITY_AMMO_EFFECTS = ['shot', 'pellets', 'cluster', 'proximity', 'seeker', 'pierce', 'emp'];
const TANKITY_GEAR_EFFECTS = ['repair', 'fuel', 'plate', 'shield', 'extralife', 'jammer', 'bunker', 'laststand'];
const TANKITY_PAINTERS = ['disc', 'beam', 'spark'];
const TANKITY_SFX_EVENTS = ['move', 'click', 'launch', 'boom', 'clank', 'thud', 'warn', 'cash', 'bark', 'win', 'lose', 'fanfare'];
const TANKITY_AUDIO_EXT = ['mp3', 'ogg', 'm4a', 'wav'];
const TANKITY_FX_SLOTS = ['muzzle', 'trail', 'impact'];
const TANKITY_FX_SPECIALS = ['split', 'steer', 'pierce', 'arc'];
/** Emitter enums; fx.js SHAPES, AIMS, EASES and SCHEMA are the same lists. */
const TANKITY_FX_ENUMS = [
    'shape' => ['dot', 'streak', 'ring', 'spark', 'smoke', 'sprite', 'bolt', 'beam'],
    'aim' => ['fixed', 'forward', 'back', 'normal'],
    'ease' => ['linear', 'out', 'in'],
    'unit' => ['px', 'r'],
    'anchor' => ['center', 'bottom'],
];
/** Shell body glow: field => [min, max]. */
const TANKITY_FX_BODY = ['halo' => [0.0, 100.0], 'alpha' => [0.0, 1.0], 'pulse' => [0.0, 30.0], 'stretch' => [0.0, 200.0]];
/** Numeric emitter fields: name => [type, min, max, min with unit r, max with unit r]. */
const TANKITY_FX_FIELDS = [
    'count' => ['int', 0, 200, null, null],
    'rate' => ['num', 0.0, 500.0, null, null],
    'delay' => ['num', 0.0, 5.0, null, null],
    'duration' => ['num', 0.0, 10.0, null, null],
    'life' => ['pair', 0.02, 10.0, null, null],
    'speed' => ['pair', -2000.0, 2000.0, -50.0, 50.0],
    'angle' => ['num', -360.0, 360.0, null, null],
    'spread' => ['num', 0.0, 360.0, null, null],
    'offset' => ['num', 0.0, 500.0, 0.0, 5.0],
    'gravity' => ['num', -3000.0, 3000.0, null, null],
    'drag' => ['num', 0.0, 20.0, null, null],
    'wind' => ['num', 0.0, 1.0, null, null],
    'size' => ['pair', 0.0, 200.0, 0.0, 10.0],
    'sizeEnd' => ['num', 0.0, 20.0, null, null],
    'length' => ['num', 0.0, 1000.0, 0.0, 10.0],
    'width' => ['num', 0.1, 50.0, null, null],
    'fps' => ['num', 0.0, 120.0, null, null],
    'scale' => ['num', 0.05, 10.0, null, null],
    'rotJitter' => ['num', 0.0, 360.0, null, null],
    'spin' => ['pair', -3600.0, 3600.0, null, null],
];
const TANKITY_KEY_ACTIONS = [
    'aim' => ['barrelLeft', 'barrelRight', 'powerUp', 'powerDown', 'driveLeft', 'driveRight'],
    'shop' => ['selUp', 'selDown', 'qtyUp', 'qtyDown', 'buyRow', 'buy', 'preview', 'close', 'next'],
    'global' => ['music', 'nextTrack', 'sound', 'log', 'help', 'report', 'menu', 'random', 'rooms', 'new', 'cycle', 'guns',
        'tutorial', 'battlePreview', 'fullscreen', 'fire', 'escape'],
    'scroll' => ['lineDown', 'lineUp', 'pageDown', 'pageUp', 'halfDown', 'halfUp'],
];

/** Collects errors with their YAML line numbers. */
final class TankityCheck
{
    /** @var list<string> */
    public array $errors = [];

    /** @param array<string,int> $lines */
    public function __construct(private array $lines, private string $dir)
    {
    }

    public function err(string $path, string $msg): void
    {
        $l = $this->lines[$path] ?? null;
        if ($l === null) {
            // Fall back to the closest parent that has a line.
            $q = $path;
            while ($l === null && $q !== '') {
                $q = preg_replace('/(\.[^.\[]+|\[[0-9]+\])$/', '', $q, 1, $c);
                $l = $this->lines[$q] ?? null;
                if (!$c) {
                    break;
                }
            }
        }
        $this->errors[] = ($l !== null ? "line $l: " : '') . ($path === '' ? '' : "$path: ") . $msg;
    }

    /** Only these keys may appear. */
    public function allow(array $m, array $keys, string $path): void
    {
        foreach (array_keys($m) as $k) {
            if (!in_array((string) $k, $keys, true)) {
                $this->err($path === '' ? (string) $k : "$path.$k", 'unknown key (allowed: ' . implode(', ', $keys) . ')');
            }
        }
    }

    public function map(mixed $v, string $path): ?array
    {
        if (!is_array($v) || ($v && array_is_list($v))) {
            $this->err($path, 'must be a mapping (key: value lines)');
            return null;
        }
        return $v;
    }

    public function lst(mixed $v, string $path): ?array
    {
        if (!is_array($v) || ($v && !array_is_list($v))) {
            $this->err($path, 'must be a list');
            return null;
        }
        return $v;
    }

    public function int(array $m, string $k, string $path, int $lo, int $hi, bool $req = true, ?int $def = null): ?int
    {
        if (!array_key_exists($k, $m) || $m[$k] === null) {
            if ($req && $def === null) {
                $this->err("$path.$k", 'is required');
            }
            return $def;
        }
        if (!is_int($m[$k]) || $m[$k] < $lo || $m[$k] > $hi) {
            $this->err("$path.$k", "must be a whole number from $lo to $hi");
            return $def;
        }
        return $m[$k];
    }

    public function num(array $m, string $k, string $path, float $lo, float $hi, bool $req = true, ?float $def = null): int|float|null
    {
        if (!array_key_exists($k, $m) || $m[$k] === null) {
            if ($req && $def === null) {
                $this->err("$path.$k", 'is required');
            }
            return $def;
        }
        if ((!is_int($m[$k]) && !is_float($m[$k])) || $m[$k] < $lo || $m[$k] > $hi) {
            $this->err("$path.$k", "must be a number from $lo to $hi");
            return $def;
        }
        return $m[$k];
    }

    public function bool(array $m, string $k, string $path, bool $req = true): ?bool
    {
        if (!array_key_exists($k, $m) || $m[$k] === null) {
            if ($req) {
                $this->err("$path.$k", 'is required');
            }
            return null;
        }
        if (!is_bool($m[$k])) {
            $this->err("$path.$k", 'must be true or false');
            return null;
        }
        return $m[$k];
    }

    public function str(array $m, string $k, string $path, int $max, bool $req = true, ?string $pattern = null): ?string
    {
        if (!array_key_exists($k, $m) || $m[$k] === null) {
            if ($req) {
                $this->err("$path.$k", 'is required');
            }
            return null;
        }
        $v = $m[$k];
        if (!is_string($v) || $v === '' || mb_strlen($v) > $max) {
            $this->err("$path.$k", "must be text of 1 to $max characters");
            return null;
        }
        if (preg_match('/[\x{2013}\x{2014}]/u', $v)) {
            $this->err("$path.$k", 'must not contain en or em dashes (use a comma, colon or hyphen)');
            return null;
        }
        if ($pattern !== null && !preg_match($pattern, $v)) {
            $this->err("$path.$k", "has the wrong format (expected $pattern)");
            return null;
        }
        return $v;
    }

    public function enum(array $m, string $k, string $path, array $allowed, bool $req = true): ?string
    {
        if (!array_key_exists($k, $m) || $m[$k] === null) {
            if ($req) {
                $this->err("$path.$k", 'is required');
            }
            return null;
        }
        if (!is_string($m[$k]) || !in_array($m[$k], $allowed, true)) {
            $this->err("$path.$k", 'must be one of: ' . implode(', ', $allowed));
            return null;
        }
        return $m[$k];
    }

    public function color(mixed $v, string $path): ?string
    {
        if (!is_string($v) || !preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $v)) {
            $this->err($path, 'must be a quoted #rgb or #rrggbb colour such as "#ffe27a" (quote it: # starts a comment)');
            return null;
        }
        return strtolower($v);
    }

    /** A file path inside the game folder with an allowed audio extension. */
    public function audioFile(mixed $v, string $path): ?string
    {
        if (!is_string($v) || $v === '') {
            $this->err($path, 'must be a path such as audio/sfx/boom.mp3');
            return null;
        }
        $ext = strtolower(pathinfo($v, PATHINFO_EXTENSION));
        if (!in_array($ext, TANKITY_AUDIO_EXT, true)) {
            $this->err($path, 'must end in one of: .' . implode(', .', TANKITY_AUDIO_EXT));
            return null;
        }
        if ($v[0] === '/' || str_contains($v, '..') || str_contains($v, '\\') || preg_match('#^[a-z]+:#i', $v)
            || !preg_match('#^[A-Za-z0-9._/-]+$#', $v)) {
            $this->err($path, 'must be a relative path inside the game folder (letters, digits, . _ - /)');
            return null;
        }
        $real = realpath($this->dir . '/' . $v);
        $base = realpath($this->dir);
        if ($real === false || !is_file($real)) {
            $this->err($path, "file not found: $v (relative to the game folder)");
            return null;
        }
        if ($base === false || !str_starts_with($real, $base . DIRECTORY_SEPARATOR)) {
            $this->err($path, 'must stay inside the game folder');
            return null;
        }
        return $v;
    }
}

/**
 * Checks a parsed game.yaml and returns the game.json structure.
 *
 * @param array<string,int> $lines display path => line number from the parser
 * @return array{0: ?array, 1: list<string>} [data or null, errors]
 */
function tankity_config_build(mixed $doc, array $lines, string $gameDir): array
{
    $c = new TankityCheck($lines, $gameDir);
    $root = $c->map($doc ?? [], '');
    if ($root === null || !$doc) {
        return [null, $root === null ? $c->errors : ['game.yaml is empty; it needs arsenal, keys, audio and effects sections']];
    }
    $c->allow($root, ['arsenal', 'keys', 'audio', 'effects'], '');
    foreach (['arsenal', 'keys', 'audio', 'effects'] as $k) {
        if (!isset($root[$k])) {
            $c->err('', "section `$k` is required");
        }
    }
    $arsenal = tankity_build_arsenal($c, $root['arsenal'] ?? null);
    $out = [
        '_note' => 'Generated from game.yaml by tools/game-json.php. Edit game.yaml, not this file.',
        'arsenal' => $arsenal,
        'keys' => tankity_build_keys($c, $root['keys'] ?? null),
        'audio' => tankity_build_audio($c, $root['audio'] ?? null),
        'effects' => tankity_build_effects($c, $root['effects'] ?? null, array_column($arsenal['ammo'], 'key'), $gameDir),
    ];
    return [$c->errors ? null : $out, $c->errors];
}

function tankity_build_arsenal(TankityCheck $c, mixed $a): array
{
    $res = ['ammo' => [], 'gear' => []];
    $a = $c->map($a, 'arsenal');
    if ($a === null) {
        return $res;
    }
    $c->allow($a, ['ammo', 'gear'], 'arsenal');
    $seen = [];
    $ammo = $c->lst($a['ammo'] ?? null, 'arsenal.ammo') ?? [];
    foreach ($ammo as $i => $row) {
        $p = "arsenal.ammo[$i]";
        $row = $c->map($row, $p);
        if ($row === null) {
            continue;
        }
        $c->allow($row, ['key', 'name', 'cat', 'dmg', 'radius', 'price', 'pack', 'minRound', 'ai', 'aiRound', 'effect',
            'speed', 'flat', 'pellets', 'spread', 'fuse', 'split', 'fan', 'subDmg', 'subRadius', 'prox', 'steer',
            'drain', 'note', 'gfx'], $p);
        $o = [];
        $o['key'] = $c->str($row, 'key', $p, 24, true, '/^[a-z][a-z0-9]*$/');
        if ($o['key'] !== null) {
            if (isset($seen[$o['key']])) {
                $c->err("$p.key", "duplicate key `{$o['key']}` (ammo and gear keys share one namespace)");
            }
            $seen[$o['key']] = true;
        }
        $o['name'] = $c->str($row, 'name', $p, 40);
        $o['cat'] = $c->str($row, 'cat', $p, 30);
        $o['dmg'] = $c->int($row, 'dmg', $p, 1, 500);
        $o['radius'] = $c->int($row, 'radius', $p, 1, 200);
        $o['price'] = $c->int($row, 'price', $p, 0, 100000);
        $o['pack'] = $c->int($row, 'pack', $p, 0, 99);
        $o['minRound'] = $c->int($row, 'minRound', $p, 1, 99);
        $o['ai'] = $c->bool($row, 'ai', $p);
        $o['aiRound'] = $c->int($row, 'aiRound', $p, 1, 99);
        $o['effect'] = $c->enum($row, 'effect', $p, TANKITY_AMMO_EFFECTS);
        $o['speed'] = $c->num($row, 'speed', $p, 0.1, 5.0);
        if (($f = $c->bool($row, 'flat', $p, false)) !== null) {
            $o['flat'] = $f;
        }
        $extra = [
            'pellets' => ['int', 1, 12], 'spread' => ['num', 0.0, 1.0], 'fuse' => ['num', 0.1, 10.0],
            'split' => ['int', 2, 12], 'fan' => ['num', 0.0, 1.0], 'subDmg' => ['int', 1, 500],
            'subRadius' => ['int', 1, 200], 'prox' => ['num', 1.0, 200.0], 'steer' => ['num', 0.0, 500.0],
            'drain' => ['int', 0, 1000],
        ];
        foreach ($extra as $k => [$type, $lo, $hi]) {
            if (array_key_exists($k, $row) && $row[$k] !== null) {
                $o[$k] = $type === 'int' ? $c->int($row, $k, $p, $lo, $hi) : $c->num($row, $k, $p, (float) $lo, (float) $hi);
            }
        }
        $needs = ['pellets' => ['pellets', 'spread'], 'cluster' => ['fuse', 'split', 'fan', 'subDmg', 'subRadius'],
            'proximity' => ['prox'], 'seeker' => ['steer'], 'emp' => ['drain']];
        foreach ($needs[$o['effect'] ?? ''] ?? [] as $k) {
            if (!array_key_exists($k, $row) || $row[$k] === null) {
                $c->err("$p.$k", "is required when effect is {$o['effect']}");
            }
        }
        $o['note'] = $c->str($row, 'note', $p, 120);
        $o['gfx'] = tankity_build_gfx($c, $row['gfx'] ?? null, "$p.gfx");
        $res['ammo'][] = tankity_ordered($o, ['key', 'name', 'cat', 'dmg', 'radius', 'price', 'pack', 'minRound', 'ai', 'aiRound',
            'effect', 'pellets', 'spread', 'fuse', 'split', 'fan', 'subDmg', 'subRadius', 'prox', 'steer', 'drain', 'flat', 'speed', 'note', 'gfx']);
    }
    if (!in_array('shell', array_column($res['ammo'], 'key'), true)) {
        $c->err('arsenal.ammo', 'needs a free `shell` (price 0): the game starts every player with it');
    }
    foreach ($res['ammo'] as $i => $o) {
        if (($o['key'] ?? null) === 'shell' && ($o['price'] ?? 0) !== 0) {
            $c->err("arsenal.ammo[$i].price", 'the `shell` must be free (price 0)');
        }
    }
    $gear = $c->lst($a['gear'] ?? null, 'arsenal.gear') ?? [];
    foreach ($gear as $i => $row) {
        $p = "arsenal.gear[$i]";
        $row = $c->map($row, $p);
        if ($row === null) {
            continue;
        }
        $c->allow($row, ['key', 'name', 'cat', 'price', 'n', 'effect', 'minRound', 'dmg', 'radius', 'note'], $p);
        $o = [];
        $o['key'] = $c->str($row, 'key', $p, 24, true, '/^[a-z][a-z0-9]*$/');
        if ($o['key'] !== null) {
            if (isset($seen[$o['key']])) {
                $c->err("$p.key", "duplicate key `{$o['key']}` (ammo and gear keys share one namespace)");
            }
            $seen[$o['key']] = true;
        }
        $o['name'] = $c->str($row, 'name', $p, 40);
        $o['cat'] = $c->str($row, 'cat', $p, 30);
        $o['price'] = $c->int($row, 'price', $p, 0, 100000);
        $o['n'] = $c->int($row, 'n', $p, 1, 1000);
        $o['effect'] = $c->enum($row, 'effect', $p, TANKITY_GEAR_EFFECTS);
        if (array_key_exists('minRound', $row) && $row['minRound'] !== null) {
            $o['minRound'] = $c->int($row, 'minRound', $p, 1, 99);
        }
        if (($o['effect'] ?? '') === 'laststand') {
            $o['dmg'] = $c->int($row, 'dmg', $p, 1, 500);
            $o['radius'] = $c->int($row, 'radius', $p, 1, 200);
        } else {
            foreach (['dmg', 'radius'] as $k) {
                if (array_key_exists($k, $row)) {
                    $c->err("$p.$k", 'only the laststand effect uses this');
                }
            }
        }
        $o['note'] = $c->str($row, 'note', $p, 120);
        $res['gear'][] = tankity_ordered($o, ['key', 'name', 'cat', 'price', 'n', 'effect', 'minRound', 'dmg', 'radius', 'note']);
    }
    return $res;
}

function tankity_build_gfx(TankityCheck $c, mixed $g, string $p): ?array
{
    $g = $c->map($g, $p);
    if ($g === null) {
        return null;
    }
    $c->allow($g, ['shell', 'trail', 'blast', 'painter', 'shake'], $p);
    $o = [];
    foreach (['shell', 'trail'] as $k) {
        $o[$k] = array_key_exists($k, $g) ? $c->color($g[$k], "$p.$k") : null;
        if (!array_key_exists($k, $g)) {
            $c->err("$p.$k", 'is required');
        }
    }
    $blast = $c->lst($g['blast'] ?? null, "$p.blast");
    if ($blast !== null && count($blast) !== 2) {
        $c->err("$p.blast", 'must list exactly two colours: [outer, inner]');
    } elseif ($blast !== null) {
        $o['blast'] = [$c->color($blast[0], "$p.blast[0]"), $c->color($blast[1], "$p.blast[1]")];
    }
    $o['painter'] = $c->enum($g, 'painter', $p, TANKITY_PAINTERS);
    $o['shake'] = $c->num($g, 'shake', $p, 0.0, 1.0);
    return tankity_ordered($o, ['shell', 'trail', 'blast', 'painter', 'shake']);
}

function tankity_build_keys(TankityCheck $c, mixed $k): array
{
    $res = [];
    $k = $c->map($k, 'keys');
    if ($k === null) {
        return $res;
    }
    $c->allow($k, array_keys(TANKITY_KEY_ACTIONS), 'keys');
    foreach (TANKITY_KEY_ACTIONS as $ctx => $actions) {
        $p = "keys.$ctx";
        $m = $c->map($k[$ctx] ?? null, $p);
        if ($m === null) {
            continue;
        }
        $c->allow($m, $actions, $p);
        $res[$ctx] = [];
        $used = [];
        foreach ($actions as $a) {
            $list = $c->lst($m[$a] ?? null, "$p.$a");
            if ($list === null) {
                continue;
            }
            if (!$list) {
                $c->err("$p.$a", 'needs at least one key token');
                continue;
            }
            $tokens = [];
            foreach ($list as $i => $t) {
                $tp = "$p.$a" . "[$i]";
                if (!is_string($t) || $t === '' || !preg_match('/^( |(Ctrl\+|Shift\+)?[^\s]+)$/', $t)) {
                    $c->err($tp, 'must be a quoted key token such as ArrowLeft, KeyA, "a", "1", Ctrl+F, Shift+KeyJ or " " (a lone space)');
                    continue;
                }
                if (isset($used[$t])) {
                    $c->err($tp, "token `$t` is already bound to {$used[$t]} in this context");
                }
                $used[$t] = $a;
                $tokens[] = $t;
            }
            $res[$ctx][$a] = $tokens;
        }
    }
    return $res;
}

function tankity_build_audio(TankityCheck $c, mixed $a): array
{
    $res = ['sfx' => new stdClass(), 'music' => []];
    $a = $c->map($a, 'audio');
    if ($a === null) {
        return $res;
    }
    $c->allow($a, ['sfx', 'music'], 'audio');
    $sfx = $c->map($a['sfx'] ?? [], 'audio.sfx') ?? [];
    $c->allow($sfx, TANKITY_SFX_EVENTS, 'audio.sfx');
    $outSfx = [];
    foreach (TANKITY_SFX_EVENTS as $ev) {
        $row = $sfx[$ev] ?? null;
        if ($row === null) {
            continue;
        }
        $p = "audio.sfx.$ev";
        $row = $c->map($row, $p);
        if ($row === null) {
            continue;
        }
        $c->allow($row, ['file', 'volume'], $p);
        if (!isset($row['file'])) {
            continue;
        }
        $o = ['file' => $c->audioFile($row['file'], "$p.file")];
        $o['volume'] = $c->num($row, 'volume', $p, 0.0, 1.0, false, 1.0);
        $outSfx[$ev] = $o;
    }
    $res['sfx'] = $outSfx ?: new stdClass();
    $music = $c->lst($a['music'] ?? [], 'audio.music') ?? [];
    foreach ($music as $i => $row) {
        $p = "audio.music[$i]";
        $row = $c->map($row, $p);
        if ($row === null) {
            continue;
        }
        $c->allow($row, ['file', 'title', 'volume', 'credit'], $p);
        $o = ['file' => $c->audioFile($row['file'] ?? null, "$p.file")];
        $o['title'] = $c->str($row, 'title', $p, 60);
        $o['volume'] = $c->num($row, 'volume', $p, 0.0, 1.0, false, 1.0);
        $credit = $c->str($row, 'credit', $p, 120, false);
        if ($credit !== null) {
            $o['credit'] = $credit;
        }
        $res['music'][] = $o;
    }
    return $res;
}

/**
 * The effects section: every ammo key and `laststand` (the wreck blast) gets
 * body, muzzle, trail, impact and optional specials; game.yaml documents each
 * field. Returned as authored (weapon order, field order), values checked.
 *
 * @param list<string> $ammoKeys
 */
function tankity_build_effects(TankityCheck $c, mixed $e, array $ammoKeys, string $dir): array
{
    $res = [];
    $e = $c->map($e, 'effects');
    if ($e === null) {
        return $res;
    }
    $want = array_merge($ammoKeys, ['laststand']);
    $c->allow($e, $want, 'effects');
    $sheets = tankity_fx_sheets($dir);
    foreach ($want as $key) {
        if (!array_key_exists($key, $e)) {
            $c->err('effects', "needs an entry for `$key` (every ammo key and `laststand`; copy `shell` as a start)");
        }
    }
    foreach ($e as $key => $w) {
        if (!in_array((string) $key, $want, true)) {
            continue;
        }
        $p = "effects.$key";
        $w = $c->map($w, $p);
        if ($w === null) {
            continue;
        }
        $c->allow($w, ['body', 'muzzle', 'trail', 'impact', 'special'], $p);
        foreach (TANKITY_FX_SLOTS as $slot) {
            if (!array_key_exists($slot, $w)) {
                $c->err($p, "needs a `$slot` effect");
            }
        }
        $o = [];
        foreach ($w as $part => $v) {
            if ($part === 'body') {
                $o['body'] = tankity_build_fx_body($c, $v, "$p.body");
            } elseif ($part === 'special') {
                $o['special'] = [];
                foreach ($c->map($v, "$p.special") ?? [] as $name => $ef) {
                    if (in_array($name, TANKITY_FX_SPECIALS, true)) {
                        $o['special'][$name] = tankity_build_fx_effect($c, $ef, "$p.special.$name", $name === 'steer', false, $sheets);
                    } else {
                        $c->err("$p.special.$name", 'unknown special (allowed: ' . implode(', ', TANKITY_FX_SPECIALS) . ')');
                    }
                }
            } elseif (in_array($part, TANKITY_FX_SLOTS, true)) {
                $o[$part] = tankity_build_fx_effect($c, $v, "$p.$part", $part === 'trail', true, $sheets);
            }
        }
        $res[$key] = $o;
    }
    return $res;
}

/** The sheet names in fx/sprites/sprites.json whose image file exists. @return list<string> */
function tankity_fx_sheets(string $dir): array
{
    $idx = json_decode((string) @file_get_contents("$dir/fx/sprites/sprites.json"), true);
    $names = [];
    foreach (is_array($idx) ? $idx : [] as $name => $d) {
        if ($name[0] !== '_' && is_array($d) && is_string($d['file'] ?? null) && is_file("$dir/fx/sprites/{$d['file']}")) {
            $names[] = (string) $name;
        }
    }
    return $names;
}

function tankity_build_fx_body(TankityCheck $c, mixed $b, string $p): array
{
    $b = $c->map($b, $p);
    if ($b === null) {
        return [];
    }
    $c->allow($b, array_keys(TANKITY_FX_BODY), $p);
    $o = [];
    foreach (TANKITY_FX_BODY as $k => [$lo, $hi]) {
        if (array_key_exists($k, $b)) {
            $o[$k] = $c->num($b, $k, $p, $lo, $hi);
        }
    }
    return $o;
}

/**
 * One effect, { screen, emitters }. $drips: its emitters drip per second along
 * the flight (a trail, or the seeker's steer) instead of firing once.
 * $needOne: a weapon slot must have an emitter.
 *
 * @param list<string> $sheets
 */
function tankity_build_fx_effect(TankityCheck $c, mixed $ef, string $p, bool $drips, bool $needOne, array $sheets): array
{
    $ef = $c->map($ef, $p);
    if ($ef === null) {
        return [];
    }
    $c->allow($ef, ['screen', 'emitters'], $p);
    $o = [];
    if (array_key_exists('screen', $ef)) {
        $s = $c->map($ef['screen'], "$p.screen");
        if ($s !== null) {
            $c->allow($s, ['shake', 'flash'], "$p.screen");
            foreach ($s as $k => $v) {
                if ($k === 'shake') {
                    $o['screen']['shake'] = $c->num($s, 'shake', "$p.screen", 0.0, 1.0);
                } elseif ($k === 'flash') {
                    $f = $c->map($v, "$p.screen.flash");
                    if ($f === null) {
                        continue;
                    }
                    $c->allow($f, ['color', 'alpha', 'dur'], "$p.screen.flash");
                    $color = null;
                    if (array_key_exists('color', $f)) {
                        $color = $c->color($f['color'], "$p.screen.flash.color");
                    } else {
                        $c->err("$p.screen.flash.color", 'is required');
                    }
                    $o['screen']['flash'] = ['color' => $color, 'alpha' => $c->num($f, 'alpha', "$p.screen.flash", 0.0, 1.0),
                        'dur' => $c->num($f, 'dur', "$p.screen.flash", 0.05, 1.5)];
                }
            }
        }
    }
    $list = $c->lst($ef['emitters'] ?? null, "$p.emitters") ?? [];
    if ($needOne && !$list) {
        $c->err("$p.emitters", 'needs at least one emitter');
    }
    $o['emitters'] = [];
    foreach ($list as $i => $em) {
        $o['emitters'][] = tankity_build_fx_emitter($c, $em, "$p.emitters[$i]", $drips, $sheets);
    }
    return $o;
}

/**
 * One emitter. Only what the author wrote is kept (fx.js DEFAULTS fill the
 * rest), in the order written. Size, speed, offset and length are checked
 * against the unit they are written in: with `unit: r` they multiply the
 * blast radius, so a pixel-sized number there would swallow the screen.
 *
 * @param list<string> $sheets
 */
function tankity_build_fx_emitter(TankityCheck $c, mixed $em, string $p, bool $drips, array $sheets): array
{
    $em = $c->map($em, $p);
    if ($em === null) {
        return [];
    }
    $c->allow($em, array_merge(array_keys(TANKITY_FX_FIELDS), array_keys(TANKITY_FX_ENUMS), ['edge', 'glow', 'round', 'alpha', 'colors', 'sheet', 'tint']), $p);
    $r = ($em['unit'] ?? 'px') === 'r';
    $o = [];
    foreach ($em as $k => $v) {
        if (isset(TANKITY_FX_FIELDS[$k])) {
            [$type, $lo, $hi, $rLo, $rHi] = TANKITY_FX_FIELDS[$k];
            if ($r && $rLo !== null) {
                [$lo, $hi] = [$rLo, $rHi];
            }
            $o[$k] = match ($type) {
                'int' => $c->int($em, $k, $p, (int) $lo, (int) $hi),
                'num' => $c->num($em, $k, $p, $lo, $hi),
                default => tankity_fx_pair($c, $v, "$p.$k", $lo, $hi, $k === 'life'),
            };
        } elseif (isset(TANKITY_FX_ENUMS[$k])) {
            $o[$k] = $c->enum($em, $k, $p, TANKITY_FX_ENUMS[$k]);
        } elseif ($k === 'edge' || $k === 'glow' || $k === 'round') {
            $o[$k] = $c->bool($em, $k, $p);
        } elseif ($k === 'alpha') {
            $o[$k] = tankity_fx_ramp($c, $v, "$p.alpha", 'opacity keyframes, each 0 to 1', fn($x) => is_int($x) || is_float($x) ? ($x >= 0 && $x <= 1 ? $x : null) : null);
        } elseif ($k === 'colors') {
            $o[$k] = tankity_fx_ramp($c, $v, "$p.colors", 'colours such as "#ffe27a"', fn($x) => is_string($x) && preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $x) ? strtolower($x) : null);
        } elseif ($k === 'sheet') {
            $o[$k] = $c->enum($em, 'sheet', $p, $sheets);
        } elseif ($k === 'tint') {
            $o[$k] = $c->color($v, "$p.tint");
        }
    }
    $shape = $em['shape'] ?? 'dot';
    if ($shape === 'sprite' && !isset($em['sheet'])) {
        $c->err("$p.sheet", 'is required for a sprite emitter (' . implode(', ', $sheets) . ')');
    }
    if ($shape !== 'sprite') {
        foreach (['sheet', 'fps', 'scale', 'anchor', 'tint'] as $k) {
            if (array_key_exists($k, $em)) {
                $c->err("$p.$k", 'only a sprite emitter uses this');
            }
        }
    }
    $pos = fn(string $k): bool => (is_int($em[$k] ?? null) || is_float($em[$k] ?? null)) && $em[$k] > 0;
    if ($drips) {
        if (!$pos('rate')) {
            $c->err("$p.rate", 'is required above 0 here: trail emitters drip per second along the flight (count does nothing)');
        }
    } elseif (!$pos('count') && !($pos('rate') && $pos('duration'))) {
        $c->err($p, 'emits nothing: give it a count above 0, or a rate and a duration above 0');
    }
    return $o;
}

/** A non-empty list of at most 10 values, each accepted by $ok (which returns the value or null). */
function tankity_fx_ramp(TankityCheck $c, mixed $v, string $p, string $what, callable $ok): array
{
    $a = $c->lst($v, $p) ?? [];
    if (!$a || count($a) > 10) {
        $c->err($p, "must list 1 to 10 $what");
    }
    $out = [];
    foreach ($a as $i => $x) {
        $y = $ok($x);
        if ($y === null) {
            $c->err("$p" . "[$i]", "is not valid (expected $what)");
        }
        $out[] = $y;
    }
    return $out;
}

/** A [min, max] pair of numbers within lo..hi, min <= max; $positive also needs min above 0. */
function tankity_fx_pair(TankityCheck $c, mixed $v, string $p, float $lo, float $hi, bool $positive): ?array
{
    $ok = is_array($v) && array_is_list($v) && count($v) === 2 && array_filter($v, fn($x) => is_int($x) || is_float($x)) === $v;
    if (!$ok) {
        $c->err($p, 'must be a [min, max] pair of numbers');
        return null;
    }
    if ($v[0] < $lo || $v[1] > $hi || $v[0] > $v[1] || ($positive && $v[0] <= 0)) {
        $c->err($p, "must be [min, max] with " . ($positive ? 'min above 0 and ' : '') . "$lo <= min <= max <= $hi");
        return null;
    }
    return $v;
}

/** Fields in a fixed order, absent ones dropped, so output never reshuffles. */
function tankity_ordered(array $o, array $order): array
{
    $out = [];
    foreach ($order as $k) {
        if (array_key_exists($k, $o) && $o[$k] !== null) {
            $out[$k] = $o[$k];
        }
    }
    return $out;
}

/** game.json text for a game.yaml text. @throws TankityConfigError */
function tankity_config_render(string $yaml, string $gameDir): string
{
    $lines = [];
    $doc = tankity_yaml_parse($yaml, $lines);
    [$data, $errors] = tankity_config_build($doc, $lines, $gameDir);
    if ($data === null) {
        throw new TankityConfigError(implode("\n", $errors));
    }
    // Pretty, except each effects emitter sits on one line: there are about
    // two hundred, and fully expanded they would triple the file the browser
    // downloads (the host serves it uncompressed).
    $flags = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION;
    $flat = [];
    foreach ($data['effects'] ?? [] as $wk => $slots) {
        foreach ($slots as $slot => $def) {
            foreach ($def['emitters'] ?? [] as $i => $em) {
                $token = "\u{1}" . count($flat) . "\u{1}";
                $flat[json_encode($token, $flags)] = json_encode($em, $flags);
                $data['effects'][$wk][$slot]['emitters'][$i] = $token;
            }
        }
    }
    return strtr(json_encode($data, JSON_PRETTY_PRINT | $flags), $flat) . "\n";
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $dir = dirname(__DIR__);
    $check = in_array('--check', $argv, true);
    try {
        $want = tankity_config_render((string) file_get_contents("$dir/game.yaml"), $dir);
    } catch (TankityConfigError $e) {
        foreach (explode("\n", $e->getMessage()) as $l) {
            fwrite(STDERR, "game-json: game.yaml $l\n");
        }
        exit(1);
    }
    $have = is_file("$dir/game.json") ? (string) file_get_contents("$dir/game.json") : '';
    if ($have === $want) {
        exit(0);
    }
    if ($check) {
        fwrite(STDERR, "game-json: game.json is stale; run php tools/game-json.php in the game folder\n");
        exit(1);
    }
    file_put_contents("$dir/game.json", $want);
    echo "game-json: wrote game.json\n";
}
