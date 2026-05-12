# Truegrynd – Backlog post-MVP

> **MVP livré** (auth, onboarding, arène, soumission Smart Proof, Finisher Card, profil, nav).  
> Ce fichier ne conserve plus les anciennes issues #0–#10 : elles servaient à shipper le MVP, pas à piloter la suite.

**Dernière mise à jour :** 12 mai 2026

---

## État livraison (code vs prod)

| Quoi                                              | Statut                                                                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UGC Creator Studio + migrations `006` / `007`** | Code sur branche **`review-mvp`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) **ouverte** (pas encore mergée dans `main`). Après merge : appliquer les migrations sur le projet Supabase **prod**. |

---

## Pourquoi Truegrynd peut tuer la concurrence

Les “concurrents” se coupent en deux familles : **apps de suivi** (Strava, etc.) et **événements payants** (Hyrox, Spartan, compets locales). Truegrynd n’est ni un tracker ni un billet à 150 € — c’est une **arène mondiale async** avec les mêmes défis pour tous.

| Levier                       | Ce que ça apporte                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Barrière zéro**            | Gratuit, pas de déplacement, pas de créneau imposé — on scale là où les comps physiques ne peuvent pas.                    |
| **Même épreuve, même règle** | Classements comparables (chrono / reps) ; pas de “mon WOD à moi”.                                                          |
| **Smart Proof**              | Pas d’hébergement vidéo ; preuve quand ça compte (élite / top du board) — crédibilité sans coût Netflix.                   |
| **Factions**                 | Appartenance + rivalité durable sans refaire un réseau social (pas de feed, pas de DM).                                    |
| **UGC + modération**         | La communauté alimente les défis ; la qualité dépend d’un **flux d’approbation** clair (pas seulement Supabase à la main). |
| **Finisher Card**            | Sortie **shareable** (image, marque, faction) — boucle de acquisition là où les trackers n’ont qu’un screenshot fade.      |
| **Identité visuelle**        | Sombre, brut, high contrast — mémorable vs apps “wellness pastel”.                                                         |

**Ce n’est pas “une feature” qui tue** : c’est la combinaison **légitimité du classement + friction basse + identité + viralité légère**.

---

## Ce qu’il faut dans l’app pour matérialiser ça (post-MVP)

Ordre indicatif — à ajuster selon acquisition / rétention réelles.

### 1. Boucle UGC crédible

- [x] **FEAT** — Implémentation Creator Studio (pending, RLS `006`, cap temps `007`) — voir PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) (ouverte)
- [ ] **CHORE** — Merger PR #30 → `main` + appliquer migrations `006` / `007` sur Supabase **prod**
- [ ] **FEAT** — **Admin (in-app ou outil dédié)** : file d’attente pending → approuver / rejeter avec motif, visible côté créateur
- [ ] **FEAT** — **Creator Score / réputation** : points ou badges quand un défi approuvé est joué (cf. `docs/CONTEXT.md` § innovations) — à trancher (simple compteur vs tiers)

### 2. Rétention sans devenir un réseau social

- [ ] **FEAT** — **Streaks** : jours consécutifs d’activité (soumission ou ouverture arène — à définir)
- [ ] **FEAT** — **Respect** 👊 sur le leaderboard : micro-signal social, pas de messagerie

### 3. Croissance

- [ ] **FEAT** — **Referral** : lien “recruter un allié” avec pré-sélection de Faction (déjà évoqué dans le produit)

### 4. Qualité & confiance (quand le volume augmente)

- [ ] **FEAT** — Signalement de défi / score (optionnel, modération)
- [ ] **CHORE** — i18n des meta / SEO par locale (optionnel qualité)
- [ ] **CHORE** — Domaine custom prod (optionnel)

---

## Légende des statuts

- 🔴 **Not started**
- 🟡 **In progress**
- 🟢 **Done**
- ⏸️ **Blocked**
- 🔵 **Testing / QA**
- 🟣 **On hold**

Préfixes : **FEAT** · **FIX** · **CHORE** · **DOC** · **PERF**

---

## Workflow (équipe / agent)

1. Choisir un item du backlog ci-dessus (ou une issue GitHub qui le découpe).
2. Branche : `feature/…` ou `fix/…` (voir `.cursor/rules/git-workflow.mdc`).
3. Issue GitHub optionnelle mais recommandée pour tout morceau > 1–2 PRs.
4. PR avec description testable ; mettre à jour les cases `[ ]` → `[x]` ici quand c’est **mergé sur `main`** (et migrations prod si applicable), selon ta règle d’équipe.

---

## Suivi synthétique

| Bloc                           | Avancement                                      |
| ------------------------------ | ----------------------------------------------- |
| UGC création + RLS + cap temps | 🟡 Code prêt — **PR #30 ouverte**, merge + prod |
| Admin approbation défis        | 🔴                                              |
| Creator Score                  | 🔴                                              |
| Streaks                        | 🔴                                              |
| Respect leaderboard            | 🔴                                              |
| Referral                       | 🔴                                              |

**Prochain focus suggéré :** merger **PR #30** + migrations prod, puis **Admin approbation UGC** — sans modération in-app (ou outil), la boucle UGC reste fragile à l’échelle.

---

**Référence produit / technique :** [docs/CONTEXT.md](../CONTEXT.md) · **Conventions dossier :** [README.md](./README.md)
