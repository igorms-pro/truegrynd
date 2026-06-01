# Truegrynd V2 — Accessible Competitive Fitness

## Positionnement

Truegrynd V2 n'essaie pas de copier les grands événements fitness. L'angle est l'inverse : récupérer tous ceux qui veulent la tension de la compétition sans billet cher, déplacement, pression élitiste ou humiliation face aux monstres du classement global.

**Thèse :** les grands acteurs du sport vendent le jour d'événement ; Truegrynd possède les 51 autres semaines.

**Phrase courte :** Race-day energy without the 110€ ticket.

**Promesse :** chacun peut entrer dans l'arène à son niveau, dans sa division, avec son équipe, et progresser vers le haut.

## Pourquoi C'est Rachetable

Un acteur événementiel ou sportif ne rachèterait pas seulement une app de challenges. Il rachèterait :

- un funnel de sportifs amateurs vers la compétition payante ;
- des données de progression et de niveau sur des milliers d'athlètes ;
- une couche d'engagement entre les événements officiels ;
- un système de divisions qui rend la compétition moins intimidante ;
- des formats viraux peu coûteux à opérer : weekly challenges, micro-events, rival matches.

Truegrynd devient le **top of funnel compétitif** : les gens s'entraînent, se comparent, prennent confiance, puis osent acheter un ticket d'événement plus tard.

## Piliers Produit

### 1. Divisions Par Niveau

Le leaderboard global reste prestigieux, mais l'expérience principale doit classer les utilisateurs contre des gens comparables.

Divisions de départ :

- **Rookie** : découvre la compétition.
- **Regular** : pratique régulière, scores propres.
- **Savage** : très solide, cherche le top.
- **Elite** : minorité très forte, vitrine aspirante.

La clé : un utilisateur moyen doit pouvoir dire “je suis top 12% Rookie” au lieu de “je suis 41 862e mondial”.

### 2. Scaling Officiel

Chaque challenge important doit proposer des variantes assumées, pas honteuses :

- no equipment ;
- bodyweight ;
- dumbbell ;
- standard ;
- savage.

Le scaling n'est pas un mode facile : c'est une division officielle.

### 3. Weekly Global Challenge

Un rendez-vous simple, récurrent, partageable :

- un challenge par semaine ;
- variantes par division ;
- leaderboard par division, faction, ville, sexe, âge ;
- finisher card automatique ;
- bonus de streak compétitif.

Objectif : créer l'habitude de revenir sans devoir organiser un événement physique.

### 4. Truegrynd Rating

Un rating global qui résume le niveau sportif sans réduire l'utilisateur à un seul score.

Axes possibles :

- **Engine** : endurance / cardio.
- **Power** : puissance / explosivité.
- **Strength** : force relative.
- **Grit** : capacité à tenir l'inconfort.
- **Consistency** : régularité.

Le rating sert à proposer une division juste, des rivaux pertinents et des objectifs de progression.

### 5. Team Identity

Les factions deviennent plus qu'un badge : elles transforment l'effort individuel en guerre collective.

V2 doit croiser :

- équipe/faction ;
- division ;
- ville/pays ;
- weekly challenges ;
- micro-events.

Exemple de narration : “Horde Rookie Paris gagne le week-end engine contre Iron Alliance Lyon.”

### 6. Rival Matches

Défis 1v1 ou petits groupes entre athlètes de niveau proche :

- même division ;
- même faction ou faction adverse ;
- même ville/pays ;
- même tranche d'âge ou poids si pertinent ;
- best-of-3 sur la semaine.

C'est compétitif sans devenir un réseau social généraliste.

### 7. Micro-Events

Un event Truegrynd peut durer 24h, 7 jours ou 30 jours.

Formats :

- Rookie Week ;
- No Equipment Cup ;
- Faction War Weekend ;
- City Clash ;
- Grit Open ;
- Comeback Week.

Pas de ticket, pas de déplacement, pas d'élitisme. L'arène est partout.

### 8. Challenge Passport

Le profil doit devenir un palmarès amateur :

- divisions atteintes ;
- meilleurs scores par catégorie ;
- badges ;
- finisher cards ;
- micro-events terminés ;
- progression du rating ;
- victoires en rival match ;
- historique faction.

C'est le CV compétitif du sportif normal.

### 9. Proof Levels

Garder la friction basse, mais donner des couches de crédibilité :

