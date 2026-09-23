import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PropertyCategories } from "@/components/home/PropertyCategories";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Lifestyle } from "@/components/home/Lifestyle";
import { Testimonials } from "@/components/home/Testimonials";
import { MarketInsights } from "@/components/home/MarketInsights";
import { Faq } from "@/components/home/Faq";
import { ContactCTA } from "@/components/home/ContactCTA";
import { getFeaturedProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Luxury Real Estate in Marrakech",
  description:
    "TERRAYA is a private real estate maison in Marrakech, curating exceptional villas, riads and residences for sale and long-term rental (6-month minimum).",
};

export default async function HomePage() {
  const featured = await getFeaturedProperties();
  return (
    <>
      <Hero />
      <PropertyCategories />
      <FeaturedProperties properties={featured} />
      <Lifestyle />
      <Testimonials />
      <MarketInsights />
      <Faq />
      <ContactCTA />
    </>
  );
}
