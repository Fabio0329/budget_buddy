import "server-only";

export function reportServerError(event: string, error: unknown) {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorCode =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code).slice(0, 40)
      : undefined;

  console.error(JSON.stringify({ event, errorName, errorCode }));
}
