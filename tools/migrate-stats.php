<?php
// One-time run artifact for the transfer-game-data job (grimwm/siue,
// .github/workflows/deploy.yml). Copy of the migration script from the
// HappySTL Stats plugin — the plugin repo is the source of truth:
//   happy-stl/wordpress, plugins/happystl-stats/tools/migrate-stats.php
//   (added in PR #5, commit 6178422f; merged as 88515e48)
// Do not edit this copy to change the migration: change the plugin and
// re-copy it. William decided MIGRATE (not fresh start) on Nov 25, 2026.
// After the migration runs once, delete this file with the job.
//
// One-time migration: copy the SIUE stats history (stats.sqlite) into the WordPress tables.
//
// DO NOT RUN against production until William has decided migrate-vs-fresh-start (see the README).
// The script never reads the live file in place: it consumes the fetched copy the transfer-game-data
// job already validates (PRAGMA integrity_check on the runner). Run it from the command line on the
// machine that holds both the fetched SQLite file and WordPress:
//
//   php tools/migrate-stats.php --sqlite=/path/to/stats.sqlite --wp-load=/path/to/wp-load.php [--chunk=1000] [--dry-run] [--force]
//
// What it copies, table for table (same names, $wpdb->prefix prepended): hits (every column verbatim,
// including the stored ids — the rollup's "first view of a visit" is MIN(id) — and the stored dhash/who,
// so no salt is needed to keep history), visitors, daily, cohorts, meta (rolled_through,
// cohorts_through, cleanup_at, so the WordPress rollup resumes where SIUE stopped), memo, and the
// latest salts row only (today's continuity for storageless visitors). The rate table is ephemeral
// per-minute counters and is not migrated.
//
// Safety: it refuses when the target tables already hold rows, unless --force is given, in which case
// it truncates all eight tables first and loads fresh. --dry-run reports the source counts and what
// would be copied, and writes nothing. After every run it verifies COUNT(*) per table on both sides
// and exits non-zero on a mismatch.
//
// The fetch-to-cutover gap: beacons sent between the fetch and the endpoint switch land in SIUE's
// database and are lost, so fetch, migrate, verify and cut over in one window, ideally just after
// midnight Chicago time (which also makes the salt question moot).
//
// CLI only: loaded over HTTP it exits at once.
declare(strict_types=1);

if ( PHP_SAPI !== 'cli' ) {
	exit( 'migrate-stats.php runs on the command line only.' . PHP_EOL );
}

$opts = getopt( '', ['sqlite:', 'wp-load:', 'chunk::', 'dry-run', 'force'] );
$sqlite_path = $opts['sqlite'] ?? '';
$wp_load     = $opts['wp-load'] ?? '';
$chunk       = max( 1, (int) ( $opts['chunk'] ?? 1000 ) );
$dry_run     = isset( $opts['dry-run'] );
$force       = isset( $opts['force'] );

if ( $sqlite_path === '' || $wp_load === '' ) {
	fwrite( STDERR, "Usage: php tools/migrate-stats.php --sqlite=/path/to/stats.sqlite --wp-load=/path/to/wp-load.php [--chunk=1000] [--dry-run] [--force]\n" );
	exit( 2 );
}
if ( ! is_file( $sqlite_path ) ) {
	fwrite( STDERR, "No SQLite file at $sqlite_path\n" );
	exit( 2 );
}
// A live -wal means the copy may be missing the latest writes; re-fetch with it checkpointed.
if ( is_file( $sqlite_path . '-wal' ) && filesize( $sqlite_path . '-wal' ) > 0 ) {
	fwrite( STDERR, "The SQLite file has a non-empty -wal beside it ($sqlite_path-wal). Re-fetch after checkpointing, or the migrated history will be missing its latest writes.\n" );
	exit( 2 );
}
if ( ! is_file( $wp_load ) ) {
	fwrite( STDERR, "No wp-load.php at $wp_load\n" );
	exit( 2 );
}

require $wp_load;

global $wpdb;
$prefix = $wpdb->prefix . 'happystl_stats_';
$tables = ['hits', 'visitors', 'salts', 'rate', 'daily', 'cohorts', 'meta', 'memo'];

// The plugin must be activated first: the tables come from activation (dbDelta).
$missing = [];
foreach ( $tables as $t ) {
	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $prefix . $t ) ) === null ) {
		$missing[] = $prefix . $t;
	}
}
if ( $missing !== [] ) {
	fwrite( STDERR, 'These tables do not exist yet — activate the HappySTL Stats plugin first: ' . implode( ', ', $missing ) . "\n" );
	exit( 2 );
}

$src = new PDO( 'sqlite:' . $sqlite_path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION] );
$src->exec( 'PRAGMA query_only = ON' );
$integrity = $src->query( 'PRAGMA integrity_check' )->fetchColumn();
if ( $integrity !== 'ok' ) {
	fwrite( STDERR, "integrity_check failed: $integrity\n" );
	exit( 2 );
}

