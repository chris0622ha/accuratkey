import type { Metadata } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
// AccuratKey - URLs: /signin /game /play /stats /help /store /social /about /settings /friends
export const metadata: Metadata = {
  title: "AccuratKey",
  description: "Train smarter. Type faster.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
