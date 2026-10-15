<?php
// Operation Tankity rooms. The arena's walls: the field's left and right
// edges. None leaves them open; Concrete bursts a shell on the wall; Rubber
// and Spring bounce it back (ROOM_RUBBER_KEEP, ROOM_SPRING_KICK times its
// speed across the wall); Wraparound carries it to the other side at the
// same height and velocity. The top is open in every mode. Random is a
// setting: each round plays one real wall (room_walls_for). The same to the
// last bit as src/walls.ts, kept in step by the `walls` group of
// protocol/sim-vectors.json. Loaded by rooms.php (and by tools/game-json.php
// with server/flight.php, whose step calls room_wall_step); it runs nothing
// on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php (or tools/game-json.php) defines its constant, then requires the file.
if (!defined('TANKITY_ROOMS_INCLUDED') && !defined('TANKITY_FLIGHT_TOOL')) {
    http_response_code(404);
    exit;
}

/* src/walls.ts WALLS, REAL_WALLS and WALL_SETTINGS: every wall the sim knows,
   what Random draws from, and every pick a host may make. */
const ROOM_WALLS = ['none', 'concrete', 'rubber', 'spring', 'wrap'];
const ROOM_REAL_WALLS = ['concrete', 'rubber', 'spring', 'wrap'];
const ROOM_WALL_SETTINGS = ['none', 'concrete', 'rubber', 'spring', 'wrap', 'random'];
const ROOM_WALL_NAMES = ['none' => 'None', 'concrete' => 'Concrete', 'rubber' => 'Rubber', 'spring' => 'Spring', 'wrap' => 'Wraparound', 'random' => 'Random'];
const ROOM_RUBBER_KEEP = 0.7;
const ROOM_SPRING_KICK = 1.3;
/* What a step did at a wall (src/walls.ts WALL_*). */
const ROOM_WALL_NONE = 0;
const ROOM_WALL_BOUNCE = 1;
const ROOM_WALL_WRAP = 2;
const ROOM_WALL_BURST = 3;

/* The host's pick: one of ROOM_WALL_SETTINGS; anything else (a room from
   before the setting) is None. */
function room_walls_setting(array $room): string
{
    $w = $room['walls'] ?? null;
    return is_string($w) && in_array($w, ROOM_WALL_SETTINGS, true) ? $w : 'none';
}
/* The wall this round plays (never Random); anything else is None. */
function room_walls_now(array $room): string
{
    $w = $room['wallsNow'] ?? null;
    return is_string($w) && in_array($w, ROOM_WALLS, true) ? $w : 'none';
}
/* src/walls.ts wallsFor(): the setting itself, or for Random one real wall
   by one draw of the round's stream. Only Random draws. */
function room_walls_for(string $setting, int &$rng): string
{
    if ($setting !== 'random') {
        return in_array($setting, ROOM_WALLS, true) ? $setting : 'none';
    }
    $n = count(ROOM_REAL_WALLS);
    return ROOM_REAL_WALLS[min($n - 1, (int) floor(room_rng_next($rng) * $n))];
}
/* src/walls.ts wallsDam(): liquid pools against a solid wall. */
function room_walls_dam(string $walls): bool
{
    return $walls === 'concrete' || $walls === 'rubber' || $walls === 'spring';
}
/* src/walls.ts wallsBounce(). */
function room_walls_bounce(string $walls): bool
{
    return $walls === 'rubber' || $walls === 'spring';
}
/* src/walls.ts wallKeep(). */
function room_wall_keep(string $walls): float
{
    return $walls === 'spring' ? ROOM_SPRING_KICK : ROOM_RUBBER_KEEP;
}
/* src/walls.ts wallStep(): a flight's step from ($px, $py) to ($x, $y)
   against the walls of a field $fw wide, in place. Concrete and the bouncing
   walls stand at x = 0 and x = $fw - 1; Wraparound joins x = 0 to x = $fw. */
function room_wall_step(float &$x, float &$y, float &$vx, string $walls, int $fw, float $px, float $py): int
{
    if ($walls === 'none') {
        return ROOM_WALL_NONE;
    }
    if ($walls === 'wrap') {
        if ($x < 0) {
            $x += $fw;
            return ROOM_WALL_WRAP;
        }
        if ($x >= $fw) {
            $x -= $fw;
            return ROOM_WALL_WRAP;
        }
        return ROOM_WALL_NONE;
    }
    $right = (float) ($fw - 1);
    if ($x >= 0 && $x <= $right) {
        return ROOM_WALL_NONE;
    }
    $wx = $x < 0 ? 0.0 : $right;
    if ($walls === 'concrete') {
        $dx = $x - $px;
        $f = $dx == 0.0 ? 1.0 : max(0.0, min(1.0, ($wx - $px) / $dx));
        $y = $py + ($y - $py) * $f;
        $x = $wx;
        return ROOM_WALL_BURST;
    }
    $x = max(0.0, min($right, 2 * $wx - $x));
    $vx = -$vx * room_wall_keep($walls);
    return ROOM_WALL_BOUNCE;
}
/* src/walls.ts wallRoll(): a roller at $x (its speed along the ground $u) on a
   field $n columns wide, in place. */
function room_wall_roll(float &$x, float &$u, string $walls, int $n): int
{
    $right = (float) ($n - 1);
    if ($x >= 0 && $x <= $right) {
        return ROOM_WALL_NONE;
    }
    if ($walls === 'wrap') {
        $x += $x < 0 ? $right : -$right;
        return ROOM_WALL_WRAP;
    }
    if (!room_walls_bounce($walls)) {
        return ROOM_WALL_NONE;
    }
    $wx = $x < 0 ? 0.0 : $right;
    $x = max(0.0, min($right, 2 * $wx - $x));
    $u = -$u * room_wall_keep($walls);
    return ROOM_WALL_BOUNCE;
}
/* src/sim.ts rollEdge(): a roller stops at the board's edge with no wall to
   roll it back or on. */
function room_roll_edge(int $n, float $x, string $walls): bool
{
    return !room_walls_bounce($walls) && $walls !== 'wrap' && ($x <= 0 || $x >= $n - 1);
}
