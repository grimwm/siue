<?php
/**
 * Site adapter for the Games page: every games/<id>/metadata.yaml as JSON.
 * The catalog code lives in games/hub.php.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * GET -> { "games": [card, ...], "errors": [{ "id", "error" }, ...] }
 */
declare(strict_types=1);
require __DIR__ . '/games/hub.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
echo json_encode(games_hub_list(__DIR__ . '/games'), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
