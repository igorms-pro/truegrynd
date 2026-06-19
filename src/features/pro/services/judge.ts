import { supabase } from '@/lib/supabase';
import type { ProofLevel, ScoreType } from '@/lib/types/database.types';

/** A score awaiting judge validation, scoped to the caller's gym (see `pending_verifications`). */
export type PendingVerification = {
  scoreId: string;
  value: number;
  videoUrl: string | null;
  proofLevel: ProofLevel;
  isValidated: boolean;
  submittedAt: string;
  athleteId: string;
  athleteUsername: string | null;
  athleteDivision: string | null;
  athleteFaction: string | null;
  athleteAvatarUrl: string | null;
  challengeId: string;
  challengeTitle: string;
  scoreType: ScoreType;
};

type Row = {
  score_id: string;
  value: number;
  video_url: string | null;
  proof_level: ProofLevel;
  is_validated: boolean;
  submitted_at: string;
  athlete_id: string;
  athlete_username: string | null;
  athlete_division: string | null;
  athlete_faction: string | null;
  athlete_avatar_url: string | null;
  challenge_id: string;
  challenge_title: string;
  score_type: ScoreType;
};

export async function listPendingVerifications(): Promise<PendingVerification[]> {
  const { data, error } = await supabase.rpc('pending_verifications');
  if (error) throw new Error(error.message);

  return ((data ?? []) as Row[]).map((row) => ({
    scoreId: row.score_id,
    value: Number(row.value),
    videoUrl: row.video_url,
    proofLevel: row.proof_level,
    isValidated: row.is_validated,
    submittedAt: row.submitted_at,
    athleteId: row.athlete_id,
    athleteUsername: row.athlete_username,
    athleteDivision: row.athlete_division,
    athleteFaction: row.athlete_faction,
    athleteAvatarUrl: row.athlete_avatar_url,
    challengeId: row.challenge_id,
    challengeTitle: row.challenge_title,
    scoreType: row.score_type,
  }));
}

export async function verifyScore(scoreId: string): Promise<void> {
  const { error } = await supabase.rpc('verify_score', { p_score_id: scoreId });
  if (error) throw new Error(error.message);
}
