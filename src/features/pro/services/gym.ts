import { supabase } from '@/lib/supabase';

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
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('no_session');
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!baseUrl || !anonKey) {
    throw new Error('server_misconfigured');
  }

  const res = await fetch(`${baseUrl}/functions/v1/create-gym`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ siret: input.siret }),
  });

  const parsed = (await res.json().catch(() => ({}))) as { code?: string; gym?: CreatedGym };
  if (!res.ok || !parsed.gym) {
    throw new Error(parsed.code ?? `http_${res.status}`);
  }
  return parsed.gym;
}
