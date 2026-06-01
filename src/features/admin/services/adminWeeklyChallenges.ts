import { supabase } from '@/lib/supabase';
import type { WeeklyChallenge, WeeklyChallengeStatus } from '@/lib/types/database.types';

const WEEKLY_SELECT = 'id,challenge_id,starts_at,ends_at,status,week_label,created_at,updated_at';

export type AdminWeeklyRow = WeeklyChallenge & {
  challenge: { id: string; title: string; is_official: boolean } | null;
};

export async function listWeeklyChallengesForAdmin(): Promise<AdminWeeklyRow[]> {
  const { data, error } = await supabase
    .from('weekly_challenges')
    .select(`${WEEKLY_SELECT}, challenge:challenges(id,title,is_official)`)
    .order('starts_at', { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminWeeklyRow[];
}

export async function listApprovedChallengesForWeeklyPicker(): Promise<
  { id: string; title: string; is_official: boolean }[]
> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('challenges')
    .select('id,title,is_official')
    .eq('status', 'approved')
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order('is_official', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

type UpsertInput = {
  id?: string | null;
  challengeId: string;
  startsAt: string;
  endsAt: string;
  status: WeeklyChallengeStatus;
  weekLabel?: string | null;
};

export async function adminUpsertWeeklyChallenge(input: UpsertInput): Promise<string> {
  const { data, error } = await supabase.rpc('admin_upsert_weekly_challenge', {
    p_id: input.id ?? null,
    p_challenge_id: input.challengeId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_status: input.status,
    p_week_label: input.weekLabel ?? null,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
