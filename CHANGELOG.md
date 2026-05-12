# Changelog

## v1.3.1 (2026-05-12)

Hotfix: serve hidden directories on Pages deploy.

- Set `include-hidden-files: true` on `actions/upload-pages-artifact`.
  v5 of that action defaults the flag to `false`, which silently dropped
  the new `presets/<p>/.github/` and `presets/<p>/.cursor/rules/`
  directories introduced by v1.3.0. Static curl paths for those files
  returned 404 in the v1.3.0 deploy; this restores them.

## v1.3.0 (2026-05-12)

Ecosystem coverage: Copilot and Cursor.

- Add `.github/copilot-instructions.md` template (GitHub Copilot project rules)
- Add `.cursor/rules/aipolicy.mdc` template (Cursor IDE rules, YAML frontmatter)
- Two new preview tabs, full keyboard navigation across all five files
- ZIP and static preset files now use nested paths mirroring real placement
- New `FILE_TYPES` export as single source of truth for build scripts
- New automated ZIP extraction test in `make check` (validates nested-path
  unzip across platforms via production code path)
- Backwards compatible: existing URL params, ZIP filename, and three original
  generated files unchanged

## v1.2.2 (2026-03-28)

Usability audit and post-release polish.

- Accessibility: external link `rel="noopener"`, WCAG touch targets (44px),
  success color contrast fix, nav landmark, customize-toggle prominence
- `llms.txt` with `<link rel="alternate">` discoverability
- Copyright year in consolidated footer
- Preset quick links on 404 page

## v1.2.1 (2026-03-22)

- Fix conventions.json v1.1: broken URLs, add notable guides

## v1.2.0 (2026-03-21)

Template evolution informed by real-world policies.

- Rename Permissive preset to Open
- Add AI disclosure option (Assisted-by trailer: encouraged or required)
- Standard: no AI-generated PR descriptions, no ping-pong during review
- Strict: stronger enforcement, scope restrictions, contextual disclosure
- All three tiers now produce distinct output in every section
- Backwards compatible: ?preset=permissive URLs still work

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
