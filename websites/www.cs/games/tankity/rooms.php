<?php
// Operation Tankity: game rooms. Friends play together; the server referees.
// No chat channel exists anywhere, names are 3-letter initials only, and the
// obscenity rule mirrors the cylon game (shared BLOCKED_INITIALS philosophy:
// an exact-3 uppercase set, enforced here AND in the browser).
//
// Anti-cheat model (server authority, no trust in the client):
//   - Clients send INTENTS only (aim/fire/drive/weapon/buy). They never send
//     hit info, damage, positions, or scores; every impact is simulated here.
//   - The terrain seed never leaves the server. Clients receive the height
//     array and tank positions, never the seed, so nothing can be recomputed
//     or pre-played elsewhere.
//   - Every act needs the seat's unguessable token PLUS the room CSRF token,
//     and Origin is checked when present. Aim/power/drive/fuel/ammo/cash are
//     range-checked against authoritative state; turn order is enforced.
//   - AI seats (the default for seats nobody holds) run the same sim inline, so no cron is needed.
//
// Storage: rooms live in SysV shared memory, never on disk. A host restart
// wipes the shelf, which is the point: rooms are play sessions, not records.
// (Score files stay on disk next to where rooms used to be.) One semaphore
// guards the whole registry, so concurrent shots cannot corrupt each other.
declare(strict_types=1);

// A JSON API must never leak diagnostics into its output: one stray warning
// and every client sees a page instead of game data. Errors still reach the
// server log; they just stop hijacking responses.
ini_set('display_errors', '0');

require_once __DIR__ . '/config.php';

const ROOM_GAME = 'operation-tankity';
const ROOM_CODE_LEN = 4;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const ROOM_SEATS = 4; // seat 0 is always the host; every other seat starts as AI
const ROOM_AI_NAMES = ['REAPER', 'WRAITH', 'SPOTTER'];
const ROOM_MAX_ROOMS = 10; // built-in default; .config.yaml and env can raise it
function room_max_rooms(): int
{
    $raw = (string) tankity_setting('TANKITY_MAX_ROOMS', 'max_rooms', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(1, (int) trim($raw));
    }
    return ROOM_MAX_ROOMS;
}
function room_max_age(): int
{
    $raw = (string) tankity_setting('TANKITY_ROOM_MAX_AGE', 'room_max_age', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(60, (int) trim($raw));
    }
    return 86400;
}
function room_live_secs(): int
{
    $raw = (string) tankity_setting('TANKITY_ROOM_LIVE_SECS', 'room_live_secs', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return max(60, (int) trim($raw));
    }
    return 600;
}
/* Occupied means alive: a room nobody has touched recently is an abandoned
// husk. It still rejoins by code until the sweep deletes it, but it no
// longer holds one of the scarce slots. */
function room_count(): int
{
    return room_shm_count();
}
function room_shm_count(): int
{
    $lock = room_shm_lock();
    $reg = room_registry_get();
    room_unlock($lock);
    $live = 0;
    $cutoff = time() - room_live_secs();
    foreach ($reg as $room) {
        if (!is_array($room)) {
            continue;
        }
        $t = $room['touched'] ?? $room['created'] ?? 0;
        if ($t >= $cutoff) {
            $live++;
        }
    }
    return $live;
}
// Curated hills. Friends pick these by public id ("canyon 3"); the seeds stay
// on the server, so a favorite hillside replays without ever revealing them.
const ROOM_MAPS = [
    'canyon 3' => ['name' => 'Canyon 3', 'seed' => 'tankity-canyon-three'],
    'twin hills' => ['name' => 'Twin Hills', 'seed' => 'tankity-twin-hills'],
    'dusty bowl' => ['name' => 'Dusty Bowl', 'seed' => 'tankity-dusty-bowl'],
    'high pass' => ['name' => 'High Pass', 'seed' => 'tankity-high-pass'],
    'crater field' => ['name' => 'Crater Field', 'seed' => 'tankity-crater-field'],
    'riverbed' => ['name' => 'Riverbed', 'seed' => 'tankity-riverbed'],
];
function room_map_lookup($raw): ?string
{
    if (!is_string($raw)) {
        return null;
    }
    $id = strtolower(trim(preg_replace('/\s+/', ' ', $raw)));
    return isset(ROOM_MAPS[$id]) ? $id : null;
}
function room_map_name(?string $id): string
{
    if ($id !== null && isset(ROOM_MAPS[$id])) {
        return ROOM_MAPS[$id]['name'];
    }
    return 'Random hills';
}
/* A picked map's silhouette for the lobby tiles: round one's terrain, from
// the same hidden seed room_start_round() uses, sampled to ROOM_PROFILE_N
// heights. 0 is the lowest ground the generator allows, 1 the highest. */
const ROOM_PROFILE_N = 48;
function room_map_profile(string $id): array
{
    $w = 720;
    $mrng = room_hash_seed(ROOM_MAPS[$id]['seed'] . '|round1');
    $t = room_gen_terrain($mrng, $w);
    $out = [];
    for ($i = 0; $i < ROOM_PROFILE_N; $i++) {
        $x = (int) round($i * ($w - 1) / (ROOM_PROFILE_N - 1));
        $out[] = round((415.0 - $t[$x]) / (415.0 - 190.0), 3);
    }
    return $out;
}
const ROOM_AI_IDS = ['reaper', 'wraith', 'spotter'];
const ROOM_TURN_WIND = 2.2;
const ROOM_GRAV = 95;

// Mirrors cylon: exact-3 uppercase initials, blocked set enforced both sides.
// (Keep in sync with BLOCKED_INITIALS in game.js.)
const BLOCKED_INITIALS = [
    'ASS',
    'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
    'SHT', 'SHI',
    'DIK', 'DIC', 'DCK',
    'COK', 'COC', 'COQ',
    'CUM', 'JIZ',
    'CNT', 'PUS', 'VAG', 'CLT',
    'SEX', 'XXX', 'TIT',
    'FAG', 'FGT',
    'NIG', 'NGR',
    'WTF', 'FFS',
    'POO', 'PEE',
    'KKK',
];

/* Room score files still live on disk (scores are files; rooms are not),
using the scores setting with the same /var/tmp default as scores.php. */
function room_scores_dir(): string
{
    $d = (string) tankity_setting('TANKITY_SCORES_DIR', 'scores_dir', '');
    if (trim($d) !== '') {
        return rtrim(trim($d), '/');
    }
    return '/var/tmp';
}
function room_shm_key(): int
{
    $raw = (string) tankity_setting('TANKITY_SHM_KEY', 'shm_key', '');
    if (preg_match('/^\d+$/', trim($raw))) {
        return (int) trim($raw);
    }
    $k = @ftok(__FILE__, 'R');
    return $k === -1 ? 0x54414e4b : $k;
}
const ROOM_SHM_SIZE = 2097152;
const ROOM_SHM_VAR = 1;
/* Rooms live in SysV shared memory, full stop: no disk fallback. Without
// the semaphore functions every room endpoint honestly reports the store
// as unavailable instead of serving a second, divergent shelf. */
function room_use_shm(): bool
{
    static $v = null;
    if ($v === null) {
        $v = function_exists('sem_get') && function_exists('shm_attach');
    }
    return $v;
}
/* Crash-proof shelf lock. A PHP fatal (timeout, memory limit) between
// acquire and release would otherwise wedge the semaphore at zero and brick
// every room: shutdown always lets go, acquisition never blocks forever,
// and a lock held far past any millisecond critical section belongs to a
// holder that died hard (kill -9), so it is reset instead of obeyed. */
$ROOM_SHM_DEPTH = 0;
$ROOM_SHM_HELD = false;
function room_shm_lock()
{
    global $ROOM_SHM_DEPTH, $ROOM_SHM_HELD;
    static $guard = false;
    if (!$guard) {
        $guard = true;
        register_shutdown_function('room_shm_release_all');
    }
    if ($ROOM_SHM_DEPTH > 0) {
        $ROOM_SHM_DEPTH++;
        return @sem_get(room_shm_key(), 1);
    }
    $deadline = microtime(true) + 5.0;
    while (true) {
        $sem = @sem_get(room_shm_key(), 1);
        if ($sem !== false && @sem_acquire($sem, true)) {
            $ROOM_SHM_DEPTH = 1;
            $ROOM_SHM_HELD = true;
            return $sem;
        }
        if (microtime(true) >= $deadline) {
            break;
        }
        usleep(50000);
    }
    $sem = @sem_get(room_shm_key(), 1);
    if ($sem !== false) {
        @sem_remove($sem);
    }
    $sem = @sem_get(room_shm_key(), 1);
    if ($sem !== false && @sem_acquire($sem, true)) {
        $ROOM_SHM_DEPTH = 1;
        $ROOM_SHM_HELD = true;
        return $sem;
    }
    room_json_out(500, ['error' => 'room memory is unavailable on this server']);
}
function room_shm_release_all(): void
{
    global $ROOM_SHM_DEPTH, $ROOM_SHM_HELD;
    if (!$ROOM_SHM_HELD) {
        return;
    }
    $ROOM_SHM_HELD = false;
    $ROOM_SHM_DEPTH = 0;
    $sem = @sem_get(room_shm_key(), 1);
    if ($sem !== false) {
        @sem_release($sem);
    }
}
function room_registry_get(): array
{
    $id = @shm_attach(room_shm_key(), ROOM_SHM_SIZE);
    if ($id === false) {
        return [];
    }
    $v = @shm_get_var($id, ROOM_SHM_VAR);
    @shm_detach($id);
    return is_array($v) ? $v : [];
}
function room_registry_put(array $reg): bool
{
    $id = @shm_attach(room_shm_key(), ROOM_SHM_SIZE);
    if ($id === false) {
        return false;
    }
    $ok = @shm_put_var($id, ROOM_SHM_VAR, $reg);
    @shm_detach($id);
    return (bool) $ok;
}
function room_json_out(int $code, array $payload): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}
function room_rand_token(int $bytes = 32): string
{
    return bin2hex(random_bytes($bytes));
}
function room_new_code(callable $exists): string
{
    $alpha = ROOM_CODE_ALPHABET;
    $n = strlen($alpha);
    do {
        $code = '';
        for ($i = 0; $i < ROOM_CODE_LEN; $i++) {
            $code .= $alpha[random_int(0, $n - 1)];
        }
    } while ($exists($code));
    return $code;
}
/* Cylon-style initials, case kept as typed: exactly 3 letters, and the
 * uppercased form must not be blocked. */
