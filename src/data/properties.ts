export type PropertyTypeLiteral =
  | "VILLA" | "ESTATE" | "PENTHOUSE" | "RESIDENCE" | "RIAD" | "LAND";

export type ListingType = "SALE" | "RENT" | "HOLIDAY_RENT";

export type SeedProperty = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: PropertyTypeLiteral;
  listingType: ListingType;
  rentalPeriod?: "DAY" | "WEEK";
  location: string;
  city: string;
  country: string;
  priceEur: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  landSqm?: number;
  yieldPercent?: number;
  featured: boolean;
  heroImage: string;
  images: string[];
  amenities: string[];
  highlights: string[];
  latitude?: number;
  longitude?: number;
};

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const properties: SeedProperty[] = [
  {
    slug: "villa-zahra-marrakech",
    title: "Villa Zahra",
    tagline: "An architectural meditation on the Atlas foothills.",
    description:
      "Set against the silhouette of the Atlas mountains, Villa Zahra is a contemporary reimagining of Moroccan vernacular architecture. Tadelakt walls, hand-tooled brass, and ribbons of light from clerestory windows define interiors that flow seamlessly to an infinity pool overlooking the desert. Eight hectares of olive groves, a private wellness pavilion, and a service wing make this a generational estate.",
    type: "VILLA",
    listingType: "SALE",
    location: "Route de l'Ourika",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 7400000,
    bedrooms: 7,
    bathrooms: 9,
    areaSqm: 1280,
    landSqm: 80000,
    yieldPercent: 6.2,
    featured: true,
    heroImage: u("photo-1613977257363-707ba9348227"),
    images: [
      u("photo-1613977257363-707ba9348227"),
      u("photo-1600585154340-be6161a56a0c"),
      u("photo-1600585154526-990dced4db0d"),
      u("photo-1582268611958-ebfd161ef9cf"),
    ],
    amenities: ["Infinity Pool", "Hammam", "Wellness Pavilion", "Olive Grove", "Staff Quarters", "Cinema Room"],
    highlights: [
      "8 hectares of private grounds with mature olive trees",
      "Designed by an award-winning Moroccan-French studio",
      "Solar-assisted climate system and rainwater harvesting",
    ],
    latitude: 31.4849,
    longitude: -7.9853,
  },
  {
    slug: "domaine-aleyna-luberon",
    title: "Domaine Aleyna",
    tagline: "A Provençal estate with vineyards and absolute privacy.",
    description:
      "An eighteenth-century bastide reawakened by a discreet decade-long restoration. Forty hectares of organic vineyards, lavender fields and centennial plane trees frame a main house, a guest pavilion, and a wine chai still in production. The estate is held quietly off-market and represents one of the last properties of this scale within the Luberon Regional Park.",
    type: "ESTATE",
    listingType: "SALE",
    location: "Parc naturel régional du Luberon",
    city: "Gordes",
    country: "France",
    priceEur: 18500000,
    bedrooms: 10,
    bathrooms: 11,
    areaSqm: 1850,
    landSqm: 400000,
    featured: true,
    heroImage: u("photo-1600596542815-ffad4c1539a9"),
    images: [
      u("photo-1600596542815-ffad4c1539a9"),
      u("photo-1571055107559-3e67626fa8be"),
      u("photo-1505691938895-1758d7feb511"),
    ],
    amenities: ["Working Vineyard", "Wine Cellar", "Guest Pavilion", "Heated Pool", "Tennis Court"],
    highlights: [
      "40 hectares including 12 hectares of AOC vineyards",
      "Eighteenth-century bastide with classified façade",
      "Off-market acquisition opportunity",
    ],
    latitude: 43.9117,
    longitude: 5.2,
  },
  {
    slug: "penthouse-amalfi-positano",
    title: "Penthouse Amalfi",
    tagline: "A duplex sky-residence over the Tyrrhenian Sea.",
    description:
      "Carved into the cliffs of Positano, this duplex penthouse offers uninterrupted panoramas of the Amalfi coast. Travertine floors, bespoke joinery in oiled oak, and a private rooftop terrace with plunge pool define a residence that feels equally suited to year-round living and discerning rental investment.",
    type: "PENTHOUSE",
    listingType: "SALE",
    location: "Via Positanesi d'America",
    city: "Positano",
    country: "Italy",
    priceEur: 6250000,
    bedrooms: 4,
    bathrooms: 5,
    areaSqm: 320,
    yieldPercent: 5.4,
    featured: true,
    heroImage: u("photo-1568605114967-8130f3a36994"),
    images: [
      u("photo-1568605114967-8130f3a36994"),
      u("photo-1512917774080-9991f1c4c750"),
      u("photo-1502672260266-1c1ef2d93688"),
    ],
    amenities: ["Rooftop Plunge Pool", "Private Lift", "Concierge", "Sea View Terrace"],
    highlights: [
      "Top two floors of a discreetly managed cliffside residence",
      "Existing rental program with documented yield",
    ],
    latitude: 40.6281,
    longitude: 14.4848,
  },
  {
    slug: "riad-medina-fes",
    title: "Riad Andalou",
    tagline: "A restored riad within the imperial medina.",
    description:
      "Hidden behind an unmarked door in the medina of Fes, Riad Andalou opens onto two interior courtyards animated by water and citrus trees. Restored in collaboration with master craftsmen, the riad retains its zellige, cedar ceilings and stuccowork while offering thoroughly modern services.",
    type: "RIAD",
    listingType: "SALE",
    location: "Medina of Fes",
    city: "Fes",
    country: "Morocco",
    priceEur: 1850000,
    bedrooms: 6,
    bathrooms: 6,
    areaSqm: 540,
    yieldPercent: 7.8,
    featured: false,
    heroImage: u("photo-1602681797891-a1003186de8c"),
    images: [
      u("photo-1602681797891-a1003186de8c"),
      u("photo-1542314831-068cd1dbfeeb"),
    ],
    amenities: ["Two Courtyards", "Rooftop Terrace", "Hammam", "Restored Zellige"],
    highlights: [
      "Operating as a boutique private retreat",
      "Documented restoration by master craftsmen",
    ],
    latitude: 34.0631,
    longitude: -4.9737,
  },
  {
    slug: "estate-saint-tropez",
    title: "Domaine du Cap",
    tagline: "Beachfront estate on the Saint-Tropez peninsula.",
    description:
      "One of the last private beachfront estates of the Saint-Tropez peninsula. Twenty thousand square metres of grounds descend through umbrella pines to a private sandy cove. The main residence has been reimagined as a series of light-filled pavilions opening to terraces and gardens by a celebrated landscape studio.",
    type: "ESTATE",
    listingType: "SALE",
    location: "Les Parcs de Saint-Tropez",
    city: "Saint-Tropez",
    country: "France",
    priceEur: 42000000,
    bedrooms: 9,
    bathrooms: 10,
    areaSqm: 1100,
    landSqm: 20000,
    featured: true,
    heroImage: u("photo-1499793983690-e29da59ef1c2"),
    images: [
      u("photo-1499793983690-e29da59ef1c2"),
      u("photo-1505691938895-1758d7feb511"),
    ],
    amenities: ["Private Beach", "Boat House", "Wellness Spa", "Cinema", "Staff Wing"],
    highlights: [
      "Direct access to a private sandy cove",
      "Within the secured Parcs de Saint-Tropez",
    ],
    latitude: 43.2474,
    longitude: 6.6403,
  },
  {
    slug: "residence-comporta",
    title: "Residence Herdade",
    tagline: "Discreet coastal residence in Comporta.",
    description:
      "A contemporary residence in the dunes of Comporta, set within a private community of fewer than twenty homes. Cork-clad volumes, polished concrete floors and wide verandas frame the rice fields and the Atlantic beyond.",
    type: "RESIDENCE",
    listingType: "SALE",
    location: "Carvalhal",
    city: "Comporta",
    country: "Portugal",
    priceEur: 4200000,
    bedrooms: 5,
    bathrooms: 5,
    areaSqm: 480,
    landSqm: 4200,
    yieldPercent: 4.8,
    featured: false,
    heroImage: u("photo-1600210492486-724fe5c67fb0"),
    images: [
      u("photo-1600210492486-724fe5c67fb0"),
      u("photo-1582268611958-ebfd161ef9cf"),
    ],
    amenities: ["Private Pool", "Beach Access", "Outdoor Kitchen", "Solar"],
    highlights: [
      "Part of an architect-led private community",
      "Walkable to a five-kilometre stretch of unspoiled beach",
    ],
    latitude: 38.3853,
    longitude: -8.7872,
  },
  {
    slug: "pavillon-gueliz-marrakech",
    title: "Pavillon Gueliz",
    tagline: "A furnished garden pavilion for long-term residence.",
    description:
      "Set behind a planted wall in Marrakech's Gueliz district, this single-storey pavilion offers quiet, modern living within walking distance of the city's galleries, restaurants and ateliers. A private garden and plunge pool wrap a sequence of light-filled rooms, fully furnished and maintained for a discerning long-term tenant.",
    type: "RESIDENCE",
    listingType: "RENT",
    location: "Quartier Gueliz",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 4200,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 240,
    landSqm: 600,
    featured: true,
    heroImage: u("photo-1582719478250-c89cae4dc85b"),
    images: [
      u("photo-1582719478250-c89cae4dc85b"),
      u("photo-1600047509807-ba8f99d2cdde"),
    ],
    amenities: ["Private Garden", "Plunge Pool", "Covered Parking", "Air Conditioning", "Housekeeping Available"],
    highlights: [
      "Walking distance to Gueliz galleries and restaurants",
      "Offered fully furnished on an annual lease",
      "Dedicated property management included",
    ],
    latitude: 31.6418,
    longitude: -8.0089,
  },
  {
    slug: "residence-atlantique-essaouira",
    title: "Résidence Atlantique",
    tagline: "A long-term coastal residence steps from the ramparts.",
    description:
      "A calm two-bedroom residence in Essaouira's Quartier des Dunes, minutes from the medina ramparts and the Atlantic. Whitewashed rooms open onto a rooftop terrace facing the sea — offered furnished, on a twelve-month lease, to tenants seeking the slower rhythm of Morocco's Atlantic coast.",
    type: "RESIDENCE",
    listingType: "RENT",
    location: "Quartier des Dunes",
    city: "Essaouira",
    country: "Morocco",
    priceEur: 3200,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 165,
    featured: false,
    heroImage: u("photo-1564013799919-ab600027ffc6"),
    images: [
      u("photo-1564013799919-ab600027ffc6"),
      u("photo-1605276374104-dee2a0ed3cd6"),
    ],
    amenities: ["Rooftop Terrace", "Sea View", "Fully Furnished", "High-Speed Internet"],
    highlights: [
      "Five-minute walk to the medina ramparts",
      "Furnished, available on a twelve-month lease",
      "Year-round Atlantic light",
    ],
    latitude: 31.5085,
    longitude: -9.7595,
  },
  {
    slug: "villa-kalliste-patmos",
    title: "Villa Kalliste",
    tagline: "A clifftop retreat above the Aegean, by the night.",
    description:
      "Above Grikos Bay on the island of Patmos, Villa Kalliste opens onto the Aegean from every principal room. An infinity pool, shaded terraces and a private path to the water make this a holiday residence for those who value privacy as much as the view. Available for private stays by the night, with staff on request.",
    type: "VILLA",
    listingType: "HOLIDAY_RENT",
    rentalPeriod: "DAY",
    location: "Above Grikos Bay",
    city: "Patmos",
    country: "Greece",
    priceEur: 2400,
    bedrooms: 5,
    bathrooms: 5,
    areaSqm: 380,
    landSqm: 2200,
    featured: true,
    heroImage: u("photo-1539037116277-4db20889f2d4"),
    images: [
      u("photo-1539037116277-4db20889f2d4"),
      u("photo-1533105079780-92b9be482077"),
    ],
    amenities: ["Infinity Pool", "Sea View Terraces", "Private Chef Available", "Daily Housekeeping"],
    highlights: [
      "Uninterrupted views over Grikos Bay",
      "Staffing available on request: chef, housekeeping, boat charter",
      "Minimum stay of seven nights",
    ],
    latitude: 37.2967,
    longitude: 26.5483,
  },
  {
    slug: "riad-jasmin-marrakech",
    title: "Riad Jasmin",
    tagline: "A jasmine-scented courtyard riad, by the night.",
    description:
      "Behind an unmarked door a few minutes from Jemaa el-Fnaa, Riad Jasmin wraps a plunge-pool courtyard scented with jasmine and orange blossom. Four ensuite rooms, a rooftop terrace for evenings, and a small dedicated staff make this a private alternative to a hotel — available by the night, year-round.",
    type: "RIAD",
    listingType: "HOLIDAY_RENT",
    rentalPeriod: "DAY",
    location: "Medina of Marrakech",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 1450,
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 320,
    featured: false,
    heroImage: u("photo-1602343168117-bb8ffe3e2e9f"),
    images: [
      u("photo-1602343168117-bb8ffe3e2e9f"),
      u("photo-1597211833712-5e41faa202ea"),
      u("photo-1596178060671-7a80dc8059ea"),
    ],
    amenities: ["Courtyard Pool", "Rooftop Terrace", "Daily Breakfast", "Airport Transfer"],
    highlights: [
      "Three minutes' walk from Jemaa el-Fnaa, behind an unmarked door",
      "Breakfast and turndown service included",
      "Available by the night, year-round",
    ],
    latitude: 31.6258,
    longitude: -7.9891,
  },
];
