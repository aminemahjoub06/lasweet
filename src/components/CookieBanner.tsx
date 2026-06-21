import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "accepted") {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
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
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
          We use essential cookies to make your cart and checkout work properly. We don't use tracking or advertising cookies. By continuing to browse, you accept this. Read our{" "}
          <Link
            to="/privacy"
            className="underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: "var(--gold-soft)" }}
          >
            Privacy Policy
          </Link>
          .
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 rounded-md px-5 py-2 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--ink-2)]"
          style={{
            background: "var(--gold)",
            color: "var(--ink)",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            focusRingColor: "var(--gold-soft)",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
