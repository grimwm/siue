<?php
// The visitor beacon's endpoint: POST only, always an empty 204. It stores; it never answers with data.
declare(strict_types=1);

require __DIR__ . '/lib/bootstrap.php';

stats_collect();
