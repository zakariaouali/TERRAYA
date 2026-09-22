import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { Providers } from "./providers";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TERRAYA — Exceptional Properties. Timeless Value.",
    template: "%s · TERRAYA",
  },
  description:
    "TERRAYA is a private real estate house curating exceptional properties, residences and investment opportunities for an international clientele.",
  keywords: [
    "luxury real estate Marrakech",
    "Marrakech villas for sale",
    "Marrakech riad for sale",
    "long-term villa rental Marrakech",
    "private estates Marrakech",
    "investment properties Marrakech",
  ],
  openGraph: {
    title: "TERRAYA — Exceptional Properties. Timeless Value.",
    description:
      "A private real estate maison curating exceptional properties and investment opportunities.",
    type: "website",
    siteName: "TERRAYA",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image", title: "TERRAYA" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F5F1EC",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "TERRAYA",
  description:
    "A private real estate house curating exceptional properties, residences and investment opportunities for an international clientele.",
  url: siteUrl,
  email: "private@terraya.com",
  areaServed: { "@type": "City", name: "Marrakech" },
  address: { "@type": "PostalAddress", addressLocality: "Marrakech", addressCountry: "MA" },
  slogan: "Exceptional Properties. Timeless Value.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-paper min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>
          <SiteFrame>{children}</SiteFrame>
        </Providers>
      </body>
    </html>
  );
}
