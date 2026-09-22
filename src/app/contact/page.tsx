import type { Metadata } from "next";
import { ContactView } from "@/components/pages/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Request a private consultation with the TERRAYA office.",
};

export default function ContactPage() {
  return <ContactView />;
}
