import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as React from "react";
import { ShoppingBag, X, Minus, Plus, Trash2, Check, ChefHat, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createCashOrder, createStripeCheckout } from "@/lib/orders.functions";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import raspberryImg from "@/assets/raspberry.png";
import mangoImg from "@/assets/mango.png";
import pistachioImg from "@/assets/pistachio.png";
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
  available?: boolean;
  price?: number;
  sizes?: { label: string; price: number }[];
};

const flavours: Flavour[] = [
  {
    no: "01",
    name: "Raspberry",
    prefix: "Rasp",
    suffix: "berry",
    label: "Intense Flavour",
    description:
      "A vibrant raspberry illusion coated in smooth white chocolate, filled with real vanilla bean ganache, a soft homemade biscuit and a tangy raspberry coulis that brings the perfect balance of sweetness and freshness.",
    short: "White chocolate shell, homemade vanilla ganache, raspberry coulis and homemade biscuit.",
    image: raspberryImg,
    available: true,
    price: 18,
  },
  {
    no: "02",
    name: "Lemon",
    prefix: "Le",
    suffix: "mon",
    label: "Bright Flavour",
    description:
      "A bright lemon trompe-l'œil with a smooth white chocolate shell, soft homemade biscuit, silky lemon crémeux and vanilla ganache delicately lifted with fresh lemon zest for a clean, elegant citrus finish.",
    short: "White chocolate shell, homemade biscuit, lemon crémeux and vanilla ganache with lemon zest.",
    image: lemonImg,
    available: true,
    price: 18,
  },
  {
    no: "03",
    name: "Pistachio",
    prefix: "Pista",
    suffix: "chio",
    label: "Nutty Flavour",
    description:
      "A refined pistachio trompe-l'œil with a smooth white chocolate shell, a soft homemade biscuit and a rich homemade pistachio cream centre — nutty, delicate and elegantly indulgent.",
    short: "White chocolate shell, homemade biscuit and homemade pistachio cream.",
    image: pistachioImg,
    available: true,
    price: 18,
  },
  {
    no: "04",
    name: "Mango",
    prefix: "Man",
    suffix: "go",
    label: "Signature Flavour",
    description:
      "A tropical trompe-l'œil with a smooth white chocolate shell, revealing a soft homemade biscuit, real vanilla bean ganache and a bright mango compotée for a fresh, sunny and indulgent finish.",
    short: "White chocolate shell, homemade vanilla ganache, homemade biscuit and mango compote.",
    image: mangoImg,
    available: false,
    price: 20,
  },
];

function StoryShowcase() {
  const showcase = [raspberryImg, lemonImg, pistachioImg, mangoImg];
  const labels = ["Raspberry", "Lemon", "Pistachio", "Mango"];
  // Subtle flavour auras (low opacity, dark-friendly)
  const auras = [
    "radial-gradient(ellipse at 50% 50%, rgba(220,60,110,0.28), rgba(160,30,70,0.10) 42%, transparent 72%)", // Raspberry
    "radial-gradient(ellipse at 50% 50%, rgba(245,220,90,0.28), rgba(210,180,60,0.10) 42%, transparent 72%)", // Lemon
    "radial-gradient(ellipse at 50% 50%, rgba(180,210,90,0.28), rgba(120,160,60,0.10) 42%, transparent 72%)", // Pistachio
    "radial-gradient(ellipse at 50% 50%, rgba(255,170,60,0.30), rgba(255,140,40,0.10) 40%, transparent 70%)", // Mango
  ];
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
        {/* Flavour-tinted ambient aura (crossfades on rotation) */}
        {auras.map((bg, n) => (
          <div
            key={n}
            aria-hidden
            className="absolute inset-0 pointer-events-none transition-opacity duration-[1100ms] ease-out"
            style={{
              background: bg,
              filter: "blur(36px)",
              opacity: n === i ? 1 : 0,
            }}
          />
        ))}
        {/* Soft underlying gold glow (constant, very low) */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.12), transparent 65%)",
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

