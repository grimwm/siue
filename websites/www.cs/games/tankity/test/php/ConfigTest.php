<?php
// .config.yaml precedence: defaults, file values, environment overrides.
declare(strict_types=1);
if (!defined('TANKITY_GAME_DIR')) {
    define('TANKITY_GAME_DIR', dirname(__DIR__, 2));
}
require_once TANKITY_GAME_DIR . '/config.php';

use PHPUnit\Framework\TestCase;

final class ConfigTest extends TestCase
{
    private string|false $oldConfigFile;
    private string|false $oldMax;
    private string|false $oldDir;
    private string $tmp;

    protected function setUp(): void
    {
        $this->oldConfigFile = getenv('CONFIG_FILE');
        $this->oldMax = getenv('TANKITY_ROOM_DB_MAX_MB');
        $this->oldDir = getenv('TANKITY_DATA_DIR');
        $this->tmp = sys_get_temp_dir() . '/tankity-config-test-' . getmypid() . '-' . bin2hex(random_bytes(3));
        mkdir($this->tmp);
        // The sections assume neither setting comes from the environment.
        putenv('TANKITY_ROOM_DB_MAX_MB');
        putenv('TANKITY_DATA_DIR');
    }

    protected function tearDown(): void
    {
        @unlink($this->tmp . '/a.yaml');
        @rmdir($this->tmp);
        foreach (['CONFIG_FILE' => $this->oldConfigFile, 'TANKITY_ROOM_DB_MAX_MB' => $this->oldMax, 'TANKITY_DATA_DIR' => $this->oldDir] as $name => $old) {
            putenv(is_string($old) ? "$name=$old" : $name);
        }
    }

    /** Writes a.yaml (comments, quotes, a blank value) and points CONFIG_FILE at it. */
    private function useFileConfig(): void
    {
        file_put_contents(
            $this->tmp . '/a.yaml',
            "# a comment\nroom_db_max_mb: 3\ndata_dir: \"/tmp/sco\" # trailing note\nroom_live_secs: '60'\nblank: \n"
        );
        putenv('CONFIG_FILE=' . $this->tmp . '/a.yaml');
        tankity_config(true);
    }

    /** the default path is the game directory when CONFIG_FILE is unset */
    public function testDefaultPath(): void
    {
        putenv('CONFIG_FILE');
        tankity_config(true);
        self::assertTrue(tankity_config_path() === TANKITY_GAME_DIR . '/.config.yaml', 'default-path');
    }

    /** a missing file falls back to built-in defaults */
    public function testMissingFileUsesDefaults(): void
    {
        putenv('CONFIG_FILE=' . $this->tmp . '/nope.yaml');
        tankity_config(true);
        self::assertTrue(tankity_setting('TANKITY_ROOM_DB_MAX_MB', 'room_db_max_mb', 10) === 10, 'missing-default');
    }

    /** file values are picked up; comments and quotes are tolerated */
    public function testFileValues(): void
    {
        $this->useFileConfig();
        self::assertTrue(tankity_setting('TANKITY_ROOM_DB_MAX_MB', 'room_db_max_mb', 10) === '3', 'file-max');
        self::assertTrue(tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/sco', 'file-dir');
        putenv('TANKITY_DATA_DIR=/tmp/env-dir');
        self::assertTrue(tankity_setting('TANKITY_DATA_DIR', 'data_dir', '') === '/tmp/env-dir', 'env-dir-beats-file');
        putenv('TANKITY_DATA_DIR');
        self::assertTrue(tankity_setting('TANKITY_ROOM_LIVE_SECS', 'room_live_secs', 600) === '60', 'file-live');
        self::assertTrue(tankity_setting('TANKITY_X', 'blank', 'dflt') === 'dflt', 'file-blank-default');
    }

    /** the environment beats the file */
    public function testEnvironmentBeatsFile(): void
    {
        $this->useFileConfig();
        putenv('TANKITY_ROOM_DB_MAX_MB=7');
        self::assertTrue(tankity_setting('TANKITY_ROOM_DB_MAX_MB', 'room_db_max_mb', 10) === '7', 'env-beats-file');
        putenv('TANKITY_ROOM_DB_MAX_MB');
        tankity_config(true);
        self::assertTrue(tankity_setting('TANKITY_ROOM_DB_MAX_MB', 'room_db_max_mb', 10) === '3', 'env-cleared-file');
    }

    /** loading never writes; bytes and mtime are identical afterwards */
    public function testLoadingNeverWrites(): void
    {
        $this->useFileConfig();
        $before = file_get_contents($this->tmp . '/a.yaml');
        $mtBefore = filemtime($this->tmp . '/a.yaml');
        tankity_config(true);
        clearstatcache();
        self::assertTrue(file_get_contents($this->tmp . '/a.yaml') === $before && filemtime($this->tmp . '/a.yaml') === $mtBefore, 'never-writes');
    }
}
