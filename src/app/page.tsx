import { Hero } from "@/components/home/Hero";
import { PropertyCategories } from "@/components/home/PropertyCategories";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { InvestmentTeaser } from "@/components/home/InvestmentTeaser";
import { Lifestyle } from "@/components/home/Lifestyle";
import { Testimonials } from "@/components/home/Testimonials";
import { MarketInsights } from "@/components/home/MarketInsights";
import { Faq } from "@/components/home/Faq";
import { ContactCTA } from "@/components/home/ContactCTA";
import { getFeaturedProperties } from "@/lib/properties";

export default async function HomePage() {
  const featured = await getFeaturedProperties();
  return (
    <>
      <Hero />
      <PropertyCategories />
      <FeaturedProperties properties={featured} />
      <InvestmentTeaser />
      <Lifestyle />
      <Testimonials />
      <MarketInsights />
      <Faq />
      <ContactCTA />
    </>
  );
}
