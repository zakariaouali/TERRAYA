/**
 * The fixed vocabulary of searchable property features. These keys are what
 * gets stored in `Property.features` (JSON string[]) and what the filters,
 * admin form and seed data all agree on. `amenities` stays a free-text list
 * for the detail page; `features` is the structured, filterable one.
 */
export const FEATURE_GROUPS = [
  { key: "outdoors", en: "Outdoors", fr: "Extérieur" },
  { key: "wellness", en: "Wellness", fr: "Bien-être" },
  { key: "comfort", en: "Comfort", fr: "Confort" },
  { key: "practical", en: "Practical", fr: "Pratique" },
] as const;

export type FeatureGroup = (typeof FEATURE_GROUPS)[number]["key"];

export const FEATURES = [
  { key: "pool", group: "outdoors", en: "Pool", fr: "Piscine", match: /pool|piscine/i },
  { key: "garden", group: "outdoors", en: "Garden", fr: "Jardin", match: /garden|grove|jardin|orchard/i },
  { key: "terrace", group: "outdoors", en: "Terrace / rooftop", fr: "Terrasse / toit", match: /terrace|rooftop|terrasse/i },
  { key: "views", group: "outdoors", en: "Atlas or medina views", fr: "Vue Atlas ou médina", match: /view|vue|panoram/i },
  { key: "hammam", group: "wellness", en: "Hammam", fr: "Hammam", match: /hammam/i },
  { key: "spa", group: "wellness", en: "Spa / wellness", fr: "Spa / bien-être", match: /spa|wellness|massage/i },
  { key: "gym", group: "wellness", en: "Gym", fr: "Salle de sport", match: /gym|fitness/i },
  { key: "furnished", group: "comfort", en: "Furnished", fr: "Meublé", match: /furnished|meubl/i },
  { key: "ac", group: "comfort", en: "Air conditioning", fr: "Climatisation", match: /air.?condition|climat|\bac\b/i },
  { key: "smart_home", group: "comfort", en: "Smart home", fr: "Maison connectée", match: /smart|domotic/i },
  { key: "pets", group: "practical", en: "Pets welcome", fr: "Animaux acceptés", match: /pet|animal/i },
  { key: "parking", group: "practical", en: "Parking", fr: "Parking", match: /parking|garage/i },
  { key: "staff", group: "practical", en: "Staff / housekeeping", fr: "Personnel", match: /staff|housekeep|butler|concierge|chef|breakfast/i },
  { key: "security", group: "practical", en: "24/7 security", fr: "Sécurité 24/7", match: /security|sécurité|guard/i },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

const KEYS = new Set<string>(FEATURES.map((f) => f.key));

export const FEATURE_KEYS = FEATURES.map((f) => f.key) as [FeatureKey, ...FeatureKey[]];

export function isFeatureKey(k: string): k is FeatureKey {
  return KEYS.has(k);
}

/** Keeps only known keys, de-duplicated, in vocabulary order. */
export function cleanFeatures(input: unknown): FeatureKey[] {
  if (!Array.isArray(input)) return [];
  const set = new Set(input.filter((k): k is string => typeof k === "string"));
  return FEATURES.filter((f) => set.has(f.key)).map((f) => f.key);
}

/** Best-effort guess from free-text amenities, used to backfill older rows. */
export function deriveFeatures(amenities: string[]): FeatureKey[] {
  const text = amenities.join(" | ");
  return FEATURES.filter((f) => f.match.test(text)).map((f) => f.key);
}

export function featureLabel(key: string, lang: "en" | "fr"): string {
  const f = FEATURES.find((x) => x.key === key);
  return f ? f[lang] : key;
}
