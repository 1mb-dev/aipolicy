# Contributing

1. Fork the repo and create a branch from `main`.
2. Run `make install` to set up dependencies.
3. Make your changes. Keep commits atomic: one concern per commit.
4. Run `make check` (lint + preset validation) and fix any issues.
5. Open a pull request.

If your change touches templates in `public/lib/templates.js`, run `make generate` to regenerate the static preset files. It also writes this repository's `AI_POLICY.md` and `AGENTS.md` from the Standard preset: edit the templates, not those files, or `make check` fails.

For UI changes, run `make serve` (port 8919) and check by hand: each preset across all tabs, the URL round-trip and the ZIP download.

## Voice

Applies to site copy and meta, aria-labels, `public/llms.txt`, `README.md`, new CHANGELOG entries, commits and PRs. Generated policy text (`public/lib/templates.js`, `public/presets/`) is out of scope: it is the adopter's voice, and changing it is a product change.

- The site describes the files it generates and keeps its own opinions out. No persona, no selling.
- Short sentences. A name or number over an adjective. No I/we. Sentence case for headings, labels and titles.
- No em-dash, no ` -- ` used as a dash, and no time words (current, currently, now, latest, recently, today). Use a full stop, colon or comma for a dash, ` · ` in `<title>`, and a version or date for a time word. `make check` fails on any of these in `public/*.html`, `public/llms.txt` and `README.md`.
- Claim only what was run or can be cited.
- Preset descriptions: the cards in `public/index.html` are canonical; README and llms.txt copy them verbatim.
- Commits: `<type>(<scope>): <subject>`, subject only. CHANGELOG: one line per change.
