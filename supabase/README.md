# Supabase (local + production)

This folder contains SQL migrations and seed data for the Truegrynd MVP.

## Contents

- `migrations/001_initial_schema.sql`: core tables + triggers (`profiles`, `challenges`, `scores`)
- `migrations/002_rls_policies.sql`: RLS policies for MVP
- `migrations/003_realtime.sql`: enable Realtime publication for `scores`
- `migrations/004_score_respects.sql`: optional 👊 “respect” table (post-MVP)
- `seed.sql`: seed official challenges (approved)

## Applying schema

### Local (Supabase CLI)

1. Start Supabase locally (if you use the CLI):

```bash
supabase start
```

2. Apply migrations + seed:

```bash
supabase db reset
```

### Production (Supabase dashboard)

- Run the migration SQL files in order (001 → 004) in the Supabase SQL editor.
- Then run `seed.sql`.

## Notes

- The `profiles` row is auto-created via a trigger on `auth.users` insert.
- `scores.value` is stored as `NUMERIC`: seconds for `time`, integer reps for `reps`.
