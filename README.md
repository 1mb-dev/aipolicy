# aipolicy

Generate AI policy files for your repository.

**[aipolicy.1mb.dev](https://aipolicy.1mb.dev)**

Creates `AI_POLICY.md`, `AGENTS.md`, and `CLAUDE.md` with three presets (Permissive, Standard, Strict) and full customization. No install, no sign-up -- pick a preset, download the files.

## What it generates

- **AI_POLICY.md** -- Declares how AI tools are used in your project. Covers usage policy, AI-generated code acceptance, CI/CD rules, training data opt-out, and contributor accountability.
- **AGENTS.md** -- Instructions for AI coding agents working in your repo. Code style, testing requirements, restricted paths, review policy.
- **CLAUDE.md** -- Claude Code configuration. References AGENTS.md rules. Can be a standalone file or symlink.

## Quick links

Presets load directly -- click, review, download:

- [Permissive](https://aipolicy.1mb.dev/?preset=permissive) -- AI tools welcome, no restrictions
- [Standard](https://aipolicy.1mb.dev/?preset=standard) -- AI tools with human review
- [Strict](https://aipolicy.1mb.dev/?preset=strict) -- AI tools restricted, explicit approval

Custom configurations work the same way. Configure once, share the URL:

```
https://aipolicy.1mb.dev/?preset=standard&ai_usage=restricted&training_optout=yes
```

## Features

- Three presets: Permissive, Standard, Strict
- Customize every option before generating
- URL-as-config -- share a link with your exact configuration
- Per-file copy or download all as ZIP
- Dark mode (auto / light / dark)
- No backend, no tracking, no dependencies

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no build step. Hosted on GitHub Pages.

## License

MIT