function room_valid_initials($raw): ?string
{
    if (!is_string($raw)) {
        return null;
    }
    $s = trim($raw);
    if (!preg_match('/^[A-Za-z]{3}$/', $s)) {
        return null;
    }
    if (in_array(strtoupper($s), BLOCKED_INITIALS, true)) {
        return null;
    }
    return $s;
}
function room_origin_ok(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return true; // curl-style callers send none; the tokens still gate them
    }
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $host = preg_replace('/:\d+$/', '', $host);
    $o = parse_url($origin, PHP_URL_HOST);
    return is_string($o) && $o !== '' && strcasecmp($o, $host) === 0;
}

/* ---------- deterministic sim: bit-identical integer core to game.js ---------- */
function u32(int $v): int
{
    return $v & 0xFFFFFFFF;
}
/* Exact low 32 bits of the product, 16-bit halves at a time: a full u32
// multiply overflows into float and loses precision (and PHP 8.1+ prints a
// deprecation that corrupts the JSON). Matches Math.imul, bit for bit. */
function imul32(int $a, int $b): int
{
    $a &= 0xFFFFFFFF;
    $b &= 0xFFFFFFFF;
    $lo = ($a & 0xFFFF) * ($b & 0xFFFF);
    $mid = (($a >> 16) * ($b & 0xFFFF) + ($a & 0xFFFF) * ($b >> 16)) & 0xFFFF;
    return ($lo + ($mid << 16)) & 0xFFFFFFFF;
}
function room_hash_seed(string $str): int
{
    $h = u32(1779033703 ^ strlen($str));
    $len = strlen($str);
    for ($i = 0; $i < $len; $i++) {
        $h = imul32($h ^ ord($str[$i]), 3432918353);
        $h = u32(($h << 13) | ($h >> 19));
    }
    return u32($h);
}
/* Advances $a (by reference) and returns a float in [0,1). */
function room_rng_next(int &$a): float
{
    $a = u32($a + 0x6D2B79F5);
    $t = imul32($a ^ ($a >> 15), 1 | $a);
    $t = u32($t + imul32($t ^ ($t >> 7), 61 | $t)) ^ $t;
    return (float)(u32($t ^ ($t >> 14))) / 4294967296.0;
}
function room_rng_range(int &$a, float $lo, float $hi): float
{
    return $lo + room_rng_next($a) * ($hi - $lo);
}
function room_gauss(int &$a): float
{
    return (room_rng_next($a) + room_rng_next($a) + room_rng_next($a) - 1.5) * 2.0;
}
function room_gen_terrain(int &$rng, int $w): array
{
    $a = [20 + room_rng_next($rng) * 30, 10 + room_rng_next($rng) * 22, 5 + room_rng_next($rng) * 12];
    $p = [room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28, room_rng_next($rng) * 6.28];
    $f = [1 / 260 + room_rng_next($rng) / 500, 1 / 120 + room_rng_next($rng) / 260, 1 / 47 + room_rng_next($rng) / 120];
    $t = [];
    for ($x = 0; $x < $w; $x++) {
        $y = 330
            + $a[0] * sin($x * $f[0] + $p[0])
            + $a[1] * sin($x * $f[1] + $p[1])
            + $a[2] * sin($x * $f[2] + $p[2]);
        $t[$x] = max(190.0, min(415.0, $y));
    }
    return $t;
}
/* The arsenal lives in game.yaml, served as game.json (tools/game-json.php
// writes it): the browser reads the same file, so prices, packs, ballistics,
// and effects can never disagree. When the file is missing the baked fallback
// below keeps rooms rolling. */
function room_arsenal(): array
{
    static $a = null;
    if ($a !== null) {
        return $a;
    }
    $a = false;
    $raw = @file_get_contents(__DIR__ . '/game.json');
    if ($raw !== false) {
        $d = json_decode($raw, true);
        if (is_array($d) && isset($d['arsenal']['ammo']) && is_array($d['arsenal']['ammo'])) {
            $a = $d['arsenal'];
        }
    }
    if ($a === false) {
        $a = ['ammo' => [
            ['key' => 'shell', 'name' => 'Shell', 'dmg' => 34, 'radius' => 26, 'price' => 0, 'pack' => 0, 'minRound' => 1, 'ai' => true, 'aiRound' => 1, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'buck', 'name' => 'Buckshot', 'dmg' => 17, 'radius' => 20, 'price' => 80, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 2, 'effect' => 'pellets', 'pellets' => 3, 'spread' => 0.10, 'speed' => 1.0],
            ['key' => 'mortar', 'name' => 'Mortar', 'dmg' => 56, 'radius' => 42, 'price' => 200, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 3, 'effect' => 'shot', 'speed' => 1.0],
            ['key' => 'rail', 'name' => 'Rail', 'dmg' => 56, 'radius' => 15, 'price' => 140, 'pack' => 2, 'minRound' => 1, 'ai' => true, 'aiRound' => 5, 'effect' => 'shot', 'flat' => true, 'speed' => 1.0],
            ['key' => 'nuke', 'name' => 'NUKE', 'dmg' => 95, 'radius' => 70, 'price' => 500, 'pack' => 1, 'minRound' => 4, 'ai' => false, 'aiRound' => 99, 'effect' => 'shot', 'speed' => 1.0],
        ], 'gear' => [
            ['key' => 'repair', 'name' => 'Repair +40 armor', 'price' => 120, 'n' => 40, 'effect' => 'repair'],
            ['key' => 'fuel', 'name' => 'Fuel +60', 'price' => 60, 'n' => 60, 'effect' => 'fuel'],
        ]];
    }
    return $a;
}
function room_weapons(): array
{
    // One table for ballistics, shop packs, prices, and round unlocks.
    static $w = null;
    if ($w !== null) {
        return $w;
    }
    $w = [];
    foreach (room_arsenal()['ammo'] as $am) {
        if (!isset($am['key'])) {
            continue;
        }
        $w[(string) $am['key']] = [
            'dmg' => (int) ($am['dmg'] ?? 30),
            'radius' => (int) ($am['radius'] ?? 24),
            'price' => (int) ($am['price'] ?? 0),
            'pack' => (int) ($am['pack'] ?? 0),
            'minRound' => (int) ($am['minRound'] ?? 1),
            'effect' => (string) ($am['effect'] ?? 'shot'),
            'speed' => (float) ($am['speed'] ?? 1.0),
            'flat' => !empty($am['flat']),
            'pellets' => (int) ($am['pellets'] ?? 0),
            'spread' => (float) ($am['spread'] ?? 0.0),
            'fuse' => (float) ($am['fuse'] ?? 0.9),
            'split' => (int) ($am['split'] ?? 4),
            'fan' => (float) ($am['fan'] ?? 0.22),
            'subDmg' => (int) ($am['subDmg'] ?? ($am['dmg'] ?? 30)),
            'subRadius' => (int) ($am['subRadius'] ?? ($am['radius'] ?? 24)),
            'prox' => (float) ($am['prox'] ?? 34.0),
            'steer' => (float) ($am['steer'] ?? 70.0),
            'drain' => (int) ($am['drain'] ?? 0),
            'ai' => !empty($am['ai']),
            'aiRound' => (int) ($am['aiRound'] ?? 99),
        ];
    }
    if (!isset($w['shell'])) {
        $w['shell'] = ['dmg' => 34, 'radius' => 26, 'price' => 0, 'pack' => 0, 'minRound' => 1, 'effect' => 'shot', 'speed' => 1.0, 'flat' => false, 'pellets' => 0, 'spread' => 0.0, 'fuse' => 0.9, 'split' => 4, 'fan' => 0.22, 'subDmg' => 34, 'subRadius' => 26, 'prox' => 34.0, 'steer' => 70.0, 'drain' => 0, 'ai' => true, 'aiRound' => 1];
    }
    return $w;
}
function room_gear(string $key): ?array
{
    foreach (room_arsenal()['gear'] as $g) {
        if (($g['key'] ?? null) === $key) {
            return $g;
        }
    }
    return null;
}
function room_shot_speed(float $power, bool $flat, float $mult = 1.0): float
{
    return ($flat ? 140.0 + $power * 3.2 : 40.0 + $power * 2.4) * $mult;
}
/* Full trajectory; returns landing info. Mirrors game.js simShot. */
function room_sim_shot(array $terrain, float $wind, float $x, float $y, float $angle, float $power, string $wkey, int $dirS, int $w): array
{
    $weapons = room_weapons();
    $flat = !empty($weapons[$wkey]['flat']);
    $rad = deg2rad($angle);
    $vx = cos($rad) * room_shot_speed($power, $flat, (float) ($weapons[$wkey]['speed'] ?? 1.0)) * $dirS;
    $vy = -sin($rad) * room_shot_speed($power, $flat, (float) ($weapons[$wkey]['speed'] ?? 1.0));
    $grav = $flat ? 90.0 : (float) ROOM_GRAV;
    $dt = 1 / 60;
    for ($i = 0; $i < 720; $i++) {
        $vx += $wind * ROOM_TURN_WIND * $dt;
        $vy += $grav * $dt;
        $x += $vx * $dt;
        $y += $vy * $dt;
        if ($x < 0 || $x >= $w || $y >= 500) {
            return ['x' => $x, 'y' => $y, 'oob' => true];
        }
        $xi = max(0, min($w - 1, (int) round($x)));
        if ($y >= $terrain[$xi]) {
            return ['x' => $x, 'y' => $y, 'oob' => false];
        }
    }
    return ['x' => $x, 'y' => $y, 'oob' => true];
}
function room_explode(array &$room, array &$events, array $tank, string $wkey, float $x, float $y, ?int $directIdx, $ov = null): void
{
    $weapons = room_weapons();
    $w = $weapons[$wkey] ?? $weapons['shell'];
    $dmg0 = (int) (($ov !== null && isset($ov['dmg'])) ? $ov['dmg'] : $w['dmg']);
    $r = (float) (($ov !== null && isset($ov['radius'])) ? $ov['radius'] : $w['radius']);
    $width = count($room['terrain']);
    $x0 = max(0, (int) floor($x - $r));
    $x1 = min($width - 1, (int) ceil($x + $r));
    for ($ix = $x0; $ix <= $x1; $ix++) {
        $dx = $ix - $x;
        $cut = sqrt(max(0.0, $r * $r - $dx * $dx)) * 0.75;
        $room['terrain'][$ix] = min(456.0, max($room['terrain'][$ix], $y + $cut));
    }
    foreach ($room['tanks'] as $idx => &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        // Distance from the unit's body (its hit box centre), drone or tank.
        [$cx, $cy] = room_unit_box($t);
        $d = hypot($cx - $x, $cy - $y);
        if ($d > $r + 14) {
            continue;
        }
        // A shield absorbs one hit whole, then it is gone.
        if ($t['kind'] === 'human' && ($room['shield'][$t['seat']] ?? false)) {
            $room['shield'][$t['seat']] = false;
            $events[] = ['t' => 'shield', 'seat' => $t['seat'], 'by' => $tank['seat']];
            continue;
        }
        $dmg = (int) round($dmg0 * max(0.3, 1 - $d / ($r + 14)));
        if ($directIdx !== null && $directIdx === $idx) {
            $dmg *= 2;
        }
        // A bunker halves everything that gets through.
        if ($t['kind'] === 'human' && ($room['bunker'][$t['seat']] ?? 0) > 0) {
            $dmg = max(1, (int) round($dmg / 2));
        }
        $t['hp'] = max(0, $t['hp'] - $dmg);
        if (($w['effect'] ?? 'shot') === 'emp') {
            $t['fuel'] = max(0.0, ($t['fuel'] ?? 0.0) - (float) ($w['drain'] ?? 0));
        }
        $events[] = ['t' => 'hit', 'seat' => $t['seat'], 'dmg' => $dmg, 'by' => $tank['seat'], 'direct' => $directIdx === $idx];
        if ($tank['kind'] === 'human' && $t['kind'] === 'ai') {
            $room['scores'][$tank['seat']] = ($room['scores'][$tank['seat']] ?? 0) + $dmg * 2;
            $room['cash'][$tank['seat']] = ($room['cash'][$tank['seat']] ?? 0) + $dmg * 2;
        }
        if ($t['hp'] <= 0) {
            $events[] = ['t' => 'kill', 'seat' => $t['seat'], 'by' => $tank['seat']];
            if ($tank['kind'] === 'human' && $t['kind'] === 'ai') {
                $room['scores'][$tank['seat']] = ($room['scores'][$tank['seat']] ?? 0) + 300;
                $room['cash'][$tank['seat']] = ($room['cash'][$tank['seat']] ?? 0) + 300;
            }
            // Last stand: the wreck itself detonates, once. The flag is
            // spent first so chained wrecks terminate.
            if ($t['kind'] === 'human' && ($room['laststand'][$t['seat']] ?? false)) {
                $room['laststand'][$t['seat']] = false;
                $events[] = ['t' => 'laststand', 'seat' => $t['seat']];
                $gone = $t;
                $ls = room_gear('laststand') ?? [];
                $blast = ['dmg' => (int) ($ls['dmg'] ?? 50), 'radius' => (float) ($ls['radius'] ?? 44)];
                room_explode($room, $events, $gone, 'shell', (float) $t['x'], (float) $t['y'] - 12.0, null, $blast);
            }
        }
    }
    unset($t);
}
/* One ballistic arc: integrate until impact, fizzle, fuse-split, or a
// proximity burst. Returns [status, x, y, vx, vy, directIdx]; cluster
// parents return 'split' with the bloom point instead of exploding.
// Mirrors the stepShells effect hooks in game.js. */
/* Replay timing: every event a volley makes carries 'at', seconds after the
   volley fires, so clients play the turn back at the speed it happened. */
