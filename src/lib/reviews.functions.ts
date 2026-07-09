// Client-safe server function wrappers for reviews.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  photo_urls: string[];
  verified_purchase: boolean;
  created_at: string;
  approved_at: string | null;
};

export type ReviewsPayload = {
  reviews: PublicReview[];
  aggregate: { count: number; average: number };
};

/**
 * Public list of approved reviews. Uses service role internally to bypass
 * anon key gotchas; only projects safe columns and only reads approved rows.
 */
export const listApprovedReviews = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number; offset?: number; rating?: number | null } | undefined) => ({
    limit: Math.max(1, Math.min(48, Number(input?.limit ?? 12))),
    offset: Math.max(0, Number(input?.offset ?? 0)),
    rating: input?.rating ?? null,
  }))
  .handler(async ({ data }): Promise<ReviewsPayload & { total: number }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("reviews")
      .select(
        "id, reviewer_name, rating, comment, photo_urls, verified_purchase, created_at, approved_at",
        { count: "exact" },
      )
      .eq("status", "approved")
      .order("approved_at", { ascending: false, nullsFirst: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.rating && data.rating >= 1 && data.rating <= 5) {
      q = q.eq("rating", data.rating);
    }
    const { data: rows, count } = await q;
    const list = ((rows ?? []) as unknown as PublicReview[]).map((r) => ({
      ...r,
      photo_urls: Array.isArray(r.photo_urls) ? r.photo_urls : [],
    }));
    // Aggregate always uses full pool (not filtered) for stable rating display.
    const { data: allRatings } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("status", "approved");
    const ratings = (allRatings ?? []) as Array<{ rating: number }>;
    const sum = ratings.reduce((a, r) => a + Number(r.rating || 0), 0);
    const avg = ratings.length ? Math.round((sum / ratings.length) * 10) / 10 : 0;
    return {
      reviews: list,
      aggregate: { count: ratings.length, average: avg },
      total: count ?? list.length,
    };
  });

/** Home page compact fetch — up to 6 latest approved. */
export const getHomeReviews = createServerFn({ method: "GET" }).handler(async (): Promise<ReviewsPayload> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: latest } = await supabaseAdmin
    .from("reviews")
    .select("id, reviewer_name, rating, comment, photo_urls, verified_purchase, created_at, approved_at")
    .eq("status", "approved")
    .order("approved_at", { ascending: false, nullsFirst: false })
    .limit(6);
  const { data: allRatings } = await supabaseAdmin
    .from("reviews")
    .select("rating")
    .eq("status", "approved");
  const ratings = (allRatings ?? []) as Array<{ rating: number }>;
  const sum = ratings.reduce((a, r) => a + Number(r.rating || 0), 0);
  const avg = ratings.length ? Math.round((sum / ratings.length) * 10) / 10 : 0;
  const list = ((latest ?? []) as unknown as PublicReview[]).map((r) => ({
    ...r,
    photo_urls: Array.isArray(r.photo_urls) ? r.photo_urls : [],
  }));
  return { reviews: list, aggregate: { count: ratings.length, average: avg } };
});

// ---- Admin moderation --------------------------------------------------------
const adminSchema = z.object({ password: z.string().min(1).max(200) });

function checkAdmin(password: string) {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected || password !== expected) throw new Error("Invalid admin password.");
}

export const adminListReviews = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    adminSchema.extend({
      status: z.enum(["all", "pending", "approved", "rejected"]).default("pending"),
      search: z.string().max(200).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.search && data.search.trim()) {
      const s = data.search.trim();
      q = q.or(
        `reviewer_name.ilike.%${s}%,reviewer_email.ilike.%${s}%,order_number.ilike.%${s}%`,
      );
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { reviews: rows ?? [] };
  });

export const adminModerateReview = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    adminSchema.extend({
      reviewId: z.string().uuid(),
      action: z.enum(["approve", "reject", "delete"]),
      note: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.action === "delete") {
      // Best-effort remove photos too
      const { data: existing } = await supabaseAdmin
        .from("reviews")
        .select("photo_urls")
        .eq("id", data.reviewId)
        .maybeSingle();
      const urls = ((existing?.photo_urls as string[]) ?? []).filter(Boolean);
      if (urls.length) {
        const paths = urls.map((u) => {
          const marker = "/review-photos/";
          const idx = u.indexOf(marker);
          return idx >= 0 ? u.slice(idx + marker.length) : null;
        }).filter((p): p is string => !!p);
        if (paths.length) {
          await supabaseAdmin.storage.from("review-photos").remove(paths);
        }
      }
      const { error } = await supabaseAdmin.from("reviews").delete().eq("id", data.reviewId);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const patch = {
      status: (data.action === "approve" ? "approved" : "rejected") as "approved" | "rejected",
      admin_notes: data.note ?? null,
      approved_at: data.action === "approve" ? new Date().toISOString() : null,
    };
    const { error } = await supabaseAdmin.from("reviews").update(patch).eq("id", data.reviewId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
