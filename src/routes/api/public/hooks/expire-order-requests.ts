// Cron endpoint: expires accepted order requests that weren't paid within the
// 24-hour payment window, releasing the delivery slot and notifying both sides.
import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/hooks/expire-order-requests")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!expected || !provided || provided !== expected) {
          return json({ error: "Unauthorized" }, 401);
        }
        const { expireStaleOrderRequests } = await import("@/lib/order-requests.server");
        const { expired } = await expireStaleOrderRequests();
        return json({ ok: true, expired: expired.length, orders: expired });
      },
    },
  },
});
