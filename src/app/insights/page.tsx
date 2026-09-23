import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { FadeIn } from "@/components/shared/FadeIn";
import { FadeImage } from "@/components/shared/FadeImage";
import { insights } from "@/data/insights";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Market briefs, analysis and lifestyle notes from the TERRAYA office on luxury real estate and investment.",
};

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title="Insights, quietly considered."
        description="Market briefs, analysis and notes on living well — from the desk of the TERRAYA office."
        image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
      />

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((article, i) => (
              <FadeIn key={article.slug} delay={(i % 3) * 0.1}>
                <Link href={`/insights/${article.slug}`} className="group block">
                  <div className="relative aspect-[5/4] overflow-hidden ">
                    <FadeImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="eyebrow mt-6">{article.tag}</p>
                  <h2 className="mt-2 font-display text-2xl text-sand-900 dark:text-sand-100 transition-colors group-hover:text-sand-600 dark:group-hover:text-sand-300">
                    {article.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-sand-700 dark:text-sand-300">{article.excerpt}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
                    {dateFmt(article.date)} · {article.readingMinutes} min read
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
