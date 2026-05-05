# Truegrynd – Issues & Tasks Tracker

> Goal: Ship the MVP — async fitness competition web app (challenges, leaderboard, Smart Proof, Finisher Card, Factions).

**Last updated:** May 2026

---

## 🚀 IMMEDIATE NEXT ACTION (For AI Agent)

**Target:** Issue #5: Arena & challenges (feed, challenge page, leaderboard)
**Workflow to execute:**

1. Run: `gh issue create --title "Issue #5: Arena & challenges (feed, challenge page, leaderboard)" --body "Implement the Arena MVP: challenge feed (Trending/New), challenge detail page (rules + equipment tags), and per-challenge leaderboard with filters (global/age/sex/faction). Supabase read queries only; handle loading/empty/error states; i18n keys."`
2. Extract the issue number from the terminal output.
3. Run: `git checkout -b feature/issue-[NUMBER]-arena-challenges`
4. Execute the tasks listed under "Issue #5" below.
5. Check off the boxes `[x] 🟢` and update the status when finished.

---

## 📋 Status legend

- 🔴 **Not Started** – Task identified, not begun
- 🟡 **In Progress** – Actively being worked on
- 🟢 **Completed** – Finished and validated
- ⏸️ **Blocked** – Waiting on dependencies or decisions
- 🔵 **Testing** – In QA or testing
- 🟣 **On Hold** – Deferred for later

---

## ✅ Issue #0: git fetch origin

git checkout 1-project-foundation

**Status:** 🟢 **COMPLETED**  
**Priority:** CRITICAL  
**Phase:** Foundation

### Description

Project bootstrap: stack, tooling, folder structure, docs. Everything needed to build the MVP without revisiting config.

### Completed tasks

#### Environment & stack

- [x] 🟢 Next.js 16 + TypeScript + App Router
- [x] 🟢 ESLint (Next.js config)
- [x] 🟢 Prettier (auto-format)
- [x] 🟢 Tailwind CSS v4 + Truegrynd theme (colors, radius, Faction colors)
- [x] 🟢 PostCSS config
- [x] 🟢 Path aliases `@/*` → `src/*`
- [x] 🟢 Base deps: Supabase, React Query, Zustand, Zod, React Hook Form, Radix (slot, dialog, dropdown, label, separator, tabs, toast, tooltip, scroll-area, popover, checkbox, switch, accordion), date-fns, uuid, clsx, tailwind-merge, cva, Sonner, Lucide

#### Testing

- [x] 🟢 Vitest (jsdom, setup `src/test/setup.ts`)
- [x] 🟢 Testing Library (React, user-event)
- [x] 🟢 Playwright E2E (config, port 3000, smoke.spec.ts)
- [x] 🟢 e2e/ excluded from Vitest scope
- [x] 🟢 Scripts: test, test:run, coverage, e2e, e2e:headed, e2e:report

#### Quality & Git hooks

- [x] 🟢 Husky pre-commit → lint-staged (ESLint + Prettier)
- [x] 🟢 Husky pre-push → typecheck + test:run
- [x] 🟢 lint-staged: _.ts/tsx/js/jsx + _.json,md,css
- [x] 🟢 Scripts: typecheck, type-check, check, prepush (coverage + e2e)
- [x] 🟢 prepare → husky

#### Structure & lib

- [x] 🟢 Folders: `src/app`, `src/lib`, `src/components`, `src/hooks`, `src/features` (auth, challenges, leaderboard, factions, profile, finisher-card), `src/pages`, `src/test`
- [x] 🟢 `src/lib/utils.ts` (cn), `src/lib/supabase.ts`, `src/lib/types/database.types.ts` (Profile, Challenge, Score, Faction, etc.)
- [x] 🟢 `.env.local.example` (Supabase URL + anon key)

#### Cursor rules

