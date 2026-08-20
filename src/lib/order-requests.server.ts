// Server-only helpers for the manual order-request flow (ORDER_MODE = 'request').
// Handles secure one-time action tokens, accept / decline / expire transitions,
// and Stripe Checkout session creation for an already-accepted request.

import {
  GIFT_QTY,
  ORDER_STATUS_REQUEST_ACCEPTED,
  ORDER_STATUS_REQUEST_DECLINED,
  ORDER_STATUS_REQUEST_EXPIRED,
  ORDER_STATUS_REQUEST_PENDING,
  PAYMENT_LINK_TTL_HOURS,
  REQUEST_ACTION_TTL_DAYS,
  isGiftItem,
} from "./config";

export type OrderRow = Record<string, any>;

export type TokenAction = "accept" | "decline" | "pay";

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a single-use token for an order request action. */
export async function createRequestToken(
  orderNumber: string,
  action: TokenAction,
  ttlHours: number,
): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const token = randomToken();
  const expiresAt = new Date(Date.now() + ttlHours * 3600_000).toISOString();
  const { error } = await supabaseAdmin
    .from("order_request_tokens")
    .insert({ order_number: orderNumber, action, token, expires_at: expiresAt });
  if (error) {
    console.error("[order-requests] token insert failed", error);
    throw new Error("Could not create the request link.");
  }
  return token;
}

export type TokenLookup =
  | { ok: true; orderNumber: string; action: TokenAction; id: string }
  | { ok: false; reason: "unknown" | "used" | "expired" };

/** Validate a token without consuming it. */
export async function readRequestToken(token: string): Promise<TokenLookup> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin
    .from("order_request_tokens")
    .select("id, order_number, action, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();
  if (!row) return { ok: false, reason: "unknown" };
  if (row.used_at) return { ok: false, reason: "used" };
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: "expired" };
  return {
    ok: true,
    id: row.id,
    orderNumber: row.order_number,
    action: row.action as TokenAction,
  };
}

/** Mark a token as used (single-use enforcement). */
export async function markTokenUsed(id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("order_request_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", id);
}

/** Invalidate every outstanding token for an order (after a decision). */
export async function invalidateOrderTokens(orderNumber: string, actions: TokenAction[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("order_request_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("order_number", orderNumber)
    .in("action", actions)
    .is("used_at", null);
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderRow | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  return data ?? null;
}

/** Shape an order row into the data the request email templates expect. */
export function requestEmailData(order: OrderRow) {
  const items = Array.isArray(order.items) ? order.items : [];
  return {
    orderNumber: order.order_number as string,
    customerName: order.customer_name as string,
    customerEmail: order.customer_email as string,
    customerPhone: (order.customer_phone as string) ?? undefined,
    business: (order.business as string) ?? undefined,
    orderType: (order.order_type as string) ?? undefined,
    notes: (order.notes as string) ?? undefined,
    items: items.map((i: any) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
      sizeLabel: i.sizeLabel,
    })),
    subtotal: Number(order.subtotal ?? 0),
    deliveryFee: Number(order.delivery_fee ?? 0),
    total: Number(order.total ?? 0),
    deliveryMethod: (order.delivery_method === "delivery" ? "delivery" : "pickup") as
      | "delivery"
      | "pickup",
    deliveryAddress: (order.delivery_address as string) ?? undefined,
    deliveryDate: (order.delivery_date as string) ?? undefined,
    deliveryTime: (order.delivery_time as string) ?? undefined,
    giftIncluded: items.some((i: any) => isGiftItem(i)) && GIFT_QTY > 0,
  };
}

export function siteOrigin(fallback?: string | null): string {
  const raw = (fallback ?? "").replace(/\/$/, "");
  if (raw && !raw.includes("localhost")) return raw;
  return "https://la-sweet-bne.com";
}

// ─────────────────────────────────────────────────────────────────────────────
// Transitions
// ─────────────────────────────────────────────────────────────────────────────

export type ActionOutcome =
  | { ok: true; orderNumber: string; status: string; alreadyDone?: boolean }
  | { ok: false; message: string };

