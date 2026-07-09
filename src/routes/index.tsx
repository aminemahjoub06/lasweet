import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { ShoppingBag, X, Minus, Plus, Trash2, Check, ChefHat, Sparkles, Volume2, VolumeX, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  createCashOrder,
  createStripeCheckout,
  getDailyStockForDate,
} from "@/lib/orders.functions";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { FlavourCoverflow } from "@/components/FlavourCoverflow";
import { PICKUP_ADDRESS, getAvailableSlots, getBrisbaneTodayIso, getBrisbaneTomorrowIso } from "@/lib/config";
import { getHomeReviews, type PublicReview } from "@/lib/reviews.functions";
import { StarDisplay } from "@/components/Stars";
import raspberryImg from "@/assets/raspberry.png";
import lemonImg from "@/assets/lemon.png";
import mangoImg from "@/assets/mango.png";
import pistachioImg from "@/assets/pistachio.png";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async () => {
    try {
      return await getHomeReviews();
    } catch (e) {
      console.error("[home loader] getHomeReviews failed", e);
      return { reviews: [], aggregate: { count: 0, average: 0 } };
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: "L&A Sweet — Handcrafted French Trompe-l'œil Desserts, Brisbane" },
      { name: "description", content: "L&A Sweet is a French pâtisserie in Brisbane creating four handmade trompe-l'œil desserts: Raspberry (A$15), Lemon (A$15), Mango (A$22) and Pistachio (A$22). Pick-up in Woolloongabba or delivery across Brisbane." },
      { property: "og:title", content: "L&A Sweet — Handcrafted French Trompe-l'œil Desserts, Brisbane" },
      { property: "og:description", content: "Every dessert is entirely made by hand and looks like a piece of fruit — inside you'll find a delicate mousse, a fruity insert and a soft homemade biscuit." },
      { property: "og:url", content: "https://la-sweet-bne.com/" },
    ],
    links: [{ rel: "canonical", href: "https://la-sweet-bne.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": ["LocalBusiness", "Bakery", "FoodEstablishment"],
              "@id": "https://la-sweet-bne.com/#business",
              name: "L&A Sweet",
              alternateName: ["LA Sweet", "L and A Sweet", "L&A Sweet Brisbane"],
              description: "Handcrafted French trompe-l'œil desserts made fresh in Brisbane by a young French couple. Every dessert is entirely made by hand and looks like a piece of fruit.",
              url: "https://la-sweet-bne.com/",
              image: "https://la-sweet-bne.com/og-image.jpg",
              logo: "https://la-sweet-bne.com/icon-512.png",
              email: "l.asweetbne@gmail.com",
              priceRange: "$$",
              servesCuisine: ["French", "Desserts", "Patisserie"],
              paymentAccepted: ["Cash", "Credit Card"],
              currenciesAccepted: "AUD",
              address: {
                "@type": "PostalAddress",
                streetAddress: "803b Stanley Street",
                addressLocality: "Woolloongabba",
                addressRegion: "QLD",
                postalCode: "4102",
                addressCountry: "AU",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -27.487,
                longitude: 153.033,
              },
              areaServed: { "@type": "City", name: "Brisbane" },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "10:00",
                  closes: "22:00",
                },
              ],
              sameAs: [
                "https://www.instagram.com/l.a.sweet.bne/",
                "https://www.tiktok.com/@l.a.sweet.bne",
              ],
              hasMenu: {
                "@type": "Menu",
                name: "Trompe-l'œil Desserts",
                hasMenuItem: [
                  {
                    "@type": "MenuItem",
                    name: "Raspberry Trompe-l'œil",
                    description: "A vibrant raspberry illusion coated in smooth white chocolate, filled with real vanilla bean ganache, a soft homemade biscuit and a tangy raspberry coulis.",
                    offers: {
                      "@type": "Offer",
                      price: "15.00",
                      priceCurrency: "AUD",
                      availability: "https://schema.org/InStock",
                    },
                  },
                  {
                    "@type": "MenuItem",
                    name: "Lemon Trompe-l'œil",
                    description: "A bright lemon trompe-l'œil with a smooth white chocolate shell, soft homemade biscuit, silky lemon crémeux and vanilla ganache lifted with fresh lemon zest.",
                    offers: {
                      "@type": "Offer",
                      price: "15.00",
                      priceCurrency: "AUD",
                      availability: "https://schema.org/InStock",
                    },
                  },
                  {
                    "@type": "MenuItem",
                    name: "Mango Trompe-l'œil",
                    description: "A tropical mango illusion with silky mango-passion crémeux, a soft homemade biscuit and vanilla bean ganache under a smooth white chocolate shell.",
                    offers: {
                      "@type": "Offer",
                      price: "22.00",
                      priceCurrency: "AUD",
                      availability: "https://schema.org/InStock",
                    },
                  },
                  {
                    "@type": "MenuItem",
                    name: "Pistachio Trompe-l'œil",
                    description: "A pistachio trompe-l'œil under a delicate white chocolate shell, with roasted pistachio praliné, a soft homemade biscuit and vanilla ganache. Contains tree nuts.",
                    offers: {
                      "@type": "Offer",
                      price: "22.00",
                      priceCurrency: "AUD",
                      availability: "https://schema.org/InStock",
                    },
                  },
                ],
              },
              ...(loaderData && loaderData.aggregate.count > 0
                ? {
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: loaderData.aggregate.average,
                      reviewCount: loaderData.aggregate.count,
                      bestRating: 5,
                      worstRating: 1,
                    },
                    review: loaderData.reviews.slice(0, 3).map((r) => ({
                      "@type": "Review",
                      author: { "@type": "Person", name: r.reviewer_name },
                      datePublished: (r.approved_at ?? r.created_at).slice(0, 10),
                      reviewRating: {
                        "@type": "Rating",
                        ratingValue: r.rating,
                        bestRating: 5,
                        worstRating: 1,
                      },
                      reviewBody: r.comment.slice(0, 500),
                    })),
                  }
                : {}),
            },
            {
              "@type": "WebSite",
              "@id": "https://la-sweet-bne.com/#website",
              url: "https://la-sweet-bne.com/",
              name: "L&A Sweet",
              publisher: { "@id": "https://la-sweet-bne.com/#business" },
              inLanguage: "en-AU",
            },
            {
              "@type": "Organization",
              "@id": "https://la-sweet-bne.com/#organization",
              name: "L&A Sweet",
              url: "https://la-sweet-bne.com/",
              logo: "https://la-sweet-bne.com/icon-512.png",
              email: "l.asweetbne@gmail.com",
              sameAs: [
                "https://www.instagram.com/l.a.sweet.bne/",
                "https://www.tiktok.com/@l.a.sweet.bne",
              ],
            },
            {
              "@type": "FAQPage",
              "@id": "https://la-sweet-bne.com/#faq",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What are L&A Sweet's trompe-l'œil desserts?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "L&A Sweet's trompe-l'œil desserts are handcrafted French pâtisseries designed to look exactly like a piece of fruit — a raspberry or a lemon on the outside. When cut, they reveal a delicate mousse, a fruity insert and a soft homemade biscuit inside. Every piece is entirely made by hand in small batches, with no preservatives and no extra sugar added.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Where is L&A Sweet located in Brisbane?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "L&A Sweet operates from Woolloongabba, Brisbane. Pick-up is at 803b Stanley Street, Woolloongabba QLD 4102 (next to Coles). Delivery is available across Brisbane.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much does a L&A Sweet dessert cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "L&A Sweet offers four handmade trompe-l'œil desserts. Raspberry and Lemon are A$15 each. Mango and Pistachio are A$22 each (they use more premium ingredients — mango-passion crémeux and pistachio praliné). Pick-up is free. Delivery fee is calculated based on the distance from our Woolloongabba kitchen — see checkout for your exact amount. Delivery is available within 25 km of Brisbane.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How do I order from L&A Sweet?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Orders are placed online at https://la-sweet-bne.com. Minimum 1 day (D+1) in advance — same-day orders are not accepted. You can choose to pay a 50% deposit online and the balance in cash on collection, or pay in full online via Stripe.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How should I store L&A Sweet desserts?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Refrigerate at 2–4°C and enjoy within 24 hours of pick-up or delivery. Avoid prolonged exposure to heat or direct sunlight during transport.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What allergens are in L&A Sweet desserts?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "All current flavours contain milk, soy, gluten and eggs. Milk and soy are in the white chocolate shell. Gluten and eggs are in the homemade biscuit. The upcoming Pistachio flavour will also contain tree nuts (pistachio).",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does L&A Sweet do wholesale or private events?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. L&A Sweet supplies cafés, restaurants and hotels, and caters for private events such as weddings and birthdays. Contact l.asweetbne@gmail.com for wholesale or event inquiries.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
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
  accent?: string;
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
    price: 15,
    accent: "#e5487f",
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
    price: 15,
    accent: "#ecc94b",
  },
  {
    no: "03",
    name: "Mango",
    prefix: "Man",
    suffix: "go",
    label: "Tropical Flavour",
    description:
      "A sun-ripened mango illusion beneath a smooth white chocolate shell, with silky mango-passion crémeux, a soft homemade biscuit and vanilla bean ganache — a bright, tropical balance of sweetness and tang.",
    short: "White chocolate shell, mango-passion crémeux, homemade biscuit and vanilla ganache.",
    image: mangoImg,
    available: true,
    price: 22,
    accent: "#f0872a",
  },
  {
    no: "04",
    name: "Pistachio",
    prefix: "Pista",
    suffix: "chio",
    label: "Nutty Flavour",
    description:
      "A pistachio trompe-l'œil under a delicate white chocolate shell, with roasted pistachio praliné, a soft homemade biscuit and vanilla ganache — nutty, refined and quietly indulgent.",
    short: "White chocolate shell, roasted pistachio praliné, homemade biscuit and vanilla ganache.",
    image: pistachioImg,
    available: true,
    price: 22,
    accent: "#8fb04a",
  },
];

