// Owner magic-link endpoint: accept or decline an order request from the email.
// Single-use tokens, 7-day validity — same pattern as review moderation.
import { createFileRoute } from "@tanstack/react-router";

function htmlPage(body: string, status = 200): Response {
  const doc = `<!doctype html><html lang="en"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>L&A Sweet — Order Request</title>
  <style>
    body{background:#0a0806;color:#f4ecdc;font-family:Inter,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;padding:24px}
    .card{max-width:480px;text-align:center;border:1px solid rgba(201,161,74,.4);padding:32px;background:rgba(255,255,255,.02)}
    h1{font-family:'Cormorant Garamond',serif;color:#c9a14a;font-weight:500;margin:0 0 12px;font-size:28px}
    p{color:#c0b7a4;line-height:1.5;font-size:14px}
    a{color:#c9a14a}
  </style>
  </head><body><div class="card">${body}</div></body></html>`;
  return new Response(doc, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/orders/request-action")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token) return htmlPage(`<h1>Invalid link</h1><p>Missing token.</p>`, 400);

        const {
          readRequestToken,
          markTokenUsed,
          acceptOrderRequest,
          declineOrderRequest,
        } = await import("@/lib/order-requests.server");

        const lookup = await readRequestToken(token);
        if (!lookup.ok) {
          if (lookup.reason === "used") {
            return htmlPage(
              `<h1>Already actioned</h1><p>This request has already been accepted or declined.</p><p><a href="/admin/orders">Open the admin dashboard</a></p>`,
            );
          }
          if (lookup.reason === "expired") {
            return htmlPage(
              `<h1>Expired</h1><p>This link has expired (7-day validity). Please use the admin dashboard.</p>`,
              410,
            );
          }
          return htmlPage(`<h1>Invalid link</h1><p>This link isn't recognised.</p>`, 404);
        }
        if (lookup.action !== "accept" && lookup.action !== "decline") {
          return htmlPage(`<h1>Invalid link</h1><p>This link isn't recognised.</p>`, 404);
        }

        const origin = `${url.protocol}//${url.host}`;
        const outcome =
          lookup.action === "accept"
            ? await acceptOrderRequest(lookup.orderNumber, origin)
            : await declineOrderRequest(lookup.orderNumber);

        await markTokenUsed(lookup.id);

        if (!outcome.ok) {
          return htmlPage(`<h1>Not possible</h1><p>${outcome.message}</p>`, 409);
        }
        if (lookup.action === "accept") {
          return htmlPage(
            `<h1>Request accepted</h1><p>Order <strong>${lookup.orderNumber}</strong> is confirmed available. The customer has been emailed a secure payment link, valid for 24 hours.</p><p><a href="/admin/orders">Open the admin dashboard</a></p>`,
          );
        }
        return htmlPage(
          `<h1>Request declined</h1><p>Order <strong>${lookup.orderNumber}</strong> has been declined, the customer has been emailed and the delivery slot (if any) is released.</p><p><a href="/admin/orders">Open the admin dashboard</a></p>`,
        );
      },
    },
  },
});
