<?php
// The music workroom's server code: the admin kit plus the music classes.
declare(strict_types=1);

require_once __DIR__ . '/../../admin/lib/bootstrap.php';
require_once __DIR__ . '/PublicKeys.php';
require_once __DIR__ . '/Store.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Api.php';
require_once __DIR__ . '/Pages.php';

function music_public_keys(): ?Music\PublicKeys
{
    $path = getenv('MUSIC_PUBLIC_KEYS') ?: __DIR__ . '/../keys/public.json';
    return Music\PublicKeys::fromFile($path);
}

function music_store(\PDO $db, Admin\Clock $clock): Music\Store
{
    return new Music\Store($db, Admin\Db::dataDir() . '/music', $clock, music_public_keys());
}
