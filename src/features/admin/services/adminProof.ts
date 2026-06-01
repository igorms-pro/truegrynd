import { supabase } from '@/lib/supabase';
import type { ProofLevel } from '@/lib/types/database.types';

export type AdminReportedScore = {
  reportId: string;
  reportReason: string;
  reportCreatedAt: string;
  scoreId: string;
  challengeId: string;
  challengeTitle: string;
  userId: string;
  username: string;
  value: number;
  proofLevel: ProofLevel;
  videoUrl: string | null;
  submittedAt: string;
};

type Row = {
  report_id: string;
  report_reason: string;
  report_created_at: string;
  score_id: string;
  challenge_id: string;
  challenge_title: string;
  user_id: string;
  username: string;
  value: number;
  proof_level: ProofLevel;
  video_url: string | null;
  submitted_at: string;
};

export async function listAdminReportedScores(limit = 30): Promise<AdminReportedScore[]> {
  const { data, error } = await supabase.rpc('admin_list_reported_scores', { p_limit: limit });
  if (error) throw new Error(error.message);

  return ((data ?? []) as Row[]).map((row) => ({
    reportId: row.report_id,
    reportReason: row.report_reason,
    reportCreatedAt: row.report_created_at,
    scoreId: row.score_id,
    challengeId: row.challenge_id,
    challengeTitle: row.challenge_title,
    userId: row.user_id,
    username: row.username,
    value: Number(row.value),
    proofLevel: row.proof_level,
    videoUrl: row.video_url,
    submittedAt: row.submitted_at,
  }));
}

export async function adminSetScoreProofLevel(
  scoreId: string,
  proofLevel: ProofLevel,
  note?: string,
): Promise<void> {
  const { error } = await supabase.rpc('admin_set_score_proof_level', {
    p_score_id: scoreId,
    p_proof_level: proofLevel,
    p_note: note ?? null,
  });
  if (error) throw new Error(error.message);
}
