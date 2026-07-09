import type { NavItem } from "@/lib/view-models";

export const appNavigation: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Monthly pulse and budget health",
    matchMode: "exact",
  },
  {
    href: "/accounts",
    label: "Accounts",
    description: "Balances and account setup",
    matchMode: "prefix",
  },
  {
    href: "/categories",
    label: "Categories",
    description: "Income and expense structure",
    matchMode: "prefix",
  },
  {
    href: "/transactions",
    label: "Transactions",
    description: "Search, filter, and review activity",
    matchMode: "exact",
  },
  {
    href: "/budgets",
    label: "Budgets",
    description: "Monthly limits by category",
    matchMode: "prefix",
  },
  {
    href: "/transactions/import",
    label: "Import",
    description: "CSV mapping and validation",
    matchMode: "exact",
  },
];
