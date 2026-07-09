import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getMockSessionUser } from "@/lib/auth";
import { appNavigation } from "@/lib/navigation";

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
