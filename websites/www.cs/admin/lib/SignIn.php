<?php
// The email sign-in flow for one realm: the address form, the link request, the link's confirm page and
// sign-in, sign-out, and the mail sent after the reply. Every response carries the required headers.
declare(strict_types=1);

namespace Admin;

final class SignIn
{
    private Auth $auth;
    private Sessions $sessions;
    /** @var list<array{to:string,subject:string,mime:string,token:?string}> */
    private array $queue = [];

    /**
     * @param \Closure(string): (int|false|null)|null $onSignedIn runs with the address once its link is spent: an
     *        account id, false when the studio is full (no session starts), or null in the admin realm (no account).
     *        The studio realm requires it, and a null from it there is a refusal like false.
     */
    public function __construct(
        private \PDO $db,
        private Clock $clock,
        private Mailer $mailer,
        private Realm $realm,
        private ?\Closure $onSignedIn = null,
    ) {
        if ($realm->name === 'studio' && $onSignedIn === null) {
            throw new \InvalidArgumentException('the studio realm needs an onSignedIn step to find the account');
        }
        $this->auth = new Auth($db, $clock, $realm);
        $this->sessions = new Sessions($db, $clock, $realm);
    }

    /** GET login.php. */
    public function loginForm(Request $r): Response
    {
        $next = self::safeNext($r->query['next'] ?? null, $this->realm->name);
        $form = '<form method="post" action="login.php">'
            . ($next === '' ? '' : '<input type="hidden" name="next" value="' . Html::e($next) . '">')
            . '<label for="email">Email</label>'
            . '<input id="email" type="email" name="email" autocomplete="username" required>'
            . '<button type="submit" class="button">Email me a link</button></form>';
        return $this->html(200, 'Sign in', $form);
    }

    /**
     * POST login.php. The reply is the same whether or not a link was issued, and
     * whether or not storage failed (the pending cookie included); the mail goes out in flush(), after the reply.
     */
    public function requestLink(Request $r): Response
    {
        $email = $r->post['email'] ?? '';
        $email = is_string($email) ? $email : '';
        $mark = bin2hex(random_bytes(32));
        // Lax, not Strict: the mail app's click is a cross-site navigation, and the cookie must ride along.
        $pending = $this->cookie('-pending') . '=' . $mark . '; Max-Age=' . Auth::LINK_TTL . '; ' . Sessions::attributes($this->realm->cookiePath, 'Lax');
        try {
            $device = Sessions::deviceToken($r, $this->realm->cookie);
            $trusted = $this->realm->name === 'studio'
                ? $this->auth->isTrustedDevice($device, $this->auth->accountOf($email))
                : $this->auth->isTrustedDevice($device);
            $token = $this->auth->requestLink($email, $r->ip, $trusted, hash('sha256', $mark));
            $to = Address::normalize($email);
            if ($token !== null && $to !== null) {
                $next = self::safeNext($r->post['next'] ?? null, $this->realm->name);
                $url = $this->realm->baseUrl . 'verify.php?token=' . $token . ($next === '' ? '' : '&next=' . rawurlencode($next));
                $mail = MailTemplate::link($url, intdiv(Auth::LINK_TTL, 60));
                $this->queue[] = ['to' => $to, 'subject' => $mail['subject'], 'mime' => $mail['mime'], 'token' => $token];
            }
        } catch (\Throwable $e) {
            error_log('admin: link request failed: ' . get_class($e));
        }
        return $this->html(200, 'Check your email', Html::p('If that address may sign in, a link is on its way. It works once, for fifteen minutes.'), [$pending]);
    }

