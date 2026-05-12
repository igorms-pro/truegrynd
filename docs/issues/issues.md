# Truegrynd – Backlog V1 (strong)

> **MVP core livré.** Ici : **V1 sérieuse** — pas de “vite fait” : specs exécutables, cochables, prêtes pour PR + RLS + i18n.  
> Les anciennes issues #0–#10 ne sont plus dupliquées ici (historique Git).

**Dernière mise à jour :** 12 mai 2026

---

## État livraison

| Quoi                                              | Statut                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **UGC Creator Studio + migrations `006` / `007`** | **Mergé `main`** — PR [#30](https://github.com/igorms-pro/truegrynd/pull/30). Ops : migrations **prod** alignées avec le repo. |

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
- [ ] **FEAT** — `/app/admin` — section **A** complète (incl. **A9–A10** tri IA + batch, sans auto-approve)
- [ ] **FEAT** — Prescription / **bibliothèque mouvements (mix)** — section **G**
- [ ] **FEAT** — Creator Score — section **B**
- [ ] **FEAT** — Streaks — section **C**
- [ ] **FEAT** — Respect leaderboard — section **D**
- [ ] **FEAT** — Referral — section **E**
- [ ] **FEAT / CHORE** — Confiance & plateforme — section **F**

---

## A. `/app/admin` — modération UGC (défi par défi)

**Objectif :** comptes **admin** voient la file **`challenges.status = 'pending'`**, **approuvent** ou **rejettent** avec **motif** + **audit** ; créateur voit **rejet + raison** ; **aucune** clé `service_role` côté client — tout passe par **RLS + RPC** (ou policies équivalentes strictes).

### A1. Données & migrations (`008` ou suivant)

- [ ] **`profiles.is_admin`** `boolean NOT NULL DEFAULT false` + index partiel si besoin.
- [ ] **`challenges.rejection_reason`** `text NULL` (motif affiché au créateur ; `NULL` si approved).
- [ ] **`challenges.reviewed_at`** `timestamptz NULL`.
- [ ] **`challenges.reviewed_by`** `uuid NULL` REFERENCES `profiles(id)` ON DELETE SET NULL`.
- [ ] Commentaires SQL sur colonnes (intention produit).
- [ ] **Seed / doc** : comment promouvoir un user admin en **prod** (SQL one-shot ou dashboard), sans exposer de secret.

### A2. Contrat serveur (Supabase) — source de vérité

- [ ] **`public.is_app_admin()`** : `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)` — `SECURITY DEFINER` si nécessaire pour éviter récursion RLS sur `profiles`, ou lecture JWT `app_metadata` si tu préfères ce modèle (choisir **un** canon documenté).
- [ ] **RPC `public.admin_set_challenge_status`** (recommandé) :
  - params : `p_challenge_id uuid`, `p_status text` (`approved` \| `rejected`), `p_rejection_reason text` (obligatoire si `rejected`, `NULL` si `approved`) ;
  - vérifie `is_app_admin()` ;
  - vérifie ligne cible `status = 'pending'` (sauf règle explicite “reopen” plus tard) ;
  - `UPDATE` uniquement : `status`, `rejection_reason`, `reviewed_at = now()`, `reviewed_by = auth.uid()` ;
  - retour : row mise à jour ou erreur contrôlée (`raise exception` messages stables pour mapping i18n côté app si besoin).
- [ ] **`GRANT EXECUTE`** sur la RPC au rôle `authenticated` (la fonction fait le gate admin).
- [ ] **Alternative documentée** si pas RPC : policies `UPDATE` admin **étroites** + trigger qui empêche la modification de colonnes hors lot review (éviter qu’un admin rewrite `title` par accident).

### A3. RLS — cohérence avec créateurs

- [ ] Vérifier compatibilité avec **“Creators can update own pending challenge”** : pas de conflit ; admin agit via **RPC** qui bypass RLS contrôlé **ou** policy `UPDATE` additionnelle **OR** admin.
- [ ] **SELECT** : admin peut lire `pending` / `rejected` / `approved` (policy dédiée `is_app_admin()` sur `challenges`) pour alimenter la file et l’audit — **sans** ouvrir la lecture de tous les brouillons à tout le monde.
- [ ] **Tests** (SQL ou CI) : user non-admin ne peut pas exécuter la RPC ; créateur ne peut pas approuver son propre défi via RPC ; impossible d’approuver un défi déjà `approved` sans règle explicite.

### A4. Feature Next.js — `src/features/admin/`

- [ ] **`index.ts`** : API publique du module (`AdminChallengeQueue`, hooks, types exportés au besoin).
- [ ] **`services/adminChallenges.ts`** : `listPendingChallenges`, `approveChallenge`, `rejectChallenge` — **uniquement** `supabase.rpc('admin_set_challenge_status', …)` ou queries autorisées ; **jamais** `service_role` côté client.
- [ ] **`hooks/useAdminPendingChallenges.ts`** : fetch + pagination + `refetch` après action.
- [ ] **`hooks/useIsAdmin.ts`** ou intégration dans le **profil déjà chargé** (`profiles.is_admin`) pour éviter N+1.
- [ ] **Types** : réponses typées ; erreurs réseau / RPC mappées vers messages utilisateur.

### A5. Routes App Router — sous `/app/admin`

- [ ] **`src/app/[locale]/app/admin/layout.tsx`** : garde serveur ou client — si `!isAdmin` → **404** (discrétion) ou redirect `/app/arena` ; pas de layout vide flashé longtemps (skeleton court acceptable).
- [ ] **`src/app/[locale]/app/admin/challenges/page.tsx`** : page **fine** — compose `AdminChallengeQueue` + titre + i18n.
- [ ] **Optionnel** : `middleware.ts` redirige `/app/admin` sans session valide (complément, pas substitut à RLS).
- [ ] **Nav** : lien “Admin” **visible seulement** si `is_admin` (dock / header) — pas d’URL secrète comme seule sécurité.

### A6. UI admin — états complets (règle projet)

- [ ] **Liste** : table ou cartes — colonnes : titre, `score_type`, `created_at`, username créateur (join ou denormalisation acceptable en V1).
- [ ] **Pagination** : cursor ou offset, taille page fixe (ex. 20).
- [ ] **Approve** : confirmation explicite (dialog) avant RPC.
- [ ] **Reject** : modal — **motif obligatoire**, longueur min (ex. 10 car.) + max (ex. 500) ; trim ; pas de HTML.
- [ ] **Loading** : skeleton ou spinner sur liste + disable actions pendant mutation.
- [ ] **Empty** : copy i18n “Aucun défi en attente”.
- [ ] **Error** : toast ou banner + **retry** sur fetch ; sur RPC erreur métier → message clair.
- [ ] **Success** : toast + ligne retirée de la file (optimistic ou refetch).
- [ ] **Accessibilité** : `aria-label` sur actions, focus trap modals, `focus-visible` (design system).

### A7. UX créateur (hors `/admin`)

- [ ] **`ChallengeDetail`** (ou équivalent) : bannière / badge **`pending`** (“En validation”).
- [ ] Même surface : **`rejected`** + affichage **`rejection_reason`** + `reviewed_at` (optionnel).
- [ ] **i18n** `challenge.*` / `admin.*` / `errors.*` — **EN + FR** pour tout nouveau copy.
- [ ] **Optionnel V1+** : route **`/app/profile/challenges`** (ou sous-onglet) “Mes défis” listant créations + statut.

### A8. Qualité & DoD admin

- [ ] **Tests unit** : service / mapping erreurs RPC (mock Supabase).
- [ ] **Test composant** (si infra) : modal reject + bouton approve désactivé pendant submit — au moins un chemin heureux.
- [ ] **Pas de `console.log`** en prod ; pas de fuite PII dans toasts.
- [ ] **`docs/issues/issues.md`** : cocher les cases **A** au fil des PRs ; lien PR sur la ligne macro ou en commentaire de section.

### A9. Tri IA pour la file admin (**pas d’auto-approve**)

**But :** beaucoup de `pending` ; l’IA **classe + résume** ; l’humain **filtre** (vert / orange / rouge), **sélectionne en masse** les verts et **approuve en un clic** — **aucun** `pending` → `approved` **sans** action utilisateur admin.

- [ ] **DB (migration)** : ex. `challenges.ai_tier` `text NULL` avec contrainte `green` \| `orange` \| `red`, `ai_summary text NULL`, `ai_model text NULL`, `ai_checked_at timestamptz NULL` (ou un seul `jsonb ai_review`).
- [ ] **Déclencheur** : au submit créateur **ou** bouton admin **“Analyser / Rafraîchir IA”** (re-run si le texte change, tant que `pending`).
- [ ] **UI file** : filtres + tri (rouge en haut), badge couleur, colonne ou tooltip **résumé court** ; sélection de lignes + **Approuver la sélection** (batch).
- [ ] **RPC batch** : ex. `admin_batch_approve_challenges(uuid[])` — `is_app_admin()` + chaque ligne `pending` + (optionnel) **uniquement `ai_tier = 'green'`** pour limiter le risque si tu veux une règle stricte.
- [ ] **Garde-fous** : prompt sans PII inutile ; **pas de clé** dans les logs ; rate limit sur l’endpoint qui appelle le modèle.

### A10. Où vit l’appel IA (**secrets hors Git**)

L’IA n’a pas besoin d’être “hors du repo” au sens code : le **code** est dans Truegrynd ; les **secrets** ne le sont jamais.

- [ ] **Variables d’environnement** hôte (Vercel, etc.) — **jamais** `NEXT_PUBLIC_*` pour une clé fournisseur.
- [ ] **Option recommandée** : **Route Handler** `app/api/...` ou **Server Action** : vérifie session + `is_admin`, appelle OpenAI / Anthropic / autre, puis persiste `ai_*` via Supabase (cookie utilisateur ou RPC selon RLS).
- [ ] **Alternative** : **Supabase Edge Function** + secret dans le dashboard Supabase.
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
| Doc tri IA + mouvements mix (ce fichier) | 🟡 [#35](https://github.com/igorms-pro/truegrynd/issues/35) — branche `chore/issue-35-docs-movement-ai-admin`                 |
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
