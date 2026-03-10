-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for all tables
-- Dependencies: 001_initial_schema.sql

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Convenience: is the current user the admin (service role)?
-- Used to gate challenge write access without a full admin table in MVP.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', TRUE)::jsonb->>'role' = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin IS 'True when called with service_role JWT (admin context). False for anon/authenticated.';

-- ============================================================================
-- PROFILES POLICIES
-- Any authenticated user can read any profile (needed for leaderboard usernames).
-- Users can only insert/update their own row.
-- ============================================================================

CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CHALLENGES POLICIES
-- Authenticated users can read approved challenges.
-- Write access is service_role only in MVP (challenges are seeded or admin-inserted).
-- ============================================================================

CREATE POLICY "Authenticated users can read approved challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- Creators can submit UGC challenges (pending review) — post-MVP field, kept for forward compat.
CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id AND is_official = FALSE);

-- Only the challenge creator can update their own pending challenge.
CREATE POLICY "Creators can update own pending challenge"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id AND status = 'pending')
  WITH CHECK (auth.uid() = creator_id AND status = 'pending');

-- ============================================================================
-- SCORES POLICIES
-- Authenticated users can read all validated scores (global leaderboard).
-- Users can also read their own unvalidated scores.
-- Users can only insert their own scores.
-- Scores are immutable once submitted (no UPDATE/DELETE in MVP).
-- ============================================================================

CREATE POLICY "Authenticated users can read validated scores"
  ON public.scores FOR SELECT
  TO authenticated
  USING (is_validated = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.is_admin IS 'Returns true when the current request uses the service_role JWT.';
