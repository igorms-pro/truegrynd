import { supabase } from '@/lib/supabase';

/** An aggregated gym lead (platform admin view). */
export type GymLead = {
  normalized: string;
  gymName: string;
  city: string | null;
  requestCount: number;
  firstRequested: string;
  lastRequested: string;
};

export async function submitGymRequest(input: { gymName: string; city: string }): Promise<void> {
  const { error } = await supabase.rpc('submit_gym_request', {
    p_gym_name: input.gymName,
    p_city: input.city,
  });
  if (error) throw new Error(error.message);
}

export async function listGymLeads(): Promise<GymLead[]> {
  const { data, error } = await supabase.rpc('gym_request_leads');
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as Array<{
      normalized: string;
      gym_name: string;
      city: string | null;
      request_count: number;
      first_requested: string;
      last_requested: string;
    }>
  ).map((r) => ({
    normalized: r.normalized,
    gymName: r.gym_name,
    city: r.city,
    requestCount: Number(r.request_count ?? 0),
    firstRequested: r.first_requested,
    lastRequested: r.last_requested,
  }));
}
