// Server-only helpers for the customer reviews system.
// Never imported from client modules.

import { PICKUP_ORIGIN } from "@/lib/config";

export const REVIEW_BUCKET = "review-photos";
export const MAX_PHOTOS_PER_REVIEW = 3;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB pre-compression client-side cap
export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const SPAM_KEYWORDS = [
  "viagra",
  "casino",
  "crypto",
  "bitcoin",
  "seo services",
  "loan",
  "porn",
  "escort",
  "click here",
  "buy now",
  "cheap price",
];
const URL_REGEX = /(https?:\/\/|www\.)\S+/i;

export type SpamCheck = { ok: boolean; reason?: string };

export function checkComment(comment: string): SpamCheck {
  const trimmed = comment.trim();
  if (URL_REGEX.test(trimmed)) {
    return { ok: false, reason: "Links aren't allowed in reviews." };
  }
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 20) {
    const upper = letters.replace(/[^A-Z]/g, "").length;
    if (upper / letters.length > 0.6) {
      return { ok: false, reason: "Please avoid writing entirely in capitals." };
    }
  }
  const lower = trimmed.toLowerCase();
  for (const word of SPAM_KEYWORDS) {
    if (lower.includes(word)) {
      return { ok: false, reason: "Your review couldn't be submitted." };
    }
  }
  return { ok: true };
}

export function generateReviewToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Ensure lat/lng constants are referenced so the server bundle keeps this pure helper. */
export const _PICKUP = PICKUP_ORIGIN;

export function extToMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic" || mime === "image/heif") return "heic";
  return "jpg";
}

export function publicPhotoUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${REVIEW_BUCKET}/${path}`;
}

export type ReviewRow = {
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
};

export type ReviewAggregate = {
  count: number;
  average: number;
};

export function computeAggregate(rows: Array<{ rating: number }>): ReviewAggregate {
  if (!rows.length) return { count: 0, average: 0 };
  const sum = rows.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avg = Math.round((sum / rows.length) * 10) / 10;
  return { count: rows.length, average: avg };
}
