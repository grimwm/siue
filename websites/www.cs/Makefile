.PHONY: help deploy

.DEFAULT_TARGET := help

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload index.html and main.js to www.cs.siue.edu"

deploy:
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp *.html *.js *.css *.php *.png *.ico *.webmanifest wgrim@www.cs.siue.edu:.
	# Host allows SFTP/SCP only (no shell); upload data/ policy file only.
	# Do not upload .cylon-scores.json — that would wipe live high scores.
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp data/.htaccess wgrim@www.cs.siue.edu:data/.htaccess
