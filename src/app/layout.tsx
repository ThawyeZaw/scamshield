import type { Metadata } from "next";
import { Calistoga, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ScamShield — Instant Scam & Phishing Verifier",
  description:
    "Paste a suspicious SMS, Telegram message, or job offer for an instant red-flag check.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable} min-h-screen bg-[#FAF9F6] font-sans text-[#0F172A] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