/** Owner accepts a request: unlock payment and email the customer a pay link. */
export async function acceptOrderRequest(
  orderNumber: string,
  origin: string,
): Promise<ActionOutcome> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false, message: "This order request no longer exists." };
  if (order.order_status === ORDER_STATUS_REQUEST_ACCEPTED) {
    return { ok: true, orderNumber, status: ORDER_STATUS_REQUEST_ACCEPTED, alreadyDone: true };
  }
  if (order.order_status !== ORDER_STATUS_REQUEST_PENDING) {
    return {
      ok: false,
      message: "This request has already been actioned and can't be accepted.",
    };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const expiresAt = new Date(Date.now() + PAYMENT_LINK_TTL_HOURS * 3600_000).toISOString();
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      order_status: ORDER_STATUS_REQUEST_ACCEPTED,
      request_actioned_at: new Date().toISOString(),
      payment_link_expires_at: expiresAt,
    })
    .eq("id", order.id);
  if (error) {
    console.error("[order-requests] accept update failed", error);
    return { ok: false, message: "Could not accept this request. Please try again." };
  }

  try {
    const payToken = await createRequestToken(orderNumber, "pay", PAYMENT_LINK_TTL_HOURS);
    const { notifyOrderRequestAccepted } = await import("./notifications.server");
    await notifyOrderRequestAccepted({
      ...requestEmailData({ ...order, order_status: ORDER_STATUS_REQUEST_ACCEPTED }),
      payUrl: `${siteOrigin(origin)}/pay/${orderNumber}?token=${payToken}`,
    });
  } catch (e) {
    console.error("[order-requests] accept email failed", e);
  }
  await invalidateOrderTokens(orderNumber, ["accept", "decline"]);
  return { ok: true, orderNumber, status: ORDER_STATUS_REQUEST_ACCEPTED };
}

/** Owner declines a request: release the delivery slot and email the customer. */
export async function declineOrderRequest(orderNumber: string): Promise<ActionOutcome> {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return { ok: false, message: "This order request no longer exists." };
  if (order.order_status === ORDER_STATUS_REQUEST_DECLINED) {
    return { ok: true, orderNumber, status: ORDER_STATUS_REQUEST_DECLINED, alreadyDone: true };
  }
  if (
    order.order_status !== ORDER_STATUS_REQUEST_PENDING &&
    order.order_status !== ORDER_STATUS_REQUEST_ACCEPTED
  ) {
    return { ok: false, message: "This request can no longer be declined." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      order_status: ORDER_STATUS_REQUEST_DECLINED,
      payment_status: "cancelled",
      request_actioned_at: new Date().toISOString(),
      payment_link_expires_at: null,
    })
    .eq("id", order.id);
  if (error) {
    console.error("[order-requests] decline update failed", error);
    return { ok: false, message: "Could not decline this request. Please try again." };
  }

  try {
    const { releaseDeliverySlot } = await import("./orders.functions");
    await releaseDeliverySlot(orderNumber);
  } catch (e) {
    console.error("[order-requests] decline slot release failed", e);
  }
  try {
    const { notifyOrderRequestDeclined } = await import("./notifications.server");
    await notifyOrderRequestDeclined({
      orderNumber,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      deliveryDate: order.delivery_date,
    });
  } catch (e) {
    console.error("[order-requests] decline email failed", e);
  }
  await invalidateOrderTokens(orderNumber, ["accept", "decline", "pay"]);
  return { ok: true, orderNumber, status: ORDER_STATUS_REQUEST_DECLINED };
}

/** Sweep accepted-but-unpaid requests past their payment window. */
export async function expireStaleOrderRequests(): Promise<{ expired: string[] }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const { data: rows } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, delivery_method, delivery_date, delivery_time, total, payment_status",
    )
    .eq("order_status", ORDER_STATUS_REQUEST_ACCEPTED)
    .lt("payment_link_expires_at", nowIso);

  const expired: string[] = [];
  for (const row of rows ?? []) {
    // Never expire something that has actually been paid.
    if (["paid", "deposit_paid"].includes(row.payment_status ?? "")) continue;
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        order_status: ORDER_STATUS_REQUEST_EXPIRED,
        payment_status: "expired",
        payment_link_expires_at: null,
      })
      .eq("id", row.id);
    if (error) {
      console.error("[order-requests] expire failed", row.order_number, error);
      continue;
    }
    try {
      const { releaseDeliverySlot } = await import("./orders.functions");
      await releaseDeliverySlot(row.order_number);
    } catch (e) {
      console.error("[order-requests] expire slot release failed", e);
    }
    try {
      const { notifyOrderRequestExpired } = await import("./notifications.server");
      await notifyOrderRequestExpired({
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        deliveryMethod: row.delivery_method,
        deliveryDate: row.delivery_date,
        deliveryTime: row.delivery_time,
        total: Number(row.total ?? 0),
      });
    } catch (e) {
      console.error("[order-requests] expire email failed", e);
    }
    await invalidateOrderTokens(row.order_number, ["pay", "accept", "decline"]);
    expired.push(row.order_number);
  }
  return { expired };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Checkout for an accepted request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session for an already-saved, accepted order.
 * Mirrors the instant-mode session shape so the existing webhook keeps working.
 */
