import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { getOrderStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/order/success")({
  validateSearch: (s) =>
    z
      .object({ order: z.string().optional(), session_id: z.string().optional() })
      .parse(s),
  component: OrderSuccessPage,
  head: () => ({
    meta: [
      { title: "Order confirmed · L&A Sweet" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

type OrderItem = {
  name?: string;
  qty?: number;
  price?: number;
  sizeLabel?: string;
  prefix?: string;
  suffix?: string;
};

function OrderSuccessPage() {
  const { order } = Route.useSearch();
  const fetchStatus = useServerFn(getOrderStatus);
  const [showReceipt, setShowReceipt] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["order-status", order],
    queryFn: () => (order ? fetchStatus({ data: { orderNumber: order } }) : Promise.resolve(null)),
    enabled: !!order,
    refetchInterval: (q) =>
      q.state.data &&
      (q.state.data.payment_status === "paid" ||
        q.state.data.payment_status === "deposit_paid")
        ? false
        : 3000,
    refetchIntervalInBackground: false,
  });

  const paid = data?.payment_status === "paid";
  const depositPaid = data?.payment_status === "deposit_paid";
  const amountPaidOnline = Number((data as unknown as { amount_paid_online?: number })?.amount_paid_online ?? 0);
  const balanceDueCash = Number((data as unknown as { balance_due_cash?: number })?.balance_due_cash ?? 0);
  const isDelivery = data?.delivery_method === "delivery";
  const items: OrderItem[] = Array.isArray(data?.items) ? (data!.items as OrderItem[]) : [];
  const createdAt = data?.created_at ? new Date(data.created_at).toLocaleString("en-GB") : "";

  return (
    <main className="min-h-screen bg-ink text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl border border-gold/30 bg-ink-2 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center border border-gold/50 text-gold text-xl">
          ✓
        </div>
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">
          {paid ? "Payment confirmed" : depositPaid ? "Deposit confirmed" : "Order received"}
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl mb-4">
          Thank you for your <span className="italic text-gold">order</span>
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
          Your order has been received. We&apos;ll prepare your selection and contact you
          shortly if we need any additional details.
        </p>

        {order && (
          <div className="mt-8 inline-block border border-gold/40 bg-ink-3/60 px-6 py-4">
            <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-1">
              Order reference
            </div>
            <div className="font-serif-display text-2xl text-gold tracking-wider">{order}</div>
          </div>
        )}

        <p className="mt-4 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
          Order saved successfully.
        </p>

        {data && (paid || depositPaid) && (
          <div className="mt-6 mx-auto max-w-md border border-gold/40 bg-ink-3/60 px-5 py-4 text-left text-sm leading-relaxed">
            {depositPaid ? (
              <>
                <p className="text-gold font-serif-display text-base mb-2">
                  Deposit of A${amountPaidOnline.toFixed(2)} received.
                </p>
                <p>
                  Please bring <span className="text-gold">A${balanceDueCash.toFixed(2)}</span> in
                  cash on {isDelivery ? "delivery" : "pick-up"}.
                </p>
              </>
            ) : (
              <p className="text-gold">Payment received in full. Nothing else to pay.</p>
            )}
          </div>
        )}

        {isLoading && !data && (
          <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
            Loading order…
          </p>
        )}

        {data && (
          <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left text-sm">
            <div className="border border-line bg-ink-3/40 p-4">
              <div className="text-[10px] tracking-[0.24em] uppercase text-gold/80 mb-1">Customer</div>
              <div className="font-serif-display">{data.customer_name}</div>
              <div className="text-[color:var(--foreground)]/70">{data.customer_email}</div>
              {data.customer_phone && (
                <div className="text-[color:var(--foreground)]/70">{data.customer_phone}</div>
              )}
              {data.business && (
                <div className="text-[color:var(--foreground)]/70">{data.business}</div>
              )}
            </div>
            <div className="border border-line bg-ink-3/40 p-4">
              <div className="text-[10px] tracking-[0.24em] uppercase text-gold/80 mb-1">Fulfilment</div>
              <div>{data.delivery_method === "delivery" ? "Delivery" : "Pick-up"}</div>
              {data.delivery_address && (
                <div className="text-[color:var(--foreground)]/70">{data.delivery_address}</div>
              )}
              {data.delivery_date && (
                <div className="text-[color:var(--foreground)]/70">Date: {fmtDate(data.delivery_date)}</div>
              )}
              {data.order_type && (
                <div className="text-[color:var(--foreground)]/70">Occasion: {data.order_type}</div>
              )}
            </div>
          </div>
        )}

        {data && showReceipt && (
          <div className="mt-6 border border-gold/40 bg-ink-3/60 p-5 text-left">
            <div className="flex items-baseline justify-between mb-3">
              <div className="font-serif-display text-lg text-gold">L&amp;A Sweet</div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55">
                Order Receipt
              </div>
            </div>
            <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60 mb-3">
              {data.order_number} · {createdAt}
            </div>
            <ul className="divide-y divide-line text-sm">
              {items.map((i, idx) => (
                <li key={idx} className="flex justify-between py-2">
                  <span>
                    {i.qty} × {i.name}
                    {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ""}
                  </span>
                  <span className="text-gold">
                    ${((i.qty ?? 0) * (i.price ?? 0)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line mt-3 pt-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(data.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>${Number(data.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-serif-display text-base pt-1">
                <span>Total</span>
                <span className="text-gold">${Number(data.total).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-line mt-3 pt-3 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60 flex justify-between">
              <span>Payment: {data.payment_method === "cash" ? "Cash" : "Online"}</span>
              <span className="text-gold">{data.payment_status}</span>
            </div>
            {data.notes && (
              <p className="mt-3 text-[color:var(--foreground)]/65 italic text-sm">
                “{data.notes}”
              </p>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            Return Home
          </Link>
          {data && (
            <button
              type="button"
              onClick={() => setShowReceipt((v) => !v)}
              className="inline-flex items-center justify-center text-[10px] tracking-[0.24em] uppercase text-ink bg-gold px-5 py-3 hover:bg-[color:var(--gold-soft)] transition-colors"
            >
              {showReceipt ? "Hide Order Summary" : "View Order Summary"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}