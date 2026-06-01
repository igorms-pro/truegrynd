-- Hotfix: migration 024 GRANT typo — get_event_challenge_standings 2nd arg is uuid, not text.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    INNER JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'get_event_challenge_standings'
      AND pg_get_function_identity_arguments(p.oid) = 'p_event_id uuid, p_challenge_id uuid, p_division text, p_limit integer'
  ) THEN
    REVOKE ALL ON FUNCTION public.get_event_challenge_standings(UUID, UUID, TEXT, INT) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.get_event_challenge_standings(UUID, UUID, TEXT, INT) TO authenticated;
  END IF;
END $$;
