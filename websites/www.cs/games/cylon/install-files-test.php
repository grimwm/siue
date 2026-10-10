<?php
// Tests for tools/install-files.php: this game's manifest. Run:
// php install-files-test.php (in this folder). Exit 0 when every check
// passes, 1 otherwise.
declare(strict_types=1);
require_once __DIR__ . '/tools/install-files.php';

$fail = 0;
$check = function (string $name, bool $cond, string $extra = '') use (&$fail): void {
    echo ($cond ? 'PASS' : 'FAIL') . ' ' . $name . ($extra !== '' ? ' :: ' . $extra : '') . "\n";
    if (!$cond) {
        $fail++;
    }
};

/** A valid solid-black $n x $n PNG, no GD needed. */
$png = function (int $n): string {
    $chunk = fn(string $type, string $data): string => pack('N', strlen($data)) . $type . $data . pack('N', crc32($type . $data));
    $rows = str_repeat("\0" . str_repeat("\0", $n * 3), $n);
    return "\x89PNG\r\n\x1a\n" . $chunk('IHDR', pack('NNCCCCC', $n, $n, 8, 2, 0, 0, 0))
        . $chunk('IDAT', gzcompress($rows)) . $chunk('IEND', '');
};

$tmp = sys_get_temp_dir() . '/cylon-install-files-test-' . getmypid();
$dir = "$tmp/mounted";
@mkdir($dir, 0777, true);
file_put_contents("$dir/metadata.yaml", "title: Mounted\ndescription: Runs in the site page.\nshort_name: Mnt\ntheme_color: \"#112233\"\nbackground_color: \"#445566\"\nstart: goGame\n");
foreach ([192, 512] as $n) {
    file_put_contents("$dir/icon-$n.png", $png($n));
}

[$stale] = install_sync($dir, false);
$check('check-finds-missing-manifest', $stale === ['manifest.webmanifest'], json_encode($stale));
$check('check-writes-nothing', !is_file("$dir/manifest.webmanifest"));
install_sync($dir, true);
[$stale] = install_sync($dir, false);
$check('clean-after-write', $stale === [], json_encode($stale));

// A mounted game has no page and no service worker; its app starts the site
// page, and the scope contains that start.
$m = json_decode((string) @file_get_contents("$dir/manifest.webmanifest"), true);
$check('manifest-parses', is_array($m));
$check('manifest-names-colors', ($m['name'] ?? null) === 'Mounted' && ($m['short_name'] ?? null) === 'Mnt'
    && ($m['theme_color'] ?? null) === '#112233' && ($m['background_color'] ?? null) === '#445566');
$check('manifest-start-url', ($m['start_url'] ?? null) === '../../?game=mounted');
$check('manifest-scope-contains-start', ($m['scope'] ?? null) === '../../'
    && str_starts_with($m['start_url'] ?? '', $m['scope'] ?? "\0"));
$check('manifest-no-id', !array_key_exists('id', $m));
$check('manifest-icons', array_column($m['icons'] ?? [], 'src') === ['icon-192.png', 'icon-512.png']);
$check('no-sw-no-page', !is_file("$dir/sw.js") && !is_file("$dir/index.html"));

// A hand-edited manifest is stale; write restores it.
$orig = file_get_contents("$dir/manifest.webmanifest");
file_put_contents("$dir/manifest.webmanifest", str_replace('Mounted', 'Other', $orig));
[$stale] = install_sync($dir, false);
$check('check-sees-edited-manifest', $stale === ['manifest.webmanifest'], json_encode($stale));
install_sync($dir, true);
$check('write-restores-manifest', file_get_contents("$dir/manifest.webmanifest") === $orig);

// A wrong-size icon fails (and says why).
file_put_contents("$dir/icon-512.png", $png(192));
[, $notes] = install_sync($dir, false);
$check('check-sees-wrong-size-icon', $notes === ['icon-512.png must be a 512x512 PNG'], json_encode($notes));

// metadata.yaml needs `start`.
file_put_contents("$dir/metadata.yaml", "title: Mounted\ndescription: x\nplay: index.html\n");
[, $notes] = install_sync($dir, false);
$check('needs-start', $notes === ['metadata.yaml: `start` is required'], json_encode($notes));

