---
Assignment: 1
---

# Model danych

Aplikacja przechowuje dane w bazie MongoDB `webmaster`, w trzech kolekcjach:
`users`, `posts` i `sessions`. MongoDB nadaje każdemu dokumentowi pole `_id`
typu `ObjectId`.

## Użytkownicy — `users`

| Pole           | Typ                                | Opis                                                            |
| -------------- | ---------------------------------- | --------------------------------------------------------------- |
| `_id`          | `ObjectId`                         | Identyfikator dokumentu nadawany przez MongoDB.                 |
| `email`        | `string`                           | Adres e-mail użytkownika.                                       |
| `username`     | `string`                           | Nazwa wyświetlana użytkownika.                                  |
| `role`         | `"user" \| "moderator" \| "admin"` | Rola konta.                                                     |
| `verified`     | `boolean`                          | Informacja, czy adres e-mail został zweryfikowany.              |
| `createdAt`    | `Date`                             | Data utworzenia konta.                                          |
| `authn`        | `userAuthn[]`                      | Zarejestrowane klucze dostępu; pusta tablica, jeśli ich nie ma. |
| `avatar`       | `string` (opcjonalne)              | Adres lub identyfikator awatara.                                |
| `otp`          | `userOTP` (opcjonalne)             | Dane aktywnego jednorazowego kodu.                              |
| `pendingEmail` | `string` (opcjonalne)              | Nowy adres e-mail oczekujący na potwierdzenie.                  |

Element `userAuthn` opisuje klucz dostępu:

| Pole         | Typ                    | Opis                                                   |
| ------------ | ---------------------- | ------------------------------------------------------ |
| `id`         | `string`               | Identyfikator poświadczenia WebAuthn.                  |
| `name`       | `string`               | Nazwa klucza nadana przez użytkownika.                 |
| `publicKey`  | `string`               | Klucz publiczny zapisany w kodowaniu base64url.        |
| `counter`    | `number`               | Licznik podpisów poświadczenia.                        |
| `deviceType` | `CredentialDeviceType` | Typ urządzenia określony przez WebAuthn.               |
| `backedUp`   | `boolean`              | Informacja, czy poświadczenie jest kopiowane zapasowo. |
| `transports` | `string[]`             | Dostępne transporty poświadczenia.                     |
| `createdAt`  | `Date`                 | Data rejestracji klucza.                               |

Element `userOTP` zawiera `hash: string`, `attempts: number` i
`createdAt: Date`. W bazie przechowywany jest skrót kodu, nie jego jawna
wartość.

## Wpisy i komentarze — `posts`

| Pole        | Typ                      | Opis                                            |
| ----------- | ------------------------ | ----------------------------------------------- |
| `_id`       | `ObjectId`               | Identyfikator dokumentu nadawany przez MongoDB. |
| `title`     | `string`                 | Tytuł wpisu.                                    |
| `content`   | `string`                 | Treść wpisu.                                    |
| `author`    | `ObjectId`               | Identyfikator autora w kolekcji `users`.        |
| `createdAt` | `Date`                   | Data utworzenia wpisu.                          |
| `comments`  | `comment[]` (opcjonalne) | Komentarze osadzone w dokumencie wpisu.         |

Komentarz zawiera `content: string`, `author: ObjectId` i `createdAt: Date`;
pole `title: string` jest opcjonalne. Komentarze nie są rekurencyjne i nie mają
osobnej kolekcji.

## Sesje — `sessions`

| Pole        | Typ        | Opis                                                                         |
| ----------- | ---------- | ---------------------------------------------------------------------------- |
| `_id`       | `ObjectId` | Identyfikator dokumentu nadawany przez MongoDB.                              |
| `user`      | `ObjectId` | Identyfikator użytkownika w kolekcji `users`.                                |
| `token`     | `string`   | Skrót SHA-256 tokenu sesji; jawny token znajduje się w ciasteczku HTTP-only. |
| `createdAt` | `Date`     | Data utworzenia sesji.                                                       |
| `expiresAt` | `Date`     | Data wygaśnięcia sesji.                                                      |
