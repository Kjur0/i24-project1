# Contributing

Thank you for helping improve webmaster.rip. Contributions should be
respectful, focused, and safe for users and maintainers.

## Before you start

- Check for an existing issue before starting substantial work. For
  issue-scoped work, follow the scope and acceptance criteria recorded there.
  An unassigned **Todo** issue is open for contribution; you do not need
  approval before starting. Do not start **Backlog** work or work assigned to
  someone else.
- Every contribution must be visible in a draft pull request while work is in
  progress. Open it as soon as the work branch has its first commit; this
  applies to maintainer-led work as well as outside contributions. Maintainers
  monitor draft PRs and confirm scope and assignment after they are opened.
- Use the issue form that best matches the report. Maintainers classify issues
  and manage their labels, issue types, priority, effort, assignees,
  relationships, and development branches. Contributors do not need to set
  those fields or apply labels.
- You do not need to create an issue for an unrelated pull request.
- Make the work being done clear in the draft pull request and mention the
  issue it addresses. Do not add a native Development link or closing keyword
  until a maintainer confirms the scope and assignment. For independent work,
  say that no issue applies.
- Issues and pull requests with an assignee are reserved for that person.
  Do not begin work on them unless a maintainer invites you to collaborate.
- Do not publish credentials, personal data, OTP codes, certificates, or
  private keys in issues, pull requests, logs, or commits.

For the project's issue statuses, contribution availability, and maintainer
responsibilities, see [Project governance](./GOVERNANCE.md).

## Development setup

Follow the setup instructions in the [README](../README.md). The project uses
Node.js `26.11.1` or a compatible later 26.x release and pnpm `12.21.0`.

### Pre-commit checks

The `prepare` script installs Husky hooks during `pnpm install`. Before each
commit, the hook uses `lint-staged` to lint and format staged files, then runs
`pnpm lint`, `pnpm typecheck`, and `pnpm format:check` across the repository.
This includes code and Markdown linting plus Prettier formatting checks for
supported files, including Markdown and YAML. Do not bypass these checks.

When fixing lint issues locally, prefer `pnpm lint:fix`; CI uses
`pnpm lint:code` and `pnpm lint:docs` to check without changing files.
`pnpm format` writes Prettier formatting changes to code and documentation
files. CI uses `pnpm format:check` to check supported files without modifying
them.

Before marking a code-changing pull request ready for review, run:

```sh
pnpm lint:fix
pnpm typecheck
pnpm format
pnpm build
```

For documentation-only changes, code linting and typechecking may not be
applicable; CI still runs Markdown linting and formatting checks for supported
files, including YAML formatting. CI also runs the production build for code
and configuration changes. Do not hold intermediate draft work for checks.
Run relevant checks before marking the PR ready and after significant changes.
There is not currently an automated test script. If a change requires MongoDB
or browser authentication, describe how you tested it and what services or
environment values were needed. Keep development OTP values out of published
logs and screenshots.

For UI changes, use the [accessibility guidance for contributors](./ACCESSIBILITY.md)
as a review checklist.

## GitHub flow and pull requests

Follow [GitHub flow](https://docs.github.com/get-started/using-github/github-flow):

1. For issue-related work, use the issue as the source of truth for scope and
   acceptance criteria. Anyone may start an unassigned **Todo** issue without
   prior approval. Wait for maintainer agreement before starting **Backlog**
   work or work assigned to someone else. No issue is required for independent
   work.
2. Create a short-lived topic branch from `main` for standalone work. For a
   larger issue, maintainers may create an integration branch for the parent
   issue; branches and PRs for its sub-issues should be based on and target
   that branch, not `main`. The completed integration branch is then proposed
   for `main`.
3. Make the first focused commit, then open a draft pull request promptly.
   Keep it in draft while implementation is in progress, and update it as the
   work changes.
4. Make the pull request title and summary identify the work and mention its
   issue. For independent work, say that no issue applies. Do not create a
   native Development link or add a closing keyword yet: GitHub automatically
   moves an issue to **In progress** when a draft PR is linked.
5. Maintainers monitor draft PRs. After confirming the scope and assignment,
   they assign the contributor and create the native Development relationship;
   the issue then moves to **In progress**.
6. If the pull request fully resolves an issue, include a closing keyword such
   as `Closes #123` after that confirmation. For partial work, do not claim
   that the issue will close. Do not duplicate issue relationships in
   checkbox lists.
7. Run the relevant checks before marking the pull request ready for review.
   Respond to review feedback and keep the branch current. Maintainers manage
   PR labels, assignees, reviewers, issue relationships, and merging.

Maintainers may close a draft pull request when the proposed contribution is
not wanted or is out of scope. They should explain the decision; do not
continue the work unless the scope is agreed again.

Use a clear
[Conventional Commit](https://www.conventionalcommits.org/) subject, for
example `docs: explain local HTTPS setup` or `fix: validate OTP expiry`.

### Commit signatures, sign-off, and attribution

Every commit must have a digital signature that GitHub verifies. The active
`MASTER` ruleset enforces signed commits; an unsigned agent-created commit is
not permitted, even if a signed commit follows it. See GitHub's guides to
[signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
and [signed-commit rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).
If an agent cannot create a commit using an authorized signing mechanism,
leave the changes for a human to commit rather than creating an unsigned
commit. Never share or expose a private signing key to an agent.

Use a human's `Signed-off-by` trailer only when that human explicitly creates
the commit. A human-created commit must be signed by the same human named in
the sign-off. The sign-off is a
[Developer Certificate of Origin](https://developercertificate.org/)
attestation; do not add one unless you can make that declaration. For example,
with a signing key configured in Git:

```sh
git commit -S -s -m "docs: explain local HTTPS setup"
```

Agent-created commits must not contain a human `Signed-off-by` trailer. Keep
the human responsible for and author of the contribution; an AI agent is at
most a co-author. Identify each agent that materially contributes code or
content with a `Co-authored-by` trailer using its verified attribution
identity. Do not invent an agent email address. Add `Tested-by` only for
testing actually performed, and `Reviewed-by` only for a human who reviewed
the commit.

The project's signing-key policy is:

- Use SSH signing only with a post-quantum or hybrid algorithm supported by
  GitHub. Until GitHub supports such SSH signatures, use an eligible GPG key.
- GPG signing keys must either expire before 2035 (preferably by 2030) or use
  a post-quantum or hybrid algorithm supported by GitHub.
- S/MIME signing certificates are not permitted for project commits.

GitHub's supported signature formats and verification behavior can change.
Revisit this policy as support for post-quantum and hybrid signatures evolves.

## AI-assisted contributions

GitHub Copilot, Claude, Codex, and Antigravity may assist with contributions.
The human submitting the work remains responsible for its correctness,
security, licensing, and compliance with project standards. Review and
understand agent-generated changes, run the relevant checks, and do not treat
an agent's output as independently approved. Detailed agent-specific operating
instructions are maintained separately from this contributor guide.

## License

The project is distributed under the [MIT License](../LICENSE). There is no
separate Contributor License Agreement. Follow the commit sign-off policy
above for human-created commits.
