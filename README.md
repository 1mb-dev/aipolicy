# aipolicy

[![CI](https://github.com/1mb-dev/aipolicy/actions/workflows/ci.yml/badge.svg)](https://github.com/1mb-dev/aipolicy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generate AI policy files for your repository.

**[aipolicy.1mb.dev](https://aipolicy.1mb.dev)**

Creates AI policy and tool config files (`AI_POLICY.md`, `AGENTS.md`, `CLAUDE.md`, Copilot, Cursor) with three presets and full customization. No install, no sign-up -- pick a preset, download the files.

## What it generates

- **`AI_POLICY.md`** -- How AI tools are used in your project: usage policy, code acceptance, CI/CD rules, training data opt-out.
- **`AGENTS.md`** -- Instructions for AI coding agents: code style, testing, restricted paths, review policy.
- **`CLAUDE.md`** -- Claude Code configuration. References AGENTS.md rules.
- **`.github/copilot-instructions.md`** -- Project-wide instructions for GitHub Copilot.
- **`.cursor/rules/aipolicy.mdc`** -- Cursor IDE rules file (Chat, Composer, and Agent mode).

## Presets

- [Open](https://aipolicy.1mb.dev/?preset=open) -- AI tools welcome, standard quality bar
- [Standard](https://aipolicy.1mb.dev/?preset=standard) -- AI tools with human review
- [Strict](https://aipolicy.1mb.dev/?preset=strict) -- AI tools restricted, explicit approval

Configure any option, share the URL:

```text
https://aipolicy.1mb.dev/?preset=standard&ai_usage=restricted&training_optout=yes
```

## CLI

Download preset files directly. Static curl paths are flat under each preset; use `-o <target-path>` with `--create-dirs` to land each file at the right place in your repo:

```bash
# Root-level files
curl -O https://aipolicy.1mb.dev/presets/standard/AI_POLICY.md
curl -O https://aipolicy.1mb.dev/presets/standard/AGENTS.md
curl -O https://aipolicy.1mb.dev/presets/standard/CLAUDE.md

# Tool config files (target paths in your repo are nested)
curl --create-dirs -o .github/copilot-instructions.md \
  https://aipolicy.1mb.dev/presets/standard/copilot-instructions.md
curl --create-dirs -o .cursor/rules/aipolicy.mdc \
  https://aipolicy.1mb.dev/presets/standard/aipolicy.mdc
```

Available presets: `open`, `standard`, `strict`. For custom configurations, use the web UI and download the ZIP — the ZIP uses the canonical nested paths so it extracts straight into your repo with no path adjustments.

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md). Vanilla HTML, CSS, and JavaScript -- no framework, no build step.

## License

MIT
