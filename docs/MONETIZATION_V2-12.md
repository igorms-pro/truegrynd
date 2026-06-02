# V2-12 — Monétisation exploratoire

> **Issue GitHub :** [#98](https://github.com/igorms-pro/truegrynd/issues/98)  
> **Statut :** hypothèse retenue + prototype UI (sans Stripe, sans paywall fonctionnel)  
> **Principe produit :** le rang sportif reste gratuit — payer ne doit jamais améliorer un classement.

---

## 1. Synthèse décisionnelle

| Option                         | Verdict          | Raison                                                                                                               |
| ------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Finisher Card cosmetics**    | **Retenue (H1)** | Liée au loop growth (`growth_share_finisher`), zéro pay-to-win, prototype léger, valeur perçue sur le partage social |
| Premium Passport               | Reportée         | Le passport est déjà le CV compétitif core V2 — paywall risque de casser l'identité amateur                          |
| Micro-event packs payants      | Reportée         | Ops + perception « ticket » contraire au positionnement V2                                                           |
| Sponsor challenges             | Reportée         | Nécessite pipeline commercial, pas adapté au stade solo                                                              |
| **Pivot V3 gym ($100/mo B2B)** | **Conditionnel** | Voir §4 — pas prioritaire sans signal B2B organique                                                                  |

**Hypothèse H1 — Finisher cosmetics :** vendre des **cadres / skins** de Finisher Card (neon, gold, carbon…) à ~2–4 € one-shot ou bundle saisonnier. Le score, le rang et le contenu restent identiques ; seul le rendu visuel change à l'export PNG.

---

## 2. Métriques V2 — lecture PostHog

Référence stratégie : [V2_STRATEGY.md](./V2_STRATEGY.md) § Métriques.

### 2.1 Events déjà câblés (client → PostHog HTTP)

| Event PostHog                          | Source code               | Usage monétisation                              |
| -------------------------------------- | ------------------------- | ----------------------------------------------- |
| `growth_share_finisher`                | `FinisherCardActions`     | **Signal direct H1** — taux de partage finisher |
| `growth_share_weekly_invite`           | `WeeklyChallengeInvite`   | Proxy engagement weekly                         |
| `growth_share_rival_invite`            | `RivalMatchShareInvite`   | Proxy rival loop                                |
| `growth_share_referral`                | `RecruitCta`              | Acquisition faction                             |
| `growth_signup_completed`              | `OnboardingFlow`          | Funnel top                                      |
| `growth_first_score_submitted`         | `firstScore.ts`           | Activation J7                                   |
| `monetization_cosmetics_teaser_viewed` | `FinisherCosmeticsTeaser` | Intérêt exploratoire V2-12                      |
| `monetization_cosmetics_interest`      | `FinisherCosmeticsTeaser` | **Intent H1** — clic « me tenir au courant »    |

Config : `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (voir `.env.local.example`).

### 2.2 HogQL — à exécuter dans PostHog (Insights → SQL)

**Partages finisher (30 j)** — signal principal H1 :

```sql
SELECT count() AS shares
FROM events
WHERE event = 'growth_share_finisher'
  AND timestamp > now() - INTERVAL 30 DAY
```

**Taux partage / finisher views (proxy)** — si page finish trackée indirectement via shares uniquement :

```sql
SELECT
  countIf(event = 'growth_share_finisher') AS shares,
  countIf(event = 'growth_first_score_submitted') AS first_scores
FROM events
WHERE timestamp > now() - INTERVAL 30 DAY
  AND event IN ('growth_share_finisher', 'growth_first_score_submitted')
```

**Intent cosmetics (post-déploiement V2-12)** :

```sql
SELECT
  countIf(event = 'monetization_cosmetics_teaser_viewed') AS views,
  countIf(event = 'monetization_cosmetics_interest') AS interest_clicks
FROM events
WHERE timestamp > now() - INTERVAL 14 DAY
  AND event LIKE 'monetization_cosmetics%'
```

**Seuil go/no-go H1 (proposé, à affiner avec volume réel) :**

- `growth_share_finisher` ≥ 50 / 30j **ou** ratio shares / `growth_first_score_submitted` ≥ 15 %
- `monetization_cosmetics_interest` / views ≥ 8 % sur 14 j post-teaser
- Aucune régression sur `growth_first_score_submitted` (monétisation ne doit pas freiner l'activation)

### 2.3 Gaps analytics — métriques V2 non encore eventisées

| Métrique stratégie            | Source recommandée                      | Action                                                    |
| ----------------------------- | --------------------------------------- | --------------------------------------------------------- |
| Weekly challenge participants | Supabase `scores` + weekly flag         | Requête SQL admin / future event `weekly_score_submitted` |
| % users en division           | Supabase `profiles.division`            | Snapshot SQL                                              |
| Rétention weekly 4 semaines   | PostHog cohort signup → score semaine N | Cohort insight                                            |
| Rival match completion        | Supabase `rival_matches.status`         | RPC dashboard                                             |
| Promotion Rookie → Regular    | Supabase `division_history`             | Migration existante                                       |
| Video-ranked vs honor         | Supabase `scores.is_validated`          | SQL ratio                                                 |

Ces gaps ne bloquent pas H1 : le partage finisher est le proxy le plus direct pour des cosmetics.

---

## 3. Spécification H1 — Finisher cosmetics

### 3.1 Offre (exploratoire)

- **Gratuit :** frame `standard` (actuel)
- **Premium (futur) :** `neon`, `gold`, `carbon` — achat one-shot ou bundle event
- **Jamais payant :** rang, percentile, division, rating, accès leaderboard

### 3.2 Prototype livré (V2-12)

- Section **Finisher styles** sur `/app/profile/passport`
- Aperçu canvas des 3 frames premium sur un score fictif
- CTA « Notify me » → event `monetization_cosmetics_interest` (pas de paiement)
- Implémentation frame : `src/lib/finisher/frameStyles.ts` + option `frameStyle` dans `drawFinisherCard`

### 3.3 Pricing cible (hypothèse, non implémenté)

| SKU                      | Prix indicatif | Notes                   |
| ------------------------ | -------------- | ----------------------- |
| Single frame             | 2,99 €         | Impulsion post-share    |
| Season bundle (3 frames) | 6,99 €         | Aligné micro-events     |
| Faction pack             | 4,99 €         | Couleur faction + frame |

Stripe Checkout **uniquement** après validation des seuils §2.2.

---

## 4. Pivot V3 B2B — quand prioriser le gym

Lire [V3_STRATEGY.md](./V3_STRATEGY.md) pour le modèle $100/mo Pro (TV Broadcaster, leagues inter-box, Judge Console).

**Basculer V3 en priorité #1 si :**

1. ≥ 3 gyms/boxes distinctes avec ≥ 10 athlètes actifs chacune sur 30 j (requête `profiles` + affiliation future), **ou**
2. Demandes répétées de vérification coach / dashboard gym (support ou analytics), **ou**
3. Intent cosmetics < 3 % ET share finisher < 5 % sur 60 j → le loop B2C social ne porte pas la monétisation

**Sinon :** exécuter H1 cosmetics d'abord (coût dev faible, aligné growth V2-11).

---

## 5. Prochaines étapes (post-V2-12)

1. Déployer le teaser passport + monitorer PostHog 14 j
2. Si seuils OK → issue dédiée Stripe + table `user_cosmetics` + sélecteur frame sur finish page
3. Si seuils KO → réévaluer premium passport (sections privées) ou amorcer discovery V3 avec 2–3 boxes pilotes
4. Documenter décision finale dans `issues.md` (Suivi synthétique) ou issue GitHub dédiée

---

## 6. Références

- [V2_STRATEGY.md § V2.5](./V2_STRATEGY.md)
- [V3_STRATEGY.md](./V3_STRATEGY.md)
- `src/lib/analytics/events.ts`
- `src/features/profile/components/passport/FinisherCosmeticsTeaser.tsx`
