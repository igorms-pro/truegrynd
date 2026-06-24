// V3-04: KYB-gated gym creation.
// Verifies a French SIREN/SIRET against the public business registry
// (recherche-entreprises.api.gouv.fr — free, no key), then provisions the gym and promotes
// the caller to gym_admin via the service-role-only RPC `create_verified_gym`.
// This Edge Function is the ONLY path that can persist a gym, so every gym is verified.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

const REGISTRY_URL = 'https://recherche-entreprises.api.gouv.fr/search';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type RegistrySiege = {
  siret?: string;
  etat_administratif?: string;
  activite_principale?: string;
  libelle_commune?: string;
};
type RegistryResult = {
  siren?: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  siege?: RegistrySiege;
};

/** Verified company identity, ready to persist. */
type VerifiedCompany = {
  siren: string;
  siret: string;
  legalName: string;
  naf: string | null;
  city: string | null;
};

/** Look up a company by SIREN (9) / SIRET (14) and confirm it is active. */
async function verifyCompany(
  digits: string,
): Promise<{ ok: true; company: VerifiedCompany } | { ok: false; code: string; status: number }> {
  const siren = digits.length === 14 ? digits.slice(0, 9) : digits;

  const url = `${REGISTRY_URL}?q=${encodeURIComponent(digits)}&page=1&per_page=1`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    return { ok: false, code: 'registry_unreachable', status: 502 };
  }
  if (!res.ok) {
    return { ok: false, code: 'registry_error', status: 502 };
  }

  const body = (await res.json().catch(() => null)) as { results?: RegistryResult[] } | null;
  const result = body?.results?.[0];
  if (!result || result.siren !== siren) {
    return { ok: false, code: 'company_not_found', status: 404 };
  }
  if (result.siege?.etat_administratif === 'C') {
    return { ok: false, code: 'company_closed', status: 422 };
  }

  const legalName = (result.nom_complet ?? result.nom_raison_sociale ?? '').trim();
  if (!legalName) {
    return { ok: false, code: 'company_not_found', status: 404 };
  }

  return {
    ok: true,
    company: {
      siren,
      siret: digits.length === 14 ? digits : (result.siege?.siret ?? ''),
      legalName,
      naf: result.siege?.activite_principale ?? null,
      city: result.siege?.libelle_commune ?? null,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ code: 'method_not_allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ code: 'server_misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ code: 'unauthorized' }, 401);
  }

  let body: { siret?: string; siren?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ code: 'bad_request' }, 400);
  }

  // Accept either a SIRET (14 digits) or a SIREN (9); strip spaces/dots the user may type.
  const digits = (body.siret ?? body.siren ?? '').replace(/\D/g, '');
  if (digits.length !== 9 && digits.length !== 14) {
    return jsonResponse({ code: 'invalid_siret' }, 400);
  }

  // Identify the caller from their JWT (they become the gym owner).
  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const {
    data: { user },
    error: userErr,
  } = await authed.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ code: 'unauthorized' }, 401);
  }

  const verified = await verifyCompany(digits);
  if (!verified.ok) {
    return jsonResponse({ code: verified.code }, verified.status);
  }
  const { company } = verified;

  // Service role: the RPC is service-role-only, so an unverified SIREN can never reach the DB.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: gym, error: rpcErr } = await admin.rpc('create_verified_gym', {
    p_owner: user.id,
    p_name: company.legalName,
    p_siren: company.siren,
    p_siret: company.siret,
    p_legal_name: company.legalName,
    p_naf: company.naf,
    p_city: company.city,
    p_country: 'FR',
  });

  if (rpcErr) {
    const code = rpcErr.message.includes('gym_already_claimed')
      ? 'gym_already_claimed'
      : 'create_failed';
    return jsonResponse({ code }, code === 'gym_already_claimed' ? 409 : 500);
  }

  return jsonResponse({ gym }, 201);
});
