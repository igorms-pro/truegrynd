-- Reports: users can flag scores, challenges, or profiles for review.
-- Admin queue for reports is deferred to phase 2 (uses same admin infra as challenge moderation).

CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT        NOT NULL CHECK (target_type IN ('score', 'challenge', 'profile')),
  target_id   UUID        NOT NULL,
  reporter_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL CHECK (length(trim(reason)) >= 5 AND length(reason) <= 1000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reports_unique_per_target UNIQUE (target_type, target_id, reporter_id)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

COMMENT ON TABLE public.reports IS 'User-submitted reports (flag for review). One per (target, reporter).';

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can read all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.is_app_admin());
