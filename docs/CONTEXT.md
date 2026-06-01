# Truegrynd — Product & Technical Context

Ce document est le **brief de référence** à envoyer à une personne, une IA ou un agent cloud avant tout travail sur Truegrynd. Il doit permettre de comprendre rapidement ce que le produit fait, pourquoi il existe, ce qui est déjà livré, ce qu’il ne faut pas construire, et vers quoi il doit évoluer.

Pour l’exploitation technique pure (admin, migrations, rollback, RLS, secrets), voir plutôt [`docs/RUNBOOK.md`](./RUNBOOK.md). Le runbook n’est pas un pitch produit : c’est une fiche opérations.

---

## 1. One-Liner

**Truegrynd est une arène de compétition fitness asynchrone où n’importe qui peut se mesurer à son niveau, gratuitement, avec preuve, classement, factions et progression.**

Tagline actuelle :

> L’effort ne s’achète pas, il se prouve.

Phrase V2 :

> Race-day energy without the 110€ ticket.

---

## 2. Problème

La compétition fitness est devenue intimidante et chère :

- événements à 100–150 € ;
- déplacement obligatoire ;
- pression sociale et niveau perçu très élevé ;
- classement global qui écrase les débutants ;
- peu d’occasions de compétition entre les grands événements ;
- aucun “palmarès amateur” simple pour suivre sa progression.

Résultat : beaucoup de sportifs veulent le frisson de la compétition, mais n’osent pas, n’ont pas le budget, ou ne se sentent pas légitimes.

---

## 3. Solution

Truegrynd transforme n’importe quel salon, parc, garage ou salle low-cost en arène compétitive connectée.

Les utilisateurs :

- rejoignent une faction ;
- choisissent ou créent des challenges standardisés ;
- soumettent des scores en reps ou temps ;
- prouvent les meilleurs scores via URL vidéo ;
- gagnent un rang, une carte partageable, du respect, des streaks et de la réputation créateur ;
- progressent vers une compétition plus sérieuse sans payer un ticket d’événement.

La V2 pousse plus loin : **divisions de niveau**, **teams**, **weekly challenges**, **rival matches**, **rating** et **micro-events** pour que les sportifs moyens soient en compétition contre leur monde à eux, pas seulement contre les élites.

---

## 4. Positionnement

Truegrynd n’est pas une copie d’un gros événement fitness. C’est l’angle mort des gros événements.

Les grands acteurs possèdent le **jour d’événement**. Truegrynd vise les **51 autres semaines** : entraînement compétitif, progression, rivalités, divisions, preuves, communautés.

Positionnement mental :

- **anti-luxe** : brut, sombre, street, no excuses ;
- **accessible** : pas besoin de billet, de voyage ou d’être déjà elite ;
- **compétitif** : classement, preuve, badges, rivalités ;
- **asynchrone** : chacun joue quand il peut ;
- **social par le score**, pas par le feed social.

Ce que Truegrynd peut devenir pour un gros acteur sportif : un **top-of-funnel compétitif** qui transforme des sportifs normaux en futurs participants d’événements payants.

---

## 5. Ce Que Truegrynd Est

- Une app B2C de compétition fitness asynchrone.
- Une arène mondiale de challenges standardisés.
- Une plateforme UGC modérée : la communauté crée, l’admin valide.
- Un système de preuve léger : pas d’hébergement vidéo, seulement des liens externes.
- Un jeu d’identité sportive : faction, rang, streak, creator score, respect, finisher cards.
- En V2 : une ligue accessible avec divisions, weekly events, rival matches et rating.

## 6. Ce Que Truegrynd N’est Pas

- Pas un workout tracker personnel.
- Pas une app de programme d’entraînement.
- Pas un réseau social généraliste.
- Pas une plateforme vidéo.
- Pas une marketplace de coachs.
- Pas un clone d’événement type Hyrox/Spartan.
- Pas une expérience pay-to-win : payer ne doit jamais améliorer un rang sportif.

