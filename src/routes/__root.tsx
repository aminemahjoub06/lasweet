import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "sonner";
import { CookieBanner } from "../components/CookieBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "L&A Sweet — Handcrafted Trompe-l'œil Desserts in Brisbane" },
      { name: "description", content: "L&A Sweet is a handcrafted French pâtisserie in Brisbane creating trompe-l'œil desserts that look like fruit. Pick-up in Woolloongabba or delivery across Brisbane." },
      { name: "author", content: "L&A Sweet" },
      { name: "keywords", content: "L&A Sweet, LA Sweet Brisbane, trompe l'oeil dessert, French patisserie Brisbane, handmade dessert Woolloongabba, Brisbane cakes, French desserts Australia" },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:site_name", content: "L&A Sweet" },
      { property: "og:title", content: "L&A Sweet — Handcrafted Trompe-l'œil Desserts in Brisbane" },
      { property: "og:description", content: "Handcrafted French trompe-l'œil desserts made fresh in Brisbane by a young French couple. Pick-up in Woolloongabba or delivery across Brisbane." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_AU" },
      { property: "og:url", content: "https://la-sweet-bne.com/" },
      { property: "og:image", content: "https://la-sweet-bne.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "L&A Sweet — handcrafted trompe-l'œil desserts in Brisbane" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "L&A Sweet — Handcrafted Trompe-l'œil Desserts in Brisbane" },
      { name: "twitter:description", content: "Handcrafted French trompe-l'œil desserts made fresh in Brisbane by a young French couple." },
      { name: "twitter:image", content: "https://la-sweet-bne.com/og-image.jpg" },
      { name: "theme-color", content: "#0a0806" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "L&A Sweet" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "geo.region", content: "AU-QLD" },
      { name: "geo.placename", content: "Brisbane" },
      { name: "geo.position", content: "-27.4870;153.0330" },
      { name: "ICBM", content: "-27.4870, 153.0330" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/__l5e/assets-v1/3ca30b5e-7a78-4a02-9baa-704c746f8613/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-center" theme="dark" />
      <CookieBanner />
    </QueryClientProvider>
  );
}
