<?php
/**
 * The Island of Crete: the shared Endless level bank's API.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * GET  ?grade=<easy|medium|hard>&tier=<1..10>&n=<0..16> -> { "csrf", "levels" }
 *      (n=0, the default, only fetches the CSRF token)
 * POST { "op": "submit", "install", "tuple", "made" } -> { "ok": true }
 * POST { "op": "claim", "install", "v" } -> { "ticket", "tuple" } or { "none": true }
 * POST { "op": "verify", "install", "ticket", "found" } -> { "ok": true, "verdict": "match" | "mismatch" }
 * POST { "op": "report", "install", "grade", "h" } -> { "ok": true }
 *
 * The trusted runner (a scheduled GitHub Actions job that verifies, then
 * generates) sends header X-Crete-Verifier: <token> instead of Origin and CSRF:
 * POST { "op": "trusted-list", "limit": 1..50 } -> { "items": [{ "grade", "h", "tuple", "made" }] }
 * POST { "op": "trusted-verify", "grade", "h", "verdict": "match" | "mismatch", "found" }
 *      -> { "ok": true, "verdict": "match" | "mismatch" }, or 404 { "error": "gone" }
 * POST { "op": "trusted-counts" }
 *      -> { "grades": { <grade>: { "served", "pending", "cap", "levels": [[score, chapter, rows, cols, hides]] } } }
 * POST { "op": "trusted-add", "tuple", "made", "replace"?: true } -> { "ok": true, "h", "retired"? } (served at once),
 *      or 409 { "error": "duplicate" | "retired" | "full" }, 403 { "error": "version" }; with replace, a full
 *      grade retires one served level (the server picks it, weighted) for the one it takes in; a duplicate or
 *      retired layout (one the bank served once and let go) takes no room and retires nothing
 * POST { "op": "trusted-export", "grade", "list": "served" | "pending" | "retired", "after": <h> | null, "limit": 1..500 }
 *      -> { "grade", "list", "total", "items", "next": <h> | null }: one page of the grade's list in hash order, read
 *      only (no count or file changes); a served item is { "h", "v", "at", "made", "n", "tuple" | null }, a pending
 *      one { "h", "v", "at", "made", "tuple" }, a retired one { "h" }; a page ends at limit items or once past 1 MiB
 * POST { "op": "trusted-where" } -> where the bank keeps its stores, read only (bank/Place.php's report): { "kind":
 *      "override" | "data" | "vartmp" | null, "dir", "refused": <why the bank will not start> | null, "ctime", "mtime",
 *      "grades": { <grade>: { "served" | "pending" | "retired": { "bytes", "mtime", "count", ... } | null } },
 *      "dataWritable", "folders": { "override"?, "data", "vartmp" }, "php", "bootTime", "server", "tmpMounts", "now" };
 *      it never makes a folder or file: it takes a rate slot only from a folder that already holds a bank, and
 *      answers even while the bank refuses its folder
 * Its token is checked before a rate slot is taken (a stranger's guesses write
 * nothing), against the sha256 in bank/verifier.json, which deploy.sh writes
 * from CRETE_BANK_VERIFIER_TOKEN; CRETE_BANK_VERIFIER_FILE overrides the path
 * (tests). Without the file every trusted call is 401 { "error": "unauthorized" }.
 *
 * Refusals: 400 { "error": "invalid", "field" }, 400 { "error": "ticket" }, 401 { "error": "unauthorized" },
 *   403 { "error": "forbidden" }, 403 { "error": "version" }, 409 { "error": "duplicate" | "retired" | "full" },
 *   429 { "error": "rate" | "throttled" }, 405 { "error": "method not allowed" }, 500 { "error": "server error" }.
 *
 * Every rule and store is bank/Bank.php's; settings are bank/config.json
 * (validated on load). The bank lives in data/, or /var/tmp/<account>-crete-bank
 * when PHP cannot write there; CRETE_BANK_DIR overrides both (tests). It never
 * moves on its own and never starts empty in /var/tmp while data/ exists
 * (bank/Place.php): such a refusal answers 500 and is logged. Origin,
 * CSRF and the per-network rate limits are the kit's score guard
 * (server/score-guard.php), its rate stamps in the bank's guard.json, keyed
 * under the bank's current network key.
 */
declare(strict_types=1);

require_once __DIR__ . '/bank/Bank.php';
require_once __DIR__ . '/bank/Place.php';

use Crete\Bank;
use Crete\Place;
use Crete\Refusal;
use Kit\ScoreGuard;
use Kit\StoreDir;

const CRETE_BANK_MAX_BODY = 65536;

function bankConfig(): array {
    static $config = null;
    return $config ??= Bank::loadConfig(__DIR__ . '/bank/config.json');
}

/** The bank's place: CRETE_BANK_DIR, else data/ or a private folder in /var/tmp, by bank/Place.php's rule. */
function bankPlace(): Place {
    static $place = null;
    $override = getenv('CRETE_BANK_DIR');
    return $place ??= new Place(
        __DIR__ . '/data',
        '/var/tmp/' . StoreDir::username() . '-crete-bank',
        is_string($override) && $override !== '' ? rtrim($override, '/') : null,
        new StoreDir('crete bank storage:'),
    );
}

