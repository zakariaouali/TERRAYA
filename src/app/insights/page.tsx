import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { insights } from "@/data/insights";
import { InsightsBrowser } from "@/components/insights/InsightsBrowser";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Market briefs, analysis and lifestyle notes from the TERRAYA office on luxury real estate and investment.",
};

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title="Insights, quietly considered."
        description="Market briefs, analysis and notes on living well — from the desk of the TERRAYA office."
        image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80"
      />

      <InsightsBrowser items={insights.map(({ body: _body, ...card }) => card)} />
    </>
  );
}
