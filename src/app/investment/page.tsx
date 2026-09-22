import type { Metadata } from "next";
import { InvestmentView } from "@/components/pages/InvestmentView";

export const metadata: Metadata = {
  title: "Investment",
  description: "TERRAYA Capital advises on real estate acquisitions for generational wealth.",
};

export default function InvestmentPage() {
  return <InvestmentView />;
}
