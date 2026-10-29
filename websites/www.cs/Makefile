.PHONY: help deploy up down live-url url parity test protocol sim-vectors e2e e2e-changed screenshots admin-smoke music-e2e

.DEFAULT_GOAL := help

SSHPASS_FILE ?= $(HOME)/.ssh/.passwd.siue
HOST ?= wgrim@www.cs.siue.edu

# Local docker runs through the repo-root project, which includes this
# site's compose.yaml; these targets touch only this site's services.
COMPOSE ?= docker compose -f ../../compose.yaml
SERVICES := www-cs-php www-cs-nginx
export COMPOSE

##@ Help
help: ## Show this list
	@color=; if [ -t 1 ] && [ -z "$$NO_COLOR" ]; then color=1; fi; \
	awk -v color="$$color" '\
		/^##@ / { n++; head[n] = substr($$0, 5); next } \
		/^[a-z][a-z0-9-]*:.*##/ { \
			i = index($$0, "##"); d = substr($$0, i + 2); sub(/^ +/, "", d); \
			name = substr($$0, 1, index($$0, ":") - 1); \
			m++; sec[m] = n; nm[m] = name; ds[m] = d; \
			if (length(name) > w) w = length(name) } \
		END { for (k = 1; k <= m; k++) { \
			if (sec[k] != last) { last = sec[k]; \
				if (k > 1) print ""; \
				printf(color ? "\033[1m%s\033[0m\n" : "%s\n", head[last]) } \
			printf(color ? "  \033[36m%-" w "s\033[0m  %s\n" : "  %-" w "s  %s\n", nm[k], ds[k]) } }' $(MAKEFILE_LIST)

##@ Site
deploy: ## Upload what changed to www.cs.siue.edu (options: see README)
	@HOST="$(HOST)" SSHPASS_FILE="$(SSHPASS_FILE)" ./deploy.sh

up: ## Run the site locally in docker
	$(COMPOSE) up -d --build $(SERVICES)
	@$(MAKE) --no-print-directory url

down: ## Stop the local site
	$(COMPOSE) rm --stop --force $(SERVICES)

live-url: ## Print the live site's URL
	@echo "https://www.cs.siue.edu/~wgrim/"

url: ## Print the local docker copy's URL (its port is ephemeral)
	@if port=$$($(COMPOSE) port www-cs-nginx 80 2>/dev/null) && [ -n "$$port" ]; then \
		echo "http://$$port/"; \
	else \
		echo "the local docker copy is not running (make up)" >&2; exit 1; \
	fi

parity: ## Check docker PHP against the server's modules and ini
	./docker/check-parity.sh

##@ Tests
test: ## Run all unit suites (needs make up; see README)
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

##@ Tankity fixtures
protocol: ## Rewrite the Tankity room protocol fixtures (needs make up)
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/generate.php'

sim-vectors: ## Rewrite the Tankity sim test vectors (needs make up)
	$(COMPOSE) exec -T www-cs-php sh -c 'cd /var/www/html/games/tankity && php protocol/sim-vectors.php'

##@ Browser
e2e: ## Browser suite against the local site (E2E_BASE_URL, E2E_ARGS)
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	E2E_BASE_URL=$$url tests/e2e/run.sh $(E2E_ARGS)

screenshots: ## Recapture every game's card still and loop, share image and clip
	@url=$${E2E_BASE_URL:-$$($(MAKE) --no-print-directory -s url)} && \
	cd tests/e2e && npm ci --silent && E2E_BASE_URL=$$url node screenshots.ts $(GAMES) && \
	cd ../.. && php tools/site-game-pages.php

# The specs this branch's changes need (committed, uncommitted and new files
# against origin/main), picked by tests/e2e/select.ts; nothing when none.
e2e-changed: ## Only the browser specs your changes need
	@specs=$$( { git diff --name-only origin/main...HEAD; git diff --name-only HEAD; git ls-files --others --exclude-standard | sed 's|^|websites/www.cs/|'; } | sort -u | node tests/e2e/select.ts ) && \
	echo "e2e: $$specs" && \
	case "$$specs" in NONE) ;; ALL) $(MAKE) --no-print-directory e2e ;; *) $(MAKE) --no-print-directory e2e E2E_ARGS="$$specs" ;; esac

# The admin login end to end in its own docker project (torn down afterwards).
admin-smoke: ## Admin sign-in check in a throwaway docker project
	tests/admin-smoke.sh

