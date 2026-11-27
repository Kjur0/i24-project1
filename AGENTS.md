# Shared Agent Instructions

## Project boundaries

- Keep changes focused and preserve existing behavior. Do not modify functional
  code for a documentation or repository-governance task.
- User-facing application text and user guides must be in Polish. Contributor,
  maintainer, and developer documentation should be in English.
- Treat the current application and checked-in documentation as the source of
  truth; do not describe abandoned or unimplemented behavior as available.
- Do not commit environment-managed skills or edit `skills-lock.json` or
  `.agents/skills/`.

## Web implementation guidance

- **Next.js:** This project may use Next.js APIs and conventions that differ
  from older references. Before changing application code, read the relevant
  guide installed under `node_modules/next/dist/docs/` and follow its current
  recommendations and deprecation notices.
- **React and rendering:** Check the existing App Router and server/client
  component boundaries before adding browser state, event handlers, or browser
  APIs. Keep components server-rendered unless client behavior is required.
- **Tailwind CSS:** The project uses Tailwind CSS v4. Follow the existing
  CSS-first setup and theme conventions in `app/globals.css`; do not introduce
  a Tailwind v3 configuration pattern.
- **shadcn/ui:** Treat `components.json` and the installed components as the
  source of truth for aliases, style, rendering mode, and icon library. Check
  current component documentation and APIs before using or adding a component;
  do not assume Radix and Base UI APIs are interchangeable. Use the project's
  package manager for CLI work (`pnpm dlx shadcn@latest`) and inspect the
  existing components before adding or importing one.
- **Modern web platform:** Before implementing browser-facing HTML, CSS, DOM,
  forms, accessibility, security, performance, or date/time behavior, consult
  the available `modern-web-guidance` skill and current platform
  documentation. Preserve keyboard and assistive-technology behavior and
  follow recommended compatibility fallbacks for features that are not widely
  available.

## Repository operations

Only the Copilot agent may perform Git or GitHub operations for this
repository. Other agents must not run Git/GitHub commands, change repository or
remote metadata, or create or edit issues, pull requests, comments, labels, or
settings. They may provide proposed changes for Copilot to apply. See
`.github/copilot-instructions.md` for the required workflow.
