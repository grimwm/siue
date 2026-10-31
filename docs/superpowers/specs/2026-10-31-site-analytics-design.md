# Site analytics

Self-hosted visitor counts for the games and the faculty page, read only by the
owner on the admin hub. Decisions marked **(agent)** are the implementing
agent's calls on the owner's behalf; everything else is the owner's.

## Collection

- First party only: no third-party service, no cookies.
- One shared beacon, `games/_kit/stats.ts`, built per game as `dist/stats.js`
  (like `dist/install.js`). It posts JSON to `stats/collect.php` on the same
  site with `navigator.sendBeacon`, else `fetch(..., {keepalive: true})`.
- **(agent)** Where it runs: the faculty page (`index.html`, loading
  `games/cylon/dist/stats.js`, page `home`, or the game named by `?game=`),
  every `play/<id>/` page, and every game's own page. A game page framed by a
  page that already runs the beacon hands its events to the parent and sends
  nothing itself; opened on its own (an installed app, a direct link) it is
  the beacon. So a visit is counted once wherever it lands.
- **(agent)** The play page loads the beacon as a plain blocking script in
  `<head>` (it is small), so the framed game always finds it.
- Daily unique visitors: SHA-256 of a salt, the IP, the user agent, the site
  and the date. The salt is 32 random bytes made on the server for each day
  and deleted when the day ends; raw IPs and user agents are never stored.
- Repeat visitors: a random 128-bit visitor ID in the visitor's localStorage
  (`wgrim-stats`), no PII. Blocked storage falls back to the daily hash.
- **(agent)** Visits: a visit ID in the same localStorage entry, renewed
  after 30 minutes without activity (a fresh one per page load when storage is
  blocked).
- Opt-out: with Do Not Track or Global Privacy Control set, the beacon sends
  nothing; the server also drops requests carrying `DNT: 1` or `Sec-GPC: 1`.
- Bots: the beacon stays silent under `navigator.webdriver`; the server drops
  user agents matching a bot pattern (bot, crawler, spider, headless, preview
  fetchers, HTTP libraries).
- Limits: request body at most 2 KB; **(agent)** 600 writes a minute per
  client (by hashed IP) and 6000 a minute overall; over the limit is dropped.
- The endpoint takes POST only, always answers 204 with no body (405 for
  other methods), and refuses a cross-site Origin or `Sec-Fetch-Site`.

## Data

- **(agent)** SQLite in the admin data folder (`Admin\Db::dataDir()`), as its
  own file `stats.sqlite`, opened the way `Admin\Db` opens `admin.sqlite`
  (private modes, WAL), so ingest never contends with sign-ins.
- Raw rows (`hits`) are kept 95 days **(agent: about 90, plus margin so a
  90-day range is always whole)**; daily aggregates (`daily`, `cohorts`) are
  kept forever. A cleanup inside requests, at most once an hour, rolls up
  finished days, finalizes retention cohorts and prunes old rows and salts.
- **(agent)** Days and hours are counted in America/Chicago.
- **(agent)** `visitors` keeps each visitor ID's first and last day per page
  for new-versus-returning; an ID not seen for 400 days is pruned.

## Metrics (per page, and across all)

Page views, visits, unique visitors (range, and DAU/WAU/MAU per day), new
versus returning, day-1 and day-7 return, time on page, referrer source,
device class, and a weekday-by-hour heatmap.

- Time on page: visible seconds, sent every 30 s while visible and once more
  when the page is hidden; the largest value for a page view counts, capped at
  4 hours.
- **(agent)** Referrer buckets: Facebook, Discord, search, this site, direct,
  other. Only the referring host leaves the browser; only the bucket is stored.
- **(agent)** Device: phone, tablet or desktop, from the user agent plus the
  touch points and the screen's short side.
- **(agent)** Unique visitors (per day, DAU/WAU/MAU, per range) count the
  visitor ID where the browser keeps one and the daily hash where it does not,
  so DAU ≤ WAU ≤ MAU always holds.
- **(agent)** Day-1 return: new visitors of a day who came back the next day.
  Day-7 return: those who came back within the following 7 days. A visitor
  without an ID cannot be recognised again: it counts as new and is left out
  of the return rates.
- **(agent)** Returning share (the KPI): visitors in the range seen on a later
  day than their first.
- **(agent)** Crete names levels `<chapter>-<level>` (`1-3`), so the funnel
  sorts in campaign order.

## Game events

`track(name, props)` from `games/_kit/stats.ts`. The server keeps a fixed
allowlist per page, each event with at most one validated property:

| Page | Events |
| --- | --- |
| crete | `game_start {mode: new\|continue}`, `level_start {level}`, `level_win {level}`, `hint`, `route`, `auto` |
| tankity | `room_host`, `match_start {mode: solo\|room}`, `match_end {mode}` |
| cylon | `game_start`, `score_submit` |
| every game | `share`, `install` (from the kit's install bar) |

## Dashboard

- `admin/stats.php`, behind the hub's sign-in, listed on the hub. Visitors
  never see stats: no public counter, and no endpoint but the admin page
  returns any.
- Overview and one page per game (`?page=`), ranges 7, 30 (default) and 90
  days, visual first and numbers second:
  - KPI row: unique visitors, visits, average DAU and returning share, each
    with a sparkline and its change versus the previous period of the same
    length.
  - Daily visitors per page (lines, with a page toggle); new versus returning
    as stacked daily columns.
  - Per page: the Crete level funnel (horizontal bars of players starting and
    winning each level), day-1 and day-7 return, referrer and device bars,
    time on page, events, and a weekday-by-hour heatmap.
- **(agent)** Drawn as inline SVG by a same-origin `stats.js` from a JSON
  block in the page (the admin CSP allows no inline script or style). Hover
  and tap tooltips; each chart has a table of its numbers beneath it.
- The dataviz reference palette in light and dark, following the system
  theme.

## Privacy note

**(agent)** `privacy.html` at the site root, linked from the faculty page's
footer and the Games panel: what is counted, what is not, how long it is kept,
and that Do Not Track or Global Privacy Control turns it off. It shows no data.
