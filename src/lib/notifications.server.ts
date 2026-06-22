// Server-only notification helpers. Never imported directly by client modules.
// Renders React Email templates and enqueues them via the Lovable email queue.

import * as React from "react";
import { render } from "@react-email/components";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SENDER_DOMAIN = "notify.la-sweet-bne.com";
const FROM_DOMAIN = "la-sweet-bne.com";
const SITE_NAME = "L&A Sweet";

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

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function ensureUnsubscribeToken(
  supabase: any,
  email: string,
): Promise<string | null> {
  const normalized = email.toLowerCase();
  const { data: existing } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  if (existing && !existing.used_at) return existing.token;
  if (existing && existing.used_at) return null;
  const token = generateToken();
  await supabase
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
  const { data: stored } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  return stored?.token ?? token;
}

async function enqueueTemplate(opts: {
  templateName: string;
  to: string;
  data: Record<string, any>;
  idempotencyKey: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const entry = TEMPLATES[opts.templateName];
  if (!entry) {
    console.error("[notifications] template not registered", opts.templateName);
    return;
  }
  const effectiveRecipient = entry.to || opts.to;
  if (!effectiveRecipient) return;

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", effectiveRecipient.toLowerCase())
    .maybeSingle();
  if (suppressed) {
    console.info("[notifications] recipient suppressed", opts.templateName);
    return;
  }

  const unsubscribeToken = await ensureUnsubscribeToken(supabaseAdmin, effectiveRecipient);
  if (!unsubscribeToken) {
    console.info("[notifications] unsubscribed", opts.templateName);
    return;
  }

  const element = React.createElement(entry.component, opts.data);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = typeof entry.subject === "function" ? entry.subject(opts.data) : entry.subject;
  const messageId = crypto.randomUUID();

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: opts.templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: opts.templateName,
      idempotency_key: opts.idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("[notifications] enqueue error", opts.templateName, error);
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: opts.templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
  }
}

/**
 * Sends owner + customer emails for a new order. Best-effort; never throws.
 */
export async function notifyOwnerNewOrder(args: NotifyArgs) {
  const templateData = {
    orderNumber: args.orderNumber,
    customerName: args.customer.fullName,
    customerEmail: args.customer.email,
    customerPhone: args.customer.phone,
    business: args.customer.business,
    deliveryMethod: args.customer.delivery,
    deliveryAddress: args.customer.address,
    deliveryDate: args.customer.date,
    orderType: args.customer.orderType,
    notes: args.customer.notes,
    items: args.items,
    subtotal: args.subtotal,
    deliveryFee: args.deliveryFee,
    total: args.total,
    paymentMethod: args.paymentMethod,
    paymentStatus: args.paymentStatus,
  };

  await Promise.allSettled([
    enqueueTemplate({
      templateName: "owner-new-order",
      to: "amahjoub0589@gmail.com",
      data: templateData,
      idempotencyKey: `owner-${args.orderNumber}`,
    }),
    enqueueTemplate({
      templateName: "customer-order-confirmation",
      to: args.customer.email,
      data: templateData,
      idempotencyKey: `customer-${args.orderNumber}`,
    }),
  ]);
}