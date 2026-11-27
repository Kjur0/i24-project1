---
Assignment: 0
---

# webmaster.rip — specyfikacja projektu

## Cel projektu

webmaster.rip to serwis opinii i komentarzy dotyczących strony internetowej
Technikum nr 1 (TM1). Projekt jest ukończony; poniższy opis podsumowuje
dostępne funkcje aplikacji.

## Obecnie dostępne funkcje

- Publiczny kanał wpisów z podziałem na strony.
- Zalogowani użytkownicy mogą tworzyć wpisy i dodawać do nich komentarze.
- Autor może edytować i usuwać własne wpisy oraz komentarze.
- Moderatorzy i administratorzy mogą usuwać dowolne wpisy i komentarze.
- Logowanie i weryfikacja adresu e-mail za pomocą jednorazowego kodu. Aplikacja
  nie wysyła kodów pocztą; zapisuje je w logu serwera.
- Rejestracja i logowanie za pomocą kluczy dostępu (WebAuthn/passkeys).
- Profile użytkowników oraz ustawienia profilu i metod logowania.
- Panel administratora do zarządzania kontami użytkowników.

## Role

| Rola        | Obecne uprawnienia                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| `user`      | Tworzenie wpisów i komentarzy, zarządzanie własną treścią oraz profilem.                                       |
| `moderator` | Moderowanie wpisów i komentarzy; edycja podstawowych danych profili użytkowników niebędących administratorami. |
| `admin`     | Moderowanie treści oraz zarządzanie kontami, adresami e-mail i rolami użytkowników.                            |

## Obsługa poczty elektronicznej

Dostawca poczty elektronicznej nie jest skonfigurowany. Jednorazowe kody są
zapisywane w logu serwera i nie są dostarczane użytkownikom pocztą.

## Technologie i przechowywanie danych

- Aplikacja korzysta z Next.js App Router, React i TypeScript.
- Dane są przechowywane w bazie MongoDB `webmaster`.
- Aplikacja używa kolekcji `users`, `posts` i `sessions`; komentarze są
  przechowywane wewnątrz dokumentów wpisów.
- Konfiguracja WebAuthn korzysta ze zmiennych `APP_DOMAIN` i `APP_ORIGIN`.
