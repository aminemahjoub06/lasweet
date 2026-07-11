// Top languages for Brisbane / Australian tourism.
// Order matches the customer brief (English default first).
export interface Lang {
  code: string; // Google Translate target code (e.g. "zh-CN", "ja")
  label: string; // Native script label shown in the switcher
  english: string; // English name (for a11y + browser detection)
}

export const LANGUAGES: Lang[] = [
  { code: "en", label: "English", english: "English" },
  { code: "zh-CN", label: "中文", english: "Chinese (Simplified)" },
  { code: "ja", label: "日本語", english: "Japanese" },
  { code: "ko", label: "한국어", english: "Korean" },
  { code: "vi", label: "Tiếng Việt", english: "Vietnamese" },
  { code: "th", label: "ไทย", english: "Thai" },
  { code: "id", label: "Bahasa Indonesia", english: "Indonesian" },
  { code: "hi", label: "हिन्दी", english: "Hindi" },
  { code: "fr", label: "Français", english: "French" },
  { code: "es", label: "Español", english: "Spanish" },
  { code: "de", label: "Deutsch", english: "German" },
  { code: "it", label: "Italiano", english: "Italian" },
];

export const PREF_KEY = "preferred-language";
export const BANNER_KEY = "translate-banner-dismissed";

// Google Translate reads the `googtrans` cookie on load and applies the
// corresponding target language. Setting it on both the naked host and the
// parent domain covers www.* and custom domain variants.
export function setGoogtransCookie(target: string) {
  if (typeof document === "undefined") return;
  const value = `/en/${target}`;
  const host = window.location.hostname;
  const parent = host.replace(/^www\./, "");
  const attrs = "; path=/; max-age=31536000; SameSite=Lax";
  document.cookie = `googtrans=${value}${attrs}`;
  document.cookie = `googtrans=${value}; domain=.${parent}${attrs}`;
  document.cookie = `googtrans=${value}; domain=${parent}${attrs}`;
}

export function clearGoogtransCookie() {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const parent = host.replace(/^www\./, "");
  const expire = "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=${expire}`;
  document.cookie = `googtrans=; domain=.${parent}${expire}`;
  document.cookie = `googtrans=; domain=${parent}${expire}`;
}

export function getStoredLanguage(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(PREF_KEY);
}

export function setStoredLanguage(code: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PREF_KEY, code);
}

export function clearStoredLanguage() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(PREF_KEY);
}

// Match a browser language tag (e.g. "ja-JP", "zh-Hant-HK") to one of our
// supported codes. Returns null when nothing sensible matches.
export function matchBrowserLanguage(tag: string | undefined | null): Lang | null {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  if (lower.startsWith("en")) return null;
  // Chinese variants → Simplified for CN/SG, otherwise Simplified as default.
  if (lower.startsWith("zh")) return LANGUAGES.find((l) => l.code === "zh-CN") ?? null;
  const base = lower.split("-")[0];
  return LANGUAGES.find((l) => l.code.toLowerCase() === base) ?? null;
}