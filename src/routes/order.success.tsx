import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { getOrderStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/order/success")({
  validateSearch: (s) => z.object({ order: z.string().optional() }).parse(s),
  component: OrderSuccessPage,
  head: () => ({
    meta: [
      { title: "Order confirmed · L&A Sweet" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function OrderSuccessPage() {
  const { order } = Route.useSearch();
  const fetchStatus = useServerFn(getOrderStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["order-status", order],
    queryFn: () => (order ? fetchStatus({ data: { orderNumber: order } }) : Promise.resolve(null)),
    enabled: !!order,
    refetchInterval: (q) =>
      q.state.data && q.state.data.payment_status === "paid" ? false : 3000,
    refetchIntervalInBackground: false,
  });

  const paid = data?.payment_status === "paid";

  return (
    <main className="min-h-screen bg-ink text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl border border-gold/30 bg-ink-2 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center border border-gold/50 text-gold text-xl">
          ✓
        </div>
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">
          {paid ? "Payment confirmed" : "Order received"}
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl mb-4">
          Thank you — your <span className="italic text-gold">order</span> is on its way.
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
          {paid
            ? "Your payment has been received. We'll be in touch shortly to confirm the final details."
            : "We're confirming your payment. This page will update automatically."}
        </p>

        {order && (
          <div className="mt-8 inline-block border border-gold/40 bg-ink-3/60 px-6 py-4">
            <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-1">
              Order reference
            </div>
            <div className="font-serif-display text-2xl text-gold tracking-wider">{order}</div>
          </div>
        )}

        {data && (
          <div className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
            Total: <span className="text-gold">${Number(data.total).toFixed(2)}</span> ·
            {" "}
            {data.delivery_method === "delivery" ? "Delivery" : "Pick-up"}
          </div>
        )}

        {isLoading && !data && (
          <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
            Loading order…
          </p>
        )}

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}