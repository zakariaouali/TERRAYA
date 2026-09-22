import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms governing the use of the TERRAYA website and services.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Use"
      updated="June 2026"
      intro="These terms govern your use of the TERRAYA website. By accessing the site, you agree to them. Please read them carefully."
      sections={[
        {
          heading: "Use of the website",
          body: [
            "You may use this website for lawful, personal and non-commercial purposes. You agree not to misuse the site, attempt to gain unauthorised access, or interfere with its operation or security.",
          ],
        },
        {
          heading: "Property information",
          body: [
            "Property descriptions, imagery, prices and availability are provided for general guidance only and do not constitute an offer or a contract. Details may change without notice and should be independently verified.",
            "Indicative yields, valuations and market commentary are opinions, not guarantees of future performance.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "The TERRAYA name, logo, text, imagery and design are protected by intellectual property rights and may not be reproduced without our prior written consent.",
          ],
        },
        {
          heading: "Limitation of liability",
          body: [
            "To the fullest extent permitted by law, TERRAYA is not liable for any loss arising from reliance on information presented on this website. Nothing in these terms excludes liability that cannot lawfully be excluded.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms are governed by French law, and the courts of Paris have exclusive jurisdiction, save where mandatory consumer protections provide otherwise.",
          ],
        },
      ]}
    />
  );
}
