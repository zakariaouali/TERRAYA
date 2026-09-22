import type { Metadata } from "next";
import { FavoritesView } from "@/components/properties/FavoritesView";
import { getAllProperties } from "@/lib/properties";

export const metadata: Metadata = {
  title: "Saved Properties",
  description: "Your saved TERRAYA properties, kept for closer consideration.",
  robots: { index: false, follow: true },
};

export default async function FavoritesPage() {
  const properties = await getAllProperties();
  return <FavoritesView properties={properties} />;
}
