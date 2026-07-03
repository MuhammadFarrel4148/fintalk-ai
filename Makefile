SHELL := /bin/bash

# Production Docker
up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f $(s)

# Testing
test: test-api test-web

test-api:
	cd apps/api && npm test

test-web:
	cd apps/web && npm test

# Local Development
install: install-api install-web

install-api: 
	cd apps/api && npm install

install-web:
	cd apps/web && npm install

# Code Quality and Code Formatting
check: 
	npm run lint && npm run format:check

fix:
	npm run lint:fix && npm run format