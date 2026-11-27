# Copilot Instructions

## Git and GitHub operations

Copilot is currently the only agent with repository-specific instructions for
Git and GitHub operations. Do not delegate these operations to another agent
until that agent has its own repository instructions and the user has
authorized it to act.

Before editing a branch, issue, pull request, comment, label, or setting,
inspect the current state with GitHub CLI (`gh`) and preserve unrelated user
changes. Do not merge on the owner's behalf unless explicitly authorized.

## Issue and pull request workflow

- For issue-scoped work, treat the issue as the source of truth for scope,
  acceptance criteria, and decisions. Keep issue descriptions concise and
  update them when scope changes. An unrelated pull request does not need an
  issue.
- Open a draft pull request as soon as the work branch has its first commit.
  This applies to maintainer-led work as well as outside contributions. Make
  clear in the title and summary which issue is being worked on; for
  independent work, state that no issue applies.
- Maintainers are responsible for issue type, Priority, Effort, labels,
  assignees, relationships, and development branches. They also manage pull
  request labels, assignees, and reviewers. Do not tell contributors to set
  these fields or change them without an explicit maintainer request.
- Use GitHub's **Backlog**, **Todo**, **In progress**, and **In review**
  planning statuses, not labels, for lifecycle. An unassigned **Todo** issue
  is the signal that work is ready to be requested; assigned issues and PRs
  are reserved for their assignees. GitHub may advance status when a person is
  assigned or when a linked draft/ready PR changes state. Confirm native
  relationships before changing status manually.
- Prefer native parent/sub-issue and pull request **Development** links. Do
  not repeat relationships already visible in GitHub unless the reference is
  needed for direct context.
- Keep work-in-progress pull requests in draft. Do not wait for or treat
  intermediate draft checks as blocking. Run relevant checks before marking a
  PR ready and after significant changes; avoid application checks for
  documentation-only changes. Before marking ready, ensure applicable
  validation is complete and reported.
- Use a closing keyword only when the PR fully resolves an issue. For partial
  work, keep the issue open and use a native Development relationship. Do not
  use issue-reference checkboxes to link issues. Add a concise progress
  comment when scope or review readiness materially changes.
- A maintainer may close a draft PR if the contribution is not wanted or is
  out of scope. Respect the decision, and do not continue the work unless the
  maintainer agrees on a revised scope.
- Do not merge until required reviews and checks are satisfied. The owner
  must explicitly authorize any merge performed on their behalf.

## Commits

- Commit in focused increments using a clear Conventional Commit subject.
- Follow the digital-signature, sign-off, and attribution requirements in
  [CONTRIBUTING.md](./CONTRIBUTING.md). Do not duplicate literal trailer
  values here.

## Repository guidance

Follow the shared implementation guidance in the root `AGENTS.md` and the
human contribution process in `.github/CONTRIBUTING.md`. Project governance
and maintainer responsibilities are described in `.github/GOVERNANCE.md`.

Do not commit environment-managed skills or edit `skills-lock.json` or
`.agents/skills/`.
