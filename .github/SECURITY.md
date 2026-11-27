# Security Policy

## Supported versions

Security fixes are currently made against the latest code on the `main` branch.
There are no published releases with separate support guarantees.

## Reporting a vulnerability

Please do not report exploitable vulnerabilities in a public issue or pull
request. Use GitHub's private vulnerability reporting for this repository:

<https://github.com/Kjur0/i24-project1/security/advisories/new>

If private reporting is unavailable, contact the repository owner privately
through GitHub and share only the information needed to investigate. Do not
include secrets, user data, or live OTP codes in public discussions.

Please include the affected version or commit, the impact, and concise
reproduction details. The maintainer will review the report and coordinate a
fix and disclosure; response times are not guaranteed.

## OTP handling

The application logs generated OTP codes and does not deliver them by email.
Keep server logs access-controlled and do not share live codes in public
discussions or support requests.
