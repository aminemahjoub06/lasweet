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
            deliverable: false,
            distanceKm: null,
            feeAud: null,
            minPieces: 0,
            method: outcome.method,
            pending: false,
            code: "delivery_address_unverified",
            message:
              "We couldn't verify your delivery address. Please check your address and try again, choose pickup, or contact us at l.asweetbne@gmail.com for assistance.",
          });
        }

        if (outcome.status === "out_of_range") {
          const { OUT_OF_RANGE_MESSAGE } = await import("@/lib/config");
          return json({
            deliverable: false,
            distanceKm: outcome.distanceKm,
            feeAud: null,
            minPieces: 0,
            method: outcome.method,
            code: "delivery_out_of_range",
            message: OUT_OF_RANGE_MESSAGE,
          });
        }

        const { LONG_DISTANCE_MIN_PIECES_MESSAGE } = await import("@/lib/config");
        return json({
          deliverable: true,
          distanceKm: outcome.distanceKm,
          feeAud: outcome.feeAud,
          minPieces: outcome.minPieces,
          method: outcome.method,
          ...(outcome.minPieces > 0
            ? { message: LONG_DISTANCE_MIN_PIECES_MESSAGE }
            : {}),
        });
      },
    },
  },
});