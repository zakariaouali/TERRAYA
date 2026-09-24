/**
 * One-off: fills `Property.features` for rows created before the column
 * existed, by reading their free-text amenities. Safe to re-run — it only
 * touches rows whose features are still empty. Review the result in the
 * admin (Edit property → Search features) since text matching is a guess.
 *
 *   npx tsx scripts/backfill-features.ts
 */
import { PrismaClient } from "@prisma/client";
import { deriveFeatures } from "../src/lib/features";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.property.findMany({ where: { features: "[]" } });
  for (const r of rows) {
    let amenities: string[] = [];
    try { amenities = JSON.parse(r.amenities); } catch { /* keep empty */ }
    const features = deriveFeatures(amenities);
    if (r.listingType === "RENT" && !features.includes("furnished")) features.push("furnished");
    await prisma.property.update({ where: { id: r.id }, data: { features: JSON.stringify(features) } });
    console.log(`${r.slug}: ${features.join(", ") || "(none)"}`);
  }
  console.log(`Backfilled ${rows.length} properties`);
}

main().finally(() => prisma.$disconnect());
