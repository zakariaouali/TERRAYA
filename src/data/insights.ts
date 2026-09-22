export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string; // ISO
  readingMinutes: number;
  image: string;
  body: string[];
};

const u = (id: string, w = 2000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const insights: Insight[] = [
  {
    slug: "the-marrakech-renaissance",
    title: "The Marrakech Renaissance",
    excerpt:
      "A new generation of buyers is reshaping the Atlas valleys — and the way Morocco builds.",
    tag: "Market Brief",
    date: "2026-05-18",
    readingMinutes: 6,
    image: u("photo-1542314831-068cd1dbfeeb"),
    body: [
      "For a decade, Marrakech was a city of riads — intimate, walled, turned inward. The new chapter is being written outside the medina, along the Route de l'Ourika and toward the Atlas foothills, where a generation of buyers is commissioning houses that look outward, to the mountains and the light.",
      "The shift is architectural as much as it is financial. Tadelakt and rammed earth are being paired with floor-to-ceiling glass; vernacular forms are being reinterpreted at the scale of the estate. The result is a market that rewards judgment over volume — fewer, better houses, held longer.",
      "For investors, the fundamentals remain quietly compelling: limited supply of genuinely exceptional land, a deep pool of international demand, and an operating cost base that still allows hospitality-grade yields. We expect the best-positioned estates to continue to outperform the broader market.",
    ],
  },
  {
    slug: "provence-scarcity-again",
    title: "Provence: Scarcity, Again",
    excerpt:
      "Inventory at the top of the Luberon market has narrowed to single digits. What it means for value.",
    tag: "Analysis",
    date: "2026-04-02",
    readingMinutes: 5,
    image: u("photo-1505691938895-1758d7feb511"),
    body: [
      "There are, at any given moment, fewer than a dozen estates of true significance available within the Luberon Regional Park. That number has not grown in five years; if anything, it has contracted, as families consolidate holdings and the best properties move quietly off-market.",
      "Scarcity of this kind does not produce volatility — it produces patience. Vendors are under no pressure; buyers are sophisticated and unhurried. Transactions happen on relationships, not listings, and often never reach the public eye.",
      "Our advice to clients is unchanged: in a market this thin, the cost of waiting for the right house is almost always lower than the cost of acquiring the wrong one.",
    ],
  },
  {
    slug: "the-case-for-the-quiet-coast",
    title: "The Case for the Quiet Coast",
    excerpt:
      "Comporta, Patmos, the Maddalena — the geography of the second home is migrating.",
    tag: "Lifestyle",
    date: "2026-03-11",
    readingMinutes: 4,
    image: u("photo-1502672260266-1c1ef2d93688"),
    body: [
      "The most interesting coastlines today are the ones that have resisted the obvious. Comporta's dunes, the cliffs of Patmos, the granite of the Maddalena archipelago — places defined by what they have chosen not to become.",
      "Buyers who once sought the recognised names are increasingly drawn to discretion: a house reached by a single road, a village without a marina, a beach that asks something of you to find it. Privacy, it turns out, is the ultimate amenity.",
      "These markets are small and tightly held, which makes local presence essential. We work only in the places we know personally — and the quiet coast is, increasingly, where our clients want to be.",
    ],
  },
  {
    slug: "real-estate-as-a-long-instrument",
    title: "Real Estate as a Long Instrument",
    excerpt:
      "Why the most considered families treat property less as an asset and more as an inheritance.",
    tag: "Investment",
    date: "2026-02-04",
    readingMinutes: 7,
    image: u("photo-1600585154340-be6161a56a0c"),
    body: [
      "The families we advise rarely speak of exit. They speak of stewardship — of holding a house for the next generation, of an asset that compounds in meaning as much as in value.",
      "This long horizon changes everything about how a property should be selected, structured and held. Liquidity matters less; quality of land, integrity of title, and the durability of a location matter more. The right ownership structure is not an afterthought but the foundation.",
      "Treated this way, real estate becomes one of the few instruments that can hold both capital and continuity. That is the work of TERRAYA Capital: to help a family acquire not just a house, but a chapter in a longer story.",
    ],
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
