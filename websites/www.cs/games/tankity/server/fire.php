<?php
// Operation Tankity rooms. Fire, as the napalm burns: a pool of burning
// liquid found once by the earth's pour (room_pour_level) on the ground of
// that moment, which burns where it lies and never changes the ground, and
// the units its flames reach. src/fire.ts is the same to the last bit;
// protocol/sim-vectors.json pins the two together. Loaded by rooms.php after
// earth.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}
