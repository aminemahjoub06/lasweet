import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getRequestPaymentContext, startRequestPayment } from "@/lib/orders.functions";
import { PICKUP_ADDRESS } from "@/lib/config";

export const Route = createFileRoute("/pay/$orderNumber")({
  component: PayRequestPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    payment: typeof search.payment === "string" ? search.payment : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Complete your payment · L&A Sweet" },
      {
        name: "description",
        content:
          "Secure payment page for an approved L&A Sweet order request — pay a 50% deposit or the full amount online.",
      },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Complete your payment · L&A Sweet" },
      {
        property: "og:description",
        content: "Pay your approved L&A Sweet order — 50% deposit or full amount.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Ctx = Awaited<ReturnType<typeof getRequestPaymentContext>>;

function PayRequestPage() {
  const { orderNumber } = Route.useParams();
  const { token, payment } = useSearch({ from: "/pay/$orderNumber" });
  const loadContext = useServerFn(getRequestPaymentContext);
  const startPayment = useServerFn(startRequestPayment);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<"full" | "deposit_50" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setLoading(false);
      return;
    }
    loadContext({ data: { orderNumber, token } })
      .then((res) => {
        if (!cancelled) setCtx(res);
      })
      .catch(() => {
        if (!cancelled) setCtx(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, token, loadContext]);

  const pay = async () => {
    if (!plan || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await startPayment({
        data: { orderNumber, token, paymentPlan: plan, origin: window.location.origin },
      });
      try {
        if (window.top && window.top !== window.self) {
          window.top.location.href = url;
          return;
        }
      } catch {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    } finally {
      setBusy(false);
    }
  };

  const wrapper =
    "min-h-screen bg-ink text-foreground px-4 py-16 flex items-start justify-center";
  const card = "w-full max-w-xl border border-line bg-ink-2 p-8";

  if (loading) {
    return (
      <main className={wrapper}>
        <div className={card}>
          <p className="text-sm text-[color:var(--foreground)]/70">Loading your order…</p>
        </div>
      </main>
    );
  }

  if (!ctx || ctx.valid !== true) {
    const reason = ctx && ctx.valid === false ? ctx.reason : "invalid";
    return (
      <main className={wrapper}>
        <div className={card}>
          <h1 className="font-serif-display text-3xl text-gold mb-4">
            {reason === "paid"
              ? "Already paid"
              : reason === "expired"
                ? "This link has expired"
                : "Link not valid"}
          </h1>
          <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
            {reason === "paid"
              ? "This order has already been paid — thank you! You'll receive your confirmation by email."
              : reason === "expired"
                ? "Payment links are valid for 24 hours. Your slot has been released, but you're very welcome to submit a new request."
                : "This payment link isn't recognised. Please use the link in your approval email or submit a new request."}
          </p>
          <a
            href="/"
            className="mt-8 inline-flex text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            Back to L&amp;A Sweet
          </a>
        </div>
      </main>
    );
  }

  const o = ctx.order;
  const total = Number(o.total);
  const deposit = Math.round((total / 2) * 100) / 100;
  const balance = Math.round((total - deposit) * 100) / 100;
  const fulfilWord = o.deliveryMethod === "delivery" ? "delivery" : "pick-up";

  return (
    <main className={wrapper}>
      <div className={card}>
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">
          Request approved
        </div>
        <h1 className="font-serif-display text-3xl mb-4">
          Complete your <span className="italic text-gold">payment</span>
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
          Great news — your order <span className="text-gold">{o.orderNumber}</span> is confirmed
          available. Choose how you'd like to pay to lock it in. This link is valid for 24 hours.
        </p>

        {payment === "cancelled" && (
          <p className="mt-4 text-xs border border-gold/30 bg-ink-3/60 px-4 py-3">
            Payment was cancelled. You can try again below while this link is still valid.
          </p>
        )}

        <div className="mt-6 border border-line bg-ink-3/40 p-5">
          <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Your order</div>
          <ul className="divide-y divide-line text-sm">
            {o.items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-2 first:pt-0 last:pb-0">
                <span>
                  {i.qty} × {i.name}
                  {i.sizeLabel ? ` (Size ${i.sizeLabel})` : ""}
                </span>
                <span className="text-gold">
                  ${(Number(i.qty) * Number(i.price)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
            <span>Delivery fee</span>
            <span className="text-gold">
              {Number(o.deliveryFee) === 0 ? "Free" : `$${Number(o.deliveryFee).toFixed(2)}`}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-[11px] tracking-[0.18em] uppercase text-gold">
            <span>Total</span>
            <span className="font-serif-display normal-case tracking-normal text-xl">
              ${total.toFixed(2)}
            </span>
          </div>
          <p className="mt-3 text-[12px] text-[color:var(--foreground)]/70">
            {o.deliveryMethod === "delivery" ? "Delivery to " : "Pick-up at "}
            <span className="text-gold">
              {o.deliveryMethod === "delivery" ? o.deliveryAddress : PICKUP_ADDRESS}
            </span>
            {o.deliveryDate ? ` on ${o.deliveryDate}` : ""}
            {o.deliveryTime ? ` at ${o.deliveryTime}` : ""}.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setPlan("deposit_50")}
            className={`w-full text-left border p-4 transition-colors ${
              plan === "deposit_50" ? "border-gold bg-gold text-ink" : "border-gold/30 hover:border-gold/60"
            }`}
          >
            <div
              className={`text-[11px] tracking-[0.24em] uppercase mb-1 ${
                plan === "deposit_50" ? "text-ink" : "text-gold"
              }`}
            >
              {plan === "deposit_50" ? "✓ " : ""}Option A
            </div>
            <div className="font-serif-display text-lg">
              Pay 50% deposit now — A${deposit.toFixed(2)}
            </div>
            <p
              className={`mt-1 text-[12px] leading-relaxed ${
                plan === "deposit_50" ? "text-ink/80" : "text-[color:var(--foreground)]/70"
              }`}
            >
              The remaining A${balance.toFixed(2)} is collected in cash on {fulfilWord}.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPlan("full")}
            className={`w-full text-left border p-4 transition-colors ${
              plan === "full" ? "border-gold bg-gold text-ink" : "border-gold/30 hover:border-gold/60"
            }`}
          >
            <div
              className={`text-[11px] tracking-[0.24em] uppercase mb-1 ${
                plan === "full" ? "text-ink" : "text-gold"
              }`}
            >
              {plan === "full" ? "✓ " : ""}Option B
            </div>
            <div className="font-serif-display text-lg">
              Pay full amount now — A${total.toFixed(2)}
            </div>
            <p
              className={`mt-1 text-[12px] leading-relaxed ${
                plan === "full" ? "text-ink/80" : "text-[color:var(--foreground)]/70"
              }`}
            >
              Pay in full now and nothing to settle later.
            </p>
          </button>
        </div>

        {error && (
          <p className="mt-4 text-xs border border-gold/30 bg-ink-3/60 px-4 py-3">{error}</p>
        )}

        <button
          type="button"
          disabled={busy || !plan}
          onClick={pay}
          className="mt-6 w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors disabled:opacity-50"
        >
          {busy ? "Processing…" : plan ? "Continue to secure payment →" : "Choose a payment option"}
        </button>
      </div>
    </main>
  );
}
