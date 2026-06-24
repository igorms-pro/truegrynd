# Truegrynd V4 Strategy — The Gym Management Layer (Own the Daily Workflow)

> Draft — started 24 June 2026. Sibling of [V3_STRATEGY.md](./V3_STRATEGY.md) (competition layer) and [V5_STRATEGY.md](./V5_STRATEGY.md) (B2C premium).
> Tracking epic: [#140](https://github.com/igorms-pro/truegrynd/issues/140).

## 1. Executive Summary & Thesis

V3 made Truegrynd the **competition + community layer** for hybrid/functional gyms, deliberately operating _alongside_ existing booking systems. V4 is the strategic escalation: **own the daily management workflow too** — planning, reservations, memberships and member payments — so a box runs its whole operation on Truegrynd instead of stitching two tools together.

**The wedge (n=1, the strongest signal in the project):** Igor's own CrossFit box runs on **Peppy** (management / booking / billing) **+ Hustle Up** (WOD / leaderboard) — two separate tools that don't talk to each other → _"ça me rend fou."_ Every hybrid box in Europe lives this same split: an administrative booking tool with zero community vibe, plus a separate WOD/score tool. **Truegrynd V4 collapses the two into one product.**

**The shift from V3 → V4:**

- V3: _"We own competition; coexist with your booking tool."_
- V4: _"Replace your booking tool. One app for the WOD **and** the schedule, the leaderboard **and** the membership."_

This is the moment Truegrynd stops being an add-on and becomes the **system of record** for the gym — which is what makes the $100/mo subscription sticky and raises the switching cost.

## 2. Why this is defensible (vs Resawod / Deciplus / Wodify)

- Incumbents (Resawod, Deciplus, Xplor) are **administrative**: booking + invoicing, corporate, no athletic identity, no community. US tools (Wodify, SugarWOD) are heavy, CrossFit-only, expensive.
- None unify **management + competition + hybrid athletic identity** in one place. Truegrynd already owns the hard, differentiated half (verified ranking, judge, events, leagues, TV). Adding management is comparatively commoditized — but bundling it with the moat is what no incumbent can copy quickly.
- The data flywheel: the schedule knows who trained, the WOD knows what they did, the passport knows how they progressed — **one graph**, not three exports.

## 3. Innovation — what no incumbent can do

Resawod / Peppy / Wodify are **cashier + booking** tools. Truegrynd holds three assets they don't: the **engagement graph** (streaks, activity, passport), **verified performance data** (judge/proof), and a **network of athletes across gyms**. That turns booking from a cold transaction into a retention + community engine. The headline:

> **V4 is not "a booking tool with community bolted on" — it's a retention + community engine that also handles booking.**

### 3.1 What users actually complain about (sourced)

From Capterra/G2/Trustpilot reviews and FR comparators (Reddit itself is crawl-blocked). Note: **Peppy** (peppy.cool, 300+ FR boxes) is actually _well_ rated on booking — so we don't beat it head-on on booking; we win by **unifying** + being strong where the whole category is weak.

| Complaint (real)                                                                                                                                                                                                                                            | Source                                         | Our answer                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **"All-in-one" that explodes into paid modules** — Wodify _"pricey to add features"_; Resawod's WOD/programming module (Trhade) **not in Starter/Pro**; Crossbook: _"49€ → 289€/mo with add-ons"_; Zen Planner forces an expensive payment processor + fees | Capterra (Wodify), crossbook, G2 (Zen Planner) | Genuinely one product + **transparent pricing**; competition layer is core, not an add-on      |
| **Performance/score tracking is the category's weak spot** — Resawod (FR leader): _"manque l'analyse complète des scores des athlètes"_; generalist tools _"pas spécialisés CrossFit (RX/Scaled, WODs, benchmarks natifs)"_                                 | crossbook comparator                           | **Our native strength** — verified ranking, judge, benchmarks, passport. The data-backed wedge |
| **Juggling 2–3 tools** — _"jonglage entre 3 outils, ~2h/semaine perdues"_                                                                                                                                                                                   | crossbook                                      | Unify booking + WOD + scores in one app (the n=1 wedge, at industry scale)                     |
| **Booking app crashes / unintuitive** → silent unsubscribes; slow/foreign support                                                                                                                                                                           | crossbook, Zen Planner reviews                 | Engagement-led booking in an app members already open daily; native FR                         |
| **Multi-gym is clunky** — Zen Planner: _"toggling between gyms should be one profile"_                                                                                                                                                                      | G2 (Zen Planner)                               | One portable athlete passport across all gyms → the drop-in network (#4)                       |
| **Billing nightmares** — charged after cancellation, support unresponsive                                                                                                                                                                                   | Trustpilot / Capterra                          | Stripe-native, clean dunning; reuse the V3 billing plumbing                                    |

The differentiators below (each = a real _"dommage que Resawod ne fasse pas ça"_) map onto these:

1. **🚨 Retention / churn-risk engine** _(owners' #1 pain; our structural edge)._ Incumbents tell you who paid; never _"these 8 members' attendance dropped 40% — they're about to churn."_ We already have the streak/activity/passport graph → surface an **at-risk dashboard** + auto re-engagement nudges. Gyms don't want a cashier, they want **retention**. This is the lead sales argument.
2. **🔗 Booking ⇄ WOD ⇄ leaderboard loop.** Book the 18h → **see the day's WOD while booking** → attend → post your score → it lands on the **class leaderboard, validated by the coach on the floor**. One app, one chain; impossible when programming and booking are separate tools.
3. **👥 Social booking (kills no-shows).** No-shows are the plague. We have rivals/factions: _"your rival booked 18h — join?"_, _"6 in, 2 from your faction."_ Attendance becomes social → accountability → fewer no-shows. Plus a **reputation-based waitlist** (chronic no-shows lose priority; reliable members auto-promoted).
4. **🌍 Cross-gym drop-in network** _(the network effect no single-gym tool can copy)._ Every Truegrynd athlete has a passport and gyms live on the platform → a traveling athlete can **drop in at any Truegrynd gym**: discover, book, pay, and the host gym sees their **verified level**. Revenue for gyms + an acquisition loop. Resawod can't — each gym is a silo.
5. **🎯 Coach class-prep view.** Resawod gives a list of names. We give the coach, per booked athlete: **level / scaling / recent scores / flagged injury** → he preps and scales the class intelligently.
6. **🏠 The member home is a destination, not a chore.** Peppy is opened only to book (cold). Truegrynd is opened daily (leaderboard, rivals, passport) → **booking happens where members already are**. Engagement-led booking.

**The 3 killers to lead with:** retention (1), the booking→WOD→leaderboard loop (2), the drop-in network (4).

## 4. Scope — surfaces & the "Gym management" nav group

**Two surfaces, split by role (this is the B2B2C nature):**

- **🏋️ Coach / gym_admin → B2B app (`/pro`)** — _sets up_ the operation: schedule, capacity, membership plans, payments, sees bookings, runs check-in. This is the **"Gestion salle"** nav group V3 shipped as placeholders (`soon`).
- **🧍 Member / athlete → B2C app (`/app`)** — _consumes_ it: a new **"Ma salle"** section (visible only to athletes with an `affiliated_gym_id`) where they see their gym's schedule, **book a class**, manage their membership, pay. The athlete is already in `/app` (posts scores) and already affiliated since V3-01.

Same database (sessions, bookings), two screens by role. V4 fills the `/pro` management group **and** adds the `/app` member booking section.

| Module              | What                                                                                   | Status after V3 |
| ------------------- | -------------------------------------------------------------------------------------- | --------------- |
| **Planning**        | Class schedule: recurring slots, coaches, capacity, types (WOD, open gym, Hyrox, etc.) | `soon`          |
| **Reservations**    | Member booking, waitlist, cancellation window, no-show tracking                        | (new)           |
| **Members**         | Roster — **shipped in V3** (extend with membership status, attendance)                 | 🟢 live         |
| **Subscriptions**   | The gym's own membership plans/passes (e.g. unlimited, 10-pack), assigned to members   | `soon`          |
| **Member payments** | The gym collects from its members (Stripe Connect — see §4)                            | (new)           |
| **Check-in**        | Attendance at a session (kiosk / coach taps in present members)                        | (new)           |
| **Settings**        | Gym profile, opening hours, class types, branding                                      | `soon`          |

Out of scope for V4 (keep lean): full accounting/exports, payroll, retail/POS, access-control hardware.

## 5. Architecture notes

- **Multi-tenant reuse:** everything keys off `gyms` + `profiles.affiliated_gym_id` (already in place since V3-01). New tables: `gym_classes` (schedule templates), `gym_sessions` (dated instances), `gym_bookings`, `gym_memberships` (plans) + `gym_member_subscriptions` (a member ↔ plan), `gym_checkins`. All gym-scoped via RLS like the V3 tables.
- **Member payments = Stripe Connect.** V3 billing (#117) charges the _gym_ on the platform account. V4 needs the _gym to charge its members_ → each gym becomes a **Stripe Connect (Express) connected account**; Truegrynd optionally takes an application fee. This is the one genuinely new payment surface (the rest reuses the V3 plumbing — `callEdgeFunction`, webhook pattern).
- **Booking integrity:** capacity + waitlist needs transactional booking (RPC `book_session` with row locking) to avoid overbooking. Reuse the SECURITY-DEFINER RPC pattern.
- **Roles:** `gym_admin` manages plans/schedule/payments; `coach` runs the session (check-in, sees the roster); `athlete` books + pays. Gate via the existing `roles.ts` helpers.

## 6. Delivery slices (proposed)

1. **Planning + class types** — coach builds the schedule (`/pro`): recurring slots, coach, capacity, type. Members get a read-only weekly calendar in `/app` "Ma salle".
2. **Reservations** — member books/cancels (`/app`) + waitlist + no-show, capacity-safe. Coach sees the roster per session with each athlete's level (differentiator #5).
3. **Booking ⇄ WOD loop** — attach the day's WOD (Events) to the session; show it at booking; check-in → score → class leaderboard (differentiator #2).
4. **Retention dashboard** — `/pro` at-risk-members view from the engagement graph + nudges (differentiator #1, the sales argument — pull earlier if it sells).
5. **Memberships & passes** — gym defines plans; assign to members; track credits / validity.
6. **Member payments (Stripe Connect)** — onboard gym as connected account; charge memberships; webhook → member subscription status.
7. **Check-in / attendance** — coach kiosk; ties booking → attendance → passport activity.
8. **Social booking + drop-in network** — rivals/faction nudges; reputation waitlist; cross-gym drop-in (differentiators #3, #4).

Management slices ship behind the PRO subscription gate (`/pro`, "Gestion salle" `soon → live`); member-facing slices ship in `/app` "Ma salle" for affiliated athletes.

## 7. Open questions (to decide before building)

- **Stripe Connect model:** application fee % vs flat? KYB already done at gym creation (SIREN/SIRET) — does it satisfy Connect onboarding or is a separate Stripe onboarding required?
- **Booking model granularity:** per-class capacity only, or per-equipment/lane (rower, rig) booking too?
- **Migration from incumbents:** import members/plans from Peppy/Resawod (CSV)? Critical for switching cost / sales.
- **Pricing impact:** does management stay in the $100/mo GYM PRO, or a higher tier? (Replacing Resawod ≈ €100–150/mo of value — room to raise ACV.)

## 8. Success criteria

A pilot box (Igor's) **drops Peppy** and runs its full week on Truegrynd: schedule published, members booking, memberships billed, attendance tracked — while the same app runs the WODs, leaderboards and leagues. One product, one login, one data graph.

---

## Sources (competitor pain points)

- [Wodify reviews — Capterra](https://www.capterra.com/p/159663/Wodify/reviews/)
- [Zen Planner reviews — Capterra](https://www.capterra.com/p/134351/Zen-Planner/reviews/) · [G2](https://www.g2.com/products/zen-planner/reviews)
- [Resawod / Deciplus / Zen Planner comparator — crossbook.eu](https://www.crossbook.eu/logiciel-de-gestion-box-crossfit-comment-choisir-le-bon-outil-en-2026-comparatif-resawod-deciplus-zen-planner/)
- [« Pourquoi ton logiciel de gestion de box te complique la vie » — crossbook.eu](https://www.crossbook.eu/pourquoi-ton-logiciel-de-gestion-de-box-te-complique-la-vie/)
- [Peppy (peppy.cool)](https://www.peppy.cool/) — the booking tool Igor's box uses; well rated, no native competition layer

> Reddit threads were not directly accessible (crawl-blocked); the above aggregators + comparators reflect the same complaints.
