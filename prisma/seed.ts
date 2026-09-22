import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt-ts";
import { properties } from "../src/data/properties";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@terraya.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMeAtFirstLogin!";
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, name: "TERRAYA Admin", role: "ADMIN" },
  });

  for (const p of properties) {
    const data = {
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      type: p.type,
      listingType: p.listingType,
      rentalPeriod: p.rentalPeriod ?? null,
      status: "AVAILABLE",
      location: p.location,
      city: p.city,
      country: p.country,
      priceEur: BigInt(p.priceEur),
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      areaSqm: p.areaSqm,
      landSqm: p.landSqm ?? null,
      yieldPercent: p.yieldPercent ?? null,
      featured: p.featured,
      heroImage: p.heroImage,
      images: JSON.stringify(p.images),
      amenities: JSON.stringify(p.amenities),
      highlights: JSON.stringify(p.highlights),
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
    };
    await prisma.property.upsert({ where: { slug: p.slug }, update: data, create: data });
  }

  console.log(`Seeded ${properties.length} properties and admin ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
