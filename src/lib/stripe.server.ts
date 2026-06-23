// Minimal Stripe API helper routed through the Lovable connector gateway.
// Used by webhook + cleanup cron to verify refunds and checkout sessions.

const GATEWAY_BASE = "https://connector-gateway.lovable.dev/stripe";

export type StripeEnv = "sandbox" | "live";

function connectionKey(env: StripeEnv): string {
  const key =
    env === "live"
      ? process.env.STRIPE_LIVE_API_KEY
      : process.env.STRIPE_SANDBOX_API_KEY;
  if (!key) throw new Error(`Stripe ${env} key not configured`);
  return key;
}

async function stripeGet<T = any>(env: StripeEnv, path: string): Promise<T> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(`${GATEWAY_BASE}${path}`, {
    method: "GET",
    headers: {
      "X-Connection-Api-Key": connectionKey(env),
      "Lovable-API-Key": lovableKey,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Stripe ${path} ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface StripeCheckoutSession {
  id: string;
  status?: string;
  payment_status?: string;
  payment_intent?: string | null;
}

export async function retrieveCheckoutSession(
  env: StripeEnv,
  sessionId: string,
): Promise<StripeCheckoutSession> {
  return stripeGet(env, `/v1/checkout/sessions/${sessionId}`);
}

export async function listSessionsByPaymentIntent(
  env: StripeEnv,
  paymentIntent: string,
): Promise<{ data: StripeCheckoutSession[] }> {
  return stripeGet(
    env,
    `/v1/checkout/sessions?payment_intent=${encodeURIComponent(paymentIntent)}&limit=1`,
  );
}