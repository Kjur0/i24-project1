# Accessibility Guidance for Contributors

Accessibility is part of the change, not a separate polish step. Avoid
claiming WCAG conformance unless the relevant scope has been formally
evaluated.

## Review checklist

When changing the interface, consider the complete task flow and check that:

- all actions can be completed with a keyboard and focus remains visible;
- controls use semantic HTML, have accessible names, and expose their state;
- form fields have clear labels, instructions, and understandable error
  messages;
- headings and page structure are meaningful to assistive technology;
- text, icons, focus indicators, and interactive states have sufficient
  contrast;
- dialogs and menus have a predictable focus, dismissal, and return-focus
  behavior;
- content remains usable at browser zoom and narrow viewport widths;
- animations respect the user's reduced-motion preference;
- images that convey information have useful alternative text, while
  decorative images are not announced unnecessarily; and
- user-facing text uses the correct language and the document language
  metadata is preserved.

Test with the interaction methods and assistive technologies relevant to the
change. Do not ask contributors or users to disclose a diagnosis. If a
limitation remains, describe it clearly and track the follow-up in an issue.
