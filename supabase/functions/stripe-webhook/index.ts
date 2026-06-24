// V3-08: Stripe webhook → mirror the gym subscription state into gyms.
// Verifies the signature, then on subscription/checkout events updates the gym (matched by
// subscription metadata.gym_id, else by stripe_customer_id). Service role: bypasses RLS.

import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const STATUS_MAP: Record<string, string> = {
  trialing: 'trialing',
  active: 'active',
  past_due: 'past_due',
  unpaid: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'canceled',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!supabaseUrl || !serviceKey || !stripeKey || !webhookSecret) {
    return new Response('server_misconfigured', { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('no_signature', { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-09-30.clover' });
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, sig, webhookSecret);
  } catch (e) {
    return new Response(`bad_signature: ${e instanceof Error ? e.message : ''}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  async function applySubscription(sub: Stripe.Subscription) {
    const gymId = (sub.metadata?.gym_id as string | undefined) ?? null;
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const patch = {
      subscription_status: STATUS_MAP[sub.status] ?? 'none',
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    };
    const query = admin.from('gyms').update(patch);
    if (gymId) await query.eq('id', gymId);
    else await query.eq('stripe_customer_id', customerId);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await applySubscription(sub);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return new Response(`handler_error: ${e instanceof Error ? e.message : ''}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