---

## 7. Golden Circle

|          | Sens                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **WHY**  | Le mérite, la sueur et le dépassement de soi ne doivent pas appartenir uniquement à ceux qui paient un ticket cher.                        |
| **HOW**  | Décentraliser la compétition : des challenges standardisés, des preuves simples, des classements, des factions et des divisions de niveau. |
| **WHAT** | Une web app de compétition fitness async : créer, rejoindre, soumettre, prouver, progresser, partager.                                     |

---

## 8. V1 Livrée Sur `main`

La V1 macro est livrée en code. Référence : [`docs/issues/issues.md`](./issues/issues.md).

### Socle MVP / V1

- Auth Supabase : Google / Apple / email.
- Onboarding : profil biométrique + faction.
- Arena : feed challenges + page challenge + leaderboard.
- Score submission : reps ou temps.
- Smart Proof : scores avec vidéo = classés / validés, scores sans vidéo = sauvegardés mais non classés.
- Finisher Card : image partageable.
- Profil : historique, avatar, creator score, streak, logout.
- Factions / Clan : guerre de factions + referral.
- UGC Creator Studio : création de challenges.
- Admin moderation : file admin, approve/reject, motif, audit.
- AI triage admin : Edge Function Supabase `admin-challenge-ai-review`.
- Movement catalog : 93 mouvements + option off-catalog.
- Creator score : trigger DB.
- Streaks : trigger DB.
- Respect : bouton leaderboard.
- Reports : table + RLS.
- SEO i18n + runbook.

### Migrations prod attendues

`001` à `012` appliquées, notamment :

- `008_admin_ugc_moderation.sql`
- `009_challenge_ai_review.sql`
- `010_creator_score_trigger.sql`
- `011_streak_trigger.sql`
- `012_reports.sql`

---

## 9. Innovations V1 Déjà En Place

### Factions

Trois équipes mondiales :

- `nomads`
- `horde`
- `iron_alliance`

Le score individuel nourrit aussi une identité collective.

### Smart Proof

Règle produit actuelle :

- score avec URL vidéo valide = `is_validated: true`, classé ;
- score sans vidéo = sauvegardé, pas classé ;
- vidéo externe uniquement : YouTube / TikTok, jamais d’hébergement Truegrynd.

### Creator Score

Les créateurs de challenges approuvés gagnent de la réputation quand d’autres soumettent des scores validés sur leurs défis.

### Admin AI Triage

L’IA ne valide jamais automatiquement. Elle classe et résume pour l’admin :

- green ;
- orange ;
- red.

L’humain décide.

---

## 10. Vision V2

La V2 doit faire passer Truegrynd de “challenge leaderboard app” à **ligue compétitive accessible**.

Le principe :

> Les gens un peu nuls ne doivent pas servir de décor aux élites. Ils doivent jouer contre des gens de leur niveau, progresser, monter de division, représenter leur team, et ressentir une vraie compétition.

V2 n’est pas “Hyrox-style”. V2 est l’anti-barrière :

- pas de ticket cher ;
- pas de déplacement ;
- pas d’humiliation sur un leaderboard global unique ;
- compétition par division ;
- scaling officiel ;
- teams/factions ;
- weekly challenges ;
- rival matches ;
- micro-events async ;
- passport compétitif.

Référence détaillée : [`docs/V2_STRATEGY.md`](./V2_STRATEGY.md).

---

## 11. Piliers V2

### Divisions De Niveau

Divisions proposées :

- `rookie`
- `regular`
- `savage`
- `elite`

Objectif : permettre “top 12% Rookie” plutôt que “41 862e mondial”.

### Scaling Officiel

Chaque challenge important peut avoir des variantes assumées :

- no equipment ;
- bodyweight ;
- dumbbell ;
- standard ;
- savage.

Le scaling n’est pas un mode facile honteux. C’est une porte d’entrée officielle.

### Weekly Global Challenge

Un rendez-vous récurrent :

