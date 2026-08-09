// Site-wide hard-coded configuration constants.
// Edit here when the pick-up location or similar fixed details change.

export const PICKUP_ADDRESS =
  "803b Stanley Street, Woolloongabba QLD 4102 (next to Coles)";

// Geographic origin used for distance-based delivery pricing.
// Coordinates are for 803b Stanley Street, Woolloongabba QLD 4102.
export const PICKUP_ORIGIN = { lat: -27.4988, lng: 153.0345 } as const;

// Multiplier that turns straight-line (haversine) distance into an approximate
// road distance across Brisbane — compensates for bridges, the river and
// one-way streets. Empirical, tune if quotes drift from real trips.
export const BRISBANE_ROAD_FACTOR = 1.3;

/**
 * Distance-based delivery pricing tiers.
 * `maxKm` is inclusive; `feeAud` is null when delivery is not available.
 */
/**
 * Distance-based delivery grid. Beyond 25 km a delivery takes too long to be
 * worth the trip on a small order, so those tiers require a minimum number of
 * pieces per order.
 */
export const DELIVERY_TIERS = [
  { maxKm: 10, feeAud: 10, minPieces: 0 },
  { maxKm: 15, feeAud: 18, minPieces: 0 },
  { maxKm: 25, feeAud: 28, minPieces: 0 },
  { maxKm: 35, feeAud: 30, minPieces: 5 },
  { maxKm: 42, feeAud: 35, minPieces: 5 },
  { maxKm: Infinity, feeAud: null, minPieces: 0 }, // refused
] as const;

/** Hard cap — nothing is delivered beyond this distance. */
export const MAX_DELIVERY_KM = 42;

/** Distance beyond which the minimum-pieces rule kicks in. */
export const LONG_DISTANCE_THRESHOLD_KM = 25;

/** Minimum pieces per order for long-distance deliveries (> 25 km). */
export const LONG_DISTANCE_MIN_PIECES = 5;

export const LONG_DISTANCE_MIN_PIECES_MESSAGE =
  "Deliveries beyond 25 km require a minimum of 5 pieces per order. Please add more pieces or choose pick-up.";

export const OUT_OF_RANGE_MESSAGE =
  "Sorry, we don't deliver beyond 42 km. Please contact l.asweetbne@gmail.com for a custom quote.";

/**
 * Return the delivery fee and piece minimum for a distance in km.
 * `feeAud === null` means the address is out of range.
 */
export function computeDeliveryFee(
  distanceKm: number,
): { feeAud: number | null; minPieces: number } {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return { feeAud: null, minPieces: 0 };
  }
  for (const tier of DELIVERY_TIERS) {
    if (distanceKm <= tier.maxKm) {
      return { feeAud: tier.feeAud, minPieces: tier.minPieces };
    }
  }
  return { feeAud: null, minPieces: 0 };
}

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Estimated road distance in km from PICKUP_ORIGIN to the given point. */
export function estimatedRoadDistanceKm(customerLat: number, customerLng: number): number {
  const straight = haversineKm(PICKUP_ORIGIN.lat, PICKUP_ORIGIN.lng, customerLat, customerLng);
  return Math.round(straight * BRISBANE_ROAD_FACTOR * 10) / 10;
}

// Default daily stock per product (units available per delivery date).
export const DEFAULT_DAILY_STOCK = 15;

// Available pick-up / delivery time slots (24-hour, on the hour).
export const TIME_SLOTS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/**
 * Return the available time slots for a given date.
 * Same-day orders are no longer accepted (D+1 minimum), so any date is
 * either fully open or entirely rejected upstream. This helper simply
 * returns all slots for a valid future date.
 */
export function getAvailableSlots(_dateIso: string, _now: Date = new Date()): readonly string[] {
  return TIME_SLOTS;
}

/**
 * Today's date (YYYY-MM-DD) in the Australia/Brisbane timezone.
 * Used to disable same-day orders on the client and reject them on the server.
 */