// Versions: each ?v= inside cylon.js is the content hash of the file it names.
file_put_contents("$dir/metadata.yaml", "title: Mounted\ndescription: Runs in the site page.\nstart: goGame\n");
file_put_contents("$dir/icon-512.png", $png(512));
@mkdir("$dir/js");
file_put_contents("$dir/js/rules.js", "export const a = 1;\n");
file_put_contents("$dir/js/scores.js", "export const b = 2;\n");
file_put_contents("$dir/mount.html", "<div id=\"cylon-eye\"></div>\n");
$entryOk = "import * as rules from './js/rules.js?v=old';\nimport { b } from './js/scores.js?v=old';\n"
    . "const MOUNT = new URL('mount.html?v=old', import.meta.url).href;\n";
file_put_contents("$dir/cylon.js", $entryOk);
$read = fn(string $f): string => (string) file_get_contents("$dir/$f");
$vOf = fn(string $content): string => substr(hash('sha256', $content), 0, 10);
install_sync($dir, true);
$check('versions-are-file-hashes',
    str_contains($read('cylon.js'), "rules.js?v={$vOf($read('js/rules.js'))}'")
    && str_contains($read('cylon.js'), "scores.js?v={$vOf($read('js/scores.js'))}'")
    && str_contains($read('cylon.js'), "mount.html?v={$vOf($read('mount.html'))}'"));
[$stale, $notes] = install_sync($dir, false);
$check('versions-clean-after-one-run', $stale === [] && $notes === [], json_encode([$stale, $notes]));
$entryNow = $read('cylon.js');
$check('rewrite-touches-only-versions', preg_replace('/\?v=[0-9a-f]+/', '?v=X', $entryNow) === preg_replace('/\?v=old/', '?v=X', $entryOk));

// A changed module or mount.html makes the entry stale, and only it.
file_put_contents("$dir/js/rules.js", "export const a = 3;\n");
[$stale] = install_sync($dir, false);
$check('check-sees-changed-module', $stale === ['cylon.js'], json_encode($stale));
install_sync($dir, true);
file_put_contents("$dir/mount.html", "<div id=\"cylon-eye\"></div><p>new</p>\n");
[$stale] = install_sync($dir, false);
$check('check-sees-changed-mount', $stale === ['cylon.js'], json_encode($stale));
install_sync($dir, true);
[$stale] = install_sync($dir, false);
$check('check-clean-again', $stale === [], json_encode($stale));

// A missing or duplicate reference fails loudly and writes nothing.
$entryNow = $read('cylon.js');
$cases = [
    'a module is not imported' => [str_replace("import { b } from './js/scores.js?v=", "// ", $entryNow), 'cylon.js must import ./js/scores.js?v=... exactly once (found 0)'],
    'a module is imported twice' => [$entryNow . "import { z } from './js/rules.js?v=x';\n", 'cylon.js must import ./js/rules.js?v=... exactly once (found 2)'],
    'an import names a missing module' => [$entryNow . "import { z } from './js/gone.js?v=x';\n", 'cylon.js imports js/gone.js, which does not exist'],
    'the mount fetch has no version' => [str_replace('mount.html?v=', 'mount.html#', $entryNow), "cylon.js must reference 'mount.html?v=...' exactly once (found 0)"],
    'the mount is fetched twice' => [$entryNow . "const AGAIN = 'mount.html?v=x';\n", "cylon.js must reference 'mount.html?v=...' exactly once (found 2)"],
];
foreach ($cases as $name => [$broken, $expect]) {
    file_put_contents("$dir/cylon.js", $broken);
    $manifestBefore = $read('manifest.webmanifest');
    [$stale, $notes] = install_sync($dir, true);
    $check("missing-reference-fails: $name", $stale === [] && in_array($expect, $notes, true) && $read('cylon.js') === $broken
        && $read('manifest.webmanifest') === $manifestBefore, json_encode([$stale, $notes]));
}
file_put_contents("$dir/cylon.js", $entryNow);
unlink("$dir/mount.html");
[, $notes] = install_sync($dir, false);
$check('a-missing-mount-fails', $notes === ['mount.html is not readable, but cylon.js fetches it'], json_encode($notes));
file_put_contents("$dir/mount.html", "<div></div>\n");
unlink("$dir/cylon.js");
[, $notes] = install_sync($dir, false);
$check('js-without-an-entry-fails', $notes === ['cylon.js is not readable, but js/ exists'], json_encode($notes));

// This game's own manifest is in sync with its metadata.
[$stale, $notes] = install_sync(__DIR__, false);
$check('repo-game-in-sync', $stale === [] && $notes === [], 'run: php tools/install-files.php (stale: ' . implode(', ', $stale) . ')');

exec('rm -rf ' . escapeshellarg($tmp));
echo $fail === 0 ? "INSTALL-FILES-OK\n" : "INSTALL-FILES-FAIL $fail\n";
exit($fail === 0 ? 0 : 1);
