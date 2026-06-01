-- V2-01: competitive divisions on profiles (default rookie for all users).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'rookie'
    CHECK (division IN ('rookie', 'regular', 'savage', 'elite'));

COMMENT ON COLUMN public.profiles.division IS
  'Competitive skill division. Default rookie at signup; promotion logic deferred to V2-05 Rating.';

UPDATE public.profiles
SET division = 'rookie'
WHERE division IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_division ON public.profiles(division);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, division)
  VALUES (NEW.id, 'rookie')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
