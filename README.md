# aipolicy

[![CI](https://github.com/1mb-dev/aipolicy/actions/workflows/ci.yml/badge.svg)](https://github.com/1mb-dev/aipolicy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generate AI policy files for your repository.

**[aipolicy.1mb.dev](https://aipolicy.1mb.dev)**

Creates `AI_POLICY.md`, `AGENTS.md`, and `CLAUDE.md` from three presets -- pick one, customize, download. Vanilla HTML/CSS/JS, no backend.

## Presets

- [Permissive](https://aipolicy.1mb.dev/?preset=permissive) -- AI tools welcome, no restrictions
- [Standard](https://aipolicy.1mb.dev/?preset=standard) -- AI tools with human review
- [Strict](https://aipolicy.1mb.dev/?preset=strict) -- AI tools restricted, explicit approval

## CLI

```bash
curl -O https://aipolicy.1mb.dev/presets/standard/{AI_POLICY,AGENTS,CLAUDE}.md
```

Available presets: `permissive`, `standard`, `strict`

## License

MIT
