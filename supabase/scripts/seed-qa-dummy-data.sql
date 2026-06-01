-- QA dummy data: Clan HUD, Arena feed, UGC by igorms
-- Run in Supabase Dashboard → SQL Editor (postgres role).
--
-- Prerequisite: you have signed up and your profile username is `igorms`.
-- Safe to re-run: removes previous rows with the fixed QA UUIDs first.
--
-- Creates:
--   • 2 minimal official challenges (QA seed — no seed.sql needed)
--   • 8 dummy members (3 factions) — not meant for login
--   • 2 approved live UGC challenges by igorms
--   • 1 pending UGC by igorms
--   • Validated scores (with video URLs) for Clan + leaderboards

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Fixed IDs (do not reuse elsewhere) ───────────────────────────────────────

-- Dummy auth users / profiles
-- a0000001 … a0000008
-- Dummy UGC challenges
-- b0000001 pending, b0000002 + b0000003 approved live
-- Minimal official challenges (created if your DB has none)
-- c0000001 time, c0000002 reps

DO $$
DECLARE
  v_igorms_id UUID;
  v_official_time UUID;
  v_official_reps UUID;
  v_official_qa UUID[] := ARRAY[
    'c0000001-0000-4000-8000-000000000001'::uuid,
    'c0000002-0000-4000-8000-000000000002'::uuid
  ];
  v_dummy_users UUID[] := ARRAY[
    'a0000001-0000-4000-8000-000000000001'::uuid,
    'a0000002-0000-4000-8000-000000000002'::uuid,
    'a0000003-0000-4000-8000-000000000003'::uuid,
    'a0000004-0000-4000-8000-000000000004'::uuid,
    'a0000005-0000-4000-8000-000000000005'::uuid,
    'a0000006-0000-4000-8000-000000000006'::uuid,
    'a0000007-0000-4000-8000-000000000007'::uuid,
    'a0000008-0000-4000-8000-000000000008'::uuid
  ];
  v_dummy_challenges UUID[] := ARRAY[
    'b0000001-0000-4000-8000-000000000001'::uuid,
    'b0000002-0000-4000-8000-000000000002'::uuid,
    'b0000003-0000-4000-8000-000000000003'::uuid
  ];
  u UUID;
  c UUID;
