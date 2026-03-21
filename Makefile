.PHONY: help serve generate lint lint-fix test check validate install clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

serve: ## Start local dev server on port 8919
	python3 -m http.server 8919 -d public

generate: ## Regenerate static preset files from templates
	node scripts/generate-presets.js

lint: ## Run all linters (html, css, js, md)
	npm run lint

lint-fix: ## Run linters with auto-fix where possible
	npx stylelint 'public/styles/**/*.css' --fix
	npx eslint public/scripts/ --fix
	npx markdownlint-cli2 --fix '*.md' 'public/presets/**/*.md'

test: ## Test generated markdown across all preset combinations
	npm run test:presets

check: ## Run linters + tests + validate preset drift
	npm run check

validate: ## Verify static presets match JS templates
	node scripts/validate-presets.js

install: ## Install dev dependencies
	npm install

clean: ## Remove generated files and node_modules
	rm -rf node_modules .tmp-test-presets
