import { supabase } from '@/lib/supabase';

export type RiskLevel = 'high' | 'watch';

/** A member who used to train and has gone quiet (see `gym_at_risk_members` / V4-04). */
export type AtRiskMember = {
  userId: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  email: string | null;
  lastActivityAt: string | null;
  daysInactive: number;
  prevScores: number;
  risk: RiskLevel;
};

type Row = {
  user_id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  email: string | null;
  last_activity_at: string | null;
  days_inactive: number;
  prev_scores: number;
  risk: RiskLevel;
};

export async function listAtRiskMembers(): Promise<AtRiskMember[]> {
  const { data, error } = await supabase.rpc('gym_at_risk_members');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((r) => ({
    userId: r.user_id,
    username: r.username,
    division: r.division,
    faction: r.faction,
    email: r.email,
    lastActivityAt: r.last_activity_at,
    daysInactive: Number(r.days_inactive ?? 0),
    prevScores: Number(r.prev_scores ?? 0),
    risk: r.risk,
  }));
}
