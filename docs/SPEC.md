---
Assignment: 0
---

# webmaster.rip

Strona do krytykowania strony szkoły tm1.edu.pl

## Funkcjonalności

* Możliwość dodawania komentarzy do strony szkoły
* Możliwość oceniania strony szkoły w skali od 1 do 5

## Role użytkowników

### Administrator

* Pełne uprawnienia do zarządzania stroną
* Możliwość usuwania kont użytkowników, zmiany ich ról oraz ustawień

### Moderator

* Możliwość usuwania komentarzy i ocen użytkowników

### Użytkownik

* Możliwość dodawania komentarzy i oceniania strony szkoły

## Model danych

```yaml
User:
  id: number
  username: string
  idp: string
  role: 
    - "admin"
    - "moderator"
    - "user"  
  currentRating: number

Comment:
  id: number
  userId: ref(User)
  content: string
  createdAt: datetime
```