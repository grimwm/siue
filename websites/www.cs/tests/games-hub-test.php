<?php
// Tests for games/hub.php, the metadata.yaml reader behind the Games page.
// Run: php tests/games-hub-test.php. Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/../games/hub.php';

$fail = 0;
$check = function (string $name, bool $cond) use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . "\n";
    if (!$cond) {
        $fail++;
    }
};

$tmp = sys_get_temp_dir() . '/games-hub-test-' . getmypid();
$game = function (string $id, ?string $yaml, array $files = []) use ($tmp): void {
    @mkdir("$tmp/$id", 0777, true);
    if ($yaml !== null) {
        file_put_contents("$tmp/$id/metadata.yaml", $yaml);
    }
    foreach ($files as $f) {
        file_put_contents("$tmp/$id/$f", '');
    }
};

// --- Parser -----------------------------------------------------------------

[$data, $err] = games_hub_parse_yaml(
    "# comment\ntitle: The CIC\nkicker: \"Cylon: defense\" # note\nbutton: 'Go # now'\norder: 10\nhidden: false\n"
);
$check('parse-ok', $err === null);
$check('parse-plain', ($data['title'] ?? null) === 'The CIC');
$check('parse-double-quoted-keeps-colon', ($data['kicker'] ?? null) === 'Cylon: defense');
$check('parse-single-quoted-keeps-hash', ($data['button'] ?? null) === 'Go # now');
$check('parse-int-stays-string', ($data['order'] ?? null) === '10');

[$data, $err] = games_hub_parse_yaml("description: >\n  First line\n  second line.\n\ntitle: X\n");
$check('parse-folded-block', $err === null && ($data['description'] ?? null) === 'First line second line.');
$check('parse-after-block', ($data['title'] ?? null) === 'X');

[$data, $err] = games_hub_parse_yaml("title: A\ntitle: B\n");
$check('parse-duplicate-key-error', $err !== null && str_contains($err, 'title'));

[$data, $err] = games_hub_parse_yaml("title A\n");
$check('parse-missing-colon-error', $err !== null && str_contains($err, 'line 1'));

[$data, $err] = games_hub_parse_yaml("  title: A\n");
$check('parse-indented-key-error', $err !== null);

// --- Validation -------------------------------------------------------------

[$card, $err] = games_hub_card('tankity', [
    'title' => 'Operation Tankity', 'description' => 'Artillery.', 'play' => 'index.html',
], "$tmp/tankity");
$check('card-missing-file-error', $card === null && str_contains((string) $err, 'index.html'));

$game('tankity', null, ['index.html']);
[$card, $err] = games_hub_card('tankity', [
    'title' => 'Operation Tankity', 'description' => 'Artillery.', 'play' => 'index.html',
], "$tmp/tankity");
// Players go to the site's wrapper page; the game's own page is kept for its frame.
$check('card-play-ok', $err === null && $card['href'] === 'play/tankity/' && $card['page'] === 'games/tankity/');
$check('card-default-button', ($card['button'] ?? null) === 'Play Operation Tankity');
$check('card-default-order', ($card['order'] ?? null) === 100);
$check('card-no-start-key', !array_key_exists('start', $card));

[$card, $err] = games_hub_card('cylon', [
    'title' => 'The CIC', 'description' => 'Defend.', 'start' => 'cylonStartGame',
    'button' => 'Enter The CIC', 'order' => '10', 'kicker' => 'Cylon defense',
], "$tmp/cylon");
$check('card-start-ok', $err === null && $card['start'] === 'cylonStartGame' && $card['order'] === 10);
$check('card-start-no-href', !array_key_exists('href', $card));

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
    [$card, $err] = games_hub_card('tankity', $meta, "$tmp/tankity");
    $check("card-reject-$name", $card === null && is_string($err) && $err !== '');
}

[$card, $err] = games_hub_card('tankity', [
    'title' => 't', 'description' => 'd', 'play' => 'index.html', 'hidden' => 'true',
], "$tmp/tankity");
$check('card-hidden-skipped', $card === null && $err === null);

// Share image and share link.
$game('tankity', null, ['index.html', 'og.png', 'notes.txt']);
[$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'image' => 'og.png'], "$tmp/tankity");
$check('card-image-ok', $err === null && $card['image'] === 'games/tankity/og.png' && $card['share'] === 'play/tankity/');
foreach (['missing' => 'nope.png', 'not-an-image' => 'notes.txt', 'traversal' => '../cylon/og.png'] as $name => $img) {
    [$card, $err] = games_hub_card('tankity', ['title' => 't', 'description' => 'd', 'play' => 'index.html', 'image' => $img], "$tmp/tankity");
    $check("card-image-reject-$name", $card === null && is_string($err));
}

