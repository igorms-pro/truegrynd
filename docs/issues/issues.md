# Truegrynd – Backlog V1 / V2

> **MVP core livré.** **V1 sérieuse (sections A–G)** : **livré sur `main`** (PR [#30](https://github.com/igorms-pro/truegrynd/pull/30) → [#55](https://github.com/igorms-pro/truegrynd/pull/55)).  
> **V2** : stratégie dans [docs/V2_STRATEGY.md](../V2_STRATEGY.md). Angle : compétition fitness accessible, divisions de niveau, weekly challenges, équipes/factions, progression amateur.

**Dernière mise à jour :** 17 mai 2026

---

## État livraison

| Quoi                                              | Statut                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UGC Creator Studio + migrations `006` / `007`** | **Mergé `main`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30). Ops : migrations **prod** alignées avec le repo.                                                                                                                                                                                                                                                                                                                                   |
| **Admin UGC (#39)**                               | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), [#39](https://github.com/igorms-pro/truegrynd/issues/39), migration **`008`**.                                                                                                                                                                                                                                                                                                  |
| **Admin tri IA (#40)**                            | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), Edge Function **`admin-challenge-ai-review`**, migration **`009`**.                                                                                                                                                                                                                                                                                                             |
| **V1 B–G + ops DB**                               | **🟢 Mergé `main`** — PR [#45](https://github.com/igorms-pro/truegrynd/pull/45)–[#55](https://github.com/igorms-pro/truegrynd/pull/55). **Prod** : migrations **`006`–`012`** (dont **`010`–`012`** creator score, streaks, reports). **Ménage GitHub** : PR [#43](https://github.com/igorms-pro/truegrynd/pull/43) fermée (doublon), issues historiques **#15–#28, #39** fermées ; **AGENTS.md** via PR [#42](https://github.com/igorms-pro/truegrynd/pull/42). |

---

## Vision (rappel)

Arène async mondiale, **Smart Proof**, **Factions**, **UGC modéré**, **Finisher** shareable — légitimité + friction basse + identité, pas un tracker pastel.

---

## Sommaire backlog

| Bloc                            | Détail dans ce fichier                                  |
| ------------------------------- | ------------------------------------------------------- |
| **`/app/admin` (UGC)**          | Section **A** — tâches détaillées (+ **A9–A10** IA tri) |
| **Mouvements & prescription**   | Section **G** — catalogue mix + règles création         |
| **Creator Score**               | Section **B**                                           |
| **Streaks**                     | Section **C**                                           |
| **Respect (leaderboard)**       | Section **D**                                           |
| **Referral**                    | Section **E**                                           |
| **Confiance & plateforme**      | Section **F**                                           |
| **V2 — Accessible competition** | Section **H** — backlog issue-par-issue                 |

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

**Macro V2 proposée (à transformer en GitHub issues avant dev)**

- [ ] **V2-01** — Divisions de niveau (Rookie / Regular / Savage / Elite)
- [ ] **V2-02** — Variantes officielles / scaling par challenge
- [ ] **V2-03** — Weekly Global Challenge
- [ ] **V2-04** — Leaderboards par division, faction, ville, pays
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
- [x] **Runbook** : `docs/RUNBOOK.md` — promouvoir admin, rollback migration, revue RLS, rate limiting, env vars.

---

## G. Mouvements & prescription (création de défi) — **mix** (pas 10K au launch)

**Décision produit :** pas une liste “10K mouvements” au départ ; **noyau catalogué** + **“autre”** court pour la longue traîne, avec **modération** (souvent **orange** côté tri IA / admin).

- [x] **Constante versionée** `MOVEMENT_CATALOG` (slug stable, labels i18n EN/FR) : **93 mouvements** V1 — push, pull, squat, hinge, lunge, carry, cardio, olympic, core, isometric, plyometric, gymnastics — `src/features/challenges/lib/movementCatalog.ts`.
- [x] **Circuit** : chaque ligne = **sélection dans le catalogue** (grouped `<select>`) **ou** option **“Autre (précise)”** → texte libre + `movementSlug = ''` (off-catalog).
- [x] **Au moins une prescription mesurable** : **≥ 1 bloc** circuit valide (label + montant reps `>0` ou hold `MM:SS`) — **Zod + message i18n** (`circuitMinBlock`).
- [ ] **Synonymes** : table `movement_aliases` optionnelle (mapping “pompes” → `push_up`) pour recherche / stats plus tard.
- [x] **Évolution** : pour ajouter un mouvement → append dans `MOVEMENT_CATALOG` + i18n key par locale (`movements.<slug>`).

---

## H. V2 — Accessible Competitive Fitness

**Décision produit :** ne pas copier les gros events fitness. Truegrynd attaque leur angle mort : **l'énergie compétition sans ticket à 110 €, sans déplacement, sans élitisme**. Les gens jouent **dans leur division**, avec **leur team**, contre des gens de niveau comparable. Le leaderboard global reste une vitrine, pas l'expérience principale.

Référence stratégie : [docs/V2_STRATEGY.md](../V2_STRATEGY.md).

### V2-01. Divisions De Niveau

- [ ] **Produit** : définir les divisions canoniques V2 : `rookie`, `regular`, `savage`, `elite` (noms finaux à confirmer).
- [ ] **Règle d'entrée** : chaque utilisateur a une division par défaut (`rookie`) puis peut monter selon performance / rating.
- [ ] **DB** : ajouter une représentation stable des divisions (enum/check ou table `divisions`) + champ dérivé côté profil ou rating.
- [ ] **UI** : badge division visible sur profil, leaderboard, finisher card.
- [ ] **Leaderboard** : filtre division par défaut, global disponible mais secondaire.
- [ ] **i18n EN/FR** + tests de mapping division.

### V2-02. Variantes Officielles / Scaling Par Challenge

- [ ] **Produit** : chaque challenge important peut avoir des variantes officielles : no equipment, bodyweight, dumbbell, standard, savage.
- [ ] **DB** : modèle `challenge_variants` ou champ structuré validé (éviter texte libre non exploitable).
- [ ] **Création défi** : auteur choisit au moins une variante ; admin voit le niveau de friction / matériel.
- [ ] **Soumission** : score attaché à une variante précise.
- [ ] **Leaderboard** : classement par variante + division.
- [ ] **UX** : copy claire : scaling officiel ≠ mode honteux.

### V2-03. Weekly Global Challenge

- [ ] **Produit** : un défi global par semaine, simple, partageable, jouable partout.
- [ ] **DB** : table ou champs pour `weekly_challenges` (challenge_id, starts_at, ends_at, status).
- [ ] **App** : bloc homepage/overview “Weekly Challenge” avec CTA score.
- [ ] **Leaderboards** : division + faction + ville/pays.
- [ ] **Finisher Card** : variante weekly avec badge semaine.
- [ ] **Admin** : choisir / programmer le weekly sans migration.

### V2-04. Leaderboards Par Division, Faction, Ville, Pays

- [ ] **Produit** : permettre “Top Rookie Paris”, “Horde Regular France”, “Savage Global”.
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

| Bloc                                     | Avancement                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| UGC création + cap                       | 🟢 PR #30                                                                                                                     |
| Doc backlog V1 (ce fichier)              | 🟢 [#31](https://github.com/igorms-pro/truegrynd/issues/31) mergé — PR [#32](https://github.com/igorms-pro/truegrynd/pull/32) |
| Doc tri IA + mouvements mix (ce fichier) | 🟢 [#35](https://github.com/igorms-pro/truegrynd/issues/35) mergé — PR [#36](https://github.com/igorms-pro/truegrynd/pull/36) |
| **`/app/admin`**                         | 🟢 PR #41 mergé (admin + AI triage)                                                                                           |
| Creator Score                            | 🟢 [#46](https://github.com/igorms-pro/truegrynd/issues/46) mergé — PR [#47](https://github.com/igorms-pro/truegrynd/pull/47) |
| Streaks                                  | 🟢 [#48](https://github.com/igorms-pro/truegrynd/issues/48) mergé — PR [#49](https://github.com/igorms-pro/truegrynd/pull/49) |
| Respect                                  | 🟢 [#50](https://github.com/igorms-pro/truegrynd/issues/50) mergé — PR [#51](https://github.com/igorms-pro/truegrynd/pull/51) |
| Referral                                 | 🟢 [#52](https://github.com/igorms-pro/truegrynd/issues/52) mergé — PR [#53](https://github.com/igorms-pro/truegrynd/pull/53) |
| Confiance / plateforme                   | 🟢 [#54](https://github.com/igorms-pro/truegrynd/issues/54) mergé — PR [#55](https://github.com/igorms-pro/truegrynd/pull/55) |
| Mouvements / prescription (mix)          | 🟢 [#44](https://github.com/igorms-pro/truegrynd/issues/44) mergé — PR [#45](https://github.com/igorms-pro/truegrynd/pull/45) |
| **V2 — Accessible competition**          | 🔴 cadré dans [docs/V2_STRATEGY.md](../V2_STRATEGY.md) — issues candidates **V2-01 → V2-12** en section **H**                 |
| **QA V1 (manuel)**                       | 🟡 [docs/QA_V1_CHECKLIST.md](../QA_V1_CHECKLIST.md) — à cocher avant V2-01                                                    |

**Suite produit :** V1 macro **terminée**. Prochaine priorité = **QA V1** ([checklist](../QA_V1_CHECKLIST.md)), puis choisir le premier lot **V2** : recommandation produit = **V2-01 → V2-03** (divisions, scaling, weekly challenge).

---

**Référence :** [docs/CONTEXT.md](../CONTEXT.md) · [README.md](./README.md)
