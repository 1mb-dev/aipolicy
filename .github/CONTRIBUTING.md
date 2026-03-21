# Contributing

1. Fork the repo and create a branch from `main`.
2. Run `make install` to set up dependencies.
3. Make your changes. Keep commits atomic — one concern per commit.
4. Run `make check` (lint + preset validation) and fix any issues.
5. Open a pull request.

If your change touches templates in `public/lib/templates.js`, run `make generate` to regenerate the static preset files.
