-- Seed: Official challenges for Truegrynd MVP
-- Run after migrations: supabase db reset (local) or paste in Supabase SQL editor.
-- All challenges are is_official=true, status='approved', creator_id=NULL.
-- score_type 'time' = lower is better (seconds); 'reps' = higher is better.

INSERT INTO public.challenges (
  title,
  description,
  rules,
  score_type,
  equipment_tags,
  is_official,
  status,
  creator_id
) VALUES

-- ── TIME CHALLENGES (lower is better) ────────────────────────────────────────

(
  '50 Burpees',
  'Complete 50 burpees as fast as possible. No rest, full movement required.',
  'Each rep: feet jump behind hands at bottom, chest touches floor, full hip extension at top, jump with hands overhead. No scaling allowed. Record time in seconds.',
  'time',
  '{}',
  TRUE, 'approved', NULL
),

(
  '100 Squats',
  'Complete 100 air squats as fast as possible.',
  'Full depth: hip crease below knee at bottom, full knee and hip lockout at top. Hands may stay in front of chest or overhead. Record time in seconds.',
  'time',
  '{}',
  TRUE, 'approved', NULL
),

(
  '1km Run',
  'Run 1 kilometer as fast as possible.',
  'Any surface: track, road, or treadmill. GPS watch, phone, or treadmill readout. No pauses. Record time in seconds.',
  'time',
  '{}',
  TRUE, 'approved', NULL
),

(
  '200m Sprint',
  '200 meters, dead sprint. One shot.',
  'Standing start. Straight 200m or one bend on a standard track. GPS or stopwatch. No false starts. Record time in seconds.',
  'time',
  '{}',
  TRUE, 'approved', NULL
),

-- ── REPS CHALLENGES (higher is better) ───────────────────────────────────────

(
  'Max Push-Ups (1 min)',
  'Max push-ups in 60 seconds.',
  'Full range of motion: chest touches floor, elbows fully extended at top. No resting on the floor. Knees must stay off ground. Count reps completed in exactly 60 seconds.',
  'reps',
  '{}',
  TRUE, 'approved', NULL
),

(
  'Max Pull-Ups',
  'Max unbroken pull-ups without dropping from the bar.',
  'Dead hang start, chin clearly above bar at top, full lockout at bottom. Kipping allowed but must be declared in video. Stop counting when you drop. No re-gripping from a rest on the bar.',
  'reps',
  ARRAY['pull-up bar'],
  TRUE, 'approved', NULL
),

(
  'Max Kettlebell Swings (1 min)',
  'Max two-handed kettlebell swings in 60 seconds.',
  'Minimum 24kg for men, 16kg for women. Russian (eye level) or American (overhead) — declare your style in the video. Hip-driven, straight arms at top. Declare kettlebell weight in submission.',
  'reps',
  ARRAY['kettlebell'],
  TRUE, 'approved', NULL
),

(
  'Max Sit-Ups (2 min)',
  'Max sit-ups in 2 minutes. Core only, no anchoring.',
  'Feet flat on floor, unanchored. Full sit-up: shoulder blades touch floor at bottom, elbows touch knees at top. No bouncing off the ground. Count reps in exactly 120 seconds.',
  'reps',
  '{}',
  TRUE, 'approved', NULL
);
