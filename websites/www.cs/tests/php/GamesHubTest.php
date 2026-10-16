<?php
// Tests for games/hub.php, the metadata.yaml reader behind the Games page. Each test
// starts from an empty scratch folder, $this->tmp, that tearDown() removes.
declare(strict_types=1);
require_once __DIR__ . '/../../games/hub.php';
require_once __DIR__ . '/../../games/_kit/php/tests/TempDir.php';

use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class GamesHubTest extends TestCase
{
    use TempDir;

    private string $tmp;

    protected function setUp(): void
    {
        $this->tmp = self::makeTempDir('games-hub-test');
    }

    protected function tearDown(): void
    {
        self::removeTree($this->tmp);
    }

    /** Writes a game folder under the scratch folder: its metadata.yaml (when given) and empty files. */
    private function game(string $id, ?string $yaml, array $files = []): void
    {
        @mkdir("$this->tmp/$id", 0777, true);
        if ($yaml !== null) {
            file_put_contents("$this->tmp/$id/metadata.yaml", $yaml);
        }
        foreach ($files as $f) {
            file_put_contents("$this->tmp/$id/$f", '');
        }
    }

    /** the metadata.yaml parser: quoting, folded blocks, and its errors */
    public function testParseYaml(): void
    {
        [$data, $err] = games_hub_parse_yaml(
            "# comment\ntitle: The CIC\nkicker: \"Cylon: defense\" # note\nbutton: 'Go # now'\norder: 10\nhidden: false\n"
        );
        self::assertTrue($err === null, 'parse-ok');
        self::assertTrue(($data['title'] ?? null) === 'The CIC', 'parse-plain');
        self::assertTrue(($data['kicker'] ?? null) === 'Cylon: defense', 'parse-double-quoted-keeps-colon');
        self::assertTrue(($data['button'] ?? null) === 'Go # now', 'parse-single-quoted-keeps-hash');
        self::assertTrue(($data['order'] ?? null) === '10', 'parse-int-stays-string');

        [$data, $err] = games_hub_parse_yaml("description: >\n  First line\n  second line.\n\ntitle: X\n");
        self::assertTrue($err === null && ($data['description'] ?? null) === 'First line second line.', 'parse-folded-block');
        self::assertTrue(($data['title'] ?? null) === 'X', 'parse-after-block');

        [$data, $err] = games_hub_parse_yaml("title: A\ntitle: B\n");
        self::assertTrue($err !== null && str_contains($err, 'title'), 'parse-duplicate-key-error');

        [$data, $err] = games_hub_parse_yaml("title A\n");
        self::assertTrue($err !== null && str_contains($err, 'line 1'), 'parse-missing-colon-error');

        [$data, $err] = games_hub_parse_yaml("  title: A\n");
        self::assertTrue($err !== null, 'parse-indented-key-error');
    }

    /** a play file that is not there is an error */
    public function testCardMissingFileFails(): void
    {
        [$card, $err] = games_hub_card('tankity', [
            'title' => 'Operation Tankity', 'description' => 'Artillery.', 'play' => 'index.html',
        ], "$this->tmp/tankity");
        self::assertTrue($card === null && str_contains((string) $err, 'index.html'), 'card-missing-file-error');
    }

    /** a play card sends players to the site's wrapper page */
    public function testCardPlay(): void
    {
        $this->game('tankity', null, ['index.html']);
        [$card, $err] = games_hub_card('tankity', [
            'title' => 'Operation Tankity', 'description' => 'Artillery.', 'play' => 'index.html',
        ], "$this->tmp/tankity");
        // Players go to the site's wrapper page; the game's own page is kept for its frame.
        self::assertTrue($err === null && $card['href'] === 'play/tankity/' && $card['page'] === 'games/tankity/', 'card-play-ok');
        self::assertTrue(($card['button'] ?? null) === 'Play Operation Tankity', 'card-default-button');
        self::assertTrue(($card['order'] ?? null) === 100, 'card-default-order');
        self::assertTrue(!array_key_exists('start', $card), 'card-no-start-key');
    }

    /** a start card calls the game's start function and has no page link */
    public function testCardStart(): void
    {
        [$card, $err] = games_hub_card('cylon', [
            'title' => 'The CIC', 'description' => 'Defend.', 'start' => 'cylonStartGame',
            'button' => 'Enter The CIC', 'order' => '10', 'kicker' => 'Cylon defense',
        ], "$this->tmp/cylon");
        self::assertTrue($err === null && $card['start'] === 'cylonStartGame' && $card['order'] === 10, 'card-start-ok');
        self::assertTrue(!array_key_exists('href', $card), 'card-start-no-href');
    }

    /** every malformed card is refused with a message */
    public function testCardRejects(): void
    {
        $this->game('tankity', null, ['index.html']);
        $bad = [
            'missing-title' => ['description' => 'd', 'play' => 'index.html'],
            'missing-description' => ['title' => 't', 'play' => 'index.html'],
            'neither-launch' => ['title' => 't', 'description' => 'd'],
            'both-launch' => ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'start' => 'go'],
            'play-parent' => ['title' => 't', 'description' => 'd', 'play' => '../cylon/x.html'],
            'play-absolute' => ['title' => 't', 'description' => 'd', 'play' => '/etc/passwd'],
            'play-url' => ['title' => 't', 'description' => 'd', 'play' => 'javascript:alert(1)'],
            'start-not-identifier' => ['title' => 't', 'description' => 'd', 'start' => 'alert(1)'],
            'order-not-int' => ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'order' => 'soon'],
            'hidden-not-bool' => ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'hidden' => 'maybe'],
            'unknown-key' => ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'colour' => 'red'],
        ];
        foreach ($bad as $name => $meta) {
            [$card, $err] = games_hub_card('tankity', $meta, "$this->tmp/tankity");
            self::assertTrue($card === null && is_string($err) && $err !== '', "card-reject-$name");
        }
    }

    /** a hidden game is skipped without an error */
    public function testCardHiddenIsSkipped(): void
    {
        $this->game('tankity', null, ['index.html']);
        [$card, $err] = games_hub_card('tankity', [
            'title' => 't', 'description' => 'd', 'play' => 'index.html', 'hidden' => 'true',
        ], "$this->tmp/tankity");
        self::assertTrue($card === null && $err === null, 'card-hidden-skipped');
    }

    /** the share image is a picture file inside the game folder, and the share link is the wrapper page */
    public function testCardImage(): void
    {
        $this->game('tankity', null, ['index.html', 'og.png', 'notes.txt']);
        [$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'image' => 'og.png'], "$this->tmp/tankity");
        self::assertTrue($err === null && $card['image'] === 'games/tankity/og.png' && $card['share'] === 'play/tankity/', 'card-image-ok');
        foreach (['missing' => 'nope.png', 'not-an-image' => 'notes.txt', 'traversal' => '../cylon/og.png'] as $name => $img) {
            [$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'image' => $img], "$this->tmp/tankity");
            self::assertTrue($card === null && is_string($err), "card-image-reject-$name");
        }
    }

    /** the Games-page screenshot is a picture file inside the game folder */
    public function testCardScreenshot(): void
    {
        $this->game('tankity', null, ['index.html', 'shot.jpg', 'notes.txt']);
        [$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'screenshot' => 'shot.jpg'], "$this->tmp/tankity");
        self::assertTrue($err === null && ($card['screenshot'] ?? null) === 'games/tankity/shot.jpg', 'card-screenshot-ok');
        foreach (['missing' => 'nope.jpg', 'not-an-image' => 'notes.txt', 'traversal' => '../cylon/shot.jpg'] as $name => $shot) {
            [$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'screenshot' => $shot], "$this->tmp/tankity");
            self::assertTrue($card === null && is_string($err), "card-screenshot-reject-$name");
        }
    }

    /** the install look is a short name and colors, with defaults */
    public function testCardInstallLook(): void
    {
        $this->game('tankity', null, ['index.html']);
        $base = ['title' => 'Operation Tankity', 'description' => 'd', 'play' => 'index.html'];
        [$card, $err] = games_hub_card('tankity', $base, "$this->tmp/tankity");
        self::assertTrue($err === null && $card['short_name'] === 'Operation Tankity'
            && $card['theme_color'] === GAMES_HUB_DEFAULT_COLOR && $card['background_color'] === GAMES_HUB_DEFAULT_COLOR
            && $card['accent_color'] === GAMES_HUB_DEFAULT_ACCENT, 'card-install-defaults');
        [$card, $err] = games_hub_card('tankity', $base + ['short_name' => 'Tankity', 'theme_color' => '#ABC', 'background_color' => '#05060F', 'accent_color' => '#FFC93C'], "$this->tmp/tankity");
        self::assertTrue($err === null && $card['short_name'] === 'Tankity'
            && $card['theme_color'] === '#abc' && $card['background_color'] === '#05060f' && $card['accent_color'] === '#ffc93c', 'card-install-values');
        foreach (['theme_color' => ['red', '#12', '#12345g', '05060f'], 'background_color' => ['rgb(0,0,0)', '#1234567'], 'accent_color' => ['gold', '#ffc93']] as $key => $bad) {
            foreach ($bad as $value) {
                [$card, $err] = games_hub_card('tankity', $base + [$key => $value], "$this->tmp/tankity");
                self::assertTrue($card === null && is_string($err), "card-install-reject-$key-$value");
            }
        }
        [$card, $err] = games_hub_card('tankity', $base + ['short_name' => str_repeat('x', 25)], "$this->tmp/tankity");
        self::assertTrue($card === null && is_string($err), 'card-install-reject-long-short-name');
    }

    /** a start card's share page, and its manifest once one is written */
    public function testCardMounted(): void
    {
        $this->game('mounted', null);
        [$card, $err] = games_hub_card('mounted', ['title' => 't', 'description' => 'd', 'start' => 'go'], "$this->tmp/mounted");
        self::assertTrue($err === null && ($card['share'] ?? null) === 'play/mounted/' && !isset($card['href']), 'card-start-share-page');
        self::assertTrue(!array_key_exists('manifest', $card), 'card-start-no-manifest-until-written');
        $this->game('mounted', null, ['manifest.webmanifest']);
        [$card, $err] = games_hub_card('mounted', ['title' => 't', 'description' => 'd', 'start' => 'go'], "$this->tmp/mounted");
        self::assertTrue(($card['manifest'] ?? null) === 'games/mounted/manifest.webmanifest', 'card-start-manifest');
    }

    /** games_hub_list sorts by order then title and reports broken folders */
    public function testDiscovery(): void
    {
        $this->game('tankity', null, ['index.html']);
        $this->game('cylon', "title: The CIC\ndescription: Defend.\nstart: cylonStartGame\norder: 10\n");
        $this->game('tankity', "title: Operation Tankity\ndescription: Artillery.\nplay: index.html\norder: 20\n");
        $this->game('crete', "title: The Island of Crete\ndescription: Escape.\nplay: index.html\n", ['index.html']);
        $this->game('alpha', "title: Alpha\ndescription: A.\nplay: index.html\n", ['index.html']);
        $this->game('broken', "title: Broken\n");
        $this->game('no-metadata', null, ['index.html']);
        $this->game('Bad_Name', "title: Bad\ndescription: d\nplay: index.html\n", ['index.html']);
        file_put_contents("$this->tmp/metadata.yaml", "title: stray\n");

        $hub = games_hub_list($this->tmp);
        $ids = array_column($hub['games'], 'id');
        self::assertTrue($ids === ['cylon', 'tankity', 'alpha', 'crete'], 'list-sorted-by-order-then-title');
        self::assertTrue(!in_array('no-metadata', $ids, true), 'list-skips-dir-without-metadata');
        $errorIds = array_column($hub['errors'], 'id');
        sort($errorIds);
        self::assertTrue($errorIds === ['Bad_Name', 'broken'], 'list-reports-broken-and-bad-name');
        self::assertTrue(games_hub_list("$this->tmp/nope") === ['games' => [], 'errors' => []], 'list-missing-dir-empty');
    }

    /** the games shipped with the site must all be valid */
    public function testRepoGames(): void
    {
        $real = games_hub_list(__DIR__ . '/../../games');
        self::assertTrue($real['errors'] === [], 'repo-games-no-errors' . ' :: ' . json_encode($real['errors']));
        $realIds = array_column($real['games'], 'id');
        sort($realIds);
        self::assertTrue($realIds === ['crete', 'cylon', 'tankity'], 'repo-games-all-listed');
    }
}
