import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How TERRAYA collects, uses and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Notice"
      updated="June 2026"
      intro="TERRAYA is committed to protecting the privacy and confidentiality of the individuals and families we serve. This notice explains what information we collect, how we use it, and the choices available to you."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "We collect information you provide directly — such as your name, contact details and the substance of any enquiry — when you contact us, request a consultation, or subscribe to our communications.",
            "We also collect limited technical information automatically, such as device and usage data, in order to operate and secure our website.",
          ],
        },
        {
          heading: "How we use information",
          body: [
            "We use your information to respond to enquiries, to provide and improve our services, and to communicate with you where you have asked us to. We do not sell personal information.",
            "Where we rely on consent — for example, to send you our journal or market briefs — you may withdraw it at any time.",
          ],
        },
        {
          heading: "Confidentiality & sharing",
          body: [
            "Discretion is central to how we work. We share personal information only with trusted advisors and service providers acting on our behalf, and only to the extent necessary, under appropriate confidentiality obligations.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Our website uses only the cookies necessary to remember your preferences, such as theme and language. We do not use advertising cookies.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "Subject to applicable law, you may request access to, correction of, or deletion of your personal information, and may object to certain processing. To exercise these rights, please contact our office.",
          ],
        },
      ]}
    />
  );
}
