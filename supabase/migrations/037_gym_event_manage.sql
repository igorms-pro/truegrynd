-- V3-05 slice 3: edit / cancel a gym event. Staff of the event's gym only (platform_admin
-- oversees all). Edit covers metadata + window (the WOD itself is immutable — cancel & recreate
-- to change movements). Window edits propagate to the backing challenge; cancel closes it so no
-- further scores land. Additive & non-breaking.

-- Shared guard: is the caller allowed to manage this event? Returns the backing challenge id.
CREATE OR REPLACE FUNCTION public.assert_can_manage_gym_event(p_event_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller    uuid := auth.uid();
  v_gym       uuid;
  v_challenge uuid;
  v_ok        boolean;
BEGIN
  SELECT gym_id, challenge_id INTO v_gym, v_challenge
  FROM public.gym_events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'event_not_found';
  END IF;

  SELECT public.is_platform_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = v_caller
          AND p.role IN ('coach', 'gym_admin')
          AND p.affiliated_gym_id = v_gym
      )
      OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = v_gym AND g.owner_id = v_caller)
    INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  RETURN v_challenge;
END;
$$;

-- Edit event metadata + window.
CREATE OR REPLACE FUNCTION public.update_gym_event(
  p_event_id    uuid,
  p_title       text,
  p_description text,
  p_starts_at   timestamptz,
  p_ends_at     timestamptz
)
RETURNS public.gym_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge uuid;
  v_event     public.gym_events;
BEGIN
  v_challenge := public.assert_can_manage_gym_event(p_event_id);

  IF p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'bad_window';
  END IF;

  UPDATE public.gym_events
  SET title = btrim(p_title),
      description = coalesce(p_description, ''),
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      updated_at = NOW()
  WHERE id = p_event_id
  RETURNING * INTO v_event;

  -- Keep the backing challenge title + close date in sync.
  IF v_challenge IS NOT NULL THEN
    UPDATE public.challenges
    SET title = btrim(p_title), ends_at = p_ends_at
    WHERE id = v_challenge;
  END IF;

  RETURN v_event;
END;
$$;

-- Cancel an event (soft): drops it from listings and closes the backing challenge to scores.
CREATE OR REPLACE FUNCTION public.cancel_gym_event(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge uuid;
BEGIN
  v_challenge := public.assert_can_manage_gym_event(p_event_id);

  UPDATE public.gym_events
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_event_id;

  IF v_challenge IS NOT NULL THEN
    UPDATE public.challenges SET ends_at = NOW() WHERE id = v_challenge;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_can_manage_gym_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gym_event(uuid, text, text, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_gym_event(uuid) TO authenticated;
