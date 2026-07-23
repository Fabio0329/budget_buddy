import type { ReactNode } from "react";
import { requireCurrentUser } from "@/server/auth/session";
import { AppShell } from "@/shared/components/app-shell";
import { appNavigation } from "@/shared/utils/navigation";

export async function ProtectedAppShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await requireCurrentUser();

  return (
    <AppShell navigation={appNavigation} user={user}>
      {children}
    </AppShell>
  );
}
