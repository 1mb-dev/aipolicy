# Changelog

## v1.1.0 (2026-03-21)

Repo hygiene, self-adoption, and polish.

- CI: shared workflows from 1mb-dev/.github, tag-triggered deploy
- Dependabot for GitHub Actions and npm dependencies
- Convention drift detection cron (weekly, creates issues on change)
- Arrow-key navigation on preset cards (WAI-ARIA radio group)
- Debounce on text input (250ms)
- Cloudflare Web Analytics (cookieless)
- Self-adopted: AI_POLICY.md + AGENTS.md committed (Standard preset)
- GitHub community files: CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, templates
- Copy button icon preserved after click
- Tab bar scrollbar removed
- README and page copy tightened per review
- Dark mode CSS token deduplication

## v1.0.0 (2026-03-21)

Initial release.

- Three presets: Permissive, Standard, Strict
- Three generated files: AI_POLICY.md, AGENTS.md, CLAUDE.md
- Customization panel with 9 options
- URL-as-config for sharing configurations
- Per-file copy + Download All as ZIP
- Theme toggle (auto / light / dark)
- Convention explainer with references
- Accessible: ARIA roles, keyboard navigation, screen reader support
