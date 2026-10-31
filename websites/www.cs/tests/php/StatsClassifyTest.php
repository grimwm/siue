<?php
// Referrer buckets, device classes and the bot filter.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use Stats\Classify;

require_once __DIR__ . '/StatsFakes.php';

final class StatsClassifyTest extends TestCase
{
    public function testReferrerBuckets(): void
    {
        $self = 'www.cs.siue.edu';
        $cases = [
            '' => 'direct', 'www.cs.siue.edu' => 'site', 'l.facebook.com' => 'facebook', 'm.facebook.com' => 'facebook',
            'facebook.com' => 'facebook', 'lm.facebook.com' => 'facebook', 'discord.com' => 'discord', 'discordapp.com' => 'discord',
            'www.google.com' => 'search', 'www.google.co.uk' => 'search', 'www.bing.com' => 'search', 'duckduckgo.com' => 'search',
            'search.brave.com' => 'search', 'notfacebook.com' => 'other', 'facebook.com.evil.example' => 'other',
            'blackboard.siue.edu' => 'other', 'WWW.GOOGLE.COM' => 'search',
        ];
        foreach ($cases as $host => $bucket) {
            self::assertSame($bucket, Classify::referrer($host, $self), $host);
        }
    }

    public function testDeviceClasses(): void
    {
        self::assertSame('phone', Classify::device(STATS_PHONE_UA, 5, 390));
        self::assertSame('phone', Classify::device('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36', 5, 412));
        self::assertSame('tablet', Classify::device('Mozilla/5.0 (Linux; Android 15; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36', 10, 800));
        self::assertSame('tablet', Classify::device('Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15', 5, 820));
        self::assertSame('tablet', Classify::device(STATS_UA, 5, 820), 'iPadOS asks for the desktop site');
        self::assertSame('desktop', Classify::device(STATS_UA, 0, 1080));
        self::assertSame('desktop', Classify::device('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36', 10, 1080), 'a touch laptop');
    }

    public function testBots(): void
    {
        self::assertTrue(Classify::isBot('Mozilla/5.0 (compatible; bingbot/2.0)'));
        self::assertTrue(Classify::isBot('facebookexternalhit/1.1'));
        self::assertTrue(Classify::isBot('Mozilla/5.0 (compatible; Discordbot/2.0)'));
        self::assertTrue(Classify::isBot('python-requests/2.32'));
        self::assertTrue(Classify::isBot('Mozilla/5.0 Chrome-Lighthouse'));
        self::assertTrue(Classify::isBot(''));
        self::assertFalse(Classify::isBot(STATS_UA));
        self::assertFalse(Classify::isBot(STATS_PHONE_UA));
    }
}
