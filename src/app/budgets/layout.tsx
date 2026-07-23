import type { ReactNode } from "react";
import { ProtectedAppShell } from "@/shared/components/protected-app-shell";

export default function BudgetsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>;
}
