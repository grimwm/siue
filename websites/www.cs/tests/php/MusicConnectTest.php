<?php
// The Connect Your AI commands (Music\Connect), one per app, in the forms each app's own CLI was checked to accept
// (claude mcp add, codex mcp add, gemini mcp add) and the settings block Claude Desktop and Cursor read; the front
// page carries them with the placeholder and Your studio with a key just made, and never another key.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/MusicFakes.php';

final class MusicConnectTest extends TestCase
{
    private const BASE = 'https://www.cs.siue.edu/~wgrim/music/';
    private const RELEASE = ['version' => '1.0.0', 'file' => 'siue_music-1.0.0-py3-none-any.whl', 'sha256' => 'ab'];
    private const WHEEL = self::BASE . 'dist/siue_music-1.0.0-py3-none-any.whl';

    public function testEachAppGetsItsOwnCommandWithTheAddressTheWheelAndTheKey(): void
    {
        $key = str_repeat('c', 64);
        $by = array_column(Music\Connect::commands(self::BASE, self::RELEASE, $key), 'text', 'app');
        self::assertSame(['Claude Code', 'Claude Desktop', 'Cursor', 'Codex', 'Gemini CLI'], array_keys($by));
        $env = 'SIUE_MUSIC_BASE=' . self::BASE . " %s SIUE_MUSIC_AI_KEY=$key";
        self::assertSame('claude mcp add --scope user siue-music --env ' . sprintf($env, '--env') . ' -- uvx --from ' . self::WHEEL . ' siue-music mcp', $by['Claude Code']);
        self::assertSame('codex mcp add siue-music --env ' . sprintf($env, '--env') . ' -- uvx --from ' . self::WHEEL . ' siue-music mcp', $by['Codex']);
        self::assertSame('gemini mcp add --scope user siue-music uvx -e ' . sprintf($env, '-e') . ' -- --from ' . self::WHEEL . ' siue-music mcp', $by['Gemini CLI']);
        $block = json_decode($by['Claude Desktop'], true);
        self::assertSame(['mcpServers' => ['siue-music' => ['command' => 'uvx', 'args' => ['--from', self::WHEEL, 'siue-music', 'mcp'],
            'env' => ['SIUE_MUSIC_BASE' => self::BASE, 'SIUE_MUSIC_AI_KEY' => $key]]]], $block);
        self::assertSame($by['Claude Desktop'], $by['Cursor']);
    }

    public function testAMissingOrMalformedReleaseGivesNoCommands(): void
    {
        $dir = admin_tmp_dir();
        self::assertNull(Music\Connect::release("$dir/none.json"));
        file_put_contents("$dir/bad.json", '{"version":"1","file":"evil.sh","sha256":"' . str_repeat('a', 64) . '"}');
        self::assertNull(Music\Connect::release("$dir/bad.json"));
        self::assertNotNull(Music\Connect::release());
    }

    public function testThePagesCarryThePlaceholderAndOnlyAJustMadeKey(): void
    {
        [, $db, $dir, $clock, $accounts] = music_world(true, 'student@siue.edu');
        [$pages, $sessions] = music_pages($db, $dir, $clock, 'https://www.cs.siue.edu/~wgrim/admin/');
        $account = (int) $accounts->idFor('student@siue.edu');
        $as = music_signed_in($sessions, $account, ['headers' => ['sec-fetch-dest' => 'document', 'sec-fetch-mode' => 'navigate']]);
        $index = $pages->index($as)->body;
        self::assertSame(1, preg_match('/data-connect="([^"]*)"/', $index, $m));
        $connect = json_decode(html_entity_decode($m[1], ENT_QUOTES), true);
        self::assertSame(Music\Connect::PLACEHOLDER, $connect['placeholder']);
        self::assertStringContainsString('SIUE_MUSIC_AI_KEY=PASTE-YOUR-AI-KEY-HERE', $connect['commands'][0]['text']);
        self::assertSame(Music\Connect::release()['sha256'], $connect['sha256']);

        $made = $pages->studioAction(req(['https' => true, 'method' => 'POST', 'cookies' => $as->cookies, 'headers' => $as->headers,
            'post' => ['csrf' => $sessions->csrf($as), 'action' => 'make-key', 'label' => 'mine', 'scopes' => ['notes:pickup']]]))->body;
        self::assertSame(1, preg_match('#<code class="secret">([0-9a-f]{64})</code>#', $made, $k));
        self::assertStringContainsString('SIUE_MUSIC_AI_KEY=' . $k[1] . ' -- uvx --from', $made);
        self::assertStringContainsString('<details data-connect-app="Claude Code"><summary>Claude Code</summary>', $made, 'each app in its own section');
        self::assertStringNotContainsString('<details open', $made, 'every section starts closed');
        self::assertStringContainsString('Your AI app makes the pairing code, so this site cannot show it. Ask your AI “What’s my siue-music pairing code?”', $made);
        self::assertSame(1, preg_match('#<section class="studio-card newkey".*?</section>#s', $made, $card));
        self::assertDoesNotMatchRegularExpression('/\\bmake\\b|repositor|1Password|GitHub/i', strip_tags($card[0]), 'the steps never name make, the repository or 1Password');
        self::assertStringNotContainsString($k[1], $pages->studio($as)->body, 'shown once');
    }
}
