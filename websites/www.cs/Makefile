.PHONY: help deploy

.DEFAULT_TARGET := help

SSHPASS ?= sshpass -f "$(HOME)/.ssh/.passwd.siue"
HOST ?= wgrim@www.cs.siue.edu

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload site + games assets to www.cs.siue.edu"

deploy:
	@test -f cylon.js || ln -sf games/cylon/cylon.js cylon.js
	@test -f cylon-mount.html || ln -sf games/cylon/mount.html cylon-mount.html
	$(SSHPASS) scp *.html *.js *.css *.php *.png *.ico *.webmanifest $(HOST):.
	# Game modules (creates games/ on the host if needed)
	$(SSHPASS) scp -r games $(HOST):.
	# Host allows SFTP/SCP only (no shell). Scores live in data/scores.json.
	# Server umask turns plain uploads into 640 (PHP can't open). Use scp -p
	# with mode 666; re-push existing content so perms stay fixed without a wipe.
	$(SSHPASS) scp data/.htaccess $(HOST):data/.htaccess
	@tmp=/tmp/cylon-scores-deploy-$$$$.json; \
	if $(SSHPASS) scp $(HOST):data/scores.json "$$tmp" >/dev/null 2>&1; then \
		echo "data/scores.json present — refreshing mode 666 via scp -p"; \
	else \
		echo "[]" > "$$tmp"; \
		echo "bootstrapping empty data/scores.json"; \
	fi; \
	chmod 666 "$$tmp"; \
	$(SSHPASS) scp -p "$$tmp" $(HOST):data/scores.json; \
	rm -f "$$tmp"
