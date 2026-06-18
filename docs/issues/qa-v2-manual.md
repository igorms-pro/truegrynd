# QA V2 — checklist manuelle (prod)

> Issue : [#100](https://github.com/igorms-pro/truegrynd/issues/100)  
> **Branche :** `feature/issue-100-qa-v2-manual`  
> **Où tester :** `https://truegrynd.vercel.app/fr/...` (Chrome/Safari — pas le browser Cursor)  
> **Quand :** ce soir ou demain matin · **avant V3**

---

## C’est quoi le verdict ?

| Verdict           | Signification                                                            | Tu fais quoi après                                                                               |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **GO**            | Tout le parcours core marche en prod, 0 bug bloquant                     | Tu peux attaquer V3 (ou Stripe si PostHog OK)                                                    |
| **GO avec fixes** | L’app est jouable, mais tu as noté 1–3 petits bugs (UI, copy, edge case) | Tu crées des issues FIX **sur cette branche** ou avant merge V3 — pas bloquant si le cœur marche |
| **NO-GO**         | Impossible de poster un score, LB/passport cassé, crash récurrent        | Tu fixes d’abord — **pas de V3**                                                                 |

« GO avec fixes » ≠ catastrophe : c’était le smoke **local** de l’agent (pas prod, pas rivals, pas PostHog). **Toi tu tranches en prod.**

---

## Déjà vu en local (agent — ne pas refaire sauf doute)

Smoke `localhost` compte igorms admin · juin 2026 :

- Arène, LB, filtres, respect, badges preuve
- Passport, rating, cosmetics « Me tenir au courant »
- Clan, rivals (vide), events (vide), admin proof (file vide)

→ **Insuffisant pour clore #100.** Il manque prod + PostHog + score end-to-end **par toi** + rivals si possible.

---

## TON checklist — prod obligatoire (~25 min)

Coche dans l’issue #100 ou ci-dessous. Note tout bug : URL + action + screenshot.

> ⚠️ **Caveat passe agent (16 juin, soir) :** testé en **local** (`pnpm dev`, compte test E2E, même DB Supabase que prod) — **PAS prod Vercel**, et **PostHog non vérifié**. Les coches ci-dessous = parcours fonctionnels exercés en local. La validation **prod + PostHog reste à faire par Igor** avant verdict final.

### Avant de commencer

- [x] ~~Login prod~~ → **login local** compte test E2E (password grant injecté)
- [x] **Mobile** 375–390px sur tous les écrans
- [ ] PostHog EU → **Live events** — ❌ non vérifié (à faire par Igor)

### 1. Score complet _(priorité #1)_

1. [x] `/fr/app/arena` → ouvre un défi
2. [x] **POST SCORE** → formulaire OK
3. [x] Soumets **sans vidéo** → **Enregistré / non classé** OK (score 04:30)
4. [x] Re-soumets **avec lien YouTube** → **CLASSÉ TOP 10%** (03:58, +11.9 rating) ✅
5. [x] Page **Finish** → finisher card OK · boutons **Télécharger + Partager** présents, **Partager → pas de crash** ✅

### 2. Leaderboard

Sur le même défi :

- [x] Filtres division/preuve/sexe/âge/faction présents et fonctionnels. ⚠️ pile de filtres très haute sur mobile
- [x] **Respect (+1)** → 0→1, toggle « Retirer le respect » ✅
- [x] **Signaler** → formulaire inline → « Signalement envoyé », **0 crash** ✅ (apparaît dans la file admin, cf §8)
- ℹ️ Bon détail : ma propre ligne n'a ni Respect ni Signaler

### 3. Passport + PostHog _(priorité #2)_

`/fr/app/profile/passport`

- [x] Rating + division visibles (50.79)
- [x] Section **Finisher styles** (3 previews) présente
- [x] Clic **Me tenir au courant** → « INSCRIT » (désactivé) ✅
- [~] PostHog : `trackEvent` appelé (viewed + interest), **dashboard Live non vérifié** (à faire par Igor)

### 4. Profil & public

- [x] `/fr/app/profile` → liens passport / historique OK
- [x] `/fr/app/u/TestGrynd` — page publique OK
- [x] Toggle privacy « Afficher ma ville sur le classement » → interactif ✅

### 5. Clan

- [x] `/fr/app/clan` — guerre des factions + tes points OK
- [x] `/fr/app/faction/horde` — page OK (stats guerre, hall of fame)

### 6. Rivals _(optionnel — 2 comptes)_

- [x] `/fr/app/rivals` + `/rivals/new` (formulaire : 1–3 défis, durée 24h/7j, username, matchmaking division) ✅
- [ ] Duel **end-to-end** — ❌ non testé (besoin d'un 2e compte pour accepter)

### 7. Events _(optionnel)_

- [x] `/fr/app/events` — **vide** → « pas d’event actif » (pas un bug). ⚠️ empty state faible (texte seul)

### 8. Admin _(compte test = admin)_

- [x] `/fr/app/admin/proof` charge — le **signalement du §2 y apparaît** ✅
- [x] **Validé juge** → badge LB passe « CLASSÉ VIDÉO » → **« VALIDÉ JUGE »** (vert), 0 crash ✅

### 9. PostHog finish

- [x] Bouton **Partager** présent et sans crash (`growth_share_finisher` via `trackEvent`)
- [~] Vérif **Live** du event → à faire par Igor

---

## Verdict — passe agent (local complet)

|                    |                                                                                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Résultat**       | ☐ GO · **☑ GO avec fixes** (local, tout exercé sauf 2 items externes) · ☐ NO-GO                                                                                                                                                          |
| **Date / testeur** | 16 juin 2026 — agent (local, compte test E2E, Playwright)                                                                                                                                                                                |
| **Bugs**           | **Finisher card overlap + i18n EN → ✅ CORRIGÉS en code** · `2 semaine(s)` pluriel (P2) · CTA « Poster un score » → arène (P2) · défi poubelle « Test… » (P2/3). ⚠️ ~~« pas de Partager »~~ **faux positif corrigé : le bouton existe.** |
| **Non testé**      | rivals duel end-to-end (2 comptes) · **PostHog dashboard Live** (externe). Tout le reste OK.                                                                                                                                             |

**Parcours core entièrement exercé en local, 0 crash, 0 erreur console.** Verdict **GO avec fixes**. Restent 2 vérifs hors-portée local : duel rival à 2 comptes + PostHog Live (à confirmer par Igor en prod).

**Si GO ou GO avec fixes** → merge doc QA + close #100 → V3 ou Stripe selon [MONETIZATION_V2-12.md](../MONETIZATION_V2-12.md).
