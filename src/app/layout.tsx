import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full bg-canvas text-ink antialiased">
        <div className="app-frame">{children}</div>
      </body>
    </html>
  );
}
