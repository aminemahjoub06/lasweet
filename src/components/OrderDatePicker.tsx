import * as React from "react";
import {
  BLOCKED_DATE_MESSAGE,
  getBrisbaneTodayIso,
  getEarliestOrderDateIso,
  isDateBlocked,
} from "@/lib/config";

const D1_MESSAGE = "We need at least 1 day to prepare your order";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Australian long format, e.g. "Tue 11 Aug 2026". */
export function formatOrderDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date(Date.UTC(y, m - 1, d)))
    .replace(/,/g, "");
}

type DayCell = { iso: string; day: number; disabled: boolean; reason: string | null };

export function OrderDatePicker({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (iso: string) => void;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const earliest = getEarliestOrderDateIso();
  const today = getBrisbaneTodayIso();
  const anchor = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : earliest;
  const [view, setView] = React.useState<{ y: number; m: number }>(() => {
    const [y, m] = anchor.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const [y, m] = anchor.split("-").map(Number);
    setView({ y, m: m - 1 });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cells: Array<DayCell | null> = React.useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1));
    // Monday-first offset (Australian convention).
    const lead = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    const out: Array<DayCell | null> = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoOf(view.y, view.m, d);
      const tooEarly = iso <= today || iso < earliest;
      const blocked = isDateBlocked(iso);
      out.push({
        iso,
        day: d,
        disabled: tooEarly || blocked,
        reason: tooEarly ? D1_MESSAGE : blocked ? BLOCKED_DATE_MESSAGE : null,
      });
    }
    return out;
  }, [view.y, view.m, today, earliest]);

  const canGoBack = isoOf(view.y, view.m, 1) > earliest.slice(0, 7) + "-01";

  function shiftMonth(delta: number) {
    setView((v) => {
      const next = new Date(Date.UTC(v.y, v.m + delta, 1));
      return { y: next.getUTCFullYear(), m: next.getUTCMonth() };
    });
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 bg-ink-3 border border-[color:var(--gold-soft)] px-3 py-3 text-left text-sm text-[color:var(--foreground)] hover:border-gold transition-colors"
      >
        <span className={value ? "" : "text-[color:var(--foreground)]/50"}>
          {value ? formatOrderDate(value) : "Choose a date"}
        </span>
        <span aria-hidden="true" className="text-gold text-base leading-none">
          🗓
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose your preferred date"
          className="absolute z-50 mt-2 w-[19rem] max-w-[calc(100vw-2.5rem)] border border-[color:var(--gold-soft)] bg-ink-2 p-3 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoBack}
              onClick={() => shiftMonth(-1)}
              className="px-2 py-1 text-gold hover:bg-[color:var(--gold-soft)]/20 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              ←
            </button>
            <div className="font-serif-display text-gold text-lg">
              {MONTHS[view.m]} {view.y}
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="px-2 py-1 text-gold hover:bg-[color:var(--gold-soft)]/20"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[9px] tracking-[0.16em] uppercase text-[color:var(--foreground)]/45 py-1"
              >
                {w.slice(0, 2)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) =>
              c === null ? (
                <div key={`e${i}`} />
              ) : (
                <div key={c.iso} className="relative group">
                  <button
                    type="button"
                    disabled={c.disabled}
                    title={c.reason ?? undefined}
                    aria-label={formatOrderDate(c.iso)}
                    aria-current={c.iso === value ? "date" : undefined}
                    onClick={() => {
                      onChange(c.iso);
                      setOpen(false);
                    }}
                    className={[
                      "w-full aspect-square flex items-center justify-center text-sm transition-colors",
                      c.disabled
                        ? "opacity-35 cursor-not-allowed text-[color:var(--foreground)]/70"
                        : c.iso === value
                          ? "bg-gold text-ink font-semibold"
                          : "text-[color:var(--foreground)] hover:bg-[color:var(--gold-soft)]/20",
                    ].join(" ")}
                  >
                    {c.day}
                  </button>
                  {c.reason && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block whitespace-nowrap z-50 bg-ink border border-[color:var(--gold-soft)] px-2 py-1 text-[10px] text-[color:var(--foreground)]"
                    >
                      {c.reason}
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