- [x] 🟢 truegrynd-product-rules.mdc
- [x] 🟢 architecture-structure.mdc
- [x] 🟢 coding-guidelines.mdc
- [x] 🟢 backend-supabase-guidelines.mdc
- [x] 🟢 ui-design-guidelines.mdc
- [x] 🟢 testing-guidelines.mdc
- [x] 🟢 git-workflow.mdc

#### Documentation

- [x] 🟢 PROJECT.md (root)
- [x] 🟢 docs/CONTEXT.md (executive summary, Golden Circle, MVP, stack)
- [x] 🟢 docs/issues/issues.md (this file)
- [x] 🟢 docs/issues/README.md (convention)

### Acceptance criteria

- [x] Project builds and dev server runs
- [x] Lint, typecheck, tests (run + e2e) executable
- [x] Foundation aligned with Voyagely/OneLink (scripts, deps, structure)

---

## 🎯 PHASE 1: Foundation (before screens)

Complete before building feature screens.

---

## 🎯 Issue #1: Supabase project & database schema

**Status:** 🔴 **NOT STARTED**  
**Priority:** CRITICAL  
**Phase:** Foundation  
**Dependencies:** Issue #0

### Description

Create Supabase project, tables (profiles, challenges, scores), RLS policies, migrations, and seed for initial challenges.

### Tasks

#### Supabase project

- [ ] 🔴 Create Supabase project (dashboard)
- [ ] 🔴 Get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 🔴 Enable Auth (Email, Google, Apple if available)

#### Tables

- [ ] 🔴 **Table `profiles`** (extends auth.users):
  - [ ] id (UUID, FK auth.users)
  - [ ] username (TEXT, unique)
  - [ ] sex (TEXT: male | female | other)
  - [ ] age (INT)
  - [ ] weight_kg (NUMERIC)
  - [ ] faction (TEXT: nomads | horde | iron_alliance, nullable)
  - [ ] initiation_completed (BOOLEAN, default false)
  - [ ] creator_score (INT, default 0)
  - [ ] streak_days (INT, default 0)
  - [ ] last_activity_at (TIMESTAMPTZ, nullable)
  - [ ] avatar_url (TEXT, nullable)
  - [ ] created_at, updated_at
- [ ] 🔴 **Table `challenges`**:
  - [ ] id (UUID, PK)
  - [ ] title, description, rules (TEXT)
  - [ ] score_type (TEXT: time | reps)
  - [ ] equipment_tags (TEXT[] or JSONB)
  - [ ] is_official (BOOLEAN)
  - [ ] status (TEXT: pending | approved | rejected)
  - [ ] creator_id (UUID, nullable, FK profiles)
  - [ ] created_at
- [ ] 🔴 **Table `scores`**:
  - [ ] id (UUID, PK)
  - [ ] challenge_id (FK challenges)
  - [ ] user_id (FK profiles)
  - [ ] value (NUMERIC — time in seconds or reps)
  - [ ] video_url (TEXT, nullable)
  - [ ] is_validated (BOOLEAN, default false)
  - [ ] submitted_at (TIMESTAMPTZ)
  - [ ] Unique constraint (user_id, challenge_id) or allow multiple attempts per spec

#### RLS

- [ ] 🔴 RLS enabled on `profiles`, `challenges`, `scores`
- [ ] 🔴 profiles: read all, write own profile only
- [ ] 🔴 challenges: read approved (or all for admin), write admin/creator per rules
- [ ] 🔴 scores: read validated scores (or own), write own scores only

#### Migrations

- [ ] 🔴 Initial migration (schema + RLS)
- [ ] 🔴 Trigger or function to create `profiles` row on signup (auth.users)
- [ ] 🔴 (Optional) Realtime on `scores` for live leaderboard

#### Seed

- [ ] 🔴 Seed 5–10 official challenges (e.g. 50 burpees, 2 min plank, 1 min push-ups) with title, rules, score_type, equipment_tags, is_official=true, status=approved

#### TypeScript types

- [ ] 🔴 Align `src/lib/types/database.types.ts` with schema (Profile, Challenge, Score, Faction)
- [ ] 🔴 (Optional) `supabase gen types typescript` to generate from DB

