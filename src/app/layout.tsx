import { Suspense } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ScrollReset } from "@/components/scroll-reset";
import "./globals.css";

const geist = localFont({
  src: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  display: "swap",
  variable: "--font-geist",
  fallback: ["Avenir Next", "Trebuchet MS", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://budget-buddy.local"),
  title: {
    default: "Budget Buddy",
    template: "%s | Budget Buddy",
  },
  description:
    "Budget Buddy is a personal finance dashboard for tracking spending, budgets, accounts, and cash flow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <Suspense fallback={null}>
          <ScrollReset />
        </Suspense>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
