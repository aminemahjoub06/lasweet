// Server-only Google Calendar integration.
// Uses a Google service account (JWT bearer flow) to create/update/delete
// events on the "L&A Sweet Orders" calendar. Never imported by client code.

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";

let cachedToken: { token: string; exp: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function isCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CALENDAR_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.token;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) throw new Error("Google Calendar credentials not configured");

  // Env vars often have escaped \n newlines; restore them.
  const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(privateKey);
  const jwt = `${unsigned}.${b64url(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Google token error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: json.access_token,
    exp: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

export interface CalendarEventInput {
  summary: string;
  description: string;
  location?: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h) */
  time: string;
  /** Optional end HH:MM; defaults to +30 min. */
  endTime?: string;
  /** Order number used as an idempotency key inside the event. */
  orderNumber: string;
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const H = Math.floor(total / 60) % 24;
  const M = total % 60;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

function buildEventBody(input: CalendarEventInput) {
  const startTime = /^\d{2}:\d{2}$/.test(input.time) ? input.time : "12:00";
  const endTime =
    input.endTime && /^\d{2}:\d{2}$/.test(input.endTime)
      ? input.endTime
      : addMinutes(startTime, 30);
  return {
    summary: input.summary,
    description: input.description,
    location: input.location,
    start: { dateTime: `${input.date}T${startTime}:00`, timeZone: "Australia/Brisbane" },
    end: { dateTime: `${input.date}T${endTime}:00`, timeZone: "Australia/Brisbane" },
    extendedProperties: {
      private: { order_number: input.orderNumber, source: "la-sweet-website" },
    },
    // Do not invite the customer — keep internal.
    attendees: [],
    reminders: { useDefault: true },
  };
}

async function calendarFetch(method: string, path: string, body?: unknown) {
  const token = await getAccessToken();
  const res = await fetch(`${CAL_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Calendar ${method} ${path} → ${res.status}: ${await res.text()}`);
  }
  return res;
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<string> {
  const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
  const res = await calendarFetch("POST", `/calendars/${calId}/events`, buildEventBody(input));
  const json = (await res.json()) as { id: string };
  return json.id;
}

export async function updateCalendarEvent(
  eventId: string,
  input: CalendarEventInput,
): Promise<string> {
  const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
  const res = await calendarFetch(
    "PUT",
    `/calendars/${calId}/events/${encodeURIComponent(eventId)}`,
    buildEventBody(input),
  );
  if (res.status === 404 || res.status === 410) {
    // Event was deleted upstream; recreate.
    return createCalendarEvent(input);
  }
  const json = (await res.json()) as { id: string };
  return json.id;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
  await calendarFetch(
    "DELETE",
    `/calendars/${calId}/events/${encodeURIComponent(eventId)}`,
  );
}