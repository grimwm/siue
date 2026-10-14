<?php
// Operation Tankity rooms. The earth, as the shells move it: craters, dirt,
// pools of liquid dirt, slumping slopes, a digger's trench and a riot charge's
// scoop, each a pure function of the height map. src/earth.ts is the same ops
// to the last bit; protocol/sim-vectors.json pins the two together. Loaded by
// rooms.php after sim.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}