    /**
     * GET verify.php?token=: in the browser that asked for the link, signs in; anywhere else a button
     * form, and opening the link there never spends it (mail scanners fetch every link).
     */
    public function confirm(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $token = $r->query['token'] ?? '';
            if (!is_string($token) || $this->auth->peek($token) === null) {
                return $this->html(403, 'Link not valid', Html::p('This link has expired or was already used. Request a new one.') . '<a class="button" href="login.php">Back to sign in</a>');
            }
            $pending = $r->cookies[$this->cookie('-pending')] ?? null;
            $email = is_string($pending) && $this->auth->peekFor($token, $pending) ? $this->auth->consume($token) : null;
            if ($email !== null) {
                $cookies = $this->startSession($r, $email, [$this->clearPending()]);
                if ($cookies === null) {
                    return $this->full([$this->clearPending(), $this->clearConfirm()]);
                }
                // A page, not a redirect: the session cookie is SameSite=Strict, and a browser drops it on
                // a navigation whose redirect chain began on another site (the mail client). The page's own
                // refresh is a same-origin navigation. A meta refresh is not script, so the CSP allows it.
                $next = self::safeNext($r->query['next'] ?? null, $this->realm->name) ?: 'index.php';
                $to = Html::e($next);
                return $this->html(
                    200,
                    'Signed in',
                    Html::p('You are signed in.') . '<a class="button" href="' . $to . '">Continue</a>',
                    $cookies,
                    '<meta http-equiv="refresh" content="0;url=' . $to . '">',
                );
            }
            $mark = bin2hex(random_bytes(32));
            $next = self::safeNext($r->query['next'] ?? null, $this->realm->name);
            $form = Html::form('verify.php', ['token' => $token, 'csrf' => $mark] + ($next === '' ? [] : ['next' => $next]), 'Sign in');
            $cookie = $this->cookie('-confirm') . '=' . $mark . '; Max-Age=' . Auth::LINK_TTL . '; ' . Sessions::attributes($this->realm->cookiePath);
            return $this->html(200, 'Confirm sign-in', Html::p('Press the button to finish signing in.') . $form, [$cookie]);
        });
    }

    /** POST verify.php: the form's mark must match its cookie, then the link is spent, a session starts, a notice is queued. */
    public function signIn(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $mark = $r->cookies[$this->cookie('-confirm')] ?? null;
            $given = $r->post['csrf'] ?? null;
            if (!is_string($mark) || $mark === '' || !is_string($given) || !hash_equals($mark, $given)) {
                return $this->html(403, 'Form expired', Html::p('This form expired. Open the link again.'), [$this->clearConfirm()]);
            }
            $token = $r->post['token'] ?? '';
            $email = is_string($token) ? $this->auth->consume($token) : null;
            if ($email === null) {
                return $this->html(403, 'Link not valid', Html::p('This link has expired or was already used. Request a new one.') . '<a class="button" href="login.php">Back to sign in</a>', [$this->clearConfirm()]);
            }
            $cookies = $this->startSession($r, $email);
            if ($cookies === null) {
                return $this->full([$this->clearConfirm()]);
            }
            return self::redirect(self::safeNext($r->post['next'] ?? null, $this->realm->name) ?: 'index.php', $cookies);
        });
    }

    /**
     * The steps both sign-in paths share once $email's link is spent: find its account (null when the studio
     * is full: no session), end the session the browser already had, start a new one with a trusted-device
     * cookie, clear the one-shot cookies, queue the notice to $email. Returns the Set-Cookie values.
     *
     * @param list<string> $more cookies to set alongside
     * @return list<string>|null
     */
    private function startSession(Request $r, string $email, array $more = []): ?array
    {
        $account = $this->onSignedIn === null ? null : ($this->onSignedIn)($email);
        if ($account === false || ($account === null && $this->realm->name === 'studio')) {
            return null;
        }
        // A browser that already carries a session does not keep it alive beside the new one.
        $this->sessions->end($r);
        $cookies = [
            $this->sessions->start($r, $account),
            Sessions::deviceCookie($this->auth->issueDevice($account), $this->realm->cookiePath, $this->realm->cookie),
            $this->clearConfirm(),
            ...$more,
        ];
        $mail = MailTemplate::notice($this->clock->now(), $r->ip, $r->agent, $this->realm->baseUrl . 'index.php', $this->realm->name === 'studio');
        $this->queue[] = ['to' => $email, 'subject' => $mail['subject'], 'mime' => $mail['mime'], 'token' => null];
        return $cookies;
    }

    /**
     * The page to return to after sign-in, else '': one of the realm's own pages with an optional query
     * string (admin: index.php or keys.php; studio: index.php, studio.php or piece.php). Nothing else can
     * pass: no scheme, host, backslash, control character, fragment or path separator, so the value can
     * only ever point at one of those pages in the realm's own folder.
     */
    public static function safeNext(mixed $next, string $realm = 'admin'): string
    {
        if (!is_string($next) || strlen($next) > 300) {
            return '';
        }
        $pages = $realm === 'studio' ? 'index|studio|piece' : 'index|keys';
        $query = '[A-Za-z0-9_.~%=&,+\-\[\]:]';
        return preg_match("/^(?:$pages)\\.php(?:\\?$query*)?$/D", $next) === 1 ? $next : '';
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

    /**
     * POST logout.php?all=1: ends every session, every unused link and every trusted device; in the studio,
     * only those of this session's account.
     */
    public function signOutEverywhere(Request $r): Response
    {
        return $this->guard(function () use ($r): Response {
            $refused = $this->refuseSignOut($r);
            if ($refused !== null) {
                return $refused;
            }
            $account = $this->realm->name === 'studio' ? $this->sessions->account($r) : null;
            if ($this->realm->name === 'studio' && $account === null) {
                return self::redirect('login.php');
            }
            $cookie = $this->sessions->end($r);
            $this->sessions->endAll($account);
            $this->auth->forgetAll($account);
            $this->auth->forgetDevices($account);
            return self::redirect('login.php', [$cookie, Sessions::expireDeviceCookie($this->realm->cookiePath, $this->realm->cookie)]);
        });
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

    /** The refusal for a sign-out request, or null when it may proceed. */
    private function refuseSignOut(Request $r): ?Response
    {
        if (!$this->sessions->current($r)) {
            return self::redirect('login.php');
        }
        $given = $r->post['csrf'] ?? '';
        if (!is_string($given) || !$this->sessions->checkCsrf($r, $given)) {
            return $this->html(403, 'Form expired', Html::p('This form expired. Open the page again.') . '<a class="button" href="index.php">Back</a>');
        }
        return null;
    }

    /**
     * The answer when the link was spent but the studio has no room for a new account: no session starts.
     *
     * @param list<string> $cookies
     */
    private function full(array $cookies): Response
    {
        return $this->html(200, 'The studio is full', Html::p('The studio has no room for new people right now. Ask Will Grim, who runs it.'), $cookies);
    }

    /** The realm's cookie name with $suffix ('', '-device', '-pending' or '-confirm'). */
    private function cookie(string $suffix): string
    {
        return $this->realm->cookie . $suffix;
    }

    private function clearConfirm(): string
    {
        return $this->cookie('-confirm') . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . Sessions::attributes($this->realm->cookiePath);
    }

    private function clearPending(): string
    {
        return $this->cookie('-pending') . '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ' . Sessions::attributes($this->realm->cookiePath, 'Lax');
    }

    /** @param callable():Response $run */
    private function guard(callable $run): Response
    {
        try {
            return $run();
        } catch (\PDOException $e) {
            return Pages::fromStorageError($e);
        }
    }

    /** @param list<string> $cookies */
    private function html(int $status, string $title, string $body, array $cookies = [], string $head = ''): Response
    {
        return new Response($status, Headers::apply(['Content-Type' => 'text/html; charset=utf-8']), Html::page($title, $body, false, $head, $this->realm->stylesheet), $cookies);
    }

    /** @param list<string> $cookies */
    private static function redirect(string $to, array $cookies = []): Response
    {
        return new Response(303, Headers::apply(['Location' => $to]), '', $cookies);
    }
}
