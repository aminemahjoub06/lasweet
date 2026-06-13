import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (s) => z.object({ token: z.string().optional() }).parse(s),
  component: UnsubscribePage,
  head: () => ({
    meta: [
      { title: "Unsubscribe · L&A Sweet" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid" }
  | { kind: "done" }
  | { kind: "error"; message: string };

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) return setState({ kind: "invalid" });
        if (json.valid === false && json.reason === "already_unsubscribed")
          return setState({ kind: "already" });
        if (json.valid) return setState({ kind: "ready" });
        setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "error", message: "Network error" }));
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "loading" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await r.json().catch(() => ({}));
      if (json.success) return setState({ kind: "done" });
      if (json.reason === "already_unsubscribed") return setState({ kind: "already" });
      setState({ kind: "error", message: "Could not unsubscribe" });
    } catch {
      setState({ kind: "error", message: "Network error" });
    }
  };

  return (
    <main className="min-h-screen bg-ink text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md border border-gold/30 bg-ink-2 p-8 sm:p-10 text-center">
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-3">
          Email preferences
        </div>
        <h1 className="font-serif-display text-3xl mb-4">Unsubscribe</h1>

        {state.kind === "loading" && (
          <p className="text-sm text-[color:var(--foreground)]/70">Loading…</p>
        )}
        {state.kind === "ready" && (
          <>
            <p className="text-sm text-[color:var(--foreground)]/75 mb-6">
              Confirm you no longer want to receive emails from L&amp;A Sweet.
            </p>
            <button
              onClick={confirm}
              className="inline-flex items-center text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {state.kind === "already" && (
          <p className="text-sm text-[color:var(--foreground)]/75">
            You&apos;re already unsubscribed.
          </p>
        )}
        {state.kind === "done" && (
          <p className="text-sm text-[color:var(--foreground)]/75">
            You&apos;ve been unsubscribed. Sorry to see you go.
          </p>
        )}
        {state.kind === "invalid" && (
          <p className="text-sm text-[color:var(--foreground)]/75">
            This unsubscribe link is invalid or has expired.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-sm text-red-400">{state.message}</p>
        )}
      </div>
    </main>
  );
}