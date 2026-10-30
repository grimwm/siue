<?php
// Validates the studio configuration JSON on stdin: prints it back and exits 0, or says why and exits 1.
// deploy.sh pipes the STUDIO_CONFIG field through this before it stages admin/config/studio.json.
declare(strict_types=1);

require_once __DIR__ . '/../admin/lib/People.php';

$json = (string) stream_get_contents(STDIN);
if (Admin\People::fromJson($json) === null) {
    fwrite(STDERR, "studio-config: not valid. Expected {\"people\":[{\"email\":\"a@siue.edu\",\"admin\":false,\"allowance\":false}],\"max_accounts\":500,\"max_shared_bytes\":1073741824}; each email a plain @siue.edu address, caps positive integers.\n");
    exit(1);
}
echo rtrim($json), "\n";
exit(0);
