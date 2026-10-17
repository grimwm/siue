<?php
// The admin pages' responses.
declare(strict_types=1);

namespace Admin;

final class Response
{
    /** @param array<string, string> $headers */
    public function __construct(public int $status, public array $headers, public string $body)
    {
    }
}

final class Pages
{
    /** What a visitor sees when storage is refused: no paths, no detail. */
    public static function storageDown(): Response
    {
        return new Response(503, ['Content-Type' => 'text/plain; charset=utf-8'], 'Admin pages are unavailable right now.');
    }
}