const ROOM_PATH_EVERY = 5; // record one path point per 5 sim steps (12 per second)
function room_stamp(array &$events, int $from, float $at): void
{
    for ($i = $from, $n = count($events); $i < $n; $i++) {
        if (!isset($events[$i]['at'])) {
            $events[$i]['at'] = round($at, 3);
        }
    }
}
/* The shot event clients replay: launch time, landing time, blast radius,
   and the flight path as "x,y x,y ..." (compact in shared memory). */
function room_shot_event(array $tank, string $wkey, float $t0, array $res, float $radius): array
{
    return ['t' => 'shot', 'by' => $tank['seat'], 'w' => $wkey,
        'x0' => round($res[6][0][0] ?? $res[1], 1), 'y0' => round($res[6][0][1] ?? $res[2], 1),
        'x1' => round($res[1], 1), 'y1' => round($res[2], 1),
        't0' => round($t0, 3), 't1' => round($t0 + $res[7], 3), 'r' => $radius,
        'p' => implode(' ', array_map(fn($pt) => round($pt[0]) . ',' . round($pt[1]), $res[6]))];
}
/* Hit boxes match what clients draw: a ground unit's hull and turret, or a
// drone's body up in the air (game.js unitHitBox() is the same). An ellipse
// [cx, cy, rx, ry]. */
function room_unit_box(array $t): array
{
    return $t['kind'] === 'human'
        ? [(float) $t['x'], (float) $t['y'] - 10.0, 20.0, 13.0]
        : [(float) $t['x'], (float) $t['y'] - 30.0, 18.0, 14.0];
}
function room_in_box(array $t, float $x, float $y): bool
{
    [$cx, $cy, $rx, $ry] = room_unit_box($t);
    return (($x - $cx) / $rx) ** 2 + (($y - $cy) / $ry) ** 2 <= 1;
}
/* The first unit a shell touches anywhere along its step from (x0, y0) to
// (x1, y1), sampled every 3 px so a fast shell cannot skip through one, with
// the point it touched. The muzzle sits inside its gunner's box, so a shell
// ignores its owner until it has flown clear of that box ($clear turns true
// there); one that comes back hits it like anyone else. game.js sweepHit()
// is the same. */
function room_sweep_hit(array $room, float $x0, float $y0, float $x1, float $y1, ?int $skip, int $ownerIdx, bool &$clear): ?array
{
    $n = max(1, (int) ceil(hypot($x1 - $x0, $y1 - $y0) / 3));
    for ($i = 1; $i <= $n; $i++) {
        $px = $x0 + ($x1 - $x0) * $i / $n;
        $py = $y0 + ($y1 - $y0) * $i / $n;
        if (!$clear && !room_in_box($room['tanks'][$ownerIdx], $px, $py)) {
            $clear = true;
        }
        foreach ($room['tanks'] as $idx => $t) {
            if ($t['hp'] <= 0 || $idx === $skip || ($idx === $ownerIdx && !$clear)) {
                continue;
            }
            if (room_in_box($t, $px, $py)) {
                return [$idx, $px, $py];
            }
        }
    }
    return null;
}
/* Seconds a human gets for a turn before the crew fires for them. */
const ROOM_TURN_SECS = 120;
/* Seconds left on the turn clock of whoever's turn it is (null when it is
// not a human's turn). The clock starts when a turn begins: aiming and
// driving do not reset it. A turn is identified by round, turn slot and the
// count of shots fired so far, so the same player coming round again starts
// a fresh clock. */
function room_turn_left(array &$room): ?float
{
    $t = $room['tanks'][$room['turn']] ?? null;
    if (($room['phase'] ?? '') !== 'play' || !$t || $t['kind'] !== 'human' || $t['hp'] <= 0) {
        return null;
    }
    $key = ($room['round'] ?? 1) . ':' . $room['turn'] . ':' . ($room['shots'] ?? 0);
    if (($room['clock']['key'] ?? '') !== $key) {
        $room['clock'] = ['key' => $key, 'at' => microtime(true)];
    }
    return max(0.0, ROOM_TURN_SECS - (microtime(true) - (float) $room['clock']['at']));
}
/* A random gun from a seat's rack: any shell it still has, the Shell always,
// skipping anything its round has not unlocked. */
function room_random_gun(array $room, int $seat): string
{
    $weapons = room_weapons();
    $rack = ['shell'];
    foreach ($room['ammo'][$seat] ?? [] as $wkey => $have) {
        if ($wkey !== 'shell' && $have > 0 && isset($weapons[$wkey])
            && ($weapons[$wkey]['minRound'] ?? 1) <= ($room['round'] ?? 1)) {
            $rack[] = $wkey;
        }
    }
    return $rack[random_int(0, count($rack) - 1)];
}
function room_fly_arc(array &$room, array &$events, array $tank, array $w, string $wkey, int $ownerIdx, float $sx, float $sy, float $vx, float $vy, float $age, $fuse, $ov, float $t0 = 0.0): array
{
    $width = count($room['terrain']);
    $dt = 1 / 60;
    $path = [[$sx, $sy]];
    $grav = !empty($w['flat']) ? 90.0 : (float) ROOM_GRAV;
    $pierced = null; // the tank a lance went through, never hit twice
    $clear = false; // out of its gunner's box yet
    for ($step = 0; $step < 720; $step++) {
        if (($w['effect'] ?? 'shot') === 'seeker') {
            $best = null;
            $bd = INF;
            foreach ($room['tanks'] as $idx => $t) {
                if ($t['hp'] <= 0 || $idx === $ownerIdx) {
                    continue;
                }
                $d = hypot($t['x'] - $sx, ($t['y'] - 12) - $sy);
                if ($d < $bd) {
                    $bd = $d;
                    $best = $t;
                }
            }
            if ($best !== null && $bd > 1) {
                $push = (float) ($w['steer'] ?? 70.0) * $dt;
                $vx += (($best['x'] - $sx) / $bd) * $push;
                $vy += ((($best['y'] - 12) - $sy) / $bd) * $push;
            }
        }
        $vx += $room['wind'] * ROOM_TURN_WIND * $dt;
        $vy += $grav * $dt;
        $px = $sx;
        $py = $sy;
        $sx += $vx * $dt;
        $sy += $vy * $dt;
        $age += $dt;
        if (($step + 1) % ROOM_PATH_EVERY === 0) {
            $path[] = [$sx, $sy];
        }
        $flown = ($step + 1) * $dt;
        if ($sx < -20 || $sx > $width + 20 || $sy > 500) {
            $path[] = [$sx, $sy];
            return ['oob', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
        if ($fuse !== false && ($w['effect'] ?? 'shot') === 'cluster' && $age >= $fuse) {
            $path[] = [$sx, $sy];
            return ['split', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
        $direct = null;
        $hit = room_sweep_hit($room, $px, $py, $sx, $sy, $pierced, $ownerIdx, $clear);
        if ($hit !== null) {
            // Burst where the shell touched the unit, not past it.
            [$direct, $sx, $sy] = $hit;
        }
        if ($direct === null && ($w['effect'] ?? 'shot') === 'proximity') {
            $bd = (float) ($w['prox'] ?? 34.0);
            foreach ($room['tanks'] as $idx => $t) {
                if ($t['hp'] <= 0 || $idx === $ownerIdx) {
                    continue;
                }
                $d = hypot($sx - $t['x'], $sy - ($t['y'] - 12));
                if ($d < $bd) {
                    $bd = $d;
                    $direct = $idx;
                }
            }
        }
        if ($direct !== null) {
            if (($w['effect'] ?? 'shot') === 'pierce' && $pierced === null) {
                $pierced = $direct;
                $mark = count($events);
                room_explode($room, $events, $tank, $wkey, $sx, $sy, $direct, $ov);
                $events[] = ['t' => 'burst', 'x' => round($sx, 1), 'y' => round($sy, 1), 'r' => (float) (($ov['radius'] ?? null) ?? $w['radius']), 'w' => $wkey];
                room_stamp($events, $mark, $t0 + $flown);
                continue;
            }
            $path[] = [$sx, $sy];
            return ['hit', $sx, $sy, $vx, $vy, $direct, $path, $flown];
        }
        $xi = max(0, min($width - 1, (int) round($sx)));
        if ($age >= 0.1 && $sy >= $room['terrain'][$xi]) {
            $path[] = [$sx, $sy];
            return ['hit', $sx, $sy, $vx, $vy, null, $path, $flown];
        }
    }
    return ['oob', $sx, $sy, $vx, $vy, null, $path, 720 * $dt];
}
/* One fully simulated shot (all pellets, all bomblets), server side. No
 * client can fake this. Every event is stamped with its moment in the volley
 * ('at'), and shot events carry their flight path, so clients replay it. */
function room_fire_shot(array &$room, array &$events, int $seatIdx, string $wkey): void
{
    $room['shots'] = ($room['shots'] ?? 0) + 1; // a fresh turn clock follows each shot
    $tank = &$room['tanks'][$seatIdx];
    $weapons = room_weapons();
    $w = $weapons[$wkey] ?? $weapons['shell'];
    $shots = ($w['pellets'] ?? 0) > 0 ? $w['pellets'] : 1;
    $rad = deg2rad($tank['angle']);
    $dirS = $tank['dirS'] ?? -1;
    $radius = (float) $w['radius'];
    $events[count($events) - 1]['at'] = 0.0; // the fire/aifire that opened this volley
    for ($i = 0; $i < $shots; $i++) {
        $off = $shots === 1 ? 0 : ($i - ($shots - 1) / 2) * ($w['spread'] ?? 0.0);
        $a = $rad + $off;
        $spd = room_shot_speed($tank['power'], !empty($w['flat']), (float) ($w['speed'] ?? 1.0));
        $mx = $tank['x'] + cos($rad) * 20 * $dirS;
        $my = $tank['y'] - 14 - sin($rad) * 20;
        $vx = cos($a) * $spd * $dirS;
        $vy = -sin($a) * $spd;
        $res = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $mx, $my, $vx, $vy, 0.0, (float) ($w['fuse'] ?? 0.9), null, 0.0);
        if ($res[0] === 'split') {
            // The bloom reads as a burst on every screen; the bomblets do
            // the real damage from here.
            $split = room_shot_event($tank, $wkey, 0.0, $res, 0.0);
            $split['split'] = true;
            $split['at'] = 0.0;
            $events[] = $split;
            $tSplit = $res[7];
            $n = max(2, (int) ($w['split'] ?? 4));
            $fan = (float) ($w['fan'] ?? 0.22);
            $sp = hypot($res[3], $res[4]) * 0.85;
            $base = atan2($res[4], $res[3]);
            $sub = ['dmg' => (int) ($w['subDmg'] ?? $w['dmg']), 'radius' => (int) ($w['subRadius'] ?? $w['radius'])];
            for ($k = 0; $k < $n; $k++) {
                $ca = $base + ($k - ($n - 1) / 2) * $fan;
                $cr = room_fly_arc($room, $events, $tank, $w, $wkey, $seatIdx, $res[1], $res[2], cos($ca) * $sp, sin($ca) * $sp, 99.0, false, $sub, $tSplit);
                $ev = room_shot_event($tank, $wkey, $tSplit, $cr, $cr[0] === 'hit' ? (float) $sub['radius'] : 0.0);
                $ev['at'] = round($tSplit, 3);
                $events[] = $ev;
                $mark = count($events);
                if ($cr[0] === 'hit') {
                    room_explode($room, $events, $tank, $wkey, $cr[1], $cr[2], $cr[5], $sub);
                } else {
                    $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
                }
                room_stamp($events, $mark, $tSplit + $cr[7]);
            }
            continue;
        }
        $ev = room_shot_event($tank, $wkey, 0.0, $res, $res[0] === 'hit' ? $radius : 0.0);
        $ev['at'] = 0.0;
        $events[] = $ev;
        $mark = count($events);
        if ($res[0] === 'hit') {
            room_explode($room, $events, $tank, $wkey, $res[1], $res[2], $res[5], null);
        } else {
            $events[] = ['t' => 'fizzle', 'by' => $tank['seat'], 'w' => $wkey];
        }
        room_stamp($events, $mark, $res[7]);
    }
    unset($tank);
}
/* Server-side drone AI: same ballistic search as the browser, with the same
 * round-scaled error, driven by the room rng stream. */
function room_ai_choose(array &$room, array $tank): array
{
    $rng = $room['rng'];
    $dirS = $tank['dirS'] ?? -1;
    $rad = deg2rad($tank['angle']);
    $mx = $tank['x'] + cos($rad) * 20 * $dirS;
    $my = $tank['y'] - 14 - sin($rad) * 20;
    // Drones feud with each other too: usually the nearest rival, sometimes
    // whoever else is still rolling. Nobody is safe, nobody is perfect.
    $rivals = [];
    foreach ($room['tanks'] as $t) {
        if ($t['hp'] > 0 && $t['seat'] !== $tank['seat']) {
            $rivals[] = $t;
        }
    }
    if (!count($rivals)) {
        $room['rng'] = $rng;
        return ['wkey' => 'shell', 'angle' => 62.0, 'power' => 55.0, 'dx' => 0.0];
    }
    usort($rivals, fn($a, $b) => abs($a['x'] - $tank['x']) <=> abs($b['x'] - $tank['x']));
    $me = $rivals[0];
    if (count($rivals) > 1 && room_rng_next($rng) >= 0.6) {
        $me = $rivals[1 + (int) floor(room_rng_next($rng) * (count($rivals) - 1))];
    }
    $keys = ['shell'];
    foreach (room_weapons() as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        if (($tank['ammo'][$k] ?? 0) > 0) {
            $keys[] = $k;
        }
    }
    $best = null;
    $width = count($room['terrain']);
    foreach ($keys as $wkey) {
        for ($a = 25; $a <= 155; $a += 6) {
            for ($p = 20; $p <= 100; $p += 6) {
                $land = room_sim_shot($room['terrain'], $room['wind'], $mx, $my, (float) $a, (float) $p, $wkey, $dirS, $width);
                $err = $land['oob'] ? 400 + abs($land['x'] - $me['x']) * 0.2 : abs($land['x'] - $me['x']);
                if ($best === null || $err < $best['err']) {
                    $best = ['err' => $err, 'a' => $a, 'p' => $p, 'wkey' => $wkey];
                }
            }
        }
    }
    // Deliberately shaky hands: dangerous up close, forgiving at range.
    // A jammer doubles the wobble of anything aimed at its owner.
    $skill = min(1.0, 0.35 + $room['round'] * 0.12);
    $wob = max(0.25, 1.2 - $skill);
    if ($me['kind'] === 'human' && ($room['jammer'][$me['seat']] ?? 0) > 0) {
        $wob *= 2;
    }
    $angle = max(10.0, min(170.0, round($best['a'] + room_gauss($rng) * 9 * $wob)));
    $power = max(10.0, min(100.0, round($best['p'] + room_gauss($rng) * 12 * $wob)));
    // Drones shuffle for a better firing spot instead of camping one rut.
    $dx = 0.0;
    if (room_rng_next($rng) < 0.35) {
        $dx = (room_rng_next($rng) < 0.5 ? -1.0 : 1.0) * (8 + room_rng_next($rng) * 27);
    }
    $room['rng'] = $rng;
    return ['wkey' => $best['wkey'], 'angle' => $angle, 'power' => $power, 'dx' => $dx];
}

/* Drone magazine from the data file: shells the battery may load by round. */
function room_ai_rack(int $round): array
{
    $rack = ['shell' => -1];
    foreach (room_weapons() as $k => $def) {
        if ($k === 'shell') {
            continue;
        }
        $rack[$k] = (!empty($def['ai']) && $round >= ($def['aiRound'] ?? 99)) ? 2 : 0;
    }
    return $rack;
}
/* ---------- room state machine ---------- */
function room_new(string $code, string $initials): array
{
    $rng = room_hash_seed('tankity-room-' . $code);
    return [
        'code' => $code,
        'csrf' => room_rand_token(16),
        'created' => time(),
        'touched' => time(),
        'seed' => null, // never sent to clients
        'rng' => $rng,
        'phase' => 'lobby', // lobby | shop | play | over
        'map' => null, // a ROOM_MAPS id, or null for a random draw
        'round' => 0,
        'wind' => 0,
        'terrain' => [],
        'tanks' => [],
        // seatIdx => human: ['initials','token','lives','human'=>true]; drone or
        // open: ['name','lives','human'=>false,'mode'=>'ai'|'open']. All
        // ROOM_SEATS exist from the start; a joiner takes the first free one.
        'seats' => [],
        'turn' => 0,
        'scores' => [],
        'cash' => [],
        'ammo' => [],
        'events' => [],
        'winners' => [],
    ];
}
/* A seat nobody sits in: the drone battery by default, or open (no unit). */
function room_idle_seat(int $slot, string $mode = 'ai'): array
{
    $name = ROOM_AI_NAMES[($slot - 1) % count(ROOM_AI_NAMES)];
    return ['human' => false, 'name' => $name, 'initials' => $name, 'lives' => 0, 'mode' => $mode === 'open' ? 'open' : 'ai'];
}
function room_seat_human(string $initials, string $token, array $body): array
{
    return ['human' => true, 'initials' => $initials, 'token' => $token, 'lives' => 3, 'lastAct' => microtime(true), 'body' => room_body($body)];
}
/* Every economy slot a new human seat needs, keyed by seat. */
function room_seat_economy(array &$room, int $seat): void
{
    $room['scores'][$seat] = 0;
    $room['cash'][$seat] = 600;
    $room['ammo'][$seat] = ['shell' => -1, 'buck' => 1, 'mortar' => 0, 'rail' => 0, 'nuke' => 0];
    $room['weapon'][$seat] = 'shell';
    $room['nextUp'][$seat] = 3000;
}
/* Seats that will field a unit: every human and every drone seat. */
function room_fielded(array $room): int
{
    $n = 0;
    foreach ($room['seats'] as $s) {
        if (($s['human'] ?? false) || ($s['mode'] ?? 'ai') !== 'open') {
            $n++;
        }
    }
    return $n;
}
/* Units keep at least ROOM_UNIT_GAP apart, centre to centre, so hulls never
   overlap; fresh rounds spread them ROOM_SPAWN_GAP apart. */
const ROOM_UNIT_GAP = 44.0;
const ROOM_SPAWN_GAP = 110;
/* Ground-unit bodies a human may drive; looks only, no stats. */
const ROOM_BODIES = ['tank', 'hover', 'walker', 'buggy'];
function room_body(array $body): string
{
    $b = (string) ($body['body'] ?? 'tank');
    return in_array($b, ROOM_BODIES, true) ? $b : 'tank';
}
function room_spot_taken(array $room, int $self, float $x): bool
{
    foreach ($room['tanks'] as $idx => $t) {
        if ($idx !== $self && $t['hp'] > 0 && abs($t['x'] - $x) < ROOM_UNIT_GAP) {
            return true;
        }
    }
    return false;
}
/* n spawn points, at least ROOM_SPAWN_GAP apart, in random order: no seat
   owns a side. Even spacing if sampling fails. */
function room_spawn_spots(int &$rng, int $n, int $width): array
{
    $lo = 30;
    $hi = $width - 30;
    for ($tries = 0; $tries < 200; $tries++) {
        $xs = [];
        for ($i = 0; $i < $n; $i++) {
            $xs[] = (int) round($lo + room_rng_next($rng) * ($hi - $lo));
        }
        sort($xs);
        $ok = true;
        for ($i = 1; $i < $n; $i++) {
            if ($xs[$i] - $xs[$i - 1] < ROOM_SPAWN_GAP) {
                $ok = false;
                break;
            }
        }
        if ($ok) {
            for ($i = $n - 1; $i > 0; $i--) {
                $j = (int) floor(room_rng_next($rng) * ($i + 1));
                [$xs[$i], $xs[$j]] = [$xs[$j], $xs[$i]];
            }
            return $xs;
        }
    }
    $xs = [];
    for ($i = 0; $i < $n; $i++) {
        $xs[] = (int) round($lo + ($i + 0.5) * ($hi - $lo) / $n);
    }
    return $xs;
}
function room_start_round(array &$room): void
{
    $room['round'] += 1;
    $w = 720;
    if ($room['map'] !== null && isset(ROOM_MAPS[$room['map']])) {
        // A picked map replays its own hills every time: terrain comes from
        // the hidden seed plus the round, never from the live stream.
        $mrng = room_hash_seed(ROOM_MAPS[$room['map']]['seed'] . '|round' . $room['round']);
        $room['terrain'] = room_gen_terrain($mrng, $w);
    } else {
        $room['terrain'] = room_gen_terrain($room['rng'], $w);
    }
    $room['wind'] = (int) round(room_rng_range($room['rng'], -8, 8));
    $slots = room_spawn_spots($room['rng'], max(1, room_fielded($room)), $w);
    $room['tanks'] = [];
    $seat = 0;
    foreach ($room['seats'] as $idx => $s) {
        if ($s['human'] && ($s['lives'] ?? 0) <= 0) {
            continue; // eliminated humans stay out
        }
        if (!$s['human'] && ($s['mode'] ?? 'ai') === 'open') {
            continue; // nobody plays an open seat
        }
        $armor = $s['human'] ? 100 + 25 * ($room['plate'][$idx] ?? 0) : 60 + 6 * ($room['round'] - 1);
        $room['tanks'][] = [
            'seat' => $idx,
            'kind' => $s['human'] ? 'human' : 'ai',
            'name' => $s['human'] ? $s['initials'] : $s['initials'],
            'x' => $slots[$seat % count($slots)],
            'y' => 0,
            'angle' => 62.0,
            'power' => 55.0,
            'hp' => $armor,
            'maxHp' => $armor,
            'fuel' => $s['human'] ? 80 : 0,
            'dirS' => $slots[$seat % count($slots)] < $w / 2 ? 1 : -1, // face the middle
            'ammo' => $s['human']
                ? ($room['ammo'][$idx] ?? ['shell' => -1, 'buck' => 1])
                : room_ai_rack($room['round']),
        ];
        $seat++;
    }
    foreach ($room['tanks'] as &$t) {
        $xi = max(0, min($w - 1, (int) round($t['x'])));
        $t['y'] = $room['terrain'][$xi];
    }
    unset($t);
    $room['turn'] = 0;
    $room['phase'] = count($room['tanks']) ? 'play' : 'over';
    // Callers announce the new round through the sequenced event batch.
}
function room_advance(array &$room, array &$events): void
{
    // Skip the dead; run AI turns inline (bounded) until a human is up.
    $n = count($room['tanks']);
    for ($guard = 0; $guard < 2 * $n + 4; $guard++) {
        $alive = [];
        foreach ($room['tanks'] as $i => $t) {
            if ($t['hp'] > 0) {
                $alive[] = $i;
            }
        }
        if (!count($alive)) {
            room_end_round($room, $events);
            return;
        }
        $cur = null;
        foreach ($alive as $i) {
            if ($i >= $room['turn'] && $cur === null) {
                $cur = $i;
            }
        }
        if ($cur === null) {
            $cur = $alive[0];
        }
        $room['turn'] = $cur;
        $t = $room['tanks'][$cur];
        if ($t['kind'] === 'human') {
            // A human's turn runs on a clock (room_turn_left): when it runs
            // out, the crew loads a random gun from the rack and fires it with
            // the current aim, so one absent player never holds up the room.
            if (room_turn_left($room) > 0) {
                return; // waiting on this human's move
            }
            $wkey = room_random_gun($room, $t['seat']);
            $have = $room['ammo'][$t['seat']][$wkey] ?? 0;
            $events[] = ['t' => 'auto', 'seat' => $t['seat'], 'w' => $wkey,
                'x' => round($t['x'], 1), 'a' => round($t['angle'], 1), 'pw' => round($t['power'], 1)];
            if ($wkey !== 'shell') {
                $room['ammo'][$t['seat']][$wkey] = max(0, $have - 1);
                $room['tanks'][$cur]['ammo'][$wkey] = $room['ammo'][$t['seat']][$wkey];
                if ($have - 1 <= 0) {
                    $room['weapon'][$t['seat']] = 'shell';
                }
            }
            room_fire_shot($room, $events, $cur, $wkey);
            $room['seats'][$t['seat']]['lastAct'] = microtime(true);
            if (room_round_settled($room)) {
                room_end_round($room, $events);
                return;
            }
            $room['turn'] = $cur + 1;
            continue;
        }
        // AI takes its turn right now, server side.
        $choice = room_ai_choose($room, $t);
        $room['tanks'][$cur]['angle'] = $choice['angle'];
        $room['tanks'][$cur]['power'] = $choice['power'];
        $width = count($room['terrain']);
        $nx = max(12.0, min($width - 12.0, $room['tanks'][$cur]['x'] + ($choice['dx'] ?? 0)));
        if (abs($choice['dx'] ?? 0) > 0.5 && !room_spot_taken($room, $cur, $nx)) {
            $room['tanks'][$cur]['x'] = $nx;
            $xi = max(0, min($width - 1, (int) round($room['tanks'][$cur]['x'])));
            $room['tanks'][$cur]['y'] = $room['terrain'][$xi];
        }
        if ($choice['wkey'] !== 'shell') {
            $room['tanks'][$cur]['ammo'][$choice['wkey']] = max(0, ($room['tanks'][$cur]['ammo'][$choice['wkey']] ?? 0) - 1);
        }
        $me = $room['tanks'][$cur];
        $events[] = ['t' => 'aifire', 'seat' => $t['seat'], 'w' => $choice['wkey'],
            'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)];
        room_fire_shot($room, $events, $cur, $choice['wkey']);
        if (room_round_settled($room)) {
            room_end_round($room, $events);
            return;
        }
        // Pass the turn on like every other shot: without this the same
        // drone fires up to a dozen times per call and humans never move.
        $room['turn'] = $cur + 1;
    }
}
function room_round_settled(array $room): bool
{
    $humans = false;
    $ais = false;
    foreach ($room['tanks'] as $t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        if ($t['kind'] === 'human') {
            $humans = true;
        } else {
            $ais = true;
        }
    }
    return !$humans || !$ais;
}
function room_end_round(array &$room, array &$events): void
{
    // Trick timers tick down on settled rounds.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        if (($room['jammer'][$idx] ?? 0) > 0) {
            $room['jammer'][$idx]--;
        }
        if (($room['bunker'][$idx] ?? 0) > 0) {
            $room['bunker'][$idx]--;
        }
    }
    $humans = array_filter($room['tanks'], fn($t) => $t['kind'] === 'human' && $t['hp'] > 0);
    $ais = array_filter($room['tanks'], fn($t) => $t['kind'] === 'ai' && $t['hp'] > 0);
    if (count($ais) === 0 && count($humans) > 0) {
        foreach ($humans as $t) {
            $bonus = 750 + $room['round'] * 150;
            $prize = 500 + $room['round'] * 100;
            $room['scores'][$t['seat']] = ($room['scores'][$t['seat']] ?? 0) + $bonus;
            $room['cash'][$t['seat']] = ($room['cash'][$t['seat']] ?? 0) + $prize;
        }
        $room['phase'] = 'shop';
        $events[] = ['t' => 'roundwin', 'round' => $room['round']];
        return;
    }
    if (count($humans) === 0) {
        // Every human wrecked: lose a life room-wide, survivors return.
        $anyLeft = false;
        foreach ($room['seats'] as $idx => &$s) {
            if (!$s['human']) {
                continue;
            }
            $s['lives'] = max(0, ($s['lives'] ?? 3) - 1);
            if ($s['lives'] > 0) {
                $anyLeft = true;
            } else {
                room_save_score($s['initials'], $room['scores'][$idx] ?? 0, $room);
                $events[] = ['t' => 'eliminated', 'seat' => $idx];
            }
        }
        unset($s);
        if (!$anyLeft) {
            $room['phase'] = 'over';
            $events[] = ['t' => 'matchover'];
            return;
        }
        room_start_round($room);
        $events[] = ['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']];
        return;
    }
}
/* File a room score into the same per-initials store as local play. */
function room_save_score(string $initials, int $score, array $room): void
{
    $slug = strtolower(preg_replace('/[^a-z0-9_-]+/i', '-', $initials) ?: 'anonymous');
    $path = room_scores_dir() . '/' . $slug . '-' . ROOM_GAME . '.json';
    $fh = @fopen($path, 'c+b');
    if ($fh === false) {
        return;
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return;
    }
    rewind($fh);
    $raw = stream_get_contents($fh);
    $data = is_string($raw) && trim($raw) !== '' ? json_decode($raw, true) : null;
    if (!is_array($data) || !isset($data['runs']) || !is_array($data['runs'])) {
        $data = ['name' => $slug, 'runs' => [], 'best' => 0];
    }
    $data['runs'][] = ['score' => $score, 'banked' => 0, 'won' => false, 'seed' => 'room:' . $room['code'], 'ts' => gmdate('c')];
    $data['runs'] = array_slice($data['runs'], -50);
    $best = 0;
    foreach ($data['runs'] as $r) {
        $best = max($best, (int) $r['score']);
    }
    $data['best'] = $best;
    $tmp = $path . '.tmp.' . getmypid();
    $fh2 = fopen($tmp, 'wb');
    if ($fh2 !== false) {
        fwrite($fh2, (string) json_encode($data, JSON_UNESCAPED_SLASHES));
        fflush($fh2);
        if (function_exists('fsync')) {
            fsync($fh2);
        }
        fclose($fh2);
        rename($tmp, $path);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
}
/* ---------- persistence: one record per room, memory or files ---------- */
function room_load(string $code, bool $create = false): ?array
{
    if (!room_use_shm()) {
        return null;
    }
    $lock = room_shm_lock();
    $reg = room_registry_get();
    return [$reg[$code] ?? null, $lock, $code];
}
function room_save($lock, string $code, array $room): bool
{
    if (!room_use_shm()) {
        return false;
    }
    $room['touched'] = time();
    $reg = room_registry_get();
    $reg[$code] = $room;
    return room_registry_put($reg);
}
function room_unlock($lock): void
{
    global $ROOM_SHM_DEPTH, $ROOM_SHM_HELD;
    if ($lock === null) {
        return;
    }
    if ($ROOM_SHM_DEPTH > 1) {
        $ROOM_SHM_DEPTH--;
        return;
    }
    $ROOM_SHM_DEPTH = 0;
    $ROOM_SHM_HELD = false;
    @sem_release($lock);
}
// The shelf never holds more rooms than matter: anything nobody has touched
// inside the live window is dropped, and day-old records go whatever happens.
// Anything with a browser still open heartbeats on every state poll, so only
// truly gone rooms vanish.
function room_sweep(): void
{
    room_shm_sweep();
}
function room_shm_sweep(): void
{
    $lock = room_shm_lock();
    $reg = room_registry_get();
    $now = time();
    $maxAge = room_max_age();
    $live = room_live_secs();
    $changed = false;
    foreach ($reg as $code => $room) {
        if (!is_array($room)) {
            unset($reg[$code]);
            $changed = true;
            continue;
        }
        $t = $room['touched'] ?? $room['created'] ?? 0;
        if ($now - $t > $live || $now - ($room['created'] ?? $t) > $maxAge) {
            unset($reg[$code]);
            $changed = true;
        }
    }
    if ($changed) {
        room_registry_put($reg);
    }
    room_unlock($lock);
}
/* Tanks ride the terrain down after craters (server side, snapped). */
function room_settle_tanks(array &$room): void
{
    $w = count($room['terrain']);
    if (!$w) {
        return;
    }
    foreach ($room['tanks'] as &$t) {
        if ($t['hp'] <= 0) {
            continue;
        }
        $xi = max(0, min($w - 1, (int) round($t['x'])));
        $t['y'] = $room['terrain'][$xi];
    }
    unset($t);
}
function room_emit(array &$room, array $ev): void
{
    $room['seq'] = ($room['seq'] ?? 0) + 1;
    $ev['seq'] = $room['seq'];
    $room['events'][] = $ev;
    $room['events'] = array_slice($room['events'], -60);
}
/* 1-ups, same economy as local play. */
function room_check_oneups(array &$room, array &$events, int $seat): void
{
    $lives = $room['seats'][$seat]['lives'] ?? 3;
    $next = $room['nextUp'][$seat] ?? 3000;
    $score = $room['scores'][$seat] ?? 0;
    while ($score >= $next) {
        $next += 3000;
        if ($lives < 5) {
            $lives += 1;
            $events[] = ['t' => 'oneup', 'seat' => $seat, 'lives' => $lives];
        }
    }
    $room['seats'][$seat]['lives'] = $lives;
    $room['nextUp'][$seat] = $next;
}

/* ---------- snapshots (public + private per seat) ---------- */
function room_snapshot(array $room, ?int $seat, int $since): array
{
    $tanks = [];
    foreach ($room['tanks'] as $t) {
        $tanks[] = [
            'seat' => $t['seat'], 'kind' => $t['kind'], 'name' => $t['name'],
            'x' => round($t['x'], 1), 'y' => round($t['y'], 1),
            'angle' => $t['angle'], 'power' => $t['power'],
            'hp' => $t['hp'], 'maxHp' => $t['maxHp'],
            'dirS' => $t['dirS'] ?? 1,
            'body' => $t['kind'] === 'human' ? ($room['seats'][$t['seat']]['body'] ?? 'tank') : null,
            // In a menu right now (shown by their unit on their turn).
            'menu' => $t['kind'] === 'human' && !empty($room['menu'][$t['seat']]),
        ];
    }
    $seats = [];
    foreach ($room['seats'] as $idx => $s) {
        $seats[] = [
            'seat' => $idx, 'human' => $s['human'],
            'name' => $s['human'] ? $s['initials'] : $s['name'],
            'mode' => $s['human'] ? 'human' : ($s['mode'] ?? 'ai'),
            'lives' => $s['lives'] ?? 0,
            'score' => $room['scores'][$idx] ?? 0,
        ];
    }
    $out = [
        'code' => $room['code'],
        'phase' => $room['phase'],
        'map' => $room['map'],
        'mapName' => room_map_name($room['map'] ?? null),
        'round' => $room['round'],
        'wind' => $room['wind'],
        'turn' => $room['phase'] === 'play' && count($room['tanks']) ? $room['tanks'][$room['turn']]['seat'] ?? null : null,
        // Seconds left before the crew fires for the human whose turn it is.
        'turnLeft' => (function () use ($room) {
            $left = room_turn_left($room);
            return $left === null ? null : round($left, 1);
        })(),
        'terrain' => array_map(fn($v) => round($v, 1), $room['terrain']),
        'tanks' => $tanks,
        'seats' => $seats,
        'events' => array_values(array_filter($room['events'] ?? [], fn($e) => ($e['seq'] ?? 0) > $since)),
    ];
    if ($seat !== null && isset($room['seats'][$seat]) && ($room['seats'][$seat]['human'] ?? false)) {
        $tank = null;
        foreach ($room['tanks'] as $t) {
            if ($t['seat'] === $seat) {
                $tank = $t;
                break;
            }
        }
        $out['you'] = [
            'seat' => $seat,
            'ammo' => $room['ammo'][$seat] ?? ['shell' => -1, 'buck' => 0, 'mortar' => 0, 'rail' => 0, 'nuke' => 0],
            'cash' => $room['cash'][$seat] ?? 0,
            'score' => $room['scores'][$seat] ?? 0,
            'lives' => $room['seats'][$seat]['lives'] ?? 0,
            'fuel' => $tank ? round($tank['fuel'], 1) : 0,
            'weapon' => $room['weapon'][$seat] ?? 'shell',
            'nextUp' => $room['nextUp'][$seat] ?? 3000,
            'shield' => ($room['shield'][$seat] ?? false) ? true : false,
            'jammer' => (int) ($room['jammer'][$seat] ?? 0),
            'bunker' => (int) ($room['bunker'][$seat] ?? 0),
            'laststand' => ($room['laststand'][$seat] ?? false) ? true : false,
            'plate' => (int) ($room['plate'][$seat] ?? 0),
        ];
        $out['csrf'] = $room['csrf'];
    }
    return $out;
}
function room_find_seat(array $room, string $token): ?int
{
    foreach ($room['seats'] as $idx => $s) {
        if (($s['human'] ?? false) && isset($s['token']) && hash_equals((string) $s['token'], $token)) {
            return $idx;
        }
    }
    return null;
}

/* Banked shop repair and fuel go onto the freshly mustered human tanks.
   Tanks muster at full armor, so repair rides on top for this round, the
   same as solo play. */
function room_apply_banked(array &$room): void
{
    foreach ($room['tanks'] as &$t) {
        if ($t['kind'] !== 'human') {
            continue;
        }
        $t['hp'] += ($room['repairApplied'][$t['seat']] ?? 0);
        $t['maxHp'] = $t['hp'];
        $t['fuel'] += ($room['fuelApplied'][$t['seat']] ?? 0);
    }
    unset($t);
}

/* ---------- router ---------- */
// rooms-sim-test.php includes this file for its functions only.
if (defined('TANKITY_ROOMS_LIB')) {
    return;
}
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$body = [];
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $dec = json_decode(is_string($raw) ? $raw : '', true);
    $body = is_array($dec) ? $dec : $_POST;
}
if ($action === 'ping') {
    // Health plus occupancy for the lobby shelf. No secrets in here.
    room_sweep();
    $max = room_max_rooms();
    $rooms = ['used' => room_count(), 'max' => $max, 'store' => 'memory'];
    room_json_out(200, ['ok' => true, 'game' => 'operation-tankity', 'rooms' => $rooms]);
}

if ($action === 'maps') {
    // Public catalog: ids, names, and a silhouette of round one's hills.
    // Seeds never leave this file.
    $list = [];
    foreach (ROOM_MAPS as $id => $m) {
        $list[] = ['id' => $id, 'name' => $m['name'], 'profile' => room_map_profile($id)];
    }
    room_json_out(200, ['ok' => true, 'maps' => $list]);
}

if ($action === 'map' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($seat !== 0) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host picks the hills']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    $raw = trim((string) ($body['map'] ?? ''));
    if ($raw === '') {
        $room['map'] = null;
    } else {
        $map = room_map_lookup($raw);
        if ($map === null) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'no such hills']);
        }
        $room['map'] = $map;
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

