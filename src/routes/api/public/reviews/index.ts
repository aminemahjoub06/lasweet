import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const nameSchema = z.string().trim().min(1).max(80);
const emailSchema = z.string().trim().toLowerCase().email().max(200);
const commentSchema = z.string().trim().min(20).max(1000);
const ratingSchema = z.coerce.number().int().min(1).max(5);
const orderNumberSchema = z
  .string()
  .trim()
  .regex(/^LAS-\d{2}-[A-Z0-9]{4,10}$/i)
  .optional()
  .or(z.literal("").transform(() => undefined));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function getSiteOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export const Route = createFileRoute("/api/public/reviews/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate-limit: 2 reviews / IP / day, 1 review / email / day (custom SQL check).
        const { getClientIp } = await import("@/lib/rate-limit.server");
        const ip = getClientIp();

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return json({ error: "Invalid submission." }, 400);
        }

        const nameRes = nameSchema.safeParse(form.get("name"));
        const emailRes = emailSchema.safeParse(form.get("email"));
        const ratingRes = ratingSchema.safeParse(form.get("rating"));
        const commentRes = commentSchema.safeParse(form.get("comment"));
        const orderRes = orderNumberSchema.safeParse(form.get("order_number") ?? "");

        if (!nameRes.success || !emailRes.success || !ratingRes.success || !commentRes.success) {
          return json({
            error: "Please check your review — name, email, a rating from 1 to 5 and a comment of at least 20 characters are required.",
          }, 400);
        }
        if (!orderRes.success) {
          return json({ error: "Order number format looks incorrect (expected LAS-YY-XXXXX)." }, 400);
        }

        const name = nameRes.data;
        const email = emailRes.data;
        const rating = ratingRes.data;
        const comment = commentRes.data;
        const orderNumberInput = orderRes.data?.toUpperCase() ?? null;

        // Anti-spam heuristics
        const { checkComment } = await import("@/lib/reviews.server");
        const spam = checkComment(comment);
        if (!spam.ok) {
          return json({ error: spam.reason ?? "Your review couldn't be submitted." }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Day-window rate-limit: 2/IP, 1/email
        const sinceDay = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        try {
          if (ip) {
            const { count } = await supabaseAdmin
              .from("reviews")
              .select("id", { count: "exact", head: true })
              .eq("ip_address", ip)
              .gte("created_at", sinceDay);
            if ((count ?? 0) >= 2) {
              return json({ error: "You've already left a couple of reviews today. Please come back tomorrow." }, 429);
            }
          }
          const { count: eCount } = await supabaseAdmin
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("reviewer_email", email)
            .gte("created_at", sinceDay);
          if ((eCount ?? 0) >= 1) {
            return json({ error: "We've already received a review from this email address in the last 24 hours. Thank you!" }, 429);
          }
        } catch (e) {
          console.error("[reviews] rate-limit check failed", e);
        }

        // Verified purchase check
        let verifiedPurchase = false;
        let orderNumberStored: string | null = null;
        if (orderNumberInput) {
          const { data: match } = await supabaseAdmin
            .from("orders")
            .select("order_number")
            .eq("order_number", orderNumberInput)
            .ilike("customer_email", email)
            .maybeSingle();
          if (match) {
            verifiedPurchase = true;
            orderNumberStored = orderNumberInput;
          } else {
            // Keep the reference but don't mark verified
            orderNumberStored = orderNumberInput;
          }
        }

        // Insert the review row first (pending) so we have an ID for photo paths.
        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("reviews")
          .insert({
            order_number: orderNumberStored,
            reviewer_name: name,
            reviewer_email: email,
            rating,
            comment,
            photo_urls: [],
            status: "pending",
            verified_purchase: verifiedPurchase,
            ip_address: ip,
          })
          .select("id")
          .single();

        if (insertErr || !inserted) {
          console.error("[reviews] insert failed", insertErr);
          return json({ error: "We couldn't save your review. Please try again in a moment." }, 500);
        }

        // Handle photos (up to 3). Client should have already compressed.
        const rawPhotos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
        const photos = rawPhotos.slice(0, 3);
        const uploaded: string[] = [];
        const { ALLOWED_MIME, MAX_PHOTO_BYTES, extToMime, publicPhotoUrl } = await import("@/lib/reviews.server");
        const SUPABASE_URL = process.env.SUPABASE_URL ?? "";

        for (let i = 0; i < photos.length; i++) {
          const f = photos[i]!;
          if (!ALLOWED_MIME.has(f.type)) continue;
          if (f.size > MAX_PHOTO_BYTES) continue;
          const ext = extToMime(f.type);
          const path = `${inserted.id}/${i}.${ext}`;
          const buffer = await f.arrayBuffer();
          const { error: upErr } = await supabaseAdmin.storage
            .from("review-photos")
            .upload(path, buffer, {
              contentType: f.type,
              upsert: true,
            });
          if (upErr) {
            console.error("[reviews] photo upload failed", upErr);
            continue;
          }
          uploaded.push(publicPhotoUrl(SUPABASE_URL, path));
        }

        if (uploaded.length) {
          await supabaseAdmin
            .from("reviews")
            .update({ photo_urls: uploaded })
            .eq("id", inserted.id);
        }

        // Create signed moderation tokens
        const { generateReviewToken } = await import("@/lib/reviews.server");
        const approveToken = generateReviewToken();
        const rejectToken = generateReviewToken();
        await supabaseAdmin.from("review_moderation_tokens").insert([
          { review_id: inserted.id, action: "approve", token: approveToken },
          { review_id: inserted.id, action: "reject", token: rejectToken },
        ]);

        const origin = getSiteOrigin(request);
        const approveUrl = `${origin}/api/public/reviews/moderate?token=${approveToken}`;
        const rejectUrl = `${origin}/api/public/reviews/moderate?token=${rejectToken}`;

        // Fire admin notification
        try {
          const { notifyAdminNewReview } = await import("@/lib/review-notifications.server");
          await notifyAdminNewReview({
            reviewId: inserted.id,
            reviewerName: name,
            reviewerEmail: email,
            rating,
            comment,
            photoUrls: uploaded,
            orderNumber: orderNumberStored,
            verifiedPurchase,
            approveUrl,
            rejectUrl,
          });
        } catch (e) {
          console.error("[reviews] admin notification failed", e);
        }

        return json({
          ok: true,
          message: "Your review is pending approval and will be visible within 48 hours.",
        });
      },
    },
  },
});
