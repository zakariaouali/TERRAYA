import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { FadeImage } from "@/components/shared/FadeImage";
import { insights, getInsight } from "@/data/insights";
import { HoverFrame } from "@/components/shared/HoverFrame";
import { RevealText } from "@/components/shared/RevealText";
import { ShareButton } from "@/components/properties/PropertyExtras";
import { ArticleShell } from "@/components/insights/ReadingProgress";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsight(slug);
  if (!article) return { title: "Insight not found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [article.image],
    },
  };
}

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getInsight(slug);
  if (!article) notFound();

  const more = insights.filter((i) => i.slug !== article.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.date,
    author: { "@type": "Organization", name: "TERRAYA" },
    publisher: { "@type": "Organization", name: "TERRAYA" },
  };

  return (
    <ArticleShell className="pb-24 pt-32 lg:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/insights"
              className="text-xs tracking-[0.28em] uppercase text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
            >
              ← The Journal
            </Link>
            <ShareButton title={article.title} />
          </div>
          <p className="eyebrow mt-10">{article.tag}</p>
          <RevealText as="h1" className="mt-5 font-display text-4xl leading-[1.05] text-sand-900 dark:text-sand-100 md:text-5xl lg:text-6xl">
            {article.title}
          </RevealText>
          <p className="mt-6 text-xl leading-relaxed text-sand-700 dark:text-sand-300">{article.excerpt}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
            TERRAYA Office · {dateFmt(article.date)} · {article.readingMinutes} min read
          </p>
        </div>

        <div className="relative mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden">
          <FadeImage src={article.image} alt={article.title} fill priority sizes="100vw" className="object-cover" />
        </div>

        <div className="mx-auto mt-16 max-w-2xl space-y-7">
          {article.body.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lg leading-[1.8] text-sand-800 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-sand-900 dark:text-sand-200 dark:first-letter:text-sand-100"
                  : "text-lg leading-[1.8] text-sand-800 dark:text-sand-200"
              }
            >
              {p}
            </p>
          ))}
        </div>

        {/* Conversion block */}
        <div className="mx-auto mt-20 max-w-2xl border border-sand-300 bg-sand-50 p-8 dark:border-sand-700 dark:bg-sand-900 sm:p-10">
          <p className="eyebrow">A conversation, before a transaction</p>
          <p className="mt-3 font-display text-3xl leading-tight text-sand-900 dark:text-sand-100">
            Questions about this market? Ask the people who work in it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/consultation"
              className="bg-sand-900 px-7 py-3.5 text-[0.68rem] uppercase tracking-[0.22em] text-sand-50 transition-colors hover:bg-sand-700 dark:bg-sand-100 dark:text-sand-900 dark:hover:bg-sand-300"
            >
              Book a consultation
            </Link>
            <Link
              href="/properties"
              className="border border-sand-900/30 px-7 py-3.5 text-[0.68rem] uppercase tracking-[0.22em] text-sand-900 transition-colors hover:bg-sand-900 hover:text-sand-50 dark:border-sand-100/30 dark:text-sand-100 dark:hover:bg-sand-100 dark:hover:text-sand-900"
            >
              Browse the collection
            </Link>
          </div>
        </div>

        {more.length > 0 && (
          <div className="mx-auto mt-24 max-w-5xl border-t border-sand-200 pt-12 dark:border-sand-800">
            <p className="eyebrow mb-8">Continue reading</p>
            <div className="grid gap-10 md:grid-cols-2">
              {more.map((m) => (
                <Link key={m.slug} href={`/insights/${m.slug}`} className="group block">
                  <HoverFrame
                    className="aspect-[16/10]"
                    cursorLabel="Read"
                    image={<FadeImage src={m.image} alt={m.title} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />}
                  />
                  <p className="eyebrow mt-5">{m.tag}</p>
                  <h3 className="mt-2 font-display text-2xl text-sand-900 dark:text-sand-100">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                      {m.title}
                    </span>
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </ArticleShell>
  );
}
