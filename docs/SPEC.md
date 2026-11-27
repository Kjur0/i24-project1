---
Assignment: 0
---

# webmaster.rip — specyfikacja projektu

## Cel projektu

webmaster.rip to serwis opinii i komentarzy dotyczących strony internetowej
Technikum nr 1 (TM1). Aplikacja jest prototypem. Poniższy opis przedstawia jej
obecny stan, a nie funkcje planowane lub niezrealizowane.

## Obecnie dostępne funkcje

- Publiczny kanał wpisów z podziałem na strony.
- Zalogowani użytkownicy mogą tworzyć wpisy i dodawać do nich komentarze.
- Autor może edytować i usuwać własne wpisy oraz komentarze.
- Moderatorzy i administratorzy mogą usuwać dowolne wpisy i komentarze.
- Rejestracja i logowanie za pomocą jednorazowego kodu powiązanego z adresem
  e-mail, a także weryfikacja adresu e-mail. Kod nie jest obecnie wysyłany
  pocztą — trafia do logu serwera.
- Rejestracja i logowanie za pomocą kluczy dostępu (WebAuthn/passkeys).
- Profile użytkowników oraz ustawienia profilu i metod logowania.
- Panel administratora do zarządzania kontami użytkowników.

## Role

| Rola        | Obecne uprawnienia                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| `user`      | Tworzenie wpisów i komentarzy, zarządzanie własną treścią oraz profilem.                                       |
| `moderator` | Moderowanie wpisów i komentarzy; edycja podstawowych danych profili użytkowników niebędących administratorami. |
| `admin`     | Moderowanie treści oraz zarządzanie kontami, adresami e-mail i rolami użytkowników.                            |

## Ograniczenia i stan niezrealizowanych funkcji

- W pierwotnym zadaniu przewidziano ocenę strony w skali od 1 do 5. Funkcja
  oceniania nie została zaimplementowana.
- Nie skonfigurowano dostawcy poczty. Jednorazowe kody są obecnie zapisywane
  w logach serwera na potrzeby developmentu; nie jest to bezpieczny sposób
  dostarczania kodów w produkcji.
- Aplikacji nie należy traktować jako gotowego do produkcyjnego wdrożenia
  systemu uwierzytelniania.

## Technologie i przechowywanie danych

- Aplikacja korzysta z Next.js App Router, React i TypeScript.
- Dane są przechowywane w bazie MongoDB `webmaster`.
- Aplikacja używa kolekcji `users`, `posts` i `sessions`; komentarze są
  przechowywane wewnątrz dokumentów wpisów.
- Konfiguracja WebAuthn korzysta ze zmiennych `APP_DOMAIN` i `APP_ORIGIN`.