### Acceptance criteria

- [ ] All tables exist with correct schema
- [ ] RLS tested (read/write by role)
- [ ] Seed run: challenges visible from app (after API wired)
- [ ] Types up to date for frontend

---

## 🎯 Issue #2: i18n & light/dark theme

**Status:** 🟡 **IN PROGRESS**  
**Priority:** HIGH  
**Phase:** Foundation  
**Dependencies:** Issue #0, #1 (optional for theme only; i18n can start with static keys)

### Description

Internationalization (i18n) so all user-facing text uses translation keys. Light/dark theme toggle with persistence (system preference or user choice). Same foundation as Voyagely/OneLink: no hardcoded strings, theme switch in header/settings.

### Tasks

#### i18n setup

- [x] 🟢 Install and configure i18next + react-i18next (or next-intl for Next.js App Router)
- [x] 🟢 Browser language detection (or locale from URL/cookie)
- [x] 🟢 Translation files: at least `en` and `fr` (e.g. `src/lib/locales/en.json`, `fr.json`)
- [ ] 🔴 Namespaces by feature: `common`, `auth`, `onboarding`, `arena`, `profile`, `errors`, etc.
- [x] 🟢 `useTranslation` hook (or equivalent) available app-wide
- [x] 🟢 Wrap app with i18n provider

#### i18n usage

- [ ] 🔴 Audit: no hardcoded user-facing strings in components
- [ ] 🔴 All UI text uses `t('key')` or `<Trans>`
- [ ] 🔴 Key naming: `feature.section.key` (e.g. `auth.login.title`)
- [ ] 🔴 Form validation messages from i18n
- [x] 🟢 (Optional) Language switcher in header or profile/settings

#### Light/dark theme

- [x] 🟢 Use `next-themes` (already in deps) or equivalent
- [x] 🟢 ThemeProvider in root layout with `attribute="class"` (or data-theme)
- [x] 🟢 CSS variables for light and dark in `globals.css` (already have dark; add light palette)
- [x] 🟢 Theme toggle component (sun/moon icon or switch) in header or a visible place
- [x] 🟢 Persist theme: `localStorage` + `system` option (respect `prefers-color-scheme` when “system”)
- [x] 🟢 No flash of wrong theme on load (script in head or suppressHydrationWarning where needed)
- [ ] 🔴 All screens and components respect theme (background, text, borders, cards)

#### Design tokens

- [x] 🟢 Light theme: define `--background`, `--foreground`, `--card`, `--primary`, etc. for light mode in `globals.css`
- [x] 🟢 Dark theme: keep existing Truegrynd dark variables
- [ ] 🔴 Ensure contrast and readability in both themes (WCAG 2.1 AA)

### Acceptance criteria

- [ ] No hardcoded user-facing strings; all text from i18n
- [ ] At least EN and FR translation files with keys for MVP screens
- [ ] Theme toggle switches between light and dark (and system)
- [ ] Theme preference persists across sessions
- [ ] No theme flash on first load
- [ ] Cursor rule or doc updated to mention i18n and theme as standard

---

## 🎯 PHASE 2: Screens & MVP features

Work in order. Each screen issue should be complete before moving to the next.

---

## 🎯 Issue #3: Auth (login / signup)

**Status:** 🟡 **IN PROGRESS**  
**Priority:** HIGH  
**Phase:** Screen 1  
**Dependencies:** Issue #1, #2 (i18n + theme)

### Description

Google, Apple (if available), and Email (magic link or OTP via Supabase). Login/signup pages. Client-side session. Post-auth redirect to onboarding if profile incomplete, otherwise to app.

### Tasks

#### Supabase Auth config

- [x] 🟢 Enable providers: Email (magic link or OTP), Google, Apple
- [x] 🟢 Configure redirect URLs (production + localhost)
- [x] 🟢 (Optional) Hook or middleware to protect authenticated routes

#### Pages & UI

