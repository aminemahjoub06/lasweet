import { createFileRoute } from "@tanstack/react-router";

// Auto-cancels pick-up orders that were never collected.
//
// Business rule: a customer who books a pick-up slot and hasn't shown up one
// hour after that slot, without contacting us, has their order cancelled with
// no refund (deposit or full payment is kept). Setting `picked_up_at` from the
// admin dashboard protects an order from this sweep.
//
// Triggered every 15 minutes by pg_cron via pg_net with the service-role
// bearer token.

const GRACE_MINUTES = 60;

/** Current Brisbane date (YYYY-MM-DD) and minutes-since-midnight. */
function brisbaneNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10) % 24;
  const minutes = hour * 60 + parseInt(get("minute"), 10);
  return { date, minutes };
}

function slotMinutes(time: string | null): number | null {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

async function handleSweep(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!expected || !provided || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { date: today, minutes: nowMinutes } = brisbaneNow(new Date());

  const { data: candidates, error: selErr } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, customer_phone, delivery_date, delivery_time, total, amount_paid_online, payment_status, notes",
    )
    .eq("delivery_method", "pickup")
    .eq("delivery_date", today)
    .is("picked_up_at", null)
    .is("no_show_cancelled_at", null)
    .not("payment_status", "in", '("failed","refunded","cancelled_no_show")');

  if (selErr) {
    console.error("[no-show] select error", selErr);
    return new Response(JSON.stringify({ error: "select_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let cancelled = 0;
  const errors: string[] = [];
  const cancelledOrders: string[] = [];

  for (const order of candidates ?? []) {
    const slot = slotMinutes(order.delivery_time);
    if (slot === null) continue;
    if (nowMinutes <= slot + GRACE_MINUTES) continue;

    try {
      const nowIso = new Date().toISOString();
      const noteLine = `Auto-cancelled as a no-show (not collected within ${GRACE_MINUTES} minutes of the ${order.delivery_time} pick-up slot). No refund per our no-show policy.`;
      const { error: updErr } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "cancelled_no_show",
          order_status: "cancelled_no_show",
          no_show_cancelled_at: nowIso,
          notes: order.notes ? `${order.notes}\n${noteLine}` : noteLine,
        })
        .eq("id", order.id)
        .is("picked_up_at", null)
        .is("no_show_cancelled_at", null);
      if (updErr) throw updErr;

      await supabaseAdmin
        .from("no_show_log")
        .insert({ order_number: order.order_number, cancelled_at: nowIso });

      try {
        const { notifyNoShowCancellation } = await import("@/lib/notifications.server");
        await notifyNoShowCancellation({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          pickupDate: order.delivery_date,
          pickupTime: order.delivery_time,
          total: Number(order.total ?? 0),
          amountPaidOnline: Number(order.amount_paid_online ?? 0),
          paymentStatus: order.payment_status,
        });
      } catch (err) {
        console.error("[no-show] email failed", order.order_number, err);
      }

      cancelled++;
      cancelledOrders.push(order.order_number);
    } catch (err) {
      console.error("[no-show] row error", order.order_number, err);
      errors.push(order.order_number);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      brisbane_date: today,
      candidates: candidates?.length ?? 0,
      cancelled,
      cancelled_orders: cancelledOrders,
      errors,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

export const Route = createFileRoute("/api/public/hooks/no-show-cancellations")({
  server: {
    handlers: {
      POST: async ({ request }) => handleSweep(request),
    },
  },
});
