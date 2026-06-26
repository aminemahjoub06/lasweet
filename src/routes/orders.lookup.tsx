import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { useServerFn } from "@tanstack/react-start";
import { lookupOrderByEmail } from "@/lib/orders.functions";

export const Route = createFileRoute("/orders/lookup")({
  component: OrderLookupPage,
  head: () => ({
    meta: [
      { title: "Find my order — L & A Sweet" },
      {
        name: "description",
        content:
          "Look up the status of an order you placed with L & A Sweet using your email and order number.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type OrderRow = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  delivery_method: string;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  order_type: string | null;
  notes: string | null;
  total: number;
  payment_method: string;
  payment_status: string;
  payment_plan?: string;
  amount_paid_online?: number;
  balance_due_cash?: number;
  balance_collected_at?: string | null;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Awaiting payment",
  failed: "Payment failed",
  cash_pending: "Cash — to be paid on collection / delivery",
  deposit_paid: "Deposit paid — balance due in cash",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

function OrderLookupPage() {
  const lookup = useServerFn(lookupOrderByEmail);
  const [email, setEmail] = React.useState("");
  const [orderNumber, setOrderNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<OrderRow | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const row = await lookup({
        data: { email: email.trim(), orderNumber: orderNumber.trim() },
      });
      setOrder(row as OrderRow);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't find an order matching that email and order number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const items = Array.isArray(order?.items)
    ? (order!.items as Array<{
        name: string;
        prefix?: string;
        suffix?: string;
        qty: number;
        price: number;
        sizeLabel?: string;
      }>)
    : [];

  return (
    <main className="min-h-screen bg-ink text-[color:var(--foreground)]">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link
          to="/"
          className="text-[11px] tracking-[0.24em] uppercase text-gold hover:underline"
        >
          ← Back to L & A Sweet
        </Link>
        <h1 className="font-serif-display text-4xl md:text-5xl mt-6 mb-3">
          Find <span className="italic text-gold">my order</span>
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/70 leading-relaxed mb-8">
          Enter the email you used when placing your order and the order number
          we sent you (it looks like <span className="text-gold">LAS-26-XXXXX</span>).
        </p>

        <form
          onSubmit={onSubmit}
          className="space-y-4 border border-line bg-ink-2 p-6"
        >
          <div>
            <label className="block text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/70 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-3/60 border border-line focus:border-gold/70 focus:outline-none px-4 py-3 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/70 mb-2">
              Order number
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full bg-ink-3/60 border border-line focus:border-gold/70 focus:outline-none px-4 py-3 text-sm font-mono tracking-widest"
              placeholder="LAS-26-XXXXX"
              maxLength={40}
            />
          </div>
          {error && (
            <p className="text-[12px] text-[color:var(--destructive)] border border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/10 px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !email || !orderNumber}
            className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-3 hover:bg-[color:var(--gold-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Looking up…" : "Find my order"}
          </button>
          <p className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/45 leading-relaxed">
            For your security, we only show an order when both the email and
            order number match.
          </p>
        </form>

        {order && (
          <section className="mt-10 border border-gold/40 bg-ink-2 p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55">
                  Order
                </div>
                <div className="font-serif-display text-2xl text-gold">
                  {order.order_number}
                </div>
              </div>
              <span className="text-[10px] tracking-[0.24em] uppercase border border-gold/50 text-gold px-3 py-1.5">
                {STATUS_LABEL[order.payment_status] ?? order.payment_status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55 mb-1">
                  Customer
                </div>
                <div>{order.customer_name}</div>
                <div className="text-[color:var(--foreground)]/65">
                  {order.customer_email}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55 mb-1">
                  {order.delivery_method === "delivery" ? "Delivery" : "Pick-up"}
                </div>
                <div>
                  {order.delivery_date ?? "—"}
                  {order.delivery_time ? ` · ${order.delivery_time}` : ""}
                </div>
                {order.delivery_method === "delivery" && order.delivery_address && (
                  <div className="text-[color:var(--foreground)]/65">
                    {order.delivery_address}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55 mb-3">
                Items
              </div>
              <ul className="space-y-2 text-sm">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>
                      {it.qty} × {it.prefix || ""}
                      {it.suffix || it.name}
                      {it.sizeLabel ? ` (${it.sizeLabel})` : ""}
                    </span>
                    <span className="text-[color:var(--foreground)]/75">
                      ${(it.qty * it.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-line pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-[color:var(--foreground)]/65">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[color:var(--foreground)]/65">
                <span>Delivery fee</span>
                <span>${Number(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-serif-display text-lg text-gold pt-2">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {order.payment_plan === "deposit_50" && (
              <div className="mt-4 border border-gold/40 bg-ink-3/60 px-4 py-3 text-sm space-y-1">
                <div className="text-[10px] tracking-[0.24em] uppercase text-gold mb-1">
                  Deposit breakdown
                </div>
                <div className="flex justify-between">
                  <span>Deposit paid online</span>
                  <span>A${Number(order.amount_paid_online ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gold">
                  <span>
                    Balance due in cash on{" "}
                    {order.delivery_method === "delivery" ? "delivery" : "pick-up"}
                  </span>
                  <span>A${Number(order.balance_due_cash ?? 0).toFixed(2)}</span>
                </div>
                {order.balance_collected_at && (
                  <div className="text-[11px] text-[color:var(--foreground)]/60 pt-1">
                    Balance collected on{" "}
                    {new Date(order.balance_collected_at).toLocaleDateString("en-AU")}.
                  </div>
                )}
              </div>
            )}

            {order.notes && (
              <div className="mt-5 text-[12px] text-[color:var(--foreground)]/60 italic border-t border-line pt-3">
                Notes: {order.notes}
              </div>
            )}

            <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/50 leading-relaxed">
              Anything wrong with your order? Reply to the confirmation email or
              contact us — we'll sort it out.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}