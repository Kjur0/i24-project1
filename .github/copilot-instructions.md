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
- An unassigned **Todo** issue is open for contribution; contributors do not
  need maintainer approval before starting. **Backlog** issues are not open,
  and assigned issues remain reserved for their assignee.
- Maintainers are responsible for issue type, Priority, Effort, labels,
  assignees, relationships, and development branches. They also manage pull
  request labels, assignees, and reviewers. Do not tell contributors to set
  these fields or change them without an explicit maintainer request.
- Issue forms set the issue type through metadata. Keep issue titles
  descriptive; do not add an issue-type prefix.
- Use GitHub's **Backlog**, **Todo**, **In progress**, and **In review**
  planning statuses, not labels, for lifecycle. GitHub automatically moves
  an issue from Todo to In progress when an open draft PR is natively linked.
  Contributors should mention the issue in the draft PR but must not add the
  native Development link or a closing keyword before a maintainer confirms
  scope and assignment. Maintainers monitor draft PRs; after confirming,
  they assign the contributor and add the native link, moving the issue to
  In progress.
- For larger issues, maintainers may create an integration branch for the
  parent issue. Branches and PRs for its sub-issues should be based on and
  target that integration branch, not `main`. Once the parent work is
  complete, submit its integration branch to `main`.
- Prefer native parent/sub-issue and pull request **Development** links after
  maintainer confirmation. Do not repeat relationships already visible in
  GitHub unless the reference is needed for direct context.
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
- Prefer `pnpm lint:fix` when fixing lint issues. Husky's pre-commit hook
  automatically runs staged-file code and Markdown linting and formatting,
  then full lint, typechecking, and `pnpm format:check`; do not bypass these
  checks.
- Follow the digital-signature, sign-off, and attribution requirements in
  [CONTRIBUTING.md](./CONTRIBUTING.md). Do not duplicate literal trailer
  values here.

## Repository guidance

Follow the shared implementation guidance in the root `AGENTS.md` and the
human contribution process in `.github/CONTRIBUTING.md`. Project governance
and maintainer responsibilities are described in `.github/GOVERNANCE.md`.

Do not commit environment-managed skills or edit `skills-lock.json` or
`.agents/skills/`.
