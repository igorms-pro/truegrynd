import { supabase } from '@/lib/supabase';
import type { ProfileRating } from '@/lib/rating';

const RATING_SELECT =
  'user_id,rating_global,rating_engine,rating_power,rating_strength,rating_grit,rating_consistency,validated_score_count,computed_at';

type Row = {
  user_id: string;
  rating_global: number;
  rating_engine: number;
  rating_power: number;
  rating_strength: number;
  rating_grit: number;
  rating_consistency: number;
  validated_score_count: number;
  computed_at: string;
};

function mapRow(row: Row): ProfileRating {
  return {
    userId: row.user_id,
    global: Number(row.rating_global),
    engine: Number(row.rating_engine),
    power: Number(row.rating_power),
    strength: Number(row.rating_strength),
    grit: Number(row.rating_grit),
    consistency: Number(row.rating_consistency),
    validatedScoreCount: row.validated_score_count,
    computedAt: row.computed_at,
  };
}

export async function fetchProfileRating(userId: string): Promise<ProfileRating | null> {
  const { data, error } = await supabase
    .from('profile_ratings')
    .select(RATING_SELECT)
    .eq('user_id', userId)
    .maybeSingle<Row>();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}
