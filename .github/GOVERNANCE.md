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
  signed commits.
- Blocks branch deletion and non-fast-forward updates.
- Requires extra approval for unattributed changes.
- Runs CodeQL with a high-or-higher security-alert threshold and an errors
  code-scanning threshold; code-quality findings use a warning threshold.
- Has zero required approving reviews, does not dismiss stale approvals, has no
  required CI status check, and has no bypass actors.

Recommended ruleset policy:

1. Keep one active ruleset for `main`; add the `lint-and-typecheck` status
   check after verifying its exact name in a current pull request.
2. Require one independent approval and dismiss stale approvals when a second
   eligible reviewer is available. `@Kjur0` is the current CODEOWNER, so test
   whether the existing code-owner review rule prevents the sole owner from
   merging their own PR. If it does, add another reviewer or temporarily
   remove that requirement; avoid a broad bypass.
3. Keep pull-request review, conversation resolution, signed commits, branch
   deletion protection, and force-push protection enabled.
4. Consider a separate `release-tags` ruleset for `v*` tags only when this
   project begins publishing versioned releases. No additional feature-branch
   ruleset is needed for the current GitHub Flow.
5. Do not add a push ruleset for this public repository; use secret scanning
   and push protection instead.

GitHub aggregates overlapping rulesets and applies the most restrictive
version of each rule, so avoid duplicate rules targeting `main`.

## Security and automation settings

Verified repository settings include Dependabot security updates, secret
scanning, push protection, and private vulnerability reporting. Scanning for
non-provider secret patterns and secret validity checks are disabled.
Dependabot weekly version updates are configured in `.github/dependabot.yml`.
CI and CodeQL workflows are defined under `.github/workflows/`; workflow
permissions should remain least-privilege. The repository currently allows
all GitHub Actions and does not require actions to be pinned to full commit
SHAs.

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

Keep `README.md`, `CITATION.cff`, the eventual `LICENSE`, ecosystem manifests,
and root `AGENTS.md` in the repository root. GitHub's citation feature looks
for `CITATION.cff` there, and coding agents discover shared instructions from
the root `AGENTS.md`.

The repository does not yet have a `LICENSE`. The owner must select and add one
before the project can claim a license; contributors and agents must not choose
one on the owner's behalf.

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
