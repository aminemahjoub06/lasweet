import * as React from "react";
import raspberryImg from "@/assets/raspberry.png";
import lemonImg from "@/assets/lemon.png";
import mangoImg from "@/assets/mango.png";
import pistachioImg from "@/assets/pistachio.png";
import {
  PROMO_LABEL,
  PROMO_SUBTITLE,
  PROMO_TITLE,
  PROMO_VALIDITY_TEXT,
  isPromoActive,
} from "@/lib/config";

const STORAGE_KEY = "promo_popup_dismissed_until";
const DAY_MS = 24 * 60 * 60 * 1000;

const PHOTOS = [
  { src: raspberryImg, alt: "Raspberry trompe-l'oeil dessert by L&A Sweet" },
  { src: lemonImg, alt: "Lemon trompe-l'oeil dessert by L&A Sweet" },
  { src: mangoImg, alt: "Mango trompe-l'oeil dessert by L&A Sweet" },
  { src: pistachioImg, alt: "Pistachio trompe-l'oeil dessert by L&A Sweet" },
];

/** Popup state: auto-opens 1.5s after mount, snoozed 24h after dismissal. */
export function usePromoPopup() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isPromoActive()) return;
    let dismissedUntil = 0;
    try {
      dismissedUntil = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
    } catch {
      dismissedUntil = 0;
    }
    if (Date.now() < dismissedUntil) return;
    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = React.useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + DAY_MS));
    } catch {
      // ignore
    }
  }, []);

  const reopen = React.useCallback(() => setOpen(true), []);

  return { open, dismiss, reopen, active: isPromoActive() };
}

export function PromoPopup({
  open,
  onDismiss,
  onOrderNow,
}: {
  open: boolean;
  onDismiss: () => void;
  onOrderNow: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Limited time offer"
    >
      <button
        type="button"
        aria-label="Close offer"
        onClick={onDismiss}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[500px] rounded-xl border border-gold/40 bg-ink-2 p-4 sm:p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-3 top-3 h-8 w-8 text-lg leading-none text-[color:var(--foreground)]/60 hover:text-gold transition-colors"
        >
          ×
        </button>

        <div className="text-center">
          <div className="text-[10px] tracking-[0.32em] uppercase text-gold">{PROMO_LABEL}</div>
          <h2 className="mt-3 font-serif-display italic text-gold text-3xl sm:text-4xl leading-tight">
            {PROMO_TITLE}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--foreground)]/85">
            {PROMO_SUBTITLE}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PHOTOS.map((p) => (
            <div
              key={p.alt}
              className="rounded-lg border border-gold/20 bg-ink-3/50 p-2 flex items-center justify-center"
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_8px_18px_rgba(201,161,74,0.35)]"
              />
            </div>
          ))}
        </div>

        <p
          className="mt-5 text-center text-[11px] italic"
          style={{ color: "rgba(237, 228, 211, 0.7)" }}
        >
          {PROMO_VALIDITY_TEXT}
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={onOrderNow}
            className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-3 hover:bg-[color:var(--gold-soft)] transition-colors"
          >
            Order now
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full text-[11px] tracking-[0.18em] uppercase hover:text-gold transition-colors"
            style={{ color: "rgba(237, 228, 211, 0.6)" }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
