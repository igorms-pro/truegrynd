# Truegrynd — QA checklist V1 (strong)

**Périmètre :** tout ce qui est sur `main` après PR #30 → #55 + migrations prod `006`–`013`.  
**Pas V2** (divisions, weekly, rating, etc.) — pas encore codé.

**Environnement :** tester contre **prod Supabase** + déploiement Vercel (ou `pnpm dev` + `.env.local` prod).  
**Locales :** au minimum **EN** + **FR** sur les parcours critiques.  
**Comptes suggérés :** 1 admin, 2 users normaux (factions différentes), 1 créateur UGC.

Coche : `[ ]` à faire · `[x]` OK · `[!]` bug (noter en bas)

---

## 0. Prérequis ops

- [x] Migrations **`001`–`014`** appliquées sur le projet Supabase utilisé par l’app (`013` = `challenges.ends_at` + RPC `admin_close_challenge` ; `014` = `scores.is_hidden` + metadata update RLS)
- [ ] Edge Function **`admin-challenge-ai-review`** déployée
- [ ] Secrets Supabase : **`OPENAI_API_KEY`** (et optionnel `OPENAI_MODEL`)
- [ ] Au moins 1 compte avec `profiles.is_admin = true` (voir `docs/RUNBOOK.md`)
- [ ] Navigateur : session propre ou navigation privée pour tests auth

---

## 1. Auth & entrée

| #    | Test                                        | Attendu                                                      | EN  | FR  |
| ---- | ------------------------------------------- | ------------------------------------------------------------ | --- | --- |
| 1.1  | `/` ou `/en` non connecté                   | Redirige vers `/en/auth` (ou locale)                         | [ ] | [ ] |
| 1.2  | Page auth : magic link                      | Formulaire visible, pas de crash                             | [ ] | [ ] |
| 1.3  | OAuth Google / Apple (si configuré)         | Login OK ou erreur claire                                    | [ ] | [ ] |
| 1.4  | Routes protégées sans session               | `/en/app/arena`, `/profile`, `/onboarding` → auth            | [ ] | [ ] |
| 1.5  | **LOG OUT** (profil → ⚙️ → `/app/settings`) | Retour auth, session invalidée, routes app inaccessibles     | [ ] | [ ] |
| 1.5b | **Settings** `/app/settings`                | Passeport éditable, unités, export JSON, logout rouge en bas | [ ] | [ ] |

---

## 2. Onboarding

| #   | Test                                        | Attendu                                                        | EN  | FR  |
| --- | ------------------------------------------- | -------------------------------------------------------------- | --- | --- |
| 2.1 | Nouveau user : parcours onboarding complet  | Profil + faction + fin initiation → arena/overview             | [ ] | [ ] |
| 2.2 | Champs requis                               | Impossible de continuer sans pseudo, sexe, âge, poids, faction | [ ] | [ ] |
| 2.3 | Referral `?faction=horde` (ou autre valide) | Faction pré-sélectionnée si flow prévu                         | [ ] | [ ] |
| 2.4 | Referral invalide                           | Pas de crash ; valeur ignorée ou rejet propre                  | [ ] | [ ] |

---

## 3. Arena & navigation

| #    | Test                                        | Attendu                                                                | EN  | FR  |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------- | --- | --- |
| 3.1  | `/en/app/arena`                             | Liste challenges **live** (approved, pas fermés), pas écran blanc      | [ ] | [ ] |
| 3.1b | Défi **FERMER** en MOD (admin)              | Disparaît du feed `/arena` ; détail direct URL encore OK (leaderboard) | [ ] | [ ] |
| 3.2  | Dock / nav desktop                          | Overview, Arena, Clan, Profile (+ MOD si admin)                        | [ ] | [ ] |
| 3.3  | Filtres leaderboard (si présents sur liste) | Changement sans erreur                                                 | [ ] | [ ] |
| 3.4  | Ouvrir un challenge **approved**            | Détail + leaderboard                                                   | [ ] | [ ] |

---

## 4. Soumission de score & Smart Proof

**Préparer :** un challenge **time** et un **reps**, avec quelques scores déjà validés si possible.

| #   | Test                                                 | Attendu                                                            | EN  | FR  |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------ | --- | --- |
| 4.1 | Submit **sans** vidéo                                | Score enregistré ; **pas** dans le leaderboard classé (non validé) | [x] | [x] |
| 4.2 | Submit **avec** URL YouTube/TikTok valide            | Score **validé** ; apparaît au leaderboard                         | [x] | [x] |
| 4.3 | URL vidéo invalide                                   | Message d’erreur clair, pas de crash                               | [x] | [x] |
| 4.4 | Cap temps (si challenge avec `max_duration_seconds`) | Rejet ou message si temps trop long                                | [x] | [x] |
| 4.5 | Finisher flow après submit                           | Page finish / card générée ou CTA cohérent                         | [x] | [x] |

