import "server-only";

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getAppUrl() {
  const configuredUrl =
    process.env.APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  try {
    return new URL(withProtocol(configuredUrl));
  } catch {
    return new URL("http://localhost:3000");
  }
}
