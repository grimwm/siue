<?php
// Tests for tools/site-versions.php, which writes the ?v= cache-busters in the
// home page. Run: php tests/site-versions-test.php
// Exit 0 when every check passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/../tools/site-versions.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

$tmp = sys_get_temp_dir() . '/site-versions-test-' . getmypid();
@mkdir("$tmp/games/cylon/css", 0777, true);
// The game's stylesheets, in the order the page links them: that order is the cascade.
$sheets = ['eye', 'nav', 'help', 'hud', 'gameover', 'settings', 'controls', 'fx', 'units', 'world', 'intro'];
$files = [
    'site.css' => "body{}\n",
    'main.js' => "function f(){}\n",
    'games/cylon/cylon.js' => "export const x = 1;\n",
];
foreach ($sheets as $n) {
    $files["games/cylon/css/$n.css"] = ".$n{}\n";
}
foreach ($files as $f => $content) {
    file_put_contents("$tmp/$f", $content);
}
$links = implode('', array_map(fn(string $n): string => "<link href=\"games/cylon/css/$n.css?v=old\" rel=\"stylesheet\">\n", $sheets));
$page = "<link href=\"site.css?v=old\" rel=\"stylesheet\">\n$links"
    . "<script src=\"main.js?v=old\"></script>\n"
    . "<script type=\"module\">\nconst m = await import('./games/cylon/cylon.js?v=old');\n</script>\n";
file_put_contents("$tmp/index.html", $page);
$read = fn(string $f): string => (string) file_get_contents("$tmp/$f");
$v = fn(string $f): string => substr(hash('sha256', $files[$f]), 0, 10);

// Check mode finds it stale and writes nothing.
[$stale, $problems] = site_versions_sync($tmp, false);
$check('check-finds-stale', $stale === true && $problems === [], json_encode([$stale, $problems]));
$check('check-writes-nothing', $read('index.html') === $page);

// Write sets every version to its file's hash, and one run converges.
[$stale] = site_versions_sync($tmp, true);
$html = $read('index.html');
$check('write-reports-stale', $stale === true);
$check('site-css-version', str_contains($html, "href=\"site.css?v={$v('site.css')}\""));
$check('main-js-version', str_contains($html, "src=\"main.js?v={$v('main.js')}\""));
foreach ($sheets as $n) {
    $check("cylon-$n-css-version", str_contains($html, "href=\"games/cylon/css/$n.css?v={$v("games/cylon/css/$n.css")}\""));
}
$check('cylon-js-version', str_contains($html, "import('./games/cylon/cylon.js?v={$v('games/cylon/cylon.js')}')"));
[$stale, $problems] = site_versions_sync($tmp, false);
$check('converges-in-one-run', $stale === false && $problems === [], json_encode([$stale, $problems]));
$check('rewrite-touches-only-versions', preg_replace('/\?v=[0-9a-f]+/', '?v=X', $html) === preg_replace('/\?v=old/', '?v=X', $page));

// Any referenced file changing makes the page stale, and only the page.
foreach (array_keys($files) as $f) {
    $files[$f] .= "/* more */\n";
    file_put_contents("$tmp/$f", $files[$f]);
    [$stale] = site_versions_sync($tmp, false);
    $check("check-sees-changed-$f", $stale === true);
    site_versions_sync($tmp, true);
    [$stale] = site_versions_sync($tmp, false);
    $check("clean-after-rewrite-$f", $stale === false);
}

// A missing or duplicate reference fails loudly and writes nothing.
$now = $read('index.html');
$cases = [
    'site.css has no version' => [str_replace('site.css?v=', 'site.css#', $now), 'index.html must reference site.css?v=... exactly once (found 0)'],
    'main.js is listed twice' => [$now . "<script src=\"main.js?v=x\"></script>\n", 'index.html must reference main.js?v=... exactly once (found 2)'],
    'a cylon stylesheet is gone' => [str_replace('games/cylon/css/hud.css?v=', 'games/cylon/css/other.css?v=', $now), 'index.html must reference games/cylon/css/hud.css?v=... exactly once (found 0)'],
    'a cylon stylesheet is linked twice' => [$now . "<link href=\"games/cylon/css/eye.css?v=x\" rel=\"stylesheet\">\n", 'index.html must reference games/cylon/css/eye.css?v=... exactly once (found 2)'],
    'cylon stylesheets are out of order' => [str_replace(['css/nav.css?v=', 'css/help.css?v=', 'css/tmp.css?v='], ['css/tmp.css?v=', 'css/nav.css?v=', 'css/help.css?v='], $now), 'index.html must link games/cylon/css/*.css in the order of SITE_VERSIONS_REFS'],
    'the cylon import has no version' => [str_replace("cylon.js?v=", 'cylon.js#', $now), 'index.html must reference games/cylon/cylon.js?v=... exactly once (found 0)'],
    'cylon.js is imported twice' => [$now . "import('./games/cylon/cylon.js?v=y');\n", 'index.html must reference games/cylon/cylon.js?v=... exactly once (found 2)'],
];
foreach ($cases as $name => [$broken, $expect]) {
    file_put_contents("$tmp/index.html", $broken);
    [$stale, $problems] = site_versions_sync($tmp, true);
    $check("bad-reference-fails: $name", $stale === false && in_array($expect, $problems, true) && $read('index.html') === $broken, json_encode($problems));
}
// A stylesheet in the folder that the page does not link would never load.
file_put_contents("$tmp/index.html", $now);
file_put_contents("$tmp/games/cylon/css/extra.css", ".x{}\n");
[$stale, $problems] = site_versions_sync($tmp, true);
$check('an-unlinked-stylesheet-fails', $stale === false && in_array('games/cylon/css/extra.css is not in SITE_VERSIONS_REFS, so index.html would not link it', $problems, true) && $read('index.html') === $now, json_encode($problems));
unlink("$tmp/games/cylon/css/extra.css");
unlink("$tmp/main.js");
[, $problems] = site_versions_sync($tmp, false);
$check('unreadable-file-fails', $problems === ['index.html references main.js, which is not readable'], json_encode($problems));

// The repository's own page is in sync (run php games/cylon/tools/install-files.php, then php tools/site-versions.php).
[$stale, $problems] = site_versions_sync(dirname(__DIR__), false);
$check('repo-page-in-sync', $stale === false && $problems === [], json_encode([$stale, $problems]));

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "SITE-VERSIONS-OK\n" : "SITE-VERSIONS-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
