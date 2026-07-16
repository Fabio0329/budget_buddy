import type { AccountType } from "@/server/generated/prisma/enums";

const accountTypes: Record<string, AccountType> = {
  cash: "CASH",
  checking: "CHECKING",
  credit_card: "CREDIT_CARD",
  investment: "INVESTMENT",
  other: "OTHER",
  savings: "SAVINGS",
};

function parseCurrency(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw) {
    return { cents: 0 };
  }

  const normalized = raw.replace(/[$\s]/g, "");
  const currencyPattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;

  if (!currencyPattern.test(normalized)) {
    return { error: "Enter a valid amount with no more than two decimals." };
  }

  const cents = Math.round(Number(normalized.replaceAll(",", "")) * 100);

  if (!Number.isSafeInteger(cents) || cents < -2147483648 || cents > 2147483647) {
    return { error: "Enter an amount between -$21,474,836.48 and $21,474,836.47." };
  }

  return { cents };
}

export function validateAccountForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const type = accountTypes[String(formData.get("type") ?? "")];
  const startingBalance = parseCurrency(formData.get("startingBalance"));
  const currentBalance = parseCurrency(formData.get("currentBalance"));
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Account name is required.";
  else if (name.length > 100) errors.name = "Use 100 characters or fewer.";

  if (!institution) errors.institution = "Institution or source is required.";
  else if (institution.length > 120) {
    errors.institution = "Use 120 characters or fewer.";
  }

  if (!type) errors.type = "Choose a valid account type.";
  if (startingBalance.error) errors.startingBalance = startingBalance.error;
  if (currentBalance.error) errors.currentBalance = currentBalance.error;

  if (Object.keys(errors).length > 0 || !type) {
    return { errors };
  }

  return {
    data: {
      currentBalanceCents: currentBalance.cents ?? 0,
      institution,
      name,
      startingBalanceCents: startingBalance.cents ?? 0,
      type,
    },
  };
}
