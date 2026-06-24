import { callEdgeFunction } from '@/lib/edgeFunction';

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
