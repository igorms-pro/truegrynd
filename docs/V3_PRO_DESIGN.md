# V3 PRO — Design de la surface `/pro`

> Livrable de l'issue [#122](https://github.com/igorms-pro/truegrynd/issues/122). Décide l'UX de l'espace PRO (coach / gym_admin) avant le shell `/pro` (#113).
> **Principe directeur : concevoir la vision complète, livrer en tranches.**

## 0. Positionnement — unifier les 2 outils que les box subissent

Aujourd'hui une box CrossFit jongle entre **2 outils séparés** :

- un outil de **gestion** (résa de cours, planning, abonnements, paiements) — type **Peppy / Resawod / Deciplus** ;
- un outil de **WOD / leaderboard** (programmation, scores, tableau) — type **Hustle Up / SugarWOD / BTWB**.

Deux logins, deux abonnements, des données qui ne se parlent pas. **TrueGrynd PRO réunit les deux** dans une seule surface, branchée sur l'arène B2C : le membre **réserve son cours → poste son score → monte au ranking vérifié**, au même endroit. C'est le pont qu'aucun des deux camps ne fournit.

> Validation terrain (n=1, mais réel) : la box de l'auteur tourne sur **Peppy + Hustle Up** simultanément → friction quotidienne. Cette box est le **pilote naturel (#0)**.

## 1. Décisions cadres

| Sujet                   | Décision                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navigation**          | `/pro` = segment de route sous `src/app/[locale]/app/pro/`, en miroir de `/admin`. Guard `layout.tsx` → `canAccessPro(profile)` (déjà dans `src/lib/roles.ts`).                                             |
| **Rôles**               | Même surface `/pro` pour `coach` et `gym_admin` ; sections masquées selon le rôle (`isGymStaff` / `role`). `platform_admin` y accède pour supervision.                                                      |
| **Multi-tenant**        | Tout est scopé à la salle de l'utilisateur (`profiles.affiliated_gym_id` pour les membres, `gyms.owner_id` pour le gym_admin). RLS déjà posée en V3-01.                                                     |
| **1er incrément livré** | **Judge Console + shell minimal** (cf §4). Le reste est conçu ici mais livré ensuite.                                                                                                                       |
| **Thème**               | `/pro` supporte **light ET dark** comme le reste de l'app (tokens `globals.css` déjà définis). Les maquettes sont en dark mais aucun écran ne doit hardcoder une couleur — tout via les variables de thème. |
| **Deux familles**       | Nav scindée : **Compétition** (Judge / Events / TV — l'ADN « Hustle Up ») et **Gestion salle** (Planning / Members / Abonnements / Billing — l'ADN « Peppy »).                                              |
| **Réutilisation B2C**   | La création d'event/WOD réutilise **à l'identique** le builder de l'arène (`CreateChallengeScreen` : circuit reps/hold + scoring `for_time`/`amrap`). Pleine page, pas de modal.                            |

## 2. Qui voit quoi

| Section                        |   coach    | gym_admin | platform_admin |
| ------------------------------ | :--------: | :-------: | :------------: |
| **Compétition**                |            |           |                |
| Judge Console (valider scores) |     ✅     |    ✅     |       ✅       |
| Events (créer compét / WOD)    | ✅ (créer) |    ✅     |       ✅       |
| TV Broadcaster (cast écran)    |     ✅     |    ✅     |       ✅       |
| **Gestion salle**              |            |           |                |
| Dashboard salle                | ✅ (read)  |    ✅     |       ✅       |
| Planning / réservations        | ✅ (gérer) |    ✅     |       ✅       |
| Members (liste, affiliation)   |     👁️     |    ✅     |       ✅       |
| Abonnements                    |     ❌     |    ✅     |       ✅       |
| Settings salle                 |     ❌     |    ✅     |       ✅       |
| Billing (abo 100 $/mo)         |     ❌     |    ✅     |       ✅       |

## 3. Wireframes

