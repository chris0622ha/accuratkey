import type { Metadata, Viewport } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import PwaSetup from "@/components/PwaSetup";
import GlobalCommandBar from "./GlobalCommandBar";
import CookieConsent from "@/components/CookieConsent";
// AccuratKey - URLs: /signin /game /play /stats /help /store /social /about /settings /friends
export const metadata: Metadata = {
  title: "AccuratKey",
  description: "Train smarter. Type faster.",
  applicationName: "AccuratKey",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: "AccuratKey", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html,body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-text-size-adjust:100%}
          body{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
          button,a,[role=button]{touch-action:manipulation}
          @media (display-mode: standalone){body{user-select:none;-webkit-user-select:none}input,textarea{user-select:text;-webkit-user-select:text}}
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        <PwaSetup />
        <GlobalCommandBar />
        <CookieConsent />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
