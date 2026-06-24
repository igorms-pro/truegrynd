# Truegrynd V5 Strategy — B2C Premium ("Verified Athlete")

> Draft — started 24 June 2026. Sibling of [V3_STRATEGY.md](./V3_STRATEGY.md) (competition) and [V4_STRATEGY.md](./V4_STRATEGY.md) (gym management).
> Tracking epic: [#141](https://github.com/igorms-pro/truegrynd/issues/141).

## 1. Executive Summary & Thesis

The B2C arena has always been the **free acquisition engine** that feeds B2B gym sales. V5 adds a **second, independent revenue line**: a premium tier for serious individual athletes — once there is enough scale to convert.

**The model = Strava's, with a twist Strava can't copy.** Keep the social/competitive core free (it's the growth engine); sell **depth + status** on top. The twist: Truegrynd's premium is anchored to the **verified-ranking moat** (judge / video / proof levels). "Verified Athlete" is a credential, not just analytics.

**Timing:** V5 ships **after scale** (a large free base worth converting). Building it earlier monetizes nobody and adds a payment surface to maintain. Until then, interest is already captured (the cosmetics teaser fires a PostHog signal).

## 2. The Golden Rule

> **Premium sells data and status, never access.**
> If a feature helps you **grow / share** → free. If it helps you **analyze yourself / stand out** → premium.

We never paywall posting scores, the arena, leaderboards, factions, rivals, weeklies, finisher-card sharing. Gating the engine kills the funnel that sells gyms.

## 3. The tier — "Verified Athlete"

**🆓 Free (the engine, never gated):** post scores, arena, leaderboards, factions/clans, rivals, weeklies, proof submission, respects, finisher-card sharing.

**⭐ Premium (depth + status, on top):**

1. **Verified Athlete (the moat)**
   - Verified badge on profile + finisher cards.
   - Access to **verified-only rankings** (filter the leaderboard to judge/video-verified scores) — the Hyrox/Athlinks credibility, for subscribers.
   - Enriched public passport (full proof history).
2. **Analytics (the "Strava premium")**
   - Rating evolution over time (Engine / Power / Strength / Grit).
   - Per-movement progression, PR history, percentile vs division / region / age.
   - Deep head-to-head vs rivals.
3. **Full history** — unlimited score history + export (free = last N).
4. **Cosmetics included** — finisher frames (neon / gold / carbon) come _with_ the subscription (see §5), boosting perceived value.

## 4. Pricing & mechanics

- Reference: Strava ≈ €12/mo. Target lower to convert wide early: **~€5–7/mo or ~€50/yr**.
- Stripe **subscription**, reusing the V3 plumbing (`stripe-checkout` / `stripe-webhook` patterns, `callEdgeFunction` helper). The athlete is the customer (vs the gym in V3).
- `profiles` (or a `user_subscriptions` table) carries the premium status; a `isPremium()` helper gates premium-only UI. Soft, never blocking the free core.

## 5. Cosmetics (refold of ex-#119)

The original plan was à-la-carte one-time cosmetic purchases (#119). **Decision (24 June): fold cosmetics into the V5 premium instead** — one payment system (the subscription), higher perceived value, no micro-transaction shop to maintain.

- Rendering already exists: `drawFinisherCard` + `buildFinisherCardOptions` support `frameStyle` (neon/gold/carbon); a teaser + PostHog interest event are live.
- Remaining: a `user_cosmetics` (or a derived "premium unlocks all frames") grant + a frame selector on the finish page.
- Optional later: keep à-la-carte purchase as an alternative path for non-subscribers (coexist), if data justifies it.

## 6. Sequencing & gates

- **Do not build until there is scale.** Trigger = a meaningful free MAU base + the PostHog cosmetics/verified interest signals crossing a threshold (cf [MONETIZATION_V2-12.md](./MONETIZATION_V2-12.md) §2.2).
- Comes **after** V4 in priority: B2B gyms (V3 live) + management (V4) are higher-ACV and the validated wedge; B2C premium is the long-tail upside.

## 7. Open questions

- Premium status storage: column on `profiles` vs dedicated `user_subscriptions` table (cleaner for history/trials).
- Free trial length? Annual discount?
- Which analytics are genuinely worth paying for — validate with power users before building the full dashboard.
- Does "verified-only ranking" stay premium, or is a teaser version free (to advertise the moat)?