# The workroom's browser check against its own docker project, with the
# admin mail capture. Local only.
music-e2e: ## Music workroom browser check (test keyring, fake microphone)
	@name=music-e2e-$$$$; files="-f compose.yaml -f compose.admin-local.yaml"; \
	export ADMIN_SMOKE_DIR=/tmp/$$name; \
	trap 'docker compose $$files -p $$name down -v >/dev/null 2>&1' EXIT; \
	docker compose $$files -p $$name up -d --build www-cs-php www-cs-nginx >/dev/null && \
	addr=$$(docker compose $$files -p $$name port www-cs-nginx 80) && port=$${addr##*:} && \
	ready=0; for i in $$(seq 1 60); do if curl -sf -o /dev/null -H 'Host: localhost' "http://127.0.0.1:$$port/admin/login.php"; then ready=1; break; fi; sleep 1; done; \
	test $$ready = 1 || { echo "music-e2e: the stack did not answer" >&2; exit 1; }; \
	docker compose $$files -p $$name exec -T -u apache www-cs-php mkdir -p $$ADMIN_SMOKE_DIR/mail && \
	MUSIC_E2E_COMPOSE="$$files" MUSIC_E2E_PROJECT=$$name MUSIC_E2E_MAIL_DIR=$$ADMIN_SMOKE_DIR/mail \
	MUSIC_PY=$(MUSIC_PY_ABS) \
	E2E_BASE_URL=http://localhost:$$port/ tests/e2e/run.sh -c local.config.ts && \
	echo MUSIC-E2E-OK

# The music workroom's key and note tool (music/tools/siue-music), run in its own virtualenv.
.PHONY: music-setup music-status music-pickup music-publish music-delete music-rotate music-forget music-mcp music-mcp-setup music-test music-image music-compose-test music-render music-library
MUSIC_PY ?= $(if $(wildcard music/tools/.venv/bin/python),music/tools/.venv/bin/python,python3)
# The tool's interpreter as an absolute path when it is one (the browser check runs it from tests/e2e); a bare python3 stays a command name.
MUSIC_PY_ABS = $(if $(findstring /,$(MUSIC_PY)),$(abspath $(MUSIC_PY)),$(MUSIC_PY))
MUSIC_TOOL = $(MUSIC_PY) music/tools/siue-music

##@ Music workroom
music-setup: ## Guided setup: API keys and notes key (safe to re-run)
	@music/tools/ensure-venv music/tools/.venv music/tools/requirements.txt
	@music/tools/.venv/bin/python music/tools/siue-music setup
music-status: ## Show what is set up and what is missing
	@$(MUSIC_TOOL) keys status || [ $$? -eq 3 ]
music-pickup: ## Download, open and save your waiting notes
	@$(MUSIC_TOOL) pickup
music-publish: ## Upload a draft (PIECE=<id> [VERSION=n])
	@test -n "$(PIECE)" || { echo "usage: make music-publish PIECE=ch1-labyrinth [VERSION=3]" >&2; exit 1; }
	@$(MUSIC_TOOL) publish "$(PIECE)" $(if $(VERSION),--version $(VERSION))
music-delete: ## Delete one published draft (PIECE=<id> VERSION=n)
	@test -n "$(PIECE)" -a -n "$(VERSION)" || { echo "usage: make music-delete PIECE=ch1-labyrinth VERSION=3" >&2; exit 1; }
	@$(MUSIC_TOOL) delete "$(PIECE)" "$(VERSION)"
music-rotate: ## Make a new notes key (earlier notes still open)
	@$(MUSIC_TOOL) keys rotate
music-forget: ## Delete this computer's cached keys
	@$(MUSIC_TOOL) keys forget
music-mcp: ## Run the MCP server on stdin and stdout (to test it by hand)
	@$(MUSIC_TOOL) mcp
music-mcp-setup: ## Prepare the MCP server and print how to connect your AI
	@music/tools/ensure-venv music/tools/.venv music/tools/requirements-mcp.txt mcp
	@music/tools/.venv/bin/python music/tools/siue-music mcp-setup
music-test: ## Run the key tool's tests
	$(MUSIC_PY) -m unittest discover -s music/tools/tests -t music/tools/tests

##@ Composing (in a container; nothing here talks to the server or 1Password)
MUSIC_IMAGE = siue-music-compose
MUSIC_CACHE ?= $(HOME)/.cache/siue-music
# Capped where systemd is available, so a runaway render cannot take the machine down.
MUSIC_CAP = $(if $(shell command -v systemd-run),systemd-run --user --scope -q -p MemoryMax=4G -p MemorySwapMax=0)
MUSIC_RUN = mkdir -p "$(MUSIC_CACHE)" && $(MUSIC_CAP) podman run --rm --memory=4g --memory-swap=4g -v "$(CURDIR)":/work:z -v "$(MUSIC_CACHE)":/cache:z \
	-e SIUE_MUSIC_CACHE=/cache -w /work/music/compose $(MUSIC_IMAGE)
music-image: ## Build the composing container (sfizz, ffmpeg, Python)
	podman build -t $(MUSIC_IMAGE) -f music/compose/Containerfile music/compose
music-compose-test: ## Run the composing tests in the container
	@$(MUSIC_RUN) python3 -m unittest discover -s tests -t tests
music-render: ## Compose and render a draft (PIECE=<id> VERSION=n [CUT=<name>])
	@test -n "$(PIECE)" -a -n "$(VERSION)" || { echo "usage: make music-render PIECE=crete-title VERSION=1" >&2; exit 1; }
	@$(MUSIC_RUN) python3 -m siue_compose.cli render "$(PIECE)" "$(VERSION)" $(if $(CUT),--cut "$(CUT)")
music-library: ## Rebuild the shared FLAC sample library (music/library/)
	@$(MUSIC_RUN) python3 -m siue_compose.library
