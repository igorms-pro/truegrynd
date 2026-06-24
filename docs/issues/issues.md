# Truegrynd – Backlog

> **Tracker vivant** (suivi + tâches en cours).  
> Détail historique V1/V2 (sections A–L, V2-00–12) : **[archive-v1-v2-detail.md](./archive-v1-v2-detail.md)** · Stratégie V3 : **[V3_STRATEGY.md](../V3_STRATEGY.md)**

**Dernière mise à jour :** 24 juin 2026

---

## Prochaine action

🟢 **V3 — Écosystème B2B2C : TERMINÉE.** Toutes les issues #109–#119 + #122/#136/#137/#139 livrées et fermées. Migrations prod **028→043**. Surface PRO complète : Dashboard · Judge · Events (multi-WOD, edit/cancel) · TV (realtime) · Ligues (opt-in + standings) · Members · Billing (Stripe GYM PRO live) · PLG · Pacing.  
👉 **QA visuel de fin de V3** (Igor), puis lancer la prochaine grande phase : **V4** (gestion salle, [#140](https://github.com/igorms-pro/truegrynd/issues/140)) ou **V5** (premium B2C, [#141](https://github.com/igorms-pro/truegrynd/issues/141)).

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

## V4 / V5 — Phases futures (epics)

| Epic                                                              | Rôle                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| **V4** [#140](https://github.com/igorms-pro/truegrynd/issues/140) | App **gestion de salle** (planning/résa/abos, Peppy/Resawod) |
| **V5** [#141](https://github.com/igorms-pro/truegrynd/issues/141) | **Premium B2C** « Verified Athlete » (+ cosmetics)           |

---

## Suivi synthétique

| Bloc                                  | Avancement                                                                                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1 core** (UGC, admin, B–G)         | 🟢 PR [#30](https://github.com/igorms-pro/truegrynd/pull/30)–[#55](https://github.com/igorms-pro/truegrynd/pull/55) · migrations **`006`–`014`**                                                           |
| **V1.5** (faction, profil, settings)  | 🟢 [#57](https://github.com/igorms-pro/truegrynd/issues/57)–[#62](https://github.com/igorms-pro/truegrynd/issues/62)                                                                                       |
| **Pré-V2 polish**                     | 🟢 [#63](https://github.com/igorms-pro/truegrynd/issues/63)–[#68](https://github.com/igorms-pro/truegrynd/issues/68)                                                                                       |
| **Production hardening**              | 🟢 [#69](https://github.com/igorms-pro/truegrynd/issues/69) PR [#70](https://github.com/igorms-pro/truegrynd/pull/70)                                                                                      |
| **V2-00–12**                          | 🟢 [#71](https://github.com/igorms-pro/truegrynd/issues/71)–[#99](https://github.com/igorms-pro/truegrynd/pull/99) · migrations **`015`–`027`**                                                            |
| **QA V2 + clean code**                | 🟢 [#100](https://github.com/igorms-pro/truegrynd/issues/100) · PRs [#101](https://github.com/igorms-pro/truegrynd/pull/101)–[#108](https://github.com/igorms-pro/truegrynd/pull/108)                      |
| **V3 B2B2C**                          | 🟢 **terminée** · [#109](https://github.com/igorms-pro/truegrynd/issues/109)–[#119](https://github.com/igorms-pro/truegrynd/issues/119) + #122/#136/#137/#139 · PRs #120–#148 · migrations **`028`–`043`** |
| **V4 gestion salle / V5 premium B2C** | 🔴 epics [#140](https://github.com/igorms-pro/truegrynd/issues/140) / [#141](https://github.com/igorms-pro/truegrynd/issues/141)                                                                           |

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
