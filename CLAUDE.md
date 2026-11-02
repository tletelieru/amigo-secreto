# amigo-secreto

Secret Santa draws with private links and no server.

## Stack

React + Vite + TypeScript strict, MUI, vite-plugin-pwa, Vitest + Testing Library, ESLint + Prettier, Husky + lint-staged, GitHub Pages.

Plan in `docs/PLAN.md`.

## Architecture

- `src/lib/draw.ts` is pure. Random tries keep the draw uniform; matching and the bounded cycle search cover tight exclusions.
- `src/lib/link.ts` seals one ticket per person. The URL hash carries the ciphertext and its key, so nothing reaches a server.
- Assignments are never stored or rendered on the organizer side: the group keeps only tokens.
- The result page never reads or writes the saved group.
- `src/lib/groupLink.ts` builds the one-link flow: each entry is sealed with a key derived from the salt and the normalized email. Protection is deliberately friend-grade, and no server is involved.
- `VITE_GOOGLE_CLIENT_ID` comes from `.env.local` locally and a repository variable in CI. It is public, not a secret.
- Persistence goes through `GroupStore` in `src/lib/store.ts`, the seam for a future backend.

## Conventions

- Use pnpm.
- No code comments unless explicitly requested.
- All UI text lives in `src/i18n/messages.ts` (en and es). Locale and color mode are kept in localStorage.
- Every select goes through `src/components/SelectField.tsx`. A menu never opens on top of its field.
- The icons come from `public/favicon.svg`: run `pnpm gen:icons` after changing it.
- The Vite `base` comes from `GITHUB_REPOSITORY` in CI and from the project name locally.
- The precache holds only the app shell.
- lint-staged calls tools through `node node_modules/...`: its spawner cannot run Windows `.cmd` shims.
- Check UI changes in a screenshot, mobile included, before reporting them done.