- [x] 🟢 **Login** page/route: “Continue with Google”, “Continue with Apple”, “Continue with Email” (+ email field for email)
- [ ] 🔴 **Signup** page/route: same flow (MVP can reuse same `/auth` page)
- [x] 🟢 Loading and error states (toast or inline)
- [x] 🟢 Design system (buttons, cards, inputs) — Truegrynd dark (and light if theme done)
- [x] 🟢 All auth copy from i18n (`auth.login.*`, `auth.signup.*`)

#### Session & redirect

- [x] 🟢 After login/signup: check if profile is complete (username, sex, age, weight, initiation, faction)
- [x] 🟢 If incomplete → redirect to onboarding (Issue #4)
- [x] 🟢 If complete → redirect to app (Overview or Arena)
- [x] 🟢 Session persistence (Supabase Auth) + client-side read (hook or context)

#### Profile creation on signup

- [x] 🟢 On first signup/login: create or update `profiles` row (client upsert fallback)
- [x] 🟢 Link auth.uid to profiles.id (profiles.id = user.id)

#### Tests

- [x] 🟢 (Optional) Unit tests for auth flow (mock Supabase)
- [ ] 🔴 E2E smoke: landing → login click → redirect to auth or app

### Acceptance criteria

- [x] 🟢 Google login works (Email magic-link blocked by Supabase built-in quota unless custom SMTP)
- [x] 🟢 Signup/login creates user + profiles row (via upsert fallback)
- [x] 🟢 Post-auth redirect respects profile completion (onboarding vs app)
- [x] 🟢 Errors and loading handled
- [x] 🟢 Design consistent with app; all copy i18n

---

## 🎯 Issue #4: Onboarding (biometric profile + initiation + Faction)

**Status:** 🟢 **COMPLETED**  
**Priority:** HIGH  
**Phase:** Screen 2  
**Dependencies:** Issue #3

### Description

Sports identity card (username, sex, age, weight). Simplified initiation: 3 challenges “Done” (button only, no proof). Then Faction draft (Nomads, Horde, Iron Alliance). Once 3/3 + Faction chosen, profile complete and access to app.

### Tasks

#### Sports identity card

- [x] 🟢 Screen/step: Username, Sex (select), Age (number), Weight (kg)
- [x] 🟢 Validation (Zod): username required, age/weight in reasonable range
- [x] 🟢 Save to DB (`profiles`): username, sex, age, weight_kg
- [x] 🟢 Copy like “No cheating here. Your info defines your category.” (i18n)

#### Initiation (Nomad status)

- [x] 🟢 Show 3 onboarding challenges (hardcoded)
- [x] 🟢 Each challenge: title + “Done” button (no score input, no proof)
- [x] 🟢 Tracker 0/3 → 3/3
- [x] 🟢 At 3/3: unlock Faction step
- [x] 🟢 Set `profiles.initiation_completed = true` when 3/3

#### Draft (Faction choice)

- [x] 🟢 Screen with 3 Faction cards: Nomads, Horde, Iron Alliance (colors per design system)
- [x] 🟢 CTA “Pledge allegiance”: save Faction to DB (`profiles.faction`)
- [x] 🟢 After save: mark onboarding done, redirect to app

#### Onboarding flow

- [x] 🟢 Step order: Identity → Initiation (3 challenges) → Draft (Faction)
- [x] 🟢 No skip (onboarding required for new users via post-auth redirect)
- [x] 🟢 If user returns already complete: redirect to app
- [x] 🟢 All onboarding copy from i18n

### Acceptance criteria

- [x] 🟢 Biometric profile saved to DB
- [x] 🟢 3 initiation challenges with “Done” and 0/3 → 3/3
- [x] 🟢 Faction choice saved
- [x] 🟢 After onboarding complete, access to app (Overview/Arena)
- [x] 🟢 Initiation is simple but mandatory

---

## 🎯 Issue #5: Arena & challenges (feed, challenge page, leaderboard)

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 3  
**Dependencies:** Issue #1, #2, #3, #4

### Description

Challenge feed (Trending, New). Challenge detail page with rules, equipment tags, leaderboard. Leaderboard filters: global, age, sex, faction. Data from seed (official challenges).

### Tasks

#### App shell (navigation needed for Arena)

- [ ] 🔴 App header (TRUEGRYND left, lang/theme right)
- [ ] 🔴 Bottom dock tab bar (mobile): Overview | Arena | Clan | Profile
- [ ] 🔴 Routes exist for the 4 tabs (Clan/Profile can be placeholders until their issues)
- [ ] 🔴 Route protection: redirect to login if unauthenticated, to onboarding if profile incomplete
- [ ] 🔴 All labels/copy from i18n

#### Challenge feed

- [ ] 🔴 Scrollable list of challenges (from `challenges` where status = approved)
- [ ] 🔴 Sections/tabs: “Trending”, “New”
- [ ] 🔴 Challenge card: title, short summary, tags (#Bodyweight, #Dumbbells, etc.), score_type
- [ ] 🔴 Click card → challenge detail page
- [ ] 🔴 Empty, loading, error states
- [ ] 🔴 All labels/copy from i18n

#### Challenge page

- [ ] 🔴 Display: title, description, full rules, equipment tags, score_type
- [ ] 🔴 “Official” badge if is_official
- [ ] 🔴 Leaderboard for this challenge (below)
- [ ] 🔴 Primary CTA “I’m in / Start” → leads to score submission (Issue #6)

#### Leaderboard per challenge

- [ ] 🔴 Fetch validated scores for this challenge_id (sort: time asc or reps desc by score_type)
- [ ] 🔴 Columns: rank, user (username), score (formatted), Faction (optional)
- [ ] 🔴 Filters: Global | By age bracket | By sex | By Faction
- [ ] 🔴 Pagination or lazy load if needed
- [ ] 🔴 (Optional) “Respect” 👊 button (post-MVP)
- [ ] 🔴 Copy from i18n

#### Data

- [ ] 🔴 Use seeded challenges (Issue #1)
- [ ] 🔴 Supabase calls from features/challenges (services or hooks)

### Acceptance criteria

- [ ] Feed shows available challenges
- [ ] Challenge page shows full info + leaderboard
- [ ] Leaderboard filterable (global, age, sex, faction)
- [ ] CTA leads to score submission

---

## 🎯 Issue #6: Score submission & Smart Proof

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 4  
**Dependencies:** Issue #5

### Description

Submission form: score input (time MM:SS or reps by challenge). If score places user in Top 10% of leaderboard, show required “Video URL” (YouTube or TikTok). Validation, save to DB. Score without video if outside Top 10%; “elite” score requires video.

### Tasks

#### Submission form

- [ ] 🔴 Main field: Time (MM:SS or seconds) or Reps (number) by challenge.score_type
- [ ] 🔴 Validation (Zod): format and ranges
- [ ] 🔴 “Submit” / “Validate” button (i18n)
- [ ] 🔴 Copy from i18n

#### Smart Proof logic

- [ ] 🔴 Before save: compute whether entered score places user in Top 10% for this challenge
- [ ] 🔴 If yes (Top 10%): show required “Video URL” field (YouTube or TikTok)
- [ ] 🔴 If no: no video field
- [ ] 🔴 URL validation: YouTube/TikTok format
- [ ] 🔴 Save: scores.is_validated = true if (outside Top 10%) or (Top 10% and URL provided); else reject or is_validated = false per business rule

#### DB write

- [ ] 🔴 Insert into `scores`: challenge_id, user_id, value (seconds for time, int for reps), video_url (if any), is_validated, submitted_at
- [ ] 🔴 Error handling (duplicate, RLS, etc.)
- [ ] 🔴 On success: redirect or show Finisher Card (Issue #7)

#### UX

- [ ] 🔴 Clear message when “Elite score detected. Paste your YouTube/TikTok link to validate.” (i18n)
- [ ] 🔴 Loading, success, error states

### Acceptance criteria

- [ ] Score submission (time or reps) saved correctly
- [ ] Top 10% triggers required video URL
- [ ] Scores outside Top 10% saved without video
- [ ] After submit, user sees Finisher Card

---

## 🎯 Issue #7: Finisher Card (generation + share)

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 5  
**Dependencies:** Issue #6

### Description

Generate image (client-side canvas): score, world rank (e.g. Top 12%), Faction, Truegrynd logo. Bold, readable design. Download (PNG) and share (native share or download for Stories).

### Tasks

#### Image generation

- [ ] 🔴 Component or util that draws on canvas (or lib like html2canvas if needed)
- [ ] 🔴 Content: score (formatted), rank (e.g. “Top 12% worldwide”), Faction name, Faction colors, Truegrynd logo
- [ ] 🔴 Design per ui-design-guidelines (dark, high contrast); respect light/dark theme if applicable
- [ ] 🔴 Export as PNG (blob or data URL)

#### Display & download

- [ ] 🔴 “Reward” screen or modal showing generated card
- [ ] 🔴 “Download” button → trigger PNG download
- [ ] 🔴 “Share to Story” or “Share”: Web Share API if available, else “Download” for manual Story upload
- [ ] 🔴 Copy from i18n

#### Data

- [ ] 🔴 Score and challenge from the submission just made
- [ ] 🔴 Rank computed after insert (position in leaderboard as %)
- [ ] 🔴 Faction and username from profile

### Acceptance criteria

- [ ] Card generated with correct info (score, rank %, Faction, branding)
- [ ] PNG download works
- [ ] Share or download usable for Stories

---

## 🎯 Issue #8: User profile

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 6  
**Dependencies:** Issue #3, #4

### Description

Profile page: avatar, username, Faction, level (or simple indicator). Score history. Gallery of unlocked Finisher Cards.

### Tasks

#### Profile header

- [ ] 🔴 Avatar (photo or initials)
- [ ] 🔴 Username, Faction (name + color/badge)
- [ ] 🔴 (Optional) Level or progress indicator
- [ ] 🔴 Data from `profiles` (+ auth)
- [ ] 🔴 i18n for labels

#### Score history

- [ ] 🔴 List of user’s submitted scores (newest first)
- [ ] 🔴 Per score: challenge (title), value (formatted), rank at submit time if stored, date
- [ ] 🔴 Link to challenge page
- [ ] 🔴 Empty, loading, error states

#### Finisher Card gallery

- [ ] 🔴 Show unlocked Finisher Cards (one per challenge completed or per score — define rule)
- [ ] 🔴 Thumbnails clickable → full view or download
- [ ] 🔴 (Optional) Regenerate on the fly from score + profile if not storing images

### Acceptance criteria

- [ ] Profile shows identity + Faction
- [ ] Score history correct and readable
- [ ] Finisher Card gallery visible (at least recent)

---

## 🎯 Issue #9: App navigation & layout (tabs, Overview, Clan)

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 7  
**Dependencies:** Issue #3, #4, #5

### Description

Authenticated layout with 4 tabs: Overview, Arena, Clan, Profile. Overview: daily summary, challenge of the day, Faction status. Arena = feed (Issue #5). Clan = Faction leaderboard + top members of your Faction. Profile = Issue #8.

### Tasks

#### Layout & navigation

- [ ] 🔴 Polish/extend app shell: desktop variant (top tabs or sidebar), safe-area, animations
- [ ] 🔴 Ensure tab state + active route styling across nested routes (e.g. challenge detail)
- [ ] 🔴 Refine route protection + redirects (edge cases, back button, deep links)
- [ ] 🔴 Tab labels from i18n (audit + consistency)

#### Overview tab

- [ ] 🔴 Summary: current rank or welcome, streak if shown
- [ ] 🔴 “Challenge of the day” highlighted (one official challenge, click → challenge page)
- [ ] 🔴 (Optional) “Your Faction needs points today” or Faction status
- [ ] 🔴 i18n

#### Arena tab

- [ ] 🔴 Reuse feed + challenge page (Issue #5)
- [ ] 🔴 (Optional) FAB “+” for create challenge (post-MVP Creator Studio)

#### Clan tab

- [ ] 🔴 Faction leaderboard (gauge or list of 3 Factions with total points)
- [ ] 🔴 Top 10 (or N) members of your Faction
- [ ] 🔴 (Optional) CTA “Recruit an ally” (referral — post-MVP)
- [ ] 🔴 i18n

#### Profile tab

- [ ] 🔴 Integrate profile page (Issue #8)

### Acceptance criteria

- [ ] Navigation between 4 tabs works
- [ ] Overview shows challenge of the day + summary
- [ ] Arena = challenge feed
- [ ] Clan = Faction ranking + top Faction members
- [ ] Profile = Issue #8 content
- [ ] Theme toggle visible (from Issue #2); all copy i18n

---

## 🎯 Issue #10: Polish & deployment

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** MVP delivery  
**Dependencies:** Issues #3–#9

### Description

Basic SEO, meta tags, error handling (404), Vercel deployment, domain if needed. Smoke E2E green.

### Tasks

#### SEO & meta

- [ ] 🔴 Meta title, description on main pages (landing, login, app)
- [ ] 🔴 Open Graph / Twitter Card for sharing (at least landing)
- [ ] 🔴 Favicon + meta consistent with brand
- [ ] 🔴 (Optional) i18n per locale for meta

#### Errors

- [ ] 🔴 404 page (design system)
- [ ] 🔴 Auth errors (session expired, etc.) with redirect or message
- [ ] 🔴 i18n for error messages

#### Deployment

- [ ] 🔴 Vercel project linked to repo
- [ ] 🔴 Env vars (Supabase) set
- [ ] 🔴 Next.js build succeeds
- [ ] 🔴 (Optional) Custom domain

#### E2E & quality

- [ ] 🔴 Smoke E2E: at least landing + auth (login or redirect) + one app route if possible
- [ ] 🔴 pre-push (or CI): typecheck + test:run + e2e pass

### Acceptance criteria

- [ ] Basic SEO in place
- [ ] 404 and auth errors handled
- [ ] App deployed and reachable
- [ ] Smoke E2E green

---

## 🎯 PHASE 3: Post-MVP (backlog)

To be done after MVP ship.

- [ ] **FEAT** – Creator Studio: users submit UGC challenges
- [ ] **CHORE** – Admin dashboard: approve/reject UGC challenges
- [ ] **FEAT** – Streaks: consecutive activity days (🔥)
- [ ] **FEAT** – Respect button (👊) on leaderboard
- [ ] **FEAT** – Referral link “Invite a brother in arms” (Faction pre-select)

---

## 📊 Progress tracking

| Issue                       | Status         | %    |
| --------------------------- | -------------- | ---- |
| #0 Foundation               | 🟢 Completed   | 100% |
| #1 Supabase                 | 🔴 Not Started | 0%   |
| #2 i18n & theme             | 🟡 In Progress | 70%  |
| #3 Auth                     | 🟡 In Progress | 90%  |
| #4 Onboarding               | 🟢 Completed   | 100% |
| #5 Arena & challenges       | 🔴 Not Started | 0%   |
| #6 Submission & Smart Proof | 🔴 Not Started | 0%   |
| #7 Finisher Card            | 🔴 Not Started | 0%   |
| #8 Profile                  | 🔴 Not Started | 0%   |
| #9 Navigation & layout      | 🔴 Not Started | 0%   |
| #10 Polish & deployment     | 🔴 Not Started | 0%   |

**Overall MVP:** ~25% (foundation done, auth + onboarding largely done, rest to do).

---

**Last updated:** May 2026  
**Next review:** On each progress update

**Critical path:** #0 ✅ → #1 → #2 (i18n + theme) → #3 → #4 → #5 → #6 → #7 → #8 → #9 → #10.
