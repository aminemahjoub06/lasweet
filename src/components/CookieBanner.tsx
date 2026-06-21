import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "cookieConsent";
const VERSION = 2;

type Consent = {
  version: number;
  essential: true;
  preferences: boolean;
  analytics: boolean;
  decidedAt: string;
};

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<Consent> & { version?: number };
      if (parsed?.version !== VERSION) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (prefs: boolean, an: boolean) => {
    const consent: Consent = {
      version: VERSION,
      essential: true,
      preferences: prefs,
      analytics: an,
      decidedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--line)]"
      style={{ background: "var(--ink-2)", fontFamily: FONT }}
    >
      <div className="mx-auto max-w-6xl px-6 py-4">
        {!showDetails ? (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
              We use essential cookies to make your cart and checkout work. We may also use optional cookies to remember your preferences or measure site usage. You can choose which categories to allow. Read our{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 transition-colors hover:opacity-80"
                style={{ color: "var(--gold-soft)" }}
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                onClick={() => save(false, false)}
                className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)]"
                style={{ color: "var(--foreground)" }}
              >
                Reject optional
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)]"
                style={{ color: "var(--foreground)" }}
              >
                Customise
              </button>
              <button
                onClick={() => save(true, true)}
                className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)] focus:ring-offset-2 focus:ring-offset-[var(--ink-2)]"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif-display text-lg" style={{ color: "var(--foreground)" }}>
                  Cookie preferences
                </h2>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.75 }}>
                  Choose which categories you allow. You can change this at any time. See our{" "}
                  <Link to="/privacy" className="underline underline-offset-2" style={{ color: "var(--gold-soft)" }}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-xs underline underline-offset-2 hover:opacity-80"
                style={{ color: "var(--gold-soft)" }}
                aria-label="Back"
              >
                Back
              </button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3">
              <CategoryRow
                title="Essential"
                description="Required for the cart, checkout and security. Always on."
                checked
                disabled
              />
              <CategoryRow
                title="Preferences"
                description="Remembers your choices (e.g. flavour, location) for a smoother visit."
                checked={preferences}
                onChange={setPreferences}
              />
              <CategoryRow
                title="Analytics"
                description="Helps us measure site usage to improve the experience. No advertising."
                checked={analytics}
                onChange={setAnalytics}
              />
            </ul>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => save(false, false)}
                className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)]"
                style={{ color: "var(--foreground)" }}
              >
                Reject optional
              </button>
              <button
                onClick={() => save(preferences, analytics)}
                className="rounded-md border border-[var(--gold)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)]"
                style={{ color: "var(--gold-soft)" }}
              >
                Save preferences
              </button>
              <button
                onClick={() => save(true, true)}
                className="rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--gold-soft)] focus:ring-offset-2 focus:ring-offset-[var(--ink-2)]"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                Accept all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <li className="rounded-md border border-[var(--line)] p-3" style={{ background: "var(--ink-3)" }}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[var(--gold)] disabled:opacity-60"
          aria-label={title}
        />
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {title}
            {disabled && (
              <span className="ml-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--gold-soft)" }}>
                Always on
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.7 }}>
            {description}
          </p>
        </div>
      </label>
    </li>
  );
}
