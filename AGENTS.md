# Shared Agent Instructions

## Project boundaries

- Keep changes focused and preserve existing behavior. Do not modify functional
  code for a documentation or repository-governance task.
- User-facing application text and user guides must be in Polish. Contributor,
  maintainer, and developer documentation should be in English.
- Treat the current application and checked-in documentation as the source of
  truth; do not describe abandoned or unimplemented behavior as available.
- Do not commit environment-managed skills or edit `skills-lock.json` or
  `.agents/skills/`.

## Web implementation guidance

- **React and rendering:** Check the existing App Router and server/client
  component boundaries before adding browser state, event handlers, or browser
  APIs. Keep components server-rendered unless client behavior is required.
- **Tailwind CSS:** The project uses Tailwind CSS v4. Follow the existing
  CSS-first setup and theme conventions in `app/globals.css`; do not introduce
  a Tailwind v3 configuration pattern.
- **shadcn/ui:** Treat `components.json` and the installed components as the
  source of truth for aliases, style, rendering mode, and icon library. Check
  current component documentation and APIs before using or adding a component.
  When available, use the shadcn skill; otherwise use the current component
  docs through `pnpm dlx shadcn@latest docs <component>`. Do not assume Radix
  and Base UI APIs are interchangeable. Use the project's package manager for
  CLI work and inspect existing components before adding or importing one.
- **Modern web platform:** Before implementing browser-facing HTML, CSS, DOM,
  forms, accessibility, security, performance, or date/time behavior, consult
  the available `modern-web-guidance` skill first, then current platform
  documentation. Preserve keyboard and assistive-technology behavior and
  follow recommended compatibility fallbacks for features that are not widely
  available.

## Git and GitHub operations

All agents, including Copilot, may perform Git and GitHub operations for this
repository when relevant and permitted by their available credentials. There
are no agent-specific restrictions; every agent must follow the same workflow
and preserve repository permissions and review requirements.

- Before editing a branch, issue, pull request, comment, label, or setting,
  inspect its current state with Git and/or GitHub CLI (`gh`) and preserve
  unrelated user changes.
- Do not merge on the owner's behalf unless explicitly authorized.

### Issue and pull request workflow

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

### Commits

- Commit in focused increments using a clear Conventional Commit subject.
- Prefer `pnpm lint:fix` when fixing lint issues. Husky's pre-commit hook
  automatically runs staged-file code and Markdown linting and formatting,
  then full lint, typechecking, and `pnpm format:check`; do not bypass these
  checks.
- For substantial AI-assisted PRs, leave final review and sign-off to the
  human contributor. Do not mark the PR ready until the human has reviewed
  the final diff and made the final signed-off commit described in
  [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). Commit completed work
  locally, then stop and wait for review without pushing. The human may
  amend the latest unpushed agent commit or add a signed empty commit as the
  final commit. Never perform that amendment, add a human trailer, create the
  empty sign-off commit, push while sign-off is pending, or add a commit
  after human sign-off. Do not amend an agent commit that has already been
  pushed.
- Follow the digital-signature, sign-off, and attribution requirements in
  [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). Do not duplicate
  literal trailer values here.

## Agent instruction map

- This root `AGENTS.md` is the shared source of truth for all agents,
  including Git and GitHub workflows.
- Skills are supplied by the agent environment. Use a relevant installed
  skill when available, but never copy skill files into this repository or
  modify the skills lock file.
- These instructions do not grant credentials or bypass repository
  permissions. All agents must follow the same rules and review requirements.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->
