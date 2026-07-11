import { useEffect } from "react";

// Injects the Google Website Translator element once. The widget reads the
// `googtrans` cookie set by the language switcher / auto-detect banner and
// translates the DOM in place. The Google top bar is hidden via global CSS.
//
// Deliberately mounted at the root so translation persists across route
// changes. Safe to re-run; guarded against double init.

declare global {
  interface Window {
    google?: { translate?: { TranslateElement: new (opts: unknown, el: string) => unknown } };
    googleTranslateElementInit?: () => void;
    __googleTranslateInited?: boolean;
  }
}

export function TranslateWidget() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__googleTranslateInited) return;
    window.__googleTranslateInited = true;

    // Placeholder element required by the Google widget.
    if (!document.getElementById("google_translate_element")) {
      const el = document.createElement("div");
      el.id = "google_translate_element";
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;";
      document.body.appendChild(el);
    }

    window.googleTranslateElementInit = () => {
      try {
        if (!window.google?.translate) return;
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            includedLanguages:
              "zh-CN,ja,ko,vi,th,id,hi,fr,es,de,it,ar,pt,ru,nl,pl,sv,tr,fa,ur,ta,bn,fil,ms,km,my,uk",
          },
          "google_translate_element",
        );
      } catch (e) {
        console.warn("[translate] init failed", e);
      }
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}