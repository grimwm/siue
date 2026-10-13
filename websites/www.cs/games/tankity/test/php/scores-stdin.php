<?php
// Test helper, prepended by ScoresEndpointTest: php://input is empty on the
// CLI, so scores.php would never see a POST body; this serves stdin instead.
final class TankityStdinInput
{
    public $context;

    public function stream_open(string $path, string $mode, int $options, ?string &$opened): bool
    {
        return true;
    }

    public function stream_read(int $n): string|false
    {
        return fread(STDIN, $n);
    }

    public function stream_eof(): bool
    {
        return feof(STDIN);
    }

    public function stream_stat(): array|false
    {
        return [];
    }
}
stream_wrapper_unregister('php');
stream_wrapper_register('php', TankityStdinInput::class);