/* A human walks away. The last human out closes the room, freeing its slot
   at once; otherwise the battery takes over the seat, host included: a match
   that has begun carries on for everyone else (nothing after the lobby is
   host-only). Only in the lobby does the host leaving close the room, since
   nobody else can start it. */
function room_leave(array &$room, int $seat): bool
{
    $humans = 0;
    foreach ($room['seats'] as $idx => $s) {
        if ($idx !== $seat && ($s['human'] ?? false)) {
            $humans++;
        }
    }
    if ($humans === 0 || ($room['phase'] === 'lobby' && $seat === 0)) {
        return false; // close the room
    }
    if ($room['phase'] === 'lobby') {
        $room['seats'][$seat] = room_idle_seat($seat); // the chair goes back to the battery
        return true;
    }
    $name = strtoupper((string) ($room['seats'][$seat]['initials'] ?? 'AI'));
    $room['seats'][$seat] = ['human' => false, 'name' => $name, 'initials' => $name, 'mode' => 'ai',
        'lives' => $room['seats'][$seat]['lives'] ?? 0];
    foreach ($room['tanks'] as &$t) {
        if ($t['seat'] === $seat) {
            $t['kind'] = 'ai';
            $t['ammo'] = room_ai_rack((int) $room['round']);
        }
    }
    unset($t);
    return true;
}
if ($action === 'leave' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
    $code = $room['code'];
    if (room_leave($room, $seat)) {
        room_emit($room, ['t' => 'left', 'seat' => $seat]);
        $ok = room_save($fh, $path, $room);
    } else {
        $reg = room_registry_get();
        unset($reg[$code]);
        $ok = room_registry_put($reg);
    }
    room_unlock($fh);
    room_json_out($ok ? 200 : 500, $ok ? ['ok' => true] : ['error' => 'store write failed']);
}

