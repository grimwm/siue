# Site analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First-party visitor analytics for the games and the faculty page, shown only on the admin hub.

**Architecture:** A kit beacon (`games/_kit/stats.ts`, built as each game's `dist/stats.js`) posts to `stats/collect.php`; `stats/lib/` validates, stores raw rows in `stats.sqlite` in the admin data folder, rolls finished days into aggregates and prunes inside requests; `admin/stats.php` reads them and `admin/stats.js` draws SVG charts.

**Tech Stack:** PHP 8.4 + SQLite (PDO), TypeScript via the games kit (esbuild), PHPUnit, node:test, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-31-site-analytics-design.md`

## Global Constraints

- No cookies, no third parties, no raw IP or user agent stored; the daily salt lives only in `stats.sqlite` and only for its day.
- `stats/collect.php` answers 204 with an empty body to every POST, 405 otherwise; it never returns data.
- Body ≤ 2048 bytes; 600 writes/min per hashed IP, 6000/min overall.
- Raw rows kept 95 days; `daily` and `cohorts` forever; cleanup at most hourly, inside requests.
- Days in America/Chicago.
- Admin pages: CSP `script-src 'self'; style-src 'self'` — no inline script or style.

## Review Focus

- Garbage payloads (wrong types, unknown page or event, oversize prop) → 204, nothing stored. (`StatsCollectorTest::testRejects*`)
- A framed game must not double-count the play page's view. (`games/_kit/test/stats.test.ts` "framed delegates")
- Storage blocked (`localStorage` throws) → beacon still sends, without a visitor ID. (same file)
- Cleanup racing two requests → one rollup per day. (`StatsRollupTest::testRollupIsIdempotent`)
- Signed-out request to `admin/stats.php` → redirect to login, no numbers in the body. (`StatsDashboardTest`, e2e)

---

### Task 1: Store, classify, collect (PHP)

**Files:** Create `stats/lib/{bootstrap,Db,Classify,Collector}.php`, `stats/collect.php`, `stats/.htaccess`, `stats/lib/.htaccess`; Test `tests/php/StatsCollectorTest.php`, `tests/php/StatsClassifyTest.php`.

**Interfaces — Produces:**
- `Stats\Db::open(string $dir): \PDO` (tables `hits`, `visitors`, `salts`, `rate`, `daily`, `cohorts`, `meta`).
- `Stats\Classify::{referrer(string $host, string $self): string, device(string $ua, int $touch, int $short): string, isBot(string $ua): bool}`.
- `Stats\Collector::__construct(\PDO, Admin\Clock, ?callable $pages = null)`; `handle(string $method, array $headers, string $body, string $ip, string $ua): int` returning the status.
- `Stats\Collector::EVENTS` — page ⇒ event ⇒ prop rule.

- [ ] Tests first: a view stores one `hits` row with `day`, `hour`, `dhash`, `vid`, `ref`, `device` and no IP/UA anywhere in the database; DNT/GPC header, bot UA, cross-site origin, oversize body, unknown page/event, bad prop → 204 and no row; GET → 405; the 601st write in a minute is dropped; a time ping raises `secs` to the max seen, capped at 14400; the salt row for yesterday is gone after today's first write.
- [ ] Implement; run `podman run --rm -v "$PWD":/app -w /app php:8.4-cli vendor/bin/phpunit --testsuite site --filter Stats`; commit.

### Task 2: Rollup, cleanup and report (PHP)

**Files:** Create `stats/lib/{Rollup,Report}.php`; Test `tests/php/StatsRollupTest.php`, `tests/php/StatsReportTest.php`.

**Interfaces — Produces:**
- `Stats\Rollup::maybeRun(\PDO, int $now): void` (hourly gate in `meta`), `Rollup::day(\PDO, string $day): array<string, array<string, float>>`.
- `Stats\Report::build(\PDO, int $now, string $page, int $days): array` — `{range, pages, kpis{uniques,visits,dau,returning}{value,prev,spark}, series{date[], views{page:[]}, visitors{page:[]}, new[], returning[], dau[], wau[], mau[]}, referrers{}, devices{}, time{median,mean}, retention{d1,d7,cohort}, events{}, funnel[{level,start,win}], heat[7][24]}`.
- [ ] Tests first: rollup of a seeded day equals `Rollup::day`; running twice changes nothing; rows older than 95 days are pruned, `daily` is not; D1/D7 for a seeded cohort; funnel distinct players per level; the report for 7 days compares against the 7 before.
- [ ] Implement; run the filter; commit.

### Task 3: Dashboard page

**Files:** Create `admin/stats.php`, `admin/stats.js`, `admin/stats.css`; Modify `admin/lib/bootstrap.php` (`admin_dashboards`), `admin/lib/SignIn.php` (`safeNext` allows `stats`), `admin/lib/Html.php` (light-and-dark option), `admin/README.md`; Test `tests/php/StatsDashboardTest.php`.
- [ ] Tests first: signed out → 303 to `login.php?next=stats.php`; signed in → 200 with the JSON block and every table; `?page=nope` → overview; `?days=` other than 7/30/90 → 30.
- [ ] Implement charts in `stats.js` (KPI tiles with sparklines, per-page lines with toggle, stacked new/returning, funnel bars, retention, referrer/device bars, heatmap, tooltips on pointer and focus). Commit.

### Task 4: Beacon and game events (TS)

**Files:** Create `games/_kit/stats.ts`, `games/_kit/stats-page.ts`, `games/_kit/test/stats.test.ts`; Modify each game's `build.json`, `index.html`, `tools/install-files.php` (`versioned`), `games/_kit/install.ts` (share, install), Crete/Tankity/Cylon call sites, `tools/site-game-pages.php`, `tools/site-versions.php`, `index.html`.

**Interfaces — Produces:** `track(page: string, name: string, props?: Record<string, string>): void`; `startStats(opts: {page, endpoint, views: boolean, win, doc, nav, storage, now, send})` returning the instance set as `window.__siteStats`.
- [ ] Tests first (node:test with fakes): DNT, GPC and webdriver send nothing; a view then a hidden ping with visible seconds; blocked storage sends no `vid`; a framed page with a parent instance sends nothing and forwards `track`; queued `track` calls before start are flushed.
- [ ] Implement, rebuild every game, run install-files, `site-game-pages.php`, `site-versions.php`; commit.

### Task 5: Deploy wiring, privacy note, e2e, docs

**Files:** Modify `deploy.sh` (ship `stats/*.php`, `stats/lib/*.php`, the `.htaccess` files), `docker/nginx/default.conf` (deny `/stats/lib/`), `tests/php/DeploySetTest.php`, `tests/php/HtaccessTest.php`; Create `privacy.html`, `tests/e2e/stats.local.ts`; Modify `Makefile` (`stats-e2e`), `docs/superpowers/roadmap.md`.
- [ ] e2e: visiting `play/crete/` records a view that a signed-in dashboard shows; with DNT no request reaches `collect.php`; signed out, `admin/stats.php` redirects and `stats.sqlite` is not served.
- [ ] Run `make test`-equivalent pieces and the e2e spec on an own compose project; commit; PR.
