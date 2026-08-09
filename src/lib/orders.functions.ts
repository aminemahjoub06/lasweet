import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_DAILY_STOCK,
  GIFT_CODE,
  GIFT_ITEM_NAME,
  GIFT_KEY,
  GIFT_QTY,
  isGiftItem,
  isGiftUnlocked,
  getBrisbaneTodayIso,
  getEarliestOrderDateIso,
  NEXT_DAY_CUTOFF_MESSAGE,
  isDateBlocked,
  BLOCKED_DATE_SERVER_MESSAGE,
} from "./config";

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  key: z.string().min(1).max(100),
  no: z.string().max(20).optional(),
  name: z.string().min(1).max(120),
  prefix: z.string().max(120).optional(),
  suffix: z.string().max(120).optional(),
  image: z.string().max(2048).optional(),
  qty: z.number().int().min(1).max(999),
  price: z.number().min(0).max(10000),
  sizeLabel: z.string().max(10).optional(),
});

const customerSchema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(6).max(40),
  business: z.string().max(120).optional().default(""),
  orderType: z.string().max(60).optional().default(""),
  date: z.string().max(40).optional().default(""),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please choose a time slot.")
    .max(5),
  delivery: z.enum(["delivery", "pickup"]),
  address: z.string().max(400).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

const orderPayloadBaseSchema = z.object({
  customer: customerSchema,
  items: z.array(itemSchema).min(1).max(50),
});

const rejectSameDay = (val: { customer: { date?: string } }, ctx: z.RefinementCtx) => {
  const date = val.customer.date?.trim();
  if (!date) return;
  const today = getBrisbaneTodayIso();
  if (date <= today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customer", "date"],
      message:
        "Same-day orders are no longer accepted. Please choose a date from tomorrow onwards.",
    });
    return;
  }
  if (isDateBlocked(date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customer", "date"],
      message: BLOCKED_DATE_SERVER_MESSAGE,
    });
    return;
  }
  const earliest = getEarliestOrderDateIso();
  if (date < earliest) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customer", "date"],
      message: NEXT_DAY_CUTOFF_MESSAGE,
    });
  }
};

const orderPayloadSchema = orderPayloadBaseSchema.superRefine(rejectSameDay);

const stripeCheckoutSchema = orderPayloadBaseSchema
  .extend({
    origin: z.string().url().max(2048).optional(),
    paymentPlan: z.enum(["full", "deposit_50"]).default("full"),
  })
  .superRefine(rejectSameDay);

export type OrderPayload = z.infer<typeof orderPayloadSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generateOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  return `LAS-${year}-${rand}`;
}

/**
 * Anti-cheat: drop any gift line sent by the client, then re-add it server-side
 * only when the *paying* pieces actually reach the threshold. The gift is always
 * priced at 0 and can never be modified from the browser.
 */
function normalizeItems(items: OrderPayload["items"]) {
  const paying = items.filter((i) => !isGiftItem(i));
  const payingPieces = paying.reduce((n, i) => n + i.qty, 0);
  const giftApplies = isGiftUnlocked(payingPieces);
  const normalized: OrderPayload["items"] = giftApplies
    ? [
        ...paying,
        {
          key: GIFT_KEY,
          name: GIFT_ITEM_NAME,
          prefix: "Mystery ",
          suffix: "Duo",
          qty: GIFT_QTY,
          price: 0,
        },
      ]
    : paying;
  return { items: normalized, payingItems: paying, payingPieces, giftApplies };
}

function computeTotals(items: OrderPayload["items"], deliveryFee: number, giftApplies: boolean) {
  // Gift lines are priced at 0, so the subtotal is unaffected by them.
  const subtotal = Math.round(items.reduce((s, i) => s + i.qty * i.price, 0) * 100) / 100;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  return {
    subtotal,
    deliveryFee,
    discountAmount: 0,
    discountCode: giftApplies ? GIFT_CODE : null,
    total,
  };
}

