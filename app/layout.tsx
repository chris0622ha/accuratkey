import type { Metadata } from "next";

// URLs: /signin /profiles /game /play /stats /help /store /social /about
export const metadata: Metadata = {
  title: "AccuratKey",
  description: "Learn to type the right way.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