export async function createStripeSessionForOrder(
  order: OrderRow,
  paymentPlan: "full" | "deposit_50",
  origin: string,
): Promise<{ url: string }> {
  const total = Number(order.total ?? 0);
  const totalCents = Math.round(total * 100);
  const chargeCents = paymentPlan === "deposit_50" ? Math.round(totalCents / 2) : totalCents;
  const balanceDueAud = Math.max(0, total - chargeCents / 100);
  const items = (Array.isArray(order.items) ? order.items : []) as Array<any>;
  const giftApplies = items.some((i) => isGiftItem(i));
  const deliveryFee = Number(order.delivery_fee ?? 0);
  const orderNumber = order.order_number as string;
  const base = siteOrigin(origin);

  const lovableKey = process.env.LOVABLE_API_KEY;
  const useLive = process.env.NODE_ENV === "production" && !!process.env.STRIPE_LIVE_API_KEY;
  const stripeKey = useLive
    ? process.env.STRIPE_LIVE_API_KEY
    : process.env.STRIPE_SANDBOX_API_KEY;
  if (!lovableKey || !stripeKey) throw new Error("Payment provider is not configured.");

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append(
    "success_url",
    `${base}/order/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
  );
  params.append("cancel_url", `${base}/pay/${orderNumber}?payment=cancelled`);
  params.append("locale", "en");
  params.append("customer_email", order.customer_email);
  params.append("client_reference_id", orderNumber);
  params.append("metadata[order_number]", orderNumber);
  params.append("metadata[order_id]", order.id);
  params.append("metadata[payment_plan]", paymentPlan);

  if (paymentPlan === "deposit_50") {
    params.append("line_items[0][price_data][currency]", "aud");
    params.append(
      "line_items[0][price_data][product_data][name]",
      `Deposit (50%) — Order ${orderNumber}`,
    );
    params.append(
      "line_items[0][price_data][product_data][description]",
      `50% deposit on your L&A Sweet order. Balance of A$${balanceDueAud.toFixed(2)} payable in cash on ${order.delivery_method === "delivery" ? "delivery" : "pick-up"}.`,
    );
    params.append("line_items[0][price_data][unit_amount]", String(chargeCents));
    params.append("line_items[0][quantity]", "1");
  } else {
    let lineIndex = 0;
    for (const item of items.filter((i) => Number(i.price) > 0)) {
      const label =
        [item.prefix, item.suffix].filter(Boolean).join("").trim() || item.name;
      const nameWithSize = item.sizeLabel ? `${label} (Size ${item.sizeLabel})` : label;
      params.append(`line_items[${lineIndex}][price_data][currency]`, "aud");
      params.append(`line_items[${lineIndex}][price_data][product_data][name]`, nameWithSize);
      params.append(
        `line_items[${lineIndex}][price_data][unit_amount]`,
        String(Math.round(Number(item.price) * 100)),
      );
      params.append(`line_items[${lineIndex}][quantity]`, String(item.qty));
      lineIndex++;
    }
    if (giftApplies) {
      params.append(
        "line_items[0][price_data][product_data][description]",
        `Includes ${GIFT_QTY} free mystery pieces — our gift to you.`,
      );
    }
    if (deliveryFee > 0) {
      params.append(`line_items[${lineIndex}][price_data][currency]`, "aud");
      params.append(`line_items[${lineIndex}][price_data][product_data][name]`, "Delivery fee");
      params.append(
        `line_items[${lineIndex}][price_data][unit_amount]`,
        String(Math.round(deliveryFee * 100)),
      );
      params.append(`line_items[${lineIndex}][quantity]`, "1");
    }
  }

  const resp = await fetch("https://connector-gateway.lovable.dev/stripe/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": stripeKey,
    },
    body: params.toString(),
  });
  if (!resp.ok) {
    console.error("[order-requests] stripe gateway error", resp.status, await resp.text());
    throw new Error("Could not start secure payment. Please try again.");
  }
  const session = (await resp.json()) as { id: string; url: string };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("orders")
    .update({
      stripe_session_id: session.id,
      payment_method: "online",
      payment_plan: paymentPlan,
      payment_status: "pending",
    })
    .eq("id", order.id);
  return { url: session.url };
}

export const REQUEST_ACTION_TTL_HOURS = REQUEST_ACTION_TTL_DAYS * 24;
