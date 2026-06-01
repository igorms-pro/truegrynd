import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { supabase } from '@/lib/supabase';
import type { Challenge, ChallengeVariant } from '@/lib/types/database.types';

type ChallengeRow = Challenge & {
  challenge_variants: { variant: ChallengeVariant }[] | null;
};

function mapChallengeRow(row: ChallengeRow): Challenge {
  const { challenge_variants, ...challenge } = row;
  const variants = (challenge_variants ?? []).map((v) => v.variant);
  return { ...challenge, variants };
}

/** Uses RLS: approved challenges for everyone; pending/rejected visible only to creator. */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(`${CHALLENGE_SELECT}, challenge_variants(variant)`)
    .eq('id', id)
    .maybeSingle<ChallengeRow>();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapChallengeRow(data);
}

export async function listChallengeVariants(challengeId: string): Promise<ChallengeVariant[]> {
  const { data, error } = await supabase
    .from('challenge_variants')
    .select('variant')
    .eq('challenge_id', challengeId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.variant as ChallengeVariant);
}
