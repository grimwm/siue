.PHONY: help up down ps urls parity test deploy

.DEFAULT_GOAL := help

# Every site under websites/ that has a Makefile.
SITES := $(patsubst %/Makefile,%,$(wildcard websites/*/Makefile))

help:
	@echo "Local docker for all sites (compose.yaml includes each one):"
	@echo "  up     - Build and start every site"
	@echo "  down   - Stop and remove every site's containers"
	@echo "  ps     - Show running containers"
	@echo "  urls   - Print each site's local URL (ports are ephemeral)"
	@echo "  parity - Run every site's parity check against its server"
	@echo "  test   - Unit suites: the deploy hasher, then every site's (needs make up)"
	@echo "  deploy - Deploy every site to its own server; SITE=www.cs for one."
	@echo "           Each skips when its server's .deploy-hash already matches."
	@echo "           FORCE=1 / DRY_RUN=1 / PRUNE=1 pass through."
	@echo ""
	@echo "One site, including its deploy: make -C websites/<site> help"
	@echo "Sites: $(notdir $(SITES))"

up:
	docker compose up -d --build
	@$(MAKE) --no-print-directory urls

down:
	docker compose down

ps:
	docker compose ps

urls:
	@for s in $(SITES); do \
		if u=$$($(MAKE) -s --no-print-directory -C $$s url 2>/dev/null); then \
			printf '%-12s %s\n%-12s %s\n' "$$(basename $$s)" "running" "" "$$u"; \
		else \
			printf '%-12s %s\n' "$$(basename $$s)" "not running"; \
		fi; \
	done

deploy:
	@for s in $(if $(SITE),websites/$(SITE),$(SITES)); do \
		test -f $$s/Makefile || { echo "no site $$s" >&2; exit 1; }; \
		$(MAKE) --no-print-directory -C $$s deploy || exit 1; \
	done

test:
	python3 -I scripts/test_deploy_hash.py
	@for s in $(SITES); do $(MAKE) --no-print-directory -C $$s test || exit 1; done

parity:
	@for s in $(SITES); do $(MAKE) --no-print-directory -C $$s parity || exit 1; done
