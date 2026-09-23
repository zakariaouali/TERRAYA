import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const [properties, inquiries, newInquiries, featured] = await Promise.all([
    prisma.property.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.property.count({ where: { featured: true } }),
  ]);
  return { properties, inquiries, newInquiries, featured };
}

export default async function AdminDashboardPage() {
  let stats = { properties: 0, inquiries: 0, newInquiries: 0, featured: 0 };
  try {
    stats = await getStats();
  } catch {
    // database not yet provisioned — show zeros
  }

  const tiles = [
    { label: "Properties", value: stats.properties },
    { label: "Featured", value: stats.featured },
    { label: "Inquiries", value: stats.inquiries },
    { label: "New Inquiries", value: stats.newInquiries },
  ];

  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="font-display text-5xl text-sand-900 mt-3">Maison dashboard.</h1>
      <p className="mt-3 text-sand-700">A discreet snapshot of activity across the portfolio.</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="border border-sand-200 p-8 bg-sand-100/60">
            <p className="eyebrow">{t.label}</p>
            <p className="text-5xl font-medium text-sand-900 mt-3">{t.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
