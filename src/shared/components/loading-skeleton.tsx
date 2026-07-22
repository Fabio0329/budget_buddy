export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-line" />
        <div className="h-12 w-72 rounded-full bg-line" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-line" />
      </div>
      <div className="card-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
