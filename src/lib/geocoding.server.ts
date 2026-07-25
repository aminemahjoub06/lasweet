// Server-only geocoding helpers with a pluggable provider and DB cache.
// Provider selected via GEOCODING_PROVIDER ("nominatim" default | "google").

export interface GeocodeResult {
  lat: number;
  lng: number;
  provider: string;
}

const CACHE_TTL_DAYS = 30;
const NOMINATIM_UA = "L&A Sweet Brisbane (l.asweetbne@gmail.com)";
const REQUEST_TIMEOUT_MS = 5000;

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Normalize a customer-provided address before geocoding:
 *   - collapse whitespace
 *   - collapse duplicate / misplaced commas
 *   - uppercase 2- or 3-letter state codes (QLD, NSW, VIC, ...)
 *   - keep street number, street name, suburb, state, postcode intact
 */
export function normalizeInputAddress(raw: string): string {
  let s = String(raw ?? "").replace(/\s+/g, " ").trim();
  // collapse repeated commas and normalize spacing around them
  s = s.replace(/\s*,\s*/g, ", ");
  s = s.replace(/(,\s*){2,}/g, ", ");
  s = s.replace(/^,\s*|,\s*$/g, "");
  // uppercase Australian state codes when they appear as standalone tokens
  s = s.replace(/\b(qld|nsw|vic|tas|act|sa|wa|nt)\b/gi, (m) => m.toUpperCase());
  // normalize postcode spacing (state code + 4 digits)
  s = s.replace(/\b([A-Z]{2,3})\s+(\d{4})\b/g, "$1 $2");
  return s;
}

/**
 * Remove unit / apartment / level / suite / shop prefixes from an address.
 * Preserves the street number, street name, suburb, state and postcode.
 * Returns null when no such prefix is present (avoid retrying with an
 * identical query).
 */
export function stripUnitInfo(address: string): string | null {
  const s = normalizeInputAddress(address);
  // Patterns like "Unit 3, 12 Main St ...", "Apt 4/12 Main St ...",
  // "Shop 5, 20 High St ...", "Level 2 / 40 Queen St ...".
  const patterns: RegExp[] = [
    /^(?:unit|apt|apartment|suite|ste|shop|level|lvl|flat)\s*[\w-]*\s*[,/]\s*/i,
    /^\d+\s*\/\s*/, // "3/12 Main St"
  ];
  for (const rx of patterns) {
    if (rx.test(s)) {
      const stripped = s.replace(rx, "").trim();
      if (stripped.length >= 5 && stripped !== s) return stripped;
    }
  }
  return null;
}

async function readCache(address: string): Promise<GeocodeResult | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("geocoding_cache")
      .select("lat, lng, provider, created_at")
      .eq("address", normalizeAddress(address))
      .maybeSingle();
    if (!data) return null;
    const ageMs = Date.now() - new Date(data.created_at as string).getTime();
    if (ageMs > CACHE_TTL_DAYS * 24 * 60 * 60 * 1000) return null;
    return { lat: Number(data.lat), lng: Number(data.lng), provider: data.provider as string };
  } catch (err) {
    console.error("[geocoding] cache read failed", err);
    return null;
  }
}

async function writeCache(address: string, result: GeocodeResult, raw?: unknown) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("geocoding_cache").upsert(
      {
        address: normalizeAddress(address),
        lat: result.lat,
        lng: result.lng,
        provider: result.provider,
        raw: (raw ?? null) as any,
        created_at: new Date().toISOString(),
      },
      { onConflict: "address" },
    );
  } catch (err) {
    console.error("[geocoding] cache write failed", err);
  }
}

async function geocodeNominatim(address: string): Promise<GeocodeResult | null> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      format: "json",
      q: address,
      limit: "1",
      countrycodes: "au",
      addressdetails: "0",
    }).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": NOMINATIM_UA,
        Accept: "application/json",
        "Accept-Language": "en-AU",
      },
      signal: controller.signal,
    });
    if (!resp.ok) {
      console.error("[geocoding:nominatim] http error", resp.status);
      return null;
    }
    const rows = (await resp.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const lat = Number(rows[0]!.lat);
    const lng = Number(rows[0]!.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng, provider: "nominatim" };
  } catch (err) {
    console.error("[geocoding:nominatim] request failed", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocodeGoogle(_address: string): Promise<GeocodeResult | null> {
  // Placeholder — wired up when the Google Cloud key is provisioned.
  // Switch by setting GEOCODING_PROVIDER=google in the environment.
  console.warn("[geocoding:google] not yet implemented — falling back to null");
  return null;
}

/**
 * Resolve an Australian street address to lat/lng. Returns null if the
 * provider is unreachable, times out, or finds no match.
 * Results are cached in the geocoding_cache table for 30 days.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const clean = normalizeInputAddress(address);
  if (clean.length < 3) return null;

  const cached = await readCache(clean);
  if (cached) return cached;

  const provider = (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase();
  const result =
    provider === "google" ? await geocodeGoogle(clean) : await geocodeNominatim(clean);

  if (result) await writeCache(clean, result);
  return result;
}

/**
 * Two-pass geocode: full address first, then a retry with unit/apt/level
 * information stripped. Returns null when both attempts fail — callers
 * MUST block delivery checkout on null.
 */
export async function geocodeAddressWithRetry(
  address: string,
): Promise<GeocodeResult | null> {
  const full = await geocodeAddress(address);
  if (full) return full;
  const stripped = stripUnitInfo(address);
  if (!stripped) return null;
  return await geocodeAddress(stripped);
}