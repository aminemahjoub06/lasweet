// Sends admin-only emails for the reviews system.
// Uses the same enqueue pipeline as notifications.server.ts but for review templates.
import * as React from "react";
import { render } from "@react-email/components";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SENDER_DOMAIN = "notify.la-sweet-bne.com";
const FROM_DOMAIN = "la-sweet-bne.com";
const SITE_NAME = "L&A Sweet";
const ADMIN_EMAIL = "l.asweetbne@gmail.com";

async function enqueueAdminTemplate(templateName: string, data: Record<string, unknown>, idempotencyKey: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const entry = TEMPLATES[templateName];
  if (!entry) {
    console.error("[review-notifications] template missing", templateName);
    return;
  }
  const element = React.createElement(entry.component, data);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = typeof entry.subject === "function" ? entry.subject(data) : entry.subject;
  const messageId = crypto.randomUUID();
  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: ADMIN_EMAIL,
    status: "pending",
  });
  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: ADMIN_EMAIL,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      // Admin emails skip unsubscribe footer — they're operational.
      unsubscribe_token: null,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) console.error("[review-notifications] enqueue error", templateName, error);
}

export async function notifyAdminNewReview(args: {
  reviewId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  comment: string;
  photoUrls: string[];
  orderNumber: string | null;
  verifiedPurchase: boolean;
  approveUrl: string;
  rejectUrl: string;
}) {
  try {
    await enqueueAdminTemplate("new-review-pending", args, `review-pending-${args.reviewId}`);
  } catch (e) {
    console.error("[review-notifications] notifyAdminNewReview failed", e);
  }
}

export async function sendReviewReminder(args: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  leaveReviewUrl: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const entry = TEMPLATES["review-reminder"];
  if (!entry) return;
  const element = React.createElement(entry.component, args);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject = typeof entry.subject === "function" ? entry.subject(args) : entry.subject;
  const messageId = crypto.randomUUID();
  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "review-reminder",
    recipient_email: args.customerEmail,
    status: "pending",
  });
  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: args.customerEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "review-reminder",
      idempotency_key: `review-reminder-${args.orderNumber}`,
      unsubscribe_token: null,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) console.error("[review-notifications] reminder enqueue error", error);
}
