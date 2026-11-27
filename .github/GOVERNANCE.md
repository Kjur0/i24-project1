# Project Governance

This guide explains how work is proposed, selected, reviewed, and maintained
in webmaster.rip. The repository owner and designated maintainers are
responsible for project direction and final decisions. They welcome
contributor input, but the project does not use a formal voting process.

## Collaboration spaces

GitHub Issues and pull requests are the project's public work-tracking and
review spaces. Discussions, Projects, and the repository Wiki are not used.
Keep project documentation in the repository so that changes can be reviewed
and versioned alongside the code.

## Issue intake and planning

Use the issue form that best matches the report. Contributors should describe
the problem, desired outcome, and acceptance criteria when known; maintainers
triage each issue and are responsible for its:

- issue type, priority, and effort;
- labels, assignees, and parent/sub-issue relationships;
- status and decision about whether the work is ready for contributions; and
- development branch and pull request relationships.

Contributors do not need to choose issue fields or apply labels. Keep issue
descriptions focused on scope and acceptance criteria. Use GitHub's native
relationships instead of repeating linked issue numbers in checklists.

### Planning statuses and contribution availability

The GitHub issue-status feature is in public preview and may change. This
project uses its built-in statuses rather than labels to show lifecycle:

- **Backlog** means the work has not been selected and prepared for
  contribution. Do not start it without maintainer agreement.
- **Todo** means maintainers have selected and prepared the work. An
  **unassigned Todo** issue is the only status that signals work is open for
  contributors to request. Ask a maintainer before starting; maintainers
  confirm scope and assignment.
- **In progress** and **In review** indicate that work is already underway or
  being reviewed. Do not start a parallel contribution unless a maintainer
  invites you.

An assigned issue or pull request is reserved for its assignee, regardless of
its status. Do not take over assigned work without the assignee's or a
maintainer's agreement.

GitHub may update statuses automatically: assigning a person can move an
issue from Backlog to Todo; linking a draft pull request can move it to In
progress; and linking or marking a pull request ready for review can move it
to In review. Maintainers keep the status and assignment aligned with actual
progress.

## Pull request review and merging

Contributors may open a pull request for an unrelated improvement without
creating an issue first. For tracked work, use the issue as the source of
truth for scope and acceptance criteria.

Every contribution must be visible in a draft pull request while work is in
progress. Open one as soon as the work branch has its first commit, including
for maintainer-led work. The title, summary, and native relationship should
make the issue being worked on clear; for independent work, say that no issue
applies. Keep the pull request in draft until it is complete and ready for
review.

Use a closing keyword such as `Closes #123` when a pull request fully resolves
an issue. Do not use a closing keyword for partial work. Maintainers manage
native Development relationships for related or partial work and ensure the
issue remains open when appropriate.

Maintainers are responsible for pull request labels, assignees, reviewers,
issue relationships, and merge decisions. Contributors should provide a
concise change summary, report exact validation results, respond to review
feedback, and keep the pull request focused. An assigned pull request is
reserved for its assignee unless maintainers invite collaboration.

Changes are merged through pull requests to `main`, subject to the active
repository review and required-check rules. Only maintainers merge changes.
Maintainers may close a draft when a proposed contribution is not wanted or is
out of scope, and should explain the decision.

## Maintainer responsibilities

Maintainers are expected to:

- triage reports and keep issue scope and acceptance criteria understandable;
- set and maintain issue classification, planning fields, labels, assignments,
  relationships, and development branches;
- identify work that is ready for contributors and keep assignment/status
  signals accurate;
- coordinate pull request review, required checks, and merging;
- communicate material changes in scope or review readiness; and
- handle security reports privately under the [security policy](./SECURITY.md).

## Contributor expectations

Contributors should use the appropriate issue form, avoid sharing secrets or
personal information, ask before taking assigned or Backlog work, and follow
the review and validation guidance in [CONTRIBUTING.md](./CONTRIBUTING.md).
Human contributors remain responsible for any work they submit, including
work produced with coding agents.
