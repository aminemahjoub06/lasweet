import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_DAILY_STOCK,
  computePromoDiscount,
  getBrisbaneTodayIso,
  getEarliestOrderDateIso,
  NEXT_DAY_CUTOFF_MESSAGE,
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

function computeTotals(items: OrderPayload["items"], deliveryFee: number) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const totalPieces = items.reduce((n, i) => n + i.qty, 0);
  // Promo is always recomputed server-side — never trust a client-sent discount.
  const promo = computePromoDiscount(totalPieces, subtotal);
  const discountAmount = Math.min(promo.amount, subtotal);
  const total = Math.round((subtotal - discountAmount + deliveryFee) * 100) / 100;
  return {
    subtotal,
    deliveryFee,
    discountAmount,
    discountCode: discountAmount > 0 ? promo.code : null,
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
  const usage = aggregateStockUsage(items);
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
    await enforceOrderRateLimit({ endpoint: "createCashOrder", email: data.customer.email });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const totalPieces = data.items.reduce((n, i) => n + i.qty, 0);
    const deliveryQuote = await resolveDeliveryFee({
      delivery: data.customer.delivery,
      address: data.customer.address,
      totalPieces,
    });
    const { subtotal, deliveryFee, discountAmount, discountCode, total } = computeTotals(
      data.items,
      deliveryQuote.fee,
    );
    const orderNumber = generateOrderNumber();

    // Delivery slots are unique per date — lock it before anything else.
    if (data.customer.delivery === "delivery") {
      await lockDeliverySlotOrThrow(data.customer.date, data.customer.time, orderNumber);
    }

    // Reserve stock atomically per (flavour, delivery date) before we save.
    try {
      await reserveStockOrThrow(data.items, data.customer.date);
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
      items: data.items,
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
      await restoreOrderStock(data.items, data.customer.date);
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
        items: data.items,
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
    await enforceOrderRateLimit({ endpoint: "createStripeCheckout", email: data.customer.email });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const totalPieces = data.items.reduce((n, i) => n + i.qty, 0);
    const deliveryQuote = await resolveDeliveryFee({
      delivery: data.customer.delivery,
      address: data.customer.address,
      totalPieces,
    });
    const { subtotal, deliveryFee, discountAmount, discountCode, total } = computeTotals(
      data.items,
      deliveryQuote.fee,
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
      await reserveStockOrThrow(data.items, data.customer.date);
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
        items: data.items,
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
      await restoreOrderStock(data.items, data.customer.date);
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
    } else if (discountAmount > 0) {
      // Stripe has no negative line items — bill the discounted order as one line.
      params.append(`line_items[0][price_data][currency]`, "aud");
      params.append(
        `line_items[0][price_data][product_data][name]`,
        `L&A Sweet order ${orderNumber} — Buy 8, get 2 free`,
      );
      params.append(
        `line_items[0][price_data][product_data][description]`,
        `${data.items.map((i) => `${i.qty} × ${i.name}`).join(", ")} · Subtotal A$${subtotal.toFixed(2)} · Promo discount −A$${discountAmount.toFixed(2)}${deliveryFee > 0 ? ` · Delivery A$${deliveryFee.toFixed(2)}` : ""}`,
      );
      params.append(`line_items[0][price_data][unit_amount]`, String(chargeCents));
      params.append(`line_items[0][quantity]`, "1");
    } else {
      let lineIndex = 0;
      for (const item of data.items) {
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
      await restoreOrderStock(data.items, data.customer.date);
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