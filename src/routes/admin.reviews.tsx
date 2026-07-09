import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { StarDisplay } from "@/components/Stars";
import { adminListReviews, adminModerateReview } from "@/lib/reviews.functions";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviewsPage,
  head: () => ({
    meta: [
      { title: "Admin · Reviews" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type Review = {
  id: string;
  order_number: string | null;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  comment: string;
  photo_urls: string[];
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  verified_purchase: boolean;
  created_at: string;
  approved_at: string | null;
  ip_address: string | null;
};

function AdminReviewsPage() {
  const fetchList = useServerFn(adminListReviews);
  const moderate = useServerFn(adminModerateReview);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetchList({ data: { password, status, search: search || undefined } });
      setReviews(res.reviews as Review[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
      setReviews(null);
    } finally {
      setLoading(false);
    }
  }

  async function act(r: Review, action: "approve" | "reject" | "delete") {
    if (busy) return;
    let note: string | undefined;
    if (action === "reject") {
      const input = window.prompt("Rejection reason (optional, kept internally):", "");
      if (input === null) return;
      note = input || undefined;
    }
    if (action === "delete" && !window.confirm(`Delete this review permanently?`)) return;
    setBusy(r.id);
    try {
      await moderate({ data: { password, reviewId: r.id, action, note } });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-foreground px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-baseline justify-between mb-6">
          <h1 className="font-serif-display text-3xl text-gold">Reviews</h1>
          {reviews && (
            <button type="button" onClick={() => load()} className="text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-3 py-2 hover:bg-gold hover:text-ink transition">
              Refresh
            </button>
          )}
        </header>

        {!reviews && (
          <form onSubmit={load} className="max-w-sm border border-line bg-ink-2 p-6 space-y-4">
            <label className="block text-[11px] tracking-[0.24em] uppercase text-gold">Admin password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-ink border border-line px-3 py-2 text-sm" required />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-2.5 disabled:opacity-50">
              {loading ? "Loading..." : "Sign in"}
            </button>
          </form>
        )}

        {reviews && (
          <>
            <div className="flex flex-wrap gap-3 mb-6 items-end">
              <div>
                <label className="block text-[10px] tracking-[0.24em] uppercase text-gold mb-1">Status</label>
                <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); }} className="bg-ink border border-line px-3 py-2 text-sm">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[10px] tracking-[0.24em] uppercase text-gold mb-1">Search</label>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name, email or order number" className="w-full bg-ink border border-line px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={() => load()} className="text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-4 py-2 hover:bg-gold hover:text-ink transition">
                Filter
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-[color:var(--foreground)]/60">No reviews match this filter.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border border-line bg-ink-2/60 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <StarDisplay value={r.rating} size={16} />
                        <span className="text-sm text-[color:var(--foreground)]/80">{r.reviewer_name}</span>
                        {r.verified_purchase && <span className="text-[10px] tracking-[0.18em] uppercase text-gold border border-gold/40 px-2 py-0.5">Verified</span>}
                        <span className={`text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 border ${r.status === "approved" ? "text-emerald-400 border-emerald-500/50" : r.status === "rejected" ? "text-red-400 border-red-500/50" : "text-amber-400 border-amber-500/50"}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[color:var(--foreground)]/50">
                        {new Date(r.created_at).toLocaleString("en-AU")}{r.order_number ? ` · ${r.order_number}` : ""}
                      </div>
                    </div>
                    <p className="text-sm text-[color:var(--foreground)]/85 whitespace-pre-wrap leading-relaxed mb-3">{r.comment}</p>
                    <div className="text-[11px] text-[color:var(--foreground)]/50 mb-3">
                      {r.reviewer_email}{r.ip_address ? ` · ip ${r.ip_address}` : ""}
                    </div>
                    {r.photo_urls?.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {r.photo_urls.map((src, i) => (
                          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 border border-gold/30 overflow-hidden">
                            <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    {r.admin_notes && (
                      <p className="text-[11px] italic text-[color:var(--foreground)]/60 mb-3">Note: {r.admin_notes}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {r.status !== "approved" && (
                        <button type="button" disabled={busy === r.id} onClick={() => act(r, "approve")} className="text-[10px] tracking-[0.24em] uppercase bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-2 disabled:opacity-50">
                          Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button type="button" disabled={busy === r.id} onClick={() => act(r, "reject")} className="text-[10px] tracking-[0.24em] uppercase bg-red-700/80 hover:bg-red-700 text-white px-3 py-2 disabled:opacity-50">
                          Reject
                        </button>
                      )}
                      <button type="button" disabled={busy === r.id} onClick={() => act(r, "delete")} className="text-[10px] tracking-[0.24em] uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 px-3 py-2 disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
