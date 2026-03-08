# Truegrynd – Contexte produit & technique

Document de référence pour toute l’équipe et pour l’IA. À jour = source de vérité.

---

## 1. Executive Summary

**Tagline :** _"L'effort ne s'achète pas, il se prouve."_

**Problème :** Se mesurer et valider son niveau en fitness coûte cher (100–150 € pour Hyrox, Spartan, etc.) et impose de se déplacer. La compétition est devenue un produit de luxe.

**Solution :** Truegrynd est une app web B2C de **compétition asynchrone**, propulsée par la communauté (UGC). N’importe quel sportif peut affronter les autres sur des **défis standardisés**, partout dans le monde, **gratuitement**. On enlève la barrière financière et logistique : l’effort reste le même, l’arène devient globale.

**Positionnement :** Le "Casio G-Shock" du fitness face aux "Rolex" de l’événementiel — détermination brute, pas premium sous les néons.

---

## 2. Le Golden Circle

|          |                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **WHY**  | Le mérite, la sueur et le dépassement de soi n’appartiennent pas qu’à une élite financière.                                            |
| **HOW**  | Décentraliser la compétition : n’importe quel salon, parc ou salle low-cost devient une arène mondiale connectée.                      |
| **WHAT** | Plateforme sociale de défis sportifs virtuels : créer/rejoindre/valider des épreuves, grimper au classement mondial, gagner du statut. |

---

## 3. Innovations clés

- **Factions** : À l’inscription, choix d’une équipe mondiale (ex. Les Nomades, La Horde, L’Alliance de Fer). Le score individuel compte aussi pour la Faction. Rétention par appartenance.
- **Smart Proof** : Pas d’hébergement vidéo. Scores sur l’honneur pour la majorité ; pour le **Top 10%** du leaderboard, obligation d’une URL vidéo (YouTube/TikTok non répertoriée).
- **Creator Score** : Les créateurs de défis populaires gagnent badges et réputation (UGC).

---

## 4. MVP – Périmètre technique

- **Auth** : Google / Apple / Email (Supabase).
- **Onboarding** : Profil biométrique (pseudo, sexe, âge, poids) + initiation simplifiée (défis “bouton c’est fait”, pas de GPS) + choix de Faction.
- **Arène** : Feed de défis (seeded au début), page défi + leaderboard filtrable (global, âge, sexe, faction).
- **Soumission** : Chrono ou reps + URL vidéo si Top 10%.
- **Finisher Card** : Image générée (score, rang, faction) + partage (téléchargement pour Stories).
- **Profil** : Historique, rang Faction, vitrine des trophées.

Pas d’initiation lourde (pas de 50 burpees / 1 km run obligatoire avant d’entrer).

---

## 5. Stack & fondations

- **Framework :** Next.js 16 (App Router), TypeScript.
- **Style :** Tailwind v4, thème sombre Truegrynd.
- **Backend :** Supabase (auth, DB, realtime).
- **State :** Zustand + React Query.
- **Forms :** React Hook Form + Zod.
- **UI :** Radix UI, Lucide, Sonner.
- **Tests :** Vitest (unit) + Playwright (e2e).
- **Qualité :** ESLint, Prettier, Husky (pre-commit: lint-staged, pre-push: typecheck + test:run).

Les règles Cursor (`.cursor/rules/*.mdc`) détaillent l’architecture, le backend Supabase, le design system et les conventions de code.

---

## 6. Issues & tracking

Tasks are in **[docs/issues/issues.md](./issues/issues.md)** : full tracker by feature (Voyagely style), with detailed sub-tasks, acceptance criteria, and progress table through MVP. Includes **Issue #2: i18n & light/dark theme** right after DB (Issue #1). See [docs/issues/README.md](./issues/README.md) for the convention.
