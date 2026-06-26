import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { listAdminOrders } from "@/lib/admin.functions";
import { markBalanceCollected } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
  head: () => ({
    meta: [
      { title: "Admin · Orders" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  business: string | null;
  delivery_method: string;
  delivery_address: string | null;
  delivery_date: string | null;
  order_type: string | null;
  notes: string | null;
  items: Array<{ name?: string; qty?: number; price?: number; sizeLabel?: string }>;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  payment_plan?: string | null;
  amount_paid_online?: number | null;
  balance_due_cash?: number | null;
  balance_collected_at?: string | null;
  created_at: string;
};

function AdminOrdersPage() {
  const fetchOrders = useServerFn(listAdminOrders);
  const collectBalance = useServerFn(markBalanceCollected);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [collectingId, setCollectingId] = useState<string | null>(null);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders({ data: { password } });
      setOrders(res.orders as Order[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCollect(o: Order) {
    if (collectingId) return;
    if (!confirm(`Mark balance of A$${Number(o.balance_due_cash ?? 0).toFixed(2)} as collected for ${o.order_number}?`)) {
      return;
    }
    setCollectingId(o.id);
    try {
      await collectBalance({ data: { password, orderNumber: o.order_number } });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to mark balance collected.");
    } finally {
      setCollectingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-foreground px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-baseline justify-between mb-6">
          <h1 className="font-serif-display text-3xl text-gold">Orders</h1>
          {orders && (
            <button
              type="button"
              onClick={() => load()}
              className="text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-3 py-2 hover:bg-gold hover:text-ink transition-colors"
            >
              Refresh
            </button>
          )}
        </header>

        {!orders && (
          <form onSubmit={load} className="max-w-sm border border-line bg-ink-2 p-6 space-y-4">
            <label className="block text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/70">
              Admin password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-3 border border-line px-3 py-2 text-sm"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full text-[10px] tracking-[0.24em] uppercase text-ink bg-gold px-4 py-3 disabled:opacity-50"
            >
              {loading ? "Loading…" : "View orders"}
            </button>
          </form>
        )}

        {orders && (
          <div className="border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-2 text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/70">
                <tr>
                  <th className="text-left px-3 py-2">Order #</th>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Customer</th>
                  <th className="text-left px-3 py-2">Method</th>
                  <th className="text-left px-3 py-2">Pay</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-right px-3 py-2">Total</th>
                  <th className="text-right px-3 py-2">Balance to collect</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr
                      className="border-t border-line cursor-pointer hover:bg-ink-2"
                      onClick={() => setOpenId(openId === o.id ? null : o.id)}
                    >
                      <td className="px-3 py-2 text-gold">{o.order_number}</td>
                      <td className="px-3 py-2">{new Date(o.created_at).toLocaleString("en-GB")}</td>
                      <td className="px-3 py-2">
                        {o.customer_name}
                        <div className="text-[11px] text-[color:var(--foreground)]/60">{o.customer_email}</div>
                      </td>
                      <td className="px-3 py-2">{o.delivery_method}</td>
                      <td className="px-3 py-2">
                        {o.payment_plan === "deposit_50" ? "deposit 50%" : o.payment_method}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            o.payment_status === "paid"
                              ? "text-green-400"
                              : o.payment_status === "deposit_paid"
                                ? "text-yellow-400"
                                : o.payment_status === "pending"
                                  ? "text-yellow-400"
                                  : "text-[color:var(--foreground)]/70"
                          }
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-gold">${Number(o.total).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {o.payment_status === "deposit_paid" && Number(o.balance_due_cash ?? 0) > 0 ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-gold font-semibold">
                              ${Number(o.balance_due_cash).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              disabled={collectingId === o.id}
                              onClick={() => handleCollect(o)}
                              className="text-[9px] tracking-[0.22em] uppercase text-ink bg-gold px-2 py-1 hover:bg-[color:var(--gold-soft)] disabled:opacity-50"
                            >
                              {collectingId === o.id ? "Saving…" : "Mark balance collected"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[color:var(--foreground)]/40">—</span>
                        )}
                      </td>
                    </tr>
                    {openId === o.id && (
                      <tr className="bg-ink-3/40">
                        <td colSpan={8} className="px-3 py-4 text-xs">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80 mb-1">Customer</div>
                              <div>{o.customer_phone}</div>
                              {o.business && <div>{o.business}</div>}
                              {o.order_type && <div>Occasion: {o.order_type}</div>}
                            </div>
                            <div>
                              <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80 mb-1">Fulfilment</div>
                              {o.delivery_address && <div>{o.delivery_address}</div>}
                              {o.delivery_date && <div>Date: {o.delivery_date}</div>}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80 mb-1">Items</div>
                            <ul>
                              {o.items.map((i, idx) => (
                                <li key={idx} className="flex justify-between border-b border-line/40 py-1">
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
                            <div className="flex justify-between mt-2">
                              <span>Subtotal</span>
                              <span>${Number(o.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery</span>
                              <span>${Number(o.delivery_fee).toFixed(2)}</span>
                            </div>
                            {o.notes && (
                              <p className="italic text-[color:var(--foreground)]/70 mt-2">"{o.notes}"</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-[color:var(--foreground)]/60">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}