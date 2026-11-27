# Support

This repository provides limited support through GitHub. Maintainers review
reports as time permits; response and resolution times are not guaranteed.

## Find setup information

For local installation, environment variables, MongoDB, HTTPS certificates,
and current application behavior, start with the [README](../README.md). Check
existing issues before submitting a new report.

## Choose the right report

- **A feature is broken or behaves unexpectedly:** use the
  [bug report form](https://github.com/Kjur0/i24-project1/issues/new?template=bug_report.yml).
- **You want a new capability or improvement:** use the
  [feature request form](https://github.com/Kjur0/i24-project1/issues/new?template=feature_request.yml).
- **You want to suggest an accessibility improvement:** use the
  [accessibility request form](https://github.com/Kjur0/i24-project1/issues/new?template=accessibility_request.yml).
  Report an existing accessibility barrier as a bug. See the
  [accessibility guide](../docs/ACCESSIBILITY.md) for what information is
  useful.
- **You want to propose documentation or maintenance work:** use the
  [task form](https://github.com/Kjur0/i24-project1/issues/new?template=task.yml).
- **You suspect a security vulnerability:** follow the
  [security policy](./SECURITY.md) and report it privately. Do not use a
  public issue or pull request.

For other project questions, use an existing relevant issue when possible.
Do not post general questions that include private account or security
information.

## Protect private information

Issues and pull requests are public. Before sharing logs, screenshots,
configuration, or reproduction steps, remove passwords, database connection
strings, private keys, certificates, OTP codes, access tokens, and personal
information. Never put secrets in `.env` files committed to the repository.

The application does not currently deliver one-time codes by email; it writes
generated codes to server logs. Do not post live codes or unredacted logs in
public reports.
