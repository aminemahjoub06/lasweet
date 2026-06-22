import { getHeaders } from "@tanstack/react-start/server";

const WINDOW_MS = 60 * 60 * 1000; // 1h
const IP_MAX = 5;
const EMAIL_MAX = 3;

const MESSAGE =
  "Too many orders attempted from your device or email. Please wait a moment and try again, or contact us at l.asweetbne@gmail.com if you need help.";

export function getClientIp(): string | null {
  try {
    const h = getHeaders();
    const pick = (v: unknown): string | null => {
      if (!v) return null;
      const s = Array.isArray(v) ? v[0] : String(v);
      return s ? s.split(",")[0]!.trim() : null;
    };
    return (
      pick(h["cf-connecting-ip"]) ??
      pick(h["x-real-ip"]) ??
      pick(h["x-forwarded-for"]) ??
      null
    );
  } catch {
    return null;
  }
}

function tooManyResponse() {
  return new Response(
    JSON.stringify({ error: MESSAGE, code: "rate_limited" }),
    {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "3600" },
    },
  );
}

/**
 * Enforces per-IP (5/h) and per-email (3/h) limits on order endpoints.
 * Throws a 429 Response when exceeded. Logs blocks to rate_limit_log.
 * Admins listed in rate_limit_allowlist bypass entirely.
 */
export async function enforceOrderRateLimit(opts: {
  endpoint: string;
  email: string;
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = getClientIp();
  const email = opts.email.trim().toLowerCase();
  const endpoint = opts.endpoint;
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  // Allowlist bypass
  try {
    const orParts: string[] = [];
    if (ip) orParts.push(`and(kind.eq.ip,value.eq.${ip})`);
    orParts.push(`and(kind.eq.email,value.eq.${email})`);
    const { data: allowed } = await supabaseAdmin
      .from("rate_limit_allowlist")
      .select("id")
      .or(orParts.join(","))
      .limit(1);
    if (allowed && allowed.length > 0) {
      return; // skip counting & enforcement
    }
  } catch (e) {
    console.error("[rate-limit] allowlist check failed", e);
  }

  // Count recent attempts
  let ipCount = 0;
  let emailCount = 0;
  try {
    if (ip) {
      const { count } = await supabaseAdmin
        .from("rate_limit_attempts")
        .select("id", { count: "exact", head: true })
        .eq("scope", "ip")
        .eq("identifier", ip)
        .gte("created_at", since);
      ipCount = count ?? 0;
    }
    const { count: ec } = await supabaseAdmin
      .from("rate_limit_attempts")
      .select("id", { count: "exact", head: true })
      .eq("scope", "email")
      .eq("identifier", email)
      .gte("created_at", since);
    emailCount = ec ?? 0;
  } catch (e) {
    // Fail open on count errors — don't break checkout because the limiter is down
    console.error("[rate-limit] count failed", e);
    return;
  }

  const ipBlocked = ip !== null && ipCount >= IP_MAX;
  const emailBlocked = emailCount >= EMAIL_MAX;

  if (ipBlocked || emailBlocked) {
    try {
      await supabaseAdmin.from("rate_limit_log").insert({
        ip,
        email,
        endpoint,
        reason: ipBlocked
          ? emailBlocked
            ? "ip_and_email"
            : "ip"
          : "email",
        ip_count: ipCount,
        email_count: emailCount,
      });
    } catch (e) {
      console.error("[rate-limit] log insert failed", e);
    }
    throw tooManyResponse();
  }

  // Record this attempt (best effort)
  try {
    const rows: Array<{ scope: "ip" | "email"; identifier: string; endpoint: string }> = [
      { scope: "email", identifier: email, endpoint },
    ];
    if (ip) rows.push({ scope: "ip", identifier: ip, endpoint });
    await supabaseAdmin.from("rate_limit_attempts").insert(rows);
  } catch (e) {
    console.error("[rate-limit] attempt insert failed", e);
  }
}