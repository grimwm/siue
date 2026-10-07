.PHONY: help deploy

.DEFAULT_TARGET := help

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload site + games assets to www.cs.siue.edu"

deploy:
	@test -f cylon.js || ln -sf games/cylon/cylon.js cylon.js
	@test -f cylon-mount.html || ln -sf games/cylon/mount.html cylon-mount.html
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp *.html *.js *.css *.php *.png *.ico *.webmanifest wgrim@www.cs.siue.edu:.
	# Game modules (creates games/ on the host if needed)
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp -r games wgrim@www.cs.siue.edu:.
	# Host allows SFTP/SCP only (no shell); upload data/ policy file only.
	# Do not upload .cylon-scores.json — that would wipe live high scores.
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp data/.htaccess wgrim@www.cs.siue.edu:data/.htaccess
