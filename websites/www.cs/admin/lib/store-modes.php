<?php
// The kit's file modes (games/_kit/php/score-guard.php), which store-dir.php
// needs. The class below is a verbatim copy of the kit's StoreModes.
declare(strict_types=1);

namespace Kit;

// A library, never an endpoint.
if ((get_included_files()[0] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

/**
 * The file modes a game's PHP uses, decided in one place. PHP runs either as
 * the account that deployed the game or as a web user every site on the host
 * shares (what Cylon's 0666/0777 assumed). A path only PHP writes is 0700/0600
 * either way: its owner is PHP's user, and that is all PHP needs. A path the
 * deploy account also writes (a game's own data/ folder) must be open to both
 * when they are different users. With a shared web user, any other site's PHP
 * runs as that same user and can read and write what this one stores; no
 * mode prevents that.
 */
final class StoreModes
{
    /** PHP's effective user is the owner of the running script: the deploying account. */
    public static function phpIsOwner(): bool
    {
        return !function_exists('posix_geteuid') || posix_geteuid() === getmyuid();
    }

    /** @return array{dir: int, file: int, sharedDir: int, sharedFile: int} */
    public static function modes(?bool $phpIsOwner = null): array
    {
        $own = $phpIsOwner ?? self::phpIsOwner();
        return ['dir' => 0700, 'file' => 0600, 'sharedDir' => $own ? 0700 : 0777, 'sharedFile' => $own ? 0600 : 0666];
    }
}
