// V3-08: Stripe Checkout + Billing Portal for the gym subscription (100/mo).
// action 'checkout' → returns a hosted Checkout Session URL to start/resume the subscription.
// action 'portal'   → returns a Billing Portal URL to manage/cancel an existing subscription.
// The caller must be a gym_admin (or platform_admin) with a gym. The webhook flips the gym's
// subscription_status; this function only opens the hosted pages.

import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders } from './cors.ts';

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ code: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const priceId = Deno.env.get('STRIPE_PRICE_ID');
  if (!supabaseUrl || !anonKey || !serviceKey || !stripeKey || !priceId) {
    return json({ code: 'server_misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return json({ code: 'unauthorized' }, 401);

  let body: { action?: string; returnUrl?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ code: 'bad_request' }, 400);
  }
  const action = body.action === 'portal' ? 'portal' : 'checkout';
  const returnUrl = (body.returnUrl ?? '').trim();
  if (!returnUrl.startsWith('http')) return json({ code: 'bad_return_url' }, 400);

  // Identify the caller's gym (must be its manager).
  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) return json({ code: 'unauthorized' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: profile } = await admin
    .from('profiles')
    .select('role, is_admin, affiliated_gym_id')
    .eq('id', user.id)
    .maybeSingle();
  const isManager =
    profile?.role === 'gym_admin' || profile?.role === 'platform_admin' || profile?.is_admin;
  if (!isManager || !profile?.affiliated_gym_id) return json({ code: 'not_gym_admin' }, 403);

  const { data: gym } = await admin
    .from('gyms')
    .select('id, name, stripe_customer_id')
    .eq('id', profile.affiliated_gym_id)
    .maybeSingle();
  if (!gym) return json({ code: 'no_gym' }, 403);

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-09-30.clover' });

  // Ensure a Stripe customer exists for this gym.
  let customerId = gym.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: gym.name as string,
      metadata: { gym_id: gym.id as string },
    });
    customerId = customer.id;
    await admin.from('gyms').update({ stripe_customer_id: customerId }).eq('id', gym.id);
  }

  try {
    if (action === 'portal') {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return json({ url: portal.url });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: returnUrl,
      cancel_url: returnUrl,
      client_reference_id: gym.id as string,
      subscription_data: { metadata: { gym_id: gym.id as string } },
    });
    return json({ url: session.url ?? '' });
  } catch (e) {
    return json({ code: 'stripe_error', message: e instanceof Error ? e.message : 'unknown' }, 502);
  }
});
