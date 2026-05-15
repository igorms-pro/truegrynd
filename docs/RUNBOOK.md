# Truegrynd — Runbook

Internal operations reference for Supabase + Vercel.

---

## Promote a user to admin

Run in **Supabase SQL Editor** (Dashboard → SQL Editor):

```sql
UPDATE public.profiles SET is_admin = true WHERE id = '<user-uuid-from-auth.users>';
```

Verify:

```sql
SELECT id, username, is_admin FROM public.profiles WHERE is_admin = true;
```

---

## Rollback a migration

Supabase migrations are forward-only. To "undo" a migration:

1. Write a new migration that reverses the changes (e.g. `DROP TABLE`, `DROP FUNCTION`, `ALTER TABLE DROP COLUMN`).
2. Name it `NNN_rollback_<original>.sql`.
3. Test locally with `supabase db reset` before applying to production.

**Never** delete a migration file that has been applied to production.

---

## RLS review checklist

When adding or modifying RLS policies:

- [ ] Every table has `ENABLE ROW LEVEL SECURITY`
- [ ] No table is missing policies (default-deny when RLS is enabled)
- [ ] SELECT policies don't leak private data (e.g. other users' emails, rejected challenges to non-creators)
- [ ] INSERT policies check `auth.uid() = <owner_column>`
- [ ] UPDATE policies use both USING and WITH CHECK
- [ ] SECURITY DEFINER functions have `SET search_path = public`
- [ ] No `service_role` key in client-side code
- [ ] Test: unauthenticated user gets denied
- [ ] Test: non-admin user cannot run admin RPCs

---

## Rate limiting (approach)

V1 relies on Supabase built-in rate limits + UNIQUE constraints:

| Action             | Protection                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Score submission   | No duplicate `(challenge_id, user_id)` abuse — app allows multiple but DB/client can enforce |
| Challenge creation | Auth required; admin review gate prevents spam from reaching users                           |
| Respect            | UNIQUE `(score_id, user_id)` constraint                                                      |
| Reports            | UNIQUE `(target_type, target_id, reporter_id)` constraint                                    |
| Admin RPC          | `is_app_admin()` gate                                                                        |
| Creator score      | Daily cap of 10 in trigger                                                                   |

For V1.1+: consider Supabase Edge Functions with `x-ratelimit` headers or a Redis-based sliding window.

---

## Environment variables

| Variable                        | Where                          | Purpose                                       |
| ------------------------------- | ------------------------------ | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Client + Server                | Supabase project URL                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server                | Supabase anon key (RLS enforced)              |
| `NEXT_PUBLIC_SITE_URL`          | Client + Server                | Canonical site URL for OG/meta                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only                    | Admin operations — **never** expose to client |
| `OPENAI_API_KEY`                | Supabase Edge Function secrets | AI triage (admin-challenge-ai-review)         |