export function getBrisbaneTodayIso(now: Date = new Date()): string {
  // en-CA locale renders as YYYY-MM-DD, which matches <input type="date">.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Tomorrow's date (YYYY-MM-DD) in the Australia/Brisbane timezone.
 * Used as the `min` attribute on the delivery date picker.
 */
export function getBrisbaneTomorrowIso(now: Date = new Date()): string {
  const today = getBrisbaneTodayIso(now);
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Next-day ordering cut-off (Australia/Brisbane, 20:00 local time)
// ─────────────────────────────────────────────────────────────────────────────

export const ORDER_CUTOFF_HOUR = 20;

export const NEXT_DAY_CUTOFF_MESSAGE =
  "Orders for next-day pickup and delivery close at 8:00 PM. Please select another available date.";

// ─────────────────────────────────────────────────────────────────────────────
// Temporarily blocked order dates (restocking days, closures, …)
// Dates are Brisbane calendar dates in YYYY-MM-DD. Remove entries once past.
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCKED_ORDER_DATES: string[] = ["2026-08-10"];

export const BLOCKED_DATE_MESSAGE =
  "We're restocking — this date is unavailable";

export const BLOCKED_DATE_SERVER_MESSAGE =
  "This date is unavailable for orders. Please choose another date.";

/** True when the given Brisbane date is temporarily unavailable for orders. */
export function isDateBlocked(dateIso: string | null | undefined): boolean {
  if (!dateIso) return false;
  return BLOCKED_ORDER_DATES.includes(dateIso);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pick-up no-show policy
// ─────────────────────────────────────────────────────────────────────────────

/** Grace period, in hours, after the chosen pick-up time. */
export const PICKUP_GRACE_HOURS = 1;

export const PICKUP_NO_SHOW_NOTICE =
  "Please collect your order within 1 hour of your chosen time. Uncollected orders are cancelled without refund.";

// ─────────────────────────────────────────────────────────────────────────────
// Limited-time promotion: Buy 8, get 2 free — 2 mystery pieces added as a gift
// Everything promo-related is gated on PROMO_END_DATE and disappears by itself.
// ─────────────────────────────────────────────────────────────────────────────

export const PROMO_END_DATE = "2026-08-28";

/** Paying pieces required to unlock the gift. */
export const GIFT_MIN_PIECES = 8;
/** Number of free mystery pieces added to the cart. */
export const GIFT_QTY = 2;
/** Informative value of the gift, stored on the order for reporting. */
export const GIFT_VALUE_AUD = 30;
export const GIFT_CODE = "MYSTERY_DUO_8PLUS";
/** Stable cart key for the gift line (never a real product key). */
export const GIFT_KEY = "GIFT-MYSTERY-DUO";
export const GIFT_NAME = "Mystery Duo — our gift to you 🎁";
/** Name stored in orders.items / shown in emails. */
export const GIFT_ITEM_NAME = "Mystery Duo (gift)";
export const GIFT_DESCRIPTION = "2 surprise flavours chosen by our chef";

export const PROMO_LABEL = "LIMITED TIME OFFER";
export const PROMO_TITLE = "Buy 8, get 2 FREE";
export const PROMO_SUBTITLE =
  "Order 8 pieces or more and receive 2 surprise flavours free — automatically added to your cart.";
export const PROMO_VALIDITY_TEXT = "Offer valid until 28 August 2026";
export const PROMO_RIBBON_TEXT =
  "✨ Buy 8, get 2 free — until 28 August";

/** True while the promotion is still running (Brisbane date based). */
export function isPromoActive(now: Date = new Date()): boolean {
  return getBrisbaneTodayIso(now) <= PROMO_END_DATE;
}

/**
 * True when the gift applies: promotion running and enough *paying* pieces.
 * Gift pieces themselves never count towards the threshold.
 */
export function isGiftUnlocked(payingPieces: number, now: Date = new Date()): boolean {
  if (!isPromoActive(now)) return false;
  return Number.isFinite(payingPieces) && payingPieces >= GIFT_MIN_PIECES;
}

/** True when an order item is the free mystery gift line. */
export function isGiftItem(item: { key?: string; name?: string; price?: number }): boolean {
  if (item.key === GIFT_KEY) return true;
  const name = (item.name ?? "").toLowerCase();
  return name.includes("mystery duo");
}

/** Current hour (0-23) in Australia/Brisbane. */
function getBrisbaneHour(now: Date = new Date()): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Brisbane",
    hour: "2-digit",
    hour12: false,
  }).format(now);
  return parseInt(h, 10);
}

/** True once the 8pm Brisbane cut-off for next-day orders has been reached. */
export function isPastNextDayCutoff(now: Date = new Date()): boolean {
  return getBrisbaneHour(now) >= ORDER_CUTOFF_HOUR;
}

/** Add whole days to a YYYY-MM-DD string, treating it as a calendar date. */
function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Earliest order date (YYYY-MM-DD, Brisbane) taking into account:
 *  - the D+1 minimum,
 *  - the 8pm Brisbane cut-off (after which D+1 is unavailable → D+2),
 */
export function getEarliestOrderDateIso(now: Date = new Date()): string {
  const today = getBrisbaneTodayIso(now);
  let candidate = addDaysIso(today, isPastNextDayCutoff(now) ? 2 : 1);
  // Skip over any leading blocked dates so the date picker's `min` already
  // excludes them (native date inputs can't grey out arbitrary days).
  let guard = 0;
  while (isDateBlocked(candidate) && guard < 60) {
    candidate = addDaysIso(candidate, 1);
    guard++;
  }
  return candidate;
}

/** True if the given ISO date is allowed at `now` given the cut-off. */
export function isDateAllowedForOrder(
  dateIso: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!dateIso) return false;
  if (isDateBlocked(dateIso)) return false;
  return dateIso >= getEarliestOrderDateIso(now);
}