// A seat changes its unit's look any time: lobby, shop, mid-match.
if ($action === 'body' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    $room['seats'][$seat]['body'] = room_body($body);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'create' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $initials = room_valid_initials($body['initials'] ?? null);
    if ($initials === null) {
        room_json_out(422, ['error' => 'initials must be 3 letters, kept clean']);
    }
    room_sweep();
    $max = room_max_rooms();
    if (room_count() >= $max) {
        room_json_out(409, ['error' => "every room is taken ($max / $max). Try again later."]);
    }
    $map = null;
    if (isset($body['map']) && trim((string) $body['map']) !== '') {
        $map = room_map_lookup($body['map']);
        if ($map === null) {
            room_json_out(422, ['error' => 'no such hills']);
        }
    }
    $lock = room_shm_lock();
    $reg = room_registry_get();
    $code = room_new_code(fn($c) => isset($reg[$c]));
    $room = room_new($code, $initials);
    $room['map'] = $map;
    $token = room_rand_token();
    // A fresh seat is present, not idle: the 90-second auto-fire rule must
    // not mistake a guest who just sat down for one who walked away.
    $room['seats'][0] = room_seat_human($initials, $token, $body);
    for ($i = 1; $i < ROOM_SEATS; $i++) {
        $room['seats'][$i] = room_idle_seat($i);
    }
    room_seat_economy($room, 0);
    $room['touched'] = time();
    $reg[$code] = $room;
    if (!room_registry_put($reg)) {
        room_unlock($lock);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($lock);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => 0, 'token' => $token, 'csrf' => $room['csrf']]);
}

