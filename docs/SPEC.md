# Project specification

## Purpose

webmaster.rip is a Polish-language community feedback site about the website of
Technical Secondary School No. 1 (TM1). The current application is an early
prototype; this document describes what is implemented rather than promising
unfinished features.

## Current functionality

- Public feed of posts, with pagination.
- Signed-in users can create posts and comment on them.
- Authors can edit their own posts and comments.
- Moderators and administrators can moderate user-generated content.
- Email one-time-code account authentication and account email verification.
- WebAuthn/passkey registration and authentication.
- User profiles, profile/login settings, and an administrator user-management
  area.

There is no email delivery provider configured. One-time codes are currently
written to server logs for development and must not be treated as production
authentication delivery.

The original assignment described a 1-to-5 website rating. Rating functionality
is not present in the current application or database model.

## Roles

| Role        | Current responsibilities                                         |
| ----------- | ---------------------------------------------------------------- |
| `user`      | Create posts and comments; manage their own profile and content. |
| `moderator` | Moderate posts and comments.                                     |
| `admin`     | Manage users and perform moderation.                             |

## Technical overview

- Next.js App Router application.
- MongoDB database named `webmaster`.
- MongoDB collections: `users`, `posts`, and `sessions`.
- WebAuthn relying-party configuration is provided by `APP_DOMAIN` and
  `APP_ORIGIN`.

See the [README](../README.md) for setup and environment configuration and the
[database model](./dbMODEL.md) for persisted document shapes.
