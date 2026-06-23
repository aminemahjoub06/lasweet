// Site-wide hard-coded configuration constants.
// Edit here when the pick-up location or similar fixed details change.

export const PICKUP_ADDRESS =
  "803b Stanley Street, Woolloongabba QLD 4102 (next to Coles)";

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
 * Same-day cut-off: only return slots starting at least 2 hours from now
 * when the chosen date is today. For future dates, all slots are returned.
 * Date is expected as YYYY-MM-DD (the value emitted by <input type="date">).
 */
export function getAvailableSlots(dateIso: string, now: Date = new Date()): readonly string[] {
  if (!dateIso) return TIME_SLOTS;
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  if (dateIso !== todayIso) return TIME_SLOTS;
  const minMinutes = now.getHours() * 60 + now.getMinutes() + 120;
  return TIME_SLOTS.filter((s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m >= minMinutes;
  });
}
