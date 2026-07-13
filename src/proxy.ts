import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MOCK_SESSION_COOKIE } from "@/server/auth/constants";

const protectedPrefixes = [
  "/dashboard",
  "/accounts",
  "/categories",
  "/transactions",
  "/budgets",
];

const authRoutes = new Set(["/login", "/signup"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(MOCK_SESSION_COOKIE)?.value);
  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/categories/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/login",
    "/signup",
  ],
};
