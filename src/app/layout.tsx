import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { Providers } from "./providers";
import { NavigationProgressBar } from "@/components/shared/NavigationProgressBar";
import { CONTACT } from "@/lib/contact";

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
    "TERRAYA is a private real estate house curating exceptional properties and residences for an international clientele.",
  keywords: [
    "luxury real estate Marrakech",
    "Marrakech villas for sale",
    "Marrakech riad for sale",
    "long-term villa rental Marrakech",
    "private estates Marrakech",
  ],
  openGraph: {
    title: "TERRAYA — Exceptional Properties. Timeless Value.",
    description:
      "A private real estate maison curating exceptional properties for sale and long-term rental.",
    type: "website",
    siteName: "TERRAYA",
    url: siteUrl,
    images: [{ url: "/hero.jpg", width: 1537, height: 1023, alt: "A TERRAYA villa overlooking the Marrakech valley" }],
  },
  twitter: { card: "summary_large_image", title: "TERRAYA", images: ["/hero.jpg"] },
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
    "A private real estate house curating exceptional properties and residences for an international clientele.",
  url: siteUrl,
  image: `${siteUrl}/hero.jpg`,
  email: "private@terraya.com",
  telephone: CONTACT.phone,
  areaServed: { "@type": "City", name: "Marrakech" },
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.addressLines[0],
    addressLocality: "Marrakech",
    postalCode: "40000",
    addressCountry: "MA",
  },
  geo: { "@type": "GeoCoordinates", latitude: CONTACT.lat, longitude: CONTACT.lng },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://www.instagram.com/estate.terraya",
    "https://snapchat.com/t/xB4yqcPM",
  ],
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
          <NavigationProgressBar />
          <SiteFrame>{children}</SiteFrame>
        </Providers>
      </body>
    </html>
  );
}