### 3.1 Shell `/pro` (nav)

```
┌──────────────┬─────────────────────────────────┐
│ TRUEGRYND PRO│  MyBox · Lyon · 48 membres       │
│ MyBox · Lyon │  ───────────────────────────────│
│ ▸ Dashboard  │                                  │
│ COMPÉTITION  │   [ contenu de la section ]      │
│ ▸ Judge   12 │                                  │
│ ▸ Events     │                                  │
│ ▸ TV Cast    │                                  │
│ GESTION SALLE│                                  │
│ ▸ Planning   │                                  │
│ ▸ Members    │                                  │
│ ▸ Abonnés*   │   * gym_admin only               │
│ ▸ Settings*  │                                  │
│ ▸ Billing*   │                                  │
└──────────────┴─────────────────────────────────┘
```

### 3.2 Judge Console — `/pro/judge` (incrément 1, killer feature)

```
À VALIDER (12)                         [filtre ▾]
────────────────────────────────────────────────
□ Marie D.   5K Row        19:42   il y a 4 min
                           [▶ vidéo]  [✓ Valider]
□ Tom R.     Fran          4:12    il y a 12 min
                           [▶ vidéo]  [✓ Valider]
□ Léa P.     Murph         42:30   (honor, no vid)
                           [— pas de preuve]  [✓]
────────────────────────────────────────────────
Valider → proof_level = judge_verified
        + verified_by_coach_id = coach courant
        → score promu au ranking premium
```

### 3.3 Dashboard — `/pro` (incrément 2)

```
┌────────────────────┬───────────────────────────┐
│ À valider     12   │  Leaderboard MyBox (semaine)│
│ Nouveaux mbrs  3   │  1. Tom R.     1840         │
│ Actifs 7j     31   │  2. Marie D.   1790         │
├────────────────────┤  3. Léa P.     1655         │
│ Defi de la semaine │  ...                        │
│ "Hyrox sim"        │                             │
└────────────────────┴───────────────────────────┘
```

### 3.4 Members — `/pro/members` (incrément 2)

```
MEMBRES (48)                    [+ Inviter] [⤓ CSV]
────────────────────────────────────────────────
Nom        Division   Dernière activité   Statut
Tom R.     Rx         aujourd'hui         ✅ affilié
Marie D.   Scaled     hier                ✅ affilié
…                                         [gérer ▾]
```

### 3.5 TV Broadcaster — `/pro/tv` (Phase 1, #114)

```
╔══════════════════════════════════════════════╗
║   MYBOX · WOD DU JOUR · "FRAN"                 ║
║   ┌──────────────────────────────────────┐    ║
║   │ 1  TOM R.      4:12  🟦 Horde         │    ║
║   │ 2  MARIE D.    4:38  🟥 Alliance ▲new │    ║
║   │ 3  LÉA P.      5:01  🟥 Alliance      │    ║
║   └──────────────────────────────────────┘    ║
║   read-only · plein écran · Realtime · anim.   ║
╚══════════════════════════════════════════════╝
```

### 3.6 Ranking vérifié — public B2C + `/pro` (le moat)

```
RANKING · Fran                          [preuves vérifiées ☑]
[Overall] [Par faction] [Par division] [Ma box]
Division ▾  Sexe ▾  Âge ▾  Saison ▾
   ① Karim B.   3:58   ✓ judge      ┐
   ② Tom R.     4:12   ✓ judge      │ podium
   ③ Marie D.   4:25   ▶ video      ┘
 4 Lucas P.    4:31   ✓ judge   312 respects
 5 Sarah A.←   4:38   ✓ judge   288   (toi)
 6 Julie M.    4:44   ▶ video   201
```

Reprend les codes Hyrox/Athlinks (rang par division, filtres, podium, « toi »)
**+ le badge de preuve** `judge > video > honor` que personne d'autre n'affiche.

### 3.7 Créer un événement — `/pro/events/new` (PLEINE PAGE, builder B2C)

