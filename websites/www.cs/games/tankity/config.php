<?php
// Operation Tankity server settings, read once at startup from .config.yaml.
// The game NEVER writes to this file. Precedence per setting: environment
// variable first, config file second, built-in default last. The file lives
// next to the game by default; CONFIG_FILE points at another file instead.
declare(strict_types=1);

function tankity_config_path(): string
{
    $env = getenv('CONFIG_FILE');
    if (is_string($env) && trim($env) !== '') {
        return trim($env);
    }
    return __DIR__ . '/.config.yaml';
}

/* Tiny YAML subset: flat `key: value` lines, `#` comments, simple scalars. */
function tankity_parse_yaml(string $text): array
{
    $out = [];
    foreach (explode("\n", $text) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $pos = strpos($line, ':');
        if ($pos === false) {
            continue;
        }
        $key = trim(substr($line, 0, $pos));
        if ($key === '' || !preg_match('/^[A-Za-z0-9_.-]+$/', $key)) {
            continue;
        }
        $val = trim(substr($line, $pos + 1));
        $cut = strpos($val, ' #');
        if ($cut !== false) {
            $val = trim(substr($val, 0, $cut));
        }
        if (strlen($val) >= 2 && (($val[0] === '"' && $val[-1] === '"') || ($val[0] === "'" && $val[-1] === "'"))) {
            $val = substr($val, 1, -1);
        }
        $out[$key] = $val;
    }
    return $out;
}

function tankity_config(bool $refresh = false): array
{
    static $cfg = null;
    if ($cfg !== null && !$refresh) {
        return $cfg;
    }
    $cfg = [];
    $raw = @file_get_contents(tankity_config_path());
    if (is_string($raw)) {
        $cfg = tankity_parse_yaml($raw);
    }
    return $cfg;
}

/* Environment wins when set and non-empty; blank file values fall through. */
function tankity_setting(string $envName, string $key, $default)
{
    if ($envName !== '') {
        $env = getenv($envName);
        if (is_string($env) && trim($env) !== '') {
            return trim($env);
        }
    }
    $cfg = tankity_config();
    if (array_key_exists($key, $cfg) && trim((string) $cfg[$key]) !== '') {
        return $cfg[$key];
    }
    return $default;
}
