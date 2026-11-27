# Copilot Instructions

## Git and GitHub ownership

Copilot is the only agent permitted to perform Git or GitHub operations in this
repository. Do not delegate Git/GitHub operations to another agent. Before
editing a branch, issue, pull request, comment, label, or setting, inspect the
current state with GitHub CLI (`gh`) and preserve unrelated user changes.

## Issue and pull request workflow

- Treat the issue as the source of truth for scope and acceptance criteria.
  Keep issue descriptions concise; update them when scope changes.
- Start scoped work on a topic branch from `main`, and push focused commits
  regularly so progress is backed up and visible.
- Use GitHub's **Backlog**, **Todo**, **In progress**, and **In review** planning
  statuses. GitHub automatically advances status when a person is assigned or
  a linked pull request becomes draft/ready. Confirm the native link and PR
  state before manually changing status. Never represent lifecycle with
  labels.
- Set an issue type, native Priority and Effort fields, an assignee, and
  topic-only labels for active issues. Do not create labels for status,
  priority, or effort.
- Prefer native parent/sub-issue and pull request **Development** links. Do
  not repeat relationships already visible in GitHub unless the reference is
  needed for direct context.
- Open or update a pull request for reviewable work. Keep its description
  concise and include a progress checklist and validation results. Use a
  closing keyword only for an issue fully resolved by the PR; for related or
  partial work, use the native Development relationship without a closing
  keyword. Do not use issue-reference checkboxes to link issues. Add a concise
  progress comment when scope or review readiness materially changes.
- Use a draft PR when requesting early feedback before work is complete; mark
  it ready when the pushed changes are validated and reviewable. Wait for the
  repository's required reviews and checks before merge; do not merge on the
  owner's behalf unless explicitly authorized.
- Assign the responsible maintainer and add relevant topic labels to pull
  requests.

## Commits

- Commit in focused increments using a clear Conventional Commit subject.
- Include this trailer on every Copilot-authored commit:

  ```text
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

- Follow the active `main` ruleset, including signed-commit requirements.

## Repository guidance

Follow the shared implementation guidance in the root `AGENTS.md` and the
human contribution process in `CONTRIBUTING.md`. Maintainer decisions and
verified GitHub settings are documented in
`docs/maintainers/github-governance.md`.

Do not commit environment-managed skills or edit `skills-lock.json` or
`.agents/skills/`.
