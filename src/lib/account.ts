// Frontend-only account + orders store backed by localStorage.
// Designed for demo/preview use. Replace with Lovable Cloud (Supabase) later
// for real authentication and cross-device persistence.

import { useEffect, useState, useSyncExternalStore } from "react";

export const ORDER_STATUSES = [
  "Pending validation",
  "Quote sent",
  "Payment pending",
  "Paid",
  "In preparation",
  "Ready for pick-up",
  "Out for delivery",
  "Completed",
  "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type CustomerType = "Restaurant" | "Café" | "Private event" | "Other";

export type SavedDetails = {
  fullName: string;
  email: string;
  phone: string;
  business?: string;
  customerType: CustomerType;
};

export type OrderItem = {
  no: string;
  name: string;
  prefix: string;
  suffix: string;
  image?: string;
  qty: number;
};

export type OrderMessage = {
  id: string;
  at: string;
  from: "studio" | "customer" | "system";
  text: string;
  read?: boolean;
};

export const NOTIFICATION_TYPES = [
  "order_received",
  "quote_sent",
  "payment_required",
  "payment_confirmed",
  "in_preparation",
  "ready_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
  "new_message",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Notification = {
  id: string;
  at: string;
  type: NotificationType;
  title: string;
  body: string;
  ref?: string; // related order
  read?: boolean;
};

export type Order = {
  ref: string;
  createdAt: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string }[];
  items: OrderItem[];
  estimate: { min: number; max: number };
  customer: {
    fullName: string;
    email: string;
    phone: string;
    business?: string;
    customerType: CustomerType;
    delivery: "delivery" | "pickup";
    date?: string;
    notes?: string;
  };
  messages: OrderMessage[];
};

export type User = {
  email: string;
  passwordHash: string;
  createdAt: string;
  details: SavedDetails;
};

type DB = {
  users: Record<string, User>;
  orders: Record<string, Order[]>; // keyed by email
  notifications: Record<string, Notification[]>; // keyed by email
  session: string | null; // email of logged-in user
};

const DB_KEY = "la_account_db_v1";
const REORDER_KEY = "la_pending_reorder";

const emptyDB: DB = { users: {}, orders: {}, notifications: {}, session: null };

const isBrowser = () => typeof window !== "undefined";

function readDB(): DB {
  if (!isBrowser()) return emptyDB;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return { ...emptyDB };
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      users: parsed.users ?? {},
      orders: parsed.orders ?? {},
      notifications: parsed.notifications ?? {},
      session: parsed.session ?? null,
    };
  } catch {
    return { ...emptyDB };
  }
}

function writeDB(db: DB) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent("la-account-change"));
  } catch {
    /* storage full or blocked — silently ignore */
  }
}

// Lightweight non-cryptographic hash. This store is frontend-only and not a
// security boundary — credentials never leave the device.
function hashPassword(pw: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < pw.length; i++) {
    h ^= pw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("0000000" + (h >>> 0).toString(16)).slice(-8);
}

function normEmail(e: string) {
  return e.trim().toLowerCase();
}

function genRef() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  return `LA-${year}-${rand}`;
}

