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
        const secret = process.env.PAYMENTS_SANDBOX_WEBHOOK_SECRET;

        if (!secret) {
          console.error("[stripe-webhook] no secret configured");
          return new Response("Webhook not configured", { status: 500 });
        }
        if (!verifyStripeSignature(rawBody, signature, secret)) {
          console.warn("[stripe-webhook] invalid signature");
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
                  delivery: updated.delivery_method,
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
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});