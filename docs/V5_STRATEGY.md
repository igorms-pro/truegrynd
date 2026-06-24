# Truegrynd V5 Strategy — B2C Premium ("Verified Athlete")

> Draft — started 24 June 2026. Sibling of [V3_STRATEGY.md](./V3_STRATEGY.md) (competition) and [V4_STRATEGY.md](./V4_STRATEGY.md) (gym management).
> Tracking epic: [#141](https://github.com/igorms-pro/truegrynd/issues/141).

## 1. Executive Summary & Thesis

The B2C arena has always been the **free acquisition engine** that feeds B2B gym sales. V5 adds a **second, independent revenue line**: a premium tier for serious individual athletes — once there is enough scale to convert.

**The model = Strava's, with a twist Strava can't copy.** Keep the social/competitive core free (it's the growth engine); sell **depth + status** on top. The twist: Truegrynd's premium is anchored to the **verified-ranking moat** (judge / video / proof levels). "Verified Athlete" is a credential, not just analytics.

**Timing:** V5 ships **after scale** (a large free base worth converting). Building it earlier monetizes nobody and adds a payment surface to maintain. Until then, interest is already captured (the cosmetics teaser fires a PostHog signal).

## 2. The Golden Rule — the anti "pay €XX to do your sport"

> **You never pay to _do_ or _track_ your sport. You pay for status, depth and credibility.**
> If a feature helps you **train / grow / share** → free, forever. If it helps you **analyze yourself / prove yourself / stand out** → premium.

This is a **brand stance**, not just a pricing rule — and it's aimed squarely at where Strava is bleeding trust (see §6). Strava is _"paywalling features one piece at a time"_ (Year in Sport now €80/yr); we do the opposite. We never paywall posting scores, the arena, leaderboards, factions, rivals, weeklies, finisher-card sharing. **Monetize smart, not greedy:** gating the engine kills the funnel that sells gyms — and betrays the athlete.

The cheap interim B2C monetization (cosmetics) already respects this: it sells _look_, never access.

## 3. The tier — "Verified Athlete"

**🆓 Free (the engine, never gated):** post scores, arena, leaderboards, factions/clans, rivals, weeklies, proof submission, respects, finisher-card sharing.

**⭐ Premium (depth + status, on top):**

1. **Verified Athlete — the verified athletic CV (THE hook)**
   - A **shareable public profile of your verified PRs** (Fran, Murph, 1RM, Hyrox time, benchmarks) **with the proof level** (judge/video). In a world of fake PRs, _you_ certify. Useful for competition seeding, dropping in at another box (the coach sees your real level), coaching applications, bragging _with credibility_.
   - Verified badge on profile + finisher cards.
   - Access to **verified-only rankings** (filter the leaderboard to judge/video-verified scores) — the Hyrox/Athlinks credibility, for subscribers.
   - Enriched public passport (full proof history).
2. **Analytics — graphs (web, on data we already have)**
   - Rating evolution over time (Engine / Power / Strength / Grit) — `profile_rating_history` already exists.
   - Per-movement progression, PR history, percentile vs division / region / age.
   - Deep head-to-head vs rivals.
   - _All from our own data — no wearable/cardio graphs here (that's V6)._
3. **Full history** — unlimited score history + export (free = last N).
4. **Cosmetics included** — finisher frames (neon / gold / carbon) come _with_ the subscription (see §6), boosting perceived value.

## 4. Competitive wedge vs Strava (where they bleed, we win)

Strava is strong (passive capture, segments, the social feed) — we don't fight it on frequency. We attack its open wounds, all aligned with our moat:

| Strava's pain (sourced)                                                                                          | Our wedge                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Paywall creep / broken trust** — Year in Sport now €80/yr; _"paywalling features one piece at a time"_, opaque | **Anti pay-to-do-sport**: the engine is free forever, pricing transparent. _"Strava paywalled your year? Ours is free."_ |
| **Fake / cheated KOMs** — GPS spoofing, e-bikes, cars; leaderboards aren't trusted                               | **Verified rankings** (judge/video) — our moat aimed straight at their biggest credibility hole                          |
| **Cardio-only** — no home for strength / CrossFit / Hyrox                                                        | **The home of the hybrid / strength athlete**                                                                            |
| **Walled-garden API** (Nov 2024: killed 3rd-party apps, banned AI use, can't show others' data)                  | **Open**: data flows in (direct Garmin in V6), we don't lock the athlete in; not dependent on their hostile API          |

**Positioning one-liner:** Strava = cardio, unverified, walled, increasingly paywalled. **Truegrynd = hybrid/strength, verified, open, free engine.**

## 5. Pricing & mechanics

- Reference: Strava ≈ €12/mo. Target lower to convert wide early: **~€5–7/mo or ~€50/yr**.
- Stripe **subscription**, reusing the V3 plumbing (`stripe-checkout` / `stripe-webhook` patterns, `callEdgeFunction` helper). The athlete is the customer (vs the gym in V3).
- `profiles` (or a `user_subscriptions` table) carries the premium status; a `isPremium()` helper gates premium-only UI. Soft, never blocking the free core.

## 6. Cosmetics (refold of ex-#119)

The original plan was à-la-carte one-time cosmetic purchases (#119). **Decision (24 June): fold cosmetics into the V5 premium instead** — one payment system (the subscription), higher perceived value, no micro-transaction shop to maintain.

- Rendering already exists: `drawFinisherCard` + `buildFinisherCardOptions` support `frameStyle` (neon/gold/carbon); a teaser + PostHog interest event are live.
- Remaining: a `user_cosmetics` (or a derived "premium unlocks all frames") grant + a frame selector on the finish page.
- Optional later: keep à-la-carte purchase as an alternative path for non-subscribers (coexist), if data justifies it.

## 7. Sequencing & scope

- **Web-only, on data we already have.** Everything here (verified CV, ranking filter, rating/PR graphs, cosmetics) is buildable in the web app from existing tables (`scores`, `profile_ratings`, `profile_rating_history`). **No native app, no wearable connectors.**
- **Out of scope → V6** ([V6_STRATEGY.md](./V6_STRATEGY.md)): direct wearable connectors (Garmin first, server-to-server), passive cardio "genome", and Apple Health (which forces a native app). That's the "play Strava's frequency game" phase, separate from this credibility/depth tier.
- **Do not build until there is scale.** Trigger = a meaningful free MAU base + the PostHog cosmetics/verified interest signals crossing a threshold (cf [MONETIZATION_V2-12.md](./MONETIZATION_V2-12.md) §2.2).
- Comes **after** V4 in priority: B2B gyms (V3 live) + management (V4) are higher-ACV and the validated wedge; B2C premium is the long-tail upside.

## 8. Open questions

- Premium status storage: column on `profiles` vs dedicated `user_subscriptions` table (cleaner for history/trials).
- Free trial length? Annual discount?
- Which analytics are genuinely worth paying for — validate with power users before building the full dashboard.
- Does "verified-only ranking" stay premium, or is a teaser version free (to advertise the moat)?
- Is the **public verified CV** premium, or free-but-enriched-in-premium? (A free public CV is viral / acquisition — lean free, enrich in premium.)

---

## Sources (Strava pain points)

- [Year in Sport behind €80 paywall — T3](https://www.t3.com/tech/dear-strava-we-have-a-paywall-problem-thats-gone-a-step-too-far) · [Slashdot](https://news.slashdot.org/story/25/12/19/2158235/strava-puts-popular-year-in-sport-recap-behind-an-80-paywall)
- [API lockdown kills 3rd-party apps — DCRainmaker](https://www.dcrainmaker.com/2024/11/stravas-changes-to-kill-off-apps.html) · [Strava API agreement update](https://press.strava.com/articles/updates-to-stravas-api-agreement)
- Fake/cheated KOMs (GPS spoofing, e-bikes) — long-standing community grievance.
