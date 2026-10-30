<?php
// The admin pages' controllers: the hub, keys and the health probe, with the sign-in flow (SignIn) in the
// admin realm, which admits named admins only. Every response is returned with the required headers already applied.
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

    /** Names the browser that asked for a link: the link signs in only where this mark is sent back. */
    public const PENDING_COOKIE = '__Secure-admin-pending';

    /** Seconds between live SMTP probes. */
    public const PROBE_EVERY = 600;

    private SignIn $signIn;
    private Sessions $sessions;
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
        $realm = Realm::admin(admin_people(), $baseUrl);
        $this->signIn = new SignIn($db, $clock, $mailer, $realm);
        $this->sessions = new Sessions($db, $clock, $realm);
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
        return $this->signIn->loginForm($r);
    }

    /** POST login.php: the same reply whoever asks; a link goes only to a named admin, in flush(). */
    public function requestLink(Request $r): Response
    {
        return $this->signIn->requestLink($r);
    }

    /** GET verify.php?token=. */
    public function confirm(Request $r): Response
    {
        return $this->signIn->confirm($r);
    }

    /** POST verify.php. */
    public function signIn(Request $r): Response
    {
        return $this->signIn->signIn($r);
    }

    /** The admin page to return to after sign-in, else '' (SignIn::safeNext): index.php or keys.php with an optional query. */
    public static function safeNext(mixed $next): string
    {
        return SignIn::safeNext($next, 'admin');
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
        return $this->signIn->signOut($r);
    }

    /** POST logout.php?all=1: ends every admin session, every unused admin link and every admin trusted device. */
    public function signOutEverywhere(Request $r): Response
    {
        return $this->signIn->signOutEverywhere($r);
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
            if (($r->query['removed'] ?? '') === '1') {
                $body .= Html::p('The key was removed.');
            }
            $dashboards = admin_dashboards();
            if ($dashboards !== []) {
                $body .= '<h2>Dashboards</h2><ul class="links">';
                foreach ($dashboards as $label => $href) {
                    $body .= '<li><a href="' . Html::e($href) . '">' . Html::e($label) . '</a></li>';
                }
                $body .= '</ul>';
            }
            $body .= '<h2>API keys</h2><ul class="links"><li><a href="keys.php">Manage API keys</a></li></ul>';
            $prints = admin_key_fingerprints($this->db);
            if ($prints !== []) {
                $body .= '<h2>Encryption keys</h2><dl class="prints">';
                foreach ($prints as $label => $print) {
                    $body .= '<dt>' . Html::e($label) . '</dt><dd><code>' . Html::e($print) . '</code></dd>';
                }
                $body .= '</dl>';
                foreach (admin_key_removers($this->db) as $label => $remover) {
                    $body .= '<details class="remover"><summary>' . Html::e($remover['summary']) . '</summary>';
                    foreach ($remover['explain'] as $line) {
                        $body .= Html::p($line);
                    }
                    $body .= Html::form('index.php', ['csrf' => $csrf, 'do' => 'remove-key', 'label' => $label], $remover['button'], 'button quiet') . '</details>';
                }
            }
            $body .= '<div class="actions">'
                . Html::form('logout.php', ['csrf' => $csrf], 'Sign out', 'button quiet')
                . Html::form('logout.php?all=1', ['csrf' => $csrf], 'Sign out everywhere', 'button danger')
                . '</div>';
            return self::html(200, 'Admin', $body);
        });
    }

    /** POST index.php: remove a key the hub lists, then back to the hub. */
    public function removeKey(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $refused = $this->refuseSignOut($r);
            if ($refused !== null) {
                return $refused;
            }
            $label = $r->post['label'] ?? '';
            $remover = is_string($label) ? (admin_key_removers($this->db)[$label] ?? null) : null;
            if (($r->post['do'] ?? '') !== 'remove-key' || $remover === null) {
                return self::html(404, 'Not found', Html::p('That key is not stored.') . '<a class="button" href="index.php">Back</a>');
            }
            if (!$remover['remove']($this->db)) {
                return self::html(404, 'Not found', Html::p('That key is not stored.') . '<a class="button" href="index.php">Back</a>');
            }
            return self::redirect('index.php?removed=1');
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
                $made = $this->keys->createReplacing(is_string($label) ? $label : '', is_array($scopes) ? array_values($scopes) : []);
            } catch (\InvalidArgumentException $e) {
                return $this->keysPage(400, $r, $e->getMessage());
            }
            return $this->keysPage(200, $r, null, $made['key'], false, $made['replaced'], trim(is_string($label) ? $label : ''), $made['id']);
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

    /** Sends the queued mail (SignIn::flush). */
    public function flush(): void
    {
        $this->signIn->flush();
    }

    /** The keys page; $newKey is shown once, at the top, with $newId its row in the list; $error explains a refused create. */
    private function keysPage(int $status, Request $r, ?string $error = null, ?string $newKey = null, bool $prefill = false, int $replaced = 0, string $madeLabel = '', ?int $newId = null): Response
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
                . ($replaced > 0 ? Html::p('Replaced ' . $replaced . ' older ' . $madeLabel . ' ' . ($replaced === 1 ? 'key' : 'keys') . '.', 'replaced') : '')
                . '<p>Copy this and paste it into the terminal where <code>make music-setup</code> is waiting. It is shown only this once.</p></div>';
        }
        $registry = $this->keys->registry();
        $all = $this->keys->list();
        $replacing = [];
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
            if ($newKey === null && in_array($label, Keys::GUIDED_LABELS, true)) {
                $replacing = array_values(array_filter($all, static fn(array $k): bool => $k['label'] === $label && $k['revoked_at'] === null));
            }
            if ($newKey !== null) {
                $body .= '<details class="another"><summary>Create another key</summary>' . $form . '</details>';
            } elseif (in_array($label, Keys::GUIDED_LABELS, true)) {
                $note = $replacing === [] ? '' : Html::p('This replaces your current ' . $label . ' key (created ' . self::when(max(array_column($replacing, 'created_at'))) . '); the old one stops working.', 'replaces');
                $body = '<div class="callout"><p class="lead">Make the <strong>' . Html::e($label) . '</strong> key: press <strong>Create key</strong>.</p>' . $note . $form . '</div>' . $body;
            } else {
                $body .= '<h2>Create a key</h2>' . $form;
            }
        }
        $replacingIds = array_column($replacing, 'id');
        $active = '';
        $revoked = '';
        $nActive = 0;
        $nRevoked = 0;
        usort($all, static fn(array $a, array $b): int => [$b['created_at'], $b['id']] <=> [$a['created_at'], $a['id']]);
        foreach ($all as $k) {
            $isNew = $newId !== null && $k['id'] === $newId;
            $willReplace = $k['revoked_at'] === null && in_array($k['id'], $replacingIds, true);
            $card = '<div class="key' . ($isNew ? ' isnew' : '') . '"><strong>' . Html::e($k['label']) . '</strong>'
                . ($isNew ? ' <span class="tag">New: the key shown above</span>' : '')
                . ($willReplace ? ' <span class="tag">Will be replaced</span>' : '')
                . '<p class="lastused">Last used: <strong>' . ($k['last_used_at'] === null ? 'never' : self::when($k['last_used_at'])) . '</strong></p><dl class="prints">'
                . '<dt>Scopes</dt><dd>' . Html::e(implode(', ', $k['scopes'])) . '</dd>'
                . '<dt>Created</dt><dd>' . self::when($k['created_at']) . '</dd>';
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
