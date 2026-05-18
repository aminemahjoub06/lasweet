import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Flavour = {
  no: string;
  name: string;
  prefix: string;
  suffix: string;
  label: string;
  description: string;
  short: string;
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
  },
];

function Index() {
  const [idx, setIdx] = useState(1); // raspberry default per brief
  const f = flavours[idx];
  const prev = () => setIdx((i) => (i - 1 + flavours.length) % flavours.length);
  const next = () => setIdx((i) => (i + 1) % flavours.length);

  return (
    <main className="min-h-screen bg-ink text-[color:var(--foreground)]">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
          <a href="#" className="font-serif-display text-xl md:text-2xl leading-none">
            L<span className="text-gold">&</span>A <span className="italic">Sweet</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/70">
            <a href="#creations" className="hover:text-gold transition">Creations</a>
            <a href="#wholesale" className="hover:text-gold transition">For Restaurants</a>
            <a href="#events" className="hover:text-gold transition">Events</a>
            <a href="#story" className="hover:text-gold transition">About</a>
            <a href="#footer" className="hover:text-gold transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative diamond-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10 pt-32 md:pt-40 pb-16 md:pb-24 min-h-[100vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center md:justify-end">
            <div className="flex items-center gap-6 md:gap-10 w-full">
              <button
                onClick={prev}
                aria-label="Previous flavour"
                className="hidden md:flex h-12 w-12 items-center justify-center border border-line text-gold hover:border-gold transition"
              >
                ←
              </button>

              <div className="flex-1 max-w-xl mx-auto md:mx-0 md:ml-auto border border-line bg-ink/60 backdrop-blur p-8 md:p-12">
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

                <button className="w-full border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-gold hover:text-ink transition">
                  Order this flavour
                </button>
              </div>

              <button
                onClick={next}
                aria-label="Next flavour"
                className="hidden md:flex h-12 w-12 items-center justify-center border border-line text-gold hover:border-gold transition"
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

      {/* OUR STORY */}
      <section id="story" className="diamond-bg">
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
              <article key={fl.no} className="bg-ink-2 p-8 md:p-10 min-h-[280px] flex flex-col">
                <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-6">No. {fl.no}</div>
                <h3 className="font-serif-display text-3xl md:text-4xl mb-4">
                  {fl.prefix}<span className="italic text-gold">{fl.suffix}</span>
                </h3>
                <p className="text-sm text-[color:var(--foreground)]/65 leading-relaxed">
                  {fl.short}
                </p>
                <div className="mt-auto pt-8">
                  <div className="h-px w-10 bg-gold" />
                </div>
              </article>
            ))}
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
            <button className="border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-gold hover:text-ink transition">
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
            <button className="border border-gold text-gold text-[11px] tracking-[0.28em] uppercase py-4 px-8 hover:bg-gold hover:text-ink transition">
              Book my event
            </button>
          </div>
        </div>
      </section>

      {/* QUOTE */}
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
    </main>
  );
}
