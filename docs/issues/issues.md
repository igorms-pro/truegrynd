# Truegrynd – Backlog V1 (strong)

> **MVP core livré.** Ici : **V1 sérieuse** — pas de “vite fait” : specs exécutables, cochables, prêtes pour PR + RLS + i18n.  
> Les anciennes issues #0–#10 ne sont plus dupliquées ici (historique Git).

**Dernière mise à jour :** 14 mai 2026

---

## État livraison

| Quoi                                              | Statut                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UGC Creator Studio + migrations `006` / `007`** | **Mergé `main`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30). Ops : migrations **prod** alignées avec le repo.                                                                                                                                                                                                                               |
| **Admin UGC (#39)**                               | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), [#39](https://github.com/igorms-pro/truegrynd/issues/39), migration **`008`**.                                                                                                                                                                                              |
| **Admin tri IA (#40)**                            | **🟢 Mergé `main`** — PR [#41](https://github.com/igorms-pro/truegrynd/pull/41), [#40](https://github.com/igorms-pro/truegrynd/issues/40) **fermée**, migration **`009`**, Edge Function **`admin-challenge-ai-review`**. **Reste (manuel / opt.)** : smoke MOD → AI scan ; rate limit endpoint (case A9 non cochée). **Bonus** : bouton **LOG OUT** profil. |

---

## Vision (rappel)

Arène async mondiale, **Smart Proof**, **Factions**, **UGC modéré**, **Finisher** shareable — légitimité + friction basse + identité, pas un tracker pastel.

---

## Sommaire backlog

| Bloc                          | Détail dans ce fichier                                  |
| ----------------------------- | ------------------------------------------------------- |
| **`/app/admin` (UGC)**        | Section **A** — tâches détaillées (+ **A9–A10** IA tri) |
| **Mouvements & prescription** | Section **G** — catalogue mix + règles création         |
| **Creator Score**             | Section **B**                                           |
| **Streaks**                   | Section **C**                                           |
| **Respect (leaderboard)**     | Section **D**                                           |
| **Referral**                  | Section **E**                                           |
| **Confiance & plateforme**    | Section **F**                                           |

**Macro-checklist**

- [x] **FEAT** — Creator Studio + RLS UGC + cap temps — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30)
- [x] **FEAT** — `/app/admin` **core** — modération file + RPC `008` + nav MOD — **mergé** PR [#41](https://github.com/igorms-pro/truegrynd/pull/41) ([#39](https://github.com/igorms-pro/truegrynd/issues/39))
- [x] **FEAT** — `/app/admin` **tri IA** — **A9–A10** — [#40](https://github.com/igorms-pro/truegrynd/issues/40) — **mergé** PR [#41](https://github.com/igorms-pro/truegrynd/pull/41) : migration **`009`** + Edge Function **`admin-challenge-ai-review`**
- [ ] **FEAT** — Prescription / **bibliothèque mouvements (mix)** — section **G**
- [ ] **FEAT** — Creator Score — section **B**
- [ ] **FEAT** — Streaks — section **C**
- [ ] **FEAT** — Respect leaderboard — section **D**
- [ ] **FEAT** — Referral — section **E**
- [ ] **FEAT / CHORE** — Confiance & plateforme — section **F**

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

- [ ] **Produit** : définition formelle du score (ex. +N par score **validé** sur un défi dont tu es **créateur** et `approved` ; plafond journalier anti-farming).
- [ ] **DB** : utiliser `profiles.creator_score` existant ou migrer vers table `creator_stats` si historique/agrégats nécessaires.
- [ ] **Trigger ou job** : incrément **côté serveur** (trigger on `scores` insert/update validated) — pas seulement client.
- [ ] **RLS** : `creator_score` lecture publique OK ; **UPDATE** réservé trigger / `SECURITY DEFINER` — pas d’UPDATE client direct.
- [ ] **UI profil** : affichage score + **tooltip / lien** “comment ça marche”.
- [ ] **Badges** (optionnel V1) : seuils (bronze/argent/or) — sinon report V1.1 avec assets.
- [ ] **i18n** + états loading/error sur bloc profil.

---

## C. Streaks — V1 forte

- [ ] **Règle produit écrite** : qu’est-ce qui allonge la série ? (ex. **au moins une soumission classée ou non** / jour calendaire UTC vs fuseau user).
- [ ] **DB** : `profiles.streak_days`, `profiles.last_activity_at` (déjà en schéma cible) — logique **idempotente** par jour.
- [ ] **Implémentation** : trigger sur `scores` **ou** RPC post-submit — éviter double incrément même jour.
- [ ] **Reset** : règle si gap > 1 jour → streak = 1 ou 0 selon spec.
- [ ] **UI** : Overview + profil — affichage + copy motivation ; **empty** si 0.
- [ ] **Edge cases** : premier jour, changement fuseau (documenter choix : UTC recommandé en V1).
- [ ] **Tests** : fonctions pures de calcul de streak (dates mockées).

---

## D. Respect (leaderboard) — V1 forte

- [ ] **DB** : table **`score_respects`** (migration `004_score_respects.sql` — **auditer** schéma + RLS actuels ; aligner produit : une ligne par `(user_id, score_id)`, pas de self-respect côté app + optionnel contrainte DB).
- [ ] **RLS** : insert seulement si auth ; pas de spam (unique constraint + erreur UX).
- [ ] **UI** : bouton sur ligne leaderboard — états default / loading / disabled / “déjà respecté” ; **pas** de compteur public toxique sans réflexion (définir affichage).
- [ ] **Anti-gaming** : pas de self-respect ; optionnel cooldown.
- [ ] **i18n** + a11y bouton.

---

## E. Referral — V1 forte

- [ ] **Lien signé ou paramètres** : `?faction=horde` + **validation** côté onboarding (rejet si valeur invalide).
- [ ] **Persistance** : cookie / localStorage limité + sync au signup — documenter durée TTL.
- [ ] **Analytics** (optionnel) : event “landing referral” sans PII invasive.
- [ ] **UI Clan / Overview** : CTA “Recruter un allié” + partage natif / copie lien.
- [ ] **Pas de multi-niveaux MLM** en V1 sauf décision explicite.

---

## F. Confiance & plateforme — V1 forte

- [ ] **Signalement** : table `reports` (target_type, target_id, reporter_id, reason, created_at) + RLS + file admin ou même RPC admin phase 2.
- [ ] **SEO i18n** : meta `title` / `description` par locale sur landing + routes clés.
- [ ] **Observabilité** : Sentry (ou équivalent) — erreurs client + contexte anonyme ; pas de tokens en logs.
- [ ] **Rate limiting** : création défis / soumissions / RPC admin — policy Supabase ou Edge Function si abus.
- [ ] **Runbook** : doc interne courte “promouvoir admin”, “rollback migration”, “revue RLS”.

---

## G. Mouvements & prescription (création de défi) — **mix** (pas 10K au launch)

**Décision produit :** pas une liste “10K mouvements” au départ ; **noyau catalogué** + **“autre”** court pour la longue traîne, avec **modération** (souvent **orange** côté tri IA / admin).

- [ ] **Table ou constante versionnée** `movement` (slug stable, labels i18n) : **80–150** mouvements max en **V1** couvrant la majorité des défis (push patterns, squat/hinge, pull, carry, mono-structure, bases run/row, isométrie…).
- [ ] **Circuit** : chaque ligne = **sélection dans la liste** **ou** option **“Autre (précise)”** → texte libre **court** + flag **`off_catalog`** (ou équivalent) pour file admin / tri **orange** par défaut.
- [ ] **Au moins une prescription mesurable** : **≥ 1 bloc** circuit valide (label + montant reps `>0` ou hold `MM:SS`) — **Zod + message i18n** ; renfort **DB** (CHECK ou trigger) si tu veux une V1 “forte”.
- [ ] **Synonymes** : table `movement_aliases` optionnelle (mapping “pompes” → `push_up`) pour recherche / stats plus tard.
- [ ] **Évolution** : process interne pour **ajouter** des slugs (PR data ou script seed) — pas besoin d’encyclopédie jour 1.

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
| **`/app/admin`**                         | 🔴 — suivre section **A**                                                                                                     |
| Creator Score                            | 🔴 — section **B**                                                                                                            |
| Streaks                                  | 🔴 — section **C**                                                                                                            |
| Respect                                  | 🔴 — section **D**                                                                                                            |
| Referral                                 | 🔴 — section **E**                                                                                                            |
| Confiance / plateforme                   | 🔴 — section **F**                                                                                                            |
| Mouvements / prescription (mix)          | 🔴 — section **G**                                                                                                            |

**Ordre d’attaque recommandé :** **A** (admin, puis **A9–A10** une fois la base admin + RPC OK) → **G** (standardisation création, en parallèle possible) → **B** → **C** / **D** → **E** → **F** continu.

---

**Référence :** [docs/CONTEXT.md](../CONTEXT.md) · [README.md](./README.md)
