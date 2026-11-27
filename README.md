# webmaster.rip

## Project overview

webmaster.rip is a Polish-language social site for sharing opinions about the
Technikum nr 1 (TM1) website. This repository contains its Next.js application.

The project is considered complete. It supports posts and comments, one-time
email-linked sign-in codes, passkeys, user profiles and settings, and
administrator and moderator tools. Email delivery is not configured; generated
one-time codes are currently written to the server log.

## Technology

- Next.js 16 with the App Router and React 19
- TypeScript and Tailwind CSS 4
- MongoDB
- WebAuthn/passkeys via SimpleWebAuthn
- pnpm

## Requirements

- Node.js `26.11.1` or a later compatible release in the 26.x line. The
  `package.json`, `devEngines.runtime`, and `pnpm-workspace.yaml` runtime
  declarations are aligned.
- pnpm `12.21.0` (the version pinned in `package.json`)
- A MongoDB deployment accessible from this machine
- OpenSSL to generate a local OTP salt

## Getting started

Install the required Node.js and pnpm versions, then run:

```sh
git clone https://github.com/Kjur0/i24-project1.git
cd i24-project1
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Edit `.env.local` as described below, then start the app:

```sh
pnpm dev
```

Open [https://localhost:3000](https://localhost:3000). Next.js generates a
development certificate for HTTPS; your browser may ask you to trust it.

## Environment configuration

The app reads server-side variables from `.env.local`. Do not commit
`.env.local` or put secrets in variables prefixed with `NEXT_PUBLIC_`; those are
exposed to the browser. No `NEXT_PUBLIC_` variables are currently required.

| Variable     | Required                                         | Purpose                                                                                                |
| ------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `MONGO_URI`  | Yes, or use all three MongoDB variables below    | Complete MongoDB connection URI. Use this for local MongoDB or a provider URI.                         |
| `MONGO_URL`  | Required when `MONGO_URI` is empty               | MongoDB SRV host, without the `mongodb+srv://` prefix.                                                 |
| `MONGO_USER` | Required with `MONGO_URL`                        | MongoDB database username.                                                                             |
| `MONGO_PASS` | Required with `MONGO_URL`                        | MongoDB database password.                                                                             |
| `OTP_SALT`   | Yes                                              | A private, stable random value used when hashing one-time codes.                                       |
| `APP_DOMAIN` | No; defaults to `localhost`                      | WebAuthn relying-party ID and cookie domain. Hostname only; no scheme or port.                         |
| `APP_ORIGIN` | Recommended; defaults to `http://localhost:3000` | Exact origin used for WebAuthn verification, including scheme and port. It must match the browser URL. |

Use **either** a complete `MONGO_URI` or all of `MONGO_URL`, `MONGO_USER`,
and `MONGO_PASS`. The application selects the `webmaster` database. Create a
MongoDB database user with access to that database and allow your development
machine's IP address in the provider's network access settings. Do not commit
database credentials.

Generate a strong salt locally:

```sh
openssl rand -base64 32
```

Copy the output into `OTP_SALT` in `.env.local`. Keep it stable for the
environment and do not share or commit it.

For passkeys, the example environment file sets:

```dotenv
APP_DOMAIN=localhost
APP_ORIGIN=https://localhost:3000
```

`APP_ORIGIN` must exactly match the origin shown in the browser. In production,
set both values to the deployed application's hostname and HTTPS origin.

### Certificates

`pnpm dev` uses Next.js's development HTTPS support and generates a local
certificate. No certificate needs to be committed or supplied for the default
`localhost` setup. The `.gitignore` excludes PEM files and the `certificates/`
directory; keep private keys and certificates out of commits.

For a custom local certificate, Next.js accepts a key and certificate path:

```sh
pnpm exec next dev --experimental-https \
  --experimental-https-key ./certificates/localhost-key.pem \
  --experimental-https-cert ./certificates/localhost.pem
```

An optional certificate authority can be supplied with
`--experimental-https-ca`. These flags are for local development only. Use
properly issued certificates in production.

## Useful commands

| Command          | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `pnpm dev`       | Start the HTTPS development server on `localhost`.                        |
| `pnpm lint`      | Run ESLint.                                                               |
| `pnpm typecheck` | Run the TypeScript compiler without emitting files.                       |
| `pnpm format`    | Format TypeScript and TSX files with Prettier; this command writes files. |
| `pnpm build`     | Create a production build.                                                |
| `pnpm start`     | Serve a previously built production app.                                  |

Linting and typechecking do not need a reachable database; running the app
requires MongoDB configuration and network access.

## Project documentation

- [Project specification](./docs/SPEC.md)
- [Database model](./docs/dbMODEL.md)
- [Accessibility](./docs/ACCESSIBILITY.md)
- [Contributing](./.github/CONTRIBUTING.md)
- [Code of conduct](./.github/CODE_OF_CONDUCT.md)
- [Security policy](./.github/SECURITY.md)
- [Support](./.github/SUPPORT.md)
- [Project governance](./.github/GOVERNANCE.md)
- [Shared agent instructions](./AGENTS.md)
- [Copilot GitHub workflow](./.github/copilot-instructions.md)

## License

The project is distributed under the terms of the [MIT License](./LICENSE).
