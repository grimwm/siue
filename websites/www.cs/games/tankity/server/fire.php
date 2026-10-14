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

/* A napalm shell's pool: $volume px^2 of burning liquid poured at column x
// comes to rest as liquid dirt would (room_pour_level: it runs to the bottom
// of the dip it landed in, and what would reach an edge spills off), on the
// ground of this moment, which it never changes; its flames stand $flame px
// over its level. ['level', 'x0', 'x1', 'flame'] (x0 > x1: no pool).
// src/fire.ts firePool() is the same. */
function room_fire_pool(array $terrain, float $x, float $volume, float $flame): array
{
    $p = room_pour_level($terrain, $x, $volume);
    return ['level' => (float) $p['level'], 'x0' => (int) $p['x0'], 'x1' => (int) $p['x1'], 'flame' => $flame];
}
/* Whether a unit's body ($box, room_unit_box: [cx, cy, rx, ry]) reaches into a
// pool's flames: a pooled column within its width (cx - rx .. cx + rx), and
// its bottom (cy + ry) at or below the flames' top (the level less flame).
// src/fire.ts inFlames() is the same. */
function room_in_flames(array $pool, array $box): bool
{
    [$cx, $cy, $rx, $ry] = $box;
    if ($pool['x0'] > $pool['x1']) {
        return false;
    }
    $a = max((int) $pool['x0'], (int) ceil($cx - $rx));
    $z = min((int) $pool['x1'], (int) floor($cx + $rx));
    return $a <= $z && $cy + $ry >= $pool['level'] - $pool['flame'];
}
/* The ticks a pool burns: one every $tick seconds while it burns ($burn
// seconds). src/fire.ts burnTicks() is the same. */
function room_burn_ticks(float $burn, float $tick): int
{
    return (int) floor($burn / $tick + 1e-9);
}
/* A tick's length in 1/60 s sim steps (the browser counts steps, not
// seconds). src/fire.ts tickSteps() is the same. */
function room_tick_steps(float $tick): int
{
    return max(1, (int) floor($tick * 60 + 0.5));
}
/* What $ticks ticks of $dmg cost a unit in all: a shield eats the first whole
// (then is gone), a bunker halves each (never below 1). The drones weigh a
// pool with this; the burn itself hurts tick by tick through room_hit_unit.
// src/fire.ts burnTotal() is the same. */
function room_burn_total(int $dmg, int $ticks, bool $shield, bool $bunker): int
{
    $n = max(0, $ticks - ($shield && $ticks > 0 ? 1 : 0));
    return $n * ($bunker ? max(1, (int) round($dmg / 2)) : $dmg);
}
