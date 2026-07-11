import { useEffect, useState } from "react";
import { Globe, X } from "lucide-react";
import {
  BANNER_KEY,
  matchBrowserLanguage,
  setGoogtransCookie,
  setStoredLanguage,
  getStoredLanguage,
  type Lang,
} from "@/lib/languages";

export function TranslateBanner() {
  const [suggested, setSuggested] = useState<Lang | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Never nag if a preference exists or the banner was dismissed.
    if (getStoredLanguage()) return;
    if (localStorage.getItem(BANNER_KEY)) return;
    const langs =
      (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) ?? [];
    for (const tag of langs) {
      const hit = matchBrowserLanguage(tag);
      if (hit) {
        setSuggested(hit);
        return;
      }
    }
  }, []);

  if (!suggested) return null;

  const accept = () => {
    setStoredLanguage(suggested.code);
    setGoogtransCookie(suggested.code);
    localStorage.setItem(BANNER_KEY, "accepted");
    window.location.reload();
  };
  const dismiss = () => {
    localStorage.setItem(BANNER_KEY, "dismissed");
    setSuggested(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Translate this page"
      className="notranslate fixed left-1/2 -translate-x-1/2 bottom-4 z-[70] w-[min(560px,calc(100vw-24px))] bg-ink-2 border border-gold/40 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] px-4 py-3 flex items-center gap-3"
      translate="no"
    >
      <Globe className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
      <div className="flex-1 text-[13px] leading-snug text-[color:var(--foreground)]/85">
        Translate this page to{" "}
        <span className="font-serif-display text-gold text-[15px]">{suggested.label}</span>
        <span className="text-[color:var(--foreground)]/50"> ({suggested.english})</span>?
      </div>
      <button
        type="button"
        onClick={accept}
        className="text-[10px] tracking-[0.22em] uppercase bg-gold text-ink px-3 py-2 hover:bg-[color:var(--gold-soft)] transition-colors"
      >
        Translate
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Keep in English"
        className="text-[color:var(--foreground)]/60 hover:text-gold transition-colors"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}