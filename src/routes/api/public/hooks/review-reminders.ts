// Cron endpoint that sends "How was your experience?" review reminders on J+2.
// Called daily by pg_cron with the anon key in the apikey header.
import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/hooks/review-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Require service-role bearer token — the anon key is public, so it
        // cannot be used to gate this endpoint. Matches the email queue
        // processor's auth pattern.
        const auth = request.headers.get("authorization") ?? "";
        const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!expected || !provided || provided !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Target date = today - 2 days (in ISO YYYY-MM-DD). Orders whose delivery_date
        // is that day and were paid/collected. We keep it simple: any order (not refunded)
        // whose delivery_date is exactly today-2 gets a reminder if not sent before.
        const now = new Date();
        const target = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const targetIso = target.toISOString().slice(0, 10);

        const { data: orders } = await supabaseAdmin
          .from("orders")
          .select("order_number, customer_email, customer_name, delivery_date, payment_status, refunded_at")
          .eq("delivery_date", targetIso)
          .is("refunded_at", null);

        if (!orders || !orders.length) {
          return json({ ok: true, targetDate: targetIso, processed: 0 });
        }

        // Skip already-sent orders
        const orderNumbers = orders.map((o) => o.order_number);
        const { data: alreadySent } = await supabaseAdmin
          .from("review_reminder_log")
          .select("order_number")
          .in("order_number", orderNumbers);
        const sentSet = new Set((alreadySent ?? []).map((r) => r.order_number));

        const origin = (() => {
          const url = new URL(request.url);
          return `${url.protocol}//${url.host}`;
        })();

        let sent = 0;
        const { sendReviewReminder } = await import("@/lib/review-notifications.server");

        for (const o of orders) {
          if (sentSet.has(o.order_number)) continue;
          if (!o.customer_email) continue;
          const leaveReviewUrl = `${origin}/leave-review?order=${encodeURIComponent(o.order_number)}&email=${encodeURIComponent(o.customer_email)}`;
          try {
            await sendReviewReminder({
              orderNumber: o.order_number,
              customerEmail: o.customer_email,
              customerName: o.customer_name ?? "",
              leaveReviewUrl,
            });
            await supabaseAdmin
              .from("review_reminder_log")
              .insert({ order_number: o.order_number });
            sent++;
          } catch (e) {
            console.error("[review-reminders] send failed", o.order_number, e);
          }
        }

        return json({ ok: true, targetDate: targetIso, processed: orders.length, sent });
      },
    },
  },
});
