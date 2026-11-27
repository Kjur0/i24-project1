# GitHub Governance

This guide records the repository's GitHub workflow, current settings, and
maintainer recommendations. Repository documentation is the source of truth
for project behavior; GitHub Issues and pull requests are the source of truth
for work scope and review progress.

## Repository features

| Feature       | Current setting                               | Decision                                                                                                                                                                                            |
| ------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issues        | Enabled                                       | Keep enabled for bug reports, requests, and tracked work.                                                                                                                                           |
| Pull requests | In use; required by the active `main` ruleset | Keep enabled and use for changes.                                                                                                                                                                   |
| Discussions   | Disabled                                      | Keep disabled until there is an active community that needs a separate discussion space. Support and issue forms already cover the current needs.                                                   |
| Wiki          | Disabled                                      | Keep project documentation versioned in this repository rather than split across a wiki. No wiki repository was present when checked.                                                               |
| Projects      | Disabled                                      | Keep disabled while native issue types, fields, statuses, and parent/sub-issue relationships meet the planning needs. Reconsider only if cross-repository or multi-team planning becomes necessary. |

## Issues and labels

Use GitHub issue types to classify work. The bug and feature issue forms set
their types automatically; use **Task** for documentation and maintenance.

- **Bug** for broken or unexpected behavior.
- **Feature** for a user-facing capability or improvement.
- **Task** for documentation, maintenance, and other planned work.

Set the native **Priority** field (`Urgent`, `High`, `Medium`, `Low`) and
**Effort** field (`High`, `Medium`, `Low`) on issues. Assign an owner to active
work. Do not duplicate issue types, priority, effort, or lifecycle with labels.

These user-level fields are currently **Restricted**. GitHub makes restricted
fields visible only to the repository owner and collaborators with at least
read access, so public visitors may not see their values. Making them public
would affect the account-level fields across repositories; the owner should
decide whether broader visibility is wanted before changing that setting.

Labels describe work area or contribution intent. Their definitions are
maintained in [CONTRIBUTING.md](./CONTRIBUTING.md). Use native issue types
instead of `bug` and `enhancement` labels, and GitHub's **Duplicate** or
**Not planned** close reason instead of `duplicate` and `wontfix`. Remove vague
or redundant labels rather than adding labels for issue state, priority,
effort, or type.

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

## Rulesets

The active `MASTER` ruleset targets the default branch (`main`). It currently:

- Requires pull requests, CODEOWNERS review, review-thread resolution, and
  approval of the latest reviewable push by someone other than its pusher.
- Dismisses stale approvals when new reviewable commits are pushed.
- Blocks branch deletion and non-fast-forward updates.
- Has zero general approving reviews. The configured extra approval for
  unattributed changes only takes effect when a non-zero approval count is
  required.
- Runs CodeQL with a high-or-higher security-alert threshold and an errors
  code-scanning threshold; code-quality findings use a warning threshold.
- Requires `lint-and-typecheck`, `Analyze JavaScript and TypeScript`, and
  `CodeQL` status checks, and requires the branch to be up to date.
- Allows repository administrators to bypass rules on pull requests only.

The supplied screenshots showed one general approval, while the owner selected
zero. The other pictured review, bypass, check, and scanning settings are now
active as listed above. The ruleset's extra approval for unattributed Copilot
changes remains configured, but has no effect while the general approval count
is zero.

For this setup:

- **Repository-admin bypass, pull requests only** keeps changes on the PR
  path and in the audit trail while allowing an administrator to explicitly
  bypass review/check rules when necessary. **Always** would also allow direct
  pushes that bypass the PR gate.
- **CODEOWNERS, stale-review dismissal, and latest-push approval** provide
  review safeguards without a general approval count. The latest-push rule
  independently requires another person to approve the newest reviewable push.
  The sole maintainer cannot approve their own PR; a PR-only admin bypass is
  the practical escape hatch unless a second eligible reviewer is added.
- **`lint-and-typecheck`** runs the repository's ESLint and TypeScript checks.
  The CodeQL workflow's job is named **Analyze JavaScript and TypeScript**.
  The required **CodeQL** check confirms the security analysis result, which
  is also governed by the code-scanning thresholds. Requiring all three checks
  covers CI, successful analysis execution, and the uploaded security result.
- The **`github-advanced-security`** check observed on some PRs comes from a
  dynamic Copilot code-scanning workflow, not the repository's stable CI or
  CodeQL workflow; do not make that transient check a required status.
  Dependabot is dependency-update automation, not a required baseline check.
- Both workflows explicitly handle `ready_for_review` and skip their jobs for
  draft PRs. CI's lightweight change detector skips lint and typechecking for
  documentation-only PRs; GitHub treats the skipped required job as successful.
  CodeQL still runs for every non-draft PR because the active code-scanning
  result threshold needs an analysis result. Avoid workflow-level path filters,
  which can leave required checks pending. A maintainer can manually dispatch
  CI for a significant change on a draft PR.
