import type { Metadata } from "next";
import { Crimson_Pro, Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/sessionStore";

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Le Chat à Paris",
  description: "Turn everyday moments into bilingual stories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimson.variable} ${inter.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          background: "#E8E4DF",
          minHeight: "100dvh",
        }}
      >
        <SessionProvider>
          <div
            className="relative mx-auto flex flex-col"
            style={{
              maxWidth: 390,
              minHeight: "100dvh",
              background: "var(--color-warm-bg)",
              overflowX: "hidden",
            }}
          >
            <main className="flex-1">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
