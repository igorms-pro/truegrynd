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

### Avant de commencer

- [ ] Login prod (`/fr/auth`) — Google ou magic link
- [ ] **Téléphone** 375px au moins sur 2–3 écrans
- [ ] PostHog EU → **Live events** ouvert

### 1. Score complet _(priorité #1)_

1. `/fr/app/arena` → ouvre un défi
2. **POST SCORE** → formulaire
3. Soumets **sans vidéo** → OK enregistré
4. Re-soumets **avec lien YouTube/TikTok** → **CLASSÉ** sur le LB
5. Page **Finish** → finisher card + **Partager** (pas de crash)

### 2. Leaderboard

Sur le même défi :

- [ ] Change 2–3 filtres (division, faction, preuve Vidéo+)
- [ ] **Respect (+1)** sur une ligne
- [ ] **Signaler** → pas de crash

### 3. Passport + PostHog _(priorité #2)_

`/fr/app/profile/passport`

- [ ] Rating + division visibles
- [ ] Section **Finisher styles** (3 previews)
- [ ] Clic **Me tenir au courant**
- [ ] PostHog Live : `monetization_cosmetics_teaser_viewed` + `monetization_cosmetics_interest`

### 4. Profil & public

- [ ] `/fr/app/profile` → lien passport / historique
- [ ] `/fr/app/u/[ton-username]` vs toggles privacy passport

### 5. Clan

- [ ] `/fr/app/clan` — classement factions · tes points
- [ ] `/fr/app/faction/horde` (ou ta faction) — page OK

### 6. Rivals _(optionnel — 2 comptes)_

- [ ] `/fr/app/rivals/new` → duel → accepter → scores → résultat
- [ ] Skip OK si pas de 2e compte — note « rivals non testé »

### 7. Events _(optionnel)_

- [ ] `/fr/app/events` — si vide en prod, note « pas d’event actif » (pas un bug)

### 8. Admin _(si compte admin)_

- [ ] `/fr/app/admin/proof` — page charge
- [ ] Si score signalé : upgrade preuve → badge LB change
- [ ] Sinon note « proof queue vide »

### 9. PostHog finish

- [ ] Partage finisher → event `growth_share_finisher` en Live

---

## Verdict — à remplir après tes tests

|                           |                                  |
| ------------------------- | -------------------------------- |
| **Résultat**              | ☐ GO · ☐ GO avec fixes · ☐ NO-GO |
| **Date / testeur**        |                                  |
| **Bugs (lien issue FIX)** |                                  |
| **Non testé (OK)**        | ex. rivals, events vides         |

**Si GO ou GO avec fixes** → merge doc QA + close #100 → V3 ou Stripe selon [MONETIZATION_V2-12.md](../MONETIZATION_V2-12.md).