- **Honor** : score sauvé, pas classé prestige.
- **Video Ranked** : URL vidéo valide, leaderboard standard.
- **Community Verified** : validation par pairs / signal faible.
- **Judge Verified** : coach, admin ou organisateur.
- **Event Verified** : score issu d'un micro-event officiel.

Les leaderboards sérieux peuvent filtrer par niveau de preuve.

## Cadre Factions & Exclusions Sociales (V2 early)

**À lire avant V2-01 (divisions) et impératif avant V2-07 / V2-08 (rivals, Team Wars).**

Truegrynd reste une **arène compétitive async**, pas un réseau social fitness. Les factions sont le seul vecteur d'appartenance collective ; V2 enrichit la compétition par **niveau** (divisions, scaling, weekly), pas par création de micro-communautés privées.

### Ce que Truegrynd n'est pas (V2 early — ne pas coder)

| Exclusion                 | Règle                                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Teams perso**           | Pas de sous-équipes ni de « team avec les potos » hors des **3 factions mondiales** (`nomads`, `horde`, `iron_alliance`).                                              |
| **Réseau social**         | Pas de messagerie privée (DM), pas de graphe Follow/Unfollow, pas de fil d'activité.                                                                                   |
| **Modes faction-only**    | Pas de catalogue de défis « Horde only » / « Iron only ». La faction est un **camp de guerre**, pas un mode de jeu séparé. Tous les challenges restent ouverts à tous. |
| **Social au-delà du MVP** | Interaction sociale limitée au **👊 Respect** sur lignes de leaderboard, plus referral faction et vitrines publiques (profil, pages faction).                          |

### Déjà livré (V1 / V1.5 — ne pas refaire)

- Choix de faction à l'onboarding, **immuable** en MVP.
- Referral `?faction=` + CTA Recruit.
- Pages `/app/faction/[slug]` symétriques : overview rivale, hall of fame, CTA Arena (section I).
- Respect leaderboard, streaks, creator score, finisher cards, profil/historique public.

### Ce que V2 ajoute par-dessus (issues V2-01+)

- **Divisions + scaling + weekly** (V2-01–03) : compétition **par niveau**, pas par team custom.
- **Rival Matches** (V2-07) : duel 1v1 / petit groupe sur défis — compétition légère, **pas** remplacement des 3 factions.
- **Faction Wars par division** (V2-08) : score équipe **serveur**, events, contribution perso — remplace l'heuristique Clan HUD.
- **Micro-events** (V2-09) : Faction War Weekend, City Clash, etc. — formats async, pas de ticket physique.

**Principe :** « avec **leur team** » dans le positionnement V2 = **faction mondiale + division**, jamais une équipe privée recrutée ad hoc.

## Roadmap V2 Recommandée

### V2.1 — Divisions + Weekly Challenge

Le plus gros levier de rétention et d'accessibilité.

- divisions ;
- variantes officielles ;
- weekly challenge ;
- leaderboards par division ;
- finisher cards divisées.

### V2.2 — Rating + Passport

Créer l'identité compétitive durable.

- Truegrynd Rating ;
- axes de performance ;
- profil passport ;
- historique de progression.

### V2.3 — Rival Matches + Team Wars

Transformer l'usage solo en compétition sociale légère.

- rival matches ;
- faction wars par division ;
- city/faction leaderboards.

### V2.4 — Micro-Events + Verification

Créer l'équivalent event sans opération lourde.

- event packs ;
- proof levels ;
- judge/admin verification ;
- pages de résultat.

### V2.5 — Monétisation

À ne pas coder trop tôt. D'abord prouver l'engagement.

Options :

- premium athlete passport ;
- micro-event entry cosmetics ;
- branded challenge sponsorship ;
- gym/team dashboard ;
- coach/judge accounts.

## Métriques à Suivre

- Weekly challenge participants.
- % users classés dans une division.
- % nouveaux utilisateurs qui soumettent un premier score en 7 jours.
- Rétention weekly challenge à 4 semaines.
- Partage de finisher cards.
- Rival match completion rate.
- Promotion Rookie → Regular.
- Scores video-ranked vs honor.

## Principe Produit

Ne jamais construire une expérience où les “nuls” sont seulement de la chair à leaderboard pour les élites.

Le produit gagne si quelqu'un de moyen peut ressentir :

> Je suis vraiment en compétition, mais contre mon monde à moi.
