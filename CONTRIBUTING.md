# Contributing

Thank you for helping improve webmaster.rip. Contributions should be respectful,
focused, and safe for users and maintainers.

## Before you start

- Check open issues and the issue's planning status before starting substantial
  work.
- For a large change, open or comment on an issue first so the intended scope is
  clear.
- Do not publish credentials, personal data, OTP codes, certificates, or private
  keys in issues, pull requests, logs, or commits.

## Development setup

Follow the setup instructions in the [README](./README.md). The project uses
Node.js `26.11.1` or a compatible later 26.x release and pnpm `12.21.0`. CI
currently uses Node.js `26.13.1`.

Before opening a pull request, run:

```sh
pnpm lint
pnpm exec tsc --noEmit
```

There is not currently an automated test script. If a change requires MongoDB
or browser authentication, describe how you tested it and what services or
environment values were needed. Keep development OTP values out of published
logs and screenshots.

## Changes and pull requests

- Create a topic branch from `main`; avoid unrelated changes in the same pull
  request.
- Use a clear [Conventional Commit](https://www.conventionalcommits.org/)
  subject, for example `docs: explain local HTTPS setup` or
  `fix: validate OTP expiry`.
- Update documentation when behavior or setup changes.
- Preserve existing formatting and component patterns.
- Include a concise description, the related issue, and test results in the
  pull request.
- Use a closing keyword such as `Fixes #123` when the pull request fully
  resolves an issue. Do not use a closing keyword for partial work.
- Keep the pull request in draft until it is ready for maintainer review.

## Review and project status

Use GitHub's planning-status preview for work status: Backlog, Todo, In
progress, and In review. Do not create labels to represent those statuses.
Labels are for topic/category triage.

Please respond to review feedback and keep the issue checklist and pull request
description in sync as scope changes.

## License

The repository owner has not selected a license yet. Do not assume that
contribution grants permission to use or redistribute the project. The project
license will be added after the owner chooses it.