// Install look: short name and colors, with defaults.
$base = ['title' => 'Operation Tankity', 'description' => 'd', 'play' => 'index.html'];
[$card, $err] = games_hub_card('tankity', $base, "$tmp/tankity");
$check('card-install-defaults', $err === null && $card['short_name'] === 'Operation Tankity'
    && $card['theme_color'] === GAMES_HUB_DEFAULT_COLOR && $card['background_color'] === GAMES_HUB_DEFAULT_COLOR
    && $card['accent_color'] === GAMES_HUB_DEFAULT_ACCENT);
[$card, $err] = games_hub_card('tankity', $base + ['short_name' => 'Tankity', 'theme_color' => '#ABC', 'background_color' => '#05060F', 'accent_color' => '#FFC93C'], "$tmp/tankity");
$check('card-install-values', $err === null && $card['short_name'] === 'Tankity'
    && $card['theme_color'] === '#abc' && $card['background_color'] === '#05060f' && $card['accent_color'] === '#ffc93c');
foreach (['theme_color' => ['red', '#12', '#12345g', '05060f'], 'background_color' => ['rgb(0,0,0)', '#1234567'], 'accent_color' => ['gold', '#ffc93']] as $key => $bad) {
    foreach ($bad as $value) {
        [$card, $err] = games_hub_card('tankity', $base + [$key => $value], "$tmp/tankity");
        $check("card-install-reject-$key-$value", $card === null && is_string($err));
    }
}
[$card, $err] = games_hub_card('tankity', $base + ['short_name' => str_repeat('x', 25)], "$tmp/tankity");
$check('card-install-reject-long-short-name', $card === null && is_string($err));

$game('mounted', null);
[$card, $err] = games_hub_card('mounted', ['title' => 't', 'description' => 'd', 'start' => 'go'], "$tmp/mounted");
$check('card-start-share-page', $err === null && ($card['share'] ?? null) === 'play/mounted/' && !isset($card['href']));
$check('card-start-no-manifest-until-written', !array_key_exists('manifest', $card));
$game('mounted', null, ['manifest.webmanifest']);
[$card, $err] = games_hub_card('mounted', ['title' => 't', 'description' => 'd', 'start' => 'go'], "$tmp/mounted");
$check('card-start-manifest', ($card['manifest'] ?? null) === 'games/mounted/manifest.webmanifest');
exec('rm -rf ' . escapeshellarg("$tmp/mounted"));

// --- Discovery --------------------------------------------------------------

$game('cylon', "title: The CIC\ndescription: Defend.\nstart: cylonStartGame\norder: 10\n");
$game('tankity', "title: Operation Tankity\ndescription: Artillery.\nplay: index.html\norder: 20\n");
$game('crete', "title: The Island of Crete\ndescription: Escape.\nplay: index.html\n", ['index.html']);
$game('alpha', "title: Alpha\ndescription: A.\nplay: index.html\n", ['index.html']);
$game('broken', "title: Broken\n");
$game('no-metadata', null, ['index.html']);
$game('Bad_Name', "title: Bad\ndescription: d\nplay: index.html\n", ['index.html']);
file_put_contents("$tmp/metadata.yaml", "title: stray\n");

$hub = games_hub_list($tmp);
$ids = array_column($hub['games'], 'id');
$check('list-sorted-by-order-then-title', $ids === ['cylon', 'tankity', 'alpha', 'crete']);
$check('list-skips-dir-without-metadata', !in_array('no-metadata', $ids, true));
$errorIds = array_column($hub['errors'], 'id');
sort($errorIds);
$check('list-reports-broken-and-bad-name', $errorIds === ['Bad_Name', 'broken']);
$check('list-missing-dir-empty', games_hub_list("$tmp/nope") === ['games' => [], 'errors' => []]);

// The games shipped with the site must all be valid.
$real = games_hub_list(__DIR__ . '/../games');
$check('repo-games-no-errors', $real['errors'] === []);
foreach ($real['errors'] as $e) {
    echo "  {$e['id']}: {$e['error']}\n";
}
$realIds = array_column($real['games'], 'id');
sort($realIds);
$check('repo-games-all-listed', $realIds === ['crete', 'cylon', 'tankity']);

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "GAMES-HUB-OK\n" : "GAMES-HUB-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
