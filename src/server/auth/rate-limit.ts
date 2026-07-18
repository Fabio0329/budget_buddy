import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/server/db/client";

type RateLimitRule = {
  blockMs: number;
  limit: number;
  scope: string;
  windowMs: number;
};

export class AuthRateLimitExceededError extends Error {
  constructor() {
    super("Authentication rate limit exceeded");
    this.name = "AuthRateLimitExceededError";
  }
}

const rules = {
  loginEmail: { blockMs: 15 * 60_000, limit: 8, scope: "login-email", windowMs: 15 * 60_000 },
  loginIp: { blockMs: 15 * 60_000, limit: 20, scope: "login-ip", windowMs: 15 * 60_000 },
  signupEmail: { blockMs: 60 * 60_000, limit: 3, scope: "signup-email", windowMs: 60 * 60_000 },
  signupIp: { blockMs: 60 * 60_000, limit: 5, scope: "signup-ip", windowMs: 60 * 60_000 },
} satisfies Record<string, RateLimitRule>;

function rateLimitSecret() {
  const secret = process.env.AUTH_RATE_LIMIT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "budget-buddy-local-development";
  throw new Error("AUTH_RATE_LIMIT_SECRET is required in production.");
}

function hashKey(scope: string, value: string) {
  return createHmac("sha256", rateLimitSecret())
    .update(`${scope}:${value}`)
    .digest("hex");
}

async function consume(rule: RateLimitRule, value: string) {
  const now = new Date();
  const key = hashKey(rule.scope, value);
  const existing = await db.authRateLimit.findUnique({ where: { key } });

  if (existing?.blockedUntil && existing.blockedUntil > now) {
    throw new AuthRateLimitExceededError();
  }

  const windowExpired =
    !existing || now.getTime() - existing.windowStartedAt.getTime() >= rule.windowMs;
  const attempts = windowExpired ? 1 : existing.attempts + 1;
  const blockedUntil =
    attempts > rule.limit ? new Date(now.getTime() + rule.blockMs) : null;

  await db.authRateLimit.upsert({
    create: { attempts, blockedUntil, key, windowStartedAt: now },
    update: {
      attempts,
      blockedUntil,
      ...(windowExpired ? { windowStartedAt: now } : {}),
    },
    where: { key },
  });

  if (blockedUntil) throw new AuthRateLimitExceededError();
}

async function clientFingerprint() {
  const requestHeaders = await headers();
  const forwarded =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  return forwarded.split(",")[0].trim().slice(0, 64) || "unknown";
}

export async function enforceLoginRateLimit(email: string) {
  const ip = await clientFingerprint();
  await Promise.all([
    consume(rules.loginIp, ip),
    consume(rules.loginEmail, email || "missing"),
  ]);
}

export async function enforceSignupRateLimit(email: string) {
  const ip = await clientFingerprint();
  await Promise.all([
    consume(rules.signupIp, ip),
    consume(rules.signupEmail, email || "missing"),
  ]);
}
