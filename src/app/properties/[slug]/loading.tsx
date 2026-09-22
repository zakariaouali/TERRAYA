import { Container } from "@/components/shared/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="pt-28 lg:pt-32 pb-24">
      <Container>
        <Skeleton className="h-3 w-32" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-4 h-16 w-full max-w-xl" />
            <Skeleton className="mt-4 h-4 w-2/3" />
          </div>
          <Skeleton className="h-10 w-40 lg:justify-self-end" />
        </div>
        <Skeleton className="mt-12 aspect-[16/10] w-full " />
        <div className="mt-16 grid gap-16 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </Container>
    </div>
  );
}
