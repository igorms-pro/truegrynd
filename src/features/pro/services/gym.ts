import { callEdgeFunction } from '@/lib/edgeFunction';
import { supabase } from '@/lib/supabase';

/** The caller's gym (name for the PRO shell). Null if unaffiliated. */
export async function getMyGym(): Promise<{ id: string; name: string } | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('affiliated_gym_id')
    .eq('id', auth.user.id)
    .maybeSingle<{ affiliated_gym_id: string | null }>();
  if (!profile?.affiliated_gym_id) return null;
  const { data, error } = await supabase
    .from('gyms')
    .select('id, name')
    .eq('id', profile.affiliated_gym_id)
    .maybeSingle<{ id: string; name: string }>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

/** A gym just created via KYB verification. */
export type CreatedGym = {
  id: string;
  name: string;
  slug: string;
  siren: string | null;
  legal_name: string | null;
  city: string | null;
};

/**
 * Claim/create a gym from a SIREN/SIRET. The `create-gym` Edge Function verifies the legal
 * entity against the public business registry, then provisions the gym and promotes the
 * caller to gym_admin. Throws with the server `code` (e.g. `company_not_found`) on failure.
 */
export async function createGym(input: { siret: string }): Promise<CreatedGym> {
  const parsed = await callEdgeFunction<{ gym?: CreatedGym }>('create-gym', { siret: input.siret });
  if (!parsed.gym) throw new Error('gym_create_failed');
  return parsed.gym;
}
