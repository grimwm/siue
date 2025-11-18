.PHONY: help deploy

.DEFAULT_TARGET := help

help:
	@echo "Available targets:"
	@echo "  help   - Show this help message"
	@echo "  deploy - Upload index.html and main.js to www.cs.siue.edu"

deploy:
	sshpass -f "$(HOME)/.ssh/.passwd.siue" scp index.html main.js wgrim@www.cs.siue.edu:.
