# GitHub Governance

This guide records the repository's GitHub workflow, current settings, and
maintainer recommendations. Repository documentation is the source of truth
for project behavior; GitHub Issues and pull requests are the source of truth
for work scope and review progress.

## Repository features

| Feature       | Current setting                               | Decision                                                                                                                                                                                                                                      |
| ------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issues        | Enabled                                       | Keep enabled for bug reports, requests, and tracked work.                                                                                                                                                                                     |
| Pull requests | In use; required by the active `main` ruleset | Keep enabled and use for changes.                                                                                                                                                                                                             |
| Discussions   | Disabled                                      | Keep disabled until there is an active community that needs a separate discussion space. Support and issue forms already cover the current needs.                                                                                             |
| Wiki          | Disabled                                      | Keep project documentation versioned in this repository rather than split across a wiki. No wiki repository was present when checked.                                                                                                         |
| Projects      | Feature enabled                               | Do not create a project board for the current workload. Native issue types, fields, planning status, and parent/sub-issue relationships are sufficient. Reconsider a board only if cross-repository or multi-team planning becomes necessary. |

## Issues and labels

Use GitHub issue types to classify work:

- **Bug** for broken or unexpected behavior.
- **Feature** for a user-facing capability or enhancement.
- **Task** for documentation, maintenance, and other planned work.

Set the native **Priority** field (`Urgent`, `High`, `Medium`, `Low`) and
**Effort** field (`High`, `Medium`, `Low`) on issues. Assign an owner to active
work. Do not copy priority, effort, or lifecycle into labels.

These user-level fields are currently **Restricted**. GitHub makes restricted
fields visible only to the repository owner and collaborators with at least
read access, so public visitors may not see their values. Making them public
would affect the account-level fields across repositories; the owner should
decide whether broader visibility is wanted before changing that setting.

Labels describe topic or triage category only. The repository's useful label
set includes:

| Label           | Use                                                  |
| --------------- | ---------------------------------------------------- |
| `bug`           | Broken or unexpected behavior                        |
| `enhancement`   | New capability or improvement                        |
| `documentation` | Documentation work                                   |
| `accessibility` | Accessibility barriers or improvements               |
| `security`      | Security reports, hardening, and security automation |
| `frontend`      | User interface and browser behavior                  |
| `backend`       | Server behavior, authentication, and data handling   |
| `dependencies`  | Dependency updates                                   |

Use `good first issue`, `help wanted`, `duplicate`, `invalid`, `question`, and
`wontfix` when their meanings apply. Never create status labels such as
`backlog`, `in-progress`, or `in-review`, or labels that duplicate native
Priority or Effort fields.

## Planning status and issue relationships

GitHub issue statuses are a public preview and may change. For open work, use
**Backlog**, **Todo**, **In progress**, and **In review**; GitHub sets terminal
statuses when an issue is closed. Assigning a person moves an unstarted issue
to **Todo**. Linking a draft PR moves it to **In progress**, and linking or
marking a PR ready for review moves it to **In review**. Confirm that GitHub
has the correct native link before manually changing a status.

Use GitHub's native parent/sub-issue and pull request **Development**
relationships instead of repeating those links in issue and PR descriptions
or checklists. A closing keyword such as `Closes #123` both links the issue and
closes it when a PR to the default branch is merged; use it only when the PR
fully resolves that issue. For related or partially addressed work, create a
native Development link without a closing keyword. Do not use issue-reference
checkboxes to represent these relationships.

Keep issue descriptions focused on scope and acceptance criteria. Keep PR
descriptions focused on the change, validation, and review checklist. Add a
concise progress comment when scope or review readiness materially changes.

## `main` ruleset

The active `MASTER` ruleset targets the default branch (`main`). It currently:

- Requires pull requests, CODEOWNERS review, review-thread resolution, and
  signed commits.
- Blocks branch deletion and non-fast-forward updates.
- Requires extra approval for unattributed changes.
- Runs CodeQL with a high-or-higher security-alert threshold and an errors
  code-scanning threshold; code-quality findings use a warning threshold.
- Has zero required approving reviews, does not dismiss stale approvals, has no
  required CI status check, and has no bypass actors.

Recommended owner review:

1. Require the `lint-and-typecheck` CI check after verifying its exact name in
   the latest pull request's checks.
2. Decide whether to require an approval and dismiss stale approvals after new
   commits. If the repository has only one eligible reviewer, document a
   narrowly scoped review/bypass policy rather than making the branch
   impossible to update.
3. Keep CODEOWNERS review and review-thread resolution enabled, and periodically
   confirm that `@Kjur0` is still the right owner.
4. Consider limiting allowed GitHub Actions and requiring actions to be pinned
   to full commit SHAs. The current workflows use version tags and the
   repository allows all actions.

## Security and automation settings

Verified repository settings include Dependabot security updates, secret
scanning, push protection, and private vulnerability reporting. Dependabot
weekly version updates are configured in `.github/dependabot.yml`. CI and
CodeQL workflows are defined under `.github/workflows/`; workflow permissions
should remain least-privilege.

Review security alerts and Dependabot pull requests promptly. Do not put
credentials, private keys, certificates, OTP values, or sensitive personal
data in issues, pull requests, workflow logs, or commits.

## Community files and owner follow-up

Keep the following repository-owned guidance current:

- `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `SECURITY.md`, and
  `ACCESSIBILITY.md`.
- `CITATION.cff`, `.github/CODEOWNERS`, issue forms in
  `.github/ISSUE_TEMPLATE/`, and `.github/pull_request_template.md`.

The repository does not yet have a `LICENSE`. The owner must select and add one
before the project can claim a license; contributors and agents must not choose
one on the owner's behalf.

## Official references

- [GitHub flow](https://docs.github.com/get-started/using-github/github-flow)
- [Linking pull requests to issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Adding sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)
- [Issue statuses (public preview)](https://docs.github.com/en/enterprise-cloud@latest/issues/tracking-your-work-with-issues/learning-about-issues/about-issue-statuses)
- [Managing issue fields](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields)
- [Microsoft Learn: GH-900 GitHub Foundations study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-900)

The GH-900 outline covers GitHub flow, issue and pull request collaboration,
linking, templates, assignments, and Projects as distinct capabilities. It is
a foundations guide, not a requirement to enable every feature in every
repository; the choices above are based on this project's needs.

## Where guidance belongs

- `AGENTS.md` contains shared implementation guidance for all coding agents.
- `.github/copilot-instructions.md` contains Copilot-only Git and GitHub
  workflow instructions.
- `CONTRIBUTING.md` describes the human contribution workflow.
- This file records maintainer decisions and GitHub settings.

Do not commit environment-managed skills or modify `skills-lock.json`.
