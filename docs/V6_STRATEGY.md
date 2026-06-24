# Truegrynd V6 Strategy — Wearable Connectors & the Passive Hybrid Genome

> Draft — started 24 June 2026. Follows [V5_STRATEGY.md](./V5_STRATEGY.md) (B2C premium on existing data).
> Epic: _to create._

## 1. Thesis

V5 monetizes the data we already have (verified WOD/strength). V6 adds the **other half of the hybrid athlete: passive cardio**, by ingesting wearables — **directly**, like Strava does from Garmin. This is what lets Truegrynd _play Strava's frequency game_ while keeping the verified moat Strava lacks.

> Strava sees only **cardio**. Wodify sees only the **gym**. With V6, Truegrynd sees **both** → the complete hybrid-athlete genome (passive cardio + verified strength). Nobody else has this.

## 2. Direct connectors — no Strava middleman

We pull from the **devices directly**, never via a competitor's (now hostile) API.

- **Garmin first** — server-to-server: athlete connects their Garmin account (OAuth), Garmin **pushes** activities to a Truegrynd webhook (Garmin Health/Connect API "push/ping"). Same mechanism Garmin already uses to feed Strava. **No native app needed.** Requires Garmin developer-program approval.
- **Then** Whoop / Coros / Polar — each has its own direct API (server-side, web is fine). Whoop is big in CrossFit (strain/recovery).
- **Apple Health (HealthKit)** — iOS-native only → **requires a native/companion mobile app** (Capacitor/React Native). This is the trigger that justifies going native. Comes last.
- **Strava: out.** It's a competitor with a locked-down API (Nov 2024). We don't depend on it.

## 3. The two-tier data model (never mix)

1. **Tracked (passive, unverified)** ← wearables. Feeds the **feed, streaks, frequency, the cardio genome**, engagement. The "Strava-like" layer.
2. **Verified (judge/video)** ← WOD/lifts. Feeds the **ranking, leagues, the credible CV**. The moat.

→ Passive boosts engagement; verified keeps credibility. **Passive data never enters a competitive ranking** (or is clearly flagged unverified). Keeping these separate is what protects the moat.

## 4. Scope & sequencing

- Big undertaking (per-provider OAuth + webhooks + data normalization; Apple Health forces native). A **pillar phase**, after V4 (gym management) and V5 (premium on existing data).
- Likely bundled into / unlocks part of the V5 premium ("connect your watch, see your full genome").

## 5. Open questions

- Which provider first beyond Garmin (Whoop given CrossFit overlap)?
- Native app: Capacitor wrapper of the web app, or React Native rebuild?
- Does passive cardio feed any (clearly-unverified) rating axis, or stay purely engagement/display?
