import { Suspense } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ScrollReset } from "@/shared/components/scroll-reset";
import { getAppUrl } from "@/server/config/app-url";
import "./globals.css";

const geist = localFont({
  src: "../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  display: "swap",
  variable: "--font-geist",
  fallback: ["Avenir Next", "Trebuchet MS", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: getAppUrl(),
  title: {
    default: "Budget Buddy",
    template: "%s | Budget Buddy",
  },
  description:
    "Budget Buddy is a personal finance dashboard for tracking spending, budgets, accounts, and cash flow.",
  icons: {
    apple: [{ type: "image/png", url: "/budget-buddy-icon.png" }],
    icon: [{ type: "image/png", url: "/budget-buddy-icon.png" }],
    shortcut: ["/budget-buddy-icon.png"],
  },
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
