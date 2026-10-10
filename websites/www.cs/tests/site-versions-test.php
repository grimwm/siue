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
@mkdir("$tmp/games/cylon", 0777, true);
$files = [
    'site.css' => "body{}\n",
    'main.js' => "function f(){}\n",
    'games/cylon/cylon.css' => ".a{}\n",
    'games/cylon/cylon.js' => "export const x = 1;\n",
];
foreach ($files as $f => $content) {
    file_put_contents("$tmp/$f", $content);
}
$page = "<link href=\"site.css?v=old\" rel=\"stylesheet\">\n<link href=\"games/cylon/cylon.css?v=old\" rel=\"stylesheet\">\n"
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
$check('cylon-css-version', str_contains($html, "href=\"games/cylon/cylon.css?v={$v('games/cylon/cylon.css')}\""));
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
    'cylon.css is gone' => [str_replace('games/cylon/cylon.css?v=', 'games/cylon/other.css?v=', $now), 'index.html must reference games/cylon/cylon.css?v=... exactly once (found 0)'],
    'the cylon import has no version' => [str_replace("cylon.js?v=", 'cylon.js#', $now), 'index.html must reference games/cylon/cylon.js?v=... exactly once (found 0)'],
    'cylon.js is imported twice' => [$now . "import('./games/cylon/cylon.js?v=y');\n", 'index.html must reference games/cylon/cylon.js?v=... exactly once (found 2)'],
];
foreach ($cases as $name => [$broken, $expect]) {
    file_put_contents("$tmp/index.html", $broken);
    [$stale, $problems] = site_versions_sync($tmp, true);
    $check("bad-reference-fails: $name", $stale === false && in_array($expect, $problems, true) && $read('index.html') === $broken, json_encode($problems));
}
file_put_contents("$tmp/index.html", $now);
unlink("$tmp/main.js");
[, $problems] = site_versions_sync($tmp, false);
$check('unreadable-file-fails', $problems === ['index.html references main.js, which is not readable'], json_encode($problems));

// The repository's own page is in sync (run php games/cylon/tools/install-files.php, then php tools/site-versions.php).
[$stale, $problems] = site_versions_sync(dirname(__DIR__), false);
$check('repo-page-in-sync', $stale === false && $problems === [], json_encode([$stale, $problems]));

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "SITE-VERSIONS-OK\n" : "SITE-VERSIONS-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
