<?php
// The admin pages' controllers: the sign-in flow, the hub, sign-out and the health probe.
// Every response is returned with the required headers already applied.
declare(strict_types=1);

namespace Admin;

final class Response
{
    /**
     * @param array<string, string> $headers
     * @param list<string> $cookies Set-Cookie values, one header each
     */
    public function __construct(public int $status, public array $headers, public string $body, public array $cookies = [])
    {
    }
}

final class Pages
{
    /** Holds the random mark a confirm page's form must send back; there is no session yet to bind it to. */
    public const CONFIRM_COOKIE = '__Secure-admin-confirm';

    /** Seconds between live SMTP probes. */
    public const PROBE_EVERY = 600;

    private Auth $auth;
    private Sessions $sessions;
    private string $cookiePath;
    /** @var list<array{to:string,subject:string,mime:string,token:?string}> */
    private array $queue = [];
    private Keys $keys;
    /** @var callable():bool */
    private $mailProbe;

    /**
     * @param (callable():bool)|null $mailProbe true when the SMTP server greets us; defaults to a live check
     * @param Keys|null $keys the key store; defaults to the configured scope registry
     */
    public function __construct(private \PDO $db, private Clock $clock, private Mailer $mailer, private string $baseUrl, ?callable $mailProbe = null, ?Keys $keys = null)
    {
        $this->keys = $keys ?? new Keys($db, $clock, null, $baseUrl);
        $this->auth = new Auth($db, $clock);
        $this->cookiePath = admin_cookie_path($baseUrl);
        $this->sessions = new Sessions($db, $clock, $this->cookiePath);
        $this->mailProbe = $mailProbe ?? self::smtpGreets(...);
    }

    /** The response for a refused storage directory: the problem goes to the log, never to the visitor. */
    public static function fromStorageError(\Throwable $e): Response
    {
        return self::storageDown();
    }

    /** What a visitor sees when storage is refused: no paths, no detail. */
    public static function storageDown(): Response
    {
        return self::make(503, 'Admin pages are unavailable right now.', ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    /** GET login.php. */
    public function loginForm(Request $r): Response
    {
        $next = self::safeNext($r->query['next'] ?? null);
        $form = '<form method="post" action="login.php">'
            . ($next === '' ? '' : '<input type="hidden" name="next" value="' . Html::e($next) . '">')
            . '<label for="email">Email</label>'
            . '<input id="email" type="email" name="email" autocomplete="username" required>'
            . '<button type="submit" class="button">Email me a link</button></form>';
        return self::html(200, 'Sign in', $form);
    }

    /**
     * POST login.php. The reply is the same whether or not a link was issued, and
     * whether or not storage failed; the mail goes out in flush(), after the reply.
     */
    public function requestLink(Request $r): Response
    {
        $email = $r->post['email'] ?? '';
        try {
            $token = $this->auth->requestLink(
                is_string($email) ? $email : '',
                $r->ip,
                $this->auth->isTrustedDevice(Sessions::deviceToken($r)),
            );
            if ($token !== null) {
                $next = self::safeNext($r->post['next'] ?? null);
                $url = $this->baseUrl . 'verify.php?token=' . $token . ($next === '' ? '' : '&next=' . rawurlencode($next));
                $mail = MailTemplate::link($url, intdiv(Auth::LINK_TTL, 60));
                $this->queue[] = ['to' => Auth::ALLOWED, 'subject' => $mail['subject'], 'mime' => $mail['mime'], 'token' => $token];
            }
        } catch (\Throwable $e) {
            error_log('admin: link request failed: ' . get_class($e));
        }
        return self::html(200, 'Check your email', Html::p('If that address may sign in, a link is on its way. It works once, for fifteen minutes.'));
    }

    /** GET verify.php?token=: a button form; opening the link never spends it. */
    public function confirm(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $token = $r->query['token'] ?? '';
            if (!is_string($token) || $this->auth->peek($token) === null) {
                return self::html(403, 'Link not valid', Html::p('This link has expired or was already used. Request a new one.') . '<a class="button" href="login.php">Back to sign in</a>');
            }
            $mark = bin2hex(random_bytes(32));
            $next = self::safeNext($r->query['next'] ?? null);
            $form = Html::form('verify.php', ['token' => $token, 'csrf' => $mark] + ($next === '' ? [] : ['next' => $next]), 'Sign in');
            $cookie = self::CONFIRM_COOKIE . '=' . $mark . '; Max-Age=' . Auth::LINK_TTL . '; ' . Sessions::attributes($this->cookiePath);
            return self::html(200, 'Confirm sign-in', Html::p('Press the button to finish signing in.') . $form, [$cookie]);
        });
    }

