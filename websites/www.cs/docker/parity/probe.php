<?php
// Reports what a PHP runtime loaded, as JSON. docker/check-parity.sh runs it
// through FPM in the image; upload it to www.cs.siue.edu under a random name
// (scp -p, mode 644), curl it, and delete it to refresh the expected lists.
header('Content-Type: application/json');
$ext = get_loaded_extensions();
sort($ext, SORT_FLAG_CASE | SORT_STRING);
echo json_encode([
    'php' => PHP_VERSION,
    'sapi' => PHP_SAPI,
    'extensions' => $ext,
    'ini' => ini_get_all(null, false),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