$source_counts = [];
foreach ( ['hits', 'visitors', 'daily', 'cohorts', 'meta', 'memo', 'salts'] as $t ) {
	$source_counts[ $t ] = (int) $src->query( "SELECT COUNT(*) FROM $t" )->fetchColumn();
}
$target_hits = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $prefix . 'hits' );
echo "Source: " . json_encode( $source_counts ) . PHP_EOL;
echo "Target hits rows already present: $target_hits" . PHP_EOL;
if ( $target_hits > 0 && ! $force ) {
	fwrite( STDERR, "The WordPress tables already hold $target_hits hit rows. Pass --force to truncate all eight tables and load fresh, or start from an empty install.\n" );
	exit( 2 );
}
if ( $dry_run ) {
	echo "Dry run: nothing written. Pass the same command without --dry-run to migrate.\n";
	exit( 0 );
}
if ( $force ) {
	foreach ( $tables as $t ) {
		$wpdb->query( 'TRUNCATE TABLE ' . $prefix . $t );
	}
	echo "Truncated the eight target tables (--force).\n";
}

/** One chunk of rows into a WordPress table, as a single multi-row INSERT. */
$insert_chunk = static function ( string $table, array $cols, array $formats, array $rows, bool $ignore ) use ( $wpdb, $prefix ): void {
	if ( $rows === [] ) {
		return;
	}
	$marks  = [];
	$params = [];
	foreach ( $rows as $row ) {
		$cells = [];
		foreach ( $row as $i => $v ) {
			if ( $v === null ) {
				$cells[] = 'NULL';
			} else {
				$cells[]  = $formats[ $i ];
				$params[] = $v;
			}
		}
		$marks[] = '(' . implode( ', ', $cells ) . ')';
	}
	$sql = 'INSERT ' . ( $ignore ? 'IGNORE ' : '' ) . 'INTO ' . $prefix . $table
		. ' (' . implode( ', ', array_map( static fn( string $c ): string => "`$c`", $cols ) ) . ') VALUES ' . implode( ', ', $marks );
	$wpdb->query( $wpdb->prepare( $sql, $params ) );
};

/** Copies a table in $chunk-row SELECTs, in key order. */
$copy = static function ( string $table, array $cols, array $formats, string $order, bool $ignore, string $where = '' ) use ( $src, $chunk, $insert_chunk ): int {
	$n      = 0;
	$offset = 0;
	$sql    = 'SELECT ' . implode( ', ', $cols ) . " FROM $table" . ( $where !== '' ? " WHERE $where" : '' ) . " ORDER BY $order LIMIT $chunk OFFSET ";
	while ( true ) {
		$rows = $src->query( $sql . $offset )->fetchAll( PDO::FETCH_NUM );
		if ( $rows === [] ) {
			break;
		}
		$insert_chunk( $table, $cols, $formats, $rows, $ignore );
		$n      += count( $rows );
		$offset += count( $rows );
	}
	return $n;
};

$copied = [];
$copied['hits']     = $copy( 'hits', ['id', 'at', 'day', 'hour', 'page', 'kind', 'name', 'prop', 'pv', 'sid', 'vid', 'dhash', 'who', 'ref', 'device', 'secs'], ['%d', '%d', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d'], 'id', true );
$copied['visitors'] = $copy( 'visitors', ['vid', 'page', 'first_day', 'last_day'], ['%s', '%s', '%s', '%s'], 'vid, page', true );
$copied['daily']    = $copy( 'daily', ['day', 'page', 'metric', 'value'], ['%s', '%s', '%s', '%f'], 'day, page, metric', true );
$copied['cohorts']  = $copy( 'cohorts', ['day', 'page', 'size', 'd1', 'd7'], ['%s', '%s', '%d', '%d', '%d'], 'day, page', true );
$copied['meta']     = $copy( 'meta', ['k', 'v'], ['%s', '%s'], 'k', true );
$copied['memo']     = $copy( 'memo', ['k', 'v'], ['%s', '%s'], 'k', true );
// Salts: the latest day's row only. Older rows are already gone on the SIUE side, and the daily hash
// of a past day is never recomputed — only today's row matters for continuity.
$latest_salt_day = $src->query( 'SELECT MAX(day) FROM salts' )->fetchColumn();
$copied['salts'] = 0;
if ( is_string( $latest_salt_day ) ) {
	$copied['salts'] = $copy( 'salts', ['day', 'salt'], ['%s', '%s'], 'day', true, "day = '" . str_replace( "'", "''", $latest_salt_day ) . "'" );
}

// Verify: COUNT(*) per table on both sides.
$ok = true;
foreach ( ['hits', 'visitors', 'daily', 'cohorts', 'meta', 'memo', 'salts'] as $t ) {
	$target = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . $prefix . $t );
	$want   = $t === 'salts' ? ( is_string( $latest_salt_day ) ? 1 : 0 ) : $source_counts[ $t ];
	$match  = $target === $want && $copied[ $t ] === $want;
	$ok     = $ok && $match;
	echo sprintf( "%-9s source %6d copied %6d target %6d %s\n", $t, $want, $copied[ $t ], $target, $match ? 'OK' : 'MISMATCH' );
}
if ( ! $ok ) {
	fwrite( STDERR, "Verification failed: a table's counts do not agree. The load is partial; re-run with --force.\n" );
	exit( 1 );
}
echo "Migration complete. Verify the dashboard's last-30-days KPIs against the SIUE dashboard, then cut over the endpoint (STATS_ENDPOINT in play/hub_pages.py) in the same window.\n";
