import * as React from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Detect if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    // On iOS, show a subtle hint after some time
    if (ios) {
      const dismissed = localStorage.getItem("la-pwa-ios-dismissed");
      if (!dismissed) {
        const t = setTimeout(() => setShowPrompt(true), 8000);
        return () => clearTimeout(t);
      }
      return;
    }

    // Chrome/Edge/Android beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("la-pwa-android-dismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);

    // If appinstalled fires, hide prompt
    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem("la-pwa-ios-dismissed", "1");
    } else {
      localStorage.setItem("la-pwa-android-dismissed", "1");
    }
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
      style={{ animation: "laFadeUp 0.5s ease-out both" }}
    >
      <style>{`
        @keyframes laFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        className="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg"
        style={{
          background: "rgba(21, 17, 12, 0.95)",
          borderColor: "rgba(201,161,74,0.25)",
          backdropFilter: "blur(8px)",
        }}
      >
        <img
          src="/__l5e/assets-v1/6f4494e0-25af-4872-bb77-a842c97266c8/icon-192.png"
          alt="L&A Sweet"
          className="h-10 w-10 rounded-md"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[color:var(--foreground)] truncate">
            {isIOS
              ? "Add L&A Sweet to your home screen for faster ordering."
              : "Add L&A Sweet to your home screen for faster ordering."}
          </p>
          {isIOS && (
            <p className="text-[10px] text-[color:var(--foreground)]/50 mt-0.5">
              Tap the share button, then "Add to Home Screen".
            </p>
          )}
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: "var(--gold)",
              color: "var(--ink)",
            }}
          >
            Add
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-[10px] text-[color:var(--foreground)]/40 hover:text-[color:var(--foreground)]/70 transition-colors"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
