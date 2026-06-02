# Truegrynd – Backlog

> **Tracker vivant** (suivi + tâches en cours).  
> Détail historique V1/V2 (sections A–L, V2-00–12) : **[archive-v1-v2-detail.md](./archive-v1-v2-detail.md)**

**Dernière mise à jour :** 2 juin 2026

---

## Prochaine action

🟡 **[#100 — QA manuel V2 prod](https://github.com/igorms-pro/truegrynd/issues/100)** — smoke V2-01→12 + PostHog EU · **gate avant V3 ou Stripe**

**Parcours pas à pas :** [qa-v2-manual.md](./qa-v2-manual.md) · issue [#100](https://github.com/igorms-pro/truegrynd/issues/100)

---

## Suivi synthétique

| Bloc                                 | Avancement                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1 core** (UGC, admin, B–G)        | 🟢 PR [#30](https://github.com/igorms-pro/truegrynd/pull/30)–[#55](https://github.com/igorms-pro/truegrynd/pull/55) · migrations **`006`–`014`** prod |
| **V1.5** (faction, profil, settings) | 🟢 [#57](https://github.com/igorms-pro/truegrynd/issues/57)–[#62](https://github.com/igorms-pro/truegrynd/issues/62)                                  |
| **Pré-V2 polish**                    | 🟢 [#63](https://github.com/igorms-pro/truegrynd/issues/63)–[#68](https://github.com/igorms-pro/truegrynd/issues/68)                                  |
| **Production hardening**             | 🟢 [#69](https://github.com/igorms-pro/truegrynd/issues/69) PR [#70](https://github.com/igorms-pro/truegrynd/pull/70)                                 |
| **V2-00–12**                         | 🟢 [#71](https://github.com/igorms-pro/truegrynd/issues/71)–[#99](https://github.com/igorms-pro/truegrynd/pull/99) · migrations **`015`–`027`** prod  |
| **QA V1**                            | 🟢 GO (juin 2026)                                                                                                                                     |
| **QA V2** (gate V3)                  | 🟡 [#100](https://github.com/igorms-pro/truegrynd/issues/100) · branche `feature/issue-100-qa-v2-manual`                                              |

**Suite produit (post-QA GO) :** HogQL cosmetics ([MONETIZATION_V2-12.md](../MONETIZATION_V2-12.md) §2.2) **ou** V3 gym ([V3_STRATEGY.md](../V3_STRATEGY.md) §4) · notifs rivals push = hors scope

---

## M. QA V2 — smoke prod (en cours)

**Issue :** [#100](https://github.com/igorms-pro/truegrynd/issues/100) · **Branche :** `feature/issue-100-qa-v2-manual` · **Verdict :** à remplir après tes tests prod

### Prérequis

- [ ] Redeploy Vercel prod (PostHog `NEXT_PUBLIC_POSTHOG_KEY` + host EU)
- [ ] Compte athlète onboardé · admin MOD si dispo · mobile 375px + desktop

### Checklist

→ **[qa-v2-manual.md](./qa-v2-manual.md)** (11 parcours · cases à cocher)

### Sortie

- [ ] Verdict dans **#100**
- [ ] Si NO-GO → issues FIX avant V3

---

## Post-MVP (pas démarré)

| Piste                                        | Doc                                               | Gate                    |
| -------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Stripe Finisher cosmetics                    | [MONETIZATION_V2-12.md](../MONETIZATION_V2-12.md) | QA #100 GO + HogQL §2.2 |
| V3 gym / RBAC coach                          | [V3_STRATEGY.md](../V3_STRATEGY.md) §4            | QA #100 GO              |
| V1.1 leftovers (Sentry, rate limit IA, etc.) | [archive](./archive-v1-v2-detail.md)              | issue dédiée si besoin  |

**Hors scope :** rang sportif payant · notifs rivals push (sauf demande explicite)

---

## Légende & workflow

🔴 not started · 🟡 in progress · 🟢 done · ⏸️ blocked · 🔵 QA · 🟣 on hold

1. **GitHub Issue** → branche `feature/issue-N-slug` (voir `.cursor/rules/issue-workflow.mdc`)
2. PR ≤ ~400 lignes · RLS review si migration `008+`
3. Mettre à jour **Suivi synthétique** ici : 🟡 → PR → 🟢

---

**Références :** [CONTEXT.md](../CONTEXT.md) · [V2_STRATEGY.md](../V2_STRATEGY.md) · [PROJECT.md](../../PROJECT.md)