function StoryShowcaseMobileBg() {
  const showcase = [raspberryImg, lemonImg, pistachioImg, mangoImg];
  const auras = [
    "radial-gradient(ellipse at 50% 50%, rgba(220,60,110,0.30), rgba(160,30,70,0.10) 44%, transparent 74%)",
    "radial-gradient(ellipse at 50% 50%, rgba(245,220,90,0.30), rgba(210,180,60,0.10) 44%, transparent 74%)",
    "radial-gradient(ellipse at 50% 50%, rgba(180,210,90,0.30), rgba(120,160,60,0.10) 44%, transparent 74%)",
    "radial-gradient(ellipse at 50% 50%, rgba(255,170,60,0.32), rgba(255,140,40,0.10) 42%, transparent 72%)",
  ];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % showcase.length), 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes laFloatM { 0%,100% { transform: translateY(-8px) scale(1); } 50% { transform: translateY(8px) scale(1.02); } }
      `}</style>
      {/* Flavour auras */}
      {auras.map((bg, n) => (
        <div
          key={n}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-[1100ms] ease-out"
          style={{ background: bg, filter: "blur(60px)", opacity: n === i ? 1 : 0 }}
        />
      ))}
      {/* Rotating product */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] aspect-square"
        style={{ animation: "laFloatM 9s ease-in-out infinite" }}
      >
        {showcase.map((src, n) => (
          <img
            key={n}
            src={src}
            alt=""
            aria-hidden
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[1400ms] ease-out ${
              n === i ? "opacity-[0.55]" : "opacity-0"
            }`}
            style={{ filter: "blur(3px) drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}
          />
        ))}
      </div>
      {/* Readability overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.25) 50%, rgba(10,10,10,0.55) 100%)",
        }}
      />
    </div>
  );
}

function Index() {
  const [idx, setIdx] = useState(0); // raspberry default per brief (now first)
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

  // Per-card selected size for products with sizes (if any).
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({});
  const getSize = (fl: Flavour) =>
    selectedSize[fl.no] ?? (fl.sizes?.[0]?.label ?? "");

  // Build the cart key for a flavour (+ optional size).
  const cartKeyFor = (fl: Flavour, size?: string) =>
    fl.sizes ? `${fl.no}-${size ?? getSize(fl)}` : fl.no;

  // Resolve a cart key back to a variant (display + price).
  type Variant = {
    key: string;
    no: string;
    name: string;
    prefix: string;
    suffix: string;
    sizeLabel?: string;
    price: number;
    image?: string;
  };
  const resolveVariant = (key: string): Variant | null => {
    const [no, size] = key.split("-");
    const fl = flavours.find((f) => f.no === no);
    if (!fl) return null;
    if (fl.sizes) {
      const s = fl.sizes.find((x) => x.label === size) ?? fl.sizes[0];
      return {
        key,
        no: fl.no,
        name: `${fl.name} ${s.label}`,
        prefix: fl.prefix,
        suffix: `${fl.suffix} ${s.label}`,
        sizeLabel: s.label,
        price: s.price,
        image: fl.image,
      };
    }
    return {
      key,
      no: fl.no,
      name: fl.name,
      prefix: fl.prefix,
      suffix: fl.suffix,
      price: fl.price ?? 0,
      image: fl.image,
    };
  };

  // Cart state — keys are variant keys (no, or `${no}-${size}` for sized items).
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [addCount, setAddCount] = useState(0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartEntries = Object.entries(cart)
    .map(([key, qty]) => {
      const v = resolveVariant(key);
      return v ? { variant: v, qty } : null;
    })
    .filter((x): x is { variant: Variant; qty: number } => x !== null && x.qty > 0);
  const subtotal = cartEntries.reduce((s, i) => s + i.qty * i.variant.price, 0);
  const addToCart = (key: string, n: number) => {
    setCart((c) => ({ ...c, [key]: Math.min(999, (c[key] ?? 0) + n) }));
    setAddCount((prev) => {
      const next = prev + 1;
      if (next % 4 === 0) {
        setCartOpen(true);
      } else {
        toast("Added to cart");
      }
      return next;
    });
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
  const setCartQty = (key: string, n: number) => {
    setCart((c) => {
      const next = { ...c };
      if (n <= 0) delete next[key];
      else next[key] = Math.min(999, n);
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
    orderType: "Other",
    date: new Date().toISOString().slice(0, 10),
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
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash" | null>(null);
  const submitCashOrder = useServerFn(createCashOrder);
  const submitOnlineOrder = useServerFn(createStripeCheckout);
  // Snapshot of the cart at the moment the customer advances to payment,
  // so quantities can't change mid-checkout.
  const [orderSnapshot, setOrderSnapshot] = useState<
    {
      key: string;
      no: string;
      name: string;
      prefix: string;
      suffix: string;
      image?: string;
      qty: number;
      price: number;
      sizeLabel?: string;
    }[]
  >([]);
  const snapshotTotal = orderSnapshot.reduce((s, i) => s + i.qty * i.price, 0);
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
    if (form.notes.length > 1000) return setFormError("Notes must be under 1000 characters.");
    if (cartEntries.length === 0) return setFormError("Your selection is empty — add a flavour first.");
    if (form.createAccount) {
      if (form.password.length < 8) return setFormError("Password must be at least 8 characters.");
      if (form.password !== form.confirmPassword) return setFormError("Passwords do not match.");
    }
    // Lock in a snapshot of the cart so quantities can't change mid-review.
    setOrderSnapshot(
      cartEntries.map(({ variant, qty }) => ({
        key: variant.key,
        no: variant.no,
        name: variant.name,
        prefix: variant.prefix,
        suffix: variant.suffix,
        image: variant.image,
        qty,
        price: variant.price,
        sizeLabel: variant.sizeLabel,
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
    if (!paymentMethod) {
      setFormError("Please choose a payment method.");
      return;
    }
    setPaying(true);
    setFormError(null);
    try {
      const payload = {
        customer: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          business: form.business,
          orderType: form.orderType,
          date: form.date,
          delivery: form.delivery,
          address: form.address,
          notes: form.notes,
        },
        items: orderSnapshot.map((i) => ({
          key: i.key,
          no: i.no,
          name: i.name,
          prefix: i.prefix,
          suffix: i.suffix,
          image: i.image,
          qty: i.qty,
          price: i.price,
          sizeLabel: i.sizeLabel,
        })),
      };

      if (paymentMethod === "online") {
        const { url } = await submitOnlineOrder({
          data: { ...payload, origin: window.location.origin },
        });
        setCart({});
        // Break out of the Lovable preview iframe — Stripe Checkout refuses to load in iframes.
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = url;
            return;
          }
        } catch {
          // Cross-origin top — fall back to opening in a new tab.
          window.open(url, "_blank", "noopener,noreferrer");
          return;
        }
        window.location.href = url;
        return;
      }
      const { orderNumber } = await submitCashOrder({ data: payload });
      setOrderRef(orderNumber);
      setCart({});
      setCheckoutStep("confirmed");
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
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
    if (cartEntries.length === 0) return;
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
              <a href="#products" className="hover:text-gold transition">Creations</a>
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

                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                  {[
                    { v: "Stock", l: "Available" },
                    { v: "15+ pcs", l: "Prep time" },
                    { v: "Fresh", l: "Chilled" },
                  ].map((b) => (
                    <div
                      key={b.l}
                      className="border border-line p-2.5 md:p-3 text-center flex flex-col items-center justify-center overflow-hidden"
                    >
                      <div className="font-serif-display text-sm md:text-lg leading-tight text-[color:var(--foreground)]">
                        {b.v}
                      </div>
                      <div className="text-[10px] md:text-[11px] tracking-[0.08em] md:tracking-[0.2em] uppercase text-gold/80 mt-1 leading-tight">
                        {b.l}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={f.available === false}
                  onClick={() => startOrderFlow({ no: cartKeyFor(f), qty: 1 })}
                  className="w-full border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-gold hover:text-ink transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
                >
                  {f.available === false ? "Coming Soon" : "Order this flavour"}
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
            { v: "$10", l: "Delivery under 8 pcs · free from 8" },
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
                      <div className="flex flex-col gap-1">
                        {fl.sizes ? (
                          <>
                            <span className="font-serif-display text-base md:text-lg leading-none">
                              <span className="text-gold">${fl.sizes.find((s) => s.label === getSize(fl))?.price ?? fl.sizes[0].price}</span>
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {fl.sizes.map((s) => {
                                const active = getSize(fl) === s.label;
                                return (
                                  <span
                                    key={s.label}
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSize((sz) => ({ ...sz, [fl.no]: s.label }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedSize((sz) => ({ ...sz, [fl.no]: s.label }));
                                      }
                                    }}
                                    className={`cursor-pointer text-[10px] tracking-[0.22em] uppercase px-2 py-1 border transition-colors ${
                                      active
                                        ? "bg-gold text-ink border-gold"
                                        : "text-gold border-gold/40 hover:bg-gold hover:text-ink"
                                    }`}
                                  >
                                    {s.label} · ${s.price}
                                  </span>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-serif-display text-base md:text-lg leading-none">
                              <span className="text-gold">${fl.price}</span>
                            </span>
                            <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/55 mt-1">
                              per piece
                            </span>
                            {fl.available === false && (
                              <span className="mt-1 inline-block self-start text-[9px] tracking-[0.24em] uppercase text-gold border border-gold/50 bg-ink-3/60 px-2 py-0.5">
                                Coming soon
                              </span>
                            )}
                          </>
                        )}
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
                        {fl.available === false ? (
                          <span
                            aria-disabled
                            className="text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/50 border border-line bg-ink-3/40 px-4 py-2 cursor-not-allowed"
                          >
                            Coming Soon
                          </span>
                        ) : (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              const key = cartKeyFor(fl);
                              addToCart(key, getQty(fl.no));
                              setAdded(key);
                              window.setTimeout(() => setAdded((c) => (c === key ? null : c)), 1400);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                const key = cartKeyFor(fl);
                                addToCart(key, getQty(fl.no));
                                setAdded(key);
                                window.setTimeout(() => setAdded((c) => (c === key ? null : c)), 1400);
                              }
                            }}
                            className="cursor-pointer text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-4 py-2 hover:bg-gold hover:text-ink transition-colors"
                          >
                            {added === cartKeyFor(fl) ? "Added ✓" : "Add to cart"}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* COLLECTION */}
      <section id="collection" className="bg-ink-2 border-t border-line">
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
                  {fl.available === false && (
                    <div className="absolute top-4 right-4 z-10 text-[10px] tracking-[0.28em] uppercase text-gold bg-ink/70 backdrop-blur-md px-3 py-1.5 border border-gold/40">
                      Coming soon
                    </div>
                  )}
                </div>

                {/* Text panel below the image */}
                <div className="relative bg-ink/80 backdrop-blur-xl border-t border-gold/30 p-6 md:p-7">
                  <h3 className="font-serif-display text-3xl md:text-4xl mb-3 text-[color:var(--foreground)]">
                    {fl.prefix}<span className="italic text-gold">{fl.suffix}</span>
                  </h3>
                  <p className="text-sm text-[color:var(--foreground)]/75 leading-relaxed">
                    {fl.description}
                  </p>
                  <div className="mt-5 h-px w-10 bg-gold" />
                </div>
              </article>
            ))}
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
                  "Pick-up available with no minimum order — free",
                  "Delivery: $10 under 8 pieces, free from 8 pieces",
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
      <section id="story" className="diamond-bg border-t border-line relative overflow-hidden">
        {/* Mobile-only ambient product background */}
        <div className="md:hidden absolute inset-0 pointer-events-none">
          <StoryShowcaseMobileBg />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 md:py-24 relative">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            {/* Left — premium rotating product showcase (desktop only) */}
            <div className="hidden md:block md:col-span-5">
              <StoryShowcase />
            </div>

            {/* Right — story text */}
            <div className="md:col-span-7 relative z-10">
              <div className="eyebrow mb-5">Our Story</div>
              <h2 className="font-serif-display text-4xl md:text-[2.75rem] leading-[1.08] mb-8">
                A French story,
                <br />
                handcrafted in <span className="italic text-gold">Brisbane</span>
              </h2>
              <div className="max-w-md space-y-5 text-[color:var(--foreground)]/65 text-sm leading-[1.75]">
                <p>
                  L&A Sweet was born from a young French couple's dream to bring a piece of French pastry craft to Brisbane. After moving here four months ago, we started this adventure with one idea in mind: creating desserts that surprise the eye, tell a story and bring something new to the table.
                </p>
                <p>
                  Every trompe-l'œil dessert is made by us, from start to finish. The biscuit, ganache, coulis, crémeux, compotée, white chocolate coating, assembly and final details are all prepared by hand in small batches, with care, precision and patience.
                </p>
                <p>
                  We are only at the beginning of our journey, but our ambition is clear: to grow, to last, and to share a new expression of French pastry here in Brisbane — handmade, elegant and full of flavour.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-4 max-w-md">
                <div className="flex-1 h-px bg-line" />
                <div className="font-serif-display italic text-sm text-[color:var(--foreground)]/80 whitespace-nowrap">
                  L&A Sweet <span className="text-gold mx-2">·</span> Brisbane
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="allergens" className="border-t border-line bg-ink">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-16 md:py-20">
          <div className="text-center mb-10">
            <div className="text-[10px] tracking-[0.32em] uppercase text-gold mb-3">Important</div>
            <h2 className="font-serif-display text-3xl md:text-4xl mb-3">Allergens</h2>
            <p className="text-[color:var(--foreground)]/75 italic max-w-2xl mx-auto">
              Please let us know about any allergies or dietary requirements before ordering.
            </p>
          </div>

          <p className="text-center text-[color:var(--foreground)]/85 mb-10 max-w-3xl mx-auto">
            Our trompe-l'œil desserts are handmade in small batches and may contain or come into contact with common allergens.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* Raspberry */}
            <div className="rounded-2xl border border-gold/30 bg-ink-2/70 backdrop-blur p-6 shadow-[0_0_40px_-15px_rgba(212,175,55,0.2)] flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[60px] h-[60px] md:w-[80px] md:h-[80px] shrink-0 z-10">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
                <img src={raspberryImg} alt="Raspberry" className="relative w-full h-full object-contain drop-shadow-sm" />
              </div>
              <h3 className="font-serif-display text-xl mb-4 text-gold pr-16">Raspberry</h3>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-3">Contains</div>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]/85 mb-4">
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Milk</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Soy</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Gluten</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Eggs</li>
              </ul>
              <div className="mt-auto text-xs text-[color:var(--foreground)]/60 leading-relaxed border-t border-gold/20 pt-3">
                Milk and soy are present in the white chocolate. Gluten and eggs are present in the homemade biscuit.
              </div>
            </div>

            {/* Lemon */}
            <div className="rounded-2xl border border-gold/30 bg-ink-2/70 backdrop-blur p-6 shadow-[0_0_40px_-15px_rgba(212,175,55,0.2)] flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[60px] h-[60px] md:w-[80px] md:h-[80px] shrink-0 z-10">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
                <img src={lemonImg} alt="Lemon" className="relative w-full h-full object-contain drop-shadow-sm" />
              </div>
              <h3 className="font-serif-display text-xl mb-4 text-gold pr-16">Lemon</h3>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-3">Contains</div>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]/85 mb-4">
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Milk</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Soy</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Gluten</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Eggs</li>
              </ul>
              <div className="mt-auto text-xs text-[color:var(--foreground)]/60 leading-relaxed border-t border-gold/20 pt-3">
                Milk and soy are present in the white chocolate. Gluten and eggs are present in the homemade biscuit. Eggs are also present in the lemon crémeux.
              </div>
            </div>

            {/* Pistachio */}
            <div className="rounded-2xl border border-gold/30 bg-ink-2/70 backdrop-blur p-6 shadow-[0_0_40px_-15px_rgba(212,175,55,0.2)] flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[60px] h-[60px] md:w-[80px] md:h-[80px] shrink-0 z-10">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
                <img src={pistachioImg} alt="Pistachio" className="relative w-full h-full object-contain drop-shadow-sm" />
              </div>
              <h3 className="font-serif-display text-xl mb-4 text-gold pr-16">Pistachio</h3>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-3">Contains</div>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]/85 mb-4">
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Milk</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Soy</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Gluten</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Eggs</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Tree nuts, including pistachio</li>
              </ul>
              <div className="mt-auto text-xs text-[color:var(--foreground)]/60 leading-relaxed border-t border-gold/20 pt-3">
                Milk and soy are present in the white chocolate. Gluten and eggs are present in the homemade biscuit. Tree nuts are present in the homemade pistachio cream.
              </div>
            </div>

            {/* Mango */}
            <div className="rounded-2xl border border-gold/30 bg-ink-2/70 backdrop-blur p-6 shadow-[0_0_40px_-15px_rgba(212,175,55,0.2)] flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[60px] h-[60px] md:w-[80px] md:h-[80px] shrink-0 z-10">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
                <img src={mangoImg} alt="Mango" className="relative w-full h-full object-contain drop-shadow-sm" />
              </div>
              <h3 className="font-serif-display text-xl mb-4 text-gold pr-16">Mango</h3>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-3">Contains</div>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]/85 mb-4">
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Milk</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Soy</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Gluten</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Eggs</li>
              </ul>
              <div className="mt-auto text-xs text-[color:var(--foreground)]/60 leading-relaxed border-t border-gold/20 pt-3">
                Milk and soy are present in the white chocolate. Gluten and eggs are present in the homemade biscuit.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-ink-2/50 p-6 md:p-8 text-center">
            <p className="text-sm text-[color:var(--foreground)]/70 mb-3">
              Products are prepared in a small kitchen environment, so traces of allergens may be present, including milk, soy, gluten, eggs and tree nuts. Please contact us before ordering if you have a serious allergy.
            </p>
            <p className="text-sm text-[color:var(--foreground)]/70">
              Egg-free versions may be available on request for selected flavours, depending on preparation and availability. Please contact us before ordering.
            </p>
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
            <a href="https://www.instagram.com/l.a.sweet.bne/" target="_blank" rel="noopener noreferrer external" className="hover:text-gold transition">Instagram</a>
            <a href="https://www.tiktok.com/@l.a.sweet.bne" target="_blank" rel="noopener noreferrer external" className="hover:text-gold transition">TikTok</a>
            <a href="#footer" className="hover:text-gold transition">Contact</a>
            <a href="#wholesale" className="hover:text-gold transition">Wholesale</a>
            <a href="#events" className="hover:text-gold transition">Events</a>
            <a href="#allergens" className="hover:text-gold transition">Allergens</a>
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
            {cartEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-[color:var(--foreground)]/60">
                <ShoppingBag className="h-8 w-8 text-gold/60 mb-4" strokeWidth={1.2} />
                <p>Your selection is empty.</p>
                <p className="mt-1 text-xs tracking-[0.18em] uppercase text-[color:var(--foreground)]/40">
                  Add a flavour to begin
                </p>
              </div>
            ) : (
              <ul className="space-y-5">
                {cartEntries.map(({ variant: v, qty: q }) => {
                  return (
                    <li key={v.key} className="flex gap-4 border-b border-line pb-5 last:border-b-0">
                      <div className="h-16 w-16 shrink-0 border border-gold/40 bg-ink-3 p-1.5 flex items-center justify-center">
                        {v.image && (
                          <img
                            src={v.image}
                            alt={v.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] tracking-[0.22em] uppercase text-gold/80">
                              No. {v.no}{v.sizeLabel ? ` · Size ${v.sizeLabel}` : ""}
                            </div>
                            <div className="font-serif-display text-lg leading-tight">
                              {v.prefix}
                              <span className="italic text-gold">{v.suffix}</span>
                            </div>
                            <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 mt-1">
                              ${v.price} per piece
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${v.name}`}
                            onClick={() => setCartQty(v.key, 0)}
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
                              onClick={() => setCartQty(v.key, q - 1)}
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
                              onClick={() => setCartQty(v.key, q + 1)}
                              className="h-8 w-8 inline-flex items-center justify-center hover:bg-gold hover:text-ink transition-colors"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.8} />
                            </button>
                          </div>
                          <div className="text-sm text-[color:var(--foreground)]/70">
                            <span className="text-gold font-serif-display text-base">
                              ${q * v.price}
                            </span>
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
                Subtotal
              </span>
              <span className="font-serif-display text-xl">
                <span className="text-gold">${subtotal}</span>
              </span>
            </div>
            <p
              className="text-[11px] leading-snug"
              style={{ letterSpacing: "0.08em", color: "rgba(245, 234, 210, 0.55)" }}
            >
              Pick-up: free · Delivery: $10 under 8 pcs · Free from 8 pcs
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={cartEntries.length === 0}
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
        snapshotTotal={snapshotTotal}
        cartCount={cartCount}
        paying={paying}
        payOrder={payOrder}
        orderRef={orderRef}
        resetOrder={resetOrder}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
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
  key: string;
  no: string;
  name: string;
  prefix: string;
  suffix: string;
  image?: string;
  qty: number;
  price: number;
  sizeLabel?: string;
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
  snapshotTotal,
  cartCount,
  paying,
  payOrder,
  orderRef,
  resetOrder,
  paymentMethod,
  setPaymentMethod,
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
  snapshotTotal: number;
  cartCount: number;
  paying: boolean;
  payOrder: () => void;
  orderRef: string | null;
  resetOrder: () => void;
  paymentMethod: "online" | "cash" | null;
  setPaymentMethod: (m: "online" | "cash" | null) => void;
}) {
  const steps: { k: CheckoutStep; l: string }[] = [
    { k: "account", l: "1 · Account" },
    { k: "details", l: "2 · Details" },
    { k: "review", l: "3 · Review" },
    { k: "payment", l: "4 · Payment" },
  ];
  const order: CheckoutStep[] = ["account", "details", "review", "payment", "confirmed"];

  const fmtDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
  };

  const chooseAccount = (m: "create" | "login" | "guest") => {
    setAccountMode(m);
    updateForm("createAccount", m === "create");
    setStep("details");
  };

  // No card details collected — this is a request-only flow. Real payment
  // will be wired in once Stripe + backend are activated.
  const handlePay = () => {
    setFormError(null);
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
                    <option className="bg-ink-2">Other</option>
                    <option className="bg-ink-2">Café</option>
                    <option className="bg-ink-2">Restaurant</option>
                    <option className="bg-ink-2">Event</option>
                  </select>
                </FieldLA>
                <FieldLA label="Preferred date">
                  <input
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().slice(0, 10)}
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
                  Pick-up: free, no minimum · Delivery: $10 under 8 pcs, free from 8 pcs.
                </p>
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Under 15 pcs: may be available immediately depending on stock ·
                  15+ pcs: preparation time may be required unless stock is available ·
                  Final availability confirmed after order request.
                </p>
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
                    <li key={i.key} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
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
                          No. {i.no}{i.sizeLabel ? ` · Size ${i.sizeLabel}` : ""}
                        </div>
                        <div className="font-serif-display text-base leading-tight">
                          {i.prefix}
                          <span className="italic text-gold">{i.suffix}</span>
                        </div>
                        <div className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 mt-1">
                          ${i.price} per piece
                        </div>
                      </div>
                      <div className="text-xs tracking-[0.18em] text-[color:var(--foreground)]/75">
                        × {i.qty}
                      </div>
                      <div className="text-xs text-[color:var(--foreground)]/70 min-w-[80px] text-right">
                        <span className="text-gold font-serif-display text-base">
                          ${i.qty * i.price}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line mt-4 pt-4 flex items-baseline justify-between">
                  <span className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/60">
                    Subtotal
                  </span>
                  <span className="font-serif-display text-xl">
                    <span className="text-gold">${snapshotTotal}</span>
                  </span>
                </div>
                {(() => {
                  const snapQty = orderSnapshot.reduce((s, i) => s + i.qty, 0);
                  const fee = form.delivery === "delivery" && snapQty < 8 ? 10 : 0;
                  const message =
                    form.delivery === "pickup"
                      ? "Pick-up is free with no minimum order."
                      : snapQty < 8
                      ? "Delivery fee applies under 8 pieces."
                      : "Free delivery from 8 pieces.";
                  return (
                    <>
                      <div className="mt-3 flex items-baseline justify-between text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
                        <span>Delivery fee</span>
                        <span className="text-gold normal-case tracking-normal font-serif-display text-base">
                          {fee === 0 ? "Free" : `$${fee}`}
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline justify-between text-[11px] tracking-[0.18em] uppercase text-gold">
                        <span>Total</span>
                        <span className="font-serif-display normal-case tracking-normal text-xl">
                          ${snapshotTotal + fee}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] italic text-[color:var(--foreground)]/55 leading-relaxed">
                        {message}
                      </p>
                    </>
                  );
                })()}
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
                  {form.date ? ` · ${fmtDate(form.date)}` : ""}
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
                  Validate &amp; Continue →
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
                  Choose your <span className="italic text-gold">payment method</span>
                </h3>
                <p className="mt-2 text-sm text-[color:var(--foreground)]/70 leading-relaxed">
                  Pay securely online with card now, or pay in cash on pick-up or delivery.
                </p>
              </div>

              {/* Final order summary */}
              <div className="border border-gold/30 bg-ink-3/40 p-5 space-y-3">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold">
                  Order summary
                </div>
                <ul className="divide-y divide-line">
                  {orderSnapshot.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
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
                        {i.sizeLabel && (
                          <span className="ml-2 text-[10px] tracking-[0.18em] uppercase text-gold/70">
                            Size {i.sizeLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[color:var(--foreground)]/70">
                        × {i.qty} · <span className="text-gold">${i.qty * i.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line pt-3 flex flex-wrap items-baseline justify-between gap-2 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/60">
                  <span>
                    {form.delivery === "delivery" ? "Delivery" : "Pick-up"}
                    {form.date ? ` · ${fmtDate(form.date)}` : ""}
                  </span>
                  <span className="font-serif-display normal-case tracking-normal text-base">
                    <span className="text-gold">${snapshotTotal}</span>
                  </span>
                </div>
                {(() => {
                  const snapQty = orderSnapshot.reduce((s, i) => s + i.qty, 0);
                  const fee = form.delivery === "delivery" && snapQty < 8 ? 10 : 0;
                  return (
                    <>
                      <div className="mt-2 flex items-baseline justify-between text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
                        <span>Delivery fee</span>
                        <span className="text-gold">{fee === 0 ? "Free" : `$${fee}`}</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between text-[11px] tracking-[0.18em] uppercase text-gold">
                        <span>Total</span>
                        <span className="font-serif-display normal-case tracking-normal text-base">
                          ${snapshotTotal + fee}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Payment method selector */}
              <div className="space-y-3">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold">
                  Payment method
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`text-left border p-4 transition-colors ${
                      paymentMethod === "online"
                        ? "border-gold bg-gold/10"
                        : "border-gold/30 hover:border-gold/60"
                    }`}
                  >
                    <div className="text-[11px] tracking-[0.24em] uppercase text-gold mb-1">
                      Pay online
                    </div>
                    <div className="font-serif-display text-lg">Card payment</div>
                    <p className="mt-1 text-[12px] text-[color:var(--foreground)]/70 leading-relaxed">
                      Secure online payment by card.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`text-left border p-4 transition-colors ${
                      paymentMethod === "cash"
                        ? "border-gold bg-gold/10"
                        : "border-gold/30 hover:border-gold/60"
                    }`}
                  >
                    <div className="text-[11px] tracking-[0.24em] uppercase text-gold mb-1">
                      Pay cash
                    </div>
                    <div className="font-serif-display text-lg">On pick-up / delivery</div>
                    <p className="mt-1 text-[12px] text-[color:var(--foreground)]/70 leading-relaxed">
                      Cash payment available on pick-up or delivery.
                    </p>
                  </button>
                </div>
              </div>

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
                  {paying
                    ? "Processing…"
                    : paymentMethod === "online"
                      ? "Continue to Secure Payment →"
                      : paymentMethod === "cash"
                        ? "Confirm Order"
                        : "Choose a payment method"}
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
              <div className="eyebrow justify-center mb-4 inline-flex">Request Received</div>
              <h3 className="font-serif-display text-3xl mb-4">
                Thank you — your <span className="italic text-gold">order request</span> has been received.
              </h3>
              <p className="text-sm text-[color:var(--foreground)]/75 max-w-md mx-auto leading-relaxed">
                We&apos;ll contact you shortly at{" "}
                <span className="text-gold">{form.email}</span> to confirm
                availability, final pricing and payment details.
              </p>
              <div className="mt-8 inline-block border border-gold/40 bg-ink-3/60 px-6 py-4">
                <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-1">
                  Request reference
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
      <PWAInstallPrompt />
    </div>
  );
}