```
CRÉER UN ÉVÉNEMENT
Nom […]   Date […]   Type [Compét|Ligue|WOD]   Visib [Box|Public]
Divisions [Rx][Scaled][Masters][Beginner]   TV Cast (toggle)
── ÉPREUVES ─────────────────────────────────────
 WOD 1 · Fran
   Circuit:  #1 Thruster  [Reps] 21-15-9
             #2 Pull-up   [Reps] 21-15-9
             #3 Plank     [Hold] 60s
             [+ mouvement]
   Scoring:  (•) For Time  ( ) AMRAP    cap 12 min
 [+ Ajouter un WOD]
 [Brouillon]  [Publier]
```

Un event = conteneur de N WODs, chacun construit avec **exactement** le builder de
l'arène (`CreateChallengeCircuitSection` + `CreateChallengeScoringSection`).

### 3.8 Planning / réservations — `/pro/planning` (ADN Peppy/Resawod)

```
PLANNING & RÉSERVATIONS        [+ Ajouter un cours]
Résa 312 ▲  Remplissage 78%  Cours 42  No-show 3,1%
‹ Aujourd'hui ›   15–21 juin        [Jour][Semaine][Coachs]
LUN15   MAR16   MER17   JEU18   VEN19   SAM20   DIM21
07:00   06:30   07:00   12:15   07:00   10:00   10:00
WOD     Open    WOD     CF      Hyrox   Team    Open
12/16   6/15    13/16   10/16   17/20   14/20   5/15
…       …       …       …       …
```

Créneaux, capacités, listes d'attente, no-show. **Le créneau « WOD » est lié à l'arène**
→ score post-cours direct au ranking. C'est la jointure Peppy×Hustle Up.

## 4. Séquencement de livraison

| Tranche               | Contenu                                                                             | Issues        | Pré-requis |
| --------------------- | ----------------------------------------------------------------------------------- | ------------- | ---------- |
| **0 — données**       | `gyms` + affiliation + RLS · `scores.verified_by_coach_id`                          | #110 ✅, #111 | V3-00 ✅   |
| **1 — pilote**        | Shell `/pro` (guard, nav 2 groupes) + **Judge Console** + ranking vérifié           | #112, #113    | tranche 0  |
| **2 — back-office**   | Dashboard + Members + Events (builder B2C) + invitation/affiliation                 | #113 (+)      | tranche 1  |
| **3 — rétention**     | **TV Broadcaster** (Realtime) + ligues inter-box                                    | #114, #115    | tranche 1  |
| **4 — gestion salle** | **Planning / réservations + abonnements** (ADN Peppy) — _gros morceau, ~2e produit_ | _à créer_     | tranche 2  |
| **5 — monétisation**  | Billing Stripe (abo gym) + Pacing Assistant                                         | #116, #117    | tranche 2  |

**Pourquoi cet ordre :** la Judge Console produit la donnée `judge_verified` dont dépendent le ranking premium, le TV et les ligues. On valide la boucle « coach valide → membre accroché » sur une vraie box avant d'investir dans le lourd.

> ⚠️ **La tranche 4 (gestion/réservations type Peppy) est un produit à part entière** (calendrier, capacités, listes d'attente, no-show, abonnements). C'est ce qui rend l'offre « tout-en-un » imbattable, mais c'est de loin le plus gros chantier — à ne pas sous-estimer ni démarrer avant que la boucle compétition (tranches 1-3) tienne sur le pilote.

## 5. Reste à trancher (hors design structurel)

- Invitation des membres : code salle public vs invite par email vs auto-affiliation à l'inscription ?
- TV Broadcaster : device dédié (URL avec token salle) vs session coach connectée ?
- Pacing Assistant : MVP manuel (coach saisit les splits) avant l'auto-calcul depuis le Passport ?

Ces points n'affectent pas le squelette `/pro` ci-dessus — à arbitrer au moment de leur tranche.
