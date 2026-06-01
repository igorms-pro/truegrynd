# Truegrynd – Backlog V1 / V2

> **MVP core livré.** **V1 sérieuse (sections A–G)** : **livré sur `main`** (PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) → [#55](https://github.com/igorms-pro/truegrynd/pull/55)).  
> **V2** : stratégie dans [docs/V2_STRATEGY.md](../V2_STRATEGY.md). Angle : compétition fitness accessible, divisions de niveau, weekly challenges, équipes/factions, progression amateur.

**Dernière mise à jour :** 1 juin 2026 (post-PR #70 / #69)

---

## État livraison

| Quoi                                              | Statut                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UGC Creator Studio + migrations `006` / `007`** | **Mergé `main`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30). Ops : migrations **prod** alignées avec le repo.                                                                                                                                                                                                                                                                                                                                                               |
| **Admin UGC (#39)**                               | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), [#39](https://github.com/igorms-pro/truegrynd/issues/39), migration **`008`**.                                                                                                                                                                                                                                                                                                                              |
| **Admin tri IA (#40)**                            | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), Edge Function **`admin-challenge-ai-review`**, migration **`009`**.                                                                                                                                                                                                                                                                                                                                         |
| **V1 B–G + ops DB**                               | **🟢 Mergé `main`** — PR [#45](https://github.com/igorms-pro/truegrynd/pull/45)–[#55](https://github.com/igorms-pro/truegrynd/pull/55). **Prod** : migrations **`006`–`014`** (dont **`010`–`012`** creator score, streaks, reports ; **`014`** scores metadata). **Ménage GitHub** : PR [#43](https://github.com/igorms-pro/truegrynd/pull/43) fermée (doublon), issues historiques **#15–#28, #39** fermées ; **AGENTS.md** via PR [#42](https://github.com/igorms-pro/truegrynd/pull/42). |

---

## Vision (rappel)

Arène async mondiale, **Smart Proof**, **Factions**, **UGC modéré**, **Finisher** shareable — légitimité + friction basse + identité, pas un tracker pastel.

---

## Sommaire backlog

| Bloc                                      | Détail dans ce fichier                                                                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`/app/admin` (UGC)**                    | Section **A** — tâches détaillées (+ **A9–A10** IA tri)                                                                                                                           |
| **Mouvements & prescription**             | Section **G** — catalogue mix + règles création                                                                                                                                   |
| **Creator Score**                         | Section **B**                                                                                                                                                                     |
| **Streaks**                               | Section **C**                                                                                                                                                                     |
| **Respect (leaderboard)**                 | Section **D**                                                                                                                                                                     |
| **Referral**                              | Section **E**                                                                                                                                                                     |
| **Confiance & plateforme**                | Section **F**                                                                                                                                                                     |
| **V1.5 — Pages Faction & symétrie UI**    | Section **I** — arbitrages dock / Clan / Overview                                                                                                                                 |
| **V1.5 — Profil épuré & page Historique** | Section **K** — carrousel CARDS + `/app/profile/history`                                                                                                                          |
| **Fix & polish pré-V2 (QA V1)**           | Section **J** — flow soumission score / copy CTA                                                                                                                                  |
| **Production hardening (10k users)**      | Section **L** — clean archi, DRY, limites feature                                                                                                                                 |
| **V2 — Accessible competition**           | Section **H** — V2-00 🟢 · V2-01 🟢 · V2-02 🟢 · V2-03 🟢 · **V2-04 🟡** [#79](https://github.com/igorms-pro/truegrynd/issues/79) · `feature/issue-79-v2-04-leaderboard-location` |

**Macro-checklist**

- [x] **FEAT** — Creator Studio + RLS UGC + cap temps — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30)
- [x] **FEAT** — `/app/admin` **core** — modération file + RPC `008` + nav MOD — **mergé** PR [#41](https://github.com/igorms-pro/truegrynd/pull/41) ([#39](https://github.com/igorms-pro/truegrynd/issues/39))
- [x] **FEAT** — `/app/admin` **tri IA** — **A9–A10** — [#40](https://github.com/igorms-pro/truegrynd/issues/40) — **mergé** PR [#41](https://github.com/igorms-pro/truegrynd/pull/41) : migration **`009`** + Edge Function **`admin-challenge-ai-review`**
- [x] **FEAT** — Prescription / **bibliothèque mouvements (mix)** — section **G** — PR [#45](https://github.com/igorms-pro/truegrynd/pull/45)
- [x] **FEAT** — Creator Score — section **B** — PR [#47](https://github.com/igorms-pro/truegrynd/pull/47)
- [x] **FEAT** — Streaks — section **C** — PR [#49](https://github.com/igorms-pro/truegrynd/pull/49)
- [x] **FEAT** — Respect leaderboard — section **D** — PR [#51](https://github.com/igorms-pro/truegrynd/pull/51)
- [x] **FEAT** — Referral — section **E** — PR [#53](https://github.com/igorms-pro/truegrynd/pull/53)
- [x] **FEAT / CHORE** — Confiance & plateforme — section **F** — PR [#55](https://github.com/igorms-pro/truegrynd/pull/55)

**Clôture V1 (macro)** : toutes les lignes ci-dessus sont **livrées en code**. Cases `[ ]` encore présentes dans les sections détaillées = **hors périmètre V1 obligatoire** (tests admin SQL, skeleton, rate limit IA, Sentry, `movement_aliases`, etc.) → traiter en **V1.1** ou issue dédiée.

**Macro V1.5 (avant premier lot V2 compétitif)**

- [x] **V1.5** — Pages `/app/faction/[slug]` + symétrie Clan / Overview — section **I** — 🟢 [#57](https://github.com/igorms-pro/truegrynd/issues/57) PR [#58](https://github.com/igorms-pro/truegrynd/pull/58)
- [x] **V1.5** — Profil épuré + page Historique dédiée (`Show More` → `/app/profile/history`) — section **K** — 🟢 [#59](https://github.com/igorms-pro/truegrynd/issues/59) PR [#60](https://github.com/igorms-pro/truegrynd/pull/60)
- [x] **V1.5** — Page Settings `/app/settings` (passeport, prefs, logout) — 🟢 [#61](https://github.com/igorms-pro/truegrynd/issues/61) PR [#62](https://github.com/igorms-pro/truegrynd/pull/62)

**Macro pré-V2 (polish post-QA V1, avant V2-01)**

- [x] **FIX UI** — Flow soumission score (POST SCORE → formulaire → SUBMIT) — section **J** — 🟢 [#63](https://github.com/igorms-pro/truegrynd/issues/63) PR [#64](https://github.com/igorms-pro/truegrynd/pull/64)
- [x] **FIX** — Bugs QA B1–B3 (finish page, gallery retry, thumb layout) — 🟢 [#65](https://github.com/igorms-pro/truegrynd/issues/65) PR [#66](https://github.com/igorms-pro/truegrynd/pull/66)
- [x] **FEAT** — Statut défi + historique actions + LB dedupe + migration **`014`** — 🟢 [#67](https://github.com/igorms-pro/truegrynd/issues/67) PR [#68](https://github.com/igorms-pro/truegrynd/pull/68)

**Macro production (codebase prête ~10k users — avant V2 compétitif)**

- [x] **CHORE** — Clean architecture & code health — section **L** — 🟢 [#69](https://github.com/igorms-pro/truegrynd/issues/69) PR [#70](https://github.com/igorms-pro/truegrynd/pull/70)

**Macro V2 proposée (à transformer en GitHub issues avant dev)**

- [x] **V2-00** — Cadre factions & **exclusions sociales** (pas teams perso / pas DM) + prérequis V1.5 — section **H** — 🟢 [#71](https://github.com/igorms-pro/truegrynd/issues/71) PR [#72](https://github.com/igorms-pro/truegrynd/pull/72)
- [x] **V2-01** — Divisions de niveau (Rookie / Regular / Savage / Elite) — 🟢 [#73](https://github.com/igorms-pro/truegrynd/issues/73) PR [#74](https://github.com/igorms-pro/truegrynd/pull/74)
- [x] **V2-02** — Variantes officielles / scaling par challenge — 🟢 [#75](https://github.com/igorms-pro/truegrynd/issues/75) PR [#76](https://github.com/igorms-pro/truegrynd/pull/76)
- [x] **V2-03** — Weekly Global Challenge — 🟢 [#77](https://github.com/igorms-pro/truegrynd/issues/77) PR [#78](https://github.com/igorms-pro/truegrynd/pull/78)
- [ ] **V2-04** — Leaderboards par division, faction, ville, pays — 🟡 [#79](https://github.com/igorms-pro/truegrynd/issues/79) · branche `feature/issue-79-v2-04-leaderboard-location`
- [ ] **V2-05** — Truegrynd Rating (Engine / Power / Strength / Grit / Consistency)
- [ ] **V2-06** — Challenge Passport / palmarès amateur
- [ ] **V2-07** — Rival Matches (1v1 / petits groupes)
- [ ] **V2-08** — Team Wars / Faction Wars par division
- [ ] **V2-09** — Micro-events async (24h / 7j / 30j)
- [ ] **V2-10** — Proof Levels (Honor / Video / Community / Judge / Event)
- [ ] **V2-11** — Growth loops (cards, invitations, comeback weeks)
- [ ] **V2-12** — Monétisation exploratoire (après signal d'usage)

---

## A. `/app/admin` — modération UGC (défi par défi)

**Objectif :** comptes **admin** voient la file **`challenges.status = 'pending'`**, **approuvent** ou **rejettent** avec **motif** + **audit** ; créateur voit **rejet + raison** ; **aucune** clé `service_role` côté client — tout passe par **RLS + RPC** (ou policies équivalentes strictes).

> **Implémenté (PR #41 sur `main`, ex #39 + tri IA #40)** : migration `008`, RPC + RLS, `/app/admin/challenges`, liste paginée (**20**/page) + batch approve + reject (min 10 / max 500 car.), **confirmation** avant approve, i18n, `ChallengeDetail` + motif modération, nav **MOD** desktop + dock mobile, tests embed créateur.

### A1. Données & migrations (`008` ou suivant)

- [x] **`profiles.is_admin`** `boolean NOT NULL DEFAULT false` + index partiel si besoin.
- [x] **`challenges.rejection_reason`** `text NULL` (motif affiché au créateur ; `NULL` si approved).
- [x] **`challenges.reviewed_at`** `timestamptz NULL`.
- [x] **`challenges.reviewed_by`** `uuid NULL` REFERENCES `profiles(id)` ON DELETE SET NULL`.
- [x] Commentaires SQL sur colonnes (intention produit).
- [x] **Seed / doc** : promouvoir un admin en prod — one-shot SQL (à exécuter côté Supabase SQL editor ; pas dans le client) :  
       `UPDATE public.profiles SET is_admin = true WHERE id = '<uuid_auth_users>';`

### A2. Contrat serveur (Supabase) — source de vérité

- [x] **`public.is_app_admin()`** : `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)` — `SECURITY DEFINER` si nécessaire pour éviter récursion RLS sur `profiles`, ou lecture JWT `app_metadata` si tu préfères ce modèle (choisir **un** canon documenté).
- [x] **RPC `public.admin_set_challenge_status`** (recommandé) :
  - params : `p_challenge_id uuid`, `p_status text` (`approved` \| `rejected`), `p_rejection_reason text` (obligatoire si `rejected`, `NULL` si `approved`) ;
  - vérifie `is_app_admin()` ;
  - vérifie ligne cible `status = 'pending'` (sauf règle explicite “reopen” plus tard) ;
  - `UPDATE` uniquement : `status`, `rejection_reason`, `reviewed_at = now()`, `reviewed_by = auth.uid()` ;
  - retour : row mise à jour ou erreur contrôlée (`raise exception` messages stables pour mapping i18n côté app si besoin).
- [x] **`GRANT EXECUTE`** sur la RPC au rôle `authenticated` (la fonction fait le gate admin).
- [ ] **Alternative documentée** si pas RPC : policies `UPDATE` admin **étroites** + trigger qui empêche la modification de colonnes hors lot review (éviter qu’un admin rewrite `title` par accident).

### A3. RLS — cohérence avec créateurs

- [x] Vérifier compatibilité avec **“Creators can update own pending challenge”** : pas de conflit ; admin agit via **RPC** qui bypass RLS contrôlé **ou** policy `UPDATE` additionnelle **OR** admin.
- [x] **SELECT** : admin peut lire `pending` / `rejected` / `approved` (policy dédiée `is_app_admin()` sur `challenges`) pour alimenter la file et l’audit — **sans** ouvrir la lecture de tous les brouillons à tout le monde.
- [ ] **Tests** (SQL ou CI) : user non-admin ne peut pas exécuter la RPC ; créateur ne peut pas approuver son propre défi via RPC ; impossible d’approuver un défi déjà `approved` sans règle explicite.

### A4. Feature Next.js — `src/features/admin/`

- [x] **`index.ts`** : API publique du module (`AdminChallengeQueue`, hooks, types exportés au besoin).
- [x] **`services/adminChallenges.ts`** : `listPendingChallenges`, `approveChallenge`, `rejectChallenge` — **uniquement** `supabase.rpc('admin_set_challenge_status', …)` ou queries autorisées ; **jamais** `service_role` côté client.
- [x] **`hooks/useAdminPendingChallenges.ts`** : fetch + pagination + `refetch` après action.
- [x] **`hooks/useIsAdmin.ts`** ou intégration dans le **profil déjà chargé** (`profiles.is_admin`) pour éviter N+1.
- [x] **Types** : réponses typées ; erreurs réseau / RPC mappées vers messages utilisateur.

### A5. Routes App Router — sous `/app/admin`

- [x] **`src/app/[locale]/app/admin/layout.tsx`** : garde serveur ou client — si `!isAdmin` → **404** (discrétion) ou redirect `/app/arena` ; pas de layout vide flashé longtemps (skeleton court acceptable).
- [x] **`src/app/[locale]/app/admin/challenges/page.tsx`** : page **fine** — compose `AdminChallengeQueue` + titre + i18n.
- [ ] **Optionnel** : `middleware.ts` redirige `/app/admin` sans session valide (complément, pas substitut à RLS).
- [x] **Nav** : lien “Admin” **visible seulement** si `is_admin` (dock / header) — pas d’URL secrète comme seule sécurité.

### A6. UI admin — états complets (règle projet)

- [x] **Liste** : table ou cartes — colonnes : titre, `score_type`, `created_at`, username créateur (join ou denormalisation acceptable en V1).
- [x] **Pagination** : cursor ou offset, taille page fixe (ex. 20).
- [x] **Approve** : confirmation explicite (dialog) avant RPC.
- [x] **Reject** : modal — **motif obligatoire**, longueur min (ex. 10 car.) + max (ex. 500) ; trim ; pas de HTML.
- [ ] **Loading** : skeleton ou spinner sur liste + disable actions pendant mutation (MVP : texte « Loading… » ; affiner plus tard).
- [x] **Empty** : copy i18n “Aucun défi en attente”.
- [x] **Error** : toast ou banner + **retry** sur fetch ; sur RPC erreur métier → message clair.
- [x] **Success** : toast + ligne retirée de la file (optimistic ou refetch).
- [x] **Accessibilité** : `aria-label` sur actions, focus trap modals, `focus-visible` (design system).

### A7. UX créateur (hors `/admin`)

- [x] **`ChallengeDetail`** (ou équivalent) : bannière / badge **`pending`** (“En validation”).
- [x] Même surface : **`rejected`** + affichage **`rejection_reason`** + `reviewed_at` (optionnel).
- [x] **i18n** `challenge.*` / `admin.*` / `errors.*` — **EN + FR** pour tout nouveau copy.
- [ ] **Optionnel V1+** : route **`/app/profile/challenges`** (ou sous-onglet) “Mes défis” listant créations + statut.

### A8. Qualité & DoD admin

- [ ] **Tests unit** : service / mapping erreurs RPC (mock Supabase) — partiel : `normalizePostgrestCreator` seulement.
- [ ] **Test composant** (si infra) : modal reject + bouton approve désactivé pendant submit — au moins un chemin heureux.
- [x] **Pas de `console.log`** en prod ; pas de fuite PII dans toasts.
- [x] **`docs/issues/issues.md`** : cocher les cases **A** au fil des PRs ; lien PR sur la ligne macro ou en commentaire de section.

### A9. Tri IA pour la file admin (**pas d’auto-approve**)

**But :** beaucoup de `pending` ; l’IA **classe + résume** ; l’humain **filtre** (vert / orange / rouge), **sélectionne en masse** les verts et **approuve en un clic** — **aucun** `pending` → `approved` **sans** action utilisateur admin.

- [x] **DB (migration)** : migration **`009`** — `challenges.ai_tier` `text NULL` + contrainte `green` \| `orange` \| `red`, `ai_summary`, `ai_model`, `ai_checked_at`, colonne générée `ai_tier_rank` pour tri risque.
- [x] **Déclencheur** : bouton admin **« AI scan »** (re-run tant que `pending`) ; **pas** d’auto analyse au submit créateur dans cette PR.
- [x] **UI file** : filtres par niveau + tri **Highest risk first**, badge + résumé court, batch **Approuver la sélection** ; option **n’approuver en masse que les verts** (RPC).
- [x] **RPC batch** : `admin_batch_approve_challenges(p_ids, p_only_green)` + RPC **`admin_apply_challenge_ai_review`** pour persister le résultat modèle.
- [ ] **Garde-fous** : rate limit sur l’endpoint IA (à ajouter si abus) ; observabilité sans fuite de secrets.

### A10. Où vit l’appel IA (**secrets hors Git**)

L’IA n’a pas besoin d’être “hors du repo” au sens code : le **code** est dans Truegrynd ; les **secrets** ne le sont jamais.

- [x] **Secrets** — **`OPENAI_API_KEY`** / **`OPENAI_MODEL`** (optionnel) dans **Supabase Dashboard → Edge Functions → Secrets** pour la fonction **`admin-challenge-ai-review`** ; **jamais** `NEXT_PUBLIC_*` pour une clé fournisseur.
- [x] **Supabase Edge Function** `admin-challenge-ai-review` : JWT utilisateur + `is_app_admin()`, OpenAI, puis RPC **`admin_apply_challenge_ai_review`**. Déploiement : `supabase functions deploy admin-challenge-ai-review`.
- [x] **Route Handler Next** : retiré au profit de l’Edge Function (plus de clé OpenAI sur l’hébergeur Vercel).
- [ ] **SaaS externe** (service tiers dédié) : possible plus tard ; même règle : contrat HTTP + secrets hors repo.

---

## B. Creator Score — V1 forte (réputation créateur)

- [x] **Produit** : +1 par score **validé** sur un défi dont tu es **créateur** et `approved` ; plafond **10/jour** anti-farming ; self-scores exclus.
- [x] **DB** : utilise `profiles.creator_score` existant (migration `010`).
- [x] **Trigger** : `increment_creator_score()` AFTER INSERT OR UPDATE on `scores` — SECURITY DEFINER, daily cap, self-score guard.
- [x] **RLS** : `guard_server_managed_profile_fields()` BEFORE UPDATE sur `profiles` — revert client writes via GUC flag `app.server_managed_update`.
- [x] **UI profil** : `CreatorScoreBadge` dans `ProfileHeader` — score + tier + tooltip explicatif.
- [x] **Badges** : Bronze (≥5), Silver (≥25), Gold (≥100) — couleurs dans `CreatorScoreBadge`.
- [x] **i18n** EN + FR (`profile.creatorScore.*`).

---

## C. Streaks — V1 forte

- [x] **Règle produit** : ≥1 score soumis par jour calendaire **UTC** allonge la série. Gap > 1 jour → reset à 1.
- [x] **DB** : `profiles.streak_days` + `profiles.last_activity_at` (existants) — migration `011`.
- [x] **Trigger** : `update_streak_on_score()` AFTER INSERT on `scores` — idempotent par jour, SECURITY DEFINER, GUC guard.
- [x] **Reset** : gap > 1 jour → streak = 1. Consécutif → streak + 1. Même jour → no-op.
- [x] **UI** : Overview + ProfileHeader affichent déjà `streak_days` (statique → dynamique via trigger).
- [x] **Edge cases** : premier jour = 1, même jour idempotent, UTC only (documté dans le code).
- [x] **Tests** : `computeStreak` — 6 tests (null, same-day, consecutive, gap, week gap, zero+consec).

---

## D. Respect (leaderboard) — V1 forte

- [x] **DB** : table `score_respects` déjà en place (migration `004`) — schéma + RLS audités, UNIQUE constraint `(score_id, user_id)`.
- [x] **RLS** : INSERT auth only, DELETE own only, SELECT all — spam bloqué par UNIQUE constraint.
- [x] **UI** : `RespectButton` sur chaque ligne leaderboard — états default / loading / disabled / respected ; compteur discret.
- [x] **Anti-gaming** : self-respect masqué (bouton hidden si `scoreUserId === currentUserId`) + UNIQUE DB constraint.
- [x] **i18n** EN + FR + `aria-label` (`leaderboard.respect.*`).

---

## E. Referral — V1 forte

- [x] **Lien** : `?faction=horde` + `parseReferralFaction()` validation (rejet si valeur invalide).
- [x] **Persistance** : `localStorage` + TTL 7 jours — `storeReferralFaction` / `loadReferralFaction` / `clearReferralFaction`.
- [ ] **Analytics** (optionnel) : event “landing referral” sans PII invasive — reporté V1.1.
- [x] **UI Clan** : `RecruitCta` — boutons Share (Web Share API) + Copy link, dans `ClanScreen`.
- [x] **Onboarding** : `OnboardingFlow` lit `?faction` ou localStorage et pré-sélectionne la faction ; `clearReferralFaction` après choix.
- [x] **Pas de MLM** : lien plat, pas de tracking multi-niveaux.

---

## F. Confiance & plateforme — V1 forte

- [x] **Signalement** : table `reports` (migration `012`) + RLS (insert own, read own, admin read all) + UNIQUE constraint.
- [x] **SEO i18n** : `generateMetadata` dans `[locale]/layout.tsx` — title/description par locale via `next-intl`.
- [ ] **Observabilité** : Sentry — reporté V1.1 (config externe, hors repo).
- [x] **Rate limiting** : documenté dans `docs/RUNBOOK.md` — V1 via UNIQUE constraints + admin gates ; V1.1 Edge Function.
- [x] **Runbook** : `docs/RUNBOOK.md` — pronamouvoir admin, rollback migration, revue RLS, rate limiting, env vars.

---

## G. Mouvements & prescription (création de défi) — **mix** (pas 10K au launch)

**Décision produit :** pas une liste “10K mouvements” au départ ; **noyau catalogué** + **“autre”** court pour la longue traîne, avec **modération** (souvent **orange** côté tri IA / admin).

- [x] **Constante versionée** `MOVEMENT_CATALOG` (slug stable, labels i18n EN/FR) : **93 mouvements** V1 — push, pull, squat, hinge, lunge, carry, cardio, olympic, core, isometric, plyometric, gymnastics — `src/features/challenges/lib/movementCatalog.ts`.
- [x] **Circuit** : chaque ligne = **sélection dans le catalogue** (grouped `<select>`) **ou** option **“Autre (précise)”** → texte libre + `movementSlug = ''` (off-catalog).
- [x] **Au moins une prescription mesurable** : **≥ 1 bloc** circuit valide (label + montant reps `>0` ou hold `MM:SS`) — **Zod + message i18n** (`circuitMinBlock`).
- [ ] **Synonymes** : table `movement_aliases` optionnelle (mapping “pompes” → `push_up`) pour recherche / stats plus tard.
- [x] **Évolution** : pour ajouter un mouvement → append dans `MOVEMENT_CATALOG` + i18n key par locale (`movements.<slug>`).

---

## I. V1.5 — Pages Faction & symétrie Clan / Overview

**Contexte produit (MVP V1.5)** : Truegrynd reste une arène async **B2B2C** — passeport athlète (âge, sexe, poids), **3 factions mondiales** (Iron Alliance, Horde, Nomads), affiliation salle physique **optionnelle** (B2B gym → V3). Dock standard : **Overview · Arena · Clan · Profil** (+ MOD admin).

### Vision dock (rappel)

| Onglet       | Rôle                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Overview** | Dashboard perso, état de **ta** faction, défi du jour, streaks                                                   |
| **Arena**    | Catalogue défis official + UGC, filtres matériel, création UGC                                                   |
| **Clan**     | Leaderboard live Faction War + tableau des mercenaires (top faction)                                             |
| **Profil**   | Vitrine athlète, carrousel Finisher Cards (3–4 récentes), historique filtrable via **Show More** → section **K** |

### Routage factions — `/app/faction/[slug]`

Vues dynamiques par slug (`nomads` \| `horde` \| `iron_alliance`). Charte = couleurs CSS faction (`--faction-*`).

**Règles de clic UI**

| Origine                | Comportement                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**           | Widget **uniquement ta** faction → clic → `/app/faction/[my_faction_slug]`                                                            |
| **Clan — Faction War** | Les **3** lignes (ta faction + rivales) **cliquables de façon symétrique** → `/app/faction/[slug]` (rival = espionnage / rivalité OK) |
| **Clan — Top Dogs**    | Lignes → profil public `/app/u/[username]` (déjà amorcé) ; **ne pas** envoyer la ligne « ta faction » vers Arena seule                |

**Contenu page `/app/faction/[slug]`**

1. **Header** : blason / identité clan + nom en grand (couleur faction).
2. **Stats guerre** : rang Faction War, points équipe (agrégat V1 = heuristique client tant que pas V2 serveur), combattants actifs (période à préciser en implémentation ; cible produit = « cette semaine »).
3. **Hall of Fame** : top 5–10 athlètes **de cette faction** (ego + repérer rivaux).
4. **Si slug = faction utilisateur** : bouton secondaire **Recruter des alliés** (lien referral `?faction=[slug]` — réutiliser `RecruitCta` / `buildReferralUrl`).
5. **CTA principal (sticky bas)** : **POST A SCORE** / **CONTRIBUER À LA GUERRE** → `/app/arena` (même catalogue pour tous ; **pas** de défis réservés à une faction en V1.5).

### Tâches implémentation V1.5

**Livré — PR [#56](https://github.com/igorms-pro/truegrynd/pull/56) + [#58](https://github.com/igorms-pro/truegrynd/pull/58) mergés `main`** — [#57](https://github.com/igorms-pro/truegrynd/issues/57) clos.

- [x] **Profil public** : `src/app/[locale]/app/u/[username]/page.tsx` — `PublicProfileScreen`, `usePublicProfile`, `getProfileByUsername`.
- [x] **Clan — Top Dogs** : `ClanTopMembersCard` — lignes → `/app/u/[username]` (soi → `/app/profile`).
- [x] **Refactor Clan (partiel)** : `ClanFactionWarCard`, `ClanTopMembersCard`, `ClanArenaCta`, `formatClanPoints`, `clanRowLinkClass`.
- [x] **Challenge detail** : split `ChallengeDetailHero`, panels spec/circuit/locked, `parseChallengeRules`.
- [x] **Arena pending** : `ArenaPendingSection`, `useMyPendingChallenges` + migration **`013`** `arena_ends_at`.
- [x] **Admin file** : onglets statut queue + `arenaLifecycle` (helpers + tests).
- [x] **Route** : `src/app/[locale]/app/faction/[slug]/page.tsx` + garde slug invalide (404 ou redirect Clan).
- [x] **Service / hook** : `useFactionPage` + réutilisation `getClanHudData` par `faction`.
- [x] **UI** : `FactionPageScreen` + `FactionHallOfFame` (header, stats, hall of fame, CTA, recruit si « ma » faction).
- [x] **Overview** : widget ta faction → lien vers `/app/faction/[slug]` (`ctaFaction`).
- [x] **Clan** : `ClanFactionWarCard` — **3 lignes** → `/app/faction/[slug]`.
- [x] **i18n EN/FR** : namespace `factionPage.*` + aria labels.
- [ ] **QA manuel** : parcours Clan + pages faction (optionnel pre-V2).

**Branche suite :** `main` — section **K** (profil / historique) prochaine.

---

## J. Fix & polish pré-V2 — flow soumission score (QA V1 §4)

**Contexte QA (juin 2026) :** sur la page détail, le CTA **« I'M IN »** / **« JE M'INSCRIS »** prête à confusion — on croit parfois que le score part tout de suite. En réalité, le code actuel (`ChallengeDetailHero` → `Link` vers `/app/arena/[id]/submit`) **ne fait qu’une navigation** ; l’insert SQL n’a lieu que sur **`ScoreSubmissionScreen`**. Le fix = **clarifier l’UI + verrouiller la logique** avant V2.

**Objectif :** séparer nettement **engagement** (écran A) vs **soumission** (écran B).

### FIX LOGIQUE UI — flow de soumission des défis

Le bouton **« I'M IN »** ne doit **pas** soumettre le score directement en base. Règles :

1. **Écran A — détail défi** : **« I'M IN »** = **navigation uniquement** → ouvre l’écran B **sans rien enregistrer**.
2. **Écran B — formulaire** (`/app/arena/[id]/submit`) :
   - score par défaut à **0** (`YOUR REPS` / équivalent time) ;
   - champ **PROOF URL** optionnel (copy Smart Proof déjà présente) ;
   - bouton **persistant en bas** : **« SUBMIT YOUR SCORE »** / **« SOUMETTRE MON SCORE »**.
3. **Seul** le clic sur **« SUBMIT YOUR SCORE »** :
   - valide les inputs (Zod) ;
   - applique la règle **Smart Proof / top 10%** (vidéo obligatoire si elite) ;
   - exécute l’**insert** score en base.

### Tâches

- [x] **Copy EN/FR** : CTA détail **POST SCORE** / **POSTER MON SCORE** + subline « rien enregistré tant que tu n'envoies pas » — PR [#64](https://github.com/igorms-pro/truegrynd/pull/64).
- [x] **Audit code** : CTA détail = `Link` seul, test RTL confirme 0 appel `submitScore`.
- [x] **Écran B** : bouton submit sticky bas viewport ; reps default 0 ; label **SUBMIT YOUR SCORE** / **SOUMETTRE MON SCORE**.
- [x] **Tests** : RTL — CTA détail → 0 insert ; submit valide → 1 insert.
- [x] **GitHub Issue** + branche `fix/issue-63-submit-flow-cta` — [#63](https://github.com/igorms-pro/truegrynd/issues/63) PR [#64](https://github.com/igorms-pro/truegrynd/pull/64).

**Fichiers probables :** `ChallengeDetailHero.tsx`, `ScoreSubmissionScreen` (+ hooks/services submit), `src/locales/en.json` / `fr.json` (`challenge.ctaStart`, `ctaSubline`, submit.\*).

**Priorité :** **avant V2-01** (avec ou juste après V1.5 + fin QA §4) — pas bloquant divisions, mais **bloquant clarté produit** sur le cœur Arena.

**Branche suggérée :** `fix/submit-flow-cta` ou issue dédiée post-`chore/qa-v1-prep`.

---

## K. V1.5 — Profil épuré & page Historique (Show More)

**Contexte produit :** le carrousel horizontal **CARDS** (`FinisherGallery`) convient pour parcourir les **3–4 dernières** performances — au-delà, swiper 50 fois est invivable. La section **HISTORY** (`ScoreHistory`) en bas du profil **duplique** l’info et surcharge l’écran principal. On sépare : **vitrine épurée** sur `/app/profile` vs **registre de guerre filtrable** sur `/app/profile/history`.

**État actuel (juin 2026) :** livré PR [#60](https://github.com/igorms-pro/truegrynd/pull/60) + enrichi PR [#68](https://github.com/igorms-pro/truegrynd/pull/68) — actions historique (proof / masquer carousel), migration **`014`**. **Reporté V2** : table `challenge_commitments` (localStorage `challengeCommitments` pour « En cours »).

### Vision UX

```
ÉCRAN PROFIL PRINCIPAL (/app/profile)
+-------------------------------------------------------+
|  PROFILE                                         ⚙️   |
|  [ Photo ]  IGORMS (IRON ALLIANCE)                    |
+-------------------------------------------------------+
|  CARDS                             [ SHOW MORE ➔ ]   |
|  (Scroll X — 3 ou 4 dernières cartes max)             |
|  +------------+  +------------+  +------------+       |
|  | TRUEGRYND  |  | TRUEGRYND  |  | TRUEGRYND  |       |
|  +------------+  +------------+  +------------+       |
+-------------------------------------------------------+
  (plus de section HISTORY ici)

      ⬇️ Show More → /app/profile/history

PAGE HISTORIQUE (/app/profile/history)
+-------------------------------------------------------+
|  ➔  MON HISTORIQUE                                    |
|  [ Tout ] [ En cours ⏳ ] [ Validés 🔥 ] [ Sauvegardés ] [ Gagnés 🏆 ] |
|  +-------------------------------------------------+  |
|  | QA OFFICIAL — BURPEES                [ RANKED ] |  |
|  | 07:10 · 6/1/2026                       [ CARD ] |  |
|  +-------------------------------------------------+  |
|  | SANDBAG CHALLENGE               [ IN PROGRESS ] |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
```

### 1. Écran profil principal (`/app/profile`)

- [x] **Supprimer** `ScoreHistory` du bas de la page — **définitif**, pas de doublon.
- [x] **Carrousel CARDS** : limiter `FinisherGallery` aux **3 ou 4 cartes les plus récentes** (tri `created_at` desc).
- [x] **Bouton « Show More »** (`SHOW MORE ➔`) : en haut à droite de la section CARDS (à côté du titre) → lien `/app/profile/history`.
- [x] **Settings ⚙️** : icône en haut à droite → lien **`/app/settings`** (page dédiée passeport / prefs / logout) — PR [#62](https://github.com/igorms-pro/truegrynd/pull/62) [#61](https://github.com/igorms-pro/truegrynd/issues/61)
- [x] **i18n EN/FR** : `profile.cards.showMore`, `profile.settings.*`, titres section.

### 2. Nouvelle route `/app/profile/history`

- [x] **Route** : `src/app/[locale]/app/profile/history/page.tsx` — page fine, compose un `ProfileHistoryScreen`.
- [x] **Header** : retour + titre « Mon historique » / « My history ».
- [x] **Barre de filtres (tabs rapides)** :
  - **Tout** — historique global (scores + engagements en cours).
  - **En cours** — défis où l’utilisateur a cliqué **I'M IN** mais **pas encore** de score soumis (to-do entraînements).
  - **Validés** — scores `is_validated: true` / badge **RANKED** (preuve vidéo, classés).
  - **Sauvegardés** — scores honor level sans vidéo / badge **SAVED**.
  - **Gagnés** _(option V1.5+)_ — coups d’éclat : top 10 % validés et/ou défis officiels avec badge (règle exacte à figer en implémentation).
- [x] **Ligne d’historique** : titre défi, score formaté, date, badge statut (`RANKED` \| `SAVED` \| `IN PROGRESS`), action **CARD** (re-voir / re-télécharger la Finisher Card si applicable).
- [x] **États complets** : loading / empty / error / default par filtre ; empty copy contextualisé (« Aucun défi en cours », etc.).
- [x] **Hook / service** : étendre ou factoriser `useMyScores` + source « en cours » (table/commitment I'M IN — à préciser : score absent vs flag engagement si modèle ajouté plus tard ; en V1.5 heuristique = pas de row `scores` pour ce `challenge_id`).

### 3. Données & statuts

| Filtre UI       | Règle V1.5 (MVP)                                                                    |
| --------------- | ----------------------------------------------------------------------------------- |
| **Tout**        | Union scores soumis + engagements en cours sans score                               |
| **En cours**    | Challenge visité via I'M IN, **aucun** score user pour ce `challenge_id`            |
| **Validés**     | `scores.is_validated = true`                                                        |
| **Sauvegardés** | `scores.is_validated = false` (score existant)                                      |
| **Gagnés**      | Sous-ensemble Validés : top 10 % (`rankPercent ≤ 10`) ou tag official (à confirmer) |

> **Note :** persistance **En cours** via **localStorage** (`challengeCommitments`) à l’ouverture du formulaire submit — remplacer par table `challenge_commitments` en V2 si besoin.

### 4. Qualité & DoD

- [x] **Tests** : filtrage pur (helper `filterHistoryByTab`) + au moins un test composant ou RTL sur tabs.
- [x] **QA manuel** : parcours profil → Show More → filtres validés (juin 2026).
- [x] **Accessibilité** : tabs avec rôles ARIA, `aria-label` sur Show More et Settings.
- [x] **Pas de régression** : profil public `/app/u/[username]` hors scope (pas de page history publique en V1.5).

**Fichiers probables :** `src/app/[locale]/app/profile/page.tsx`, `FinisherGallery.tsx`, `ScoreHistory.tsx` (réutiliser lignes sur history page), nouveau `ProfileHistoryScreen.tsx`, `useProfileHistory.ts`, `src/locales/en.json` / `fr.json`.

**Priorité :** **V1.5**, avec ou juste après section **I** (faction pages) — **avant V2-06** (Passport) qui capitalisera sur cette base historique.

**Branche suggérée :** `feature/v1-5-profile-history` (GitHub Issue dédiée avant dev).

---

## L. Production hardening — clean architecture & code health (~10k users)

**Statut :** 🟢 **LIVRÉ** — [#69](https://github.com/igorms-pro/truegrynd/issues/69) fermée · PR [#70](https://github.com/igorms-pro/truegrynd/pull/70) mergée `main`

**Objectif :** codebase **production-grade** pour un produit **lancé et fini** (pas prototype) — cible **~10 000 utilisateurs actifs** sans dette structurelle bloquante. Prérequis **obligatoire** avant **V2-01** (divisions = complexité transverse : leaderboards, profil, rating).

**Contexte audit (juin 2026, `main` post-#68)**

| Signal                      | État actuel                                                   | Cible production                                             |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| LOC `src/`                  | ~14 200 · 240 fichiers                                        | Stable ; pas de god-files                                    |
| Coverage                    | 80 % stmts · 83 % lines                                       | ≥ 80 % maintenu                                              |
| Cross-feature imports       | ~12 violations (profile↔challenges↔finisher↔submission)       | **0** (sauf `appshell` / infra auth)                         |
| Fichiers > 200 LOC          | 5 (auth page, admin queue, onboarding identity, circuit form) | **0** en prod                                                |
| Feature `index.ts`          | 8/11 features                                                 | **11/11** + pages importent via barrel                       |
| Duplication canvas finisher | `finish/page` + `FinisherGallery`                             | 1 builder `buildFinisherCardOptions()`                       |
| Duplication rank/percentile | `useFinisherCard` + `enrichScoresWithTopPercent`              | 1 service/hook partagé                                       |
| Async state hooks           | ~15 patterns `{ loading \| ready \| error }` ad hoc           | Type union partagé ou React Query (phase 1 = types + helper) |

**Ce n’est pas :** rewrite, migration framework, ni features V2.

---

### Briefing PR (copier en tête de nouvelle conversation)

```markdown
## Contexte

Repo **truegrynd**, branche `main` à jour (PR #68 mergée, migration 014 prod).
Produit **lancé** — arène async, Smart Proof, factions, UGC modéré, finisher cards.
Objectif : **codebase saine pour ~10k users** avant d’attaquer V2 (divisions).

## Tâche

Issue **#69** / section **L** — Production hardening : clean architecture & DRY.
Branche : `chore/issue-69-production-hardening`

## Ne pas toucher

- Workspace Voyagely
- Features V2 (divisions, weekly, rating…) — section H
- Migrations DB sauf si strictement requis pour `challenge_commitments` (reporté lot 2)

## Périmètre PR (lots suggérés — max ~400 lignes/PR)

### Lot 1 — Shared libs (P0)

- [x] Créer `src/lib/scoring/` : `formatScore`, `formatTime`, `isAllowedVideoUrl` (ré-export ou move depuis features)
- [x] Créer `src/lib/rank/` : `getRankCounts`, `percentileFromCounts`, `formatTopPercent` (consommé par finisher + profile)
- [x] Créer `src/lib/finisher/buildFinisherCardOptions.ts` — unique source options canvas (full + thumb)
- [x] Mettre à jour imports : profile, submission, challenges, finisher-card → **lib only**
- [x] Tests unitaires déplacés/dupliqués minimal ; `pnpm test:run` vert

### Lot 2 — Feature boundaries (P0)

- [x] Ajouter `src/features/profile/index.ts`, `finisher-card/index.ts`, `auth/index.ts`
- [x] Pages `app/` importent uniquement via barrels feature ou `@/lib` (profile, finish, auth, history, public profile)
- [x] Vérifier : `grep` cross-feature = 0 entre profile / challenges / submission / finisher-card

### Lot 3 — Thin pages & file size (P1)

- [x] Extraire `AuthScreen` depuis `src/app/[locale]/auth/page.tsx` (229 → page <30 LOC)
- [x] Extraire logique canvas de `finish/page.tsx` vers feature finisher-card (`FinishPageContent`)
- [ ] Split si >200 LOC : `AdminChallengeQueue`, `AdminPendingChallengeRow`, `OnboardingIdentityStep`, `CreateChallengeCircuitSection`

### Lot 4 — Data layer foundation (P1)

- [x] `src/lib/async-state.ts` — type `AsyncState<T>` + helpers
- [x] Hooks partagés : `src/hooks/useChallenge.ts`, `src/hooks/useMyScores.ts` (+ `src/lib/scores/`, `src/lib/challenges/`, `src/lib/commitments/`)
- [ ] React Query pilote (optionnel post-merge) ou migration progressive des hooks existants

### Lot 5 — Cohérence profil public (P2)

- [ ] `PublicProfileScreen` : aligner ou deprecate `ScoreHistory` vs modèle history V1.5
- [ ] Tests RTL sur chemins touchés

## Acceptance criteria

- [ ] Zero import `@/features/X` depuis `@/features/Y` (X≠Y), sauf appshell/auth infra
- [ ] Aucun fichier composant/hook >200 LOC (règle projet)
- [ ] `pnpm check` vert (lint + typecheck + test:run)
- [ ] Coverage lines ≥ 80 %
- [ ] Aucune régression E2E smoke
- [ ] PR référence `Fixes #69` ou `Refs #69` si multi-PR

## Risques

- Régressions affichage finisher card (thumb + full) → tests `drawCard` + smoke manuel finish/galerie
- Casse imports circulaires lors des moves → move lib d’abord, features ensuite
- PR trop grosse → decouper lots 1–2 puis 3–5

## Plan required BEFORE coding

1. Fichiers create/modify list
2. Ordre des moves (lib → features → pages)
3. Attendre validation si changement de scope
```

---

### Checklist détaillée section L

**P0 — Architecture (bloquant V2)**

- [x] **`src/lib/scoring/`** — format score/time, validation vidéo (sources of truth)
- [x] **`src/lib/rank/`** — percentile + rank counts (finisher + profile history)
- [x] **`src/lib/finisher/buildFinisherCardOptions.ts`** — DRY canvas full/thumb
- [x] **Supprimer imports cross-feature** profile ↔ challenges ↔ submission ↔ finisher-card
- [x] **Barrels** `profile`, `finisher-card`, `auth` + pages thin (auth, finish)

**P1 — Maintenabilité**

- [x] **`AuthScreen`** extrait de `auth/page.tsx`
- [ ] **Split 4 fichiers >200 LOC** (admin queue/row, onboarding identity, create challenge circuit)
- [x] **`AsyncState<T>`** + hooks partagés `useChallenge` / `useMyScores`

**P2 — Polish production**

- [ ] **Profil public** : une seule façon d’afficher l’historique scores
- [ ] **Tests** : composants touchés (HistoryScoreActions, AuthScreen si extrait)
- [ ] **(localStorage `challengeCommitments`)** — issue séparée / migration V2 ; ne pas bloquer #69

**DoD**

- [x] `docs/issues/issues.md` section L → 🟢 + lien PR [#70](https://github.com/igorms-pro/truegrynd/pull/70)
- [x] Issue #69 fermée
- [x] P0 livré ; report V1.1 : split 4 fichiers >200 LOC, lot 5 profil public, React Query pilote, E2E smoke dédié

**Reporté V1.1 (non bloquant V2-00)** : `AdminChallengeQueue`, `OnboardingIdentityStep`, `CreateChallengeCircuitSection`, alignement `ScoreHistory` public.

**Branche :** `main` (merged)  
**Références :** `.cursor/rules/architecture-structure.mdc` · `.cursor/rules/coding-guidelines.mdc` · audit code health juin 2026 (conversation Cursor)

---

## H. V2 — Accessible Competitive Fitness

**Décision produit :** ne pas copier les gros events fitness. Truegrynd attaque leur angle mort : **l'énergie compétition sans ticket à 110 €, sans déplacement, sans élitisme**. Les gens jouent **dans leur division**, avec **leur team**, contre des gens de niveau comparable. Le leaderboard global reste une vitrine, pas l'expérience principale.

**Où lire quoi**

| Document                                 | Rôle                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| [docs/V2_STRATEGY.md](../V2_STRATEGY.md) | Vision, piliers produit, positionnement (pas de checklist dev)                     |
| **Section H ci-dessous**                 | **Backlog exécutable** V2-00 → V2-12 (cases `[ ]` = tâches à cocher au fil des PR) |

**Workflow V2 :** avant chaque lot, créer une **Issue GitHub** (`V2-0N — titre`), branche `feature/issue-N-…`, PR → cocher la section H + lien PR dans **Suivi synthétique**.

### V2-00. Cadre Factions & Exclusions Sociales (lire avant V2-07 / V2-08)

**Objectif :** figer ce que Truegrynd **n’est pas** en V2 early, et ce qui est **déjà couvert en V1.5** avant d’attaquer divisions, weekly et Team Wars.

**Exclusions explicites (ne pas coder)**

- [x] **Pas** de sous-équipes / « team perso avec des potos » privée hors des 3 factions mondiales.
- [x] **Pas** de messagerie privée (DM), **pas** de graphe Follow/Unfollow.
- [x] **Pas** de catalogue de défis « Horde only » / « Iron only » — la faction est un **camp de guerre**, pas un mode de jeu séparé.
- [x] **Interaction sociale MVP** : uniquement **👊 Respect** (`+1`) sur lignes de leaderboard ; le reste = referral faction + vitrines publiques.

**Effet de groupe autorisé en V1 / V1.5**

- Parrainage **faction globale** (`?faction=` + Recruit).
- Affiliation **salle physique** (piste B2B → [docs/V3_STRATEGY.md](../V3_STRATEGY.md)).
- Pages **`/app/faction/[slug]`** symétriques (section **I**) : overview rivale, hall of fame, CTA Arena.

**Livrables V2-00 (doc / produit)**

- [x] Valider les 4 exclusions ci-dessus (table + règles dans [V2_STRATEGY.md](../V2_STRATEGY.md)).
- [x] Aligner `.cursor/rules/truegrynd-product-rules.mdc` (boundaries factions + social MVP).
- [x] Prérequis confirmés : section **I (V1.5)** + **L (#69)** + QA Clan/faction OK.

**Ce que V2 ajoute par-dessus (issues suivantes, pas en V1.5)**

- [ ] **V2-01–03** : divisions, scaling, weekly → compétition **par niveau**, pas par team custom.
- [ ] **V2-08** : Team Wars / Faction Wars **par division** — score équipe **serveur**, events, contribution perso (remplace l’heuristique Clan HUD).
- [ ] **V2-09** : micro-events (Faction War Weekend, etc.).
- [ ] **V2-07** : Rival Matches — duel 1v1 / petit groupe sur défis, **pas** remplacement des 3 factions.

**Prérequis avant de démarrer V2-01 :** section **I (V1.5)** livrée + **section L (#69)** production hardening + QA Clan/faction OK.

### V2-01. Divisions De Niveau

**Statut :** 🟢 **LIVRÉ** — [#73](https://github.com/igorms-pro/truegrynd/issues/73) fermée · PR [#74](https://github.com/igorms-pro/truegrynd/pull/74) mergée `main` · migration **`015`** (à appliquer prod)

- [x] **Produit** : divisions canoniques V2 : `rookie`, `regular`, `savage`, `elite`.
- [x] **Règle d'entrée** : division par défaut `rookie` (signup + backfill) ; promotion auto → **V2-05**.
- [x] **DB** : migration `015` — `profiles.division` CHECK + DEFAULT + index ; trigger `handle_new_user` mis à jour.
- [x] **UI** : badge division profil (own + public), leaderboard (global view), finisher card canvas.
- [x] **Leaderboard** : filtre division par défaut = division viewer ; Global secondaire (`resolveLeaderboardFilters`).
- [x] **i18n EN/FR** + tests (`applyFilters`, `resolveLeaderboardFilters`, `divisionStyles`).

### V2-02. Variantes Officielles / Scaling Par Challenge

- [x] **Produit** : chaque challenge important peut avoir des variantes officielles : no equipment, bodyweight, dumbbell, standard, savage.
- [x] **DB** : migration `016` — table `challenge_variants` + `scores.variant` CHECK + FK composite.
- [x] **Création défi** : auteur choisit au moins une variante ; admin voit le niveau de friction / matériel.
- [x] **Soumission** : score attaché à une variante précise.
- [x] **Leaderboard** : classement par variante + division.
- [x] **UX** : copy claire : scaling officiel ≠ mode honteux.

### V2-03. Weekly Global Challenge

- [x] **Produit** : un défi global par semaine, simple, partageable, jouable partout.
- [x] **DB** : table ou champs pour `weekly_challenges` (challenge_id, starts_at, ends_at, status).
- [x] **App** : bloc homepage/overview “Weekly Challenge” avec CTA score.
- [x] **Leaderboards** : division + faction (ville/pays → **V2-04**).
- [x] **Finisher Card** : variante weekly avec badge semaine.
- [x] **Admin** : choisir / programmer le weekly sans migration.

### V2-04. Leaderboards Par Division, Faction, Ville, Pays

- [ ] **Produit** : permettre “Top Rookie Paris”, “Horde Regular France”, “Savage Global”. — 🟡 [#79](https://github.com/igorms-pro/truegrynd/issues/79)
- [ ] **Profil** : ajouter ville/pays optionnels ou inférés prudemment (pas de géoloc invasive V2.1).
- [ ] **DB / query** : index et filtres performants pour division + faction + location.
- [ ] **UI leaderboard** : presets simples plutôt qu'un panneau de filtres monstrueux.
- [ ] **Privacy** : ne pas afficher une localisation trop précise par défaut.

### V2-05. Truegrynd Rating

- [ ] **Produit** : rating global + axes `engine`, `power`, `strength`, `grit`, `consistency`.
- [ ] **Algorithme V1** : commencer simple (percentiles validés + catégories de challenge), pas d'Elo opaque au début.
- [ ] **DB** : table `profile_ratings` ou colonnes dédiées + historique minimal.
- [ ] **Jobs/triggers** : recalcul à la soumission validée ou job périodique.
- [ ] **UI** : carte rating sur profil + explication lisible.
- [ ] **Tests** : fonctions pures de calcul rating + cas de bord (peu de scores, anciens scores, changement division).

### V2-06. Challenge Passport / Palmarès Amateur

- [ ] **Produit** : transformer le profil en CV compétitif amateur.
- [ ] **Contenu** : divisions atteintes, meilleurs scores, badges, weekly complétés, rival matches gagnés, finisher cards.
- [ ] **UI** : page/onglet “Passport” mobile-first.
- [ ] **Share** : lien public optionnel ou image partageable.
- [ ] **Privacy** : permettre de masquer certains détails.

### V2-07. Rival Matches

- [ ] **Produit** : 1v1 ou petit groupe sur 1 à 3 challenges, durée 24h/7j.
- [ ] **Matching** : même division par défaut ; option faction adverse / ami / ville.
- [ ] **DB** : `rival_matches`, participants, challenge set, status, winner.
- [ ] **UX** : créer, accepter, soumettre, résultat.
- [ ] **Notifications** : minimal V2 (email/toast/polling), pas besoin d'un réseau social complet.
- [ ] **Anti-abus** : refuser spam d'invitations.

### V2-08. Team Wars / Faction Wars Par Division

- [ ] **Produit** : guerre collective hebdo : faction x division x challenge.
- [ ] **Score équipe** : agrégat robuste (ex. top N scores + participation) pour éviter qu'une grosse faction écrase tout.
- [ ] **UI** : scoreboard faction, contribution personnelle, reward/badge.
- [ ] **Fairness** : divisions séparées, pas Rookie contre Elite.
- [ ] **Finisher Card** : “I scored for Horde Rookie”.

### V2-09. Micro-Events Async

- [ ] **Produit** : events 24h / 7j / 30j sans lieu physique : Rookie Week, No Equipment Cup, Faction War Weekend.
- [ ] **DB** : `events`, `event_challenges`, `event_scores`, status.
- [ ] **Admin** : créer/programmer un event depuis l'admin.
- [ ] **Classements** : event leaderboard + divisions.
- [ ] **Fin** : recap, badges, cards, classement final.
- [ ] **Ops** : pas de paiement au départ ; prouver l'engagement avant monétisation.

### V2-10. Proof Levels

- [ ] **Produit** : niveaux de preuve : Honor, Video Ranked, Community Verified, Judge Verified, Event Verified.
- [ ] **DB** : champ `proof_level` côté score + audit de validation.
- [ ] **UI** : badge preuve sur leaderboard et profil.
- [ ] **Règles** : certains classements peuvent filtrer `video_ranked+` ou `judge_verified+`.
- [ ] **Admin/judge** : validation manuelle sans service_role client.
- [ ] **Trust** : reporting abus lié au score.

### V2-11. Growth Loops

- [ ] **Finisher cards V2** : division, rating delta, faction contribution, weekly badge.
- [ ] **Invitations** : inviter quelqu'un sur un rival match ou weekly challenge.
- [ ] **Comeback weeks** : relancer ceux qui ont raté 1-2 semaines sans culpabilisation.
- [ ] **Referral V2** : faction + division context (“Join Horde Rookie Week”).
- [ ] **Analytics** : mesurer share → signup → first score.

### V2-12. Monétisation Exploratoire

- [ ] **Principe** : ne pas bloquer le core compétitif trop tôt.
- [ ] **Hypothèses** : premium passport, cosmetics cards, micro-event packs, sponsor challenges, gym/team dashboards.
- [ ] **Validation** : attendre signal d'usage (weekly retention, rival completion, share rate).
- [ ] **Stripe** : seulement après choix clair d'une offre.
- [ ] **No pay-to-win** : payer ne doit jamais améliorer un rang sportif.

---

## Légende

🔴 not started · 🟡 in progress · 🟢 done · ⏸️ blocked · 🔵 QA · 🟣 on hold  
Préfixes : **FEAT** · **FIX** · **CHORE** · **DOC** · **PERF**

---

## Workflow

1. **GitHub Issue** d’abord (numéro `N`), puis branche **`feature/issue-N-short-slug`** ou **`chore/issue-N-short-slug`** (voir `.cursor/rules/issue-workflow.mdc`).
2. Découper une **section (A–G)** en PRs **petites** (règle repo : ~400 lignes max par PR) ; revue **RLS** obligatoire pour tout ce qui touche `008+`.
3. **PR** : titre/body référencent **`#N`** ; merge dans `main` après revue.
4. Mettre à jour ce fichier : **🟡** en cours → lien **PR** → **🟢** + cases `[x]` quand c’est mergé et livré.

---

## Suivi synthétique

| Bloc                                          | Avancement                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UGC création + cap                            | 🟢 PR #30                                                                                                                                                                                                                                                                                                                                              |
| Doc backlog V1 (ce fichier)                   | 🟢 [#31](https://github.com/igorms-pro/truegrynd/issues/31) mergé — PR [#32](https://github.com/igorms-pro/truegrynd/pull/32)                                                                                                                                                                                                                          |
| Doc tri IA + mouvements mix (ce fichier)      | 🟢 [#35](https://github.com/igorms-pro/truegrynd/issues/35) mergé — PR [#36](https://github.com/igorms-pro/truegrynd/pull/36)                                                                                                                                                                                                                          |
| **`/app/admin`**                              | 🟢 PR #41 mergé (admin + AI triage)                                                                                                                                                                                                                                                                                                                    |
| Creator Score                                 | 🟢 [#46](https://github.com/igorms-pro/truegrynd/issues/46) mergé — PR [#47](https://github.com/igorms-pro/truegrynd/pull/47)                                                                                                                                                                                                                          |
| Streaks                                       | 🟢 [#48](https://github.com/igorms-pro/truegrynd/issues/48) mergé — PR [#49](https://github.com/igorms-pro/truegrynd/pull/49)                                                                                                                                                                                                                          |
| Respect                                       | 🟢 [#50](https://github.com/igorms-pro/truegrynd/issues/50) mergé — PR [#51](https://github.com/igorms-pro/truegrynd/pull/51)                                                                                                                                                                                                                          |
| Referral                                      | 🟢 [#52](https://github.com/igorms-pro/truegrynd/issues/52) mergé — PR [#53](https://github.com/igorms-pro/truegrynd/pull/53)                                                                                                                                                                                                                          |
| Confiance / plateforme                        | 🟢 [#54](https://github.com/igorms-pro/truegrynd/issues/54) mergé — PR [#55](https://github.com/igorms-pro/truegrynd/pull/55)                                                                                                                                                                                                                          |
| Mouvements / prescription (mix)               | 🟢 [#44](https://github.com/igorms-pro/truegrynd/issues/44) mergé — PR [#45](https://github.com/igorms-pro/truegrynd/pull/45)                                                                                                                                                                                                                          |
| **V1.5 — Pages Faction**                      | 🟢 [#57](https://github.com/igorms-pro/truegrynd/issues/57) — PR [#56](https://github.com/igorms-pro/truegrynd/pull/56) + [#58](https://github.com/igorms-pro/truegrynd/pull/58) mergés                                                                                                                                                                |
| **V1.5 — Profil & Historique**                | 🟢 [#59](https://github.com/igorms-pro/truegrynd/issues/59) PR [#60](https://github.com/igorms-pro/truegrynd/pull/60) + Settings [#61](https://github.com/igorms-pro/truegrynd/issues/61) PR [#62](https://github.com/igorms-pro/truegrynd/pull/62)                                                                                                    |
| **Fix flow submit (POST SCORE → formulaire)** | 🟢 [#63](https://github.com/igorms-pro/truegrynd/issues/63) PR [#64](https://github.com/igorms-pro/truegrynd/pull/64)                                                                                                                                                                                                                                  |
| **Post-QA polish (#67)**                      | 🟢 [#67](https://github.com/igorms-pro/truegrynd/issues/67) mergé — PR [#68](https://github.com/igorms-pro/truegrynd/pull/68) ; migration **`014`** prod                                                                                                                                                                                               |
| **Production hardening (#69)**                | 🟢 [#69](https://github.com/igorms-pro/truegrynd/issues/69) PR [#70](https://github.com/igorms-pro/truegrynd/pull/70) — section **L**                                                                                                                                                                                                                  |
| **V2 — Accessible competition**               | 🟢 V2-00 [#71](https://github.com/igorms-pro/truegrynd/issues/71) · V2-01 [#73](https://github.com/igorms-pro/truegrynd/issues/73) · V2-02 [#75](https://github.com/igorms-pro/truegrynd/issues/75) · V2-03 [#77](https://github.com/igorms-pro/truegrynd/issues/77) PR [#78](https://github.com/igorms-pro/truegrynd/pull/78) — **prochaine : V2-04** |
| **QA V1**                                     | 🟢 GO (juin 2026) — périmètre critique testé                                                                                                                                                                                                                                                                                                           |

**Suite produit :** Produit **lancé** sur `main`. **V2-03** 🟢 mergée ([#77](https://github.com/igorms-pro/truegrynd/issues/77) · PR [#78](https://github.com/igorms-pro/truegrynd/pull/78) · migration **`017`** prod). **Prochaine action = V2-04** (Leaderboards division / faction / ville / pays).

---

**Référence :** [docs/CONTEXT.md](../CONTEXT.md) · [README.md](./README.md)