function StoryShowcase() {
  const showcase = [raspberryImg, lemonImg, mangoImg, pistachioImg];
  const labels = ["Raspberry", "Lemon", "Mango", "Pistachio"];
  // Subtle flavour auras (low opacity, dark-friendly)
  const auras = [
    "radial-gradient(ellipse at 50% 50%, rgba(220,60,110,0.28), rgba(160,30,70,0.10) 42%, transparent 72%)", // Raspberry
    "radial-gradient(ellipse at 50% 50%, rgba(245,220,90,0.28), rgba(210,180,60,0.10) 42%, transparent 72%)", // Lemon
    "radial-gradient(ellipse at 50% 50%, rgba(240,135,42,0.28), rgba(200,90,20,0.10) 42%, transparent 72%)", // Mango
    "radial-gradient(ellipse at 50% 50%, rgba(143,176,74,0.28), rgba(90,120,40,0.10) 42%, transparent 72%)", // Pistachio
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
  const showcase = [raspberryImg, lemonImg];
  const auras = [
    "radial-gradient(ellipse at 50% 50%, rgba(220,60,110,0.30), rgba(160,30,70,0.10) 44%, transparent 74%)",
    "radial-gradient(ellipse at 50% 50%, rgba(245,220,90,0.30), rgba(210,180,60,0.10) 44%, transparent 74%)",
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

// ---- Hero video (vertical 9:16, autoplay/muted/loop). Uploads to public/videos/.
function HeroVideo() {
  const candidates = ["/videos/hero-1.mp4", "/videos/hero-2.mp4"];
  const [src] = React.useState(() => candidates[Math.floor(Math.random() * candidates.length)]);
  const [muted, setMuted] = React.useState(true);
  const [available, setAvailable] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = React.useRef<HTMLVideoElement | null>(null);
  if (!available) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Blurred background clone — fills the hero on desktop with a soft, on-brand backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={bgVideoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover scale-110 opacity-40"
          style={{ filter: "blur(38px) saturate(120%)" }}
          onError={() => setAvailable(false)}
        />
        {/* Gold + dark wash to keep it editorial, not amateur */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(201,161,74,0.18), transparent 65%), linear-gradient(180deg, rgba(8,6,3,0.55) 0%, rgba(8,6,3,0.35) 50%, rgba(8,6,3,0.85) 100%)",
          }}
        />
      </div>
      {/* Centered vertical video */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full md:h-[78vh] aspect-[9/16] max-h-[100vh] pointer-events-auto">
          <video
            ref={videoRef}
            src={src}
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover md:rounded-sm md:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] md:border md:border-gold/25"
            onError={() => setAvailable(false)}
          />
          {/* Text-readability gradient (bottom→top) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none md:rounded-sm"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,6,3,0.55) 0%, rgba(8,6,3,0.15) 30%, rgba(8,6,3,0.15) 60%, rgba(8,6,3,0.75) 100%)",
            }}
          />
          {/* Mute / unmute */}
          <button
            type="button"
            onClick={() => {
              setMuted((m) => {
                const next = !m;
                if (videoRef.current) videoRef.current.muted = next;
                return next;
              });
            }}
            aria-label={muted ? "Unmute hero video" : "Mute hero video"}
            className="absolute bottom-4 right-4 z-20 h-10 w-10 inline-flex items-center justify-center border border-gold/40 bg-ink/55 backdrop-blur-md text-gold hover:bg-gold hover:text-ink transition"
          >
            {muted ? <VolumeX size={16} strokeWidth={1.6} /> : <Volume2 size={16} strokeWidth={1.6} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Instagram feed (Behold.so widget). Requires VITE_BEHOLD_FEED_ID.
function InstagramSection() {
  const feedId = (import.meta.env.VITE_BEHOLD_FEED_ID as string | undefined) ?? "";
  React.useEffect(() => {
    if (!feedId) return;
    if (document.querySelector('script[data-behold="1"]')) return;
    const s = document.createElement("script");
    s.src = "https://w.behold.so/widget.js";
    s.type = "module";
    s.dataset.behold = "1";
    document.head.appendChild(s);
  }, [feedId]);
  return (
    <section id="instagram" className="bg-ink-2 border-t border-line">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 md:py-28">
        <div className="text-center mb-12">
          <div className="eyebrow justify-center mb-6 inline-flex">Instagram</div>
          <h2 className="font-serif-display text-4xl md:text-5xl leading-tight">
            Follow our latest <span className="italic text-gold">creations</span>
          </h2>
          <p className="mt-4 text-sm text-[color:var(--foreground)]/60 italic max-w-xl mx-auto">
            New trompe-l'œil pieces, behind-the-scenes and seasonal favourites.
          </p>
        </div>

        {feedId ? (
          <div className="behold-frame relative rounded-sm border border-gold/20 bg-ink/40 backdrop-blur p-3 md:p-5">
            {/* @ts-expect-error custom element */}
            <behold-widget feed-id={feedId}></behold-widget>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <a
                key={i}
                href="https://www.instagram.com/l.a.sweet.bne/"
                target="_blank"
                rel="noopener noreferrer external"
                aria-label="Open L&A Sweet on Instagram"
                className="group relative aspect-square overflow-hidden border border-gold/20 bg-ink-2/70 hover:border-gold/60 transition-colors"
              >
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 40%, rgba(201,161,74,0.18), transparent 65%), linear-gradient(135deg, rgba(40,28,14,0.6), rgba(10,8,6,0.9))",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-gold/60 group-hover:text-gold transition-colors">
                  <Instagram size={28} strokeWidth={1.2} />
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <a
            href="https://www.instagram.com/l.a.sweet.bne/"
            target="_blank"
            rel="noopener noreferrer external"
            className="inline-flex items-center gap-3 border border-gold text-gold text-[11px] tracking-[0.28em] uppercase px-6 py-4 hover:bg-gold hover:text-ink transition"
          >
            <Instagram size={16} strokeWidth={1.6} />
            Follow @l.a.sweet.bne on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [idx, setIdx] = useState(0); // raspberry default per brief (now first)
  const f = flavours[idx];
  const prev = () => setIdx((i) => (i - 1 + flavours.length) % flavours.length);
  const next = () => setIdx((i) => (i + 1) % flavours.length);

  const [bannerOpen, setBannerOpen] = useState(true);
  React.useEffect(() => {
    try {
      if (localStorage.getItem("la-open-banner-dismissed") === "1") setBannerOpen(false);
    } catch {}
  }, []);
  const closeBanner = () => {
    setBannerOpen(false);
    try { localStorage.setItem("la-open-banner-dismissed", "1"); } catch {}
  };
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
  const [bump, setBump] = useState(0);
  const prevCartCount = useRef(0);
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setBump((b) => b + 1);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);
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
    setCheckoutStep("details");
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
    time: string;
    delivery: "delivery" | "pickup";
    address: string;
    notes: string;
  };
  const [form, setForm] = useState<OrderForm>({
    fullName: "",
    email: "",
    phone: "",
    business: "",
    orderType: "Other",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    delivery: "delivery",
    address: "",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Daily stock for the currently selected delivery/pick-up date.
  // Keys match the server-side stockKeyFor() = lowercased product `no` (e.g. "01").
  const fetchStock = useServerFn(getDailyStockForDate);
  const [dailyStock, setDailyStock] = useState<{
    date: string;
    defaultUnits: number;
    stock: Record<string, { remaining: number; initial: number }>;
  } | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setDailyStock(null);
      return;
    }
    fetchStock({ data: { date: form.date } })
      .then((res) => {
        if (!cancelled) setDailyStock(res);
      })
      .catch(() => {
        if (!cancelled) setDailyStock(null);
      });
    return () => {
      cancelled = true;
    };
  }, [form.date, fetchStock]);

  // Step-by-step checkout modal — only opens after the customer validates
  // the cart. Account choice → details → review → payment → confirmed.
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  type CheckoutStep = "details" | "review" | "payment" | "confirmed";
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("details");
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<"full" | "deposit_50" | null>(null);
  const submitOnlineOrder = useServerFn(createStripeCheckout);

  // Delivery quote (distance-based fee) — computed via /api/public/delivery/quote.
  type DeliveryQuote = {
    deliverable: boolean | null; // true=OK, false=out of range, null=pending
    distanceKm: number | null;
    feeAud: number | null;
    method: string;
    pending?: boolean;
    message?: string;
  };
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const fetchDeliveryQuote = async (rawAddress: string) => {
    const address = rawAddress.trim();
    if (address.length < 5) return;
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const resp = await fetch("/api/public/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const json = (await resp.json()) as DeliveryQuote & { error?: string };
      if (!resp.ok) {
        throw new Error(json.error || "Could not calculate delivery fee.");
      }
      setDeliveryQuote(json);
    } catch (err) {
      // Nominatim unreachable / other failure: fall back to pending quote.
      setQuoteError(err instanceof Error ? err.message : "Could not calculate delivery fee.");
      setDeliveryQuote({
        deliverable: null,
        distanceKm: null,
        feeAud: null,
        method: "pending",
        pending: true,
        message:
          "We couldn't estimate the delivery fee automatically. We'll contact you within 24h with the exact amount.",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  // Effective delivery fee used across Review / Payment / server payload.
  // Pickup = 0. Delivery with a known deliverable quote = its feeAud.
  // Delivery with a pending/unknown quote = 0 (server will re-check).
  const effectiveDeliveryFee =
    form.delivery === "delivery"
      ? deliveryQuote?.deliverable === true
        ? Number(deliveryQuote.feeAud ?? 0)
        : 0
      : 0;

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

  // Reset the quote whenever the address or delivery method changes.
  React.useEffect(() => {
    setDeliveryQuote(null);
    setQuoteError(null);
  }, [form.address, form.delivery]);

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
    if (form.delivery === "delivery") {
      if (!deliveryQuote) {
        return setFormError(
          "Please calculate the delivery fee for your address before continuing.",
        );
      }
      if (deliveryQuote.deliverable === false) {
        return setFormError(
          "Sorry, we don't deliver beyond 25 km. Please contact us at l.asweetbne@gmail.com.",
        );
      }
    }
    if (!form.time)
      return setFormError(
        form.delivery === "delivery"
          ? "Please choose a delivery time."
          : "Please choose a pick-up time.",
      );
    const brisbaneToday = getBrisbaneTodayIso();
    if (!form.date || form.date <= brisbaneToday)
      return setFormError(
        "Same-day orders are no longer accepted. Please choose a date from tomorrow onwards.",
      );
    const allowedSlots = getAvailableSlots(form.date);
    if (!allowedSlots.includes(form.time as (typeof allowedSlots)[number]))
      return setFormError("Please choose a valid time slot.");
    if (form.notes.length > 1000) return setFormError("Notes must be under 1000 characters.");
    if (cartEntries.length === 0) return setFormError("Your selection is empty — add a flavour first.");
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
    if (!paymentPlan) {
      setFormError("Please choose a payment option.");
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
          time: form.time,
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

      const { url } = await submitOnlineOrder({
        data: { ...payload, origin: window.location.origin, paymentPlan },
      });
      setCart({});
      // Break out of the Lovable preview iframe — Stripe Checkout refuses to load in iframes.
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
      return;
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
    setCheckoutStep("details");
    setOrderRef(null);
    setOrderSnapshot([]);
  };
  const openCheckout = () => {
    if (cartEntries.length === 0) return;
    setCartOpen(false);
    setFormError(null);
    setCheckoutStep("details");
    setCheckoutOpen(true);
  };
  const toggleExpand = (no: string) => {
    setShowDetails(false);
    setExpandedNo((cur) => (cur === no ? null : no));
  };

  return (
    <main className="min-h-screen bg-ink text-[color:var(--foreground)]">
      {/* OPEN-FOR-ORDERS BANNER */}
      {bannerOpen && (
        <div className="fixed top-0 inset-x-0 z-30 bg-ink border-b border-gold/30 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
          <div className="mx-auto max-w-7xl px-4 md:px-10 py-2 flex items-center gap-3 md:gap-5">
            <Sparkles className="hidden sm:block h-3.5 w-3.5 text-gold shrink-0" strokeWidth={1.5} />
            <p className="flex-1 text-[11px] md:text-[12px] leading-snug tracking-wide text-[color:var(--foreground)]/85">
              <span className="text-gold uppercase tracking-[0.22em] mr-2">Now open</span>
              <span className="hidden md:inline">Orders are available online — choose pick-up or delivery, secure your order with a 50% deposit or pay in full.</span>
              <span className="md:hidden">Orders are now open online.</span>
            </p>
            <button
              type="button"
              onClick={scrollToProducts}
              className="shrink-0 inline-flex items-center px-3 py-1.5 text-[10px] md:text-[11px] uppercase tracking-[0.22em] border border-gold/60 text-gold hover:bg-gold hover:text-ink transition-colors"
            >
              Order now
            </button>
            <button
              type="button"
              onClick={closeBanner}
              aria-label="Dismiss"
              className="shrink-0 text-[color:var(--foreground)]/50 hover:text-gold transition"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header
        className="absolute left-0 right-0 z-50"
        style={{ top: bannerOpen ? 44 : 0 }}
      >
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
              className="relative z-50 inline-flex items-center justify-center h-10 w-10 border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors overflow-visible"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  key={bump}
                  aria-label={`${cartCount} item${cartCount > 1 ? "s" : ""} in cart`}
                  className="cart-badge-bump absolute -top-2 -right-2 z-[100] w-[22px] h-[22px] flex items-center justify-center bg-gold text-ink text-xs font-bold leading-none rounded-full drop-shadow-md pointer-events-none"
                  style={{ color: "#1a1a1a" }}
                >
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="group/hero relative overflow-hidden">
        {/* Darkening + vignette layers for readability — reduced for glass showcase */}
        <div className="absolute inset-0 bg-ink/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,8,6,0.25)_55%,var(--ink)_100%)] pointer-events-none" />
        <div className="absolute inset-0 diamond-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink pointer-events-none" />

        {/* Flavour coverflow — floating 3D showcase behind the content card (desktop) */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none z-[1]">
          <div className="pointer-events-auto">
            <FlavourCoverflow flavours={flavours} idx={idx} onSelect={setIdx} />
          </div>
        </div>

        <div className="relative z-[2] mx-auto max-w-7xl px-6 md:px-10 pt-32 md:pt-40 pb-16 md:pb-24 min-h-[100vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center md:justify-end">
            <div className="flex items-center gap-6 md:gap-10 w-full">
              <button
                onClick={prev}
                aria-label="Previous flavour"
                className="hidden md:flex h-12 w-12 items-center justify-center border border-line text-gold hover:border-gold transition backdrop-blur-md bg-ink/30"
              >
                ←
              </button>

              <div className="flex-1 max-w-lg mx-auto md:mx-0 md:ml-auto md:p-2">
                <div className="eyebrow mb-5">{f.label}</div>
                <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.95] mb-5">
                  <span className="sr-only">L&amp;A Sweet — Handcrafted French trompe-l'œil desserts in Brisbane. Current flavour: </span>
                  {f.prefix}
                  <span className="italic text-gold">{f.suffix}</span>
                </h1>
                <p className="text-sm text-[color:var(--foreground)]/70 leading-relaxed mb-7 max-w-md">
                  {f.short}
                </p>

                <button
                  type="button"
                  disabled={f.available === false}
                  onClick={() => startOrderFlow({ no: cartKeyFor(f), qty: 1 })}
                  className="w-full bg-gold text-ink text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-gold/80 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3"
                >
                  {f.available === false ? "Coming Soon" : <>Add to bag · ${f.price ?? 15} <span aria-hidden>→</span></>}
                </button>

                <a
                  href="#products"
                  className="mt-3 w-full border border-gold/60 text-gold text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-gold/10 transition inline-flex items-center justify-center"
                >
                  Explore flavours
                </a>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] tracking-[0.22em] uppercase">
                  <span className="text-gold font-medium">Homemade in Brisbane</span>
                  <span className="text-gold/40">•</span>
                  <span className="text-[color:var(--foreground)]/60">No added sugar</span>
                  <span className="text-gold/40">•</span>
                  <span className="text-[color:var(--foreground)]/60">Trompe-l'œil</span>
                </div>
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

          {/* MOBILE: floating fruits coverflow + flavour selector pills */}
          <div className="md:hidden mt-10">
            <FlavourCoverflow flavours={flavours} idx={idx} onSelect={setIdx} />
            <div className="mt-8 grid grid-cols-2 gap-3">
              {flavours.map((fl, i) => (
                <button
                  key={fl.no}
                  onClick={() => setIdx(i)}
                  className={`flex items-center justify-center gap-2 py-3 text-[11px] tracking-[0.22em] uppercase border transition ${
                    i === idx
                      ? "border-gold text-gold bg-gold/10"
                      : "border-line text-[color:var(--foreground)]/65"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: fl.accent }} />
                  {fl.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <div className="font-serif-display italic text-sm text-[color:var(--foreground)]/60">
              <span className="text-gold">{String(idx + 1).padStart(2, "0")}</span> / {String(flavours.length).padStart(2, "0")}
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
            { v: String(flavours.length), l: "Flavours" },
            { v: "25 km", l: "Delivery radius from Woolloongabba" },
            { v: "15+ pcs", l: "Preparation time may apply" },
            { v: "By distance", l: "Delivery fee calculated at checkout" },
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
            <p className="text-sm text-[color:var(--foreground)]/55 italic max-w-2xl mx-auto">
              No extra sugar added to our homemade fillings.
            </p>
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
                    style={{ ["--ca" as string]: fl.accent }}
                    className={`flavour-card group/prod relative overflow-hidden text-left transition-all duration-500 ease-out ${
                      isExpanded
                        ? "z-30 scale-[1.04] shadow-[0_40px_120px_-20px_rgba(212,168,76,0.35),0_20px_60px_-10px_rgba(0,0,0,0.9)]"
                        : isDimmed
                          ? "z-0 scale-[0.97] opacity-40"
                          : "z-10"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden flavour-halo">
                      {fl.image && (
                        <div
                          aria-hidden
                          className={`flavour-img absolute inset-0 bg-center bg-no-repeat bg-contain transition-transform duration-[1200ms] ease-out ${
                            isExpanded ? "scale-110" : "group-hover/prod:scale-105"
                          }`}
                          style={{ backgroundImage: `url(${fl.image})` }}
                        />
                      )}
                      {/* Soft bottom gradient so caption stays readable */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink via-ink/60 to-transparent pointer-events-none" />

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
                              <span className="text-gold">{fl.available === false ? "??" : `$${fl.price}`}</span>
                            </span>
                            <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/55 mt-1">
                              {fl.available === false ? "Price coming soon" : "per piece"}
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
              Two flavours, one <span className="italic text-gold">experience</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {flavours.map((fl) => (
              <article
                key={fl.no}
                style={{ ["--ca" as string]: fl.accent }}
                className="flavour-card group/card relative overflow-hidden flex flex-col"
              >
                {/* Image on top, fully contained inside the card */}
                <div className="relative aspect-square w-full overflow-hidden flavour-halo p-6 md:p-8">
                  {fl.image && (
                    <img
                      src={fl.image}
                      alt={`${fl.prefix}${fl.suffix}`}
                      className="flavour-img absolute inset-0 m-auto h-full w-full object-contain p-6 md:p-8 transition-transform duration-[1200ms] ease-out group-hover/card:scale-[1.04]"
                    />
                  )}
                  <div className="flavour-no-badge absolute top-4 left-4 z-10 text-[10px] tracking-[0.28em] uppercase px-3 py-1.5">
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
      <InstagramSection />

      <ReviewsHomeSection />

      <section className="pathways-warm border-t border-line">
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
                  "Delivery fee calculated by distance from Woolloongabba — shown at checkout",
                  "Choose one flavour or a mixed selection",
                  "Fresh products, subject to availability",
                  "Made to order in small batches",
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


      <section className="quote-plum">
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
                  Every filling is prepared by hand in small batches, with no extra sugar added — sweetness comes naturally from the ingredients themselves.
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
            <div style={{ ["--ca" as string]: "#e5487f" }} className="allergen-card rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[72px] h-[72px] md:w-[96px] md:h-[96px] shrink-0 z-10">
                <div className="allergen-halo absolute -inset-3 rounded-full blur-xl" />
                <img src={raspberryImg} alt="Handcrafted Raspberry trompe-l'œil dessert by L&A Sweet Brisbane" className="flavour-img relative w-full h-full object-contain" />
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
            <div style={{ ["--ca" as string]: "#ecc94b" }} className="allergen-card rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[72px] h-[72px] md:w-[96px] md:h-[96px] shrink-0 z-10">
                <div className="allergen-halo absolute -inset-3 rounded-full blur-xl" />
                <img src={lemonImg} alt="Handcrafted Lemon trompe-l'œil dessert by L&A Sweet Brisbane" className="flavour-img relative w-full h-full object-contain" />
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

            {/* Mango */}
            <div style={{ ["--ca" as string]: "#f0872a" }} className="allergen-card rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[72px] h-[72px] md:w-[96px] md:h-[96px] shrink-0 z-10">
                <div className="allergen-halo absolute -inset-3 rounded-full blur-xl" />
                <img src={mangoImg} alt="Handcrafted Mango trompe-l'œil dessert by L&A Sweet Brisbane" className="flavour-img relative w-full h-full object-contain" />
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

            {/* Pistachio */}
            <div style={{ ["--ca" as string]: "#8fb04a" }} className="allergen-card rounded-2xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 w-[72px] h-[72px] md:w-[96px] md:h-[96px] shrink-0 z-10">
                <div className="allergen-halo absolute -inset-3 rounded-full blur-xl" />
                <img src={pistachioImg} alt="Handcrafted Pistachio trompe-l'œil dessert by L&A Sweet Brisbane" className="flavour-img relative w-full h-full object-contain" />
              </div>
              <h3 className="font-serif-display text-xl mb-4 text-gold pr-16">Pistachio</h3>
              <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-3">Contains</div>
              <ul className="space-y-2 text-sm text-[color:var(--foreground)]/85 mb-4">
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Milk</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Soy</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Gluten</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Eggs</li>
                <li className="flex items-center gap-2"><span className="text-gold">·</span> Tree nuts (pistachio)</li>
              </ul>
              <div className="mt-auto text-xs text-[color:var(--foreground)]/60 leading-relaxed border-t border-gold/20 pt-3">
                Contains pistachio (tree nuts). Milk and soy are present in the white chocolate; gluten and eggs in the homemade biscuit.
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
            <Link to="/orders/lookup" className="hover:text-gold transition">Find my order</Link>
            <Link to="/privacy" className="hover:text-gold transition">Privacy</Link>
            <Link to="/terms" className="hover:text-gold transition">Terms</Link>
            <Link to="/legal" className="hover:text-gold transition">Legal</Link>
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
              Pick-up: free · Delivery: fee calculated at checkout based on your address
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
        paymentPlan={paymentPlan}
        setPaymentPlan={setPaymentPlan}
        deliveryQuote={deliveryQuote}
        quoteLoading={quoteLoading}
        quoteError={quoteError}
        fetchDeliveryQuote={fetchDeliveryQuote}
        effectiveDeliveryFee={effectiveDeliveryFee}
        stockByNo={
          dailyStock
            ? Object.fromEntries(
                flavours
                  .filter((fl) => fl.available !== false)
                  .map((fl) => [
                    fl.no,
                    {
                      name: fl.name,
                      remaining:
                        dailyStock.stock[fl.no.toLowerCase()]?.remaining ??
                        dailyStock.defaultUnits,
                    },
                  ]),
              )
            : null
        }
      />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT MODAL
// ─────────────────────────────────────────────────────────────────────────────
type CheckoutStep = "details" | "review" | "payment" | "confirmed";
type OrderForm = {
  fullName: string;
  email: string;
  phone: string;
  business: string;
  orderType: string;
  date: string;
  time: string;
  delivery: "delivery" | "pickup";
  address: string;
  notes: string;
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
  paymentPlan,
  setPaymentPlan,
  deliveryQuote,
  quoteLoading,
  quoteError: _quoteError,
  fetchDeliveryQuote,
  effectiveDeliveryFee,
  stockByNo,
}: {
  open: boolean;
  onClose: () => void;
  step: CheckoutStep;
  setStep: (s: CheckoutStep) => void;
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
  paymentPlan: "full" | "deposit_50" | null;
  setPaymentPlan: (m: "full" | "deposit_50" | null) => void;
  deliveryQuote: {
    deliverable: boolean | null;
    distanceKm: number | null;
    feeAud: number | null;
    method: string;
    pending?: boolean;
    message?: string;
  } | null;
  quoteLoading: boolean;
  quoteError: string | null;
  fetchDeliveryQuote: (addr: string) => Promise<void>;
  effectiveDeliveryFee: number;
  stockByNo: Record<string, { name: string; remaining: number }> | null;
}) {
  const steps: { k: CheckoutStep; l: string }[] = [
    { k: "details", l: "1 · Details" },
    { k: "review", l: "2 · Review" },
    { k: "payment", l: "3 · Payment" },
  ];
  const order: CheckoutStep[] = ["details", "review", "payment", "confirmed"];

  const fmtDate = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return d && m && y ? `${d}/${m}/${y}` : iso;
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
          {/* STEP: DETAILS */}
          {step === "details" && (
            <form onSubmit={validateDetails} className="space-y-5" noValidate>
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">
                  Your details
                </div>
                <h3 className="font-serif-display text-2xl">
                  Your <span className="italic text-gold">information</span>
                </h3>
                <p className="mt-3 text-[11px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55">
                  Guest checkout — no account needed.
                </p>
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
                <div className="sm:col-span-2 rounded-md border-l-[3px] border-gold px-4 py-4" style={{ backgroundColor: "rgba(201,168,74,0.08)" }}>
                  <div className="font-serif-display text-gold text-lg leading-snug mb-1">
                    📅 Advance orders only
                  </div>
                  <p className="text-sm leading-relaxed text-[color:var(--foreground)]/85">
                    To guarantee the freshness and quality of every creation, we only accept orders at least 1 day in advance. If we have stock available on the day, we'll reach out directly to offer same-day delivery. Thank you for your understanding 🤍
                  </p>
                </div>
                <FieldLA label="Preferred date">
                  <input
                    type="date"
                    value={form.date}
                    min={getBrisbaneTomorrowIso()}
                    onChange={(e) => {
                      const v = e.target.value;
                      const today = getBrisbaneTodayIso();
                      if (v && v <= today) {
                        setFormError("Same-day orders are no longer accepted. Please choose a date from tomorrow onwards.");
                        updateForm("date", "");
                        return;
                      }
                      setFormError(null);
                      updateForm("date", v);
                      const allowed = getAvailableSlots(v);
                      if (form.time && !allowed.includes(form.time as (typeof allowed)[number])) {
                        updateForm("time", "");
                      }
                    }}
                    className={inputCls}
                  />
                  <p className="mt-2 text-xs italic text-[color:var(--foreground)]/55">
                    We need at least 1 day to prepare your order with care 🍰
                  </p>
                  {form.date && stockByNo && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(stockByNo).map(([no, info]) => {
                        const remaining = info.remaining;
                        const soldOut = remaining <= 0;
                        const low = !soldOut && remaining <= 5;
                        return (
                          <p
                            key={no}
                            className={`text-[10px] tracking-[0.18em] uppercase leading-relaxed ${
                              soldOut
                                ? "text-[color:var(--destructive)]"
                                : low
                                  ? "text-gold"
                                  : "text-[color:var(--foreground)]/55"
                            }`}
                          >
                            {info.name}:{" "}
                            {soldOut ? (
                              <span>Sold out for this date — choose another day</span>
                            ) : (
                              <span>{remaining} left for this date</span>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </FieldLA>
              </div>

              <FieldLA label="How would you like to receive your order?">
                <div className="grid grid-cols-2 gap-3">
                  {(["delivery", "pickup"] as const).map((opt) => {
                    const selected = form.delivery === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => updateForm("delivery", opt)}
                        className={`inline-flex items-center justify-center gap-2 text-xs tracking-[0.24em] uppercase py-3 transition-all ${
                          selected
                            ? "bg-gold text-ink border-2 border-gold font-bold shadow-[0_0_18px_rgba(212,175,55,0.45),inset_0_0_0_1px_rgba(0,0,0,0.15)]"
                            : "bg-transparent text-gold border border-gold/40 hover:border-gold hover:shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                        }`}
                      >
                        {selected && <Check size={14} strokeWidth={2.6} />}
                        {opt === "delivery" ? "Delivery" : "Pick-up"}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Pick-up: free, no minimum · Delivery: fee calculated by distance from Woolloongabba.
                </p>
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Stock updates in real time · Choose any available date and time.
                </p>
              </FieldLA>

              {form.delivery === "pickup" && (
                <div className="border border-gold/40 bg-ink-3/50 px-4 py-3">
                  <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">
                    Pick-up address
                  </div>
                  <div className="text-sm text-[color:var(--foreground)]/85 leading-relaxed">
                    {PICKUP_ADDRESS}
                  </div>
                </div>
              )}

              <FieldLA label={form.delivery === "delivery" ? "Delivery time" : "Pick-up time"} required>
                {(() => {
                  const allowed = getAvailableSlots(form.date);
                  if (allowed.length === 0) {
                    return (
                      <p className="text-[11px] tracking-wide text-[color:var(--foreground)]/65 border border-gold/30 bg-ink-3/40 px-3 py-3">
                        No more slots available today — please choose another date.
                      </p>
                    );
                  }
                  return (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {allowed.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateForm("time", slot)}
                          className={`text-[11px] tracking-[0.18em] py-2 border transition-colors ${
                            form.time === slot
                              ? "bg-gold text-ink border-gold"
                              : "text-gold border-gold/40 hover:border-gold"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/55 leading-relaxed">
                  Times shown in 24-hour format.
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
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v.length > 15 && !deliveryQuote && !quoteLoading) {
                        void fetchDeliveryQuote(v);
                      }
                    }}
                    className={inputCls}
                    placeholder="Street, suburb, postcode"
                  />
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                    <button
                      type="button"
                      onClick={() => void fetchDeliveryQuote(form.address)}
                      disabled={quoteLoading || form.address.trim().length < 5}
                      className="inline-flex items-center justify-center gap-2 text-[10px] tracking-[0.24em] uppercase border border-gold/50 text-gold px-4 py-2 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {quoteLoading ? "Calculating…" : "Calculate delivery fee"}
                    </button>
                    {deliveryQuote?.deliverable === true && (
                      <span className="text-xs text-[color:var(--foreground)]/85">
                        Estimated delivery fee:{" "}
                        <span className="text-gold font-serif-display text-base">
                          A${Number(deliveryQuote.feeAud ?? 0).toFixed(2)}
                        </span>{" "}
                        (approx. {Number(deliveryQuote.distanceKm ?? 0).toFixed(1)} km from Woolloongabba)
                      </span>
                    )}
                  </div>
                  {deliveryQuote?.deliverable === false && (
                    <p className="mt-2 text-xs text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-3 py-2">
                      Sorry, we don't deliver beyond 25 km. Please contact us at{" "}
                      <a href="mailto:l.asweetbne@gmail.com" className="underline">
                        l.asweetbne@gmail.com
                      </a>
                      .
                    </p>
                  )}
                  {deliveryQuote?.pending && (
                    <p className="mt-2 text-xs text-[color:var(--foreground)]/70 border border-gold/30 bg-ink-3/60 px-3 py-2">
                      We couldn't estimate the delivery fee automatically. We'll contact you within 24h
                      with the exact amount.
                    </p>
                  )}
                  <p className="mt-2 text-[10px] italic text-[color:var(--foreground)]/50 leading-relaxed">
                    Distance is estimated. Actual fee may vary slightly and will be confirmed before dispatch.
                  </p>
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
                    onClose();
                  }}
                  className="sm:w-1/3 border border-gold/40 text-gold text-[11px] tracking-[0.24em] uppercase py-4 hover:bg-gold hover:text-ink transition-colors"
                >
                  ← Back to cart
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
                  const fee = effectiveDeliveryFee;
                  const message =
                    form.delivery === "pickup"
                      ? "Pick-up is free with no minimum order."
                      : deliveryQuote?.deliverable === true
                        ? `Delivery fee based on approx. ${Number(deliveryQuote.distanceKm ?? 0).toFixed(1)} km from Woolloongabba.`
                        : deliveryQuote?.pending
                          ? "We'll confirm your exact delivery fee within 24h."
                          : "Delivery fee will be calculated from your address at the Details step.";
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
                  {form.time ? ` · ${form.time}` : ""}
                </div>
                {form.delivery === "delivery" && form.address && (
                  <div className="text-[color:var(--foreground)]/70 pt-1">{form.address}</div>
                )}
                {form.delivery === "pickup" && (
                  <div className="text-[color:var(--foreground)]/70 pt-1">
                    Pick-up address: {PICKUP_ADDRESS}
                  </div>
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
                    {form.time ? ` · ${form.time}` : ""}
                  </span>
                  <span className="font-serif-display normal-case tracking-normal text-base">
                    <span className="text-gold">${snapshotTotal}</span>
                  </span>
                </div>
                {(() => {
                  const fee = effectiveDeliveryFee;
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

              {/* Payment options — 50% deposit or pay in full. */}
              {(() => {
                const fee = effectiveDeliveryFee;
                const orderTotal = snapshotTotal + fee;
                const deposit = Math.round((orderTotal / 2) * 100) / 100;
                const balance = Math.round((orderTotal - deposit) * 100) / 100;
                const fulfilWord = form.delivery === "delivery" ? "delivery" : "pick-up";
                return (
                  <div className="space-y-3">
                    <div className="text-[10px] tracking-[0.28em] uppercase text-gold">
                      How would you like to pay?
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentPlan("deposit_50")}
                        className={`text-left border p-4 transition-colors ${
                          paymentPlan === "deposit_50"
                            ? "border-gold bg-gold text-ink"
                            : "border-gold/30 hover:border-gold/60"
                        }`}
                      >
                        <div
                          className={`text-[11px] tracking-[0.24em] uppercase mb-1 ${
                            paymentPlan === "deposit_50" ? "text-ink" : "text-gold"
                          }`}
                        >
                          {paymentPlan === "deposit_50" ? "✓ " : ""}Option A
                        </div>
                        <div className="font-serif-display text-lg">
                          Pay 50% deposit now — A${deposit.toFixed(2)}
                        </div>
                        <p
                          className={`mt-1 text-[12px] leading-relaxed ${
                            paymentPlan === "deposit_50"
                              ? "text-ink/80"
                              : "text-[color:var(--foreground)]/70"
                          }`}
                        >
                          Secure your order with a 50% deposit. The remaining
                          A${balance.toFixed(2)} is collected in cash on {fulfilWord}.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentPlan("full")}
                        className={`text-left border p-4 transition-colors ${
                          paymentPlan === "full"
                            ? "border-gold bg-gold text-ink"
                            : "border-gold/30 hover:border-gold/60"
                        }`}
                      >
                        <div
                          className={`text-[11px] tracking-[0.24em] uppercase mb-1 ${
                            paymentPlan === "full" ? "text-ink" : "text-gold"
                          }`}
                        >
                          {paymentPlan === "full" ? "✓ " : ""}Option B
                        </div>
                        <div className="font-serif-display text-lg">
                          Pay full amount now — A${orderTotal.toFixed(2)}
                        </div>
                        <p
                          className={`mt-1 text-[12px] leading-relaxed ${
                            paymentPlan === "full"
                              ? "text-ink/80"
                              : "text-[color:var(--foreground)]/70"
                          }`}
                        >
                          Pay in full now and nothing to settle later.
                        </p>
                      </button>
                    </div>
                  </div>
                );
              })()}

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
                    : paymentPlan
                      ? "Continue to Secure Payment →"
                      : "Choose a payment option"}
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
                Thank you — your <span className="italic text-gold">order is confirmed</span>.
              </h3>
              <p className="text-sm text-[color:var(--foreground)]/75 max-w-md mx-auto leading-relaxed">
                A confirmation has been sent to{" "}
                <span className="text-gold">{form.email}</span>. Payment will be
                collected in cash on {form.delivery === "delivery" ? "delivery" : "pick-up"}.
              </p>
              <div className="mt-8 inline-block border border-gold/40 bg-ink-3/60 px-6 py-4">
                <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--foreground)]/55 mb-1">
                  Order reference
                </div>
                <div className="font-serif-display text-2xl text-gold tracking-wider">
                  {orderRef}
                </div>
              </div>
              <div className="mt-6 mx-auto max-w-sm border border-gold/30 bg-ink-3/40 px-5 py-4 text-left text-[12px] leading-relaxed text-[color:var(--foreground)]/80">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">
                  {form.delivery === "delivery" ? "Delivery" : "Pick-up"} details
                </div>
                {form.delivery === "pickup" ? (
                  <p>
                    Pick-up at <span className="text-gold">{PICKUP_ADDRESS}</span>
                    {form.date ? <> on <span className="text-gold">{fmtDate(form.date)}</span></> : null}
                    {form.time ? <> at <span className="text-gold">{form.time}</span></> : null}.
                  </p>
                ) : (
                  <p>
                    Delivery to <span className="text-gold">{form.address}</span>
                    {form.date ? <> on <span className="text-gold">{fmtDate(form.date)}</span></> : null}
                    {form.time ? <> at <span className="text-gold">{form.time}</span></> : null}.
                  </p>
                )}
              </div>
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
