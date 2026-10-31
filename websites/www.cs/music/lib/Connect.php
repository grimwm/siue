<?php
// What a person copies to connect an AI app to their studio: one command or settings block per app, each starting the
// studio MCP (the siue-music wheel this site publishes under music/dist/, run by uvx) with the studio's address and
// the AI key. The front page shows them with a placeholder for the key; Your studio shows them with a new key filled
// in. music/dist/release.json, committed, names the wheel and its SHA-256; the deploy builds the wheel and refuses
// one with another hash.
declare(strict_types=1);

namespace Music;

final class Connect
{
    /** What the commands carry until the person pastes their key; the MCP answers it with what to do. */
    public const PLACEHOLDER = 'PASTE-YOUR-AI-KEY-HERE';
    public const UV_INSTALL = 'https://docs.astral.sh/uv/getting-started/installation/';
    public const SERVER = 'siue-music';

    /** @return array{version: string, file: string, sha256: string}|null release.json, or null when it is missing or malformed */
    public static function release(?string $path = null): ?array
    {
        $raw = @file_get_contents($path ?? __DIR__ . '/../dist/release.json');
        $d = is_string($raw) ? json_decode($raw, true) : null;
        if (!is_array($d) || !is_string($d['version'] ?? null) || !is_string($d['file'] ?? null) || !is_string($d['sha256'] ?? null)
            || preg_match('/^siue_music-[0-9][0-9A-Za-z.]*-py3-none-any\.whl$/D', $d['file']) !== 1 || preg_match('/^[0-9a-f]{64}$/D', $d['sha256']) !== 1) {
            return null;
        }
        return ['version' => $d['version'], 'file' => $d['file'], 'sha256' => $d['sha256']];
    }

    /**
     * Each app's command or settings block, in the order the page lists them: [app name, how to use it, the text].
     * $base is the studio's music/ address, $release release(), $key the AI key or PLACEHOLDER.
     *
     * @param array{version: string, file: string, sha256: string} $release
     * @return list<array{app: string, how: string, text: string}>
     */
    public static function commands(string $base, array $release, string $key): array
    {
        $base = rtrim($base, '/') . '/';
        $wheel = $base . 'dist/' . $release['file'];
        $run = ['uvx', '--from', $wheel, self::SERVER, 'mcp'];
        $env = ['SIUE_MUSIC_BASE' => $base, 'SIUE_MUSIC_AI_KEY' => $key];
        $pairs = static fn(string $flag): string => implode(' ', array_map(static fn(string $k, string $v): string => "$flag $k=$v", array_keys($env), $env));
        $block = (string) json_encode(['mcpServers' => [self::SERVER => ['command' => 'uvx', 'args' => array_slice($run, 1), 'env' => $env]]],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        return [
            ['app' => 'Claude Code', 'how' => 'Run this once, in any folder.',
                'text' => 'claude mcp add --scope user ' . self::SERVER . ' ' . $pairs('--env') . ' -- ' . implode(' ', $run)],
            ['app' => 'Claude Desktop', 'how' => 'Settings, Developer, Edit Config: add this to claude_desktop_config.json (inside "mcpServers" if it has one), then restart the app.',
                'text' => $block],
            ['app' => 'Cursor', 'how' => 'Add this to ~/.cursor/mcp.json (inside "mcpServers" if it has one).',
                'text' => $block],
            ['app' => 'Codex', 'how' => 'Run this once.',
                'text' => 'codex mcp add ' . self::SERVER . ' ' . $pairs('--env') . ' -- ' . implode(' ', $run)],
            ['app' => 'Gemini CLI', 'how' => 'Run this once.',
                'text' => 'gemini mcp add --scope user ' . $pairs('-e') . ' -- ' . self::SERVER . ' ' . implode(' ', $run)],
        ];
    }
}
