export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-4">
        <div className="h-24 flex-1 rounded-lg bg-[var(--muted)]" />
        <div className="h-24 w-48 rounded-lg bg-[var(--muted)]" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-[var(--muted)]" />
        <div className="h-4 w-1/2 rounded bg-[var(--muted)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--muted)]" />
      </div>
      <div className="h-32 rounded-lg bg-[var(--muted)]" />
    </div>
  );
}
