import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { getMockSessionUser } from "@/server/auth/session";
import { appNavigation } from "@/shared/utils/navigation";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getMockSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell navigation={appNavigation} user={user}>
      {children}
    </AppShell>
  );
}
