// V4-09: batch-invite imported members. Staff-only. For every 'pending' import row of the
// caller's gym: if the email already has an account → affiliate that profile directly and
// flip the row to 'joined'; otherwise send a Supabase invite email (magic link) and flip it
// to 'invited'. Auto-affiliation at signup is handled by the DB trigger (migration 056).

import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const BATCH_CAP = 50;

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

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // Caller must be staff (coach/gym_admin), the gym owner, or a platform admin — and affiliated.
  const { data: caller } = await service
    .from('profiles')
    .select('affiliated_gym_id, role, is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const gymId = caller?.affiliated_gym_id as string | null;
  if (!gymId) {
    return jsonResponse({ code: 'no_gym' }, 400);
  }
  const isStaff = caller?.role === 'coach' || caller?.role === 'gym_admin';
  const isAdmin = caller?.role === 'platform_admin' || caller?.is_admin === true;
  let isOwner = false;
  if (!isStaff && !isAdmin) {
    const { data: gym } = await service
      .from('gyms')
      .select('owner_id')
      .eq('id', gymId)
      .maybeSingle();
    isOwner = gym?.owner_id === user.id;
  }
  if (!isStaff && !isAdmin && !isOwner) {
    return jsonResponse({ code: 'not_gym_staff' }, 403);
  }

  const { data: pending, error: pendingErr } = await service
    .from('gym_member_imports')
    .select('id, email')
    .eq('gym_id', gymId)
    .eq('status', 'pending')
    .limit(BATCH_CAP);
  if (pendingErr) {
    return jsonResponse({ code: 'db_error' }, 500);
  }
  if (!pending || pending.length === 0) {
    return jsonResponse({ invited: 0, joined: 0, failed: 0 });
  }

  let invited = 0;
  let joined = 0;
  let failed = 0;

  for (const row of pending) {
    const email = String(row.email).trim().toLowerCase();

    // Already has an account? Affiliate directly — no email needed.
    const { data: existing } = await service.rpc('get_user_id_by_email', { p_email: email });
    const existingId = (existing as string | null) ?? null;

    if (existingId) {
      await service.from('profiles').update({ affiliated_gym_id: gymId }).eq('id', existingId);
      await service
        .from('gym_member_imports')
        .update({ status: 'joined', joined_user_id: existingId })
        .eq('id', row.id);
      joined += 1;
      continue;
    }

    const { error: inviteErr } = await service.auth.admin.inviteUserByEmail(email);
    if (inviteErr) {
      failed += 1;
      continue;
    }
    await service
      .from('gym_member_imports')
      .update({ status: 'invited', invited_at: new Date().toISOString() })
      .eq('id', row.id);
    invited += 1;
  }

  return jsonResponse({ invited, joined, failed });
});
