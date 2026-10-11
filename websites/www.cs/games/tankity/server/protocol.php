<?php
// Operation Tankity rooms. The wire protocol: the event log, what a client wants, and the snapshots and deltas
// (terrainRev, resync) a room is reported through. protocol/ holds the pinned
// fixtures. Loaded by rooms.php; it runs nothing on its own.
declare(strict_types=1);

// Not an endpoint: rooms.php defines this constant, then requires the file.
// A direct request gets a 404 and nothing runs.
if (!defined('TANKITY_ROOMS_INCLUDED')) {
    http_response_code(404);
    exit;
}

/* Events a room keeps for late pollers. A drone-only battle makes one volley
// per ROOM_DRONE_PACE_MIN seconds at most, a volley is a few dozen events, and
// the busiest client polls every 1.6 s, so this holds many volleys' worth. */
const ROOM_EVENT_KEEP = 240;
function room_emit(array &$room, array $ev): void
{
    $room['seq'] = ($room['seq'] ?? 0) + 1;
    $ev['seq'] = $room['seq'];
    $room['events'][] = $ev;
    $room['events'] = array_slice($room['events'], -ROOM_EVENT_KEEP);
}

/* ---------- snapshots (public + private per seat) ---------- */
/* What a client says it already holds, read from a POST body or the query
   string: `since` (the newest event seq seen), `have` (the terrainRev of the
   hills it holds; absent when it holds none) and `full` (send everything). */
function room_want(array $body): array
{
    $get = fn(string $k) => $body[$k] ?? $_GET[$k] ?? null;
    $have = $get('have');
    return [
        'since' => (int) ($get('since') ?? 0),
        'have' => is_numeric($have) ? (int) $have : null,
        'full' => !empty($get('full')) && $get('full') !== '0',
    ];
}
/* The reply every room-answering handler ends with. */
function room_reply_snapshot(array $room, ?int $seat, array $body): array
{
    $w = room_want($body);
    return room_snapshot($room, $seat, $w['since'], $w['have'], $w['full']);
}
/* A delta snapshot leaves the hills out (720 numbers, most of the bytes)
   when `$have` is the revision the room is at, and always names the current
   revision. It is a full snapshot when the client asks (`$full`), holds
   nothing, holds another revision, or has fallen so far behind that events
   it never saw are gone (`resync`: its `since` is older than the oldest event
   kept, or newer than the room's own count). */
function room_snapshot(array $room, ?int $seat, int $since, ?int $have = null, bool $full = false): array
{
    $events = $room['events'] ?? [];
    $seq = (int) ($room['seq'] ?? 0);
    $oldest = $events ? (int) ($events[0]['seq'] ?? 1) : $seq + 1;
    $resync = $since > $seq || ($since > 0 && $oldest > $since + 1);
    $rev = (int) ($room['terrainRev'] ?? 1);
    $sendTerrain = $full || $resync || $have !== $rev || !$room['terrain'];
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
            // A player who left mid-match: a bot drives their unit now.
            'bot' => !$s['human'] && !empty($s['bot']),
            'lives' => $s['lives'] ?? 0,
            'score' => $room['scores'][$idx] ?? 0,
            // Pressed Ready at the shop (always false elsewhere).
            'ready' => $room['phase'] === 'shop' && room_shop_ready($room, $idx),
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
        // Seconds left before the shop closes and the next round starts.
        'shopLeft' => (function () use ($room) {
            $left = room_shop_left($room);
            return $left === null ? null : round($left, 1);
        })(),
        'terrainRev' => $rev,
        'tanks' => $tanks,
        'seats' => $seats,
        'events' => array_values(array_filter($events, fn($e) => ($e['seq'] ?? 0) > $since)),
    ];
    if ($sendTerrain) {
        $out['terrain'] = array_map(fn($v) => round($v, 1), $room['terrain']);
    }
    if ($resync) {
        $out['resync'] = true;
    }
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
