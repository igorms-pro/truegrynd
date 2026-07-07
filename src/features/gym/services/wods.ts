import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';

/** The programmed WOD of one day (see `gym_wods` / V4-03). */
export type GymWod = {
  wodDate: string;
  challengeId: string;
  title: string;
  workout: string;
  scoreType: ScoreType;
};

type Row = {
  wod_date: string;
  challenge_id: string;
  title: string;
  workout: string;
  score_type: ScoreType;
};

/** WODs of one week for the caller's gym, keyed by ISO date. */
export async function getWeekWods(monday: string): Promise<Map<string, GymWod>> {
  const { data, error } = await supabase.rpc('week_wods', { p_monday: monday });
  if (error) throw new Error(error.message);
  const map = new Map<string, GymWod>();
  for (const r of (data ?? []) as Row[]) {
    map.set(r.wod_date, {
      wodDate: r.wod_date,
      challengeId: r.challenge_id,
      title: r.title,
      workout: r.workout,
      scoreType: r.score_type,
    });
  }
  return map;
}

/** Program (or reprogram) the WOD of a day for the caller's gym. Staff-only server-side. */
export async function programGymWod(input: {
  wodDate: string;
  title: string;
  workout: string;
  scoreType: ScoreType;
}): Promise<void> {
  const { error } = await supabase.rpc('program_gym_wod', {
    p_wod_date: input.wodDate,
    p_title: input.title,
    p_workout: input.workout,
    p_score_type: input.scoreType,
  });
  if (error) throw new Error(error.message);
}
