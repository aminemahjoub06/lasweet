// Site-wide hard-coded configuration constants.
// Edit here when the pick-up location or similar fixed details change.

export const PICKUP_ADDRESS =
  "803b Stanley Street, Woolloongabba QLD 4102 (next to Coles)";

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
