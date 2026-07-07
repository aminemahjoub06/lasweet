import * as React from "react";

/**
 * FlavourCoverflow — 3D "coverflow" of floating flavour images.
 * The active flavour faces front; neighbours are turned on the Y axis,
 * scaled down and dimmed. Each fruit floats with a soft shadow pulsing
 * beneath it. Auto-advances (pauses on hover); click a side flavour to
 * bring it to the front.
 *
 * Requires two @keyframes in your global CSS (src/styles.css):
 *
 *   @keyframes fruitFloat { 0%,100% { transform: translateY(8px); } 50% { transform: translateY(-8px); } }
 *   @keyframes shadowPulse { 0%,100% { transform: translateX(-50%) scaleX(1); opacity: .5; } 50% { transform: translateX(-50%) scaleX(.78); opacity: .26; } }
 *
 * Usage in the hero (idx / setIdx already exist in Index):
 *   <FlavourCoverflow flavours={flavours} idx={idx} onSelect={setIdx} />
 */

type CoverflowFlavour = { no: string; name: string; image?: string; accent?: string };

export function FlavourCoverflow({
  flavours,
  idx,
  onSelect,
  autoAdvanceMs = 5000,
}: {
  flavours: CoverflowFlavour[];
  idx: number;
  onSelect: (i: number) => void;
  autoAdvanceMs?: number;
}) {
  const N = flavours.length;
  const [paused, setPaused] = React.useState(false);
  const active = flavours[idx];
  const fa = active?.accent ?? "#c9a14a";

  React.useEffect(() => {
    if (!autoAdvanceMs || paused || N < 2) return;
    const id = setInterval(() => onSelect((idx + 1) % N), autoAdvanceMs);
    return () => clearInterval(id);
  }, [idx, paused, N, autoAdvanceMs, onSelect]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={
        {
          position: "relative",
          width: "min(92vw, 520px)",
          aspectRatio: "1 / 1",
          perspective: "1400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ["--fa" as string]: fa,
          transition: "--fa .9s ease",
        } as React.CSSProperties
      }
    >
      {/* accent glow behind the active fruit */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "8%",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--fa) 50%, transparent), transparent 72%)",
          filter: "blur(34px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
        {flavours.map((fl, i) => {
          let off = i - idx;
          if (off > N / 2) off -= N;
          if (off < -N / 2) off += N;
          const a = Math.abs(off);
          let txPct: number, ry: number, tz: number, sc: number, op: number;
          if (a > 1.5) {
            txPct = 0;
            ry = 0;
            tz = -440;
            sc = 0.5;
            op = 0;
          } else {
            txPct = off * 58;
            ry = off * -45;
            tz = -a * 140;
            sc = 1 - a * 0.18;
            op = 1 - a * 0.42;
          }
          const isActive = off === 0;
          const delay = `${(i * 0.5).toFixed(2)}s`;
          return (
            <div
              key={fl.no}
              onClick={() => onSelect(i)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "80%",
                height: "80%",
                transform: `translate(-50%,-50%) translateX(${txPct}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`,
                transformStyle: "preserve-3d",
                transition: "transform .95s cubic-bezier(.34,1.2,.5,1), opacity .8s ease",
                opacity: op,
                zIndex: 100 - Math.round(a * 10),
                cursor: isActive ? "default" : "pointer",
                pointerEvents: op <= 0.05 ? "none" : "auto",
              }}
            >
              {/* floating ground shadow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "1%",
                  width: "48%",
                  height: "5.5%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 72%)",
                  filter: "blur(7px)",
                  animation: "shadowPulse 6s ease-in-out infinite",
                  animationDelay: delay,
                }}
              />
              <img
                src={fl.image}
                alt={fl.name}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  animation: "fruitFloat 6s ease-in-out infinite",
                  animationDelay: delay,
                  filter: isActive
                    ? "drop-shadow(0 24px 34px rgba(0,0,0,0.45)) drop-shadow(0 0 40px color-mix(in srgb, var(--fa) 45%, transparent))"
                    : "drop-shadow(0 16px 24px rgba(0,0,0,0.45)) brightness(0.58) saturate(0.9)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
