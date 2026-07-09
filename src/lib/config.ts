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
export const DELIVERY_TIERS = [
  { maxKm: 10, feeAud: 10 },
  { maxKm: 15, feeAud: 18 },
  { maxKm: 25, feeAud: 28 },
] as const;

export const MAX_DELIVERY_KM = 25;

/** Return the delivery fee in AUD for a given distance in km, or null if out of range. */
export function computeDeliveryFee(distanceKm: number): number | null {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;
  for (const tier of DELIVERY_TIERS) {
    if (distanceKm <= tier.maxKm) return tier.feeAud;
  }
  return null;
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
  "10:00",
  "11:00",
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
