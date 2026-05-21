import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as React from "react";
import { ShoppingBag, X, Minus, Plus, Trash2, Check, ChefHat, Sparkles } from "lucide-react";
import raspberryImg from "@/assets/raspberry.png";
import mangoImg from "@/assets/mango.png";
import vanillaImg from "@/assets/vanilla.png";
import lemonImg from "@/assets/lemon.png";

export const Route = createFileRoute("/")({
  component: Index,
});

const inputCls =
  "w-full bg-ink-3/60 border border-line focus:border-gold/70 focus:outline-none px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)]/35 transition-colors";

function FieldLA({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/65 mb-2">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

type Flavour = {
  no: string;
  name: string;
  prefix: string;
  suffix: string;
  label: string;
  description: string;
  short: string;
  image?: string;
};

const flavours: Flavour[] = [
  {
    no: "01",
    name: "Mango",
    prefix: "Man",
    suffix: "go",
    label: "Signature Flavour",
    description:
      "White chocolate shell. Lush mango ganache hidden inside. A trompe-l'œil that dissolves the eye and delights the palate — every single time.",
    short: "Exotic, sun-drenched ganache. Bright mango folded into silky white chocolate, for a fresh, tropical finish that lifts any dessert menu.",
    image: mangoImg,
  },
  {
    no: "02",
    name: "Raspberry",
    prefix: "Rasp",
    suffix: "berry",
    label: "Intense Flavour",
    description:
      "Sharp, vivid raspberry ganache wrapped in smooth white chocolate. The perfect contrast — bold fruit against quiet sweetness.",
    short: "Bold and brave. A nuance that bites. Raspberry ganache with a sharp, vivid note, wrapped in smooth white chocolate for perfect balance.",
    image: raspberryImg,
  },
  {
    no: "03",
    name: "Vanilla",
    prefix: "Vani",
    suffix: "lla",
    label: "Classic Flavour",
    description:
      "A classic vanilla ganache enclosed in a crisp white-chocolate shell. Timeless, silky, and universally loved.",
    short: "Timeless, silky, universally loved. A classic vanilla ganache in a crisp white-chocolate shell — pure comfort, dressed as an illusion.",
    image: vanillaImg,
  },
  {
    no: "04",
    name: "Lemon",
    prefix: "Le",
    suffix: "mon",
    label: "Bright Flavour",
    description:
      "Fresh lemon ganache with a clean, citrus edge, in a white-chocolate casing that melts on the tongue.",
    short: "Bright, zesty, effortlessly light. Fresh lemon ganache with a clean, citrus edge, in a white-chocolate casing that melts on the tongue.",
    image: lemonImg,
  },
];

function StoryShowcase() {
  const showcase = [mangoImg, raspberryImg, vanillaImg, lemonImg];
  const labels = ["Mango", "Raspberry", "Vanilla", "Lemon"];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % showcase.length), 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="md:col-span-5 relative">
      <style>{`
        @keyframes laFloat { 0%,100% { transform: translateY(-5px) rotateX(4deg) rotateY(-3deg); } 50% { transform: translateY(5px) rotateX(4deg) rotateY(3deg); } }
        @keyframes laFadeIn { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes laSweep { 0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; } 25% { opacity: .9; } 60% { opacity: 0; } 100% { transform: translateX(180%) skewX(-18deg); opacity: 0; } }
        .la-stage { perspective: 1400px; }
        .la-float { animation: laFloat 8s ease-in-out infinite; transform-style: preserve-3d; will-change: transform; }
        .la-fade { animation: laFadeIn 1.6s cubic-bezier(.22,.61,.36,1) both; }
        .la-sweep { animation: laSweep 7s ease-in-out infinite; animation-delay: 1.2s; }
      `}</style>
      <div className="la-stage relative aspect-[4/5] max-h-[460px] flex items-center justify-center overflow-hidden">
        {/* Soft radial gold glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.24), rgba(201,168,76,0.08) 38%, transparent 68%)",
          }}
        />
        {/* Subtle glass tint */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.03) 100%)",
          }}
        />
        {/* Vitrine vignette */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6), transparent 62%)",
          }}
        />
        {/* Product */}
        <div className="la-float relative w-[70%] h-[70%] flex items-end justify-center">
          {showcase.map((src, n) => (
            <img
              key={n}
              src={src}
              alt={`${labels[n]} dessert`}
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-[1600ms] ease-out ${
                n === i ? "opacity-100 scale-100 la-fade" : "opacity-0 scale-95"
              }`}
              style={{ filter: "drop-shadow(0 32px 48px rgba(0,0,0,0.6)) drop-shadow(0 0 24px rgba(201,168,76,0.12))" }}
            />
          ))}
        </div>
        {/* Soft ground reflection */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[6%] w-[60%] h-4 rounded-[50%] blur-md"
          style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 70%)" }}
        />
        {/* Light sweep across glass */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="la-sweep absolute top-0 -left-1/3 h-full w-1/3"
            style={{
              background:
                "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.04) 70%, transparent 100%)",
              filter: "blur(6px)",
            }}
          />
        </div>
      </div>
      {/* Flavour indicator */}
      <div className="mt-5 flex items-center justify-center gap-3">
        {labels.map((l, n) => (
          <button
            key={l}
            onClick={() => setI(n)}
            aria-label={l}
            className={`h-[2px] transition-all duration-500 ${
              n === i ? "w-8 bg-gold" : "w-4 bg-gold/25 hover:bg-gold/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Index() {
  const [idx, setIdx] = useState(1); // raspberry default per brief
  const f = flavours[idx];
  const prev = () => setIdx((i) => (i - 1 + flavours.length) % flavours.length);
  const next = () => setIdx((i) => (i + 1) % flavours.length);

  const [expandedNo, setExpandedNo] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<string | null>(null);
  const getQty = (no: string) => qty[no] ?? 1;
  const setQ = (no: string, n: number) =>
    setQty((q) => ({ ...q, [no]: Math.max(1, Math.min(99, n)) }));

  // Cart state
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = flavours.filter((fl) => (cart[fl.no] ?? 0) > 0);
  const PRICE_MIN = 12;
  const PRICE_MAX = 20;
  const subtotalMin = cartCount * PRICE_MIN;
  const subtotalMax = cartCount * PRICE_MAX;
  const addToCart = (no: string, n: number) => {
    setCart((c) => ({ ...c, [no]: Math.min(999, (c[no] ?? 0) + n) }));
    setCartOpen(true);
  };
  const startOrderFlow = (opts?: { no?: string; qty?: number; orderType?: string }) => {
    if (opts?.no) {
      setCart((c) => ({ ...c, [opts.no!]: Math.min(999, (c[opts.no!] ?? 0) + (opts.qty ?? 1)) }));
    }
    if (opts?.orderType) {
      setForm((f) => ({ ...f, orderType: opts.orderType! }));
    }
    // Always open the cart first — the customer must validate the cart
    // before the checkout flow begins.
    setCheckoutOpen(false);
    setCheckoutStep("account");
    setCartOpen(true);
  };
  const setCartQty = (no: string, n: number) => {
    setCart((c) => {
      const next = { ...c };
      if (n <= 0) delete next[no];
      else next[no] = Math.min(999, n);
      return next;
    });
  };

  // Order form state
  type OrderForm = {
    fullName: string;
    email: string;
    phone: string;
    business: string;
    orderType: string;
    date: string;
    delivery: "delivery" | "pickup";
    address: string;
    notes: string;
    createAccount: boolean;
    password: string;
    confirmPassword: string;
  };
  const [form, setForm] = useState<OrderForm>({
    fullName: "",
    email: "",
    phone: "",
    business: "",
    orderType: "Restaurant",
    date: "",
    delivery: "delivery",
    address: "",
    notes: "",
    createAccount: false,
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  // Step-by-step checkout modal — only opens after the customer validates
  // the cart. Account choice → details → review → payment → confirmed.
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  type CheckoutStep = "account" | "details" | "review" | "payment" | "confirmed";
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("account");
  const [accountMode, setAccountMode] = useState<"create" | "login" | "guest" | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  // Snapshot of the cart at the moment the customer advances to payment,
  // so quantities can't change mid-checkout.
  const [orderSnapshot, setOrderSnapshot] = useState<
    { no: string; name: string; prefix: string; suffix: string; image?: string; qty: number }[]
  >([]);
  const snapshotMin = orderSnapshot.reduce((s, i) => s + i.qty * PRICE_MIN, 0);
  const snapshotMax = orderSnapshot.reduce((s, i) => s + i.qty * PRICE_MAX, 0);
  const updateForm = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const validateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const name = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    if (!name || name.length > 100) return setFormError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)
      return setFormError("Please enter a valid email address.");
    if (!/^[+\d\s\-()]{6,20}$/.test(phone)) return setFormError("Please enter a valid phone number.");
    if (form.business.length > 120) return setFormError("Business name is too long.");
    if (form.delivery === "delivery" && form.address.trim().length < 5)
      return setFormError("Please enter a delivery address.");
    if (form.delivery === "delivery" && cartCount < 6)
      return setFormError(
        "Delivery requires a minimum of 6 pieces. Please add more items or choose pick-up.",
      );
    if (form.notes.length > 1000) return setFormError("Notes must be under 1000 characters.");
    if (cartItems.length === 0) return setFormError("Your selection is empty — add a flavour first.");
    if (form.createAccount) {
      if (form.password.length < 8) return setFormError("Password must be at least 8 characters.");
      if (form.password !== form.confirmPassword) return setFormError("Passwords do not match.");
    }
    // Lock in a snapshot of the cart so quantities can't change mid-review.
    setOrderSnapshot(
      cartItems.map((fl) => ({
        no: fl.no,
        name: fl.name,
        prefix: fl.prefix,
        suffix: fl.suffix,
        image: fl.image,
        qty: cart[fl.no]!,
      })),
    );
    setCheckoutStep("review");
  };

  const generateOrderRef = () => {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    return `LA-${year}-${rand}`;
  };

  const payOrder = async () => {
    if (paying || orderSnapshot.length === 0) return;
    setPaying(true);
    setFormError(null);
    try {
      // ─────────────────────────────────────────────────────────────
      // TODO(stripe): Replace this block with a real Stripe Checkout flow.
      //
      //  1. Create a server function (e.g. src/lib/checkout.functions.ts)
      //     that builds a Stripe Checkout Session from `orderSnapshot`
      //     and the customer details in `form`, then returns { url }.
      //  2. Call it here with useServerFn and redirect:
      //         const { url } = await createCheckoutSession({ data: payload });
      //         window.location.href = url;
      //  3. Implement the success route + Stripe webhook to mark the
      //     order as paid and persist it to the user's account.
      //
      //  Until Stripe is enabled, we simulate a successful authorisation
      //  so the rest of the post-payment flow can be tested.
      // ─────────────────────────────────────────────────────────────
      await new Promise((r) => setTimeout(r, 900));
      const ref = generateOrderRef();
      setOrderRef(ref);

      // Persist the order locally if the customer chose to create an account.
      if (form.createAccount && typeof window !== "undefined") {
        try {
          const key = `la_orders_${form.email.toLowerCase()}`;
          const existing = JSON.parse(window.localStorage.getItem(key) || "[]");
          existing.push({
            ref,
            createdAt: new Date().toISOString(),
            customer: {
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              business: form.business,
              orderType: form.orderType,
              date: form.date,
              delivery: form.delivery,
              notes: form.notes,
            },
            items: orderSnapshot,
            estimate: { min: snapshotMin, max: snapshotMax },
          });
          window.localStorage.setItem(key, JSON.stringify(existing));
        } catch {
          /* storage not available — silently skip */
        }
      }

      setCart({});
      setCheckoutStep("confirmed");
    } finally {
      setPaying(false);
    }
  };

  const resetOrder = () => {
    setCheckoutOpen(false);
    setCheckoutStep("account");
    setAccountMode(null);
    setOrderRef(null);
    setOrderSnapshot([]);
    setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
  };
  const openCheckout = () => {
    if (cartItems.length === 0) return;
    setCartOpen(false);
    setFormError(null);
    setAccountMode(null);
    setCheckoutStep("account");
    setCheckoutOpen(true);
  };
  const toggleExpand = (no: string) => {
    setShowDetails(false);
    setExpandedNo((cur) => (cur === no ? null : no));
  };

  return (
    <main className="min-h-screen bg-ink text-[color:var(--foreground)]">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-serif-display text-xl md:text-2xl leading-none"
          >
            L<span className="text-gold">&</span>A <span className="italic">Sweet</span>
          </a>
          <div className="flex items-center gap-6 md:gap-8">
            <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/70">
              <a href="#creations" className="hover:text-gold transition">Creations</a>
              <a href="#wholesale" className="hover:text-gold transition">For Restaurants</a>
              <a href="#events" className="hover:text-gold transition">Events</a>
              <a href="#story" className="hover:text-gold transition">About</a>
              <a href="#footer" className="hover:text-gold transition">Contact</a>
            </nav>
            <button
              type="button"
              aria-label="Open cart"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center justify-center h-10 w-10 border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 inline-flex items-center justify-center bg-gold text-ink text-[10px] font-medium rounded-full border border-ink">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="group/hero relative overflow-hidden">
        {/* Background image layer — active flavour */}
        {flavours.map((fl, i) => (
          <div
            key={fl.no}
            aria-hidden
            className={`absolute inset-0 bg-center bg-no-repeat bg-contain transition-[opacity,transform] duration-[1200ms] ease-out group-hover/hero:scale-[1.04] ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${fl.image})`,
              backgroundSize: "min(70vh, 560px) auto",
            }}
          />
        ))}
        {/* Darkening + vignette layers for readability — reduced for glass showcase */}
        <div className="absolute inset-0 bg-ink/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,8,6,0.25)_55%,var(--ink)_100%)] pointer-events-none" />
        <div className="absolute inset-0 diamond-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 md:px-10 pt-32 md:pt-40 pb-16 md:pb-24 min-h-[100vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center md:justify-end">
            <div className="flex items-center gap-6 md:gap-10 w-full">
              <button
                onClick={prev}
                aria-label="Previous flavour"
                className="hidden md:flex h-12 w-12 items-center justify-center border border-line text-gold hover:border-gold transition backdrop-blur-md bg-ink/30"
              >
                ←
              </button>

              <div
                className="flex-1 max-w-xl mx-auto md:mx-0 md:ml-auto p-8 md:p-12 rounded-sm"
                style={{
                  background: "rgba(8, 6, 3, 0.28)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(200, 155, 60, 0.35)",
                  boxShadow: "0 25px 80px rgba(0, 0, 0, 0.35)",
                  backgroundBlendMode: "screen",
                }}
              >
                <div className="eyebrow mb-6">{f.label}</div>
                <h1 className="font-serif-display text-6xl md:text-7xl leading-[0.95] mb-6">
                  {f.prefix}
                  <span className="italic text-gold">{f.suffix}</span>
                </h1>
                <p className="text-sm md:text-base text-[color:var(--foreground)]/70 leading-relaxed mb-8 max-w-md">
                  {f.description}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { v: "Stock", l: "Availability" },
                    { v: "15+ pcs", l: "Prep time may apply" },
                    { v: "Fresh", l: "Keep chilled" },
                  ].map((b) => (
                    <div key={b.l} className="border border-line p-3 text-center">
                      <div className="font-serif-display text-lg text-[color:var(--foreground)]">{b.v}</div>
                      <div className="text-[9px] tracking-[0.2em] uppercase text-gold/80 mt-1">{b.l}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => startOrderFlow({ no: f.no, qty: 1 })}
                  className="w-full border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-gold hover:text-ink transition"
                >
                  Order this flavour
                </button>
              </div>

              <button
                onClick={next}
                aria-label="Next flavour"
                className="hidden md:flex h-12 w-12 items-center justify-center border border-line text-gold hover:border-gold transition backdrop-blur-md bg-ink/30"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div className="font-serif-display italic text-sm text-[color:var(--foreground)]/60">
              <span className="text-gold">{String(idx + 1).padStart(2, "0")}</span> / 04
            </div>
            <div className="flex items-center gap-2">
              {flavours.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-px transition-all ${i === idx ? "w-10 bg-gold" : "w-6 bg-[color:var(--foreground)]/20"}`}
                  aria-label={`Go to flavour ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex md:hidden items-center gap-3">
              <button onClick={prev} className="text-gold border border-line h-9 w-9">←</button>
              <button onClick={next} className="text-gold border border-line h-9 w-9">→</button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-0 items-center text-center">
          {[
            { v: "4", l: "Flavours" },
            { v: "50 km", l: "Brisbane delivery" },
            { v: "15+ pcs", l: "Preparation time may apply" },
            { v: "6 pcs", l: "Delivery minimum (pick-up: none)" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`flex flex-col items-center justify-center px-4 py-2 ${
                i % 2 !== 0 ? "border-l border-line" : ""
              } ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${
                i > 0 && i % 2 === 0 ? "md:border-l md:border-line" : ""
              }`}
            >
              <div className="font-serif-display text-2xl md:text-3xl">{s.v}</div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-gold/80 mt-1 leading-relaxed">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section id="creations" className="bg-ink-2 border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-16">
            <div className="eyebrow justify-center mb-6 inline-flex">The Collection</div>
            <h2 className="font-serif-display text-5xl md:text-6xl leading-tight">
              Four flavours, one <span className="italic text-gold">experience</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {flavours.map((fl) => (
              <article
                key={fl.no}
                className="group/card relative overflow-hidden bg-ink-2 flex flex-col transition-transform duration-500 hover:-translate-y-1"
              >
                {/* Image on top, fully contained inside the card */}
                <div className="relative aspect-square w-full overflow-hidden bg-ink p-6 md:p-8">
                  {fl.image && (
                    <img
                      src={fl.image}
                      alt={`${fl.prefix}${fl.suffix}`}
                      className="absolute inset-0 m-auto h-full w-full object-contain p-6 md:p-8 transition-transform duration-[1200ms] ease-out group-hover/card:scale-[1.04]"
                    />
                  )}
                  <div className="absolute top-4 left-4 z-10 text-[10px] tracking-[0.28em] uppercase text-gold bg-ink/60 backdrop-blur-md px-3 py-1.5 border border-gold/30">
                    No. {fl.no}
                  </div>
                </div>

                {/* Text panel below the image */}
                <div className="relative bg-ink/80 backdrop-blur-xl border-t border-gold/30 p-6 md:p-7">
                  <h3 className="font-serif-display text-3xl md:text-4xl mb-3 text-[color:var(--foreground)]">
                    {fl.prefix}<span className="italic text-gold">{fl.suffix}</span>
                  </h3>
                  <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
                    {fl.short}
                  </p>
                  <div className="mt-5 h-px w-10 bg-gold" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="relative bg-ink border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-16">
            <div className="eyebrow justify-center mb-6 inline-flex">Products</div>
            <h2 className="font-serif-display text-5xl md:text-6xl leading-tight mb-4">
              Trompe-l'œil desserts <span className="italic text-gold">you can explore</span>
            </h2>
          </div>

          <div id="product-grid" className="relative scroll-mt-[120px]">
            {/* Backdrop dim when something is expanded */}
            <div
              className={`pointer-events-none absolute inset-0 -m-6 md:-m-10 bg-ink/80 backdrop-blur-sm transition-opacity duration-500 ${
                expandedNo ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => {
                setExpandedNo(null);
                setShowDetails(false);
              }}
              aria-hidden
            />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {flavours.map((fl) => {
                const isExpanded = expandedNo === fl.no;
                const isDimmed = expandedNo && !isExpanded;
                return (
                  <button
                    key={fl.no}
                    type="button"
                    onClick={() => toggleExpand(fl.no)}
                    className={`group/prod relative overflow-hidden border bg-ink-2 text-left transition-all duration-500 ease-out ${
                      isExpanded
                        ? "z-30 scale-[1.04] border-gold/60 shadow-[0_40px_120px_-20px_rgba(212,168,76,0.35),0_20px_60px_-10px_rgba(0,0,0,0.9)]"
                        : isDimmed
                          ? "z-0 scale-[0.97] opacity-40 border-line"
                          : "z-10 border-line hover:border-gold/40"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      {fl.image && (
                        <div
                          aria-hidden
                          className={`absolute inset-0 bg-center bg-no-repeat bg-contain transition-transform duration-[1200ms] ease-out ${
                            isExpanded ? "scale-110" : "group-hover/prod:scale-105"
                          }`}
                          style={{ backgroundImage: `url(${fl.image})` }}
                        />
                      )}
                      {/* Soft bottom gradient so caption stays readable */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink via-ink/60 to-transparent pointer-events-none" />

                      {/* Top-left number */}
                      <div className="absolute top-4 left-4 text-[10px] tracking-[0.28em] uppercase text-gold">
                        No. {fl.no}
                      </div>

                      {/* Default small caption */}
                      <div
                        className={`absolute inset-x-0 bottom-0 p-4 md:p-5 transition-opacity duration-300 ${
                          isExpanded && showDetails ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        <div className="inline-flex items-center gap-3 bg-ink/55 backdrop-blur-md border border-gold/30 px-4 py-2">
                          <span className="font-serif-display text-xl md:text-2xl">
                            {fl.prefix}
                            <span className="italic text-gold">{fl.suffix}</span>
                          </span>
                          <span className="hidden md:inline text-[10px] tracking-[0.2em] uppercase text-[color:var(--foreground)]/60">
                            {fl.label}
                          </span>
                        </div>
                      </div>

                      {/* Expanded controls: View details / Close */}
                      {isExpanded && (
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDetails((v) => !v);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowDetails((v) => !v);
                              }
                            }}
                            className="cursor-pointer text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 bg-ink/60 backdrop-blur-md px-3 py-2 hover:bg-gold hover:text-ink transition"
                          >
                            {showDetails ? "Back to image" : "View details"}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label="Close"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedNo(null);
                              setShowDetails(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedNo(null);
                                setShowDetails(false);
                              }
                            }}
                            className="cursor-pointer h-9 w-9 inline-flex items-center justify-center text-gold border border-gold/50 bg-ink/60 backdrop-blur-md hover:bg-gold hover:text-ink transition"
                          >
                            ×
                          </span>
                        </div>
                      )}

                      {/* Details slide-up panel */}
                      <div
                        className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-out ${
                          isExpanded && showDetails
                            ? "translate-y-0 opacity-100"
                            : "translate-y-full opacity-0"
                        }`}
                        aria-hidden={!(isExpanded && showDetails)}
                      >
                        <div className="m-3 md:m-4 border border-gold/30 bg-ink/70 backdrop-blur-xl p-5 md:p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                          <div className="eyebrow mb-3">{fl.label}</div>
                          <h3 className="font-serif-display text-2xl md:text-3xl mb-3">
                            {fl.prefix}
                            <span className="italic text-gold">{fl.suffix}</span>
                          </h3>
                          <p className="text-sm text-[color:var(--foreground)]/80 leading-relaxed">
                            {fl.description}
                          </p>
                          <div className="mt-4 h-px w-10 bg-gold" />
                        </div>
                      </div>

                      {/* Extra darkening behind details for readability */}
                      <div
                        className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 pointer-events-none ${
                          isExpanded && showDetails ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden
                      />
                    </div>

                    {/* Cart controls */}
                    <div
                      className="flex items-center justify-between gap-3 border-t border-line bg-ink-2 px-4 py-3 md:px-5 md:py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col">
                        <span className="font-serif-display text-base md:text-lg leading-none">
                          <span className="text-gold">$12–20</span>
                        </span>
                        <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/55 mt-1">
                          per piece
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center border border-gold/40 text-gold">
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Decrease ${fl.name} quantity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setQ(fl.no, getQty(fl.no) - 1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setQ(fl.no, getQty(fl.no) - 1);
                              }
                            }}
                            className="cursor-pointer h-8 w-8 inline-flex items-center justify-center text-sm hover:bg-gold hover:text-ink transition-colors"
                          >
                            −
                          </span>
                          <span className="min-w-[2ch] text-center text-xs tracking-[0.2em] px-1 text-[color:var(--foreground)]/85">
                            {getQty(fl.no)}
                          </span>
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Increase ${fl.name} quantity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setQ(fl.no, getQty(fl.no) + 1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                setQ(fl.no, getQty(fl.no) + 1);
                              }
                            }}
                            className="cursor-pointer h-8 w-8 inline-flex items-center justify-center text-sm hover:bg-gold hover:text-ink transition-colors"
                          >
                            +
                          </span>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(fl.no, getQty(fl.no));
                            setAdded(fl.no);
                            window.setTimeout(() => setAdded((c) => (c === fl.no ? null : c)), 1400);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(fl.no, getQty(fl.no));
                              setAdded(fl.no);
                              window.setTimeout(() => setAdded((c) => (c === fl.no ? null : c)), 1400);
                            }
                          }}
                          className="cursor-pointer text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-4 py-2 hover:bg-gold hover:text-ink transition-colors"
                        >
                          {added === fl.no ? "Added ✓" : "Add to cart"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WHOLESALE / EVENTS */}
      <section className="bg-ink border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-16">
            <div className="eyebrow justify-center inline-flex mb-6">Two Dedicated Spaces</div>
            <h2 className="font-serif-display text-4xl md:text-5xl leading-tight">
              Choose your <span className="italic text-gold">pathway</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Restaurants & Cafés — B2B */}
            <article
              id="wholesale"
              className="group relative flex flex-col h-full p-10 md:p-12 border border-gold/30 bg-[color:var(--ink-2)]/60 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 hover:border-gold/70 hover:shadow-[0_0_60px_-10px_rgba(201,161,74,0.35)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="eyebrow">Wholesale Supplier</div>
                <div className="h-10 w-10 flex items-center justify-center border border-gold/40 rounded-full text-gold">
                  <ChefHat size={18} strokeWidth={1.4} />
                </div>
              </div>
              <h3 className="font-serif-display text-3xl md:text-4xl leading-tight mb-4">
                For <span className="italic text-gold">Restaurants & Cafés</span>
              </h3>
              <div className="h-px w-16 bg-gold mb-8" />
              <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80 mb-10 flex-1">
                {[
                  "Recommended from 20 pieces per order",
                  "Regular supply for restaurants, cafés and hotels",
                  "Mixed flavours or single-flavour batches",
                  "Preparation time may apply for 15+ pieces unless stock is available",
                  "Custom quotes available",
                  "Payment by invoice or bank transfer",
                ].map((li) => (
                  <li key={li} className="flex gap-3 items-start">
                    <span className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center border border-gold/50 rounded-full text-gold">
                      <Check size={11} strokeWidth={2.4} />
                    </span>
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-4">
                <button
                  type="button"
                  onClick={() => startOrderFlow({ orderType: "Restaurant" })}
                  className="w-full bg-gold text-ink text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-[color:var(--gold-soft)] transition"
                >
                  Get Wholesale Quote
                </button>
                <button
                  type="button"
                  onClick={() => startOrderFlow({ orderType: "Restaurant" })}
                  className="block w-full text-center text-[10px] tracking-[0.28em] uppercase text-gold/80 hover:text-gold transition"
                >
                  Discuss recurring supply →
                </button>
              </div>
            </article>

            {/* Private Events */}
            <article
              id="events"
              className="group relative flex flex-col h-full p-10 md:p-12 border border-gold/30 bg-[color:var(--ink-2)]/60 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 hover:border-gold/70 hover:shadow-[0_0_60px_-10px_rgba(201,161,74,0.35)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="eyebrow">Private Events</div>
                <div className="h-10 w-10 flex items-center justify-center border border-gold/40 rounded-full text-gold">
                  <Sparkles size={18} strokeWidth={1.4} />
                </div>
              </div>
              <h3 className="font-serif-display text-3xl md:text-4xl leading-tight mb-4">
                For Your <span className="italic text-gold">Celebrations</span>
              </h3>
              <div className="h-px w-16 bg-gold mb-8" />
              <ul className="space-y-4 text-sm text-[color:var(--foreground)]/80 mb-10 flex-1">
                {[
                  "Birthdays, weddings, parties and corporate events",
                  "Pick-up available with no minimum order",
                  "Delivery available from 6 pieces",
                  "Choose one flavour or a mixed selection",
                  "Fresh products, subject to availability",
                  "Final details confirmed after order request",
                ].map((li) => (
                  <li key={li} className="flex gap-3 items-start">
                    <span className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center border border-gold/50 rounded-full text-gold">
                      <Check size={11} strokeWidth={2.4} />
                    </span>
                    <span>{li}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto space-y-4">
                <button
                  type="button"
                  onClick={() => startOrderFlow({ orderType: "Private event" })}
                  className="w-full bg-gold text-ink text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-[color:var(--gold-soft)] transition"
                >
                  Book My Event
                </button>
                <a
                  href="#product-grid"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("product-grid")?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                  className="block w-full text-center text-[10px] tracking-[0.28em] uppercase text-gold/80 hover:text-gold transition"
                >
                  Create my selection →
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>


      <section className="bg-ink">
        <div className="mx-auto max-w-3xl px-6 md:px-10 py-24 md:py-32 text-center">
          <div className="font-serif-display text-5xl text-gold mb-8 leading-none">”</div>
          <blockquote className="font-serif-display italic text-2xl md:text-3xl leading-relaxed text-[color:var(--foreground)]/90">
            A dessert that vanishes in one bite, but stays in the memory long after the table is cleared.
          </blockquote>
          <div className="mt-10 text-[10px] tracking-[0.32em] uppercase text-gold">
            L&A Sweet <span className="mx-2">·</span> Brisbane, Australia
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <section id="story" className="diamond-bg border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 md:py-24">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            {/* Left — premium rotating product showcase */}
            <StoryShowcase />

            {/* Right — story text */}
            <div className="md:col-span-7">
              <div className="eyebrow mb-5">Our Story</div>
              <h2 className="font-serif-display text-4xl md:text-[2.75rem] leading-[1.08] mb-8">
                Handcrafted in Brisbane,
                <br />
                made to <span className="italic text-gold">impress</span>
              </h2>
              <div className="max-w-md space-y-5 text-[color:var(--foreground)]/65 text-sm leading-[1.75]">
                <p>
                  L&A Sweet creates handcrafted trompe-l'œil desserts designed for restaurants, cafés and private events. Each piece is coated in white chocolate, filled with generous ganache and finished by hand for a refined visual illusion.
                </p>
                <p>
                  Made in small batches in Brisbane, our desserts are prepared with care, precision and freshness in mind — whether for a professional menu, a celebration or a special order.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-4 max-w-md">
                <div className="flex-1 h-px bg-line" />
                <div className="font-serif-display italic text-sm text-[color:var(--foreground)]/80 whitespace-nowrap">
                  L<span className="text-gold">&</span>A Sweet <span className="text-gold mx-2">·</span> Brisbane
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-serif-display text-xl">
              L<span className="text-gold">&</span>A <span className="italic">Sweet</span>
            </div>
            <div className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/55 mt-2">
              Brisbane, QLD <span className="text-gold mx-2">·</span> Handcrafted <span className="text-gold mx-2">·</span> Local
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/70">
            <a href="#footer" className="hover:text-gold transition">Instagram</a>
            <a href="#footer" className="hover:text-gold transition">Contact</a>
            <a href="#wholesale" className="hover:text-gold transition">Wholesale</a>
            <a href="#events" className="hover:text-gold transition">Events</a>
            <a href="#footer" className="hover:text-gold transition">Allergens</a>
          </nav>
        </div>
      </footer>

      {/* CART DRAWER */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!cartOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />

        {/* Drawer */}
        <aside
          role="dialog"
          aria-label="Your Selection"
          className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-ink-2 border-l border-gold/30 shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)] flex flex-col transform transition-transform duration-500 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Cart</div>
              <h2 className="font-serif-display text-2xl">
                Your <span className="italic text-gold">Selection</span>
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close cart"
              onClick={() => setCartOpen(false)}
              className="h-9 w-9 inline-flex items-center justify-center border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-[color:var(--foreground)]/60">
                <ShoppingBag className="h-8 w-8 text-gold/60 mb-4" strokeWidth={1.2} />
                <p>Your selection is empty.</p>
                <p className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--foreground)]/40">
                  Add a flavour to begin
                </p>
              </div>
            ) : (
              <ul className="space-y-5">
                {cartItems.map((fl) => {
                  const q = cart[fl.no];
                  return (
                    <li key={fl.no} className="flex gap-4 border-b border-line pb-5 last:border-b-0">
                      <div className="h-16 w-16 shrink-0 border border-gold/40 bg-ink-3 p-1.5 flex items-center justify-center">
                        {fl.image && (
                          <img
                            src={fl.image}
                            alt={fl.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80">
                              No. {fl.no}
                            </div>
                            <div className="font-serif-display text-lg leading-tight">
                              {fl.prefix}
                              <span className="italic text-gold">{fl.suffix}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${fl.name}`}
                            onClick={() => setCartQty(fl.no, 0)}
                            className="text-[color:var(--foreground)]/50 hover:text-gold transition-colors"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-gold/40 text-gold">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setCartQty(fl.no, q - 1)}
                              className="h-8 w-8 inline-flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
                            >
                              <Minus className="h-3 w-3" strokeWidth={1.8} />
                            </button>
                            <span className="min-w-[2ch] text-center text-xs tracking-[0.2em] text-[color:var(--foreground)]/85">
                              {q}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setCartQty(fl.no, q + 1)}
                              className="h-8 w-8 inline-flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.8} />
                            </button>
                          </div>
                          <div className="text-xs text-[color:var(--foreground)]/60">
                            <span className="text-gold">${q * PRICE_MIN}</span>
                            <span className="mx-1">–</span>
                            <span className="text-gold">${q * PRICE_MAX}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line px-6 py-5 space-y-4 bg-ink">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/60">
                Estimated subtotal
              </span>
              <span className="font-serif-display text-xl">
                <span className="text-gold">${subtotalMin}</span>
                <span className="mx-1 text-[color:var(--foreground)]/40">–</span>
                <span className="text-gold">${subtotalMax}</span>
              </span>
            </div>
            <p className="text-[11px] italic text-[color:var(--foreground)]/55 leading-relaxed">
              Final price confirmed after quote.
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
              Pick-up: no minimum · Delivery: 6 pcs minimum
            </p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
              {cartCount >= 15
                ? "15+ pcs: preparation time may be required unless stock is available."
                : "Under 15 pcs: may be available immediately depending on stock."}
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={openCheckout}
                className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-3 hover:bg-[color:var(--gold-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Checkout →
              </button>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="w-full border border-gold/50 text-gold text-[11px] tracking-[0.24em] uppercase py-3 hover:bg-gold hover:text-ink transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* CHECKOUT MODAL — step-by-step, opens only after cart validation */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        step={checkoutStep}
        setStep={setCheckoutStep}
        accountMode={accountMode}
        setAccountMode={setAccountMode}
        form={form}
        updateForm={updateForm}
        formError={formError}
        setFormError={setFormError}
        validateDetails={validateDetails}
        orderSnapshot={orderSnapshot}
        snapshotMin={snapshotMin}
        snapshotMax={snapshotMax}
        PRICE_MIN={PRICE_MIN}
        PRICE_MAX={PRICE_MAX}
        cartCount={cartCount}
        paying={paying}
        payOrder={payOrder}
        orderRef={orderRef}
        resetOrder={resetOrder}
      />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT MODAL
// ─────────────────────────────────────────────────────────────────────────────
type CheckoutStep = "account" | "details" | "review" | "payment" | "confirmed";
type OrderForm = {
  fullName: string;
  email: string;
  phone: string;
  business: string;
  orderType: string;
  date: string;
  delivery: "delivery" | "pickup";
  address: string;
  notes: string;
  createAccount: boolean;
  password: string;
  confirmPassword: string;
};
type SnapshotItem = {
  no: string;
  name: string;
  prefix: string;
  suffix: string;
  image?: string;
  qty: number;
};

function CheckoutModal({
  open,
  onClose,
  step,
  setStep,
  accountMode,
  setAccountMode,
  form,
  updateForm,
  formError,
  setFormError,
  validateDetails,
  orderSnapshot,
  snapshotMin,
  snapshotMax,
  PRICE_MIN,
  PRICE_MAX,
  cartCount,
  paying,
  payOrder,
  orderRef,
  resetOrder,
}: {
  open: boolean;
  onClose: () => void;
  step: CheckoutStep;
  setStep: (s: CheckoutStep) => void;
  accountMode: "create" | "login" | "guest" | null;
  setAccountMode: (m: "create" | "login" | "guest" | null) => void;
  form: OrderForm;
  updateForm: <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => void;
  formError: string | null;
  setFormError: (v: string | null) => void;
  validateDetails: (e: React.FormEvent) => void;
  orderSnapshot: SnapshotItem[];
  snapshotMin: number;
  snapshotMax: number;
  PRICE_MIN: number;
  PRICE_MAX: number;
  cartCount: number;
  paying: boolean;
  payOrder: () => void;
  orderRef: string | null;
  resetOrder: () => void;
}) {
  const steps: { k: CheckoutStep; l: string }[] = [
    { k: "account", l: "1 · Account" },
    { k: "details", l: "2 · Details" },
    { k: "review", l: "3 · Review" },
    { k: "payment", l: "4 · Payment" },
  ];
  const order: CheckoutStep[] = ["account", "details", "review", "payment", "confirmed"];

  const chooseAccount = (m: "create" | "login" | "guest") => {
    setAccountMode(m);
    updateForm("createAccount", m === "create");
    setStep("details");
  };

  // Local-only card state — never persisted, never sent anywhere until Stripe is wired.
  const [card, setCard] = React.useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    sameAsDelivery: true,
    billingAddress: "",
  });
  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
  };
  const handlePay = () => {
    setFormError(null);
    const digits = card.number.replace(/\s/g, "");
    if (digits.length < 12) return setFormError("Enter a valid card number.");
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setFormError("Enter expiry as MM/YY.");
    if (card.cvc.length < 3) return setFormError("Enter the 3-digit CVC.");
    if (!card.name.trim()) return setFormError("Enter the cardholder name.");
    if (!card.sameAsDelivery && !card.billingAddress.trim())
      return setFormError("Enter the billing address.");
    // ───────────────────────────────────────────────────────────────────────
    // FUTURE STRIPE INTEGRATION — placeholder only, do NOT enable yet.
    //
    // When Stripe is activated, replace this simulated flow with:
    //   1. Build an order payload from `orderSnapshot` + `form`
    //      (customer info, delivery vs pick-up, preferred date, notes).
    //   2. Call a server function that creates a Stripe Checkout Session
    //      (or a PaymentIntent if using Stripe Elements) on the backend.
    //         e.g. const { url } = await createCheckoutSession({ data: payload })
    //              window.location.href = url
    //   3. Stripe hosts the secure payment page — no raw card data is ever
    //      sent through this app. The local `card` state above is UI-only
    //      and must be removed once Stripe Elements / Checkout is wired in.
    //   4. On Stripe webhook `checkout.session.completed`, mark the order
    //      as paid server-side and persist it.
    //   5. Redirect the customer to the success route, which advances the
    //      checkout modal to the "confirmed" step shown below.
    //
    // Until then, we simulate a successful authorisation so the rest of the
    // post-payment journey (confirmation, order reference, cart clear) can
    // be tested end-to-end without a real charge.
    // ───────────────────────────────────────────────────────────────────────
    payOrder();
  };

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Checkout"
        className={`absolute right-0 top-0 h-full w-full sm:w-[560px] bg-ink-2 border-l border-gold/30 shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)] flex flex-col transform transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Checkout</div>
            <h2 className="font-serif-display text-2xl">
              Complete your <span className="italic text-gold">Order</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close checkout"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Step indicator */}
        {step !== "confirmed" && (
          <div className="flex items-center gap-2 px-6 py-4 border-b border-line text-[9px] tracking-[0.22em] uppercase overflow-x-auto">
            {steps.map((s, i) => {
              const active = order.indexOf(step) >= order.indexOf(s.k);
              return (
                <div key={s.k} className="flex items-center gap-2 shrink-0">
                  <span className={active ? "text-gold" : "text-[color:var(--foreground)]/35"}>
                    {s.l}
                  </span>
                  {i < steps.length - 1 && (
                    <span className={`h-px w-5 ${active ? "bg-gold/60" : "bg-line"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* STEP: ACCOUNT */}
          {step === "account" && (
            <div className="space-y-5">
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">Account</div>
                <h3 className="font-serif-display text-2xl">
                  How would you like to <span className="italic text-gold">continue</span>?
                </h3>
                <p className="mt-3 text-sm text-[color:var(--foreground)]/70 leading-relaxed">
                  Create an account to track future orders, log in if you already have one, or
                  continue as a guest.
                </p>
              </div>
              <div className="grid gap-3">
                {(
                  [
                    { k: "create", l: "Create an account", d: "Save your details for next time." },
                    { k: "login", l: "Log in", d: "Returning customer." },
                    { k: "guest", l: "Continue as guest", d: "No account, no password." },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => chooseAccount(opt.k)}
                    className="text-left border border-gold/40 bg-ink-3/40 px-5 py-4 hover:border-gold hover:bg-ink-3/70 transition-colors"
                  >
                    <div className="text-[11px] tracking-[0.24em] uppercase text-gold">{opt.l}</div>
                    <div className="mt-1 text-sm text-[color:var(--foreground)]/70">{opt.d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP: DETAILS */}
          {step === "details" && (
            <form onSubmit={validateDetails} className="space-y-5" noValidate>
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">
                  {accountMode === "login" ? "Log in" : "Your details"}
                </div>
                <h3 className="font-serif-display text-2xl">
                  {accountMode === "login" ? (
                    <>
                      Welcome <span className="italic text-gold">back</span>
                    </>
                  ) : (
                    <>
                      Your <span className="italic text-gold">information</span>
                    </>
                  )}
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FieldLA label="Full name" required>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                    className={inputCls}
                  />
                </FieldLA>
                <FieldLA label="Email" required>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    className={inputCls}
                  />
                </FieldLA>
                <FieldLA label="Phone" required>
                  <input
                    type="tel"
                    required
                    maxLength={20}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    className={inputCls}
                  />
                </FieldLA>
                <FieldLA label="Business name (optional)">
                  <input
                    type="text"
                    maxLength={120}
                    autoComplete="organization"
                    value={form.business}
                    onChange={(e) => updateForm("business", e.target.value)}
                    className={inputCls}
                  />
                </FieldLA>
                <FieldLA label="Customer type">
                  <select
                    value={form.orderType}
                    onChange={(e) => updateForm("orderType", e.target.value)}
                    className={inputCls}
                  >
                    <option className="bg-ink-2">Restaurant</option>
                    <option className="bg-ink-2">Café</option>
                    <option className="bg-ink-2">Private event</option>
                    <option className="bg-ink-2">Other</option>
                  </select>
                </FieldLA>
                <FieldLA label="Preferred date">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                    className={inputCls}
                  />
                </FieldLA>
              </div>

              <FieldLA label="Delivery or pick-up">
                <div className="grid grid-cols-2 gap-3">
                  {(["delivery", "pickup"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateForm("delivery", opt)}
                      className={`text-[10px] tracking-[0.24em] uppercase py-3 border transition-colors ${
                        form.delivery === opt
                          ? "bg-gold text-ink border-gold"
                          : "text-gold border-gold/40 hover:border-gold"
                      }`}
                    >
                      {opt === "delivery" ? "Delivery" : "Pick-up"}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Pick-up: no minimum · Delivery: 6 pcs minimum · Restaurants & cafés: 20 pcs recommended.
                  Longer distances may require a higher minimum or delivery fee.
                </p>
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Under 15 pcs: may be available immediately depending on stock ·
                  15+ pcs: preparation time may be required unless stock is available ·
                  Final availability confirmed after order request.
                </p>
                {form.delivery === "delivery" && cartCount < 6 && (
                  <p className="mt-2 text-[11px] text-rose-300/90">
                    Delivery requires a minimum of 6 pieces. Please add more items or choose pick-up.
                  </p>
                )}
              </FieldLA>

              {form.delivery === "delivery" && (
                <FieldLA label="Delivery address" required>
                  <input
                    type="text"
                    maxLength={200}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    className={inputCls}
                    placeholder="Street, suburb, postcode"
                  />
                </FieldLA>
              )}

              <FieldLA label="Notes / allergens / special requests">
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  className={`${inputCls} resize-none`}
                  placeholder="Allergens, presentation, event size…"
                />
              </FieldLA>

              {(accountMode === "create" || accountMode === "login") && (
                <div className="grid sm:grid-cols-2 gap-4 border-t border-line pt-5">
                  <FieldLA label="Password" required>
                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete={accountMode === "create" ? "new-password" : "current-password"}
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className={inputCls}
                    />
                  </FieldLA>
                  {accountMode === "create" && (
                    <FieldLA label="Confirm password" required>
                      <input
                        type="password"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) => updateForm("confirmPassword", e.target.value)}
                        className={inputCls}
                      />
                    </FieldLA>
                  )}
                </div>
              )}

              {formError && (
                <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setStep("account");
                  }}
                  className="sm:w-1/3 border border-gold/40 text-gold text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-gold hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors"
                >
                  Continue to Review →
                </button>
              </div>
            </form>
          )}

          {/* STEP: REVIEW */}
          {step === "review" && (
            <div className="space-y-5">
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">Review</div>
                <h3 className="font-serif-display text-2xl">
                  Confirm your <span className="italic text-gold">order</span>
                </h3>
              </div>

              <div className="border border-line bg-ink-3/40 p-5">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">Items</div>
                <ul className="divide-y divide-line">
                  {orderSnapshot.map((i) => (
                    <li key={i.no} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="h-12 w-12 shrink-0 border border-gold/40 bg-ink-3 p-1 flex items-center justify-center">
                        {i.image && (
                          <img
                            src={i.image}
                            alt={i.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80">
                          No. {i.no}
                        </div>
                        <div className="font-serif-display text-base leading-tight">
                          {i.prefix}
                          <span className="italic text-gold">{i.suffix}</span>
                        </div>
                      </div>
                      <div className="text-xs tracking-[0.18em] text-[color:var(--foreground)]/75">
                        × {i.qty}
                      </div>
                      <div className="text-xs text-[color:var(--foreground)]/70 min-w-[80px] text-right">
                        <span className="text-gold">${i.qty * PRICE_MIN}</span>
                        <span className="mx-1">–</span>
                        <span className="text-gold">${i.qty * PRICE_MAX}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line mt-4 pt-4 flex items-baseline justify-between">
                  <span className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/60">
                    Estimated subtotal
                  </span>
                  <span className="font-serif-display text-xl">
                    <span className="text-gold">${snapshotMin}</span>
                    <span className="mx-1 text-[color:var(--foreground)]/40">–</span>
                    <span className="text-gold">${snapshotMax}</span>
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
                  <span>Delivery fee</span>
                  <span className="text-gold normal-case tracking-normal font-serif-display text-base">
                    {form.delivery === "pickup"
                      ? "Free (pick-up)"
                      : "Confirmed after order details"}
                  </span>
                </div>
                <div className="mt-3 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
                  {form.delivery === "pickup"
                    ? "Pick-up · No minimum order"
                    : `Delivery · Minimum 6 pcs ${
                        orderSnapshot.reduce((s, i) => s + i.qty, 0) >= 6 ? "✓ met" : "— not met"
                      }`}
                </div>
                {form.delivery === "delivery" && (
                  <p className="mt-2 text-[11px] italic text-[color:var(--foreground)]/55 leading-relaxed">
                    Delivery available from 6 pieces across Brisbane and surrounding area.
                    Delivery fee confirmed based on distance — longer distances may require a higher minimum.
                  </p>
                )}
                <p className="mt-2 text-[11px] italic text-[color:var(--foreground)]/55">
                  Final price confirmed after quote.
                </p>
              </div>

              <div className="border border-line bg-ink-3/40 p-5 text-sm space-y-2">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">
                  Customer
                </div>
                <div className="font-serif-display text-lg">{form.fullName}</div>
                <div className="text-[color:var(--foreground)]/70">{form.email}</div>
                <div className="text-[color:var(--foreground)]/70">{form.phone}</div>
                {form.business && (
                  <div className="text-[color:var(--foreground)]/70">{form.business}</div>
                )}
                <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 pt-2">
                  {form.orderType} · {form.delivery === "delivery" ? "Delivery" : "Pick-up"}
                  {form.date ? ` · ${form.date}` : ""}
                </div>
                {form.delivery === "delivery" && form.address && (
                  <div className="text-[color:var(--foreground)]/70 pt-1">{form.address}</div>
                )}
                {form.notes && (
                  <p className="text-[color:var(--foreground)]/65 italic pt-2 border-t border-line mt-2">
                    “{form.notes}”
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="sm:w-1/3 border border-gold/40 text-gold text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-gold hover:text-ink transition-colors"
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="flex-1 bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors"
                >
                  Validate &amp; Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP: PAYMENT */}
          {step === "payment" && (
            <div className="space-y-5">
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">Payment</div>
                <h3 className="font-serif-display text-2xl">
                  <span className="italic text-gold">Payment</span>
                </h3>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/70">
                  Complete your order securely.
                </p>
              </div>

              {/* Final order summary */}
              <div className="border border-gold/30 bg-ink-3/40 p-5 space-y-3">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold">
                  Order summary
                </div>
                <ul className="divide-y divide-line">
                  {orderSnapshot.map((i) => (
                    <li key={i.no} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                      <div className="h-10 w-10 shrink-0 border border-gold/40 bg-ink-3 p-1 flex items-center justify-center">
                        {i.image && (
                          <img src={i.image} alt={i.name} className="max-h-full max-w-full object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="font-serif-display">
                          {i.prefix}
                          <span className="italic text-gold">{i.suffix}</span>
                        </span>
                      </div>
                      <div className="text-xs text-[color:var(--foreground)]/70">× {i.qty}</div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line pt-3 flex flex-wrap items-baseline justify-between gap-2 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
                  <span>
                    {form.delivery === "delivery" ? "Delivery" : "Pick-up"}
                    {form.date ? ` · ${form.date}` : ""}
                  </span>
                  <span className="font-serif-display normal-case tracking-normal text-base">
                    <span className="text-gold">${snapshotMin}</span>
                    <span className="mx-1 text-[color:var(--foreground)]/40">–</span>
                    <span className="text-gold">${snapshotMax}</span>
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
                  <span>Delivery fee</span>
                  <span className="text-gold">
                    {form.delivery === "pickup" ? "Free" : "Confirmed after order details"}
                  </span>
                </div>
              </div>

              {/* Card details */}
              <div className="border border-gold/30 bg-ink-3/40 p-5 space-y-4">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold">
                  Card details
                </div>
                <FieldLA label="Card number">
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-ink-3 border border-line focus:border-gold/60 outline-none px-3 py-3 text-sm tracking-[0.15em] placeholder:text-[color:var(--foreground)]/30"
                  />
                </FieldLA>
                <div className="grid grid-cols-2 gap-3">
                  <FieldLA label="Expiry">
                    <input
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={card.expiry}
                      onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      className="w-full bg-ink-3 border border-line focus:border-gold/60 outline-none px-3 py-3 text-sm placeholder:text-[color:var(--foreground)]/30"
                    />
                  </FieldLA>
                  <FieldLA label="CVC">
                    <input
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={card.cvc}
                      onChange={(e) =>
                        setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                      }
                      placeholder="123"
                      className="w-full bg-ink-3 border border-line focus:border-gold/60 outline-none px-3 py-3 text-sm placeholder:text-[color:var(--foreground)]/30"
                    />
                  </FieldLA>
                </div>
                <FieldLA label="Cardholder name">
                  <input
                    autoComplete="cc-name"
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Full name on card"
                    className="w-full bg-ink-3 border border-line focus:border-gold/60 outline-none px-3 py-3 text-sm placeholder:text-[color:var(--foreground)]/30"
                  />
                </FieldLA>

                <label className="flex items-start gap-3 text-xs text-[color:var(--foreground)]/75 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={card.sameAsDelivery}
                    onChange={(e) => setCard((c) => ({ ...c, sameAsDelivery: e.target.checked }))}
                    className="mt-[2px] accent-[color:var(--gold)]"
                  />
                  <span>Same as delivery address</span>
                </label>

                {!card.sameAsDelivery && (
                  <FieldLA label="Billing address">
                    <textarea
                      rows={2}
                      value={card.billingAddress}
                      onChange={(e) => setCard((c) => ({ ...c, billingAddress: e.target.value }))}
                      placeholder="Street, city, postal code, country"
                      className="w-full bg-ink-3 border border-line focus:border-gold/60 outline-none px-3 py-3 text-sm placeholder:text-[color:var(--foreground)]/30"
                    />
                  </FieldLA>
                )}
              </div>

              <p className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--foreground)]/55 text-center">
                🔒 Secure payment — your details are protected.
              </p>
              <p className="text-[11px] italic text-[color:var(--foreground)]/55 leading-relaxed text-center">
                Final pricing may be adjusted after confirmation if this is a quote-based order.
              </p>

              {formError && (
                <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="sm:w-1/3 border border-gold/40 text-gold text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-gold hover:text-ink transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePay}
                  className="flex-1 bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {paying ? "Processing…" : "Pay Securely"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: CONFIRMED */}
          {step === "confirmed" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center border border-gold/50 text-gold text-xl">
                ✓
              </div>
              <div className="eyebrow justify-center mb-4 inline-flex">Order Confirmed</div>
              <h3 className="font-serif-display text-3xl mb-4">
                Thank you — your <span className="italic text-gold">order</span> has been received.
              </h3>
              <p className="text-sm text-[color:var(--foreground)]/75 max-w-md mx-auto leading-relaxed">
                A confirmation will be sent shortly to{" "}
                <span className="text-gold">{form.email}</span>.
              </p>
              <div className="mt-8 inline-block border border-gold/40 bg-ink-3/60 px-6 py-4">
                <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-1">
                  Order reference
                </div>
                <div className="font-serif-display text-2xl text-gold tracking-wider">
                  {orderRef}
                </div>
              </div>
              {form.createAccount && (
                <p className="mt-6 text-[11px] italic text-[color:var(--foreground)]/55">
                  Saved to your account · {form.email}
                </p>
              )}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={resetOrder}
                  className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
