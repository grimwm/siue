.PHONY: help up down ps urls parity test deploy

.DEFAULT_GOAL := help

# Every site under websites/ that has a Makefile.
SITES := $(patsubst %/Makefile,%,$(wildcard websites/*/Makefile))

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
	@echo ""
	@echo "One site: make -C websites/<site> help    Sites: $(notdir $(SITES))"

##@ Local docker
up: ## Build and start every site
	docker compose up -d --build
	@$(MAKE) --no-print-directory urls

down: ## Stop and remove every site's containers
	docker compose down

ps: ## Show running containers
	docker compose ps

urls: ## Print each site's local URL (ports are ephemeral)
	@for s in $(SITES); do \
		if u=$$($(MAKE) -s --no-print-directory -C $$s url 2>/dev/null); then \
			printf '%-12s %s\n%-12s %s\n' "$$(basename $$s)" "running" "" "$$u"; \
		else \
			printf '%-12s %s\n' "$$(basename $$s)" "not running"; \
		fi; \
	done

##@ Deploy
deploy: ## Deploy every site (SITE=<site> for one; options: see README)
	@for s in $(if $(SITE),websites/$(SITE),$(SITES)); do \
		test -f $$s/Makefile || { echo "no site $$s" >&2; exit 1; }; \
		$(MAKE) --no-print-directory -C $$s deploy || exit 1; \
	done

##@ Checks
test: ## Unit suites: deploy tooling, then every site's (needs make up)
	python3 -I scripts/test_deploy_hash.py
	python3 -I scripts/test_deploy_connection.py
	python3 -I scripts/test_e2e_reap.py
	@for s in $(SITES); do $(MAKE) --no-print-directory -C $$s test || exit 1; done

parity: ## Check every site's parity against its server
	@for s in $(SITES); do $(MAKE) --no-print-directory -C $$s parity || exit 1; done