/** The bank's folder, checked (Place::choose); a refusal answers 500 and is logged. */
function bankDir(): string {
    static $dir = null;
    return $dir ??= bankPlace()->choose()['dir'];
}

/** Where the trusted verifier's token hash is kept. */
function bankVerifierFile(): string {
    $override = getenv('CRETE_BANK_VERIFIER_FILE');
    return is_string($override) && $override !== '' ? $override : __DIR__ . '/bank/verifier.json';
}

function bank(): Bank {
    static $bank = null;
    return $bank ??= new Bank(bankConfig(), bankDir());
}

/** The kit's gate, set up for the bank: its cookie, header, rate key and rate store. */
function bankGuard(): ScoreGuard {
    static $guard = null;
    return $guard ??= new ScoreGuard(bank()->guardConfig(), 'X-Crete-CSRF', bank()->networkKey(), $_SERVER, $_COOKIE, bankDir() . '/guard.json');
}

function bankRespond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

/** Takes one of this network's slots for $kind, or answers 429. */
function bankTakeRate(string $kind): void {
    if (!bankGuard()->rateTake($kind, bank()->perHour()[$kind])) {
        bankRespond(['error' => 'rate'], 429);
    }
}

/** A query parameter as an integer when it is one written plainly, else the raw value (which the bank refuses). */
function bankQueryInt(string $name, ?int $default = null): mixed {
    $value = $_GET[$name] ?? null;
    if ($value === null) {
        return $default;
    }
    return is_string($value) && preg_match('/^(0|[1-9][0-9]{0,5})\z/', $value) ? (int) $value : $value;
}

// Tests load the functions above without serving a request.
if (defined('CRETE_BANK_LIBRARY')) {
    return;
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $addr = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

    if ($method === 'GET') {
        $csrf = bankGuard()->csrfToken();
        $n = bankQueryInt('n', 0);
        if ($n === 0) {
            bankRespond(['csrf' => $csrf, 'levels' => []]);
        }
        $grade = $_GET['grade'] ?? null;
        $tier = bankQueryInt('tier');
        // Checked before a rate slot is spent.
        if (!is_int($n) || $n < 0 || $n > 16) {
            throw Refusal::invalid('n');
        }
        bank()->levels($grade, $tier, 0);
        bankTakeRate('levels');
        bankRespond(['csrf' => $csrf, 'levels' => bank()->levels($grade, $tier, $n)]);
    }

    if ($method === 'POST') {
        $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
        if (stripos($contentType, 'application/json') === false) {
            bankRespond(['error' => 'forbidden'], 403);
        }
        $raw = file_get_contents('php://input', false, null, 0, CRETE_BANK_MAX_BODY + 1);
        if (!is_string($raw) || strlen($raw) > CRETE_BANK_MAX_BODY) {
            bankRespond(['error' => 'invalid', 'field' => 'body'], 400);
        }
        $body = json_decode($raw, true, 32);
        if (!is_array($body)) {
            bankRespond(['error' => 'invalid', 'field' => 'body'], 400);
        }
        $op = $body['op'] ?? null;
        if ($op === 'trusted-where') {
            $token = $_SERVER['HTTP_X_CRETE_VERIFIER'] ?? null;
            if (!Bank::trusted($token, bankVerifierFile())) {
                bankRespond(['error' => 'unauthorized'], 401);
            }
            if (array_keys($body) !== ['op']) {
                bankRespond(['error' => 'invalid', 'field' => 'body'], 400);
            }
            $where = bankPlace()->report();
            // A rate slot only from a folder that already holds a bank: taking one sets the folder up, and this op
            // must never make a folder, a deny file or born.json. While the bank refuses, or has no levels yet, the
            // token holder still gets the report.
            if ($where['kind'] !== null && ($where['folders'][$where['kind']]['holdsBank'] ?? false)) {
                try {
                    bankTakeRate('trusted');
                } catch (RuntimeException) {
                    // The folder went away between the report and the slot: the report stands.
                }
            }
            bankRespond($where);
        }
        if (is_string($op) && in_array($op, Bank::TRUSTED_OPS, true)) {
            $token = $_SERVER['HTTP_X_CRETE_VERIFIER'] ?? null;
            if (!Bank::trusted($token, bankVerifierFile())) {
                bankRespond(['error' => 'unauthorized'], 401);
            }
            bankTakeRate('trusted');
            bankRespond(bank()->handleTrusted($body, $token, bankVerifierFile()));
        }
        if (!bankGuard()->originAllowed() || !bankGuard()->csrfOk()) {
            bankRespond(['error' => 'forbidden'], 403);
        }
        if (!is_string($op) || !in_array($op, ['submit', 'claim', 'verify', 'report'], true)) {
            bankRespond(['error' => 'invalid', 'field' => 'op'], 400);
        }
        bankTakeRate($op);
        bankRespond(bank()->handle($body, $addr));
    }

    bankRespond(['error' => 'method not allowed'], 405);
} catch (Refusal $r) {
    bankRespond($r->payload, $r->status);
} catch (Throwable $e) {
    error_log('endless-bank.php: ' . $e->getMessage());
    bankRespond(['error' => 'server error'], 500);
}
