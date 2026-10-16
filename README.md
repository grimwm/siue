# SIUE CS Page Materials

As an Instructor of Computer Science at Southern Illinois University Edwardsville, I maintain a collection of webpages and tools here. Each website lives under `websites/<host>/` with its own Makefile, which knows how that site deploys (`www.cs` goes to www.cs.siue.edu over scp and nowhere else), and its own `compose.yaml` and `docker/` for running it locally on the same stack its server has.

Open course materials may be placed here from time-to-time as well.

## What lives where

```
.
├── compose.yaml          # includes every site's compose.yaml (project name: siue)
├── Makefile              # make up | down | ps | urls | test | parity | deploy, for all sites
├── scripts/              # deploy-hash (content hasher), its test and the deploy login test
├── docs/superpowers/     # design specs and implementation plans
├── .github/              # workflows (ci.yml, deploy.yml) and the server's SSH host keys
└── websites/
    └── www.cs/           # www.cs.siue.edu/~wgrim
        ├── compose.yaml  # www-cs-php and www-cs-nginx
        ├── docker/       # PHP image, nginx config, and the checks that they match the server
        ├── Makefile      # up | down | url | test | e2e | parity | deploy | ...
        ├── deploy.sh     # what `make deploy` runs
        ├── index.html, main.js, site.css   # the home page, which hosts the Cylon game
        ├── .htaccess     # pages revalidate (Cache-Control: no-cache); nginx mirrors it locally
        ├── composer.json, phpunit.xml      # PHPUnit, dev only (vendor/ never deploys)
        ├── games.php     # the Games page's catalog endpoint
        ├── games/        # the games, one folder each
        ├── play/         # the site's generated page per game (navbar plus the game in a frame)
        ├── src/          # TypeScript for main.js and play/play.js
        ├── tools/        # generators and build for the site's own files
        └── tests/        # PHPUnit cases (tests/php/) and the Playwright browser suite (tests/e2e/)
```

**The www.cs site.** The home page hosts the Cylon Defense game (a scanner eye is its backdrop) and has Contact and Games panels. The Games page lists every game folder that has a valid `metadata.yaml`. `play/<id>/` is the site's page for a game: a navbar over the game running in a frame.

**Games** (`websites/www.cs/games/`). How the catalog, `metadata.yaml`, the generated `play/` pages and the install files work is in [games/README.md](websites/www.cs/games/README.md). Every game is built with the shared games kit (`games/_kit/`: type checks, bundling, install-file core, ports, prefs and test doubles), described in [games/_kit/README.md](websites/www.cs/games/_kit/README.md). Each game has its own README:

| Game | What it is | Docs |
| --- | --- | --- |
| Cylon Defense | The home-page mini-game; `scores.php` keeps a weekly board (reset Sunday 00:00 America/Chicago) and an all-time board | [games/cylon/README.md](websites/www.cs/games/cylon/README.md) |
| The Island of Crete | A turn-based chase on a seeded maze, played on its own page | [games/crete/README.md](websites/www.cs/games/crete/README.md) |
| Operation Tankity | Scorched-earth artillery, solo or in network rooms | [games/tankity/README.md](websites/www.cs/games/tankity/README.md) |

