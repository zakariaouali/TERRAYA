import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { insights, getInsight } from "@/data/insights";

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
    <article className="pt-32 lg:pt-40 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/insights"
            className="text-xs tracking-[0.28em] uppercase text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
          >
            ← The Journal
          </Link>
          <p className="eyebrow mt-10">{article.tag}</p>
          <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-sand-900 dark:text-sand-100">
            {article.title}
          </h1>
          <p className="mt-6 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">
            {dateFmt(article.date)} · {article.readingMinutes} min read
          </p>
        </div>

        <div className="relative mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden ">
          <Image src={article.image} alt={article.title} fill priority sizes="100vw" className="object-cover" />
        </div>

        <div className="mx-auto mt-16 max-w-2xl space-y-6">
          {article.body.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-sand-700 dark:text-sand-300">
              {p}
            </p>
          ))}
        </div>

        {more.length > 0 && (
          <div className="mx-auto mt-24 max-w-2xl border-t border-sand-200 dark:border-sand-800 pt-12">
            <p className="eyebrow mb-6">Continue reading</p>
            <ul className="space-y-5">
              {more.map((m) => (
                <li key={m.slug}>
                  <Link href={`/insights/${m.slug}`} className="group flex items-baseline justify-between gap-6">
                    <span className="font-display text-2xl text-sand-900 dark:text-sand-100 transition-colors group-hover:text-sand-600 dark:group-hover:text-sand-300">
                      {m.title}
                    </span>
                    <span className="shrink-0 text-xs uppercase tracking-[0.22em] text-sand-500 dark:text-sand-400">{m.tag}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </article>
  );
}
