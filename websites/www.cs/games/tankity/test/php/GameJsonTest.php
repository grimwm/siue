<?php
// tools/game-json.php: the YAML-subset parser, the game.yaml schema checks,
// and the --check workflow.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 2));
}
require_once TANKITY_GAME_DIR . '/tools/game-json.php';

use PHPUnit\Framework\TestCase;

final class GameJsonTest extends TestCase
{
    /**
     * A bare weapon entry (shell's is the rich one in good()). Several tests change one
     * value in shell's entry, so its numbers appear nowhere else.
     */
    private const FX_MIN = "    muzzle:\n      emitters:\n        - { count: 3 }\n    trail:\n      emitters:\n        - { rate: 20 }\n"
        . "    impact:\n      emitters:\n        - { count: 5, unit: r, size: [0.5, 0.5] }\n";

    private string $tmp;
    /** A folder beside $tmp that the symlink test points out of the game folder at. */
    private string $outside;

    /** The game folder the schema checks resolve audio and sprite files against. */
    protected function setUp(): void
    {
        $this->tmp = sys_get_temp_dir() . '/game-json-test-' . getmypid() . '-' . bin2hex(random_bytes(3));
        $this->outside = $this->tmp . '-outside';
        $tmp = $this->tmp;
        @mkdir("$tmp/audio/sfx", 0777, true);
        @mkdir("$tmp/audio/music", 0777, true);
        file_put_contents("$tmp/audio/sfx/boom.mp3", 'x');
        file_put_contents("$tmp/audio/music/a.mp3", 'x');
        file_put_contents("$tmp/audio/notes.txt", 'x');
        @mkdir("$tmp/fx/sprites", 0777, true);
        file_put_contents("$tmp/fx/sprites/fireball.png", 'x');
        file_put_contents("$tmp/fx/sprites/sprites.json", json_encode(['_note' => 'sheets', 'fireball' => ['file' => 'fireball.png'], 'ghost' => ['file' => 'ghost.png']]));
        @mkdir($this->outside);
        file_put_contents($this->outside . '/o.mp3', 'x');
    }

    protected function tearDown(): void
    {
        exec('rm -rf ' . escapeshellarg($this->tmp) . ' ' . escapeshellarg($this->outside));
    }

    /** The message a parse or render throws, or null when it succeeds. */
    private static function errOf(callable $f): ?string
    {
        try {
            $f();
            return null;
        } catch (TankityConfigError $e) {
            return $e->getMessage();
        }
    }

    private static function parse(string $y): mixed
    {
        return tankity_yaml_parse($y);
    }

    private function render(string $y): string
    {
        return tankity_config_render($y, $this->tmp);
    }

    /** The good document: every section of game.yaml, filled in once. */
    private static function good(): string
    {
        $keysYaml = '';
        foreach (TANKITY_KEY_ACTIONS as $ctx => $actions) {
            $keysYaml .= "  $ctx:\n";
            foreach ($actions as $i => $a) {
                $keysYaml .= "    $a: [Tok$ctx$i]\n";
            }
        }
        $fxMin = self::FX_MIN;
        $good = <<<YAML
arsenal:
  ammo:
    - key: shell
      name: Shell
      cat: Shells
      dmg: 34
      radius: 26
      price: 0
      pack: 0
      ai: true
      effect: shot
      speed: 1.0
      note: Free and honest.
      gfx: {shell: "#ffe27a", trail: "#ffd75e", blast: ["#ffb13c", "#fff3c4"], painter: disc, shake: 0.3}
    - key: buck
      name: Buckshot
      cat: Shells
      dmg: 17
      radius: 20
      price: 80
      pack: 2
      ai: true
      effect: pellets
      pellets: 3
      spread: 0.1
      speed: 1.0
      note: Three pellets.
      gfx: {shell: "#FFD166", trail: "#fb3", blast: ["#ffb13c", "#fff3c4"], painter: spark, shake: 0.3}
  gear:
    - key: repair
      name: Repair +40 armor
      cat: Hull and fuel
      price: 120
      n: 40
      effect: repair
      note: Restores armor.
    - key: laststand
      name: Last stand
      cat: Tricks
      price: 125
      n: 1
      effect: laststand
      dmg: 50
      radius: 44
      note: Your wreck detonates.
  fall: {freePx: 10, perPx: 0.5, chuteOver: 5}
drones:
  personalities:
    - {key: saver, name: Saver, reserve: 0.5, defense: 0.1, pick: big, maxBuys: 3}
    - {key: turtle, name: Turtle, reserve: 0.1, defense: 0.6, pick: value, maxBuys: 6}
    - {key: shifty, name: Shifty, shift: 0.35}
keys:
$keysYaml

effects:
  shell:
    body: { halo: 9, alpha: 0.45, pulse: 6 }
    muzzle:
      screen: { shake: 0.12, flash: { color: "#FF7B39", alpha: 0.12, dur: 0.2 } }
      emitters:
        - { count: 4, life: [0.1, 0.22], speed: [90, 200], aim: forward, spread: 35, colors: ["#FFFFFF", "#ffe27a"], alpha: [1, 0.5, 0], glow: true }
    trail:
      emitters:
        - { shape: streak, rate: 31, life: [0.2, 0.4], length: 7 }
    impact:
      emitters:
        - { shape: sprite, count: 1, sheet: fireball, unit: r, size: [1.1, 1.1], life: [0.5, 0.5], scale: 1.2, tint: "#C77DFF" }
        - { shape: ring, count: 1, unit: r, size: [0.25, 0.25], sizeEnd: 4, ease: out, width: 3 }
        - { count: 2, rate: 9, duration: 0.7, delay: 0.1 }
    special:
      steer:
        emitters:
          - { rate: 12, size: [1, 2] }
      arc:
        emitters: []
  buck:
{$fxMin}  laststand:
{$fxMin}
audio:
  sfx:
    boom: {file: audio/sfx/boom.mp3, volume: 0.5}
    click:
  music:
    - file: audio/music/a.mp3
      title: Theme
      volume: 0.7
      credit: Someone, CC0
YAML;
        $good .= "\n";
        return $good;
    }

    /** The good document with one textual replacement. */
    private static function mut(string $from, string $to): string
    {
        $good = self::good();
        if (substr_count($good, $from) < 1) {
            throw new LogicException("fixture lacks: $from");
        }
        return str_replace($from, $to, $good);
    }

    /** The good document with buck's pellets fields swapped for another effect's. */
    private static function asEffect(string $fields): string
    {
        return self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", $fields);
    }

