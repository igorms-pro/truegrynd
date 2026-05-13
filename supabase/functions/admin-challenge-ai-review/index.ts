import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

const MAX_FIELD_CHARS = 8000;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function buildUserPayload(input: {
  title: string;
  description: string;
  rules: string;
  scoreType: string;
}): string {
  return [
    'Challenge submission for moderation triage.',
    `title: ${truncate(input.title, MAX_FIELD_CHARS)}`,
    `description: ${truncate(input.description, MAX_FIELD_CHARS)}`,
    `rules: ${truncate(input.rules, MAX_FIELD_CHARS)}`,
    `score_type: ${input.scoreType}`,
  ].join('\n');
}

function parseAiReview(obj: unknown): { tier: string; summary: string } {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('bad_shape');
  }
  const o = obj as Record<string, unknown>;
  const tier = o.tier;
  const summary = o.summary;
  if (tier !== 'green' && tier !== 'orange' && tier !== 'red') {
    throw new Error('bad_tier');
  }
  if (typeof summary !== 'string' || summary.trim().length < 1 || summary.length > 500) {
    throw new Error('bad_summary');
  }
  return { tier, summary: summary.trim() };
}

async function callOpenAi(args: {
  apiKey: string;
  model: string;
  userPayload: string;
}): Promise<{ tier: string; summary: string; model: string }> {
  const system =
    'You triage user-submitted fitness challenges for human moderators. ' +
    'Respond with JSON only: {"tier":"green"|"orange"|"red","summary":"..."}. ' +
    'green = clearly legitimate, standard movements, safe wording. ' +
    'orange = ambiguous, thin rules, possible edge cases, or needs human judgment. ' +
    'red = unsafe, spam, hate, sexual content, extreme risk, or non-fitness. ' +
    'summary: max 400 characters, English, no PII, no usernames.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: args.userPayload },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`openai_http_${res.status}:${errText.slice(0, 120)}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const raw = body.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('openai_empty_content');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('openai_invalid_json');
  }

  const validated = parseAiReview(parsed);
  return {
    tier: validated.tier,
    summary: validated.summary,
    model: args.model,
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
  const openaiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
  const model = Deno.env.get('OPENAI_MODEL')?.trim() || 'gpt-4o-mini';

  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ code: 'server_misconfigured' }, 500);
  }

  if (!openaiKey) {
    return jsonResponse({ code: 'ai_unconfigured' }, 503);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ code: 'unauthorized' }, 401);
  }

  let body: { challenge_id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ code: 'bad_request' }, 400);
  }

  const challengeId = body.challenge_id?.trim();
  if (!challengeId) {
    return jsonResponse({ code: 'bad_request' }, 400);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: adminFlag, error: adminErr } = await supabase.rpc('is_app_admin');
  if (adminErr || adminFlag !== true) {
    return jsonResponse({ code: 'forbidden' }, 403);
  }

  const { data: row, error: fetchErr } = await supabase
    .from('challenges')
    .select('id,title,description,rules,score_type,status')
    .eq('id', challengeId)
    .maybeSingle();

  if (fetchErr || !row) {
    return jsonResponse({ code: 'not_found' }, 404);
  }

  if (row.status !== 'pending') {
    return jsonResponse({ code: 'not_pending' }, 400);
  }

  const userPayload = buildUserPayload({
    title: row.title,
    description: row.description,
    rules: row.rules,
    scoreType: row.score_type,
  });

  let review: { tier: string; summary: string; model: string };
  try {
    review = await callOpenAi({
      apiKey: openaiKey,
      model,
      userPayload,
    });
  } catch {
    return jsonResponse({ code: 'ai_failed' }, 502);
  }

  const { error: rpcErr } = await supabase.rpc('admin_apply_challenge_ai_review', {
    p_challenge_id: challengeId,
    p_tier: review.tier,
    p_summary: review.summary,
    p_model: review.model,
  });

  if (rpcErr) {
    return jsonResponse({ code: 'persist_failed', message: rpcErr.message }, 400);
  }

  return jsonResponse({
    tier: review.tier,
    summary: review.summary,
    model: review.model,
  });
});
