# webmaster.rip

## Opis projektu

webmaster.rip to polskojęzyczny serwis społecznościowy do dzielenia się opiniami
o stronie internetowej Technikum nr 1 (TM1). To repozytorium zawiera aplikację
opartą na Next.js.

## Aktualny stan

Projekt jest wczesnym prototypem. Obecna wersja obsługuje wpisy i komentarze,
logowanie za pomocą jednorazowego kodu powiązanego z adresem e-mail, klucze
dostępu, profile i ustawienia użytkowników oraz narzędzia administratorów i
moderatorów. Ocenianie strony w skali od 1 do 5, przewidziane w pierwotnym
opisie projektu, nie zostało zaimplementowane.

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

The app reads server-side variables from `.env.local`. Do not commit `.env.local`
or put secrets in variables prefixed with `NEXT_PUBLIC_`; those are exposed to
the browser. No `NEXT_PUBLIC_` variables are currently required.

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

### Email and OTP delivery

There is currently no email provider configured. The app generates one-time
codes and writes them to the server log for development; this is not suitable
for a public production deployment. Email delivery and safe production OTP
handling still need to be implemented.

## Useful commands

| Command                        | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| `pnpm dev`                     | Start the HTTPS development server on `localhost`.  |
| `pnpm lint`                    | Run ESLint.                                         |
| `pnpm exec tsc --noEmit`       | Run the TypeScript compiler without emitting files. |
| `pnpm build`                   | Create a production build.                          |
| `pnpm start`                   | Serve a previously built production app.            |
| `pnpm exec prettier --check .` | Check formatting with Prettier.                     |

There is no automated test script yet. Lint and typecheck do not need a
reachable database; running the app requires MongoDB configuration and network
access.

## Project documentation

- [Project specification](./docs/SPEC.md)
- [Database model](./docs/dbMODEL.md)
- [Contributing](./CONTRIBUTING.md)
- [Accessibility](./ACCESSIBILITY.md)
- [Security policy](./SECURITY.md)
- [Support](./SUPPORT.md)

## License

This repository does not have a `LICENSE` file yet. The repository owner is
choosing a license; until one is added, do not assume permission to reuse or
redistribute this project.
