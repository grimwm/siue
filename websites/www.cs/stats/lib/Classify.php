<?php
// Referrer source, device class and the bot filter: what is stored instead of the host and the user agent.
declare(strict_types=1);

namespace Stats;

final class Classify
{
    public const REFERRERS = ['facebook', 'discord', 'search', 'site', 'direct', 'other'];
    public const DEVICES = ['phone', 'tablet', 'desktop'];

    private const BOT = '~bot\b|bot/|crawl|spider|slurp|headless|phantom|puppeteer|playwright|selenium|webdriver|lighthouse|pagespeed|gtmetrix'
        . '|preview|facebookexternalhit|facebookcatalog|embedly|vkshare|whatsapp|telegram|skypeuripreview|bitlybot|curl/|wget|python|java/|go-http|okhttp'
        . '|httpclient|axios|node-fetch|undici|libwww|scrapy|monitor|uptime|pingdom|validator|feedfetcher|archive\.org|ia_archiver~i';

    private const SEARCH = '~(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|yahoo\.com|ecosia\.org|baidu\.com|yandex\.[a-z]+|search\.brave\.com|startpage\.com|kagi\.com|qwant\.com)$~';

    /** The bucket for a referring host ($self is this site's host). */
    public static function referrer(string $host, string $self): string
    {
        $host = strtolower(trim($host));
        if ($host === '') {
            return 'direct';
        }
        if ($host === strtolower($self)) {
            return 'site';
        }
        if (preg_match('~(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$~', $host) === 1) {
            return 'facebook';
        }
        if (preg_match('~(^|\.)(discord\.com|discordapp\.com|discord\.gg|discordapp\.net)$~', $host) === 1) {
            return 'discord';
        }
        return preg_match(self::SEARCH, $host) === 1 ? 'search' : 'other';
    }

    /** phone, tablet or desktop, from the user agent, the touch points and the screen's short side in CSS pixels. */
    public static function device(string $ua, int $touch, int $short): string
    {
        if (preg_match('~iPad|Tablet|PlayBook|Silk|Kindle~i', $ua) === 1) {
            return 'tablet';
        }
        if (preg_match('~iPhone|iPod|Windows Phone|Mobi~i', $ua) === 1) {
            return 'phone';
        }
        if (stripos($ua, 'Android') !== false) {
            return $short > 0 && $short < 600 ? 'phone' : 'tablet';
        }
        // iPadOS asks for the desktop site and reports a Mac, but a Mac has no touch screen.
        if (stripos($ua, 'Macintosh') !== false && $touch > 1) {
            return 'tablet';
        }
        return 'desktop';
    }

    /** True for an empty user agent or one that names a bot, a headless browser, a link previewer or an HTTP library. */
    public static function isBot(string $ua): bool
    {
        return trim($ua) === '' || preg_match(self::BOT, $ua) === 1;
    }
}
