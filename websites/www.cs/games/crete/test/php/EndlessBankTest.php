<?php
// The shared Endless level bank (bank/Bank.php and endless-bank.php) against a
// temp folder: text and schema checks, quarantine, regeneration verdicts,
// strikes, versions, dedupe, caps and roll-out, reports, network keys,
// concurrent writers, the size of a full store, and the HTTP layer.
declare(strict_types=1);

require_once dirname(__DIR__, 3) . '/_kit/php/tests/TempDir.php';
require_once dirname(__DIR__, 2) . '/bank/Bank.php';

use Crete\Bank;
use Crete\Refusal;
use Kit\Tests\TempDir;
use PHPUnit\Framework\TestCase;

final class EndlessBankTest extends TestCase
{
    use TempDir;

    private const A = '10.0.0.1';
    private const A2 = '10.0.0.1';
    private const B = '192.0.2.7';
    private const C = '2001:db8:1:2::1';
    private const C_SAME_64 = '2001:db8:1:2::ffff';

    private string $dir;
    private int $now = 1_800_000_000;

    protected function setUp(): void
    {
        $this->dir = self::makeTempDir('crete-bank-test');
        mt_srand(20261104);
    }

    protected function tearDown(): void
    {
        self::removeTree($this->dir);
    }

    // ---- Helpers ------------------------------------------------------------

    /** @return array<string, mixed> the shipped config with $over on top, checked */
    private static function config(array $over = []): array
    {
        $data = json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/bank/config.json'), true);
        return Bank::validateConfig(array_replace($data, $over));
    }

    private function bank(array $over = []): Bank
    {
        return new Bank(self::config($over), $this->dir, fn(): int => $this->now, static fn(int $a, int $b): int => mt_rand($a, $b));
    }

    /** A random corridor-ish maze: walls round the edge, random walls inside, P top left, E bottom right. */
    private static function level(int $seed, int $size = 15, string $title = 'Somewhere', array $head = []): string
    {
        $state = $seed;
        $rows = [];
        for ($r = 0; $r < $size; $r++) {
            $row = '';
            for ($c = 0; $c < $size; $c++) {
                $state = ($state * 1103515245 + 12345) & 0x7fffffff;
                $edge = $r === 0 || $c === 0 || $r === $size - 1 || $c === $size - 1;
                $row .= $edge || ($state >> 8) % 3 === 0 ? '#' : '.';
            }
            $rows[] = $row;
        }
        $rows[1][1] = 'P';
        $rows[$size - 2][$size - 2] = 'E';
        return self::text($rows, $title, $head);
    }

    /** @param list<string> $rows @param list<string> $head */
    private static function text(array $rows, string $title = 'Somewhere', array $head = []): string
    {
        return implode("\n", ["title: $title", 'intro: A long way down', ...$head, '', ...$rows]) . "\n";
    }

    /** @return list<string> */
    private static function rows(string $text): array
    {
        $lines = explode("\n", rtrim($text, "\n"));
        return array_slice($lines, array_search('', $lines, true) + 1);
    }

    private static function install(string $name): string
    {
        return md5($name);
    }

    private static function made(string $text, array $over = []): array
    {
        return array_replace(['text' => $text, 'line' => 'rrddlu', 'shortest' => 6, 'score' => 120, 'explored' => 4000, 'chapter' => 1, 'hides' => false], $over);
    }

    private static function tuple(array $over = []): array
    {
        return array_replace([
            'v' => 2, 'seed' => 'olive-42', 'tier' => 1, 'grade' => 'easy', 'depth' => 3, 'k' => 0,
            'run' => [['text' => self::level(999, 9, 'An earlier title'), 'explored' => 10, 'score' => 50]],
        ], $over);
    }

    private function submit(Bank $bank, string $text, string $who = 'uploader', string $addr = self::A, array $tuple = [], array $made = []): array
    {
        return $bank->submit(['op' => 'submit', 'install' => self::install($who), 'tuple' => self::tuple($tuple), 'made' => self::made($text, $made)], $addr);
    }

    private function claim(Bank $bank, string $who, string $addr, int $v = 2): array
    {
        return $bank->claim(['op' => 'claim', 'install' => self::install($who), 'v' => $v], $addr);
    }

    private function verify(Bank $bank, string $who, string $addr, string $ticket, ?array $found): array
    {
        return $bank->verify(['op' => 'verify', 'install' => self::install($who), 'ticket' => $ticket, 'found' => $found], $addr);
    }

    /** Claims as $who and answers with $found (the uploader's own level when $found is not given). */
    private function claimAndVerify(Bank $bank, string $who, string $addr, ?array $found): array
    {
        $claim = $this->claim($bank, $who, $addr);
        self::assertArrayHasKey('ticket', $claim, "$who got a level to verify");
        return $this->verify($bank, $who, $addr, $claim['ticket'], $found);
    }

    /** @return array{0: int, 1: array<string, mixed>} the refusal's status and body */
    private static function refusal(callable $fn): array
    {
        try {
            $fn();
        } catch (Refusal $r) {
            return [$r->status, $r->payload];
        }
        self::fail('expected a refusal');
    }

    /** @return list<array<string, mixed>> */
    private function stored(string $file): array
    {
        $path = "{$this->dir}/$file";
        return is_file($path) ? json_decode((string) file_get_contents($path), true) : [];
    }

    /** Puts a level through quarantine: an upload from A, two matching verdicts, one from B. */
    private function admit(Bank $bank, string $text, string $tag = ''): void
    {
        $this->submit($bank, $text, "up$tag", self::A);
        $this->claimAndVerify($bank, "v1$tag", self::A, self::made($text));
        $this->claimAndVerify($bank, "v2$tag", self::B, self::made($text));
    }

    // ---- Text and schema ------------------------------------------------------

    public function testTheTilesAreTheGamesLegalCharactersOnce(): void
    {
        $chars = str_split(Bank::TILES);
        self::assertSame($chars, array_values(array_unique($chars)));
        self::assertNotContains('p', $chars, 'a story page is never a shared tile');
        foreach (['#', '.', 'E', 'P', 'M', 'o', 'w', 'e', '*', 'C', 'O'] as $c) {
            self::assertContains($c, $chars);
        }
        // The node test compares the literal with tiles.ts; it must stay one single-quoted line.
        self::assertMatchesRegularExpression("/^    public const TILES = '[^'\\n]+';\$/m", (string) file_get_contents(dirname(__DIR__, 2) . '/bank/Bank.php'));
    }

    public function testTitleAndIntroAreBlanked(): void
    {
        $text = self::level(1, 15, 'A rude word', ['hearts: 5']);
        $out = Bank::checkText($text, 'made.text');
        self::assertStringStartsWith("title: \nintro: \nhearts: 5\n\n", $out);
        self::assertSame(self::rows($text), self::rows($out));
    }

