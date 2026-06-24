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

## 3. Scope — the "Gym management" nav group

V3 already shipped the PRO shell with a **"Gestion salle"** nav group whose items are placeholders (`soon`). V4 fills them in.

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

## 4. Architecture notes

- **Multi-tenant reuse:** everything keys off `gyms` + `profiles.affiliated_gym_id` (already in place since V3-01). New tables: `gym_classes` (schedule templates), `gym_sessions` (dated instances), `gym_bookings`, `gym_memberships` (plans) + `gym_member_subscriptions` (a member ↔ plan), `gym_checkins`. All gym-scoped via RLS like the V3 tables.
- **Member payments = Stripe Connect.** V3 billing (#117) charges the _gym_ on the platform account. V4 needs the _gym to charge its members_ → each gym becomes a **Stripe Connect (Express) connected account**; Truegrynd optionally takes an application fee. This is the one genuinely new payment surface (the rest reuses the V3 plumbing — `callEdgeFunction`, webhook pattern).
- **Booking integrity:** capacity + waitlist needs transactional booking (RPC `book_session` with row locking) to avoid overbooking. Reuse the SECURITY-DEFINER RPC pattern.
- **Roles:** `gym_admin` manages plans/schedule/payments; `coach` runs the session (check-in, sees the roster); `athlete` books + pays. Gate via the existing `roles.ts` helpers.

## 5. Delivery slices (proposed)

1. **Planning + class types** — schedule CRUD, recurring slots, coach assignment. (Read-only calendar for members first.)
2. **Reservations** — booking + waitlist + cancellation + no-show, capacity-safe.
3. **Memberships & passes** — gym defines plans; assign to members; track remaining credits / validity.
4. **Member payments (Stripe Connect)** — onboard gym as connected account; charge memberships; webhook → member subscription status.
5. **Check-in / attendance** — coach kiosk; ties booking → attendance → passport activity.

Each slice ships behind the existing PRO subscription gate and the "Gestion salle" nav group going `soon → live`.

## 6. Open questions (to decide before building)

- **Stripe Connect model:** application fee % vs flat? KYB already done at gym creation (SIREN/SIRET) — does it satisfy Connect onboarding or is a separate Stripe onboarding required?
- **Booking model granularity:** per-class capacity only, or per-equipment/lane (rower, rig) booking too?
- **Migration from incumbents:** import members/plans from Peppy/Resawod (CSV)? Critical for switching cost / sales.
- **Pricing impact:** does management stay in the $100/mo GYM PRO, or a higher tier? (Replacing Resawod ≈ €100–150/mo of value — room to raise ACV.)

## 7. Success criteria

A pilot box (Igor's) **drops Peppy** and runs its full week on Truegrynd: schedule published, members booking, memberships billed, attendance tracked — while the same app runs the WODs, leaderboards and leagues. One product, one login, one data graph.
