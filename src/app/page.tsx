import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Lifestyle } from "@/components/home/Lifestyle";
import { Testimonials } from "@/components/home/Testimonials";
import { ConsultationSection } from "@/components/home/ConsultationSection";
import { ConsultationBar } from "@/components/home/ConsultationBar";
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
      <FeaturedProperties properties={featured} />
      <Lifestyle />
      <Testimonials />
      <ConsultationSection />
      <ConsultationBar />
    </>
  );
}
