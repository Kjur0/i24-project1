# Contributing

Thank you for helping improve webmaster.rip. Contributions should be respectful,
focused, and safe for users and maintainers.

## Before you start

- Check open issues and the issue's planning status before starting substantial
  work.
- For a large change, open or comment on an issue first so the intended scope is
  clear.
- Choose the appropriate native issue type (**Bug**, **Feature**, or **Task**)
  and set **Priority** and **Effort**. The bug and feature forms assign their
  issue types automatically. Assign active work and use the labels below for
  area or contribution intent, not status, type, priority, or effort.
- Do not publish credentials, personal data, OTP codes, certificates, or private
  keys in issues, pull requests, logs, or commits.

## Labels

| Label              | Use it when                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `accessibility`    | The issue concerns an accessibility barrier or improvement.                                                                        |
| `backend`          | Work concerns server behavior, authentication, or data handling.                                                                   |
| `dependencies`     | A dependency is being updated or needs maintenance.                                                                                |
| `documentation`    | The change is primarily documentation.                                                                                             |
| `frontend`         | Work concerns the UI or browser behavior.                                                                                          |
| `security`         | Reporting a security concern or improving security controls.                                                                       |
| `good first issue` | The task has clear acceptance criteria, a small scope, and is suitable for a first contribution; maintainers can provide guidance. |
| `help wanted`      | Maintainers are actively inviting outside help on this specific task.                                                              |
| `question`         | A support or clarification question needs an answer; do not use it as a generic work status.                                       |

`good first issue` is a newcomer suitability signal, not a promise that no
context is needed. `help wanted` is an explicit request for help, not a synonym
for an open issue. Use the native **Bug**, **Feature**, and **Task** issue
types instead of generic `bug` or `enhancement` labels. Use GitHub's
**Duplicate** or **Not planned** close reason instead of `duplicate` or
`wontfix` labels. The complete label and status policy is in
[GOVERNANCE.md](./GOVERNANCE.md).

## Development setup

Follow the setup instructions in the [README](../README.md). The project uses
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

## GitHub flow and pull requests

Follow [GitHub flow](https://docs.github.com/get-started/using-github/github-flow):

1. For substantial work, agree on scope in an issue before implementation.
2. Create a short-lived topic branch from `main`; keep unrelated work on
   separate branches.
3. Make focused changes, commit and push them regularly, and keep each commit
   understandable on its own.
4. Open a pull request with a concise summary, progress checklist, and
   validation results. Use a draft pull request for early feedback while work
   is ongoing; mark it ready when the pushed changes are reviewable.
5. Link related issues through GitHub's **Development** section or use a
   closing keyword such as `Closes #123` when the pull request fully resolves
   that issue. Do not repeat those relationships in a checklist.
6. Respond to review feedback, keep the branch current, and merge only after
   the required reviews and checks pass. Delete the branch after merge when it
   is no longer needed.

- Use a clear [Conventional Commit](https://www.conventionalcommits.org/)
  subject, for example `docs: explain local HTTPS setup` or
  `fix: validate OTP expiry`.
- Make focused commits as work progresses. Copilot-authored commits must
  include this trailer:

  ```text
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

- Update documentation when behavior or setup changes.
- Preserve existing formatting and component patterns.
- Keep issue descriptions focused on scope and acceptance criteria. Use native
  parent/sub-issue and pull request Development links instead of duplicating
  those relationships in descriptions or checklists.
- Include a concise change summary, progress checklist, and test results in
  the pull request. Use `Closes #123` only when the pull request fully resolves
  that issue; do not repeat other relationships already shown by GitHub.

## Review and project status

Use GitHub's issue-status preview for open work: **Backlog**, **Todo**, **In
progress**, and **In review**. GitHub automatically moves an issue to **Todo**
when a person is assigned, to **In progress** when a draft pull request is
linked, and to **In review** when a linked pull request is ready for review.
Confirm the native issue/PR relationship before changing status manually. Do
not create labels to represent statuses; labels are for topic/category triage.

Respond to review feedback and keep issue scope and PR progress accurate as
work changes. Add concise progress comments when scope or review readiness
materially changes. Copilot alone performs Git and GitHub operations in this
repository; see [the Copilot instructions](./copilot-instructions.md).

For the distinction between native issue linking, closing keywords, and
status automation, see GitHub's
[issue-linking documentation](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
and [issue-status documentation](https://docs.github.com/en/enterprise-cloud@latest/issues/tracking-your-work-with-issues/learning-about-issues/about-issue-statuses).

## License

The repository owner has not selected a license yet. Do not assume that
contribution grants permission to use or redistribute the project. The project
license will be added after the owner chooses it.
