# GitHub repository settings

These are owner actions; repository files cannot enable them on their own.

## Planning statuses

- Use GitHub's planning-status preview for issue lifecycle: **Backlog**,
  **Todo**, **In progress**, and **In review**.
- Do not create labels for lifecycle statuses. Keep topic/category labels
  separate from planning status.
- Set an issue to **In review** only after its work is pushed and linked to a
  reviewable, non-draft pull request.
- Use issue-reference-only checkboxes for issue tracking, one per line:
  `- [ ] #123`. Do not append descriptions to these checkbox lines; GitHub
  updates them from the linked issue's state.

## Protect the default branch

In **Settings → Rules → Rulesets**, add an active ruleset for `main`:

- Require changes to be proposed through a pull request.
- Require at least one approval; dismiss stale approvals after new commits.
- Require the `CI / lint-and-typecheck` check after it has completed on a PR.
- Block force pushes and branch deletion.
- Keep bypass permissions limited to maintainers who need them.

CODEOWNERS requests review from `@Kjur0`, but does not itself enforce approval.
Enable required code-owner review if that is the intended policy.

## Security and dependencies

- Enable the dependency graph and Dependabot alerts.
- Enable Dependabot security updates and version updates (the latter are
  configured in `.github/dependabot.yml`).
- Enable CodeQL code scanning and review its first results.
- Enable private vulnerability reporting in **Settings → Security → Code
  security and analysis**. Enable secret scanning and push protection when
  available for the repository.
- Restrict GitHub Actions permissions to read-only by default and grant
  additional permissions only to workflows that need them.

## Community metadata

- The owner must select a license with GitHub's License Chooser and add the
  chosen `LICENSE` file. Until then, do not claim the project has an open-source
  license.
- Keep `SUPPORT.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`,
  `ACCESSIBILITY.md`, `CITATION.cff`, and `.github/CODEOWNERS` current.
- Issue forms and the pull request template are in `.github/ISSUE_TEMPLATE/`
  and `.github/pull_request_template.md`.

After applying and verifying these settings, remove this temporary directory.
