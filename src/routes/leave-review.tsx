import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { StarInput } from "@/components/Stars";
import { compressImage } from "@/lib/image-compress";

export const Route = createFileRoute("/leave-review")({
  component: LeaveReviewPage,
  head: () => ({
    meta: [
      { title: "Leave a review — L&A Sweet" },
      { name: "description", content: "Share your experience with L&A Sweet — French handmade trompe-l'œil desserts in Brisbane. Ratings, comments and photos welcome." },
      { name: "robots", content: "noindex,follow" },
      { property: "og:title", content: "Leave a review — L&A Sweet" },
      { property: "og:description", content: "Share your experience with L&A Sweet — French handmade trompe-l'œil desserts in Brisbane." },
    ],
    links: [{ rel: "canonical", href: "https://la-sweet-bne.com/leave-review" }],
  }),
});

function LeaveReviewPage() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Prefill from ?order=xxx&email=xxx (from reminder email)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const o = params.get("order");
    const e = params.get("email");
    if (o) setOrderNumber(o);
    if (e) setEmail(e);
  }, []);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const remaining = useMemo(() => 3 - photos.length, [photos.length]);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const arr = Array.from(files).slice(0, remaining);
    const compressed: File[] = [];
    for (const f of arr) {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is over 5MB — please choose a smaller image.`);
        continue;
      }
      if (!/^image\//.test(f.type)) {
        toast.error(`${f.name} isn't a supported image format.`);
        continue;
      }
      try {
        const c = await compressImage(f);
        compressed.push(c);
      } catch {
        compressed.push(f);
      }
    }
    if (compressed.length) setPhotos((prev) => [...prev, ...compressed].slice(0, 3));
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (rating < 1) return toast.error("Please choose a rating.");
    if (comment.trim().length < 20) return toast.error("Your review needs at least 20 characters.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("email", email.trim());
      fd.append("rating", String(rating));
      fd.append("comment", comment.trim());
      if (orderNumber.trim()) fd.append("order_number", orderNumber.trim().toUpperCase());
      photos.forEach((f) => fd.append("photos", f));
      const res = await fetch("/api/public/reviews", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      toast.success("Thanks for sharing your experience!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-ink text-foreground px-4 py-16">
        <div className="max-w-lg mx-auto text-center border border-gold/30 bg-ink-2/60 p-10">
          <div className="eyebrow justify-center inline-flex mb-4">Thank you</div>
          <h1 className="font-serif-display text-3xl md:text-4xl text-gold mb-4">Merci beaucoup!</h1>
          <p className="text-sm text-[color:var(--foreground)]/80 leading-relaxed">
            Your review has been received and is pending approval. It will be visible within 48 hours.
          </p>
          <div className="mt-8">
            <Link to="/" className="text-[11px] tracking-[0.24em] uppercase text-gold border border-gold/50 px-5 py-3 hover:bg-gold hover:text-ink transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink text-foreground px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <div className="eyebrow justify-center inline-flex mb-4">Share your experience</div>
          <h1 className="font-serif-display text-4xl md:text-5xl text-gold">Leave a review</h1>
          <p className="mt-4 text-sm text-[color:var(--foreground)]/70 max-w-md mx-auto leading-relaxed">
            Your words help other Brisbane customers discover L&amp;A Sweet — and mean the world to us.
          </p>
        </header>

        <form onSubmit={onSubmit} className="border border-line bg-ink-2/60 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-3">Rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-2">Your name</label>
              <input type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-ink border border-line px-3 py-2.5 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-2">Email</label>
              <input type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-ink border border-line px-3 py-2.5 text-sm focus:border-gold outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-2">Order number <span className="opacity-60 normal-case tracking-normal">(optional — unlocks verified badge)</span></label>
            <input type="text" maxLength={30} placeholder="LAS-26-XXXXX" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} className="w-full bg-ink border border-line px-3 py-2.5 text-sm focus:border-gold outline-none tracking-wider" />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-2">Your review</label>
            <textarea
              required
              minLength={20}
              maxLength={1000}
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience — what did you love? Any details make it more helpful for others."
              className="w-full bg-ink border border-line px-3 py-2.5 text-sm focus:border-gold outline-none resize-none"
            />
            <div className="mt-1 text-[11px] text-[color:var(--foreground)]/50 text-right">{comment.length}/1000</div>
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.24em] uppercase text-gold mb-2">Photos <span className="opacity-60 normal-case tracking-normal">(optional — up to 3)</span></label>
            <div className="flex flex-wrap gap-3 items-start">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 border border-gold/30 overflow-hidden">
                  <img src={src} alt={`upload-${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-ink/90 border border-gold/50 text-gold w-6 h-6 flex items-center justify-center text-xs">✕</button>
                </div>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 border border-dashed border-gold/40 text-gold/70 text-xs flex flex-col items-center justify-center hover:border-gold hover:text-gold transition"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="mt-1 text-[10px] tracking-[0.18em] uppercase">Add photo</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-[11px] italic text-[color:var(--foreground)]/40">Photos are automatically resized before upload — max 5MB each.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-ink text-[11px] tracking-[0.24em] uppercase py-3.5 hover:bg-gold/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </main>
  );
}