BEGIN
  SELECT id INTO v_igorms_id
  FROM public.profiles
  WHERE lower(username) = 'igorms';

  IF v_igorms_id IS NULL THEN
    RAISE EXCEPTION 'Profile username igorms not found. Sign up first, then re-run.';
  END IF;

  -- Cleanup previous QA seed (order matters for FKs)
  DELETE FROM public.scores
  WHERE user_id = ANY (v_dummy_users)
     OR challenge_id = ANY (v_dummy_challenges)
     OR challenge_id = ANY (v_official_qa);

  DELETE FROM public.challenges
  WHERE id = ANY (v_dummy_challenges)
     OR id = ANY (v_official_qa);

  FOREACH u IN ARRAY v_dummy_users LOOP
    DELETE FROM public.profiles WHERE id = u;
    DELETE FROM auth.users WHERE id = u;
  END LOOP;

  -- Minimal official challenges (self-contained — no seed.sql required)
  INSERT INTO public.challenges (
    id,
    title,
    description,
    rules,
    score_type,
    equipment_tags,
    is_official,
    status,
    creator_id
  ) VALUES
  (
    v_official_qa[1],
    'QA Official — 50 Burpees',
    'Complete 50 burpees for time. QA seed challenge.',
    'Full burpee each rep. Record time in seconds.',
    'time',
    '{}',
    true,
    'approved',
    NULL
  ),
  (
    v_official_qa[2],
    'QA Official — Max Push-Ups (1 min)',
    'Max push-ups in 60 seconds. QA seed challenge.',
    'Chest to floor, full lockout at top. Count reps in 60 seconds.',
    'reps',
    '{}',
    true,
    'approved',
    NULL
  );

  v_official_time := v_official_qa[1];
  v_official_reps := v_official_qa[2];

  -- ── Dummy auth.users (display-only; password = dummy123 if you ever need login) ──

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
  )
  SELECT
    u.id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    u.email,
    crypt('dummy123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false
  FROM (
    VALUES
      (v_dummy_users[1], 'qa-nomad1@truegrynd.test'),
      (v_dummy_users[2], 'qa-nomad2@truegrynd.test'),
      (v_dummy_users[3], 'qa-horde1@truegrynd.test'),
      (v_dummy_users[4], 'qa-horde2@truegrynd.test'),
      (v_dummy_users[5], 'qa-horde3@truegrynd.test'),
      (v_dummy_users[6], 'qa-iron1@truegrynd.test'),
      (v_dummy_users[7], 'qa-iron2@truegrynd.test'),
      (v_dummy_users[8], 'qa-iron3@truegrynd.test')
  ) AS u(id, email);

  -- handle_new_user trigger created bare profiles — enrich them
  UPDATE public.profiles SET
    username = v.username,
    sex = v.sex,
    age = v.age,
    weight_kg = v.weight_kg,
    faction = v.faction,
    division = v.division,
    initiation_completed = true,
    updated_at = NOW()
  FROM (
    VALUES
      (v_dummy_users[1], 'nomad_runner', 'male',   26, 78.0, 'nomads',        'rookie'),
      (v_dummy_users[2], 'nomad_grit',   'female', 31, 62.0, 'nomads',        'regular'),
      (v_dummy_users[3], 'horde_alpha',  'male',   24, 85.0, 'horde',         'savage'),
      (v_dummy_users[4], 'horde_beast',  'male',   29, 92.0, 'horde',         'elite'),
      (v_dummy_users[5], 'horde_lynx',   'female', 22, 58.0, 'horde',         'rookie'),
      (v_dummy_users[6], 'iron_ghost',   'male',   35, 88.0, 'iron_alliance', 'regular'),
      (v_dummy_users[7], 'iron_plate',   'female', 27, 70.0, 'iron_alliance', 'savage'),
      (v_dummy_users[8], 'iron_maul',    'other',  33, 95.0, 'iron_alliance', 'elite')
  ) AS v(id, username, sex, age, weight_kg, faction, division)
  WHERE public.profiles.id = v.id;

  -- ── UGC challenges by igorms ───────────────────────────────────────────────

  INSERT INTO public.challenges (
    id,
    title,
    description,
    rules,
    score_type,
    equipment_tags,
    is_official,
    status,
    creator_id,
    max_duration_seconds,
    reviewed_at,
    reviewed_by,
    ends_at,
    created_at
  ) VALUES
  (
    v_dummy_challenges[1],
    'QA — Death by Burpees',
    'AMRAP burpees in 10 minutes. Community test challenge by igorms.',
    'Full burpee each rep: chest to floor, jump, hands overhead. Count total reps in 10:00.',
    'reps',
    '{}',
    false,
    'pending',
    v_igorms_id,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 days'
  ),
  (
    v_dummy_challenges[2],
    'QA — 400m Sandbag Carry',
    '400 meters for time with a sandbag on shoulder. UGC live in Arena.',
    'Men 50kg / women 35kg sandbag. One drop max. Record time in seconds.',
    'time',
    ARRAY['sandbag'],
    false,
    'approved',
    v_igorms_id,
    600,
    NOW() - INTERVAL '1 day',
    v_igorms_id,
    NULL,
    NOW() - INTERVAL '1 day'
  ),
  (
    v_dummy_challenges[3],
    'QA — Max Wall Balls (2 min)',
    'Max unbroken wall-ball shots in 2 minutes. UGC live in Arena.',
    '20/14 lb to 10 ft target. Full squat below parallel each rep. Count reps in 120 seconds.',
    'reps',
    ARRAY['wall ball'],
    false,
    'approved',
    v_igorms_id,
    NULL,
    NOW() - INTERVAL '12 hours',
    v_igorms_id,
    NULL,
    NOW() - INTERVAL '12 hours'
  );

  -- ── Validated scores (Clan counts only is_validated = true) ────────────────
  -- Horde leads faction war, then Nomads, then Iron Alliance.

  INSERT INTO public.scores (challenge_id, user_id, value, video_url, is_validated, submitted_at)
  VALUES
    -- Official time challenge
    (v_official_time, v_dummy_users[3], 420, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '6 hours'),
    (v_official_time, v_dummy_users[4], 395, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '5 hours'),
    (v_official_time, v_dummy_users[5], 410, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '4 hours'),
    (v_official_time, v_dummy_users[1], 450, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '3 hours'),
    (v_official_time, v_dummy_users[2], 465, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),
    (v_official_time, v_dummy_users[6], 480, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),
    (v_official_time, v_dummy_users[7], 505, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '1 hour'),
    (v_official_time, v_igorms_id,     430, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '30 minutes'),

    -- Official reps challenge
    (v_official_reps, v_dummy_users[3], 42, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '6 hours'),
    (v_official_reps, v_dummy_users[4], 38, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '5 hours'),
    (v_official_reps, v_dummy_users[5], 35, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '4 hours'),
    (v_official_reps, v_dummy_users[1], 28, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '3 hours'),
    (v_official_reps, v_dummy_users[2], 25, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),
    (v_official_reps, v_dummy_users[6], 22, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),
    (v_official_reps, v_dummy_users[8], 20, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '1 hour'),

    -- igorms UGC challenges (boost creator_score on igorms)
    (v_dummy_challenges[2], v_dummy_users[3], 95,  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '3 hours'),
    (v_dummy_challenges[2], v_dummy_users[4], 102, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),
    (v_dummy_challenges[2], v_dummy_users[1], 118, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '1 hour'),
    (v_dummy_challenges[3], v_dummy_users[3], 48,  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '4 hours'),
    (v_dummy_challenges[3], v_dummy_users[5], 41,  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '3 hours'),
    (v_dummy_challenges[3], v_dummy_users[6], 36,  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, NOW() - INTERVAL '2 hours'),

    -- One unvalidated score (should NOT appear in Clan)
    (v_official_reps, v_dummy_users[7], 99, NULL, false, NOW() - INTERVAL '30 minutes');

  RAISE NOTICE 'QA seed OK — igorms_id=%, official_time=%, official_reps=%',
    v_igorms_id, v_official_time, v_official_reps;
END $$;

-- Quick sanity check
SELECT
  p.faction,
  count(DISTINCT s.user_id) AS active_members,
  count(*) FILTER (WHERE s.is_validated) AS validated_scores,
  round(sum(s.value) FILTER (WHERE s.is_validated)) AS raw_points_sum
FROM public.scores s
JOIN public.profiles p ON p.id = s.user_id
WHERE s.user_id::text LIKE 'a000000%'
   OR s.challenge_id::text LIKE 'b000000%'
   OR s.challenge_id::text LIKE 'c000000%'
GROUP BY p.faction
ORDER BY raw_points_sum DESC NULLS LAST;

SELECT id, title, status, is_official, creator_id, ends_at
FROM public.challenges
WHERE id::text LIKE 'b000000%'
   OR id::text LIKE 'c000000%'
ORDER BY created_at;
