# Dostępność

Dostępność jest stałym wymaganiem projektu. Dążymy do tego, aby z aplikacji
można było korzystać za pomocą klawiatury, technologii asystujących i
powiększenia ekranu oraz aby odpowiadała na różne potrzeby użytkowników.
Aplikacja nie przeszła jeszcze formalnego audytu dostępności, dlatego ten opis
nie stanowi deklaracji zgodności z WCAG.

## Zgłaszanie bariery lub prośby o zmianę

Jeśli istniejące działanie jest niedostępne lub zepsute, użyj
[formularza zgłoszenia błędu](https://github.com/Kjur0/i24-project1/issues/new?template=bug_report.yml).
Opisz stronę i działanie, których dotyczy problem, napotkaną barierę oraz — jeśli
to możliwe — używaną technologię asystującą lub metodę obsługi.

Aby zaproponować usprawnienie dostępności, użyj
[formularza prośby o poprawę dostępności](https://github.com/Kjur0/i24-project1/issues/new?template=accessibility_request.yml).
Nie podawaj danych osobowych, informacji o stanie zdrowia ani innych informacji
poufnych.

## Contributor checklist

When changing UI:

- Make all actions available by keyboard and preserve a visible focus indicator.
- Use semantic HTML, labels, headings, and accessible names for controls.
- Keep text and interactive-state contrast legible.
- Ensure dialogs and menus have an understandable focus and dismissal flow.
- Respect reduced-motion preferences when adding animation.
- Check the interface at browser zoom and with narrow viewports.
- Write user-facing text in the application's existing language and preserve its
  document language metadata.

If a change introduces a known limitation, document it and create an issue to
track follow-up work.