    /** Row $i of a rendered document, or the error it throws (as ['error' => message]). */
    private function rowOf(string $yaml, int $i = 1): array
    {
        try {
            return json_decode($this->render($yaml), true)['arsenal']['ammo'][$i] ?? [];
        } catch (TankityConfigError $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function row1(string $yaml): array
    {
        return $this->rowOf($yaml);
    }

    /** Buckshot turned into a harmless tracer: dmg 0, radius 0 and a mark. */
    private static function tracerOf(string $mark = ', mark: line'): string
    {
        return str_replace(
            ["      dmg: 17\n      radius: 20\n", 'painter: spark, shake: 0.3}'],
            ["      dmg: 0\n      radius: 0\n", "painter: dash, shake: 0.3$mark}"],
            self::asEffect("      effect: tracer\n"),
        );
    }

    private static function napalmOf(string $more = ''): string
    {
        return self::asEffect("      effect: napalm\n      volume: 2200\n      poolMin: 20\n      burn: 3.0\n      tick: 0.5\n      flame: 18\n$more");
    }

    /** scalars, quotes, comments, nesting, sequences, flow collections and the line map */
    public function testParserGoodInput(): void
    {
        self::assertTrue(self::parse("a: 1\nb: -2\nc: 1.5\nd: true\ne: false\nf: null\ng: ~\nh:\ni: hello world\nj: 1e3\nk: 007\n")
            === ['a' => 1, 'b' => -2, 'c' => 1.5, 'd' => true, 'e' => false, 'f' => null, 'g' => null, 'h' => null, 'i' => 'hello world', 'j' => 1000.0, 'k' => '007'], 'scalars' . ' :: ' . json_encode(self::parse("a: 1\nj: 1e3\nk: 007\n")));
        self::assertTrue(self::parse("a: \"x: y # z\"\nb: 'it''s'\nc: \"tab\\there\\u0041\"\nd: \"5\"\n")
            === ['a' => 'x: y # z', 'b' => "it's", 'c' => "tab\thereA", 'd' => '5'], 'quoted');
        self::assertTrue(self::parse("a: Don't stop\nb: it's a 'thing'\n") === ['a' => "Don't stop", 'b' => "it's a 'thing'"], 'apostrophe-in-plain');
        self::assertTrue(self::parse("# top\na: 1 # trailing\n\n   # indented comment\nb: \"#keep\" # and this\nc: x#notcomment\n")
            === ['a' => 1, 'b' => '#keep', 'c' => 'x#notcomment'], 'comments');
        self::assertTrue(self::parse("a:\n  b:\n    c: 1\n  d: 2\ne: 3\n") === ['a' => ['b' => ['c' => 1], 'd' => 2], 'e' => 3], 'nested-mapping');
        self::assertTrue(self::parse("a:\n  - 1\n  - two\n  - \"3\"\n") === ['a' => [1, 'two', '3']], 'block-sequence');
        self::assertTrue(self::parse("a:\n- 1\n- 2\nb: 3\n") === ['a' => [1, 2], 'b' => 3], 'sequence-at-key-indent');
        self::assertTrue(self::parse("rows:\n  - key: a\n    n: 1\n  - key: b\n    inner:\n      x: y\n    n: 2\n")
            === ['rows' => [['key' => 'a', 'n' => 1], ['key' => 'b', 'inner' => ['x' => 'y'], 'n' => 2]]], 'sequence-of-mappings');
        self::assertTrue(self::parse("rows:\n  -\n    k: v\n  - w\n") === ['rows' => [['k' => 'v'], 'w']], 'sequence-item-with-nested-block');
        self::assertTrue(self::parse("a: [x, 2, \"c, d\", [1, 2], {k: v}]\nb: []\nc: [a, b,]\n")
            === ['a' => ['x', 2, 'c, d', [1, 2], ['k' => 'v']], 'b' => [], 'c' => ['a', 'b']], 'flow-sequence');
        self::assertTrue(self::parse("a: {shell: \"#ffe27a\", n: 1, blast: [\"#fff\", \"#000\"], z: }\n")
            === ['a' => ['shell' => '#ffe27a', 'n' => 1, 'blast' => ['#fff', '#000'], 'z' => null]], 'flow-mapping');
        self::assertTrue(self::parse("- {a: 1}\n- [1, 2]\n") === [['a' => 1], [1, 2]], 'flow-in-sequence-item');
        self::assertTrue(self::parse("\"a b\": 1\n'c': 2\n") === ['a b' => 1, 'c' => 2], 'quoted-key');
        self::assertTrue(self::parse("a: 1\r\nb:\r\n  - 2\r\n") === ['a' => 1, 'b' => [2]], 'crlf');
        self::assertTrue(self::parse("# nothing\n\n") === null, 'empty-document');
        $lm = [];
        tankity_yaml_parse("a:\n  b: 1\n  rows:\n    - x: 1\n      y: 2\n    - x: 3\n", $lm);
        self::assertTrue(($lm['a'] ?? 0) === 1 && ($lm['a.b'] ?? 0) === 2 && ($lm['a.rows[0]'] ?? 0) === 4
            && ($lm['a.rows[0].y'] ?? 0) === 5 && ($lm['a.rows[1].x'] ?? 0) === 6, 'line-map' . ' :: ' . json_encode($lm));
    }

    /** each parse error names its line */
    public function testParserBadInput(): void
    {
        $bad = [
            'tab' => ["a: 1\n\tb: 2\n", 'line 2: tabs'],
            'duplicate-key' => ["a: 1\nb: 2\na: 3\n", 'line 3: duplicate key `a`'],
            'duplicate-flow-key' => ["a: {x: 1, x: 2}\n", 'line 1: duplicate key `x`'],
            'unclosed-flow-seq' => ["ok: 1\na: [1, 2\n", 'line 2:'],
            'unclosed-flow-map' => ["a: {x: 1\n", 'line 1:'],
            'unterminated-quote' => ["a: 1\nb: \"oops\n", 'line 2: unterminated'],
            'anchor' => ["a: &x 1\n", 'line 1:'],
            'alias' => ["a: *x\n", 'line 1:'],
            'tag' => ["a: !!str 1\n", 'line 1:'],
            'block-scalar' => ["a: |\n  text\n", 'line 1:'],
            'folded-scalar' => ["a: >\n  text\n", 'line 1:'],
            'bad-indent' => ["a:\n    b: 1\n  c: 2\n", 'line 3: unexpected indentation'],
            'deeper-after-scalar' => ["a: 1\n  b: 2\n", 'line 2: unexpected indentation'],
            'no-colon' => ["a: 1\njust text\n", 'line 2: expected `key: value`'],
            'doc-marker' => ["---\na: 1\n", 'line 1: document markers'],
            'seq-in-seq' => ["- - a\n", 'line 1:'],
            'list-where-key' => ["a: 1\n- b\n", 'line 2:'],
            'trailing-junk' => ["a: [1] x\n", 'line 1: unexpected text'],
            'bad-escape' => ["a: \"\\q\"\n", 'line 1: unknown escape'],
            'missing-flow-colon' => ["a: {x 1}\n", 'line 1:'],
        ];
        foreach ($bad as $name => [$yaml, $want]) {
            $e = self::errOf(fn() => self::parse($yaml));
            self::assertTrue($e !== null && str_contains($e, $want), "bad-$name" . ' :: ' . (string) $e);
        }
    }

    /** the good document renders, with its shape, lowercased colours and optional flags */
    public function testGoodDocumentRenders(): void
    {
        $good = self::good();
        $out = null;
        $e = self::errOf(function () use ($good, &$out) {
            $out = json_decode($this->render($good), true);
        });
        self::assertTrue($e === null && is_array($out), 'good-renders' . ' :: ' . (string) $e);
        self::assertTrue(isset($out['arsenal']['ammo'][1]['pellets'], $out['keys']['aim']['barrelLeft'], $out['audio']['music'][0]['title'])
            && $out['audio']['sfx']['boom'] === ['file' => 'audio/sfx/boom.mp3', 'volume' => 0.5]
            && !isset($out['audio']['sfx']['click']), 'good-shape');
        self::assertTrue(($out['arsenal']['ammo'][1]['gfx']['shell'] ?? '') === '#ffd166', 'colours-lowercased');
        self::assertTrue(!isset($out['arsenal']['ammo'][0]['shortRange']) && !isset($out['arsenal']['ammo'][0]['preview']), 'optional-fields-left-out');
    }

    /** roller, hop, scatter, beam, plasma and tracer weapons validate and their fields are required */
    public function testWeaponEffectsValidate(): void
    {
        $roller = json_decode($this->render(self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", "      effect: roller\n      friction: 0.5\n      rollTime: 6\n")
            . ''), true);
        self::assertTrue(($roller['arsenal']['ammo'][1]['effect'] ?? '') === 'roller'
            && ($roller['arsenal']['ammo'][1]['friction'] ?? null) === 0.5 && ($roller['arsenal']['ammo'][1]['rollTime'] ?? null) === 6
            && !isset($roller['arsenal']['ammo'][1]['pellets']), 'roller-effect-validates' . ' :: ' . json_encode($roller['arsenal']['ammo'][1] ?? null));
        $zero = $this->rowOf(self::mut("      dmg: 34\n", "      dmg: 0\n"), 0);
        self::assertTrue(($zero['dmg'] ?? null) === 0, 'dmg-zero-is-harmless-and-valid' . ' :: ' . json_encode($zero));
        $hop = $this->row1(self::asEffect("      effect: hop\n      hops: 3\n      hopKeep: 0.55\n      subDmg: 34\n      subRadius: 22\n"));
        self::assertTrue(($hop['effect'] ?? '') === 'hop' && $hop['hops'] === 3 && $hop['hopKeep'] === 0.55
            && $hop['subDmg'] === 34 && $hop['subRadius'] === 22 && !isset($hop['pellets']), 'hop-effect-validates' . ' :: ' . json_encode($hop));
        $scatter = $this->row1(self::asEffect("      effect: scatter\n      split: 8\n      fan: 2.4\n      kick: 150\n      subDmg: 24\n      subRadius: 18\n"));
        self::assertTrue(($scatter['effect'] ?? '') === 'scatter' && $scatter['split'] === 8 && $scatter['fan'] === 2.4
            && $scatter['kick'] === 150 && $scatter['subDmg'] === 24 && $scatter['subRadius'] === 18, 'scatter-effect-validates' . ' :: ' . json_encode($scatter));
        foreach (['split', 'fan', 'kick', 'subDmg', 'subRadius'] as $k) {
            $yaml = preg_replace("/      $k: [0-9.]+\n/", '', self::asEffect("      effect: scatter\n      split: 8\n      fan: 2.4\n      kick: 150\n      subDmg: 24\n      subRadius: 18\n"));
            $e = (string) self::errOf(fn() => $this->render($yaml));
            self::assertTrue(str_contains($e, "arsenal.ammo[1].$k: is required when effect is scatter"), "scatter-needs-$k" . ' :: ' . $e);
        }
        $beam = $this->row1(self::asEffect("      effect: beam\n      range: 520\n"));
        self::assertTrue(($beam['effect'] ?? '') === 'beam' && ($beam['range'] ?? null) === 520 && !isset($beam['pellets']), 'beam-effect-validates' . ' :: ' . json_encode($beam));
        $dip = $this->row1(self::asEffect("      effect: beam\n      range: 520\n      aimMin: -20\n"));
        self::assertTrue(($dip['aimMin'] ?? null) === -20, 'beam-aimmin-validates' . ' :: ' . json_encode($dip));
        $plasma = $this->row1(self::asEffect("      effect: plasma\n"));
        self::assertTrue(($plasma['effect'] ?? '') === 'plasma' && !isset($plasma['error']), 'plasma-takes-no-extra-fields' . ' :: ' . json_encode($plasma));
        $tracer = $this->row1(self::tracerOf());
        self::assertTrue(($tracer['effect'] ?? '') === 'tracer' && ($tracer['dmg'] ?? null) === 0 && ($tracer['radius'] ?? null) === 0
            && ($tracer['gfx']['mark'] ?? '') === 'line' && ($tracer['gfx']['painter'] ?? '') === 'dash', 'tracer-validates-harmless-with-radius-0' . ' :: ' . json_encode($tracer));
        self::assertTrue(($this->row1(self::tracerOf(', mark: smoke'))['gfx']['mark'] ?? '') === 'smoke', 'smoke-mark-validates');
    }

    /** each earth gun's own fields validate */
    public function testEarthGunsValidate(): void
    {
        // The earth guns: each effect's own fields, each refused elsewhere.
        $dirt = $this->row1(self::asEffect("      effect: dirt\n"));
        self::assertTrue(($dirt['effect'] ?? '') === 'dirt' && !isset($dirt['error']), 'dirt-takes-no-extra-fields' . ' :: ' . json_encode($dirt));
        $pour = $this->row1(self::asEffect("      effect: pour\n      volume: 4000\n      poolMin: 20\n"));
        self::assertTrue(($pour['volume'] ?? null) === 4000 && ($pour['poolMin'] ?? null) === 20, 'pour-validates' . ' :: ' . json_encode($pour));
        $dig = $this->row1(self::asEffect("      effect: dig\n      digLen: 110\n      digR: 11\n      warheads: 0\n"));
        self::assertTrue(($dig['digLen'] ?? null) === 110 && $dig['digR'] === 11 && $dig['warheads'] === 0 && !isset($dig['subDmg']), 'dig-validates' . ' :: ' . json_encode($dig));
        $hog = $this->row1(self::asEffect("      effect: dig\n      digLen: 120\n      digR: 9\n      warheads: 3\n      subDmg: 34\n      subRadius: 22\n"));
        self::assertTrue(($hog['warheads'] ?? null) === 3 && $hog['subDmg'] === 34 && $hog['subRadius'] === 22, 'dig-with-warheads-validates' . ' :: ' . json_encode($hog));
        $riot = $this->row1(self::asEffect("      effect: riot\n      fan: 1.2\n"));
        self::assertTrue(($riot['fan'] ?? null) === 1.2, 'riot-validates' . ' :: ' . json_encode($riot));
        $slump = $this->row1(self::asEffect("      effect: slump\n      slope: 1.0\n      passes: 24\n"));
        self::assertTrue(($slump['slope'] ?? null) === 1.0 && $slump['passes'] === 24, 'slump-validates' . ' :: ' . json_encode($slump));
    }

    /** napalm validates and the flame painters are accepted */
    public function testFireGunsValidate(): void
    {
        // The fire guns: a pool of burning liquid, its own fields refused elsewhere.
        $napalm = $this->row1(self::napalmOf());
        self::assertTrue(($napalm['volume'] ?? null) === 2200 && ($napalm['poolMin'] ?? null) === 20 && $napalm['burn'] === 3.0 && $napalm['tick'] === 0.5 && $napalm['flame'] === 18
            && !isset($napalm['error']), 'napalm-validates' . ' :: ' . json_encode($napalm));
        foreach (['drill', 'clod', 'flame'] as $painter) {
            self::assertTrue((json_decode($this->render(self::mut('painter: spark', "painter: $painter")), true)['arsenal']['ammo'][1]['gfx']['painter'] ?? '') === $painter, "$painter-painter-validates");
        }
    }

    /** apex clusters and the optional linger, start and ball fields */
    public function testClusterAndOptionalFields(): void
    {
        $apex = $this->row1(self::asEffect("      effect: cluster\n      apex: true\n      split: 9\n      fan: 0.16\n      subDmg: 60\n      subRadius: 40\n"));
        self::assertTrue(($apex['apex'] ?? null) === true && !isset($apex['fuse']) && $apex['split'] === 9, 'apex-cluster-needs-no-fuse' . ' :: ' . json_encode($apex));
        $look = $this->rowOf(self::mut('painter: disc, shake: 0.3}', 'painter: disc, shake: 0.3, linger: 0.8}'), 0);
        self::assertTrue(($look['gfx']['linger'] ?? null) === 0.8, 'gfx-linger-validates' . ' :: ' . json_encode($look['gfx'] ?? $look));
        $start = $this->row1(self::mut("      pack: 2\n", "      pack: 2\n      start: 1\n"));
        self::assertTrue(($start['start'] ?? null) === 1, 'start-validates' . ' :: ' . json_encode($start));
        self::assertTrue((json_decode($this->render(self::mut('painter: spark', 'painter: ball')), true)['arsenal']['ammo'][1]['gfx']['painter'] ?? '') === 'ball', 'ball-painter-validates');
    }

    /** an ammo row's weapon line and firing-range scenario, and a cat's rows sitting together */
    public function testLineAndPreview(): void
    {
        $row = $this->row1(self::mut("      note: Three pellets.\n", "      line: trick\n      preview: {aim: -40, ground: slope, angle: 70, dummy: 200}\n      note: Three pellets.\n"));
        self::assertSame('trick', $row['line'] ?? null, 'line-validates :: ' . json_encode($row));
        self::assertSame(['aim' => -40, 'ground' => 'slope', 'angle' => 70, 'dummy' => 200], $row['preview'] ?? null, 'preview-validates :: ' . json_encode($row));
        self::assertSame(array_search('cat', array_keys($row), true) + 1, array_search('line', array_keys($row), true), 'line-follows-cat');
        foreach (['hills', 'dip', 'bowl', 'ridge', 'slope', 'perch', 'buried'] as $g) {
            $ok = $this->row1(self::mut("      note: Three pellets.\n", "      preview: {ground: $g}\n      note: Three pellets.\n"));
            self::assertSame($g, $ok['preview']['ground'] ?? null, "ground-$g :: " . json_encode($ok));
        }
        $bad = [
            'line-pattern' => ["      line: Trick Shots\n", 'arsenal.ammo[1].line'],
            'preview-unknown' => ["      preview: {aim: 10, spin: 2}\n", 'arsenal.ammo[1].preview.spin: unknown key'],
            'preview-empty' => ["      preview: {}\n", 'arsenal.ammo[1].preview: needs at least one of aim, ground, angle or dummy'],
            'preview-aim' => ["      preview: {aim: 300}\n", 'arsenal.ammo[1].preview.aim: must be a whole number from -200 to 200'],
            'preview-angle' => ["      preview: {angle: 90}\n", 'arsenal.ammo[1].preview.angle: must be a whole number from 5 to 85'],
            'preview-dummy' => ["      preview: {dummy: 20}\n", 'arsenal.ammo[1].preview.dummy: must be a whole number from 40 to 300'],
            'preview-ground' => ["      preview: {ground: moon}\n", 'arsenal.ammo[1].preview.ground'],
        ];
        foreach ($bad as $name => [$add, $want]) {
            $e = (string) self::errOf(fn () => $this->render(self::mut("      note: Three pellets.\n", $add . "      note: Three pellets.\n")));
            self::assertStringContainsString($want, $e, $name);
        }
        $short = $this->row1(self::mut("      note: Three pellets.\n", "      shortRange: true\n      note: Three pellets.\n"));
        self::assertTrue(($short['shortRange'] ?? null) === true, 'shortrange-validates :: ' . json_encode($short));
        $e = (string) self::errOf(fn () => $this->render(self::mut("      note: Three pellets.\n", "      flat: true\n      note: Three pellets.\n")));
        self::assertStringContainsString('arsenal.ammo[1].flat: unknown key', $e, 'flat-is-gone');
        // Retired guns: listed with their old price and pack, their keys reserved.
        $retire = fn (string $rows) => self::mut("  fall: {", "  retired:\n$rows  fall: {");
        $out = json_decode($this->render($retire("    - {key: rail, name: Rail, price: 140, pack: 2}\n")), true);
        self::assertSame([['key' => 'rail', 'name' => 'Rail', 'price' => 140, 'pack' => 2]], $out['arsenal']['retired'], 'retired-validates');
        self::assertSame([], json_decode($this->render(self::good()), true)['arsenal']['retired'], 'retired-defaults-empty');
        self::assertStringContainsString('arsenal.retired[0].key: `buck` is retired', (string) self::errOf(fn () => $this->render($retire("    - {key: buck, name: Buck, price: 80, pack: 2}\n"))), 'retired-key-clash');
        self::assertStringContainsString('arsenal.retired[0].pack', (string) self::errOf(fn () => $this->render($retire("    - {key: rail, name: Rail, price: 140, pack: 0}\n"))), 'retired-pack');
        // A third row back under Shells after buck moved to another cat: the Shells rows are apart.
        $third = "    - key: mortar\n      name: Mortar\n      cat: Shells\n      dmg: 56\n      radius: 42\n      price: 200\n      pack: 2\n"
            . "      ai: true\n      effect: shot\n      speed: 1.0\n      note: Big.\n      gfx: {shell: \"#ff9f43\", trail: \"#ff7b39\", blast: [\"#ff7b39\", \"#ffe27a\"], painter: disc, shake: 0.5}\n";
        $apart = str_replace(["      cat: Shells\n      dmg: 17\n", "  gear:\n"], ["      cat: Odd\n      dmg: 17\n", $third . "  gear:\n"], self::good());
        self::assertStringContainsString('arsenal.ammo[2].cat: `Shells` rows must sit together', (string) self::errOf(fn () => $this->render($apart)), 'cat-rows-together');
    }

    /** audio volume defaults, rendering is deterministic, empty audio is fine */
    public function testAudioDefaultsAndDeterminism(): void
    {
        $good = self::good();
        $out = json_decode($this->render($good), true);
        self::assertTrue(($out['audio']['music'][0]['volume'] ?? 0) === 0.7
            && (json_decode($this->render(self::mut("      volume: 0.7\n", '')), true)['audio']['music'][0]['volume'] ?? 0) === 1.0, 'volume-defaults-to-1');
        self::assertTrue($this->render($good) === $this->render($good) && str_ends_with($this->render($good), "}\n"), 'deterministic');
        self::assertTrue(($d = json_decode($this->render(preg_replace('/audio:.*/s', "audio:\n  sfx:\n  music:\n", $good)), true)) !== null
            && $d['audio']['music'] === [], 'empty-audio-ok');
    }

    /** the effects block is kept as written, with colours lowercased and no defaults added */
    public function testEffectsBlock(): void
    {
        $good = self::good();
        $out = json_decode($this->render($good), true);
        $fx = $out['effects'] ?? [];
        self::assertTrue(array_keys($fx) === ['shell', 'buck', 'laststand']
            && $fx['shell']['body'] === ['halo' => 9, 'alpha' => 0.45, 'pulse' => 6]
            && array_keys($fx['shell']['impact']['emitters'][0]) === ['shape', 'count', 'sheet', 'unit', 'size', 'life', 'scale', 'tint']
            && $fx['shell']['trail']['emitters'][0] === ['shape' => 'streak', 'rate' => 31, 'life' => [0.2, 0.4], 'length' => 7]
            && $fx['shell']['impact']['emitters'][1]['sizeEnd'] === 4 && $fx['shell']['special']['arc'] === ['emitters' => []], 'effects-kept-as-written' . ' :: ' . json_encode($fx['shell'] ?? null));
        self::assertTrue($fx['shell']['muzzle']['emitters'][0]['colors'] === ['#ffffff', '#ffe27a']
            && $fx['shell']['muzzle']['screen']['flash']['color'] === '#ff7b39' && $fx['shell']['impact']['emitters'][0]['tint'] === '#c77dff', 'effects-colours-lowercased');
        self::assertTrue(!isset($fx['buck']['muzzle']['emitters'][0]['shape'], $fx['buck']['muzzle']['emitters'][0]['life']), 'effects-defaults-not-added');
        self::assertTrue(str_contains($this->render(preg_replace('/audio:.*/s', "audio:\n  sfx:\n  music: []\n", $good)), '"sfx": {}'), 'empty-sfx-is-object');
    }

    /** each schema mistake is refused with a named error and its line */
    public function testSchemaErrors(): void
    {
        $good = self::good();
        $cases = [
            // name => [yaml, substring that must appear in the error]
            'unknown-top-key' => [$good . "\nextra: 1\n", 'unknown key'],
            'missing-section' => [preg_replace('/\naudio:.*/s', "\n", $good), 'section `audio` is required'],
            'unknown-ammo-field' => [self::mut("      dmg: 34\n", "      dmg: 34\n      dmgg: 3\n"), 'arsenal.ammo[0].dmgg: unknown key'],
            'missing-required' => [self::mut("      radius: 26\n", ''), 'arsenal.ammo[0].radius: is required'],
            'dmg-range' => [self::mut("      dmg: 34\n", "      dmg: 9000\n"), 'arsenal.ammo[0].dmg: must be a whole number from 0 to 500'],
            'dmg-below-zero' => [self::mut("      dmg: 34\n", "      dmg: -1\n"), 'arsenal.ammo[0].dmg: must be a whole number from 0 to 500'],
            'dmg-above-500' => [self::mut("      dmg: 34\n", "      dmg: 501\n"), 'arsenal.ammo[0].dmg: must be a whole number from 0 to 500'],
            'hop-needs-hops' => [self::asEffect("      effect: hop\n      hopKeep: 0.5\n      subDmg: 30\n      subRadius: 20\n"), 'arsenal.ammo[1].hops: is required when effect is hop'],
            'hop-needs-hopkeep' => [self::asEffect("      effect: hop\n      hops: 3\n      subDmg: 30\n      subRadius: 20\n"), 'arsenal.ammo[1].hopKeep: is required when effect is hop'],
            'hop-needs-subdmg' => [self::asEffect("      effect: hop\n      hops: 3\n      hopKeep: 0.5\n      subRadius: 20\n"), 'arsenal.ammo[1].subDmg: is required when effect is hop'],
            'hops-range' => [self::asEffect("      effect: hop\n      hops: 7\n      hopKeep: 0.5\n      subDmg: 30\n      subRadius: 20\n"), 'arsenal.ammo[1].hops: must be a whole number from 2 to 6'],
            'hopkeep-range' => [self::asEffect("      effect: hop\n      hops: 3\n      hopKeep: 0.95\n      subDmg: 30\n      subRadius: 20\n"), 'arsenal.ammo[1].hopKeep: must be a number from 0.2 to 0.9'],
            'scatter-fan-range' => [self::asEffect("      effect: scatter\n      split: 8\n      fan: 3.5\n      kick: 150\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fan: must be a number from 0.2 to 3'],
            'scatter-kick-range' => [self::asEffect("      effect: scatter\n      split: 8\n      fan: 2.4\n      kick: 500\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].kick: must be a number from 40 to 400'],
            'cluster-fan-range' => [self::asEffect("      effect: cluster\n      fuse: 0.9\n      split: 4\n      fan: 2.4\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fan: must be a number from 0.05 to 1'],
            'cluster-fan-zero' => [self::asEffect("      effect: cluster\n      fuse: 0.9\n      split: 4\n      fan: 0\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fan: must be a number from 0.05 to 1'],
            'seeker-steer-zero' => [self::asEffect("      effect: seeker\n      steer: 0\n"), 'arsenal.ammo[1].steer: must be a number from 1 to 500'],
            'cluster-needs-fuse' => [self::asEffect("      effect: cluster\n      split: 4\n      fan: 0.2\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fuse: is required when effect is cluster'],
            'cluster-apex-false-needs-fuse' => [self::asEffect("      effect: cluster\n      apex: false\n      split: 4\n      fan: 0.2\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fuse: is required when effect is cluster'],
            'apex-refuses-fuse' => [self::asEffect("      effect: cluster\n      apex: true\n      fuse: 0.9\n      split: 4\n      fan: 0.2\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].fuse: an apex cluster splits at the top of its arc'],
            'apex-not-bool' => [self::asEffect("      effect: cluster\n      apex: yes\n      split: 4\n      fan: 0.2\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].apex: must be true or false'],
            'apex-on-a-shot' => [self::asEffect("      effect: shot\n      apex: true\n"), 'arsenal.ammo[1].apex: only the cluster effect uses this'],
            'hops-on-a-shot' => [self::asEffect("      effect: shot\n      hops: 3\n"), 'arsenal.ammo[1].hops: only the hop effect uses this'],
            'kick-on-a-cluster' => [self::asEffect("      effect: cluster\n      fuse: 0.9\n      split: 4\n      fan: 0.2\n      kick: 100\n      subDmg: 24\n      subRadius: 18\n"), 'arsenal.ammo[1].kick: only the scatter effect uses this'],
            'subdmg-on-a-shot' => [self::asEffect("      effect: shot\n      subDmg: 3\n"), 'arsenal.ammo[1].subDmg: only the cluster, hop, scatter and dig effects use this'],
            'beam-needs-range' => [self::asEffect("      effect: beam\n"), 'arsenal.ammo[1].range: is required when effect is beam'],
            'beam-range-low' => [self::asEffect("      effect: beam\n      range: 40\n"), 'arsenal.ammo[1].range: must be a whole number from 60 to 1200'],
            'beam-range-high' => [self::asEffect("      effect: beam\n      range: 1300\n"), 'arsenal.ammo[1].range: must be a whole number from 60 to 1200'],
            'range-on-a-shot' => [self::asEffect("      effect: shot\n      range: 300\n"), 'arsenal.ammo[1].range: only the beam effect uses this'],
            'aimmin-on-a-shot' => [self::asEffect("      effect: shot\n      aimMin: -10\n"), 'arsenal.ammo[1].aimMin: only the beam effect uses this'],
            'aimmin-range' => [self::asEffect("      effect: beam\n      range: 520\n      aimMin: -40\n"), 'arsenal.ammo[1].aimMin: must be a whole number from -30 to 10'],
            'range-on-a-plasma' => [self::asEffect("      effect: plasma\n      range: 300\n"), 'arsenal.ammo[1].range: only the beam effect uses this'],
            'pour-needs-volume' => [self::asEffect("      effect: pour\n      poolMin: 20\n"), 'arsenal.ammo[1].volume: is required when effect is pour'],
            'pour-needs-poolmin' => [self::asEffect("      effect: pour\n      volume: 4000\n"), 'arsenal.ammo[1].poolMin: is required when effect is pour'],
            'napalm-needs-poolmin' => [str_replace("      poolMin: 20\n", '', self::napalmOf()), 'arsenal.ammo[1].poolMin: is required when effect is napalm'],
            'poolmin-range' => [str_replace('poolMin: 20', 'poolMin: 61', self::napalmOf()), 'arsenal.ammo[1].poolMin: must be a whole number from 1 to 60'],
            'poolmin-on-a-dirt' => [self::asEffect("      effect: dirt\n      poolMin: 20\n"), 'arsenal.ammo[1].poolMin: only the pour and napalm effects use this'],
            'pour-volume-range' => [self::asEffect("      effect: pour\n      volume: 100\n      poolMin: 20\n"), 'arsenal.ammo[1].volume: must be a whole number from 200 to 20000'],
            'volume-on-a-dirt' => [self::asEffect("      effect: dirt\n      volume: 4000\n"), 'arsenal.ammo[1].volume: only the pour and napalm effects use this'],
            'napalm-needs-volume' => [str_replace("      volume: 2200\n", '', self::napalmOf()), 'arsenal.ammo[1].volume: is required when effect is napalm'],
            'napalm-needs-burn' => [str_replace("      burn: 3.0\n", '', self::napalmOf()), 'arsenal.ammo[1].burn: is required when effect is napalm'],
            'napalm-needs-tick' => [str_replace("      tick: 0.5\n", '', self::napalmOf()), 'arsenal.ammo[1].tick: is required when effect is napalm'],
            'napalm-needs-flame' => [str_replace("      flame: 18\n", '', self::napalmOf()), 'arsenal.ammo[1].flame: is required when effect is napalm'],
            'burn-range' => [str_replace('burn: 3.0', 'burn: 11', self::napalmOf()), 'arsenal.ammo[1].burn: must be a number from 0.5 to 10'],
            'tick-range' => [str_replace('tick: 0.5', 'tick: 0.05', self::napalmOf()), 'arsenal.ammo[1].tick: must be a number from 0.1 to 2'],
            'flame-range' => [str_replace('flame: 18', 'flame: 61', self::napalmOf()), 'arsenal.ammo[1].flame: must be a whole number from 4 to 60'],
            'napalm-tick-past-its-burn' => [str_replace('burn: 3.0', 'burn: 0.5', str_replace('tick: 0.5', 'tick: 1.0', self::napalmOf())), 'arsenal.ammo[1].tick: must not be longer than burn (the pool would never burn)'],
            'napalm-needs-damage' => [str_replace("      dmg: 17\n", "      dmg: 0\n", self::napalmOf()), 'arsenal.ammo[1].dmg: napalm burns for dmg each tick; must be 1 or more'],
            'burn-on-a-pour' => [self::asEffect("      effect: pour\n      volume: 4000\n      poolMin: 20\n      burn: 3.0\n"), 'arsenal.ammo[1].burn: only the napalm effect uses this'],
            'flame-on-a-shot' => [self::asEffect("      effect: shot\n      flame: 18\n"), 'arsenal.ammo[1].flame: only the napalm effect uses this'],
            'dig-needs-diglen' => [self::asEffect("      effect: dig\n      digR: 8\n      warheads: 0\n"), 'arsenal.ammo[1].digLen: is required when effect is dig'],
            'dig-needs-digr' => [self::asEffect("      effect: dig\n      digLen: 60\n      warheads: 0\n"), 'arsenal.ammo[1].digR: is required when effect is dig'],
            'dig-needs-warheads' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 8\n"), 'arsenal.ammo[1].warheads: is required when effect is dig'],
            'diglen-range' => [self::asEffect("      effect: dig\n      digLen: 500\n      digR: 8\n      warheads: 0\n"), 'arsenal.ammo[1].digLen: must be a whole number from 20 to 400'],
            'digr-range' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 2\n      warheads: 0\n"), 'arsenal.ammo[1].digR: must be a whole number from 3 to 30'],
            'warheads-range' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 8\n      warheads: 9\n      subDmg: 30\n      subRadius: 20\n"), 'arsenal.ammo[1].warheads: must be a whole number from 0 to 8'],
            'dig-warheads-need-subdmg' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 8\n      warheads: 2\n      subRadius: 20\n"), 'arsenal.ammo[1].subDmg: is required when a dig has warheads'],
            'dig-warheads-need-subradius' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 8\n      warheads: 2\n      subDmg: 20\n"), 'arsenal.ammo[1].subRadius: is required when a dig has warheads'],
            'dig-no-warheads-refuses-subdmg' => [self::asEffect("      effect: dig\n      digLen: 60\n      digR: 8\n      warheads: 0\n      subDmg: 20\n      subRadius: 20\n"), 'arsenal.ammo[1].subDmg: only a dig with warheads uses this'],
            'riot-needs-fan' => [self::asEffect("      effect: riot\n"), 'arsenal.ammo[1].fan: is required when effect is riot'],
            'riot-fan-range' => [self::asEffect("      effect: riot\n      fan: 2\n"), 'arsenal.ammo[1].fan: must be a number from 0.1 to 1.5'],
            'slump-needs-slope' => [self::asEffect("      effect: slump\n      passes: 24\n"), 'arsenal.ammo[1].slope: is required when effect is slump'],
            'slump-needs-passes' => [self::asEffect("      effect: slump\n      slope: 1.0\n"), 'arsenal.ammo[1].passes: is required when effect is slump'],
            'slope-range' => [self::asEffect("      effect: slump\n      slope: 9\n      passes: 24\n"), 'arsenal.ammo[1].slope: must be a number from 0.5 to 6'],
            'passes-range' => [self::asEffect("      effect: slump\n      slope: 1.0\n      passes: 61\n"), 'arsenal.ammo[1].passes: must be a whole number from 1 to 60'],
            'diglen-on-a-shot' => [self::asEffect("      effect: shot\n      digLen: 60\n"), 'arsenal.ammo[1].digLen: only the dig effect uses this'],
            'passes-on-a-pour' => [self::asEffect("      effect: pour\n      volume: 4000\n      poolMin: 20\n      passes: 3\n"), 'arsenal.ammo[1].passes: only the slump effect uses this'],
            'tracer-needs-dmg-0' => [str_replace("      dmg: 0\n", "      dmg: 5\n", self::tracerOf()), 'arsenal.ammo[1].dmg: a tracer does no damage; must be 0'],
            'radius-0-only-on-a-tracer' => [self::mut("      radius: 26\n", "      radius: 0\n"), 'arsenal.ammo[0].radius: must be a whole number from 1 to 200'],
            'tracer-needs-a-mark' => [self::tracerOf(''), 'arsenal.ammo[1].gfx.mark: is required when effect is tracer'],
            'bad-mark' => [self::tracerOf(', mark: glow'), 'arsenal.ammo[1].gfx.mark: must be one of: line, smoke'],
            'mark-on-a-shot' => [self::mut('painter: disc, shake: 0.3}', 'painter: disc, shake: 0.3, mark: line}'), 'arsenal.ammo[0].gfx.mark: only the tracer effect uses this'],
            'pellets-on-a-roller' => [self::asEffect("      effect: roller\n      friction: 0.5\n      rollTime: 6\n      pellets: 3\n"), 'arsenal.ammo[1].pellets: only the pellets effect uses this'],
            'airound-is-gone' => [self::mut("      pack: 2\n", "      pack: 2\n      aiRound: 2\n"), 'arsenal.ammo[1].aiRound: unknown key'],
            'airack-is-gone' => [self::mut("      pack: 2\n", "      pack: 2\n      aiRack: 1\n"), 'arsenal.ammo[1].aiRack: unknown key'],
            'fall-airound-is-gone' => [self::mut('chuteOver: 5}', 'chuteOver: 5, aiRound: 3}'), 'arsenal.fall.aiRound: unknown key'],
            'drones-missing' => [self::mut("drones:\n  personalities:\n    - {key: saver, name: Saver, reserve: 0.5, defense: 0.1, pick: big, maxBuys: 3}\n    - {key: turtle, name: Turtle, reserve: 0.1, defense: 0.6, pick: value, maxBuys: 6}\n    - {key: shifty, name: Shifty, shift: 0.35}\n", ''), 'section `drones` is required'],
            'drones-unknown-field' => [self::mut('maxBuys: 3}', 'maxBuys: 3, greed: 9}'), 'drones.personalities[0].greed: unknown key'],
            'drone-reserve-high' => [self::mut('reserve: 0.5', 'reserve: 0.95'), 'drones.personalities[0].reserve: must be a number from 0 to 0.9'],
            'drone-reserve-low' => [self::mut('reserve: 0.5', 'reserve: -0.1'), 'drones.personalities[0].reserve: must be a number from 0 to 0.9'],
            'drone-defense-high' => [self::mut('defense: 0.1', 'defense: 1.5'), 'drones.personalities[0].defense: must be a number from 0 to 1'],
            'drone-bad-pick' => [self::mut('pick: big', 'pick: lucky'), 'drones.personalities[0].pick: must be one of: big, value, random, precise'],
            'drone-maxbuys-low' => [self::mut('maxBuys: 3', 'maxBuys: 0'), 'drones.personalities[0].maxBuys: must be a whole number from 1 to 12'],
            'drone-maxbuys-high' => [self::mut('maxBuys: 3', 'maxBuys: 13'), 'drones.personalities[0].maxBuys: must be a whole number from 1 to 12'],
            'drone-missing-rules' => [self::mut(', pick: big', ''), 'drones.personalities[0].pick: is required'],
            'drone-duplicate-key' => [self::mut('key: turtle', 'key: saver'), 'drones.personalities[1].key: duplicate key `saver`'],
            'drone-bad-key' => [self::mut('key: saver', 'key: Saver-1'), 'drones.personalities[0].key: has the wrong format'],
            'drone-shift-range' => [self::mut('shift: 0.35', 'shift: 1.5'), 'drones.personalities[2].shift: must be a number from 0 to 1'],
            'drone-shift-has-no-rules' => [self::mut('name: Shifty, shift: 0.35', 'name: Shifty, shift: 0.35, reserve: 0.2'), 'drones.personalities[2].reserve: a row with shift takes other personalities'],
            'drone-needs-a-ruled-one' => [self::mut("    - {key: saver, name: Saver, reserve: 0.5, defense: 0.1, pick: big, maxBuys: 3}\n    - {key: turtle, name: Turtle, reserve: 0.1, defense: 0.6, pick: value, maxBuys: 6}\n", ''), 'drones.personalities: needs at least one personality with rules of its own'],
            'linger-range' => [self::mut('painter: disc, shake: 0.3}', 'painter: disc, shake: 0.3, linger: 9}'), 'arsenal.ammo[0].gfx.linger: must be a number from 0.1 to 3'],
            'size-is-the-body' => [self::mut('painter: disc, shake: 0.3}', 'painter: disc, shake: 0.3, size: 4}'), 'arsenal.ammo[0].gfx.size: unknown key'],
            'start-range' => [self::mut("      pack: 2\n", "      pack: 2\n      start: 10\n"), 'arsenal.ammo[1].start: must be a whole number from 0 to 9'],
            'dmg-float' => [self::mut("      dmg: 34\n", "      dmg: 34.5\n"), 'arsenal.ammo[0].dmg'],
            'dmg-string' => [self::mut("      dmg: 34\n", "      dmg: lots\n"), 'arsenal.ammo[0].dmg'],
            'bad-effect' => [self::mut('effect: shot', 'effect: laser'), 'arsenal.ammo[0].effect: must be one of'],
            'bad-gear-effect' => [self::mut('effect: repair', 'effect: heal'), 'arsenal.gear[0].effect: must be one of'],
            'bad-painter' => [self::mut('painter: disc', 'painter: blob'), 'painter: must be one of'],
            'bad-colour' => [self::mut('"#ffe27a"', 'red'), 'arsenal.ammo[0].gfx.shell: must be a quoted'],
            'unquoted-colour-is-comment' => [self::mut('shell: "#ffe27a"', 'shell: #ffe27a'), 'a value is missing'],
            'blast-count' => [self::mut('blast: ["#ffb13c", "#fff3c4"], painter: disc', 'blast: ["#ffb13c"], painter: disc'), 'blast: must list exactly two'],
            'shake-range' => [self::mut('shake: 0.3}', 'shake: 2}'), 'shake: must be a number from 0 to 1'],
            'bool-type' => [self::mut('ai: true', 'ai: yes'), 'arsenal.ammo[0].ai: must be true or false'],
            'bad-key-format' => [self::mut('key: buck', 'key: Buck-1'), 'arsenal.ammo[1].key: has the wrong format'],
            'duplicate-key' => [self::mut('key: buck', 'key: shell'), 'duplicate key `shell`'],
            'gear-ammo-key-clash' => [self::mut('key: repair', 'key: buck'), 'arsenal.gear[0].key: duplicate key'],
            'no-shell' => [self::mut('key: shell', 'key: pea'), 'needs a free `shell`'],
            'paid-shell' => [self::mut("      price: 0\n", "      price: 5\n"), 'arsenal.ammo[0].price: the `shell` must be free'],
            'roller-needs-friction' => [self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", "      effect: roller\n      rollTime: 6\n"), 'arsenal.ammo[1].friction: is required when effect is roller'],
            'roller-needs-rolltime' => [self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", "      effect: roller\n      friction: 0.5\n"), 'arsenal.ammo[1].rollTime: is required when effect is roller'],
            'roller-friction-range' => [self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", "      effect: roller\n      friction: 9\n      rollTime: 6\n"), 'arsenal.ammo[1].friction: must be a number from 0.01 to 5'],
            'roller-rolltime-range' => [self::mut("      effect: pellets\n      pellets: 3\n      spread: 0.1\n", "      effect: roller\n      friction: 0.5\n      rollTime: 60\n"), 'arsenal.ammo[1].rollTime: must be a number from 0.5 to 10'],
            'pellets-need-fields' => [self::mut("      pellets: 3\n", ''), 'arsenal.ammo[1].pellets: is required when effect is pellets'],
            'fall-missing' => [self::mut("  fall: {freePx: 10, perPx: 0.5, chuteOver: 5}\n", ''), 'arsenal.fall: must be a mapping'],
            'fall-unknown-field' => [self::mut('chuteOver: 5}', 'chuteOver: 5, slide: 1}'), 'arsenal.fall.slide: unknown key'],
            'fall-per-px-range' => [self::mut('perPx: 0.5', 'perPx: 11'), 'arsenal.fall.perPx: must be a number from 0 to 10'],
            'fall-chute-over-whole' => [self::mut('chuteOver: 5', 'chuteOver: 5.5'), 'arsenal.fall.chuteOver: must be a whole number'],
            'dmg-on-wrong-gear' => [self::mut("      n: 40\n", "      n: 40\n      dmg: 5\n"), 'arsenal.gear[0].dmg: only the laststand'],
            'laststand-needs-dmg' => [self::mut("      dmg: 50\n", ''), 'arsenal.gear[1].dmg: is required'],
            'em-dash' => [self::mut('Free and honest.', "Free \u{2014} honest."), 'must not contain en or em dashes'],
            'name-too-long' => [self::mut('name: Shell', 'name: ' . str_repeat('x', 50)), 'arsenal.ammo[0].name: must be text of 1 to 40'],
            'missing-key-action' => [self::mut("    barrelLeft: [Tokaim0]\n", ''), 'keys.aim.barrelLeft: must be a list'],
            'unknown-key-action' => [self::mut("    barrelLeft: [Tokaim0]\n", "    barrelLeft: [Tokaim0]\n    fav: [\"1\"]\n"), 'keys.aim.fav: unknown key'],
            'unknown-key-context' => [self::mut("  scroll:\n", "  extra: {a: [b]}\n  scroll:\n"), 'keys.extra: unknown key'],
            'empty-token-list' => [self::mut('barrelLeft: [Tokaim0]', 'barrelLeft: []'), 'needs at least one key token'],
            'token-with-space' => [self::mut('barrelLeft: [Tokaim0]', 'barrelLeft: ["a b"]'), 'must be a quoted key token'],
            'token-is-number' => [self::mut('barrelLeft: [Tokaim0]', 'barrelLeft: [1]'), 'must be a quoted key token'],
            'token-is-escape' => [self::mut('barrelLeft: [Tokaim0]', 'barrelLeft: [Escape]'), 'Esc cannot be bound'],
            'token-is-shift-esc' => [self::mut('barrelLeft: [Tokaim0]', 'barrelLeft: [Shift+Esc]'), 'Esc cannot be bound'],
            'token-reused' => [self::mut('barrelRight: [Tokaim1]', 'barrelRight: [Tokaim0]'), 'already bound to barrelLeft'],
            'unknown-sfx-event' => [self::mut("    click:\n", "    click:\n    zap: {file: audio/sfx/boom.mp3}\n"), 'audio.sfx.zap: unknown key'],
            'sfx-volume' => [self::mut('volume: 0.5', 'volume: 3'), 'audio.sfx.boom.volume: must be a number from 0 to 1'],
            'sfx-missing-file' => [self::mut('audio/sfx/boom.mp3', 'audio/sfx/none.mp3'), 'file not found'],
            'sfx-bad-extension' => [self::mut('audio/sfx/boom.mp3', 'audio/notes.txt'), 'must end in one of'],
            'sfx-dotdot' => [self::mut('audio/sfx/boom.mp3', '../tankity-outside-' . getmypid() . '/o.mp3'), 'relative path inside the game folder'],
            'sfx-absolute' => [self::mut('audio/sfx/boom.mp3', '/etc/boom.mp3'), 'relative path inside the game folder'],
            'sfx-url' => [self::mut('audio/sfx/boom.mp3', 'https://x.example/b.mp3'), 'relative path inside the game folder'],
            'effects-missing-section' => [preg_replace('/\neffects:.*?\naudio:/s', "\naudio:", $good), 'section `effects` is required'],
            'effects-missing-weapon' => [self::mut("  laststand:\n" . self::FX_MIN, ''), 'effects: needs an entry for `laststand`'],
            'effects-unknown-weapon' => [self::mut("  laststand:\n", "  zap:\n" . self::FX_MIN . "  laststand:\n"), 'effects.zap: unknown key'],
            'effects-missing-slot' => [self::mut("    trail:\n      emitters:\n        - { shape: streak, rate: 31, life: [0.2, 0.4], length: 7 }\n", ''), 'effects.shell: needs a `trail` effect'],
            'effects-unknown-slot' => [self::mut("    special:\n", "    flame:\n      emitters: []\n    special:\n"), 'effects.shell.flame: unknown key'],
            'effects-unknown-special' => [self::mut("      arc:\n", "      boom:\n        emitters: []\n      arc:\n"), 'effects.shell.special.boom: unknown special'],
            'effects-unknown-effect-key' => [self::mut("      screen: { shake: 0.12,", "      colour: red\n      screen: { shake: 0.12,"), 'effects.shell.muzzle.colour: unknown key'],
            'effects-slot-needs-emitter' => [self::mut("      emitters:\n        - { count: 4, life: [0.1, 0.22], speed: [90, 200], aim: forward, spread: 35, colors: [\"#FFFFFF\", \"#ffe27a\"], alpha: [1, 0.5, 0], glow: true }\n", "      emitters: []\n"), 'effects.shell.muzzle.emitters: needs at least one emitter'],
            'effects-emitters-not-list' => [self::mut("      emitters:\n        - { count: 4, life: [0.1, 0.22], speed: [90, 200], aim: forward, spread: 35, colors: [\"#FFFFFF\", \"#ffe27a\"], alpha: [1, 0.5, 0], glow: true }\n", "      emitters: 3\n"), 'effects.shell.muzzle.emitters: must be a list'],
            'effects-unknown-emitter-field' => [self::mut('glow: true }', 'glow: true, colour: red }'), 'effects.shell.muzzle.emitters[0].colour: unknown key'],
            'effects-bad-shape' => [self::mut('shape: ring', 'shape: cube'), 'effects.shell.impact.emitters[1].shape: must be one of'],
            'effects-bad-aim' => [self::mut('aim: forward', 'aim: sideways'), 'emitters[0].aim: must be one of'],
            'effects-count-range' => [self::mut('count: 4,', 'count: 4000,'), 'emitters[0].count: must be a whole number from 0 to 200'],
            'effects-count-float' => [self::mut('count: 4,', 'count: 4.5,'), 'emitters[0].count: must be a whole number'],
            'effects-spread-range' => [self::mut('spread: 35', 'spread: 500'), 'emitters[0].spread: must be a number from 0 to 360'],
            'effects-life-not-pair' => [self::mut('life: [0.1, 0.22]', 'life: 0.1'), 'emitters[0].life: must be a [min, max] pair of numbers'],
            'effects-life-reversed' => [self::mut('life: [0.1, 0.22]', 'life: [0.5, 0.2]'), 'emitters[0].life: must be [min, max]'],
            'effects-life-zero' => [self::mut('life: [0.1, 0.22]', 'life: [0, 0.2]'), 'emitters[0].life: must be [min, max] with min above 0'],
            'effects-size-in-px-with-unit-r' => [self::mut('size: [1.1, 1.1]', 'size: [30, 30]'), 'emitters[0].size: must be [min, max]'],
            'effects-speed-range' => [self::mut('speed: [90, 200]', 'speed: [90, 20000]'), 'emitters[0].speed: must be [min, max]'],
            'effects-length-with-unit-r' => [self::mut('{ count: 5, unit: r, size: [0.5, 0.5] }', '{ count: 5, unit: r, size: [0.5, 0.5], length: 80 }'), 'length: must be a number from 0 to 10'],
            'effects-trail-needs-rate' => [self::mut('rate: 31', 'count: 31'), 'effects.shell.trail.emitters[0].rate: is required above 0'],
            'effects-steer-needs-rate' => [self::mut('{ rate: 12, size: [1, 2] }', '{ count: 12, size: [1, 2] }'), 'effects.shell.special.steer.emitters[0].rate: is required above 0'],
            'effects-emits-nothing' => [self::mut('{ count: 2, rate: 9, duration: 0.7, delay: 0.1 }', '{ rate: 9, delay: 0.1 }'), 'effects.shell.impact.emitters[2]: emits nothing'],
            'effects-sprite-needs-sheet' => [self::mut('sheet: fireball, ', ''), 'effects.shell.impact.emitters[0].sheet: is required for a sprite emitter'],
            'effects-sheet-file-missing' => [self::mut('sheet: fireball', 'sheet: ghost'), 'emitters[0].sheet: must be one of: fireball'],
            'effects-sheet-unknown' => [self::mut('sheet: fireball', 'sheet: nope'), 'emitters[0].sheet: must be one of: fireball'],
            'effects-sprite-field-on-dot' => [self::mut('glow: true }', 'glow: true, scale: 2 }'), 'emitters[0].scale: only a sprite emitter'],
            'effects-bad-colour' => [self::mut('"#FFFFFF"', 'white'), 'emitters[0].colors[0]: is not valid'],
            'effects-no-colours' => [self::mut('colors: ["#FFFFFF", "#ffe27a"]', 'colors: []'), 'emitters[0].colors: must list 1 to 10'],
            'effects-bad-tint' => [self::mut('"#C77DFF"', 'purple'), 'emitters[0].tint: must be a quoted'],
            'effects-alpha-range' => [self::mut('alpha: [1, 0.5, 0]', 'alpha: [1, 5, 0]'), 'emitters[0].alpha[1]: is not valid'],
            'effects-flash-needs-colour' => [self::mut('flash: { color: "#FF7B39", alpha', 'flash: { alpha'), 'screen.flash.color: is required'],
            'effects-flash-alpha-range' => [self::mut('alpha: 0.12, dur', 'alpha: 3, dur'), 'screen.flash.alpha: must be a number from 0 to 1'],
            'effects-shake-range' => [self::mut('shake: 0.12', 'shake: 4'), 'screen.shake: must be a number from 0 to 1'],
            'effects-bad-bool' => [self::mut('glow: true }', 'glow: maybe }'), 'emitters[0].glow: must be true or false'],
            'effects-body-unknown' => [self::mut('pulse: 6 }', 'pulse: 6, glowy: 1 }'), 'effects.shell.body.glowy: unknown key'],
            'effects-body-range' => [self::mut('halo: 9', 'halo: 900'), 'effects.shell.body.halo: must be a number from 0 to 100'],
            'effects-body-sprite-unknown' => [self::mut('pulse: 6 }', 'pulse: 6, sprite: nope }'), 'effects.shell.body.sprite: must be one of: fireball'],
            'effects-body-size-needs-sprite' => [self::mut('pulse: 6 }', 'pulse: 6, size: 14 }'), 'effects.shell.body.size: only a body with a sprite'],
            'effects-body-roll-range' => [self::mut('pulse: 6 }', 'pulse: 6, sprite: fireball, roll: 90 }'), 'effects.shell.body.roll: must be a number from 0 to 50'],
            'effects-bad-anim' => [self::mut('glow: true }', 'glow: true, anim: spin }'), 'emitters[0].anim: must be one of: once, loop, random'],
            'effects-align-on-dot' => [self::mut('glow: true }', 'glow: true, align: true }'), 'emitters[0].align: only a sprite emitter'],
            'effects-bad-ground' => [self::mut('glow: true }', 'glow: true, ground: maybe }'), 'emitters[0].ground: must be true or false'],
            'music-needs-title' => [self::mut("      title: Theme\n", ''), 'audio.music[0].title: is required'],
            'music-needs-file' => [self::mut("    - file: audio/music/a.mp3\n      title: Theme\n", "    - title: Theme\n"), 'audio.music[0].file'],
            'music-extra-field' => [self::mut("      credit: Someone, CC0\n", "      credit: Someone, CC0\n      loop: true\n"), 'audio.music[0].loop: unknown key'],
        ];
        foreach ($cases as $name => [$yaml, $want]) {
            $e = self::errOf(fn() => $this->render($yaml));
            self::assertTrue($e !== null && str_contains($e, $want), "schema-$name" . ' :: ' . (string) $e);
        }
        // Schema errors carry the YAML line of the offending value.
        $badDmg = self::mut('dmg: 34', 'dmg: 9000');
        $n = array_search('      dmg: 9000', explode("\n", $badDmg), true) + 1;
        $e = (string) self::errOf(fn() => $this->render($badDmg));
        self::assertTrue(str_starts_with($e, "line $n: arsenal.ammo[0].dmg"), 'schema-error-has-line' . ' :: ' . $e);
        // An effects error names the emitter's line and its field.
        $badFx = self::mut('count: 4,', 'count: 4000,');
        $n = array_search('        - { count: 4000, life: [0.1, 0.22], speed: [90, 200], aim: forward, spread: 35, colors: ["#FFFFFF", "#ffe27a"], alpha: [1, 0.5, 0], glow: true }', explode("\n", $badFx), true) + 1;
        $e = (string) self::errOf(fn() => $this->render($badFx));
        self::assertTrue(str_starts_with($e, "line $n: effects.shell.muzzle.emitters[0].count"), 'effects-error-has-line' . ' :: ' . $e);
        // Several mistakes are all reported at once.
        $e = (string) self::errOf(fn() => $this->render(self::mut('effect: shot', 'effect: nope') . "\nextra: 1\n"));
        self::assertTrue(substr_count($e, "\n") >= 1, 'schema-reports-all' . ' :: ' . $e);
    }

    /** a symlink or ../ cannot leave the game folder */
    public function testSymlinkCannotEscape(): void
    {
        // A symlink or ../ cannot leave the game folder.
        @symlink($this->outside . '/o.mp3', "$this->tmp/audio/sfx/link.mp3");
        $e = (string) self::errOf(fn() => $this->render(self::mut('audio/sfx/boom.mp3', 'audio/sfx/link.mp3')));
        self::assertTrue(str_contains($e, 'must stay inside the game folder'), 'schema-symlink-escape' . ' :: ' . $e);
    }

    /** drones.personalities render in file order with their rules, and a row with shift carries only its shift */
    public function testDronesRender(): void
    {
        $out = json_decode($this->render(self::good()), true);
        self::assertSame([
            ['key' => 'saver', 'name' => 'Saver', 'reserve' => 0.5, 'defense' => 0.1, 'pick' => 'big', 'maxBuys' => 3],
            ['key' => 'turtle', 'name' => 'Turtle', 'reserve' => 0.1, 'defense' => 0.6, 'pick' => 'value', 'maxBuys' => 6],
            ['key' => 'shifty', 'name' => 'Shifty', 'shift' => 0.35],
        ], $out['drones']['personalities'], 'drones-render');
        $edge = json_decode($this->render(self::mut('reserve: 0.5, defense: 0.1', 'reserve: 0, defense: 1')), true);
        self::assertSame([0, 1], [$edge['drones']['personalities'][0]['reserve'], $edge['drones']['personalities'][0]['defense']], 'drones-edges-are-allowed');
    }

    /** the shipped game.yaml is valid, in sync with game.json, and covers every weapon */
    public function testShippedGameYaml(): void
    {
        $good = self::good();
        $out = json_decode($this->render($good), true);
        $repoDir = TANKITY_GAME_DIR;
        $e = self::errOf(function () use ($repoDir, &$shipped) {
            $shipped = tankity_config_render((string) file_get_contents("$repoDir/game.yaml"), $repoDir);
        });
        self::assertTrue($e === null, 'shipped-yaml-valid' . ' :: ' . (string) $e);
        self::assertTrue($shipped !== null && $shipped === (string) @file_get_contents("$repoDir/game.json"), 'shipped-json-in-sync' . ' :: ' . 'run: php tools/game-json.php (in games/tankity)');
        $sd = json_decode((string) $shipped, true);
        self::assertTrue(($out['arsenal']['fall'] ?? null) === ['freePx' => 10, 'perPx' => 0.5, 'chuteOver' => 5], 'good-fall' . ' :: ' . json_encode($out['arsenal']['fall'] ?? null));
        self::assertTrue(count($sd['arsenal']['ammo'] ?? []) >= 30 && count($sd['arsenal']['ammo']) === count($sd['effects'] ?? []) - 1 && count($sd['arsenal']['gear'] ?? []) === 9
            && count($sd['audio']['sfx'] ?? []) >= 1 && count($sd['audio']['music'] ?? []) >= 1, 'shipped-counts');
        $ruled = array_filter($sd['drones']['personalities'] ?? [], fn($p) => !isset($p['shift']));
        self::assertTrue(count($ruled) >= 2 && count($sd['drones']['personalities']) > count($ruled), 'shipped-personalities' . ' :: ' . json_encode($sd['drones'] ?? null));
        foreach ($sd['arsenal']['ammo'] ?? [] as $row) {
            self::assertTrue(!array_key_exists('aiRound', $row) && !array_key_exists('aiRack', $row), 'shipped-no-free-racks-' . $row['key']);
        }
        $ammoKeys = array_column($sd['arsenal']['ammo'] ?? [], 'key');
        $rollerRow = $sd['arsenal']['ammo'][array_search('roller', $ammoKeys, true)] ?? [];
        self::assertTrue(($rollerRow['effect'] ?? '') === 'roller' && ($rollerRow['friction'] ?? 0) > 0 && ($rollerRow['rollTime'] ?? 0) > 0
            && ($rollerRow['gfx']['painter'] ?? '') === 'ball' && isset($sd['effects']['roller']['trail']['emitters'][0]['rate']), 'shipped-roller-row' . ' :: ' . json_encode($rollerRow));
        self::assertTrue(array_keys($sd['effects'] ?? []) === array_merge($ammoKeys, ['laststand']), 'shipped-effects-cover-every-weapon' . ' :: ' . implode(',', array_keys($sd['effects'] ?? [])));
    }

    /** the --check workflow on a scratch copy of the tool and the game folder */
    public function testCliCheckWorkflow(): void
    {
        $repoDir = TANKITY_GAME_DIR;
        $shipped = tankity_config_render((string) file_get_contents("$repoDir/game.yaml"), $repoDir);
        $sd = json_decode($shipped, true);
        $work = "$this->tmp/work";
        @mkdir($work, 0777, true);
        exec('cp -R ' . escapeshellarg($repoDir) . ' ' . escapeshellarg("$work/tankity"));
        $run = function (string ...$args) use ($work): array {
            $cmd = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg("$work/tankity/tools/game-json.php") . ' ' . implode(' ', array_map('escapeshellarg', $args)) . ' 2>&1';
            exec($cmd, $lines, $rc);
            return [$rc, implode("\n", $lines)];
        };
        [$rc] = $run('--check');
        self::assertTrue($rc === 0, 'cli-check-passes-when-in-sync');
        file_put_contents("$work/tankity/game.json", "{}\n");
        [$rc, $msg] = $run('--check');
        self::assertTrue($rc === 1 && str_contains($msg, 'stale'), 'cli-check-detects-stale-json' . ' :: ' . $msg);
        [$rc] = $run();
        [$rc2] = $run('--check');
        self::assertTrue($rc === 0 && $rc2 === 0 && file_get_contents("$work/tankity/game.json") === $shipped, 'cli-write-fixes-stale');
        unlink("$work/tankity/game.json");
        [$rc, $msg] = $run('--check');
        self::assertTrue($rc === 1 && str_contains($msg, 'stale'), 'cli-check-detects-missing-json' . ' :: ' . $msg);
        $y = (string) file_get_contents("$work/tankity/game.yaml");
        file_put_contents("$work/tankity/game.yaml", preg_replace('/dmg: 34\b/', 'dmg: 99999', $y, 1));
        [$rc, $msg] = $run('--check');
        self::assertTrue($rc === 1 && preg_match('/game\.yaml line \d+: arsenal\.ammo\[0\]\.dmg/', $msg) === 1, 'cli-check-fails-on-invalid-yaml' . ' :: ' . $msg);
        file_put_contents("$work/tankity/game.yaml", "arsenal:\n\tbad: 1\n");
        [$rc, $msg] = $run('--check');
        self::assertTrue($rc === 1 && str_contains($msg, 'line 2: tabs'), 'cli-check-fails-on-parse-error' . ' :: ' . $msg);
        file_put_contents("$work/tankity/game.yaml", $y);
        @unlink("$work/tankity/audio/music/" . basename($sd['audio']['music'][0]['file']));
        [$rc, $msg] = $run('--check');
        self::assertTrue($rc === 1 && str_contains($msg, 'file not found'), 'cli-check-fails-on-missing-audio-file' . ' :: ' . $msg);
    }
}
