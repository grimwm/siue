.PHONY: help deploy up down url parity

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
	@echo "           .deploy-hash matches; FORCE=1 sends all, DRY_RUN=1 sends none)"
	@echo "  up     - Run the site locally in docker (PHP matches the server)"
	@echo "  down   - Stop the local site"
	@echo "  url    - Print the local site's URL (its port is ephemeral)"
	@echo "  parity - Check the docker PHP against www.cs.siue.edu's modules/ini"

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