// Re-resolve the delivery fee server-side from the customer's address.
// Returns:
//   { fee: number, distanceKm: number|null, lat: number|null, lng: number|null, pending: boolean }
// Throws a 400 Response when the address is outside our 25 km delivery area.
async function resolveDeliveryFee(opts: {
  delivery: "delivery" | "pickup";
  address: string;
  totalPieces: number;
}): Promise<{
  fee: number;
  distanceKm: number | null;
  lat: number | null;
  lng: number | null;
  pending: boolean;
}> {
  if (opts.delivery !== "delivery") {
    return { fee: 0, distanceKm: null, lat: null, lng: null, pending: false };
  }
  if (!opts.address || opts.address.trim().length < 5) {
    throw new Response(
      JSON.stringify({
        error:
          "We couldn't verify your delivery address. Please check your address and try again, choose pickup, or contact us at l.asweetbne@gmail.com for assistance.",
        code: "delivery_address_unverified",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const { computeDeliveryQuoteForAddress } = await import("./delivery.server");
  const outcome = await computeDeliveryQuoteForAddress(opts.address);
  if (outcome.status === "out_of_range") {
    const { OUT_OF_RANGE_MESSAGE } = await import("./config");
    throw new Response(
      JSON.stringify({
        error: OUT_OF_RANGE_MESSAGE,
        code: "delivery_out_of_range",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (outcome.status === "unresolved") {
    throw new Response(
      JSON.stringify({
        error:
          "We couldn't verify your delivery address. Please check your address and try again, choose pickup, or contact us at l.asweetbne@gmail.com for assistance.",
        code: "delivery_address_unverified",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  // Long-distance deliveries (> 25 km) are only worth the trip above a
  // minimum number of pieces.
  if (outcome.minPieces > 0 && opts.totalPieces < outcome.minPieces) {
    const { LONG_DISTANCE_MIN_PIECES_MESSAGE } = await import("./config");
    throw new Response(
      JSON.stringify({
        error: LONG_DISTANCE_MIN_PIECES_MESSAGE,
        code: "delivery_min_pieces_required",
        minPieces: outcome.minPieces,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  return {
    fee: outcome.feeAud,
    distanceKm: outcome.distanceKm,
    lat: outcome.geocode.lat,
    lng: outcome.geocode.lng,
    pending: false,
  };
}

// Stable per-flavour stock key. We use the product `no` ("01" Raspberry,
// "02" Lemon, ...) because it is immutable across renames.
function stockKeyFor(item: { no?: string; name: string }) {
  return (item.no || item.name).trim().toLowerCase();
}

// Aggregate items into { stockKey: totalQty } for atomic decrement / restore.
function aggregateStockUsage(items: OrderPayload["items"]) {
  const out: Record<string, number> = {};
  for (const it of items) {
    const k = stockKeyFor(it);
    out[k] = (out[k] || 0) + it.qty;
  }
  return out;
}

// Reserve daily stock for every line in the order. Throws if any product is
// short. Already-decremented keys are restored if a later one fails so the
// table stays consistent.
async function reserveStockOrThrow(
  items: OrderPayload["items"],
  deliveryDate: string,
) {
  if (!deliveryDate) {
    throw new Error("Please choose a delivery/pick-up date before ordering.");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Gift pieces are picked by the chef from whatever is on hand — they don't
  // consume the per-flavour daily stock.
  const usage = aggregateStockUsage(items.filter((i) => !isGiftItem(i)));
  const reserved: Array<{ key: string; qty: number }> = [];
  for (const [key, qty] of Object.entries(usage)) {
    const { data, error } = await supabaseAdmin.rpc("decrement_daily_stock", {
      p_product_key: key,
      p_delivery_date: deliveryDate,
      p_qty: qty,
      p_default_units: DEFAULT_DAILY_STOCK,
    });
    if (error) {
      // Roll back what we already reserved.
      for (const r of reserved) {
        await supabaseAdmin.rpc("restore_daily_stock", {
          p_product_key: r.key,
          p_delivery_date: deliveryDate,
          p_qty: r.qty,
        });
      }
      console.error("[reserveStock] rpc error", error);
      throw new Error("Could not reserve stock. Please try again.");
    }
    if (typeof data === "number" && data < 0) {
      // Insufficient stock for this product on this date.
      for (const r of reserved) {
        await supabaseAdmin.rpc("restore_daily_stock", {
          p_product_key: r.key,
          p_delivery_date: deliveryDate,
          p_qty: r.qty,
        });
      }
      const friendly = items.find((it) => stockKeyFor(it) === key)?.name ?? key;
      throw new Error(
        `${friendly} is sold out for ${deliveryDate}. Please choose another day.`,
      );
    }
    reserved.push({ key, qty });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery slot locks — one delivery per (date, time). Pick-ups are unlimited.
// ─────────────────────────────────────────────────────────────────────────────

export const DELIVERY_SLOT_TAKEN_MESSAGE =
  "This delivery slot has just been booked. Please choose another time.";

/**
 * Atomically reserve a delivery slot. Throws a 409 Response when the
 * (date, time) pair is already taken by another delivery order.
 */
async function lockDeliverySlotOrThrow(
  deliveryDate: string,
  deliveryTime: string,
  orderNumber: string,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("delivery_slot_locks").insert({
    delivery_date: deliveryDate,
    delivery_time: deliveryTime,
    order_number: orderNumber,
  });
  if (!error) return;
  // 23505 = unique_violation on unique_delivery_slot
  if (error.code === "23505") {
    throw new Response(
      JSON.stringify({
        error: DELIVERY_SLOT_TAKEN_MESSAGE,
        code: "delivery_slot_taken",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } },
    );
  }
  console.error("[lockDeliverySlot] error", error);
  throw new Error("Could not reserve your delivery time. Please try again.");
}

/** Release a delivery slot lock (order failed, cancelled, refunded or swept). */
export async function releaseDeliverySlot(orderNumber: string | null | undefined) {
  if (!orderNumber) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("delivery_slot_locks")
      .delete()
      .eq("order_number", orderNumber);
  } catch (err) {
    console.error("[releaseDeliverySlot] failed", orderNumber, err);
  }
}

/** Booked delivery slots for a date — used to grey out taken times. */
export const getBookedDeliverySlots = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("delivery_slot_locks")
      .select("delivery_time")
      .eq("delivery_date", data.date);
    if (error) {
      console.error("[getBookedDeliverySlots] error", error);
      return { date: data.date, bookedTimes: [] as string[] };
    }
    return {
      date: data.date,
      bookedTimes: (rows ?? []).map((r) => r.delivery_time),
    };
  });

// Restore stock when an order is cancelled/refunded/expired.
export async function restoreOrderStock(
  items: OrderPayload["items"] | unknown,
  deliveryDate: string | null | undefined,
) {
  if (!deliveryDate) return;
  if (!Array.isArray(items)) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const usage = aggregateStockUsage(items as OrderPayload["items"]);
  for (const [key, qty] of Object.entries(usage)) {
    try {
      await supabaseAdmin.rpc("restore_daily_stock", {
        p_product_key: key,
        p_delivery_date: deliveryDate,
        p_qty: qty,
      });
    } catch (err) {
      console.error("[restoreOrderStock] failed", key, err);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cash order: save with payment_status = cash_pending
// ─────────────────────────────────────────────────────────────────────────────

export const createCashOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => orderPayloadSchema.parse(input))
  .handler(async ({ data }) => {
    const { enforceOrderRateLimit } = await import("./rate-limit.server");
    if (isDateBlocked(data.customer.date?.trim())) {
      throw new Response(
        JSON.stringify({ error: BLOCKED_DATE_SERVER_MESSAGE, code: "date_unavailable" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    await enforceOrderRateLimit({ endpoint: "createCashOrder", email: data.customer.email });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { items: orderItems, payingPieces, giftApplies } = normalizeItems(data.items);
    const deliveryQuote = await resolveDeliveryFee({
      delivery: data.customer.delivery,
      address: data.customer.address,
      totalPieces: payingPieces,
    });
    const { subtotal, deliveryFee, discountAmount, discountCode, total } = computeTotals(
      orderItems,
      deliveryQuote.fee,
      giftApplies,
    );
    const orderNumber = generateOrderNumber();

    // Delivery slots are unique per date — lock it before anything else.
    if (data.customer.delivery === "delivery") {
      await lockDeliverySlotOrThrow(data.customer.date, data.customer.time, orderNumber);
    }

    // Reserve stock atomically per (flavour, delivery date) before we save.
    try {
      await reserveStockOrThrow(orderItems, data.customer.date);
    } catch (err) {
      await releaseDeliverySlot(orderNumber);
      throw err;
    }

    const { data: insertedCash, error } = await supabaseAdmin.from("orders").insert({
      order_number: orderNumber,
      customer_name: data.customer.fullName,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      business: data.customer.business || null,
      delivery_method: data.customer.delivery,
      delivery_address: data.customer.delivery === "delivery" ? data.customer.address : null,
      delivery_date: data.customer.date || null,
      delivery_time: data.customer.time,
      order_type: data.customer.orderType || null,
      notes: data.customer.notes || null,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      discount_code: discountCode,
      total,
      payment_method: "cash",
      payment_status: "cash_pending",
      delivery_distance_km: deliveryQuote.distanceKm,
      delivery_lat: deliveryQuote.lat,
      delivery_lng: deliveryQuote.lng,
      pending_delivery_quote: deliveryQuote.pending,
    })
      .select("*")
      .single();

    if (error) {
      console.error("[createCashOrder] insert error", error);
      await restoreOrderStock(orderItems, data.customer.date);
      await releaseDeliverySlot(orderNumber);
      throw new Error("Could not save your order. Please try again.");
    }

    // Best-effort Google Calendar sync (never blocks the order).
    try {
      const { syncOrderCalendarEvent } = await import("./calendar-sync.server");
      await syncOrderCalendarEvent(insertedCash as never);
    } catch (e) {
      console.error("[calendar-sync] cash order failed", e);
    }

    // Best-effort owner notification (never blocks the order)
    try {
      const { notifyOwnerNewOrder } = await import("./notifications.server");
      await notifyOwnerNewOrder({
        orderNumber,
        customer: data.customer,
        items: orderItems,
        subtotal,
        deliveryFee,
        discountAmount,
        total,
        paymentMethod: "cash",
        paymentStatus: "cash_pending",
        paymentPlan: "full",
        amountPaidOnline: 0,
        balanceDueCash: total,
      });
    } catch (e) {
      console.error("[notifyOwner] failed", e);
    }

    return { orderNumber, total };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Online order: save pending, create Stripe Checkout Session, return URL
// ─────────────────────────────────────────────────────────────────────────────

export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => stripeCheckoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { enforceOrderRateLimit } = await import("./rate-limit.server");
    if (isDateBlocked(data.customer.date?.trim())) {
      throw new Response(
        JSON.stringify({ error: BLOCKED_DATE_SERVER_MESSAGE, code: "date_unavailable" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    await enforceOrderRateLimit({ endpoint: "createStripeCheckout", email: data.customer.email });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { items: orderItems, payingPieces, giftApplies } = normalizeItems(data.items);
    const deliveryQuote = await resolveDeliveryFee({
      delivery: data.customer.delivery,
      address: data.customer.address,
      totalPieces: payingPieces,
    });
    const { subtotal, deliveryFee, discountAmount, discountCode, total } = computeTotals(
      orderItems,
      deliveryQuote.fee,
      giftApplies,
    );
    const orderNumber = generateOrderNumber();

    const paymentPlan = data.paymentPlan ?? "full";
    const totalCents = Math.round(total * 100);
    const chargeCents =
      paymentPlan === "deposit_50" ? Math.round(totalCents / 2) : totalCents;
    const chargeAud = chargeCents / 100;
    const balanceDueAud = Math.max(0, total - chargeAud);

    // Delivery slots are unique per date — lock it before anything else.
    if (data.customer.delivery === "delivery") {
      await lockDeliverySlotOrThrow(data.customer.date, data.customer.time, orderNumber);
    }

    // Reserve stock atomically per (flavour, delivery date) before we save.
    try {
      await reserveStockOrThrow(orderItems, data.customer.date);
    } catch (err) {
      await releaseDeliverySlot(orderNumber);
      throw err;
    }

    // 1) Save the order as pending
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer.fullName,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone,
        business: data.customer.business || null,
        delivery_method: data.customer.delivery,
        delivery_address: data.customer.delivery === "delivery" ? data.customer.address : null,
        delivery_date: data.customer.date || null,
        delivery_time: data.customer.time,
        order_type: data.customer.orderType || null,
        notes: data.customer.notes || null,
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        discount_code: discountCode,
        total,
        payment_method: "online",
        payment_status: "pending",
        payment_plan: paymentPlan,
        amount_paid_online: 0,
        balance_due_cash: 0,
        delivery_distance_km: deliveryQuote.distanceKm,
        delivery_lat: deliveryQuote.lat,
        delivery_lng: deliveryQuote.lng,
        pending_delivery_quote: deliveryQuote.pending,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[createStripeCheckout] insert error", insertError);
      await restoreOrderStock(orderItems, data.customer.date);
      await releaseDeliverySlot(orderNumber);
      throw new Error("Could not save your order. Please try again.");
    }

    // 2) Build the Stripe Checkout Session via the Lovable connector gateway.
    // Use the client-provided origin (real browser URL) so Stripe never
    // redirects back to localhost when the server runs in a sandbox.
    let origin = data.origin?.replace(/\/$/, "") ?? "";
    if (!origin || origin.includes("localhost")) {
      try {
        const { getRequestHost } = await import("@tanstack/react-start/server");
        const host = getRequestHost();
        if (host && !host.includes("localhost")) {
          origin = `https://${host}`;
        }
      } catch {
        // ignore
      }
    }
    if (!origin) {
      throw new Error("Could not determine site origin for payment redirect.");
    }

    const lovableKey = process.env.LOVABLE_API_KEY;
    // Use the live Stripe connection in production builds, sandbox otherwise.
    const useLive =
      process.env.NODE_ENV === "production" && !!process.env.STRIPE_LIVE_API_KEY;
    const stripeKey = useLive
      ? process.env.STRIPE_LIVE_API_KEY
      : process.env.STRIPE_SANDBOX_API_KEY;
    if (!lovableKey || !stripeKey) {
      throw new Error("Payment provider is not configured.");
    }

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append(
      "success_url",
      `${origin}/order/success?order=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    );
    params.append("cancel_url", `${origin}/?payment=cancelled`);
    params.append("locale", "en");
    params.append("customer_email", data.customer.email);
    params.append("client_reference_id", orderNumber);
    params.append("metadata[order_number]", orderNumber);
    params.append("metadata[order_id]", inserted.id);
    params.append("metadata[payment_plan]", paymentPlan);

    if (paymentPlan === "deposit_50") {
      // Single line covering the 50% deposit. The remaining balance is
      // collected in cash on pick-up/delivery.
      params.append(`line_items[0][price_data][currency]`, "aud");
      params.append(
        `line_items[0][price_data][product_data][name]`,
        `Deposit (50%) — Order ${orderNumber}`,
      );
      params.append(
        `line_items[0][price_data][product_data][description]`,
        `50% deposit on your L&A Sweet order. Balance of A$${balanceDueAud.toFixed(2)} payable in cash on ${data.customer.delivery === "delivery" ? "delivery" : "pick-up"}.`,
      );
      params.append(`line_items[0][price_data][unit_amount]`, String(chargeCents));
      params.append(`line_items[0][quantity]`, "1");
    } else {
      let lineIndex = 0;
      // A$0 lines are rejected by Stripe — the free gift is noted on the first
      // billable line instead of being charged.
      for (const item of orderItems.filter((i) => i.price > 0)) {
        const label = [item.prefix, item.suffix].filter(Boolean).join("").trim() || item.name;
        const nameWithSize = item.sizeLabel ? `${label} (Size ${item.sizeLabel})` : label;
        params.append(`line_items[${lineIndex}][price_data][currency]`, "aud");
        params.append(`line_items[${lineIndex}][price_data][product_data][name]`, nameWithSize);
        params.append(
          `line_items[${lineIndex}][price_data][unit_amount]`,
          String(Math.round(item.price * 100)),
        );
        params.append(`line_items[${lineIndex}][quantity]`, String(item.qty));
        lineIndex++;
      }
      if (giftApplies) {
        params.append(
          `line_items[0][price_data][product_data][description]`,
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

    const resp = await fetch(
      "https://connector-gateway.lovable.dev/stripe/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": stripeKey,
        },
        body: params.toString(),
      },
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("[createStripeCheckout] gateway error", resp.status, errText);
      // Stripe session creation failed — release the reservation.
      await restoreOrderStock(orderItems, data.customer.date);
      await releaseDeliverySlot(orderNumber);
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", notes: "Stripe session creation failed" })
        .eq("id", inserted.id);
      throw new Error("Could not start secure payment. Please try again.");
    }

    const session = (await resp.json()) as { id: string; url: string };

    // 3) Save the session id on the order
    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", inserted.id);

    return { url: session.url, orderNumber };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Lookup an order by its public order number (read-only, safe fields only)
// ─────────────────────────────────────────────────────────────────────────────

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ orderNumber: z.string().min(3).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { enforceIpRateLimit } = await import("./rate-limit.server");
    await enforceIpRateLimit({ endpoint: "lookupOrderByEmail", max: 5 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select(
        // No PII (name/email/phone/address/notes) — the order number travels
        // in the URL after Stripe redirects and can leak via referrer/history.
        // Detailed order info is available via the email-verified
        // `lookupOrderByEmail` flow instead.
        "order_number, business, delivery_method, delivery_date, delivery_time, order_type, total, payment_method, payment_status, payment_plan, amount_paid_online, balance_due_cash, balance_collected_at, items, subtotal, delivery_fee, created_at",
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) {
      console.error("[getOrderStatus] error", error);
      throw new Error("Order lookup failed.");
    }
    return row;
  });

// ─────────────────────────────────────────────────────────────────────────────
// Customer-facing order lookup: email + order number. Read-only.
// Returns the order only if BOTH match — prevents enumeration.
// ─────────────────────────────────────────────────────────────────────────────

export const lookupOrderByEmail = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        orderNumber: z.string().min(3).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_number, customer_name, customer_email, delivery_method, delivery_address, delivery_date, delivery_time, order_type, notes, total, payment_method, payment_status, payment_plan, amount_paid_online, balance_due_cash, balance_collected_at, items, subtotal, delivery_fee, created_at",
      )
      .eq("order_number", data.orderNumber.trim().toUpperCase())
      .ilike("customer_email", data.email.trim())
      .maybeSingle();
    if (error) {
      console.error("[lookupOrderByEmail] error", error);
      throw new Error("Lookup failed. Please try again.");
    }
    if (!row) {
      // Generic message — don't reveal whether order exists.
      throw new Error(
        "We couldn't find an order matching that email and order number.",
      );
    }
    return row;
  });

// ─────────────────────────────────────────────────────────────────────────────
// Read remaining daily stock for a given delivery date.
// Returns { [productKey]: unitsRemaining }. Missing keys default to DEFAULT_DAILY_STOCK.
// ─────────────────────────────────────────────────────────────────────────────

export const getDailyStockForDate = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("daily_stock")
      .select("product_key, units_remaining, initial_units")
      .eq("delivery_date", data.date);
    if (error) {
      console.error("[getDailyStockForDate] error", error);
      throw new Error("Could not load stock.");
    }
    const stock: Record<string, { remaining: number; initial: number }> = {};
    for (const r of rows ?? []) {
      stock[r.product_key] = {
        remaining: r.units_remaining,
        initial: r.initial_units,
      };
    }
    return { date: data.date, defaultUnits: DEFAULT_DAILY_STOCK, stock };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Admin: mark a deposit order's cash balance as collected.
// Password-protected the same way as listAdminOrders.
// ─────────────────────────────────────────────────────────────────────────────

export const markBalanceCollected = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        orderNumber: z.string().min(3).max(40),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
    if (!expected || data.password !== expected) {
      throw new Error("Invalid admin password.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        balance_due_cash: 0,
        balance_collected_at: new Date().toISOString(),
      })
      .eq("order_number", data.orderNumber)
      .eq("payment_status", "deposit_paid")
      .select("order_number, balance_collected_at")
      .maybeSingle();
    if (error) {
      console.error("[markBalanceCollected] error", error);
      throw new Error("Could not mark balance as collected.");
    }
    if (!row) {
      throw new Error("Order not found or balance already collected.");
    }
    return { ok: true, orderNumber: row.order_number };
  });
// ─────────────────────────────────────────────────────────────────────────────
// Admin: mark a pick-up order as collected. Setting `picked_up_at` is what
// protects the order from the automatic no-show cancellation sweep.
// Optionally also settles a 50% deposit balance in the same click.
// ─────────────────────────────────────────────────────────────────────────────

export const markPickedUp = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        orderNumber: z.string().min(3).max(40),
        collectBalance: z.boolean().optional().default(false),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
    if (!expected || data.password !== expected) {
      throw new Error("Invalid admin password.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing, error: readErr } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, payment_status, balance_due_cash")
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (readErr) {
      console.error("[markPickedUp] read error", readErr);
      throw new Error("Could not update this order.");
    }
    if (!existing) throw new Error("Order not found.");

    const patch: {
      picked_up_at: string;
      order_status: string;
      payment_status?: string;
      balance_due_cash?: number;
      balance_collected_at?: string;
    } = {
      picked_up_at: new Date().toISOString(),
      order_status: "collected",
    };
    if (data.collectBalance && existing.payment_status === "deposit_paid") {
      patch.payment_status = "paid";
      patch.balance_due_cash = 0;
      patch.balance_collected_at = new Date().toISOString();
    }
    if (data.collectBalance && existing.payment_status === "cash_pending") {
      patch.payment_status = "paid";
      patch.balance_due_cash = 0;
      patch.balance_collected_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin.from("orders").update(patch).eq("id", existing.id);
    if (error) {
      console.error("[markPickedUp] update error", error);
      throw new Error("Could not mark this order as picked up.");
    }
    return { ok: true, orderNumber: existing.order_number };
  });
