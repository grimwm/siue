<?php
// The named people and the studio caps: the owner is always in, a bad file gives the defaults.
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../admin/lib/bootstrap.php';

final class AdminPeopleTest extends TestCase
{
    private function file(string $json): string
    {
        $p = tempnam(sys_get_temp_dir(), 'studio-config');
        file_put_contents($p, $json);
        return $p;
    }

    public function testTheOwnerIsAlwaysAnAdminWithTheAllowance(): void
    {
        $missing = Admin\People::load(sys_get_temp_dir() . '/studio-config-absent-' . bin2hex(random_bytes(4)));
        $empty = Admin\People::fromJson('{"people":[]}');
        $other = Admin\People::fromJson('{"people":[{"email":"b@siue.edu","admin":true,"allowance":true}]}');
        foreach ([$missing, $empty, $other] as $p) {
            self::assertNotNull($p);
            self::assertTrue($p->isAdmin('wgrim@siue.edu'));
            self::assertTrue($p->hasAllowance('wgrim@siue.edu'));
            self::assertTrue($p->isNamed('wgrim@siue.edu'));
        }
        $off = Admin\People::fromJson('{"people":[{"email":"wgrim@siue.edu","admin":false,"allowance":false}]}');
        self::assertTrue($off->isAdmin('wgrim@siue.edu') && $off->hasAllowance('wgrim@siue.edu'));
    }

    public function testFlagsComeFromTheFile(): void
    {
        $p = Admin\People::load($this->file('{"people":[{"email":"a@siue.edu","admin":true,"allowance":false},{"email":"b@siue.edu","allowance":true},{"email":"c@siue.edu"}],"max_accounts":10,"max_shared_mb":2}'));
        self::assertTrue($p->isAdmin('a@siue.edu'));
        self::assertFalse($p->hasAllowance('a@siue.edu'));
        self::assertFalse($p->isAdmin('b@siue.edu'));
        self::assertTrue($p->hasAllowance('b@siue.edu'));
        self::assertTrue($p->isNamed('c@siue.edu'));
        self::assertFalse($p->isAdmin('c@siue.edu') || $p->hasAllowance('c@siue.edu'));
        self::assertFalse($p->isNamed('d@siue.edu') || $p->isAdmin('d@siue.edu') || $p->hasAllowance('d@siue.edu'));
        self::assertSame(10, $p->maxAccounts());
        self::assertSame(2_097_152, $p->maxSharedBytes(), 'max_shared_mb is in MiB');
    }

    public function testDefaultsAre500AccountsTwentyGigabytesAndAFiftyGigabyteFloor(): void
    {
        $p = Admin\People::fromJson('{"people":[]}');
        self::assertSame(500, $p->maxAccounts());
        self::assertSame(21_474_836_480, $p->maxSharedBytes());
        self::assertSame(53_687_091_200, $p->minFreeDiskBytes());
        self::assertSame(209_715_200, $p->maxTakeDecodedBytes());
        $d = Admin\People::load('/nonexistent/studio.json');
        self::assertSame(500, $d->maxAccounts());
        self::assertSame(21_474_836_480, $d->maxSharedBytes());
    }

    public function testAMalformedFileGivesTheDefaults(): void
    {
        $bad = [
            'not json',
            '{"people":[{"email":"a@example.com","admin":true}]}',
            '{"people":[{"email":"a+b@siue.edu","admin":true}]}',
            '{"people":[],"max_accounts":-1}',
            '{"people":[],"max_shared_mb":0}',
            '{"people":[],"max_shared_mb":-5}',
            '{"people":[],"max_shared_mb":1.5}',
            '{"people":[],"max_shared_mb":"10"}',
            '{"people":[],"max_shared_bytes":1073741824}',
            '{"people":[],"max_acounts":5}',
            '{"people":[],"max_accounts":"5"}',
            '{"people":[{"email":"a@siue.edu","admin":"yes"}]}',
            '{"people":"a@siue.edu"}',
        ];
        foreach ($bad as $json) {
            self::assertNull(Admin\People::fromJson($json), $json);
            $before = ini_set('error_log', '/dev/null');
            $p = Admin\People::load($this->file($json));
            ini_set('error_log', (string) $before);
            self::assertSame(500, $p->maxAccounts(), $json);
            self::assertFalse($p->isNamed('a@siue.edu'), $json);
            self::assertTrue($p->isAdmin('wgrim@siue.edu'), $json);
        }
    }

    public function testAddressesAreMatchedNormalized(): void
    {
        $p = Admin\People::fromJson('{"people":[{"email":" A.B@SIUE.edu ","admin":true}]}');
        self::assertNotNull($p);
        self::assertTrue($p->isAdmin(Admin\Address::normalize('A.b@Siue.EDU')));
        self::assertTrue($p->isNamed('a.b@siue.edu'));
    }

    public function testStudioAddressesAreExactlySiueWithoutPlus(): void
    {
        self::assertSame('a@siue.edu', Admin\Address::studio(' A@Siue.edu '));
        foreach (['a@mail.siue.edu', 'a@siue.edu.evil.test', 'a+b@siue.edu', "a@siue.edu\n", "a@siue.edu\r\nBcc: x@y.z", 'a@@siue.edu', 'siue.edu', '@siue.edu', str_repeat('a', 65) . '@siue.edu'] as $bad) {
            self::assertNull(Admin\Address::studio($bad), $bad);
        }
        self::assertNull(Admin\Address::normalize("a@b.c\r"));
        self::assertSame('a@b.c', Admin\Address::normalize(' A@B.c '));
    }

    public function testTheDiskFloorAndTheDecodedTakeLimitAreSetInMiB(): void
    {
        $p = Admin\People::fromJson('{"people":[],"min_free_disk_mb":10,"max_take_decoded_mb":3}');
        self::assertSame(10_485_760, $p->minFreeDiskBytes());
        self::assertSame(3_145_728, $p->maxTakeDecodedBytes());
        self::assertNull(Admin\People::fromJson('{"people":[],"min_free_disk_mb":0}'));
        self::assertNull(Admin\People::fromJson('{"people":[],"max_take_decoded_mb":"200"}'));
    }
}
