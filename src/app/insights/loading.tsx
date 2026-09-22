import { Container } from "@/components/shared/Container";
import { InsightCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="pt-40 lg:pt-48 pb-24">
      <Container>
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