if ($action === 'join' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    $initials = room_valid_initials($body['initials'] ?? null);
    if (!preg_match('/^[A-Z0-9]{4}$/', $code) || $initials === null) {
        room_json_out(422, ['error' => 'need a 4-character room code and clean 3-letter initials']);
    }
    $loaded = room_load($code);
    if ($loaded === null) {
        room_json_out(500, ['error' => 'store unavailable']);
    }
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    // A guest takes the first seat nobody holds, open or drone alike.
    $seat = null;
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            $seat = $idx;
            break;
        }
    }
    if ($seat === null) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'room is full']);
    }
    foreach ($room['seats'] as $s) {
        if (($s['human'] ?? false) && strtoupper((string) ($s['initials'] ?? '')) === strtoupper($initials)) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'those initials are taken here']);
        }
    }
    $token = room_rand_token();
    // Same as create: joining means present, so the seat starts clocked in.
    $room['seats'][$seat] = room_seat_human($initials, $token, $body);
    room_seat_economy($room, $seat);
    $room['events'][] = ['t' => 'join', 'seat' => $seat];
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'code' => $code, 'seat' => $seat, 'token' => $token, 'csrf' => $room['csrf']]);
}

/* Authenticated room ops share these gates. */
/* $throttle spaces a seat's acts 150 ms apart; leaving skips it, since a
   leave right behind an aim tap must still land. */