- un challenge par semaine ;
- divisions ;
- factions ;
- leaderboards par ville/pays ;
- finisher card weekly ;
- streak compétitif.

### Truegrynd Rating

Un rating global et des axes :

- Engine ;
- Power ;
- Strength ;
- Grit ;
- Consistency.

Il sert à proposer des divisions justes, des rivaux pertinents, et une progression lisible.

### Team Wars / Factions

Les factions doivent devenir des équipes compétitives par division, pas seulement un badge onboarding.

Exemple de narration :

> Horde Rookie Paris bat Iron Alliance Lyon sur le Weekly Engine Test.

### Challenge Passport

Le profil devient un palmarès amateur :

- divisions atteintes ;
- meilleurs scores ;
- badges ;
- finisher cards ;
- weekly challenges complétés ;
- rival matches gagnés ;
- rating history.

### Rival Matches

Défis 1v1 ou petits groupes :

- même division par défaut ;
- faction adverse ou même faction ;
- durée 24h / 7j ;
- best-of-3 possible.

### Micro-Events

Événements async sans lieu physique :

- Rookie Week ;
- No Equipment Cup ;
- Faction War Weekend ;
- City Clash ;
- Grit Open ;
- Comeback Week.

### Proof Levels

Évolution du Smart Proof :

- Honor ;
- Video Ranked ;
- Community Verified ;
- Judge Verified ;
- Event Verified.

---

## 12. Backlog V2

Les candidates issues sont dans [`docs/issues/issues.md`](./issues/issues.md), section **H** :

- V2-01 : Divisions de niveau
- V2-02 : Variantes officielles / scaling
- V2-03 : Weekly Global Challenge
- V2-04 : Leaderboards par division, faction, ville, pays
- V2-05 : Truegrynd Rating
- V2-06 : Challenge Passport
- V2-07 : Rival Matches
- V2-08 : Team Wars / Faction Wars
- V2-09 : Micro-events async
- V2-10 : Proof Levels
- V2-11 : Growth loops
- V2-12 : Monétisation exploratoire

Recommandation de premier lot : **V2-01 → V2-03**.

---

## 13. Stack Technique

- **Framework** : Next.js 16, App Router.
- **Langage** : TypeScript.
- **Backend** : Supabase Auth, Postgres, RLS, Edge Functions.
- **Styling** : Tailwind CSS v4, dark-only MVP.
- **State** : Zustand + React Query.
- **Forms** : React Hook Form + Zod.
- **UI primitives** : Radix UI, Lucide, Sonner.
- **Tests** : Vitest + Playwright.
- **i18n** : `next-intl`, routes locales.

Architecture attendue :

- `app/` assemble les pages ;
- `features/` contient les domaines produit ;
- `components/` pour UI partagée ;
- `lib/` pour infra, types, utils ;
- Supabase calls dans services/hooks, jamais dispersés dans les composants.

---

## 14. Règles De Décision Produit

- Prioriser la compétition accessible avant la monétisation.
- Ne jamais construire une expérience où seuls les élites se sentent légitimes.
- Garder la friction basse pour le premier score.
- Garder la preuve plus stricte pour les rangs sérieux.
- Refuser le pay-to-win.
- Éviter le réseau social généraliste : Truegrynd est social par la compétition.
- Construire mobile-first.
- Tout nouveau texte visible doit avoir i18n EN + FR.
- Toute feature sensible doit respecter RLS + tests ou checklist de sécurité.

---

## 15. Documents De Référence

- Backlog et issues : [`docs/issues/issues.md`](./issues/issues.md)
- Stratégie V2 : [`docs/V2_STRATEGY.md`](./V2_STRATEGY.md)
- Runbook ops : [`docs/RUNBOOK.md`](./RUNBOOK.md)
- Wireframes : [`docs/wireframes/wireframes.md`](./wireframes/wireframes.md)
- Règles Cursor / agents : `AGENTS.md` et `.cursor/rules/*.mdc`
