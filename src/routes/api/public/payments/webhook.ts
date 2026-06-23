import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Stripe webhook — payment confirmation. Configured automatically by Lovable's
// payments integration; routed here as /api/public/payments/webhook.

function verifyStripeSignature(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const idx = p.indexOf("=");
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    }),
  ) as Record<string, string>;
  const ts = parts.t;
  const sig = parts.v1;
  if (!ts || !sig) return false;
  const expected = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("stripe-signature");
        // Lovable registers separate webhook endpoints for sandbox and live
        // and appends ?env=sandbox|live. Fall back to trying both secrets so
        // legacy registrations without the query param keep working.
        const envParam = new URL(request.url).searchParams.get("env");
        const sandboxSecret = process.env.PAYMENTS_SANDBOX_WEBHOOK_SECRET;
        const liveSecret = process.env.PAYMENTS_LIVE_WEBHOOK_SECRET;
        const candidates =
          envParam === "live"
            ? [liveSecret]
            : envParam === "sandbox"
              ? [sandboxSecret]
              : [liveSecret, sandboxSecret];
        const ok = candidates.some(
          (s) => !!s && verifyStripeSignature(rawBody, signature, s),
        );
        if (!ok) {
          console.warn("[stripe-webhook] invalid signature", { envParam });
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { type: string; data: { object: Record<string, unknown> } };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const session = event.data.object as {
          id?: string;
          client_reference_id?: string;
          metadata?: Record<string, string>;
          payment_status?: string;
        };

        const orderNumber =
          session.client_reference_id || session.metadata?.order_number;
        const sessionId = session.id;

        if (event.type === "checkout.session.completed" || event.type === "transaction.completed") {
          if (!orderNumber && !sessionId) {
            return new Response("ok", { status: 200 });
          }

          const query = supabaseAdmin
            .from("orders")
            .update({ payment_status: "paid" });
          const filtered = orderNumber
            ? query.eq("order_number", orderNumber)
            : query.eq("stripe_session_id", sessionId!);

          const { data: updated, error } = await filtered.select("*").maybeSingle();
          if (error) {
            console.error("[stripe-webhook] update error", error);
            return new Response("DB error", { status: 500 });
          }

          if (updated) {
            try {
              const { notifyOwnerNewOrder } = await import("@/lib/notifications.server");
              await notifyOwnerNewOrder({
                orderNumber: updated.order_number,
                customer: {
                  fullName: updated.customer_name,
                  email: updated.customer_email,
                  phone: updated.customer_phone,
                  business: updated.business ?? undefined,
                  orderType: updated.order_type ?? undefined,
                  date: updated.delivery_date ?? undefined,
                  time: updated.delivery_time ?? undefined,
                  delivery: updated.delivery_method as "delivery" | "pickup",
                  address: updated.delivery_address ?? undefined,
                  notes: updated.notes ?? undefined,
                },
                items: Array.isArray(updated.items) ? (updated.items as never) : [],
                subtotal: Number(updated.subtotal),
                deliveryFee: Number(updated.delivery_fee),
                total: Number(updated.total),
                paymentMethod: "online",
                paymentStatus: "paid",
              });
            } catch (e) {
              console.error("[stripe-webhook] notify error", e);
            }
          }
        } else if (
          event.type === "checkout.session.expired" ||
          event.type === "transaction.payment_failed"
        ) {
          if (orderNumber || sessionId) {
            const q = supabaseAdmin.from("orders").update({ payment_status: "failed" });
            await (orderNumber
              ? q.eq("order_number", orderNumber)
              : q.eq("stripe_session_id", sessionId!));
          }
        } else if (event.type === "charge.refunded") {
          try {
            const charge = event.data.object as {
              id?: string;
              amount?: number;
              amount_refunded?: number;
              payment_intent?: string | null;
              refunds?: {
                data?: Array<{ reason?: string | null; created?: number }>;
              };
              created?: number;
            };
            const paymentIntent = charge.payment_intent ?? null;
            const amount = Number(charge.amount ?? 0);
            const amountRefunded = Number(charge.amount_refunded ?? 0);
            if (!paymentIntent || amountRefunded <= 0) {
              return new Response("ok", { status: 200 });
            }
            // Find the Checkout Session linked to this PaymentIntent via the Stripe API.
            // We can't trust the event payload alone — orders are keyed on stripe_session_id.
            const stripeEnv = (envParam === "live" ? "live" : "sandbox") as
              | "live"
              | "sandbox";
            const { listSessionsByPaymentIntent } = await import("@/lib/stripe.server");
            let resolvedSessionId: string | null = null;
            try {
              const sessions = await listSessionsByPaymentIntent(stripeEnv, paymentIntent);
              resolvedSessionId = sessions.data?.[0]?.id ?? null;
            } catch (err) {
              console.error("[stripe-webhook] session lookup failed", err);
            }
            if (!resolvedSessionId) {
              console.warn("[stripe-webhook] no session for refunded charge", {
                paymentIntent,
              });
              return new Response("ok", { status: 200 });
            }
            const { data: order, error: findErr } = await supabaseAdmin
              .from("orders")
              .select("*")
              .eq("stripe_session_id", resolvedSessionId)
              .maybeSingle();
            if (findErr) {
              console.error("[stripe-webhook] order lookup error", findErr);
              return new Response("DB error", { status: 500 });
            }
            if (!order) {
              console.warn("[stripe-webhook] no order matches refunded session", {
                resolvedSessionId,
              });
              return new Response("ok", { status: 200 });
            }

            const refundedAmountAud = amountRefunded / 100;
            const isFull = amountRefunded >= amount;
            const newStatus = isFull ? "refunded" : "partially_refunded";
            const existingRefunded = Number(order.refunded_amount ?? 0);

            // Idempotency: skip if status already matches AND refunded_amount already covers this event.
            if (
              order.payment_status === newStatus &&
              Math.abs(existingRefunded - refundedAmountAud) < 0.01
            ) {
              return new Response("ok", { status: 200 });
            }

            const refundedAt = charge.created
              ? new Date(charge.created * 1000).toISOString()
              : new Date().toISOString();

            const { error: updErr } = await supabaseAdmin
              .from("orders")
              .update({
                payment_status: newStatus,
                // Compare-and-set, never sum: amount_refunded is the cumulative
                // total Stripe holds, so this is the authoritative value.
                refunded_amount: refundedAmountAud,
                refunded_at: refundedAt,
              })
              .eq("id", order.id);
            if (updErr) {
              console.error("[stripe-webhook] refund update error", updErr);
              return new Response("DB error", { status: 500 });
            }

            try {
              const { notifyOwnerOrderRefunded } = await import(
                "@/lib/notifications.server"
              );
              const reason = charge.refunds?.data?.[0]?.reason ?? undefined;
              await notifyOwnerOrderRefunded({
                orderNumber: order.order_number,
                customerEmail: order.customer_email,
                refundedAmount: refundedAmountAud,
                originalTotal: Number(order.total),
                reason: reason ?? undefined,
                refundType: isFull ? "full" : "partial",
              });
            } catch (e) {
              console.error("[stripe-webhook] refund notify error", e);
            }
          } catch (err) {
            console.error("[stripe-webhook] charge.refunded handler error", err);
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});