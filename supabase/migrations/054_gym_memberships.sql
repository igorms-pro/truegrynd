-- V4-05 (#171): the gym's own membership plans & passes, assigned to members. v1 is
-- DECLARATIVE (tracking who's on what plan) — real collection arrives with V4-06 (Stripe
-- Connect), which will drive gym_member_plans.status from webhooks. Multi-tenant as usual.

CREATE TABLE IF NOT EXISTS public.gym_membership_plans (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL CHECK (length(btrim(name)) > 0),
  kind          TEXT        NOT NULL DEFAULT 'unlimited' CHECK (kind IN ('unlimited', 'credits', 'dropin')),
  price_cents   INT         NULL CHECK (price_cents IS NULL OR price_cents >= 0),
  currency      TEXT        NOT NULL DEFAULT 'EUR',
  credits       INT         NULL CHECK (credits IS NULL OR credits BETWEEN 1 AND 1000),
  validity_days INT         NULL CHECK (validity_days IS NULL OR validity_days BETWEEN 1 AND 730),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gym_membership_plans IS
  'V4-05: a gym''s own offers (unlimited monthly, 10-pack, drop-in…). Collection via Stripe Connect = V4-06.';

CREATE INDEX IF NOT EXISTS idx_gym_membership_plans_gym ON public.gym_membership_plans (gym_id, is_active);

CREATE TABLE IF NOT EXISTS public.gym_member_plans (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id       UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_id      UUID        NOT NULL REFERENCES public.gym_membership_plans(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  credits_left INT         NULL,
  started_at   DATE        NOT NULL DEFAULT CURRENT_DATE,
  expires_at   DATE        NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gym_member_plans IS
  'V4-05: a member''s assigned plan. One active plan per member (partial unique index).';

CREATE UNIQUE INDEX IF NOT EXISTS uq_gym_member_plans_active
  ON public.gym_member_plans (user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_gym_member_plans_gym ON public.gym_member_plans (gym_id, status);

ALTER TABLE public.gym_membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_member_plans ENABLE ROW LEVEL SECURITY;

-- Plans: readable by the gym's people; managed by gym_admin / owner / platform admin.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_membership_plans' AND policyname='Gym people can read plans') THEN
    CREATE POLICY "Gym people can read plans"
      ON public.gym_membership_plans FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_membership_plans.gym_id)
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_membership_plans.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_membership_plans' AND policyname='Gym managers can manage plans') THEN
    CREATE POLICY "Gym managers can manage plans"
      ON public.gym_membership_plans FOR ALL TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_membership_plans.gym_id AND p.role = 'gym_admin')
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_membership_plans.gym_id AND g.owner_id = auth.uid())
      )
      WITH CHECK (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_membership_plans.gym_id AND p.role = 'gym_admin')
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_membership_plans.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
END $$;

-- Member plans: a member reads their own; managers read/manage the gym's.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_member_plans' AND policyname='Own plan or gym managers') THEN
    CREATE POLICY "Own plan or gym managers"
      ON public.gym_member_plans FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_member_plans.gym_id AND p.role IN ('coach', 'gym_admin'))
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_member_plans.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_member_plans' AND policyname='Gym managers can manage member plans') THEN
    CREATE POLICY "Gym managers can manage member plans"
      ON public.gym_member_plans FOR ALL TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_member_plans.gym_id AND p.role = 'gym_admin')
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_member_plans.gym_id AND g.owner_id = auth.uid())
      )
      WITH CHECK (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_member_plans.gym_id AND p.role = 'gym_admin')
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_member_plans.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
END $$;
