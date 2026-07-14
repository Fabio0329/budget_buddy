import type { ReactNode } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { requireCurrentUser } from "@/server/auth/session";
import { appNavigation } from "@/shared/utils/navigation";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireCurrentUser();

  return (
    <AppShell navigation={appNavigation} user={user}>
      {children}
    </AppShell>
  );
}
