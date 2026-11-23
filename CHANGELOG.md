# Changelog

## v1.3.3 (2026-11-23)

- `CLAUDE.md` imports `AGENTS.md` and drops the Testing, Restricted and Scope sections.
- `AGENTS.md`, `copilot-instructions.md`, `aipolicy.mdc`: four new General rules: instruction sources, pull requests and issues, secrets, package names.
- `AGENTS.md`, `copilot-instructions.md`, `aipolicy.mdc`: restricted AI usage renders one shared rule list.
- `copilot-instructions.md`, `aipolicy.mdc`: restricted paths read "Do not read or modify:", as `AGENTS.md` does.
- `AGENTS.md`, `copilot-instructions.md`, `aipolicy.mdc`: Review is omitted when review requirements are none.
- `copilot-instructions.md`, `aipolicy.mdc`: the strict intro states AI-generated code is not accepted.
- Prohibited AI usage: `AI_POLICY.md` drops Disclosure, Prohibited Uses and Licensing; the agent files carry one statement.
- `AI_POLICY.md`: Accountability adds the pull-request-and-issue sentence; Licensing covers tool terms and third-party material; the CI/CD line drops deployment; strict drops two duplicate lines.
- `AGENTS.md`: the Setup placeholder is an HTML comment; `aipolicy.mdc`: the `alwaysApply` comment is removed.
- Footer drops `· v1.0`.
- Code style renders in a fenced block; option text stays on one line and loses invisible characters (bidi, zero-width, tag, variation selectors) except ZWNJ and ZWJ.
- `conventions.json` adds five `monitor: false` sources.
- Site: README CLAUDE.md line; restricted-paths description.
- This repository's `AI_POLICY.md` and `AGENTS.md` are generated from the Standard preset.

## v1.3.2 (2026-05-12)

Hotfix: serve Copilot static curl path under a non-`.github` URL.

- `actions/upload-pages-artifact` excludes any `.github/` subdirectory
  from the deploy artifact (hardcoded `tar --exclude=.github`). The
  v1.3.1 hidden-files flag restored `.cursor/rules/` but couldn't fix
  `.github/`.
- Static curl paths are now flat: `presets/<preset>/copilot-instructions.md`
  and `presets/<preset>/aipolicy.mdc`. ZIP download still uses canonical
  nested paths (`.github/copilot-instructions.md`,
  `.cursor/rules/aipolicy.mdc`) so it extracts straight into a repo.
- README curl examples updated to land each file at the right repo path
  with `curl --create-dirs -o <target-path>`.
- `FILE_TYPES` gains an optional `staticPath` field (defaults to `path`).

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
