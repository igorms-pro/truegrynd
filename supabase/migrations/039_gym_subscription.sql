-- V3-08 slice 1: gym subscription state (Stripe). The webhook (service role) writes these
-- columns; the app reads them for billing status + soft gating. Default 'trialing' so existing
-- gyms are never locked out during the pilot. Additive & non-breaking.

ALTER TABLE public.gyms
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT        NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT        NULL,
  ADD COLUMN IF NOT EXISTS subscription_status    TEXT        NOT NULL DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'none')),
  ADD COLUMN IF NOT EXISTS current_period_end     TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.gyms.subscription_status IS
  'V3-08: Stripe subscription state. trialing/active = PRO features unlocked. Webhook-managed.';

CREATE INDEX IF NOT EXISTS idx_gyms_stripe_customer
  ON public.gyms (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Billing status for the caller's gym (owner or affiliated staff).
CREATE OR REPLACE FUNCTION public.gym_billing_status()
RETURNS TABLE (
  gym_id              uuid,
  gym_name            text,
  subscription_status text,
  current_period_end  timestamptz,
  is_active           boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name, g.subscription_status, g.current_period_end,
         (g.subscription_status IN ('trialing', 'active'))
  FROM public.gyms g
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE g.id = p.affiliated_gym_id OR g.owner_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.gym_billing_status() TO authenticated;
