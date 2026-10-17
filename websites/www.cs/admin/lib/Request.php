<?php
// One HTTP request as the admin endpoints see it, built from the PHP globals or by tests.
declare(strict_types=1);

namespace Admin;

final class Request
{
    /**
     * @param array<string,string> $headers lower-case names
     * @param array<string,mixed> $cookies
     * @param array<string,mixed> $post
     * @param array<string,mixed> $query
     */
    public function __construct(
        public string $method,
        public string $ip,
        public bool $https,
        public string $host,
        public array $headers,
        public array $cookies,
        public array $post,
        public array $query,
        public string $agent,
    ) {
    }

    /**
     * The client address is REMOTE_ADDR alone: a forwarding header is client
     * input and would let anyone dodge the per-IP limit.
     */
    public static function fromGlobals(): self
    {
        $server = $_SERVER;
        $headers = [];
        foreach ($server as $key => $value) {
            if (is_string($key) && is_string($value) && str_starts_with($key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = $value;
            }
        }
        // Apache and FPM may hand the header over under the REDIRECT_ name.
        $auth = $server['HTTP_AUTHORIZATION'] ?? $server['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if (is_string($auth) && $auth !== '') {
            $headers['authorization'] = $auth;
        }
        $ip = $server['REMOTE_ADDR'] ?? '';
        $https = ($server['HTTPS'] ?? '') === 'on' || ($server['REQUEST_SCHEME'] ?? '') === 'https';
        return new self(
            strtoupper(is_string($server['REQUEST_METHOD'] ?? null) ? $server['REQUEST_METHOD'] : 'GET'),
            substr(is_string($ip) ? $ip : '', 0, 45),
            $https,
            is_string($server['HTTP_HOST'] ?? null) ? $server['HTTP_HOST'] : '',
            $headers,
            $_COOKIE,
            $_POST,
            $_GET,
            is_string($server['HTTP_USER_AGENT'] ?? null) ? $server['HTTP_USER_AGENT'] : '',
        );
    }
}
