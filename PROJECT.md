# Truegrynd – Projet

**App web de compétition fitness asynchrone.** Défis standardisés, leaderboard mondial, gratuit, propulsé par la communauté.

_Résumé en une ligne :_ « L'effort ne s'achète pas, il se prouve. » — Compétition fitness gratuite et asynchrone (vs Hyrox/Spartan payants) ; Factions, Smart Proof (vidéo si Top 10%), Finisher Card partageable. Détail complet → **[docs/CONTEXT.md](./docs/CONTEXT.md)**.

---

## Où trouver quoi

| Ce que tu cherches                                                               | Fichier                                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Executive summary** (problème, solution, positionnement)                       | **[docs/CONTEXT.md](./docs/CONTEXT.md)** § 1               |
| **Golden Circle** (Why / How / What)                                             | **[docs/CONTEXT.md](./docs/CONTEXT.md)** § 2               |
| **Innovations** (Factions, Smart Proof, Creator Score)                           | **[docs/CONTEXT.md](./docs/CONTEXT.md)** § 3               |
| **Périmètre MVP** (Auth, Onboarding, Arène, Finisher Card, etc.)                 | **[docs/CONTEXT.md](./docs/CONTEXT.md)** § 4               |
| **Stack & fondations** (Next, Supabase, Tailwind, etc.)                          | **[docs/CONTEXT.md](./docs/CONTEXT.md)** § 5               |
| **Tout le contexte produit + technique** (résumé exécutif + tout ce qui précède) | **[docs/CONTEXT.md](./docs/CONTEXT.md)** (un seul fichier) |

## Issues & suivi

- **[docs/issues/issues.md](./docs/issues/issues.md)** – Backlog **post-MVP** (admin UGC, Creator Score, streaks, etc.) + vision différenciation. Cocher `[x]` au fur et à mesure.

## Démarrer

```bash
pnpm install
cp .env.local.example .env.local   # puis remplir Supabase
pnpm dev
```

- `pnpm check` – lint + typecheck + unit tests
- `pnpm ci` – check + build (same as CI pipeline)
- `pnpm prepush` – coverage + e2e (avant push)

## Fondations

Même base que les autres projets : Next.js, TypeScript, Tailwind, Supabase, Husky, lint-staged, Vitest, Playwright, Cursor rules.

**Deps de base (alignées Voyagely)** : Radix (slot, dialog, dropdown, label, separator, tabs, toast, tooltip, scroll-area, popover, checkbox, switch, accordion), date-fns, uuid, clsx, tailwind-merge, cva, React Query, Zustand, Zod, React Hook Form, Sonner, Lucide. Scripts : `type-check`, `prepush` (coverage + e2e).

**pnpm build scripts** : `onlyBuiltDependencies: [esbuild, msw]` est défini dans `package.json` et `pnpm-workspace.yaml`. Si tu vois encore le warning « Run pnpm approve-builds » après `pnpm install`, lance une fois `pnpm approve-builds` puis **Espace** sur esbuild, **Espace** sur msw, **Entrée** — la sélection est enregistrée et le warning disparaît aux prochains installs.
