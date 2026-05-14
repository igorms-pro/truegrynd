import { supabase } from '@/lib/supabase';
import type { Challenge, ScoreType } from '@/lib/types/database.types';

const CHALLENGE_SELECT =
  'id,title,description,rules,score_type,equipment_tags,is_official,status,creator_id,max_duration_seconds,rejection_reason,reviewed_at,reviewed_by,created_at';

export async function listApprovedChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}

export async function getApprovedChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .eq('id', id)
    .maybeSingle<Challenge>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

/** Uses RLS: approved challenges for everyone; pending/rejected visible only to creator. */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('id', id)
    .maybeSingle<Challenge>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function createPendingChallenge(input: {
  creatorId: string;
  title: string;
  description: string;
  rules: string;
  scoreType: ScoreType;
  equipmentTags: string[];
  maxDurationSeconds: number | null;
}): Promise<Challenge> {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      rules: input.rules.trim(),
      score_type: input.scoreType,
      equipment_tags: input.equipmentTags,
      is_official: false,
      creator_id: input.creatorId,
      max_duration_seconds: input.maxDurationSeconds,
    })
    .select(CHALLENGE_SELECT)
    .maybeSingle<Challenge>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('challenge_create_failed');
  return data;
}