    /** POST verify.php: the form's mark must match its cookie, then the link is spent, a session starts, a notice is queued. */
    public function signIn(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $mark = $r->cookies[self::CONFIRM_COOKIE] ?? null;
            $given = $r->post['csrf'] ?? null;
            if (!is_string($mark) || $mark === '' || !is_string($given) || !hash_equals($mark, $given)) {
                return self::html(403, 'Form expired', Html::p('This form expired. Open the link again.'), [$this->clearConfirm()]);
            }
            $token = $r->post['token'] ?? '';
            if (!is_string($token) || $this->auth->consume($token) === null) {
                return self::html(403, 'Link not valid', Html::p('This link has expired or was already used. Request a new one.') . '<a class="button" href="login.php">Back to sign in</a>', [$this->clearConfirm()]);
            }
            // A browser that already carries a session does not keep it alive beside the new one.
            $this->sessions->end($r);
            $cookies = [
                $this->sessions->start($r),
                Sessions::deviceCookie($this->auth->issueDevice(), $this->cookiePath),
                $this->clearConfirm(),
            ];
            $mail = MailTemplate::notice($this->clock->now(), $r->ip, $r->agent, $this->baseUrl . 'index.php');
            $this->queue[] = ['to' => Auth::ALLOWED, 'subject' => $mail['subject'], 'mime' => $mail['mime'], 'token' => null];
            return self::redirect(self::safeNext($r->post['next'] ?? null) ?: 'index.php', $cookies);
        });
    }

    /**
     * The page to return to after sign-in: a bare admin page name with an optional query string,
     * else ''. No path separators, scheme, backslash or control character can pass, so the value
     * can only ever point at a sibling page of the one that sent it.
     */
    public static function safeNext(mixed $next): string
    {
        if (!is_string($next) || strlen($next) > 300) {
            return '';
        }
        if (preg_match('/^(?!(?:login|verify|logout)\.php)[a-z]+\.php(?:\?[A-Za-z0-9_.~%=&,+\-\[\]:]*)?$/D', $next) !== 1) {
            return '';
        }
        return $next;
    }

    /** The sign-in redirect for a signed-out visit to $page, remembering the page and its query. */
    private static function toLogin(string $page, Request $r): Response
    {
        $back = $page . ($r->query === [] ? '' : '?' . http_build_query($r->query, '', '&', PHP_QUERY_RFC3986));
        $next = self::safeNext($back);
        return self::redirect('login.php' . ($next === '' ? '' : '?next=' . rawurlencode($next)));
    }

    /** POST logout.php: ends this session. */
    public function signOut(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $refused = $this->refuseSignOut($r);
            if ($refused !== null) {
                return $refused;
            }
            return self::redirect('login.php', [$this->sessions->end($r)]);
        });
    }

    /** POST logout.php?all=1: ends every session, every unused link and every trusted device. */
    public function signOutEverywhere(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $refused = $this->refuseSignOut($r);
            if ($refused !== null) {
                return $refused;
            }
            $cookie = $this->sessions->end($r);
            $this->sessions->endAll();
            $this->auth->forgetAll();
            $this->auth->forgetDevices();
            return self::redirect('login.php', [$cookie, Sessions::expireDeviceCookie($this->cookiePath)]);
        });
    }

    /** GET index.php. */
    public function hub(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $gate = $this->requireAdmin($r);
            if ($gate !== null) {
                return $gate;
            }
            $csrf = $this->sessions->csrf($r);
            if ($csrf === '') {
                return self::redirect('login.php');
            }
            $body = '';
            $dashboards = admin_dashboards();
            if ($dashboards !== []) {
                $body .= '<h2>Dashboards</h2><ul class="links">';
                foreach ($dashboards as $label => $href) {
                    $body .= '<li><a href="' . Html::e($href) . '">' . Html::e($label) . '</a></li>';
                }
                $body .= '</ul>';
            }
            $body .= '<h2>API keys</h2><ul class="links"><li><a href="keys.php">Manage API keys</a></li></ul>';
            $prints = admin_key_fingerprints();
            if ($prints !== []) {
                $body .= '<h2>Encryption keys</h2><dl class="prints">';
                foreach ($prints as $label => $print) {
                    $body .= '<dt>' . Html::e($label) . '</dt><dd><code>' . Html::e($print) . '</code></dd>';
                }
                $body .= '</dl>';
            }
            $body .= '<div class="actions">'
                . Html::form('logout.php', ['csrf' => $csrf], 'Sign out', 'button quiet')
                . Html::form('logout.php?all=1', ['csrf' => $csrf], 'Sign out everywhere', 'button danger')
                . '</div>';
            return self::html(200, 'Admin', $body);
        });
    }

    /** GET keys.php: the key list and the create form; ?label= and ?scopes=a,b only prefill the form, nothing is created. */
    public function keysPanel(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $gate = $this->requireAdmin($r, 'keys.php');
            return $gate ?? $this->keysPage(200, $r, null, null, true);
        });
    }

    /** POST keys.php: create or revoke a key. A new key is shown on this response only. */
    public function keysAction(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $gate = $this->requireAdmin($r);
            if ($gate !== null) {
                return $gate;
            }
            $given = $r->post['csrf'] ?? '';
            if (!is_string($given) || !$this->sessions->checkCsrf($r, $given)) {
                return self::html(403, 'Form expired', Html::p('This form expired. Open the page again.') . '<a class="button" href="keys.php">Back</a>');
            }
            if (($r->post['do'] ?? '') === 'revoke') {
                $id = $r->post['id'] ?? '';
                if (!is_string($id) || !ctype_digit($id) || !$this->keys->revoke((int) $id)) {
                    return $this->keysPage(404, $r, 'No active key has that id.');
                }
                return $this->keysPage(200, $r);
            }
            $label = $r->post['label'] ?? '';
            $scopes = $r->post['scopes'] ?? [];
            try {
                $key = $this->keys->create(is_string($label) ? $label : '', is_array($scopes) ? array_values($scopes) : []);
            } catch (\InvalidArgumentException $e) {
                return $this->keysPage(400, $r, $e->getMessage());
            }
            return $this->keysPage(200, $r, null, $key);
        });
    }

    /** GET health.php. Reports the database now and the mail server as last probed (see mailHealthy). */
    public function health(): Response
    {
        try {
            $this->db->query('SELECT 1')->fetchColumn();
        } catch (\Throwable $e) {
            return self::healthResponse(false, false);
        }
        $store = 'fallback';
        try {
            $file = (string) ($this->db->query('PRAGMA database_list')->fetch(\PDO::FETCH_ASSOC)['file'] ?? '');
            $store = Db::storeKind(dirname($file));
        } catch (\Throwable $e) {
        }
        return self::healthResponse(true, $this->mailHealthy(), $store);
    }

    /** The probe's body: yes or no for mail and db, and where the database lives (site or fallback); nothing else. */
    public static function healthResponse(bool $db, bool $mail, string $store = 'fallback'): Response
    {
        $store = $store === 'site' ? 'site' : 'fallback';
        return self::make(200, '{"mail":"' . ($mail ? 'yes' : 'no') . '","db":"' . ($db ? 'yes' : 'no') . '","store":"' . $store . '"}', ['Content-Type' => 'application/json']);
    }

    /** A redirect to login.php when there is no session, else null. */
    public function requireAdmin(Request $r, string $page = ''): ?Response
    {
        try {
            return $this->sessions->current($r) ? null : ($page === '' ? self::redirect('login.php') : self::toLogin($page, $r));
        } catch (\PDOException $e) {
            return self::fromStorageError($e);
        }
    }

    /** Gate for a machine endpoint: null when the bearer key holds the scope, else the JSON error. */
    public function requireKey(Request $r, string $scope): ?Response
    {
        try {
            return $this->keys->check($r, $scope);
        } catch (\PDOException $e) {
            return self::fromStorageError($e);
        }
    }

    /** Sends the queued mail. A link that cannot be sent is deleted so it cannot be used. */
    public function flush(): void
    {
        $queue = $this->queue;
        $this->queue = [];
        foreach ($queue as $m) {
            try {
                $this->mailer->send($m['to'], $m['subject'], $m['mime']);
            } catch (\Throwable $e) {
                error_log('admin: mail not sent: ' . get_class($e));
                if ($m['token'] !== null) {
                    try {
                        $this->auth->forget($m['token']);
                    } catch (\Throwable $f) {
                        error_log('admin: unsent link not removed: ' . get_class($f));
                    }
                }
            }
        }
    }

    /** The keys page; $newKey is shown once, at the top, $error explains a refused create. */
    private function keysPage(int $status, Request $r, ?string $error = null, ?string $newKey = null, bool $prefill = false): Response
    {
        $csrf = $this->sessions->csrf($r);
        if ($csrf === '') {
            return self::redirect('login.php');
        }
        $body = '';
        if ($error !== null) {
            $body .= Html::p($error, 'error');
        }
        $title = 'API keys';
        if ($newKey !== null) {
            $title = 'Your new key';
            $body .= '<div class="newkey"><button type="button" id="copykey" class="copykey"><code class="secret bigkey">' . Html::e($newKey) . '</code>'
                . '<span class="copyhint">Copy key</span></button>'
                . '<p id="copystatus" class="copystatus" role="status" aria-live="polite"></p>'
                . '<p>Copy this and paste it into the terminal where <code>make music-setup</code> is waiting. It is shown only this once.</p></div>';
        }
        $registry = $this->keys->registry();
        $label = $prefill && is_string($r->query['label'] ?? null) ? mb_substr(trim($r->query['label']), 0, Keys::LABEL_MAX) : '';
        $ticked = $prefill && is_string($r->query['scopes'] ?? null) ? array_map('trim', explode(',', $r->query['scopes'])) : [];
        if ($registry === []) {
            $body .= '<h2>Create a key</h2>' . Html::p('No scopes are defined yet, so no key can be created.');
        } else {
            $form = '<form method="post" action="keys.php"><input type="hidden" name="do" value="create">'
                . '<input type="hidden" name="csrf" value="' . Html::e($csrf) . '">'
                . '<label for="label">Label</label><input id="label" type="text" name="label" maxlength="' . Keys::LABEL_MAX . '" value="' . Html::e($label) . '" required>'
                . '<fieldset><legend>Scopes</legend>';
            foreach ($registry as $scope) {
                $form .= '<label class="check"><input type="checkbox" name="scopes[]" value="' . Html::e($scope) . '"' . (in_array($scope, $ticked, true) ? ' checked' : '') . '> ' . Html::e($scope) . '</label>';
            }
            $form .= '</fieldset><button type="submit" class="button primary">Create key</button></form>';
            if ($newKey !== null) {
                $body .= '<h2>Create another key</h2>' . $form;
            } elseif ($label !== '') {
                $body = '<div class="callout"><p class="lead">Make the <strong>' . Html::e($label) . '</strong> key: press <strong>Create key</strong>.</p>' . $form . '</div>' . $body;
            } else {
                $body .= '<h2>Create a key</h2>' . $form;
            }
        }
        $active = '';
        $revoked = '';
        $nActive = 0;
        $nRevoked = 0;
        foreach ($this->keys->list() as $k) {
            $card = '<div class="key"><strong>' . Html::e($k['label']) . '</strong><dl class="prints">'
                . '<dt>Scopes</dt><dd>' . Html::e(implode(', ', $k['scopes'])) . '</dd>'
                . '<dt>Created</dt><dd>' . self::when($k['created_at']) . '</dd>'
                . '<dt>Last used</dt><dd>' . ($k['last_used_at'] === null ? 'never' : self::when($k['last_used_at'])) . '</dd>';
            if ($k['revoked_at'] === null) {
                $card .= '</dl><form method="post" action="keys.php"><input type="hidden" name="do" value="revoke">'
                    . '<input type="hidden" name="id" value="' . $k['id'] . '">'
                    . '<input type="hidden" name="csrf" value="' . Html::e($csrf) . '">'
                    . '<button type="submit" class="button danger">Revoke</button></form></div>';
                $active .= $card;
                $nActive++;
            } else {
                $card .= '<dt>Revoked</dt><dd>' . self::when($k['revoked_at']) . '</dd></dl></div>';
                $revoked .= $card;
                $nRevoked++;
            }
        }
        $body .= '<h2>Existing keys</h2>' . ($nActive === 0 ? Html::p('No active keys.') : $active);
        if ($nRevoked > 0) {
            $body .= '<details class="revoked"><summary>Revoked keys (' . $nRevoked . ')</summary>' . $revoked . '</details>';
        }
        $body .= '<p><a href="index.php">Back to the hub</a></p>';
        return self::html($status, $title, $body, [], $newKey !== null);
    }

    private static function when(int $t): string
    {
        return gmdate('Y-m-d H:i', $t) . ' UTC';
    }

    /** The refusal for a sign-out request, or null when it may proceed. */
    private function refuseSignOut(Request $r): ?Response
    {
        if (!$this->sessions->current($r)) {
            return self::redirect('login.php');
        }
        $given = $r->post['csrf'] ?? '';
        if (!is_string($given) || !$this->sessions->checkCsrf($r, $given)) {
            return self::html(403, 'Form expired', Html::p('This form expired. Open the page again.') . '<a class="button" href="index.php">Back</a>');
        }
        return null;
    }

    /** @param callable():Response $run */
    private function guard(callable $run): Response
    {
        try {
            return $run();
        } catch (\PDOException $e) {
            return self::fromStorageError($e);
        }
    }

    /** @param list<string> $cookies */
    private static function html(int $status, string $title, string $body, array $cookies = [], bool $script = false): Response
    {
        return self::make($status, Html::page($title, $body, $script), ['Content-Type' => 'text/html; charset=utf-8'], $cookies);
    }

    /** @param list<string> $cookies */
    private static function redirect(string $to, array $cookies = []): Response
    {
        return self::make(303, '', ['Location' => $to], $cookies);
    }

    /**
     * @param array<string,string> $headers
     * @param list<string> $cookies
     */
    private static function make(int $status, string $body, array $headers, array $cookies = []): Response
    {
        return new Response($status, Headers::apply($headers), $body, $cookies);
    }

    /**
     * The SMTP server's last probe result, probed again at most once per PROBE_EVERY seconds across
     * all requests. The first request past that age claims the slot inside an immediate transaction
     * and probes after releasing it; the others read the earlier result without waiting.
     */
    private function mailHealthy(): bool
    {
        try {
            $now = $this->clock->now();
            // A fresh result is read without taking the write lock.
            $row = $this->db->query("SELECT ok, at FROM probes WHERE name = 'mail'")->fetch(\PDO::FETCH_ASSOC);
            if (is_array($row) && $now - (int) $row['at'] < self::PROBE_EVERY) {
                return (int) $row['ok'] === 1;
            }
            $this->db->exec('BEGIN IMMEDIATE');
            try {
                // Read again under the lock: another request may have claimed the slot meanwhile.
                $row = $this->db->query("SELECT ok, at FROM probes WHERE name = 'mail'")->fetch(\PDO::FETCH_ASSOC);
                $fresh = is_array($row) && $now - (int) $row['at'] < self::PROBE_EVERY;
                if (!$fresh) {
                    $this->db->prepare("INSERT OR REPLACE INTO probes (name, ok, at) VALUES ('mail', ?, ?)")
                        ->execute([is_array($row) ? (int) $row['ok'] : 0, $now]);
                }
                $this->db->exec('COMMIT');
            } catch (\Throwable $e) {
                if ($this->db->inTransaction()) {
                    $this->db->exec('ROLLBACK');
                }
                throw $e;
            }
            if ($fresh) {
                return (int) $row['ok'] === 1;
            }
            $ok = (bool) ($this->mailProbe)();
            $this->db->prepare("UPDATE probes SET ok = ? WHERE name = 'mail'")->execute([$ok ? 1 : 0]);
            return $ok;
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function clearConfirm(): string
    {
        return self::CONFIRM_COOKIE . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . Sessions::attributes($this->cookiePath);
    }

    private static function smtpGreets(): bool
    {
        $fp = @stream_socket_client('ssl://smtp.siue.edu:465', $errno, $errstr, 5);
        if ($fp === false) {
            return false;
        }
        stream_set_timeout($fp, 5);
        $greeting = fgets($fp, 512);
        @fwrite($fp, "QUIT\r\n");
        fclose($fp);
        return is_string($greeting) && str_starts_with($greeting, '220');
    }
}
