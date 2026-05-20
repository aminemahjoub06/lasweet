import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, X, Minus, Plus, Trash2 } from "lucide-react";
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
  const scrollToOrder = () => {
    if (typeof document !== "undefined") {
      document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const startOrderFlow = (opts?: { no?: string; qty?: number; orderType?: string }) => {
    if (opts?.no) {
      setCart((c) => ({ ...c, [opts.no!]: Math.min(999, (c[opts.no!] ?? 0) + (opts.qty ?? 1)) }));
    }
    if (opts?.orderType) {
      setForm((f) => ({ ...f, orderType: opts.orderType! }));
    }
    setCartOpen(false);
    setTimeout(scrollToOrder, 60);
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
    notes: "",
    createAccount: false,
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const updateForm = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const submitQuote = (e: React.FormEvent) => {
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
    if (form.notes.length > 1000) return setFormError("Notes must be under 1000 characters.");
    if (cartItems.length === 0) return setFormError("Your selection is empty — add a flavour first.");
    if (form.createAccount) {
      if (form.password.length < 8) return setFormError("Password must be at least 8 characters.");
      if (form.password !== form.confirmPassword) return setFormError("Passwords do not match.");
    }
    setSubmitted(true);
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
          <a href="#" className="font-serif-display text-xl md:text-2xl leading-none">
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
                    { v: "$12–20", l: "Per piece" },
                    { v: "24–48h", l: "Lead time" },
                    { v: "3–4d", l: "Shelf life" },
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
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 md:py-10 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {[
            { v: "4", l: "Flavours" },
            { v: "50 km", l: "Brisbane delivery" },
            { v: "24–48h", l: "Preparation time" },
            { v: "20 pcs", l: "Minimum order" },
            { v: "$12–20", l: "Per piece" },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`flex flex-col items-start md:items-center ${
                i > 0 ? "md:border-l md:border-line md:pl-4" : ""
              }`}
            >
              <div className="font-serif-display text-2xl md:text-3xl">{s.v}</div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-gold/80 mt-1">{s.l}</div>
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

          <div className="relative">
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
      <section className="bg-ink-3 border-t border-line">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-px bg-line">
          <div id="wholesale" className="bg-ink-3 p-10 md:p-16">
            <div className="eyebrow mb-6">Wholesale Supplier</div>
            <h3 className="font-serif-display text-4xl md:text-5xl leading-tight mb-10">
              For<br />
              <span className="italic text-gold">Restaurants &</span><br />
              <span className="italic text-gold">Cafés</span>
            </h3>
            <ul className="space-y-3 text-sm text-[color:var(--foreground)]/75 mb-10">
              {[
                "From 20 pieces per order",
                "$12–20 per piece per model",
                "24–48h lead time, Brisbane & 50 km",
                "Custom quotes — payment by invoice or bank transfer",
                "Ready to plate and serve",
              ].map((li) => (
                <li key={li} className="flex gap-3">
                  <span className="text-gold mt-2 h-px w-3 bg-gold shrink-0" />
                  <span>{li}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => startOrderFlow({ orderType: "Restaurant" })}
              className="border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-gold hover:text-ink transition"
            >
              Get wholesale quote
            </button>
          </div>

          <div id="events" className="bg-ink-3 p-10 md:p-16">
            <div className="eyebrow mb-6">Private Events</div>
            <h3 className="font-serif-display text-4xl md:text-5xl leading-tight mb-10">
              For Your<br />
              <span className="italic text-gold">Celebrations</span>
            </h3>
            <ul className="space-y-3 text-sm text-[color:var(--foreground)]/75 mb-10">
              {[
                "Packs of 20, 40, 60 or custom qty",
                "Birthdays, weddings, parties, corporate events",
                "Fresh — prepared within 48h of your event",
                "Choose one flavour or a mixed selection",
                "Delivery or pick-up, Brisbane area",
              ].map((li) => (
                <li key={li} className="flex gap-3">
                  <span className="text-gold mt-2 h-px w-3 bg-gold shrink-0" />
                  <span>{li}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => startOrderFlow({ orderType: "Private event" })}
              className="border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-gold hover:text-ink transition"
            >
              Book my event
            </button>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      {/* CREATE YOUR ORDER */}
      <section id="order" className="relative bg-ink border-t border-line diamond-bg">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32">
          <div className="text-center mb-14 md:mb-20">
            <div className="eyebrow justify-center mb-6 inline-flex">Order &amp; Account</div>
            <h2 className="font-serif-display text-5xl md:text-6xl leading-tight mb-5">
              Create your <span className="italic text-gold">Order</span>
            </h2>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-[color:var(--foreground)]/70 leading-relaxed">
              Build your selection, share your details, and we'll confirm availability and final pricing.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* LEFT — Cart summary */}
            <aside
              className="lg:col-span-5 border border-gold/30 bg-ink-2/60 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] self-start"
              aria-label="Cart summary"
            >
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">Cart</div>
                  <h3 className="font-serif-display text-2xl md:text-3xl">
                    Your <span className="italic text-gold">Selection</span>
                  </h3>
                </div>
                <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/55">
                  {cartCount} {cartCount === 1 ? "piece" : "pieces"}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="border border-dashed border-line py-10 text-center text-sm text-[color:var(--foreground)]/55">
                  <p>No flavours selected yet.</p>
                  <a
                    href="#products"
                    className="mt-3 inline-block text-[10px] tracking-[0.24em] uppercase text-gold border-b border-gold/40 hover:border-gold transition"
                  >
                    Explore the collection
                  </a>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {cartItems.map((fl) => {
                    const q = cart[fl.no];
                    return (
                      <li key={fl.no} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="h-14 w-14 shrink-0 border border-gold/40 bg-ink-3 p-1 flex items-center justify-center">
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
                          <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80">
                            No. {fl.no}
                          </div>
                          <div className="font-serif-display text-lg leading-tight">
                            {fl.prefix}
                            <span className="italic text-gold">{fl.suffix}</span>
                          </div>
                        </div>
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
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-6 pt-5 border-t border-line space-y-3">
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
                  Range based on $12–20 per piece. Final price confirmed after quote.
                </p>
              </div>
            </aside>

            {/* RIGHT — Form */}
            <div className="lg:col-span-7 border border-gold/30 bg-ink-2/60 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
              {submitted ? (
                <div className="py-10 text-center">
                  <div className="eyebrow justify-center mb-6 inline-flex">Received</div>
                  <h3 className="font-serif-display text-3xl md:text-4xl mb-4">
                    Thank you, <span className="italic text-gold">{form.fullName.split(" ")[0] || "friend"}</span>
                  </h3>
                  <p className="text-sm text-[color:var(--foreground)]/70 max-w-md mx-auto leading-relaxed">
                    Your quote request has been recorded. We'll confirm availability and final pricing
                    within 24 hours at <span className="text-gold">{form.email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setCart({});
                    }}
                    className="mt-8 inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
                  >
                    Start a new order
                  </button>
                </div>
              ) : (
                <form onSubmit={submitQuote} className="space-y-6" noValidate>
                  <div>
                    <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">Contact</div>
                    <h3 className="font-serif-display text-2xl md:text-3xl">
                      Your <span className="italic text-gold">Details</span>
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
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
                    <FieldLA label="Order type">
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
                  </FieldLA>

                  <FieldLA label="Notes (optional)">
                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      className={`${inputCls} resize-none`}
                      placeholder="Allergens, presentation, event size…"
                    />
                  </FieldLA>

                  {/* Account */}
                  <div className="border-t border-line pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">
                          Account
                        </div>
                        <p className="text-sm text-[color:var(--foreground)]/70 leading-relaxed">
                          Create an account to track orders and save your details.
                        </p>
                      </div>
                      <label className="inline-flex items-center gap-3 shrink-0 cursor-pointer select-none">
                        <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/70">
                          Create
                        </span>
                        <span className="relative inline-block w-10 h-5 align-middle">
                          <input
                            type="checkbox"
                            checked={form.createAccount}
                            onChange={(e) => updateForm("createAccount", e.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="absolute inset-0 border border-gold/40 bg-ink-3 peer-checked:bg-gold/30 peer-checked:border-gold transition-colors" />
                          <span className="absolute top-0.5 left-0.5 h-4 w-4 bg-gold transition-transform peer-checked:translate-x-5" />
                        </span>
                      </label>
                    </div>
                    {form.createAccount && (
                      <div className="grid sm:grid-cols-2 gap-5 animate-fade-in">
                        <FieldLA label="Password" required>
                          <input
                            type="password"
                            required
                            minLength={8}
                            maxLength={128}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => updateForm("password", e.target.value)}
                            className={inputCls}
                          />
                        </FieldLA>
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
                      </div>
                    )}
                  </div>

                  {formError && (
                    <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
                      {formError}
                    </p>
                  )}

                  <div className="border-t border-line pt-6 space-y-3">
                    <p className="text-[11px] italic text-[color:var(--foreground)]/55 leading-relaxed">
                      Quote-based — no payment is taken now. Final price confirmed after quote.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors"
                      >
                        Request Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm("createAccount", false)}
                        className="sm:flex-1 border border-gold/50 text-gold text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-gold hover:text-ink transition-colors"
                      >
                        Continue as Guest
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
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
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5" />
          <div className="md:col-span-7">
            <div className="eyebrow mb-8">Our Story</div>
            <h2 className="font-serif-display text-5xl md:text-6xl leading-[1.05] mb-10">
              Handcrafted in<br />
              Brisbane,<br />
              with <span className="italic text-gold">obsession</span>
            </h2>
            <div className="max-w-lg space-y-6 text-[color:var(--foreground)]/70 text-sm md:text-base leading-relaxed">
              <p>
                Each piece is an edible illusion. Sculpted by hand, coated in white chocolate,
                filled with a generous ganache — mango, raspberry, vanilla or lemon. A dessert that
                fools the eye and wins the heart.
              </p>
              <p>
                Made in small batches in Brisbane for restaurants, cafés and events that want to
                offer something truly unforgettable. No shortcuts on quality. No compromise on
                flavour.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-4 max-w-lg">
              <div className="flex-1 h-px bg-line" />
              <div className="font-serif-display italic text-sm text-[color:var(--foreground)]/80">
                L<span className="text-gold">&</span>A Sweet <span className="text-gold mx-2">·</span> Brisbane
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
            <a href="#" className="hover:text-gold transition">Instagram</a>
            <a href="#" className="hover:text-gold transition">Contact</a>
            <a href="#wholesale" className="hover:text-gold transition">Wholesale</a>
            <a href="#events" className="hover:text-gold transition">Events</a>
            <a href="#" className="hover:text-gold transition">Allergens</a>
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
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={() => setCartOpen(false)}
                className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-3 hover:bg-[color:var(--gold-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Request Quote
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
    </main>
  );
}