// ───── Subscription API for useSyncExternalStore ─────
function subscribe(cb: () => void) {
  if (!isBrowser()) return () => {};
  const onChange = () => cb();
  window.addEventListener("la-account-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("la-account-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot() {
  return readDB();
}
function getServerSnapshot() {
  return emptyDB;
}

// ───── Public API ─────

export type SignupInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  business?: string;
  customerType: CustomerType;
};

export function signup(input: SignupInput): { ok: true } | { ok: false; error: string } {
  const email = normEmail(input.email);
  const db = readDB();
  if (db.users[email]) return { ok: false, error: "An account with this email already exists." };
  if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  db.users[email] = {
    email,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
    details: {
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      business: input.business?.trim() || undefined,
      customerType: input.customerType,
    },
  };
  db.session = email;
  writeDB(db);
  return { ok: true };
}

export function login(emailRaw: string, password: string): { ok: true } | { ok: false; error: string } {
  const email = normEmail(emailRaw);
  const db = readDB();
  const u = db.users[email];
  if (!u || u.passwordHash !== hashPassword(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  db.session = email;
  writeDB(db);
  return { ok: true };
}

export function logout() {
  const db = readDB();
  db.session = null;
  writeDB(db);
}

export function updateDetails(details: Partial<SavedDetails>) {
  const db = readDB();
  if (!db.session) return;
  const u = db.users[db.session];
  if (!u) return;
  u.details = { ...u.details, ...details, email: u.email };
  writeDB(db);
}

export function changePassword(current: string, next: string): { ok: true } | { ok: false; error: string } {
  const db = readDB();
  if (!db.session) return { ok: false, error: "Not signed in." };
  const u = db.users[db.session];
  if (!u || u.passwordHash !== hashPassword(current)) return { ok: false, error: "Current password is incorrect." };
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
  u.passwordHash = hashPassword(next);
  writeDB(db);
  return { ok: true };
}

export function saveOrder(input: {
  email: string;
  ref?: string;
  status?: OrderStatus;
  items: OrderItem[];
  estimate: { min: number; max: number };
  customer: Order["customer"];
}): Order {
  const email = normEmail(input.email);
  const db = readDB();
  const ref = input.ref ?? genRef();
  const status: OrderStatus = input.status ?? "Pending validation";
  const now = new Date().toISOString();
  const order: Order = {
    ref,
    createdAt: now,
    status,
    statusHistory: [{ status, at: now }],
    items: input.items,
    estimate: input.estimate,
    customer: { ...input.customer, email },
    messages: [
      {
        id: `m-${Date.now()}`,
        at: now,
        from: "system",
        text: `Order ${ref} received. We'll confirm availability and final pricing shortly.`,
      },
    ],
  };
  db.orders[email] = [order, ...(db.orders[email] ?? [])];
  // Welcome notification + status notification
  pushNotification(db, email, {
    type: "order_received",
    title: "Order received",
    body: `We've received order ${ref}. We'll confirm availability and final pricing shortly.`,
    ref,
  });
  if (status === "Paid") {
    pushNotification(db, email, {
      type: "payment_confirmed",
      title: "Payment confirmed",
      body: `Thank you — payment for ${ref} has been received.`,
      ref,
    });
    queueEmail({
      to: email,
      subject: `Payment confirmed — ${ref}`,
      body: `Thank you. We've received your payment for order ${ref}. We'll be in touch shortly with the next steps.`,
    });
  }
  queueEmail({
    to: email,
    subject: `Order received — ${ref}`,
    body: `We've received order ${ref}. You can track its progress at any time from your account.`,
  });
  writeDB(db);
  return order;
}

const STATUS_NOTIFICATION: Partial<Record<OrderStatus, { type: NotificationType; title: string; body: (ref: string) => string }>> = {
  "Quote sent": {
    type: "quote_sent",
    title: "Quote sent",
    body: (ref) => `Your quote for ${ref} is ready to review in your account.`,
  },
  "Payment pending": {
    type: "payment_required",
    title: "Payment required",
    body: (ref) => `Order ${ref} is awaiting payment to enter production.`,
  },
  Paid: {
    type: "payment_confirmed",
    title: "Payment confirmed",
    body: (ref) => `Payment for ${ref} has been received. Thank you.`,
  },
  "In preparation": {
    type: "in_preparation",
    title: "In preparation",
    body: (ref) => `Our pâtissiers have started work on ${ref}.`,
  },
  "Ready for pick-up": {
    type: "ready_pickup",
    title: "Ready for pick-up",
    body: (ref) => `Order ${ref} is ready for collection.`,
  },
  "Out for delivery": {
    type: "out_for_delivery",
    title: "Out for delivery",
    body: (ref) => `Order ${ref} is on its way.`,
  },
  Completed: {
    type: "completed",
    title: "Order completed",
    body: (ref) => `Order ${ref} is complete. We hope you enjoyed every bite.`,
  },
  Cancelled: {
    type: "cancelled",
    title: "Order cancelled",
    body: (ref) => `Order ${ref} has been cancelled.`,
  },
};

export function setOrderStatus(email: string, ref: string, status: OrderStatus) {
  const db = readDB();
  const key = normEmail(email);
  const list = db.orders[key];
  if (!list) return;
  const o = list.find((x) => x.ref === ref);
  if (!o) return;
  o.status = status;
  o.statusHistory.push({ status, at: new Date().toISOString() });
  o.messages.push({
    id: `m-${Date.now()}`,
    at: new Date().toISOString(),
    from: "studio",
    text: `Status updated → ${status}.`,
  });
  const tpl = STATUS_NOTIFICATION[status];
  if (tpl) {
    pushNotification(db, key, { type: tpl.type, title: tpl.title, body: tpl.body(ref), ref });
    queueEmail({ to: key, subject: `${tpl.title} — ${ref}`, body: tpl.body(ref) });
  }
  writeDB(db);
}

export function markAllMessagesRead(email: string) {
  const db = readDB();
  const key = normEmail(email);
  const list = db.orders[key];
  if (!list) return;
  let changed = false;
  for (const o of list) {
    for (const m of o.messages) {
      if (!m.read) {
        m.read = true;
        changed = true;
      }
    }
  }
  if (changed) writeDB(db);
}

// ───── Messaging ─────

export function sendCustomerMessage(email: string, ref: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const db = readDB();
  const key = normEmail(email);
  const list = db.orders[key];
  if (!list) return;
  const o = list.find((x) => x.ref === ref);
  if (!o) return;
  o.messages.push({
    id: `m-${Date.now()}-c`,
    at: new Date().toISOString(),
    from: "customer",
    text: trimmed.slice(0, 1000),
    read: true,
  });
  writeDB(db);
  // Notify the studio side via email stub (in production this would page the team).
  queueEmail({
    to: "studio@lasweet.example",
    subject: `New customer message — ${ref}`,
    body: `${o.customer.fullName} (${o.customer.email}) wrote:\n\n${trimmed}`,
  });
  // Simulate a studio reply shortly after so the demo conversation feels alive.
  scheduleStudioAutoReply(key, ref);
}

export function sendStudioReply(email: string, ref: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const db = readDB();
  const key = normEmail(email);
  const list = db.orders[key];
  if (!list) return;
  const o = list.find((x) => x.ref === ref);
  if (!o) return;
  o.messages.push({
    id: `m-${Date.now()}-s`,
    at: new Date().toISOString(),
    from: "studio",
    text: trimmed.slice(0, 1000),
  });
  pushNotification(db, key, {
    type: "new_message",
    title: "New message from L&A Sweet",
    body: trimmed.slice(0, 140),
    ref,
  });
  writeDB(db);
  queueEmail({
    to: key,
    subject: `New message about ${ref}`,
    body: trimmed,
  });
}

function scheduleStudioAutoReply(email: string, ref: string) {
  if (!isBrowser()) return;
  window.setTimeout(() => {
    sendStudioReply(
      email,
      ref,
      "Thanks for your message — one of our team will reply with details shortly. (Auto-acknowledgement)",
    );
  }, 2500);
}

// ───── Notifications ─────

function pushNotification(
  db: DB,
  email: string,
  n: Omit<Notification, "id" | "at" | "read">,
) {
  const key = normEmail(email);
  const note: Notification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    read: false,
    ...n,
  };
  db.notifications[key] = [note, ...(db.notifications[key] ?? [])].slice(0, 100);
}

export function markAllNotificationsRead(email: string) {
  const db = readDB();
  const key = normEmail(email);
  const list = db.notifications[key];
  if (!list || list.length === 0) return;
  let changed = false;
  for (const n of list) {
    if (!n.read) {
      n.read = true;
      changed = true;
    }
  }
  if (changed) writeDB(db);
}

export function clearNotifications(email: string) {
  const db = readDB();
  const key = normEmail(email);
  db.notifications[key] = [];
  writeDB(db);
}

// ───── Email stub ─────
// Frontend-only: logs the email and stores it in localStorage so the team can
// inspect what would have been sent. Replace with Lovable Email + a server
// function once the project moves to Lovable Cloud.
type QueuedEmail = { id: string; at: string; to: string; subject: string; body: string };
const EMAIL_LOG_KEY = "la_email_outbox_v1";

export function queueEmail(input: { to: string; subject: string; body: string }) {
  if (!isBrowser()) return;
  try {
    // TODO(cloud): replace this stub with a real send via the
    // `send-transactional-email` server route once Lovable Cloud + email
    // domain are enabled. Each call here would become a server-function
    // invocation with the matching template name and templateData.
    const log: QueuedEmail[] = JSON.parse(window.localStorage.getItem(EMAIL_LOG_KEY) || "[]");
    log.unshift({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      ...input,
    });
    window.localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(log.slice(0, 50)));
    // eslint-disable-next-line no-console
    console.info("[email-stub] →", input.to, "·", input.subject);
  } catch {
    /* ignore */
  }
}

export function readEmailOutbox(): QueuedEmail[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(EMAIL_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

export function queueReorder(items: OrderItem[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      REORDER_KEY,
      JSON.stringify(items.map(({ no, qty }) => ({ no, qty }))),
    );
  } catch {
    /* ignore */
  }
}

export function consumePendingReorder(): { no: string; qty: number }[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(REORDER_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(REORDER_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ───── Hooks ─────

export function useAccountDB(): DB {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCurrentUser(): User | null {
  const db = useAccountDB();
  if (!db.session) return null;
  return db.users[db.session] ?? null;
}

export function useUserOrders(): Order[] {
  const db = useAccountDB();
  if (!db.session) return [];
  return db.orders[db.session] ?? [];
}

export function useUserNotifications(): Notification[] {
  const db = useAccountDB();
  if (!db.session) return [];
  return db.notifications[db.session] ?? [];
}

export function useUnreadCounts() {
  const db = useAccountDB();
  if (!db.session) return { messages: 0, notifications: 0, total: 0 };
  const orders = db.orders[db.session] ?? [];
  const messages = orders.reduce(
    (n, o) => n + o.messages.filter((m) => m.from !== "customer" && !m.read).length,
    0,
  );
  const notifications = (db.notifications[db.session] ?? []).filter((n) => !n.read).length;
  return { messages, notifications, total: messages + notifications };
}

/**
 * Returns a stable boolean reflecting whether the user is hydrated (mounted).
 * Avoids hydration mismatches when SSR sees no session.
 */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export const CUSTOMER_TYPES: CustomerType[] = ["Restaurant", "Café", "Private event", "Other"];

export const STATUS_TONE: Record<OrderStatus, { dot: string; text: string }> = {
  "Pending validation": { dot: "bg-[color:var(--foreground)]/40", text: "text-[color:var(--foreground)]/70" },
  "Quote sent": { dot: "bg-gold/70", text: "text-gold" },
  "Payment pending": { dot: "bg-gold/70", text: "text-gold" },
  Paid: { dot: "bg-emerald-400/80", text: "text-emerald-300" },
  "In preparation": { dot: "bg-gold", text: "text-gold" },
  "Ready for pick-up": { dot: "bg-emerald-400/80", text: "text-emerald-300" },
  "Out for delivery": { dot: "bg-gold", text: "text-gold" },
  Completed: { dot: "bg-emerald-400/80", text: "text-emerald-300" },
  Cancelled: { dot: "bg-red-400/70", text: "text-red-300" },
};