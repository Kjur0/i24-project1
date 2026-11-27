# Database model

The application stores three MongoDB collections in the `webmaster` database:
`users`, `posts`, and `sessions`. MongoDB adds an `_id` field of type `ObjectId`
to each stored document.

The TypeScript shapes below are defined in [`types/user.ts`](../types/user.ts),
[`types/post.ts`](../types/post.ts), and
[`types/session.ts`](../types/session.ts).

## Users

Each user document contains:

| Field          | Type                               | Notes                                                 |
| -------------- | ---------------------------------- | ----------------------------------------------------- |
| `email`        | `string`                           | User email address.                                   |
| `username`     | `string`                           | Display name.                                         |
| `role`         | `"user" \| "admin" \| "moderator"` | Authorization role.                                   |
| `verified`     | `boolean`                          | Whether the email address is verified.                |
| `createdAt`    | `Date`                             | Account creation time.                                |
| `authn`        | `userAuthn[]`                      | Registered passkeys; empty when none are registered.  |
| `avatar`       | `string` (optional)                | Avatar URL or identifier.                             |
| `otp`          | `userOTP` (optional)               | One-time-code hash, attempt count, and creation time. |
| `pendingEmail` | `string` (optional)                | Email awaiting confirmation during an email change.   |

`userAuthn` stores a credential ID, display name, base64url-encoded public key,
signature counter, device type, backup state, transport hints, and creation
time. `userOTP` stores the code hash, failed-attempt count, and creation time;
the plaintext code is not stored in this collection.

## Posts and embedded comments

Each post document contains:

| Field       | Type                   | Notes                                   |
| ----------- | ---------------------- | --------------------------------------- |
| `title`     | `string`               | Post title.                             |
| `content`   | `string`               | Post body.                              |
| `author`    | `ObjectId`             | Reference to the author in `users`.     |
| `createdAt` | `Date`                 | Post creation time.                     |
| `comments`  | `comment[]` (optional) | Comments embedded in the post document. |

Each embedded comment contains `content: string`, `author: ObjectId`, and
`createdAt: Date`; it may also contain `title: string`. Comments are not
recursive and are not stored in a separate collection.

## Sessions

Each session document contains:

| Field       | Type       | Notes                                                                            |
| ----------- | ---------- | -------------------------------------------------------------------------------- |
| `user`      | `ObjectId` | Reference to the user in `users`.                                                |
| `token`     | `string`   | SHA-256 hash of the session token; the raw token is held in an HTTP-only cookie. |
| `createdAt` | `Date`     | Session creation time.                                                           |
| `expiresAt` | `Date`     | Session expiration time.                                                         |

## Not implemented

The earlier project brief described user ratings, but there is no rating field
in the current user or post types. Ratings should not be assumed to exist in
the database.
