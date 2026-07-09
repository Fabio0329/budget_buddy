import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { appNavigation } from "@/lib/navigation";
import { mockCurrentUser } from "@/lib/mock-data";

export default function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppShell navigation={appNavigation} user={mockCurrentUser}>
      {children}
    </AppShell>
  );
}
