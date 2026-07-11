import { useEffect, useRef, useState } from "react";
import { Globe, Check, ExternalLink } from "lucide-react";
import {
  LANGUAGES,
  clearGoogtransCookie,
  clearStoredLanguage,
  getStoredLanguage,
  setGoogtransCookie,
  setStoredLanguage,
} from "@/lib/languages";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("en");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = getStoredLanguage();
    if (stored) setCurrent(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function apply(code: string) {
    if (code === "en") {
      clearStoredLanguage();
      clearGoogtransCookie();
    } else {
      setStoredLanguage(code);
      setGoogtransCookie(code);
    }
    // A full reload is the reliable path — the Google widget re-reads the
    // cookie on load and applies the translation to the freshly-rendered DOM.
    window.location.reload();
  }

  function openFullTranslate() {
    const url = `https://translate.google.com/translate?sl=en&tl=auto&u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div ref={ref} className="notranslate relative" translate="no">
      <button
        type="button"
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center h-10 w-10 border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right bg-ink-2 border border-gold/40 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] z-[60]"
        >
          <div className="px-4 py-3 border-b border-gold/20 text-[10px] tracking-[0.28em] uppercase text-gold/80">
            Language
          </div>
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {LANGUAGES.map((l) => {
              const active = current === l.code;
              return (
                <li key={l.code}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => apply(l.code)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-gold/10 text-gold"
                        : "text-[color:var(--foreground)]/85 hover:bg-gold/5 hover:text-gold"
                    }`}
                  >
                    <span className="flex flex-col leading-tight">
                      <span className="font-serif-display text-base">{l.label}</span>
                      <span className="text-[10px] tracking-[0.18em] uppercase text-[color:var(--foreground)]/50">
                        {l.english}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-gold/20">
            <button
              type="button"
              onClick={openFullTranslate}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-[11px] tracking-[0.22em] uppercase text-gold hover:bg-gold/5 transition-colors"
            >
              <span>More languages…</span>
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            {current !== "en" && (
              <button
                type="button"
                onClick={() => apply("en")}
                className="w-full px-4 py-2.5 text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/60 hover:text-gold border-t border-gold/10 transition-colors"
              >
                Reset to English
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}