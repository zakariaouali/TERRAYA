import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-sand-200/70 dark:bg-sand-800/70", className)} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="aspect-[4/5] w-full " />
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="block">
      <Skeleton className="aspect-[5/4] w-full " />
      <Skeleton className="mt-6 h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}
