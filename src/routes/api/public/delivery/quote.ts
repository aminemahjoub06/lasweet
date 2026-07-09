import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  address: z.string().trim().min(3).max(300),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/delivery/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate-limit: 20 quotes / hour / IP.
        try {
          const { enforceIpRateLimit } = await import("@/lib/rate-limit.server");
          await enforceIpRateLimit({
            endpoint: "delivery-quote",
            max: 20,
            windowMs: 60 * 60 * 1000,
          });
        } catch (limiter) {
          if (limiter instanceof Response) return limiter;
          console.error("[delivery-quote] rate-limit error", limiter);
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }
        const parsed = bodySchema.safeParse(payload);
        if (!parsed.success) {
          return json({ error: "Please enter a valid address." }, 400);
        }

        const { computeDeliveryQuoteForAddress } = await import("@/lib/delivery.server");
        const outcome = await computeDeliveryQuoteForAddress(parsed.data.address);

        if (outcome.status === "unresolved") {
          return json({
            deliverable: null,
            distanceKm: null,
            feeAud: null,
            method: outcome.method,
            pending: true,
            message:
              "We couldn't estimate the delivery fee automatically. We'll contact you within 24h with the exact amount.",
          });
        }

        if (outcome.status === "out_of_range") {
          return json({
            deliverable: false,
            distanceKm: outcome.distanceKm,
            feeAud: null,
            method: outcome.method,
            message:
              "Sorry, we don't deliver beyond 25 km. Please contact us at l.asweetbne@gmail.com.",
          });
        }

        return json({
          deliverable: true,
          distanceKm: outcome.distanceKm,
          feeAud: outcome.feeAud,
          method: outcome.method,
        });
      },
    },
  },
});