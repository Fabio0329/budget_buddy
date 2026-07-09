import { cookies } from "next/headers";
import { MOCK_SESSION_COOKIE } from "@/lib/auth-constants";
import type { AppUserVM } from "@/lib/view-models";

type MockSessionPayload = {
  email: string;
  name: string;
};

export function deriveDisplayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "Budget Buddy User";

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function createMockSessionCookieValue(payload: MockSessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function parseMockSessionCookieValue(value: string): MockSessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<MockSessionPayload>;

    if (
      typeof parsed.name !== "string" ||
      parsed.name.length === 0 ||
      typeof parsed.email !== "string" ||
      parsed.email.length === 0
    ) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

export async function getMockSessionUser(): Promise<AppUserVM | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(MOCK_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  const session = parseMockSessionCookieValue(sessionCookie);
  if (!session) {
    return null;
  }

  return {
    id: `mock-${session.email}`,
    name: session.name,
    email: session.email,
    initials: createInitials(session.name),
  };
}

export function normalizeRedirectTarget(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/dashboard";
  }

  if (value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}
