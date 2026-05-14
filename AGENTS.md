# Truegrynd — Agent Instructions

## Cursor Cloud specific instructions

### Project overview

Truegrynd is a Next.js 16 (App Router) fitness competition web app with Supabase backend, i18n (next-intl, 10 locales), and a dark-mode-first brand identity. See `PROJECT.md` and `.cursor/rules/` for detailed product/coding/architecture rules.

### Environment variables

The app requires a `.env.local` file with Supabase credentials. See `.env.local.example` for the template. Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, the dev server will crash when any Supabase call is made. Placeholder values allow the server to start and render pages, but auth flows and data fetches will fail gracefully.

If real Supabase secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are injected as environment variables, write them to `.env.local` before running the dev server.

### Common commands

All commands are in `package.json` scripts. Key ones:

| Task               | Command                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| Dev server         | `pnpm dev` (port 3000)                                                          |
| Lint               | `pnpm lint`                                                                     |
| Type check         | `pnpm typecheck`                                                                |
| Unit tests         | `pnpm test:run`                                                                 |
| Unit tests (watch) | `pnpm test`                                                                     |
| Coverage           | `pnpm coverage`                                                                 |
| E2E tests          | `pnpm e2e` (needs Playwright Chromium: `pnpm exec playwright install chromium`) |
| Full check         | `pnpm check` (lint + typecheck + test:run)                                      |

### Routing and locale

The app uses `next-intl` with the App Router. All user-facing routes are prefixed with a locale (e.g. `/en/auth`, `/fr/arena`). The root `/` redirects to `/{locale}/auth` for unauthenticated users. When testing navigation, always account for the locale prefix.

### Git hooks

- **pre-commit**: runs `lint-staged` (ESLint + Prettier on staged files)
- **pre-push**: runs `pnpm typecheck && pnpm test:run`

Husky is set up automatically by `pnpm install` via the `prepare` script.

### Build script warnings

`pnpm install` may warn about ignored build scripts for `@parcel/watcher` and `@swc/core`. These are optional native performance addons for Next.js and do not affect functionality. The `pnpm.onlyBuiltDependencies` field in `package.json` controls which packages can run build scripts.

### Testing notes

- Unit tests (Vitest) run in jsdom and mock Supabase via MSW — no real Supabase instance needed.
- E2E tests (Playwright) need the dev server running and Chromium installed. Playwright config auto-starts the dev server if not already running.
- Auth-dependent E2E flows require real Supabase credentials and a test user (see `.env.local.example` for `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`).
