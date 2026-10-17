.PHONY: help deploy up down url parity test protocol sim-vectors e2e screenshots admin-smoke music-e2e

.DEFAULT_TARGET := help

SSHPASS_FILE ?= $(HOME)/.ssh/.passwd.siue
HOST ?= wgrim@www.cs.siue.edu

# Local docker runs through the repo-root project, which includes this
# site's compose.yaml; these targets touch only this site's services.
COMPOSE ?= docker compose -f ../../compose.yaml
SERVICES := www-cs-php www-cs-nginx
export COMPOSE

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload what changed to www.cs.siue.edu (skips when its"
	@echo "           .deploy-hash matches; FORCE=1 sends all, DRY_RUN=1 sends none,"
	@echo "           PRUNE=1 deletes files the last deploy sent that are now gone)"
	@echo "  up     - Run the site locally in docker (PHP matches the server)"
	@echo "  down   - Stop the local site"
	@echo "  url    - Print the local site's URL (its port is ephemeral)"
	@echo "  parity - Check the docker PHP against www.cs.siue.edu's modules/ini"
	@echo "  test   - Unit suites: the site's TypeScript build, games hub, site game pages, home-page versions, deploy set, each game's tools, Tankity (incl. game.yaml, its kit build check and unit tests), Cylon (its kit build check, unit tests and scores PHPUnit), Crete (its kit build check and engine tests) (needs make up)"
	@echo "  protocol - Rewrite the Tankity room protocol fixtures (needs make up)"
	@echo "  sim-vectors - Rewrite the Tankity shared sim test vectors (needs make up)"
	@echo "  e2e    - Real-browser suite against the local site, or E2E_BASE_URL;"
	@echo "           one run per machine at a time (E2E_ARGS passes to playwright)"
	@echo "  e2e-changed - Only the browser specs your changes against origin/main need"
	@echo "  admin-smoke - Sign in to the admin pages in a throwaway docker project and back out (prints ADMIN-SMOKE-OK)"
	@echo "  music-e2e - The music workroom's browser check in a throwaway docker project (local only; prints MUSIC-E2E-OK)"
	@echo "  screenshots - Recapture each game's Games-page picture (macOS sips)"

deploy:
	@HOST="$(HOST)" SSHPASS_FILE="$(SSHPASS_FILE)" ./deploy.sh

up:
	$(COMPOSE) up -d --build $(SERVICES)
	@$(MAKE) --no-print-directory url

down:
	$(COMPOSE) rm --stop --force $(SERVICES)

url:
	@if port=$$($(COMPOSE) port www-cs-nginx 80 2>/dev/null) && [ -n "$$port" ]; then \
		echo "http://$$port/"; \
	else \
		echo "www.cs is not running (make up)" >&2; exit 1; \
	fi

parity:
	./docker/check-parity.sh

test:
	cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json
	node tests/e2e/select-test.ts
	node tests/e2e/shard-test.ts
	node tests/e2e/select.ts --check
	npm ci --silent && node tools/ts-build.mjs --check
	php tools/site-game-pages.php --check
	php tools/site-versions.php --check
	composer install --quiet --no-interaction
	vendor/bin/phpunit --testsuite site
	vendor/bin/phpunit --testsuite kit
	cd games && npm ci --silent
	for t in games/*/test.sh; do echo "== $$t"; $$t || exit 1; done
	games/units.sh
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html && vendor/bin/phpunit --testsuite tankity-docker'
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/generate.php --check'
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/sim-vectors.php --check'
	@url=$$($(MAKE) --no-print-directory -s url) && \
	if out=$$(curl -sf --max-time 300 "$${url}games/tankity/rooms-web-test.php"); then status=0; else status=$$?; fi; \
	last=$$(printf '%s\n' "$$out" | tail -1); echo "$$last"; \
	if [ $$status -ne 0 ] || [ "$$last" != WEB-OK ]; then printf '%s\n' "$$out" | grep '^FAIL' >&2; echo "rooms-web-test failed (curl $$status)" >&2; exit 1; fi
	@url=$$($(MAKE) --no-print-directory -s url) && tests/tankity-data-deny.sh "$$url"

protocol:
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/generate.php'

sim-vectors:
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/sim-vectors.php'

e2e:
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	E2E_BASE_URL=$$url tests/e2e/run.sh $(E2E_ARGS)

screenshots:
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	cd tests/e2e && npm ci --silent && E2E_BASE_URL=$$url node screenshots.ts $(GAMES)

# The specs this branch's changes need (committed, uncommitted and new files
# against origin/main), picked by tests/e2e/select.ts; nothing when none.
e2e-changed:
	@specs=$$( { git diff --name-only origin/main...HEAD; git diff --name-only HEAD; git ls-files --others --exclude-standard | sed 's|^|websites/www.cs/|'; } | sort -u | node tests/e2e/select.ts ) && \
	echo "e2e: $$specs" && \
	case "$$specs" in NONE) ;; ALL) $(MAKE) --no-print-directory e2e ;; *) $(MAKE) --no-print-directory e2e E2E_ARGS="$$specs" ;; esac

# The admin login end to end in its own docker project (torn down afterwards).
admin-smoke:
	tests/admin-smoke.sh

# The workroom's browser check against its own docker project, with the
# admin mail capture. Local only.
music-e2e:
	@name=music-e2e-$$$$; files="-f compose.yaml -f compose.admin-local.yaml"; \
	export ADMIN_SMOKE_DIR=/tmp/$$name; \
	trap 'docker compose $$files -p $$name down -v >/dev/null 2>&1' EXIT; \
	docker compose $$files -p $$name up -d --build www-cs-php www-cs-nginx >/dev/null && \
	addr=$$(docker compose $$files -p $$name port www-cs-nginx 80) && port=$${addr##*:} && \
	ready=0; for i in $$(seq 1 60); do if curl -sf -o /dev/null -H 'Host: localhost' "http://127.0.0.1:$$port/admin/login.php"; then ready=1; break; fi; sleep 1; done; \
	test $$ready = 1 || { echo "music-e2e: the stack did not answer" >&2; exit 1; }; \
	docker compose $$files -p $$name exec -T -u apache www-cs-php mkdir -p $$ADMIN_SMOKE_DIR/mail && \
	MUSIC_E2E_COMPOSE="$$files" MUSIC_E2E_PROJECT=$$name MUSIC_E2E_MAIL_DIR=$$ADMIN_SMOKE_DIR/mail \
	E2E_BASE_URL=http://localhost:$$port/ tests/e2e/run.sh -c local.config.ts && \
	echo MUSIC-E2E-OK
