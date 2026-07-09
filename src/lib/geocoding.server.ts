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
  const clean = address.trim();
  if (clean.length < 3) return null;

  const cached = await readCache(clean);
  if (cached) return cached;

  const provider = (process.env.GEOCODING_PROVIDER ?? "nominatim").toLowerCase();
  const result =
    provider === "google" ? await geocodeGoogle(clean) : await geocodeNominatim(clean);

  if (result) await writeCache(clean, result);
  return result;
}