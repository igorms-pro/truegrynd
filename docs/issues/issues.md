# Truegrynd – Backlog

> **Tracker vivant** (suivi + tâches en cours).  
> Détail historique V1/V2 (sections A–L, V2-00–12) : **[archive-v1-v2-detail.md](./archive-v1-v2-detail.md)** · Stratégie V3 : **[V3_STRATEGY.md](../V3_STRATEGY.md)**

**Dernière mise à jour :** 5 juillet 2026

---

## Prochaine action

🟢 **V3 FINITO** — build + **3 rounds de QA Igor** (refonte /pro #155/#156 · QA v2 #157–#161 · QA v3 + design pass #162–#166). Migrations prod **028→049**. Surface PRO niveau « big app » : sidebar collapsible, dashboard signal, Judge (filtres/recherche/pagination), Events (hero, pickers MIN:SEC), Membres (table + filtres sexe/âge/vérifiés/poids), Ligues, page gym publique `/app/gym/[slug]`, Billing SaaS (Stripe new tab). Fixes sécu : scoping RPCs (mig 044, 046).
👉 **V4 — gestion salle** ([#140](https://github.com/igorms-pro/truegrynd/issues/140)) : slices **V4-01→08** créées ([#167](https://github.com/igorms-pro/truegrynd/issues/167)–[#174](https://github.com/igorms-pro/truegrynd/issues/174)). Démarrer par **V4-01 Planning**. En parallèle recommandé : **pilote box réelle d'Igor** (vrai SIRET, vrai event, vrais membres).

_Backlog transverse ouvert :_ [#154](https://github.com/igorms-pro/truegrynd/issues/154) commentaires communauté (s'intercale quand on veut) · [#153](https://github.com/igorms-pro/truegrynd/issues/153) matching partenaires (s'insère autour de V4-08).
_Reste V2 (non bloquant, suivi dans [#100](https://github.com/igorms-pro/truegrynd/issues/100)) :_ passe **prod Vercel** + **PostHog Live** · duel rival end-to-end (2 comptes) · pagination leaderboard 100k (backend).

---

## V3 — Écosystème B2B2C

Pivot B2B2C : l'arène B2C gratuite reste le moteur d'acquisition, les salles paient (rôle PRO). Codebase unique + RBAC. Détail : [V3_STRATEGY.md](../V3_STRATEGY.md).

### Phase 0 — Socle ✅

| Issue                                                                | Rôle                                          | Statut                 |
| -------------------------------------------------------------------- | --------------------------------------------- | ---------------------- |
| **V3-00** [#109](https://github.com/igorms-pro/truegrynd/issues/109) | RBAC : enum rôle + guards `/pro` `/admin`     | 🟢 #120 (mig 028)      |
| **V3-01** [#110](https://github.com/igorms-pro/truegrynd/issues/110) | Table `gyms` + affiliation + RLS multi-tenant | 🟢 #121 (mig 029)      |
| **V3-02** [#111](https://github.com/igorms-pro/truegrynd/issues/111) | Proof levels + `verified_by_coach_id`         | 🟢 #124 (mig 030)      |
| **V3-03** [#112](https://github.com/igorms-pro/truegrynd/issues/112) | **Judge Console** (validation coach 1-clic)   | 🟢 #126/#127 (mig 031) |

### Phase 1 — Surface PRO ✅

| Issue                                                                | Rôle                                           | Statut                               |
| -------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ |
| **V3-04** [#113](https://github.com/igorms-pro/truegrynd/issues/113) | Shell `/pro` + KYB onboarding gym              | 🟢 #125/#128/#129/#130 (mig 032–034) |
| **V3-05** [#114](https://github.com/igorms-pro/truegrynd/issues/114) | TV Broadcaster Mode (Realtime)                 | 🟢 #135                              |
| **V3-06** [#115](https://github.com/igorms-pro/truegrynd/issues/115) | Ligues inter-box (opt-in + standings)          | 🟢 #138/#147 (mig 038, 042)          |
| **V3-07** [#116](https://github.com/igorms-pro/truegrynd/issues/116) | Pacing Assistant auto                          | 🟢 #148 (mig 043)                    |
| **Events** (sous #113)                                               | Création → standings → multi-WOD → edit/cancel | 🟢 #131–#134/#146 (mig 035–037, 041) |

### Phase 2 — Monétisation / GTM ✅

| Issue                                                                          | Rôle                                | Statut                                                                           |
| ------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------- |
| **V3-08** [#117](https://github.com/igorms-pro/truegrynd/issues/117)           | Stripe abo gym 100 $/mo (GYM PRO)   | 🟢 #142–#144 (mig 039) · live test mode                                          |
| **V3-09** [#118](https://github.com/igorms-pro/truegrynd/issues/118)           | Trigger PLG (demande coach → offre) | 🟢 #145 (mig 040)                                                                |
| **V3-10** [#119](https://github.com/igorms-pro/truegrynd/issues/119)           | Cosmetics Stripe B2C                | ↪️ refold dans **V5** [#141](https://github.com/igorms-pro/truegrynd/issues/141) |
| Ranking vérifié B2C [#137](https://github.com/igorms-pro/truegrynd/issues/137) | Badges proof leaderboard public     | 🟢 déjà livré (proof levels V2)                                                  |

---

### Phase 3 — QA & polish (rounds Igor) ✅

| Round               | Contenu                                                                                                                                                                                       | Statut                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Refonte `/pro`      | Workspace dédié (sidebar, onboarding KYB first, thème/langue) + liens profils membres                                                                                                         | 🟢 #155/#156               |
| QA v2 (9 pts)       | Pickers MIN:SEC + reps number · page gym publique `/app/gym/[slug]` · sidebar collapsible · Judge search+pagination · dashboard signal · billing new tab                                      | 🟢 #157–#161 (mig 045)     |
| QA v3 + design pass | Judge filtres (chips+event) · hero event · membres table+filtres (sexe/âge/vérifiés/poids) · ligues enrichies · billing SaaS · FilterSelect themé · largeurs 7xl · **fix scoping RPCs admin** | 🟢 #162–#166 (mig 046–049) |

---

## V4 — Gestion salle (en cours de prépa)

Remplacer Peppy : planning, résa, abos, paiements membres — bundlé avec le moat compétition. Stratégie : [V4_STRATEGY.md](../V4_STRATEGY.md) · Epic [#140](https://github.com/igorms-pro/truegrynd/issues/140).

| Slice      | Issue                                                                                                                   | Rôle                                                                  | Statut |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| **V4-01**  | [#167](https://github.com/igorms-pro/truegrynd/issues/167)                                                              | Planning : créneaux récurrents + calendrier membre « Ma salle »       | 🔴     |
| **V4-02**  | [#168](https://github.com/igorms-pro/truegrynd/issues/168)                                                              | Réservations : booking, waitlist, no-show + roster coach avec niveau  | 🔴     |
| **V4-03**  | [#169](https://github.com/igorms-pro/truegrynd/issues/169)                                                              | Boucle résa ⇄ WOD + leaderboard de classe (killer #2)                 | 🔴     |
| **V4-04**  | [#170](https://github.com/igorms-pro/truegrynd/issues/170)                                                              | Retention dashboard : membres à risque (killer #1, argument de vente) | 🔴     |
| **V4-05**  | [#171](https://github.com/igorms-pro/truegrynd/issues/171)                                                              | Abonnements & carnets (plans de la salle)                             | 🔴     |
| **V4-06**  | [#172](https://github.com/igorms-pro/truegrynd/issues/172)                                                              | Paiements membres — Stripe Connect Express                            | 🔴     |
| **V4-07**  | [#173](https://github.com/igorms-pro/truegrynd/issues/173)                                                              | Check-in / présence (kiosk coach)                                     | 🔴     |
| **V4-08**  | [#174](https://github.com/igorms-pro/truegrynd/issues/174)                                                              | Social booking + drop-in cross-gym (killers #3/#4)                    | 🔴     |
| Transverse | [#153](https://github.com/igorms-pro/truegrynd/issues/153) / [#154](https://github.com/igorms-pro/truegrynd/issues/154) | Matching partenaires · commentaires communauté                        | 🔴     |

**Critère de succès V4 :** la box pilote lâche Peppy et fait tourner sa semaine complète sur TrueGrynd.

---

## V5 — Phase future (epic)

| Epic                                                              | Rôle                                               |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| **V5** [#141](https://github.com/igorms-pro/truegrynd/issues/141) | **Premium B2C** « Verified Athlete » (+ cosmetics) |

---

## Suivi synthétique

| Bloc                                 | Avancement                                                                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1 core** (UGC, admin, B–G)        | 🟢 PR [#30](https://github.com/igorms-pro/truegrynd/pull/30)–[#55](https://github.com/igorms-pro/truegrynd/pull/55) · migrations **`006`–`014`**                                                              |
| **V1.5** (faction, profil, settings) | 🟢 [#57](https://github.com/igorms-pro/truegrynd/issues/57)–[#62](https://github.com/igorms-pro/truegrynd/issues/62)                                                                                          |
| **Pré-V2 polish**                    | 🟢 [#63](https://github.com/igorms-pro/truegrynd/issues/63)–[#68](https://github.com/igorms-pro/truegrynd/issues/68)                                                                                          |
| **Production hardening**             | 🟢 [#69](https://github.com/igorms-pro/truegrynd/issues/69) PR [#70](https://github.com/igorms-pro/truegrynd/pull/70)                                                                                         |
| **V2-00–12**                         | 🟢 [#71](https://github.com/igorms-pro/truegrynd/issues/71)–[#99](https://github.com/igorms-pro/truegrynd/pull/99) · migrations **`015`–`027`**                                                               |
| **QA V2 + clean code**               | 🟢 [#100](https://github.com/igorms-pro/truegrynd/issues/100) · PRs [#101](https://github.com/igorms-pro/truegrynd/pull/101)–[#108](https://github.com/igorms-pro/truegrynd/pull/108)                         |
| **V3 B2B2C**                         | 🟢 **terminée** · [#109](https://github.com/igorms-pro/truegrynd/issues/109)–[#119](https://github.com/igorms-pro/truegrynd/issues/119) + #122/#136/#137/#139 · PRs #120–#148 · migrations **`028`–`043`**    |
| **QA V3 (3 rounds) + design pass**   | 🟢 PRs #155–#166 · migrations **`044`–`049`**                                                                                                                                                                 |
| **V4 gestion salle**                 | 🟡 **prépa** · epic [#140](https://github.com/igorms-pro/truegrynd/issues/140) · slices [#167](https://github.com/igorms-pro/truegrynd/issues/167)–[#174](https://github.com/igorms-pro/truegrynd/issues/174) |
| **V5 premium B2C**                   | 🔴 epic [#141](https://github.com/igorms-pro/truegrynd/issues/141)                                                                                                                                            |

---

## Post-MVP (non planifié)

| Piste                                        | Doc / suivi                          |
| -------------------------------------------- | ------------------------------------ |
| V1.1 leftovers (Sentry, rate limit IA, etc.) | [archive](./archive-v1-v2-detail.md) |

**Hors scope :** rang sportif payant · notifs rivals push (sauf demande explicite)

---

## Légende & workflow

🔴 not started · 🟡 in progress · 🟢 done · ⏸️ blocked · 🔵 QA / en cours · 🟣 on hold

1. **GitHub Issue** → branche `feature/issue-N-slug` (voir `.cursor/rules/issue-workflow.mdc`)
2. PR ≤ ~400 lignes · RLS review si migration `008+`
3. Mettre à jour **Suivi synthétique** ici : 🔵 → PR → 🟢

---

**Références :** [CONTEXT.md](../CONTEXT.md) · [V2_STRATEGY.md](../V2_STRATEGY.md) · [V3_STRATEGY.md](../V3_STRATEGY.md) · [PROJECT.md](../../PROJECT.md)
