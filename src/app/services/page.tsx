import type { Metadata } from "next";
import { ServicesView } from "@/components/pages/ServicesView";

export const metadata: Metadata = {
  title: "Services",
  description: "Acquisition, advisory, wealth preservation, relocation and property management.",
};

export default function ServicesPage() {
  return <ServicesView />;
}