function room_gate(array $body, bool $needCsrf, bool $throttle = true): array
{
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    $code = strtoupper(trim((string) ($body['code'] ?? '')));
    if (!preg_match('/^[A-Z0-9]{4}$/', $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    $loaded = room_load($code);
    if ($loaded === null) {
        room_json_out(500, ['error' => 'store unavailable']);
    }
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    $token = (string) ($body['token'] ?? '');
    $seat = room_find_seat($room, $token);
    if ($seat === null) {
        room_unlock($fh);
        room_json_out(401, ['error' => 'bad seat token']);
    }
    if ($needCsrf) {
        $csrf = (string) ($body['csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        if (!hash_equals((string) ($room['csrf'] ?? ''), $csrf)) {
            room_unlock($fh);
            room_json_out(403, ['error' => 'bad csrf token']);
        }
        $now = microtime(true);
        $last = (float) ($room['seats'][$seat]['lastAct'] ?? 0);
        if ($throttle && $now - $last < 0.15) {
            room_unlock($fh);
            room_json_out(429, ['error' => 'too fast']);
        }
        // Unthrottled requests (leave, the menu flag) do not spend the
        // spacing.
        if ($throttle) {
            $room['seats'][$seat]['lastAct'] = $now;
        }
    }
    return [$room, $fh, $path, $seat];
}

/* The host decides each non-human seat: drone battery ('ai') or 'open'. */
if ($action === 'seatmode' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($seat !== 0) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host sets the seats']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'match already started']);
    }
    $target = $body['seat'] ?? null;
    $mode = (string) ($body['mode'] ?? '');
    if (!is_int($target) || !isset($room['seats'][$target]) || !in_array($mode, ['ai', 'open'], true)) {
        room_unlock($fh);
        room_json_out(422, ['error' => 'pick a seat and AI or Open']);
    }
    if ($room['seats'][$target]['human'] ?? false) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'a player is sitting there']);
    }
    $room['seats'][$target]['mode'] = $mode;
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'start' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($seat !== 0) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host starts the match']);
    }
    if ($room['phase'] !== 'lobby') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'already started']);
    }
    // Humans and drone seats field units; open seats stay empty. The host
    // is always seated, so a single drone seat makes at least two tanks;
    // humans alone would have no one to fight.
    $drones = 0;
    foreach ($room['seats'] as $s) {
        if (!($s['human'] ?? false) && ($s['mode'] ?? 'ai') !== 'open') {
            $drones++;
        }
    }
    if ($drones === 0) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'A match needs at least two tanks. Switch a seat to AI so there is someone to battle.']);
    }
    room_start_round($room);
    $events = [];
    $events[] = ['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'state') {
    $code = strtoupper(trim((string) (($body['code'] ?? $_GET['code'] ?? ''))));
    if (!preg_match('/^[A-Z0-9]{4}$/', $code)) {
        room_json_out(422, ['error' => 'bad room code']);
    }
    $loaded = room_load($code);
    if ($loaded === null) {
        room_json_out(500, ['error' => 'store unavailable']);
    }
    [$room, $fh, $path] = $loaded;
    if (!is_array($room)) {
        room_unlock($fh);
        room_json_out(404, ['error' => 'no such room']);
    }
    $token = (string) ($body['token'] ?? $_GET['token'] ?? '');
    $seat = $token !== '' ? room_find_seat($room, $token) : null;
    if ($room['phase'] === 'play') {
        $events = [];
        room_advance($room, $events);
        foreach ($events as $e) {
            room_emit($room, $e);
        }
        room_settle_tanks($room);
        room_save($fh, $path, $room);
    } elseif ($seat !== null) {
        // Heartbeat: a seated browser polls state every couple of seconds, so
        // saving (mtime only, hands off lastAct) keeps a waiting lobby live
        // without holding its slot forever after everyone leaves.
        room_save($fh, $path, $room);
    }
    $since = (int) (($body['since'] ?? $_GET['since'] ?? 0));
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'act' && $method === 'POST') {
    // A menu flag only says "this player is in a menu": it follows the
    // player's own clicks, so the act throttle does not apply to it.
    [$room, $fh, $path, $seat] = room_gate($body, true, ($body['kind'] ?? '') !== 'menu');
    $kind = (string) ($body['kind'] ?? '');
    $events = [];
    if ($room['phase'] !== 'play') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'not playing right now']);
    }
    $myIdx = null;
    foreach ($room['tanks'] as $i => $t) {
        if ($t['seat'] === $seat && $t['hp'] > 0) {
            $myIdx = $i;
            break;
        }
    }
    // Loading a weapon and the menu flag are fine on anyone's turn: neither
    // moves the match (firing checks the ammo again). Everything else waits
    // for the player's own turn.
    $anyTurn = $kind === 'weapon' || $kind === 'menu';
    if ($kind === 'menu') {
        $room['menu'][$seat] = !empty($body['open']);
    } elseif ($myIdx === null || (!$anyTurn && ($room['tanks'][$room['turn']]['seat'] ?? -1) !== $seat)) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'not your turn']);
    }
    if ($kind === 'menu') {
        // Recorded above; nothing else to do.
    } else {
    $tank = &$room['tanks'][$myIdx];
    if ($kind === 'aim') {
        $tank['angle'] = max(10.0, min(170.0, (float) ($body['angle'] ?? $tank['angle'])));
        $tank['power'] = max(10.0, min(100.0, (float) ($body['power'] ?? $tank['power'])));
    } elseif ($kind === 'drive') {
        $dx = max(-80.0, min(80.0, (float) ($body['dx'] ?? 0)));
        if (abs($dx) > $tank['fuel'] + 1e-9) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'not enough fuel']);
        }
        $w = count($room['terrain']);
        // Roll toward the target a pixel at a time and stop short of any
        // other unit; fuel pays only for the ground actually covered.
        $goal = max(12.0, min($w - 12.0, $tank['x'] + $dx));
        $step = $goal > $tank['x'] ? 1.0 : -1.0;
        $nx = $tank['x'];
        while (abs($goal - $nx) >= 1.0 && !room_spot_taken($room, $myIdx, $nx + $step)) {
            $nx += $step;
        }
        if (abs($goal - $nx) < 1.0) {
            $nx = $goal;
        }
        $tank['fuel'] = max(0.0, $tank['fuel'] - abs($nx - $tank['x']));
        $tank['x'] = $nx;
        $xi = max(0, min($w - 1, (int) round($tank['x'])));
        $tank['y'] = $room['terrain'][$xi];
    } elseif ($kind === 'weapon') {
        $wkey = (string) ($body['weapon'] ?? 'shell');
        $weapons = room_weapons();
        if (!isset($weapons[$wkey])) {
            room_unlock($fh);
            room_json_out(422, ['error' => 'no such weapon']);
        }
        $have = $room['ammo'][$seat][$wkey] ?? 0;
        if ($wkey !== 'shell' && $have <= 0) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'none left']);
        }
        $minRound = $weapons[$wkey]['minRound'] ?? 1;
        if ($room['round'] < $minRound) {
            room_unlock($fh);
            $msg = $wkey === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound;
            room_json_out(409, ['error' => $msg]);
        }
        $room['weapon'][$seat] = $wkey;
    } elseif ($kind === 'fire') {
        // The shot carries its own aim so a fast trigger pull never fires stale barrels.
        if (isset($body['angle'])) {
            $tank['angle'] = max(10.0, min(170.0, (float) $body['angle']));
        }
        if (isset($body['power'])) {
            $tank['power'] = max(10.0, min(100.0, (float) $body['power']));
        }
        $wkey = (string) ($room['weapon'][$seat] ?? 'shell');
        $weapons = room_weapons();
        if (!isset($weapons[$wkey])) {
            $wkey = 'shell';
        }
        $have = $room['ammo'][$seat][$wkey] ?? 0;
        if ($wkey !== 'shell' && $have <= 0) {
            room_unlock($fh);
            room_json_out(409, ['error' => 'none left']);
        }
        $minRound = $weapons[$wkey]['minRound'] ?? 1;
        if ($room['round'] < $minRound) {
            room_unlock($fh);
            $msg = $wkey === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound;
            room_json_out(409, ['error' => $msg]);
        }
        if ($wkey !== 'shell') {
            $room['ammo'][$seat][$wkey] = $have - 1;
            $room['tanks'][$myIdx]['ammo'][$wkey] = $room['ammo'][$seat][$wkey];
            // The last one fired: the gun falls back to the endless Shell.
            if ($have - 1 <= 0) {
                $room['weapon'][$seat] = 'shell';
            }
        }
        $me = $room['tanks'][$myIdx];
        $events[] = ['t' => 'fire', 'seat' => $seat, 'w' => $wkey,
            'x' => round($me['x'], 1), 'a' => round($me['angle'], 1), 'pw' => round($me['power'], 1)];
        room_fire_shot($room, $events, $myIdx, $wkey);
        room_settle_tanks($room);
        $rng = $room['rng'];
        $room['wind'] = (int) max(-12, min(12, round($room['wind'] + room_gauss($rng) * 2)));
        $room['rng'] = $rng;
        room_check_oneups($room, $events, $seat);
        if (room_round_settled($room)) {
            room_end_round($room, $events);
        } else {
            $n = count($room['tanks']);
            $room['turn'] = ($room['turn'] + 1) % max(1, $n);
            room_advance($room, $events);
            room_settle_tanks($room);
        }
    } else {
        room_unlock($fh);
        room_json_out(422, ['error' => 'unknown act']);
    }
    unset($tank);
    }
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'buy' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($room['phase'] !== 'shop') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'shop is closed']);
    }
    $item = (string) ($body['item'] ?? '');
    $weapons = room_weapons();
    $price = null;
    $pack = 0;
    $gear = null;
    if ($item !== 'shell' && isset($weapons[$item])) {
        $minRound = $weapons[$item]['minRound'] ?? 1;
        if ($room['round'] < $minRound) {
            room_unlock($fh);
            $msg = $item === 'nuke' ? 'nukes unlock in round 4' : 'unlocks in round ' . $minRound;
            room_json_out(409, ['error' => $msg]);
        }
        $price = $weapons[$item]['price'];
        $pack = $weapons[$item]['pack'] ?? 1;
    } elseif (($gear = room_gear($item)) !== null) {
        $price = (int) ($gear['price'] ?? 0);
    } else {
        room_unlock($fh);
        room_json_out(422, ['error' => 'not for sale']);
    }
    $qty = (int) ($body['qty'] ?? 1);
    if ($qty < 1) $qty = 1;
    if ($qty > 9) $qty = 9;
    // One-shot tricks never stack: a second shield is just money on fire.
    if ($gear !== null && in_array($gear['effect'] ?? '', ['shield', 'extralife', 'laststand'], true)) {
        $qty = 1;
    }
    $total = $price * $qty;
    $cash = $room['cash'][$seat] ?? 0;
    if ($cash < $total) {
        room_unlock($fh);
        room_json_out(409, ['error' => 'short on cash']);
    }
    $room['cash'][$seat] = $cash - $total;
    if ($pack > 0) {
        $room['ammo'][$seat][$item] = ($room['ammo'][$seat][$item] ?? 0) + $pack * $qty;
    } elseif ($gear !== null) {
        $n = (int) ($gear['n'] ?? 0) * $qty;
        switch ($gear['effect'] ?? '') {
            case 'repair':
                $room['repair'][$seat] = ($room['repair'][$seat] ?? 0) + $n;
                break;
            case 'fuel':
                $room['fuelBonus'][$seat] = ($room['fuelBonus'][$seat] ?? 0) + $n;
                break;
            case 'plate':
                $room['plate'][$seat] = ($room['plate'][$seat] ?? 0) + $qty;
                break;
            case 'shield':
                $room['shield'][$seat] = true;
                break;
            case 'extralife':
                if (($room['seats'][$seat]['lives'] ?? 3) < 5) {
                    $room['seats'][$seat]['lives']++;
                } else {
                    $room['scores'][$seat] = ($room['scores'][$seat] ?? 0) + 500;
                }
                break;
            case 'jammer':
                $room['jammer'][$seat] = max($room['jammer'][$seat] ?? 0, $n);
                break;
            case 'bunker':
                $room['bunker'][$seat] = max($room['bunker'][$seat] ?? 0, $n);
                break;
            case 'laststand':
                $room['laststand'][$seat] = true;
                break;
        }
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

if ($action === 'next' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true);
    if ($room['phase'] !== 'shop') {
        room_unlock($fh);
        room_json_out(409, ['error' => 'not at the shop']);
    }
    // Apply stockpiled repairs and fuel before fresh hills.
    foreach ($room['seats'] as $idx => $s) {
        if (!($s['human'] ?? false)) {
            continue;
        }
        $room['repairApplied'][$idx] = $room['repair'][$idx] ?? 0;
        $room['fuelApplied'][$idx] = $room['fuelBonus'][$idx] ?? 0;
        $room['repair'][$idx] = 0;
        $room['fuelBonus'][$idx] = 0;
    }
    room_start_round($room);
    room_apply_banked($room);
    $events = [];
    $events[] = ['t' => 'round', 'round' => $room['round'], 'wind' => $room['wind']];
    room_advance($room, $events);
    foreach ($events as $e) {
        room_emit($room, $e);
    }
    room_settle_tanks($room);
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    $since = (int) ($body['since'] ?? 0);
    $out = room_snapshot($room, $seat, $since);
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => $out]);
}

room_json_out(405, ['error' => 'method not allowed']);



