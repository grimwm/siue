<?php
// One-time links: only the allowed address, hashed at rest, 15 minutes, once, by POST
// (peek never consumes), and the three hourly limits.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/AdminFakes.php';

final class AdminAuthTest extends TestCase
{
    private function auth(?FakeClock $c = null): array
    {
        $c ??= new FakeClock(1_000_000);
        $db = admin_tmp_db();
        return [new Admin\Auth($db, $c), $db, $c];
    }

    public function testOnlyTheOneAddress(): void
    {
        foreach (['wgrim@siue.edu', ' WGRIM@siue.edu ', 'Wgrim@SIUE.EDU'] as $ok) self::assertTrue(Admin\Auth::allowed($ok), $ok);
        foreach (['wgrim@siue.edu.evil.com', 'x@siue.edu', "wgrim@siue.edu\r\nBcc: a@b.c", 'wgrim@siue.edu,x@y.z', '', 'wgrim'] as $bad) {
            self::assertFalse(Admin\Auth::allowed($bad), $bad);
        }
        [$a] = $this->auth();
        self::assertNull($a->requestLink('someone@siue.edu', '1.2.3.4'));
    }

    public function testTokenIsHashedAtRestAndWorksOnceByConsume(): void
    {
        [$a, $db] = $this->auth();
        $t = $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', (string) $t);
        $stored = $db->query('SELECT token_hash FROM links')->fetchColumn();
        self::assertSame(hash('sha256', $t), $stored);
        self::assertStringNotContainsString($t, (string) json_encode($db->query('SELECT * FROM links')->fetchAll()));
        self::assertSame('wgrim@siue.edu', $a->peek($t));
        self::assertSame('wgrim@siue.edu', $a->peek($t), 'peek never consumes');
        self::assertSame('wgrim@siue.edu', $a->consume($t));
        self::assertNull($a->consume($t), 'once');
        self::assertNull($a->peek($t));
    }

    public function testExpiresAtExactly900Seconds(): void
    {
        [$a, , $c] = $this->auth();
        $t = $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        $c->now += 899;
        self::assertNotNull($a->peek($t));
        $c->now += 1;
        self::assertNull($a->peek($t));
        self::assertNull($a->consume($t));
    }

    public function testAlteredOrUnknownTokensFail(): void
    {
        [$a] = $this->auth();
        $t = (string) $a->requestLink('wgrim@siue.edu', '1.2.3.4');
        self::assertNull($a->consume(strrev($t)));
        self::assertNull($a->consume(''));
        self::assertNull($a->consume(str_repeat('0', 64)));
    }

    public function testThreeLinksAnHourForTheAddress(): void
    {
        [$a, , $c] = $this->auth();
        for ($i = 0; $i < 3; $i++) self::assertNotNull($a->requestLink('wgrim@siue.edu', "10.0.0.$i"));
        self::assertNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'));
        $c->now += 3600;
        self::assertNotNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'));
    }

    public function testIpAndGlobalLimitsCountRefusedAddressesToo(): void
    {
        [$a] = $this->auth();
        for ($i = 0; $i < 20; $i++) $a->requestLink("x$i@example.com", '9.9.9.9');
        self::assertNull($a->requestLink('wgrim@siue.edu', '9.9.9.9'), 'per-IP limit');
        for ($i = 0; $i < 10; $i++) $a->requestLink("y$i@example.com", "8.8.8.$i");
        self::assertNull($a->requestLink('wgrim@siue.edu', '7.7.7.7'), 'global limit of 30');
    }

    public function testForgetAndForgetAll(): void
    {
        [$a] = $this->auth();
        $t = (string) $a->requestLink('wgrim@siue.edu', '1.1.1.1');
        $a->forget($t);
        self::assertNull($a->peek($t));
        $u = (string) $a->requestLink('wgrim@siue.edu', '1.1.1.1');
        $a->forgetAll();
        self::assertNull($a->peek($u));
    }

    public function testExpiredLinksStillCountWithinTheHour(): void
    {
        [$a, , $c] = $this->auth();
        for ($i = 0; $i < 3; $i++) self::assertNotNull($a->requestLink('wgrim@siue.edu', "10.0.0.$i"));
        $c->now += 901;
        self::assertNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'), 'expired links still count');
    }

    public function testConsumedLinksStillCount(): void
    {
        [$a] = $this->auth();
        for ($i = 0; $i < 3; $i++) $a->consume((string) $a->requestLink('wgrim@siue.edu', "10.0.0.$i"));
        self::assertNull($a->requestLink('wgrim@siue.edu', '10.0.0.9'));
    }

    public function testTrustedDeviceSurvivesLockoutButNotThePerIpLimit(): void
    {
        [$a, , $c] = $this->auth();
        $dev = $a->issueDevice();
        self::assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $dev);
        for ($i = 0; $i < 30; $i++) $a->requestLink("z$i@example.com", "6.6.6.$i");
        self::assertNull($a->requestLink('wgrim@siue.edu', '5.5.5.5'), 'global limit locks strangers out');
        self::assertTrue($a->isTrustedDevice($dev));
        self::assertNotNull($a->requestLink('wgrim@siue.edu', '5.5.5.5', true));
        self::assertNull($a->requestLink('someone@example.com', '5.5.5.5', true), 'only ALLOWED gets a link');
        for ($i = 0; $i < 20; $i++) $a->requestLink("q$i@example.com", '4.4.4.4');
        self::assertNull($a->requestLink('wgrim@siue.edu', '4.4.4.4', true), 'per-IP limit still applies');
    }

    public function testDeviceExpiryForgetAndMalformedTokens(): void
    {
        [$a, $db, $c] = $this->auth();
        $dev = $a->issueDevice();
        self::assertStringNotContainsString($dev, (string) json_encode($db->query('SELECT * FROM devices')->fetchAll()));
        $c->now += Admin\Auth::DEVICE_TTL - 1;
        self::assertTrue($a->isTrustedDevice($dev));
        $c->now += 1;
        self::assertFalse($a->isTrustedDevice($dev), 'expired');
        $dev2 = $a->issueDevice();
        $a->forgetDevices();
        self::assertFalse($a->isTrustedDevice($dev2));
        foreach ([null, '', 'zz', str_repeat('g', 64), strtoupper($dev2)] as $bad) self::assertFalse($a->isTrustedDevice($bad));
    }

    public function testStoredIpIsCapped(): void
    {
        [$a, $db] = $this->auth();
        $a->requestLink('x@example.com', str_repeat('1', 100));
        self::assertSame(45, strlen((string) $db->query('SELECT ip FROM link_requests')->fetchColumn()));
    }

    public function testRequestsPastTheIpLimitAddNoRows(): void
    {
        [$a, $db] = $this->auth();
        for ($i = 0; $i < 200; $i++) {
            $a->requestLink('x@example.com', '9.9.9.9');
        }
        self::assertSame(20, (int) $db->query('SELECT COUNT(*) FROM link_requests')->fetchColumn());
        self::assertNull($a->requestLink('wgrim@siue.edu', '9.9.9.9'), 'the address stays limited');
    }
}
