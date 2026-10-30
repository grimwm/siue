<?php
// A sign-in realm: who may sign in, where its pages live, its cookies, its tables and its rate limits.
// The admin realm admits named admins; the studio realm, beside it under music/, any plain @siue.edu address.
declare(strict_types=1);

namespace Admin;

final readonly class Realm
{
    /**
     * @param 'admin'|'studio' $name
     * @param string $baseUrl the folder URL its pages and mailed links live in
     * @param string $cookiePath the Path every cookie of the realm carries
     * @param string $cookie the session cookie's name; the device, pending and confirm cookies add -device, -pending, -confirm
     * @param ''|'studio_' $tables the fixed prefix of its links, link_requests, devices and sessions tables
     * @param \Closure(string): bool $allows takes a normalized address
     * @param array{global:int,ip:int,address:int,rows:int} $limits per hour: links overall, requests per IP, links per address, request rows kept
     * @param string $stylesheet the admin stylesheet, relative to the realm's pages
     */
    private function __construct(
        public string $name,
        public string $baseUrl,
        public string $cookiePath,
        public string $cookie,
        public string $tables,
        public \Closure $allows,
        public array $limits,
        public string $stylesheet,
    ) {
    }

    /** The admin hub's realm: named admins only. */
    public static function admin(People $people, string $baseUrl): self
    {
        return new self(
            'admin',
            $baseUrl,
            admin_cookie_path($baseUrl),
            '__Secure-admin',
            '',
            static fn(string $normalized): bool => $people->isAdmin($normalized),
            ['global' => 30, 'ip' => 20, 'address' => 3, 'rows' => 1000],
            'admin.css',
        );
    }

    /** The studios' realm, in the music/ folder beside the admin folder: any address Address::studio accepts. */
    public static function studio(string $adminBaseUrl): self
    {
        if (!str_ends_with($adminBaseUrl, '/admin/')) {
            throw new \InvalidArgumentException('the admin base URL must end in /admin/');
        }
        $base = substr($adminBaseUrl, 0, -strlen('admin/')) . 'music/';
        $user = admin_cookie_path($base);
        return new self(
            'studio',
            $base,
            preg_match('#^/~[^/]+/$#D', $user) === 1 ? $user . 'music/' : '/music/',
            '__Secure-studio',
            'studio_',
            static fn(string $normalized): bool => Address::studio($normalized) !== null,
            ['global' => 300, 'ip' => 100, 'address' => 3, 'rows' => 3000],
            '../admin/admin.css',
        );
    }
}
