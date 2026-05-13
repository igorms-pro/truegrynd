import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import {
  buildChallengeReviewUserPayload,
  callOpenAiChallengeReview,
} from '@/features/admin/server/openAiChallengeReview';

export const maxDuration = 60;

function createUserSupabase(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('supabase_env_missing');
  }
  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ challengeId: string }> },
): Promise<Response> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return NextResponse.json({ code: 'unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ code: 'ai_unconfigured' }, { status: 503 });
  }

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  let supabase;
  try {
    supabase = createUserSupabase(token);
  } catch {
    return NextResponse.json({ code: 'server_misconfigured' }, { status: 500 });
  }

  const { data: adminFlag, error: adminErr } = await supabase.rpc('is_app_admin');
  if (adminErr || adminFlag !== true) {
    return NextResponse.json({ code: 'forbidden' }, { status: 403 });
  }

  const { challengeId } = await context.params;

  const { data: row, error: fetchErr } = await supabase
    .from('challenges')
    .select('id,title,description,rules,score_type,status')
    .eq('id', challengeId)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ code: 'not_found' }, { status: 404 });
  }

  if (row.status !== 'pending') {
    return NextResponse.json({ code: 'not_pending' }, { status: 400 });
  }

  const userPayload = buildChallengeReviewUserPayload({
    title: row.title,
    description: row.description,
    rules: row.rules,
    scoreType: row.score_type,
  });

  let review: { tier: string; summary: string; model: string };
  try {
    review = await callOpenAiChallengeReview({
      apiKey,
      model,
      userPayload,
    });
  } catch {
    return NextResponse.json({ code: 'ai_failed' }, { status: 502 });
  }

  const { error: rpcErr } = await supabase.rpc('admin_apply_challenge_ai_review', {
    p_challenge_id: challengeId,
    p_tier: review.tier,
    p_summary: review.summary,
    p_model: review.model,
  });

  if (rpcErr) {
    return NextResponse.json({ code: 'persist_failed', message: rpcErr.message }, { status: 400 });
  }

  return NextResponse.json({
    tier: review.tier,
    summary: review.summary,
    model: review.model,
  });
}
