# Security Policy

## Supported versions

Security fixes are made against the latest code on the `main` branch. There
are no published releases with separate support guarantees.

## Report a vulnerability privately

Do not disclose a suspected vulnerability in a public issue, pull request,
discussion, or commit. Use GitHub's private vulnerability reporting form:

[Report a vulnerability](https://github.com/Kjur0/i24-project1/security/advisories/new)

If the form is unavailable, contact the repository owner privately through
GitHub. Do not send vulnerability details, credentials, or personal data
through a public channel.

Include enough information to help investigate the report:

- the affected component, commit, or version;
- the potential impact and conditions required for the issue to occur;
- concise reproduction steps in a local or otherwise authorized environment;
- relevant sanitized logs, screenshots, or proof-of-concept material; and
- any mitigation or workaround you have identified.

Do not access, alter, or disclose other people's data; degrade the service;
or test against systems you do not own or have permission to test. Stop if
testing could affect other users or production data. Do not include live OTP
codes, passwords, private keys, tokens, or unredacted personal information in
a report.

## What happens after a report

The maintainer will review the report, assess its impact, and coordinate any
necessary remediation and disclosure with the reporter. Response and
resolution times are not guaranteed. Please allow time for investigation and
avoid public disclosure while a report is being assessed.

Reports about vulnerabilities in third-party services should be sent to the
organization that operates the affected service. This policy covers the
webmaster.rip repository and software maintained here; it does not authorize
testing external providers.

## Sensitive data and one-time codes

The application currently writes generated one-time sign-in codes to server
logs instead of delivering them by email. Keep development and production
logs access-controlled, avoid sharing live codes, and redact them from
diagnostic material. If a credential or key is exposed, revoke or rotate it
through its provider and report the exposure privately; do not repost the
secret.
