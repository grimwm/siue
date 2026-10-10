.PHONY: help deploy up down url parity test protocol e2e screenshots

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
	@echo "  test   - Unit suites: games hub, site game pages, each game's tools, Tankity (incl. game.yaml) (needs make up)"
	@echo "  protocol - Rewrite the Tankity room protocol fixtures (needs make up)"
	@echo "  e2e    - Real-browser suite against the local site, or E2E_BASE_URL;"
	@echo "           one run per machine at a time (E2E_ARGS passes to playwright)"
	@echo "  e2e-changed - Only the browser specs your changes against origin/main need"
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
	node tests/e2e/select-test.mjs
	node tests/e2e/select.mjs --check
	php tests/games-hub-test.php
	php tests/site-game-pages-test.php
	php tools/site-game-pages.php --check
	cd games/tankity && php game-json-test.php && php install-files-test.php && php tools/game-json.php --check && php tools/install-files.php --check
	cd games/crete && php install-files-test.php && php tools/install-files.php --check
	cd games/cylon && php install-files-test.php && php tools/install-files.php --check
	cd games/tankity && node smoke-test.js && php config-test.php && php rooms-sim-test.php
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php rooms-test.php'
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/generate.php --check'
	@url=$$($(MAKE) --no-print-directory -s url) && curl -sf --max-time 300 "$${url}games/tankity/rooms-web-test.php" | tail -1

protocol:
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/generate.php'

e2e:
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	E2E_BASE_URL=$$url tests/e2e/run.sh $(E2E_ARGS)

screenshots:
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	cd tests/e2e && npm ci --silent && E2E_BASE_URL=$$url node screenshots.mjs

# The specs this branch's changes need (committed, uncommitted and new files
# against origin/main), picked by tests/e2e/select.mjs; nothing when none.
e2e-changed:
	@specs=$$( { git diff --name-only origin/main...HEAD; git diff --name-only HEAD; git ls-files --others --exclude-standard | sed 's|^|websites/www.cs/|'; } | sort -u | node tests/e2e/select.mjs ) && \
	echo "e2e: $$specs" && \
	case "$$specs" in NONE) ;; ALL) $(MAKE) --no-print-directory e2e ;; *) $(MAKE) --no-print-directory e2e E2E_ARGS="$$specs" ;; esac
