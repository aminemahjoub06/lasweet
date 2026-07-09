import * as React from "react";

export function StarDisplay({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 text-gold ${className}`} style={{ letterSpacing: "1px", fontSize: size }} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden="true">{i < full ? "★" : "☆"}</span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 32 }: { value: number; onChange: (n: number) => void; size?: number }) {
  const [hover, setHover] = React.useState<number | null>(null);
  const active = hover ?? value;
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(n)}
          className="focus:outline-none transition-transform hover:scale-110"
          style={{ color: n <= active ? "#c9a14a" : "rgba(201,161,74,0.25)", fontSize: size, lineHeight: 1 }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
