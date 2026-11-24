import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} min-h-screen bg-[#FAF9F6] font-sans text-[#0F172A] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
