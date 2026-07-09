import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { StarDisplay } from "@/components/Stars";
import { listApprovedReviews, type PublicReview } from "@/lib/reviews.functions";

const PAGE_SIZE = 12;

const reviewsQuery = (offset: number, rating: number | null) =>
  queryOptions({
    queryKey: ["reviews", "list", offset, rating],
    queryFn: () => listApprovedReviews({ data: { limit: PAGE_SIZE, offset, rating } }),
  });

export const Route = createFileRoute("/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery(0, null)),
  component: ReviewsPage,
  head: () => ({
    meta: [
      { title: "Customer reviews — L&A Sweet Brisbane" },
      { name: "description", content: "Read customer reviews of L&A Sweet — handcrafted French trompe-l'œil desserts made in Brisbane. Ratings, comments and photos from real customers." },
      { property: "og:title", content: "Customer reviews — L&A Sweet Brisbane" },
      { property: "og:description", content: "Read customer reviews of L&A Sweet — handcrafted French trompe-l'œil desserts made in Brisbane." },
      { property: "og:url", content: "https://la-sweet-bne.com/reviews" },
    ],
    links: [{ rel: "canonical", href: "https://la-sweet-bne.com/reviews" }],
  }),
  errorComponent: () => <ReviewsError />,
  notFoundComponent: () => <ReviewsError />,
});

function ReviewsError() {
  return (
    <main className="min-h-screen bg-ink text-foreground grid place-items-center p-6">
      <p className="text-sm text-[color:var(--foreground)]/70">Reviews couldn't load. Please try again later.</p>
    </main>
  );
}

function ReviewsPage() {
  const [offset, setOffset] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const { data } = useSuspenseQuery(reviewsQuery(offset, rating));
  const router = useRouter();

  const total = data.total ?? data.reviews.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  function changeFilter(r: number | null) {
    setRating(r);
    setOffset(0);
    router.invalidate();
  }

  return (
    <main className="min-h-screen bg-ink text-foreground">
      <section className="border-b border-line py-14 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="eyebrow justify-center inline-flex mb-4">Customer reviews</div>
          <h1 className="font-serif-display text-4xl md:text-5xl text-gold mb-4">What our customers say</h1>
          {data.aggregate.count > 0 ? (
            <div className="flex items-center justify-center gap-3">
              <StarDisplay value={data.aggregate.average} size={20} />
              <span className="text-sm text-[color:var(--foreground)]/80">
                {data.aggregate.average.toFixed(1)} based on {data.aggregate.count} review{data.aggregate.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-[color:var(--foreground)]/70">No reviews yet.</p>
          )}
          <div className="mt-6">
            <Link to="/leave-review" className="inline-block text-[11px] tracking-[0.24em] uppercase text-ink bg-gold px-5 py-3 hover:bg-gold/90">
              Leave a review
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <FilterChip active={rating === null} onClick={() => changeFilter(null)}>All</FilterChip>
          {[5, 4, 3, 2, 1].map((r) => (
            <FilterChip key={r} active={rating === r} onClick={() => changeFilter(r)}>{r} ★</FilterChip>
          ))}
        </div>

        {data.reviews.length === 0 ? (
          <p className="text-center text-sm text-[color:var(--foreground)]/60">No reviews match this filter yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}

        {pages > 1 && (
          <nav className="flex justify-center items-center gap-4 mt-12" aria-label="Pagination">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="text-[11px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-4 py-2 disabled:opacity-30 hover:bg-gold hover:text-ink transition"
            >
              Previous
            </button>
            <span className="text-xs text-[color:var(--foreground)]/60">Page {currentPage} of {pages}</span>
            <button
              type="button"
              disabled={currentPage >= pages}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="text-[11px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-4 py-2 disabled:opacity-30 hover:bg-gold hover:text-ink transition"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] tracking-[0.24em] uppercase px-4 py-2 border transition ${active ? "bg-gold text-ink border-gold" : "text-gold border-gold/40 hover:border-gold"}`}
    >
      {children}
    </button>
  );
}

export function ReviewCard({ review }: { review: PublicReview }) {
  const [expanded, setExpanded] = useState(false);
  const truncated = review.comment.length > 220 && !expanded;
  const text = truncated ? review.comment.slice(0, 220).trimEnd() + "…" : review.comment;
  const date = new Date(review.approved_at ?? review.created_at).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });

  return (
    <article className="border border-line bg-ink-2/40 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <StarDisplay value={review.rating} size={16} />
        <time className="text-[11px] text-[color:var(--foreground)]/50">{date}</time>
      </div>
      <p className="text-sm text-[color:var(--foreground)]/85 leading-relaxed whitespace-pre-wrap flex-1">
        {text}
        {truncated && (
          <button type="button" onClick={() => setExpanded(true)} className="ml-1 text-gold underline text-xs">read more</button>
        )}
      </p>
      {review.photo_urls.length > 0 && (
        <div className="flex gap-2 mt-4">
          {review.photo_urls.slice(0, 3).map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 border border-gold/30 overflow-hidden">
              <img src={src} alt={`review photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </a>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-xs">
        <span className="text-[color:var(--foreground)]/80">{review.reviewer_name}</span>
        {review.verified_purchase && (
          <span className="text-[10px] tracking-[0.18em] uppercase text-gold border border-gold/40 px-2 py-0.5">Verified</span>
        )}
      </div>
    </article>
  );
}
