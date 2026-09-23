import type { Metadata } from "next";
import { SellView } from "@/components/pages/SellView";

export const metadata: Metadata = {
  title: "Sell or List Your Property",
  description: "Submit your Marrakech property to TERRAYA, free of charge.",
};

export default function ListYourPropertyPage() {
  return <SellView />;
}
