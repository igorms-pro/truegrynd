# Truegrynd V6 Strategy — Native App & Wearable Connectors (the Mobile Era)

> Draft — started 24 June 2026. Follows [V4_STRATEGY.md](./V4_STRATEGY.md) (gym management) and [V5_STRATEGY.md](./V5_STRATEGY.md) (B2C premium, web).
> Epic: _to create._
>
> ⏱️ **Hard rule: nothing here ships before the MVP is launched & validated with the pilot box.** V3 (live) + V4 (management) + V5 (premium) are all **web** and come first. V6 is the mobile/native era, after product–market signal.

## 1. Thesis

Two big mobile moves, related but distinct:

1. **A true native app (Expo / React Native)** — for the daily, on-the-go, push-driven experience (athletes _and_ coaches on the floor).
2. **Wearable connectors (Garmin first)** — ingest passive cardio → the complete hybrid genome (passive cardio + verified strength). Lets us play Strava's frequency game while keeping the verified moat.

> Strava sees only **cardio**; Wodify only the **gym**. V6 gives Truegrynd **both** + native push + verified ranking. Nobody else has all of it.

## 2. The 3 surfaces (recap — who uses what)

| Surface              | Who                | What                                                         | Role                |
| -------------------- | ------------------ | ------------------------------------------------------------ | ------------------- |
| **`/app`**           | everyone (athlete) | arena, passport, book classes, social                        | `athlete`           |
| **`/pro`**           | coach / gym owner  | Judge, Events, TV, Leagues, Members, Billing, planning/mgmt  | `coach`/`gym_admin` |
| **`MOD` (`/admin`)** | **you** (platform) | UGC/challenge moderation, proof audits, AI triage, gym leads | `platform_admin`    |

Two _different_ validations to keep distinct: **MOD validates platform content** (user-submitted challenges/proofs); **/pro Judge validates a gym's members' scores**.

## 3. Native app — one role-aware app, not two

**Decision: ONE native app (Expo), role-aware — not two apps.** The coach _is_ also an athlete (trains, posts scores) → one identity, one login, one app; the app reveals coach tools when the role allows (exactly like web shows `/pro` to staff today).

| Surface                                                                                             | Where it lives in the mobile era                                           |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Athlete (`/app`)**                                                                                | **Native (Expo)** — daily use, push, store presence                        |
| **Coach floor tasks** (Judge, check-in, today's roster, alerts)                                     | **Native** — same app, a "Coach" mode/tab when `role ∈ {coach, gym_admin}` |
| **`/pro` heavy back-office** (planning builder, memberships, billing, reports, retention dashboard) | **stays Web** — data-dense, desktop                                        |
| **MOD / `/admin`** (you)                                                                            | **stays Web** — your heavy back-office, desktop only, never native         |

→ **Native (Expo) = athlete + coach-on-the-floor. Web = `/pro` heavy + MOD.** Split by _moment of use_, not by role.

### Why Expo (not Capacitor)

We want **strong = true native** (we're competing with Strava's polished native app; a WebView would feel second-rate). Expo = true native UI + best-in-class push + OTA updates.

- **Cost (be honest):** the mobile UI is **rewritten** in React Native — you can't reuse the Next.js/Tailwind web components.
- **Mitigation = monorepo with a shared core:** `packages/core` (Supabase client, services, types, Zod, scoring/rating) shared by `apps/web` (Next.js) and `apps/mobile` (Expo). Write logic once; only the UI layer differs. The `/pro` heavy back-office and MOD stay web — not rewritten.

### Push path

- **Interim (cheap, no app):** PWA web push — works Android + iOS 16.4+ (installed PWA). Good to validate the push need before committing.
- **Native:** Expo Notifications (excellent). Push is the real ROI of going native: booking reminders, waitlist-opened, "your rival posted", at-risk nudges → retention.

## 4. Wearable connectors — direct, no Strava middleman

- **Garmin first** — server-to-server: athlete connects Garmin (OAuth), Garmin **pushes** activities to a Truegrynd webhook. Same mechanism Garmin uses to feed Strava. **No native app needed** (works with the web/server). Requires Garmin developer-program approval.
- **Then** Whoop / Coros / Polar — own direct APIs, server-side.
- **Apple Health (HealthKit)** — iOS-native only → **needs the native app** (§3). Comes after the Expo app exists.
- **Strava: out** — competitor, locked-down API (Nov 2024). Not a dependency.

### Two-tier data model (never mix)

1. **Tracked (passive, unverified)** ← wearables → feed, streaks, frequency, cardio genome, engagement (the Strava-like layer).
2. **Verified (judge/video)** ← WOD/lifts → ranking, leagues, the credible CV (the moat).
   → Passive **never** enters a competitive ranking (or is clearly flagged). Keeping them separate protects the moat.

## 5. Sequencing

1. **MVP first (web).** V3 live → V4 management → V5 premium. **Do not start V6 before the MVP is out and validated with the pilot box.**
2. **PWA push** to validate the push need (cheap).
3. **Expo native app** (athlete + coach-floor) — monorepo, shared core; web keeps `/pro` heavy + MOD. Trigger = push ROI is proven and MVP is launched.
4. **Garmin connector** (web/server, can run in parallel — doesn't need native).
5. **Apple Health + the rest** once native is live.

## 6. Open questions

- Monorepo tooling (Turborepo / Nx) and how much core is genuinely shareable.
- Expo + Supabase auth/session sharing with the web session model.
- Garmin vs Whoop first (Whoop has strong CrossFit overlap).
- Does passive cardio feed any clearly-unverified rating axis, or stay display-only?