- **Require branches to be up to date** means the PR must include current
  `main` and its checks must pass against that updated code. **Do not require
  status checks on creation** allows a repository or branch to be created
  even if a required check would otherwise prohibit it; it does not waive
  required checks at merge.
- The CodeQL **High or higher** security threshold blocks merging for findings
  at those severities; the **Errors** alert threshold blocks scanner errors.
  **Warnings and higher** code-quality severity blocks unresolved warnings and
  errors. Code coverage and automatic Copilot review are disabled in the
  screenshots.

Ruleset policy:

1. Keep the active `MASTER` ruleset as the single ruleset for `main`.
2. Keep the three stable required checks; avoid requiring transient Copilot
   checks or Dependabot as baseline checks.
3. Keep pull-request review, conversation resolution, signed commits, branch
   deletion protection, force-push protection, and the PR-only admin bypass.
4. No release-tag ruleset is currently needed if the project will not publish
   releases. No additional feature-branch ruleset is needed for this GitHub
   Flow.
5. Do not add a push ruleset for this public repository; use secret scanning
   and push protection instead.

GitHub aggregates overlapping rulesets and applies the most restrictive
version of each rule, so avoid duplicate rules targeting `main`.

## Security and automation settings

The repository's pull-request creation cap is enabled at **two open PRs** and
does not count drafts. It applies to contributors without write access and
exempts contributors after **one merged PR**. The exemption was verified in
repository settings; the REST API exposes the cap and draft setting but not
this exemption.

Verified repository settings include Dependabot security updates, secret
scanning, push protection, and private vulnerability reporting. Scanning for
non-provider secret patterns and secret validity checks are disabled.
Dependabot weekly version updates are configured in `.github/dependabot.yml`.
CI and CodeQL workflows are defined under `.github/workflows/`; workflow
permissions should remain least-privilege. All GitHub Actions are currently
allowed, and the repository does not require full-SHA pins. The workflows use
major-version tags such as `@v4`, as preferred by the owner. Unlike commit
SHAs, version tags are mutable and may point to updated action code over time.

Review security alerts and Dependabot pull requests promptly. Do not put
credentials, private keys, certificates, OTP values, or sensitive personal
data in issues, pull requests, workflow logs, or commits.

## Community files and owner follow-up

GitHub recognizes supported community health files under `.github/`, at the
repository root, or under `docs/`, preferring `.github/`. This repository
keeps contributor and policy files under `.github/` and user-facing
accessibility guidance under `docs/`:

- `.github/CODE_OF_CONDUCT.md`, `.github/CONTRIBUTING.md`,
  `.github/GOVERNANCE.md`, `.github/SECURITY.md`, `.github/SUPPORT.md`, and
  `.github/CODEOWNERS`.
- `docs/ACCESSIBILITY.md`, issue forms in `.github/ISSUE_TEMPLATE/`, and
  `.github/pull_request_template.md`.

Keep `README.md`, `CITATION.cff`, `LICENSE`, ecosystem manifests, and root
`AGENTS.md` in the repository root. GitHub's citation and license detection
look for these files there, and coding agents discover shared instructions
from the root `AGENTS.md`.

## Agent instruction placement

- Root `AGENTS.md` is shared guidance for coding agents and contains the
  framework-specific instructions for Next.js, Tailwind, shadcn/ui, and
  modern-web guidance.
- `.github/copilot-instructions.md` contains Copilot-only Git and GitHub
  procedures.
- Skills are environment-provided and are not committed. These instruction
  files cannot technically prevent other agents from using Git/GitHub; enforce
  that boundary with host-level tool permissions and credentials.

## Official references

- [GitHub flow](https://docs.github.com/get-started/using-github/github-flow)
- [Linking pull requests to issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Adding sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)
- [Issue statuses (public preview)](https://docs.github.com/en/enterprise-cloud@latest/issues/tracking-your-work-with-issues/learning-about-issues/about-issue-statuses)
- [Managing issue fields](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields)
- [Community health file locations](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [CITATION.cff placement](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)
- [Interaction limits](https://docs.github.com/en/communities/moderating-comments-and-conversations/limiting-interactions-in-your-repository)
- [Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Creating repository rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [Code scanning merge protection](https://docs.github.com/en/code-security/concepts/code-scanning/merge-protection)
- [Code quality thresholds](https://docs.github.com/en/code-security/how-tos/maintain-quality-code/set-pr-thresholds)
- [Microsoft Learn: GH-900 GitHub Foundations study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-900)

The GH-900 outline covers GitHub flow, issue and pull request collaboration,
linking, templates, assignments, and Projects as distinct capabilities. It is
a foundations guide, not a requirement to enable every feature in every
repository; the choices above are based on this project's needs.

## Where guidance belongs

- Root `AGENTS.md` contains shared implementation guidance for all coding
  agents.
- `.github/copilot-instructions.md` contains Copilot-only Git and GitHub
  workflow instructions.
- `.github/CONTRIBUTING.md` describes the human contribution workflow.
- This file records maintainer decisions and GitHub settings.

Do not commit environment-managed skills or modify `skills-lock.json`.
