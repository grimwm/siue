.PHONY: help deploy up down url parity

.DEFAULT_TARGET := help

SSHPASS ?= sshpass -f "$(HOME)/.ssh/.passwd.siue"
HOST ?= wgrim@www.cs.siue.edu

# Local docker runs through the repo-root project, which includes this
# site's compose.yaml; these targets touch only this site's services.
COMPOSE ?= docker compose -f ../../compose.yaml
SERVICES := www-cs-php www-cs-nginx
export COMPOSE

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload site + games assets to www.cs.siue.edu"
	@echo "  up     - Run the site locally in docker (PHP matches the server)"
	@echo "  down   - Stop the local site"
	@echo "  url    - Print the local site's URL (its port is ephemeral)"
	@echo "  parity - Check the docker PHP against www.cs.siue.edu's modules/ini"

deploy:
	@test -f cylon.js || ln -sf games/cylon/cylon.js cylon.js
	@test -f cylon-mount.html || ln -sf games/cylon/mount.html cylon-mount.html
	$(SSHPASS) scp *.html *.js *.css *.php *.png *.ico *.webmanifest $(HOST):.
	# Game modules (creates games/ on the host if needed)
	$(SSHPASS) scp -r games $(HOST):.
	# Host allows SFTP/SCP only (no shell). Scores live in games/cylon/data/scores.json.
	# Server umask turns plain uploads into 640 (PHP can't open). Use scp -p
	# with mode 666; re-push existing content so perms stay fixed without a wipe.
	$(SSHPASS) scp games/cylon/data/.htaccess $(HOST):games/cylon/data/.htaccess
	@tmp=/tmp/cylon-scores-deploy-$$$$.json; \
	scores=games/cylon/data/scores.json; \
	if $(SSHPASS) scp $(HOST):$$scores "$$tmp" >/dev/null 2>&1; then \
		echo "$$scores present — refreshing mode 666 via scp -p"; \
	else \
		echo "[]" > "$$tmp"; \
		echo "bootstrapping empty $$scores"; \
	fi; \
	chmod 666 "$$tmp"; \
	$(SSHPASS) scp -p "$$tmp" $(HOST):$$scores; \
	rm -f "$$tmp"
	# Umask turns new uploads into 640, which PHP cannot read. Re-push the
	# adapter, API, and config with their local 644 mode preserved.
	chmod 644 scores.php games/cylon/scores.php games/cylon/data/config.json games/cylon/data/.htaccess
	$(SSHPASS) scp -p scores.php $(HOST):scores.php
	$(SSHPASS) scp -p games/cylon/scores.php $(HOST):games/cylon/scores.php
	$(SSHPASS) scp -p games/cylon/data/config.json $(HOST):games/cylon/data/config.json
	$(SSHPASS) scp -p games/cylon/data/.htaccess $(HOST):games/cylon/data/.htaccess

up:
	$(COMPOSE) up -d --build $(SERVICES)
	@$(MAKE) --no-print-directory url

down:
	$(COMPOSE) rm --stop --force $(SERVICES)

url:
	@echo "http://$$($(COMPOSE) port www-cs-nginx 80)/"

parity:
	./docker/check-parity.sh
