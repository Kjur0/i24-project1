# Accessibility

Accessibility is an ongoing project requirement. We aim to make the application
usable with keyboards, assistive technology, zoom, and a range of user needs.
The current application has not had a formal accessibility audit, so this
document is not a claim of conformance to WCAG.

## Reporting an issue

Open an [issue in the repository](https://github.com/Kjur0/i24-project1/issues/new).
Describe the affected page and interaction, the assistive technology or input
method involved when known, and the barrier encountered. Avoid including
personal or sensitive information.

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