**tools/** (site root) holds `site-game-pages.php` (writes `play/<id>/index.html`), `site-versions.php` (the home page's `?v=` cache-busters) and `ts-build.mjs` (compiles the site's TypeScript). Each game keeps its own generators in its own `tools/`.

**Games build.** `games/package.json` is the one npm install for every game: `cd websites/www.cs/games && npm ci`, then `npm run build` (writes each game's checked-in `dist/`) or `npm run check` (fails on a stale build or a type error). A game has `build.json`, `src/`, `dist/` and `test/` (`node:test` `*.test.ts` files, type-checked by the game's `tsconfig.test.json`). Tankity builds three bundles: `main`, `fx` and `fx-editor`.

**tests/** holds the site-level PHPUnit cases (`tests/php/`) and `tests/e2e/`, the Playwright browser suite. Each game's unit tests sit in its `test/` folder; `games/units.sh` runs them, and its `test.sh` runs its build checks and PHPUnit suite.

**docs/superpowers/** holds design specs (`specs/`) and implementation plans (`plans/`).

## Prerequisites

| Tool | Version | Used for |
| --- | --- | --- |
| Docker with Compose v2 | any recent | the local site (`make up`); `make test` runs some suites inside the PHP container |
| PHP CLI | 8.4 | host-side tests and generators. CI runs 8.4, and the container (and the server) run PHP 8.4 (`websites/www.cs/docker/expected-php-version.txt`); PHPUnit 12 needs 8.3 or newer |
| Composer | 2 | PHPUnit (dev only), installed by `make test` into `websites/www.cs/vendor/` |
| Node | 24 (CI's version) | TypeScript builds, the JavaScript unit suites, the browser suite |
| npm | the one shipped with Node | `npm ci` in the site, `games/` and `tests/e2e/` (run by the make targets) |
| Google Chrome | current | the Playwright suite uses the installed Chrome (`channel: 'chrome'`) |
| Python 3 | any 3.x | `scripts/deploy-hash` and its test; `deploy.sh` calls it |
| curl | any | `make test` (the Tankity web test) and `make e2e` |
| sshpass | any | `make deploy` only; the password comes from a file (default `~/.ssh/.passwd.siue`, override with `SSHPASS_FILE`) |
| `sips` | macOS built-in | `make screenshots` only |
| gh CLI | any | opening and merging pull requests; no make target calls it |

## Running locally

From the repository root:

| Command | What it does |
| --- | --- |
| `make up` | builds and starts every site, then prints each site's URL |
| `make urls` | prints each site's URL, or "not running" |
| `make ps` | shows the running containers |
| `make down` | stops and removes the containers |

For one site, run the same names inside it: `make -C websites/www.cs up | down | url`. These touch only that site's services (`www-cs-php`, `www-cs-nginx`). `make -C websites/www.cs help` lists every target.

nginx publishes on `127.0.0.1` with an ephemeral host port (`127.0.0.1::80` in `compose.yaml`), never a fixed one, so a running dev server is never displaced. Ask for the URL with `make urls` or `make -C websites/www.cs url`.

**A second copy for a git worktree.** The site Makefile runs compose through its `COMPOSE` variable, so give the worktree its own compose project and its containers, network and port stay separate from every other checkout's. From the worktree's `websites/www.cs`:

```sh
make up COMPOSE="docker compose -p siue-<name> -f ../../compose.yaml"
make test COMPOSE="docker compose -p siue-<name> -f ../../compose.yaml"
make down COMPOSE="docker compose -p siue-<name> -f ../../compose.yaml"
```

Pass the same `COMPOSE` to every target that talks to the containers (`up`, `down`, `url`, `test`, `e2e`, `parity`). The root Makefile calls `docker compose` directly, so use this form from `websites/www.cs`.

## Testing

**Unit suites.** `make test` at the root runs `scripts/test_deploy_hash.py` and `scripts/test_deploy_connection.py` (the real `deploy.sh` against fake `ssh`, `scp`, `sftp` and `sshpass`; it never touches a host), then `make test` in each site. The site's `make test` needs `make up` first and runs:

- `npm ci` in `tests/e2e/` and `tsc -p tests/e2e/tsconfig.json`, which type-checks every spec, helper and tool there (strict, the same settings as the games' programs), then the selector and shard tests for the browser suite (`tests/e2e/select-test.ts`, `shard-test.ts`, `select.ts --check`);
- `npm ci` and the site's TypeScript build check (`tools/ts-build.mjs --check`);
- `composer install`, then PHPUnit's `site` suite (the games hub, the site's game pages, the home-page versions and the deploy set) and `kit` suite, plus the `--check` runs of the site's generators;
- `npm ci` in `games/`, then every `games/*/test.sh`: the kit's type checks, and each game's build check (its tests' type check included), install-file check and icon check, plus Cylon's `cylon` PHPUnit suite and Tankity's `tankity` suite;
- `games/units.sh`: every `*.test.ts` of the kit and the games in one parallel `node --test` run, failing on a folder with no test files;
- Tankity's `tankity-docker` PHPUnit suite, its protocol and shared-sim-vector checks inside the PHP container, and its web test over HTTP.

`phpunit.xml` defines the suites `site`, `kit`, `cylon`, `tankity` and `tankity-docker`; run one with `vendor/bin/phpunit --testsuite <name>` from `websites/www.cs`. `vendor/` is git-ignored and never deploys.

`make -C websites/www.cs protocol` and `make -C websites/www.cs sim-vectors` rewrite Tankity's generated fixtures when they change on purpose.

**Browser suite.** `make -C websites/www.cs e2e` runs the Playwright specs in `tests/e2e/` against the local site (or any site root in `E2E_BASE_URL`). The specs include play-throughs of Crete and Cylon (`crete-play.spec.ts`, `cylon-play.spec.ts`) beside Tankity's and the Games page's; CI runs every spec nightly. Test browsers are silent and never outlive their run: Chrome starts with `--mute-audio` and `--autoplay-policy=user-gesture-required`, WebKit pages get `muteScript` (a zero-gain node before every `AudioContext` destination, media elements muted), and `run.sh` gives each run its own `TMPDIR` (so its browser profiles have a unique path), kills Playwright's process group on exit, INT, TERM and HUP, then reaps any process whose command line holds that path (`reap.sh`, tested by `scripts/test_e2e_reap.py`). `E2E_ARGS` goes to `playwright test`:

```sh
make -C websites/www.cs e2e E2E_ARGS="games-hub.spec.ts"
make -C websites/www.cs e2e E2E_ARGS="tankity-solo.spec.ts -g 'some title'"
```

The specs, their helpers and the selector and shard tools are TypeScript, run from source (Playwright for the specs, Node 24 for the tools); `tests/e2e/tsconfig.json` only type-checks them, and `make test` (so CI `units`) fails on a type error. Browser-side code (`page.evaluate` callbacks and init scripts) is typed against the DOM, with page globals declared beside the code that reads them.

`make -C websites/www.cs e2e-changed` runs only the specs your changes against `origin/main` need (committed, uncommitted and new files), as picked by `tests/e2e/select.ts`.

`tests/e2e/run.sh` allows one browser run per machine at a time. The lock is the directory `/tmp/siue-e2e.lock` (override with `E2E_LOCK`), shared by every worktree and session; a second run waits for the first, and a lock whose process is gone is cleared.

**Screenshots and parity.** `make -C websites/www.cs screenshots` replays each game in a browser and rewrites its `screenshot.jpg` for the Games page (pass `GAMES=` to pick games; needs macOS `sips`). `make parity` (root, or per site) checks that the docker PHP has the same version, modules and ini values as www.cs.siue.edu, using the lists in `websites/www.cs/docker/`.

**How CI picks specs.** `tests/e2e/select.ts` reads changed file paths on stdin and prints `NONE`, `ALL`, or a list of specs. The first matching rule wins for each file and the results are unioned. Files that no browser sees (Markdown, `docs/`, `scripts/`, unit tests, generators) select nothing; a game's folder selects that game's specs plus the Games-page specs; a file under `websites/www.cs/` that no rule knows selects everything. `tests/e2e/shard.ts <n> <of> [spec ...]` splits the selected specs across runners by each spec's recorded run time, the same way on every runner.

## CI and deploys

### ci.yml

| Job | Runs | What |
| --- | --- | --- |
| `units` | on a pull request whose diff touches `websites/`, `scripts/`, `compose.yaml`, `Makefile` or `ci.yml`; on a push to main (same paths); on every scheduled or manual run | PHP 8.4, Composer and Node 24, `make up`, `make test`, `make down` |
| `e2e (1/4)` to `e2e (4/4)` | on pull requests, the nightly schedule and manual runs | `select.ts` picks specs for a pull request (every spec otherwise); `shard.ts` gives each of four runners its share; each starts its own site and runs its share through `make e2e` on the runner's Chrome |

Triggers: pull requests; pushes to `main` that change `websites/**`, `scripts/**`, `compose.yaml`, `Makefile` or `ci.yml`; a daily schedule (08:17 UTC); and `workflow_dispatch`. A pull request that touches nothing a job covers passes that job without starting the sites. A failed e2e shard uploads its `test-results` as an artifact.

### deploy.yml

Deploys www.cs when a `ci` run completes successfully for a push to `main` of this repository (not a pull request, not a fork), or when started by hand from the Actions tab (the `force` input sends every file). It runs in the `production` environment, deploys only if the run's commit is still the tip of `main`, runs `make -C websites/www.cs deploy PRUNE=1` (which logs in once and reads the server's stamp back on that same connection to confirm it holds this commit's content), then requests the home page, each game's `play/` page, Tankity's page, its `rooms.php?action=ping` and `scores.php`, and Cylon's `scores.php` on the live site and requires 200 from each, so a broken game endpoint fails the deploy. The login comes from a 1Password service account (the `OP_SERVICE_ACCOUNT_TOKEN` repository secret); SSH accepts only the host keys in `.github/ssh_known_hosts`.

### Deploy mechanics

`make deploy` (or `make deploy SITE=www.cs`) deploys each site to its own server. A deploy stages exactly what the server receives (git's view of the working tree, uncommitted edits included, ignored files left out), hashes it with `scripts/deploy-hash`, and compares that with the `.deploy-hash` the site keeps on its server: equal means nothing to do, otherwise only changed files go up. The stamp is written last, so an interrupted deploy retries.

A www.cs deploy logs in once. `deploy.sh` opens one SSH master connection with `sshpass` and the password file, and every `scp` and `sftp` after that rides its control socket (a short directory under `/tmp`, removed on exit) without authenticating again; `ssh -O exit` closes the master however the script ends. Nothing is retried: if the master cannot connect, the deploy prints one message and stops, because repeated logins trip the server's fail2ban.

| Variable | Effect |
| --- | --- |
| `DRY_RUN=1` | shows the plan and uploads nothing |
| `FORCE=1` | sends everything |
| `LIST=1` | (www.cs) prints the deploy set and stops; needs no host or password |
| `PRUNE=1` | also deletes files the last deploy sent that this one does not; without it they are reported and left |
| `HOST`, `SSHPASS_FILE` | (www.cs) the login and its password file |

Before staging, `deploy.sh` refuses to ship a stale generated file: the site's game pages, each game's install files, the home page's `?v=` versions, Tankity's `game.json`, the games' built `dist/` (it gates on `npm run check` in `games/`, which also fails on a type error), and the site's compiled TypeScript. The error names the command that regenerates it. It also refuses a real deploy while `games/zz-probe` exists, a leftover of the deploy-set test. The deploy set leaves out tests (`test/`), READMEs, each game's `tools/`, TypeScript sources and build setup (`_kit/`, `node_modules/`, `build.json`, package and tsconfig files), authoring sources (Git LFS audio and Blender files), and Cylon's live `scores.json`, which the server owns. Only when a successful listing of the server's scores folder shows the file missing does the deploy seed an empty one; a failed listing leaves scores untouched.

## Working on the repo

- Changes go through a branch and a pull request. Do not commit to `main`.
- The main checkout stays on `main`. Branch work happens in a git worktree under `.claude/worktrees/` (that directory is git-ignored), with its own compose project name so its site does not collide with another checkout's (see "Running locally").
- Before opening the pull request, run `make test` plus the one or two browser specs your change is about (`make e2e E2E_ARGS="<spec>"`). CI runs every spec the change selects, across four runners.
- Design specs and implementation plans go in `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Large authoring sources (`.blend`, `.wav`, `.flac`, `.aif`) are in Git LFS; run `git lfs install` once and `git lfs pull` after cloning. Served images and compressed audio are in plain git.

## Adding a site

Give it a directory like the one above, prefix its services and network with its slug (`caos-cs-*`), and add its `compose.yaml` to the root `include:` list. How it deploys stays in its own Makefile. The root Makefile finds a site by `websites/*/Makefile` and calls these targets in it: `url` (for `make urls`), `test`, `parity` and `deploy`; so a site's Makefile should define them.

## Licenses

Each game (`websites/www.cs/games/cylon`, `crete`, `tankity`) carries a `LICENSE` file: GNU General Public License v3. Tankity bundles Preact (MIT) from npm; the build writes the license of every npm package a game bundles to that game's `dist/THIRD_PARTY_LICENSES.txt`, and each such bundle opens with a comment pointing to it. The rest of the repository, including the site pages, tools and scripts, has no license file.
