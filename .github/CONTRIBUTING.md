# Contributing

Thank you for helping improve webmaster.rip. Contributions should be
respectful, focused, and safe for users and maintainers.

## Before you start

- Check for an existing issue before starting substantial work. Agree on the
  scope in an issue when the change is related to tracked work.
- Use the issue form that best matches the report. Maintainers classify issues
  and manage their labels, issue types, priority, effort, assignees,
  relationships, and development branches. Contributors do not need to set
  those fields or apply labels.
- You do not need to create an issue for an unrelated pull request.
- Issues and pull requests with an assignee are reserved for that person.
  Do not begin work on them unless a maintainer invites you to collaborate.
- Do not publish credentials, personal data, OTP codes, certificates, or
  private keys in issues, pull requests, logs, or commits.

For the project's issue statuses, contribution availability, and maintainer
responsibilities, see [Project governance](./GOVERNANCE.md).

## Development setup

Follow the setup instructions in the [README](../README.md). The project uses
Node.js `26.11.1` or a compatible later 26.x release and pnpm `12.21.0`.

Before opening a pull request, run:

```sh
pnpm lint
pnpm typecheck
pnpm format
```

`pnpm format` writes formatting changes to TypeScript and TSX files. There is
not currently an automated test script. If a change requires MongoDB or
browser authentication, describe how you tested it and what services or
environment values were needed. Keep development OTP values out of published
logs and screenshots.

For UI changes, use the [accessibility guidance for contributors](./ACCESSIBILITY.md)
as a review checklist.

## GitHub flow and pull requests

Follow [GitHub flow](https://docs.github.com/get-started/using-github/github-flow):

1. For a change related to an issue, confirm the intended scope before
   implementation. No issue is required for unrelated work.
2. Create a short-lived topic branch from `main`; keep unrelated work on
   separate branches.
3. Make focused changes and commits, and update the branch regularly.
4. Open a pull request with a concise summary and exact validation results.
   Use a draft while work is ongoing; mark it ready when it is reviewable.
5. If the pull request fully resolves an issue, include a closing keyword such
   as `Closes #123`. For partial or related work, do not claim that the issue
   will close; maintainers can create the appropriate native Development
   relationship. Do not duplicate issue relationships in checkbox lists.
6. Respond to review feedback and keep the branch current. Maintainers manage
   PR labels, assignees, reviewers, issue relationships, and merging.

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
