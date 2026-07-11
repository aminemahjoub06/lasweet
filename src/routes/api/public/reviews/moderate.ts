import { createFileRoute } from "@tanstack/react-router";

function htmlPage(body: string, status = 200): Response {
  const doc = `<!doctype html><html lang="en"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>L&A Sweet — Review Moderation</title>
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

export const Route = createFileRoute("/api/public/reviews/moderate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token) return htmlPage(`<h1>Invalid link</h1><p>Missing token.</p>`, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("review_moderation_tokens")
          .select("id, review_id, action, expires_at, used_at")
          .eq("token", token)
          .maybeSingle();

        if (!row) return htmlPage(`<h1>Invalid link</h1><p>This moderation link isn't recognised.</p>`, 404);
        if (row.used_at) return htmlPage(`<h1>Already used</h1><p>This link has already been actioned.</p>`);
        if (new Date(row.expires_at) < new Date()) return htmlPage(`<h1>Expired</h1><p>This moderation link has expired (7-day validity). Please use the admin dashboard.</p>`, 410);

        const targetStatus = row.action === "approve" ? "approved" : "rejected";
        const patch = {
          status: targetStatus as "approved" | "rejected",
          approved_at: row.action === "approve" ? new Date().toISOString() : null,
          admin_notes: row.action === "reject" ? "Rejected via email magic link." : null,
        };
        const { error } = await supabaseAdmin.from("reviews").update(patch).eq("id", row.review_id);
        if (error) {
          console.error("[moderate] update error", error);
          return htmlPage(
            `<h1>Something went wrong</h1><p>Could not action this review. Please use the admin dashboard.</p>`,
            500,
          );
        }
        await supabaseAdmin.from("review_moderation_tokens").update({ used_at: new Date().toISOString() }).eq("id", row.id);

        const verb = row.action === "approve" ? "approved and published" : "rejected";
        return htmlPage(`<h1>Review ${verb}</h1><p>The review has been ${verb} successfully.</p><p><a href="/reviews">View published reviews</a></p>`);
      },
    },
  },
});
