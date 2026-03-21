.PHONY: help serve generate lint check validate install clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

serve: ## Start local dev server on port 8919
	python3 -m http.server 8919 -d public

generate: ## Regenerate static preset files from templates
	node scripts/generate-presets.js

lint: ## Run all linters (html, css, js)
	npm run lint

lint-fix: ## Run linters with auto-fix where possible
	npx stylelint 'public/styles/**/*.css' --fix
	npx eslint public/scripts/ --fix

check: ## Run linters + validate preset drift
	npm run check

validate: ## Verify static presets match JS templates
	node scripts/validate-presets.js

install: ## Install dev dependencies
	npm install

clean: ## Remove generated files
	rm -rf node_modules
