import { createFileRoute } from "@tanstack/react-router";

// Sweeps online orders stuck in payment_status='pending' for >24h.
// Triggered hourly by pg_cron via pg_net; also manually invokable with
// `apikey` header (Supabase anon/publishable key) — see notes below.
//
// For each candidate, we re-check Stripe to avoid marking a successfully-paid
// order as failed when only the webhook failed. If Stripe says the session
// was paid, we auto-correct payment_status to 'paid'. Otherwise we mark
// 'failed' with an audit note appended to the existing `notes` column.

async function handleCleanup(request: Request) {
  const url = new URL(request.url);
  // Default to live (production webhook); allow override for manual testing.
  const envParam = url.searchParams.get("env");
  const stripeEnv = (envParam === "sandbox" ? "sandbox" : "live") as
    | "live"
    | "sandbox";

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { retrieveCheckoutSession } = await import("@/lib/stripe.server");

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: selErr } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, stripe_session_id, notes, total, items, delivery_date")
    .eq("payment_method", "online")
    .eq("payment_status", "pending")
    .lt("created_at", cutoff);

  if (selErr) {
    console.error("[cleanup-pending] select error", selErr);
    return new Response(JSON.stringify({ error: "select_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let rowsUpdated = 0;
  let rowsRecovered = 0;
  const errors: string[] = [];

  for (const order of candidates ?? []) {
    try {
      let stripePaid = false;
      let stripeStatusLabel = "no-session";

      if (order.stripe_session_id) {
        try {
          const session = await retrieveCheckoutSession(
            stripeEnv,
            order.stripe_session_id,
          );
          stripeStatusLabel = `${session.status ?? "unknown"}/${session.payment_status ?? "unknown"}`;
          if (session.payment_status === "paid") stripePaid = true;
        } catch (err) {
          console.warn("[cleanup-pending] stripe lookup failed", {
            order: order.order_number,
            err: err instanceof Error ? err.message : String(err),
          });
          // Skip this row — don't mark failed if we couldn't verify.
          continue;
        }
      }

      if (stripePaid) {
        const { error: updErr } = await supabaseAdmin
          .from("orders")
          .update({ payment_status: "paid" })
          .eq("id", order.id);
        if (updErr) throw updErr;
        rowsRecovered++;
        continue;
      }

      const noteLine = `Auto-marked as failed after 24h pending (no payment received) [stripe:${stripeStatusLabel}]`;
      const newNotes = order.notes ? `${order.notes}\n${noteLine}` : noteLine;
      const { error: updErr } = await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", notes: newNotes })
        .eq("id", order.id);
      if (updErr) throw updErr;
      rowsUpdated++;
      // Release reserved stock so other customers can book this date.
      try {
        const { restoreOrderStock } = await import("@/lib/orders.functions");
        await restoreOrderStock(order.items, order.delivery_date);
      } catch (err) {
        console.error("[cleanup-pending] restore stock failed", order.order_number, err);
      }
    } catch (err) {
      console.error("[cleanup-pending] row error", order.order_number, err);
      errors.push(order.order_number);
    }
  }

  const { error: logErr } = await supabaseAdmin
    .from("pending_cleanup_log")
    .insert({
      rows_updated: rowsUpdated,
      rows_recovered: rowsRecovered,
      notes: errors.length ? `errors: ${errors.join(",")}` : null,
    });
  if (logErr) console.error("[cleanup-pending] log error", logErr);

  return new Response(
    JSON.stringify({
      ok: true,
      candidates: candidates?.length ?? 0,
      rows_updated: rowsUpdated,
      rows_recovered: rowsRecovered,
      errors,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

export const Route = createFileRoute("/api/public/hooks/cleanup-pending-orders")({
  server: {
    handlers: {
      POST: async ({ request }) => handleCleanup(request),
      // Allow GET for easy manual testing from a browser/curl during ops.
      GET: async ({ request }) => handleCleanup(request),
    },
  },
});