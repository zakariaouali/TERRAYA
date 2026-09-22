import type { Metadata } from "next";
import { ConsultationView } from "@/components/pages/ConsultationView";

export const metadata: Metadata = {
  title: "Schedule a Consultation",
  description: "Book a private consultation with the TERRAYA office.",
};

export default function ConsultationPage() {
  return <ConsultationView />;
}
