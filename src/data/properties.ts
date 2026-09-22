export type PropertyTypeLiteral =
  | "VILLA" | "ESTATE" | "PENTHOUSE" | "RESIDENCE" | "RIAD" | "LAND";

export type ListingType = "SALE" | "RENT";

export type SeedProperty = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: PropertyTypeLiteral;
  listingType: ListingType;
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

// Marrakech only — TERRAYA operates exclusively in and around Marrakech.
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
    slug: "riad-jasmin-marrakech",
    title: "Riad Jasmin",
    tagline: "A jasmine-scented courtyard riad, offered long-term.",
    description:
      "Behind an unmarked door a few minutes from Jemaa el-Fnaa, Riad Jasmin wraps a plunge-pool courtyard scented with jasmine and orange blossom. Four ensuite rooms, a rooftop terrace for evenings, and a small dedicated staff make this a private alternative to a hotel — offered furnished on a long-term lease.",
    type: "RIAD",
    listingType: "RENT",
    location: "Medina of Marrakech",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 3600,
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
      "Offered furnished on an annual lease",
      "Dedicated staff included",
    ],
    latitude: 31.6258,
    longitude: -7.9891,
  },
  {
    slug: "domaine-palmeraie-marrakech",
    title: "Domaine Palmeraie",
    tagline: "A walled estate among the palm groves.",
    description:
      "Set within three hectares of mature palm grove, Domaine Palmeraie is a gated estate combining a traditional Moroccan silhouette with contemporary interiors. Wide colonnaded terraces, a reflecting pool and a separate guest pavilion give the property the scale and privacy sought by families relocating for the long term.",
    type: "ESTATE",
    listingType: "SALE",
    location: "La Palmeraie",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 9800000,
    bedrooms: 8,
    bathrooms: 9,
    areaSqm: 1400,
    landSqm: 30000,
    yieldPercent: 5.6,
    featured: true,
    heroImage: u("photo-1505691938895-1758d7feb511"),
    images: [
      u("photo-1505691938895-1758d7feb511"),
      u("photo-1571055107559-3e67626fa8be"),
      u("photo-1600047509807-ba8f99d2cdde"),
    ],
    amenities: ["Private Pool", "Palm Grove", "Staff Quarters", "Tennis Court", "Hammam"],
    highlights: [
      "3 hectares of mature, irrigated palm grove",
      "Walled and gated, with round-the-clock security",
      "Ten minutes from the medina",
    ],
    latitude: 31.669,
    longitude: -7.954,
  },
  {
    slug: "appartement-hivernage-marrakech",
    title: "Appartement Hivernage",
    tagline: "A designer residence in Marrakech's diplomatic quarter.",
    description:
      "On the top floor of a discreetly managed building in Hivernage, this residence pairs panoramic Atlas views with a considered, contemporary interior. Wide glazing, a wraparound terrace and a fully serviced building make it as suited to a primary residence as to a well-managed rental.",
    type: "RESIDENCE",
    listingType: "SALE",
    location: "Quartier Hivernage",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 1650000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 210,
    yieldPercent: 6.5,
    featured: false,
    heroImage: u("photo-1600047509807-ba8f99d2cdde"),
    images: [
      u("photo-1600047509807-ba8f99d2cdde"),
      u("photo-1596178060671-7a80dc8059ea"),
    ],
    amenities: ["Rooftop Pool", "Concierge", "Underground Parking", "Fitness Studio"],
    highlights: [
      "Top-floor unit with panoramic views of the Atlas",
      "Walking distance to Hivernage's hotels and restaurants",
      "Fully serviced building with round-the-clock concierge",
    ],
    latitude: 31.6215,
    longitude: -8.014,
  },
  {
    slug: "villa-ourika-marrakech",
    title: "Villa Ourika",
    tagline: "A long-term family villa on the Route de l'Ourika.",
    description:
      "Fifteen minutes from central Marrakech, Villa Ourika sits within a small gated community on the road toward the Atlas foothills. A private pool and garden, generous family bedrooms and staff quarters make it a considered choice for a family settling in for the long term.",
    type: "VILLA",
    listingType: "RENT",
    location: "Route de l'Ourika",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 6800,
    bedrooms: 5,
    bathrooms: 5,
    areaSqm: 520,
    landSqm: 3000,
    featured: false,
    heroImage: u("photo-1596178060671-7a80dc8059ea"),
    images: [
      u("photo-1596178060671-7a80dc8059ea"),
      u("photo-1602681797891-a1003186de8c"),
    ],
    amenities: ["Private Pool", "Garden", "Staff Quarters", "Air Conditioning", "Covered Parking"],
    highlights: [
      "Fifteen minutes from central Marrakech",
      "Offered furnished on an annual lease",
      "Gated community with shared security",
    ],
    latitude: 31.57,
    longitude: -7.92,
  },
  {
    slug: "riad-kasbah-marrakech",
    title: "Riad Kasbah",
    tagline: "A restored riad in the Kasbah district, for sale.",
    description:
      "Steps from the Saadian Tombs, this fully restored riad retains its traditional courtyard, zellige and cedar ceilings while offering thoroughly modern services. Sold furnished, it is equally suited to a private residence or a boutique hospitality operation.",
    type: "RIAD",
    listingType: "SALE",
    location: "Quartier de la Kasbah",
    city: "Marrakech",
    country: "Morocco",
    priceEur: 2100000,
    bedrooms: 5,
    bathrooms: 5,
    areaSqm: 380,
    featured: false,
    heroImage: u("photo-1602343168117-bb8ffe3e2e9f"),
    images: [
      u("photo-1602343168117-bb8ffe3e2e9f"),
      u("photo-1597211833712-5e41faa202ea"),
      u("photo-1533105079780-92b9be482077"),
    ],
    amenities: ["Courtyard Pool", "Rooftop Terrace", "Hammam", "Restored Zellige"],
    highlights: [
      "Steps from the Saadian Tombs and the Kasbah Mosque",
      "Fully restored with traditional craftsmanship",
      "Sold furnished, ready to operate as a guesthouse",
    ],
    latitude: 31.6205,
    longitude: -7.989,
  },
];
