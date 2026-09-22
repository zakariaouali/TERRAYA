import { Container } from "@/components/shared/Container";
import { Skeleton, PropertyGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="pt-32 lg:pt-40">
      <Container>
        <div className="max-w-3xl">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-14 w-full max-w-xl" />
          <Skeleton className="mt-6 h-4 w-full max-w-lg" />
        </div>
        <div className="mt-16 border-y border-sand-200 dark:border-sand-800 py-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-8 h-4 w-28" />
        <div className="mt-12 pb-24">
          <PropertyGridSkeleton count={6} />
        </div>
      </Container>
    </div>
  );
}
