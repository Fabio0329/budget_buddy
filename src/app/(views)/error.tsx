"use client";

import { ErrorState } from "@/components/error-state";

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorState
      title="The app shell hit a rendering problem."
      description={error.message}
      actionLabel="Retry"
      onAction={reset}
    />
  );
}
