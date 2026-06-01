import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { getChallengeById as getChallengeByIdFromLib } from '@/lib/challenges/getChallengeById';
import { supabase } from '@/lib/supabase';
import type { Challenge, ScoreType } from '@/lib/types/database.types';

export { getChallengeByIdFromLib as getChallengeById };

export async function listMyPendingChallenges(): Promise<Challenge[]> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return [];

  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('creator_id', auth.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}

export { listApprovedChallenges } from '@/lib/challenges/listApprovedChallenges';

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

export async function createPendingChallenge(input: {
  creatorId: string;
  title: string;
  description: string;
  rules: string;
  scoreType: ScoreType;
  equipmentTags: string[];
  variants: import('@/lib/types/database.types').ChallengeVariant[];
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

  const { error: variantError } = await supabase.from('challenge_variants').insert(
    input.variants.map((variant) => ({
      challenge_id: data.id,
      variant,
    })),
  );
  if (variantError) throw new Error(variantError.message);

  return { ...data, variants: input.variants };
}
