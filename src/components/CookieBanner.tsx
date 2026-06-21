import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "cookieConsent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (consent !== "accepted") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)]"
      style={{ background: "var(--ink-2)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6">
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            We use essential cookies to make your cart and checkout work properly. We don't use tracking or advertising cookies. By continuing to browse, you accept this. Read our{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: "var(--gold-soft)" }}
            >
              Privacy Policy
            </Link>
            .
          </p>
          <button
            onClick={handleAccept}
            className="shrink-0 rounded-md px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)] focus:ring-offset-2 focus:ring-offset-[var(--ink-2)]"
            style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
