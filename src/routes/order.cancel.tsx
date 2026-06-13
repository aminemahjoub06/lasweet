import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/order/cancel")({
  validateSearch: (s) => z.object({ order: z.string().optional() }).parse(s),
  component: OrderCancelPage,
  head: () => ({
    meta: [
      { title: "Payment cancelled · L&A Sweet" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function OrderCancelPage() {
  const { order } = Route.useSearch();
  return (
    <main className="min-h-screen bg-ink text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl border border-gold/30 bg-ink-2 p-8 sm:p-12 text-center">
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Payment cancelled</div>
        <h1 className="font-serif-display text-3xl sm:text-4xl mb-4">
          Your <span className="italic text-gold">payment</span> was not completed.
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
          No charge was made. You can return to the shop and try again or choose
          cash on pick-up / delivery.
        </p>
        {order && (
          <div className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
            Reference: <span className="text-gold">{order}</span>
          </div>
        )}
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  );
}