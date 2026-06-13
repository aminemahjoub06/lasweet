// Server-only notification helpers. Never imported directly by client modules.
// Currently sends owner notification by email when Lovable Emails is set up.

const OWNER_EMAIL = "amahjoub0589@gmail.com";

type NotifyArgs = {
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    business?: string;
    orderType?: string;
    date?: string;
    delivery: "delivery" | "pickup";
    address?: string;
    notes?: string;
  };
  items: Array<{
    name: string;
    qty: number;
    price: number;
    sizeLabel?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash" | "online";
  paymentStatus: string;
};

function formatOrderText(a: NotifyArgs) {
  const lines: string[] = [];
  lines.push(`New L&A Sweet order — ${a.orderNumber}`);
  lines.push("");
  lines.push(`Customer: ${a.customer.fullName}`);
  lines.push(`Email:    ${a.customer.email}`);
  lines.push(`Phone:    ${a.customer.phone}`);
  if (a.customer.business) lines.push(`Business: ${a.customer.business}`);
  lines.push("");
  lines.push(`Fulfilment: ${a.customer.delivery === "delivery" ? "Delivery" : "Pick-up"}`);
  if (a.customer.delivery === "delivery" && a.customer.address)
    lines.push(`Address:    ${a.customer.address}`);
  if (a.customer.date) lines.push(`Date:       ${a.customer.date}`);
  if (a.customer.orderType) lines.push(`Occasion:   ${a.customer.orderType}`);
  if (a.customer.notes) lines.push(`Notes:      ${a.customer.notes}`);
  lines.push("");
  lines.push("Items:");
  for (const i of a.items) {
    const size = i.sizeLabel ? ` (Size ${i.sizeLabel})` : "";
    lines.push(`  • ${i.qty} × ${i.name}${size} — $${(i.qty * i.price).toFixed(2)}`);
  }
  lines.push("");
  lines.push(`Subtotal:     $${a.subtotal.toFixed(2)}`);
  lines.push(`Delivery fee: $${a.deliveryFee.toFixed(2)}`);
  lines.push(`Total:        $${a.total.toFixed(2)}`);
  lines.push("");
  lines.push(`Payment: ${a.paymentMethod.toUpperCase()} — ${a.paymentStatus}`);
  return lines.join("\n");
}

/**
 * Sends an owner notification email. No-op when Lovable Emails is not yet
 * configured for this project (no email domain set up). The order is always
 * saved to the database first, so notifications are best-effort only.
 */
export async function notifyOwnerNewOrder(args: NotifyArgs) {
  const body = formatOrderText(args);
  // eslint-disable-next-line no-console
  console.info(
    `[order:new] ${args.orderNumber} → ${OWNER_EMAIL} (${args.paymentMethod}/${args.paymentStatus})\n${body}`,
  );

  // Try to send via Lovable's internal transactional email route if available.
  // Silently no-op if the email infrastructure is not set up yet.
  try {
    const url = process.env.LOVABLE_EMAIL_SEND_URL;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!url || !apiKey) return;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: OWNER_EMAIL,
        subject: `New order — ${args.orderNumber}`,
        text: body,
      }),
    });
  } catch (err) {
    console.error("[notifyOwner] email send error", err);
  }
}