    /** @return array<string, array{string}> */
    public static function badTexts(): array
    {
        $ok = self::rows(self::level(3, 9));
        $with = static function (int $r, int $c, string $ch) use ($ok): array {
            $rows = $ok;
            $rows[$r][$c] = $ch;
            return $rows;
        };
        $wide = array_map(static fn(string $row): string => str_repeat($row, 5), $ok); // 45 wide
        return [
            'a story page' => [self::text($with(2, 2, 'p'))],
            'an unknown tile' => [self::text($with(2, 2, 'Q'))],
            'a second player' => [self::text($with(2, 2, 'P'))],
            'no player' => [self::text($with(1, 1, '.'))],
            'two Minotaurs' => [self::text(array_replace($with(2, 2, 'M'), [3 => substr_replace($ok[3], 'M', 3, 1)]))],
            'rows of different widths' => [self::text([...array_slice($ok, 0, 8), $ok[8] . '#'])],
            'four rows' => [self::text(array_slice($ok, 0, 4))],
            '42 rows' => [self::text(array_merge($ok, $ok, $ok, $ok, array_slice($ok, 0, 6)))],
            'four columns' => [self::text(array_replace(array_fill(0, 9, '####'), [1 => '#P.#']))],
            '45 columns' => [self::text($wide)],
            'a pages header' => [self::text($ok, 'x', ['pages: one'])],
            'an unknown header' => [self::text($ok, 'x', ['colour: red'])],
            'headers out of order' => [self::text($ok, 'x', ['relics: 0', 'hearts: 2'])],
            'a header twice' => [self::text($ok, 'x', ['hearts: 2', 'hearts: 2'])],
            'no hearts' => [self::text($ok, 'x', ['hearts: 0'])],
            'too many hearts' => [self::text($ok, 'x', ['hearts: 100'])],
            'more relics than the grid holds' => [self::text($ok, 'x', ['relics: 1'])],
            'a hazard with no facing' => [self::text($with(2, 2, 'o'))],
            'a facing that is not a direction' => [self::text($with(2, 2, 'o'), 'x', ['facing: north'])],
            'a facing too many' => [self::text($with(2, 2, 'o'), 'x', ['facing: up up'])],
            'a machine with a bad template' => [self::text($with(2, 2, 'C'), 'x', ['machines: cow-up'])],
            'a machine with no header' => [self::text($with(2, 2, 'C'))],
            'no title line' => [substr(self::text($ok), strlen("title: x\n"))],
            'no trailing newline' => [rtrim(self::text($ok), "\n")],
            'a carriage return' => [str_replace("\n", "\r\n", self::text($ok))],
            'text after the grid' => [self::text($ok) . "\n#####\n"],
            'no blank line' => [str_replace("\n\n", "\n", self::text($ok))],
            'over 4000 bytes' => [self::text($ok, str_repeat('x', 4000))],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('badTexts')]
    public function testABadTextIsRefused(string $text): void
    {
        [$status, $body] = self::refusal(static fn() => Bank::checkText($text, 'made.text'));
        self::assertSame(400, $status);
        self::assertSame(['error' => 'invalid', 'field' => 'made.text'], $body);
    }

    public function testEveryLegalHeaderAndPieceIsAccepted(): void
    {
        $rows = self::rows(self::level(5, 11));
        $rows[2] = '#o.w.e.C*M#';
        $rows[3] = '#rbygfhkuz#';
        $rows[4] = '#xcO~F=^v<#';
        $rows[5] = '#>%S_tTRBY#';
        $rows[6] = '#G&-+;:WI@#';
        $rows[7] = '#$!|E.....#';
        $text = self::text($rows, 'x', ['hearts: 4', 'relics: 1', 'facing: up down left', 'machines: glider-right']);
        self::assertSame(self::rows($text), self::rows(Bank::checkText($text, 't')));
    }

    /** @return array<string, array{callable(array): array, string}> */
    public static function badBodies(): array
    {
        return [
            'an unknown field' => [static fn(array $b): array => $b + ['extra' => 1], 'extra'],
            'a missing field' => [static function (array $b): array { unset($b['made']); return $b; }, 'made'],
            'a bad install' => [static fn(array $b): array => ['install' => 'ABC'] + $b, 'install'],
            'an unknown tuple field' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['who' => 'me']]), 'tuple.who'],
            'a seed with capitals' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['seed' => 'Olive']]), 'tuple.seed'],
            'a part past the last' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['k' => 12]]), 'tuple.k'],
            'a depth of one' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['depth' => 1]]), 'tuple.depth'],
            'a tier of eleven' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['tier' => 11]]), 'tuple.tier'],
            'an unknown grade' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['grade' => 'nightmare']]), 'tuple.grade'],
            'a version as a string' => [static fn(array $b): array => array_replace_recursive($b, ['tuple' => ['v' => '1']]), 'tuple.v'],
            'an empty run' => [static function (array $b): array { $b['tuple']['run'] = []; return $b; }, 'tuple.run'],
            'a run of fourteen' => [static function (array $b): array { $b['tuple']['run'] = array_fill(0, 14, $b['tuple']['run'][0]); return $b; }, 'tuple.run'],
            'a bad run text' => [static function (array $b): array { $b['tuple']['run'][0]['text'] = "title: \nintro: \n\nP\n"; return $b; }, 'tuple.run.0.text'],
            'a run score too high' => [static function (array $b): array { $b['tuple']['run'][0]['score'] = 10001; return $b; }, 'tuple.run.0.score'],
            'an extra played field' => [static function (array $b): array { $b['tuple']['run'][0]['name'] = 'x'; return $b; }, 'tuple.run.0.name'],
            'a line with a digit' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['line' => 'rr2']]), 'made.line'],
            'an empty line' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['line' => '']]), 'made.line'],
            'no shortest' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['shortest' => 0]]), 'made.shortest'],
            'explored too high' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['explored' => 10000001]]), 'made.explored'],
            'chapter eleven' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['chapter' => 11]]), 'made.chapter'],
            'hides as a number' => [static fn(array $b): array => array_replace_recursive($b, ['made' => ['hides' => 0]]), 'made.hides'],
            'a list for made' => [static fn(array $b): array => ['made' => [1, 2]] + $b, 'made'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('badBodies')]
    public function testABadSubmissionNamesItsField(callable $edit, string $field): void
    {
        $body = $edit(['op' => 'submit', 'install' => self::install('u'), 'tuple' => self::tuple(), 'made' => self::made(self::level(7))]);
        [$status, $payload] = self::refusal(fn() => $this->bank()->submit($body, self::A));
        self::assertSame([400, ['error' => 'invalid', 'field' => $field]], [$status, $payload]);
        self::assertSame([], $this->stored('pending-easy.json'));
    }

    public function testRunTextsAreBlankedAndOnlyTheTupleGoesToAVerifier(): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(8, 15, 'Look at me'));
        $claim = $this->claim($bank, 'verifier', self::B);
        self::assertSame(['ticket', 'tuple'], array_keys($claim));
        self::assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $claim['ticket']);
        self::assertStringStartsWith("title: \nintro: \n\n", $claim['tuple']['run'][0]['text']);
        self::assertStringNotContainsString('Look at me', json_encode($claim));
        self::assertStringNotContainsString('rrddlu', json_encode($claim), 'never the line either');
        $stored = (string) file_get_contents("{$this->dir}/pending-easy.json");
        self::assertStringNotContainsString('Look at me', $stored);
        self::assertStringNotContainsString('An earlier title', $stored);
        self::assertStringNotContainsString(self::install('uploader'), $stored, 'only a hash of the install is kept');
        self::assertStringNotContainsString(self::A, $stored, 'no address is kept');
    }

    // ---- Quarantine and verdicts ----------------------------------------------

    public function testAPendingLevelIsNeverServed(): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(10));
        self::assertSame([], $bank->levels('easy', 10, 16));
        $this->claimAndVerify($bank, 'v1', self::B, self::made(self::level(10)));
        self::assertSame([], $bank->levels('easy', 10, 16), 'one verdict is not enough');
    }

    public function testTwoMatchesFromDistinctInstallsOneOnAnotherNetworkAdmit(): void
    {
        $bank = $this->bank();
        $text = self::level(11, 15, 'Mine');
        $this->submit($bank, $text, 'up', self::A);
        self::assertSame(['ok' => true, 'verdict' => 'match'], $this->claimAndVerify($bank, 'v1', self::A, self::made($text)));
        self::assertSame(['ok' => true, 'verdict' => 'match'], $this->claimAndVerify($bank, 'v2', self::A2, self::made($text)));
        self::assertSame([], $bank->levels('easy', 1, 16), 'uploader and both verifiers on one network: not yet');
        self::assertCount(1, $this->stored('pending-easy.json'));
        $this->claimAndVerify($bank, 'v3', self::B, self::made($text));
        self::assertSame([], $this->stored('pending-easy.json'));
        $got = $bank->levels('easy', 1, 16);
        self::assertCount(1, $got);
        self::assertSame(['text', 'line', 'shortest', 'score', 'explored', 'chapter', 'hides', 'h'], array_keys($got[0]));
        self::assertSame(Bank::blank($text), $got[0]['text']);
        self::assertSame(Bank::layoutHash($text), $got[0]['h']);
        self::assertMatchesRegularExpression('/^[a-f0-9]{16}$/', $got[0]['h']);
    }

    public function testOneVerifierTwiceIsOneVerdict(): void
    {
        $bank = $this->bank();
        $text = self::level(12);
        $this->submit($bank, $text);
        $this->claimAndVerify($bank, 'v1', self::B, self::made($text));
        self::assertSame(['none' => true], $this->claim($bank, 'v1', self::B), 'a verified level is not handed back');
        self::assertCount(1, $this->stored('pending-easy.json'));
    }

    public function testTheUploadersOwnInstallNeverVerifies(): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(13), 'up', self::A);
        self::assertSame(['none' => true], $this->claim($bank, 'up', self::B));
        self::assertSame(['none' => true], $this->claim($bank, 'up', self::A));
    }

    public function testAStrangersOrSpentOrStaleTicketCountsForNothing(): void
    {
        $bank = $this->bank();
        $text = self::level(14);
        $this->submit($bank, $text);
        $ticket = $this->claim($bank, 'v1', self::B)['ticket'];
        $ticketError = [400, ['error' => 'ticket']];
        self::assertSame($ticketError, self::refusal(fn() => $this->verify($bank, 'stranger', self::B, $ticket, self::made($text))));
        self::assertSame($ticketError, self::refusal(fn() => $this->verify($bank, 'v1', self::C, $ticket, self::made($text))), 'bound to the network it was claimed from');
        self::assertSame($ticketError, self::refusal(fn() => $this->verify($bank, 'v1', self::B, str_repeat('a', 32), self::made($text))));
        $this->verify($bank, 'v1', self::B, $ticket, self::made($text));
        self::assertSame($ticketError, self::refusal(fn() => $this->verify($bank, 'v1', self::B, $ticket, self::made($text))), 'single use');
        $late = $this->claim($bank, 'v2', self::C)['ticket'];
        $this->now += 61 * 60;
        self::assertSame($ticketError, self::refusal(fn() => $this->verify($bank, 'v2', self::C, $late, self::made($text))), 'an hour at most');
        self::assertSame(['none' => true], $this->claim($bank, 'v2', self::C), 'one ticket per install per level');
        self::assertCount(1, $this->stored('pending-easy.json'));
        self::assertSame([], $bank->levels('easy', 1, 16));
    }

    public function testAHandEditedLevelWithAValidLookingTupleIsNeverServed(): void
    {
        $bank = $this->bank();
        // Walls that spell a word, posted with a tuple copied from a real upload.
        $rows = self::rows(self::level(15, 15));
        $rows[3] = '#.#.#.###.#...#';
        $rows[4] = '#.#.#.#...#...#';
        $rows[5] = '#.###.##..#...#';
        $drawn = self::text($rows, 'hello');
        $this->submit($bank, $drawn, 'prankster', self::A);
        self::assertSame([], $bank->levels('easy', 10, 16), 'while it waits');
        $generated = self::made(self::level(15, 15));
        self::assertSame(['ok' => true, 'verdict' => 'mismatch'], $this->claimAndVerify($bank, 'honest', self::B, $generated));
        self::assertTrue($this->stored('pending-easy.json')[0]['dispute'], 'disputed');
        self::assertSame([], $bank->levels('easy', 10, 16));
        self::assertSame([], $this->stored('strikes.json'), 'one peer\'s word strikes nobody');
        // Later verifiers who would echo it find nothing to claim.
        self::assertSame(['none' => true], $this->claim($bank, 'accomplice', self::C));
        self::assertSame(['none' => true], $this->claim($bank, 'accomplice2', self::A));
        self::assertSame([], $bank->levels('easy', 10, 16), 'never served while disputed');
        // The trusted verifier settles it: the drawing is rejected and its uploader struck.
        $this->verifierFile();
        $item = $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 1])['items'][0];
        self::assertSame('mismatch', $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $item['h'], 'verdict' => 'mismatch', 'found' => $generated])['verdict']);
        self::assertSame([], $this->stored('pending-easy.json'), 'rejected');
        $strikes = $this->stored('strikes.json');
        self::assertCount(1, $strikes);
        self::assertSame(Bank::installHash(self::install('prankster')), $strikes[0]['i']);
        self::assertSame($bank->netCode(self::A, $bank->networkKey()), $strikes[0]['n']);
    }

    public function testAPeerMatchNeverAdmitsADisputedLevel(): void
    {
        $bank = $this->bank();
        $text = self::level(19);
        $this->submit($bank, $text, 'up', self::A);
        $first = $this->claim($bank, 'v1', self::B);
        $second = $this->claim($bank, 'v2', self::C);
        $verify = fn(string $who, string $addr, array $c, ?array $found): array => $this->verify($bank, $who, $addr, $c['ticket'], $found);
        self::assertSame('mismatch', $verify('v1', self::B, $first, null)['verdict']);
        self::assertSame('match', $verify('v2', self::C, $second, self::made($text))['verdict']);
        self::assertSame([], $bank->levels('easy', 10, 16));
        self::assertCount(1, $this->stored('pending-easy.json'));
    }

    /** @return array<string, array{array<string, mixed>|null}> */
    public static function differences(): array
    {
        $made = self::made(self::level(16));
        return [
            'no level at all' => [null],
            'another text' => [self::made(self::level(17))],
            'a shorter line' => [['line' => 'rrdd', 'shortest' => 4] + $made],
            'another fewest' => [['shortest' => 7] + $made],
            'another score' => [['score' => 121] + $made],
            'another search size' => [['explored' => 4001] + $made],
            'another chapter' => [['chapter' => 2] + $made],
            'hidden walls' => [['hides' => true] + $made],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('differences')]
    public function testAnyDifferenceIsAMismatch(?array $found): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(16));
        self::assertSame('mismatch', $this->claimAndVerify($bank, 'v', self::B, $found)['verdict']);
        self::assertTrue($this->stored('pending-easy.json')[0]['dispute']);
        self::assertSame([], $bank->levels('easy', 10, 16));
    }

    public function testOnlyTheTitleAndIntroMayDiffer(): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(18, 15, 'One title'));
        self::assertSame('match', $this->claimAndVerify($bank, 'v', self::B, self::made(self::level(18, 15, 'Another')))['verdict']);
    }

    public function testThreeStrikesThrottleTheInstallAndTheNetworkForADay(): void
    {
        $bank = $this->bank();
        $this->verifierFile();
        for ($i = 0; $i < 3; $i++) {
            $this->submit($bank, self::level(100 + $i), 'pest', self::C);
            $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => Bank::layoutHash(self::level(100 + $i)), 'verdict' => 'mismatch', 'found' => null]);
        }
        $throttled = [429, ['error' => 'throttled']];
        self::assertSame($throttled, self::refusal(fn() => $this->submit($bank, self::level(200), 'pest', self::B)), 'the install');
        self::assertSame($throttled, self::refusal(fn() => $this->submit($bank, self::level(201), 'fresh', self::C_SAME_64)), 'the network (an IPv6 /64)');
        self::assertSame(['ok' => true], $this->submit($bank, self::level(202), 'fresh', self::B), 'others are not');
        $this->now += 24 * 3600 + 1;
        self::assertSame(['ok' => true], $this->submit($bank, self::level(203), 'pest', self::C), 'strikes last 24 hours');
        self::assertSame([], $this->stored('strikes.json'));
    }

    // ---- Versions, dedupe, caps --------------------------------------------------

    public function testOnlyAcceptedVersionsComeInAndARetiredVersionsPendingLevelsGo(): void
    {
        self::assertSame([403, ['error' => 'version']], self::refusal(fn() => $this->submit($this->bank(['accept' => [1]]), self::level(20), tuple: ['v' => 2])));
        $both = $this->bank(['accept' => [1, 2]]);
        $this->submit($both, self::level(21), tuple: ['v' => 1]);
        $this->submit($both, self::level(22), tuple: ['v' => 2]);
        // A device verifies only levels of its own version.
        self::assertSame(2, $this->claim($both, 'new', self::B, 2)['tuple']['v']);
        self::assertSame(['none' => true], $this->claim($both, 'new', self::B, 2));
        self::assertSame(1, $this->claim($both, 'old', self::B, 1)['tuple']['v']);
        $later = $this->bank(['accept' => [2]]);
        self::assertSame(['none' => true], $this->claim($later, 'old2', self::C, 1));
        self::assertSame(2, $this->claim($later, 'new2', self::C, 2)['tuple']['v']);
        self::assertSame([2], array_column($this->stored('pending-easy.json'), 'v'), 'the retired version\'s pending level is gone');
        self::assertSame([403, ['error' => 'version']], self::refusal(fn() => $this->submit($later, self::level(24), tuple: ['v' => 1])));
    }

    public function testTheShippedConfigRetiresVersionOneFromALiveStore(): void
    {
        // The store as the live host may hold it: served and pending levels of both versions.
        $served = [];
        $pending = [];
        foreach ([[40, 1], [41, 2], [42, 1]] as [$seed, $v]) {
            $served[] = Bank::servedEntry(self::made(Bank::blank(self::level($seed))), Bank::layoutHash(self::level($seed)), $v, $this->now - 60);
        }
        $bank = $this->bank();
        $this->submit($bank, self::level(43));
        $pending = $this->stored('pending-easy.json');
        $old = $pending[0];
        $old['v'] = 1;
        $old['h'] = Bank::layoutHash(self::level(44));
        $old['tuple']['v'] = 1;
        $pending[] = $old;
        file_put_contents("{$this->dir}/served-easy.json", Bank::encode($served));
        file_put_contents("{$this->dir}/pending-easy.json", Bank::encode($pending));

        self::assertSame([2], self::config()['accept']);
        $got = $bank->levels('easy', 10, 16);
        self::assertSame([Bank::blank(self::level(41))], array_column($got, 'text'), 'a version-1 level is never served again');
        self::assertSame([2], array_column($this->stored('served-easy.json'), 'v'), 'and leaves the store at the next request');
        self::assertSame([2], array_column($this->stored('pending-easy.json'), 'v'), 'a pending version-1 level goes too');
        self::assertSame(['none' => true], $this->claim($bank, 'old-page', self::B, 1), 'no version-1 level is handed out to check');
        self::assertSame([403, ['error' => 'version']], self::refusal(fn() => $this->submit($bank, self::level(45), 'old-page', self::B, ['v' => 1])), 'a version-1 submission is refused');
        self::assertSame([], $this->stored('strikes.json'), 'with no strike');
    }

    public function testARotatedOrFlippedCopyIsADuplicate(): void
    {
        $bank = $this->bank();
        $text = self::level(30, 15);
        $rows = self::rows($text);
        $turned = [];
        for ($c = 0; $c < 15; $c++) {
            $line = '';
            for ($r = 14; $r >= 0; $r--) {
                $line .= $rows[$r][$c];
            }
            $turned[] = $line;
        }
        $mirrored = array_map('strrev', $rows);
        $upsideDown = array_reverse($rows);
        $moved = $rows;
        $moved[1][1] = '.';
        $moved[13][13] = 'P';
        $this->submit($bank, $text);
        $duplicate = [409, ['error' => 'duplicate']];
        foreach (['turned' => $turned, 'mirrored' => $mirrored, 'upside down' => $upsideDown, 'pieces moved, same walls' => $moved] as $what => $copy) {
            self::assertSame($duplicate, self::refusal(fn() => $this->submit($bank, self::text($copy, 'New name'), 'other', self::B)), $what);
        }
        self::assertSame(Bank::layoutHash($text), Bank::layoutHash(self::text($turned)));
        self::assertNotSame(Bank::layoutHash($text), Bank::layoutHash(self::level(31, 15)));
        // A served level is a duplicate too.
        $this->claimAndVerify($bank, 'v1', self::A, self::made($text));
        $this->claimAndVerify($bank, 'v2', self::B, self::made($text));
        self::assertCount(1, $this->stored('served-easy.json'));
        self::assertSame($duplicate, self::refusal(fn() => $this->submit($bank, self::text($mirrored), 'other', self::B)));
    }

    public function testATransposedNonSquareGridHashesWithItsDimensions(): void
    {
        $wide = ['#######', '#P....#', '#.#.#.#', '#....E#', '#######'];
        $tall = [];
        for ($c = 0; $c < 7; $c++) {
            $line = '';
            for ($r = 0; $r < 5; $r++) {
                $line .= $wide[$r][$c];
            }
            $tall[] = $line;
        }
        self::assertSame(Bank::layoutHash(self::text($wide)), Bank::layoutHash(self::text($tall)), 'a transpose is a turn and a flip');
    }

    public function testThePendingCapDropsTheOldestAndThreeDaysRetireAny(): void
    {
        $bank = $this->bank(['pendingCap' => 3]);
        foreach ([40, 41, 42, 43] as $i => $seed) {
            $this->now += 60;
            $this->submit($bank, self::level($seed));
        }
        $kept = array_map(static fn(array $p): string => $p['h'], $this->stored('pending-easy.json'));
        self::assertSame([Bank::layoutHash(self::level(41)), Bank::layoutHash(self::level(42)), Bank::layoutHash(self::level(43))], $kept);
        $this->now += 3 * 86400 - 60 * 2;
        $this->submit($bank, self::level(44));
        self::assertCount(3, $this->stored('pending-easy.json'), 'the first two kept are over three days old');
        self::assertNotContains(Bank::layoutHash(self::level(41)), array_column($this->stored('pending-easy.json'), 'h'));
    }

    public function testRollOutRetiresAtRandomWeightedTowardOldAndOftenServed(): void
    {
        // Weights at the cap: old 10, busy 10, the two fresh 1 each, the newcomer 1.
        $texts = ['old' => self::level(50), 'busy' => self::level(51), 'fresh1' => self::level(52), 'fresh2' => self::level(53), 'new' => self::level(54)];
        $retired = array_fill_keys(array_keys($texts), 0);
        $trials = 230;
        for ($t = 0; $t < $trials; $t++) {
            foreach (glob($this->dir . '/*.json') as $f) {
                unlink($f);
            }
            $seed = [];
            foreach (['old' => [9, 0], 'busy' => [0, 9], 'fresh1' => [0, 0], 'fresh2' => [0, 0]] as $name => [$days, $served]) {
                $made = self::made(Bank::blank($texts[$name]));
                $seed[] = ['h' => Bank::layoutHash($texts[$name]), 'n' => $served] + Bank::servedEntry($made, Bank::layoutHash($texts[$name]), 2, $this->now - $days * 86400 - 5);
            }
            file_put_contents("{$this->dir}/served-easy.json", Bank::encode($seed));
            $bank = $this->bank(['servedCap' => 4]);
            $this->admit($bank, $texts['new'], (string) $t);
            $left = array_column($this->stored('served-easy.json'), 'h');
            self::assertCount(4, $left);
            foreach ($texts as $name => $text) {
                $retired[$name] += in_array(Bank::layoutHash($text), $left, true) ? 0 : 1;
            }
        }
        self::assertSame($trials, array_sum($retired));
        $message = json_encode($retired);
        self::assertGreaterThan(70, $retired['old'], $message);
        self::assertGreaterThan(70, $retired['busy'], $message);
        $light = $retired['fresh1'] + $retired['fresh2'] + $retired['new'];
        self::assertGreaterThan(0, $light, 'none is safe: ' . $message);
        self::assertLessThan(60, $light, $message);
    }

    public function testLevelsFilterByTierFavourTheLeastServedAndCountEach(): void
    {
        $entries = [];
        foreach ([[60, 1, 0], [61, 1, 999], [62, 5, 0]] as [$seed, $chapter, $served]) {
            $text = Bank::blank(self::level($seed));
            $entries[] = ['n' => $served] + Bank::servedEntry(self::made($text, ['chapter' => $chapter]), Bank::layoutHash($text), 2, $this->now);
        }
        file_put_contents("{$this->dir}/served-easy.json", Bank::encode($entries));
        $bank = $this->bank();
        $first = array_fill_keys([$entries[0]['h'], $entries[1]['h'], $entries[2]['h']], 0);
        for ($i = 0; $i < 20; $i++) {
            $got = $bank->levels('easy', 1, 1);
            self::assertCount(1, $got);
            $first[$got[0]['h']]++;
        }
        self::assertSame(0, $first[$entries[2]['h']], 'chapter 5 is past tier 1');
        self::assertGreaterThanOrEqual(18, $first[$entries[0]['h']], json_encode($first));
        $all = $bank->levels('easy', 10, 16);
        self::assertCount(3, $all);
        $counts = array_column($this->stored('served-easy.json'), 'n', 'h');
        self::assertSame(1, $counts[$entries[2]['h']]);
        self::assertSame(999 + $first[$entries[1]['h']] + 1, $counts[$entries[1]['h']]);
        self::assertSame([], $bank->levels('easy', 10, 0));
        self::assertSame([], $bank->levels('hard', 10, 16));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'tier']], self::refusal(fn() => $bank->levels('easy', 0, 1)));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'n']], self::refusal(fn() => $bank->levels('easy', 1, 17)));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'grade']], self::refusal(fn() => $bank->levels('Easy', 1, 1)));
    }

    public function testTwoReportsFromDistinctInstallsOnDistinctNetworksRetireALevel(): void
    {
        $bank = $this->bank();
        $text = self::level(70);
        $this->admit($bank, $text);
        $h = Bank::layoutHash($text);
        $report = fn(string $who, string $addr = self::B): array => $bank->report(['op' => 'report', 'install' => self::install($who), 'grade' => 'easy', 'h' => $h], $addr);
        self::assertSame(['ok' => true], $report('a'));
        self::assertSame(['ok' => true], $report('a'));
        self::assertCount(1, $this->stored('served-easy.json'), 'one install twice is one report');
        $report('made-up', self::B);
        self::assertCount(1, $this->stored('served-easy.json'), 'two made-up installs on one network are one report');
        $this->now += 4 * 86400;
        $report('b', self::C);
        self::assertCount(1, $this->stored('served-easy.json'), 'a report three days old is forgotten');
        $report('c', self::A);
        self::assertSame([], $this->stored('served-easy.json'));
        self::assertSame(['ok' => true], $report('d'), 'an unknown level is fine');
    }

    public function testAStaleReportIsForgottenEvenWhenNoOtherComes(): void
    {
        $bank = $this->bank();
        $text = self::level(71);
        $this->admit($bank, $text);
        $bank->report(['op' => 'report', 'install' => self::install('a'), 'grade' => 'easy', 'h' => Bank::layoutHash($text)], self::B);
        self::assertArrayHasKey('r', $this->stored('served-easy.json')[0]);
        $this->now += 4 * 86400;
        $bank->levels('easy', 10, 1);
        self::assertArrayNotHasKey('r', $this->stored('served-easy.json')[0], 'no install or network code kept past three days');
    }

    public function testTheServeWeightNeverFallsToZero(): void
    {
        $bank = $this->bank();
        $this->admit($bank, self::level(72));
        $served = $this->stored('served-easy.json');
        $served[0]['n'] = 5_000_000;
        file_put_contents("{$this->dir}/served-easy.json", json_encode($served));
        self::assertCount(1, $bank->levels('easy', 10, 1), 'a level served millions of times still serves');
    }

    // ---- Network keys --------------------------------------------------------------

    public function testTheNetworkKeyIsReplacedEveryThreeDaysAndDeletedThreeDaysLater(): void
    {
        $bank = $this->bank();
        $first = $bank->networkKey();
        self::assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $first);
        $this->now += 3 * 86400 - 1;
        self::assertSame($first, $bank->networkKey());
        $this->now += 1;
        $second = $bank->networkKey();
        self::assertNotSame($first, $second);
        self::assertCount(2, $this->stored('keys.json'));
        $this->now += 3 * 86400 - 1;
        self::assertContains($first, array_column($this->stored('keys.json'), 'key'));
        $this->now += 1;
        $third = $bank->networkKey();
        self::assertNotContains($first, array_column($this->stored('keys.json'), 'key'));
        self::assertSame([$second, $third], array_column($this->stored('keys.json'), 'key'));
        self::assertNotSame($bank->netCode(self::A, $second), $bank->netCode(self::A, $third), 'codes cannot be matched across keys');
        self::assertSame($bank->netCode(self::C, $third), $bank->netCode(self::C_SAME_64, $third), 'an IPv6 /64 is one network');
        self::assertSame(24, strlen($bank->netCode(self::A, $third)));
    }

    public function testAVerifierAfterAKeyChangeStillComparesUnderTheUploadersKey(): void
    {
        $bank = $this->bank(['pendingDays' => 5]);
        $text = self::level(80);
        $this->submit($bank, $text, 'up', self::A);
        $this->now += 3 * 86400 + 10; // the next request makes a new key
        $this->claimAndVerify($bank, 'v1', self::A, self::made($text));
        self::assertCount(2, $this->stored('keys.json'));
        $this->claimAndVerify($bank, 'v2', self::A, self::made($text));
        self::assertCount(1, $this->stored('pending-easy.json'), 'A is still the uploader\'s network under the uploader\'s key');
        $this->claimAndVerify($bank, 'v3', self::B, self::made($text));
        self::assertCount(1, $this->stored('served-easy.json'));
    }

    // ---- Storage --------------------------------------------------------------------

    public function testConcurrentWritersLoseNothing(): void
    {
        $workers = 4;
        $each = 12;
        $script = $this->dir . '/../' . basename($this->dir) . '-worker.php';
        $bankPhp = dirname(__DIR__, 2) . '/bank/Bank.php';
        $config = self::config();
        file_put_contents($script, '<?php
            require ' . var_export($bankPhp, true) . ';
            [, $dir, $jobs, $addr] = $argv;
            $config = json_decode(' . var_export(json_encode($config), true) . ', true);
            $bank = new Crete\Bank($config, $dir);
            foreach (json_decode(file_get_contents($jobs), true) as $body) {
                $bank->submit($body, $addr);
            }
            echo "done\n";
        ');
        $procs = [];
        $all = [];
        for ($w = 0; $w < $workers; $w++) {
            $bodies = [];
            for ($i = 0; $i < $each; $i++) {
                $text = self::level(1000 + $w * 100 + $i);
                $all[] = Bank::layoutHash($text);
                $bodies[] = ['op' => 'submit', 'install' => self::install("w$w"), 'tuple' => self::tuple(), 'made' => self::made($text)];
            }
            file_put_contents("{$this->dir}/../" . basename($this->dir) . "-jobs$w.json", json_encode($bodies));
            $cmd = [PHP_BINARY, $script, $this->dir, "{$this->dir}/../" . basename($this->dir) . "-jobs$w.json", "10.0.$w.1"];
            $procs[] = [proc_open($cmd, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes), $pipes];
        }
        foreach ($procs as $w => [$proc, $pipes]) {
            $out = stream_get_contents($pipes[1]) . stream_get_contents($pipes[2]);
            self::assertSame(0, proc_close($proc), $out);
            self::assertSame("done\n", $out);
            @unlink("{$this->dir}/../" . basename($this->dir) . "-jobs$w.json");
        }
        @unlink($script);
        $stored = array_column($this->stored('pending-easy.json'), 'h');
        sort($stored);
        sort($all);
        self::assertSame($all, $stored);
        self::assertCount(1, $this->stored('keys.json'), 'one network key, made once');
        self::assertSame([], glob($this->dir . '/.*.tmp'), 'no temporary file is left behind');
    }

    public function testAFullStoreOfTheLargestBoardsIsUnderFourMegabytes(): void
    {
        $entries = [];
        $line = str_repeat('rdlu', 100);
        for ($i = 0; $i < 1500; $i++) {
            $rows = self::rows(self::level(5000 + $i, 33));
            $rows[2] = substr_replace($rows[2], 'owe', 2, 3);
            $rows[4] = substr_replace($rows[4], 'C', 2, 1);
            $text = Bank::checkText(self::text($rows, 'x', ['hearts: 4', 'facing: up down left', 'machines: fireball-right']), 'made.text');
            $made = self::made($text, ['line' => $line, 'shortest' => 400, 'score' => 9999, 'explored' => 9_999_999, 'chapter' => 10, 'hides' => true]);
            $entries[] = ['n' => 123456] + Bank::servedEntry($made, Bank::layoutHash($text), 2, $this->now);
        }
        $bytes = Bank::encode($entries);
        file_put_contents("{$this->dir}/served-hard.json", $bytes);
        $size = strlen($bytes);
        self::assertLessThan(4 * 1024 * 1024, $size, sprintf('a full store of 1500 33x33 levels is %.2f MB (%d bytes)', $size / 1048576, $size));
        fwrite(STDERR, sprintf("\n[crete bank] full store of 1500 33x33 levels: %d bytes (%.2f MB)\n", $size, $size / 1048576));
        $start = hrtime(true);
        $got = $this->bank()->levels('hard', 10, 16);
        $ms = (hrtime(true) - $start) / 1e6;
        self::assertCount(16, $got);
        self::assertLessThan(2000, $ms, "a read and rewrite of the full store took $ms ms");
    }

    public function testAStoreThatWillNotParseIsLeftAlone(): void
    {
        file_put_contents("{$this->dir}/served-easy.json", '{"broken');
        $this->expectException(\RuntimeException::class);
        try {
            $this->bank()->levels('easy', 1, 1);
        } finally {
            self::assertSame('{"broken', file_get_contents("{$this->dir}/served-easy.json"));
        }
    }

    // ---- Config ---------------------------------------------------------------------

    public function testTheShippedConfigIsValid(): void
    {
        $config = self::config();
        self::assertSame([2], $config['accept']);
        self::assertSame(1500, $config['servedCap']);
        self::assertSame(['submit' => 30, 'claim' => 20, 'verify' => 20, 'report' => 20, 'levels' => 120, 'trusted' => 600], $config['perHour']);
        self::assertSame('crete_bank_csrf', $config['guard']['csrfCookie']);
    }

    /** @return array<string, array{array<string, mixed>}> */
    public static function badConfigs(): array
    {
        return [
            'an unknown key' => [['colour' => 'red']],
            'no accepted version' => [['accept' => []]],
            'a version as a string' => [['accept' => ['1']]],
            'a cap of zero' => [['servedCap' => 0]],
            'a rate kind missing' => [['perHour' => ['submit' => 1, 'claim' => 1, 'verify' => 1, 'report' => 1]]],
            'an unknown rate kind' => [['perHour' => ['submit' => 1, 'claim' => 1, 'verify' => 1, 'report' => 1, 'levels' => 1, 'more' => 1]]],
            'a bad cookie name' => [['csrfCookie' => 'no spaces']],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('badConfigs')]
    public function testABadConfigIsRefused(array $over): void
    {
        $this->expectException(\RuntimeException::class);
        self::config($over);
    }

    // ---- The trusted verifier ---------------------------------------------------------

    private const TOKEN = 'tok_Trusted-verifier_0123456789abcdefXYZ';

    private function verifierFile(string $token = self::TOKEN): string
    {
        $path = $this->dir . '/verifier.json';
        file_put_contents($path, json_encode(['tokenSha256' => hash('sha256', $token)]));
        return $path;
    }

    private function trusted(Bank $bank, array $body, ?string $token = self::TOKEN): array
    {
        return $bank->handleTrusted($body, $token, $this->dir . '/verifier.json');
    }

    public function testTrustedOpsAcceptOnlyTheRightToken(): void
    {
        $bank = $this->bank();
        $this->submit($bank, self::level(300));
        $before = (string) file_get_contents("{$this->dir}/pending-easy.json");
        $h = Bank::layoutHash(self::level(300));
        $verify = ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $h, 'verdict' => 'mismatch', 'found' => null];
        $list = ['op' => 'trusted-list', 'limit' => 5];
        $unauthorized = [401, ['error' => 'unauthorized']];
        self::assertSame($unauthorized, self::refusal(fn() => $this->trusted($bank, $list)), 'no verifier file trusts nobody');
        $this->verifierFile();
        foreach (['a wrong token' => 'tok_Wrong-verifier_0123456789abcdefXYZ', 'no token' => null, 'a short token' => 'tok', 'the hash itself' => hash('sha256', self::TOKEN)] as $what => $token) {
            self::assertSame($unauthorized, self::refusal(fn() => $this->trusted($bank, $verify, $token)), $what);
            self::assertSame($unauthorized, self::refusal(fn() => $this->trusted($bank, $list, $token)), $what);
        }
        file_put_contents($this->dir . '/verifier.json', '{"tokenSha256": "not hex"}');
        self::assertSame($unauthorized, self::refusal(fn() => $this->trusted($bank, $verify)), 'a malformed file trusts nobody');
        self::assertSame($before, (string) file_get_contents("{$this->dir}/pending-easy.json"), 'nothing changed');
        self::assertSame([], $this->stored('strikes.json'));
        $this->verifierFile();
        self::assertCount(1, $this->trusted($bank, $list)['items']);
        self::assertSame([400, ['error' => 'invalid', 'field' => 'op']], self::refusal(fn() => $this->trusted($bank, ['op' => 'submit'])));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'limit']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 51])));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'verdict']], self::refusal(fn() => $this->trusted($bank, ['verdict' => 'maybe'] + $verify)));
    }

    public function testATrustedMatchAdmitsAtOnce(): void
    {
        $bank = $this->bank();
        $this->verifierFile();
        $text = self::level(301, 15, 'Secret title');
        $this->submit($bank, $text, 'lonely', self::A);
        $items = $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 50])['items'];
        self::assertCount(1, $items);
        self::assertSame(['grade', 'h', 'tuple', 'made'], array_keys($items[0]));
        self::assertSame('easy', $items[0]['grade']);
        self::assertSame(Bank::blank($text), $items[0]['made']['text']);
        $verdict = $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $items[0]['h'], 'verdict' => 'match', 'found' => self::made($text)]);
        self::assertSame(['ok' => true, 'verdict' => 'match'], $verdict);
        self::assertSame([], $this->stored('pending-easy.json'));
        $served = $bank->levels('easy', 1, 16);
        self::assertCount(1, $served);
        self::assertSame(Bank::blank($text), $served[0]['text']);
        self::assertSame([], $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 50])['items'], 'a served level is never listed');
        self::assertSame([404, ['error' => 'gone']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $items[0]['h'], 'verdict' => 'match', 'found' => self::made($text)])));
    }

    /** @return array<string, array{string, array<string, mixed>|null}> */
    public static function trustedMismatches(): array
    {
        $made = self::made(self::level(302));
        return [
            'says match, found differs' => ['match', ['score' => 121] + $made],
            'says match, found nothing' => ['match', null],
            'says mismatch, found the same' => ['mismatch', $made],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('trustedMismatches')]
    public function testATrustedVerdictOtherThanAFullMatchRejectsAndStrikes(string $says, ?array $found): void
    {
        $bank = $this->bank();
        $this->verifierFile();
        $this->submit($bank, self::level(302), 'up', self::A);
        $h = Bank::layoutHash(self::level(302));
        $verdict = $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $h, 'verdict' => $says, 'found' => $found]);
        self::assertSame(['ok' => true, 'verdict' => 'mismatch'], $verdict);
        self::assertSame([], $this->stored('pending-easy.json'));
        self::assertSame([], $this->stored('served-easy.json'));
        self::assertSame([Bank::installHash(self::install('up'))], array_column($this->stored('strikes.json'), 'i'));
    }

    public function testAHandEditedLevelListedToTheTrustedVerifierIsNeverServed(): void
    {
        $bank = $this->bank();
        $this->verifierFile();
        $rows = self::rows(self::level(303));
        $rows[3] = '#.#.#.###.#...#';
        $rows[4] = '#.###.##..#...#';
        $drawn = self::text($rows, 'hello');
        $this->submit($bank, $drawn, 'prankster', self::A);
        $item = $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 1])['items'][0];
        // The verifier regenerates the tuple's part and gets the real level, not the drawing.
        $regenerated = self::made(self::level(303));
        $verdict = $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => $item['grade'], 'h' => $item['h'], 'verdict' => 'mismatch', 'found' => $regenerated]);
        self::assertSame('mismatch', $verdict['verdict']);
        self::assertSame([], $bank->levels('easy', 10, 16));
        self::assertSame([], $this->stored('pending-easy.json'));
        self::assertCount(1, $this->stored('strikes.json'));
    }

    public function testTheTrustedListIsOldestFirstAcrossGradesAndCapped(): void
    {
        $bank = $this->bank();
        $this->verifierFile();
        // Served first: its peer verifiers claim whatever is pending.
        $this->admit($bank, self::level(314));
        foreach ([['hard', 310], ['easy', 311], ['medium', 312], ['easy', 313]] as [$grade, $seed]) {
            $this->now += 60;
            $this->submit($bank, self::level($seed), tuple: ['grade' => $grade]);
        }
        $items = $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 3])['items'];
        self::assertSame(['hard', 'easy', 'medium'], array_column($items, 'grade'));
        self::assertSame([Bank::layoutHash(self::level(310)), Bank::layoutHash(self::level(311)), Bank::layoutHash(self::level(312))], array_column($items, 'h'));
        self::assertCount(4, $this->trusted($bank, ['op' => 'trusted-list', 'limit' => 50])['items'], 'the served level is not listed');
        self::assertSame([404, ['error' => 'gone']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'medium', 'h' => Bank::layoutHash(self::level(310)), 'verdict' => 'match', 'found' => null])), 'the right h in the wrong grade');
        $retired = $this->bank(['accept' => [3]]);
        self::assertSame([], $this->trusted($retired, ['op' => 'trusted-list', 'limit' => 50])['items'], 'only accepted versions');
    }

    private function add(Bank $bank, string $text, array $tuple = [], ?string $token = self::TOKEN): array
    {
        return $this->trusted($bank, ['op' => 'trusted-add', 'tuple' => self::tuple($tuple), 'made' => self::made($text)], $token);
    }

    public function testATrustedAddNeedsTheTokenAndIsServedAtOnceWithItsTuple(): void
    {
        $bank = $this->bank();
        $text = self::level(330, 15, 'Made on the runner');
        $unauthorized = [401, ['error' => 'unauthorized']];
        self::assertSame($unauthorized, self::refusal(fn() => $this->add($bank, $text)), 'no verifier file trusts nobody');
        $this->verifierFile();
        foreach (['a wrong token' => 'tok_Wrong-verifier_0123456789abcdefXYZ', 'no token' => null, 'the hash itself' => hash('sha256', self::TOKEN)] as $what => $token) {
            self::assertSame($unauthorized, self::refusal(fn() => $this->add($bank, $text, [], $token)), $what);
            self::assertSame($unauthorized, self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-counts'], $token)), $what);
        }
        self::assertSame([], $this->stored('served-easy.json'), 'nothing came in');

        $h = Bank::layoutHash($text);
        self::assertSame(['ok' => true, 'h' => $h], $this->add($bank, $text, ['seed' => 'ci-abc']));
        $served = $bank->levels('easy', 1, 16);
        self::assertSame([Bank::blank($text)], array_column($served, 'text'), 'served at once, its title blanked');
        self::assertSame([], $this->stored('pending-easy.json'), 'never in quarantine');
        $kept = json_decode((string) file_get_contents("{$this->dir}/prov-easy-$h.json"), true);
        self::assertSame('ci-abc', $kept['seed'], 'its provenance tuple is kept beside it');
        self::assertSame('title: ', explode("\n", $kept['run'][0]['text'])[0]);
        self::assertSame([409, ['error' => 'duplicate']], self::refusal(fn() => $this->add($bank, $text)));
        self::assertSame([403, ['error' => 'version']], self::refusal(fn() => $this->add($bank, self::level(331), ['v' => 1])), 'never version 1');
        self::assertSame([400, ['error' => 'invalid', 'field' => 'made.text']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-add', 'tuple' => self::tuple(), 'made' => self::made("title: x\n")])));
        self::assertSame([], $this->stored('strikes.json'), 'the runner\'s refusals strike nobody');
    }

    public function testTrustedAddsStopAtTheCapAndNeverRollOutAPlayersLevel(): void
    {
        $bank = $this->bank(['servedCap' => 3]);
        $this->verifierFile();
        $this->admit($bank, self::level(340));
        $this->submit($bank, self::level(341), 'waiting', self::A);
        self::assertTrue($this->add($bank, self::level(342))['ok']);
        // One served, one pending and one added fill the cap of three.
        self::assertSame([409, ['error' => 'full']], self::refusal(fn() => $this->add($bank, self::level(343))));
        self::assertSame([Bank::layoutHash(self::level(340)), Bank::layoutHash(self::level(342))], array_column($this->stored('served-easy.json'), 'h'), 'the player\'s level stays');
        self::assertFalse(is_file("{$this->dir}/prov-easy-" . Bank::layoutHash(self::level(343)) . '.json'));
        self::assertTrue($this->add($bank, self::level(344), ['grade' => 'hard'])['ok'], 'another grade has room');
        // A uploader's strikes are the peers' business as before: the runner's adds never change them.
        $h = Bank::layoutHash(self::level(341));
        $this->trusted($bank, ['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $h, 'verdict' => 'mismatch', 'found' => null]);
        self::assertSame([Bank::installHash(self::install('waiting'))], array_column($this->stored('strikes.json'), 'i'));
    }

    private function replace(Bank $bank, string $text, array $tuple = [], ?string $token = self::TOKEN): array
    {
        return $this->trusted($bank, ['op' => 'trusted-add', 'tuple' => self::tuple($tuple), 'made' => self::made($text), 'replace' => true], $token);
    }

    public function testAReplacingAddNeedsTheTokenAndRetiresOneForOneAtTheCap(): void
    {
        $bank = $this->bank(['servedCap' => 3]);
        $this->admit($bank, self::level(360));
        $this->submit($bank, self::level(361), 'waiting', self::A);
        $before = array_column($this->stored('served-easy.json'), 'h');
        self::assertSame([401, ['error' => 'unauthorized']], self::refusal(fn() => $this->replace($bank, self::level(362))), 'no verifier file trusts nobody');
        $this->verifierFile();
        foreach (['a wrong token' => 'tok_Wrong-verifier_0123456789abcdefXYZ', 'no token' => null] as $what => $token) {
            self::assertSame([401, ['error' => 'unauthorized']], self::refusal(fn() => $this->replace($bank, self::level(362), [], $token)), $what);
        }
        self::assertSame($before, array_column($this->stored('served-easy.json'), 'h'), 'nothing retired without the token');
        self::assertSame([400, ['error' => 'invalid', 'field' => 'replace']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-add', 'tuple' => self::tuple(), 'made' => self::made(self::level(362)), 'replace' => 1])));

        // Room under the cap: it simply comes in, retiring nothing.
        self::assertSame(['ok' => true, 'h' => Bank::layoutHash(self::level(362))], $this->replace($bank, self::level(362)));
        self::assertCount(2, $this->stored('served-easy.json'));
        // Full (two served, one waiting): one served level leaves for each that comes in, never the waiting one.
        for ($i = 0; $i < 5; $i++) {
            $this->now += 3600;
            $got = $this->replace($bank, self::level(363 + $i));
            $served = array_column($this->stored('served-easy.json'), 'h');
            self::assertCount(2, $served, 'the grade stays at its cap');
            self::assertNotContains($got['retired'], $served);
            self::assertSame(Bank::layoutHash(self::level(363 + $i)), end($served));
            self::assertCount(1, $this->stored('pending-easy.json'), 'the waiting level stays');
        }
        // A refused add retires nothing.
        $served = array_column($this->stored('served-easy.json'), 'h');
        self::assertSame([409, ['error' => 'duplicate']], self::refusal(fn() => $this->replace($bank, self::level(367))));
        self::assertSame([403, ['error' => 'version']], self::refusal(fn() => $this->replace($bank, self::level(368), ['v' => 1])));
        self::assertSame($served, array_column($this->stored('served-easy.json'), 'h'));
        // Nothing served to retire: still full, and the waiting levels are never retired.
        $hard = $this->bank(['servedCap' => 1]);
        $this->submit($hard, self::level(369), tuple: ['grade' => 'hard']);
        self::assertSame([409, ['error' => 'full']], self::refusal(fn() => $this->replace($hard, self::level(370), ['grade' => 'hard'])));
        self::assertCount(1, $this->stored('pending-hard.json'));
        // Without replace a full grade still answers full.
        self::assertSame([409, ['error' => 'full']], self::refusal(fn() => $this->add($bank, self::level(371))));
    }

    public function testAReplacingAddRetiresByTheWeightingTowardOldAndOftenServed(): void
    {
        // The same weights as the roll-out: old 10, busy 10, the two fresh 1 each; the newcomer is never the one to go.
        $texts = ['old' => self::level(380), 'busy' => self::level(381), 'fresh1' => self::level(382), 'fresh2' => self::level(383)];
        $retired = array_fill_keys(array_keys($texts), 0);
        $trials = 220;
        $this->verifierFile();
        for ($t = 0; $t < $trials; $t++) {
            foreach (glob($this->dir . '/*-easy*.json') as $f) {
                unlink($f);
            }
            $seed = [];
            foreach (['old' => [9, 0], 'busy' => [0, 9], 'fresh1' => [0, 0], 'fresh2' => [0, 0]] as $name => [$days, $served]) {
                $made = self::made(Bank::blank($texts[$name]));
                $seed[] = ['n' => $served] + Bank::servedEntry($made, Bank::layoutHash($texts[$name]), 2, $this->now - $days * 86400 - 5);
            }
            file_put_contents("{$this->dir}/served-easy.json", Bank::encode($seed));
            $got = $this->replace($this->bank(['servedCap' => 4]), self::level(384 + $t + 1));
            $left = array_column($this->stored('served-easy.json'), 'h');
            self::assertCount(4, $left);
            self::assertContains($got['h'], $left, 'the newcomer stays');
            foreach ($texts as $name => $text) {
                $retired[$name] += in_array(Bank::layoutHash($text), $left, true) ? 0 : 1;
            }
        }
        self::assertSame($trials, array_sum($retired));
        $message = json_encode($retired);
        self::assertGreaterThan(75, $retired['old'], $message);
        self::assertGreaterThan(75, $retired['busy'], $message);
        $light = $retired['fresh1'] + $retired['fresh2'];
        self::assertGreaterThan(0, $light, 'none is safe: ' . $message);
        self::assertLessThan(50, $light, $message);
    }

    public function testTrustedCountsSummariseEachGradeAndForgetRetiredProvenance(): void
    {
        $bank = $this->bank(['servedCap' => 2]);
        $this->verifierFile();
        $this->add($bank, self::level(350, 15));
        $this->add($bank, self::level(351, 21), ['grade' => 'hard']);
        $this->submit($bank, self::level(352), tuple: ['grade' => 'hard']);
        $counts = $this->trusted($bank, ['op' => 'trusted-counts'])['grades'];
        self::assertSame(['easy', 'medium', 'hard'], array_keys($counts));
        self::assertSame(['served' => 1, 'pending' => 0, 'cap' => 2, 'levels' => [[120, 1, 15, 15, 0]]], $counts['easy']);
        self::assertSame(['served' => 0, 'pending' => 0, 'cap' => 2, 'levels' => []], $counts['medium']);
        self::assertSame(['served' => 1, 'pending' => 1, 'cap' => 2, 'levels' => [[120, 1, 21, 21, 0]]], $counts['hard']);
        // Two reports retire the easy level; the next counts forget its tuple.
        $h = Bank::layoutHash(self::level(350, 15));
        $bank->report(['op' => 'report', 'install' => self::install('r1'), 'grade' => 'easy', 'h' => $h], self::A);
        $bank->report(['op' => 'report', 'install' => self::install('r2'), 'grade' => 'easy', 'h' => $h], self::B);
        self::assertTrue(is_file("{$this->dir}/prov-easy-$h.json"));
        self::assertSame(0, $this->trusted($bank, ['op' => 'trusted-counts'])['grades']['easy']['served']);
        self::assertFalse(is_file("{$this->dir}/prov-easy-$h.json"));
        self::assertTrue(is_file("{$this->dir}/prov-hard-" . Bank::layoutHash(self::level(351, 21)) . '.json'));
        self::assertSame([400, ['error' => 'invalid', 'field' => 'extra']], self::refusal(fn() => $this->trusted($bank, ['op' => 'trusted-counts', 'extra' => 1])));
    }

    public function testTheTrustedEndpointNeverEchoesOrLogsTheToken(): void
    {
        $log = $this->dir . '/../' . basename($this->dir) . '-php.log';
        touch($log);
        $file = $this->verifierFile();
        [$server, $base] = $this->serve(['CRETE_BANK_VERIFIER_FILE' => $file], ['error_log' => $log, 'log_errors' => '1']);
        try {
            $csrf = self::http('GET', $base)[1]['csrf'];
            $browser = ['Content-Type: application/json', "Cookie: crete_bank_csrf=$csrf", "X-Crete-CSRF: $csrf"];
            $text = self::level(320);
            self::http('POST', $base, json_encode(['op' => 'submit', 'install' => self::install('up'), 'tuple' => self::tuple(), 'made' => self::made($text)]), $browser);
            $json = ['Content-Type: application/json'];
            $seen = [];
            $call = function (array $body, array $headers) use ($base, &$seen): array {
                $got = self::http('POST', $base, json_encode($body), $headers);
                $seen[] = json_encode($got);
                return $got;
            };
            $list = ['op' => 'trusted-list', 'limit' => 5];
            self::assertSame([401, ['error' => 'unauthorized']], array_slice($call($list, $json), 0, 2), 'no header');
            self::assertSame([401, ['error' => 'unauthorized']], array_slice($call($list, [...$json, 'X-Crete-Verifier: tok_Wrong-verifier_0123456789abcdefXYZ']), 0, 2));
            self::assertSame(403, $call($list, ['Content-Type: text/plain', 'X-Crete-Verifier: ' . self::TOKEN])[0], 'JSON only');
            $trusted = [...$json, 'X-Crete-Verifier: ' . self::TOKEN];
            [$status, $body] = $call($list, $trusted);
            self::assertSame(200, $status, 'no Origin or CSRF needed');
            self::assertCount(1, $body['items']);
            self::assertSame([404, ['error' => 'gone']], array_slice($call(['op' => 'trusted-verify', 'grade' => 'hard', 'h' => $body['items'][0]['h'], 'verdict' => 'match', 'found' => null], $trusted), 0, 2));
            self::assertSame([400, ['error' => 'invalid', 'field' => 'found.text']], array_slice($call(['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $body['items'][0]['h'], 'verdict' => 'match', 'found' => ['text' => 'x'] + self::made($text)], $trusted), 0, 2));
            self::assertSame([200, ['ok' => true, 'verdict' => 'match']], array_slice($call(['op' => 'trusted-verify', 'grade' => 'easy', 'h' => $body['items'][0]['h'], 'verdict' => 'match', 'found' => self::made($text)], $trusted), 0, 2));
            self::assertCount(1, self::http('GET', "$base?grade=easy&tier=1&n=4")[1]['levels']);
            self::assertSame(403, $call(['op' => 'claim', 'install' => self::install('x'), 'v' => 1], $trusted)[0], 'the token is no CSRF pass for browser ops');
            $add = ['op' => 'trusted-add', 'tuple' => self::tuple(), 'made' => self::made(self::level(321))];
            self::assertSame([401, ['error' => 'unauthorized']], array_slice($call($add, $json), 0, 2), 'no adding without the token');
            self::assertSame([401, ['error' => 'unauthorized']], array_slice($call($add, [...$json, 'Origin: http://127.0.0.1', 'X-Crete-Verifier: tok_Wrong-verifier_0123456789abcdefXYZ']), 0, 2));
            self::assertSame([200, ['ok' => true, 'h' => Bank::layoutHash(self::level(321))]], array_slice($call($add, $trusted), 0, 2));
            [$status, $body] = $call(['op' => 'trusted-counts'], $trusted);
            self::assertSame([200, 2], [$status, $body['grades']['easy']['served']]);
            foreach ($seen as $answer) {
                self::assertStringNotContainsString(self::TOKEN, $answer);
            }
        } finally {
            proc_terminate($server);
            proc_close($server);
        }
        $logged = (string) file_get_contents($log);
        @unlink($log);
        self::assertStringNotContainsString(self::TOKEN, $logged);
        self::assertStringNotContainsString(self::TOKEN, (string) file_get_contents($file));
        foreach (glob($this->dir . '/*') as $f) {
            self::assertStringNotContainsString(self::TOKEN, (string) file_get_contents($f), basename($f));
        }
    }

    /**
     * A php -S server on games/crete with the bank in this test's folder.
     * @param array<string, string> $env
     * @param array<string, string> $ini
     * @return array{0: resource, 1: string} the process and the endpoint's URL
     */
    private function serve(array $env = [], array $ini = []): array
    {
        $port = 20000 + random_int(0, 20000);
        $args = [PHP_BINARY];
        foreach ($ini as $k => $v) {
            $args[] = '-d';
            $args[] = "$k=$v";
        }
        array_push($args, '-S', "127.0.0.1:$port", '-t', dirname(__DIR__, 2));
        $server = proc_open($args, [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null, $env + ['CRETE_BANK_DIR' => $this->dir] + getenv());
        for ($i = 0; $i < 100 && !@fsockopen('127.0.0.1', $port); $i++) {
            usleep(50_000);
        }
        return [$server, "http://127.0.0.1:$port/endless-bank.php"];
    }

    // ---- HTTP -------------------------------------------------------------------------

    public function testTheEndpointGuardsAndAnswers(): void
    {
        $port = 20000 + random_int(0, 20000);
        $env = ['CRETE_BANK_DIR' => $this->dir] + getenv();
        $server = proc_open([PHP_BINARY, '-S', "127.0.0.1:$port", '-t', dirname(__DIR__, 2)], [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null, $env);
        try {
            for ($i = 0; $i < 100 && !@fsockopen('127.0.0.1', $port); $i++) {
                usleep(50_000);
            }
            $base = "http://127.0.0.1:$port/endless-bank.php";
            [$status, $body, $headers] = self::http('GET', $base);
            self::assertSame(200, $status);
            self::assertSame([], $body['levels']);
            self::assertMatchesRegularExpression('/^[a-f0-9]{32}$/', $body['csrf']);
            self::assertContains('Cache-Control: no-store', $headers);
            $cookie = 'crete_bank_csrf=' . $body['csrf'];
            $post = static fn(array $data, array $extra = []) => self::http('POST', $base, json_encode($data), array_merge(
                ['Content-Type: application/json', "Cookie: $cookie", 'X-Crete-CSRF: ' . $body['csrf'], "Origin: http://127.0.0.1:$port"],
                $extra,
            ));
            $submit = ['op' => 'submit', 'install' => self::install('web'), 'tuple' => self::tuple(), 'made' => self::made(self::level(90))];
            self::assertSame([200, ['ok' => true]], array_slice($post($submit), 0, 2));
            self::assertSame([409, ['error' => 'duplicate']], array_slice($post($submit), 0, 2));
            self::assertSame([400, ['error' => 'invalid', 'field' => 'op']], array_slice($post(['op' => 'delete']), 0, 2));
            self::assertSame([200, ['none' => true]], array_slice($post(['op' => 'claim', 'install' => self::install('web'), 'v' => 1]), 0, 2));
            $forbidden = self::http('POST', $base, json_encode($submit), ['Content-Type: application/json', "Cookie: $cookie", "Origin: http://127.0.0.1:$port"]);
            self::assertSame([403, ['error' => 'forbidden']], array_slice($forbidden, 0, 2), 'no CSRF header');
            $elsewhere = $post($submit, ['Origin: https://evil.example']);
            self::assertSame(403, $elsewhere[0]);
            $huge = self::http('POST', $base, str_repeat(' ', 65537), ['Content-Type: application/json', "Cookie: $cookie", 'X-Crete-CSRF: ' . $body['csrf']]);
            self::assertSame([400, ['error' => 'invalid', 'field' => 'body']], array_slice($huge, 0, 2));
            self::assertSame([200, []], [self::http('GET', "$base?grade=easy&tier=1&n=4")[0], self::http('GET', "$base?grade=easy&tier=1&n=4")[1]['levels']]);
            self::assertSame([400, ['error' => 'invalid', 'field' => 'grade']], array_slice(self::http('GET', "$base?grade=nope&tier=1&n=4"), 0, 2));
            self::assertSame([400, ['error' => 'invalid', 'field' => 'tier']], array_slice(self::http('GET', "$base?grade=easy&tier=x&n=4"), 0, 2));
            self::assertSame([400, ['error' => 'invalid', 'field' => 'n']], array_slice(self::http('GET', "$base?grade=easy&tier=1&n=99"), 0, 2));
            self::assertSame(405,self::http('PUT', $base)[0]);
            self::assertSame(404, self::http('GET', "http://127.0.0.1:$port/bank/Bank.php")[0], 'the library is never an endpoint');
            self::assertFileExists($this->dir . '/guard.json', 'rate stamps live with the bank');
            self::assertStringNotContainsString('127.0.0.1', (string) file_get_contents($this->dir . '/guard.json'));
        } finally {
            proc_terminate($server);
            proc_close($server);
        }
    }

    public function testTheRateLimitAnswers429(): void
    {
        $port = 20000 + random_int(0, 20000);
        $env = ['CRETE_BANK_DIR' => $this->dir] + getenv();
        $server = proc_open([PHP_BINARY, '-S', "127.0.0.1:$port", '-t', dirname(__DIR__, 2)], [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']], $pipes, null, $env);
        try {
            for ($i = 0; $i < 100 && !@fsockopen('127.0.0.1', $port); $i++) {
                usleep(50_000);
            }
            $base = "http://127.0.0.1:$port/endless-bank.php";
            $csrf = self::http('GET', $base)[1]['csrf'];
            $headers = ['Content-Type: application/json', "Cookie: crete_bank_csrf=$csrf", "X-Crete-CSRF: $csrf"];
            $claim = json_encode(['op' => 'claim', 'install' => self::install('busy'), 'v' => 1]);
            for ($i = 0; $i < 20; $i++) {
                self::assertSame(200, self::http('POST', $base, $claim, $headers)[0]);
            }
            self::assertSame([429, ['error' => 'rate']], array_slice(self::http('POST', $base, $claim, $headers), 0, 2));
        } finally {
            proc_terminate($server);
            proc_close($server);
        }
    }

    /**
     * @param list<string> $headers
     * @return array{0: int, 1: mixed, 2: list<string>}
     */
    private static function http(string $method, string $url, ?string $body = null, array $headers = []): array
    {
        $context = stream_context_create(['http' => [
            'method' => $method, 'header' => implode("\r\n", $headers), 'content' => $body ?? '', 'ignore_errors' => true, 'timeout' => 10,
        ]]);
        $raw = @file_get_contents($url, false, $context);
        $got = http_get_last_response_headers() ?? [];
        preg_match('{^HTTP/\S+ (\d+)}', $got[0] ?? '', $m);
        return [(int) ($m[1] ?? 0), json_decode((string) $raw, true), $got];
    }
}
