# Truegrynd – Backlog post-MVP

> **MVP livré.** Les anciennes issues #0–#10 ne sont plus maintenues ici (historique Git / PRs).  
> Ce fichier = **backlog après MVP** + **vision différenciation**.

**Dernière mise à jour :** 12 mai 2026

---

## État livraison (code vs prod)

| Quoi                                              | Statut                                                                                                                                                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UGC Creator Studio + migrations `006` / `007`** | **Mergé dans `main`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) (**merged** 2026-05-12). À faire côté ops : **`supabase db push`** (ou équivalent) sur le projet Supabase **prod** pour appliquer `006` + `007`. |

---

## Pourquoi Truegrynd peut tuer la concurrence

Les “concurrents” : **apps de suivi** (Strava, etc.) vs **événements payants** (Hyrox, Spartan). Truegrynd = **arène mondiale async**, même règle pour tous, sans billet ni déplacement.

| Levier                       | Ce que ça apporte                                                                |
| ---------------------------- | -------------------------------------------------------------------------------- |
| **Barrière zéro**            | Gratuit, pas de déplacement, pas de créneau imposé.                              |
| **Même épreuve, même règle** | Classements comparables (chrono / reps).                                         |
| **Smart Proof**              | Preuve vidéo sans héberger la vidéo ; crédibilité quand ça compte.               |
| **Factions**                 | Appartenance + rivalité sans feed / DM.                                          |
| **UGC + modération**         | La communauté crée les défis ; **l’admin UGC** garantit la qualité du catalogue. |
| **Finisher Card**            | Partage image (marque, faction, rang).                                           |
| **Identité visuelle**        | Dark, brut, high contrast — pas le “wellness pastel”.                            |

---

## Ce qu’il faut dans l’app (post-MVP)

### 1. Boucle UGC crédible

- [x] **FEAT** — Creator Studio (pending, RLS `006`, cap temps `007`) — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) mergée
- [ ] **CHORE** — Migrations `006` / `007` appliquées sur Supabase **prod**
- [ ] **FEAT** — **Admin UGC** (voir section dédiée ci-dessous)
- [ ] **FEAT** — **Creator Score** : réputation quand un défi approuvé est joué (`docs/CONTEXT.md`)

### 2. Rétention

- [ ] **FEAT** — **Streaks** (définir l’événement qui incrémente un jour)
- [ ] **FEAT** — **Respect** sur le leaderboard (micro-signal, pas de messagerie)

### 3. Croissance

- [ ] **FEAT** — **Referral** + pré-sélection Faction

### 4. Qualité & confiance (volume)

- [ ] **FEAT** — Signalement défi / score (optionnel)
- [ ] **CHORE** — Meta / SEO i18n par locale (optionnel)
- [ ] **CHORE** — Domaine custom prod (optionnel)

---

## Admin UGC — périmètre recommandé

**Objectif :** un modérateur (compte dédié ou rôle) voit les `challenges` en `status = 'pending'`, peut **approuver** (`approved`, visible arène) ou **rejeter** (`rejected`) avec un **motif** stocké et lisible par le **créateur** sur son défi.

### Données (Supabase)

- Aujourd’hui : `challenges.status` ∈ `pending | approved | rejected`, `creator_id`, etc.
- **À ajouter (migration)** : par ex. `rejection_reason text null`, `reviewed_at timestamptz null`, `reviewed_by uuid null` (FK `profiles` ou `auth.users`), pour traçabilité et UX créateur.

### Sécurité (RLS)

- **Policy SELECT** : rôle admin — soit `profiles.is_admin boolean`, soit table `admin_users`, soit **claim JWT** / `app_metadata` Supabase (`role: admin`) lu côté policy (selon ce que vous utilisez déjà).
- **Policy UPDATE** sur `challenges` : uniquement admin ; champs autorisés : `status`, `rejection_reason`, `reviewed_at`, `reviewed_by` (pas titre/rules arbitraires par le modérateur en V1, sauf besoin produit).
- Les créateurs gardent **SELECT** sur leurs lignes (migration `006`) ; ajouter une policy ou UX pour voir **rejected + motif**.

### App (Next.js)

- Route dédiée : ex. `/app/admin/challenges` (protégée : redirect si non-admin).
- Liste : table virtuelle ou query `status = pending` tri `created_at`.
- Actions : boutons **Approve** / **Reject** (modal + textarea motif si reject).
- Service : `updateChallengeStatus` dans `features/challenges/services/` (pas de Supabase brut dans la page).
- **Créateur** : sur `ChallengeDetail` (ou page “mes défis”), si `rejected` + motif, afficher l’état (i18n).

### Hors scope V1 (possible plus tard)

- File d’attente avec pagination avancée, filtres, bulk approve, audit log séparé, notifications email.

### Ordre d’implémentation suggéré

1. Migration colonnes + RLS admin update
2. Marquer 1–2 comptes admin (metadata ou `is_admin`)
3. Écran admin minimal + i18n EN/FR
4. Surface créateur “rejeté + raison”

---

## Légende

🔴 not started · 🟡 in progress · 🟢 done · ⏸️ blocked · 🔵 QA · 🟣 on hold  
Préfixes : **FEAT** · **FIX** · **CHORE** · **DOC** · **PERF**

---

## Workflow

1. Item backlog ou issue GitHub.
2. Branche `feature/…` / `fix/…`.
3. PR testable ; cocher ici après merge `main` (+ migrations prod si besoin).

---

## Suivi synthétique

| Bloc                           | Avancement                                  |
| ------------------------------ | ------------------------------------------- |
| UGC création + RLS + cap temps | 🟢 Mergé PR #30 — reste **migrations prod** |
| Admin approbation défis        | 🔴                                          |
| Creator Score                  | 🔴                                          |
| Streaks / Respect / Referral   | 🔴                                          |

**Prochain focus :** **Admin UGC** (migration + RLS + route `/app/admin/...` + UX créateur).

---

**Référence :** [docs/CONTEXT.md](../CONTEXT.md) · [README.md](./README.md)
