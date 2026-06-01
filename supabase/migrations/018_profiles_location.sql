-- V2-04: optional user-declared location for leaderboard filters (no geolocation).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT NULL
    CHECK (city IS NULL OR (char_length(trim(city)) >= 2 AND char_length(trim(city)) <= 64)),
  ADD COLUMN IF NOT EXISTS country_code CHAR(2) NULL
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  ADD COLUMN IF NOT EXISTS show_location_on_leaderboard BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.city IS
  'Optional home city for local leaderboard filters. User-declared in settings, not geolocated.';
COMMENT ON COLUMN public.profiles.country_code IS
  'Optional ISO 3166-1 alpha-2 country for national leaderboard filters.';
COMMENT ON COLUMN public.profiles.show_location_on_leaderboard IS
  'When false (default), city is used for filters only — not shown on public leaderboard rows.';

CREATE INDEX IF NOT EXISTS idx_profiles_country_code
  ON public.profiles(country_code)
  WHERE country_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_city_normalized
  ON public.profiles(lower(trim(city)))
  WHERE city IS NOT NULL;
