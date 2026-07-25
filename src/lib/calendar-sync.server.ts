// Server-only wrapper around Google Calendar sync for orders.
// - Idempotent: uses orders.calendar_event_id.
// - Never throws to the caller: writes calendar_sync_status/error instead.
// - Skips silently when Google Calendar credentials are not configured.

import type { CalendarEventInput } from "./google-calendar.server";

const PICKUP_LOCATION = "803B Stanley Street, Woolloongabba QLD 4102";

function formatAud(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `A$${v.toFixed(2)}`;
}

interface OrderLike {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  items: unknown;
  subtotal: number | string | null;
  delivery_fee: number | string | null;
  total: number | string | null;
  payment_method: string | null;
  payment_status: string | null;
  notes: string | null;
  calendar_event_id?: string | null;
}

function buildInput(order: OrderLike): CalendarEventInput | null {
  if (!order.delivery_date || !order.delivery_time) return null;
  const isDelivery = order.delivery_method === "delivery";
  const title = `${isDelivery ? "DELIVERY" : "PICKUP"} — ${order.order_number} — ${order.customer_name}`;
  const location = isDelivery
    ? order.delivery_address || ""
    : PICKUP_LOCATION;

  const itemsArr = Array.isArray(order.items) ? (order.items as Array<Record<string, unknown>>) : [];
  const itemLines = itemsArr
    .map((i) => {
      const qty = i.qty ?? "?";
      const name = i.name ?? "item";
      const size = i.sizeLabel ? ` (Size ${i.sizeLabel})` : "";
      return `  • ${qty} × ${name}${size}`;
    })
    .join("\n");

  const description = [
    `Order: ${order.order_number}`,
    `Customer: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Email: ${order.customer_email}`,
    `Method: ${isDelivery ? "Delivery" : "Pickup"}`,
    `Date/Time: ${order.delivery_date} ${order.delivery_time} (Australia/Brisbane)`,
    "",
    "Items:",
    itemLines || "  (none)",
    "",
    `Subtotal: ${formatAud(Number(order.subtotal))}`,
    `Delivery fee: ${formatAud(Number(order.delivery_fee))}`,
    `Total: ${formatAud(Number(order.total))}`,
    `Payment: ${(order.payment_method ?? "").toUpperCase()} — ${order.payment_status ?? ""}`,
    order.notes ? `\nNotes: ${order.notes}` : "",
  ].join("\n");

  return {
    summary: title,
    description,
    location,
    date: order.delivery_date,
    time: order.delivery_time,
    orderNumber: order.order_number,
  };
}

/**
 * Create or update the Google Calendar event for an order.
 * Never throws; on failure marks calendar_sync_status='failed'.
 */
export async function syncOrderCalendarEvent(order: OrderLike): Promise<void> {
  try {
    const { isCalendarConfigured, createCalendarEvent, updateCalendarEvent } =
      await import("./google-calendar.server");
    if (!isCalendarConfigured()) return; // silently skip
    const input = buildInput(order);
    if (!input) return;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let eventId = order.calendar_event_id ?? null;
    if (eventId) {
      eventId = await updateCalendarEvent(eventId, input);
    } else {
      eventId = await createCalendarEvent(input);
    }
    await supabaseAdmin
      .from("orders")
      .update({
        calendar_event_id: eventId,
        calendar_sync_status: "synced",
        calendar_sync_error: null,
        calendar_synced_at: new Date().toISOString(),
      })
      .eq("id", order.id);
  } catch (err) {
    console.error("[calendar-sync] failed", order.order_number, err);
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin
        .from("orders")
        .update({
          calendar_sync_status: "failed",
          calendar_sync_error: String((err as Error)?.message ?? err).slice(0, 500),
        })
        .eq("id", order.id);
    } catch {
      /* ignore */
    }
  }
}

/** Cancel/delete the calendar event for an order. Never throws. */
export async function cancelOrderCalendarEvent(orderId: string): Promise<void> {
  try {
    const { isCalendarConfigured, deleteCalendarEvent } = await import(
      "./google-calendar.server"
    );
    if (!isCalendarConfigured()) return;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("orders")
      .select("calendar_event_id")
      .eq("id", orderId)
      .maybeSingle();
    const eventId = data?.calendar_event_id;
    if (!eventId) return;
    await deleteCalendarEvent(eventId);
    await supabaseAdmin
      .from("orders")
      .update({
        calendar_event_id: null,
        calendar_sync_status: "cancelled",
        calendar_synced_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } catch (err) {
    console.error("[calendar-sync] cancel failed", err);
  }
}