**§4 notes (2026-06-01) :** `POST SCORE` = lien vers `/submit` uniquement (`ChallengeDetailHero` + copy `ctaSubline` EN/FR). Smart Proof : API prod (`is_validated` + LB filtré) sur `c0000002` ; 4.3/4.4 via Zod + `submitScore` + tests Vitest ; cap temps sur seed `b0000002` (`max_duration_seconds=600`). Finish : `useFinisherCard` ne bloque plus si rank RPC échoue (PR #66) ; redirect post-submit OK.

---

## 5. Leaderboard & Respect

| #   | Test                                      | Attendu                                                  | EN  | FR  |
| --- | ----------------------------------------- | -------------------------------------------------------- | --- | --- |
| 5.1 | Filtres : global / sexe / âge / faction   | Classement change, pas d’erreur                          | [ ] | [ ] |
| 5.2 | **Respect** sur ligne d’un **autre** user | Compteur +1, état “déjà respecté”, pas de double respect | [ ] | [ ] |
| 5.3 | Respect sur **son** propre score          | Bouton **absent** ou désactivé (anti self-respect)       | [ ] | [ ] |
| 5.4 | Refresh / realtime (optionnel)            | Autre session voit le respect (si realtime activé)       | [ ] | [ ] |

---

## 6. Profil

| #    | Test                                                              | Attendu                                                                                                       | EN  | FR  |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --- | --- |
| 6.1  | Affichage streak                                                  | `streak_days` cohérent après nouvelle soumission (jour UTC)                                                   | [x] | [x] |
| 6.2  | **Creator score** + badge (bronze/silver/gold si seuils atteints) | Affichage + tooltip / copy                                                                                    | [x] | [x] |
| 6.3  | Historique scores                                                 | Liste avec états ranked / saved si applicable                                                                 | [x] | [x] |
| 6.3b | **Show More** → `/app/profile/history`                            | Page history : filtres Tout / En cours / Validés / Sauvegardés / Gagnés ; lignes badge + CARD ; retour profil | [x] | [x] |
| 6.3c | Profil principal sans section HISTORY en bas                      | Carrousel CARDS max 3–4 ; Log out dans menu ⚙️ header                                                         | [x] | [x] |
| 6.4  | Galerie finisher cards                                            | Chargement / empty / erreur + retry                                                                           | [x] | [x] |

**§6.3–6.4 notes (2026-06-01) :** Re-check post PR #66 — `FinisherGallery` retry RTL ; thumb canvas `compact` dans `drawCard` (plus de chevauchement SAVED). Profil : `PROFILE_CARD_PREVIEW_LIMIT=4`, pas de `ScoreHistory` sur `/profile` (uniquement galerie + ⚙️ settings).
| 6.5 | Changement avatar | Upload OK, erreur si fichier trop gros / mauvais type | [x] | [x] |

**Streak (DB) :** après 1ère soumission du jour → streak ≥ 1 ; 2e soumission même jour → pas de double incrément (idempotent).

**Creator score (DB) :** user B soumet score **validé** sur défi **approuvé** créé par user A (pas soi-même) → `creator_score` de A augmente (plafond 10/jour).

---

## 7. Clan & referral

| #   | Test                           | Attendu                                 | EN  | FR  |
| --- | ------------------------------ | --------------------------------------- | --- | --- |
| 7.1 | `/en/app/clan`                 | Stats factions, pas de crash            | [ ] | [ ] |
| 7.2 | **Recruit CTA** : copier lien  | Lien contient faction (ex. `?faction=`) | [ ] | [ ] |
| 7.3 | Share (si supporté navigateur) | Pas de crash si annulé                  | [ ] | [ ] |

---

## 8. UGC — Création de défi

| #   | Test                                    | Attendu                                                     | EN  | FR  |
| --- | --------------------------------------- | ----------------------------------------------------------- | --- | --- |
| 8.1 | `/en/app/arena/create`                  | Formulaire create visible                                   | [ ] | [ ] |
| 8.2 | Catalogue mouvements                    | Sélection par catégorie + option “Autre”                    | [ ] | [ ] |
| 8.3 | Circuit : ≥ 1 bloc valide               | Zod / message si 0 bloc ou reps invalides                   | [ ] | [ ] |
| 8.4 | Submit création                         | Challenge en **pending**, pas visible public comme approved | [ ] | [ ] |
| 8.5 | Détail challenge **pending** (créateur) | Bannière pending + pas de leaderboard public                | [ ] | [ ] |

---

## 9. Admin — Modération UGC

**Compte admin requis.**  
**Onglets MOD :** EN REVUE (`pending`) · EN COURS / LIVE (`arena_live`) · TERMINÉ / DONE (`arena_done`) · REFUSÉ (`rejected`).  
Filtres IA / batch **uniquement** sur EN REVUE.

| #    | Test                                             | Attendu                                                   | EN  | FR  |
| ---- | ------------------------------------------------ | --------------------------------------------------------- | --- | --- |
| 9.1  | User non-admin → `/en/app/admin/challenges`      | **404** ou redirect (pas d’accès)                         | [ ] | [ ] |
| 9.2  | Compteurs onglets + total communauté             | Chiffres cohérents sur les 4 onglets + ligne total UGC    | [ ] | [ ] |
| 9.3  | EN REVUE : liste pending                         | Pagination, loading, empty, error+retry                   | [ ] | [ ] |
| 9.4  | **Approve** (simple)                             | Confirmation modal → onglet **EN COURS**, compteur +1     | [ ] | [ ] |
| 9.5  | **FERMER** (EN COURS)                            | Confirmation → onglet **TERMINÉ**, compteur EN COURS −1   | [ ] | [ ] |
| 9.6  | **Reject**                                       | Motif &lt; 10 car. refusé ; ≥ 10 OK ; créateur voit motif | [ ] | [ ] |
| 9.7  | Batch approve + confirm (EN REVUE)               | N challenges → EN COURS                                   | [ ] | [ ] |
| 9.8  | Filtres IA : tier + tri risque (EN REVUE)        | Filtre cohérent                                           | [ ] | [ ] |
| 9.9  | **AI scan** (1 ligne pending)                    | Tier + résumé remplis ; pas d’auto-approve sans clic      | [ ] | [ ] |
| 9.10 | AI scan sans `OPENAI_API_KEY`                    | Message type “non configuré”, pas crash opaque            | [ ] | [ ] |
| 9.11 | Batch approve **verts only** (si coché)          | Seuls `ai_tier=green` passent en approved                 | [ ] | [ ] |
| 9.12 | Onglets historique (EN COURS / TERMINÉ / REFUSÉ) | **VOIR** ouvre le détail ; pas d’actions approve/reject   | [ ] | [ ] |

---

## 10. Overview

| #    | Test               | Attendu                                  | EN  | FR  |
| ---- | ------------------ | ---------------------------------------- | --- | --- |
| 10.1 | `/en/app/overview` | CTA, streak, faction nudge, pas de crash | [ ] | [ ] |

---

## 11. i18n & SEO (smoke)

| #    | Test                                              | Attendu                                        |
| ---- | ------------------------------------------------- | ---------------------------------------------- |
| 11.1 | Basculer locale EN ↔ FR sur auth + arena + profil | Pas de clés brutes `admin.queue.foo` visibles  |
| 11.2 | View source / meta                                | `title` / `description` présents (layout i18n) |

---

## 12. Mobile & états UI (smoke rapide)

Sur **375px** largeur :

- [ ] Dock utilisable (touch 44px min)
- [ ] Modals admin (reject / approve) utilisables
- [ ] Table admin scroll horizontal OK
- [ ] Pas de texte coupé critique sur profil / clan

---

## 13. Reports (table `012`)

**Note :** service `submitReport` existe ; **vérifier si une UI l’expose**. Si pas d’UI en V1 :

- [ ] **N/A UI** — cocher “backend only, QA UI reportée V2+”

Sinon si UI trouvée :

- [ ] Signaler un score / challenge → insert OK
- [ ] Double signalement même cible → message “already reported”

---

## 14. Régression rapide (5 min avant release)

- [ ] Login → arena → 1 submit → profil → logout
- [ ] Admin : 1 approve + 1 reject sur pending test
- [ ] Pas d’erreur console rouge en prod (DevTools)
- [ ] Pas de fuite évidente de clé service role côté client

---

## Bugs trouvés

| ID  | Sévérité | Parcours               | Description                                                                            | Repro                                  | Statut                                 |
| --- | -------- | ---------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------- |
| B1  | P1       | Profil → CARD / finish | `/app/finish` affiche « Could not load… » — rank fetch bloquait la card ; pas de Retry | Profil → CARD ou galerie → `/finish?…` | **corrigé PR #66**                     |
| B2  | P2       | Profil §6.4 galerie    | `FinisherGallery` en erreur : bouton Retry + test RTL                                  | Simuler erreur fetch scores            | **corrigé PR #66**                     |
| B3  | P3       | Profil galerie         | Miniature card SAVED : chevauchement score / faction / « NO VIDEO » sur thumb canvas   | Profil avec score non validé           | **corrigé PR #66 — re-validé QA §6.4** |

**Sévérité :** P0 bloquant · P1 majeur · P2 mineur · P3 cosmétique

---

## Verdict QA V1

- [x] **GO** — prêt pour travailler V2-01 en confiance
- [ ] **NO-GO** — bugs P0/P1 à corriger d’abord

**Signé :** igorms (§0–3, §5, §7–14) + agent QA (§4, §6.3b/c/6.4) **Date :** 2026-06-01

**Synthèse :** Aucun nouveau P0/P1 sur le périmètre testé. B1–B3 fermés (#66). §4 Smart Proof + finish + profil V1.5 OK EN/FR (i18n + comportement). Prochaine étape produit : issues V2-01+ (`docs/issues/issues.md`).

---

## Après QA V1 (suite produit)

1. Corriger bugs listés ci-dessus
2. Créer issues GitHub pour **V2-01 → V2-03**
3. Commencer implémentation V2 (voir `docs/V2_STRATEGY.md`, `docs/issues/issues.md` section H)

**Références :** [`CONTEXT.md`](./CONTEXT.md) · [`issues.md`](./issues/issues.md) · [`RUNBOOK.md`](./RUNBOOK.md)
