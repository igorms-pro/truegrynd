# V3 PRO — Design de la surface `/pro`

> Livrable de l'issue [#122](https://github.com/igorms-pro/truegrynd/issues/122). Décide l'UX de l'espace PRO (coach / gym_admin) avant le shell `/pro` (#113).
> **Principe directeur : concevoir la vision complète, livrer en tranches.**

## 1. Décisions cadres

| Sujet                   | Décision                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Navigation**          | `/pro` = segment de route sous `src/app/[locale]/app/pro/`, en miroir de `/admin`. Guard `layout.tsx` → `canAccessPro(profile)` (déjà dans `src/lib/roles.ts`). |
| **Rôles**               | Même surface `/pro` pour `coach` et `gym_admin` ; sections masquées selon le rôle (`isGymStaff` / `role`). `platform_admin` y accède pour supervision.          |
| **Multi-tenant**        | Tout est scopé à la salle de l'utilisateur (`profiles.affiliated_gym_id` pour les membres, `gyms.owner_id` pour le gym_admin). RLS déjà posée en V3-01.         |
| **1er incrément livré** | **Judge Console + shell minimal** (cf §4). Le reste est conçu ici mais livré ensuite.                                                                           |

## 2. Qui voit quoi

| Section                        |   coach   | gym_admin | platform_admin |
| ------------------------------ | :-------: | :-------: | :------------: |
| Judge Console (valider scores) |    ✅     |    ✅     |       ✅       |
| Dashboard salle                | ✅ (read) |    ✅     |       ✅       |
| Members (liste, affiliation)   |    👁️     |    ✅     |       ✅       |
| TV Broadcaster (cast écran)    |    ✅     |    ✅     |       ✅       |
| Settings salle                 |    ❌     |    ✅     |       ✅       |
| Billing (abo 100 $/mo)         |    ❌     |    ✅     |       ✅       |

## 3. Wireframes

### 3.1 Shell `/pro` (nav)

```
┌─────────────┬─────────────────────────────────┐
│ TRUEGRYND   │  MyBox · Lyon · 48 membres       │
│ PRO         │  ───────────────────────────────│
│             │                                  │
│ ▸ Dashboard │   [ contenu de la section ]      │
│ ▸ Judge  12 │                                  │
│ ▸ Members   │                                  │
│ ▸ TV Cast   │                                  │
│ ▸ Settings* │   * gym_admin only               │
│ ▸ Billing*  │                                  │
└─────────────┴─────────────────────────────────┘
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

## 4. Séquencement de livraison

| Tranche              | Contenu                                                    | Issues        | Pré-requis |
| -------------------- | ---------------------------------------------------------- | ------------- | ---------- |
| **0 — données**      | `gyms` + affiliation + RLS · `scores.verified_by_coach_id` | #110 ✅, #111 | V3-00 ✅   |
| **1 — pilote**       | Shell `/pro` (guard, nav) + **Judge Console**              | #112, #113    | tranche 0  |
| **2 — back-office**  | Dashboard + Members + Settings + invitation/affiliation    | #113 (+)      | tranche 1  |
| **3 — rétention**    | **TV Broadcaster** (Realtime) + ligues inter-box           | #114, #115    | tranche 1  |
| **4 — monétisation** | Billing Stripe (abo gym) + Pacing Assistant                | #116, #117    | tranche 2  |

**Pourquoi cet ordre :** la Judge Console produit la donnée `judge_verified` dont dépendent le ranking premium, le TV et les ligues. On valide la boucle « coach valide → membre accroché » sur une vraie box avant d'investir dans le lourd (Realtime/Stripe).

## 5. Reste à trancher (hors design structurel)

- Invitation des membres : code salle public vs invite par email vs auto-affiliation à l'inscription ?
- TV Broadcaster : device dédié (URL avec token salle) vs session coach connectée ?
- Pacing Assistant : MVP manuel (coach saisit les splits) avant l'auto-calcul depuis le Passport ?

Ces points n'affectent pas le squelette `/pro` ci-dessus — à arbitrer au moment de leur tranche.
