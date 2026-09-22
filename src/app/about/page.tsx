import type { Metadata } from "next";
import { AboutView } from "@/components/pages/AboutView";

export const metadata: Metadata = {
  title: "About",
  description:
    "TERRAYA is a private real estate house founded on discretion, judgment and a deep love of place.",
};

export default function AboutPage() {
  return <AboutView />;
}
